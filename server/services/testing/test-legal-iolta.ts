import { TestService, TestReport, TestGroup } from './test-interfaces';
import { db } from '../../db';
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers, 
  ioltaTransactions,
  insertIoltaTrustAccountSchema,
  insertIoltaClientLedgerSchema,
  insertIoltaTransactionSchema,
  merchants,
  legalClients
} from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ioltaTransactionSqlService } from '../../services/legal/iolta-transaction-sql-service';

/**
 * Test service for IOLTA trust accounting functionality
 */
export class IoltaTestService implements TestService {
  private merchantId: number | null = null;
  private clientId: number | null = null;
  private trustAccountId: number | null = null;
  private clientLedgerId: number | null = null;
  private transactionIds: number[] = [];
  
  /**
   * Create a deliberate test failure (for testing the test framework)
   * Required by TestService interface
   */
  async createDeliberateTestFailure(): Promise<TestReport> {
    return {
      serviceName: 'IOLTA Trust Accounting',
      passed: false,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      testGroups: [
        {
          name: 'Deliberate Failure',
          description: 'This test is designed to fail for testing purposes.',
          tests: [
            {
              name: 'Deliberate failure test',
              description: 'This test always fails by design',
              passed: false,
              error: 'This is a deliberate test failure'
            }
          ],
          passed: false
        }
      ],
      error: 'Deliberate test failure'
    };
  }

  /**
   * Run all tests for IOLTA trust accounting
   */
  async runTests(): Promise<TestReport> {
    console.log('Starting IOLTA Trust Accounting Tests...');
    
    const report: TestReport = {
      serviceName: 'IOLTA Trust Accounting Tests',
      testGroups: [],
      startTime: new Date(),
      endTime: new Date(),
      passed: true,
      duration: 0,
      error: null
    };

    try {
      // Set up test environment
      await this.setupTestEnvironment();
      
      // Test groups
      await this.testTrustAccountManagement(report);
      await this.testClientLedgerOperations(report);
      await this.testTransactionOperations(report);
      await this.testBalanceCalculations(report);
      
      // Clean up
      await this.cleanupTestEnvironment();
      
      // Calculate final stats
      report.endTime = new Date();
      report.passed = report.testGroups?.every(group => group.passed) ?? false;
      
      return report;
    } catch (error) {
      console.error('Error running IOLTA tests:', error);
      report.passed = false;
      report.endTime = new Date();
      return report;
    }
  }
  
  /**
   * Set up test environment with necessary data
   */
  private async setupTestEnvironment() {
    console.log('Setting up test environment for IOLTA tests...');
    
    // Create test merchant
    const [merchant] = await db.insert(merchants)
      .values({
        name: 'Test Law Firm LLP',
        businessName: 'Test Law Firm LLP',
        contactName: 'Test Contact',
        email: 'test@example.com',
        phone: '555-123-4567',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        businessType: 'legal',
        taxId: '12-3456789',
        website: 'https://testlawfirm.example.com',
        isoPartnerId: 1,
        status: 'active',
        processingVolume: 10000,
        commissionRate: 0.25,
        monthlyFee: 49.99
      })
      .returning();
    
    this.merchantId = merchant.id;
    
    // Create test client using SQL to ensure jurisdiction column is included
    const clientNumber = 'TC-' + Date.now().toString().slice(-6); // Generate unique client number
    await db.execute(sql`
        INSERT INTO legal_clients (
          merchant_id, client_number, client_type, status, first_name, last_name,
          email, phone, address, city, state, zip_code, jurisdiction, tax_id, is_active
        ) VALUES (
          ${this.merchantId}, ${clientNumber}, 'individual', 'active', 'Test',
          'Client', 'testclient@example.com', '555-987-6543', '456 Client St',
          'Client City', 'CS', '54321', 'CA', '11-2233445', true
        ) RETURNING id;
      `).then(result => {
        this.clientId = Number(result.rows[0].id);
      });
    
    console.log('Test environment setup complete.');
  }
  
