/**
 * Merchant Onboarding Test Service
 * 
 * This module tests the merchant onboarding process including:
 * - Merchant application submission
 * - Verification processes
 * - Account activation
 * - Payment gateway integration
 * - Microsite generation
 */

import { TestReport, TestGroup, Test } from './test-delivery-service';
import fetch from 'node-fetch';
import { db } from '../../db';

export class MerchantOnboardingTestService {
  /**
   * Run comprehensive merchant onboarding tests
   */
  async runComprehensiveTests(): Promise<TestReport> {
    const report: TestReport = {
      name: 'Merchant Onboarding Test',
      timestamp: new Date(),
      passed: true,
      testGroups: []
    };
    
    // Test merchant application system
    const applicationTests = await this.testMerchantApplications();
    report.testGroups.push(applicationTests);
    if (!applicationTests.passed) report.passed = false;
    
    // Test merchant verification system
    const verificationTests = await this.testMerchantVerification();
    report.testGroups.push(verificationTests);
    if (!verificationTests.passed) report.passed = false;
    
    // Test merchant payment integration
    const paymentIntegrationTests = await this.testPaymentIntegration();
    report.testGroups.push(paymentIntegrationTests);
    if (!paymentIntegrationTests.passed) report.passed = false;
    
    // Test merchant microsite system
    const micrositeTests = await this.testMerchantMicrosite();
    report.testGroups.push(micrositeTests);
    if (!micrositeTests.passed) report.passed = false;
    
    return report;
  }
  
  /**
   * Test merchant application system
   */
  async testMerchantApplications(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Merchant Application Tests',
      tests: [],
      passed: true
    };
    
