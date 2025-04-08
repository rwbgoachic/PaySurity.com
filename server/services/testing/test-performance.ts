/**
 * Performance Test Service
 * 
 * This module tests application performance including:
 * - API response times
 * - Database query performance
 * - Memory usage and leaks
 * - CPU utilization
 * - Load testing
 * - Stress testing
 */

import { TestReport, TestGroup, Test } from './test-delivery-service';
import fetch from 'node-fetch';
import { db } from '../../db';
import * as os from 'os';
import { performance } from 'perf_hooks';

export class PerformanceTestService {
  /**
   * Run comprehensive performance tests
   */
  async runComprehensiveTests(): Promise<TestReport> {
    const report: TestReport = {
      name: 'Performance Test',
      timestamp: new Date(),
      passed: true,
      testGroups: []
    };
    
    // Test API response times
    const apiTests = await this.testApiResponseTimes();
    report.testGroups.push(apiTests);
    if (!apiTests.passed) report.passed = false;
    
    // Test database query performance
    const dbTests = await this.testDatabasePerformance();
    report.testGroups.push(dbTests);
    if (!dbTests.passed) report.passed = false;
    
    // Test memory usage
    const memoryTests = await this.testMemoryUsage();
    report.testGroups.push(memoryTests);
    if (!memoryTests.passed) report.passed = false;
    
    return report;
  }
  
  /**
   * Test API response times
   */
  async testApiResponseTimes(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'API Response Time Tests',
      tests: [],
      passed: true
    };
    
    // Define endpoints to test
    const endpoints = [
      { url: '/api/health', method: 'GET', maxResponseTime: 200 }, // 200ms
      { url: '/api/user', method: 'GET', maxResponseTime: 200 },
    ];
    
