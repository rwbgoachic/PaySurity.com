/**
 * IOLTA Trust Accounting Test Suite
 * 
 * This tests the trust accounting functionality for the legal practice
 * management system including trust accounts, client ledgers, transactions,
 * and reconciliation reporting in compliance with legal ethics rules.
 */

import { db } from "../../db";
import { testCoordinator } from "./test-coordinator";
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers, 
  ioltaTransactions
} from "@shared/schema";
import { ioltaService } from "../legal/iolta-service";
import { TestReport } from "./test-interfaces";
import { eq } from "drizzle-orm";
import { Decimal } from "decimal.js";

// Sample test data
const testMerchantId = 1001;
const testUserId = 2001;
const testMatterId = 3001;
const testClientId = 4001;

/**
 * Main test entry point for IOLTA system
 */
export async function testLegalIoltaSystem(): Promise<TestReport> {
  console.log("Starting Legal IOLTA System Tests...");

  // Initialize report
  const report = {
    name: "Legal IOLTA Trust Accounting Tests",
    startTime: new Date(),
    testGroups: [
      {
        name: "Trust Account Management",
        tests: []
      },
      {
        name: "Client Ledger Operations",
        tests: []
      },
      {
        name: "Transaction Processing",
        tests: []
      },
      {
        name: "Reconciliation Reporting",
        tests: []
      }
    ],
    tests: []
  } as TestReport;

  try {
    // Clean up any previous test data
    await cleanupTestData();

    // Run test suites
    await testTrustAccountManagement(report);
    await testClientLedgerOperations(report);
    await testTransactionProcessing(report);
    await testReconciliationReporting(report);

    // Calculate pass rate and finalize report
    report.testsPassed = report.tests.filter(t => t.passed).length;
    report.testsFailed = report.tests.filter(t => !t.passed).length;
    report.passRate = report.tests.length > 0 
      ? (report.testsPassed / report.tests.length) * 100 
      : 0;
      
    report.endTime = new Date();
    report.duration = report.endTime.getTime() - report.startTime.getTime();

    // Update pass rates for each group
    if (report.testGroups) {
      for (const group of report.testGroups) {
        const groupTests = report.tests.filter(t => t.group === group.name);
        const passedTests = groupTests.filter(t => t.passed);
        group.passRate = groupTests.length > 0 
          ? (passedTests.length / groupTests.length) * 100 
          : 0;
      }
    }

    console.log(`IOLTA System Tests Completed: ${report.testsPassed}/${report.tests.length} passed (${report.passRate.toFixed(2)}%)`);
  } catch (error) {
    console.error("Error in IOLTA system tests:", error);
    
    // Add the error as a failed test
    report.tests.push({
      name: "IOLTA system test suite execution",
      passed: false,
      group: "Trust Account Management",
      error: String(error),
      errorDetails: error,
    });

    // Calculate test metrics
    report.testsPassed = report.tests.filter(t => t.passed).length;
    report.testsFailed = report.tests.filter(t => !t.passed).length;
    report.passRate = report.tests.length > 0 
      ? (report.testsPassed / report.tests.length) * 100 
      : 0;
    
    report.endTime = new Date();
    report.duration = report.endTime.getTime() - report.startTime.getTime();
  } finally {
    // Always clean up test data
    await cleanupTestData();
  }

  return report;
}

/**
 * Test trust account management functionality
 */
