/**
 * PaySurity.com Test Coordinator Service
 * 
 * This service coordinates the execution of all test suites across the platform.
 * It aggregates results and provides a comprehensive test report.
 */

import { TestReport } from './test-interfaces';
import { legalReportingSystemTestService } from './test-legal-reporting';
import { testLegalIoltaSystem } from './test-legal-iolta';

class TestCoordinatorService {
  /**
   * Run all test suites across the platform
   */
  async runAllTests(): Promise<TestReport> {
    console.log("Starting comprehensive test suite...");
    const startTime = Date.now();
    
    // Master test report
    const report: TestReport = {
      testGroup: "PaySurity.com Master Test Suite",
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      tests: [],
      testsPassed: 0,
      testsFailed: 0,
      passRate: 0,
      testGroups: []
    };
    
    try {
      // Run Legal Reporting System Tests
      console.log("Running Legal Reporting System Tests...");
      const legalReportingReport = await legalReportingSystemTestService.runComprehensiveTests();
      report.testGroups.push({
        name: "Legal Reporting System",
        description: "Tests for legal practice management reporting features",
        tests: legalReportingReport.tests,
        passRate: legalReportingReport.passRate,
        startTime: legalReportingReport.startTime,
        endTime: legalReportingReport.endTime,
        duration: legalReportingReport.duration
      });
      
      // Run Legal IOLTA System Tests
      console.log("Running Legal IOLTA System Tests...");
      const legalIoltaReport = await testLegalIoltaSystem();
      report.testGroups.push({
        name: "Legal IOLTA Trust Accounting System",
        description: "Tests for IOLTA trust accounting features",
        tests: legalIoltaReport.tests,
        passRate: legalIoltaReport.passRate,
        startTime: legalIoltaReport.startTime,
        endTime: legalIoltaReport.endTime,
        duration: legalIoltaReport.duration
      });
      
      // Add more test suites here as they are developed
      // e.g. Wallet System, Affiliate System, POS Systems, etc.
      
      // Calculate overall statistics
      let totalTests = 0;
      let totalPassedTests = 0;
      
      report.testGroups.forEach(group => {
        totalTests += group.tests.length;
        totalPassedTests += group.tests.filter(t => t.passed).length;
      });
      
      report.testsPassed = totalPassedTests;
      report.testsFailed = totalTests - totalPassedTests;
      report.passRate = totalTests > 0 ? totalPassedTests / totalTests : 0;
      
      // Add a summary test at the master level
      report.tests.push({
        name: "Master Test Suite Summary",
        description: `Overall system health check with ${totalTests} tests across ${report.testGroups.length} test groups`,
        passed: report.passRate >= 0.95, // Consider passing if 95% or more tests pass
        duration: Date.now() - startTime
      });
      
      // Update the overall test counts
      report.testsPassed = report.tests.filter(t => t.passed).length;
      report.testsFailed = report.tests.filter(t => !t.passed).length;
      
      // Set end time and duration
      report.endTime = new Date();
      report.duration = Date.now() - startTime;
      
      console.log(`Comprehensive test suite complete in ${report.duration}ms`);
      console.log(`Overall pass rate: ${(report.passRate * 100).toFixed(2)}%`);
      
      return report;
    } catch (error) {
      console.error("Error running comprehensive test suite:", error);
      
      // Add error to master report
      report.tests.push({
        name: "Master Test Suite Execution",
        description: "Error executing test coordinator",
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      // Update stats
      report.testsPassed = report.tests.filter(t => t.passed).length;
      report.testsFailed = report.tests.filter(t => !t.passed).length;
      report.passRate = report.testsPassed / report.tests.length;
      
      // Set end time and duration
      report.endTime = new Date();
      report.duration = Date.now() - startTime;
      
      return report;
    }
  }
  
  /**
   * Run a specific test suite by name
   */
  async runTestSuite(suiteName: string): Promise<TestReport> {
    console.log(`Starting ${suiteName} test suite...`);
    const startTime = Date.now();
    
    try {
      switch (suiteName.toLowerCase()) {
        case 'legal-reporting':
          return await legalReportingSystemTestService.runComprehensiveTests();
        
        case 'legal-iolta':
        case 'iolta':
        case 'trust-accounting':
          return await testLegalIoltaSystem();
          
        // Add more test suites here as they are developed
        
        default:
          throw new Error(`Unknown test suite: ${suiteName}`);
      }
    } catch (error) {
      console.error(`Error running ${suiteName} test suite:`, error);
      
      // Create an error report
      const errorReport: TestReport = {
        testGroup: suiteName,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: Date.now() - startTime,
        tests: [{
          name: `${suiteName} Test Suite Execution`,
          description: `Error executing ${suiteName} test suite`,
          passed: false,
          error: error.message,
          duration: Date.now() - startTime
        }],
        testsPassed: 0,
        testsFailed: 1,
        passRate: 0
      };
      
      return errorReport;
    }
  }
}

export const testCoordinator = new TestCoordinatorService();