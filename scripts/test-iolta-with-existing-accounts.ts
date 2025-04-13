/**
 * Run IOLTA Tests with Existing Accounts
 * 
 * This script runs IOLTA tests using existing accounts in the database,
 * finding them dynamically rather than using fixed IDs.
 */

import { db } from '../server/db';
import { IoltaService } from '../server/services/legal/iolta-service';
import { ioltaTrustAccounts, ioltaClientLedgers, ioltaTransactions } from '../shared/schema-legal';
import { eq, sql } from 'drizzle-orm';
import { ClientPortalService } from '../server/services/legal/client-portal-service';
import { toIoltaClientId, toPortalClientId } from '../server/services/legal/client-id-helper';
import { ioltaTransactionSqlService } from '../server/services/legal/iolta-transaction-sql-service';

async function runIoltaTests() {
  console.log("╔═════════════════════════════════════════════════╗");
  console.log("║                                                 ║");
  console.log("║     IOLTA Trust Accounting Service Tests        ║");
  console.log("║                                                 ║");
  console.log("╚═════════════════════════════════════════════════╝");
  
  const ioltaService = new IoltaService();
  const clientPortalService = new ClientPortalService();
  const testMerchantId = 1;
  const testClientId = 1;
  
  try {
    // Find existing accounts
    console.log("Searching for existing trust accounts...");
    const accounts = await ioltaService.getTrustAccountsByMerchant(testMerchantId);
    
    if (!accounts || accounts.length === 0) {
      console.log("❌ No trust accounts found for testing");
      return { passed: false, error: "No trust accounts found" };
    }
    
    console.log(`Found ${accounts.length} trust accounts`);
    const testAccount = accounts[0];
    console.log(`Using account ID ${testAccount.id} for testing`);

    // Find a client ledger
    console.log("Searching for existing client ledgers...");
    const ledgers = await db.select()
      .from(ioltaClientLedgers)
      .where(sql`${ioltaClientLedgers.trustAccountId} = ${testAccount.id}`);
    
    let testLedger: any = null;
    if (ledgers && ledgers.length > 0) {
      testLedger = ledgers[0];
      console.log(`Found ${ledgers.length} ledgers, using ledger ID ${testLedger.id}`);
    } else {
      console.log("No ledgers found, creating a test ledger");
      
      // Create a test ledger
      testLedger = await ioltaService.createClientLedger({
        merchantId: testMerchantId,
        trustAccountId: testAccount.id,
        clientId: toIoltaClientId(testClientId),
        clientName: "Test Client",
        matterName: "Test Matter",
        matterNumber: "TM-001",
        balance: "1000.00",
        status: "active",
        jurisdiction: "CA"
      });
      
      console.log(`Created test ledger with ID ${testLedger.id}`);
    }
    
    // Find a transaction
    console.log("Searching for existing transactions...");
    const transactions = await db.select()
      .from(ioltaTransactions)
      .where(sql`${ioltaTransactions.clientLedgerId} = ${testLedger.id}`);
    
    let testTransaction: any = null;
    if (transactions && transactions.length > 0) {
      testTransaction = transactions[0];
      console.log(`Found ${transactions.length} transactions, using transaction ID ${testTransaction.id}`);
    } else {
      console.log("No transactions found, creating a test transaction");
      
      // Create a test transaction using the transaction SQL service
      const result = await ioltaTransactionSqlService.createTransaction({
        merchantId: testMerchantId,
        trustAccountId: testAccount.id,
        clientLedgerId: testLedger.id,
        amount: "500.00",
        description: "Test deposit",
        transactionType: "deposit",
        fundType: "retainer",
        status: "completed",
        checkNumber: "TEST-001",
        payee: "N/A",
        referenceNumber: "Test transaction",
        createdBy: 1
      });
      
      testTransaction = result.transaction;
      
      console.log(`Created test transaction with ID ${testTransaction.id}`);
    }
    
    // Now run the tests with our discovered or created test data
    const results: boolean[] = [];
    
    // 1. Test account management
    console.log("\n🔍 Testing account management...");
    
    const account = await ioltaService.getTrustAccount(testAccount.id);
    const accountPassed = !!account;
    results.push(accountPassed);
    console.log(accountPassed ? "✅ Get trust account: PASSED" : "❌ Get trust account: FAILED");
    
    const merchantAccounts = await ioltaService.getTrustAccountsByMerchant(testMerchantId);
    const merchantAccountsPassed = merchantAccounts && merchantAccounts.length > 0;
    results.push(merchantAccountsPassed);
    console.log(merchantAccountsPassed ? "✅ List trust accounts: PASSED" : "❌ List trust accounts: FAILED");
    
    // 2. Test client ledger operations
    console.log("\n🔍 Testing client ledger operations...");
    
    const ledger = await ioltaService.getClientLedger(testLedger.id);
    const ledgerPassed = !!ledger;
    results.push(ledgerPassed);
    console.log(ledgerPassed ? "✅ Get client ledger: PASSED" : "❌ Get client ledger: FAILED");
    
    const accountLedgers = await ioltaService.getClientLedgersByTrustAccount(testAccount.id);
    const accountLedgersPassed = accountLedgers && accountLedgers.length > 0;
    results.push(accountLedgersPassed);
    console.log(accountLedgersPassed ? "✅ List client ledgers: PASSED" : "❌ List client ledgers: FAILED");
    
    // 3. Test transaction operations
    console.log("\n🔍 Testing transaction operations...");
    
    const transaction = await ioltaService.getTransaction(testTransaction.id);
    const transactionPassed = !!transaction;
    results.push(transactionPassed);
    console.log(transactionPassed ? "✅ Get transaction: PASSED" : "❌ Get transaction: FAILED");
    
    const ledgerTransactions = await ioltaService.getTransactionsByClientLedger(testLedger.id);
    const ledgerTransactionsPassed = ledgerTransactions && ledgerTransactions.length > 0;
    results.push(ledgerTransactionsPassed);
    console.log(ledgerTransactionsPassed ? "✅ List client transactions: PASSED" : "❌ List client transactions: FAILED");
    
    // 4. Test reconciliation operations
    console.log("\n🔍 Testing reconciliation operations...");
    
    try {
      const balances = await ioltaService.getClientLedgerBalances(testAccount.id);
      const balancesPassed = balances && balances.clientLedgers;
      results.push(balancesPassed);
      console.log(balancesPassed ? "✅ Get client ledger balances: PASSED" : "❌ Get client ledger balances: FAILED");
    } catch (error) {
      console.log("❌ Get client ledger balances: FAILED");
      console.error("  Error:", error.message);
      results.push(false);
    }
    
    try {
      const reconciliation = await ioltaService.getTrustAccountReconciliation(testAccount.id);
      const reconciliationPassed = reconciliation && reconciliation.account;
      results.push(reconciliationPassed);
      console.log(reconciliationPassed ? "✅ Get trust account reconciliation: PASSED" : "❌ Get trust account reconciliation: FAILED");
    } catch (error) {
      console.log("❌ Get trust account reconciliation: FAILED");
      console.error("  Error:", error.message);
      results.push(false);
    }
    
    // 5. Test client portal integration
    console.log("\n🔍 Testing client portal integration...");
    
    try {
      const portalAccounts = await clientPortalService.getClientTrustAccounts(testClientId, testMerchantId);
      const portalAccountsPassed = portalAccounts && portalAccounts.length > 0;
      results.push(portalAccountsPassed);
      console.log(portalAccountsPassed ? "✅ Get client trust accounts via portal: PASSED" : "❌ Get client trust accounts via portal: FAILED");
      
      if (portalAccountsPassed) {
        const portalAccount = portalAccounts[0];
        
        const portalLedgers = await clientPortalService.getClientTrustLedgers(
          testClientId, 
          testMerchantId, 
          portalAccount.id
        );
        
        const portalLedgersPassed = portalLedgers && portalLedgers.length > 0;
        results.push(portalLedgersPassed);
        console.log(portalLedgersPassed ? "✅ Get client trust ledgers via portal: PASSED" : "❌ Get client trust ledgers via portal: FAILED");
        
        if (portalLedgersPassed) {
          const portalLedger = portalLedgers[0];
          
          const portalTransactions = await clientPortalService.getLedgerTransactions(
            testClientId,
            testMerchantId,
            portalLedger.id
          );
          
          const portalTransactionsPassed = portalTransactions && portalTransactions.length > 0;
          results.push(portalTransactionsPassed);
          console.log(portalTransactionsPassed ? "✅ Get ledger transactions via portal: PASSED" : "❌ Get ledger transactions via portal: FAILED");
        } else {
          results.push(false);
          console.log("❌ Get ledger transactions via portal: SKIPPED (no ledgers found)");
        }
      } else {
        results.push(false);
        results.push(false);
        console.log("❌ Get client trust ledgers via portal: SKIPPED (no accounts found)");
        console.log("❌ Get ledger transactions via portal: SKIPPED (no accounts found)");
      }
    } catch (error) {
      console.log("❌ Client portal integration tests: FAILED");
      console.error("  Error:", error.message);
      results.push(false);
      results.push(false);
      results.push(false);
    }
    
    // Print summary
    console.log("\n=== Test Summary ===");
    const totalTests = results.length;
    const passedTests = results.filter(Boolean).length;
    
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