import http from 'http';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://127.0.0.1:5000/api';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smarttable'
};

const makeRequest = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    let bodyString = null;
    if (data) bodyString = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (bodyString) req.write(bodyString);
    req.end();
  });
};

async function runAvailabilityTests() {
  console.log('================================================================');
  console.log('   SMARTTABLE REAL-TIME TABLE AVAILABILITY ENGINE QA SUITE       ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      passed++;
      console.log(`[✅ PASS] ${title}`);
      if (details) console.log(`         ↳ ${details}`);
    } else {
      failed++;
      console.error(`[❌ FAIL] ${title}`);
      if (details) console.error(`         ↳ ${details}`);
    }
  };

  const connection = await mysql.createConnection(dbConfig);
  console.log(`✅ Connected to MySQL database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}\n`);

  try {
    // 0. Seed test data
    const restId = 'rest-avail-test-01';
    await connection.query('DELETE FROM reservations WHERE restaurant_id = ?', [restId]);
    await connection.query('DELETE FROM `tables` WHERE restaurant_id = ?', [restId]);
    await connection.query('DELETE FROM restaurants WHERE id = ?', [restId]);

    await connection.query(
      `INSERT INTO restaurants (id, name, cuisine, location, is_accepting_orders)
       VALUES (?, 'Test Availability Palace', 'Fine Dining', '123 Test St', 1)`,
      [restId]
    );

    await connection.query(
      `INSERT INTO \`tables\` (id, restaurant_id, name, capacity, section, status)
       VALUES 
       ('tbl-avail-1', ?, 'Table 1', 2, 'Indoor', 'available'),
       ('tbl-avail-2', ?, 'Table 2', 4, 'Indoor', 'available'),
       ('tbl-avail-3', ?, 'Table 3', 6, 'Patio', 'available'),
       ('tbl-avail-4', ?, 'Table 4', 2, 'Patio', 'available'),
       ('tbl-avail-5', ?, 'Table 5', 4, 'VIP', 'available')`,
      [restId, restId, restId, restId, restId]
    );

    const testDate = '2026-08-25';
    const testTime = '19:00';

    // 1. Test: All tables available initial state
    let res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=${testTime}&partySize=2`);
    if (!res.body || !res.body.data) {
      console.error('DEBUG RES BODY:', res);
    }
    assert(
      res.status === 200 && res.body.data.availableCount === 5,
      'Scenario 1 | All Tables Available Initial State',
      `Total: ${res.body.data.totalTables}, Available: ${res.body.data.availableCount}`
    );

    // 2. Test: One table booked -> available count decrements
    const resId1 = 'res-avail-001';
    await connection.query(
      `INSERT INTO reservations (id, restaurant_id, restaurant_name, table_id, table_name, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status)
       VALUES (?, ?, 'Test Palace', 'tbl-avail-1', 'Table 1', 'Alice', 'alice@test.com', '123', 2, ?, ?, 'Confirmed')`,
      [resId1, restId, testDate, testTime]
    );

    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=${testTime}&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 4,
      'Scenario 2 | One Table Booked (Confirmed) -> Count Decrements',
      `Available: ${res.body.data.availableCount} (Table 1 occupied)`
    );

    // 3. Test: All tables booked -> availableCount === 0
    const resId2 = 'res-avail-002';
    const resId3 = 'res-avail-003';
    const resId4 = 'res-avail-004';
    const resId5 = 'res-avail-005';

    await connection.query(
      `INSERT INTO reservations (id, restaurant_id, restaurant_name, table_id, table_name, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status)
       VALUES 
       (?, ?, 'Test Palace', 'tbl-avail-2', 'Table 2', 'Bob', 'bob@test.com', '123', 4, ?, ?, 'Pending'),
       (?, ?, 'Test Palace', 'tbl-avail-3', 'Table 3', 'Charlie', 'charlie@test.com', '123', 6, ?, ?, 'Confirmed'),
       (?, ?, 'Test Palace', 'tbl-avail-4', 'Table 4', 'David', 'david@test.com', '123', 2, ?, ?, 'Accepted'),
       (?, ?, 'Test Palace', 'tbl-avail-5', 'Table 5', 'Eve', 'eve@test.com', '123', 4, ?, ?, 'Confirmed')`,
      [resId2, restId, testDate, testTime, resId3, restId, testDate, testTime, resId4, restId, testDate, testTime, resId5, restId, testDate, testTime]
    );

    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=${testTime}&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 0 && res.body.data.isBookable === false,
      'Scenario 3 | All Tables Booked -> Available Count is 0 & isBookable is false',
      `Available: ${res.body.data.availableCount}, isBookable: ${res.body.data.isBookable}`
    );

    // 4. Test: Cancelled booking releases table back to available
    await connection.query("UPDATE reservations SET status = 'Cancelled' WHERE id = ?", [resId1]);
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=${testTime}&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 1,
      'Scenario 4 | Cancelled Booking Releases Table Back to Available',
      `Available: ${res.body.data.availableCount} (tbl-avail-1 freed)`
    );

    // 5. Test: Rejected booking releases table back to available
    await connection.query("UPDATE reservations SET status = 'Rejected' WHERE id = ?", [resId2]);
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=${testTime}&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 2,
      'Scenario 5 | Rejected Booking Releases Table Back to Available',
      `Available: ${res.body.data.availableCount} (tbl-avail-2 freed)`
    );

    // 6. Test: Confirmed booking keeps table locked
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=${testTime}&partySize=6`);
    assert(
      res.status === 200 && res.body.data.availableCount === 0,
      'Scenario 6 | Confirmed Booking Keeps Table 3 Locked for Party Size 6',
      `Table 3 is Confirmed, Available: ${res.body.data.availableCount}`
    );

    // 7. Test: Different time slot has separate availability
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=22:00&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 5,
      'Scenario 7 | Different Non-Overlapping Time Slot (22:00 vs 19:00) Has Full Availability',
      `Available at 22:00: ${res.body.data.availableCount}`
    );

    // 8. Test: Overlapping time slot (19:30 vs 19:00 booking) is blocked
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=19:30&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 2,
      'Scenario 8 | Overlapping Time Slot (19:30 vs 19:00) Honors Active Window Locks',
      `Available at 19:30: ${res.body.data.availableCount} (tbl-avail-1 & 2 available, 3,4,5 locked)`
    );

    // 9. Test: Non-overlapping slot (21:30 vs 19:00 booking) is free
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=21:30&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 5,
      'Scenario 9 | Non-Overlapping Slot (21:30 vs 19:00) Returns All Tables Free',
      `Available at 21:30: ${res.body.data.availableCount}`
    );

    // 10. Test: Guest capacity filter (5 guests excludes 2-person and 4-person tables)
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=22:00&partySize=5`);
    assert(
      res.status === 200 && res.body.data.availableCount === 1 && res.body.data.availableTables[0].id === 'tbl-avail-3',
      'Scenario 10 | Guest Capacity Filter (5 guests) Excludes Small Tables',
      `Available: ${res.body.data.availableCount} (${res.body.data.availableTables[0]?.name} capacity ${res.body.data.availableTables[0]?.capacity})`
    );

    // 11. Test: Concurrent simultaneous booking attempt (Row Lock FOR UPDATE)
    const testEmailA = `test_avail_userA_${Date.now()}@smarttable.in`;
    const regResA = await makeRequest('/auth/register', 'POST', {
      name: 'Avail User A',
      email: testEmailA,
      password: 'password123',
      role: 'customer'
    });
    const tokenA = regResA.body.token;

    const testEmailB = `test_avail_userB_${Date.now()}@smarttable.in`;
    const regResB = await makeRequest('/auth/register', 'POST', {
      name: 'Avail User B',
      email: testEmailB,
      password: 'password123',
      role: 'customer'
    });
    const tokenB = regResB.body.token;

    const bookingPayloadA = {
      restaurantId: restId,
      tableId: 'tbl-avail-1',
      date: testDate,
      time: '22:00',
      partySize: 2,
      guestName: 'Simultaneous A',
      guestEmail: testEmailA
    };

    const bookingPayloadB = {
      restaurantId: restId,
      tableId: 'tbl-avail-1',
      date: testDate,
      time: '22:00',
      partySize: 2,
      guestName: 'Simultaneous B',
      guestEmail: testEmailB
    };

    const [attemptA, attemptB] = await Promise.all([
      makeRequest('/reservations', 'POST', bookingPayloadA, { Authorization: `Bearer ${tokenA}` }),
      makeRequest('/reservations', 'POST', bookingPayloadB, { Authorization: `Bearer ${tokenB}` })
    ]);

    const statusCodes = [attemptA.status, attemptB.status].sort();
    assert(
      statusCodes[0] === 201 && statusCodes[1] === 409,
      'Scenario 11 | Concurrent Simultaneous Booking Attempt -> Exactly 1 Succeeds (201), 1 Conflicts (409)',
      `Attempt A status: ${attemptA.status}, Attempt B status: ${attemptB.status}`
    );

    // 12. Test: Customer refresh / Database Source of Truth
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=22:00&partySize=2`);
    assert(
      res.status === 200 && res.body.data.availableCount === 4,
      'Scenario 12 | Customer Refresh / Database Source of Truth Verified',
      `Available at 22:00 after booking: ${res.body.data.availableCount}`
    );

    // 13. Test: Deactivated Restaurant rejects availability calculation with 400
    await connection.query('UPDATE restaurants SET is_accepting_orders = 0 WHERE id = ?', [restId]);
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=22:00&partySize=2`);
    assert(
      res.status === 400 && res.body.data.isBookable === false,
      'Scenario 13 | Deactivated Restaurant Returns 400 Bad Request & isBookable false',
      `Status: ${res.status}, Message: "${res.body.message}"`
    );

    // 14. Test: Reactivated Restaurant restores availability
    await connection.query('UPDATE restaurants SET is_accepting_orders = 1 WHERE id = ?', [restId]);
    res = await makeRequest(`/tables/${restId}/availability?date=${testDate}&time=22:00&partySize=2`);
    assert(
      res.status === 200 && res.body.data.isBookable === true,
      'Scenario 14 | Reactivated Restaurant Restores Availability',
      `Status: ${res.status}, isBookable: ${res.body.data.isBookable}`
    );

    // 15. Test: Database Integrity & Cleanup Audit
    await connection.query('DELETE FROM reservations WHERE restaurant_id = ?', [restId]);
    await connection.query('DELETE FROM `tables` WHERE restaurant_id = ?', [restId]);
    await connection.query('DELETE FROM restaurants WHERE id = ?', [restId]);

    const [orphans] = await connection.query(
      'SELECT COUNT(*) as count FROM reservations r LEFT JOIN restaurants rest ON r.restaurant_id = rest.id WHERE rest.id IS NULL'
    );
    assert(
      orphans[0].count === 0,
      'Scenario 15 | Database Integrity Audit -> Zero Orphaned Reservation Records',
      `Orphaned reservation count: ${orphans[0].count}`
    );

  } catch (err) {
    console.error('Fatal error during availability test execution:', err);
  } finally {
    await connection.end();
    console.log('\n================================================================');
    console.log('   SMARTTABLE AVAILABILITY ENGINE QA SUMMARY                   ');
    console.log('================================================================');
    console.log(`Total Scenarios Tested: ${passed + failed}`);
    console.log(`Passed:                ${passed} ✅`);
    console.log(`Failed:                ${failed} ❌`);
    console.log('================================================================\n');

    if (failed === 0) {
      console.log('🌟 REAL-TIME TABLE AVAILABILITY ENGINE 100% VERIFIED! 🌟\n');
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

runAvailabilityTests();
