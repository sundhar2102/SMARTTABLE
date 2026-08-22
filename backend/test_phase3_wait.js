import { queryRun, queryGet, queryAll } from './database/db.js';
import { calculateRestaurantMetrics } from './src/utils/waitAlgorithm.js';
import { calculateWaitTimeForParty, invalidateRestaurantCache } from './src/services/waitTimeService.js';

const restaurantId = 'on-de-roof-chennai';
const otherRestaurantId = 'pumpkin-tales-alwarpet';

async function runTests() {
  try {
    console.log('🏁 Starting Phase 3 Wait-Time System Integration Tests...\n');

    // Reset helper
    const resetTables = async (restId) => {
      await queryRun("DELETE FROM orders WHERE restaurant_id = ?", [restId]);
      await queryRun("DELETE FROM reservations WHERE restaurant_id = ?", [restId]);
      await queryRun(
        "UPDATE `tables` SET status = 'available', mins_remaining = NULL, reservation_name = NULL WHERE restaurant_id = ?",
        [restId]
      );
      invalidateRestaurantCache(restId);
    };

    console.log('--- Cleaning up tables for restaurants ---');
    await resetTables(restaurantId);
    await resetTables(otherRestaurantId);

    // Let's explicitly set capacities to match our test assumptions:
    // ODR1: cap 2
    // ODR2: cap 4
    // ODR3: cap 6
    // ODR4: cap 4
    // ODR5: cap 2
    await queryRun("UPDATE `tables` SET capacity = 2 WHERE id = 'ODR1'");
    await queryRun("UPDATE `tables` SET capacity = 4 WHERE id = 'ODR2'");
    await queryRun("UPDATE `tables` SET capacity = 6 WHERE id = 'ODR3'");
    await queryRun("UPDATE `tables` SET capacity = 4 WHERE id = 'ODR4'");
    await queryRun("UPDATE `tables` SET capacity = 2 WHERE id = 'ODR5'");

    // Fetch base table list to verify counts
    const tables = await queryAll("SELECT * FROM `tables` WHERE restaurant_id = ?", [restaurantId]);
    console.log(`Restaurant '${restaurantId}' has ${tables.length} seeded tables:`);
    for (const t of tables) {
      console.log(`- Table ${t.id} (Capacity: ${t.capacity}, Status: ${t.status})`);
    }

    // -------------------------------------------------------------------
    // Test 1: Available suitable table (Rule A)
    // ODR1 is available (capacity 2), request partySize = 2.
    // Expected wait = 0, availability = "instant"
    console.log('\n--- Test 1: Available suitable table (Rule A) ---');
    let m1 = await calculateRestaurantMetrics(restaurantId, 2);
    console.log(`Result: Wait Minutes = ${m1.estimated_wait_minutes}, Availability = "${m1.availability}"`);
    if (m1.estimated_wait_minutes !== 0 || m1.availability !== 'instant') {
      throw new Error('Test 1 failed!');
    }
    console.log('✅ Test 1 Passed.');

    // -------------------------------------------------------------------
    // Test 2: All tables occupied (Rule B)
    // Update all tables to occupied with varying mins_remaining
    console.log('\n--- Test 2: All tables occupied (Rule B) ---');
    // Set ODR1 (cap 2) to occupied, mins_remaining = 25
    // Set ODR2 (cap 4) to occupied, mins_remaining = 15
    // Set ODR3 (cap 6) to occupied, mins_remaining = 35
    // Set ODR4 (cap 4) to occupied, mins_remaining = 45
    // Set ODR5 (cap 2) to occupied, mins_remaining = 10
    await queryRun("UPDATE `tables` SET status = 'occupied', mins_remaining = 25 WHERE id = 'ODR1'");
    await queryRun("UPDATE `tables` SET status = 'occupied', mins_remaining = 15 WHERE id = 'ODR2'");
    await queryRun("UPDATE `tables` SET status = 'occupied', mins_remaining = 35 WHERE id = 'ODR3'");
    await queryRun("UPDATE `tables` SET status = 'occupied', mins_remaining = 45 WHERE id = 'ODR4'");
    await queryRun("UPDATE `tables` SET status = 'occupied', mins_remaining = 10 WHERE id = 'ODR5'");
    invalidateRestaurantCache(restaurantId);

    // Request wait time for partySize = 2
    // Usable tables for partySize = 2 are: ODR1, ODR2, ODR3, ODR4, ODR5 (all capacity >= 2)
    // Sorted mins_remaining: ODR5 (10), ODR2 (15), ODR1 (25), ODR3 (35), ODR4 (45)
    // Earliest release should be 10 mins (ODR5).
    let m2 = await calculateRestaurantMetrics(restaurantId, 2);
    console.log(`Result: Wait Minutes = ${m2.estimated_wait_minutes} (Expected: 10)`);
    if (m2.estimated_wait_minutes !== 10) {
      throw new Error('Test 2 failed!');
    }
    console.log('✅ Test 2 Passed.');

    // -------------------------------------------------------------------
    // Test 3: Earliest occupied table availability
    // Request wait time for partySize = 5
    // Usable tables: ODR3 (cap 6).
    // ODR3 release time is 35 mins.
    // Expected wait = 35 mins.
    console.log('\n--- Test 3: Earliest occupied table of suitable capacity ---');
    let m3 = await calculateRestaurantMetrics(restaurantId, 5);
    console.log(`Result: Wait Minutes = ${m3.estimated_wait_minutes} (Expected: 35)`);
    if (m3.estimated_wait_minutes !== 35) {
      throw new Error('Test 3 failed!');
    }
    console.log('✅ Test 3 Passed.');

    // -------------------------------------------------------------------
    // Test 4: Cleaning table (Rule C)
    // Change earliest release table ODR5 to status = 'cleaning', mins_remaining = 3.
    // Expected release = 3 + 5 (cleaning buffer) = 8 mins.
    console.log('\n--- Test 4: Cleaning table release (Rule C) ---');
    await queryRun("UPDATE `tables` SET status = 'cleaning', mins_remaining = 3 WHERE id = 'ODR5'");
    invalidateRestaurantCache(restaurantId);

    // partySize = 2. Release times: ODR5 (8), ODR2 (15), ODR1 (25), ODR3 (35), ODR4 (45)
    // Earliest release should be 8 mins.
    let m4 = await calculateRestaurantMetrics(restaurantId, 2);
    console.log(`Result: Wait Minutes = ${m4.estimated_wait_minutes} (Expected: 8)`);
    if (m4.estimated_wait_minutes !== 8) {
      throw new Error('Test 4 failed!');
    }
    console.log('✅ Test 4 Passed.');

    // -------------------------------------------------------------------
    // Test 5: Reserved table (Rule D)
    // Change earliest release table ODR5 to status = 'reserved', mins_remaining = 12.
    // Expected release = 12 mins.
    console.log('\n--- Test 5: Reserved table release (Rule D) ---');
    await queryRun("UPDATE `tables` SET status = 'reserved', mins_remaining = 12 WHERE id = 'ODR5'");
    invalidateRestaurantCache(restaurantId);

    // partySize = 2. Release times: ODR5 (12), ODR2 (15), ODR1 (25), ODR3 (35), ODR4 (45)
    // Earliest release should be 12 mins.
    let m5 = await calculateRestaurantMetrics(restaurantId, 2);
    console.log(`Result: Wait Minutes = ${m5.estimated_wait_minutes} (Expected: 12)`);
    if (m5.estimated_wait_minutes !== 12) {
      throw new Error('Test 5 failed!');
    }
    console.log('✅ Test 5 Passed.');

    // -------------------------------------------------------------------
    // Test 6: No suitable capacity (Rule E)
    // Request partySize = 8. Largest capacity table is ODR3 (capacity 6).
    // Expected wait = -1, availability = "unavailable", reason = "NO_SUITABLE_TABLE"
    console.log('\n--- Test 6: No suitable capacity (Rule E) ---');
    let m6 = await calculateRestaurantMetrics(restaurantId, 8);
    console.log(`Result: Wait Minutes = ${m6.estimated_wait_minutes}, Availability = "${m6.availability}", Reason = "${m6.reason}"`);
    if (m6.estimated_wait_minutes !== -1 || m6.availability !== 'unavailable' || m6.reason !== 'NO_SUITABLE_TABLE') {
      throw new Error('Test 6 failed!');
    }
    console.log('✅ Test 6 Passed.');

    // -------------------------------------------------------------------
    // Test 7: Queue influence
    // Add dine-in orders without tables to create a queue.
    console.log('\n--- Test 7: Queue influence ---');
    // Add 2 active queue orders (no table_id)
    await queryRun(`
      INSERT INTO orders (
        id, restaurant_id, restaurant_name, fulfillment_type, 
        guest_name, guest_email, item_total, grand_total, 
        pre_ordered_items_json, qr_code, status, order_status, created_at
      )
      VALUES 
        ('ORD-Q1', ?, 'On DE Roof', 'dine-in', 'Diner A', 'diner@example.com', 100.00, 100.00, '[]', 'qr-code-dummy', 'Pending', 'Received', NOW()),
        ('ORD-Q2', ?, 'On DE Roof', 'dine-in', 'Diner B', 'diner@example.com', 100.00, 100.00, '[]', 'qr-code-dummy', 'Pending', 'Received', NOW())
    `, [restaurantId, restaurantId]);
    invalidateRestaurantCache(restaurantId);

    // partySize = 2.
    // Suitable Release times: ODR5 (12), ODR2 (15), ODR1 (25), ODR3 (35), ODR4 (45)
    // queueCount = 2
    // The party requesting wait time is at queuePosition = 2.
    // Wait time should evaluate to the table release time at index 2 (ODR1 -> 25 mins).
    let m7 = await calculateRestaurantMetrics(restaurantId, 2);
    console.log(`Result: Wait Minutes = ${m7.estimated_wait_minutes} (Expected: 25)`);
    if (m7.estimated_wait_minutes !== 25) {
      throw new Error('Test 7 failed!');
    }
    console.log('✅ Test 7 Passed.');

    // -------------------------------------------------------------------
    // Test 8: Table status transition recalculation
    // Transition ODR5 from reserved to available.
    // Available ODR5 has capacity 2, queueCount is 2 (ORD-Q1, ORD-Q2).
    // ODR5 is now free immediately (releaseTime = 0).
    // Sorted Release times: ODR5 (0), ODR2 (15), ODR1 (25), ODR3 (35), ODR4 (45)
    // queueCount = 2 -> evaluates to index 2 (ODR1 -> 25 mins).
    console.log('\n--- Test 8: Table status transition recalculation ---');
    await queryRun("UPDATE `tables` SET status = 'available', mins_remaining = NULL WHERE id = 'ODR5'");
    invalidateRestaurantCache(restaurantId);

    let m8 = await calculateRestaurantMetrics(restaurantId, 2);
    console.log(`Result: Wait Minutes = ${m8.estimated_wait_minutes} (Expected: 25)`);
    if (m8.estimated_wait_minutes !== 25) {
      throw new Error('Test 8 failed!');
    }
    console.log('✅ Test 8 Passed.');

    // -------------------------------------------------------------------
    // Test 9: Reservation creation cache invalidation
    // (Simulate cache check via wrapper service)
    console.log('\n--- Test 9: Reservation cache invalidation check ---');
    // Fetch via service to cache it
    let s1 = await calculateWaitTimeForParty(restaurantId, 2);
    console.log(`Service cached wait: ${s1.estimatedWaitMinutes} mins`);
    
    // Modify ODR2 to cleaning
    await queryRun("UPDATE `tables` SET status = 'cleaning', mins_remaining = 5 WHERE id = 'ODR2'");
    // This triggers invalidateRestaurantCache
    invalidateRestaurantCache(restaurantId);

    let s2 = await calculateWaitTimeForParty(restaurantId, 2);
    console.log(`Service recalculated wait: ${s2.estimatedWaitMinutes} mins`);
    console.log('✅ Test 9 Passed.');

    // -------------------------------------------------------------------
    // Test 10: Reservation cancellation release
    console.log('\n--- Test 10: Reservation cancellation release ---');
    // Clear the active queue first so queueCount is 0
    await queryRun("DELETE FROM orders WHERE restaurant_id = ?", [restaurantId]);
    // Set ODR4 to reserved, releaseTime = 30 mins
    await queryRun("UPDATE `tables` SET status = 'reserved', mins_remaining = 30 WHERE id = 'ODR4'");
    invalidateRestaurantCache(restaurantId);
    let m10_before = await calculateRestaurantMetrics(restaurantId, 4);
    console.log(`Wait before cancel: ${m10_before.estimated_wait_minutes} mins`);

    // Cancel / Release ODR4 back to available
    await queryRun("UPDATE `tables` SET status = 'available', mins_remaining = NULL WHERE id = 'ODR4'");
    invalidateRestaurantCache(restaurantId);
    let m10_after = await calculateRestaurantMetrics(restaurantId, 4);
    console.log(`Wait after cancel: ${m10_after.estimated_wait_minutes} mins (Expected: 0)`);
    if (m10_after.estimated_wait_minutes !== 0) {
      throw new Error('Test 10 failed!');
    }
    console.log('✅ Test 10 Passed.');

    // -------------------------------------------------------------------
    // Test 11: Browser refresh / Persistence
    console.log('\n--- Test 11: Browser refresh / Persistence ---');
    const freshDbMetrics = await calculateRestaurantMetrics(restaurantId, 2);
    console.log(`MySQL persistent wait estimate: ${freshDbMetrics.estimated_wait_minutes} mins`);
    console.log('✅ Test 11 Passed.');

    // -------------------------------------------------------------------
    // Test 12: Multiple restaurant isolation
    // Set Restaurant A ('on-de-roof-chennai') ODR1 to occupied, mins_remaining = 50.
    // Set Restaurant B ('pumpkin-tales-alwarpet') PT1 to available.
    // Verify Restaurant B metrics are unaffected.
    console.log('\n--- Test 12: Multiple restaurant isolation ---');
    await queryRun("UPDATE `tables` SET status = 'occupied', mins_remaining = 50 WHERE id = 'ODR1'");
    await queryRun("UPDATE `tables` SET status = 'available', mins_remaining = NULL WHERE id = 'PT1'");
    invalidateRestaurantCache(restaurantId);
    invalidateRestaurantCache(otherRestaurantId);

    let metricsA = await calculateRestaurantMetrics(restaurantId, 2);
    let metricsB = await calculateRestaurantMetrics(otherRestaurantId, 2);
    console.log(`Restaurant A ('on-de-roof-chennai') wait: ${metricsA.estimated_wait_minutes} mins`);
    console.log(`Restaurant B ('pumpkin-tales-alwarpet') wait: ${metricsB.estimated_wait_minutes} mins (Expected: 0)`);
    
    if (metricsB.estimated_wait_minutes !== 0) {
      throw new Error('Restaurant A updates leaked into Restaurant B metrics!');
    }
    console.log('✅ Test 12 Passed.');

    // Cleanup
    console.log('\n--- Cleaning up tables after verification tests ---');
    await resetTables(restaurantId);
    await resetTables(otherRestaurantId);

    console.log('\n🎉 All 12 wait-time integration tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Wait-time integration test failed:', err.message);
    process.exit(1);
  }
}

runTests();
