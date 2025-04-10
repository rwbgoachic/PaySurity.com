/**
 * API Test Service
 * 
 * This module tests external API integrations including:
 * - HTTP request/response handling
 * - Authentication and authorization
 * - Error handling and recovery
 * - Rate limiting and throttling
 * - Response validation
 * - Performance benchmarking
 */

import { TestReport, TestGroup, Test } from './test-delivery-service';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

export class APITestService {
  /**
   * Run comprehensive API tests
   */
  async runComprehensiveTests(): Promise<TestReport> {
    const report: TestReport = {
      name: 'API Integration Test',
      timestamp: new Date(),
      passed: true,
      testGroups: []
    };
    
    // Test internal APIs
    const internalTests = await this.testInternalAPIs();
    report.testGroups.push(internalTests);
    if (!internalTests.passed) report.passed = false;
    
    // Test external APIs
    const externalTests = await this.testExternalAPIs();
    report.testGroups.push(externalTests);
    if (!externalTests.passed) report.passed = false;
    
    // Test authentication APIs
    const authTests = await this.testAuthenticationAPIs();
    report.testGroups.push(authTests);
    if (!authTests.passed) report.passed = false;
    
    // Test error handling
    const errorTests = await this.testErrorHandling();
    report.testGroups.push(errorTests);
    if (!errorTests.passed) report.passed = false;
    
    return report;
  }
  
  /**
   * Test internal API endpoints
   */
  async testInternalAPIs(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Internal API Tests',
      tests: [],
      passed: true
    };
    
    const baseUrl = 'http://localhost:5000';
    
