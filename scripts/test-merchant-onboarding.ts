/**
 * Merchant Onboarding System Testing Script
 * 
 * This script tests the merchant onboarding processes including:
 * - Merchant application and account creation
 * - Document verification workflow
 * - Payment gateway integration
 * - Microsite generation and configuration
 * - Industry-specific POS system setup
 */

import { merchantOnboardingTestService } from '../server/services/testing/test-merchant-onboarding';
import { TestReport } from '../server/services/testing/test-delivery-service';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db';

async function runMerchantOnboardingTests() {
  console.log('📋 PaySurity.com Merchant Onboarding System Tests');
  console.log('===============================================');
  console.log('Starting merchant onboarding tests...\n');
  
  try {
    // Run merchant onboarding tests
    const startTime = Date.now();
    const report: TestReport = await merchantOnboardingTestService.runComprehensiveTests();
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
    
    const reportPath = path.join(reportDir, `merchant-onboarding-report-${timestamp}.json`);
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
    console.error('Error running merchant onboarding tests:', error);
    throw error;
  }
}

// Create a deliberate test failure to verify test reporting
async function createDeliberateTestFailure() {
  console.log('\n🔍 Creating deliberate test failure to verify test reporting...');
  
  try {
    // Create a mock merchant verification document with invalid status
    // to test that error detection is working properly
    await db.execute(`
      INSERT INTO merchant_verification_documents 
        (merchant_id, document_type, file_url, status, verification_notes)
      VALUES 
        (9999, 'invalid_document_type', 'http://test-failure.com/file.pdf', 'invalid_status', 'Test failure document')
      RETURNING id;
    `);
    console.log('✅ Test data created successfully');
    
    // The invalid status should be detected as an error by the document validation test
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Run tests
const runTests = async () => {
  try {
    await createDeliberateTestFailure();
    await runMerchantOnboardingTests();
    console.log('\nMerchant onboarding test run complete.');
    process.exit(0);
  } catch (error) {
    console.error('Merchant onboarding test run failed:', error);
    process.exit(1);
  }
};

// Run if this is the main module
runTests();

// Export functions
export { runMerchantOnboardingTests, createDeliberateTestFailure };