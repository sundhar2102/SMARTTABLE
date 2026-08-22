import { queryAll, queryGet } from '../../database/db.js';
import { calculateRestaurantMetrics } from '../utils/waitAlgorithm.js';

/**
 * Returns comprehensive real-data analytics and deterministic smart predictions for a specific restaurant.
 */
export const getRestaurantAnalytics = async (req, res) => {
  try {
    const restaurantId = req.params.id || req.params.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    // 1. Verify restaurant exists
    const rest = await queryGet('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (!rest) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // 2. Orders real aggregate metrics
    const orderStats = await queryGet(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN grand_total ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN grand_total ELSE NULL END), 0) as avg_order_value,
        COUNT(CASE WHEN fulfillment_type = 'dine-in' AND status != 'Cancelled' THEN 1 END) as dine_in_orders,
        COUNT(CASE WHEN fulfillment_type = 'takeaway' AND status != 'Cancelled' THEN 1 END) as takeaway_orders,
        COUNT(CASE WHEN fulfillment_type = 'delivery' AND status != 'Cancelled' THEN 1 END) as delivery_orders,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN status IN ('Confirmed', 'Completed') THEN 1 END) as successful_orders
      FROM orders 
      WHERE restaurant_id = ?
    `, [restaurantId]);

    // 3. Reservations real aggregate metrics
    const resStats = await queryGet(`
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status IN ('Cancelled', 'Declined') THEN 1 END) as cancelled_reservations,
        COUNT(CASE WHEN order_status IN ('Completed', 'Served') THEN 1 END) as completed_reservations,
        COALESCE(AVG(party_size), 2) as avg_party_size,
        COUNT(CASE WHEN party_size <= 2 THEN 1 END) as party_1_2,
        COUNT(CASE WHEN party_size BETWEEN 3 AND 4 THEN 1 END) as party_3_4,
        COUNT(CASE WHEN party_size BETWEEN 5 AND 6 THEN 1 END) as party_5_6,
        COUNT(CASE WHEN party_size >= 7 THEN 1 END) as party_7_plus
      FROM reservations 
      WHERE restaurant_id = ?
    `, [restaurantId]);

    // 4. Tables and Real-Time Utilization
    const tableStats = await queryGet(`
      SELECT 
        COUNT(*) as total_tables,
        COALESCE(SUM(capacity), 0) as total_seat_capacity,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_tables,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_tables,
        COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_tables,
        COUNT(CASE WHEN status = 'cleaning' THEN 1 END) as cleaning_tables
      FROM \`tables\` 
      WHERE restaurant_id = ?
    `, [restaurantId]);

    const totalTables = Number(tableStats?.total_tables || 0);
    const occupiedTables = Number(tableStats?.occupied_tables || 0);
    const availableTables = Number(tableStats?.available_tables || 0);
    const reservedTables = Number(tableStats?.reserved_tables || 0);
    const cleaningTables = Number(tableStats?.cleaning_tables || 0);

    const occupancyPercentage = totalTables > 0 
      ? Math.round((occupiedTables / totalTables) * 100) 
      : 0;

    // 5. Real Hourly Booking Trends (from non-cancelled reservations)
    const hourlyRows = await queryAll(`
      SELECT 
        HOUR(reservation_time) as hour,
        COUNT(*) as count
      FROM reservations 
      WHERE restaurant_id = ? 
        AND reservation_time IS NOT NULL 
        AND status != 'Cancelled'
      GROUP BY HOUR(reservation_time)
      ORDER BY hour ASC
    `, [restaurantId]);

    // Build standard 11:00 to 22:00 hourly distribution map
    const hourlyDistribution = [];
    for (let h = 11; h <= 22; h++) {
      const match = hourlyRows.find(r => Number(r.hour) === h);
      const label = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
      hourlyDistribution.push({
        hour: h,
        label,
        count: match ? Number(match.count) : 0
      });
    }

    // 6. Upcoming Today's Reservations within next 2 hours
    const upcomingToday = await queryGet(`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE restaurant_id = ? 
        AND reservation_date = CURDATE() 
        AND reservation_time >= CURTIME() 
        AND reservation_time <= ADDTIME(CURTIME(), '02:00:00')
        AND status != 'Cancelled'
    `, [restaurantId]);
    const upcomingCount = Number(upcomingToday?.count || 0);

    // 7. Deterministic Smart Predictions
    // A. Predicted Crowd Level
    let predictedCrowd = 'Low';
    let crowdBadgeColor = 'emerald';
    const effectiveLoad = occupiedTables + upcomingCount;
    if (effectiveLoad >= totalTables && totalTables > 0) {
      predictedCrowd = 'Peak / Over-Capacity';
      crowdBadgeColor = 'rose';
    } else if (effectiveLoad >= Math.ceil(totalTables * 0.7)) {
      predictedCrowd = 'High';
      crowdBadgeColor = 'orange';
    } else if (effectiveLoad >= Math.ceil(totalTables * 0.4)) {
      predictedCrowd = 'Moderate';
      crowdBadgeColor = 'amber';
    }

    // B. Best Time to Visit (Hourly slot with minimum load)
    let bestSlot = '3:00 PM - 5:00 PM (Off-Peak)';
    if (hourlyDistribution.length > 0) {
      const sortedHours = [...hourlyDistribution].sort((a, b) => a.count - b.count);
      const lowestHour = sortedHours[0].hour;
      const lowestLabel = `${lowestHour > 12 ? lowestHour - 12 : lowestHour}:00 ${lowestHour >= 12 ? 'PM' : 'AM'}`;
      bestSlot = `${lowestLabel} (Lowest Wait)`;
    }

    // C. Live Wait Telemetry from waitAlgorithm
    const liveTelemetry = await calculateRestaurantMetrics(restaurantId, 2);

    // D. Table Turnover Estimate
    const avgTurnoverMins = rest.cuisine?.toLowerCase().includes('bar') || rest.cuisine?.toLowerCase().includes('buffet')
      ? 65
      : rest.cuisine?.toLowerCase().includes('cafe') 
        ? 35 
        : 45;

    // Zero data flag
    const totalRecords = Number(orderStats?.total_orders || 0) + Number(resStats?.total_reservations || 0);
    const hasData = totalRecords > 0;

    res.json({
      success: true,
      data: {
        restaurantId,
        restaurantName: rest.name,
        hasData,
        insufficientDataMessage: hasData ? null : 'No historical order or reservation data recorded yet for this property.',
        realtime: {
          totalTables,
          availableTables,
          occupiedTables,
          reservedTables,
          cleaningTables,
          occupancyPercentage,
          totalSeatCapacity: Number(tableStats?.total_seat_capacity || 0),
          liveEstimatedWaitMinutes: liveTelemetry.estimated_wait_minutes,
          liveQueueCount: liveTelemetry.queue_count,
          liveConfidence: liveTelemetry.confidence,
          liveAvailability: liveTelemetry.availability
        },
        historical: {
          totalOrders: Number(orderStats?.total_orders || 0),
          successfulOrders: Number(orderStats?.successful_orders || 0),
          cancelledOrders: Number(orderStats?.cancelled_orders || 0),
          totalRevenue: Number(Number(orderStats?.total_revenue || 0).toFixed(2)),
          avgOrderValue: Number(Number(orderStats?.avg_order_value || 0).toFixed(2)),
          fulfillmentBreakdown: {
            dineIn: Number(orderStats?.dine_in_orders || 0),
            takeaway: Number(orderStats?.takeaway_orders || 0),
            delivery: Number(orderStats?.delivery_orders || 0)
          },
          totalReservations: Number(resStats?.total_reservations || 0),
          confirmedReservations: Number(resStats?.confirmed_reservations || 0),
          completedReservations: Number(resStats?.completed_reservations || 0),
          cancelledReservations: Number(resStats?.cancelled_reservations || 0),
          cancellationRatePercent: Number(resStats?.total_reservations || 0) > 0 
            ? Math.round((Number(resStats?.cancelled_reservations || 0) / Number(resStats?.total_reservations)) * 100) 
            : 0,
          avgPartySize: Number(Number(resStats?.avg_party_size || 2).toFixed(1)),
          partySizeDistribution: {
            party_1_2: Number(resStats?.party_1_2 || 0),
            party_3_4: Number(resStats?.party_3_4 || 0),
            party_5_6: Number(resStats?.party_5_6 || 0),
            party_7_plus: Number(resStats?.party_7_plus || 0)
          },
          hourlyDistribution
        },
        predictions: {
          predictedCrowdLevel: predictedCrowd,
          crowdBadgeColor,
          estimatedNextTableWait: liveTelemetry.estimated_wait_minutes <= 0 ? 'Instant (0-5 min)' : `~${liveTelemetry.estimated_wait_minutes} mins`,
          avgTableTurnoverMinutes: avgTurnoverMins,
          bestTimeToVisit: bestSlot,
          upcomingReservationsNext2Hours: upcomingCount,
          isDeterministic: true
        }
      }
    });

  } catch (error) {
    console.error('Error in getRestaurantAnalytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Returns platform-wide consolidated analytics for Super Admin governance.
 */
export const getPlatformAnalytics = async (req, res) => {
  try {
    const platformOrderStats = await queryGet(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN grand_total ELSE 0 END), 0) as total_gmv,
        COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN grand_total ELSE NULL END), 0) as avg_order_value
      FROM orders
    `);

    const platformResStats = await queryGet(`
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status IN ('Cancelled', 'Declined') THEN 1 END) as cancelled_reservations
      FROM reservations
    `);

    const platformUserStats = await queryGet(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_count,
        COUNT(CASE WHEN role = 'owner' THEN 1 END) as owner_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_user_count
      FROM users
    `);

    const platformRestaurantStats = await queryGet(`
      SELECT 
        COUNT(*) as total_restaurants,
        COUNT(CASE WHEN is_accepting_orders = 1 THEN 1 END) as active_restaurants
      FROM restaurants
    `);

    const platformTableStats = await queryGet(`
      SELECT 
        COUNT(*) as total_tables,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_tables,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_tables
      FROM \`tables\`
    `);

    const gmv = Number(platformOrderStats?.total_gmv || 0);
    const platformCommission = Number((gmv * 0.15).toFixed(2)); // 15% platform commission

    res.json({
      success: true,
      data: {
        totalGmv: gmv,
        platformCommissionRevenue: platformCommission,
        totalOrders: Number(platformOrderStats?.total_orders || 0),
        avgOrderValue: Number(Number(platformOrderStats?.avg_order_value || 0).toFixed(2)),
        totalReservations: Number(platformResStats?.total_reservations || 0),
        confirmedReservations: Number(platformResStats?.confirmed_reservations || 0),
        cancelledReservations: Number(platformResStats?.cancelled_reservations || 0),
        totalUsers: Number(platformUserStats?.total_users || 0),
        customerCount: Number(platformUserStats?.customer_count || 0),
        ownerCount: Number(platformUserStats?.owner_count || 0),
        activeUserCount: Number(platformUserStats?.active_user_count || 0),
        totalRestaurants: Number(platformRestaurantStats?.total_restaurants || 0),
        activeRestaurants: Number(platformRestaurantStats?.active_restaurants || 0),
        totalTables: Number(platformTableStats?.total_tables || 0),
        occupiedTables: Number(platformTableStats?.occupied_tables || 0),
        availableTables: Number(platformTableStats?.available_tables || 0),
        systemUtilizationPercent: Number(platformTableStats?.total_tables || 0) > 0
          ? Math.round((Number(platformTableStats?.occupied_tables || 0) / Number(platformTableStats?.total_tables)) * 100)
          : 0
      }
    });

  } catch (error) {
    console.error('Error in getPlatformAnalytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
