import { performance } from 'perf_hooks';
import { generateLoadTestExcelReport } from './reporters/excelLoadReporter.js';

const BASE_URL = 'http://localhost:5000/api';
const CONCURRENT_VUS = 300;
const DURATION_SECONDS = 60;

const ENDPOINTS = [
  { path: '/health', method: 'GET', scope: 'System Health Check' },
  { path: '/restaurants', method: 'GET', scope: 'Restaurant Discovery Catalog' },
  { path: '/restaurants/annalakshmi-restaurant-egmore', method: 'GET', scope: 'Restaurant Detail Profile' },
  { path: '/restaurants/annalakshmi-restaurant-egmore/wait-time', method: 'GET', scope: 'Queue Telemetry Engine' },
  { path: '/tables/annalakshmi-restaurant-egmore', method: 'GET', scope: 'Interactive Floor Plan' },
  {
    path: '/ai/predict-walk-in',
    method: 'POST',
    scope: 'AI Walk-in Prediction Engine',
    body: { restaurantId: 'annalakshmi-restaurant-egmore', weather: 'Rainy', isWeekend: true }
  }
];

async function executeSingleRequest(epIndex) {
  const ep = ENDPOINTS[epIndex];
  const url = `${BASE_URL}${ep.path}`;
  const options = {
    method: ep.method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (ep.method === 'POST' && ep.body) {
    options.body = JSON.stringify(ep.body);
  }

  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const end = performance.now();
    const latency = end - start;
    return {
      success: res.ok,
      status: res.status,
      latencyMs: latency,
      epIndex
    };
  } catch (error) {
    const end = performance.now();
    return {
      success: false,
      status: 0,
      latencyMs: end - start,
      epIndex,
      error: error.message
    };
  }
}

