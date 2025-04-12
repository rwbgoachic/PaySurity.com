/**
 * Test Coordinator Service
 * 
 * This service coordinates the execution of tests across the system
 * and provides centralized reporting functionality.
 */

import { TestService, TestReport, TestGroup, TestResult } from './test-interfaces';

/**
 * TestCoordinatorService manages test registration, execution, and reporting
 */
export class TestCoordinatorService {
  // Map of registered test services
  private testServices: Map<string, TestService> = new Map();
  
  /**
   * Register a test service
   */
  registerTestService(name: string, service: TestService): void {
    this.testServices.set(name, service);
  }
  
  /**
   * Get list of registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.testServices.keys());
  }
  
  /**
   * Run a specific test by name
   */
  async runTests(serviceName: string): Promise<TestReport> {
    console.log(`Running test service: ${serviceName}`);
    
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
    
    try {
      const startTime = new Date();
      const report = await service.runTests();
      const endTime = new Date();
      
      // Calculate duration in milliseconds
      const duration = endTime.getTime() - startTime.getTime();
      
      // Update report with accurate timing if not set by the service
      if (!report.duration) {
        report.duration = duration;
      }
      
      if (!report.startTime) {
        report.startTime = startTime;
      }
      
      if (!report.endTime) {
        report.endTime = endTime;
      }
      
      // Log summary
      this.logTestSummary(report);
      
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
      return errorReport;
    }
  }
  
  /**
   * Alias for runTests to maintain backwards compatibility
   */
  async runTestSuite(serviceName: string): Promise<TestReport> {
    return this.runTests(serviceName);
  }
  
  /**
   * Run all registered tests
   */
  async runAllTests(): Promise<TestReport> {
    console.log('Running all test services...');
    
    const allTestGroups: TestGroup[] = [];
    let allPassed = true;
    const startTime = new Date();
    let error: string | null = null;
    
    // Get all service names
    const serviceNames = this.getRegisteredServices();
    
    if (serviceNames.length === 0) {
      const errorReport: TestReport = {
        serviceName: 'AllTests',
        passed: false,
        startTime,
        endTime: new Date(),
        testGroups: [],
        error: 'No test services registered'
      };
      return errorReport;
    }
    
    // Run each service
    for (const name of serviceNames) {
      try {
        const report = await this.runTests(name);
        
        // Add all test groups to the overall report
        allTestGroups.push(...report.testGroups);
        
        // If any test fails, the overall result is failed
        if (!report.passed) {
          allPassed = false;
          
          // Capture error message if present and we don't have one yet
          if (report.error && !error) {
            error = `Error in ${name}: ${report.error}`;
          }
        }
      } catch (e) {
        allPassed = false;
        const errorMessage = e instanceof Error ? e.message : String(e);
        error = `Error running ${name}: ${errorMessage}`;
        console.error(error);
      }
    }
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // Create the overall report
    const combinedReport: TestReport = {
      serviceName: 'AllTests',
      passed: allPassed,
      startTime,
      endTime,
      duration,
      testGroups: allTestGroups,
      error
    };
    
    // Log overall summary
    this.logTestSummary(combinedReport);
    
    return combinedReport;
  }
  
  /**
   * Log a summary of the test report
   */
  private logTestSummary(report: TestReport): void {
    // Count total tests, passed, and failed
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    for (const group of report.testGroups) {
      totalTests += group.tests.length;
      for (const test of group.tests) {
        if (test.passed) {
          passedTests++;
        } else {
          failedTests++;
        }
      }
    }
    
    // Log the summary
    console.log('\n----- TEST SUMMARY -----');
    console.log(`Service: ${report.serviceName}`);
    console.log(`Status: ${report.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`Duration: ${report.duration || 'unknown'} ms`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    
    // Log error if any
    if (report.error) {
      console.log(`Error: ${report.error}`);
    }
    
    // Log failed tests
    if (failedTests > 0) {
      console.log('\n----- FAILED TESTS -----');
      for (const group of report.testGroups) {
        for (const test of group.tests) {
          if (!test.passed) {
            console.log(`- [${group.name}] ${test.name}: ${test.error}`);
          }
        }
      }
    }
    
    console.log('-----------------------\n');
  }
}

// Create and export a global test coordinator instance
export const testCoordinator = new TestCoordinatorService();