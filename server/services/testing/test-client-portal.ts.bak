/**
 * Client Portal Testing Module
 * 
 * This module contains tests for the client portal functionality,
 * which allows clients to access their documents, invoices, and trust account information.
 */

import { TestService, TestReport, TestGroup, TestResult } from './test-interfaces';
import { db } from '../../db';
import { clientPortalService } from '../legal/client-portal-service';
import { ioltaService } from '../legal/iolta-service';
import {
  legalClients,
  legalMatters,
  ioltaTrustAccounts,
  ioltaClientLedgers,
  legalInvoices,
  legalDocuments
} from '@shared/schema';
import { legalPortalUsers } from '@shared/schema-portal';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * ClientPortalTestService implements tests for the client portal functionality
 */
export class ClientPortalTestService implements TestService {
  // Test data
  private testMerchantId = 1;
  private testClientId = 1;
  private testMatterId = 1;
  private testAccountId: number | null = null;
  private testPortalUserId: number | null = null;
  private testPortalUserEmail = `test.portal.${Date.now()}@example.com`;
  private testPortalUserPassword = 'P@ssw0rd123!';
  
  /**
   * Run all client portal tests
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
      testGroups.push(await this.testPortalUserManagement());
      testGroups.push(await this.testDocumentAccess());
      testGroups.push(await this.testInvoiceAccess());
      testGroups.push(await this.testTrustAccountAccess());
      
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
      console.error('Error running client portal tests:', e);
      
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
      serviceName: 'Client Portal',
      passed,
      startTime,
      endTime,
      duration,
      testGroups,
      error
    };
  }
  
  /**
   * Setup test data needed for client portal tests
   */
  private async setupTestData(): Promise<void> {
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
        lastName: 'PortalUser',
        email: 'test.portal@example.com',
        phone: '555-123-4567',
        taxId: '98-7654321' // Add taxId to fix missing column error
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
        title: 'Test Portal Matter',
        description: 'Test client portal matter',
        practiceArea: 'other',
        openDate: new Date()
      });
    }
    
    // Create IOLTA account
    const account = await ioltaService.createTrustAccount({
      merchantId: this.testMerchantId,
      clientId: this.testClientId,
      accountNumber: 'PORTAL12345',
      accountName: 'Test Portal IOLTA Account',
      bankName: 'First National Test Bank',
      routingNumber: '123456789',
      accountType: 'iolta' as const,
      status: 'active',
      balance: '10000.00'
    });
    
    this.testAccountId = account.id;
    
    // Add client to IOLTA account
    await ioltaService.createClientLedger({
      merchantId: this.testMerchantId,
      clientId: this.testClientId.toString(), // Ensure clientId is a string to match schema
      trustAccountId: account.id, // Use trustAccountId instead of ioltaAccountId
      clientName: 'Test PortalUser', // Add required clientName
      matterName: 'Test Portal Matter', // Add required matterName
      matterNumber: 'TPM-001', // Add required matterNumber
      balance: '5000.00',
      status: 'active'
    });
    
    // Create some sample transactions using the correct property names
    await ioltaService.recordTransaction({
      // Only include properties from the expected schema
      amount: '5000.00',
      description: 'Initial client retainer',
      transactionType: 'deposit',
      createdBy: 1, 
      trustAccountId: account.id,
      clientLedgerId: 1,
      fundType: 'retainer',
      status: 'completed',
      referenceNumber: 'TPORTAL-1001',
      // Additional required properties
      checkNumber: 'N/A',
      payee: 'N/A',
      paymentMethod: 'electronic'
    });
    
    // Create test document
    await db.insert(legalDocuments).values({
      merchantId: this.testMerchantId,
      title: 'Test Portal Document',
      documentType: 'client_communication',
      documentStatus: 'final',
      clientId: this.testClientId,
      matterId: this.testMatterId,
      filePath: '/test/portal/document.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      showInClientPortal: true,
      createdById: 1
    });
    
    // Create test invoice
    await db.insert(legalInvoices).values({
      merchantId: this.testMerchantId,
      clientId: this.testClientId,
      matterId: this.testMatterId,
      invoiceNumber: `TEST-PORTAL-${Date.now()}`,
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: 'sent',
      totalAmount: '500.00',
      notes: 'Test portal invoice',
      showInClientPortal: true
    });
  }
  
  /**
   * Clean up test data
   */
  private async cleanupTestData(): Promise<void> {
    // Delete portal user if created
    if (this.testPortalUserId) {
      await db.delete(legalPortalUsers)
        .where(eq(legalPortalUsers.id, this.testPortalUserId));
    }
    
    // Delete test invoice
    await db.delete(legalInvoices)
      .where(and(
        eq(legalInvoices.merchantId, this.testMerchantId),
        eq(legalInvoices.clientId, this.testClientId)
      ));
    
    // Delete test document
    await db.delete(legalDocuments)
      .where(and(
        eq(legalDocuments.merchantId, this.testMerchantId),
        eq(legalDocuments.clientId, this.testClientId),
        eq(legalDocuments.title, 'Test Portal Document')
      ));
    
    // Delete IOLTA data if account was created
    if (this.testAccountId) {
      // Delete client ledger
      await db.delete(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.merchantId, this.testMerchantId),
          eq(ioltaClientLedgers.trustAccountId, this.testAccountId),
          eq(ioltaClientLedgers.clientId, this.testClientId.toString()) // Convert clientId to string to match schema
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
   * Test portal user management functionality
   */
  private async testPortalUserManagement(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Create portal user
    try {
      const portalUser = await clientPortalService.createPortalUser({
        email: this.testPortalUserEmail,
        password: this.testPortalUserPassword,
        clientId: this.testClientId,
        merchantId: this.testMerchantId,
        firstName: 'Test',
        lastName: 'Portal',
        isActive: true // Use isActive instead of status
      });
      
      this.testPortalUserId = portalUser.id;
      
      tests.push({
        name: 'Create portal user',
        description: 'Should create a new portal user account',
        passed: !!portalUser && 
                portalUser.email === this.testPortalUserEmail &&
                portalUser.clientId === this.testClientId,
        error: null,
        expected: {
          email: this.testPortalUserEmail,
          clientId: this.testClientId
        },
        actual: portalUser ? {
          id: portalUser.id,
          email: portalUser.email,
          clientId: portalUser.clientId
        } : null
      });
      
      if (!portalUser || 
          portalUser.email !== this.testPortalUserEmail || 
          portalUser.clientId !== this.testClientId) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Create portal user',
        description: 'Should create a new portal user account',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Authenticate portal user
    try {
      const authResult = await clientPortalService.authenticatePortalUser({
        email: this.testPortalUserEmail,
        password: this.testPortalUserPassword,
        merchantId: this.testMerchantId
      });
      
      tests.push({
        name: 'Authenticate portal user',
        description: 'Should authenticate portal user with correct credentials',
        passed: !!authResult && 
                !!authResult.user &&
                authResult.user.email === this.testPortalUserEmail,
        error: null,
        expected: {
          authenticated: true,
          userEmail: this.testPortalUserEmail
        },
        actual: authResult ? {
          user: authResult.user ? {
            email: authResult.user.email,
            id: authResult.user.id
          } : null
        } : null
      });
      
      if (!authResult || 
          !authResult.user ||
          authResult.user.email !== this.testPortalUserEmail) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Authenticate portal user',
        description: 'Should authenticate portal user with correct credentials',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 3: Reject incorrect authentication
    try {
      const authResult = await clientPortalService.authenticatePortalUser({
        email: this.testPortalUserEmail,
        password: 'WrongPassword123!',
        merchantId: this.testMerchantId
      });
      
      tests.push({
        name: 'Reject incorrect authentication',
        description: 'Should reject authentication with incorrect credentials',
        passed: !!authResult && 
                !authResult.user,
        error: null,
        expected: {
          authenticated: false,
          user: null
        },
        actual: authResult ? {
          user: authResult.user
        } : null
      });
      
      if (!authResult || authResult.user) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Reject incorrect authentication',
        description: 'Should reject authentication with incorrect credentials',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Portal User Management',
      description: 'Tests for creating and authenticating portal users',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test document access functionality
   */
  private async testDocumentAccess(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Access client documents
    try {
      if (!this.testPortalUserId) {
        throw new Error('Test portal user ID not set');
      }
      
      const documents = await clientPortalService.getClientDocuments(
        this.testClientId,
        this.testMerchantId
      );
      
      tests.push({
        name: 'Access client documents',
        description: 'Should retrieve documents accessible to the client',
        passed: Array.isArray(documents) && 
                documents.length > 0 &&
                documents.some(doc => doc.title === 'Test Portal Document'),
        error: null,
        expected: {
          hasDocuments: true,
          hasTestDocument: true
        },
        actual: {
          hasDocuments: Array.isArray(documents) && documents.length > 0,
          hasTestDocument: Array.isArray(documents) && documents.some(doc => doc.title === 'Test Portal Document'),
          count: Array.isArray(documents) ? documents.length : 0
        }
      });
      
      if (!Array.isArray(documents) || 
          documents.length === 0 ||
          !documents.some(doc => doc.title === 'Test Portal Document')) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Access client documents',
        description: 'Should retrieve documents accessible to the client',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Document Access',
      description: 'Tests for accessing client documents via the portal',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test invoice access functionality
   */
  private async testInvoiceAccess(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Access client invoices
    try {
      if (!this.testPortalUserId) {
        throw new Error('Test portal user ID not set');
      }
      
      const invoices = await clientPortalService.getClientInvoices(
        this.testClientId,
        this.testMerchantId
      );
      
      tests.push({
        name: 'Access client invoices',
        description: 'Should retrieve invoices accessible to the client',
        passed: Array.isArray(invoices) && 
                invoices.length > 0 &&
                invoices.some(inv => inv.notes === 'Test portal invoice'),
        error: null,
        expected: {
          hasInvoices: true,
          hasTestInvoice: true
        },
        actual: {
          hasInvoices: Array.isArray(invoices) && invoices.length > 0,
          hasTestInvoice: Array.isArray(invoices) && invoices.some(inv => inv.notes === 'Test portal invoice'),
          count: Array.isArray(invoices) ? invoices.length : 0
        }
      });
      
      if (!Array.isArray(invoices) || 
          invoices.length === 0 ||
          !invoices.some(inv => inv.notes === 'Test portal invoice')) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Access client invoices',
        description: 'Should retrieve invoices accessible to the client',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Invoice Access',
      description: 'Tests for accessing client invoices via the portal',
      tests,
      passed: groupPassed
    };
  }
  
  /**
   * Test trust account access functionality
   */
  private async testTrustAccountAccess(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    // Test 1: Access trust account information
    try {
      if (!this.testPortalUserId || !this.testAccountId) {
        throw new Error('Test portal user ID or account ID not set');
      }
      
      const trustInfo = await clientPortalService.getClientTrustAccounts(
        this.testClientId,
        this.testMerchantId
      );
      
      tests.push({
        name: 'Access trust account information',
        description: 'Should retrieve trust account information for the client',
        passed: !!trustInfo && 
                Array.isArray(trustInfo) &&
                trustInfo.length > 0 &&
                trustInfo.some(acc => acc.id === this.testAccountId),
        error: null,
        expected: {
          hasAccounts: true,
          hasTestAccount: true
        },
        actual: trustInfo ? {
          hasAccounts: Array.isArray(trustInfo) && trustInfo.length > 0,
          hasTestAccount: this.testAccountId !== null && 
                          Array.isArray(trustInfo) && 
                          trustInfo.some(acc => acc.id === this.testAccountId),
          accountCount: Array.isArray(trustInfo) ? trustInfo.length : 0
        } : null
      });
      
      if (!trustInfo || 
          !Array.isArray(trustInfo) ||
          trustInfo.length === 0 ||
          !trustInfo.some(acc => acc.id === this.testAccountId)) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Access trust account information',
        description: 'Should retrieve trust account information for the client',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    // Test 2: Access trust account transactions
    try {
      if (!this.testPortalUserId || !this.testAccountId) {
        throw new Error('Test portal user ID or account ID not set');
      }
      
      // Use the correct method name for trust account transactions
      const transactions = await clientPortalService.getLedgerTransactions({
        clientId: this.testClientId.toString(),
        merchantId: this.testMerchantId,
        trustAccountId: this.testAccountId
      });
      
      tests.push({
        name: 'Access trust account transactions',
        description: 'Should retrieve trust account transactions for the client',
        passed: Array.isArray(transactions) && 
                transactions.length > 0 &&
                transactions.some(tr => tr.description === 'Initial client retainer'),
        error: null,
        expected: {
          hasTransactions: true,
          hasTestTransaction: true
        },
        actual: {
          hasTransactions: Array.isArray(transactions) && transactions.length > 0,
          hasTestTransaction: Array.isArray(transactions) && 
                             transactions.some(tr => tr.description === 'Initial client retainer'),
          transactionCount: Array.isArray(transactions) ? transactions.length : 0
        }
      });
      
      if (!Array.isArray(transactions) || 
          transactions.length === 0 ||
          !transactions.some(tr => tr.description === 'Initial client retainer')) {
        groupPassed = false;
      }
    } catch (e) {
      tests.push({
        name: 'Access trust account transactions',
        description: 'Should retrieve trust account transactions for the client',
        passed: false,
        error: e instanceof Error ? e.message : String(e)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Trust Account Access',
      description: 'Tests for accessing client trust account information via the portal',
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
        name: 'Failing Portal User Test',
        description: 'This test is designed to fail',
        passed: false,
        error: 'This client portal test is deliberately designed to fail for testing purposes'
      }],
      passed: false
    }];
    
    return {
      serviceName: 'Client Portal - Deliberate Failure',
      passed: false,
      startTime: new Date(),
      endTime: new Date(),
      testGroups,
      error: 'Deliberate test failure'
    };
  }
}

// Don't create a singleton instance yet - we'll handle this in the test-legal-system.ts file