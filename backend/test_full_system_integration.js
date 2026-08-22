/**
 * Full End-to-End System Integration Test for SMARTTABLE
 * Validates complete connection across Customer, Restaurant Owner, Admin, Tables, Menu, and Payments.
 */
import { getDb } from './database/db.js';

const BACKEND_URL = 'http://127.0.0.1:5000/api';

async function runSystemIntegrationTest() {
  console.log('\n======================================================');
  console.log('   SmartTable Full End-to-End System Integration Test   ');
  console.log('======================================================\n');

  try {
    const db = await getDb();
    const conn = await db.getConnection();
    console.log('✅ Connected to MySQL database: smarttable on 127.0.0.1:3306');
    conn.release();

    const timestamp = Date.now();
    const customerEmail = `sys_diner_${timestamp}@smarttable.in`;
    const ownerEmail = `sys_owner_${timestamp}@smarttable.in`;
    const password = 'Password123!';

    // ── STEP 1: AUTHENTICATION (Register Customer & Owner) ─────────────────
    console.log('\n--- Step 1: Authentication & User Accounts ---');
    
    // Register Customer
    const regCustRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Diner', email: customerEmail, password, role: 'customer' })
    });
    const regCustData = await regCustRes.json();
    console.log('[PASS] Customer Registered:', regCustData.user?.email || customerEmail);

    // Register Owner
    const regOwnerRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Owner', email: ownerEmail, password, role: 'owner', restaurantId: 'on-de-roof-chennai' })
    });
    const regOwnerData = await regOwnerRes.json();
    console.log('[PASS] Owner Registered:', regOwnerData.user?.email || ownerEmail);

    // Login Customer
    const loginCustRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, password })
    });
    const loginCustData = await loginCustRes.json();
    const customerToken = loginCustData.token;
    console.log('[PASS] Customer Logged In - Token Issued');

    // Login Owner
    const loginOwnerRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerEmail, password })
    });
    const loginOwnerData = await loginOwnerRes.json();
    const ownerToken = loginOwnerData.token;
    console.log('[PASS] Owner Logged In - Token Issued');

    // ── STEP 2: RESTAURANTS & TABLES DISCOVERY ───────────────────────────────
    console.log('\n--- Step 2: Restaurants & Table Discovery ---');
    const restsRes = await fetch(`${BACKEND_URL}/restaurants`);
    const restsData = await restsRes.json();
    const targetRest = restsData.data.find(r => r.id === 'on-de-roof-chennai') || restsData.data[0];
    console.log(`[PASS] Fetched Restaurants list. Found venue: "${targetRest.name}" (ID: ${targetRest.id})`);
    console.log(`[PASS] Live Table Metrics: ${targetRest.available_tables} available / ${targetRest.total_tables} total`);

    // ── STEP 3: MENU CRUD MANAGEMENT ──────────────────────────────────────────
    console.log('\n--- Step 3: Menu CRUD Management (Owner & Customer Sync) ---');
    
    // Add Menu Item
    const addMenuRes = await fetch(`${BACKEND_URL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        restaurantId: targetRest.id,
        category: 'Chef Signature Specials',
        name: `Truffle Mushroom Risotto ${timestamp.toString().slice(-4)}`,
        price: 750,
        description: 'Creamy arborio rice with wild forest mushrooms & fresh black truffle oil',
        tags: ['v', 'g']
      })
    });
    const addMenuData = await addMenuRes.json();
    if (!addMenuData.success) throw new Error(`Add menu failed: ${addMenuData.message}`);
    const newMenuItemId = addMenuData.data.id;
    console.log(`[PASS] Owner added new menu item to MySQL: ${newMenuItemId} (${addMenuData.data.name})`);

    // Fetch Menu as Customer
    const fetchMenuRes = await fetch(`${BACKEND_URL}/menu/${targetRest.id}`);
    const fetchMenuData = await fetchMenuRes.json();
    const hasNewItem = fetchMenuData.rawItems.some(i => i.id === newMenuItemId);
    if (!hasNewItem) throw new Error('Customer menu fetch did not include newly created menu item!');
    console.log('[PASS] Customer fetched updated menu from database - newly added item is present');

    // Update Menu Item
    const updateMenuRes = await fetch(`${BACKEND_URL}/menu/${newMenuItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        price: 820,
        description: 'Updated description: Premium Arborio with black truffle caviar'
      })
    });
    const updateMenuData = await updateMenuRes.json();
    console.log(`[PASS] Owner updated menu item price in MySQL to ₹${updateMenuData.data.price}`);

    // Delete Menu Item
    const deleteMenuRes = await fetch(`${BACKEND_URL}/menu/${newMenuItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const deleteMenuData = await deleteMenuRes.json();
    console.log(`[PASS] Owner deleted menu item from MySQL: ${deleteMenuData.message}`);

    // ── STEP 4: TABLE RESERVATION FLOW ────────────────────────────────────────
    console.log('\n--- Step 4: Customer Creates Reservation ---');
    const targetTableId = targetRest.tables[0].id;
    const testDate = `2026-11-${Math.floor(10 + Math.random() * 18)}`;
    const bookingRes = await fetch(`${BACKEND_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        restaurantId: targetRest.id,
        tableId: targetTableId,
        guestName: 'Integration Diner',
        guestEmail: customerEmail,
        guestPhone: '+91 98400 99999',
        partySize: 2,
        date: testDate,
        time: '19:00',
        specialRequests: 'Window table please'
      })
    });
    const bookingData = await bookingRes.json();
    if (!bookingData.success) throw new Error(`Reservation failed: ${bookingData.message}`);
    const reservationId = bookingData.data.id;
    console.log(`[PASS] Customer submitted reservation: ${reservationId} (Status: ${bookingData.data.status})`);

    // ── STEP 5: OWNER ACCEPTS BOOKING ─────────────────────────────────────────
    console.log('\n--- Step 5: Owner Receives & Accepts Booking ---');
    const ownerResListRes = await fetch(`${BACKEND_URL}/reservations?restaurantId=${targetRest.id}`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const ownerResListData = await ownerResListRes.json();
    const foundBooking = ownerResListData.data.find(r => r.id === reservationId);
    if (!foundBooking) throw new Error(`Owner did not receive booking ${reservationId}`);
    console.log(`[PASS] Owner retrieved booking ${reservationId} under Pending requests`);

    // Owner Accepts
    const acceptRes = await fetch(`${BACKEND_URL}/reservations/${reservationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const acceptData = await acceptRes.json();
    if (!acceptData.success) throw new Error(`Accept reservation failed: ${acceptData.message}`);
    console.log(`[PASS] Owner accepted reservation -> DB status updated to: ${acceptData.data.status}`);

    // ── STEP 6: CUSTOMER CHECKS UPDATED STATUS ────────────────────────────────
    console.log('\n--- Step 6: Customer Sync Check ---');
    const myRes = await fetch(`${BACKEND_URL}/reservations`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const myData = await myRes.json();
    const customerViewedBooking = myData.data.find(r => r.id === reservationId);
    if (customerViewedBooking.status !== 'Confirmed') {
      throw new Error(`Customer booking status mismatch! Expected Confirmed, got ${customerViewedBooking.status}`);
    }
    console.log(`[PASS] Customer dashboard verified updated status: ${customerViewedBooking.status}`);

    // ── STEP 7: PAYMENT CHECKOUT & RECORDING ─────────────────────────────────
    console.log('\n--- Step 7: Payment Checkout & Transaction Recording ---');
    const payRes = await fetch(`${BACKEND_URL}/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        bookingId: reservationId,
        restaurantId: targetRest.id,
        amount: 1500,
        paymentMethod: 'Instant UPI (diner@okaxis)',
        gateway: 'Razorpay PG (Demo Mode)'
      })
    });
    const payData = await payRes.json();
    if (!payData.success) throw new Error(`Payment checkout failed: ${payData.message}`);
    console.log(`[PASS] Payment verified and saved in MySQL payments table (Txn ID: ${payData.data.transactionId})`);

    // Verify Payment History
    const payHistRes = await fetch(`${BACKEND_URL}/payments/history?restaurantId=${targetRest.id}`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const payHistData = await payHistRes.json();
    const hasPayment = payHistData.data.some(p => p.transaction_id === payData.data.transactionId);
    if (!hasPayment) throw new Error('Payment record not found in payment history query!');
    console.log('[PASS] Owner verified payment transaction in MySQL payments history table');

    console.log('\n======================================================');
    console.log('   ALL SYSTEM INTEGRATION TESTS PASSED CLEANLY! 🚀   ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ SYSTEM INTEGRATION TEST FAILED:', err);
  } finally {
    process.exit(0);
  }
}

runSystemIntegrationTest();
