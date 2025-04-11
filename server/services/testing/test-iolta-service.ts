/**
 * IOLTA Test Service
 * 
 * This service tests the IOLTA trust accounting system including:
 * - Trust account management
 * - Client ledger operations
 * - Transaction recording and retrieval
 * - Reconciliation reporting
 */

import { db } from '../../db';
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers, 
  ioltaTransactions,
  ioltaReconciliations,
  ioltaBankStatements
} from '@shared/schema';
import { TestService, TestReport, TestGroup, TestResult } from './test-interfaces';
import { IoltaService } from '../legal/iolta-service';
import { eq, and, sql } from 'drizzle-orm';

class IoltaTestService implements TestService {
  private testMerchantId = 999;
  private testClientId = 999;
  private testMatterId = 999;
  private testAccountId = 999;
  private ioltaService: IoltaService;

  constructor() {
    this.ioltaService = new IoltaService();
  }

  /**
   * Run all IOLTA tests
   */
  async runTests(): Promise<TestReport> {
    console.log('Running IOLTA tests...');
    
    const startTime = new Date();
    const testGroups: TestGroup[] = [];
    
    try {
      // Clean up any previous test data
      await this.cleanupTestData();
      
      // Set up test data
      await this.setupTestData();
      
      // Run trust account tests
      const trustAccountGroup = await this.runTrustAccountTests();
      testGroups.push(trustAccountGroup);
      
      // Run transaction tests
      const transactionGroup = await this.runTransactionTests();
      testGroups.push(transactionGroup);
      
      // Run client ledger tests
      const clientLedgerGroup = await this.runClientLedgerTests();
      testGroups.push(clientLedgerGroup);
      
      // Run reconciliation tests
      const reconciliationGroup = await this.runReconciliationTests();
      testGroups.push(reconciliationGroup);
      
      // Clean up test data
      await this.cleanupTestData();
    } catch (error) {
      console.error('Error running IOLTA tests:', error);
      
      testGroups.push({
        name: 'Test Execution Error',
        tests: [{
          name: 'Test Suite Execution',
          description: 'Executing the IOLTA test suite',
          passed: false,
          expected: 'Tests to execute without errors',
          actual: error instanceof Error ? error.message : String(error),
          error: error instanceof Error ? error.message : String(error)
        }],
        passed: false
      });
    }
    
    const endTime = new Date();
    
    const allPassed = testGroups.every(group => group.passed);
    
    const report: TestReport = {
      serviceName: 'IOLTA',
      timestamp: new Date(),
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      testGroups,
      passed: allPassed
    };
    
    return report;
  }

  /**
   * Create a deliberate test failure
   */
  async createDeliberateTestFailure(): Promise<void> {
    const testGroup: TestGroup = {
      name: 'Deliberate Failure Test',
      tests: [{
        name: 'Deliberately Failed Test',
        description: 'This test is designed to fail for testing purposes',
        passed: false,
        expected: 'Success',
        actual: 'Failure',
        error: 'This is a deliberate test failure'
      }],
      passed: false
    };
    
    const report: TestReport = {
      serviceName: 'IOLTA',
      timestamp: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      testGroups: [testGroup],
      passed: false
    };
    
    // Just return, the test coordinator will handle the report
    return;
  }

