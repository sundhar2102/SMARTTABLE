import { queryGet } from './database/db.js';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runOwnerLifecycleSuite() {
  console.log('\n================================================================');
  console.log('   SMARTTABLE OWNER ISOLATION & APPROVAL LIFECYCLE QA SUITE     ');
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

  // Register Admin account for authorization calls
  const adminEmail = `admin_qa_${Date.now()}@smarttable.in`;
  const adminReg = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'QA Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin'
    })
  });
  const adminJson = await adminReg.json();
  const adminToken = adminJson.token;

  let ownerAEmail = `owner_iso_a_${Date.now()}@example.com`;
  let ownerAToken = '';
  let ownerARestId = '';

  // 1. Register New Owner -> Must be PENDING
  await test('Owner Registration | New Owner Account Created as PENDING', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Owner A',
        email: ownerAEmail,
        password: 'password123',
        role: 'owner',
        restaurantName: 'The Urban Bistro A',
        city: 'Chennai'
      })
    });
    const json = await res.json();
    console.log('[DEBUG OWNER REGISTRATION RES]', json);
    if (!res.ok || !json.success) throw new Error(json.message || 'Registration failed');
    ownerAToken = json.token;
    ownerARestId = json.data.restaurantId;

    if (json.data.status !== 'pending') {
      throw new Error(`Expected initial status "pending", got "${json.data.status}"`);
    }

    const rest = await queryGet('SELECT * FROM restaurants WHERE id = ?', [ownerARestId]);
    if (!rest) throw new Error('Restaurant record not found in database');
    if (rest.is_accepting_orders !== 0) throw new Error('New restaurant must NOT be accepting orders immediately');
    if (rest.status !== 'pending') throw new Error(`Expected restaurant status "pending", got "${rest.status}"`);
  });

  // 2. Customer Discovery | Pending Restaurant Must NOT Appear
  await test('Customer Discovery | Pending Restaurant Hidden from Public Search', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to fetch public customer restaurants');

    const found = (json.data || []).find(r => r.id === ownerARestId);
    if (found) {
      throw new Error('PENDING restaurant must NOT be visible in public customer discovery!');
    }
  });

  // 3. Owner Login Before Approval | Returns Status PENDING
  await test('Owner Login | Login Before Approval Returns PENDING Status', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerAEmail, password: 'password123' })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Owner login failed');
    if (json.data.status !== 'pending') {
      throw new Error(`Expected login status "pending", got "${json.data.status}"`);
    }
    if (json.data.isAcceptingOrders !== false) {
      throw new Error('isAcceptingOrders must be false for pending owner');
    }
  });

  // 4. Admin Applications | Admin Views Pending Applications
  await test('Admin Applications | Admin Retrieves Pending Owner Applications', async () => {
    const res = await fetch(`${BASE_URL}/admin/owner-applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Admin failed to fetch owner applications');

    const found = (json.data || []).find(app => app.ownerEmail === ownerAEmail);
    if (!found) throw new Error('Newly registered owner application not listed in admin applications');
  });

  // 5. Admin Approval | Admin Approves Owner Application
  await test('Admin Approval | Admin Approves Application -> Status Becomes LIVE', async () => {
    const res = await fetch(`${BASE_URL}/admin/owner-applications/${ownerARestId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Admin approval failed');

    const rest = await queryGet('SELECT * FROM restaurants WHERE id = ?', [ownerARestId]);
    if (rest.status !== 'live' || rest.is_accepting_orders !== 1) {
      throw new Error('Restaurant failed to transition to LIVE state after admin approval');
    }

    const user = await queryGet('SELECT * FROM users WHERE email = ?', [ownerAEmail]);
    if (user.status !== 'active') {
      throw new Error('User failed to transition to active state after admin approval');
    }
  });

  // 6. Customer Discovery | Approved Restaurant Now Visible
  await test('Customer Discovery | Approved Restaurant Visible in Search', async () => {
    const res = await fetch(`${BASE_URL}/restaurants`);
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to fetch public customer restaurants');

    const found = (json.data || []).find(r => r.id === ownerARestId);
    if (!found) {
      throw new Error('APPROVED restaurant MUST be visible in customer discovery');
    }
  });

  // 7. Strict Owner Isolation | Owner A Cannot Access Owner B Data (403)
  await test('Strict Owner Isolation | Owner A Cannot Manage Owner B Property (HTTP 403)', async () => {
    const ownerBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Owner B',
        email: `owner_b_${Date.now()}@example.com`,
        password: 'password123',
        role: 'owner',
        restaurantName: 'Restaurant B'
      })
    });
    const ownerBJson = await ownerBRes.json();
    const ownerBRestId = ownerBJson.data.restaurantId;

    const updateAttempt = await fetch(`${BASE_URL}/restaurants/${ownerBRestId}/crowd-level`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAToken}` 
      },
      body: JSON.stringify({ crowdLevel: 'high' })
    });
    
    if (updateAttempt.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for cross-tenant edit, got HTTP ${updateAttempt.status}`);
    }
  });

  // 8. Admin Deactivation | Deactivating Restaurant Hides from Public Search
  await test('Admin Deactivation | Deactivated Restaurant Hidden from Public Search', async () => {
    const res = await fetch(`${BASE_URL}/admin/restaurants/${ownerARestId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}` 
      },
      body: JSON.stringify({ isAcceptingOrders: false })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Deactivation failed');

    const publicRes = await fetch(`${BASE_URL}/restaurants`);
    const publicJson = await publicRes.json();
    const found = (publicJson.data || []).find(r => r.id === ownerARestId);
    if (found) {
      throw new Error('DEACTIVATED restaurant MUST NOT appear in customer public search');
    }
  });

  console.log('\n================================================================');
  console.log(`   OWNER LIFECYCLE QA SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runOwnerLifecycleSuite();
