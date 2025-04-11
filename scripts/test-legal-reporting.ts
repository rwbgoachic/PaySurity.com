/**
 * Legal Reporting System Testing Script
 * 
 * This script tests the legal reporting system capabilities including:
 * - Report definition creation and management
 * - Scheduled report functionality
 * - Report generation in various formats
 * - Access control and security for reports
 */

import { legalReportingSystemTestService } from '../server/services/testing/test-legal-reporting';
import { TestReport } from '../server/services/testing/test-interfaces';
import * as fs from 'fs';
import * as path from 'path';

async function runLegalReportingTests() {
  console.log('📋 PaySurity.com Legal Reporting System Tests');
  console.log('===========================================');
  console.log('Starting legal reporting system tests...\n');
  
  try {
    // Run legal reporting tests
    const startTime = Date.now();
    const report: TestReport = await legalReportingSystemTestService.runComprehensiveTests();
    const duration = Date.now() - startTime;
    
    // Calculate statistics
    const totalTests = report.tests.length;
    const passedTests = report.testsPassed;
    const failedTests = report.testsFailed;
    const passRate = passedTests / totalTests * 100;
    
    // Save report to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../test-reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, `legal-reporting-test-report-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display results
    console.log('\n✅ Legal Reporting System Tests Complete');
    console.log('=======================================');
    console.log(`Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed Tests: ${passedTests}`);
    console.log(`Failed Tests: ${failedTests}`);
    console.log(`Pass Rate: ${passRate.toFixed(2)}%`);
    console.log(`Report saved to: ${reportPath}`);
    
    // List failed tests if any
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      console.log('---------------');
      report.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`- ${test.name}: ${test.description}`);
          if (test.error) {
            console.log(`  Error: ${test.error}`);
          }
        });
    }
    
    return report;
  } catch (error) {
    console.error('Error running legal reporting system tests:', error);
    throw error;
  }
}

/**
 * Create a deliberate test failure for testing purposes
 * This is used during development to ensure the test reporting works correctly
 */
async function createDeliberateTestFailure() {
  // This is just a placeholder - implement if needed
  return false;
}

// Run tests if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await runLegalReportingTests();
      process.exit(0);
    } catch (error) {
      console.error('Failed to run legal reporting system tests:', error);
      process.exit(1);
    }
  })();
}

export { runLegalReportingTests };