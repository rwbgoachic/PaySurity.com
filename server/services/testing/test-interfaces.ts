/**
 * Test Interfaces
 * 
 * This file defines the interfaces used by the testing framework
 * to ensure consistent test reporting and coordination.
 */

/**
 * Represents the result of an individual test
 */
export interface TestResult {
  name: string;
  description?: string;
  passed: boolean;
  error: string | null;
  expected?: any;
  actual?: any;
}

/**
 * Represents a group of related tests
 */
export interface TestGroup {
  name: string;
  description?: string;
  tests: TestResult[];
  passed: boolean;
}

/**
 * Represents a comprehensive test report
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
 * Interface that all test services must implement
 */
export interface TestService {
  /**
   * Run all tests provided by this service
   */
  runTests(): Promise<TestReport>;
  
  /**
   * Create a deliberate test failure (used for testing the test infrastructure)
   */
  createDeliberateTestFailure(): Promise<TestReport>;
}