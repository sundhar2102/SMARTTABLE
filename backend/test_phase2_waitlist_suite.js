import { queryGet } from './database/db.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runPhase2WaitlistSuite() {
  console.log('\n================================================================');
  console.log('   SMARTTABLE PHASE 2: VIRTUAL WAITLIST & AVAILABILITY ENGINE   ');
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

  const restId = 'on-de-roof-chennai';

  // 1. Fetch Availability with Status Breakdown
  await test('Table Availability | Returns Status Breakdown & Ready Timestamp', async () => {
    const res = await fetch(`${BASE_URL}/tables/${restId}/availability?date=2026-08-25&time=19:00&partySize=2`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch availability');

    const data = json.data;
    if (!data.statusBreakdown) throw new Error('Response missing statusBreakdown object');
    if (typeof data.statusBreakdown.AVAILABLE !== 'number') throw new Error('Missing AVAILABLE breakdown count');
    if (typeof data.statusBreakdown.OCCUPIED !== 'number') throw new Error('Missing OCCUPIED breakdown count');
    if (!data.estimatedReadyTime) throw new Error('Missing estimatedReadyTime timestamp');
  });

  // 2. Join Virtual Waitlist Queue
  let ticketId = '';
  const guestEmail = `waitlist_diner_${Date.now()}@example.com`;

  await test('Virtual Waitlist | Customer Joins Virtual Queue', async () => {
    const res = await fetch(`${BASE_URL}/waitlist/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: restId,
        guestName: 'Anand Kumar',
        guestPhone: '9876543210',
        guestEmail,
        partySize: 2,
        notes: 'Window table preferred'
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to join waitlist');

    ticketId = json.data.ticketId;
    if (!ticketId) throw new Error('Waitlist response missing ticketId');
    if (json.data.status !== 'waiting') throw new Error(`Expected status 'waiting', got '${json.data.status}'`);
    if (typeof json.data.queuePosition !== 'number') throw new Error('Missing queuePosition in ticket');
  });

  // 3. Query Waitlist Status
  await test('Virtual Waitlist | Customer Queries Ticket Status & Queue Position', async () => {
    const res = await fetch(`${BASE_URL}/waitlist/${restId}/status?ticketId=${ticketId}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Failed to fetch waitlist status');

    if (!json.data.myTicket) throw new Error('Waitlist status response missing myTicket');
    if (json.data.myTicket.ticketId !== ticketId) throw new Error('Ticket ID mismatch');
  });

  // 4. Customer Leaves Waitlist Queue
  await test('Virtual Waitlist | Customer Leaves Queue', async () => {
    const res = await fetch(`${BASE_URL}/waitlist/${ticketId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to leave waitlist');

    const ticket = await queryGet('SELECT * FROM waitlist WHERE id = ?', [ticketId]);
    if (ticket.status !== 'cancelled') throw new Error(`Expected ticket status 'cancelled', got '${ticket.status}'`);
  });

  console.log('\n================================================================');
  console.log(`   PHASE 2 QA SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase2WaitlistSuite();
