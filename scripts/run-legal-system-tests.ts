/**
 * Run Legal System Tests
 * 
 * This script runs all tests for the legal practice management system components
 * including IOLTA trust accounts, reconciliation, document management, and client portal.
 * 
 * Usage: npx tsx scripts/run-legal-system-tests.ts
 */

import chalk from 'chalk';
import { runLegalSystemTests } from '../server/services/testing/test-legal-system';

/**
 * Format test results for display
 */
function formatTestResults(testReports: any[]) {
  console.log(chalk.blue.bold('\n===== LEGAL SYSTEM TEST RESULTS ====='));
  
  let totalTests = 0;
  let totalPassed = 0;
  
  for (const report of testReports) {
    console.log(`\n${chalk.bold(report.serviceName)}`);
    console.log(`Status: ${report.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
    
    let serviceTests = 0;
    let servicePassed = 0;
    
    for (const group of report.testGroups) {
      console.log(`\n  ${chalk.cyan(group.name)}`);
      console.log(`  Status: ${group.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
      
      for (const test of group.tests) {
        const icon = test.passed ? chalk.green('✓') : chalk.red('✗');
        console.log(`    ${icon} ${test.name}`);
        
        if (!test.passed && test.error) {
          console.log(`      ${chalk.yellow('Error:')} ${test.error}`);
        }
        
        serviceTests++;
        if (test.passed) servicePassed++;
      }
    }
    
    const passRate = serviceTests > 0 ? (servicePassed / serviceTests) * 100 : 0;
    console.log(`\n  Summary: ${servicePassed}/${serviceTests} tests passed (${passRate.toFixed(2)}%)`);
    
    totalTests += serviceTests;
    totalPassed += servicePassed;
  }
  
  const overallPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
  
  console.log(chalk.blue.bold('\n===== OVERALL SUMMARY ====='));
  console.log(`Total Services: ${testReports.length}`);
  console.log(`Passed Services: ${testReports.filter(r => r.passed).length}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed Tests: ${totalPassed}`);
  console.log(`Overall Pass Rate: ${overallPassRate.toFixed(2)}%`);
  console.log(chalk.blue.bold('\n==============================\n'));
  
  return {
    totalServices: testReports.length,
    passedServices: testReports.filter(r => r.passed).length,
    totalTests,
    passedTests: totalPassed,
    passRate: overallPassRate
  };
}

/**
 * Run all tests and display results
 */
async function runTests() {
  console.log(chalk.blue.bold('Running Legal System Tests...'));
  
  try {
    const testReports = await runLegalSystemTests();
    const summary = formatTestResults(testReports);
    
    // Return exit code based on test success
    process.exit(summary.passRate === 100 ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('Error running tests:'), error);
    process.exit(1);
  }
}

// Execute the tests
runTests();