  /**
   * Clean up test environment
   */
  private async cleanupTestEnvironment() {
    console.log('Cleaning up test environment...');
    
    // Clean up transactions
    for (const transactionId of this.transactionIds) {
      await db.delete(ioltaTransactions).where(eq(ioltaTransactions.id, transactionId));
    }
    
    // Clean up client ledger
    if (this.clientLedgerId) {
      await db.delete(ioltaClientLedgers).where(eq(ioltaClientLedgers.id, this.clientLedgerId));
    }
    
    // Clean up trust account
    if (this.trustAccountId) {
      await db.delete(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.id, this.trustAccountId));
    }
    
    // Clean up client
    if (this.clientId) {
      await db.delete(legalClients).where(eq(legalClients.id, this.clientId));
    }
    
    // Clean up merchant
    if (this.merchantId) {
      await db.delete(merchants).where(eq(merchants.id, this.merchantId));
    }
    
    console.log('Test environment cleanup complete.');
  }
  
  /**
   * Test trust account management
   */
  private async testTrustAccountManagement(report: TestReport) {
    console.log('Testing trust account management...');
    
    const testGroup: TestGroup = {
      name: 'Trust Account Management',
      description: 'Tests for IOLTA trust account management functionality',
      tests: [],
      passed: true
    };
    
    // Test creating a trust account
    try {
      const trustAccountData = insertIoltaTrustAccountSchema.parse({
        merchantId: this.merchantId,
        clientId: this.clientId,  // Add client ID
        accountName: 'Test Trust Account',
        accountNumber: 'TRUST-1234',
        bankName: 'Test Bank',
        routingNumber: '123456789',
        status: 'active',  // Changed from accountStatus to status
        accountType: 'iolta',
        balance: '0',
        notes: 'Test trust account for automated testing'
      });
      
      const [trustAccount] = await db.insert(ioltaTrustAccounts)
        .values(trustAccountData)
        .returning();
        
      this.trustAccountId = trustAccount.id;
      
      testGroup.tests.push({
        name: 'Create Trust Account',
        description: 'Test that a trust account can be created',
        passed: !!trustAccount && trustAccount.accountName === 'Test Trust Account',
        error: (!!trustAccount && trustAccount.accountName === 'Test Trust Account') ? null : 'Failed to create trust account'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Trust Account',
        description: 'Test that a trust account can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test retrieving a trust account
    try {
      const trustAccount = await db.select().from(ioltaTrustAccounts)
        .where(eq(ioltaTrustAccounts.id, this.trustAccountId!))
        .then(records => records[0]);
      
      testGroup.tests.push({
        name: 'Retrieve Trust Account',
        description: 'Test that a trust account can be retrieved',
        passed: !!trustAccount && trustAccount.accountName === 'Test Trust Account',
        error: (!!trustAccount && trustAccount.accountName === 'Test Trust Account') ? null : 'Failed to retrieve trust account'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Retrieve Trust Account',
        description: 'Test that a trust account can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test updating a trust account
    try {
      await db.update(ioltaTrustAccounts)
        .set({ accountName: 'Updated Trust Account' })
        .where(eq(ioltaTrustAccounts.id, this.trustAccountId!));
        
      const updatedTrustAccount = await db.select().from(ioltaTrustAccounts)
        .where(eq(ioltaTrustAccounts.id, this.trustAccountId!))
        .then(records => records[0]);
      
      testGroup.tests.push({
        name: 'Update Trust Account',
        description: 'Test that a trust account can be updated',
        passed: updatedTrustAccount.accountName === 'Updated Trust Account',
        error: updatedTrustAccount.accountName === 'Updated Trust Account' ? null : 'Failed to update trust account'
      });
      
      // Reset the account name for remaining tests
      await db.update(ioltaTrustAccounts)
        .set({ accountName: 'Test Trust Account' })
        .where(eq(ioltaTrustAccounts.id, this.trustAccountId!));
    } catch (error) {
      testGroup.tests.push({
        name: 'Update Trust Account',
        description: 'Test that a trust account can be updated',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test client ledger operations
   */
  private async testClientLedgerOperations(report: TestReport) {
    console.log('Testing client ledger operations...');
    
    const testGroup: TestGroup = {
      name: 'Client Ledger Operations',
      description: 'Tests for IOLTA client ledger functionality',
      tests: [],
      passed: true
    };
    
    // Test creating a client ledger
    try {
      const clientLedgerData = insertIoltaClientLedgerSchema.parse({
        trustAccountId: this.trustAccountId,
        merchantId: this.merchantId,
        clientId: String(this.clientId), // Convert to string since schema expects string
        clientName: 'Test Client', // Add required clientName field
        matterName: 'Test Matter',
        matterNumber: 'M-12345',
        status: 'active',
        currentBalance: '0.00',
        balance: '0.00', // Include balance field explicitly
        notes: 'Test client ledger for automated testing'
      });
      
      const [clientLedger] = await db.insert(ioltaClientLedgers)
        .values(clientLedgerData)
        .returning();
        
      this.clientLedgerId = clientLedger.id;
      
      testGroup.tests.push({
        name: 'Create Client Ledger',
        description: 'Test that a client ledger can be created',
        passed: !!clientLedger && clientLedger.matterName === 'Test Matter',
        error: (!!clientLedger && clientLedger.matterName === 'Test Matter') ? null : 'Failed to create client ledger'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Client Ledger',
        description: 'Test that a client ledger can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test retrieving a client ledger
    try {
      const clientLedger = await db.select().from(ioltaClientLedgers)
        .where(eq(ioltaClientLedgers.id, this.clientLedgerId!))
        .then(records => records[0]);
      
      testGroup.tests.push({
        name: 'Retrieve Client Ledger',
        description: 'Test that a client ledger can be retrieved',
        passed: !!clientLedger && clientLedger.matterName === 'Test Matter',
        error: (!!clientLedger && clientLedger.matterName === 'Test Matter') ? null : 'Failed to retrieve client ledger'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Retrieve Client Ledger',
        description: 'Test that a client ledger can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test updating a client ledger
    try {
      await db.update(ioltaClientLedgers)
        .set({ matterName: 'Updated Matter' })
        .where(eq(ioltaClientLedgers.id, this.clientLedgerId!));
        
      const updatedClientLedger = await db.select().from(ioltaClientLedgers)
        .where(eq(ioltaClientLedgers.id, this.clientLedgerId!))
        .then(records => records[0]);
      
      testGroup.tests.push({
        name: 'Update Client Ledger',
        description: 'Test that a client ledger can be updated',
        passed: updatedClientLedger.matterName === 'Updated Matter',
        error: updatedClientLedger.matterName === 'Updated Matter' ? null : 'Failed to update client ledger'
      });
      
      // Reset the matter name for remaining tests
      await db.update(ioltaClientLedgers)
        .set({ matterName: 'Test Matter' })
        .where(eq(ioltaClientLedgers.id, this.clientLedgerId!));
    } catch (error) {
      testGroup.tests.push({
        name: 'Update Client Ledger',
        description: 'Test that a client ledger can be updated',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test transaction operations
   */
  private async testTransactionOperations(report: TestReport) {
    console.log('Testing transaction operations...');
    
    const testGroup: TestGroup = {
      name: 'Transaction Operations',
      description: 'Tests for IOLTA transaction functionality',
      tests: [],
      passed: true
    };
    
    // Test creating a deposit transaction
    try {
      // Use the SQL service to create the transaction with proper balance calculation
      const depositResult = await ioltaTransactionSqlService.createTransaction({
        merchantId: this.merchantId!,
        trustAccountId: this.trustAccountId!,
        clientLedgerId: this.clientLedgerId!,
        amount: '1000.00',
        description: 'Initial deposit',
        transactionType: 'deposit',
        fundType: 'trust',
        createdBy: 1,
        status: 'completed',
        referenceNumber: 'DEP-12345'
      });
      
      const deposit = depositResult.transaction;
      this.transactionIds.push(deposit.id);
      
      testGroup.tests.push({
        name: 'Create Deposit Transaction',
        description: 'Test that a deposit transaction can be created',
        passed: !!deposit && deposit.transactionType === 'deposit' && deposit.amount === '1000.00',
        error: (!!deposit && deposit.transactionType === 'deposit' && deposit.amount === '1000.00') ? null : 'Failed to create deposit transaction'
      });
    } catch (error) {
      console.error('Error creating deposit transaction:', error);
      testGroup.tests.push({
        name: 'Create Deposit Transaction',
        description: 'Test that a deposit transaction can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test creating a withdrawal transaction
    try {
      // Use the SQL service to create the transaction with proper balance calculation
      const withdrawalResult = await ioltaTransactionSqlService.createTransaction({
        merchantId: this.merchantId!,
        trustAccountId: this.trustAccountId!,
        clientLedgerId: this.clientLedgerId!,
        amount: '300.00',
        description: 'Withdrawal for client expenses',
        transactionType: 'withdrawal',
        fundType: 'trust',
        createdBy: 1,
        status: 'completed',
        referenceNumber: 'WIT-12345'
      });
      
      const withdrawal = withdrawalResult.transaction;
      this.transactionIds.push(withdrawal.id);
      
      testGroup.tests.push({
        name: 'Create Withdrawal Transaction',
        description: 'Test that a withdrawal transaction can be created',
        passed: !!withdrawal && withdrawal.transactionType === 'withdrawal' && withdrawal.amount === '300.00',
        error: (!!withdrawal && withdrawal.transactionType === 'withdrawal' && withdrawal.amount === '300.00') ? null : 'Failed to create withdrawal transaction'
      });
    } catch (error) {
      console.error('Error creating withdrawal transaction:', error);
      testGroup.tests.push({
        name: 'Create Withdrawal Transaction',
        description: 'Test that a withdrawal transaction can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test retrieving transactions
    try {
      // Use the SQL service to get transactions
      const transactions = await ioltaTransactionSqlService.getClientLedgerTransactions(this.clientLedgerId!);
      
      testGroup.tests.push({
        name: 'Retrieve Transactions',
        description: 'Test that transactions can be retrieved',
        passed: Array.isArray(transactions) && transactions.length === 2,
        error: (Array.isArray(transactions) && transactions.length === 2) ? null : 'Failed to retrieve transactions or incorrect number of transactions'
      });
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      testGroup.tests.push({
        name: 'Retrieve Transactions',
        description: 'Test that transactions can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test balance calculations
   */
  private async testBalanceCalculations(report: TestReport) {
    console.log('Testing balance calculations...');
    
    const testGroup: TestGroup = {
      name: 'Balance Calculations',
      description: 'Tests for IOLTA balance calculation functionality',
      tests: [],
      passed: true
    };
    
    // Test ledger balance calculation
    try {
      // Get current ledger using direct SQL to ensure we get the currentBalance field
      const result = await db.execute(sql`
        SELECT id, current_balance, balance FROM iolta_client_ledgers
        WHERE id = ${this.clientLedgerId}
      `);
      const clientLedger = result.rows[0];
      
      // Get all transactions for this ledger
      const transactions = await db.select().from(ioltaTransactions)
        .where(eq(ioltaTransactions.clientLedgerId, this.clientLedgerId!));
      
      // Calculate balance based on transactions
      let calculatedBalance = 0;
      for (const transaction of transactions) {
        if (transaction.transactionType === 'deposit') {
          calculatedBalance += parseFloat(transaction.amount);
        } else if (transaction.transactionType === 'withdrawal') {
          calculatedBalance -= parseFloat(transaction.amount);
        }
      }
      
      // Compare with stored balance
      const storedBalance = parseFloat(clientLedger.current_balance);
      
      testGroup.tests.push({
        name: 'Ledger Balance Calculation',
        description: 'Test that ledger balance calculation is accurate',
        passed: Math.abs(calculatedBalance - storedBalance) < 0.01, // Allow for small rounding differences
        error: Math.abs(calculatedBalance - storedBalance) < 0.01 ? null : `Calculated balance (${calculatedBalance}) does not match stored balance (${storedBalance})`
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Ledger Balance Calculation',
        description: 'Test that ledger balance calculation is accurate',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
}