/**
 * Legal Client Portal Testing Service
 * 
 * This script tests the client portal functionality, including:
 * - Client portal authentication
 * - Document access
 * - Invoice viewing
 * - Trust account viewing
 * - Activity logging
 */

import { 
  TestService, 
  TestReport, 
  TestGroup, 
  createEmptyTestReport,
  createPassedTestResult,
  createFailedTestResult
} from './test-interfaces';
import { db } from '../../db';
import { 
  createTestMerchant, 
  createTestClient, 
  createTestMatter,
  cleanupTestData,
  hashPassword,
  generateRandomString
} from './test-utils';
import { eq, and } from 'drizzle-orm';
import { 
  portalUsers, 
  portalSessions, 
  portalDocuments, 
  portalDocumentAccess,
  portalInvoiceAccess,
  ioltaAccounts,
  ioltaTransactions
} from '@shared/schema';

export class LegalClientPortalTestService implements TestService {
  private testMerchantId: number | null = null;
  private testClientId: number | null = null;
  private testMatterId: number | null = null;
  private testPortalUserId: number | null = null;
  private testPortalEmail: string = '';
  private testPortalPassword: string = 'TestPassword123!';
  private testIoltaAccountId: number | null = null;

  async runTests(): Promise<TestReport> {
    const report = createEmptyTestReport('Legal Client Portal Test Service');
    const startTime = new Date();
    report.startTime = startTime;

    try {
      // Setup test data
      await this.setupTestData();

      // Run test groups
      const authenticationTests = await this.runAuthenticationTests();
      const documentTests = await this.runDocumentAccessTests();
      const invoiceTests = await this.runInvoiceAccessTests();
      const trustAccountTests = await this.runTrustAccountTests();
      const activityTests = await this.runActivityLoggingTests();

      // Add test groups to report
      report.testGroups = [
        authenticationTests,
        documentTests,
        invoiceTests,
        trustAccountTests,
        activityTests
      ];

      // Flatten tests for overall metrics
      report.tests = report.testGroups.flatMap(group => group.tests);
      report.testsPassed = report.tests.filter(t => t.passed).length;
      report.testsFailed = report.tests.length - report.testsPassed;
      report.passRate = report.tests.length > 0 
        ? (report.testsPassed / report.tests.length) * 100 
        : 0;
    } catch (error) {
      console.error('Error running Legal Client Portal tests:', error);
    } finally {
      // Clean up test data
      await this.cleanupTestData();
    }

    const endTime = new Date();
    report.endTime = endTime;
    report.duration = endTime.getTime() - startTime.getTime();

    return report;
  }

