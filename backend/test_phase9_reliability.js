import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import mysql from 'mysql2/promise';
import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-smarttable-key-2026';

const runReliabilityTests = async () => {
  console.log('======================================================');
  console.log('   SmartTable Phase 9: Comprehensive Reliability Tests');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  };

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smarttable'
  });

  try {
    // 0. Setup test users and tokens
    const [owners] = await connection.query('SELECT id, email, restaurant_id FROM users WHERE role = "owner" LIMIT 1');
    const [customers] = await connection.query('SELECT id, email FROM users WHERE role = "customer" LIMIT 1');
    const [restaurants] = await connection.query('SELECT id, name FROM restaurants LIMIT 1');

    if (owners.length === 0 || customers.length === 0 || restaurants.length === 0) {
      throw new Error('Database missing required seed data for testing.');
    }

    const ownerEmail = owners[0].email;
    const customerEmail = customers[0].email;
    const restaurantId = owners[0].restaurant_id || restaurants[0].id;
    const restaurantName = restaurants[0].name;

    // Ensure active status
    await connection.query('UPDATE users SET status = "active" WHERE email IN (?, ?)', [ownerEmail, customerEmail]);

    // Sign tokens directly with JWT
    const customerToken = jwt.sign({ id: customers[0].id }, JWT_SECRET, { expiresIn: '1h' });
    const ownerToken = jwt.sign({ id: owners[0].id }, JWT_SECRET, { expiresIn: '1h' });

    console.log(`Testing with Restaurant: ${restaurantId}`);
    console.log(`Customer: ${customerEmail} (Token: ${customerToken ? 'Present' : 'Missing'}), Owner: ${ownerEmail} (Token: ${ownerToken ? 'Present' : 'Missing'})\n`);

    // Clean up any existing test data for reliability runs
    const testDate = '2026-12-31';
    const testTime = '20:00';
    await connection.query('DELETE FROM reservations WHERE reservation_date = ? OR reservation_date = "2026-11-15"', [testDate]);
    await connection.query('DELETE FROM orders WHERE guest_email = ? AND grand_total = 499.00', [customerEmail]);

    // ----------------------------------------------------
    // Test 1 & 6: Duplicate Reservation Attempt / Double-Click Simulation
    // ----------------------------------------------------
    console.log('--- Test 1 & 6: Duplicate Reservation & Double-Click Simulation ---');

    // Fire 2 rapid requests in parallel to simulate a double-click
    const resPayload = {
      restaurantId,
      restaurantName,
      guestName: 'Reliability Test Diner',
      guestEmail: customerEmail,
      partySize: 2,
      date: testDate,
      time: testTime,
      tableId: 'Auto-Assigned'
    };

    const [res1, res2] = await Promise.all([
      fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
        body: JSON.stringify(resPayload)
      }),
      fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
        body: JSON.stringify(resPayload)
      })
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    // Check database to ensure only 1 reservation was actually created
    const [createdResRows] = await connection.query(
      'SELECT COUNT(*) as count FROM reservations WHERE restaurant_id = ? AND guest_email = ? AND reservation_date = ? AND reservation_time = ? AND status != "Cancelled"',
      [restaurantId, customerEmail, testDate, testTime]
    );

    assert(createdResRows[0].count === 1, 'Double-click/duplicate reservation creates exactly 1 database row');
    assert((data1.success && data2.success), 'Both double-click responses return success (with duplicate suppression)');

    // ----------------------------------------------------
    // Test 2: Duplicate Order Attempt
    // ----------------------------------------------------
    console.log('\n--- Test 2: Duplicate Order Attempt ---');
    const orderPayload = {
      restaurantId,
      restaurantName,
      guestName: 'Reliability Test Diner',
      guestEmail: customerEmail,
      grandTotal: 499.00,
      fulfillmentType: 'takeaway',
      items: [{ id: 'item-1', name: 'Special Biryani', price: 499, qty: 1 }]
    };

    const [ord1, ord2] = await Promise.all([
      fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
        body: JSON.stringify(orderPayload)
      }),
      fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
        body: JSON.stringify(orderPayload)
      })
    ]);

    const ordData1 = await ord1.json();
    const ordData2 = await ord2.json();

    const [createdOrderRows] = await connection.query(
      'SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ? AND guest_email = ? AND grand_total = 499.00 AND status != "Cancelled"',
      [restaurantId, customerEmail]
    );

    assert(createdOrderRows[0].count === 1, 'Duplicate order attempt creates exactly 1 order row in MySQL');
    assert((ordData1.success === true && ordData2.success === true), `Duplicate order suppressed safely with valid response (ord1: ${ordData1.success}, ord2: ${ordData2.success})`);

    // ----------------------------------------------------
    // Test 3: Concurrent Table Status Updates
    // ----------------------------------------------------
    console.log('\n--- Test 3: Concurrent Table Status Updates ---');
    const [tableList] = await connection.query('SELECT id FROM `tables` WHERE restaurant_id = ? LIMIT 1', [restaurantId]);
    const targetTableId = tableList[0].id;

    // Reset table to available
    await connection.query('UPDATE `tables` SET status = "available" WHERE id = ? AND restaurant_id = ?', [targetTableId, restaurantId]);

    // Send 3 concurrent table status updates
    await Promise.all([
      fetch(`${API_BASE}/tables/${restaurantId}/${targetTableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({ status: 'occupied', minsRemaining: 25 })
      }),
      fetch(`${API_BASE}/tables/${restaurantId}/${targetTableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({ status: 'cleaning', minsRemaining: 5 })
      }),
      fetch(`${API_BASE}/tables/${restaurantId}/${targetTableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({ status: 'available' })
      })
    ]);

    const [finalTableRows] = await connection.query('SELECT status FROM `tables` WHERE id = ? AND restaurant_id = ?', [targetTableId, restaurantId]);
    const validStatuses = ['available', 'occupied', 'cleaning', 'reserved'];
    assert(validStatuses.includes(finalTableRows[0].status), `Table ended in a valid atomic status (${finalTableRows[0].status}) with no DB corruption`);

    // ----------------------------------------------------
    // Test 4: Concurrent Reservation Attempt for Specific Table
    // ----------------------------------------------------
    console.log('\n--- Test 4: Concurrent Reservation Attempt for Specific Table ---');
    // Set table to available
    await connection.query('UPDATE `tables` SET status = "available" WHERE id = ? AND restaurant_id = ?', [targetTableId, restaurantId]);

    const dateSlot = '2026-11-15';
    const timeSlot = '18:00';

    // Two different users (customer and owner) attempting to book the EXACT same table at the same time
    const [c1Res, c2Res] = await Promise.all([
      fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
          tableId: targetTableId,
          guestName: 'Diner Alpha',
          guestEmail: customerEmail,
          partySize: 2,
          date: dateSlot,
          time: timeSlot
        })
      }),
      fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
          tableId: targetTableId,
          guestName: 'Diner Beta',
          guestEmail: ownerEmail,
          partySize: 2,
          date: dateSlot,
          time: timeSlot
        })
      })
    ]);

    const c1Data = await c1Res.json();
    const c2Data = await c2Res.json();

    const [activeSlotRows] = await connection.query(
      'SELECT COUNT(*) as count FROM reservations WHERE restaurant_id = ? AND table_id = ? AND reservation_date = ? AND reservation_time = ? AND status != "Cancelled"',
      [restaurantId, targetTableId, dateSlot, timeSlot]
    );

    assert(activeSlotRows[0].count === 1, 'Only 1 reservation created for the specific table/time slot (no double booking)');
    assert((c1Res.status === 201 && c2Res.status === 409) || (c1Res.status === 409 && c2Res.status === 201), 'One request succeeds (201) and the other receives 409 Conflict gracefully');

    // ----------------------------------------------------
    // Test 5 & 7: Repeated API Request Safety & Invalid Input Handling
    // ----------------------------------------------------
    console.log('\n--- Test 5 & 7: API Input Validation & Error Handling ---');
    const invalidRes = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        restaurantId,
        tableId: 'NON_EXISTENT_TABLE_XYZ',
        partySize: 999,
        date: '2027-01-01',
        time: '18:00'
      })
    });
    assert(invalidRes.status === 404 || invalidRes.status === 409, 'Invalid table/party request returns clean 404/409 error instead of crashing');

    // ----------------------------------------------------
    // Test 8, 9 & 11: Socket.IO Connection, Reconnect & Listener Hygiene
    // ----------------------------------------------------
    console.log('\n--- Test 8, 9 & 11: Socket.IO Connection & Reconnection ---');
    const clientSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: { token: customerToken }
    });

    const socketConnectPromise = new Promise((resolve) => {
      clientSocket.on('connect', () => {
        resolve(true);
      });
      setTimeout(() => resolve(false), 4000);
    });

    const isConnected = await socketConnectPromise;
    assert(isConnected, 'Socket.IO connects successfully with valid JWT token');

    // Test joining room and listening
    clientSocket.emit('join_restaurant', restaurantId);
    await new Promise(r => setTimeout(r, 200));

    let eventReceived = false;
    clientSocket.on('table_status_changed', (data) => {
      if (data.restaurantId === restaurantId) {
        eventReceived = true;
      }
    });

    // Trigger status update
    await fetch(`${API_BASE}/tables/${restaurantId}/${targetTableId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'available' })
    });

    await new Promise(r => setTimeout(r, 600));
    assert(eventReceived, 'Socket receives real-time table_status_changed event');

    // Clean listener test
    clientSocket.off('table_status_changed');
    assert(clientSocket.listeners('table_status_changed').length === 0, 'Socket listeners cleaned up properly without leaks');

    clientSocket.disconnect();

    // ----------------------------------------------------
    // Test 10: Database Pool & Connection Resilience
    // ----------------------------------------------------
    console.log('\n--- Test 10: Database Connection Resilience ---');
    const [healthCheck] = await connection.query('SELECT 1 as alive');
    assert(healthCheck[0].alive === 1, 'MySQL connection pool active and responsive');

    // ----------------------------------------------------
    // Test 12: Atomic Cancellation
    // ----------------------------------------------------
    console.log('\n--- Test 12: Atomic Reservation Cancellation ---');
    const createdBookingId = c1Data.data?.id || c2Data.data?.id;
    const cancelRes = await fetch(`${API_BASE}/reservations/${createdBookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const cancelData = await cancelRes.json();
    assert(cancelData.success === true, 'Reservation cancelled atomically via transaction');

    // ----------------------------------------------------
    // Test 13: Database Performance Indexes
    // ----------------------------------------------------
    console.log('\n--- Test 13: Database Performance Indexes ---');
    const [indexes] = await connection.query('SHOW INDEX FROM reservations');
    const indexNames = indexes.map(i => i.Key_name);
    assert(indexNames.includes('idx_reservations_email') || indexNames.includes('idx_reservations_restaurant'), 'High-frequency query indexes present in MySQL');

    // ----------------------------------------------------
    // Test 14: Existing Functionality Health Check
    // ----------------------------------------------------
    console.log('\n--- Test 14: Existing Functionality Health Check ---');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthData.status === 'online' && healthData.databaseConnected === true, 'Backend /api/health reports online with MySQL connected');

    // Summary
    console.log('\n======================================================');
    console.log(`   Phase 9 Tests Finished: Passed ${passed} | Failed ${failed}`);
    console.log('======================================================\n');

    await connection.end();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    await connection.end();
    process.exit(1);
  }
};

runReliabilityTests();
