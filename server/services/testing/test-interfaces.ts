/**
 * Interface definitions for PaySurity.com test services
 */

export interface TestCase {
  name: string;
  description: string;
  passed: boolean;
  duration: number;
  error?: string;
  metadata?: any;
}

export interface TestGroup {
  name: string;
  description?: string;
  tests: TestCase[];
  passRate: number;
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface TestReport {
  testGroup: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  tests: TestCase[];
  testsPassed: number;
  testsFailed: number;
  passRate: number;
  metadata?: any;
  testGroups?: TestGroup[];
}

export interface ApiEndpointTest {
  name: string;
  endpoint: string;
  method: string;
  body?: any;
  headers?: any;
  auth?: boolean;
  expectedStatus: number[];
  expectedResponse?: any;
  validator?: (response: any) => boolean;
}

export interface DatabaseTest {
  name: string;
  description: string;
  query: string;
  expectedRows?: number;
  validator?: (result: any) => boolean;
}

export interface PerformanceTest {
  name: string;
  description: string;
  maxDuration: number; // milliseconds
  test: () => Promise<any>;
}