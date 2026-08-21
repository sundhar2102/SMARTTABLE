import { queryAll, queryGet, queryRun } from '../../database/db.js';
import { calculateRestaurantMetrics } from '../utils/waitAlgorithm.js';
import { fetchOsmRestaurants, isDuplicate } from '../services/osmService.js';
import { calculateWaitTimeForParty } from '../services/waitTimeService.js';

const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 10 ? Math.round(d * 10) / 10 : Math.round(d);
};

const safeJsonParse = (jsonString, fallback = []) => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON parsing error for string:', jsonString);
    return fallback;
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const hasCoords = lat !== undefined && lng !== undefined;
    let userLat = lat ? parseFloat(lat) : null;
    let userLng = lng ? parseFloat(lng) : null;
    let maxRadius = radius ? parseFloat(radius) : (hasCoords ? 5.0 : 100.0);

    if (userLat === null || userLng === null || isNaN(userLat) || isNaN(userLng)) {
      userLat = 13.0827; // Chennai City Center fallback
      userLng = 80.2707;
    }

    let restaurants = [];
    const radiiToTry = [maxRadius, 10.0, 15.0, 100.0];
    
    // Fetch all restaurants from DB first to do engine-agnostic Haversine in JS
    const allDbRestaurants = await queryAll('SELECT * FROM restaurants');

    for (const currentRadius of radiiToTry) {
      if (currentRadius < maxRadius) continue; // Skip if user requested a larger initial radius
      
      restaurants = allDbRestaurants
        .map(r => {
          const dist = calculateHaversineKm(userLat, userLng, r.lat, r.lng);
          return {
            ...r,
            calculated_distance: dist
          };
        })
        .filter(r => r.calculated_distance <= currentRadius)
        .sort((a, b) => a.calculated_distance - b.calculated_distance);
        
      if (restaurants.length > 0) {
        break; // Found restaurants, stop expanding
      }
    }

    const fullRestaurants = await Promise.all(
      restaurants.map(async (r) => {
        const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [r.id]);
        const menuItems = await queryAll('SELECT * FROM menu_items WHERE restaurant_id = ?', [r.id]);
        
        // Calculate dynamic real-time metrics
        const metrics = await calculateRestaurantMetrics(r.id);

        // Group menu items by category
        const menuGrouped = menuItems.reduce((acc, item) => {
          let cat = acc.find(c => c.category === item.category);
          if (!cat) {
            cat = { category: item.category, items: [] };
            acc.push(cat);
          }
          cat.items.push({
            id: item.id,
            name: item.name,
            price: item.price,
            desc: item.description,
            tags: item.tags_json ? JSON.parse(item.tags_json) : []
          });
          return acc;
        }, []);

        const computedDistance = r.calculated_distance != null ? 
          (r.calculated_distance < 10 ? Math.round(r.calculated_distance * 10) / 10 : Math.round(r.calculated_distance)) 
          : (r.distance_km || 1.0);

        return {
          id: r.id,
          name: r.name,
          tagline: r.tagline,
          cuisine: r.cuisine,
          priceRange: r.price_range,
          priceLevel: r.price_level,
          rating: r.rating,
          reviewsCount: r.reviews_count,
          location: r.location,
          city: r.city || 'Unknown',
          distanceKm: computedDistance,
          lat: r.lat,
          lng: r.lng,
          phoneNumber: r.phone_number,
          hours: safeJsonParse(r.hours_json, null),
          googleMapsUrl: r.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.location)}`,
          image: r.image,
          crowdLevel: r.crowd_level,
          waitEstimate: r.wait_estimate,
          partiesInQueue: r.parties_in_queue,
          openingHours: r.opening_hours,
          aiWalkInProbability: r.ai_walk_in_prob,
          sections: safeJsonParse(r.sections_json, []),
          hourlyCrowdForecast: safeJsonParse(r.hourly_crowd_json, []),
          
          // Inject newly calculated metrics
          total_tables: metrics.total_tables,
          available_tables: metrics.available_tables,
          occupied_tables: metrics.occupied_tables,
          reserved_tables: metrics.reserved_tables,
          cleaning_tables: metrics.cleaning_tables,
          occupancy_percentage: metrics.occupancy_percentage,
          estimated_wait_minutes: metrics.estimated_wait_minutes,
          queue_count: metrics.queue_count,

          tables: tables.map(t => ({
            id: t.id,
            name: t.name,
            capacity: t.capacity,
            section: t.section,
            status: t.status,
            minsRemaining: t.mins_remaining,
            shape: t.shape,
            reservationName: t.reservation_name
          })),
          menu: menuGrouped
        };
      })
    );

    res.json({
      success: true,
      count: fullRestaurants.length,
      data: fullRestaurants
    });
  } catch (error) {
    console.error('Error in getAllRestaurants:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await queryGet('SELECT * FROM restaurants WHERE id = ?', [id]);

    if (!r) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [r.id]);
    const menuItems = await queryAll('SELECT * FROM menu_items WHERE restaurant_id = ?', [r.id]);

    // Calculate dynamic real-time metrics
    const metrics = await calculateRestaurantMetrics(r.id);

    const menuGrouped = menuItems.reduce((acc, item) => {
      let cat = acc.find(c => c.category === item.category);
      if (!cat) {
        cat = { category: item.category, items: [] };
        acc.push(cat);
      }
      cat.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        desc: item.description,
        tags: safeJsonParse(item.tags_json, [])
      });
      return acc;
    }, []);

    res.json({
      success: true,
      data: {
        id: r.id,
        name: r.name,
        tagline: r.tagline,
        cuisine: r.cuisine,
        priceRange: r.price_range,
        priceLevel: r.price_level,
        rating: r.rating,
        reviewsCount: r.reviews_count,
        location: r.location,
        city: r.city || 'Unknown',
        distanceKm: r.distance_km || 1.0,
        lat: r.lat,
        lng: r.lng,
        phoneNumber: r.phone_number,
        hours: safeJsonParse(r.hours_json, null),
        googleMapsUrl: r.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.location)}`,
        image: r.image,
        crowdLevel: r.crowd_level,
        waitEstimate: r.wait_estimate,
        partiesInQueue: r.parties_in_queue,
        openingHours: r.opening_hours,
        aiWalkInProbability: r.ai_walk_in_prob,
        sections: safeJsonParse(r.sections_json, []),
        hourlyCrowdForecast: safeJsonParse(r.hourly_crowd_json, []),
        
        // Inject newly calculated metrics
        total_tables: metrics.total_tables,
        available_tables: metrics.available_tables,
        occupied_tables: metrics.occupied_tables,
        reserved_tables: metrics.reserved_tables,
        cleaning_tables: metrics.cleaning_tables,
        occupancy_percentage: metrics.occupancy_percentage,
        estimated_wait_minutes: metrics.estimated_wait_minutes,
        queue_count: metrics.queue_count,

        tables: tables.map(t => ({
          id: t.id,
          name: t.name,
          capacity: t.capacity,
          section: t.section,
          status: t.status,
          minsRemaining: t.mins_remaining,
          shape: t.shape,
          reservationName: t.reservation_name
        })),
        menu: menuGrouped
      }
    });
  } catch (error) {
    console.error('Error in getRestaurantById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurantCrowdLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { crowdLevel } = req.body;

    if (!['low', 'medium', 'high'].includes(crowdLevel)) {
      return res.status(400).json({ success: false, message: 'Invalid crowdLevel. Must be low, medium, or high' });
    }

    const waitEstimate = crowdLevel === 'high' ? '30-45 min' : crowdLevel === 'medium' ? '10-20 min' : 'Immediate';
    const walkInProb = crowdLevel === 'high' ? 25 : crowdLevel === 'medium' ? 65 : 95;

    await queryRun(
      'UPDATE restaurants SET crowd_level = ?, wait_estimate = ?, ai_walk_in_prob = ? WHERE id = ?',
      [crowdLevel, waitEstimate, walkInProb, id]
    );

    res.json({
      success: true,
      message: `Restaurant crowd level updated to ${crowdLevel}`,
      data: { id, crowdLevel, waitEstimate, walkInProb }
    });
  } catch (error) {
    console.error('Error in updateRestaurantCrowdLevel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/restaurants/nearby?lat=...&lng=...&radius=...
 * Combines SMARTTABLE MySQL partners + OSM/Overpass real-world restaurants.
 * Deduplicates matches and returns a sorted list.
 */
export const getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    let userLat = lat ? parseFloat(lat) : null;
    let userLng = lng ? parseFloat(lng) : null;
    const radiusKm = radius ? parseFloat(radius) : 5.0;
    const radiusMeters = radiusKm * 1000;

    if (userLat === null || userLng === null || isNaN(userLat) || isNaN(userLng)) {
      userLat = 13.0827; // Chennai City Center fallback
      userLng = 80.2707;
    }

    // 1. Fetch SMARTTABLE restaurants (engine-agnostic Haversine in JS)
    let mysqlRows = [];
    const allDbRestaurants = await queryAll('SELECT * FROM restaurants');
    const radiiToTry = [radiusKm, 10.0, 15.0];
    
    for (const currentRadius of radiiToTry) {
      if (currentRadius < radiusKm) continue;
      
      mysqlRows = allDbRestaurants
        .map(r => {
          const dist = calculateHaversineKm(userLat, userLng, r.lat, r.lng);
          return {
            ...r,
            calculated_distance: dist
          };
        })
        .filter(r => r.calculated_distance <= currentRadius)
        .sort((a, b) => a.calculated_distance - b.calculated_distance);
        
      if (mysqlRows.length > 0) break;
    }

    // Hydrate MySQL restaurants (tables, menu, metrics)
    const smarttableRestaurants = await Promise.all(
      mysqlRows.map(async (r) => {
        const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [r.id]);
        const menuItems = await queryAll('SELECT * FROM menu_items WHERE restaurant_id = ?', [r.id]);
        const metrics = await calculateRestaurantMetrics(r.id);

        const menuGrouped = menuItems.reduce((acc, item) => {
          let cat = acc.find(c => c.category === item.category);
          if (!cat) { cat = { category: item.category, items: [] }; acc.push(cat); }
          cat.items.push({ id: item.id, name: item.name, price: item.price, desc: item.description, tags: safeJsonParse(item.tags_json, []) });
          return acc;
        }, []);

        const distKm = r.calculated_distance != null
          ? (r.calculated_distance < 10 ? Math.round(r.calculated_distance * 10) / 10 : Math.round(r.calculated_distance))
          : calculateHaversineKm(userLat, userLng, r.lat, r.lng);

        return {
          source: 'smarttable',
          isSmartTablePartner: true,
          id: r.id,
          name: r.name,
          tagline: r.tagline,
          cuisine: r.cuisine,
          priceRange: r.price_range,
          priceLevel: r.price_level,
          rating: r.rating,
          reviewsCount: r.reviews_count,
          location: r.location,
          city: r.city || 'Unknown',
          distanceKm: distKm,
          lat: r.lat,
          lng: r.lng,
          phoneNumber: r.phone_number,
          hours: safeJsonParse(r.hours_json, null),
          googleMapsUrl: r.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.location)}`,
          image: r.image,
          crowdLevel: r.crowd_level,
          waitEstimate: r.wait_estimate,
          openingHours: r.opening_hours,
          sections: safeJsonParse(r.sections_json, []),
          hourlyCrowdForecast: safeJsonParse(r.hourly_crowd_json, []),
          total_tables: metrics.total_tables,
          available_tables: metrics.available_tables,
          occupied_tables: metrics.occupied_tables,
          reserved_tables: metrics.reserved_tables,
          cleaning_tables: metrics.cleaning_tables,
          occupancy_percentage: metrics.occupancy_percentage,
          estimated_wait_minutes: metrics.estimated_wait_minutes,
          queue_count: metrics.queue_count,
          tables: tables.map(t => ({ id: t.id, name: t.name, capacity: t.capacity, section: t.section, status: t.status, minsRemaining: t.mins_remaining, shape: t.shape, reservationName: t.reservation_name })),
          menu: menuGrouped
        };
      })
    );

    // 2. Fetch OSM restaurants
    let osmRestaurants = [];
    try {
      osmRestaurants = await fetchOsmRestaurants(userLat, userLng, radiusMeters);
    } catch (osmErr) {
      console.warn('[NearbyRestaurants] OSM fetch failed, continuing with MySQL only:', osmErr.message);
    }

    // 3. Deduplicate: remove OSM entries that match a SMARTTABLE partner
    const uniqueOsmRestaurants = osmRestaurants.filter(
      osmR => !isDuplicate(osmR, smarttableRestaurants)
    );

    // 4. Merge and sort by distance
    const combined = [
      ...smarttableRestaurants,
      ...uniqueOsmRestaurants
    ].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    res.json({
      success: true,
      count: combined.length,
      smarttableCount: smarttableRestaurants.length,
      osmCount: uniqueOsmRestaurants.length,
      data: combined
    });

  } catch (error) {
    console.error('[NearbyRestaurants] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWaitTimeExplanation = async (req, res) => {
  try {
    const { id } = req.params;
    const partySize = parseInt(req.query.partySize) || 2;

    const explanation = await calculateWaitTimeForParty(id, partySize);

    res.json({
      success: true,
      data: explanation
    });
  } catch (error) {
    console.error('Error in getWaitTimeExplanation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
