/**
 * IOLTA Reconciliation Testing Module
 * 
 * This module contains tests for IOLTA reconciliation functionality,
 * which is critical for maintaining trust account compliance.
 */

import { TestService, TestReport, TestGroup, TestResult } from './test-interfaces';
import { db } from '../../db';
import { ioltaService } from '../legal/iolta-service';
import { IoltaReconciliationService } from '../legal/iolta-reconciliation-service';

// Create an instance of the IoltaReconciliationService
const ioltaReconciliationService = new IoltaReconciliationService();
import {
  ioltaTrustAccounts,
  ioltaClientLedgers,
  ioltaTransactions,
  ioltaReconciliations,
  ioltaBankStatements,
  legalClients,
  legalMatters
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * IoltaReconciliationTestService implements tests for IOLTA reconciliation
 */
export class IoltaReconciliationTestService implements TestService {
  // Test data IDs
  private testMerchantId = 1;
  private testClientId = 1;
  private testMatterId = 1;
  private testAccountId: number | null = null;
  private testTransactionIds: number[] = [];
  
  // Test reconciliation data
  private testReconciliationData = {
    merchantId: this.testMerchantId,
    ioltaAccountId: 0, // Will be set during test
    reconciliationDate: new Date(),
    bookBalance: '10000.00',
    bankBalance: '10000.00',
    isBalanced: true,
    adjustments: [],
    notes: 'Test reconciliation',
    status: 'completed' as const,
    performedById: 1
  };
  
  // Test bank statement data
  private testBankStatementData = {
    merchantId: this.testMerchantId,
    ioltaAccountId: 0, // Will be set during test
    statementDate: new Date(),
    beginningBalance: '7500.00',
    endingBalance: '10000.00',
    statementPeriodStart: new Date(new Date().setDate(new Date().getDate() - 30)),
    statementPeriodEnd: new Date(),
    statementId: uuidv4(),
    deposits: [
      {
        date: new Date(new Date().setDate(new Date().getDate() - 20)),
        amount: '2500.00',
        description: 'Client deposit',
        cleared: true
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        amount: '1000.00',
        description: 'Additional deposit',
        cleared: true
      }
    ],
    withdrawals: [
      {
        date: new Date(new Date().setDate(new Date().getDate() - 15)),
        amount: '500.00',
        description: 'Court filing fee',
        cleared: true
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
        amount: '500.00',
        description: 'Expert witness fee',
        cleared: true
      }
    ]
  };

  /**
   * Run all reconciliation tests
   */
  async runTests(): Promise<TestReport> {
    const startTime = new Date();
    const testGroups: TestGroup[] = [];
    let passed = true;
    let error: string | null = null;
    
    try {
      // Setup test data
      await this.setupTestData();
      
      // Run test groups
      testGroups.push(await this.testCreateReconciliation());
      testGroups.push(await this.testReconciliationReport());
      testGroups.push(await this.testThreeWayReconciliation());
      
      // Update overall pass status
      for (const group of testGroups) {
        if (!group.passed) {
          passed = false;
          break;
        }
      }
      
      // Clean up test data
      await this.cleanupTestData();
    } catch (e) {
      passed = false;
      error = e instanceof Error ? e.message : String(e);
      console.error('Error running IOLTA reconciliation tests:', e);
      
      // Attempt cleanup even if tests fail
      try {
        await this.cleanupTestData();
      } catch (cleanupError) {
        console.error('Error cleaning up test data:', cleanupError);
      }
    }
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // Return the test report
    return {
      serviceName: 'IOLTA Reconciliation',
      passed,
      startTime,
      endTime,
      duration,
      testGroups,
      error
    };
  }
  
  /**
   * Setup test data needed for reconciliation tests
   */
  private async setupTestData(): Promise<void> {
    // Create test account
    const account = await ioltaService.createTrustAccount({
      merchantId: this.testMerchantId,
      clientId: this.testClientId.toString(), // Add clientId to fix null constraint
      accountNumber: 'RECTEST12345',
      accountName: 'Test Reconciliation IOLTA Account',
      bankName: 'First National Test Bank',
      routingNumber: '123456789',
      accountType: 'iolta' as const, // Add required accountType
      accountStatus: 'active' as const, // Replace status with accountStatus
      balance: '10000.00',
      taxId: '12-3456789' // Add taxId to fix missing column error
    });
    
    this.testAccountId = account.id;
    this.testReconciliationData.ioltaAccountId = account.id;
    this.testBankStatementData.ioltaAccountId = account.id;
    
    // First ensure the client exists in legal_clients
    const existingClient = await db.query.legalClients.findFirst({
      where: eq(legalClients.id, this.testClientId)
    });
    
    // If client doesn't exist, create it
    if (!existingClient) {
      await db.insert(legalClients).values({
        id: this.testClientId,
        merchantId: this.testMerchantId,
        status: 'active',
        clientType: 'individual',
        firstName: 'Test',
        lastName: 'Reconciliation',
        email: 'test.reconciliation@example.com',
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
        id: this.testMatterId,
        merchantId: this.testMerchantId,
        clientId: this.testClientId,
        status: 'active',
        title: 'Test Reconciliation Matter',
        description: 'Test IOLTA reconciliation matter',
        practiceArea: 'other',
        openDate: new Date()
      });
    }
    
    // Add client to IOLTA account
    await ioltaService.createClientLedger({
      merchantId: this.testMerchantId,
      clientId: this.testClientId,
      ioltaAccountId: account.id,
      balance: '5000.00',
      status: 'active'
    });
    
    // Create transactions
    const transactions = [
      {
        merchantId: this.testMerchantId,
        ioltaAccountId: account.id,
        clientId: this.testClientId,
        matterId: this.testMatterId,
        amount: '2500.00',
        transactionType: 'deposit' as const,
        description: 'Initial client retainer',
        status: 'completed' as const,
        referenceNumber: 'TREC-1001',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 20))
      },
      {
        merchantId: this.testMerchantId,
        ioltaAccountId: account.id,
        clientId: this.testClientId,
        matterId: this.testMatterId,
        amount: '500.00',
        transactionType: 'withdrawal' as const,
        description: 'Court filing fee',
        status: 'completed' as const,
        referenceNumber: 'TREC-1002',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 15))
      },
      {
        merchantId: this.testMerchantId,
        ioltaAccountId: account.id,
        clientId: this.testClientId,
        matterId: this.testMatterId,
        amount: '500.00',
        transactionType: 'withdrawal' as const,
        description: 'Expert witness fee',
        status: 'completed' as const,
        referenceNumber: 'TREC-1003',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10))
      },
      {
        merchantId: this.testMerchantId,
        ioltaAccountId: account.id,
        clientId: this.testClientId,
        matterId: this.testMatterId,
        amount: '1000.00',
        transactionType: 'deposit' as const,
        description: 'Additional deposit',
        status: 'completed' as const,
        referenceNumber: 'TREC-1004',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5))
      }
    ];
    
    for (const transaction of transactions) {
      const result = await ioltaService.recordTransaction(transaction);
      this.testTransactionIds.push(result.id);
    }
  }
  
  /**
   * Clean up test data
   */
  private async cleanupTestData(): Promise<void> {
    if (this.testAccountId) {
      // Delete reconciliations
      await db.delete(ioltaReconciliations)
        .where(and(
          eq(ioltaReconciliations.merchantId, this.testMerchantId),
          eq(ioltaReconciliations.ioltaAccountId, this.testAccountId)
        ));
      
      // Delete bank statements
      await db.delete(ioltaBankStatements)
        .where(and(
          eq(ioltaBankStatements.merchantId, this.testMerchantId),
          eq(ioltaBankStatements.ioltaAccountId, this.testAccountId)
        ));
      
      // Delete transactions
      await db.delete(ioltaTransactions)
        .where(and(
          eq(ioltaTransactions.merchantId, this.testMerchantId),
          eq(ioltaTransactions.ioltaAccountId, this.testAccountId)
        ));
      
      // Delete client ledger
      await db.delete(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.merchantId, this.testMerchantId),
          eq(ioltaClientLedgers.ioltaAccountId, this.testAccountId),
          eq(ioltaClientLedgers.clientId, this.testClientId)
        ));
      
      // Delete account
      await db.delete(ioltaTrustAccounts)
        .where(and(
          eq(ioltaTrustAccounts.merchantId, this.testMerchantId),
          eq(ioltaTrustAccounts.id, this.testAccountId)
        ));
    }
  }
  
  /**
   * Test creating a reconciliation record
   */
  private async testCreateReconciliation(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Create reconciliation record
    try {
      if (!this.testAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const reconciliation = await ioltaReconciliationService.createReconciliation(
        this.testReconciliationData
      );
      
      tests.push({
        name: 'Create reconciliation record',
        description: 'Should create a new IOLTA reconciliation record',
        passed: !!reconciliation && 
                reconciliation.merchantId === this.testMerchantId &&
                reconciliation.ioltaAccountId === this.testAccountId,
        error: null,
        expected: this.testReconciliationData,
        actual: reconciliation
      });
      
      if (!reconciliation || 
          reconciliation.merchantId !== this.testMerchantId || 
          reconciliation.ioltaAccountId !== this.testAccountId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Create reconciliation record',
        description: 'Should create a new IOLTA reconciliation record',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Get reconciliation by ID
    try {
      if (!this.testAccountId) {
        throw new Error('Test account ID not set');
      }
      
      // First get the ID of the reconciliation we just created
      const reconciliations = await ioltaReconciliationService.getReconciliations(
        this.testAccountId,
        this.testMerchantId
      );
      
      if (!reconciliations.length) {
        throw new Error('No reconciliations found');
      }
      
      const reconciliationId = reconciliations[0].id;
      
      const reconciliation = await ioltaReconciliationService.getReconciliation(
        reconciliationId,
        this.testMerchantId
      );
      
      tests.push({
        name: 'Get reconciliation by ID',
        description: 'Should retrieve an IOLTA reconciliation by ID',
        passed: !!reconciliation && 
                reconciliation.id === reconciliationId &&
                reconciliation.merchantId === this.testMerchantId,
        error: null,
        expected: {
          id: reconciliationId,
          merchantId: this.testMerchantId
        },
        actual: reconciliation ? {
          id: reconciliation.id,
          merchantId: reconciliation.merchantId
        } : null
      });
      
      if (!reconciliation || 
          reconciliation.id !== reconciliationId || 
          reconciliation.merchantId !== this.testMerchantId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get reconciliation by ID',
        description: 'Should retrieve an IOLTA reconciliation by ID',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Reconciliation Record Management',
      description: 'Tests for creating and retrieving reconciliation records',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test reconciliation report generation
   */
  private async testReconciliationReport(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Generate reconciliation report
    try {
      if (!this.testAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const report = await ioltaReconciliationService.generateReconciliationReport(
        this.testAccountId,
        this.testMerchantId,
        new Date(new Date().setDate(new Date().getDate() - 30)),
        new Date()
      );
      
      tests.push({
        name: 'Generate reconciliation report',
        description: 'Should generate an IOLTA reconciliation report',
        passed: !!report && 
                report.accountId === this.testAccountId &&
                Array.isArray(report.transactions) &&
                report.transactions.length > 0,
        error: null,
        expected: {
          accountId: this.testAccountId,
          hasTransactions: true
        },
        actual: report ? {
          accountId: report.accountId,
          hasTransactions: Array.isArray(report.transactions) && report.transactions.length > 0,
          transactionCount: Array.isArray(report.transactions) ? report.transactions.length : 0,
          calculatedBalance: report.calculatedBalance
        } : null
      });
      
      if (!report || 
          report.accountId !== this.testAccountId || 
          !Array.isArray(report.transactions) || 
          report.transactions.length === 0) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Generate reconciliation report',
        description: 'Should generate an IOLTA reconciliation report',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Generate client reconciliation report
    try {
      if (!this.testAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const clientReport = await ioltaReconciliationService.generateClientReconciliationReport(
        this.testClientId,
        this.testAccountId,
        this.testMerchantId,
        new Date(new Date().setDate(new Date().getDate() - 30)),
        new Date()
      );
      
      tests.push({
        name: 'Generate client reconciliation report',
        description: 'Should generate a client-specific IOLTA reconciliation report',
        passed: !!clientReport && 
                clientReport.clientId === this.testClientId &&
                clientReport.accountId === this.testAccountId &&
                Array.isArray(clientReport.transactions) &&
                clientReport.transactions.length > 0,
        error: null,
        expected: {
          clientId: this.testClientId,
          accountId: this.testAccountId,
          hasTransactions: true
        },
        actual: clientReport ? {
          clientId: clientReport.clientId,
          accountId: clientReport.accountId,
          hasTransactions: Array.isArray(clientReport.transactions) && clientReport.transactions.length > 0,
          transactionCount: Array.isArray(clientReport.transactions) ? clientReport.transactions.length : 0,
          calculatedBalance: clientReport.calculatedBalance
        } : null
      });
      
      if (!clientReport || 
          clientReport.clientId !== this.testClientId || 
          clientReport.accountId !== this.testAccountId || 
          !Array.isArray(clientReport.transactions) || 
          clientReport.transactions.length === 0) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Generate client reconciliation report',
        description: 'Should generate a client-specific IOLTA reconciliation report',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Reconciliation Reporting',
      description: 'Tests for generating reconciliation reports',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test three-way reconciliation functionality
   */
  private async testThreeWayReconciliation(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Import bank statement
    try {
      if (!this.testAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const bankStatement = await ioltaReconciliationService.importBankStatement(
        this.testBankStatementData
      );
      
      tests.push({
        name: 'Import bank statement',
        description: 'Should import a bank statement for reconciliation',
        passed: !!bankStatement && 
                bankStatement.merchantId === this.testMerchantId &&
                bankStatement.ioltaAccountId === this.testAccountId,
        error: null,
        expected: this.testBankStatementData,
        actual: bankStatement
      });
      
      if (!bankStatement || 
          bankStatement.merchantId !== this.testMerchantId || 
          bankStatement.ioltaAccountId !== this.testAccountId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Import bank statement',
        description: 'Should import a bank statement for reconciliation',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Get bank statement
    try {
      if (!this.testAccountId) {
        throw new Error('Test account ID not set');
      }
      
      // First get the ID of the bank statement we just created
      const statements = await ioltaReconciliationService.getBankStatements(
        this.testAccountId,
        this.testMerchantId
      );
      
      if (!statements.length) {
        throw new Error('No bank statements found');
      }
      
      const statementId = statements[0].id;
      
      const statement = await ioltaReconciliationService.getBankStatement(
        statementId,
        this.testMerchantId
      );
      
      tests.push({
        name: 'Get bank statement',
        description: 'Should retrieve a bank statement by ID',
        passed: !!statement && 
                statement.id === statementId &&
                statement.merchantId === this.testMerchantId,
        error: null,
        expected: {
          id: statementId,
          merchantId: this.testMerchantId
        },
        actual: statement ? {
          id: statement.id,
          merchantId: statement.merchantId
        } : null
      });
      
      if (!statement || 
          statement.id !== statementId || 
          statement.merchantId !== this.testMerchantId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Get bank statement',
        description: 'Should retrieve a bank statement by ID',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 3: Perform three-way reconciliation
    try {
      if (!this.testAccountId) {
        throw new Error('Test account ID not set');
      }
      
      const reconciliationResult = await ioltaReconciliationService.performThreeWayReconciliation(
        this.testAccountId,
        this.testMerchantId,
        new Date()
      );
      
      tests.push({
        name: 'Perform three-way reconciliation',
        description: 'Should perform a three-way reconciliation between book balance, client ledger, and bank statement',
        passed: !!reconciliationResult && 
                reconciliationResult.accountId === this.testAccountId &&
                typeof reconciliationResult.isBalanced === 'boolean' &&
                typeof reconciliationResult.bookBalance === 'string' &&
                typeof reconciliationResult.clientLedgerTotal === 'string' &&
                typeof reconciliationResult.bankBalance === 'string',
        error: null,
        expected: {
          accountId: this.testAccountId,
          hasBalanceData: true
        },
        actual: reconciliationResult || null
      });
      
      if (!reconciliationResult || 
          reconciliationResult.accountId !== this.testAccountId || 
          typeof reconciliationResult.isBalanced !== 'boolean' || 
          typeof reconciliationResult.bookBalance !== 'string' || 
          typeof reconciliationResult.clientLedgerTotal !== 'string' || 
          typeof reconciliationResult.bankBalance !== 'string') {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Perform three-way reconciliation',
        description: 'Should perform a three-way reconciliation between book balance, client ledger, and bank statement',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Three-Way Reconciliation',
      description: 'Tests for performing three-way reconciliation',
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
        name: 'Failing Reconciliation Test',
        description: 'This test is designed to fail',
        passed: false,
        error: 'This reconciliation test is deliberately designed to fail for testing purposes'
      }],
      passed: false
    }];
    
    return {
      serviceName: 'IOLTA Reconciliation - Deliberate Failure',
      passed: false,
      startTime: new Date(),
      endTime: new Date(),
      testGroups,
      error: 'Deliberate test failure'
    };
  }
}

// Create and export a singleton instance of the test service
export const ioltaReconciliationTestService = new IoltaReconciliationTestService();