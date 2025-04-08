/**
 * Test Coordinator Service
 * 
 * This module coordinates all test suites and provides APIs for
 * running tests, aggregating results, and generating reports.
 * 
 * The test coordinator is the primary entry point for the testing framework
 * and coordinates all test suites across different subsystems of the PaySurity platform.
 */

import { deliveryTestService, TestReport, TestGroup, Test } from './test-delivery-service';
import { testReporter } from './test-reporter';
import * as path from 'path';
import * as fs from 'fs';
import { SystemTestService, systemTestService } from './test-system';
import { apiTestService } from './test-api';
import { performanceTestService } from './test-performance';

export class TestCoordinator {
  private testSuites: { [key: string]: any } = {
    delivery: deliveryTestService,
    system: systemTestService,
    api: apiTestService,
    performance: performanceTestService
  };
  
  /**
   * Run all test suites and generate a complete report
   */
  async runAllTests(): Promise<TestReport> {
    const mainReport: TestReport = {
      name: 'Comprehensive System Test',
      timestamp: new Date(),
      passed: true,
      testGroups: []
    };
    
    // Run all test suites
    for (const [name, suite] of Object.entries(this.testSuites)) {
      try {
        console.log(`Running test suite: ${name}`);
        const report = await suite.runComprehensiveTests();
        
        // Merge report into main report
        if (!report.passed) {
          mainReport.passed = false;
        }
        
        // Add test groups to main report
        mainReport.testGroups.push(...report.testGroups);
      } catch (error) {
        console.error(`Error running test suite ${name}:`, error);
        mainReport.passed = false;
        
        // Add error as a failed test group
        mainReport.testGroups.push({
          name: `${name} Test Suite Error`,
          tests: [
            {
              name: `${name} Test Suite Execution`,
              description: `Running the ${name} test suite`,
              passed: false,
              result: 'Error running test suite',
              expected: 'Successful test run',
              actual: `Error: ${(error as Error).message}`,
              error
            }
          ],
          passed: false
        });
      }
    }
    
    return mainReport;
  }
  
  /**
   * Run a specific test suite
   */
  async runTestSuite(suiteName: string): Promise<TestReport | null> {
    const suite = this.testSuites[suiteName.toLowerCase()];
    
    if (!suite) {
      console.error(`Test suite not found: ${suiteName}`);
      return null;
    }
    
    try {
      return await suite.runComprehensiveTests();
    } catch (error) {
      console.error(`Error running test suite ${suiteName}:`, error);
      
      // Create a failure report
      const failureReport: TestReport = {
        name: `${suiteName} Test Suite`,
        timestamp: new Date(),
        passed: false,
        testGroups: [
          {
            name: `${suiteName} Test Suite Error`,
            tests: [
              {
                name: `${suiteName} Test Suite Execution`,
                description: `Running the ${suiteName} test suite`,
                passed: false,
                result: 'Error running test suite',
                expected: 'Successful test run',
                actual: `Error: ${(error as Error).message}`,
                error
              }
            ],
            passed: false
          }
        ]
      };
      
      return failureReport;
    }
  }
  
  /**
   * Generate and save reports for test results
   */
  saveReports(report: TestReport, formats: ('console' | 'html' | 'json')[] = ['html', 'json']): string[] {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const basePath = path.join(process.cwd(), 'test-reports');
    const filePaths: string[] = [];
    
    for (const format of formats) {
      const fileName = `test-report-${timestamp}.${format === 'html' ? 'html' : format === 'json' ? 'json' : 'txt'}`;
      const filePath = path.join(basePath, fileName);
      
      try {
        testReporter.saveReport(report, format, filePath);
        filePaths.push(filePath);
        console.log(`Saved ${format} report to: ${filePath}`);
      } catch (error) {
        console.error(`Error saving ${format} report:`, error);
      }
    }
    
    return filePaths;
  }
  
  /**
   * Get a list of available test suites
   */
  getAvailableTestSuites(): string[] {
    return Object.keys(this.testSuites);
  }
  
  /**
   * Run a full test cycle, including running all tests, generating reports,
   * and returning the report to the caller
   */
  async runFullTestCycle(formats: ('console' | 'html' | 'json')[] = ['html', 'json']): Promise<{ 
    report: TestReport;
    reportPaths: string[];
    consoleOutput?: string;
  }> {
    // Run all tests
    const report = await this.runAllTests();
    
    // Save reports in requested formats
    const reportPaths = this.saveReports(report, formats);
    
    // Generate console output
    let consoleOutput: string | undefined;
    if (formats.includes('console')) {
      consoleOutput = testReporter.generateConsoleReport(report);
      console.log('\n' + consoleOutput);
    }
    
    return {
      report,
      reportPaths,
      consoleOutput
    };
  }
}

export const testCoordinator = new TestCoordinator();