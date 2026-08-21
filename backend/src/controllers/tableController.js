import { queryAll, queryGet, queryRun } from '../../database/db.js';
import { calculateRestaurantMetrics } from '../utils/waitAlgorithm.js';
import { invalidateRestaurantCache } from '../services/waitTimeService.js';

export const updateTableStatus = async (req, res) => {
  try {
    const { restaurantId, tableId } = req.params;
    const { status, minsRemaining, reservationName } = req.body;

    // 1. Verify restaurant exists
    const restaurant = await queryGet('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // 2. Verify table exists
    const table = await queryGet(
      'SELECT * FROM `tables` WHERE id = ? AND restaurant_id = ?',
      [tableId, restaurantId]
    );

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    let updatedMins = minsRemaining;
    if (status === 'occupied' && !updatedMins) {
      // Deterministically check active orders for this table first
      const activeOrders = await queryAll(`
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
        updatedMins = Math.max(5, 45 - elapsedMins);
      } else {
        updatedMins = 30; // Deterministic standard default dining duration
      }
    } else if (status === 'available') {
      updatedMins = null;
    } else if (status === 'cleaning') {
      updatedMins = 5; // Standard cleaning buffer
    }

    await queryRun(
      `UPDATE \`tables\` 
       SET status = ?, mins_remaining = ?, reservation_name = ? 
       WHERE id = ? AND restaurant_id = ?`,
      [status, updatedMins, reservationName || null, tableId, restaurantId]
    );

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
        minsRemaining: updatedMins
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
        tableId,
        restaurantId,
        status,
        minsRemaining: updatedMins,
        metrics
      }
    });
  } catch (error) {
    console.error('Error in updateTableStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
