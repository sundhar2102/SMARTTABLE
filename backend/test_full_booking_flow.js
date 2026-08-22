import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { getDb } from './database/db.js';
import jwt from 'jsonwebtoken';
import assert from 'assert';

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'smarttable_super_secret_jwt_key_2026';

async function runFullBookingFlowTest() {
  console.log('======================================================');
  console.log('   SmartTable Full End-to-End Booking Flow Validation');
  console.log('======================================================\n');

  const db = await getDb();
  const conn = await db.getConnection();

  try {
    const customerEmail = `e2e_diner_${Date.now()}@smarttable.in`;
    const ownerEmail = `e2e_owner_${Date.now()}@smarttable.in`;
    const restaurantId = 'annalakshmi-restaurant-egmore';
    const customerId = `USR-DIN-${Date.now()}`;
    const ownerId = `USR-OWN-${Date.now()}`;

    // Create test customer & test owner bound to kayal-seafood-chennai
    await conn.query(
      'INSERT INTO users (id, name, email, role, password_hash, status, is_verified, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, 1, NULL)',
      [customerId, 'Test Diner', customerEmail, 'customer', 'hash', 'active']
    );

    await conn.query(
      'INSERT INTO users (id, name, email, role, password_hash, status, is_verified, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
      [ownerId, 'Kayal Owner', ownerEmail, 'owner', 'hash', 'active', restaurantId]
    );

    const customerToken = jwt.sign({ id: customerId, role: 'customer', email: customerEmail }, JWT_SECRET, { expiresIn: '1h' });
    const ownerToken = jwt.sign({ id: ownerId, role: 'owner', email: ownerEmail, restaurantId }, JWT_SECRET, { expiresIn: '1h' });

    // Clean up any old test reservations for these test dates
    await conn.query('DELETE FROM reservations WHERE guest_email IN (?, ?)', [customerEmail, ownerEmail]);

    console.log(`[SETUP] Customer: ${customerEmail}, Owner: ${ownerEmail}, Venue: ${restaurantId}`);

    // --- STEP 1: Customer creates booking ---
    console.log('\n--- Step 1: Customer Creates Booking ---');
    const bookingRes = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        restaurantId,
        restaurantName: 'Kayal Seafood Chennai',
        guestName: 'Test Diner',
        guestEmail: customerEmail,
        guestPhone: '+91 98400 12345',
        partySize: 4,
        date: '2026-08-25',
        time: '19:30',
        specialRequests: 'Window seat please'
      })
    });

    const bookingJson = await bookingRes.json();
    console.log('bookingJson:', JSON.stringify(bookingJson, null, 2));
    assert.strictEqual(bookingRes.status, 201, 'Booking creation should return 201');
    assert.strictEqual(bookingJson.success, true);
    assert.strictEqual(bookingJson.data.status, 'Pending', 'Initial status MUST be Pending');
    const bookingId = bookingJson.data.id;
    console.log(`[PASS] Booking created successfully in MySQL database: ${bookingId} (Status: ${bookingJson.data.status})`);

    // Verify row in MySQL database directly
    const [dbRows] = await conn.query('SELECT * FROM reservations WHERE id = ?', [bookingId]);
    assert.strictEqual(dbRows.length, 1);
    assert.strictEqual(dbRows[0].status, 'Pending');
    assert.strictEqual(dbRows[0].restaurant_id, restaurantId);
    console.log('[PASS] Verified MySQL DB record contains correct IDs and status=Pending');

    // --- STEP 2: Owner views pending request & ACCEPTS ---
    console.log('\n--- Step 2: Owner Dashboard Views & Accepts Booking ---');
    const ownerFetchRes = await fetch(`${API_BASE}/reservations?restaurantId=${restaurantId}`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const ownerFetchJson = await ownerFetchRes.json();
    assert.strictEqual(ownerFetchJson.success, true);
    const foundPending = ownerFetchJson.data.find(r => r.id === bookingId);
    assert.ok(foundPending, 'Owner must receive the customer booking request');
    assert.strictEqual(foundPending.status, 'Pending');
    console.log(`[PASS] Owner received booking request ${bookingId} under Pending Booking Requests`);

    // Owner accepts booking
    const acceptRes = await fetch(`${API_BASE}/reservations/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const acceptJson = await acceptRes.json();
    assert.strictEqual(acceptJson.success, true);
    assert.strictEqual(acceptJson.data.status, 'Confirmed');
    console.log(`[PASS] Owner clicked ACCEPT -> Booking status updated to Confirmed in DB`);

    // --- STEP 3: Customer sees updated status ---
    console.log('\n--- Step 3: Customer Views Updated Status ---');
    const custFetchRes = await fetch(`${API_BASE}/reservations?email=${customerEmail}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const custFetchJson = await custFetchRes.json();
    const custBooking = custFetchJson.data.find(r => r.id === bookingId);
    assert.ok(custBooking);
    assert.strictEqual(custBooking.status, 'Confirmed');
    console.log(`[PASS] Customer dashboard reflects updated status: ${custBooking.status}`);

    // --- STEP 4: Test Reject Scenario ---
    console.log('\n--- Step 4: Customer Creates 2nd Booking & Owner REJECTS ---');
    const booking2Res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        restaurantId,
        restaurantName: 'Kayal Seafood Chennai',
        guestName: 'Test Diner',
        guestEmail: customerEmail,
        partySize: 2,
        date: '2026-08-26',
        time: '20:00'
      })
    });
    const booking2Json = await booking2Res.json();
    const booking2Id = booking2Json.data.id;

    // Owner rejects
    const rejectRes = await fetch(`${API_BASE}/reservations/${booking2Id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'Rejected', reason: 'Table full' })
    });
    const rejectJson = await rejectRes.json();
    assert.strictEqual(rejectJson.data.status, 'Rejected');

    // Customer checks status
    const custFetch2Res = await fetch(`${API_BASE}/reservations?email=${customerEmail}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const custFetch2Json = await custFetch2Res.json();
    const custBooking2 = custFetch2Json.data.find(r => r.id === booking2Id);
    assert.strictEqual(custBooking2.status, 'Rejected');
    console.log(`[PASS] Reject flow verified: Customer sees REJECTED status in My Bookings`);

    // Clean up test users & reservations
    await conn.query('DELETE FROM reservations WHERE id IN (?, ?)', [bookingId, booking2Id]);
    await conn.query('DELETE FROM users WHERE id IN (?, ?)', [customerId, ownerId]);

    console.log('\n======================================================');
    console.log('   ALL END-TO-END BOOKING FLOW TESTS PASSED! 🚀');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ E2E BOOKING TEST FAILED:', err);
  } finally {
    try { conn.release(); } catch (e) {}
    process.exit(0);
  }
}

runFullBookingFlowTest();
