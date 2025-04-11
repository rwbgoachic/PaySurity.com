/**
 * Test Coordinator Service
 * 
 * This service coordinates the execution of all test services,
 * aggregates results, and generates comprehensive reports.
 */

import path from 'path';
import fs from 'fs';
import { TestService, TestReport, TestGroup } from './test-interfaces';

export class TestCoordinatorService {
  private testServices: Map<string, TestService> = new Map();
  private reportDirectory = path.join(process.cwd(), 'test-reports');

  constructor() {
    // Create report directory if it doesn't exist
    if (!fs.existsSync(this.reportDirectory)) {
      fs.mkdirSync(this.reportDirectory, { recursive: true });
    }
  }

  /**
   * Register a test service with the coordinator
   */
  registerTestService(name: string, service: TestService): void {
    this.testServices.set(name, service);
  }

  /**
   * Get a list of all registered test services
   */
  getRegisteredServices(): string[] {
    return Array.from(this.testServices.keys());
  }

  /**
   * Run all registered test services and generate a comprehensive report
   */
  async runAllTests(): Promise<TestReport> {
    console.log(`Running all registered test services (${this.testServices.size} services)`);
    
    const startTime = new Date();
    const results: { name: string; report: TestReport }[] = [];
    
    // Run all registered test services
    for (const [name, service] of this.testServices) {
      console.log(`Running test service: ${name}`);
      try {
        const report = await service.runTests();
        results.push({ name, report });
        this.saveTestReport(report, name);
      } catch (error) {
        console.error(`Error running test service ${name}:`, error);
        const errorReport: TestReport = {
          serviceName: name,
          passed: false,
          startTime: new Date(),
          endTime: new Date(),
          testGroups: [],
          error: `Error running test service: ${error instanceof Error ? error.message : String(error)}`
        };
        results.push({ name, report: errorReport });
        this.saveTestReport(errorReport, name);
      }
    }
    
    const endTime = new Date();
    
    // Aggregate results into a comprehensive report
    const aggregateReport: TestReport = {
      serviceName: 'AllTests',
      passed: results.every(r => r.report.passed),
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      testGroups: [],
      error: null
    };
    
    // Create a test group for each service's results
    for (const { name, report } of results) {
      const group: TestGroup = {
        name,
        description: `Results from ${name} test service`,
        tests: report.testGroups.flatMap(g => g.tests),
        passed: report.passed
      };
      aggregateReport.testGroups.push(group);
    }
    
    this.saveTestReport(aggregateReport, 'aggregate');
    this.logTestResults(aggregateReport);
    
    return aggregateReport;
  }

  /**
   * Run a specific test service by name
   */
  async runTests(serviceName: string): Promise<TestReport> {
    const service = this.testServices.get(serviceName);
    
    if (!service) {
      const errorReport: TestReport = {
        serviceName,
        passed: false,
        startTime: new Date(),
        endTime: new Date(),
        testGroups: [],
        error: `Test service '${serviceName}' not found`
      };
      return errorReport;
    }
    
    console.log(`Running test service: ${serviceName}`);
    
    try {
      const report = await service.runTests();
      this.saveTestReport(report, serviceName);
      this.logTestResults(report);
      return report;
    } catch (error) {
      console.error(`Error running test service ${serviceName}:`, error);
      const errorReport: TestReport = {
        serviceName,
        passed: false,
        startTime: new Date(),
        endTime: new Date(),
        testGroups: [],
        error: `Error running test service: ${error instanceof Error ? error.message : String(error)}`
      };
      this.saveTestReport(errorReport, serviceName);
      return errorReport;
    }
  }

  /**
   * Save test report to file
   */
  private saveTestReport(report: TestReport, serviceName: string): void {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${serviceName.toLowerCase()}-${timestamp}.json`;
    const filePath = path.join(this.reportDirectory, filename);
    
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`Test report saved to ${filePath}`);
  }

  /**
   * Log test results to console
   */
  private logTestResults(report: TestReport): void {
    console.log('='.repeat(80));
    console.log(`Test Report for: ${report.serviceName}`);
    console.log(`Status: ${report.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`Start Time: ${report.startTime.toISOString()}`);
    console.log(`End Time: ${report.endTime.toISOString()}`);
    console.log(`Duration: ${report.duration || 'N/A'} ms`);
    
    if (report.error) {
      console.log(`\nError: ${report.error}`);
    }
    
    console.log('\nTest Groups:');
    for (const group of report.testGroups) {
      console.log(`  - ${group.name}: ${group.passed ? 'PASSED' : 'FAILED'}`);
      
      if (group.tests.length > 0) {
        const passedTests = group.tests.filter(t => t.passed).length;
        console.log(`    Tests: ${passedTests}/${group.tests.length} passed`);
      }
    }
    
    console.log('='.repeat(80));
  }
}

export const testCoordinator = new TestCoordinatorService();