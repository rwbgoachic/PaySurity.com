/**
 * Legal Practice Management System Test Runner
 * 
 * This script runs all test services for the Legal Practice Management System.
 * It can run all tests or a specific test service based on command-line arguments.
 * 
 * Usage:
 *   npx tsx scripts/test-legal-system.ts              # Run all tests
 *   npx tsx scripts/test-legal-system.ts --service=IOLTA  # Run specific test
 */

import { runLegalSystemTests, runSpecificTest } from '../server/services/testing/test-legal-system';
import { TestReport } from '../server/services/testing/test-interfaces';

/**
 * Display test results
 */
function displayTestResults(report: TestReport): void {
  console.log('\n==================================================');
  console.log(`Test Service: ${report.serviceName}`);
  console.log('==================================================');
  console.log(`Status: ${report.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`Start Time: ${report.startTime}`);
  console.log(`End Time: ${report.endTime}`);
  console.log(`Duration: ${report.duration ? report.duration + 'ms' : 'N/A'}`);
  console.log('--------------------------------------------------');
  
  if (report.error) {
    console.error(`Error: ${report.error}`);
    console.log('--------------------------------------------------');
  }

  if (report.testGroups.length === 0) {
    console.log('No test groups executed.');
    return;
  }

  console.log('Test Groups:');
  report.testGroups.forEach((group, index) => {
    const totalTests = group.tests.length;
    const passedTests = group.tests.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\n${index + 1}. ${group.name}: ${group.passed ? 'PASSED' : 'FAILED'}`);
    if (group.description) {
      console.log(`   Description: ${group.description}`);
    }
    console.log(`   Tests: ${passedTests}/${totalTests} passed (${failedTests} failed)`);
    
    // Display failed tests for more detailed information
    const failedTestsList = group.tests.filter(test => !test.passed);
    if (failedTestsList.length > 0) {
      console.log('\n   Failed Tests:');
      failedTestsList.forEach((test, testIndex) => {
        console.log(`     ${testIndex + 1}. ${test.name}: ${test.error}`);
      });
    }
  });
}

/**
 * Main function to run tests
 */
async function main() {
  // Check for command line arguments
  const args = process.argv.slice(2);
  let serviceArg: string | null = null;
  
  for (const arg of args) {
    if (arg.startsWith('--service=')) {
      serviceArg = arg.split('=')[1];
      break;
    }
  }
  
  let report: TestReport;
  
  if (serviceArg) {
    console.log(`Running specific test service: ${serviceArg}`);
    report = await runSpecificTest(serviceArg);
  } else {
    console.log('Running all test services');
    report = await runLegalSystemTests();
  }
  
  displayTestResults(report);
  
  // Exit with appropriate exit code
  process.exit(report.passed ? 0 : 1);
}

// Run the main function
main().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});