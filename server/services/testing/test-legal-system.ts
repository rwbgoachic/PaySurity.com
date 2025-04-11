/**
 * Legal System Testing Coordinator
 * 
 * This module coordinates testing for all legal system components including
 * IOLTA trust accounts, reconciliation, document management, and client portal.
 */

import { TestService } from './test-interfaces';
import { testCoordinator } from './test-coordinator';
import { ioltaTestService } from './test-iolta-service';
import { ioltaReconciliationTestService } from './test-iolta-reconciliation';
import { ClientPortalTestService } from './test-client-portal';

// Create an instance of ClientPortalTestService
const clientPortalTestService = new ClientPortalTestService();

/**
 * Initialize legal system tests by registering test services with the test coordinator
 */
export function initializeLegalSystemTests(): void {
  // Register IOLTA-related test services
  testCoordinator.registerTestService('iolta-service', ioltaTestService);
  testCoordinator.registerTestService('iolta-reconciliation', ioltaReconciliationTestService);
  
  // Register client portal test service
  testCoordinator.registerTestService('client-portal', clientPortalTestService);
  
  // Additional legal system test services will be registered here as they are implemented
  // For example:
  // testCoordinator.registerTestService('document-management', documentManagementTestService);
  // testCoordinator.registerTestService('time-billing', timeBillingTestService);
}

/**
 * Run all legal system tests
 * This function initializes and runs all registered legal system test services
 */
export async function runLegalSystemTests() {
  // First, ensure the legal system tests are registered
  initializeLegalSystemTests();
  
  // Run tests for each service individually and return an array of reports
  const serviceNames = ['iolta-service', 'iolta-reconciliation', 'client-portal'];
  const reports = [];
  
  for (const name of serviceNames) {
    const report = await testCoordinator.runTests(name);
    reports.push(report);
  }
  
  return reports;
}

/**
 * Run a specific legal system test service by name
 */
export async function runLegalSystemTest(serviceName: string) {
  // First, ensure the legal system tests are registered
  initializeLegalSystemTests();
  
  // Run the specified test service
  return await testCoordinator.runTests(serviceName);
}