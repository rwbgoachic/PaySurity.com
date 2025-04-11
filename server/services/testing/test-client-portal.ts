import { TestService, TestReport, TestGroup } from './test-interfaces';
import { db } from '../../db';
import { 
  legalPortalUsers,
  legalClients,
  legalMatters,
  legalDocuments,
  legalInvoices,
  ioltaTrustAccounts,
  ioltaClientLedgers,
  merchants,
  users,
  insertLegalClientSchema,
  insertLegalPortalUserSchema,
  insertLegalMatterSchema,
  insertLegalDocumentSchema,
  insertLegalInvoiceSchema,
  insertIoltaTrustAccountSchema,
  insertIoltaClientLedgerSchema
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { ClientPortalService } from '../legal/client-portal-service';
import * as crypto from 'crypto';

/**
 * Test service for Legal Client Portal functionality
 */
export class ClientPortalTestService implements TestService {
  private clientPortalService: ClientPortalService;
  private merchantId: number | null = null;
  private userId: number | null = null;
  private clientId: number | null = null;
  private portalUserId: number | null = null;
  private matterId: number | null = null;
  private documentId: number | null = null;
  private invoiceId: number | null = null;
  private trustAccountId: number | null = null;
  private clientLedgerId: number | null = null;

  constructor() {
    this.clientPortalService = new ClientPortalService();
  }

  /**
   * Run all tests for client portal
   */
  async runTests(): Promise<TestReport> {
    console.log('Starting Legal Client Portal Tests...');
    
    const report: TestReport = {
      name: 'Legal Client Portal Tests',
      testGroups: [],
      startTime: new Date(),
      endTime: new Date(),
      passed: true
    };

    try {
      // Set up test environment
      await this.setupTestEnvironment();
      
      // Test portal authentication
      await this.testPortalAuthentication(report);
      
      // Test document access
      await this.testDocumentAccess(report);
      
      // Test invoice access
      await this.testInvoiceAccess(report);
      
      // Test trust account viewing
      await this.testTrustAccountViewing(report);
      
      // Clean up
      await this.cleanupTestEnvironment();
      
      // Calculate final stats
      report.endTime = new Date();
      report.passed = report.testGroups?.every(group => group.passed) ?? false;
      
      return report;
    } catch (error) {
      console.error('Error running Legal Client Portal tests:', error);
      report.passed = false;
      report.endTime = new Date();
      return report;
    }
  }
  
  /**
   * Set up test environment with necessary data
   */
  private async setupTestEnvironment() {
    console.log('Setting up test environment for Legal Client Portal tests...');
    
    // Create test merchant
    const [merchant] = await db.insert(merchants)
      .values({
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
        status: 'active'
      })
      .returning();
    
    this.merchantId = merchant.id;
    
    // Create test user (attorney)
    const [user] = await db.insert(users)
      .values({
        email: 'testattorney@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'Attorney',
        role: 'merchant',
        status: 'active',
        merchantId: this.merchantId
      })
      .returning();
    
    this.userId = user.id;
    
    // Create test client
    const clientData = insertLegalClientSchema.parse({
      merchantId: this.merchantId,
      clientType: 'individual',
      status: 'active',
      firstName: 'Test',
      lastName: 'Client',
      email: 'testclient@example.com',
      phone: '555-987-6543',
      address: '456 Client St',
      city: 'Client City',
      state: 'CS',
      zip: '54321'
    });
    
    const [client] = await db.insert(legalClients)
      .values(clientData)
      .returning();
    
    this.clientId = client.id;
    
    // Create test portal user
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('clientpassword', salt, 1000, 64, 'sha512').toString('hex');
    
    const portalUserData = insertLegalPortalUserSchema.parse({
      merchantId: this.merchantId,
      clientId: this.clientId,
      email: 'testclient@example.com',
      passwordHash: `${hash}.${salt}`,
      firstName: 'Test',
      lastName: 'Client',
      status: 'active',
      lastLogin: null
    });
    
    const [portalUser] = await db.insert(legalPortalUsers)
      .values(portalUserData)
      .returning();
    
    this.portalUserId = portalUser.id;
    
    // Create test matter
    const matterData = insertLegalMatterSchema.parse({
      merchantId: this.merchantId,
      clientId: this.clientId,
      matterName: 'Test Matter',
      matterNumber: 'M-12345',
      status: 'active',
      practiceArea: 'general',
      responsibleAttorneyId: this.userId,
      openDate: new Date().toISOString().split('T')[0],
      billingType: 'hourly'
    });
    
    const [matter] = await db.insert(legalMatters)
      .values(matterData)
      .returning();
    
    this.matterId = matter.id;
    
    // Create test document
    const documentData = insertLegalDocumentSchema.parse({
      merchantId: this.merchantId,
      clientId: this.clientId,
      matterId: this.matterId,
      documentName: 'Test Document.pdf',
      documentType: 'client_document',
      filePath: '/test/documents/test-document.pdf',
      fileSize: 1024,
      uploadedBy: this.userId,
      isClientVisible: true
    });
    
    const [document] = await db.insert(legalDocuments)
      .values(documentData)
      .returning();
    
    this.documentId = document.id;
    
    // Create test invoice
    const invoiceData = insertLegalInvoiceSchema.parse({
      merchantId: this.merchantId,
      clientId: this.clientId,
      matterId: this.matterId,
      invoiceNumber: 'INV-12345',
      total: '500.00',
      subtotal: '500.00',
      tax: '0.00',
      status: 'sent',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      notes: 'Test invoice'
    });
    
    const [invoice] = await db.insert(legalInvoices)
      .values(invoiceData)
      .returning();
    
    this.invoiceId = invoice.id;
    
    // Create test trust account
    const trustAccountData = insertIoltaTrustAccountSchema.parse({
      merchantId: this.merchantId,
      accountName: 'Test IOLTA Account',
      accountNumber: 'TRUST123456',
      bankName: 'Test Bank',
      routingNumber: '123456789',
      status: 'active'
    });
    
    const [trustAccount] = await db.insert(ioltaTrustAccounts)
      .values(trustAccountData)
      .returning();
    
    this.trustAccountId = trustAccount.id;
    
    // Create test client ledger
    const clientLedgerData = insertIoltaClientLedgerSchema.parse({
      merchantId: this.merchantId,
      trustAccountId: this.trustAccountId,
      clientId: this.clientId,
      clientName: 'Test Client',
      description: 'Client trust account ledger',
      status: 'active'
    });
    
    const [clientLedger] = await db.insert(ioltaClientLedgers)
      .values(clientLedgerData)
      .returning();
    
    this.clientLedgerId = clientLedger.id;
    
    console.log('Test environment setup complete.');
  }
  
  /**
   * Clean up test environment
   */
  private async cleanupTestEnvironment() {
    console.log('Cleaning up test environment...');
    
    // Clean up client ledger
    if (this.clientLedgerId) {
      await db.delete(ioltaClientLedgers)
        .where(eq(ioltaClientLedgers.id, this.clientLedgerId));
    }
    
    // Clean up trust account
    if (this.trustAccountId) {
      await db.delete(ioltaTrustAccounts)
        .where(eq(ioltaTrustAccounts.id, this.trustAccountId));
    }
    
    // Clean up invoice
    if (this.invoiceId) {
      await db.delete(legalInvoices)
        .where(eq(legalInvoices.id, this.invoiceId));
    }
    
    // Clean up document
    if (this.documentId) {
      await db.delete(legalDocuments)
        .where(eq(legalDocuments.id, this.documentId));
    }
    
    // Clean up matter
    if (this.matterId) {
      await db.delete(legalMatters)
        .where(eq(legalMatters.id, this.matterId));
    }
    
    // Clean up portal user
    if (this.portalUserId) {
      await db.delete(legalPortalUsers)
        .where(eq(legalPortalUsers.id, this.portalUserId));
    }
    
    // Clean up client
    if (this.clientId) {
      await db.delete(legalClients)
        .where(eq(legalClients.id, this.clientId));
    }
    
    // Clean up user
    if (this.userId) {
      await db.delete(users)
        .where(eq(users.id, this.userId));
    }
    
    // Clean up merchant
    if (this.merchantId) {
      await db.delete(merchants)
        .where(eq(merchants.id, this.merchantId));
    }
    
    console.log('Test environment cleanup complete.');
  }
  
  /**
   * Test portal authentication
   */
  private async testPortalAuthentication(report: TestReport) {
    console.log('Testing portal authentication...');
    
    const testGroup: TestGroup = {
      name: 'Portal Authentication',
      description: 'Tests for client portal authentication functionality',
      tests: [],
      passed: true
    };
    
    // Test authenticating a portal user
    try {
      const authResult = await this.clientPortalService.authenticateUser(
        'testclient@example.com',
        'clientpassword'
      );
      
      testGroup.tests.push({
        name: 'Authenticate User',
        description: 'Test that a portal user can authenticate with correct credentials',
        passed: !!authResult && authResult.clientId === this.clientId,
        error: (!!authResult && authResult.clientId === this.clientId) ? null : 'Failed to authenticate portal user'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Authenticate User',
        description: 'Test that a portal user can authenticate with correct credentials',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test failed authentication with incorrect password
    try {
      const authResult = await this.clientPortalService.authenticateUser(
        'testclient@example.com',
        'wrongpassword'
      );
      
      testGroup.tests.push({
        name: 'Failed Authentication',
        description: 'Test that authentication fails with incorrect password',
        passed: !authResult,
        error: !authResult ? null : 'Authentication succeeded with incorrect password'
      });
    } catch (error) {
      // If the function throws on failed auth, that's also acceptable
      testGroup.tests.push({
        name: 'Failed Authentication',
        description: 'Test that authentication fails with incorrect password',
        passed: true,
        error: null
      });
    }
    
    // Test updating last login timestamp
    try {
      if (this.portalUserId) {
        const updatedUser = await this.clientPortalService.updateLastLogin(this.portalUserId);
        
        testGroup.tests.push({
          name: 'Update Last Login',
          description: 'Test that last login timestamp can be updated',
          passed: !!updatedUser && updatedUser.lastLogin !== null,
          error: (!!updatedUser && updatedUser.lastLogin !== null) ? null : 'Failed to update last login timestamp'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Update Last Login',
        description: 'Test that last login timestamp can be updated',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test document access
   */
  private async testDocumentAccess(report: TestReport) {
    console.log('Testing document access...');
    
    const testGroup: TestGroup = {
      name: 'Document Access',
      description: 'Tests for client document access functionality',
      tests: [],
      passed: true
    };
    
    // Test getting client documents
    try {
      if (this.clientId) {
        const documents = await this.clientPortalService.getClientDocuments(this.clientId);
        
        testGroup.tests.push({
          name: 'Get Client Documents',
          description: 'Test that client documents can be retrieved',
          passed: Array.isArray(documents) && documents.length === 1,
          error: (Array.isArray(documents) && documents.length === 1) ? null : 'Failed to retrieve client documents'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Client Documents',
        description: 'Test that client documents can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test getting document details
    try {
      if (this.documentId) {
        const document = await this.clientPortalService.getDocumentDetails(this.documentId, this.clientId!);
        
        testGroup.tests.push({
          name: 'Get Document Details',
          description: 'Test that document details can be retrieved',
          passed: !!document && document.id === this.documentId,
          error: (!!document && document.id === this.documentId) ? null : 'Failed to retrieve document details'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Document Details',
        description: 'Test that document details can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test document access permission check
    try {
      if (this.documentId && this.clientId) {
        const hasAccess = await this.clientPortalService.checkDocumentAccess(this.documentId, this.clientId);
        
        testGroup.tests.push({
          name: 'Check Document Access',
          description: 'Test that document access permissions are enforced',
          passed: hasAccess === true,
          error: hasAccess === true ? null : 'Failed to verify document access'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Check Document Access',
        description: 'Test that document access permissions are enforced',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test invoice access
   */
  private async testInvoiceAccess(report: TestReport) {
    console.log('Testing invoice access...');
    
    const testGroup: TestGroup = {
      name: 'Invoice Access',
      description: 'Tests for client invoice access functionality',
      tests: [],
      passed: true
    };
    
    // Test getting client invoices
    try {
      if (this.clientId) {
        const invoices = await this.clientPortalService.getClientInvoices(this.clientId);
        
        testGroup.tests.push({
          name: 'Get Client Invoices',
          description: 'Test that client invoices can be retrieved',
          passed: Array.isArray(invoices) && invoices.length === 1,
          error: (Array.isArray(invoices) && invoices.length === 1) ? null : 'Failed to retrieve client invoices'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Client Invoices',
        description: 'Test that client invoices can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test getting invoice details
    try {
      if (this.invoiceId) {
        const invoice = await this.clientPortalService.getInvoiceDetails(this.invoiceId, this.clientId!);
        
        testGroup.tests.push({
          name: 'Get Invoice Details',
          description: 'Test that invoice details can be retrieved',
          passed: !!invoice && invoice.id === this.invoiceId,
          error: (!!invoice && invoice.id === this.invoiceId) ? null : 'Failed to retrieve invoice details'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Invoice Details',
        description: 'Test that invoice details can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test invoice access permission check
    try {
      if (this.invoiceId && this.clientId) {
        const hasAccess = await this.clientPortalService.checkInvoiceAccess(this.invoiceId, this.clientId);
        
        testGroup.tests.push({
          name: 'Check Invoice Access',
          description: 'Test that invoice access permissions are enforced',
          passed: hasAccess === true,
          error: hasAccess === true ? null : 'Failed to verify invoice access'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Check Invoice Access',
        description: 'Test that invoice access permissions are enforced',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test trust account viewing
   */
  private async testTrustAccountViewing(report: TestReport) {
    console.log('Testing trust account viewing...');
    
    const testGroup: TestGroup = {
      name: 'Trust Account Viewing',
      description: 'Tests for client trust account viewing functionality',
      tests: [],
      passed: true
    };
    
    // Test getting client trust accounts
    try {
      if (this.clientId) {
        const trustAccounts = await this.clientPortalService.getClientTrustAccounts(this.clientId);
        
        testGroup.tests.push({
          name: 'Get Client Trust Accounts',
          description: 'Test that client trust accounts can be retrieved',
          passed: Array.isArray(trustAccounts) && trustAccounts.length === 1,
          error: (Array.isArray(trustAccounts) && trustAccounts.length === 1) ? null : 'Failed to retrieve client trust accounts'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Client Trust Accounts',
        description: 'Test that client trust accounts can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test getting trust account balance
    try {
      if (this.clientId && this.trustAccountId) {
        const balance = await this.clientPortalService.getTrustAccountBalance(this.clientId, this.trustAccountId);
        
        testGroup.tests.push({
          name: 'Get Trust Account Balance',
          description: 'Test that trust account balance can be retrieved',
          passed: balance !== null && typeof balance === 'string',
          error: (balance !== null && typeof balance === 'string') ? null : 'Failed to retrieve trust account balance'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Trust Account Balance',
        description: 'Test that trust account balance can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test getting trust account transactions
    try {
      if (this.clientId && this.trustAccountId) {
        const transactions = await this.clientPortalService.getTrustAccountTransactions(
          this.clientId,
          this.trustAccountId,
          { 
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          }
        );
        
        testGroup.tests.push({
          name: 'Get Trust Account Transactions',
          description: 'Test that trust account transactions can be retrieved',
          passed: Array.isArray(transactions),
          error: Array.isArray(transactions) ? null : 'Failed to retrieve trust account transactions'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Trust Account Transactions',
        description: 'Test that trust account transactions can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
}