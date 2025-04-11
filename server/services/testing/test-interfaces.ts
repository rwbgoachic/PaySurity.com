/**
 * Test Interface Definitions
 * 
 * These interfaces define the structure of test reports and test groups
 * for consistency across all testing modules.
 */

export interface TestResult {
  name: string;
  passed: boolean;
  result: string | null;
  expected: string;
}

export interface TestGroup {
  name: string;
  tests: TestResult[];
  passed: boolean;
}

export interface TestReport {
  name: string;
  timestamp: Date;
  passed: boolean;
  testGroups?: TestGroup[];
  error?: string;
}

export interface Issue {
  id: string;
  testName: string;
  testGroup: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixed: boolean;
  fixMethod?: string;
  fixDetails?: string;
  actual?: string;
}

export interface TestParams {
  [key: string]: any;
}