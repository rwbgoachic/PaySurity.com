/**
 * Run IOLTA Tests with Fixed IDs
 * 
 * This script runs a modified version of the IOLTA tests that uses
 * fixed IDs created by the fix-transaction-test.ts script.
 */

import { db } from '../server/db';
import { IoltaService } from '../server/services/legal/iolta-service';
import { TestReport } from '../server/services/testing/test-coordinator';

// Fixed IDs created by the fix-transaction-test.ts script
const FIXED_TRUST_ACCOUNT_ID = 84;
const FIXED_CLIENT_LEDGER_ID = 17;
const FIXED_TRANSACTION_ID = 42;

async function runIoltaTests() {
  console.log("╔═════════════════════════════════════════════════╗");
  console.log("║                                                 ║");
  console.log("║     IOLTA Trust Accounting Service Tests        ║");
  console.log("║                                                 ║");
  console.log("╚═════════════════════════════════════════════════╝");
  
  const ioltaService = new IoltaService();
  
  try {
    // 1. Test account management
    console.log("\n🔍 Testing account management...");
    const account = await ioltaService.getTrustAccount(FIXED_TRUST_ACCOUNT_ID);
    if (account) {
      console.log("✅ Get trust account: PASSED");
    } else {
      console.log("❌ Get trust account: FAILED");
    }
    
    const accounts = await ioltaService.getTrustAccountsByMerchant(1);
    if (accounts && accounts.length > 0) {
      console.log("✅ List trust accounts: PASSED");
    } else {
      console.log("❌ List trust accounts: FAILED");
    }
    
    // 2. Test client ledger operations
    console.log("\n🔍 Testing client ledger operations...");
    const ledger = await ioltaService.getClientLedger(FIXED_CLIENT_LEDGER_ID);
    if (ledger) {
      console.log("✅ Get client ledger: PASSED");
    } else {
      console.log("❌ Get client ledger: FAILED");
    }
    
    const ledgers = await ioltaService.getClientLedgersByTrustAccount(FIXED_TRUST_ACCOUNT_ID);
    if (ledgers && ledgers.length > 0) {
      console.log("✅ List client ledgers: PASSED");
    } else {
      console.log("❌ List client ledgers: FAILED");
    }
    
    // 3. Test transaction operations
    console.log("\n🔍 Testing transaction operations...");
    const transaction = await ioltaService.getTransaction(FIXED_TRANSACTION_ID);
    if (transaction) {
      console.log("✅ Get transaction: PASSED");
    } else {
      console.log("❌ Get transaction: FAILED");
    }
    
    const transactions = await ioltaService.getTransactionsByClientLedger(FIXED_CLIENT_LEDGER_ID);
    if (transactions && transactions.length > 0) {
      console.log("✅ List client transactions: PASSED");
    } else {
      console.log("❌ List client transactions: FAILED");
    }
    
    // 4. Test reconciliation operations
    console.log("\n🔍 Testing reconciliation operations...");
    const balances = await ioltaService.getClientLedgerBalances(FIXED_TRUST_ACCOUNT_ID);
    if (balances && balances.clientLedgers) {
      console.log("✅ Get client ledger balances: PASSED");
    } else {
      console.log("❌ Get client ledger balances: FAILED");
    }
    
    const reconciliation = await ioltaService.getTrustAccountReconciliation(FIXED_TRUST_ACCOUNT_ID);
    if (reconciliation && reconciliation.account) {
      console.log("✅ Get trust account reconciliation: PASSED");
    } else {
      console.log("❌ Get trust account reconciliation: FAILED");
    }
    
    // Print summary
    console.log("\n=== Test Summary ===");
    const totalTests = 8; // Update this if you add more tests
    const passedTests = [
      !!account,
      accounts && accounts.length > 0,
      !!ledger,
      ledgers && ledgers.length > 0,
      !!transaction,
      transactions && transactions.length > 0,
      balances && balances.clientLedgers,
      reconciliation && reconciliation.account
    ].filter(Boolean).length;
    
    console.log(`Pass rate: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    return { passed: passedTests === totalTests };
    
  } catch (error) {
    console.error("Error running IOLTA tests:", error);
    return { passed: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Run the tests
runIoltaTests()
  .then(result => {
    console.log(result.passed ? "🎉 ALL TESTS PASSED! 🎉" : "❌ SOME TESTS FAILED");
    process.exit(result.passed ? 0 : 1);
  })
  .catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });