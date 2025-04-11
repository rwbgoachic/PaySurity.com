/**
 * Test Coordinator Service
 * 
 * This service coordinates the execution of multiple test services
 * and generates comprehensive reports.
 */

import fs from 'fs';
import path from 'path';
import { 
  TestService, 
  TestCoordinator, 
  TestReport,
  TestGroup,
  TestResult,
  createEmptyTestReport
} from './test-interfaces';

export class TestCoordinatorService implements TestCoordinator {
  private testServices: TestService[] = [];
  private reportSavePath: string;

  /**
   * Initialize the test coordinator
   * @param reportSavePath Optional path to save test reports
   */
  constructor(reportSavePath?: string) {
    this.reportSavePath = reportSavePath || path.join(process.cwd(), 'test-reports');
    
    // Ensure the reports directory exists
    if (!fs.existsSync(this.reportSavePath)) {
      fs.mkdirSync(this.reportSavePath, { recursive: true });
    }
  }

  /**
   * Add a test service to the coordinator
   */
  addTestService(service: TestService): void {
    this.testServices.push(service);
  }

  /**
   * Run all test services and generate a comprehensive report
   */
  async runAllTests(): Promise<TestReport> {
    console.log('Running all test services...');
    
    const startTime = new Date();
    const combinedReport: TestReport = createEmptyTestReport('Combined Test Report');
    combinedReport.startTime = startTime;
    
    const serviceReports: TestReport[] = [];
    
    // Run each test service
    for (const service of this.testServices) {
      try {
        console.log(`Running tests for ${service.constructor.name}...`);
        const report = await service.runTests();
        serviceReports.push(report);
        
        // Add test groups from this service to the combined report
        combinedReport.testGroups.push(...report.testGroups);
        
        // Add all tests to the combined list of tests
        combinedReport.tests.push(...report.tests);
        
        // Save the individual service report
        this.saveReport(report);
      } catch (error) {
        console.error(`Error running tests for ${service.constructor.name}:`, error);
      }
    }
    
    // Update combined report statistics
    const endTime = new Date();
    combinedReport.endTime = endTime;
    combinedReport.duration = (endTime.getTime() - startTime.getTime()) / 1000;
    
    // Calculate pass rates
    const totalTests = combinedReport.tests.length;
    const passedTests = combinedReport.tests.filter(test => test.passed).length;
    
    combinedReport.testsPassed = passedTests;
    combinedReport.testsFailed = totalTests - passedTests;
    combinedReport.passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    // Save the combined report
    this.saveReport(combinedReport, 'combined-test-report.json');
    
    // Print a summary of the test results
    this.printSummary(combinedReport);
    
    return combinedReport;
  }

  /**
   * Save a test report to a file
   */
  private saveReport(report: TestReport, customFilename?: string): void {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = customFilename || `${report.serviceName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.json`;
    const reportPath = path.join(this.reportSavePath, filename);
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`Report saved to ${reportPath}`);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }

  /**
   * Print a summary of the test results to the console
   */
  private printSummary(report: TestReport): void {
    console.log('\n===============================================');
    console.log(`TEST SUMMARY: ${report.serviceName}`);
    console.log('===============================================');
    console.log(`Duration: ${report.duration.toFixed(2)} seconds`);
    console.log(`Total Tests: ${report.testsPassed + report.testsFailed}`);
    console.log(`Passed: ${report.testsPassed} (${report.passRate.toFixed(2)}%)`);
    console.log(`Failed: ${report.testsFailed}`);
    console.log('===============================================');
    
    // Print a summary for each test group
    for (const group of report.testGroups) {
      const groupTests = group.tests;
      const groupPassed = groupTests.filter(test => test.passed).length;
      const groupPassRate = groupTests.length > 0 ? (groupPassed / groupTests.length) * 100 : 0;
      
      console.log(`\nGroup: ${group.name}`);
      console.log(`Pass Rate: ${groupPassRate.toFixed(2)}% (${groupPassed}/${groupTests.length})`);
      
      // Print failed tests for this group
      const failedTests = groupTests.filter(test => !test.passed);
      if (failedTests.length > 0) {
        console.log('Failed Tests:');
        for (const test of failedTests) {
          console.log(`  - ${test.name}: ${test.error}`);
        }
      }
    }
    
    console.log('\n===============================================');
  }
}

// Export a singleton instance of the test coordinator
export const testCoordinator = new TestCoordinatorService();