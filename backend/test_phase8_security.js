import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-smarttable-key-2026';

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
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'smarttable'
    });

    const [owners] = await connection.query('SELECT id, email FROM users WHERE role = "owner" LIMIT 1');
    const [customers] = await connection.query('SELECT id, email FROM users WHERE role = "customer" LIMIT 1');
    
    if (owners.length === 0 || customers.length === 0) {
      throw new Error("Missing owner or customer in DB for tests.");
    }
    
    const ownerEmail = owners[0].email;
    const customerEmail = customers[0].email;
    console.log(`Testing with owner: ${ownerEmail} and customer: ${customerEmail}`);
    
    // Ensure active status
    await connection.query('UPDATE users SET status = "active" WHERE email IN (?, ?)', [ownerEmail, customerEmail]);

    // Sign tokens directly with JWT_SECRET to be rate-limit immune
    const ownerToken = jwt.sign({ id: owners[0].id }, JWT_SECRET, { expiresIn: '1h' });
    const customerToken = jwt.sign({ id: customers[0].id }, JWT_SECRET, { expiresIn: '1h' });

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
    const [custLookup] = await connection.query('SELECT id FROM users WHERE email = ?', [customerEmail]);
    const customerId = custLookup[0].id;
    for (const r of idorData.data || []) {
      if (r.guestEmail !== customerEmail && r.userId !== customerId) {
        console.error(`IDOR failure detected: reservation guestEmail=${r.guestEmail}, userId=${r.userId} does not match customer ${customerEmail} / ${customerId}`);
        noIdor = false;
      }
    }
    assert(noIdor, 'Customer can only view their own reservations (no IDOR)');

    await connection.end();

    console.log('\n--- Tests Complete ---');
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
