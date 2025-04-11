/**
 * Comprehensive End-to-End Test Script for Legal Practice Management Solution
 * 
 * This script runs all tests for the Legal Practice Management System
 * including IOLTA trust accounting, client portal, document management,
 * time & expense tracking, and reporting functionalities.
 */

import { TestCoordinatorService } from '../server/services/testing/test-coordinator';
import { IoltaTestService } from '../server/services/testing/test-legal-iolta';
import { IoltaReconciliationTestService } from '../server/services/testing/test-iolta-reconciliation';
import { ClientPortalTestService } from '../server/services/testing/test-client-portal';
import { LegalTimeExpenseTestService } from '../server/services/testing/test-legal-time-expense';
import { LegalReportingTestService } from '../server/services/testing/test-legal-reporting';
import { TestReport, TestGroup } from '../server/services/testing/test-interfaces';
import * as fs from 'fs';
import * as path from 'path';

// Directory for storing test reports
const REPORT_DIR = path.join(__dirname, '..', 'test-reports');

/**
 * Run all legal system tests and generate a comprehensive report
 */
async function runLegalSystemTests() {
  console.log('Starting comprehensive Legal System tests...');
  console.log('===============================================\n');
  
  // Ensure reports directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  
  // Initialize test coordinator and register test services
  const testCoordinator = new TestCoordinatorService();
  
  // Core IOLTA functionality
  const ioltaTestService = new IoltaTestService();
  
  // IOLTA Reconciliation functionality
  const ioltaReconciliationTestService = new IoltaReconciliationTestService();
  
  // Client Portal functionality
  const clientPortalTestService = new ClientPortalTestService();
  
  // Time & Expense tracking functionality
  const timeExpenseTestService = new LegalTimeExpenseTestService();
  
  // Reporting functionality
  const reportingTestService = new LegalReportingTestService();
  
  // Register all test services
  testCoordinator.registerTestService('iolta', ioltaTestService);
  testCoordinator.registerTestService('iolta-reconciliation', ioltaReconciliationTestService);
  testCoordinator.registerTestService('client-portal', clientPortalTestService);
  testCoordinator.registerTestService('time-expense', timeExpenseTestService);
  testCoordinator.registerTestService('reporting', reportingTestService);
  
  try {
    console.log('Running all legal system tests...');
    
    // Run all tests
    const testReport = await testCoordinator.runAllTests();
    
    // Generate summary report
    const summaryReport = generateSummaryReport(testReport);
    
    // Save report to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORT_DIR, `legal-system-test-report-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));
    
    console.log('\nLegal System Test Summary:');
    console.log('==============================');
    console.log(`Total Test Suites: ${summaryReport.totalTestSuites}`);
    console.log(`Total Tests: ${summaryReport.totalTests}`);
    console.log(`Passed Tests: ${summaryReport.passedTests}`);
    console.log(`Failed Tests: ${summaryReport.failedTests}`);
    console.log(`Pass Rate: ${(summaryReport.passRate * 100).toFixed(2)}%`);
    console.log(`Overall Status: ${summaryReport.passed ? 'PASSED' : 'FAILED'}`);
    
    if (summaryReport.failedTestGroups.length > 0) {
      console.log('\nFailed Test Groups:');
      summaryReport.failedTestGroups.forEach(group => {
        console.log(`- ${group.name}: ${group.description}`);
        group.failedTests.forEach(test => {
          console.log(`  * ${test.name}: ${test.error}`);
        });
      });
    }
    
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
    // Return success/failure status
    return summaryReport.passed ? 0 : 1;
  } catch (error) {
    console.error('Error running legal system tests:', error);
    return 1;
  }
}

/**
 * Generate a summary report from the test results
 */
function generateSummaryReport(testReport: TestReport) {
  const summary = {
    timestamp: new Date(),
    totalTestSuites: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0,
    passed: testReport.passed,
    testSuites: [] as any[],
    failedTestGroups: [] as any[]
  };
  
  // Count total test suites
  summary.totalTestSuites = testReport.testGroups?.length || 0;
  
  // Process each test group
  testReport.testGroups?.forEach(group => {
    const groupSummary = {
      name: group.name,
      description: group.description,
      totalTests: group.tests.length,
      passedTests: group.tests.filter(t => t.passed).length,
      failedTests: group.tests.filter(t => !t.passed).length,
      passed: group.passed,
      failedTests: group.tests.filter(t => !t.passed).map(t => ({
        name: t.name,
        error: t.error
      }))
    };
    
    // Add to test suites summary
    summary.testSuites.push(groupSummary);
    
    // Count total tests
    summary.totalTests += groupSummary.totalTests;
    summary.passedTests += groupSummary.passedTests;
    summary.failedTests += groupSummary.failedTests;
    
    // Add to failed test groups if necessary
    if (!group.passed) {
      summary.failedTestGroups.push(groupSummary);
    }
  });
  
  // Calculate pass rate
  summary.passRate = summary.totalTests > 0 ? summary.passedTests / summary.totalTests : 0;
  
  return summary;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runLegalSystemTests()
    .then(statusCode => {
      process.exit(statusCode);
    })
    .catch(error => {
      console.error('Unhandled error in test script:', error);
      process.exit(1);
    });
}

export { runLegalSystemTests };