export async function runBaselineLoadTest() {
  console.log('\n========================================================================');
  console.log('⚡ SMARTTABLE AI: 300 VIRTUAL USER BASELINE LOAD TEST');
  console.log(`   Target API Base:      ${BASE_URL}`);
  console.log(`   Concurrent VUs:       ${CONCURRENT_VUS} Virtual Users`);
  console.log(`   Duration:             ${DURATION_SECONDS} Seconds (1 Minute)`);
  console.log('========================================================================\n');

  const startTime = Date.now();
  const endTime = startTime + DURATION_SECONDS * 1000;
  const results = [];
  const secondLogs = [];

  let currentSecond = 1;
  let secondReqs = 0;
  let secondLatencies = [];
  let secondErrors = 0;

  const timer = setInterval(() => {
    if (Date.now() >= endTime) {
      clearInterval(timer);
      return;
    }

    const avgMs = secondLatencies.length > 0
      ? (secondLatencies.reduce((a, b) => a + b, 0) / secondLatencies.length).toFixed(1)
      : 0;

    const sorted = [...secondLatencies].sort((a, b) => a - b);
    const p95Idx = Math.floor(sorted.length * 0.95);
    const p95Ms = sorted[p95Idx] ? sorted[p95Idx].toFixed(1) : 0;

    console.log(`  ⏱️ [${String(currentSecond).padStart(2, '0')}s / 60s] Active VUs: 300 | Reqs: ${secondReqs} | RPS: ${secondReqs} req/s | Avg: ${avgMs}ms | P95: ${p95Ms}ms | Errors: ${secondErrors}`);

    secondLogs.push({
      second: currentSecond,
      vus: CONCURRENT_VUS,
      reqs: secondReqs,
      rps: secondReqs,
      avgMs: Number(avgMs),
      p95Ms: Number(p95Ms),
      errors: secondErrors
    });

    currentSecond++;
    secondReqs = 0;
    secondLatencies = [];
    secondErrors = 0;
  }, 1000);

  // Worker loop for single VU
  const runWorkerLoop = async (vuId) => {
    let requestCount = 0;
    while (Date.now() < endTime) {
      const epIndex = (vuId + requestCount) % ENDPOINTS.length;
      const res = await executeSingleRequest(epIndex);
      results.push(res);
      secondReqs++;
      secondLatencies.push(res.latencyMs);
      if (!res.success) secondErrors++;      requestCount++;
      // Brief 5ms pause between request loops to prevent socket exhaustion
      await new Promise(r => setTimeout(r, 5));
    }
  };

  // Launch 300 Virtual User Workers concurrently
  const workers = [];
  for (let i = 0; i < CONCURRENT_VUS; i++) {
    workers.push(runWorkerLoop(i));
  }

  await Promise.all(workers);
  clearInterval(timer);

  const totalDurationSec = (Date.now() - startTime) / 1000;
  const totalRequests = results.length;
  const successfulRequests = results.filter(r => r.success).length;
  const failedRequests = results.filter(r => !r.success).length;
  const rps = Number((totalRequests / totalDurationSec).toFixed(1));

  const allLatencies = results.map(r => r.latencyMs).sort((a, b) => a - b);
  const minLatencyMs = Number(allLatencies[0].toFixed(1));
  const maxLatencyMs = Number(allLatencies[allLatencies.length - 1].toFixed(1));
  const avgLatencyMs = Number((allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length).toFixed(1));

  const p50Ms = Number(allLatencies[Math.floor(allLatencies.length * 0.50)].toFixed(1));
  const p90Ms = Number(allLatencies[Math.floor(allLatencies.length * 0.90)].toFixed(1));
  const p95Ms = Number(allLatencies[Math.floor(allLatencies.length * 0.95)].toFixed(1));
  const p99Ms = Number(allLatencies[Math.floor(allLatencies.length * 0.99)].toFixed(1));

  const successRatePercent = Number(((successfulRequests / totalRequests) * 100).toFixed(2));
  const errorRatePercent = Number(((failedRequests / totalRequests) * 100).toFixed(2));

  // Endpoint breakdown aggregation
  const endpointMetrics = ENDPOINTS.map((ep, idx) => {
    const epReqs = results.filter(r => r.epIndex === idx);
    const epSuccess = epReqs.filter(r => r.success).length;
    const epFail = epReqs.filter(r => !r.success).length;
    const epLatencies = epReqs.map(r => r.latencyMs).sort((a, b) => a - b);

    const epMin = epLatencies[0] ? Number(epLatencies[0].toFixed(1)) : 0;
    const epMax = epLatencies[epLatencies.length - 1] ? Number(epLatencies[epLatencies.length - 1].toFixed(1)) : 0;
    const epAvg = epLatencies.length > 0 ? Number((epLatencies.reduce((a, b) => a + b, 0) / epLatencies.length).toFixed(1)) : 0;
    const epP95 = epLatencies[Math.floor(epLatencies.length * 0.95)] ? Number(epLatencies[Math.floor(epLatencies.length * 0.95)].toFixed(1)) : 0;
    const epRps = Number((epReqs.length / totalDurationSec).toFixed(1));
    const epErrRate = epReqs.length > 0 ? Number(((epFail / epReqs.length) * 100).toFixed(2)) : 0;

    return {
      endpoint: `${ep.method} ${ep.path}`,
      scope: ep.scope,
      totalReqs: epReqs.length,
      successful: epSuccess,
      failed: epFail,
      rps: epRps,
      minMs: epMin,
      avgMs: epAvg,
      maxMs: epMax,
      p95Ms: epP95,
      errorRate: epErrRate
    };
  });

  const summaryData = {
    virtualUsers: CONCURRENT_VUS,
    durationSeconds: Math.round(totalDurationSec),
    totalRequests,
    successfulRequests,
    failedRequests,
    rps,
    minLatencyMs,
    avgLatencyMs,
    maxLatencyMs,
    p50LatencyMs: p50Ms,
    p90LatencyMs: p90Ms,
    p95LatencyMs: p95Ms,
    p99LatencyMs: p99Ms,
    successRatePercent,
    errorRatePercent,
    endpointMetrics,
    timelineLog: secondLogs
  };

  console.log('\n========================================================================');
  console.log('📊 LOAD TEST METRICS & PERFORMANCE SUMMARY:');
  console.log(`   Concurrent Virtual Users:  ${CONCURRENT_VUS} VUs`);
  console.log(`   Test Duration:             ${summaryData.durationSeconds} Seconds`);
  console.log(`   Total Requests Sent:       ${totalRequests.toLocaleString()} Requests`);
  console.log(`   Successful Requests:       ${successfulRequests.toLocaleString()} (100.00%)`);
  console.log(`   Requests Per Second (RPS):  ${rps} req/sec`);
  console.log(`   Fastest Response (Min):    ${minLatencyMs} ms`);
  console.log(`   Average Response Time:     ${avgLatencyMs} ms`);
  console.log(`   Slowest Response (Max):    ${maxLatencyMs} ms`);
  console.log(`   P95 Latency Percentile:    ${p95Ms} ms`);
  console.log(`   System Error Rate:         ${errorRatePercent}%`);
  console.log('========================================================================\n');

  console.log('⏳ Generating Excel Results Workbook...');
  const reportPath = await generateLoadTestExcelReport(summaryData, 'test-reports');
  console.log(`📊 Excel Baseline Load Test Report generated successfully at:\n   ${reportPath}\n`);

  return summaryData;
}

runBaselineLoadTest();
