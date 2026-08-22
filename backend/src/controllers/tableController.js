import { queryAll, queryGet, queryRun, getDb } from '../../database/db.js';
import { calculateRestaurantMetrics } from '../utils/waitAlgorithm.js';
import { invalidateRestaurantCache } from '../services/waitTimeService.js';

export const updateTableStatus = async (req, res) => {
  const db = await getDb();
  const connection = await db.getConnection();

  try {
    const { restaurantId, tableId } = req.params;
    const { status, minsRemaining, reservationName } = req.body;

    // 0. Validate requested status
    const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}. Must be one of [${validStatuses.join(', ')}]` });
    }

    await connection.beginTransaction();

    // 1. Verify restaurant exists
    const [restaurantRows] = await connection.query('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (restaurantRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // 2. Verify table exists with lock FOR UPDATE
    const [tableRows] = await connection.query(
      'SELECT * FROM `tables` WHERE id = ? AND restaurant_id = ? FOR UPDATE',
      [tableId, restaurantId]
    );

    if (tableRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const table = tableRows[0];

    // 2.5. Validate allowed status transitions
    const fromStatus = table.status;
    const toStatus = status;
    if (fromStatus !== toStatus) {
      if (fromStatus === 'occupied' && toStatus === 'reserved') {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Invalid transition: occupied table cannot transition directly to reserved.' });
      }
      if (fromStatus === 'cleaning' && toStatus === 'reserved') {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Invalid transition: cleaning table cannot transition directly to reserved.' });
      }
    }

    let updatedMins = minsRemaining;
    let occupiedAt = table.occupied_at ? new Date(table.occupied_at) : null;
    let expectedAvailableAt = table.expected_available_at ? new Date(table.expected_available_at) : null;
    let cleaningStartedAt = table.cleaning_started_at ? new Date(table.cleaning_started_at) : null;

    if (status === 'occupied') {
      occupiedAt = occupiedAt || new Date();
      let duration = 30; // standard default
      if (updatedMins) {
        duration = Number(updatedMins);
      } else {
        // Deterministically check active orders for this table first
        const [activeOrders] = await connection.query(`
          SELECT * FROM orders 
          WHERE restaurant_id = ? 
            AND table_id = ?
            AND status NOT IN ('Completed', 'Rejected', 'Cancelled')
            AND order_status NOT IN ('Completed', 'Rejected', 'Cancelled')
        `, [restaurantId, tableId]);

        if (activeOrders.length > 0) {
          const latestOrder = activeOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          const createdAt = new Date(latestOrder.created_at);
          const elapsedMins = !isNaN(createdAt.getTime()) ? Math.floor((Date.now() - createdAt) / 60000) : 0;
          duration = Math.max(5, 45 - elapsedMins);
        }
      }
      expectedAvailableAt = new Date(Date.now() + duration * 60000);
      updatedMins = duration;
      cleaningStartedAt = null;
    } else if (status === 'cleaning') {
      cleaningStartedAt = new Date();
      occupiedAt = null;
      expectedAvailableAt = null;
      updatedMins = 5; // default cleaning buffer
    } else if (status === 'available') {
      occupiedAt = null;
      expectedAvailableAt = null;
      cleaningStartedAt = null;
      updatedMins = null;
    } else if (status === 'reserved') {
      occupiedAt = null;
      expectedAvailableAt = null;
      cleaningStartedAt = null;
      updatedMins = 15; // default reserved buffer
    }

    await connection.query(
      `UPDATE \`tables\` 
       SET status = ?, mins_remaining = ?, reservation_name = ?,
           occupied_at = ?, expected_available_at = ?, cleaning_started_at = ?
       WHERE id = ? AND restaurant_id = ?`,
      [status, updatedMins, reservationName || null, occupiedAt, expectedAvailableAt, cleaningStartedAt, tableId, restaurantId]
    );

    // Re-fetch the complete updated table row
    const [updatedTableRows] = await connection.query(
      'SELECT * FROM `tables` WHERE id = ? AND restaurant_id = ?',
      [tableId, restaurantId]
    );
    const updatedTable = updatedTableRows[0];

    await connection.commit();

    // Invalidate cached wait times
    invalidateRestaurantCache(restaurantId);

    // Get the dynamic metrics
    const metrics = await calculateRestaurantMetrics(restaurantId);

    const io = req.app.get('io');
    if (io) {
      // Emit to public room for diners and staff
      io.to(`restaurant_${restaurantId}_public`).emit('table_status_changed', {
        tableId,
        restaurantId,
        status,
        minsRemaining: updatedMins,
        occupiedAt: updatedTable.occupied_at,
        expectedAvailableAt: updatedTable.expected_available_at,
        cleaningStartedAt: updatedTable.cleaning_started_at
      });

      // Emit new deterministic occupancy event to public room
      io.to(`restaurant_${restaurantId}_public`).emit('restaurant_occupancy_updated', {
        restaurantId,
        metrics
      });
    }

    res.json({
      success: true,
      message: `Table ${tableId} updated to ${status}`,
      data: {
        updatedTable: {
          id: updatedTable.id,
          restaurantId: updatedTable.restaurant_id,
          name: updatedTable.name,
          capacity: updatedTable.capacity,
          section: updatedTable.section,
          status: updatedTable.status,
          minsRemaining: updatedMins,
          occupiedAt: updatedTable.occupied_at,
          expectedAvailableAt: updatedTable.expected_available_at,
          cleaningStartedAt: updatedTable.cleaning_started_at,
          shape: updatedTable.shape,
          reservationName: updatedTable.reservation_name
        },
        metrics
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error in updateTableStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
