import { queryAll } from '../../database/db.js';

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
 * Reuses the database records, matches partySize, counts active queue size, and
 * returns structured explanation factors.
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

  // 2. Fetch active workload (dine-in orders that are not completed, rejected, cancelled, or served)
  const activeOrders = await queryAll(`
    SELECT * FROM orders 
    WHERE restaurant_id = ? 
      AND status NOT IN ('Completed', 'Rejected', 'Cancelled')
      AND order_status NOT IN ('Completed', 'Rejected', 'Cancelled')
      AND fulfillment_type = 'dine-in'
  `, [restaurantId]);

  // 3. Filter tables matching the party capacity
  const suitableTables = tables.filter(t => t.capacity >= partySize);

  if (suitableTables.length === 0) {
    const result = {
      estimatedWaitMinutes: -1,
      suitableTableId: null,
      confidence: 'low',
      factors: {
        queuePosition: 0,
        tablesOccupied: tables.filter(t => t.status === 'occupied').length,
        nextTableAvailableIn: -1,
        cleaningBuffer: 5
      }
    };
    metricsCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  }

  // 4. Calculate estimated minutes until free for each suitable table
  const now = new Date();
  const tableReleaseTimes = suitableTables.map(t => {
    let releaseTime = 0;
    let confidenceScore = 'high';

    if (t.status === 'available') {
      releaseTime = 0;
    } else if (t.status === 'cleaning') {
      releaseTime = 5; // standard cleaning buffer
    } else if (t.status === 'reserved') {
      releaseTime = 15; // reserved table buffer
    } else if (t.status === 'occupied') {
      // Find orders currently executing on this table
      const tableOrders = activeOrders.filter(o => o.table_id === t.id);

      if (tableOrders.length > 0) {
        // Find latest order on this table
        const latestOrder = tableOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        const createdAt = new Date(latestOrder.created_at);
        const elapsedMins = !isNaN(createdAt.getTime()) ? Math.floor((now - createdAt) / 60000) : 0;

        const prepTime = 15;
        const diningTime = 30;
        const cleaningTime = 5;
        const totalDuration = prepTime + diningTime + cleaningTime;

        if (latestOrder.order_status === 'Pending Acceptance' || latestOrder.order_status === 'Received') {
          releaseTime = Math.max(cleaningTime, totalDuration - elapsedMins);
        } else if (latestOrder.order_status === 'Preparing' || latestOrder.order_status === 'Cooking') {
          releaseTime = Math.max(cleaningTime, (prepTime - elapsedMins) + diningTime + cleaningTime);
        } else if (latestOrder.order_status === 'Ready' || latestOrder.order_status === 'Served') {
          const elapsedSinceServed = Math.max(0, elapsedMins - prepTime);
          releaseTime = Math.max(cleaningTime, (diningTime - elapsedSinceServed) + cleaningTime);
        } else {
          // Fallback if completed/paid
          releaseTime = cleaningTime;
        }
        confidenceScore = 'high';
      } else {
        // Occupied but no active order yet (browsing menu / just seated)
        releaseTime = 25;
        confidenceScore = 'medium';
      }
    }

    // Allow database override if mins_remaining is explicitly set (e.g., from manual adjustment)
    if (t.mins_remaining !== null && t.mins_remaining !== undefined) {
      releaseTime = t.mins_remaining;
      confidenceScore = 'high';
    }

    return {
      tableId: t.id,
      capacity: t.capacity,
      releaseTime: Math.max(0, releaseTime),
      confidence: confidenceScore
    };
  });

  // 5. Gather queue orders
  const queueOrders = activeOrders.filter(o => !o.table_id || o.table_id.trim() === '');
  const queueCount = queueOrders.length;

  // Sort release times ascending
  tableReleaseTimes.sort((a, b) => a.releaseTime - b.releaseTime);

  let estimatedWait = 0;
  let targetTable = null;
  let finalConfidence = 'high';

  if (tableReleaseTimes[0].releaseTime === 0 && queueCount === 0) {
    estimatedWait = 0;
    targetTable = tableReleaseTimes[0].tableId;
    finalConfidence = tableReleaseTimes[0].confidence;
  } else {
    const targetIndex = queueCount;

    if (targetIndex < tableReleaseTimes.length) {
      estimatedWait = tableReleaseTimes[targetIndex].releaseTime;
      targetTable = tableReleaseTimes[targetIndex].tableId;
      finalConfidence = tableReleaseTimes[targetIndex].confidence;
    } else {
      const wrapCount = Math.floor(targetIndex / tableReleaseTimes.length);
      const remainder = targetIndex % tableReleaseTimes.length;
      const baseRelease = tableReleaseTimes[remainder].releaseTime;

      estimatedWait = baseRelease + (wrapCount * 45);
      targetTable = tableReleaseTimes[remainder].tableId;
      finalConfidence = 'medium';
    }
  }

  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const nextAvailable = tableReleaseTimes[0].releaseTime;

  const result = {
    estimatedWaitMinutes: Math.round(estimatedWait),
    suitableTableId: targetTable,
    confidence: finalConfidence,
    factors: {
      queuePosition: queueCount,
      tablesOccupied: occupiedCount,
      nextTableAvailableIn: Math.round(nextAvailable),
      cleaningBuffer: 5
    }
  };

  metricsCache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
};
