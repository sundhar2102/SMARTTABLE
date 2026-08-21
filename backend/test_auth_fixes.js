/**
 * SmartTable AI – Phase 1 Authorization Vulnerability Fix Tests
 *
 * Tests the two vulnerabilities identified in the Phase 1 audit:
 *  1. DELETE /api/reservations/:id – reservation deletion authorization
 *  2. GET /api/orders – order listing scoping
 *
 * Run: node backend/test_auth_fixes.js
 */

import jwt from 'jsonwebtoken';
import { initDb, queryRun, queryGet } from './database/db.js';

const BASE_URL = 'http://localhost:5000/api';

const results = [];
const logTest = (name, passed, detail = '') => {
  results.push({ name, passed });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon}: ${name}${detail ? ` (${detail})` : ''}`);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const loginAs = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  return data.token;
};

const authHeader = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

const createReservation = async (token, restaurantId = 'avartana-itc-grand-chola') => {
  const res = await fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({
      restaurantId,
      restaurantName: 'Avartana',
      guestName: 'Test Guest',
      guestEmail: 'test@example.com',
      guestPhone: '+91 99000 00000',
      partySize: 2,
      date: '2026-09-01',
      time: '19:00',
      preOrderedItems: []
    })
  });
  const data = await res.json();
  return data?.data?.id;
};

// ─── Main Test Runner ──────────────────────────────────────────────────────────

const runFixTests = async () => {
  console.log('\n🛡️  Starting Phase 1 Authorization Fix Tests...\n');

  await initDb();

  // Get tokens for each actor
  const customerAToken = await loginAs('rajesh.kapoor@example.com', 'password');
  const adminItcToken  = await loginAs('admin@itcgrandchola.com',   'admin123');   // admin of avartana-itc-grand-chola
  const adminSanToken  = await loginAs('admin@sangeethaadyar.com',   'admin123');   // admin of sangeetha-veg-adyar

  // Create a reservation owned by customerA via the ITC admin (who can create for their restaurant)
  const resIdCustomerA = await createReservation(customerAToken, 'avartana-itc-grand-chola');
  const resIdOtherRest = await createReservation(adminItcToken,  'avartana-itc-grand-chola');

  console.log('─── Issue 1: DELETE /api/reservations/:id ─────────────────────────────────\n');

  // Test 1: Unauthenticated user cannot delete a reservation
  const t1 = await fetch(`${BASE_URL}/reservations/${resIdCustomerA}`, { method: 'DELETE' });
  logTest(
    'Unauthenticated user cannot delete a reservation',
    t1.status === 401,
    `HTTP ${t1.status}`
  );

  // Test 2: Customer can delete their own reservation
  // First create a fresh one owned by customerA
  const resIdForCustomerA = await createReservation(customerAToken, 'avartana-itc-grand-chola');
  const t2 = await fetch(`${BASE_URL}/reservations/${resIdForCustomerA}`, {
    method: 'DELETE',
    headers: authHeader(customerAToken)
  });
  const t2Data = await t2.json();
  logTest(
    'Customer can delete their own reservation',
    t2.status === 200 && t2Data.success,
    `HTTP ${t2.status}`
  );

  // Test 3: Customer cannot delete another customer's reservation
  // resIdOtherRest was created by adminItcToken – customerA should be blocked
  const t3 = await fetch(`${BASE_URL}/reservations/${resIdOtherRest}`, {
    method: 'DELETE',
    headers: authHeader(customerAToken)
  });
  const t3Data = await t3.json();
  logTest(
    'Customer cannot delete another user\'s reservation',
    t3.status === 403,
    `HTTP ${t3.status}: ${t3Data.message}`
  );

  // Test 4: Owner can cancel a reservation belonging to their own restaurant
  const resIdForOwner = await createReservation(adminItcToken, 'avartana-itc-grand-chola');
  const t4 = await fetch(`${BASE_URL}/reservations/${resIdForOwner}`, {
    method: 'DELETE',
    headers: authHeader(adminItcToken)
  });
  const t4Data = await t4.json();
  logTest(
    'Owner can cancel reservations belonging to their restaurant',
    t4.status === 200 && t4Data.success,
    `HTTP ${t4.status}`
  );

  // Test 5: Owner of Restaurant B cannot cancel a reservation from Restaurant A
  // resIdCustomerA belongs to avartana-itc-grand-chola, adminSanToken manages sangeetha-veg-adyar
  const resIdForCrossTest = await createReservation(adminItcToken, 'avartana-itc-grand-chola');
  const t5 = await fetch(`${BASE_URL}/reservations/${resIdForCrossTest}`, {
    method: 'DELETE',
    headers: authHeader(adminSanToken)
  });
  const t5Data = await t5.json();
  logTest(
    'Owner cannot cancel reservations from a different restaurant (cross-restaurant blocked)',
    t5.status === 403,
    `HTTP ${t5.status}: ${t5Data.message}`
  );

  // Clean up: cancel the remaining test reservation
  await fetch(`${BASE_URL}/reservations/${resIdForCrossTest}`, {
    method: 'DELETE',
    headers: authHeader(adminItcToken)
  });

  console.log('\n─── Issue 2: GET /api/orders ───────────────────────────────────────────────\n');

  // Test 6: Unauthenticated request is rejected
  const t6 = await fetch(`${BASE_URL}/orders`);
  logTest(
    'Unauthenticated request to GET /orders is rejected',
    t6.status === 401,
    `HTTP ${t6.status}`
  );

  // Test 7: Customer A sees only their own orders
  const t7 = await fetch(`${BASE_URL}/orders`, { headers: authHeader(customerAToken) });
  const t7Data = await t7.json();
  const allCustomerAOrders = t7Data.data || [];
  const hasOtherOrders = allCustomerAOrders.some(
    o => o.user_id && o.user_id !== 'user-1' && o.guest_email !== 'rajesh.kapoor@example.com'
  );
  logTest(
    'Customer A can only see their own orders (no cross-customer data)',
    t7.status === 200 && !hasOtherOrders,
    `HTTP ${t7.status}, Order count: ${allCustomerAOrders.length}, Cross-user orders: ${hasOtherOrders}`
  );

  // Test 8: Owner A sees only their restaurant's orders
  const t8 = await fetch(`${BASE_URL}/orders`, { headers: authHeader(adminItcToken) });
  const t8Data = await t8.json();
  const allOwnerOrders = t8Data.data || [];
  const hasOtherRestaurantOrders = allOwnerOrders.some(o => o.restaurant_id !== 'avartana-itc-grand-chola');
  logTest(
    'Owner A only sees orders from their restaurant (no cross-restaurant orders)',
    t8.status === 200 && !hasOtherRestaurantOrders,
    `HTTP ${t8.status}, Order count: ${allOwnerOrders.length}, Cross-restaurant: ${hasOtherRestaurantOrders}`
  );

  // Test 9: Owner B cannot see Owner A's restaurant orders
  const t9 = await fetch(`${BASE_URL}/orders`, { headers: authHeader(adminSanToken) });
  const t9Data = await t9.json();
  const ownerBOrders = t9Data.data || [];
  const ownerBSeesItcOrders = ownerBOrders.some(o => o.restaurant_id === 'avartana-itc-grand-chola');
  logTest(
    'Owner B cannot see Owner A\'s restaurant orders (cross-restaurant blocked)',
    t9.status === 200 && !ownerBSeesItcOrders,
    `HTTP ${t9.status}, ITC orders visible to Sangeetha admin: ${ownerBSeesItcOrders}`
  );

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log('\n=============================================');
  const passed = results.filter(r => r.passed).length;
  const total  = results.length;
  const allPassed = passed === total;
  console.log(`📊 Authorization Fix Tests: ${passed} / ${total} ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
  console.log('=============================================\n');

  process.exit(allPassed ? 0 : 1);
};

runFixTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
