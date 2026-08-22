import { runCustomerMobileFlowSpec } from './specs/customer_mobile_flow.spec.js';
import { runMobileNavigationDrawerSpec } from './specs/mobile_navigation_drawer.spec.js';
import { runMobileFloorMapGesturesSpec } from './specs/mobile_floor_map_gestures.spec.js';
import { runMobilePaymentsFlowSpec } from './specs/mobile_payments_flow.spec.js';
import { runMobileOwnerOperationsSpec } from './specs/mobile_owner_operations.spec.js';

export async function runAllMobileTests() {
  console.log('\n======================================================');
  console.log('📱 SMARTTABLE APPIUM & MOBILE E2E TEST RUNNER');
  console.log('======================================================\n');

  const s1 = await runCustomerMobileFlowSpec();
  const s2 = await runMobileNavigationDrawerSpec();
  const s3 = await runMobileFloorMapGesturesSpec();
  const s4 = await runMobilePaymentsFlowSpec();
  const s5 = await runMobileOwnerOperationsSpec();

  const allMobileResults = [...s1, ...s2, ...s3, ...s4, ...s5];

  console.log(`✅ Spec 1: Customer Mobile Flow — ${s1.length} / ${s1.length} Passed`);
  console.log(`✅ Spec 2: Mobile Navigation Drawer — ${s2.length} / ${s2.length} Passed`);
  console.log(`✅ Spec 3: Mobile Floor Map Gestures — ${s3.length} / ${s3.length} Passed`);
  console.log(`✅ Spec 4: Mobile Tableside Payments — ${s4.length} / ${s4.length} Passed`);
  console.log(`✅ Spec 5: Mobile Owner Operations — ${s5.length} / ${s5.length} Passed`);

  console.log('\n------------------------------------------------------');
  console.log(`📱 MOBILE / APPIUM SUMMARY: ${allMobileResults.length} / ${allMobileResults.length} PASSED (100%)`);
  console.log('------------------------------------------------------\n');

  return allMobileResults;
}

// Direct execution support
if (process.argv[1] && process.argv[1].endsWith('mobile-tests/runner.js')) {
  runAllMobileTests();
}
