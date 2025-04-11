/**
 * IOLTA Service Testing Module
 * 
 * This module contains tests for the IOLTA (Interest on Lawyer Trust Accounts) service,
 * which is a critical component of the legal practice management system.
 */

import { TestService, TestReport, TestGroup, TestResult } from './test-interfaces';
import { db } from '../../db';
import { ioltaService } from '../legal/iolta-service';
import {
  ioltaTrustAccounts,
  ioltaClientLedgers,
  ioltaTransactions,
  legalClients,
  legalMatters
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * IoltaTestService implements tests for the IOLTA service
 */
export class IoltaTestService implements TestService {
  // Test data IDs
  private testMerchantId = 1;
  private testClientId = 1;
  private testMatterId = 1;
  
  // Test data for account creation
  private testAccountData = {
    merchantId: this.testMerchantId,
    clientId: this.testClientId.toString(), // Add clientId to fix null constraint
    accountNumber: 'TEST12345',
    accountName: 'Test IOLTA Account',
    bankName: 'First National Test Bank',
    routingNumber: '123456789',
    accountType: 'iolta' as const,
    accountStatus: 'active' as const,
    balance: '10000.00',
    taxId: '12-3456789' // Add taxId to fix missing column error
  };
  
  // Test data for client ledger
  private testClientData = {
    merchantId: this.testMerchantId,
    clientId: this.testClientId.toString(),
    trustAccountId: 0, // Will be set during test
    clientName: 'Test Client',
    matterName: 'Test Matter',
    matterNumber: 'MAT-001',
    balance: '5000.00',
    status: 'active' as const
  };
  
  // Test data for transactions
  private testTransactionData = {
    amount: '2500.00',
    description: 'Initial client retainer',
    transactionType: 'deposit' as const,
    createdBy: 1,
    trustAccountId: 0, // Will be set during test
    clientLedgerId: 0, // Will be set during client ledger test
    fundType: 'retainer' as const,
    status: 'completed' as const,
    referenceNumber: 'TR-1001'
  };
  
  /**
   * Run all IOLTA service tests
   */
  async runTests(): Promise<TestReport> {
    const startTime = new Date();
    const testGroups: TestGroup[] = [];
    let passed = true;
    let error: string | null = null;
    
    try {
      // Run each test group
      testGroups.push(await this.testAccountManagement());
      testGroups.push(await this.testClientLedger());
      testGroups.push(await this.testTransactions());
      testGroups.push(await this.testReconciliation());
      
      // Update overall pass status
      for (const group of testGroups) {
        if (!group.passed) {
          passed = false;
          break;
        }
      }
      
      // Clean up test data
      await this.cleanup();
    } catch (e) {
      passed = false;
      error = e instanceof Error ? e.message : String(e);
      console.error('Error running IOLTA tests:', e);
      
      // Attempt cleanup even if tests fail
      try {
        await this.cleanup();
      } catch (cleanupError) {
        console.error('Error cleaning up test data:', cleanupError);
      }
    }
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // Return the test report
    return {
      serviceName: 'IOLTA Service',
      passed,
      startTime,
      endTime,
      duration,
      testGroups,
      error
    };
  }
  
  /**
   * Test IOLTA account management
   */
  private async testAccountManagement(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Create IOLTA account
    try {
      const account = await ioltaService.createTrustAccount(this.testAccountData);
      
      // Update the account ID for later tests
      this.testClientData.trustAccountId = account.id;
      this.testTransactionData.trustAccountId = account.id;
      
      tests.push({
        name: 'Create IOLTA account',
        description: 'Should create a new IOLTA trust account',
        passed: !!account && 
                account.merchantId === this.testMerchantId &&
                account.accountName === this.testAccountData.accountName,
        error: null,
        expected: this.testAccountData,
        actual: account
      });
      
      if (!account || 
          account.merchantId !== this.testMerchantId || 
          account.accountName !== this.testAccountData.accountName) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Create IOLTA account',
        description: 'Should create a new IOLTA trust account',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Get IOLTA account
    try {
      if (!this.testClientData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const account = await ioltaService.getTrustAccount(
        this.testClientData.trustAccountId
      );
      
      tests.push({
        name: 'Get IOLTA account',
        description: 'Should retrieve an existing IOLTA account by ID',
        passed: !!account && 
                account.id === this.testClientData.trustAccountId &&
                account.merchantId === this.testMerchantId,
        error: null,
        expected: {
          id: this.testClientData.trustAccountId,
          merchantId: this.testMerchantId
        },
        actual: account ? {
          id: account.id,
          merchantId: account.merchantId,
          accountName: account.accountName
        } : null
      });
      
      if (!account || 
          account.id !== this.testClientData.trustAccountId || 
          account.merchantId !== this.testMerchantId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get IOLTA account',
        description: 'Should retrieve an existing IOLTA account by ID',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 3: List IOLTA accounts
    try {
      const accounts = await ioltaService.getTrustAccountsByMerchant(this.testMerchantId);
      
      tests.push({
        name: 'List IOLTA accounts',
        description: 'Should retrieve all IOLTA accounts for a merchant',
        passed: Array.isArray(accounts) && 
                accounts.length > 0 && 
                accounts.some(a => a.id === this.testClientData.trustAccountId),
        error: null,
        expected: {
          type: 'array',
          containsTestAccount: true
        },
        actual: {
          type: Array.isArray(accounts) ? 'array' : typeof accounts,
          count: Array.isArray(accounts) ? accounts.length : 0,
          containsTestAccount: Array.isArray(accounts) && 
                                accounts.some(a => a.id === this.testClientData.trustAccountId)
        }
      });
      
      if (!Array.isArray(accounts) || 
          accounts.length === 0 || 
          !accounts.some(a => a.id === this.testClientData.trustAccountId)) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'List IOLTA accounts',
        description: 'Should retrieve all IOLTA accounts for a merchant',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'IOLTA Account Management',
      description: 'Tests for IOLTA account creation and retrieval',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test client ledger operations
   */
  private async testClientLedger(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Add client to IOLTA account
    try {
      if (!this.testClientData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      // First ensure the client exists in legal_clients
      const existingClient = await db.query.legalClients.findFirst({
        where: eq(legalClients.id, this.testClientId)
      });
      
      // If client doesn't exist, create it
      if (!existingClient) {
        await db.insert(legalClients).values({
          merchantId: this.testMerchantId,
          status: 'active',
          clientType: 'individual',
          firstName: 'Test',
          lastName: 'Client',
          email: 'test.client@example.com',
          phone: '555-123-4567'
        });
      }
      
      // Ensure the matter exists
      const existingMatter = await db.query.legalMatters.findFirst({
        where: eq(legalMatters.id, this.testMatterId)
      });
      
      // If matter doesn't exist, create it
      if (!existingMatter) {
        await db.insert(legalMatters).values({
          merchantId: this.testMerchantId,
          clientId: this.testClientId,
          status: 'active',
          title: 'Test Matter',
          description: 'Test IOLTA matter',
          practiceArea: 'other',
          openDate: new Date()
        });
      }
      
      const clientLedger = await ioltaService.createClientLedger(this.testClientData);
      
      tests.push({
        name: 'Add client to IOLTA account',
        description: 'Should add a client to an IOLTA account',
        passed: !!clientLedger && 
                clientLedger.merchantId === this.testMerchantId &&
                clientLedger.clientId === this.testClientId &&
                clientLedger.trustAccountId === this.testClientData.trustAccountId,
        error: null,
        expected: this.testClientData,
        actual: clientLedger
      });
      
      if (!clientLedger || 
          clientLedger.merchantId !== this.testMerchantId || 
          clientLedger.clientId !== this.testClientId || 
          clientLedger.trustAccountId !== this.testClientData.trustAccountId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Add client to IOLTA account',
        description: 'Should add a client to an IOLTA account',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Get client IOLTA ledger
    try {
      if (!this.testClientData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const clientLedger = await ioltaService.getClientLedger(
        this.testClientId
      );
      
      tests.push({
        name: 'Get client IOLTA ledger',
        description: 'Should retrieve a client\'s IOLTA ledger',
        passed: !!clientLedger && 
                clientLedger.clientId === this.testClientId &&
                clientLedger.trustAccountId === this.testClientData.trustAccountId,
        error: null,
        expected: {
          clientId: this.testClientId,
          trustAccountId: this.testClientData.trustAccountId,
          merchantId: this.testMerchantId
        },
        actual: clientLedger ? {
          clientId: clientLedger.clientId,
          trustAccountId: clientLedger.trustAccountId,
          merchantId: clientLedger.merchantId,
          balance: clientLedger.balance
        } : null
      });
      
      if (!clientLedger || 
          clientLedger.clientId !== this.testClientId || 
          clientLedger.trustAccountId !== this.testClientData.trustAccountId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get client IOLTA ledger',
        description: 'Should retrieve a client\'s IOLTA ledger',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 3: Get all client ledgers for an account
    try {
      if (!this.testClientData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const clientLedgers = await ioltaService.getClientLedgersByTrustAccount(
        this.testClientData.trustAccountId
      );
      
      tests.push({
        name: 'Get all client ledgers for account',
        description: 'Should retrieve all client ledgers for an IOLTA account',
        passed: Array.isArray(clientLedgers) && 
                clientLedgers.length > 0 && 
                clientLedgers.some(c => c.clientId === this.testClientId),
        error: null,
        expected: {
          type: 'array',
          containsTestClient: true
        },
        actual: {
          type: Array.isArray(clientLedgers) ? 'array' : typeof clientLedgers,
          count: Array.isArray(clientLedgers) ? clientLedgers.length : 0,
          containsTestClient: Array.isArray(clientLedgers) && 
                              clientLedgers.some(c => c.clientId === this.testClientId)
        }
      });
      
      if (!Array.isArray(clientLedgers) || 
          clientLedgers.length === 0 || 
          !clientLedgers.some(c => c.clientId === this.testClientId)) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get all client ledgers for account',
        description: 'Should retrieve all client ledgers for an IOLTA account',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Client Ledger Operations',
      description: 'Tests for client ledger creation and retrieval',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test IOLTA transactions
   */
  private async testTransactions(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    let transactionId: number | null = null;
    
    // Test 1: Create transaction
    try {
      if (!this.testTransactionData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const transaction = await ioltaService.recordTransaction(this.testTransactionData);
      transactionId = transaction.id;
      
      tests.push({
        name: 'Create transaction',
        description: 'Should create a new IOLTA transaction',
        passed: !!transaction && 
                transaction.trustAccountId === this.testTransactionData.trustAccountId,
        error: null,
        expected: this.testTransactionData,
        actual: transaction
      });
      
      if (!transaction || 
          transaction.trustAccountId !== this.testTransactionData.trustAccountId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Create transaction',
        description: 'Should create a new IOLTA transaction',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Get transaction
    try {
      if (!transactionId) {
        throw new Error('Transaction ID not set');
      }
      
      const transaction = await ioltaService.getTransaction(
        transactionId
      );
      
      tests.push({
        name: 'Get transaction',
        description: 'Should retrieve an IOLTA transaction by ID',
        passed: !!transaction && 
                transaction.id === transactionId,
        error: null,
        expected: {
          id: transactionId
        },
        actual: transaction ? {
          id: transaction.id,
          amount: transaction.amount,
          transactionType: transaction.transactionType
        } : null
      });
      
      if (!transaction || 
          transaction.id !== transactionId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get transaction',
        description: 'Should retrieve an IOLTA transaction by ID',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 3: Get client transactions
    try {
      if (!this.testTransactionData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      // First get the client ledger 
      const clientLedger = await ioltaService.getClientLedger(
        this.testClientId
      );
      
      const transactions = await ioltaService.getTransactionsByClientLedger(
        clientLedger.id
      );
      
      tests.push({
        name: 'Get client transactions',
        description: 'Should retrieve all transactions for a client in an IOLTA account',
        passed: Array.isArray(transactions) && 
                transactions.length > 0 && 
                transactions.some(t => t.id === transactionId),
        error: null,
        expected: {
          type: 'array',
          containsTestTransaction: true
        },
        actual: {
          type: Array.isArray(transactions) ? 'array' : typeof transactions,
          count: Array.isArray(transactions) ? transactions.length : 0,
          containsTestTransaction: Array.isArray(transactions) && 
                                  transactions.some(t => t.id === transactionId)
        }
      });
      
      if (!Array.isArray(transactions) || 
          transactions.length === 0 || 
          !transactions.some(t => t.id === transactionId)) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get client transactions',
        description: 'Should retrieve all transactions for a client in an IOLTA account',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 4: Get account transactions
    try {
      if (!this.testTransactionData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const transactions = await ioltaService.getTransactionsByTrustAccount(
        this.testTransactionData.trustAccountId
      );
      
      tests.push({
        name: 'Get account transactions',
        description: 'Should retrieve all transactions for an IOLTA account',
        passed: Array.isArray(transactions) && 
                transactions.length > 0 && 
                transactions.some(t => t.id === transactionId),
        error: null,
        expected: {
          type: 'array',
          containsTestTransaction: true
        },
        actual: {
          type: Array.isArray(transactions) ? 'array' : typeof transactions,
          count: Array.isArray(transactions) ? transactions.length : 0,
          containsTestTransaction: Array.isArray(transactions) && 
                                  transactions.some(t => t.id === transactionId)
        }
      });
      
      if (!Array.isArray(transactions) || 
          transactions.length === 0 || 
          !transactions.some(t => t.id === transactionId)) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get account transactions',
        description: 'Should retrieve all transactions for an IOLTA account',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'IOLTA Transactions',
      description: 'Tests for IOLTA transaction creation and retrieval',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test reconciliation functionality
   */
  private async testReconciliation(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Calculate client balances
    try {
      if (!this.testTransactionData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const reconciliation = await ioltaService.getTrustAccountReconciliation(
        this.testTransactionData.trustAccountId
      );
      const balances = reconciliation.clientLedgers;
      
      tests.push({
        name: 'Calculate client balances',
        description: 'Should calculate client balances based on transactions',
        passed: !!balances && 
                Array.isArray(balances) && 
                balances.length > 0 && 
                balances.some(b => b.clientId === this.testClientId),
        error: null,
        expected: {
          type: 'array',
          containsTestClient: true
        },
        actual: {
          type: Array.isArray(balances) ? 'array' : typeof balances,
          count: Array.isArray(balances) ? balances.length : 0,
          containsTestClient: Array.isArray(balances) && 
                              balances.some(b => b.clientId === this.testClientId)
        }
      });
      
      if (!balances || 
          !Array.isArray(balances) || 
          balances.length === 0 || 
          !balances.some(b => b.clientId === this.testClientId)) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Calculate client balances',
        description: 'Should calculate client balances based on transactions',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Calculate account balance
    try {
      if (!this.testTransactionData.trustAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const reconciliation = await ioltaService.getTrustAccountReconciliation(
        this.testTransactionData.trustAccountId
      );
      const balance = reconciliation.trustAccountBalance;
      
      tests.push({
        name: 'Calculate account balance',
        description: 'Should calculate IOLTA account balance based on transactions',
        passed: balance !== null && 
                typeof balance === 'string' && 
                parseFloat(balance) > 0,
        error: null,
        expected: {
          type: 'string',
          greaterThanZero: true
        },
        actual: {
          type: typeof balance,
          value: balance,
          greaterThanZero: typeof balance === 'string' && parseFloat(balance) > 0
        }
      });
      
      if (balance === null || 
          typeof balance !== 'string' || 
          parseFloat(balance) <= 0) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Calculate account balance',
        description: 'Should calculate IOLTA account balance based on transactions',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Reconciliation',
      description: 'Tests for IOLTA reconciliation functionality',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Create a deliberate test failure (for testing the test framework)
   */
  async createDeliberateTestFailure(): Promise<TestReport> {
    const testGroups: TestGroup[] = [{
      name: 'Deliberate Failure',
      description: 'A test group containing a deliberately failing test',
      tests: [{
        name: 'Failing IOLTA Test',
        description: 'This test is designed to fail',
        passed: false,
        error: 'This IOLTA test is deliberately designed to fail for testing purposes'
      }],
      passed: false
    }];
    
    return {
      serviceName: 'IOLTA Service - Deliberate Failure',
      passed: false,
      startTime: new Date(),
      endTime: new Date(),
      testGroups,
      error: 'Deliberate test failure'
    };
  }
  
  /**
   * Cleanup test data
   * This is called after tests to remove test data
   */
  private async cleanup(): Promise<void> {
    if (this.testTransactionData.trustAccountId) {
      // Delete transactions
      await db.delete(ioltaTransactions)
        .where(
          eq(ioltaTransactions.trustAccountId, this.testTransactionData.trustAccountId)
        );
      
      // Delete client ledger
      await db.delete(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.trustAccountId, this.testTransactionData.trustAccountId),
          eq(ioltaClientLedgers.clientId, this.testClientId)
        ));
      
      // Delete account
      await db.delete(ioltaTrustAccounts)
        .where(
          eq(ioltaTrustAccounts.id, this.testTransactionData.trustAccountId)
        );
    }
  }
}

// Create and export a singleton instance of the test service
export const ioltaTestService = new IoltaTestService();