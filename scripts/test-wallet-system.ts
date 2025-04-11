/**
 * Wallet System Testing Script
 * 
 * This script tests the digital wallet system including:
 * - Wallet creation and management
 * - Balance operations
 * - Transaction processing and history
 * - Payment methods
 * - Security features
 */

import { walletTestService } from '../server/services/testing/test-wallet-system';
import { TestReport } from '../server/services/testing/test-delivery-service';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db';

async function runWalletSystemTests() {
  console.log('📋 PaySurity.com Wallet System Tests');
  console.log('==================================');
  console.log('Starting wallet system tests...\n');
  
  try {
    // Run wallet system tests
    const startTime = Date.now();
    const report: TestReport = await walletTestService.runComprehensiveTests();
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
    
    const reportPath = path.join(reportDir, `wallet-test-report-${timestamp}.json`);
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
    console.error('Error running wallet system tests:', error);
    throw error;
  }
}

/**
 * Prepare test data for wallet system tests
 */
async function prepareWalletTestData() {
  console.log('\n🔧 Preparing test data for wallet system tests...');
  
  try {
    // Check if test wallet exists
    const walletCheckQuery = `
      SELECT EXISTS (
        SELECT 1 FROM wallets 
        WHERE user_id = 9999 
        AND wallet_type = 'test'
      );
    `;
    
    const walletCheckResult = await db.execute(walletCheckQuery);
    const walletExists = walletCheckResult.rows[0]?.exists === true;
    
    if (!walletExists) {
      console.log('  💰 Creating test wallet...');
      
      // Create test wallet
      const createWalletQuery = `
        INSERT INTO wallets (
          user_id, 
          balance, 
          available_balance,
          daily_limit, 
          monthly_limit, 
          is_main, 
          wallet_type,
          currency,
          status,
          tier
        )
        VALUES (
          9999, 
          1000.00, 
          1000.00,
          500.00, 
          5000.00, 
          true, 
          'test',
          'USD',
          'active',
          'standard'
        )
        RETURNING id;
      `;
      
      const walletResult = await db.execute(createWalletQuery);
      const walletId = walletResult.rows[0]?.id;
      
      console.log(`  ✅ Created test wallet with ID: ${walletId}`);
      
      // Create test transaction
      console.log('  💸 Creating test transaction...');
      
      const createTransactionQuery = `
        INSERT INTO wallet_transactions (
          wallet_id,
          transaction_type,
          amount,
          fee_amount,
          currency,
          status,
          source,
          source_id,
          destination,
          destination_id,
          reference_id,
          description,
          balance_before,
          balance_after
        )
        VALUES (
          ${walletId},
          'deposit',
          100.00,
          0.00,
          'USD',
          'completed',
          'bank_account',
          'test-bank-123',
          'wallet',
          '${walletId}',
          'test-ref-${Date.now()}',
          'Test initial deposit',
          900.00,
          1000.00
        )
        RETURNING id;
      `;
      
      try {
        const transactionResult = await db.execute(createTransactionQuery);
        const transactionId = transactionResult.rows[0]?.id;
        console.log(`  ✅ Created test transaction with ID: ${transactionId}`);
      } catch (error) {
        // Table might not exist yet
        console.log(`  ⚠️ Could not create test transaction: ${(error as Error).message}`);
        console.log('  ℹ️ This is expected if the wallet_transactions table doesn\'t exist yet');
      }
      
      // Create test payment method
      console.log('  💳 Creating test payment method...');
      
      const createPaymentMethodQuery = `
        INSERT INTO wallet_linked_payment_methods (
          wallet_id,
          payment_method_type,
          status,
          is_default,
          nickname,
          last4,
          expiry_month,
          expiry_year,
          card_brand,
          verification_status
        )
        VALUES (
          ${walletId},
          'credit_card',
          'active',
          true,
          'Test Card',
          '4242',
          12,
          2028,
          'visa',
          'verified'
        )
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;
      
      try {
        const paymentMethodResult = await db.execute(createPaymentMethodQuery);
        const paymentMethodId = paymentMethodResult.rows[0]?.id;
        if (paymentMethodId) {
          console.log(`  ✅ Created test payment method with ID: ${paymentMethodId}`);
        } else {
          console.log('  ℹ️ Payment method already exists or couldn\'t be created');
        }
      } catch (error) {
        // Table might not exist yet
        console.log(`  ⚠️ Could not create test payment method: ${(error as Error).message}`);
        console.log('  ℹ️ This is expected if the wallet_linked_payment_methods table doesn\'t exist yet');
      }
    } else {
      console.log('  ✅ Test wallet already exists, skipping creation');
    }
    
    console.log('  ✅ Test data preparation complete');
  } catch (error) {
    console.error('  ❌ Error preparing test data:', error);
    throw error;
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  // In a real scenario, we might want to delete test data
  // However, for our tests, we'll keep the test data for now
  console.log('  ✅ Cleanup skipped to preserve test data for future tests');
}

// Run tests
const runTests = async () => {
  try {
    await prepareWalletTestData();
    await runWalletSystemTests();
    await cleanupTestData();
    console.log('\nWallet system test run complete.');
    process.exit(0);
  } catch (error) {
    console.error('Wallet system test run failed:', error);
    process.exit(1);
  }
};

// Run if this is the main module
runTests();

// Export functions
export { runWalletSystemTests, prepareWalletTestData, cleanupTestData };