async function testTrustAccountManagement(report: TestReport): Promise<void> {
  // Test 1: Create a trust account
  try {
    const accountData = {
      merchantId: testMerchantId,
      accountName: "Test IOLTA Account",
      accountType: "iolta",
      bankName: "First Legal Bank",
      accountNumber: "12345678",
      routingNumber: "123456789",
      accountStatus: "active",
      interestBeneficiary: "state_bar_foundation",
      barAssociationId: "BA12345",
      notes: "Test account for automated testing"
    };

    const account = await ioltaService.createTrustAccount(accountData);
    
    // Verify the account was created with correct data
    const createdAccount = await db.select().from(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.id, account.id));
    
    const passed = createdAccount.length > 0 && 
                   createdAccount[0].accountName === accountData.accountName && 
                   createdAccount[0].accountType === accountData.accountType &&
                   createdAccount[0].bankName === accountData.bankName;
    
    report.tests.push({
      name: "Create trust account",
      passed,
      group: "Trust Account Management",
      error: passed ? null : "Created account doesn't match the input data",
    });
  } catch (error) {
    report.tests.push({
      name: "Create trust account",
      passed: false,
      group: "Trust Account Management",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Get trust account by ID
  try {
    // First create an account
    const accountData = {
      merchantId: testMerchantId,
      accountName: "Retrieval Test Account",
      accountType: "iolta",
      bankName: "Second Legal Bank",
      accountNumber: "87654321",
      routingNumber: "987654321",
      accountStatus: "active",
      interestBeneficiary: "state_bar_foundation",
      notes: "Test account for retrieval testing"
    };

    const createdAccount = await ioltaService.createTrustAccount(accountData);
    
    // Now retrieve it
    const retrievedAccount = await ioltaService.getTrustAccount(createdAccount.id);
    
    const passed = retrievedAccount && 
                  retrievedAccount.id === createdAccount.id && 
                  retrievedAccount.accountName === accountData.accountName;
    
    report.tests.push({
      name: "Get trust account by ID",
      passed,
      group: "Trust Account Management",
      error: passed ? null : "Retrieved account doesn't match the created account",
    });
  } catch (error) {
    report.tests.push({
      name: "Get trust account by ID",
      passed: false,
      group: "Trust Account Management",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 3: Get trust accounts by merchant
  try {
    // Create multiple accounts for the same merchant
    const accountData1 = {
      merchantId: testMerchantId,
      accountName: "Merchant Test Account 1",
      accountType: "iolta",
      bankName: "Third Legal Bank",
      accountNumber: "11111111",
      routingNumber: "111111111",
      accountStatus: "active"
    };

    const accountData2 = {
      merchantId: testMerchantId,
      accountName: "Merchant Test Account 2",
      accountType: "iolta",
      bankName: "Fourth Legal Bank",
      accountNumber: "22222222",
      routingNumber: "222222222",
      accountStatus: "active"
    };

    await ioltaService.createTrustAccount(accountData1);
    await ioltaService.createTrustAccount(accountData2);
    
    // Retrieve accounts for the merchant
    const merchantAccounts = await ioltaService.getTrustAccountsByMerchant(testMerchantId);
    
    const passed = merchantAccounts.length >= 2;
    
    report.tests.push({
      name: "Get trust accounts by merchant",
      passed,
      group: "Trust Account Management",
      error: passed ? null : "Failed to retrieve multiple trust accounts for merchant",
    });
  } catch (error) {
    report.tests.push({
      name: "Get trust accounts by merchant",
      passed: false,
      group: "Trust Account Management",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Test client ledger operations
 */
async function testClientLedgerOperations(report: TestReport): Promise<void> {
  // Create a test trust account to use for all ledger tests
  let testTrustAccount;
  try {
    const accountData = {
      merchantId: testMerchantId,
      accountName: "Ledger Test Trust Account",
      accountType: "iolta",
      bankName: "Ledger Test Bank",
      accountNumber: "33333333",
      routingNumber: "333333333",
      accountStatus: "active"
    };

    testTrustAccount = await ioltaService.createTrustAccount(accountData);
  } catch (error) {
    console.error("Failed to create test trust account for ledger tests:", error);
    return;
  }

  // Test 1: Create a client ledger
  try {
    const ledgerData = {
      trustAccountId: testTrustAccount.id,
      merchantId: testMerchantId,
      clientName: "Test Client",
      clientId: "CLI123",
      matterName: "Test Legal Matter",
      matterNumber: "MAT456",
      notes: "Test ledger for automated testing",
      status: "active"
    };

    const ledger = await ioltaService.createClientLedger(ledgerData);
    
    // Verify the ledger was created with correct data
    const createdLedger = await db.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.id, ledger.id));
    
    const passed = createdLedger.length > 0 && 
                   createdLedger[0].clientName === ledgerData.clientName && 
                   createdLedger[0].matterName === ledgerData.matterName &&
                   createdLedger[0].trustAccountId === testTrustAccount.id;
    
    report.tests.push({
      name: "Create client ledger",
      passed,
      group: "Client Ledger Operations",
      error: passed ? null : "Created ledger doesn't match the input data",
    });
  } catch (error) {
    report.tests.push({
      name: "Create client ledger",
      passed: false,
      group: "Client Ledger Operations",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Get client ledger by ID
  try {
    // First create a ledger
    const ledgerData = {
      trustAccountId: testTrustAccount.id,
      merchantId: testMerchantId,
      clientName: "Retrieval Test Client",
      clientId: "CLI789",
      matterName: "Retrieval Test Matter",
      matterNumber: "MAT987",
      status: "active"
    };

    const createdLedger = await ioltaService.createClientLedger(ledgerData);
    
    // Now retrieve it
    const retrievedLedger = await ioltaService.getClientLedger(createdLedger.id);
    
    const passed = retrievedLedger && 
                  retrievedLedger.id === createdLedger.id && 
                  retrievedLedger.clientName === ledgerData.clientName &&
                  retrievedLedger.matterName === ledgerData.matterName;
    
    report.tests.push({
      name: "Get client ledger by ID",
      passed,
      group: "Client Ledger Operations",
      error: passed ? null : "Retrieved ledger doesn't match the created ledger",
    });
  } catch (error) {
    report.tests.push({
      name: "Get client ledger by ID",
      passed: false,
      group: "Client Ledger Operations",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 3: Get client ledgers by trust account
  try {
    // Create multiple ledgers for the same trust account
    const ledgerData1 = {
      trustAccountId: testTrustAccount.id,
      merchantId: testMerchantId,
      clientName: "Trust Account Ledger Client 1",
      clientId: "CLI111",
      matterName: "Trust Account Test Matter 1",
      matterNumber: "MAT111",
      status: "active"
    };

    const ledgerData2 = {
      trustAccountId: testTrustAccount.id,
      merchantId: testMerchantId,
      clientName: "Trust Account Ledger Client 2",
      clientId: "CLI222",
      matterName: "Trust Account Test Matter 2",
      matterNumber: "MAT222",
      status: "active"
    };

    await ioltaService.createClientLedger(ledgerData1);
    await ioltaService.createClientLedger(ledgerData2);
    
    // Retrieve ledgers for the trust account
    const trustAccountLedgers = await ioltaService.getClientLedgersByTrustAccount(testTrustAccount.id);
    
    const passed = trustAccountLedgers.length >= 2;
    
    report.tests.push({
      name: "Get client ledgers by trust account",
      passed,
      group: "Client Ledger Operations",
      error: passed ? null : "Failed to retrieve multiple client ledgers for trust account",
    });
  } catch (error) {
    report.tests.push({
      name: "Get client ledgers by trust account",
      passed: false,
      group: "Client Ledger Operations",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 4: Get client ledgers by merchant
  try {
    // Retrieve ledgers for the merchant
    const merchantLedgers = await ioltaService.getClientLedgersByMerchant(testMerchantId);
    
    const passed = merchantLedgers.length >= 2;
    
    report.tests.push({
      name: "Get client ledgers by merchant",
      passed,
      group: "Client Ledger Operations",
      error: passed ? null : "Failed to retrieve multiple client ledgers for merchant",
    });
  } catch (error) {
    report.tests.push({
      name: "Get client ledgers by merchant",
      passed: false,
      group: "Client Ledger Operations",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Test transaction processing functionality
 */
async function testTransactionProcessing(report: TestReport): Promise<void> {
  // Create a test trust account and client ledger to use for all transaction tests
  let testTrustAccount;
  let testClientLedger;
  
  try {
    const accountData = {
      merchantId: testMerchantId,
      accountName: "Transaction Test Trust Account",
      accountType: "iolta",
      bankName: "Transaction Test Bank",
      accountNumber: "44444444",
      routingNumber: "444444444",
      accountStatus: "active",
      balance: "0.00"
    };

    testTrustAccount = await ioltaService.createTrustAccount(accountData);
    
    const ledgerData = {
      trustAccountId: testTrustAccount.id,
      merchantId: testMerchantId,
      clientName: "Transaction Test Client",
      clientId: "CLI444",
      matterName: "Transaction Test Matter",
      matterNumber: "MAT444",
      status: "active",
      balance: "0.00"
    };
    
    testClientLedger = await ioltaService.createClientLedger(ledgerData);
  } catch (error) {
    console.error("Failed to create test data for transaction tests:", error);
    return;
  }

  // Test 1: Record a deposit transaction
  try {
    const depositData = {
      trustAccountId: testTrustAccount.id,
      clientLedgerId: testClientLedger.id,
      transactionType: "deposit",
      fundType: "retainer",
      amount: "5000.00",
      description: "Initial retainer deposit",
      reference: "DEP12345",
      createdBy: testUserId,
      status: "completed"
    };

    const transaction = await ioltaService.recordTransaction(depositData);
    
    // Verify the transaction was recorded
    const recordedTransaction = await db.select().from(ioltaTransactions).where(eq(ioltaTransactions.id, transaction.id));
    
    // Check that the transaction is recorded correctly
    const transactionCorrect = recordedTransaction.length > 0 && 
                             recordedTransaction[0].transactionType === depositData.transactionType && 
                             recordedTransaction[0].amount.toString() === depositData.amount;
    
    // Verify the client ledger balance was updated
    const updatedLedger = await ioltaService.getClientLedger(testClientLedger.id);
    
    // Verify the trust account balance was updated
    const updatedAccount = await ioltaService.getTrustAccount(testTrustAccount.id);
    
    const balancesCorrect = updatedLedger && 
                          updatedAccount && 
                          updatedLedger.balance === depositData.amount && 
                          updatedAccount.balance === depositData.amount;
    
    const passed = transactionCorrect && balancesCorrect;
    
    report.tests.push({
      name: "Record deposit transaction",
      passed,
      group: "Transaction Processing",
      error: passed ? null : "Transaction recording or balance updates failed",
    });
  } catch (error) {
    report.tests.push({
      name: "Record deposit transaction",
      passed: false,
      group: "Transaction Processing",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Record a withdrawal transaction
  try {
    const withdrawalData = {
      trustAccountId: testTrustAccount.id,
      clientLedgerId: testClientLedger.id,
      transactionType: "withdrawal",
      fundType: "filing_fee",
      amount: "1200.00",
      description: "Court filing fee",
      reference: "WIT98765",
      createdBy: testUserId,
      status: "completed"
    };

    const transaction = await ioltaService.recordTransaction(withdrawalData);
    
    // Get current ledger and account balances
    const currentLedger = await ioltaService.getClientLedger(testClientLedger.id);
    const currentAccount = await ioltaService.getTrustAccount(testTrustAccount.id);
    
    if (!currentLedger || !currentAccount) {
      throw new Error("Could not retrieve current balances");
    }
    
    // Calculate expected balances (should be 5000 - 1200 = 3800)
    const expectedBalance = new Decimal("5000.00").minus(new Decimal("1200.00")).toString();
    
    const passed = currentLedger.balance === expectedBalance && 
                  currentAccount.balance === expectedBalance;
    
    report.tests.push({
      name: "Record withdrawal transaction",
      passed,
      group: "Transaction Processing",
      error: passed ? null : `Balance updates incorrect: ledger=${currentLedger.balance}, account=${currentAccount.balance}, expected=${expectedBalance}`,
    });
  } catch (error) {
    report.tests.push({
      name: "Record withdrawal transaction",
      passed: false,
      group: "Transaction Processing",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 3: Record an earned payment transaction
  try {
    const paymentData = {
      trustAccountId: testTrustAccount.id,
      clientLedgerId: testClientLedger.id,
      transactionType: "payment",
      fundType: "earned",
      amount: "1000.00",
      description: "Payment for legal services",
      reference: "PAY54321",
      createdBy: testUserId,
      status: "completed"
    };

    const transaction = await ioltaService.recordTransaction(paymentData);
    
    // Get current ledger and account balances
    const currentLedger = await ioltaService.getClientLedger(testClientLedger.id);
    const currentAccount = await ioltaService.getTrustAccount(testTrustAccount.id);
    
    if (!currentLedger || !currentAccount) {
      throw new Error("Could not retrieve current balances");
    }
    
    // Calculate expected balances (after deposit, withdrawal, and now payment: 5000 - 1200 - 1000 = 2800)
    const expectedBalance = new Decimal("5000.00")
      .minus(new Decimal("1200.00"))
      .minus(new Decimal("1000.00"))
      .toString();
    
    const passed = currentLedger.balance === expectedBalance && 
                  currentAccount.balance === expectedBalance;
    
    report.tests.push({
      name: "Record earned payment transaction",
      passed,
      group: "Transaction Processing",
      error: passed ? null : `Balance updates incorrect: ledger=${currentLedger.balance}, account=${currentAccount.balance}, expected=${expectedBalance}`,
    });
  } catch (error) {
    report.tests.push({
      name: "Record earned payment transaction",
      passed: false,
      group: "Transaction Processing",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 4: Get transactions by client ledger
  try {
    const ledgerTransactions = await ioltaService.getTransactionsByClientLedger(testClientLedger.id);
    
    const passed = ledgerTransactions.length === 3; // We've created 3 transactions for this ledger
    
    report.tests.push({
      name: "Get transactions by client ledger",
      passed,
      group: "Transaction Processing",
      error: passed ? null : `Expected 3 transactions, got ${ledgerTransactions.length}`,
    });
  } catch (error) {
    report.tests.push({
      name: "Get transactions by client ledger",
      passed: false,
      group: "Transaction Processing",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 5: Get transactions by trust account
  try {
    const accountTransactions = await ioltaService.getTransactionsByTrustAccount(testTrustAccount.id);
    
    const passed = accountTransactions.length === 3; // We've created 3 transactions for this account
    
    report.tests.push({
      name: "Get transactions by trust account",
      passed,
      group: "Transaction Processing",
      error: passed ? null : `Expected 3 transactions, got ${accountTransactions.length}`,
    });
  } catch (error) {
    report.tests.push({
      name: "Get transactions by trust account",
      passed: false,
      group: "Transaction Processing",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Test reconciliation reporting functionality
 */
async function testReconciliationReporting(report: TestReport): Promise<void> {
  // Create a new test trust account with two client ledgers for reconciliation tests
  let testTrustAccount;
  let testClientLedger1;
  let testClientLedger2;
  
  try {
    const accountData = {
      merchantId: testMerchantId,
      accountName: "Reconciliation Test Trust Account",
      accountType: "iolta",
      bankName: "Reconciliation Test Bank",
      accountNumber: "55555555",
      routingNumber: "555555555",
      accountStatus: "active",
      balance: "0.00"
    };

    testTrustAccount = await ioltaService.createTrustAccount(accountData);
    
    const ledgerData1 = {
      trustAccountId: testTrustAccount.id,
      merchantId: testMerchantId,
      clientName: "Reconciliation Test Client 1",
      clientId: "CLI555",
      matterName: "Reconciliation Test Matter 1",
      matterNumber: "MAT555",
      status: "active",
      balance: "0.00"
    };
    
    const ledgerData2 = {
      trustAccountId: testTrustAccount.id,
      merchantId: testMerchantId,
      clientName: "Reconciliation Test Client 2",
      clientId: "CLI666",
      matterName: "Reconciliation Test Matter 2",
      matterNumber: "MAT666",
      status: "active",
      balance: "0.00"
    };
    
    testClientLedger1 = await ioltaService.createClientLedger(ledgerData1);
    testClientLedger2 = await ioltaService.createClientLedger(ledgerData2);
    
    // Add some transactions to both client ledgers
    await ioltaService.recordTransaction({
      trustAccountId: testTrustAccount.id,
      clientLedgerId: testClientLedger1.id,
      transactionType: "deposit",
      fundType: "retainer",
      amount: "3000.00",
      description: "Client 1 retainer",
      createdBy: testUserId,
      status: "completed"
    });
    
    await ioltaService.recordTransaction({
      trustAccountId: testTrustAccount.id,
      clientLedgerId: testClientLedger2.id,
      transactionType: "deposit",
      fundType: "retainer",
      amount: "2000.00",
      description: "Client 2 retainer",
      createdBy: testUserId,
      status: "completed"
    });
    
    await ioltaService.recordTransaction({
      trustAccountId: testTrustAccount.id,
      clientLedgerId: testClientLedger1.id,
      transactionType: "withdrawal",
      fundType: "filing_fee",
      amount: "500.00",
      description: "Client 1 filing fee",
      createdBy: testUserId,
      status: "completed"
    });
  } catch (error) {
    console.error("Failed to create test data for reconciliation tests:", error);
    return;
  }

  // Test 1: Get client ledger statement
  try {
    const statement = await ioltaService.getClientLedgerStatement(testClientLedger1.id);
    
    // Client 1 should have 2 transactions (deposit and withdrawal)
    const passed = statement && 
                  statement.transactions.length === 2 && 
                  statement.closingBalance === "2500.00"; // 3000 - 500 = 2500
    
    report.tests.push({
      name: "Get client ledger statement",
      passed,
      group: "Reconciliation Reporting",
      error: passed ? null : "Client ledger statement incorrect",
    });
  } catch (error) {
    report.tests.push({
      name: "Get client ledger statement",
      passed: false,
      group: "Reconciliation Reporting",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Get trust account reconciliation
  try {
    const reconciliation = await ioltaService.getTrustAccountReconciliation(testTrustAccount.id);
    
    // Trust account should have 4500 total (3000 - 500 + 2000 = 4500)
    const passed = reconciliation && 
                  reconciliation.trustAccountBalance === "4500.00" && 
                  reconciliation.totalClientLedgerBalances === "4500.00" &&
                  reconciliation.difference === "0.00" &&
                  reconciliation.isBalanced === true;
    
    report.tests.push({
      name: "Get trust account reconciliation",
      passed,
      group: "Reconciliation Reporting",
      error: passed ? null : "Trust account reconciliation incorrect",
    });
  } catch (error) {
    report.tests.push({
      name: "Get trust account reconciliation",
      passed: false,
      group: "Reconciliation Reporting",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 3: Get client ledger statement with date filters
  try {
    // Add a transaction with a specific date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Update the createdAt field directly in the database for the first transaction
    const [firstTransaction] = await db.select()
      .from(ioltaTransactions)
      .where(eq(ioltaTransactions.clientLedgerId, testClientLedger1.id))
      .limit(1);
    
    if (!firstTransaction) {
      throw new Error("Could not find transaction for date testing");
    }
    
    await db.update(ioltaTransactions)
      .set({ createdAt: yesterday })
      .where(eq(ioltaTransactions.id, firstTransaction.id));
    
    // Now get the statement with a date filter for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const statement = await ioltaService.getClientLedgerStatement(testClientLedger1.id, today);
    
    // Should only include transactions from today (not the one we set to yesterday)
    // So there should be only 1 transaction in the result
    const passed = statement && statement.transactions.length === 1;
    
    report.tests.push({
      name: "Get client ledger statement with date filter",
      passed,
      group: "Reconciliation Reporting",
      error: passed ? null : `Expected 1 filtered transaction, got ${statement ? statement.transactions.length : 0}`,
    });
  } catch (error) {
    report.tests.push({
      name: "Get client ledger statement with date filter",
      passed: false,
      group: "Reconciliation Reporting",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData(): Promise<void> {
  // Delete test transactions
  await db.delete(ioltaTransactions)
        .where(eq(ioltaTransactions.trustAccountId, 
          db.select({ id: ioltaTrustAccounts.id })
            .from(ioltaTrustAccounts)
            .where(eq(ioltaTrustAccounts.merchantId, testMerchantId))
            .limit(1)
        ));
  
  // Delete test client ledgers
  await db.delete(ioltaClientLedgers)
        .where(eq(ioltaClientLedgers.merchantId, testMerchantId));
  
  // Delete test trust accounts
  await db.delete(ioltaTrustAccounts)
        .where(eq(ioltaTrustAccounts.merchantId, testMerchantId));
}