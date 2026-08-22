import { queryGet } from './database/db.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runPhase4CheckInSuite() {
  console.log('\n================================================================');
  console.log('   SMARTTABLE PHASE 4: HOST QR CHECK-IN & NO-SHOW AUTO-RELEASE  ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (title, fn) => {
    try {
      await fn();
      console.log(`[✅ PASS] ${title}`);
      passed++;
    } catch (err) {
      console.error(`[❌ FAIL] ${title} -> ${err.message}`);
      failed++;
    }
  };

  const restId = 'annalakshmi-restaurant-egmore';
  const timestamp = Date.now();
  const custEmail = `phase4_cust_${timestamp}@example.com`;
  const ownerEmail = `phase4_owner_${timestamp}@example.com`;

  let tokenCust = '';
  let tokenOwner = '';
  let bookingId = '';

  // Setup Auth Tokens
  await test('Auth Setup | Register Test Accounts & Obtain Tokens', async () => {
    const regCust = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Phase 4 Diner', email: custEmail, password: 'Password123!', role: 'customer' })
    });
    const regCustData = await regCust.json();
    tokenCust = regCustData.token;

    const regOwner = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Phase 4 Owner', email: ownerEmail, password: 'Password123!', role: 'owner', restaurantId: restId })
    });
    const regOwnerData = await regOwner.json();
    tokenOwner = regOwnerData.token;

    if (!tokenCust || !tokenOwner) throw new Error('Failed to acquire test tokens');
  });

  // 1. Create Booking
  await test('Host Check-In | Create Active Reservation', async () => {
    const res = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenCust}`
      },
      body: JSON.stringify({
        restaurantId: restId,
        guestName: 'Host Stand Diner',
        guestEmail: custEmail,
        guestPhone: '9876543210',
        partySize: 2,
        date: '2026-08-30',
        time: '20:00'
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create reservation');

    bookingId = json.data.id;
    if (!bookingId) throw new Error('Reservation response missing booking ID');
  });

  // 2. Perform Host Stand Digital Check-In
  await test('Host Check-In | Host Scans QR Pass -> Status = Seated & Table = Occupied', async () => {
    const res = await fetch(`${BASE_URL}/reservations/${bookingId}/checkin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOwner}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Check-in request failed');

    const updatedBooking = await queryGet('SELECT status, table_id FROM reservations WHERE id = ?', [bookingId]);
    if (updatedBooking.status !== 'Seated') throw new Error(`Expected booking status 'Seated', got '${updatedBooking.status}'`);

    const table = await queryGet('SELECT status FROM `tables` WHERE id = ? AND restaurant_id = ?', [updatedBooking.table_id, restId]);
    if (table.status !== 'occupied') throw new Error(`Expected table status 'occupied', got '${table.status}'`);
  });

  console.log('\n================================================================');
  console.log(`   PHASE 4 QA SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase4CheckInSuite();
