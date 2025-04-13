/**
 * Run Client Portal Tests
 * 
 * This script runs a comprehensive client portal test suite to verify
 * all functionality is working properly after our fixes.
 * 
 * Run with: npx tsx scripts/run-client-portal-tests.ts
 */

import { db } from '../server/db';
import { ClientPortalTestService } from '../server/services/testing/test-client-portal';

async function runClientPortalTests() {
  console.log('Running comprehensive client portal tests...');
  console.log('==============================================\n');
  
  const testService = new ClientPortalTestService();
  
  try {
    // Run all tests
    const result = await testService.runTests();
    
    // Print results summary
    console.log(`\n=== TEST RESULTS: ${result.serviceName} ===`);
    console.log(`Overall status: ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`Tests ran from ${result.startTime.toISOString()} to ${result.endTime.toISOString()}`);
    console.log(`Total test groups: ${result.testGroups.length}`);
    
    // Count total tests
    const totalTests = result.testGroups.reduce((sum, group) => sum + group.tests.length, 0);
    const passedTests = result.testGroups.reduce((sum, group) => {
      return sum + group.tests.filter(test => test.passed).length;
    }, 0);
    
    console.log(`Total individual tests: ${totalTests}`);
    console.log(`Passed tests: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    // Print detailed results by group
    console.log('\n=== DETAILED RESULTS ===');
    result.testGroups.forEach(group => {
      console.log(`\n## ${group.name}: ${group.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
      console.log(`Description: ${group.description}`);
      
      // Print test details
      group.tests.forEach(test => {
        console.log(`  - ${test.name}: ${test.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
        if (test.description) {
          console.log(`    Description: ${test.description}`);
        }
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        }
        if (test.expected) {
          console.log(`    Expected: ${JSON.stringify(test.expected)}`);
        }
        if (test.actual) {
          console.log(`    Actual: ${JSON.stringify(test.actual)}`);
        }
      });
    });
    
    // Final summary
    console.log('\n==============================================');
    console.log(`CLIENT PORTAL TESTS: ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log('==============================================');
    
    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runClientPortalTests().catch(console.error);