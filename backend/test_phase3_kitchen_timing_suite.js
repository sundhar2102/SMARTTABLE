import { queryGet } from './database/db.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runPhase3KitchenSuite() {
  console.log('\n================================================================');
  console.log('   SMARTTABLE PHASE 3: KITCHEN PREP TIMING & LIFECYCLE STEPPER  ');
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
  const custEmail = `phase3_cust_${timestamp}@example.com`;
  const ownerEmail = `phase3_owner_${timestamp}@example.com`;

  let tokenCust = '';
  let tokenOwner = '';
  let bookingId = '';

  // Setup Auth Tokens
  await test('Auth Setup | Register Test Accounts & Obtain Tokens', async () => {
    // Customer registration
    const regCust = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Phase 3 Diner', email: custEmail, password: 'Password123!', role: 'customer' })
    });
    const regCustData = await regCust.json();
    tokenCust = regCustData.token;

    // Owner registration
    const regOwner = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Phase 3 Owner', email: ownerEmail, password: 'Password123!', role: 'owner', restaurantId: restId })
    });
    const regOwnerData = await regOwner.json();
    tokenOwner = regOwnerData.token;

    if (!tokenCust || !tokenOwner) throw new Error('Failed to acquire test tokens');
  });

  // 1. Create Table Booking with Pre-Order Items
  await test('Booking & Pre-Order | Create Booking with Kitchen Items & Prep Time Calculation', async () => {
    const res = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenCust}`
      },
      body: JSON.stringify({
        restaurantId: restId,
        guestName: 'Chef Audit Diner',
        guestEmail: custEmail,
        guestPhone: '9876543210',
        partySize: 2,
        date: '2026-08-28',
        time: '19:30',
        preOrderedItems: [
          { id: 'MENU-ANNA-1', name: 'South Indian Thali', price: 350, qty: 2, category: 'Main Course' },
          { id: 'MENU-ANNA-2', name: 'Filter Coffee', price: 60, qty: 2, category: 'Beverage' }
        ]
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create reservation');

    bookingId = json.data.id;
    if (!bookingId) throw new Error('Reservation response missing booking ID');
    if (!json.data.preOrderedItems || json.data.preOrderedItems.length !== 2) throw new Error('Pre-ordered items count mismatch');
  });

  // 2. Query Booking & Verify Kitchen Stepper Status
  await test('Booking Lifecycle | Retrieve Booking Stepper Status (Step 1: Booked)', async () => {
    const res = await fetch(`${BASE_URL}/reservations`, {
      headers: { 'Authorization': `Bearer ${tokenCust}` }
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Failed to fetch reservations');

    const booking = (json.data || []).find(r => r.id === bookingId);
    if (!booking) throw new Error('Booking not found in list');
    if (booking.status !== 'Pending' && booking.status !== 'Confirmed') throw new Error(`Unexpected status '${booking.status}'`);
  });

  // 3. Confirm Reservation & Verify Kitchen Readiness
  await test('Kitchen Dispatch | Restaurant Owner Accepts Booking & Triggers Stepper Step 2', async () => {
    const res = await fetch(`${BASE_URL}/reservations/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update reservation status');

    const updated = await queryGet('SELECT status FROM reservations WHERE id = ?', [bookingId]);
    if (updated.status !== 'Confirmed') throw new Error(`Expected status 'Confirmed', got '${updated.status}'`);
  });

  console.log('\n================================================================');
  console.log(`   PHASE 3 QA SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase3KitchenSuite();
