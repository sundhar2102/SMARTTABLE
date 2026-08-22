import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-smarttable-key-2026';

async function runPhase11Tests() {
  console.log('\n======================================================');
  console.log('🧪 SMARTTABLE PHASE 11: REAL ANALYTICS & PREDICTIONS TEST');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} — ${details}`);
      failed++;
    }
  };

  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'smarttable'
    });

    // 1. Get real restaurant ID from MySQL
    const [restaurants] = await conn.query('SELECT id, name FROM restaurants LIMIT 2');
    if (restaurants.length === 0) {
      throw new Error('No restaurants found in database.');
    }
    const rest1Id = restaurants[0].id;
    const rest2Id = restaurants.length > 1 ? restaurants[1].id : 'rest-2';
    console.log(`Using restaurants: Primary='${rest1Id}', Secondary='${rest2Id}'`);

    // Ensure test users exist with active status
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const hash = await bcrypt.default.hash('testpass123', salt);

    // Admin user
    await conn.query(`
      INSERT INTO users (id, name, email, password_hash, role, status)
      VALUES (901, 'Test Admin', 'testadmin11@smarttable.in', ?, 'admin', 'active')
      ON DUPLICATE KEY UPDATE password_hash = ?, role = 'admin', status = 'active'
    `, [hash, hash]);

    // Owner of Rest 1
    await conn.query(`
      INSERT INTO users (id, name, email, password_hash, role, restaurant_id, status)
      VALUES (902, 'Test Owner 1', 'testowner11_1@smarttable.in', ?, 'owner', ?, 'active')
      ON DUPLICATE KEY UPDATE password_hash = ?, role = 'owner', restaurant_id = ?, status = 'active'
    `, [hash, rest1Id, hash, rest1Id]);

    // Owner of Rest 2
    await conn.query(`
      INSERT INTO users (id, name, email, password_hash, role, restaurant_id, status)
      VALUES (903, 'Test Owner 2', 'testowner11_2@smarttable.in', ?, 'owner', ?, 'active')
      ON DUPLICATE KEY UPDATE password_hash = ?, role = 'owner', restaurant_id = ?, status = 'active'
    `, [hash, rest2Id, hash, rest2Id]);

    // Diner user
    await conn.query(`
      INSERT INTO users (id, name, email, password_hash, role, status)
      VALUES (904, 'Test Diner', 'testdiner11@smarttable.in', ?, 'customer', 'active')
      ON DUPLICATE KEY UPDATE password_hash = ?, role = 'customer', status = 'active'
    `, [hash, hash]);

    await conn.end();

    // Generate valid signed tokens directly
    const adminToken = jwt.sign({ id: 901 }, JWT_SECRET, { expiresIn: '1h' });
    const owner1Token = jwt.sign({ id: 902 }, JWT_SECRET, { expiresIn: '1h' });
    const owner2Token = jwt.sign({ id: 903 }, JWT_SECRET, { expiresIn: '1h' });
    const dinerToken = jwt.sign({ id: 904 }, JWT_SECRET, { expiresIn: '1h' });

    // 1. Unauthenticated request to restaurant analytics is rejected
    const res1 = await fetch(`${BASE_URL}/restaurants/${rest1Id}/analytics`);
    assert(res1.status === 401, 'Unauthenticated request to restaurant analytics rejected with 401');

    // 2. Customer token rejected from owner analytics
    const res2 = await fetch(`${BASE_URL}/restaurants/${rest1Id}/analytics`, {
      headers: { Authorization: `Bearer ${dinerToken}` }
    });
    assert(res2.status === 403, 'Customer token rejected from owner analytics with 403');

    // 3. Unauthorized owner token (owns rest2 trying to access rest1) rejected
    const res3 = await fetch(`${BASE_URL}/restaurants/${rest1Id}/analytics`, {
      headers: { Authorization: `Bearer ${owner2Token}` }
    });
    assert(res3.status === 403, 'Unauthorized owner accessing different property rejected with 403');

    // 4. Authorized owner can access their property analytics
    const res4 = await fetch(`${BASE_URL}/restaurants/${rest1Id}/analytics`, {
      headers: { Authorization: `Bearer ${owner1Token}` }
    });
    const json4 = await res4.json();
    const hasStructure = json4?.success === true &&
      json4?.data?.realtime?.totalTables !== undefined &&
      json4?.data?.historical?.totalRevenue !== undefined &&
      json4?.data?.predictions?.predictedCrowdLevel !== undefined &&
      Array.isArray(json4?.data?.historical?.hourlyDistribution);
    assert(res4.status === 200 && hasStructure, 'Authorized owner can access real property analytics', JSON.stringify(json4?.data?.realtime));

    // 5. Customer / Owner rejected from Super Admin platform analytics
    const res5 = await fetch(`${BASE_URL}/admin/platform-analytics`, {
      headers: { Authorization: `Bearer ${owner1Token}` }
    });
    assert(res5.status === 403, 'Owner token rejected from platform-analytics with 403');

    // 6. Super Admin can access platform analytics
    const res6 = await fetch(`${BASE_URL}/admin/platform-analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const json6 = await res6.json();
    const hasPlatformMetrics = json6?.success === true &&
      json6?.data?.totalGmv !== undefined &&
      json6?.data?.platformCommissionRevenue !== undefined &&
      json6?.data?.totalOrders !== undefined &&
      json6?.data?.systemUtilizationPercent !== undefined;
    assert(res6.status === 200 && hasPlatformMetrics, 'Super Admin can access real consolidated platform analytics', `GMV: ₹${json6?.data?.totalGmv}, Commission: ₹${json6?.data?.platformCommissionRevenue}`);

    // 7. Super Admin can inspect individual restaurant analytics via /api/admin/analytics/:id
    const res7 = await fetch(`${BASE_URL}/admin/analytics/${rest1Id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const json7 = await res7.json();
    assert(res7.status === 200 && json7?.success === true, 'Super Admin can access any restaurant analytics via admin endpoint');

    // 8. Deterministic Walk-in Prediction API
    const res8 = await fetch(`${BASE_URL}/ai/predict-walk-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: rest1Id,
        partySize: 2,
        targetTime: '19:30',
        weather: 'sunny'
      })
    });
    const json8 = await res8.json();
    const isValidPrediction = json8?.success === true &&
      typeof json8?.data?.score === 'number' &&
      json8?.data?.score >= 10 && json8?.data?.score <= 100 &&
      json8?.data?.label &&
      Array.isArray(json8?.data?.rationale) &&
      json8?.data?.isDeterministic === true;
    assert(res8.status === 200 && isValidPrediction, 'Deterministic Walk-in Prediction API calculates valid score and rationale', `Score: ${json8?.data?.score}%, Label: ${json8?.data?.label}`);

    // 9. Non-existent restaurant returns 404 for analytics
    const res9 = await fetch(`${BASE_URL}/admin/analytics/rest-9999-invalid`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(res9.status === 404, 'Non-existent restaurant analytics returns 404');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log('\n------------------------------------------------------');
  console.log(`PHASE 11 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase11Tests();