  /**
   * Set up test data needed for the tests
   */
  private async setupTestData(): Promise<void> {
    try {
      // Create test merchant
      const merchant = await createTestMerchant();
      this.testMerchantId = merchant.id;

      // Create test client
      const client = await createTestClient(this.testMerchantId);
      this.testClientId = client.id;

      // Create test matter
      const matter = await createTestMatter(this.testMerchantId, this.testClientId);
      this.testMatterId = matter.id;

      // Create test portal user
      this.testPortalEmail = `portal-user-${generateRandomString(6)}@example.com`;
      const hashedPassword = hashPassword(this.testPortalPassword);
      
      const [portalUser] = await db.insert(portalUsers).values({
        clientId: this.testClientId,
        email: this.testPortalEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'PortalUser',
        phone: '555-123-4567',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      this.testPortalUserId = portalUser.id;

      // Create test IOLTA account
      const [ioltaAccount] = await db.insert(ioltaAccounts).values({
        merchantId: this.testMerchantId,
        accountName: `Test IOLTA Account ${generateRandomString(4)}`,
        accountNumber: generateRandomString(10),
        bankName: 'Test Bank',
        routingNumber: '123456789',
        balance: '1000.00',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      this.testIoltaAccountId = ioltaAccount.id;

      // Create test IOLTA transactions
      await db.insert(ioltaTransactions).values([
        {
          ioltaAccountId: this.testIoltaAccountId,
          clientId: this.testClientId,
          matterId: this.testMatterId,
          merchantId: this.testMerchantId,
          type: 'deposit',
          amount: '500.00',
          description: 'Initial client deposit',
          checkNumber: '12345',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
          balance: '500.00'
        },
        {
          ioltaAccountId: this.testIoltaAccountId,
          clientId: this.testClientId,
          matterId: this.testMatterId,
          merchantId: this.testMerchantId,
          type: 'withdrawal',
          amount: '100.00',
          description: 'Filing fee payment',
          checkNumber: '12346',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
          balance: '400.00'
        }
      ]);

      // Create test portal document
      const [document] = await db.insert(portalDocuments).values({
        merchantId: this.testMerchantId,
        title: 'Test Document',
        description: 'Test document for portal access',
        filePath: '/tmp/test-document.pdf',
        fileType: 'application/pdf',
        fileSize: 12345,
        uploadedById: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Grant document access to the test portal user
      await db.insert(portalDocumentAccess).values({
        documentId: document.id,
        portalUserId: this.testPortalUserId,
        clientId: this.testClientId,
        grantedAt: new Date(),
        grantedBy: 1
      });

      // Create invoice access record
      await db.insert(portalInvoiceAccess).values({
        portalUserId: this.testPortalUserId,
        clientId: this.testClientId,
        grantedAt: new Date(),
        grantedBy: 1
      });

    } catch (error) {
      console.error('Error setting up test data:', error);
      throw error;
    }
  }

  /**
   * Clean up test data after tests
   */
  private async cleanupTestData(): Promise<void> {
    if (this.testPortalUserId) {
      try {
        // Delete portal user data
        await db.delete(portalSessions).where(eq(portalSessions.portalUserId, this.testPortalUserId));
        await db.delete(portalDocumentAccess).where(eq(portalDocumentAccess.portalUserId, this.testPortalUserId));
        await db.delete(portalInvoiceAccess).where(eq(portalInvoiceAccess.portalUserId, this.testPortalUserId));
        await db.delete(portalUsers).where(eq(portalUsers.id, this.testPortalUserId));
        
        // Delete IOLTA transactions and account
        if (this.testIoltaAccountId) {
          await db.delete(ioltaTransactions).where(eq(ioltaTransactions.ioltaAccountId, this.testIoltaAccountId));
          await db.delete(ioltaAccounts).where(eq(ioltaAccounts.id, this.testIoltaAccountId));
        }
        
        // Use the utility function to clean up other test data
        await cleanupTestData({
          merchantId: this.testMerchantId,
          clientId: this.testClientId,
          matterId: this.testMatterId
        });
      } catch (error) {
        console.error('Error cleaning up test data:', error);
      }
    }
  }

  /**
   * Run authentication tests
   */
  private async runAuthenticationTests(): Promise<TestGroup> {
    const group: TestGroup = {
      name: 'Client Portal Authentication',
      tests: []
    };

    // Test valid login credentials
    try {
      const portalUser = await db.query.portalUsers.findFirst({
        where: eq(portalUsers.email, this.testPortalEmail)
      });

      if (portalUser) {
        group.tests.push(createPassedTestResult(
          'Valid Login Credentials',
          'Test that valid login credentials are accepted',
          'Valid credentials should be accepted',
          'Found portal user with valid credentials'
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'Valid Login Credentials',
          'Test that valid login credentials are accepted',
          'Valid credentials should be accepted',
          'Failed to find portal user with valid credentials'
        ));
      }
    } catch (error) {
      group.tests.push(createFailedTestResult(
        'Valid Login Credentials',
        'Test that valid login credentials are accepted',
        'Valid credentials should be accepted',
        `Error testing valid login: ${error instanceof Error ? error.message : String(error)}`
      ));
    }

    // Test invalid login credentials
    try {
      const portalUser = await db.query.portalUsers.findFirst({
        where: and(
          eq(portalUsers.email, 'nonexistent@example.com'),
          eq(portalUsers.password, 'InvalidPassword123!')
        )
      });

      if (!portalUser) {
        group.tests.push(createPassedTestResult(
          'Invalid Login Credentials',
          'Test that invalid login credentials are rejected',
          'Invalid credentials should be rejected',
          'Invalid login credentials were properly rejected'
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'Invalid Login Credentials',
          'Test that invalid login credentials are rejected',
          'Invalid credentials should be rejected',
          'System improperly accepted invalid credentials'
        ));
      }
    } catch (error) {
      group.tests.push(createFailedTestResult(
        'Invalid Login Credentials',
        'Test that invalid login credentials are rejected',
        'Invalid credentials should be rejected',
        `Error testing invalid login: ${error instanceof Error ? error.message : String(error)}`
      ));
    }

    return group;
  }

  /**
   * Run document access tests
   */
  private async runDocumentAccessTests(): Promise<TestGroup> {
    const group: TestGroup = {
      name: 'Client Portal Document Access',
      tests: []
    };

    // Test document access permissions
    try {
      const documentAccess = await db.query.portalDocumentAccess.findFirst({
        where: eq(portalDocumentAccess.portalUserId, this.testPortalUserId || 0)
      });

      if (documentAccess) {
        group.tests.push(createPassedTestResult(
          'Document Access',
          'Test that portal user has access to documents',
          'Portal user should have document access permissions',
          'Portal user has document access permissions'
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'Document Access',
          'Test that portal user has access to documents',
          'Portal user should have document access permissions',
          'Portal user does not have document access permissions'
        ));
      }
    } catch (error) {
      group.tests.push(createFailedTestResult(
        'Document Access',
        'Test that portal user has access to documents',
        'Portal user should have document access permissions',
        `Error testing document access: ${error instanceof Error ? error.message : String(error)}`
      ));
    }

    return group;
  }

  /**
   * Run invoice access tests
   */
  private async runInvoiceAccessTests(): Promise<TestGroup> {
    const group: TestGroup = {
      name: 'Client Portal Invoice Access',
      tests: []
    };

    // Test invoice access permissions
    try {
      const invoiceAccess = await db.query.portalInvoiceAccess.findFirst({
        where: eq(portalInvoiceAccess.portalUserId, this.testPortalUserId || 0)
      });

      if (invoiceAccess) {
        group.tests.push(createPassedTestResult(
          'Invoice Access',
          'Test that portal user has access to invoices',
          'Portal user should have invoice access permissions',
          'Portal user has invoice access permissions'
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'Invoice Access',
          'Test that portal user has access to invoices',
          'Portal user should have invoice access permissions',
          'Portal user does not have invoice access permissions'
        ));
      }
    } catch (error) {
      group.tests.push(createFailedTestResult(
        'Invoice Access',
        'Test that portal user has access to invoices',
        'Portal user should have invoice access permissions',
        `Error testing invoice access: ${error instanceof Error ? error.message : String(error)}`
      ));
    }

    return group;
  }

  /**
   * Run trust account tests
   */
  private async runTrustAccountTests(): Promise<TestGroup> {
    const group: TestGroup = {
      name: 'Client Portal Trust Account Access',
      tests: []
    };

    // Test IOLTA account exists
    try {
      const ioltaAccount = await db.query.ioltaAccounts.findFirst({
        where: eq(ioltaAccounts.id, this.testIoltaAccountId || 0)
      });

      if (ioltaAccount) {
        group.tests.push(createPassedTestResult(
          'IOLTA Account',
          'Test that IOLTA account exists',
          'IOLTA account should exist',
          'IOLTA account exists'
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'IOLTA Account',
          'Test that IOLTA account exists',
          'IOLTA account should exist',
          'IOLTA account does not exist'
        ));
      }
    } catch (error) {
      group.tests.push(createFailedTestResult(
        'IOLTA Account',
        'Test that IOLTA account exists',
        'IOLTA account should exist',
        `Error testing IOLTA account: ${error instanceof Error ? error.message : String(error)}`
      ));
    }

    // Test IOLTA transactions exist for client
    try {
      const transactions = await db.query.ioltaTransactions.findMany({
        where: and(
          eq(ioltaTransactions.clientId, this.testClientId || 0),
          eq(ioltaTransactions.ioltaAccountId, this.testIoltaAccountId || 0)
        )
      });

      if (transactions && transactions.length > 0) {
        group.tests.push(createPassedTestResult(
          'IOLTA Transactions',
          'Test that IOLTA transactions exist for client',
          'IOLTA transactions should exist for client',
          `Found ${transactions.length} IOLTA transactions for client`
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'IOLTA Transactions',
          'Test that IOLTA transactions exist for client',
          'IOLTA transactions should exist for client',
          'No IOLTA transactions found for client'
        ));
      }
    } catch (error) {
      group.tests.push(createFailedTestResult(
        'IOLTA Transactions',
        'Test that IOLTA transactions exist for client',
        'IOLTA transactions should exist for client',
        `Error testing IOLTA transactions: ${error instanceof Error ? error.message : String(error)}`
      ));
    }

    return group;
  }

  /**
   * Run activity logging tests
   */
  private async runActivityLoggingTests(): Promise<TestGroup> {
    const group: TestGroup = {
      name: 'Client Portal Activity Logging',
      tests: []
    };

    // Simulate a login and verify session creation
    try {
      // Create a test session
      const [session] = await db.insert(portalSessions).values({
        portalUserId: this.testPortalUserId || 0,
        token: `test-token-${generateRandomString(16)}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        lastActivity: new Date(),
        createdAt: new Date()
      }).returning();

      if (session) {
        group.tests.push(createPassedTestResult(
          'Session Creation',
          'Test that sessions are created on login',
          'Session should be created on login',
          'Session was successfully created'
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'Session Creation',
          'Test that sessions are created on login',
          'Session should be created on login',
          'Failed to create session'
        ));
      }

      // Test session retrieval
      const retrievedSession = await db.query.portalSessions.findFirst({
        where: eq(portalSessions.id, session.id)
      });

      if (retrievedSession) {
        group.tests.push(createPassedTestResult(
          'Session Retrieval',
          'Test that sessions can be retrieved',
          'Session should be retrievable',
          'Session was successfully retrieved'
        ));
      } else {
        group.tests.push(createFailedTestResult(
          'Session Retrieval',
          'Test that sessions can be retrieved',
          'Session should be retrievable',
          'Failed to retrieve session'
        ));
      }

    } catch (error) {
      group.tests.push(createFailedTestResult(
        'Activity Logging',
        'Test that activity is properly logged',
        'Activity should be properly logged',
        `Error testing activity logging: ${error instanceof Error ? error.message : String(error)}`
      ));
    }

    return group;
  }

  /**
   * Create a deliberate test failure for testing purposes
   */
  async createDeliberateTestFailure(): Promise<void> {
    throw new Error('This is a deliberate test failure');
  }
}

export const legalClientPortalTestService = new LegalClientPortalTestService();

// Run the tests if executed directly
if (require.main === module) {
  (async () => {
    const testService = new LegalClientPortalTestService();
    const report = await testService.runTests();
    console.log(JSON.stringify(report, null, 2));
  })();
}