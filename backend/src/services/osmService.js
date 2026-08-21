/**
 * OSM Service — Queries the Overpass API to find real-world restaurants
 * near a given lat/lng using OSM amenity=restaurant tags.
 * 
 * This is a BACKEND-ONLY service. The frontend must call
 * GET /api/restaurants/nearby?lat=...&lng=...&radius=...
 * instead of contacting Overpass directly.
 */

// Public Overpass API instances (round-robin fallback)
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpassapi.heigit.org/api/interpreter',
];

/**
 * Build an Overpass QL query for restaurants within a radius.
 */
const buildOverpassQuery = (lat, lng, radiusMeters) => {
  return `
[out:json][timeout:25];
(
  node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
  way["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
  relation["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
);
out center tags;
`;
};

/**
 * Extract a usable lat/lng from an OSM element (node / way / relation).
 */
const extractCoords = (element) => {
  if (element.type === 'node') {
    return { lat: element.lat, lng: element.lon };
  }
  // ways and relations expose a "center" object when queried with "out center"
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
};

/**
 * Haversine distance in km between two lat/lng pairs.
 */
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
};

/**
 * Normalize a name for fuzzy duplicate detection.
 */
export const normalizeName = (name = '') =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Check if an OSM restaurant is a duplicate of a SMARTTABLE MySQL restaurant.
 * Returns true if they are likely the same physical restaurant.
 */
export const isDuplicate = (osmRestaurant, mysqlRestaurants) => {
  const osmName = normalizeName(osmRestaurant.name);
  const osmLat = osmRestaurant.lat;
  const osmLng = osmRestaurant.lng;

  for (const m of mysqlRestaurants) {
    const mysqlName = normalizeName(m.name);
    
    // 1. Geographic proximity check — within 150 meters
    if (m.lat && m.lng && osmLat && osmLng) {
      const dist = haversineKm(osmLat, osmLng, parseFloat(m.lat), parseFloat(m.lng));
      if (dist < 0.15) return true; // Within 150m = same place
    }

    // 2. Name similarity — if >60% of words match
    if (osmName && mysqlName) {
      const osmWords = osmName.split(' ').filter(Boolean);
      const mysqlWords = mysqlName.split(' ').filter(Boolean);
      if (osmWords.length === 0) continue;
      const matchCount = osmWords.filter(w => mysqlWords.includes(w)).length;
      const similarity = matchCount / osmWords.length;
      if (similarity >= 0.6) return true;
    }
  }
  return false;
};

/**
 * Map a raw OSM element to a normalized restaurant object.
 */
const mapOsmToRestaurant = (element, userLat, userLng) => {
  const tags = element.tags || {};
  const coords = extractCoords(element);
  if (!coords) return null;

  const distanceKm = haversineKm(userLat, userLng, coords.lat, coords.lng);
  const name = tags.name || tags['name:en'] || 'Unnamed Restaurant';

  // Build a Google Maps URL for the location
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (tags['addr:full'] || tags['addr:street'] || ''))}`;

  return {
    // Mark as OSM-only so the frontend knows what to render
    source: 'osm',
    isSmartTablePartner: false,
    
    // OSM element id as unique identifier (prefixed to avoid collisions with MySQL UUIDs)
    id: `osm_${element.type}_${element.id}`,
    osmId: element.id,
    osmType: element.type,

    name,
    cuisine: tags.cuisine ? tags.cuisine.replace(/_/g, ' ') : 'Restaurant',
    location: [
      tags['addr:housename'],
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:city']
    ].filter(Boolean).join(', ') || tags['addr:full'] || 'Location on map',

    city: tags['addr:city'] || tags['addr:state'] || '',
    lat: coords.lat,
    lng: coords.lng,
    distanceKm,

    // Contact info from OSM tags
    phoneNumber: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    openingHours: tags.opening_hours || null,

    // Linking
    googleMapsUrl,

    // OSM-only restaurants have NO live data
    tables: [],
    menu: [],
    estimated_wait_minutes: null,
    available_tables: null,
    occupied_tables: null,
    reserved_tables: null,
    total_tables: null,
    queue_count: null,
    crowdLevel: null,
    rating: null,
    image: null
  };
};

/**
 * Fetch restaurants from the Overpass API.
 * Tries each endpoint in turn; returns [] if all fail.
 */
export const fetchOsmRestaurants = async (lat, lng, radiusMeters = 5000) => {
  const query = buildOverpassQuery(lat, lng, radiusMeters);
  
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SMARTTABLE-App/1.0 (college project; nearby restaurant discovery)',
          'Accept': 'application/json'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(3000) // Strict 3 second timeout
      });

      if (!response.ok) {
        console.warn(`[OSM] Overpass endpoint ${endpoint} returned HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const elements = data?.elements || [];

      // Map elements → normalized restaurant objects, filter out any with no coords
      const osmRestaurants = elements
        .map(el => mapOsmToRestaurant(el, lat, lng))
        .filter(Boolean)
        .filter(r => r.name !== 'Unnamed Restaurant' || r.location !== 'Location on map');

      console.log(`[OSM] Fetched ${osmRestaurants.length} restaurants from Overpass (radius=${radiusMeters}m)`);
      return osmRestaurants;

    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`[OSM] Overpass request timed out for endpoint: ${endpoint}`);
      } else {
        console.warn(`[OSM] Overpass request failed for endpoint ${endpoint}:`, err.message);
      }
    }
  }

  console.warn('[OSM] All Overpass endpoints failed. Returning empty array.');
  return [];
};
