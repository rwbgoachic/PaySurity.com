import { TestService, TestReport, TestGroup } from './test-interfaces';
import { db } from '../../db';
import { 
  legalTimeEntries, 
  legalExpenseEntries,
  legalClients,
  legalMatters,
  insertLegalTimeEntrySchema,
  insertLegalExpenseEntrySchema,
  insertLegalClientSchema,
  insertLegalMatterSchema,
  merchants,
  users
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { TimeExpenseService } from '../legal/time-expense-service';

/**
 * Test service for Legal Time & Expense tracking functionality
 */
export class LegalTimeExpenseTestService implements TestService {
  private timeExpenseService: TimeExpenseService;
  private merchantId: number | null = null;
  private userId: number | null = null;
  private clientId: number | null = null;
  private matterId: number | null = null;
  private timeEntryIds: number[] = [];
  private expenseEntryIds: number[] = [];

  constructor() {
    this.timeExpenseService = new TimeExpenseService();
  }

  /**
   * Run all tests for time & expense tracking
   */
  async runTests(): Promise<TestReport> {
    console.log('Starting Legal Time & Expense Tests...');
    
    const report: TestReport = {
      name: 'Legal Time & Expense Tests',
      testGroups: [],
      startTime: new Date(),
      endTime: new Date(),
      passed: true
    };

    try {
      // Set up test environment
      await this.setupTestEnvironment();
      
      // Test groups
      await this.testTimeEntryOperations(report);
      await this.testExpenseEntryOperations(report);
      await this.testBillableSummary(report);
      await this.testInvoiceGeneration(report);
      
      // Clean up
      await this.cleanupTestEnvironment();
      
      // Calculate final stats
      report.endTime = new Date();
      report.passed = report.testGroups?.every(group => group.passed) ?? false;
      
      return report;
    } catch (error) {
      console.error('Error running Legal Time & Expense tests:', error);
      report.passed = false;
      report.endTime = new Date();
      return report;
    }
  }
  
  /**
   * Set up test environment with necessary data
   */
  private async setupTestEnvironment() {
    console.log('Setting up test environment for Legal Time & Expense tests...');
    
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
    
    // Create test user
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
    
    console.log('Test environment setup complete.');
  }
  
  /**
   * Clean up test environment
   */
  private async cleanupTestEnvironment() {
    console.log('Cleaning up test environment...');
    
    // Clean up time entries
    for (const entryId of this.timeEntryIds) {
      await db.delete(legalTimeEntries).where(eq(legalTimeEntries.id, entryId));
    }
    
    // Clean up expense entries
    for (const entryId of this.expenseEntryIds) {
      await db.delete(legalExpenseEntries).where(eq(legalExpenseEntries.id, entryId));
    }
    
    // Clean up matter
    if (this.matterId) {
      await db.delete(legalMatters).where(eq(legalMatters.id, this.matterId));
    }
    
    // Clean up client
    if (this.clientId) {
      await db.delete(legalClients).where(eq(legalClients.id, this.clientId));
    }
    
    // Clean up user
    if (this.userId) {
      await db.delete(users).where(eq(users.id, this.userId));
    }
    
    // Clean up merchant
    if (this.merchantId) {
      await db.delete(merchants).where(eq(merchants.id, this.merchantId));
    }
    
    console.log('Test environment cleanup complete.');
  }
  
  /**
   * Test time entry operations
   */
  private async testTimeEntryOperations(report: TestReport) {
    console.log('Testing time entry operations...');
    
    const testGroup: TestGroup = {
      name: 'Time Entry Operations',
      description: 'Tests for time entry creation, retrieval, update, and deletion',
      tests: [],
      passed: true
    };
    
    // Test creating a time entry
    try {
      const currentDate = new Date();
      const startTime = new Date(currentDate);
      startTime.setHours(startTime.getHours() - 2);
      
      const endTime = new Date(currentDate);
      endTime.setHours(endTime.getHours() - 1);
      
      const timeEntryData = insertLegalTimeEntrySchema.parse({
        merchantId: this.merchantId,
        clientId: this.clientId,
        matterId: this.matterId,
        userId: this.userId,
        status: 'completed',
        description: 'Initial client consultation',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: '1.00',
        activityType: 'consultation',
        billable: true,
        rate: '250.00',
        billableAmount: '250.00'
      });
      
      const timeEntry = await this.timeExpenseService.createTimeEntry(timeEntryData);
      this.timeEntryIds.push(timeEntry.id);
      
      testGroup.tests.push({
        name: 'Create Time Entry',
        description: 'Test that a time entry can be created',
        passed: !!timeEntry && timeEntry.description === 'Initial client consultation',
        error: (!!timeEntry && timeEntry.description === 'Initial client consultation') ? null : 'Failed to create time entry'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Time Entry',
        description: 'Test that a time entry can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test retrieving time entries
    try {
      const timeEntries = await this.timeExpenseService.getTimeEntries({
        merchantId: this.merchantId!,
        clientId: this.clientId
      });
      
      testGroup.tests.push({
        name: 'Retrieve Time Entries',
        description: 'Test that time entries can be retrieved',
        passed: Array.isArray(timeEntries) && timeEntries.length > 0,
        error: (Array.isArray(timeEntries) && timeEntries.length > 0) ? null : 'Failed to retrieve time entries'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Retrieve Time Entries',
        description: 'Test that time entries can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test updating a time entry
    try {
      const entryId = this.timeEntryIds[0];
      const updatedDescription = 'Updated client consultation';
      
      const updatedEntry = await this.timeExpenseService.updateTimeEntry(entryId, {
        description: updatedDescription
      });
      
      testGroup.tests.push({
        name: 'Update Time Entry',
        description: 'Test that a time entry can be updated',
        passed: !!updatedEntry && updatedEntry.description === updatedDescription,
        error: (!!updatedEntry && updatedEntry.description === updatedDescription) ? null : 'Failed to update time entry'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Update Time Entry',
        description: 'Test that a time entry can be updated',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test expense entry operations
   */
  private async testExpenseEntryOperations(report: TestReport) {
    console.log('Testing expense entry operations...');
    
    const testGroup: TestGroup = {
      name: 'Expense Entry Operations',
      description: 'Tests for expense entry creation, retrieval, update, and deletion',
      tests: [],
      passed: true
    };
    
    // Test creating an expense entry
    try {
      const expenseEntryData = insertLegalExpenseEntrySchema.parse({
        merchantId: this.merchantId,
        clientId: this.clientId,
        matterId: this.matterId,
        userId: this.userId,
        status: 'approved',
        description: 'Filing fees',
        amount: '350.00',
        expenseType: 'filing_fee',
        expenseDate: new Date().toISOString().split('T')[0],
        billable: true,
        receiptUrl: 'https://example.com/receipts/test.pdf',
        totalBillableAmount: '350.00'
      });
      
      const expenseEntry = await this.timeExpenseService.createExpenseEntry(expenseEntryData);
      this.expenseEntryIds.push(expenseEntry.id);
      
      testGroup.tests.push({
        name: 'Create Expense Entry',
        description: 'Test that an expense entry can be created',
        passed: !!expenseEntry && expenseEntry.description === 'Filing fees',
        error: (!!expenseEntry && expenseEntry.description === 'Filing fees') ? null : 'Failed to create expense entry'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Expense Entry',
        description: 'Test that an expense entry can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test retrieving expense entries
    try {
      const expenseEntries = await this.timeExpenseService.getExpenseEntries({
        merchantId: this.merchantId!,
        clientId: this.clientId
      });
      
      testGroup.tests.push({
        name: 'Retrieve Expense Entries',
        description: 'Test that expense entries can be retrieved',
        passed: Array.isArray(expenseEntries) && expenseEntries.length > 0,
        error: (Array.isArray(expenseEntries) && expenseEntries.length > 0) ? null : 'Failed to retrieve expense entries'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Retrieve Expense Entries',
        description: 'Test that expense entries can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test updating an expense entry
    try {
      const entryId = this.expenseEntryIds[0];
      const updatedDescription = 'Updated filing fees';
      
      const updatedEntry = await this.timeExpenseService.updateExpenseEntry(entryId, {
        description: updatedDescription
      });
      
      testGroup.tests.push({
        name: 'Update Expense Entry',
        description: 'Test that an expense entry can be updated',
        passed: !!updatedEntry && updatedEntry.description === updatedDescription,
        error: (!!updatedEntry && updatedEntry.description === updatedDescription) ? null : 'Failed to update expense entry'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Update Expense Entry',
        description: 'Test that an expense entry can be updated',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test billable summary
   */
  private async testBillableSummary(report: TestReport) {
    console.log('Testing billable summary...');
    
    const testGroup: TestGroup = {
      name: 'Billable Summary',
      description: 'Tests for generating billable summaries',
      tests: [],
      passed: true
    };
    
    // Test getting billable summary
    try {
      const summary = await this.timeExpenseService.getBillableSummary({
        merchantId: this.merchantId!,
        clientId: this.clientId,
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
      
      testGroup.tests.push({
        name: 'Get Billable Summary',
        description: 'Test that a billable summary can be generated',
        passed: !!summary && typeof summary.totalTimeAmount === 'string',
        error: (!!summary && typeof summary.totalTimeAmount === 'string') ? null : 'Failed to generate billable summary'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Billable Summary',
        description: 'Test that a billable summary can be generated',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test invoice generation
   */
  private async testInvoiceGeneration(report: TestReport) {
    console.log('Testing invoice generation...');
    
    const testGroup: TestGroup = {
      name: 'Invoice Generation',
      description: 'Tests for generating invoices from time and expense entries',
      tests: [],
      passed: true
    };
    
    // Test creating an invoice
    try {
      const invoiceData = {
        merchantId: this.merchantId!,
        clientId: this.clientId!,
        matterId: this.matterId!,
        status: 'draft',
        timeEntryIds: this.timeEntryIds,
        expenseEntryIds: this.expenseEntryIds,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        notes: 'Test invoice generated by automated tests'
      };
      
      const invoice = await this.timeExpenseService.createInvoice(invoiceData);
      
      testGroup.tests.push({
        name: 'Create Invoice',
        description: 'Test that an invoice can be created from time and expense entries',
        passed: !!invoice && invoice.status === 'draft',
        error: (!!invoice && invoice.status === 'draft') ? null : 'Failed to create invoice'
      });
      
      // Test getting invoice entries
      if (invoice) {
        const entries = await this.timeExpenseService.getInvoiceEntries(invoice.id);
        
        testGroup.tests.push({
          name: 'Get Invoice Entries',
          description: 'Test that invoice entries can be retrieved',
          passed: !!entries && 
                 Array.isArray(entries.timeEntries) && 
                 Array.isArray(entries.expenseEntries),
          error: (!!entries && 
                 Array.isArray(entries.timeEntries) && 
                 Array.isArray(entries.expenseEntries)) ? null : 'Failed to retrieve invoice entries'
        });
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Invoice',
        description: 'Test that an invoice can be created from time and expense entries',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
}