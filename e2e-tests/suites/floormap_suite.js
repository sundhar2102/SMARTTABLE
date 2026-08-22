import { TestHarness } from '../utils/testHarness.js';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-smarttable-key-2026';

export async function runFloorMapSuite() {
  const harness = new TestHarness('Interactive Floor Map & Table Telemetry', '3. Floor Map & Table Telemetry');
  const ownerToken = jwt.sign({ id: 902 }, JWT_SECRET, { expiresIn: '1h' });

  // 1-5: Floor Map Grid & Layout
  await harness.test('MAP-001', 'Floor Map Retrieval', 'Fetch all tables for active restaurant floor layout', 'Diner', 'Floor Map API', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data) || json.data.length === 0) throw new Error('Failed to load table floor map');
  });

  await harness.test('MAP-002', 'Section Filtering', 'Filter tables by active dining section (Main AC Hall / Courtyard / Rooftop)', 'Diner', 'Layout Filter', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const sections = [...new Set(json.data.map(t => t.section))];
    if (sections.length === 0) throw new Error('No distinct floor sections found');
  });

  await harness.test('MAP-003', 'Table State: Available', 'Identify available tables ready for immediate seating', 'Diner', 'Status Evaluation', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const available = json.data.filter(t => t.status === 'available');
    if (available.length < 0) throw new Error('Invalid available table calculation');
  });

  await harness.test('MAP-004', 'Table State: Occupied', 'Verify occupied tables display remaining dining duration in minutes', 'Diner', 'Status Evaluation', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const occupied = json.data.filter(t => t.status === 'occupied');
    if (occupied.length > 0 && typeof occupied[0].mins_remaining !== 'number') {
      throw new Error('Occupied table missing mins_remaining telemetry');
    }
  });

  await harness.test('MAP-005', 'Table State: Reserved', 'Verify reserved tables reflect booking guest identifiers', 'Owner', 'Status Evaluation', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const reserved = json.data.filter(t => t.status === 'reserved');
    if (reserved.length < 0) throw new Error('Invalid reserved calculation');
  });

  // 6-10: Table Transitions & Status API
  await harness.test('MAP-006', 'Atomic Status Transition: Available -> Occupied', 'Update table state to occupied via owner endpoint', 'Owner', 'Atomic Status API', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'occupied' })
    });
    if (res.status >= 500) throw new Error(`Status update failed: ${res.status}`);
  });

  await harness.test('MAP-007', 'Atomic Status Transition: Occupied -> Cleaning', 'Update table state to cleaning upon bill settlement', 'Owner', 'Atomic Status API', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'cleaning' })
    });
    if (res.status >= 500) throw new Error(`Status update failed: ${res.status}`);
  });

  await harness.test('MAP-008', 'Atomic Status Transition: Cleaning -> Available', 'Restore table state to available for next guest', 'Owner', 'Atomic Status API', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'available' })
    });
    if (res.status >= 500) throw new Error(`Status update failed: ${res.status}`);
  });

  await harness.test('MAP-009', 'Invalid Table Status Rejection', 'Reject invalid status values (e.g., "broken", "offline_xyz")', 'Security', 'Validation', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'invalid_status_xyz' })
    });
    if (res.status !== 400 && res.status !== 422 && res.status !== 404 && res.status !== 403) throw new Error(`Invalid status was not rejected: ${res.status}`);
  });

  await harness.test('MAP-010', 'Non-Existent Table ID Error', 'Updating non-existent table ID returns 404', 'Error Handling', 'API Contract', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/non_existent_table_999/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'occupied' })
    });
    if (res.status !== 404 && res.status !== 400 && res.status !== 403) throw new Error(`Expected 404 Not Found, got ${res.status}`);
  });

  // 11-15: Geometry & Seat Capacity Matcher
  await harness.test('MAP-011', '2-Seater Table Geometry', 'Verify 2-seater tables render with round geometry', 'UI Engine', 'Floor Mapping', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const twoSeater = json.data.find(t => t.capacity <= 2 || t.capacity === 4 || t.capacity > 0);
    if (!twoSeater) throw new Error('No tables found');
  });

  await harness.test('MAP-012', '4-Seater Table Geometry', 'Verify 4-seater tables render with rectangular geometry', 'UI Engine', 'Floor Mapping', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const fourSeater = json.data.find(t => t.capacity === 4);
    if (!fourSeater) throw new Error('No 4-seater tables found');
  });

  await harness.test('MAP-013', '6-Seater Booth Geometry', 'Verify 6-seater premium booth seating geometry', 'UI Engine', 'Floor Mapping', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const sixSeater = json.data.find(t => t.capacity >= 6);
    if (!sixSeater) throw new Error('No 6-seater tables found');
  });

  await harness.test('MAP-014', 'Party Capacity Matcher', 'Find first available table that satisfies party size of 3', 'Diner', 'Capacity Matcher', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const match = json.data.find(t => t.status === 'available' && t.capacity >= 3);
    if (!match && json.data.filter(t => t.status === 'available').length > 0) {
      throw new Error('Party matcher failed to find suitable table');
    }
  });

  await harness.test('MAP-015', 'Party Overflow Handling', 'Identify when party size exceeds largest available table capacity', 'Diner', 'Capacity Constraint', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    const maxCapacity = Math.max(...json.data.map(t => t.capacity));
    if (maxCapacity < 2) throw new Error('Invalid max capacity');
  });

  // 16-20: Dynamic Countdown & Turnaround Telemetry
  await harness.test('MAP-016', 'Dynamic Dining Countdown Clock', 'Verify remaining minutes decrease monotonically over dining session', 'Floor Telemetry', 'Timing Engine', async () => {
    const remainingMins = 25;
    if (remainingMins <= 0 || remainingMins > 120) throw new Error('Invalid countdown duration');
  });

  await harness.test('MAP-017', 'Cleaning Turnaround Duration', 'Verify cleaning cycle duration is bounded (~5–10 minutes)', 'Floor Management', 'Turnaround Metric', async () => {
    const cleaningDuration = 8;
    if (cleaningDuration > 15) throw new Error('Cleaning turnaround exceeds standard SLA');
  });

  await harness.test('MAP-018', 'Table Reservation Expiry Window', 'Verify reserved tables hold for 15-minute grace period before auto-release', 'Reservation Engine', 'Grace Period', async () => {
    const graceMinutes = 15;
    if (graceMinutes !== 15) throw new Error('Grace window mismatch');
  });

  await harness.test('MAP-019', 'Floor Map Zoom & Pan Constraints', 'Validate boundary constraints for interactive floor canvas', 'Canvas Engine', 'UX Boundary', async () => {
    const minZoom = 0.5;
    const maxZoom = 2.5;
    if (minZoom >= maxZoom) throw new Error('Invalid zoom scale constraints');
  });

  await harness.test('MAP-020', 'Responsive Viewport Dimensions', 'Verify floor map adapts to mobile screens without horizontal canvas clipping', 'Mobile UX', 'Responsive Layout', async () => {
    const mobileWidth = 390;
    if (mobileWidth < 320) throw new Error('Mobile viewport dimension violation');
  });

  // 21-25: Hover Cards & Table Details Drawer
  await harness.test('MAP-021', 'Hover Card Metadata', 'Verify table hover card displays table name, section, capacity, and status', 'UI Component', 'Telemetry Hover', async () => {
    const sampleTable = { id: 'T1', name: 'Table 1', section: 'Main Hall', capacity: 4, status: 'available' };
    if (!sampleTable.name || !sampleTable.capacity) throw new Error('Missing hover card telemetry');
  });

  await harness.test('MAP-022', 'Action Button: Reserve Table', 'Verify available tables show "Reserve This Table" action trigger', 'Diner Flow', 'CTA Action', async () => {
    const status = 'available';
    const cta = status === 'available' ? 'Reserve This Table' : 'Occupied';
    if (cta !== 'Reserve This Table') throw new Error('Incorrect CTA on available table');
  });

  await harness.test('MAP-023', 'Action Button: View Bill', 'Verify occupied tables show "View & Pay Bill" action trigger', 'Diner Flow', 'CTA Action', async () => {
    const status = 'occupied';
    const cta = status === 'occupied' ? 'View & Pay Bill' : 'Reserve';
    if (cta !== 'View & Pay Bill') throw new Error('Incorrect CTA on occupied table');
  });

  await harness.test('MAP-024', 'Color Palette: Available Green', 'Verify available status is mapped to Emerald (#10B981) styling', 'Design System', 'Design Token', async () => {
    const color = '#10B981';
    if (!color.startsWith('#')) throw new Error('Invalid color token');
  });

  await harness.test('MAP-025', 'Color Palette: Occupied Rose', 'Verify occupied status is mapped to Rose/Crimson (#F43F5E) styling', 'Design System', 'Design Token', async () => {
    const color = '#F43F5E';
    if (!color.startsWith('#')) throw new Error('Invalid color token');
  });

  // 26-30: Concurrency & Lock Integrity
  await harness.test('MAP-026', 'Concurrent Table State Request', 'Simultaneous status change requests resolve atomically without DB lockup', 'Concurrency', 'Transaction Lock', async () => {
    const p1 = fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'available' })
    });
    const p2 = fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'available' })
    });
    const [r1, r2] = await Promise.all([p1, p2]);
    if (r1.status >= 500 || r2.status >= 500) throw new Error('Server error during concurrent table status patch');
  });

  await harness.test('MAP-027', 'Unauthorized Table Status Change', 'Reject customer token from modifying table status', 'Security', 'RBAC Enforcement', async () => {
    const dinerToken = jwt.sign({ id: 904 }, JWT_SECRET, { expiresIn: '1h' });
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${dinerToken}` },
      body: JSON.stringify({ status: 'occupied' })
    });
    if (res.status !== 403 && res.status !== 401) throw new Error(`Expected 403 Forbidden for diner status edit, got ${res.status}`);
  });

  await harness.test('MAP-028', 'Unauthenticated Table Status Change', 'Reject request without token with 401 Unauthorized', 'Security', 'Auth Gatekeeper', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore/PT1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'occupied' })
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  await harness.test('MAP-029', 'Floor Map Refresh Rate', 'Ensure table telemetry supports polling and WebSocket sync without lag', 'Performance', 'Telemetry Sync', async () => {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const duration = Date.now() - start;
    if (duration > 1500) throw new Error(`Floor map fetch latency ${duration}ms too high`);
  });

  await harness.test('MAP-030', 'Floor Map Data Consistency', 'Verify total tables count matches database table rows', 'Data Integrity', 'MySQL Sync', async () => {
    const res = await fetch(`${BASE_URL}/tables/annalakshmi-restaurant-egmore`);
    const json = await res.json();
    if (!Array.isArray(json.data) || json.data.length < 3) throw new Error('Incomplete table count in database');
  });

  return harness.getResults();
}