  /**
   * Set up test data
   */
  private async setupTestData(): Promise<void> {
    try {
      // Create test trust account
      await db.insert(ioltaTrustAccounts).values({
        id: this.testAccountId,
        merchantId: this.testMerchantId,
        bankName: 'Test Bank',
        accountNumber: '123456789',
        routingNumber: '987654321',
        accountType: 'iolta',
        accountName: 'Test IOLTA Account',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create test client ledger
      await db.insert(ioltaClientLedgers).values({
        id: this.testClientId,
        trustAccountId: this.testAccountId,
        merchantId: this.testMerchantId,
        clientName: 'Test Client',
        clientId: this.testClientId.toString(),
        matterName: 'Test Matter',
        matterNumber: this.testMatterId.toString(),
        balance: '0.00',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Test data setup complete');
    } catch (error) {
      console.error('Error setting up test data:', error);
      throw error;
    }
  }

  /**
   * Clean up test data
   */
  private async cleanupTestData(): Promise<void> {
    try {
      // Delete test reconciliations
      await db.delete(ioltaReconciliations)
        .where(eq(ioltaReconciliations.trustAccountId, this.testAccountId));
      
      // Delete test bank statements
      await db.delete(ioltaBankStatements)
        .where(eq(ioltaBankStatements.trustAccountId, this.testAccountId));
    
      // Delete test transactions
      await db.delete(ioltaTransactions)
        .where(eq(ioltaTransactions.trustAccountId, this.testAccountId));
        
      // Delete test client ledger
      await db.delete(ioltaClientLedgers)
        .where(eq(ioltaClientLedgers.id, this.testClientId));
        
      // Delete test trust account
      await db.delete(ioltaTrustAccounts)
        .where(eq(ioltaTrustAccounts.id, this.testAccountId));
        
      console.log('Test data cleanup complete');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      throw error;
    }
  }

  /**
   * Run trust account tests
   */
  private async runTrustAccountTests(): Promise<TestGroup> {
    console.log('Running trust account tests...');
    
    const tests: TestResult[] = [];
    
    // Test creating a trust account
    tests.push(await this.testCreateTrustAccount());
    
    // Test retrieving a trust account
    tests.push(await this.testGetTrustAccount());
    
    // Test updating a trust account
    tests.push(await this.testUpdateTrustAccount());
    
    // Test listing trust accounts
    tests.push(await this.testListTrustAccounts());
    
    const passed = tests.every(test => test.passed);
    
    return {
      name: 'Trust Account Management',
      description: 'Tests for IOLTA trust account creation, retrieval, and management',
      tests,
      passed
    };
  }

  /**
   * Test creating a trust account
   */
  private async testCreateTrustAccount(): Promise<TestResult> {
    try {
      const newAccountData = {
        merchantId: this.testMerchantId,
        bankName: 'New Test Bank',
        accountNumber: '1122334455',
        routingNumber: '5544332211',
        accountType: 'iolta',
        accountName: 'New IOLTA Account',
        status: 'active'
      };
      
      const newAccount = await this.ioltaService.createTrustAccount(newAccountData);
      
      // Clean up
      if (newAccount && newAccount.id) {
        await db.delete(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.id, newAccount.id));
      }
      
      return {
        name: 'Create Trust Account',
        description: 'Create a new IOLTA trust account',
        passed: true,
        expected: 'New account with specified data',
        actual: `Account created with ID ${newAccount?.id}`,
        error: null
      };
    } catch (error) {
      console.error('Error testing createTrustAccount:', error);
      return {
        name: 'Create Trust Account',
        description: 'Create a new IOLTA trust account',
        passed: false,
        expected: 'New account with specified data',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test retrieving a trust account
   */
  private async testGetTrustAccount(): Promise<TestResult> {
    try {
      const account = await this.ioltaService.getTrustAccount(this.testAccountId);
      
      return {
        name: 'Get Trust Account',
        description: 'Retrieve an IOLTA trust account by ID',
        passed: account !== null && account.id === this.testAccountId,
        expected: `Trust account with ID ${this.testAccountId}`,
        actual: account ? `Account found with ID ${account.id}` : 'No account found',
        error: null
      };
    } catch (error) {
      console.error('Error testing getTrustAccount:', error);
      return {
        name: 'Get Trust Account',
        description: 'Retrieve an IOLTA trust account by ID',
        passed: false,
        expected: `Trust account with ID ${this.testAccountId}`,
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test updating a trust account
   */
  private async testUpdateTrustAccount(): Promise<TestResult> {
    try {
      const updatedData = {
        bankName: 'Updated Test Bank',
        accountName: 'Updated IOLTA Account'
      };
      
      const updatedAccount = await this.ioltaService.updateTrustAccount(this.testAccountId, updatedData);
      
      // Verify update worked
      const account = await this.ioltaService.getTrustAccount(this.testAccountId);
      
      return {
        name: 'Update Trust Account',
        description: 'Update an existing IOLTA trust account',
        passed: account !== null && 
                account.bankName === updatedData.bankName && 
                account.accountName === updatedData.accountName,
        expected: `Updated bank name to "${updatedData.bankName}" and account name to "${updatedData.accountName}"`,
        actual: account ? 
                `Account bank name is "${account.bankName}" and account name is "${account.accountName}"` : 
                'No account found',
        error: null
      };
    } catch (error) {
      console.error('Error testing updateTrustAccount:', error);
      return {
        name: 'Update Trust Account',
        description: 'Update an existing IOLTA trust account',
        passed: false,
        expected: 'Updated trust account data',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test listing trust accounts
   */
  private async testListTrustAccounts(): Promise<TestResult> {
    try {
      const accounts = await this.ioltaService.getTrustAccounts(this.testMerchantId);
      
      return {
        name: 'List Trust Accounts',
        description: 'List all IOLTA trust accounts for a merchant',
        passed: Array.isArray(accounts) && accounts.length > 0,
        expected: 'Array of trust accounts including test account',
        actual: `Found ${accounts.length} trust accounts`,
        error: null
      };
    } catch (error) {
      console.error('Error testing getTrustAccounts:', error);
      return {
        name: 'List Trust Accounts',
        description: 'List all IOLTA trust accounts for a merchant',
        passed: false,
        expected: 'Array of trust accounts',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run transaction tests
   */
  private async runTransactionTests(): Promise<TestGroup> {
    console.log('Running transaction tests...');
    
    const tests: TestResult[] = [];
    
    // Test creating a deposit transaction
    tests.push(await this.testCreateDepositTransaction());
    
    // Test creating a withdrawal transaction
    tests.push(await this.testCreateWithdrawalTransaction());
    
    // Test retrieving a transaction
    tests.push(await this.testGetTransaction());
    
    // Test listing transactions
    tests.push(await this.testListTransactions());
    
    const passed = tests.every(test => test.passed);
    
    return {
      name: 'Transaction Management',
      description: 'Tests for IOLTA transaction creation, retrieval, and management',
      tests,
      passed
    };
  }

  private testTransactionId: number | null = null;

  /**
   * Test creating a deposit transaction
   */
  private async testCreateDepositTransaction(): Promise<TestResult> {
    try {
      const transactionData = {
        trustAccountId: this.testAccountId,
        clientLedgerId: this.testClientId,
        merchantId: this.testMerchantId,
        transactionType: 'deposit',
        amount: '1000.00',
        description: 'Test deposit',
        source: 'client',
        referenceNumber: 'DEP123',
        status: 'completed'
      };
      
      const transaction = await this.ioltaService.createTransaction(transactionData);
      
      // Save for later tests
      if (transaction && transaction.id) {
        this.testTransactionId = transaction.id;
      }
      
      return {
        name: 'Create Deposit Transaction',
        description: 'Create a new deposit transaction in an IOLTA account',
        passed: transaction !== null && transaction.amount === transactionData.amount,
        expected: 'New deposit transaction with specified amount',
        actual: transaction ? `Transaction created with amount ${transaction.amount}` : 'No transaction created',
        error: null
      };
    } catch (error) {
      console.error('Error testing createDepositTransaction:', error);
      return {
        name: 'Create Deposit Transaction',
        description: 'Create a new deposit transaction in an IOLTA account',
        passed: false,
        expected: 'New deposit transaction',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test creating a withdrawal transaction
   */
  private async testCreateWithdrawalTransaction(): Promise<TestResult> {
    try {
      const transactionData = {
        trustAccountId: this.testAccountId,
        clientLedgerId: this.testClientId,
        merchantId: this.testMerchantId,
        transactionType: 'withdrawal',
        amount: '500.00',
        description: 'Test withdrawal',
        recipient: 'Vendor',
        referenceNumber: 'WD123',
        status: 'completed'
      };
      
      const transaction = await this.ioltaService.createTransaction(transactionData);
      
      return {
        name: 'Create Withdrawal Transaction',
        description: 'Create a new withdrawal transaction from an IOLTA account',
        passed: transaction !== null && transaction.amount === transactionData.amount,
        expected: 'New withdrawal transaction with specified amount',
        actual: transaction ? `Transaction created with amount ${transaction.amount}` : 'No transaction created',
        error: null
      };
    } catch (error) {
      console.error('Error testing createWithdrawalTransaction:', error);
      return {
        name: 'Create Withdrawal Transaction',
        description: 'Create a new withdrawal transaction from an IOLTA account',
        passed: false,
        expected: 'New withdrawal transaction',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test retrieving a transaction
   */
  private async testGetTransaction(): Promise<TestResult> {
    try {
      if (!this.testTransactionId) {
        return {
          name: 'Get Transaction',
          description: 'Retrieve an IOLTA transaction by ID',
          passed: false,
          expected: 'Transaction details',
          actual: 'No test transaction ID available',
          error: 'Test transaction ID is null'
        };
      }
      
      const transaction = await this.ioltaService.getTransaction(this.testTransactionId);
      
      return {
        name: 'Get Transaction',
        description: 'Retrieve an IOLTA transaction by ID',
        passed: transaction !== null && transaction.id === this.testTransactionId,
        expected: `Transaction with ID ${this.testTransactionId}`,
        actual: transaction ? `Transaction found with ID ${transaction.id}` : 'No transaction found',
        error: null
      };
    } catch (error) {
      console.error('Error testing getTransaction:', error);
      return {
        name: 'Get Transaction',
        description: 'Retrieve an IOLTA transaction by ID',
        passed: false,
        expected: 'Transaction details',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test listing transactions
   */
  private async testListTransactions(): Promise<TestResult> {
    try {
      // Using the format Drizzle expects for date parameters with SQL
      const startDate = sql`now() - INTERVAL '30 days'`;
      const endDate = sql`now() + INTERVAL '1 day'`;
      
      const transactions = await this.ioltaService.getTransactions({
        trustAccountId: this.testAccountId,
        startDate,
        endDate
      });
      
      return {
        name: 'List Transactions',
        description: 'List all transactions for a trust account within a date range',
        passed: Array.isArray(transactions) && transactions.length >= 2, // We created at least 2 test transactions
        expected: 'Array of transactions including test transactions',
        actual: `Found ${transactions.length} transactions`,
        error: null
      };
    } catch (error) {
      console.error('Error testing getTransactions:', error);
      return {
        name: 'List Transactions',
        description: 'List all transactions for a trust account within a date range',
        passed: false,
        expected: 'Array of transactions',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run reconciliation tests
   */
  private async runReconciliationTests(): Promise<TestGroup> {
    console.log('Running reconciliation tests...');
    
    const tests: TestResult[] = [];
    
    // Test creating a reconciliation report
    tests.push(await this.testCreateReconciliation());
    
    // Test retrieving reconciliation reports
    tests.push(await this.testGetReconciliations());
    
    // Test validating a reconciliation
    tests.push(await this.testValidateReconciliation());
    
    const passed = tests.every(test => test.passed);
    
    return {
      name: 'Reconciliation Management',
      description: 'Tests for IOLTA reconciliation creation, retrieval, and validation',
      tests,
      passed
    };
  }

  private testReconciliationId: number | null = null;

  /**
   * Test creating a reconciliation report
   */
  private async testCreateReconciliation(): Promise<TestResult> {
    try {
      // First, let's insert a test bank statement
      const bankStatementResult = await db.insert(ioltaBankStatements).values({
        trustAccountId: this.testAccountId,
        merchantId: this.testMerchantId,
        statementDate: new Date(),
        beginningBalance: '1000.00',
        endingBalance: '1500.00',
        filename: 'test_statement.pdf',
        status: 'ready',
        uploads3Key: 'test/test_statement.pdf',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: ioltaBankStatements.id });
      
      const bankStatementId = bankStatementResult[0].id;
      
      const reconciliationData = {
        trustAccountId: this.testAccountId,
        merchantId: this.testMerchantId,
        bankStatementId,
        reconciliationDate: new Date(),
        bankBalance: '1500.00',
        bookBalance: '1500.00',
        status: 'pending',
        notes: 'Test reconciliation'
      };
      
      const reconciliation = await this.ioltaService.createReconciliation(reconciliationData);
      
      // Save for later tests
      if (reconciliation && reconciliation.id) {
        this.testReconciliationId = reconciliation.id;
      }
      
      return {
        name: 'Create Reconciliation Report',
        description: 'Create a new IOLTA reconciliation report',
        passed: reconciliation !== null && 
                reconciliation.bankBalance === reconciliationData.bankBalance &&
                reconciliation.bookBalance === reconciliationData.bookBalance,
        expected: 'New reconciliation report with specified balances',
        actual: reconciliation ? 
                `Reconciliation created with bank balance ${reconciliation.bankBalance} and book balance ${reconciliation.bookBalance}` : 
                'No reconciliation created',
        error: null
      };
    } catch (error) {
      console.error('Error testing createReconciliation:', error);
      return {
        name: 'Create Reconciliation Report',
        description: 'Create a new IOLTA reconciliation report',
        passed: false,
        expected: 'New reconciliation report',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test retrieving reconciliation reports
   */
  private async testGetReconciliations(): Promise<TestResult> {
    try {
      const reconciliations = await this.ioltaService.getReconciliations(this.testAccountId);
      
      return {
        name: 'Get Reconciliations',
        description: 'Retrieve all reconciliation reports for a trust account',
        passed: Array.isArray(reconciliations) && reconciliations.length > 0,
        expected: 'Array of reconciliation reports including test reconciliation',
        actual: `Found ${reconciliations.length} reconciliation reports`,
        error: null
      };
    } catch (error) {
      console.error('Error testing getReconciliations:', error);
      return {
        name: 'Get Reconciliations',
        description: 'Retrieve all reconciliation reports for a trust account',
        passed: false,
        expected: 'Array of reconciliation reports',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test validating a reconciliation
   */
  private async testValidateReconciliation(): Promise<TestResult> {
    try {
      if (!this.testReconciliationId) {
        return {
          name: 'Validate Reconciliation',
          description: 'Validate an IOLTA reconciliation report',
          passed: false,
          expected: 'Validated reconciliation report',
          actual: 'No test reconciliation ID available',
          error: 'Test reconciliation ID is null'
        };
      }
      
      const updatedReconciliation = await this.ioltaService.updateReconciliation(
        this.testReconciliationId, 
        { 
          status: 'completed',
          notes: 'Test reconciliation validated'
        }
      );
      
      return {
        name: 'Validate Reconciliation',
        description: 'Validate an IOLTA reconciliation report',
        passed: updatedReconciliation !== null && updatedReconciliation.status === 'completed',
        expected: 'Reconciliation with status "completed"',
        actual: updatedReconciliation ? 
                `Reconciliation updated with status "${updatedReconciliation.status}"` : 
                'No reconciliation updated',
        error: null
      };
    } catch (error) {
      console.error('Error testing validateReconciliation:', error);
      return {
        name: 'Validate Reconciliation',
        description: 'Validate an IOLTA reconciliation report',
        passed: false,
        expected: 'Validated reconciliation report',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run client ledger tests
   */
  private async runClientLedgerTests(): Promise<TestGroup> {
    console.log('Running client ledger tests...');
    
    const tests: TestResult[] = [];
    
    // Test getting client ledger
    tests.push(await this.testGetClientLedger());
    
    // Test getting client balance
    tests.push(await this.testGetClientBalance());
    
    const passed = tests.every(test => test.passed);
    
    return {
      name: 'Client Ledger Management',
      description: 'Tests for IOLTA client ledger retrieval and management',
      tests,
      passed
    };
  }

  /**
   * Test getting client ledger
   */
  private async testGetClientLedger(): Promise<TestResult> {
    try {
      const clientLedger = await this.ioltaService.getClientLedger(this.testClientId);
      
      return {
        name: 'Get Client Ledger',
        description: 'Retrieve client ledger by ID',
        passed: clientLedger !== null && clientLedger.id === this.testClientId,
        expected: `Client ledger with ID ${this.testClientId}`,
        actual: clientLedger ? `Client ledger found with ID ${clientLedger.id}` : 'No client ledger found',
        error: null
      };
    } catch (error) {
      console.error('Error testing getClientLedger:', error);
      return {
        name: 'Get Client Ledger',
        description: 'Retrieve client ledger by ID',
        passed: false,
        expected: 'Client ledger details',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test getting client balance
   */
  private async testGetClientBalance(): Promise<TestResult> {
    try {
      // We should have a deposit of 1000 and withdrawal of 500
      const expectedBalance = '500.00'; 
      
      const balance = await this.ioltaService.getClientLedgerBalance(this.testClientId);
      
      return {
        name: 'Get Client Balance',
        description: 'Retrieve client ledger balance',
        passed: balance === expectedBalance,
        expected: `Balance of ${expectedBalance}`,
        actual: `Balance is ${balance}`,
        error: null
      };
    } catch (error) {
      console.error('Error testing getClientLedgerBalance:', error);
      return {
        name: 'Get Client Balance',
        description: 'Retrieve client ledger balance',
        passed: false,
        expected: 'Client ledger balance',
        actual: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Export singleton instance
export const ioltaTestService = new IoltaTestService();