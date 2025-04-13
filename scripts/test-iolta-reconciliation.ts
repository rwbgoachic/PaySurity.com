/**
 * Test IOLTA Reconciliation Reports
 * 
 * This script tests the reconciliation reporting functionality of the IOLTA service.
 * 
 * Run with: npx tsx scripts/test-iolta-reconciliation.ts
 */

import { db } from '../server/db';
import { IoltaReconciliationService } from '../server/services/legal/iolta-reconciliation-service';
import { IoltaService } from '../server/services/legal/iolta-service';

const reconciliationService = new IoltaReconciliationService();
const ioltaService = new IoltaService();

// Test data
const testData = {
  merchantId: 1,
  trustAccountId: 0, // Will be populated after trust account creation
  clientId: 0, // Will be populated after client creation
  clientData: {
    merchantId: 1,
    firstName: "Test",
    lastName: "Client",
    email: "test@example.com",
    status: "active",
    client_type: "business",
    is_business: true,
    // Derived properties
    get clientName() {
      return `${this.firstName} ${this.lastName}`;
    }
  }
};

/**
 * Run the test
 */
async function runTest() {
  console.log("Starting IOLTA Reconciliation Reports Test...");
  
  try {
    // Setup test data
    await setupTestData();
    
    // Test getReconciliations
    await testGetReconciliations();
    
    // Test generateReconciliationReport
    await testGenerateReconciliationReport();
    
    // Test generateClientReconciliationReport
    await testGenerateClientReconciliationReport();
    
    // Clean up test data
    await cleanupTestData();
    
    console.log("All tests completed successfully!");
  } catch (error) {
    console.error("Error running IOLTA reconciliation tests:", error);
  } finally {
    // Exit process
    process.exit(0);
  }
}

/**
 * Setup test data for reconciliation tests
 */
