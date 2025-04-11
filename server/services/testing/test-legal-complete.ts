import { TestService, TestReport } from './test-interfaces';
import { IoltaTestService } from './test-legal-iolta';
import { IoltaReconciliationTestService } from './test-legal-reconciliation';
import { ClientPortalTestService } from './test-legal-client-portal';
import { DocumentManagementTestService } from './test-legal-document-management';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Legal Practice Management Complete Test Service
 * 
 * This service orchestrates comprehensive testing of the entire Legal Practice
 * Management System, combining all individual test services into a full end-to-end
 * testing suite.
 */
export class LegalCompleteTestService implements TestService {
  private testServices: TestService[] = [];
  
  constructor() {
    // Initialize all test services
    this.testServices = [
      new IoltaTestService(),
      new IoltaReconciliationTestService(),
      new ClientPortalTestService(),
      new DocumentManagementTestService()
      // Add more test services as they are implemented
    ];
  }
  
  /**
   * Run a complete end-to-end test of the Legal Practice Management System
   */
  async runTests(): Promise<TestReport> {
    const startTime = new Date();
    
    const completeReport: TestReport = {
      serviceName: 'Legal Practice Management System - Complete Tests',
      testGroups: [],
      startTime,
      endTime: new Date(),
      duration: 0,
      passRate: 0,
      testsPassed: 0,
      testsFailed: 0,
      tests: []
    };
    
    try {
      console.log('Starting complete Legal Practice Management System tests...');
      
      // Run all test services and collect reports
      for (const service of this.testServices) {
        const report = await service.runTests();
        
        // Add test group from the service
        if (report.testGroups) {
          completeReport.testGroups.push(...report.testGroups);
        }
        
        // Add all tests from the service to the complete report
        if (report.tests) {
          completeReport.tests.push(...report.tests);
        }
      }
      
      // Calculate metrics
      completeReport.testsPassed = completeReport.tests.filter(t => t.passed).length;
      completeReport.testsFailed = completeReport.tests.filter(t => !t.passed).length;
      completeReport.passRate = completeReport.tests.length > 0 
        ? (completeReport.testsPassed / completeReport.tests.length * 100)
        : 0;
      
      // Set end time and calculate duration
      completeReport.endTime = new Date();
      completeReport.duration = completeReport.endTime.getTime() - startTime.getTime();
      
      // Log summary
      console.log('===== LEGAL PRACTICE MANAGEMENT SYSTEM TEST SUMMARY =====');
      console.log(`Total Tests: ${completeReport.tests.length}`);
      console.log(`Passed: ${completeReport.testsPassed}`);
      console.log(`Failed: ${completeReport.testsFailed}`);
      console.log(`Pass Rate: ${completeReport.passRate.toFixed(2)}%`);
      console.log(`Total Duration: ${(completeReport.duration / 1000).toFixed(2)} seconds`);
      console.log('========================================================');
      
      // Generate test report file
      this.saveTestReport(completeReport);
      
      return completeReport;
    } catch (error) {
      console.error('Error in complete Legal Practice Management System tests:', error);
      
      // Calculate metrics even in case of error
      completeReport.testsPassed = completeReport.tests.filter(t => t.passed).length;
      completeReport.testsFailed = completeReport.tests.filter(t => !t.passed).length;
      completeReport.passRate = completeReport.tests.length > 0 
        ? (completeReport.testsPassed / completeReport.tests.length * 100)
        : 0;
      
      completeReport.endTime = new Date();
      completeReport.duration = completeReport.endTime.getTime() - startTime.getTime();
      
      return completeReport;
    }
  }
  
  /**
   * Save test report to a file
   */
  private saveTestReport(report: TestReport) {
    try {
      const reportsDir = path.join(__dirname, '../../../test-reports');
      
      // Ensure reports directory exists
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportsDir, `legal-test-report-${timestamp}.json`);
      
      // Write report to file
      fs.writeFileSync(
        reportPath, 
        JSON.stringify(report, null, 2)
      );
      
      console.log(`Test report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Error saving test report:', error);
    }
  }
}