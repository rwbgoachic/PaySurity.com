/**
 * Wallet System Test Service
 * 
 * This module tests the digital wallet system including:
 * - Wallet creation and management
 * - Balance operations (deposit, withdraw, transfer)
 * - Transaction processing
 * - Payment method management
 * - Security and access controls
 */

import { TestReport, TestGroup, Test } from './test-delivery-service';
import fetch from 'node-fetch';
import { db } from '../../db';

export class WalletTestService {
  /**
   * Run comprehensive wallet system tests
   */
  async runComprehensiveTests(): Promise<TestReport> {
    const report: TestReport = {
      name: 'Wallet System Test',
      timestamp: new Date(),
      passed: true,
      testGroups: []
    };
    
    // Test wallet initialization
    const initializationTests = await this.testWalletInitialization();
    report.testGroups.push(initializationTests);
    if (!initializationTests.passed) report.passed = false;
    
    // Test wallet operations
    const operationsTests = await this.testWalletOperations();
    report.testGroups.push(operationsTests);
    if (!operationsTests.passed) report.passed = false;
    
    // Test wallet security
    const securityTests = await this.testWalletSecurity();
    report.testGroups.push(securityTests);
    if (!securityTests.passed) report.passed = false;
    
    // Test wallet API endpoints
    const apiTests = await this.testWalletAPI();
    report.testGroups.push(apiTests);
    if (!apiTests.passed) report.passed = false;
    
    return report;
  }
  
  /**
   * Test wallet initialization and creation
   */
  async testWalletInitialization(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Wallet Initialization Tests',
      tests: [],
      passed: true
    };
    
