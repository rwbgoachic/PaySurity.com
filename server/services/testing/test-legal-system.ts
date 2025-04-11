/**
 * Legal Practice Management System Test Script
 * 
 * This script runs comprehensive end-to-end tests for the Legal Practice Management System
 * and generates a detailed test report.
 */

import { TestReport } from './test-interfaces';
import { testCoordinator } from './test-coordinator';

// Import legal system test services
// Will be implemented separately
import { IoltaTestService } from './test-iolta-service';
import { ClientPortalTestService } from './test-client-portal';
import { LegalDocumentTestService } from './test-legal-document';
import { IoltaReconciliationTestService } from './test-iolta-reconciliation';

/**
 * Register all test services for the legal system
 */
function registerTestServices() {
  // IOLTA Trust Account tests
  testCoordinator.registerTestService('IOLTA', new IoltaTestService());
  
  // Client Portal tests
  testCoordinator.registerTestService('ClientPortal', new ClientPortalTestService());
  
  // Document Management tests
  testCoordinator.registerTestService('LegalDocuments', new LegalDocumentTestService());

  // IOLTA Reconciliation tests
  testCoordinator.registerTestService('IoltaReconciliation', new IoltaReconciliationTestService());
  
  // Additional legal system tests can be registered here
}

/**
 * Run all legal system tests
 */
export async function runLegalSystemTests(): Promise<TestReport> {
  console.log('Running comprehensive legal system tests...');
  
  // Register all test services
  registerTestServices();
  
  // Run all tests and generate a report
  const report: TestReport = await testCoordinator.runAllTests();
  
  console.log(`Legal system tests completed with status: ${report.passed ? 'PASSED' : 'FAILED'}`);
  
  return report;
}

/**
 * Run specific test service
 */
export async function runSpecificTest(serviceName: string): Promise<TestReport> {
  // First check if service exists
  const availableServices = testCoordinator.getRegisteredServices();
  
  if (!availableServices.includes(serviceName)) {
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
  
  console.log(`Running specific test: ${serviceName}`);
  
  // Ensure test services are registered
  if (availableServices.length === 0) {
    registerTestServices();
  }
  
  // Run specific test
  try {
    const report = await testCoordinator.runTests(serviceName);
    return report;
  } catch (error) {
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