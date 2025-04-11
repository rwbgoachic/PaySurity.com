/**
 * Testing Framework Interfaces
 * 
 * This file defines the interfaces and types used throughout the testing system
 * for the Legal Practice Management System.
 */

/**
 * Test Result Interface
 * Represents the result of a single test case
 */
export interface TestResult {
  name: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string | null;
  error: string | null;
}

/**
 * Test Group Interface
 * Represents a group of related tests
 */
export interface TestGroup {
  name: string;
  tests: TestResult[];
}

/**
 * Test Report Interface
 * Represents a comprehensive report of test results
 */
export interface TestReport {
  serviceName: string;
  testGroups: TestGroup[];
  startTime: Date;
  endTime: Date;
  duration: number;
  passRate: number;
  testsPassed: number;
  testsFailed: number;
  tests: TestResult[];
}

/**
 * Test Service Interface
 * All test services must implement this interface
 */
export interface TestService {
  runTests(): Promise<TestReport>;
}

/**
 * Test Coordinator Interface
 * For services that coordinate multiple test services
 */
export interface TestCoordinator {
  addTestService(service: TestService): void;
  runAllTests(): Promise<TestReport>;
}

/**
 * Create a failed test result with the provided error
 */
export function createFailedTestResult(
  name: string,
  description: string,
  expected: string,
  error: string
): TestResult {
  return {
    name,
    description,
    passed: false,
    expected,
    actual: null,
    error
  };
}

/**
 * Create a passed test result
 */
export function createPassedTestResult(
  name: string,
  description: string,
  expected: string,
  actual: string
): TestResult {
  return {
    name,
    description,
    passed: true,
    expected,
    actual,
    error: null
  };
}

/**
 * Create an empty test report template
 */
export function createEmptyTestReport(serviceName: string): TestReport {
  return {
    serviceName,
    testGroups: [],
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    passRate: 0,
    testsPassed: 0,
    testsFailed: 0,
    tests: []
  };
}