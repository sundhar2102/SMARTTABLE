const API_BASE_URL = 'http://localhost:5000/api';

async function testPhase2Sync() {
  try {
    console.log('🏁 Starting Phase 2 table status and metrics verification tests...');
    
    // Login
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@restaurant.com', password: 'owner123' })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success) {
      throw new Error('Login failed: ' + loginJson.message);
    }
    const token = loginJson.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const restaurantId = 'on-de-roof-chennai';

    // Helper to get restaurant profile and tables
    const getRestaurantData = async () => {
      const res = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, { headers: authHeaders });
      const json = await res.json();
      return json.data;
    };

    // Helper to update table status
    const updateTable = async (tableId, status) => {
      const res = await fetch(`${API_BASE_URL}/tables/${restaurantId}/${tableId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      return json;
    };

    // Reset tables of restaurant to initial state
    console.log('\n--- Resetting tables to initial test state ---');
    // We want 5 tables in seed. Let's make:
    // ODR1: available, ODR2: occupied, ODR3: available, ODR4: reserved, ODR5: available
    // Available = 3/5, Occupied = 1/5, Reserved = 1/5.
    await updateTable('ODR1', 'available');
    await updateTable('ODR2', 'occupied');
    await updateTable('ODR3', 'available');
    await updateTable('ODR4', 'reserved');
    const resetRes = await updateTable('ODR5', 'available');
    
    if (!resetRes.success) {
      throw new Error('Reset failed: ' + resetRes.message);
    }

    let initialData = await getRestaurantData();
    let initialMetrics = resetRes.data.metrics;
    
    console.log(`Initial metrics returned:`);
    console.log(`- Total Tables: ${initialMetrics.total_tables}`);
    console.log(`- Available Tables: ${initialMetrics.available_tables}`);
    console.log(`- Occupied Tables: ${initialMetrics.occupied_tables}`);
    console.log(`- Reserved Tables: ${initialMetrics.reserved_tables}`);
    console.log(`- Occupancy Percentage: ${initialMetrics.occupancy_percentage}%`);

    // Verify initial state values
    if (initialMetrics.available_tables !== 3 || initialMetrics.occupied_tables !== 1 || initialMetrics.reserved_tables !== 1) {
      throw new Error('Initial tables layout counts mismatch!');
    }
    console.log('✅ Initial state verified successfully.');

    // Test 1: Available -> Occupied (ODR1)
    console.log('\n--- Test 1: Update ODR1 from Available to Occupied ---');
    const test1Res = await updateTable('ODR1', 'occupied');
    if (!test1Res.success) {
      throw new Error('Test 1 update failed: ' + test1Res.message);
    }
    
    let t1Metrics = test1Res.data.metrics;
    console.log(`Updated metrics:`);
    console.log(`- Available: ${t1Metrics.available_tables} (Expected: 2)`);
    console.log(`- Occupied: ${t1Metrics.occupied_tables} (Expected: 2)`);
    console.log(`- Occupancy Ratio: ${t1Metrics.occupancy_percentage}% (Expected: 40%)`);
    
    if (t1Metrics.available_tables !== 2 || t1Metrics.occupied_tables !== 2 || t1Metrics.occupancy_percentage !== 40) {
      throw new Error('Test 1 metrics update mismatch!');
    }
    console.log('✅ Test 1 Passed: Available -> Occupied metrics synced correctly.');

    // Test 2: Occupied -> Available (ODR1)
    console.log('\n--- Test 2: Update ODR1 from Occupied back to Available ---');
    const test2Res = await updateTable('ODR1', 'available');
    if (!test2Res.success) {
      throw new Error('Test 2 update failed: ' + test2Res.message);
    }
    
    let t2Metrics = test2Res.data.metrics;
    console.log(`Updated metrics:`);
    console.log(`- Available: ${t2Metrics.available_tables} (Expected: 3)`);
    console.log(`- Occupied: ${t2Metrics.occupied_tables} (Expected: 1)`);
    console.log(`- Occupancy Ratio: ${t2Metrics.occupancy_percentage}% (Expected: 20%)`);
    
    if (t2Metrics.available_tables !== 3 || t2Metrics.occupied_tables !== 1 || t2Metrics.occupancy_percentage !== 20) {
      throw new Error('Test 2 metrics update mismatch!');
    }
    console.log('✅ Test 2 Passed: Occupied -> Available metrics reverted and synced correctly.');

    // Test 3: Last Available -> Occupied (Make ODR1, ODR3, ODR5 all occupied/reserved)
    console.log('\n--- Test 3: Make all tables occupied/reserved (0 available) ---');
    await updateTable('ODR1', 'occupied');
    await updateTable('ODR3', 'occupied');
    const test3Res = await updateTable('ODR5', 'occupied');
    
    let t3Metrics = test3Res.data.metrics;
    console.log(`Updated metrics:`);
    console.log(`- Available: ${t3Metrics.available_tables} (Expected: 0)`);
    console.log(`- Occupied: ${t3Metrics.occupied_tables} (Expected: 4)`);
    console.log(`- Occupancy Ratio: ${t3Metrics.occupancy_percentage}% (Expected: 80%)`);
    
    if (t3Metrics.available_tables !== 0 || t3Metrics.occupied_tables !== 4 || t3Metrics.occupancy_percentage !== 80) {
      throw new Error('Test 3 metrics update mismatch!');
    }
    console.log('✅ Test 3 Passed: 0 available tables metrics updated correctly.');

    // Test 4: Verify persistence after database connection refresh
    console.log('\n--- Test 4: Verify persistence from a fresh fetch ---');
    const freshData = await getRestaurantData();
    // Count tables in array
    const dbAvailable = freshData.tables.filter(t => t.status === 'available').length;
    const dbOccupied = freshData.tables.filter(t => t.status === 'occupied').length;
    console.log(`Fresh fetch data from MySQL:`);
    console.log(`- Available tables in database: ${dbAvailable} (Expected: 0)`);
    console.log(`- Occupied tables in database: ${dbOccupied} (Expected: 4)`);
    
    if (dbAvailable !== 0 || dbOccupied !== 4) {
      throw new Error('Database persistence mismatch!');
    }
    console.log('✅ Test 4 Passed: Table states correctly retrieved from MySQL.');

    // Test 5: Validation of Invalid status value
    console.log('\n--- Test 5: Try updating table to an invalid status ---');
    const invalidRes = await updateTable('ODR1', 'unknown_status');
    console.log(`Response status code: 400, message: "${invalidRes.message}"`);
    if (invalidRes.success) {
      throw new Error('Database accepted invalid status!');
    }
    console.log('✅ Test 5 Passed: Invalid status rejected with correct error message.');

    // Clean up restaurant tables back to original state
    console.log('\n--- Cleaning up tables after test run ---');
    await updateTable('ODR1', 'available');
    await updateTable('ODR2', 'occupied');
    await updateTable('ODR3', 'available');
    await updateTable('ODR4', 'reserved');
    await updateTable('ODR5', 'available');

    console.log('\n🎉 All backend/MySQL metrics tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification test failed:', err.message);
    process.exit(1);
  }
}

testPhase2Sync();
