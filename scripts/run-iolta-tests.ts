/**
 * Run IOLTA Tests
 * 
 * This script runs the tests specifically for the IOLTA Trust Accounting system
 * to validate that all functionality is working correctly after schema updates.
 * 
 * Usage: npx tsx scripts/run-iolta-tests.ts
 */

import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';
import { IoltaTestService } from '../server/services/testing/test-legal-iolta';
import { TestReport } from '../server/services/testing/test-interfaces';
import { ClientPortalTestService } from '../server/services/testing/test-client-portal';
import { IoltaReconciliationTestService } from '../server/services/testing/test-iolta-reconciliation';

// Define text colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightGreen: '\x1b[92m',
  brightRed: '\x1b[91m'
};

/**
 * Print a section header
 */
function printHeader(text: string): void {
  console.log();
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log();
}

/**
 * Format a test report for console output
 */
function formatTestReport(report: TestReport): void {
  printHeader(`Test Report: ${report.serviceName}`);
  
  const totalTests = report.testGroups.reduce((sum, group) => sum + group.tests.length, 0);
  const passedTests = report.testGroups.reduce((sum, group) => 
    sum + group.tests.filter(test => test.passed).length, 0);
  
  // Print summary status with color
  if (report.passed) {
    console.log(`${colors.brightGreen}✅ PASSED${colors.reset} - ${passedTests}/${totalTests} tests passed`);
  } else {
    console.log(`${colors.brightRed}❌ FAILED${colors.reset} - ${passedTests}/${totalTests} tests passed`);
  }
  
  console.log();
  
  // Print detailed test groups
  report.testGroups.forEach(group => {
    const passedGroupTests = group.tests.filter(test => test.passed).length;
    const groupStatus = group.passed 
      ? `${colors.green}✓${colors.reset}` 
      : `${colors.red}✗${colors.reset}`;
    
    console.log(`${groupStatus} ${group.name} (${passedGroupTests}/${group.tests.length})`);
    
    // Print individual tests
    group.tests.forEach(test => {
      const testStatus = test.passed 
        ? `${colors.green}  ✓${colors.reset}` 
        : `${colors.red}  ✗${colors.reset}`;
      
      console.log(`${testStatus} ${test.name}`);
      
      // Print error if test failed
      if (!test.passed && test.error) {
        console.log(`    ${colors.red}Error: ${test.error}${colors.reset}`);
      }
      
      // Print expected vs actual if provided
      if (!test.passed && test.expected && test.actual) {
        console.log(`    ${colors.yellow}Expected:${colors.reset}`, test.expected);
        console.log(`    ${colors.yellow}Actual:${colors.reset}`, test.actual);
      }
    });
    
    console.log();
  });
  
  console.log(`${colors.gray}Test completed in ${(report.endTime.getTime() - report.startTime.getTime()) / 1000}s${colors.reset}`);
  console.log();
}

/**
 * Run all IOLTA-related tests
 */
async function runIoltaTests(): Promise<void> {
  printHeader('IOLTA Trust Accounting System Tests');
  
  console.log('Checking database schema for IOLTA tables...');
  
  // Check that critical columns exist
  const schemaCheck = await db.execute(sql`
    SELECT 
      (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' AND column_name = 'merchant_id') > 0 AS has_merchant_id,
      (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' AND column_name = 'balance_after') > 0 AS has_balance_after,
      (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = 'iolta_client_ledgers' AND column_name = 'current_balance') > 0 AS has_current_balance
  `);
  
  const results = schemaCheck.rows[0];
  
  if (results.has_merchant_id && results.has_balance_after && results.has_current_balance) {
    console.log(`${colors.green}✅ All required IOLTA columns are present in the database schema${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Missing critical IOLTA columns in the database schema${colors.reset}`);
    console.log(`- merchant_id in iolta_transactions: ${results.has_merchant_id ? '✓' : '✗'}`);
    console.log(`- balance_after in iolta_transactions: ${results.has_balance_after ? '✓' : '✗'}`);
    console.log(`- current_balance in iolta_client_ledgers: ${results.has_current_balance ? '✓' : '✗'}`);
    
    console.log();
    console.log(`${colors.yellow}Please run 'npx tsx scripts/fix-iolta-tables.ts' to fix missing columns${colors.reset}`);
    process.exit(1);
  }

  // Now run the tests
  console.log('\nRunning IOLTA core functionality tests...');
  const ioltaTestService = new IoltaTestService();
  const ioltaTestReport = await ioltaTestService.runTests();
  formatTestReport(ioltaTestReport);
  
  console.log('\nRunning IOLTA client portal tests...');
  const clientPortalTestService = new ClientPortalTestService();
  const clientPortalTestReport = await clientPortalTestService.runTests();
  formatTestReport(clientPortalTestReport);
  
  console.log('\nRunning IOLTA reconciliation tests...');
  const ioltaReconciliationTestService = new IoltaReconciliationTestService();
  const reconciliationTestReport = await ioltaReconciliationTestService.runTests();
  formatTestReport(reconciliationTestReport);
  
  // Print overall summary
  const allTestsPassed = ioltaTestReport.passed && 
    clientPortalTestReport.passed && 
    reconciliationTestReport.passed;
  
  printHeader('IOLTA Test Summary');
  
  if (allTestsPassed) {
    console.log(`${colors.brightGreen}✅ ALL TESTS PASSED${colors.reset}`);
    console.log(`${colors.green}The IOLTA Trust Accounting System is functioning correctly${colors.reset}`);
  } else {
    console.log(`${colors.brightRed}❌ SOME TESTS FAILED${colors.reset}`);
    console.log(`${colors.red}Please review the test reports above for details${colors.reset}`);
    
    // List which test suites failed
    if (!ioltaTestReport.passed) {
      console.log(`- ${colors.red}IOLTA Core Functionality Tests failed${colors.reset}`);
    }
    if (!clientPortalTestReport.passed) {
      console.log(`- ${colors.red}IOLTA Client Portal Tests failed${colors.reset}`);
    }
    if (!reconciliationTestReport.passed) {
      console.log(`- ${colors.red}IOLTA Reconciliation Tests failed${colors.reset}`);
    }
  }
}

// Execute the function
runIoltaTests()
  .then(() => {
    console.log('IOLTA tests completed');
    pool.end(); // Close the database connection
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running IOLTA tests:', error);
    pool.end(); // Close the database connection even if there's an error
    process.exit(1);
  });