async function setupTestData() {
  console.log("Setting up test data...");
  
  // First, create a test client
  const clientResult = await db.execute(`
    INSERT INTO legal_clients (merchant_id, client_type, first_name, last_name, email, phone, status, jurisdiction, is_business, client_number)
    VALUES (${testData.merchantId}, 'business', 'Test', 'Client', 'test@example.com', '555-1234', 'active', 'CA', true, 'CLIENT-${Date.now()}')
    RETURNING id
  `);
  
  // Set the clientId from the returned ID
  testData.clientId = clientResult.rows[0].id;
  console.log("Created test client with ID:", testData.clientId);
  
  // Create a test trust account
  const trustAccount = await ioltaService.createTrustAccount({
    merchantId: testData.merchantId,
    clientId: testData.clientId,
    accountNumber: "TEST-RECON-" + Date.now(),
    accountName: "Test Reconciliation Account",
    bankName: "Test Bank",
    routingNumber: "123456789",
    accountType: "iolta",
    status: "active",
    balance: "10000.00"
  });
  
  testData.trustAccountId = trustAccount.id;
  console.log(`Created test trust account with ID: ${trustAccount.id}`);
  
  // Add a client ledger
  await ioltaService.createClientLedger({
    merchantId: testData.merchantId,
    trustAccountId: trustAccount.id,
    clientId: testData.clientId,
    clientName: testData.clientData.clientName,
    matterName: "Test Matter",
    matterNumber: "TM-001",
    balance: "5000.00",
    status: "active",
    jurisdiction: "CA",
    currentBalance: "5000.00",
    notes: "Test client ledger for reconciliation testing"
  });
  
  console.log(`Created test client ledger for client: ${testData.clientId}`);
  
  // Add some transactions
  const transactions = [
    {
      merchantId: testData.merchantId,
      trustAccountId: trustAccount.id,
      clientId: testData.clientId,
      description: "Initial deposit",
      amount: "5000.00",
      transactionType: "deposit",
      matterId: 1,
      referenceNumber: "REF001",
      status: "completed",
      notes: "Test transaction 1",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    },
    {
      merchantId: testData.merchantId,
      trustAccountId: trustAccount.id,
      clientId: testData.clientId,
      description: "Court filing fee",
      amount: "500.00",
      transactionType: "withdrawal",
      matterId: 1,
      checkNumber: "1001",
      referenceNumber: "REF002",
      status: "completed",
      notes: "Test transaction 2",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      merchantId: testData.merchantId,
      trustAccountId: trustAccount.id,
      clientId: testData.clientId,
      description: "Additional deposit",
      amount: "2000.00",
      transactionType: "deposit",
      matterId: 1,
      referenceNumber: "REF003",
      status: "completed",
      notes: "Test transaction 3",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ];
  
  for (const transaction of transactions) {
    await ioltaService.recordTransaction(transaction);
  }
  
  console.log(`Created ${transactions.length} test transactions`);
  
  // Create a test reconciliation record
  const reconciliationDate = new Date();
  // Convert to ISO string format "YYYY-MM-DD" for the database
  const formattedDate = reconciliationDate.toISOString().split('T')[0];
  
  await reconciliationService.createReconciliation({
    merchantId: testData.merchantId,
    trustAccountId: trustAccount.id,
    reconciliationDate: formattedDate,
    bookBalance: "10000.00",
    bankBalance: "10000.00",
    adjustedBookBalance: "10000.00",
    adjustedBankBalance: "10000.00",
    isBalanced: true,
    status: "completed",
    createdById: 1
  });
  
  console.log("Created test reconciliation record");
}

/**
 * Test the getReconciliations method
 */
async function testGetReconciliations() {
  console.log("\nTesting getReconciliations...");
  
  const reconciliations = await reconciliationService.getReconciliations(
    testData.trustAccountId,
    testData.merchantId
  );
  
  if (!reconciliations || reconciliations.length === 0) {
    throw new Error("No reconciliations found");
  }
  
  console.log(`Found ${reconciliations.length} reconciliation records`);
  console.log("getReconciliations test passed!");
}

/**
 * Test the generateReconciliationReport method
 */
async function testGenerateReconciliationReport() {
  console.log("\nTesting generateReconciliationReport...");
  
  // 30 days ago
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date(); // Now
  
  // Format dates as ISO strings YYYY-MM-DD
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  const report = await reconciliationService.generateReconciliationReport(
    testData.trustAccountId,
    testData.merchantId,
    formattedStartDate,
    formattedEndDate
  );
  
  if (!report) {
    throw new Error("Failed to generate reconciliation report");
  }
  
  console.log("Reconciliation Report:");
  console.log(`- Account ID: ${report.accountId}`);
  console.log(`- Starting Balance: ${report.startingBalance}`);
  console.log(`- Ending Balance: ${report.endingBalance}`);
  console.log(`- Transactions: ${report.transactions.length}`);
  console.log(`- Deposits: ${report.deposits.length}`);
  console.log(`- Withdrawals: ${report.withdrawals.length}`);
  
  console.log("generateReconciliationReport test passed!");
}

/**
 * Test the generateClientReconciliationReport method
 */
async function testGenerateClientReconciliationReport() {
  console.log("\nTesting generateClientReconciliationReport...");
  
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const endDate = new Date(); // Now
  
  // Format dates as ISO strings YYYY-MM-DD
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  const report = await reconciliationService.generateClientReconciliationReport(
    testData.clientId,
    testData.trustAccountId,
    testData.merchantId,
    formattedStartDate,
    formattedEndDate
  );
  
  if (!report) {
    throw new Error("Failed to generate client reconciliation report");
  }
  
  console.log("Client Reconciliation Report:");
  console.log(`- Client ID: ${report.clientId}`);
  console.log(`- Account ID: ${report.accountId}`);
  console.log(`- Starting Balance: ${report.startingBalance}`);
  console.log(`- Ending Balance: ${report.endingBalance}`);
  console.log(`- Transactions: ${report.transactions.length}`);
  console.log(`- Deposits: ${report.deposits.length}`);
  console.log(`- Withdrawals: ${report.withdrawals.length}`);
  
  console.log("generateClientReconciliationReport test passed!");
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  console.log("\nCleaning up test data...");
  
  // Delete all test transactions for the trust account
  await db.execute(`
    DELETE FROM iolta_transactions 
    WHERE trust_account_id = ${testData.trustAccountId}
  `);
  
  // Delete the client ledger
  await db.execute(`
    DELETE FROM iolta_client_ledgers 
    WHERE trust_account_id = ${testData.trustAccountId}
    AND client_id = ${testData.clientId}
  `);
  
  // Delete reconciliation records
  await db.execute(`
    DELETE FROM iolta_reconciliations 
    WHERE trust_account_id = ${testData.trustAccountId}
  `);
  
  // Delete the trust account
  await db.execute(`
    DELETE FROM iolta_trust_accounts 
    WHERE id = ${testData.trustAccountId}
  `);
  
  // Delete the test client
  await db.execute(`
    DELETE FROM legal_clients
    WHERE id = ${testData.clientId}
    AND merchant_id = ${testData.merchantId}
  `);
  
  console.log("Test data cleaned up successfully");
}

// Run the test
runTest();