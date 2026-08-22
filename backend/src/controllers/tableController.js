import { queryAll, queryGet, queryRun, getDb } from '../../database/db.js';
import { calculateRestaurantMetrics } from '../utils/waitAlgorithm.js';
import { invalidateRestaurantCache } from '../services/waitTimeService.js';

export const getTablesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ? ORDER BY section, id', [restaurantId]);
    return res.json({ success: true, data: tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tables' });
  }
};

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

export const getRestaurantAvailability = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, startTime, time, endTime, partySize, guestCount } = req.query;

    const reqDate = date || new Date().toISOString().split('T')[0];
    const reqTime = startTime || time || '19:00';
    const reqPartySize = Number(partySize || guestCount || 2);

    // 1. Verify restaurant exists & is accepting reservations
    const restaurant = await queryGet('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    if (Number(restaurant.is_accepting_orders) === 0 || restaurant.status === 'deactivated') {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is deactivated or not accepting new table reservations.',
        data: {
          restaurantId,
          date: reqDate,
          time: reqTime,
          partySize: reqPartySize,
          totalTables: 0,
          availableCount: 0,
          availableTables: [],
          unavailableTables: [],
          isBookable: false
        }
      });
    }

    // 2. Fetch all tables belonging to the restaurant
    const allTables = await queryAll(
      'SELECT id, restaurant_id, name, capacity, section, status FROM `tables` WHERE restaurant_id = ? ORDER BY section, capacity, id',
      [restaurantId]
    );

    // 3. Fetch active reservations for requested date with blocking statuses ('Pending', 'Confirmed', 'Accepted')
    const activeReservations = await queryAll(
      `SELECT * FROM reservations 
       WHERE restaurant_id = ? 
         AND reservation_date = ? 
         AND status IN ('Pending', 'Confirmed', 'Accepted')`,
      [restaurantId, reqDate]
    );

    const toMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const parts = String(timeStr).split(':').map(Number);
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    };

    const reqMinutes = toMinutes(reqTime);
    const isOverlap = (t1, t2) => Math.abs(toMinutes(t1) - toMinutes(t2)) < 120; // 2 hour window

    // 4. Calculate table availability
    const availableTables = [];
    const unavailableTables = [];

    for (const table of allTables) {
      // Capacity check
      if (table.capacity < reqPartySize) {
        unavailableTables.push({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          section: table.section,
          reason: `Capacity (${table.capacity}) is less than requested party size (${reqPartySize}).`
        });
        continue;
      }

      // Overlapping active booking check
      const blockingBooking = activeReservations.find(r => {
        return r.table_id === table.id && isOverlap(r.reservation_time, reqTime);
      });

      if (blockingBooking) {
        unavailableTables.push({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          section: table.section,
          reason: `Already reserved at ${blockingBooking.reservation_time} (Booking ID: ${blockingBooking.id}, Status: ${blockingBooking.status}).`
        });
      } else {
        availableTables.push({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          section: table.section,
          status: table.status
        });
      }
    }

    return res.json({
      success: true,
      data: {
        restaurantId,
        date: reqDate,
        time: reqTime,
        partySize: reqPartySize,
        totalTables: allTables.length,
        availableCount: availableTables.length,
        availableTables,
        unavailableTables,
        isBookable: availableTables.length > 0
      }
    });
  } catch (error) {
    console.error('Error calculating table availability:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate table availability.' });
  }
};
