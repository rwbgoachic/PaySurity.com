/**
 * Legal IOLTA Trust Accounting System Testing Script
 * 
 * This script tests the IOLTA trust accounting system capabilities including:
 * - Trust account management
 * - Client ledger operations
 * - Transaction recording and retrieval
 * - Reconciliation reporting
 */

import { IoltaTestService } from '../server/services/testing/test-legal-iolta';
import { TestReport } from '../server/services/testing/test-interfaces';

/**
 * Run the IOLTA Trust Accounting system tests
 */
async function runLegalIoltaTests() {
  console.log("====================================");
  console.log("IOLTA Trust Accounting System Tests");
  console.log("====================================");
  
  try {
    // Create a new instance of the test service
    const ioltaTestService = new IoltaTestService();
    
    // Run the tests
    const report: TestReport = await ioltaTestService.runTests();
    
    // Calculate test counts
    let passedTests = 0;
    let totalTests = 0;
    
    for (const group of report.testGroups) {
      for (const test of group.tests) {
        totalTests++;
        if (test.passed) {
          passedTests++;
        }
      }
    }
    
    const passRate = totalTests > 0 ? passedTests / totalTests : 0;
    
    // Output results
    console.log(`\nTest Results: ${passedTests} passed, ${totalTests - passedTests} failed`);
    console.log(`Pass Rate: ${(passRate * 100).toFixed(2)}%`);
    
    // Log each test
    console.log("\nTest Details:");
    let testIndex = 1;
    for (const group of report.testGroups) {
      console.log(`\nGroup: ${group.name}`);
      for (const test of group.tests) {
        console.log(`${testIndex}. ${test.name}: ${test.passed ? '✓ PASSED' : '✗ FAILED'}`);
        if (!test.passed && test.error) {
          console.log(`   Error: ${test.error}`);
        }
        testIndex++;
      }
    }
    
    // Exit with appropriate code
    if (report.passed) {
      console.log("\nAll IOLTA trust accounting tests passed successfully!");
      process.exit(0);
    } else {
      console.log("\nSome IOLTA trust accounting tests failed. See details above.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Failed to run IOLTA trust accounting tests:", error);
    process.exit(1);
  }
}

/**
 * Create a deliberate test failure for testing purposes
 * This is used during development to ensure the test reporting works correctly
 */
async function createDeliberateTestFailure() {
  // This function can be used during development to test the failure reporting
  throw new Error("Deliberate test failure");
}

// Execute the tests
runLegalIoltaTests();