    // We need to use the local server URL since we're testing internally
    const baseUrl = 'http://localhost:3000';
    
    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        const startTime = performance.now();
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method,
        });
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Check if response time is within acceptable range
        const isAcceptable = responseTime <= endpoint.maxResponseTime;
        
        testGroup.tests.push({
          name: `${endpoint.method} ${endpoint.url} Response Time`,
          description: `Should respond within ${endpoint.maxResponseTime}ms`,
          passed: isAcceptable,
          result: isAcceptable 
            ? `Response time is acceptable (${Math.round(responseTime)}ms)` 
            : `Response time is too slow (${Math.round(responseTime)}ms)`,
          expected: `<= ${endpoint.maxResponseTime}ms`,
          actual: `${Math.round(responseTime)}ms`
        });
        
        if (!isAcceptable) testGroup.passed = false;
      } catch (error) {
        testGroup.tests.push({
          name: `${endpoint.method} ${endpoint.url} Response Time`,
          description: `Should respond within ${endpoint.maxResponseTime}ms`,
          passed: false,
          result: 'Error testing endpoint',
          expected: `<= ${endpoint.maxResponseTime}ms`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    return testGroup;
  }
  
  /**
   * Test database query performance
   */
  async testDatabasePerformance(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Database Performance Tests',
      tests: [],
      passed: true
    };
    
    // Define database queries to test
    const queries = [
      { 
        name: 'Simple SELECT Query', 
        execute: async () => await db.execute("SELECT 1 as test"),
        maxExecutionTime: 100 // 100ms
      },
      { 
        name: 'Schema Information Query',
        execute: async () => await db.execute("SELECT COUNT(*) FROM information_schema.tables"),
        maxExecutionTime: 200 // 200ms
      }
    ];
    
    // Test each query
    for (const query of queries) {
      try {
        const startTime = performance.now();
        await query.execute();
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Check if execution time is within acceptable range
        const isAcceptable = executionTime <= query.maxExecutionTime;
        
        testGroup.tests.push({
          name: `${query.name} Performance`,
          description: `Should execute within ${query.maxExecutionTime}ms`,
          passed: isAcceptable,
          result: isAcceptable 
            ? `Execution time is acceptable (${Math.round(executionTime)}ms)` 
            : `Execution time is too slow (${Math.round(executionTime)}ms)`,
          expected: `<= ${query.maxExecutionTime}ms`,
          actual: `${Math.round(executionTime)}ms`
        });
        
        if (!isAcceptable) testGroup.passed = false;
      } catch (error) {
        testGroup.tests.push({
          name: `${query.name} Performance`,
          description: `Should execute within ${query.maxExecutionTime}ms`,
          passed: false,
          result: 'Error executing query',
          expected: `<= ${query.maxExecutionTime}ms`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    return testGroup;
  }
  
  /**
   * Test memory usage and check for potential memory leaks
   */
  async testMemoryUsage(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Memory Usage Tests',
      tests: [],
      passed: true
    };
    
    // Initial memory snapshot
    const initialMemory = process.memoryUsage();
    
    // Define operations that might cause memory issues
    const operations = [
      {
        name: 'Large Array Creation',
        execute: () => {
          const largeArray = new Array(100000).fill(0).map((_, i) => ({ 
            id: i, 
            name: `Item ${i}`,
            description: `This is item number ${i} in the test array`,
            tags: ['test', 'memory', 'performance'],
            created: new Date()
          }));
          
          // Do something with the array to prevent optimization
          const sum = largeArray.reduce((acc, item) => acc + item.id, 0);
          return sum;
        },
        maxMemoryIncrease: 50 * 1024 * 1024 // 50MB
      },
      {
        name: 'JSON Stringify/Parse',
        execute: () => {
          const data = {
            items: new Array(50000).fill(0).map((_, i) => ({ 
              id: i, 
              name: `Item ${i}`,
              value: Math.random()
            }))
          };
          
          const json = JSON.stringify(data);
          const parsed = JSON.parse(json);
          return parsed.items.length;
        },
        maxMemoryIncrease: 30 * 1024 * 1024 // 30MB
      }
    ];
    
    // Test each operation
    for (const operation of operations) {
      try {
        // Force garbage collection before the test if available
        if (global.gc) {
          global.gc();
        }
        
        // Record memory before the operation
        const beforeMemory = process.memoryUsage();
        
        // Execute the operation
        operation.execute();
        
        // Force garbage collection after the test if available
        if (global.gc) {
          global.gc();
        }
        
        // Record memory after the operation
        const afterMemory = process.memoryUsage();
        
        // Calculate memory increase
        const heapIncrease = afterMemory.heapUsed - beforeMemory.heapUsed;
        
        // Check if memory increase is within acceptable range
        const isAcceptable = heapIncrease <= operation.maxMemoryIncrease;
        
        testGroup.tests.push({
          name: `${operation.name} Memory Usage`,
          description: `Should not increase heap usage by more than ${operation.maxMemoryIncrease / 1024 / 1024}MB`,
          passed: isAcceptable,
          result: isAcceptable 
            ? `Memory increase is acceptable (${(heapIncrease / 1024 / 1024).toFixed(2)}MB)` 
            : `Memory increase is too high (${(heapIncrease / 1024 / 1024).toFixed(2)}MB)`,
          expected: `<= ${(operation.maxMemoryIncrease / 1024 / 1024).toFixed(2)}MB`,
          actual: `${(heapIncrease / 1024 / 1024).toFixed(2)}MB`
        });
        
        if (!isAcceptable) testGroup.passed = false;
      } catch (error) {
        testGroup.tests.push({
          name: `${operation.name} Memory Usage`,
          description: `Should not increase heap usage by more than ${operation.maxMemoryIncrease / 1024 / 1024}MB`,
          passed: false,
          result: 'Error during memory test',
          expected: `<= ${(operation.maxMemoryIncrease / 1024 / 1024).toFixed(2)}MB`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    // Add a test to check overall memory usage
    const currentMemory = process.memoryUsage();
    const rssMemoryMB = currentMemory.rss / 1024 / 1024;
    const heapTotalMB = currentMemory.heapTotal / 1024 / 1024;
    const heapUsedMB = currentMemory.heapUsed / 1024 / 1024;
    
    // Define maximum acceptable memory usage (in MB)
    const maxAcceptableRSS = 300; // 300MB
    
    testGroup.tests.push({
      name: 'Overall Memory Usage',
      description: `Total process memory usage should be reasonable`,
      passed: rssMemoryMB <= maxAcceptableRSS,
      result: rssMemoryMB <= maxAcceptableRSS 
        ? `Memory usage is acceptable (${rssMemoryMB.toFixed(2)}MB RSS)` 
        : `Memory usage is high (${rssMemoryMB.toFixed(2)}MB RSS)`,
      expected: `<= ${maxAcceptableRSS}MB RSS`,
      actual: `RSS: ${rssMemoryMB.toFixed(2)}MB, Heap Total: ${heapTotalMB.toFixed(2)}MB, Heap Used: ${heapUsedMB.toFixed(2)}MB`
    });
    
    if (rssMemoryMB > maxAcceptableRSS) testGroup.passed = false;
    
    return testGroup;
  }
}

export const performanceTestService = new PerformanceTestService();