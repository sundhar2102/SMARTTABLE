import { queryAll, queryRun } from '../../database/db.js';

/**
 * Calculates data-driven SMARTTABLE wait-time and occupancy metrics.
 * @param {Array} tables - The list of tables.
 * @param {Array} activeOrders - Active dine-in orders workload.
 * @param {number} partySize - The size of the party requesting a wait time estimate (default 2).
 * @returns {object} Object containing metrics.
 */
export const calculateWaitMetrics = (tables, activeOrders, partySize = 2) => {
  const totalTables = tables.length;
  let availableTables = 0;
  let occupiedTables = 0;
  let reservedTables = 0;
  let cleaningTables = 0;

  for (const t of tables) {
    if (t.status === 'available') {
      availableTables++;
    } else if (t.status === 'occupied') {
      occupiedTables++;
    } else if (t.status === 'reserved') {
      reservedTables++;
    } else if (t.status === 'cleaning') {
      cleaningTables++;
    }
  }

  const occupancyPercentage = totalTables > 0 
    ? Math.round((occupiedTables / totalTables) * 100) 
    : 0;

  // Filter tables matching the party capacity
  const suitableTables = tables.filter(t => t.capacity >= partySize);

  // Filter active dine-in orders that do not have a table_id assigned (queue)
  const queueOrders = activeOrders.filter(o => !o.table_id || o.table_id.trim() === '');
  const queueCount = queueOrders.length;

  if (suitableTables.length === 0) {
    // Rule E: No Suitable Capacity
    return {
      total_tables: totalTables,
      available_tables: availableTables,
      occupied_tables: occupiedTables,
      reserved_tables: reservedTables,
      cleaning_tables: cleaningTables,
      occupancy_percentage: occupancyPercentage,
      estimated_wait_minutes: -1,
      availability: "unavailable",
      reason: "NO_SUITABLE_TABLE",
      queue_count: queueCount,
      suitableTableId: null,
      confidence: "low",
      factors: {
        queuePosition: queueCount,
        tablesOccupied: occupiedTables,
        nextTableAvailableIn: -1,
        cleaningBuffer: 5
      }
    };
  }

  // Calculate release time for each suitable table
  const tableReleaseTimes = suitableTables.map(t => {
    let releaseTime = 0;
    let confidenceScore = 'high';

    if (t.status === 'available') {
      releaseTime = 0;
    } else if (t.status === 'cleaning') {
      // Rule C: Cleaning tables
      if (t.cleaning_started_at) {
        const diffMs = (new Date(t.cleaning_started_at).getTime() + 5 * 60000) - Date.now();
        releaseTime = Math.max(0, Math.ceil(diffMs / 60000));
      } else if (t.mins_remaining !== null && t.mins_remaining !== undefined) {
        releaseTime = t.mins_remaining;
      } else {
        releaseTime = 5; // default cleaning buffer
      }
    } else if (t.status === 'reserved') {
      // Rule D: Reserved tables
      if (t.mins_remaining !== null && t.mins_remaining !== undefined) {
        releaseTime = t.mins_remaining;
      } else {
        releaseTime = 15; // default reserved buffer
      }
    } else if (t.status === 'occupied') {
      // Rule B: Occupied tables
      if (t.expected_available_at) {
        const diffMs = new Date(t.expected_available_at).getTime() - Date.now();
        releaseTime = Math.max(0, Math.ceil(diffMs / 60000));
      } else if (t.mins_remaining !== null && t.mins_remaining !== undefined) {
        releaseTime = t.mins_remaining;
      } else {
        const tableOrders = activeOrders.filter(o => o.table_id === t.id);
        if (tableOrders.length > 0) {
          const latestOrder = tableOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          const createdAt = new Date(latestOrder.created_at);
          const elapsedMins = !isNaN(createdAt.getTime()) ? Math.floor((Date.now() - createdAt) / 60000) : 0;
          
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
            releaseTime = cleaningTime;
          }
        } else {
          releaseTime = 25; // default occupied buffer when no active order
          confidenceScore = 'medium';
        }
      }
    }

    return {
      tableId: t.id,
      releaseTime: Math.max(0, releaseTime),
      confidence: confidenceScore
    };
  });

  // Sort by release time ascending
  tableReleaseTimes.sort((a, b) => a.releaseTime - b.releaseTime);

  let estimatedWait = 0;
  let targetTable = null;
  let finalConfidence = 'high';
  let availability = "waiting";

  // Rule A: Suitable available table exists and no queue
  if (tableReleaseTimes[0].releaseTime === 0 && queueCount === 0) {
    estimatedWait = 0;
    targetTable = tableReleaseTimes[0].tableId;
    finalConfidence = tableReleaseTimes[0].confidence;
    availability = "instant";
  } else {
    // If there is a queue or no suitable table is available immediately
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

    if (estimatedWait === 0) {
      // If estimated wait ended up being 0 (e.g. queue count < number of available tables)
      availability = "instant";
    }
  }

  const nextAvailable = tableReleaseTimes[0].releaseTime;

  // Compute tables coming soon (releasing within 15 mins)
  const comingSoonTables = tableReleaseTimes.filter(t => t.releaseTime > 0 && t.releaseTime <= 15).length;

  const estimatedMins = Math.round(estimatedWait);
  const now = new Date();
  const readyDate = new Date(now.getTime() + estimatedMins * 60000);
  const estimatedReadyTime = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    total_tables: totalTables,
    available_tables: availableTables,
    occupied_tables: occupiedTables,
    reserved_tables: reservedTables,
    cleaning_tables: cleaningTables,
    coming_soon_tables: comingSoonTables,
    occupancy_percentage: occupancyPercentage,
    estimated_wait_minutes: estimatedMins,
    estimated_ready_time: estimatedReadyTime,
    availability,
    queue_count: queueCount,
    suitableTableId: targetTable,
    confidence: finalConfidence,
    status_breakdown: {
      AVAILABLE: availableTables,
      OCCUPIED: occupiedTables,
      RESERVED: reservedTables,
      CLEANING: cleaningTables,
      COMING_SOON: comingSoonTables
    },
    factors: {
      queuePosition: queueCount + 1,
      tablesOccupied: occupiedTables,
      nextTableAvailableIn: Math.max(0, nextAvailable),
      cleaningBuffer: 5,
      estimatedReadyTime
    }
  };
};

export const calculateRestaurantMetrics = async (restaurantId, partySize = 2) => {
  // 0. Auto-reconcile cleaning tables in MySQL
  try {
    await queryRun(`
      UPDATE \`tables\` 
      SET status = 'available', occupied_at = NULL, expected_available_at = NULL, cleaning_started_at = NULL, mins_remaining = NULL 
      WHERE status = 'cleaning' 
        AND cleaning_started_at IS NOT NULL 
        AND cleaning_started_at <= SUBDATE(NOW(), INTERVAL 5 MINUTE)
    `);
  } catch (e) {
    console.error('[Reconciliation Error]:', e.message);
  }

  // 1. Fetch Tables
  const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [restaurantId]);
  
  // 2. Fetch Active Orders (including Served)
  const activeOrders = await queryAll(`
    SELECT * FROM orders 
    WHERE restaurant_id = ? 
      AND status NOT IN ('Completed', 'Rejected', 'Cancelled')
      AND order_status NOT IN ('Completed', 'Rejected', 'Cancelled')
      AND fulfillment_type = 'dine-in'
  `, [restaurantId]);

  return calculateWaitMetrics(tables, activeOrders, partySize);
};
