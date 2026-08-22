import { queryAll, queryRun } from '../../database/db.js';
import { calculateWaitMetrics } from '../utils/waitAlgorithm.js';

// Caching layer for wait-time calculations
const metricsCache = new Map();
const lastEventTimestamps = new Map();

/**
 * Force invalidation of wait-time cache for a specific restaurant.
 * Called when tables, orders, or reservations undergo write mutations.
 */
export const invalidateRestaurantCache = (restaurantId) => {
  lastEventTimestamps.set(restaurantId, Date.now());
  for (const key of metricsCache.keys()) {
    if (key.startsWith(`${restaurantId}-`)) {
      metricsCache.delete(key);
    }
  }
};

/**
 * Deterministically calculates wait times and metrics for a party at a restaurant.
 * Delegates calculation to the consolidated calculateWaitMetrics.
 */
export const calculateWaitTimeForParty = async (restaurantId, partySize = 2) => {
  const cacheKey = `${restaurantId}-${partySize}`;
  const lastEvent = lastEventTimestamps.get(restaurantId) || 0;

  if (metricsCache.has(cacheKey)) {
    const cached = metricsCache.get(cacheKey);
    if (cached.timestamp >= lastEvent) {
      return cached.data;
    }
  }

  // 1. Fetch tables
  const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [restaurantId]);

  // 2. Fetch active workload (dine-in orders that are not completed, rejected, or cancelled)
  const activeOrders = await queryAll(`
    SELECT * FROM orders 
    WHERE restaurant_id = ? 
      AND status NOT IN ('Completed', 'Rejected', 'Cancelled')
      AND order_status NOT IN ('Completed', 'Rejected', 'Cancelled')
      AND fulfillment_type = 'dine-in'
  `, [restaurantId]);

  const metrics = calculateWaitMetrics(tables, activeOrders, partySize);

  const result = {
    estimatedWaitMinutes: metrics.estimated_wait_minutes,
    suitableTableId: metrics.suitableTableId,
    confidence: metrics.confidence,
    factors: metrics.factors
  };

  metricsCache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
};

/**
 * Sweeps the tables table to reconcile any tables that have finished their cleaning cycle.
 * Broadcasts Socket.IO updates for any transitioned tables.
 */
export const reconcileCleaningTables = async (io = null) => {
  try {
    const expiredTables = await queryAll(`
      SELECT * FROM \`tables\` 
      WHERE status = 'cleaning' 
        AND cleaning_started_at IS NOT NULL 
        AND cleaning_started_at <= SUBDATE(NOW(), INTERVAL 5 MINUTE)
    `);

    if (expiredTables.length > 0) {
      await queryRun(`
        UPDATE \`tables\` 
        SET status = 'available', occupied_at = NULL, expected_available_at = NULL, cleaning_started_at = NULL, mins_remaining = NULL 
        WHERE status = 'cleaning' 
          AND cleaning_started_at IS NOT NULL 
          AND cleaning_started_at <= SUBDATE(NOW(), INTERVAL 5 MINUTE)
      `);

      for (const t of expiredTables) {
        console.log(`[Reconciliation] Table ${t.id} at restaurant ${t.restaurant_id} completed cleaning. Transitioned to available.`);
        invalidateRestaurantCache(t.restaurant_id);

        if (io) {
          // Fetch tables to calculate fresh metrics
          const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [t.restaurant_id]);
          const activeOrders = await queryAll(`
            SELECT * FROM orders 
            WHERE restaurant_id = ? 
              AND status NOT IN ('Completed', 'Rejected', 'Cancelled')
              AND order_status NOT IN ('Completed', 'Rejected', 'Cancelled')
              AND fulfillment_type = 'dine-in'
          `, [t.restaurant_id]);
          
          const metrics = calculateWaitMetrics(tables, activeOrders, 2);

          io.to(`restaurant_${t.restaurant_id}_public`).emit('table_status_changed', {
            tableId: t.id,
            restaurantId: t.restaurant_id,
            status: 'available',
            minsRemaining: null,
            occupiedAt: null,
            expectedAvailableAt: null,
            cleaningStartedAt: null
          });

          io.to(`restaurant_${t.restaurant_id}_public`).emit('restaurant_occupancy_updated', {
            restaurantId: t.restaurant_id,
            metrics
          });
        }
      }
    }
  } catch (err) {
    console.error('[Reconciliation Error]:', err.message);
  }
};

/**
 * Sweeps active reservations to automatically release tables for 15-minute no-shows.
 * If diner does not check in within 15 minutes of reservation time, table status is set to 'available'.
 */
export const reconcileNoShowReservations = async (io = null) => {
  try {
    const noShowReservations = await queryAll(`
      SELECT * FROM reservations
      WHERE status IN ('Pending', 'Confirmed')
        AND TIMESTAMP(CONCAT(reservation_date, ' ', reservation_time)) <= SUBDATE(NOW(), INTERVAL 15 MINUTE)
    `);

    if (noShowReservations.length > 0) {
      for (const r of noShowReservations) {
        console.log(`[No-Show Auto-Release] Reservation ${r.id} at ${r.restaurant_id} expired 15-min grace window. Releasing table ${r.table_id}.`);
        
        await queryRun("UPDATE reservations SET status = 'Cancelled', order_status = 'Cancelled' WHERE id = ?", [r.id]);
        
        if (r.table_id) {
          await queryRun("UPDATE `tables` SET status = 'available' WHERE id = ? AND restaurant_id = ?", [r.table_id, r.restaurant_id]);
        }

        invalidateRestaurantCache(r.restaurant_id);

        if (io) {
          io.to(`restaurant_${r.restaurant_id}_public`).emit('table_status_changed', {
            tableId: r.table_id,
            restaurantId: r.restaurant_id,
            status: 'available'
          });
          io.to(`restaurant_${r.restaurant_id}_private`).emit('reservation_status_changed', {
            id: r.id,
            status: 'Cancelled',
            orderStatus: 'Cancelled'
          });
        }
      }
    }
  } catch (err) {
    console.error('[No-Show Reconciliation Error]:', err.message);
  }
};