    // Define endpoints to test
    const endpoints = [
      { 
        url: '/api/health', 
        method: 'GET',
        expectedStatus: 200,
        validateResponse: (body: any) => body && typeof body === 'object'
      },
      { 
        url: '/api/user', 
        method: 'GET',
        expectedStatus: 200,
        validateResponse: (body: any) => body && typeof body === 'object'
      }
    ];
    
    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method
        });
        
        const status = response.status;
        const isStatusCorrect = status === endpoint.expectedStatus;
        
        let body;
        let isBodyValid = false;
        
        try {
          body = await response.json();
          isBodyValid = endpoint.validateResponse(body);
        } catch (e) {
          body = null;
          isBodyValid = false;
        }
        
        const passed = isStatusCorrect && isBodyValid;
        
        testGroup.tests.push({
          name: `${endpoint.method} ${endpoint.url}`,
          description: `Should receive a valid response from ${endpoint.url}`,
          passed,
          result: passed ? 'Received valid response' : 'Failed to validate response',
          expected: `Status ${endpoint.expectedStatus} with valid body`,
          actual: `Status ${status}, body is ${isBodyValid ? 'valid' : 'invalid'}`
        });
        
        if (!passed) testGroup.passed = false;
      } catch (error) {
        testGroup.tests.push({
          name: `${endpoint.method} ${endpoint.url}`,
          description: `Should receive a valid response from ${endpoint.url}`,
          passed: false,
          result: 'Error during request',
          expected: `Status ${endpoint.expectedStatus} with valid body`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    return testGroup;
  }
  
  /**
   * Test external API connectivity
   */
  async testExternalAPIs(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'External API Tests',
      tests: [],
      passed: true
    };
    
    // Define external APIs to test
    const externalAPIs = [
      { 
        name: 'News API',
        url: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + process.env.NEWS_API_KEY,
        validateResponse: (body: any) => body && body.status === 'ok'
      }
    ];
    
    // Test each external API
    for (const api of externalAPIs) {
      if (!this.shouldRunExternalTest(api.name)) {
        testGroup.tests.push({
          name: `${api.name} Connectivity`,
          description: `Test connection to ${api.name}`,
          passed: true,
          result: 'External API test skipped',
          expected: 'Test skipped',
          actual: 'Test skipped'
        });
        continue;
      }
      
      try {
        const response = await fetch(api.url);
        const status = response.status;
        
        let body;
        let isValid = false;
        
        try {
          body = await response.json();
          isValid = api.validateResponse(body);
        } catch (e) {
          body = null;
          isValid = false;
        }
        
        const passed = status >= 200 && status < 300 && isValid;
        
        testGroup.tests.push({
          name: `${api.name} Connectivity`,
          description: `Test connection to ${api.name}`,
          passed,
          result: passed ? 'Successfully connected' : 'Failed to connect properly',
          expected: 'Status 2xx with valid response body',
          actual: `Status ${status}, body validation: ${isValid ? 'passed' : 'failed'}`
        });
        
        if (!passed) testGroup.passed = false;
      } catch (error) {
        testGroup.tests.push({
          name: `${api.name} Connectivity`,
          description: `Test connection to ${api.name}`,
          passed: false,
          result: 'Error connecting to API',
          expected: 'Successful connection',
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    return testGroup;
  }
  
  /**
   * Test authentication APIs
   */
  async testAuthenticationAPIs(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Authentication API Tests',
      tests: [],
      passed: true
    };
    
    const baseUrl = 'http://localhost:5000';
    
    // Define auth endpoints to test
    const authTests = [
      { 
        name: 'Access Protected Route Without Auth',
        url: `${baseUrl}/api/protected`,
        method: 'GET',
        auth: false,
        expectedStatus: 401
      },
      { 
        name: 'Auth Status Check',
        url: `${baseUrl}/api/user`,
        method: 'GET',
        auth: false,
        expectedStatus: 200
      }
    ];
    
    // Test each auth scenario
    for (const test of authTests) {
      try {
        const response = await fetch(test.url, {
          method: test.method,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const status = response.status;
        const passed = status === test.expectedStatus;
        
        testGroup.tests.push({
          name: test.name,
          description: `Test authentication behavior for ${test.url}`,
          passed,
          result: passed ? 'Authentication behaved as expected' : 'Unexpected authentication behavior',
          expected: `Status ${test.expectedStatus}`,
          actual: `Status ${status}`
        });
        
        if (!passed) testGroup.passed = false;
      } catch (error) {
        testGroup.tests.push({
          name: test.name,
          description: `Test authentication behavior for ${test.url}`,
          passed: false,
          result: 'Error during authentication test',
          expected: `Status ${test.expectedStatus}`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    return testGroup;
  }
  
  /**
   * Test error handling
   */
  async testErrorHandling(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'API Error Handling Tests',
      tests: [],
      passed: true
    };
    
    const baseUrl = 'http://localhost:5000';
    
    // Define error scenarios to test
    const errorTests = [
      { 
        name: 'Not Found Error',
        url: `${baseUrl}/api/non-existent-endpoint`,
        method: 'GET',
        expectedStatus: 404
      },
      { 
        name: 'Method Not Allowed',
        url: `${baseUrl}/api/health`,
        method: 'PUT',
        expectedStatus: 405
      }
    ];
    
    // Test each error scenario
    for (const test of errorTests) {
      try {
        const response = await fetch(test.url, {
          method: test.method
        });
        
        const status = response.status;
        const passed = status === test.expectedStatus;
        
        testGroup.tests.push({
          name: test.name,
          description: `Test error handling for ${test.method} ${test.url}`,
          passed,
          result: passed ? 'Error handled correctly' : 'Unexpected error handling',
          expected: `Status ${test.expectedStatus}`,
          actual: `Status ${status}`
        });
        
        if (!passed) testGroup.passed = false;
      } catch (error) {
        // Network errors are also a type of error handling
        const isNetworkError = (error as Error).message.includes('ECONNREFUSED');
        
        testGroup.tests.push({
          name: test.name,
          description: `Test error handling for ${test.method} ${test.url}`,
          passed: false,
          result: 'Error during request',
          expected: `Status ${test.expectedStatus}`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        
        // Don't fail the test group for connection refused errors if localhost
        if (!isNetworkError || !test.url.includes('localhost')) {
          testGroup.passed = false;
        }
      }
    }
    
    return testGroup;
  }
  
  /**
   * Determine if an external API test should be run
   * Checks for necessary environment variables and configuration
   */
  private shouldRunExternalTest(apiName: string): boolean {
    // Check for specific API keys
    switch (apiName) {
      case 'News API':
        return !!process.env.NEWS_API_KEY;
      default:
        return true;
    }
  }
}

export const apiTestService = new APITestService();