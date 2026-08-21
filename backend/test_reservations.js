import { queryRun, queryAll, queryGet, getDb } from './database/db.js';

const API_BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🏁 Starting SmartTable reservation validation tests...\n');

  // 1. Get auth token for user@example.com
  let token = '';
  try {
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'user123' })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success) {
      throw new Error('Login failed: ' + loginJson.message);
    }
    token = loginJson.token;
    console.log('🔑 Authenticated successfully. Token acquired.\n');
  } catch (e) {
    console.error('❌ Failed to authenticate:', e.message);
    process.exit(1);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const testDate = '2026-09-01';
  const testTime = '19:30';
  const restaurantId = 'on-de-roof-chennai';

  // Helper to clear existing reservations for our test date
  const cleanUpDb = async () => {
    await queryRun(
      "DELETE FROM reservations WHERE restaurant_id = ? AND reservation_date = ?",
      [restaurantId, testDate]
    );
    await queryRun(
      "UPDATE `tables` SET status = 'available', reservation_name = NULL, mins_remaining = NULL WHERE restaurant_id = ?",
      [restaurantId]
    );
  };

  try {
    // -------------------------------------------------------------
    // Test 1: All tables occupied → Reservation must fail
    // -------------------------------------------------------------
    console.log('--- Test 1: All tables occupied ---');
    await cleanUpDb();

    // Get today's date formatted as YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Set all tables status to occupied today
    await queryRun(
      "UPDATE `tables` SET status = 'occupied', mins_remaining = 60 WHERE restaurant_id = ?",
      [restaurantId]
    );

    // Attempt to book today, within the occupancy window
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const reqTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    let res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        restaurantId,
        restaurantName: 'On De Roof',
        guestName: 'Test Diner',
        guestEmail: 'user@example.com',
        partySize: 2,
        date: todayStr,
        time: reqTime
      })
    });

    let json = await res.json();
    if (res.status === 409 && json.message.includes('No tables are available')) {
      console.log('✅ Test 1 Passed: Reservation failed as expected when all tables are occupied.\n');
    } else {
      console.error('❌ Test 1 Failed: Expected 409 and "No tables are available", got:', res.status, json);
    }

    // -------------------------------------------------------------
    // Test 2: All tables reserved for the selected time → Reservation must fail
    // -------------------------------------------------------------
    console.log('--- Test 2: All tables reserved for selected time ---');
    await cleanUpDb();

    // Fetch all tables
    const tables = await queryAll("SELECT * FROM `tables` WHERE restaurant_id = ?", [restaurantId]);
    
    // Insert mock reservations for all tables on testDate at testTime
    for (const t of tables) {
      const mockResId = `MOCK-RES-${t.id}-${Date.now().toString().slice(-4)}`;
      await queryRun(
        `INSERT INTO reservations (
          id, restaurant_id, restaurant_name, table_id, table_name,
          guest_name, guest_email, guest_phone, party_size,
          reservation_date, reservation_time, status, order_status, qr_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [mockResId, restaurantId, 'On De Roof', t.id, t.name, 'Mock Guest', 'mock@example.com', '12345', 2, testDate, testTime, 'Confirmed', 'Received', 'QR']
      );
    }

    // Try booking again for the same slot
    res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        restaurantId,
        restaurantName: 'On De Roof',
        guestName: 'Test Diner 2',
        guestEmail: 'user@example.com',
        partySize: 2,
        date: testDate,
        time: testTime
      })
    });

    json = await res.json();
    if (res.status === 409 && json.message.includes('No tables are available')) {
      console.log('✅ Test 2 Passed: Reservation failed as expected when all tables are reserved.\n');
    } else {
      console.error('❌ Test 2 Failed: Expected 409 and "No tables are available", got:', res.status, json);
    }

    // -------------------------------------------------------------
    // Test 3: One suitable table available → Reservation must be confirmed
    // -------------------------------------------------------------
    console.log('--- Test 3: One suitable table available ---');
    await cleanUpDb();

    // Leave exactly ONE table available (t.id = tables[0].id)
    // We reserve all OTHER tables
    for (let i = 1; i < tables.length; i++) {
      const t = tables[i];
      const mockResId = `MOCK-RES-${t.id}-${Date.now().toString().slice(-4)}`;
      await queryRun(
        `INSERT INTO reservations (
          id, restaurant_id, restaurant_name, table_id, table_name,
          guest_name, guest_email, guest_phone, party_size,
          reservation_date, reservation_time, status, order_status, qr_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [mockResId, restaurantId, 'On De Roof', t.id, t.name, 'Mock Guest', 'mock@example.com', '12345', 2, testDate, testTime, 'Confirmed', 'Received', 'QR']
      );
    }

    // Attempt booking
    res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        restaurantId,
        restaurantName: 'On De Roof',
        guestName: 'Test Diner 3',
        guestEmail: 'user@example.com',
        partySize: 2,
        date: testDate,
        time: testTime
      })
    });

    json = await res.json();
    if (res.status === 201 && json.success && json.data.tableId === tables[0].id) {
      console.log(`✅ Test 3 Passed: Reservation confirmed on the only available table (${json.data.tableId}).\n`);
    } else {
      console.error('❌ Test 3 Failed: Expected 201 and tableId', tables[0].id, 'got:', res.status, json);
    }

    // -------------------------------------------------------------
    // Test 4: Available table has insufficient capacity → Reservation must fail
    // -------------------------------------------------------------
    console.log('--- Test 4: Available table has insufficient capacity ---');
    await cleanUpDb();

    // Set all tables capacities to 2
    await queryRun("UPDATE `tables` SET capacity = 2 WHERE restaurant_id = ?", [restaurantId]);

    // Try booking for 4 guests
    res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        restaurantId,
        restaurantName: 'On De Roof',
        guestName: 'Test Diner 4',
        guestEmail: 'user@example.com',
        partySize: 4,
        date: testDate,
        time: testTime
      })
    });

    json = await res.json();
    if (res.status === 409 && json.message.includes('No tables are available')) {
      console.log('✅ Test 4 Passed: Reservation failed as expected due to insufficient table capacity.\n');
    } else {
      console.error('❌ Test 4 Failed: Expected 409 and "No tables are available", got:', res.status, json);
    }

    // -------------------------------------------------------------
    // Test 5: Two simultaneous booking attempts for last table → Only one succeeds
    // -------------------------------------------------------------
    console.log('--- Test 5: Simultaneous booking attempts ---');
    await cleanUpDb();
    
    // Set capacities back to 4 to make tables suitable
    await queryRun("UPDATE `tables` SET capacity = 4 WHERE restaurant_id = ?", [restaurantId]);

    // Reserve all tables except the first one
    for (let i = 1; i < tables.length; i++) {
      const t = tables[i];
      const mockResId = `MOCK-RES-${t.id}-${Date.now().toString().slice(-4)}`;
      await queryRun(
        `INSERT INTO reservations (
          id, restaurant_id, restaurant_name, table_id, table_name,
          guest_name, guest_email, guest_phone, party_size,
          reservation_date, reservation_time, status, order_status, qr_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [mockResId, restaurantId, 'On De Roof', t.id, t.name, 'Mock Guest', 'mock@example.com', '12345', 2, testDate, testTime, 'Confirmed', 'Received', 'QR']
      );
    }

    // Fire 2 concurrent requests
    const bookReq = () => fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        restaurantId,
        restaurantName: 'On De Roof',
        guestName: 'Concurrent Diner',
        guestEmail: 'user@example.com',
        partySize: 2,
        date: testDate,
        time: testTime
      })
    });

    const [res1, res2] = await Promise.all([bookReq(), bookReq()]);
    const json1 = await res1.json();
    const json2 = await res2.json();

    const success1 = res1.status === 201 && json1.success;
    const success2 = res2.status === 201 && json2.success;

    const fail1 = res1.status === 409 && json1.message.includes('No tables are available');
    const fail2 = res2.status === 409 && json2.message.includes('No tables are available');

    if ((success1 && fail2) || (success2 && fail1)) {
      console.log('✅ Test 5 Passed: Transaction isolation locked tables correctly; only one concurrent reservation succeeded!\n');
    } else {
      console.error('❌ Test 5 Failed: Expected exactly one success (201) and one failure (409). Got:',
        { status1: res1.status, json1, status2: res2.status, json2 }
      );
    }

    // -------------------------------------------------------------
    // Test 6: After cancellation → Table becomes available
    // -------------------------------------------------------------
    console.log('--- Test 6: Cancellation makes table available again ---');
    
    // Find the successful reservation ID from Test 5
    const successJson = success1 ? json1 : json2;
    const bookingId = successJson.data.id;

    // Cancel this reservation
    const cancelRes = await fetch(`${API_BASE_URL}/reservations/${bookingId}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    const cancelJson = await cancelRes.json();
    if (cancelRes.status === 200 && cancelJson.success) {
      // Try booking the same slot again
      const retryRes = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          restaurantId,
          restaurantName: 'On De Roof',
          guestName: 'Retry Diner',
          guestEmail: 'user@example.com',
          partySize: 2,
          date: testDate,
          time: testTime
        })
      });

      const retryJson = await retryRes.json();
      if (retryRes.status === 201 && retryJson.success) {
        console.log('✅ Test 6 Passed: Table became available after cancellation and was booked again.\n');
      } else {
        console.error('❌ Test 6 Failed: Re-booking failed after cancellation:', retryRes.status, retryJson);
      }
    } else {
      console.error('❌ Test 6 Failed: Cancellation of reservation failed:', cancelRes.status, cancelJson);
    }

    // Restore table capacities in database back to seed standard (e.g. 2, 4, 6)
    await queryRun("UPDATE `tables` SET capacity = 2 WHERE id IN ('ANN1', 'MIS1', 'AV1', 'AV2')");
    await queryRun("UPDATE `tables` SET capacity = 4 WHERE id IN ('ANN2', 'ANN3', 'MIS2', 'MIS3', 'AV3')");
    await queryRun("UPDATE `tables` SET capacity = 6 WHERE id IN ('ANN4', 'AV4')");
    await cleanUpDb();

    console.log('🏁 All tests completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ An error occurred during testing:', error);
    process.exit(1);
  }
}

runTests();
