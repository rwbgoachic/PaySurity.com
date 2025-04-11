/**
 * Test Interfaces Module
 * 
 * This module defines the interfaces and types used for testing across the system.
 * These interfaces provide a consistent structure for test services, reports, and results.
 */

/**
 * TestResult represents the outcome of a single test
 */
export interface TestResult {
  name: string;
  description: string;
  passed: boolean;
  error: string | null;
  expected?: any;
  actual?: any;
}

/**
 * TestGroup represents a logical grouping of related tests
 */
export interface TestGroup {
  name: string;
  description: string;
  tests: TestResult[];
  passed: boolean;
}

/**
 * TestReport represents the outcome of a suite of tests
 */
export interface TestReport {
  serviceName: string;
  passed: boolean;
  startTime: Date;
  endTime: Date;
  duration?: number;
  testGroups: TestGroup[];
  error: string | null;
}

/**
 * TestService interface that all test service implementations must follow
 */
export interface TestService {
  /**
   * Run all tests managed by this service
   */
  runTests(): Promise<TestReport>;
  
  /**
   * Create a deliberate test failure (for testing the test framework)
   */
  createDeliberateTestFailure(): Promise<TestReport>;
}