/**
 * Script to fix and verify IOLTA service functionality
 * 
 * This script tests critical IOLTA functions after we've updated the service code
 * to ensure everything works correctly with the modified getClientLedger method.
 * 
 * Run with: npx tsx scripts/fix-iolta-tests.ts
 */

import { db } from "../server/db";
import { sql, eq, and, desc } from "drizzle-orm";
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers,
  ioltaTransactions
} from "../shared/schema-legal";
import { ioltaService } from "../server/services/legal/iolta-service";
import Decimal from "decimal.js";

async function testIoltaFunctions() {
  console.log("======================================");
  console.log("IOLTA Functions Test");
  console.log("======================================");
  
  try {
    // Test data
    const merchantId = 1;
    const testAccountData = {
      merchantId,
      clientId: 1, // Required field
      accountName: "Test IOLTA Account",
      accountNumber: "IOLTA-TEST-1234",
      status: "active" as const,
      bankName: "Test Bank",
      balance: "10000.00",
      notes: "Test account for IOLTA functions",
      lastReconciledDate: new Date().toISOString() as unknown as Date
    };
    
    // Client ledger data
    const testClientData = {
      merchantId,
      trustAccountId: 0, // Will be set after account creation
      clientId: "1",
      clientName: "Test Client",
      matterName: "Test Matter",
      matterNumber: "MATTER-001",
      jurisdiction: "CA",
      balance: "5000.00",
      currentBalance: "5000.00",
      status: "active" as const,
      notes: "Test client ledger"
    };
    
    // Clean up previous test data
    await cleanup();
    
    console.log("\n[1] Testing Trust Account Creation");
    const account = await ioltaService.createTrustAccount(testAccountData);
    console.log("Account created:", account);
    console.assert(account.id > 0, "Account ID should be positive");
    console.assert(account.merchantId === merchantId, "Merchant ID should match");
    
    // Update IDs for subsequent tests
    testClientData.trustAccountId = account.id;
    
    console.log("\n[2] Testing Client Ledger Creation");
    const clientLedger = await ioltaService.createClientLedger(testClientData);
    console.log("Client ledger created:", clientLedger);
    console.assert(clientLedger.id > 0, "Client ledger ID should be positive");
    console.assert(clientLedger.trustAccountId === account.id, "Trust account ID should match");
    console.assert(clientLedger.clientId === testClientData.clientId, "Client ID should match");
    
    console.log("\n[3] Testing Client Ledger Retrieval by Client ID");
    const ledgerByClientId = await ioltaService.getClientLedger(parseInt(testClientData.clientId), true);
    console.log("Client ledger by client ID:", ledgerByClientId);
    console.assert(ledgerByClientId?.id === clientLedger.id, "Client ledger should be retrieved correctly by client ID");
    
    console.log("\n[4] Testing Client Ledger Retrieval by Ledger ID");
    const ledgerById = await ioltaService.getClientLedger(clientLedger.id);
    console.log("Client ledger by ledger ID:", ledgerById);
    console.assert(ledgerById?.id === clientLedger.id, "Client ledger should be retrieved correctly by ledger ID");
    
    console.log("\n[5] Testing Transaction Creation");
    const transactionData = {
      merchantId,
      amount: "2500.00",
      description: "Initial client retainer",
      transactionType: "deposit" as const,
      createdBy: 1,
      trustAccountId: account.id,
      clientLedgerId: clientLedger.id,
      fundType: "retainer" as const,
      status: "completed" as const,
      referenceNumber: "TR-1001",
      balanceAfter: "5000.00",
      transactionDate: new Date()
    };
    
    // Create a transaction
    try {
      const transaction = await ioltaService.recordTransaction(transactionData);
      console.log("Transaction created:", transaction);
      console.assert(transaction.id > 0, "Transaction ID should be positive");
      
      console.log("\n[6] Testing Transaction Retrieval");
      const retrievedTransaction = await ioltaService.getTransaction(transaction.id);
      console.log("Retrieved transaction:", retrievedTransaction);
      console.assert(retrievedTransaction.id === transaction.id, "Transaction should be retrieved correctly");
      
      console.log("\n[7] Testing Client Ledger Transactions");
      const transactions = await ioltaService.getTransactionsByClientLedger(clientLedger.id);
      console.log("Client ledger transactions:", transactions);
      console.assert(transactions.length > 0, "Client ledger should have transactions");
      console.assert(transactions.some(t => t.id === transaction.id), "Transaction should be in client ledger transactions");
    } catch (error) {
      console.error("Failed to create or retrieve transaction:", error);
    }
    
    console.log("\n[8] Testing Trust Account Reconciliation");
    try {
      const reconciliation = await ioltaService.getTrustAccountReconciliation(account.id);
      console.log("Reconciliation report:", reconciliation);
      console.assert(reconciliation.account.id === account.id, "Account should match");
      console.assert(reconciliation.clientLedgers.length > 0, "Should have client ledgers");
    } catch (error) {
      console.error("Failed to get reconciliation report:", error);
    }
    
    console.log("\n===== Test completed successfully =====");
    
  } catch (error) {
    console.error("Error testing IOLTA functions:", error);
  } finally {
    await cleanup();
  }
}

async function cleanup() {
  console.log("Cleaning up test data...");
  try {
    // Delete test transactions, client ledgers, and trust accounts
    await db.delete(ioltaTransactions).where(eq(ioltaTransactions.merchantId, 1));
    await db.delete(ioltaClientLedgers).where(eq(ioltaClientLedgers.merchantId, 1));
    await db.delete(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.merchantId, 1));
    console.log("Cleanup completed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Run the test
testIoltaFunctions().catch(console.error);