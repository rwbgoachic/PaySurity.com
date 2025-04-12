/**
 * Legal Time and Expense System Testing Script
 * 
 * This script tests the legal time and expense tracking system capabilities
 * including:
 * - Time entry creation, retrieval, update, and deletion
 * - Expense entry creation, retrieval, update, and deletion
 * - Invoice generation from time and expense entries
 * - Billable summary calculation
 */

import { legalTimeExpenseTestService } from "../server/services/testing/test-legal-time-expense";
import { TestReport } from "../server/services/testing/test-interfaces";

async function runLegalTimeExpenseTests() {
  console.log("=====================================================");
  console.log("LEGAL TIME AND EXPENSE SYSTEM TESTS");
  console.log("=====================================================");
  
  try {
    const report: TestReport = await legalTimeExpenseTestService.runComprehensiveTests();
    
    console.log("\nSUMMARY:");
    console.log(`Overall Status: ${report.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`Test Groups: ${report.testGroups?.length || 0}`);
    
    let totalTests = 0;
    let passedTests = 0;
    
    // Print test group results
    report.testGroups?.forEach(group => {
      console.log(`\n${group.name}: ${group.passed ? 'PASSED' : 'FAILED'}`);
      
      totalTests += group.tests.length;
      passedTests += group.tests.filter(test => test.passed).length;
      
      // Print individual test results
      group.tests.forEach(test => {
        console.log(`  - ${test.name}: ${test.passed ? 'PASSED' : 'FAILED'}`);
        if (!test.passed) {
          console.log(`    Expected: ${test.expected}`);
          console.log(`    Result: ${test.result}`);
        }
      });
    });
    
    console.log(`\nTotal Tests: ${totalTests}`);
    console.log(`Passed Tests: ${passedTests}`);
    console.log(`Failed Tests: ${totalTests - passedTests}`);
    console.log(`Pass Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    console.log("\n=====================================================");
    
    return report;
  } catch (error) {
    console.error("Error running legal time and expense tests:", error);
    return {
      name: "Legal Time and Expense System Tests",
      timestamp: new Date(),
      passed: false,
      error: error.message
    } as TestReport;
  }
}

/**
 * Create a deliberate test failure for testing purposes
 * This is used during development to ensure the test reporting works correctly
 */
async function createDeliberateTestFailure() {
  try {
    throw new Error("This is a deliberate test failure for testing the reporting system.");
  } catch (error) {
    console.error("Deliberate test failure:", error);
  }
}

// Only run the function if this file is being executed directly
if (require.main === module) {
  runLegalTimeExpenseTests().catch(error => {
    console.error("Unhandled error in test script:", error);
    process.exit(1);
  });
}

export { runLegalTimeExpenseTests };