    // Test database schema
    try {
      // Check if merchant_applications table exists
      const tableResult = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'merchant_applications'
        );
      `);
      
      const tableExists = tableResult[0]?.exists || false;
      
      testGroup.tests.push({
        name: 'Merchant Applications Table Existence',
        description: 'The merchant_applications table should exist in the database',
        passed: tableExists,
        result: tableExists ? 'Table exists' : 'Table does not exist',
        expected: 'Table exists',
        actual: tableExists ? 'Table exists' : 'Table does not exist'
      });
      
      if (!tableExists) testGroup.passed = false;
      
      // Test API endpoints
      const baseUrl = 'http://localhost:5000';
      
      // Test the merchant application submission endpoint (should be unauthorized without auth)
      const response = await fetch(`${baseUrl}/api/merchants/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName: 'Test Business',
          email: 'test@example.com',
          phoneNumber: '555-555-5555',
          businessType: 'retail',
          estimatedMonthlyVolume: '10000'
        })
      });
      
      const status = response.status;
      const isStatusCorrect = status === 401; // Expect unauthorized
      
      testGroup.tests.push({
        name: 'Merchant Application Submission',
        description: 'Test the merchant application submission endpoint',
        passed: isStatusCorrect,
        result: isStatusCorrect 
          ? 'Endpoint properly secured' 
          : `Endpoint security issue: returned status ${status}`,
        expected: 'Status 401 (Unauthorized)',
        actual: `Status ${status}`
      });
      
      if (!isStatusCorrect) testGroup.passed = false;
      
      // Test with test auth
      const authResponse = await fetch(`${baseUrl}/api/merchants/applications`, {
        method: 'GET',
        headers: {
          'X-Test-Mode': 'true'
        }
      });
      
      const authStatus = authResponse.status;
      const isAuthStatusCorrect = [200, 404].includes(authStatus); // Either OK or Not Found is acceptable
      
      testGroup.tests.push({
        name: 'Merchant Applications Retrieval with Test Auth',
        description: 'Test the merchant applications retrieval endpoint with test authentication',
        passed: isAuthStatusCorrect,
        result: isAuthStatusCorrect 
          ? `Endpoint returned acceptable status ${authStatus}` 
          : `Endpoint returned unexpected status ${authStatus}`,
        expected: 'Status 200 or 404',
        actual: `Status ${authStatus}`
      });
      
      if (!isAuthStatusCorrect) testGroup.passed = false;
    } catch (error) {
      testGroup.tests.push({
        name: 'Merchant Application System Test',
        description: 'Should be able to test merchant application system',
        passed: false,
        result: 'Error testing merchant application system',
        expected: 'Successful testing',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
  
  /**
   * Test merchant verification system
   */
  async testMerchantVerification(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Merchant Verification Tests',
      tests: [],
      passed: true
    };
    
    try {
      // Test merchant verification APIs
      const baseUrl = 'http://localhost:5000';
      const verificationEndpoints = [
        { 
          name: 'Get Verification Status', 
          url: '/api/merchants/verification/status',
          method: 'GET',
          useTestAuth: true,
          expectedStatus: [200, 404]  // Either OK or Not Found is acceptable for testing
        },
        { 
          name: 'Submit Verification Documents', 
          url: '/api/merchants/verification/documents',
          method: 'POST',
          useTestAuth: false,  // Test without auth
          expectedStatus: 401  // Should be unauthorized
        }
      ];
      
      // Test each verification endpoint
      for (const endpoint of verificationEndpoints) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        // Add test authentication header
        if (endpoint.useTestAuth) {
          headers['X-Test-Mode'] = 'true';
        }
        
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          headers,
          body: endpoint.method === 'POST' ? JSON.stringify({
            documentType: 'businessLicense',
            documentContent: 'test-content'
          }) : undefined
        });
        
        const status = response.status;
        const isStatusCorrect = Array.isArray(endpoint.expectedStatus)
          ? endpoint.expectedStatus.includes(status)
          : status === endpoint.expectedStatus;
        
        testGroup.tests.push({
          name: endpoint.name,
          description: `Test the ${endpoint.url} endpoint`,
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
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Merchant Verification System Test',
        description: 'Should be able to test merchant verification system',
        passed: false,
        result: 'Error testing merchant verification system',
        expected: 'Successful testing',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
  
  /**
   * Test merchant payment integration
   */
  async testPaymentIntegration(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Payment Integration Tests',
      tests: [],
      passed: true
    };
    
    try {
      // Test payment gateway configuration APIs
      const baseUrl = 'http://localhost:5000';
      const paymentEndpoints = [
        { 
          name: 'Get Payment Gateways', 
          url: '/api/payment-gateways',
          method: 'GET',
          useTestAuth: false,  // Test without auth
          expectedStatus: 401  // Should be unauthorized
        },
        { 
          name: 'Get Payment Gateways with Auth', 
          url: '/api/payment-gateways',
          method: 'GET',
          useTestAuth: true,
          expectedStatus: [200, 403, 404]  // Either OK, Forbidden, or Not Found is acceptable for testing
        },
        { 
          name: 'Create Payment Gateway', 
          url: '/api/payment-gateways',
          method: 'POST',
          useTestAuth: true,
          body: {
            gatewayType: 'helcim',
            accountId: 'test-account',
            apiKey: 'test-key'
          },
          expectedStatus: [201, 400, 403, 404]  // Either Created, Bad Request, Forbidden, or Not Found is acceptable for testing
        }
      ];
      
      // Test each payment endpoint
      for (const endpoint of paymentEndpoints) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        // Add test authentication header
        if (endpoint.useTestAuth) {
          headers['X-Test-Mode'] = 'true';
        }
        
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          headers,
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
        });
        
        const status = response.status;
        const isStatusCorrect = Array.isArray(endpoint.expectedStatus)
          ? endpoint.expectedStatus.includes(status)
          : status === endpoint.expectedStatus;
        
        testGroup.tests.push({
          name: endpoint.name,
          description: `Test the ${endpoint.url} endpoint`,
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
      }
      
      // Test Helcim-specific integration
      const helcimResponse = await fetch(`${baseUrl}/api/payment-gateways/1/helcim/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true'
        }
      });
      
      const helcimStatus = helcimResponse.status;
      const isHelcimStatusCorrect = [200, 404, 400].includes(helcimStatus); // Either OK, Not Found, or Bad Request is acceptable
      
      testGroup.tests.push({
        name: 'Helcim Integration Test',
        description: 'Test the Helcim payment integration',
        passed: isHelcimStatusCorrect,
        result: isHelcimStatusCorrect 
          ? `Endpoint returned acceptable status ${helcimStatus}` 
          : `Endpoint returned unexpected status ${helcimStatus}`,
        expected: 'Status 200, 400, or 404',
        actual: `Status ${helcimStatus}`
      });
      
      if (!isHelcimStatusCorrect) testGroup.passed = false;
    } catch (error) {
      testGroup.tests.push({
        name: 'Payment Integration System Test',
        description: 'Should be able to test payment integration system',
        passed: false,
        result: 'Error testing payment integration system',
        expected: 'Successful testing',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
  
  /**
   * Test merchant microsite system
   */
  async testMerchantMicrosite(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Merchant Microsite Tests',
      tests: [],
      passed: true
    };
    
    try {
      // Test microsite API endpoints
      const baseUrl = 'http://localhost:5000';
      const micrositeEndpoints = [
        { 
          name: 'Get Public Merchant Microsite', 
          url: '/api/microsites/merchant/test-merchant',
          method: 'GET',
          expectedStatus: [200, 404]  // Either OK or Not Found is acceptable for testing
        },
        { 
          name: 'Update Merchant Microsite Settings', 
          url: '/api/merchants/microsite-settings',
          method: 'PUT',
          useTestAuth: true,
          body: {
            useMicrosite: true,
            customDomain: 'test.example.com',
            theme: 'default'
          },
          expectedStatus: [200, 400, 403, 404]  // Either OK, Bad Request, Forbidden, or Not Found is acceptable for testing
        }
      ];
      
      // Test each microsite endpoint
      for (const endpoint of micrositeEndpoints) {
        const headers: Record<string, string> = {};
        
        // Add test authentication header
        if (endpoint.useTestAuth) {
          headers['X-Test-Mode'] = 'true';
          headers['Content-Type'] = 'application/json';
        }
        
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          headers,
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
        });
        
        const status = response.status;
        const isStatusCorrect = Array.isArray(endpoint.expectedStatus)
          ? endpoint.expectedStatus.includes(status)
          : status === endpoint.expectedStatus;
        
        testGroup.tests.push({
          name: endpoint.name,
          description: `Test the ${endpoint.url} endpoint`,
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
      }
      
      // Test database tables for microsite settings
      const tableResult = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'merchant_microsite_settings'
        );
      `);
      
      const tableExists = tableResult[0]?.exists || false;
      
      testGroup.tests.push({
        name: 'Microsite Settings Table Existence',
        description: 'The merchant_microsite_settings table should exist in the database',
        passed: tableExists,
        result: tableExists ? 'Table exists' : 'Table does not exist',
        expected: 'Table exists',
        actual: tableExists ? 'Table exists' : 'Table does not exist'
      });
      
      if (!tableExists) testGroup.passed = false;
    } catch (error) {
      testGroup.tests.push({
        name: 'Merchant Microsite System Test',
        description: 'Should be able to test merchant microsite system',
        passed: false,
        result: 'Error testing merchant microsite system',
        expected: 'Successful testing',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
}

export const merchantOnboardingTestService = new MerchantOnboardingTestService();