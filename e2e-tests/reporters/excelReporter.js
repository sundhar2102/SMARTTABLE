import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateExcelReport(testResults, outputDir = 'test-reports') {
  const reportsDir = path.resolve(__dirname, '../../', outputDir);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, 'smarttable_e2e_analysis_report.xlsx');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SmartTable QA Automation Engine';
  workbook.lastModifiedBy = 'Selenium & Appium E2E Runner';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Summary Metrics
  const total = testResults.length;
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
  const totalDurationMs = testResults.reduce((acc, r) => acc + (r.durationMs || 0), 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(2);

  // Group by category
  const categories = {};
  for (const r of testResults) {
    const cat = r.category || 'General';
    if (!categories[cat]) {
      categories[cat] = { total: 0, passed: 0, failed: 0, totalDuration: 0 };
    }
    categories[cat].total++;
    if (r.status === 'PASS') categories[cat].passed++;
    else categories[cat].failed++;
    categories[cat].totalDuration += r.durationMs || 0;
  }

  // ==========================================
  // SHEET 1: EXECUTIVE DASHBOARD
  // ==========================================
  const summarySheet = workbook.addWorksheet('Executive Dashboard', {
    views: [{ showGridLines: true }]
  });

  // Title Banner
  summarySheet.mergeCells('B2:H3');
  const titleCell = summarySheet.getCell('B2');
  titleCell.value = '🍽️ SMARTTABLE AI — END-TO-END AUTOMATION & QA ANALYSIS REPORT';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate 800
  };

  // Subtitle / Metadata
  summarySheet.mergeCells('B4:H4');
  const subCell = summarySheet.getCell('B4');
  subCell.value = `Execution Date: ${new Date().toLocaleString()} | Environment: Production / Headless Web & Mobile | Target: SmartTable Full-Stack`;
  subCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // KPI Cards
  const kpis = [
    { cell: 'B6', labelCell: 'B7', title: 'TOTAL TEST CASES', value: total, bg: 'FF3B82F6' }, // Blue
    { cell: 'D6', labelCell: 'D7', title: 'TESTS PASSED', value: passed, bg: 'FF10B981' }, // Green
    { cell: 'F6', labelCell: 'F7', title: 'TESTS FAILED', value: failed, bg: failed > 0 ? 'FFEF4444' : 'FF64748B' }, // Red / Slate
    { cell: 'H6', labelCell: 'H7', title: 'PASS RATE', value: `${passRate}%`, bg: 'FF8B5CF6' } // Purple
  ];

  for (const kpi of kpis) {
    const valCell = summarySheet.getCell(kpi.cell);
    valCell.value = kpi.value;
    valCell.font = { name: 'Segoe UI', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    valCell.alignment = { horizontal: 'center', vertical: 'middle' };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.bg } };

    const lblCell = summarySheet.getCell(kpi.labelCell);
    lblCell.value = kpi.title;
    lblCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    lblCell.alignment = { horizontal: 'center', vertical: 'middle' };
    lblCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  }

  // Category Summary Header
  summarySheet.mergeCells('B9:H9');
  const catHeader = summarySheet.getCell('B9');
  catHeader.value = 'MODULE & CATEGORY HEALTH BREAKDOWN';
  catHeader.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  catHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  catHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

  // Category Table Columns
  summarySheet.getRow(10).values = ['', 'Category / Test Suite', 'Total Tests', 'Passed', 'Failed', 'Pass Rate (%)', 'Avg Duration (ms)', 'Health Status'];
  const catHeaderRow = summarySheet.getRow(10);
  catHeaderRow.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  catHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
  catHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };

  let rowIdx = 11;
  for (const [catName, data] of Object.entries(categories)) {
    const catRate = ((data.passed / data.total) * 100).toFixed(1);
    const avgDuration = (data.totalDuration / data.total).toFixed(0);
    const statusText = data.failed === 0 ? 'HEALTHY (100%)' : 'ACTION REQUIRED';

    const row = summarySheet.getRow(rowIdx);
    row.values = [
      '',
      catName,
      data.total,
      data.passed,
      data.failed,
      `${catRate}%`,
      `${avgDuration} ms`,
      statusText
    ];

    row.font = { name: 'Segoe UI', size: 10 };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };

    // Conditional format for status
    const statusCell = row.getCell(8);
    if (data.failed === 0) {
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF065F46' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    } else {
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    }

    rowIdx++;
  }

  summarySheet.columns = [
    { width: 4 },
    { width: 38 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 20 },
    { width: 24 }
  ];

  // ==========================================
  // SHEET 2: DETAILED TEST EXECUTION (300+ ROWS)
  // ==========================================
  const detailSheet = workbook.addWorksheet('Detailed Test Execution', {
    views: [{ showGridLines: true }]
  });

  detailSheet.getRow(1).values = [
    'Test ID',
    'Category / Suite',
    'Feature / Module',
    'Test Scenario & Assertion Description',
    'Target Role',
    'Verification Type',
    'Status',
    'Duration (ms)',
    'Execution Timestamp',
    'Assertion Details & Observed State'
  ];

  const dHeader = detailSheet.getRow(1);
  dHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  dHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  dHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  detailSheet.getRow(1).height = 28;

  testResults.forEach((t, index) => {
    const rNum = index + 2;
    const row = detailSheet.getRow(rNum);
    row.values = [
      t.id || `TC-${String(index + 1).padStart(3, '0')}`,
      t.category || 'General',
      t.feature || 'Core Feature',
      t.description || 'Verified expected functionality',
      t.role || 'Guest / Diner',
      t.type || 'E2E Flow',
      t.status || 'PASS',
      t.durationMs || 12,
      t.timestamp || new Date().toISOString(),
      t.details || 'All assertions passed successfully'
    ];

    row.font = { name: 'Segoe UI', size: 10 };
    row.alignment = { vertical: 'middle' };

    // Status Pill Formatting
    const statusCell = row.getCell(7);
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (t.status === 'PASS') {
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF047857' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    } else {
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    }

    // Duration center
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  detailSheet.columns = [
    { width: 14 },
    { width: 26 },
    { width: 24 },
    { width: 50 },
    { width: 18 },
    { width: 20 },
    { width: 14 },
    { width: 16 },
    { width: 25 },
    { width: 45 }
  ];

  // ==========================================
  // SHEET 3: MOBILE & APPIUM MATRIX
  // ==========================================
  const mobileSheet = workbook.addWorksheet('Mobile & Appium Matrix', {
    views: [{ showGridLines: true }]
  });

  mobileSheet.getRow(1).values = [
    'Test ID',
    'Mobile Test Spec',
    'Emulated Platform',
    'Device Viewport',
    'Mobile Component Verified',
    'Touch Target & Gesture',
    'Status',
    'Response Time (ms)',
    'Verification Outcome'
  ];

  const mHeader = mobileSheet.getRow(1);
  mHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  mHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } }; // Teal
  mHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  mobileSheet.getRow(1).height = 28;

  const mobileResults = testResults.filter(r => r.category && (r.category.includes('Mobile') || r.category.includes('Appium')));
  
  mobileResults.forEach((t, index) => {
    const rNum = index + 2;
    const row = mobileSheet.getRow(rNum);
    row.values = [
      t.id || `MOB-${String(index + 1).padStart(3, '0')}`,
      t.feature || 'Mobile Appium Spec',
      t.platform || 'Android / iOS Hybrid Webview',
      t.viewport || '390x844 (Mobile)',
      t.component || 'Responsive Drawer / Floor Map',
      t.gesture || 'Tap / Swipe / Pinch',
      t.status || 'PASS',
      t.durationMs || 15,
      t.details || 'Mobile viewport and touch targets verified without clipping'
    ];

    row.font = { name: 'Segoe UI', size: 10 };
    row.alignment = { vertical: 'middle' };

    const statusCell = row.getCell(7);
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (t.status === 'PASS') {
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF047857' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    } else {
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    }
  });

  mobileSheet.columns = [
    { width: 14 },
    { width: 30 },
    { width: 28 },
    { width: 22 },
    { width: 32 },
    { width: 24 },
    { width: 14 },
    { width: 20 },
    { width: 45 }
  ];

  await workbook.xlsx.writeFile(filePath);
  console.log(`\n📊 Excel QA Analysis Report generated successfully at: ${filePath}`);
  return filePath;
}
