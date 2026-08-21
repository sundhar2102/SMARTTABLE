import { queryAll } from '../../database/db.js';

/**
 * Calculates data-driven SMARTTABLE wait-time and occupancy metrics.
 * @param {string} restaurantId - The restaurant to calculate metrics for.
 * @param {number} partySize - The size of the party requesting a wait time estimate (default 2).
 * @returns {object} Object containing metrics.
 */
export const calculateWaitMetrics = (tables, activeOrders, partySize = 2) => {
  // 1. Table Availability & Occupancy
  const totalTables = tables.length;
  let availableTables = 0;
  let occupiedTables = 0;
  let reservedTables = 0;
  let cleaningTables = 0;

  const suitableReleaseTimes = [];

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

    // Only consider tables that can accommodate the party size
    if (t.capacity >= partySize) {
      if (t.status === 'available') {
        suitableReleaseTimes.push(0); // Available immediately
      } else if (t.status === 'occupied' || t.status === 'cleaning') {
        // Use mins_remaining if available
        let estimatedRelease = t.mins_remaining;
        
        // If mins_remaining is NULL, do not invent a value randomly, but we need a fallback for the algorithm
        // We will check active orders associated with this table
        if (estimatedRelease === null || estimatedRelease === undefined) {
          const tableOrders = activeOrders.filter(o => o.table_id === t.id);
          if (t.status === 'cleaning') {
            estimatedRelease = 5; // Standard cleaning buffer
          } else if (tableOrders.length > 0) {
            // They have active orders
            // If they are just "Accepted", food will take ~15 mins, plus 20 mins to eat.
            // If "Preparing", food is closer, maybe 25 mins total.
            // Let's use a flat 30 mins from the time of the oldest order as a generic fallback.
            const oldestOrder = tableOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
            const createdDate = new Date(oldestOrder.created_at);
            
            // Defensive check against NaN dates or invalid formats
            if (isNaN(createdDate.getTime())) {
              estimatedRelease = 30; // Safe default if date is invalid
            } else {
              const elapsed = Math.floor((new Date() - createdDate) / 60000);
              
              // Handle potential NaN from Math.floor if elapsed logic fails for any reason
              if (isNaN(elapsed)) {
                estimatedRelease = 30;
              } else {
                estimatedRelease = Math.max(5, 45 - elapsed); // Assume 45 mins turnover
              }
            }
          } else {
            // Occupied but no active order (maybe just seated, or already paid)
            estimatedRelease = 15;
          }
        }
        
        // Final sanity check before pushing to suitableReleaseTimes
        if (estimatedRelease === null || estimatedRelease === undefined || isNaN(estimatedRelease)) {
          estimatedRelease = 15; // Hard generic fallback
        }
        
        suitableReleaseTimes.push(estimatedRelease);
      }
    }
  }

  // Calculate Occupancy Percentage
  const occupancyPercentage = totalTables > 0 
    ? Math.round((occupiedTables / totalTables) * 100) 
    : 0;

  // 5. Waiting Queue
  // Queue count = Active orders for dine-in where table_id is null/empty
  const queueOrders = activeOrders.filter(o => !o.table_id || o.table_id.trim() === '');
  const queueCount = queueOrders.length;

  // 6. Wait-Time Algorithm
  let estimatedWaitMinutes = 0;
  
  if (suitableReleaseTimes.length === 0) {
    // No tables can accommodate this party size
    estimatedWaitMinutes = -1; // Represents "No suitable table"
  } else {
    // Sort ascending
    suitableReleaseTimes.sort((a, b) => a - b);
    
    // If we have an available table
    if (suitableReleaseTimes[0] === 0) {
      estimatedWaitMinutes = 0;
    } else {
      // The current party is conceptually at index (queueCount) in the line for a suitable table.
      // If queue is 0, they get the first table to release: suitableReleaseTimes[0].
      // If queue is 1, they get the second table: suitableReleaseTimes[1].
      
      const targetIndex = queueCount;
      if (targetIndex < suitableReleaseTimes.length) {
        estimatedWaitMinutes = suitableReleaseTimes[targetIndex];
      } else {
        // If the queue is longer than the number of suitable tables, wrap around.
        // Assume every table turnover takes 45 minutes on average after the first release.
        const wrapCount = Math.floor(targetIndex / suitableReleaseTimes.length);
        const remainder = targetIndex % suitableReleaseTimes.length;
        estimatedWaitMinutes = suitableReleaseTimes[remainder] + (wrapCount * 45);
      }
    }
  }

  // Final defensive check for return value
  if (estimatedWaitMinutes === null || estimatedWaitMinutes === undefined || isNaN(estimatedWaitMinutes)) {
    estimatedWaitMinutes = 15; // generic fallback
  }

  return {
    total_tables: totalTables,
    available_tables: availableTables,
    occupied_tables: occupiedTables,
    reserved_tables: reservedTables,
    cleaning_tables: cleaningTables,
    occupancy_percentage: occupancyPercentage,
    estimated_wait_minutes: estimatedWaitMinutes,
    queue_count: queueCount
  };
};

export const calculateRestaurantMetrics = async (restaurantId, partySize = 2) => {
  // 1. Fetch Tables
  const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [restaurantId]);
  
  // 2. Fetch Active Orders
  // We exclude Completed, Rejected, Cancelled to get only active workload.
  const activeOrders = await queryAll(`
    SELECT * FROM orders 
    WHERE restaurant_id = ? 
      AND status NOT IN ('Completed', 'Rejected', 'Cancelled')
      AND order_status NOT IN ('Completed', 'Rejected', 'Cancelled', 'Served')
      AND fulfillment_type = 'dine-in'
  `, [restaurantId]);

  return calculateWaitMetrics(tables, activeOrders, partySize);
};
