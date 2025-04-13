/**
 * Verify Client Portal Fixes
 * 
 * This script runs the client portal tests to verify that our fixes
 * for the type inconsistencies between IOLTA tables and portal tables work.
 */

import { db } from '../server/db';
import { ClientPortalTestService } from '../server/services/testing/test-client-portal';

/**
 * Run verification of client portal fixes
 */
async function verifyClientPortalFix() {
  console.log('Verifying client portal fixes...');
  
  // Create test service
  const portalTestService = new ClientPortalTestService();
  
  try {
    // Run tests
    const result = await portalTestService.runTests();
    
    // Log results
    console.log(`\nTest results for: ${result.serviceName}`);
    console.log(`Overall pass status: ${result.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`Tests ran from ${result.startTime.toISOString()} to ${result.endTime.toISOString()}`);
    
    // Log individual test groups
    for (const group of result.testGroups) {
      console.log(`\n--- ${group.name} (${group.passed ? 'PASSED' : 'FAILED'}) ---`);
      console.log(`${group.description}`);
      
      // Log individual tests in the group
      for (const test of group.tests) {
        console.log(`  - ${test.name}: ${test.passed ? 'PASSED' : 'FAILED'}`);
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        }
        
        if (test.expected || test.actual) {
          console.log(`    Expected: ${JSON.stringify(test.expected)}`);
          console.log(`    Actual: ${JSON.stringify(test.actual)}`);
        }
      }
    }
    
    // Final status
    console.log('\n==========================================================');
    console.log(`CLIENT PORTAL TESTS: ${result.passed ? 'PASSED' : 'FAILED'}`);
    console.log('==========================================================');
    
    if (result.error) {
      console.error(`Error: ${result.error}`);
    }
    
    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error('Error running client portal tests:', error);
    process.exit(1);
  } finally {
    // No need to close the database connection with Neon
    console.log('Test complete');
  }
}

// Run the verification
verifyClientPortalFix();