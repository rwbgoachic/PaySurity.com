/**
 * Affiliate Marketing System Testing Script
 * 
 * This script tests the affiliate marketing system capabilities
 * including:
 * - Affiliate registration and onboarding
 * - Referral tracking and attribution
 * - Commission calculation and payouts
 * - Affiliate dashboard functionality
 * - Performance metrics reporting
 */

import { affiliateSystemTestService } from '../server/services/testing/test-affiliate-system';
import { TestReport } from '../server/services/testing/test-delivery-service';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db';

async function runAffiliateProgramTests() {
  console.log('📋 PaySurity.com Affiliate Marketing System Tests');
  console.log('==============================================');
  console.log('Starting affiliate marketing tests...\n');
  
  try {
    // Run affiliate system tests
    const startTime = Date.now();
    const report: TestReport = await affiliateSystemTestService.runComprehensiveTests();
    const duration = Date.now() - startTime;
    
    // Calculate statistics
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    report.testGroups.forEach(group => {
      totalTests += group.tests.length;
      passedTests += group.tests.filter(test => test.passed).length;
      failedTests += group.tests.filter(test => !test.passed).length;
    });
    
    // Save report to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../test-reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, `affiliate-test-report-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Log summary
    console.log('\n📊 Test Results Summary');
    console.log('=====================');
    console.log(`🕒 Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📝 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📋 Overall result: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // List failed tests
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      console.log('==============');
      
      report.testGroups.forEach(group => {
        const groupFailedTests = group.tests.filter(test => !test.passed);
        if (groupFailedTests.length > 0) {
          console.log(`\n📝 ${group.name}:`);
          groupFailedTests.forEach(test => {
            console.log(`  ❌ ${test.name}: ${test.result}`);
            console.log(`     Expected: ${test.expected}`);
            console.log(`     Actual: ${test.actual}`);
          });
        }
      });
    }
    
    return report;
  } catch (error) {
    console.error('Error running affiliate marketing tests:', error);
    throw error;
  }
}

// Create a deliberate test failure to verify test reporting
async function createDeliberateTestFailure() {
  console.log('\n🔍 Creating deliberate test failure to verify test reporting...');
  
  try {
    // Create a mock affiliate referral with invalid commission calculation
    // to test that error detection is working properly
    await db.execute(`
      INSERT INTO affiliate_referral_tracking 
        (affiliate_id, referred_merchant_id, referral_code, status, commission_amount)
      VALUES 
        (9999, 9999, 'INVALID-TEST', 'converted', -100)
      RETURNING id;
    `);
    console.log('✅ Test data created successfully');
    
    // The negative commission amount should be detected as an error
    // by the affiliate_referral_validation test
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Run tests
const runTests = async () => {
  try {
    await createDeliberateTestFailure();
    await runAffiliateProgramTests();
    console.log('\nAffiliate marketing test run complete.');
    process.exit(0);
  } catch (error) {
    console.error('Affiliate marketing test run failed:', error);
    process.exit(1);
  }
};

// Run if this is the main module
runTests();

// Export functions
export { runAffiliateProgramTests, createDeliberateTestFailure };