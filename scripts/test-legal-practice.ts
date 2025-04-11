/**
 * Legal Practice Management System Test Script
 * 
 * This script runs comprehensive end-to-end tests for the Legal Practice Management System
 * and generates a detailed test report.
 */

import { LegalCompleteTestService } from '../server/services/testing/test-legal-complete';
import { TestReport } from '../server/services/testing/test-interfaces';

async function runLegalSystemTests() {
  try {
    console.log('Starting Legal Practice Management System end-to-end tests...');
    
    const testService = new LegalCompleteTestService();
    const report: TestReport = await testService.runTests();
    
    // Display test results summary
    console.log('\n===== TEST RESULTS SUMMARY =====');
    console.log(`Total Tests: ${report.tests.length}`);
    console.log(`Passed: ${report.testsPassed}`);
    console.log(`Failed: ${report.testsFailed}`);
    console.log(`Pass Rate: ${report.passRate.toFixed(2)}%`);
    console.log(`Duration: ${(report.duration / 1000).toFixed(2)} seconds`);
    
    // Display failed tests if any
    if (report.testsFailed > 0) {
      console.log('\n===== FAILED TESTS =====');
      report.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`\n- ${test.name} (${test.description})`);
          console.log(`  Expected: ${test.expected}`);
          console.log(`  Actual: ${test.actual}`);
          if (test.error) {
            console.log(`  Error: ${test.error}`);
          }
        });
    }
    
    // Display test group summary
    console.log('\n===== TEST GROUPS SUMMARY =====');
    report.testGroups?.forEach(group => {
      const groupTests = report.tests.filter(test => 
        group.tests.some(gt => gt.name === test.name));
      
      const passedCount = groupTests.filter(t => t.passed).length;
      const passRate = (passedCount / groupTests.length) * 100;
      
      console.log(`${group.name}: ${passedCount}/${groupTests.length} (${passRate.toFixed(2)}%)`);
    });
    
    console.log('\nTest run completed successfully');
    
    // Exit with appropriate code based on pass rate
    process.exit(report.passRate === 100 ? 0 : 1);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runLegalSystemTests().catch(error => {
  console.error('Unexpected error during test execution:', error);
  process.exit(1);
});