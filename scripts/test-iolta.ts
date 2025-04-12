/**
 * IOLTA Test Runner
 * 
 * This script runs the IOLTA service tests to validate the trust accounting
 * functionality after our fixes.
 * 
 * Run with: npx tsx scripts/test-iolta.ts
 */

import { ioltaTestService } from '../server/services/testing/test-iolta-service';

async function runIoltaTests() {
  console.log("╔═════════════════════════════════════════════════╗");
  console.log("║                                                 ║");
  console.log("║     IOLTA Trust Accounting Service Tests        ║");
  console.log("║                                                 ║");
  console.log("╚═════════════════════════════════════════════════╝");
  console.log("");
  
  try {
    const report = await ioltaTestService.runTests();
    
    console.log("Test Results Summary:");
    console.log("--------------------");
    console.log(`Service: ${report.serviceName}`);
    console.log(`Overall Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Duration: ${report.duration}ms`);
    console.log(`Error: ${report.error || 'None'}`);
    
    console.log("\nTest Groups:");
    console.log("------------");
    
    for (const group of report.testGroups) {
      const statusSymbol = group.passed ? '✅' : '❌';
      console.log(`${statusSymbol} ${group.name}: ${group.passed ? 'PASSED' : 'FAILED'}`);
      
      // Print test details
      for (const test of group.tests) {
        const testSymbol = test.passed ? '✓' : '✗';
        console.log(`   ${testSymbol} ${test.name}`);
        
        if (!test.passed && test.error) {
          console.log(`     Error: ${test.error}`);
        }
      }
      
      console.log(""); // Empty line between groups
    }
    
    // Calculate pass rate
    const totalTests = report.testGroups.reduce((sum, group) => sum + group.tests.length, 0);
    const passedTests = report.testGroups.reduce((sum, group) => 
      sum + group.tests.filter(t => t.passed).length, 0);
    
    console.log(`Pass Rate: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    // Exit with appropriate code
    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    console.error('Error running IOLTA tests:', error);
    process.exit(1);
  }
}

runIoltaTests().catch(error => {
  console.error('Uncaught error running tests:', error);
  process.exit(1);
});