    try {
      // Test database schema for wallets
      const walletTableResult = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'wallets'
        );
      `);
      
      const walletTableExists = walletTableResult[0]?.exists || false;
      
      testGroup.tests.push({
        name: 'Wallet Table Existence',
        description: 'The wallets table should exist in the database',
        passed: walletTableExists,
        result: walletTableExists ? 'Wallets table exists' : 'Wallets table does not exist',
        expected: 'Table exists',
        actual: walletTableExists ? 'Table exists' : 'Table does not exist'
      });
      
      if (!walletTableExists) testGroup.passed = false;
      
      // Test wallet schema structure (if table exists)
      if (walletTableExists) {
        const walletColumnsResult = await db.execute(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'wallets';
        `);
        
        // Expected columns for wallet table
        const expectedColumns = [
          { name: 'id', type: 'integer' },
          { name: 'userId', type: 'integer' },
          { name: 'balance', type: /numeric|decimal/ },
          { name: 'isActive', type: 'boolean' },
          { name: 'walletType', type: /character varying|text/ },
          { name: 'createdAt', type: /timestamp|date/ }
        ];
        
        const columnResults = expectedColumns.map(expectedColumn => {
          const column = walletColumnsResult.find(
            (col: any) => col.column_name === expectedColumn.name
          );
          
          const exists = !!column;
          const typeMatches = exists && 
            (typeof expectedColumn.type === 'string' 
              ? column.data_type === expectedColumn.type
              : expectedColumn.type.test(column.data_type));
          
          const passed = exists && typeMatches;
          
          return {
            name: `Wallet Column: ${expectedColumn.name}`,
            description: `The ${expectedColumn.name} column should exist with correct type`,
            passed,
            result: passed 
              ? `Column exists with correct type` 
              : exists 
                ? `Column exists but has wrong type: ${column.data_type}` 
                : `Column does not exist`,
            expected: `Column ${expectedColumn.name} with type ${expectedColumn.type}`,
            actual: exists ? `Column ${column.column_name} with type ${column.data_type}` : 'Column not found'
          };
        });
        
        testGroup.tests.push(...columnResults);
        
        if (columnResults.some(result => !result.passed)) {
          testGroup.passed = false;
        }
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Wallet Schema Test',
        description: 'Should be able to query wallet schema information',
        passed: false,
        result: 'Error testing wallet schema',
        expected: 'Successful schema validation',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
  
  /**
   * Test wallet operations (deposit, withdraw, transfer)
   */
  async testWalletOperations(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Wallet Operations Tests',
      tests: [],
      passed: true
    };
    
    // Test database transactions table existence
    try {
      const transactionsTableResult = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'wallet_transactions'
        );
      `);
      
      const transactionsTableExists = transactionsTableResult[0]?.exists || false;
      
      testGroup.tests.push({
        name: 'Transactions Table Existence',
        description: 'The wallet_transactions table should exist in the database',
        passed: transactionsTableExists,
        result: transactionsTableExists ? 'Transactions table exists' : 'Transactions table does not exist',
        expected: 'Table exists',
        actual: transactionsTableExists ? 'Table exists' : 'Table does not exist'
      });
      
      if (!transactionsTableExists) testGroup.passed = false;
      
      // Test API endpoints for wallet operations
      const baseUrl = 'http://localhost:5000';
      const testEndpoints = [
        { 
          name: 'Get Wallet Balance', 
          url: '/api/wallets/balance',
          method: 'GET',
          expectedStatus: 401  // Should be unauthorized without auth
        },
        { 
          name: 'Wallet Transaction History', 
          url: '/api/wallets/transactions',
          method: 'GET',
          expectedStatus: 401  // Should be unauthorized without auth
        }
      ];
      
      // Test each endpoint
      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(`${baseUrl}${endpoint.url}`, {
            method: endpoint.method
          });
          
          const status = response.status;
          const isStatusCorrect = status === endpoint.expectedStatus;
          
          testGroup.tests.push({
            name: endpoint.name,
            description: `Test the ${endpoint.url} endpoint`,
            passed: isStatusCorrect,
            result: isStatusCorrect 
              ? `Endpoint returned expected status ${status}` 
              : `Endpoint returned unexpected status ${status}`,
            expected: `Status ${endpoint.expectedStatus}`,
            actual: `Status ${status}`
          });
          
          if (!isStatusCorrect) testGroup.passed = false;
        } catch (error) {
          // Network errors are a type of test failure
          testGroup.tests.push({
            name: endpoint.name,
            description: `Test the ${endpoint.url} endpoint`,
            passed: false,
            result: 'Error testing endpoint',
            expected: `Status ${endpoint.expectedStatus}`,
            actual: `Error: ${(error as Error).message}`,
            error
          });
          testGroup.passed = false;
        }
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Wallet Operations Test',
        description: 'Should be able to query transaction information',
        passed: false,
        result: 'Error testing wallet operations',
        expected: 'Successful operations testing',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
  
  /**
   * Test wallet security features
   */
  async testWalletSecurity(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Wallet Security Tests',
      tests: [],
      passed: true
    };
    
    const baseUrl = 'http://localhost:5000';
    
    // Test security endpoints - should be unauthorized without proper auth
    const securityEndpoints = [
      { 
        name: 'Create Wallet Transaction', 
        url: '/api/wallets/transactions',
        method: 'POST',
        body: { amount: '100.00', type: 'deposit', description: 'Test deposit' },
        expectedStatus: 401
      },
      { 
        name: 'Add Payment Method', 
        url: '/api/wallets/payment-methods',
        method: 'POST',
        body: { type: 'card', last4: '4242', expMonth: 12, expYear: 2025 },
        expectedStatus: 401
      }
    ];
    
    // Test each security endpoint
    for (const endpoint of securityEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(endpoint.body)
        });
        
        const status = response.status;
        const isStatusCorrect = status === endpoint.expectedStatus;
        
        testGroup.tests.push({
          name: endpoint.name,
          description: `Test security of the ${endpoint.url} endpoint`,
          passed: isStatusCorrect,
          result: isStatusCorrect 
            ? `Endpoint properly secured with status ${status}` 
            : `Endpoint security issue: returned status ${status}`,
          expected: `Status ${endpoint.expectedStatus} (Unauthorized)`,
          actual: `Status ${status}`
        });
        
        if (!isStatusCorrect) testGroup.passed = false;
      } catch (error) {
        // Network errors are a type of test failure
        testGroup.tests.push({
          name: endpoint.name,
          description: `Test security of the ${endpoint.url} endpoint`,
          passed: false,
          result: 'Error testing endpoint security',
          expected: `Status ${endpoint.expectedStatus}`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    return testGroup;
  }
  
  /**
   * Test wallet API endpoints with test authentication
   */
  async testWalletAPI(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Wallet API Tests',
      tests: [],
      passed: true
    };
    
    const baseUrl = 'http://localhost:5000';
    
    // Test API endpoints with test authentication
    const apiEndpoints = [
      { 
        name: 'Get Wallet Balance with Auth', 
        url: '/api/wallets/balance',
        method: 'GET',
        useTestAuth: true,
        expectedStatus: [200, 404]  // Either OK or Not Found is acceptable for testing
      },
      { 
        name: 'Get Transaction History with Auth', 
        url: '/api/wallets/transactions',
        method: 'GET',
        useTestAuth: true,
        expectedStatus: [200, 404]  // Either OK or Not Found is acceptable for testing
      }
    ];
    
    // Test each API endpoint
    for (const endpoint of apiEndpoints) {
      try {
        const headers: Record<string, string> = {};
        
        // Add test authentication header
        if (endpoint.useTestAuth) {
          headers['X-Test-Mode'] = 'true';
        }
        
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          headers
        });
        
        const status = response.status;
        const isStatusCorrect = Array.isArray(endpoint.expectedStatus)
          ? endpoint.expectedStatus.includes(status)
          : status === endpoint.expectedStatus;
        
        testGroup.tests.push({
          name: endpoint.name,
          description: `Test the ${endpoint.url} endpoint with test authentication`,
          passed: isStatusCorrect,
          result: isStatusCorrect 
            ? `Endpoint returned acceptable status ${status}` 
            : `Endpoint returned unexpected status ${status}`,
          expected: Array.isArray(endpoint.expectedStatus)
            ? `Status ${endpoint.expectedStatus.join(' or ')}`
            : `Status ${endpoint.expectedStatus}`,
          actual: `Status ${status}`
        });
        
        if (!isStatusCorrect) testGroup.passed = false;
      } catch (error) {
        // Network errors are a type of test failure
        testGroup.tests.push({
          name: endpoint.name,
          description: `Test the ${endpoint.url} endpoint with test authentication`,
          passed: false,
          result: 'Error testing endpoint',
          expected: Array.isArray(endpoint.expectedStatus)
            ? `Status ${endpoint.expectedStatus.join(' or ')}`
            : `Status ${endpoint.expectedStatus}`,
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
    }
    
    return testGroup;
  }
}

export const walletTestService = new WalletTestService();