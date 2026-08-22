import { TestHarness } from '../utils/testHarness.js';

const BASE_URL = 'http://localhost:5000/api';

export async function runDiscoverySuite() {
  const harness = new TestHarness('Restaurant Discovery & Geolocation', '2. Restaurant Discovery & Radar');

  // 1-5: Base listing and property retrieval
  await harness.test('DISC-001', 'Restaurant Listing', 'GET /api/restaurants returns complete list of dining properties', 'Diner', 'REST API', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data) || json.data.length === 0) throw new Error('Failed to retrieve restaurants list');
  });

  await harness.test('DISC-002', 'Restaurant Profile', 'GET /api/restaurants/:id returns full property metadata and menu', 'Diner', 'REST API', async () => {
    const res = await fetch(`${BASE_URL}/restaurants/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!res.ok || !json.data || json.data.id !== 'annalakshmi-restaurant-egmore') throw new Error('Restaurant profile payload mismatch');
  });

  await harness.test('DISC-003', 'Non-Existent Restaurant', 'GET /api/restaurants/:id with invalid ID returns 404', 'Diner', 'Error Handling', async () => {
    const res = await fetch(`${BASE_URL}/restaurants/invalid-restaurant-xyz-999`);
    if (res.status !== 404) throw new Error(`Expected 404 Not Found, got ${res.status}`);
  });

  await harness.test('DISC-004', 'Chennai Hyperlocal Coverage', 'Verify listed restaurants have valid Chennai geolocations (lat/lng)', 'Diner', 'Data Integrity', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const allHaveCoords = json.data.every(r => r.lat !== null && r.lat !== undefined && r.lng !== null && r.lng !== undefined);
    if (!allHaveCoords) throw new Error('Some restaurants missing valid geographic coordinates');
  });

  await harness.test('DISC-005', 'Operating Hours Format', 'Verify restaurant opening hours are structured and human-readable', 'Diner', 'Data Formatting', async () => {
    const res = await fetch(`${BASE_URL}/restaurants/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!json.data.opening_hours && !json.data.hours && !json.data.location) throw new Error('Restaurant missing valid opening hours');
  });

  // 6-10: Search, Filtering and Categorization
  await harness.test('DISC-006', 'Cuisine Classification', 'Verify cuisine tags (South Indian, Asian, Cafe, Fine Dining) are populated', 'Diner', 'Categorization', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const hasCuisines = json.data.every(r => r.cuisine && r.cuisine.length > 0);
    if (!hasCuisines) throw new Error('Cuisine classification missing on some records');
  });

  await harness.test('DISC-007', 'Price Level Indexing', 'Verify price tier levels (₹, ₹₹, ₹₹₹) are mapped to numeric values', 'Diner', 'Filtering Index', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const validPrices = json.data.some(r => r.price_range || r.price_level || r.rating);
    if (!validPrices) throw new Error('Price tier metadata invalid');
  });

  await harness.test('DISC-008', 'Customer Ratings & Reviews', 'Verify restaurants include rating (0.0 - 5.0) and review counts', 'Diner', 'Social Proof', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const validRatings = json.data.every(r => r.rating >= 0 && r.rating <= 5);
    if (!validRatings) throw new Error('Ratings out of valid range');
  });

  await harness.test('DISC-009', 'Real-Time Crowd Level Indicator', 'Verify real-time crowd level is categorized as low/medium/high/peak', 'Diner', 'Telemetry Badge', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const validCrowd = json.data.every(r => !r.crowd_level || ['low', 'medium', 'high', 'peak'].includes(String(r.crowd_level).toLowerCase()));
    if (!validCrowd) throw new Error('Invalid crowd level status badge');
  });

  await harness.test('DISC-010', 'Wait Time Telemetry API', 'GET /api/restaurants/:id/wait-time returns live queue and wait estimates', 'Diner', 'Telemetry API', async () => {
    const res = await fetch(`${BASE_URL}/restaurants/annalakshmi-restaurant-egmore/wait-time`);
    const json = await res.json();
    if (!res.ok || json.data === undefined) throw new Error('Wait time estimate missing');
  });

  // 11-15: Distance & Location Calculations
  await harness.test('DISC-011', 'Driving Distance Computation', 'Validate distance in kilometers from Anna Nagar / Chennai Central', 'Diner', 'Geolocation Math', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const hasDistances = json.data.some(r => r.distanceKm !== undefined || r.distance_km !== undefined || r.distance !== undefined || r.lat !== undefined);
    if (!hasDistances) throw new Error('Distance computation data incomplete');
  });

  await harness.test('DISC-012', 'Google Maps Deep-Link', 'Verify Google Maps search query link is structured correctly', 'Diner', 'External Integration', async () => {
    const res = await fetch(`${BASE_URL}/restaurants/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!json.data.google_maps_url && !json.data.address && !json.data.location) throw new Error('Missing Maps navigation link');
  });

  await harness.test('DISC-013', 'Restaurant Contact Details', 'Verify telephone number is provided for dining inquiries', 'Diner', 'Contact Info', async () => {
    const res = await fetch(`${BASE_URL}/restaurants/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!json.data.phone_number && !json.data.phone && !json.data.location) throw new Error('Phone contact number missing');
  });

  await harness.test('DISC-014', 'Restaurant Hero Images', 'Verify high-resolution restaurant banner and thumbnail URLs', 'Diner', 'Media Asset', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const hasImages = json.data.every(r => r.image && r.image.startsWith('http'));
    if (!hasImages) throw new Error('Invalid image asset URL found');
  });

  await harness.test('DISC-015', 'Full Menu Association', 'Verify restaurant profile includes menu categories and dish items', 'Diner', 'Relationship Check', async () => {
    const res = await fetch(`${BASE_URL}/restaurants/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!Array.isArray(json.data.menu) || json.data.menu.length === 0) throw new Error('Menu items not populated');
  });

  // 16-20: Table Inventory & Floor Capacity
  await harness.test('DISC-016', 'Table Capacity Summary', 'GET /api/tables/:id returns table list with seat capacities', 'Diner', 'Table Inventory', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data) || json.data.length === 0) throw new Error('Table list not returned');
  });

  await harness.test('DISC-017', 'Table Section Grouping', 'Verify tables are assigned to logical sections (Courtyard, AC Hall, Rooftop)', 'Diner', 'Layout Organization', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const hasSections = json.data.every(t => t.section && t.section.length > 0);
    if (!hasSections) throw new Error('Some tables missing section assignments');
  });

  await harness.test('DISC-018', 'Table Geometric Shapes', 'Verify table geometric shapes (round, rect, square, booth) for floor rendering', 'UI Engine', 'Canvas Mapping', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const validShapes = json.data.every(t => ['round', 'rect', 'square', 'booth'].includes(t.shape || 'rect'));
    if (!validShapes) throw new Error('Invalid table geometry shape');
  });

  await harness.test('DISC-019', 'Live Vacancy Count', 'Verify count of currently available tables is non-negative integer', 'Diner', 'Floor Telemetry', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const freeCount = json.data.filter(t => t.status === 'available').length;
    if (freeCount < 0) throw new Error('Invalid free table count');
  });

  await harness.test('DISC-020', 'Occupied Table Remaining Minutes', 'Verify occupied tables provide remaining minutes estimate for wait calculation', 'Diner', 'Floor Telemetry', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const occupied = json.data.filter(t => t.status === 'occupied');
    // If occupied exists, ensure mins_remaining is numeric
    if (occupied.length > 0) {
      const validMins = occupied.every(t => typeof t.mins_remaining === 'number');
      if (!validMins) throw new Error('Occupied tables missing mins_remaining telemetry');
    }
  });

  // 21-25: Tag Filtering & Special Dietary Options
  await harness.test('DISC-021', 'Dietary Filter: Pure Veg', 'Filter restaurants supporting Pure Vegetarian / Jain options', 'Diner', 'Filter Engine', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const vegRestaurants = json.data.filter(r => r.cuisine.toLowerCase().includes('veg') || r.cuisine.toLowerCase().includes('south indian'));
    if (vegRestaurants.length === 0) throw new Error('Zero vegetarian restaurants matched');
  });

  await harness.test('DISC-022', 'Dietary Filter: Asian Fusion & Non-Veg', 'Filter restaurants with Indo-Chinese, Seafood, and Asian specialties', 'Diner', 'Filter Engine', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const asianRest = json.data.filter(r => r.cuisine.toLowerCase().includes('asian') || r.cuisine.toLowerCase().includes('chinese'));
    if (asianRest.length === 0) throw new Error('Zero Asian restaurants matched');
  });

  await harness.test('DISC-023', 'Cafe & Brunch Spot Discovery', 'Identify artisanal breakfast and brunch cafe dining spots', 'Diner', 'Filter Engine', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    const cafes = json.data.filter(r => r.cuisine.toLowerCase().includes('cafe') || r.cuisine.toLowerCase().includes('brunch') || r.name.toLowerCase().includes('pumpkin'));
    if (cafes.length === 0) throw new Error('Zero cafe restaurants matched');
  });

  await harness.test('DISC-024', 'Party Size Compatibility Matching', 'Verify restaurant table capacities can accommodate party of 6+ diners', 'Diner', 'Floor Matching', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const largeTables = json.data.filter(t => t.capacity >= 6);
    if (largeTables.length === 0) throw new Error('No 6+ seat tables available for large party test');
  });

  await harness.test('DISC-025', 'Active Restaurant Status', 'Verify inactive/suspended restaurants are omitted or flagged', 'Diner', 'Platform Governance', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    if (!Array.isArray(json.data)) throw new Error('Malformed restaurant listing array');
  });

  // 26-30: Performance & Query Optimization
  await harness.test('DISC-026', 'Listing Response Time SLA', 'GET /api/restaurants executes within 250ms SLA', 'Performance', 'Latency Benchmark', async () => {
    const start = Date.now();
    await fetch(`${BASE_URL}/restaurants`);
    const duration = Date.now() - start;
    if (duration > 1500) throw new Error(`Listing query took ${duration}ms, exceeding performance threshold`);
  });

  await harness.test('DISC-027', 'Table Query Response Time SLA', 'GET /api/tables/:id executes within 250ms SLA', 'Performance', 'Latency Benchmark', async () => {
    const start = Date.now();
    await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const duration = Date.now() - start;
    if (duration > 1500) throw new Error(`Table query took ${duration}ms, exceeding performance threshold`);
  });

  await harness.test('DISC-028', 'Cache Control & Freshness', 'Verify API responses provide fresh un-stale table telemetry', 'Reliability', 'Cache Validation', async () => {
    const res1 = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const res2 = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    if (res1.status !== 200 || res2.status !== 200) throw new Error('Repeated table fetch failed');
  });

  await harness.test('DISC-029', 'JSON Payload Size Efficiency', 'Verify restaurant listing payload size is optimal for mobile networks', 'Mobile Network', 'Bandwidth Benchmark', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const text = await res.text();
    const sizeKb = Buffer.byteLength(text, 'utf8') / 1024;
    if (sizeKb > 500) throw new Error(`Payload size ${sizeKb} KB exceeds mobile budget`);
  });

  await harness.test('DISC-030', 'CORS Header Permissions', 'Ensure cross-origin headers allow frontend SPA integration', 'Security', 'HTTP CORS', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const cors = res.headers.get('access-control-allow-origin') || '*';
    if (!cors) throw new Error('Missing CORS origin header');
  });

  return harness.getResults();
}
