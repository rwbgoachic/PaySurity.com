import { TestService, TestReport, TestGroup } from './test-interfaces';
import { db } from '../../db';
import { 
  legalReports,
  insertLegalReportSchema,
  legalClients,
  legalMatters,
  merchants,
  users,
  legalTimeEntries,
  legalExpenseEntries,
  insertLegalClientSchema,
  insertLegalMatterSchema
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { ReportingService, ReportParameters } from '../legal/reporting-service';

/**
 * Test service for Legal Reporting functionality
 */
export class LegalReportingTestService implements TestService {
  private reportingService: ReportingService;
  private merchantId: number | null = null;
  private userId: number | null = null;
  private clientId: number | null = null;
  private matterId: number | null = null;
  private reportIds: number[] = [];

  constructor() {
    this.reportingService = new ReportingService();
  }

  /**
   * Run all tests for legal reporting
   */
  async runTests(): Promise<TestReport> {
    console.log('Starting Legal Reporting Tests...');
    
    const report: TestReport = {
      name: 'Legal Reporting Tests',
      testGroups: [],
      startTime: new Date(),
      endTime: new Date(),
      passed: true
    };

    try {
      // Set up test environment
      await this.setupTestEnvironment();
      
      // Test groups
      await this.testReportGeneration(report);
      await this.testScheduledReports(report);
      await this.testExportFormats(report);
      
      // Clean up
      await this.cleanupTestEnvironment();
      
      // Calculate final stats
      report.endTime = new Date();
      report.passed = report.testGroups?.every(group => group.passed) ?? false;
      
      return report;
    } catch (error) {
      console.error('Error running Legal Reporting tests:', error);
      report.passed = false;
      report.endTime = new Date();
      return report;
    }
  }
  
  /**
   * Set up test environment with necessary data
   */
  private async setupTestEnvironment() {
    console.log('Setting up test environment for Legal Reporting tests...');
    
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
    
    // Clean up reports
    for (const reportId of this.reportIds) {
      await db.delete(legalReports).where(eq(legalReports.id, reportId));
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
   * Test report generation
   */
  private async testReportGeneration(report: TestReport) {
    console.log('Testing report generation...');
    
    const testGroup: TestGroup = {
      name: 'Report Generation',
      description: 'Tests for generating different types of reports',
      tests: [],
      passed: true
    };
    
    // Test creating a time tracking report
    try {
      const currentDate = new Date();
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const reportData = {
        merchantId: this.merchantId!,
        createdById: this.userId!,
        name: 'Time Tracking Report',
        description: 'Monthly time tracking report',
        reportType: 'time_tracking',
        frequency: 'monthly',
        isPublic: false,
        format: 'json',
        parameters: {
          startDate: oneMonthAgo,
          endDate: currentDate
        },
        createdAt: new Date()
      };
      
      const timeTrackingReport = await this.reportingService.createReport(reportData);
      if (timeTrackingReport?.id) {
        this.reportIds.push(timeTrackingReport.id);
      }
      
      testGroup.tests.push({
        name: 'Create Time Tracking Report',
        description: 'Test that a time tracking report can be created',
        passed: !!timeTrackingReport && timeTrackingReport.name === 'Time Tracking Report',
        error: (!!timeTrackingReport && timeTrackingReport.name === 'Time Tracking Report') ? null : 'Failed to create time tracking report'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Time Tracking Report',
        description: 'Test that a time tracking report can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test creating a client report
    try {
      const currentDate = new Date();
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const reportData = {
        merchantId: this.merchantId!,
        createdById: this.userId!,
        name: 'Client Activity Report',
        description: 'Monthly client activity report',
        reportType: 'client',
        frequency: 'monthly',
        isPublic: true,
        format: 'pdf',
        parameters: {
          startDate: oneMonthAgo,
          endDate: currentDate
        },
        createdAt: new Date()
      };
      
      const clientReport = await this.reportingService.createReport(reportData);
      if (clientReport?.id) {
        this.reportIds.push(clientReport.id);
      }
      
      testGroup.tests.push({
        name: 'Create Client Report',
        description: 'Test that a client report can be created',
        passed: !!clientReport && clientReport.name === 'Client Activity Report',
        error: (!!clientReport && clientReport.name === 'Client Activity Report') ? null : 'Failed to create client report'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Client Report',
        description: 'Test that a client report can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test generating a report
    try {
      const currentDate = new Date();
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const reportParams: ReportParameters = {
        startDate: oneMonthAgo.toISOString().split('T')[0],
        endDate: currentDate.toISOString().split('T')[0],
        format: 'json'
      };
      
      const reportResult = await this.reportingService.generateReport(
        'time_tracking',
        this.merchantId!,
        reportParams
      );
      
      testGroup.tests.push({
        name: 'Generate Report',
        description: 'Test that a report can be generated on demand',
        passed: !!reportResult && typeof reportResult === 'object',
        error: (!!reportResult && typeof reportResult === 'object') ? null : 'Failed to generate report'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Generate Report',
        description: 'Test that a report can be generated on demand',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test scheduled reports
   */
  private async testScheduledReports(report: TestReport) {
    console.log('Testing scheduled reports...');
    
    const testGroup: TestGroup = {
      name: 'Scheduled Reports',
      description: 'Tests for scheduled report functionality',
      tests: [],
      passed: true
    };
    
    // Test getting scheduled reports
    try {
      const scheduledReports = await this.reportingService.getScheduledReports(this.merchantId!);
      
      testGroup.tests.push({
        name: 'Get Scheduled Reports',
        description: 'Test that scheduled reports can be retrieved',
        passed: Array.isArray(scheduledReports),
        error: Array.isArray(scheduledReports) ? null : 'Failed to retrieve scheduled reports'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Get Scheduled Reports',
        description: 'Test that scheduled reports can be retrieved',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test creating a scheduled report
    try {
      const currentDate = new Date();
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const reportData = {
        merchantId: this.merchantId!,
        createdById: this.userId!,
        name: 'Weekly Billing Report',
        description: 'Weekly billing summary report',
        reportType: 'billing',
        frequency: 'weekly',
        isPublic: false,
        format: 'pdf',
        parameters: {
          startDate: oneMonthAgo,
          endDate: currentDate
        },
        createdAt: new Date(),
        nextRunDate: new Date(currentDate.setDate(currentDate.getDate() + 7))
      };
      
      const scheduledReport = await this.reportingService.createScheduledReport(reportData);
      if (scheduledReport?.id) {
        this.reportIds.push(scheduledReport.id);
      }
      
      testGroup.tests.push({
        name: 'Create Scheduled Report',
        description: 'Test that a scheduled report can be created',
        passed: !!scheduledReport && scheduledReport.frequency === 'weekly',
        error: (!!scheduledReport && scheduledReport.frequency === 'weekly') ? null : 'Failed to create scheduled report'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Scheduled Report',
        description: 'Test that a scheduled report can be created',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
  
  /**
   * Test export formats
   */
  private async testExportFormats(report: TestReport) {
    console.log('Testing export formats...');
    
    const testGroup: TestGroup = {
      name: 'Export Formats',
      description: 'Tests for exporting reports in different formats',
      tests: [],
      passed: true
    };
    
    // Test exporting in JSON format
    try {
      const currentDate = new Date();
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const reportParams: ReportParameters = {
        startDate: oneMonthAgo.toISOString().split('T')[0],
        endDate: currentDate.toISOString().split('T')[0],
        format: 'json'
      };
      
      const jsonReport = await this.reportingService.generateReport(
        'billing', 
        this.merchantId!, 
        reportParams
      );
      
      testGroup.tests.push({
        name: 'Export JSON Format',
        description: 'Test that a report can be exported in JSON format',
        passed: !!jsonReport && typeof jsonReport === 'object',
        error: (!!jsonReport && typeof jsonReport === 'object') ? null : 'Failed to export report in JSON format'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Export JSON Format',
        description: 'Test that a report can be exported in JSON format',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // Test exporting in PDF format
    try {
      const currentDate = new Date();
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const reportParams: ReportParameters = {
        startDate: oneMonthAgo.toISOString().split('T')[0],
        endDate: currentDate.toISOString().split('T')[0],
        format: 'pdf'
      };
      
      const pdfReportPath = await this.reportingService.generateReport(
        'billing', 
        this.merchantId!, 
        reportParams
      );
      
      testGroup.tests.push({
        name: 'Export PDF Format',
        description: 'Test that a report can be exported in PDF format',
        passed: !!pdfReportPath,
        error: !!pdfReportPath ? null : 'Failed to export report in PDF format'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Export PDF Format',
        description: 'Test that a report can be exported in PDF format',
        passed: false,
        error: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }
}