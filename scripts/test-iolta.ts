/**
 * IOLTA Test Script
 * 
 * This script runs tests for the IOLTA trust accounting system
 * including client ledger operations, trust account management,
 * transaction recording, and reconciliation reporting.
 */

import { testCoordinator } from '../server/services/testing/test-coordinator';
import { ioltaTestService } from '../server/services/testing/test-iolta-service';
import { TestReport } from '../server/services/testing/test-interfaces';

/**
 * Main test execution function
 */
async function runIoltaTests() {
  try {
    console.log('Starting IOLTA trust accounting system tests...');
    
    // Register the IOLTA test service with the coordinator
    testCoordinator.registerTestService('IOLTA', ioltaTestService);
    
    // Run the test suite
    const report: TestReport = await testCoordinator.runTestSuite('IOLTA');
    
    // Display test results
    displayTestResults(report);
    
    // Exit with appropriate code based on test results
    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    console.error('Error running IOLTA tests:', error);
    process.exit(1);
  }
}

/**
 * Display test results
 */
function displayTestResults(report: TestReport) {
  const totalTests = report.testGroups.reduce((sum, group) => sum + group.tests.length, 0);
  const passedTests = report.testGroups.reduce((sum, group) => 
    sum + group.tests.filter(test => test.passed).length, 0);
  const failedTests = totalTests - passedTests;
  
  console.log('\n=========================================');
  console.log(`IOLTA TEST RESULTS (${new Date().toISOString()})`);
  console.log('=========================================');
  console.log(`Duration: ${report.duration / 1000} seconds`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Pass Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('=========================================');
  
  report.testGroups.forEach(group => {
    const groupPassedTests = group.tests.filter(test => test.passed).length;
    console.log(`\n${group.name}: ${group.passed ? 'PASSED' : 'FAILED'} (${groupPassedTests}/${group.tests.length})`);
    
    group.tests.forEach(test => {
      const status = test.passed ? '✓' : '✗';
      console.log(`  ${status} ${test.name}`);
      
      if (!test.passed && test.error) {
        console.log(`    Error: ${test.error}`);
      }
    });
  });
  
  console.log('\n=========================================');
  console.log(`Overall Result: ${report.passed ? 'PASSED' : 'FAILED'}`);
  console.log('=========================================\n');
}

/**
 * Create a deliberate test failure for testing purposes
 * This is used during development to ensure the test reporting works correctly
 */
async function createDeliberateTestFailure() {
  try {
    console.log('Creating deliberate test failure...');
    
    // Register the IOLTA test service with the coordinator
    testCoordinator.registerTestService('IOLTA', ioltaTestService);
    
    // Create a deliberate failure
    await ioltaTestService.createDeliberateTestFailure();
  } catch (error) {
    console.error('Expected error:', error);
    console.log('Deliberate test failure created successfully.');
  }
}

// Run the tests
if (process.argv.includes('--fail')) {
  createDeliberateTestFailure();
} else {
  runIoltaTests();
}