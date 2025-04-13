/**
 * Client Portal Testing Module
 * 
 * This module contains tests for the client portal functionality,
 * which allows clients to access their documents, invoices, and trust account information.
 */

import { TestService, TestReport, TestGroup, TestResult } from './test-interfaces';
import { db } from '../../db';
import { ClientPortalService, clientPortalService } from '../legal/client-portal-service';
import { ioltaService } from '../legal/iolta-service';
import { compareClientIds, parseClientId } from '../legal/client-id-helper';
import {
  legalClients,
  legalMatters,
  ioltaTrustAccounts,
  ioltaClientLedgers,
  ioltaTransactions,
  legalInvoices,
  legalDocuments
} from '@shared/schema';
import { legalPortalUsers } from '@shared/schema-portal';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * ClientPortalTestService implements tests for the client portal functionality
 */
export class ClientPortalTestService implements TestService {
  // Service reference
  clientPortalService = clientPortalService;
  
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
      try {
        console.log("Creating test client using minimal fields approach - guaranteed to work");
        const result = await db.execute(sql`
          INSERT INTO legal_clients (
            id, merchant_id, client_number, email, status, client_type, first_name, last_name, is_active, jurisdiction
          ) VALUES (
            ${this.testClientId}, ${this.testMerchantId}, 'PORTAL-001', 
            'test.portal@example.com', 'active', 'individual', 'Test', 'PortalUser', true, 'CA'
          ) RETURNING id
        `);
        this.testClientId = Number(result.rows[0].id);
        console.log(`Test client created successfully with ID: ${this.testClientId}`);
      } catch (err) {
        console.error("Error creating test client with minimal fields:", err);
        throw err;
      }
    }
    
    // Ensure the matter exists
    const existingMatter = await db.query.legalMatters.findFirst({
      where: eq(legalMatters.id, this.testMatterId)
    });
    
    // If matter doesn't exist, create it
    if (!existingMatter) {
      await db.execute(sql`
        INSERT INTO legal_matters (
          id, merchant_id, client_id, matter_number, status, title, description, 
          practice_area, open_date, billing_type
        ) VALUES (
          ${this.testMatterId}, ${this.testMerchantId}, ${this.testClientId}, 'PORTAL-001', 
          'active', 'Test Portal Matter', 'Test client portal matter', 
          'other', ${new Date().toISOString().split('T')[0]}, 'hourly'
        );
      `);
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
      clientId: this.testClientId.toString(), // IOLTA schema expects clientId as text
      trustAccountId: account.id,
      clientName: 'Test PortalUser',
      matterName: 'Test Portal Matter', 
      matterNumber: 'TPM-001',
      balance: '5000.00',
      status: 'active'
    });
    
    // Create sample transaction with direct SQL
    try {
      console.log("Creating sample IOLTA transaction with direct SQL...");
      // First get the client ledger ID
      const clientLedger = await db.query.ioltaClientLedgers.findFirst({
        where: and(
          eq(ioltaClientLedgers.trustAccountId, account.id),
          eq(ioltaClientLedgers.clientId, this.testClientId.toString())
        )
      });
      
      if (!clientLedger) {
        throw new Error("Client ledger not found");
      }
      
      // Create transaction using direct SQL
      await db.execute(sql`
        INSERT INTO iolta_transactions (
          amount, balance_after, description, transaction_type, created_by, merchant_id,
          trust_account_id, client_ledger_id, fund_type, status, bank_reference, 
          check_number, payee, reference, transaction_date
        ) VALUES (
          '5000.00', '5000.00', 'Initial client retainer', 'deposit', 1, ${this.testMerchantId},
          ${account.id}, ${clientLedger.id}, 'retainer', 'completed', 'TPORTAL-1001',
          'N/A', 'N/A', 'Portal Test Transaction', ${new Date().toISOString().split('T')[0]}
        )
      `);
      
      console.log("IOLTA transaction created successfully with Drizzle ORM");
    } catch (err) {
      console.error("Error creating transaction with Drizzle:", err);
      
      // Fallback to direct SQL with all required fields
      console.log("Trying direct SQL approach for transaction...");
      try {
        await db.execute(sql`
          INSERT INTO iolta_transactions (
            amount, balance_after, description, transaction_type, created_by, trust_account_id,
            client_ledger_id, fund_type, status, bank_reference, check_number,
            payee, payment_method
          ) VALUES (
            '5000.00', '5000.00', 'Initial client retainer', 'deposit', 1, ${account.id},
            1, 'retainer', 'completed', 'TPORTAL-1001', 'N/A',
            'N/A', 'electronic'
          );
        `);
        console.log("Transaction created with direct SQL");
      } catch (error) {
        console.error("Error with direct SQL for transaction:", error);
      }
    }
    
    // Create test document
    await db.execute(sql`
      INSERT INTO legal_documents (
        merchant_id, title, document_type, document_status, client_id, 
        matter_id, file_path, file_size, mime_type, show_in_client_portal, 
        created_by_id, uploaded_by, uploaded_at
      ) VALUES (
        ${this.testMerchantId}, 'Test Portal Document', 'client_communication', 'final',
        ${this.testClientId}, ${this.testMatterId}, '/test/portal/document.pdf',
        1024, 'application/pdf', true, 1, 1, CURRENT_TIMESTAMP
      );
    `);
    
    // Create test invoice
    const invoiceDate = new Date();
    const dueDate = new Date(new Date().setDate(new Date().getDate() + 30));
    await db.execute(sql`
      INSERT INTO legal_invoices (
        merchant_id, client_id, matter_id, invoice_number, invoice_date, 
        due_date, status, total_amount, subtotal, tax_amount, discount_amount,
        balance_due, notes, show_in_client_portal
      ) VALUES (
        ${this.testMerchantId}, ${this.testClientId}, ${this.testMatterId}, 
        ${'TEST-PORTAL-' + Date.now()}, ${invoiceDate}, ${dueDate}, 
        'sent', '500.00', '450.00', '50.00', '0.00',
        '500.00', 'Test portal invoice', true
      );
    `);
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
        password_hash: this.testPortalUserPassword, // Direct password_hash in test environment
        clientId: this.testClientId, // Use integer as required by schema
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
                compareClientIds(portalUser.clientId, this.testClientId),
        error: null,
        expected: {
          email: this.testPortalUserEmail,
          clientId: this.testClientId
        },
        actual: portalUser ? {
          id: portalUser.id,
          email: portalUser.email,
          clientId: portalUser.clientId,
          clientIdStr: String(portalUser.clientId)
        } : null
      });
      
      if (!portalUser || 
          portalUser.email !== this.testPortalUserEmail || 
          !compareClientIds(portalUser.clientId, this.testClientId)) {
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
      const authResult = await clientPortalService.authenticatePortalUser(
        this.testPortalUserEmail,
        this.testPortalUserPassword,
        this.testMerchantId
      );
      
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
      const authResult = await clientPortalService.authenticatePortalUser(
        this.testPortalUserEmail,
        'WrongPassword123!',
        this.testMerchantId
      );
      
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
    
    try {
      // Get invoices for the client
      const invoices = await this.clientPortalService.getClientInvoices(
        this.testClientId,
        this.testMerchantId
      );
      
      // Validate invoice data
      const valid = Array.isArray(invoices) && invoices.length > 0;
      tests.push({
        name: 'Get client invoices',
        passed: valid,
        description: 'Should retrieve invoices for the client',
        error: valid ? null : 'Failed to retrieve client invoices'
      });
      
      if (!valid) {
        groupPassed = false;
      }
    } catch (error) {
      console.error('Error getting client invoices:', error);
      tests.push({
        name: 'Get client invoices',
        passed: false,
        description: 'Should retrieve invoices for the client',
        error: error instanceof Error ? error.message : String(error)
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
      
      const trustInfo = await this.clientPortalService.getClientTrustAccounts(
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
      
      // Use the correct method signature for trust account transactions
      const transactions = await this.clientPortalService.getLedgerTransactions(
        this.testClientId,
        this.testMerchantId,
        this.testAccountId
      );
      
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