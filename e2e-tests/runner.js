import { runAuthSuite } from './suites/auth_suite.js';
import { runDiscoverySuite } from './suites/discovery_suite.js';
import { runFloorMapSuite } from './suites/floormap_suite.js';
import { runReservationSuite } from './suites/reservation_suite.js';
import { runMenuOrderSuite } from './suites/menu_order_suite.js';
import { runBillingPaymentSuite } from './suites/billing_payment_suite.js';
import { runTelemetrySocketSuite } from './suites/telemetry_socket_suite.js';
import { runOwnerDashboardSuite } from './suites/owner_dashboard_suite.js';
import { runSuperAdminSuite } from './suites/super_admin_suite.js';
import { runAiPredictorSuite } from './suites/ai_predictor_suite.js';
import { runResilienceSecuritySuite } from './suites/resilience_security_suite.js';
import { runAllMobileTests } from '../mobile-tests/runner.js';
import { generateExcelReport } from './reporters/excelReporter.js';

async function runMasterE2ETestEngine() {
  console.log('\n========================================================================');
  console.log('🚀 SMARTTABLE AI: MASTER END-TO-END AUTOMATION & QA TEST RUNNER');
  console.log('   Targeting Web (Selenium / REST / Socket.IO) & Mobile (Appium Specs)');
  console.log('========================================================================\n');

  const startTime = Date.now();

  console.log('⏳ Executing Web E2E Test Suites...');
  const r1 = await runAuthSuite();
  console.log(`  [1/11] Authentication & RBAC Suite: ${r1.filter(r => r.status === 'PASS').length}/${r1.length} Passed`);

  const r2 = await runDiscoverySuite();
  console.log(`  [2/11] Restaurant Discovery & Radar Suite: ${r2.filter(r => r.status === 'PASS').length}/${r2.length} Passed`);

  const r3 = await runFloorMapSuite();
  console.log(`  [3/11] Interactive Floor Map & Telemetry Suite: ${r3.filter(r => r.status === 'PASS').length}/${r3.length} Passed`);

  const r4 = await runReservationSuite();
  console.log(`  [4/11] Table Reservation & Bookings Suite: ${r4.filter(r => r.status === 'PASS').length}/${r4.length} Passed`);

  const r5 = await runMenuOrderSuite();
  console.log(`  [5/11] Menu Pre-Ordering & Kitchen Orders Suite: ${r5.filter(r => r.status === 'PASS').length}/${r5.length} Passed`);

  const r6 = await runBillingPaymentSuite();
  console.log(`  [6/11] Tableside Billing & Payments Suite: ${r6.filter(r => r.status === 'PASS').length}/${r6.length} Passed`);

  const r7 = await runTelemetrySocketSuite();
  console.log(`  [7/11] Socket.IO Telemetry & Real-Time Sync Suite: ${r7.filter(r => r.status === 'PASS').length}/${r7.length} Passed`);

  const r8 = await runOwnerDashboardSuite();
  console.log(`  [8/11] Restaurant Owner Control Center Suite: ${r8.filter(r => r.status === 'PASS').length}/${r8.length} Passed`);

  const r9 = await runSuperAdminSuite();
  console.log(`  [9/11] Super Admin Governance Suite: ${r9.filter(r => r.status === 'PASS').length}/${r9.length} Passed`);

  const r10 = await runAiPredictorSuite();
  console.log(`  [10/11] AI Predictions & Crowd Analytics Suite: ${r10.filter(r => r.status === 'PASS').length}/${r10.length} Passed`);

  const r11 = await runResilienceSecuritySuite();
  console.log(`  [11/11] System Resilience & API Hardening Suite: ${r11.filter(r => r.status === 'PASS').length}/${r11.length} Passed`);

  console.log('\n⏳ Executing Mobile & Appium Test Suites...');
  const rMobile = await runAllMobileTests();

  const allTestResults = [
    ...r1, ...r2, ...r3, ...r4, ...r5, ...r6, ...r7, ...r8, ...r9, ...r10, ...r11,
    ...rMobile
  ];

  const total = allTestResults.length;
  const passed = allTestResults.filter(r => r.status === 'PASS').length;
  const failed = allTestResults.filter(r => r.status === 'FAIL').length;
  const passRate = ((passed / total) * 100).toFixed(2);
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n========================================================================');
  console.log('📊 MASTER TEST EXECUTION SUMMARY:');
  console.log(`   Total Test Cases Executed: ${total}`);
  console.log(`   Passed:                     ${passed} ✅`);
  console.log(`   Failed:                     ${failed} ❌`);
  console.log(`   Pass Rate:                  ${passRate}%`);
  console.log(`   Total Execution Time:       ${totalDuration} seconds`);
  console.log('========================================================================\n');

  console.log('⏳ Generating Excel Analysis Report...');
  const reportPath = await generateExcelReport(allTestResults, 'test-reports');

  if (failed > 0) {
    console.error(`\n❌ Test execution failed with ${failed} failing test cases.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${passed} test cases passed successfully!`);
    console.log(`📁 Report available at: ${reportPath}\n`);
  }
}

runMasterE2ETestEngine();
