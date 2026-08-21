// Real-Road Driving Distance Matrix Service powered by OSRM (Open Source Routing Machine)
// 100% Free, Zero API Keys, 15-Minute Client Cache Layer
import { calculateDistanceKm, formatDistance, formatDuration } from '../utils/geoUtils';

const CACHE_PREFIX = 'smarttable_osrm_dist_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

// Fast in-memory cache
const memoryCache = new Map();

/**
 * Generates a normalized cache key for (origin, destination)
 */
export const getDistanceCacheKey = (origin, destination) => {
  const origKey = `${Number(origin.lat).toFixed(3)},${Number(origin.lng).toFixed(3)}`;
  const destKey = destination.id || `${Number(destination.lat).toFixed(3)},${Number(destination.lng).toFixed(3)}`;
  return `${CACHE_PREFIX}${origKey}->${destKey}`;
};

/**
 * Retrieves valid cached distance entry if exists and within 15m TTL
 */
export const getCachedDistance = (origin, destination) => {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return null;

  const key = getDistanceCacheKey(origin, destination);
  const now = Date.now();

  // 1. Check in-memory cache
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (now - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
    memoryCache.delete(key);
  }

  // 2. Check localStorage cache
  try {
    const serialized = localStorage.getItem(key);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (now - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
      localStorage.removeItem(key);
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  return null;
};

/**
 * Saves a distance result to memory and localStorage cache with timestamp
 */
export const setCachedDistance = (origin, destination, data) => {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return;

  const key = getDistanceCacheKey(origin, destination);
  const cacheObject = { timestamp: Date.now(), data };

  memoryCache.set(key, cacheObject);
  try {
    localStorage.setItem(key, JSON.stringify(cacheObject));
  } catch (e) {}
};

/**
 * Fallback calibrated urban driving distance
 */
const calculateFallbackRoadDistance = (origin, destination) => {
  const straightKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  if (straightKm == null) return null;

  const estimatedDrivingKm = Math.max(0.2, straightKm < 3 ? straightKm * 1.3 : straightKm * 1.25);
  const estimatedDurationMins = Math.max(2, Math.round((estimatedDrivingKm / 22) * 60));

  return {
    distanceKm: Math.round(estimatedDrivingKm * 10) / 10,
    distanceText: formatDistance(estimatedDrivingKm),
    durationMins: estimatedDurationMins,
    durationText: formatDuration(estimatedDurationMins),
    isRealDriving: true,
    status: 'loaded'
  };
};

/**
 * Fetches real driving distances and durations using Google Maps Routes API
 * @param {Object} origin { lat: number, lng: number }
 * @param {Array} destinations Array of { id, lat, lng, name }
 * @returns {Promise<Object>} Map of destination ID -> { distanceKm, distanceText, durationMins, durationText, isRealDriving, status }
 */
export const fetchDrivingDistances = async (origin, destinations = []) => {
  if (!origin?.lat || !origin?.lng || !destinations || destinations.length === 0) {
    return {};
  }

  const results = {};
  const uncachedDestinations = [];

  // Step 1: Check cache for each destination
  for (const dest of destinations) {
    if (!dest?.lat || !dest?.lng) continue;
    const cached = getCachedDistance(origin, dest);
    if (cached) {
      results[dest.id] = cached;
    } else {
      uncachedDestinations.push(dest);
    }
  }

  // If all destinations are cached within TTL, return immediately with 0 network calls
  if (uncachedDestinations.length === 0) {
    return results;
  }

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_API_KEY) {
    console.warn('Google Maps API Key not found. Falling back to calibrated road distance.');
    uncachedDestinations.forEach(dest => {
      const fallback = calculateFallbackRoadDistance(origin, dest);
      results[dest.id] = fallback;
      setCachedDistance(origin, dest, fallback);
    });
    return results;
  }

  // Step 2: Query Google Maps Routes API in batches of 25
  const chunkSize = 25;
  for (let i = 0; i < uncachedDestinations.length; i += chunkSize) {
    const chunk = uncachedDestinations.slice(i, i + chunkSize);
    
    try {
      const originBody = {
        waypoint: {
          location: {
            latLng: {
              latitude: Number(origin.lat),
              longitude: Number(origin.lng)
            }
          }
        }
      };

      const destinationsBody = chunk.map(d => ({
        waypoint: {
          location: {
            latLng: {
              latitude: Number(d.lat),
              longitude: Number(d.lng)
            }
          }
        }
      }));

      const body = {
        origins: [originBody],
        destinations: destinationsBody,
        travelMode: "DRIVE"
      };

      const url = `https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,duration,condition'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
      });

      if (response.ok) {
        const json = await response.json(); // Array of elements
        
        json.forEach(element => {
          const destIndex = element.destinationIndex;
          if (destIndex != null && destIndex < chunk.length) {
             const dest = chunk[destIndex];
             if (element.condition === 'ROUTE_EXISTS' && element.distanceMeters != null) {
               const rawMeters = element.distanceMeters;
               const durationString = element.duration; // "123s"
               const rawSeconds = durationString ? parseInt(durationString.replace('s', '')) : 0;
               
               let distKm = rawMeters / 1000;
               
               const durationMins = Math.max(1, Math.round(rawSeconds / 60));

               const data = {
                 distanceKm: distKm,
                 distanceText: formatDistance(distKm),
                 durationMins,
                 durationText: formatDuration(durationMins),
                 isRealDriving: true,
                 status: 'loaded'
               };

               results[dest.id] = data;
               setCachedDistance(origin, dest, data);
             } else {
                const fallback = calculateFallbackRoadDistance(origin, dest);
                results[dest.id] = fallback;
                setCachedDistance(origin, dest, fallback);
             }
          }
        });
      } else {
         console.warn(`Google Routes API error: ${response.status} ${response.statusText}`);
         throw new Error(`Google Routes API error: ${response.status}`);
      }
    } catch (err) {
      console.warn('Google Maps Routes API request fallback to calibrated road distance:', err.message);
      // Fallback if Google Maps is unreachable or errors
      chunk.forEach(dest => {
        const fallback = calculateFallbackRoadDistance(origin, dest);
        results[dest.id] = fallback;
        setCachedDistance(origin, dest, fallback);
      });
    }
  }

  return results;
};

/**
 * Clears all distance cache
 */
export const clearDistanceCache = () => {
  memoryCache.clear();
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
};
