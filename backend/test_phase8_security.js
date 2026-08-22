import mysql from 'mysql2/promise';

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- Starting Phase 8 Security Tests ---\n');
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

  try {
    // 0. Fetch a valid owner and customer from the DB
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'smarttable'
    });

    const [owners] = await connection.query('SELECT email FROM users WHERE role = "owner" LIMIT 1');
    const [customers] = await connection.query('SELECT email FROM users WHERE role = "customer" LIMIT 1');
    
    if (owners.length === 0 || customers.length === 0) {
      throw new Error("Missing owner or customer in DB for tests.");
    }
    
    const ownerEmail = owners[0].email;
    const customerEmail = customers[0].email;
    console.log(`Testing with owner: ${ownerEmail} and customer: ${customerEmail}`);
    
    // We will bypass actual password by temporarily resetting it to a known one 
    // or just using the default fallback if they don't have a hash.
    // Actually, let's just reset their passwords to 'password' for testing.
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const hash = await bcrypt.default.hash('password', salt);
    await connection.query('UPDATE users SET password_hash = ? WHERE email IN (?, ?)', [hash, ownerEmail, customerEmail]);

    // 1. Get tokens first (before rate limit blocks us)
    console.log('Fetching auth tokens...');
    const ownerRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerEmail, password: 'password' })
    });
    const ownerData = await ownerRes.json();
    const ownerToken = ownerData.token;

    const customerRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, password: 'password' })
    });
    const customerData = await customerRes.json();
    const customerToken = customerData.token;

    assert(ownerToken && customerToken, 'Successfully acquired test tokens');

    // Test 1: Role Isolation
    console.log('\nRunning Test 1: Role Isolation...');
    const customerAdminRes = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert(customerAdminRes.status === 403, 'Customer cannot access /api/admin/users (returns 403)');

    const ownerAdminRes = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(ownerAdminRes.status === 403, 'Owner cannot access /api/admin/users (returns 403)');

    // Test 2: Rate Limiting
    console.log('\nRunning Test 2: Rate Limiting...');
    let rateLimitHit = false;
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
      });
      if (res.status === 429) rateLimitHit = true;
    }
    assert(rateLimitHit, 'Login endpoint returns 429 Too Many Requests after 5 attempts');

    // Test 3: Auth Invalidation
    console.log('\nRunning Test 3: Auth Invalidation...');
    // Suspend the customer
    await connection.query('UPDATE users SET status = "suspended" WHERE email = ?', [customerEmail]);
    
    // Attempt to hit a protected route
    const suspendedRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert(suspendedRes.status === 403, 'Suspended user receives 403 Forbidden with valid JWT');
    
    // Reactivate the customer
    await connection.query('UPDATE users SET status = "active" WHERE email = ?', [customerEmail]);

    // Test 4: IDOR Protection
    console.log('\nRunning Test 4: IDOR Protection...');
    const idorRes = await fetch(`${API_BASE}/reservations`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const idorData = await idorRes.json();
    let noIdor = true;
    const [customerRows] = await connection.query('SELECT id FROM users WHERE email = ?', [customerEmail]);
    const customerId = customerRows[0].id;
    for (const r of idorData.data || []) {
      if (r.guestEmail !== customerEmail && r.userId !== customerId) {
        console.error(`IDOR failure detected: reservation guestEmail=${r.guestEmail}, userId=${r.userId} does not match customer ${customerEmail} / ${customerId}`);
        noIdor = false;
      }
    }
    assert(noIdor, 'Customer can only view their own reservations (no IDOR)');

    console.log('\n--- Tests Complete ---');
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
