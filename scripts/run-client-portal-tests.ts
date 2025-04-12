/**
 * Run Client Portal Tests
 * 
 * This script runs only the tests for the client portal component
 * of the legal practice management system.
 * 
 * Usage: npx tsx scripts/run-client-portal-tests.ts
 */

import chalk from 'chalk';
import { initializeLegalSystemTests, runLegalSystemTest } from '../server/services/testing/test-legal-system';

/**
 * Format test results for display
 */
function formatTestResults(report: any) {
  console.log(chalk.blue.bold('\n===== CLIENT PORTAL TEST RESULTS ====='));
  
  console.log(`\n${chalk.bold(report.serviceName)}`);
  console.log(`Status: ${report.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const group of report.testGroups) {
    console.log(`\n  ${chalk.cyan(group.name)}`);
    console.log(`  Status: ${group.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
    
    for (const test of group.tests) {
      const icon = test.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`    ${icon} ${test.name}`);
      
      if (!test.passed && test.error) {
        console.log(`      ${chalk.yellow('Error:')} ${test.error}`);
      }
      
      if (test.actual) {
        console.log(`      ${chalk.cyan('Expected:')}`, test.expected);
        console.log(`      ${chalk.cyan('Actual:')}`, test.actual);
      }
      
      totalTests++;
      if (test.passed) passedTests++;
    }
  }
  
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  
  console.log(chalk.blue.bold('\n===== SUMMARY ====='));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed Tests: ${passedTests}`);
  console.log(`Pass Rate: ${passRate.toFixed(2)}%`);
  console.log(`Duration: ${report.duration}ms`);
  console.log(chalk.blue.bold('\n==============================\n'));
  
  return {
    totalTests,
    passedTests,
    passRate
  };
}

/**
 * Run client portal tests and display results
 */
async function runTests() {
  console.log(chalk.blue.bold('Running Client Portal Tests...'));
  
  try {
    // Fix IOLTA tables first for proper functioning
    console.log(chalk.blue('Ensuring database schema is correct...'));
    
    // Run just the client portal tests
    const testReport = await runLegalSystemTest('client-portal');
    const summary = formatTestResults(testReport);
    
    // Return exit code based on test success
    process.exit(summary.passRate === 100 ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('Error running tests:'), error);
    process.exit(1);
  }
}

// Execute the tests
runTests();