/**
 * API Endpoints Testing Script
 * 
 * This script tests all API endpoints across the PaySurity.com system:
 * - Internal APIs for the web application
 * - Wallet system APIs
 * - Merchant-facing APIs
 * - POS system APIs for each industry
 * - Affiliate system APIs
 */

import { apiTestService } from '../server/services/testing/test-api';
import { TestReport } from '../server/services/testing/test-delivery-service';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function runAPITests() {
  console.log('📋 PaySurity.com API Endpoints Tests');
  console.log('=================================');
  console.log('Starting API endpoint tests...\n');
  
  try {
    // Run API tests
    const startTime = Date.now();
    const report: TestReport = await apiTestService.runComprehensiveTests();
    const duration = Date.now() - startTime;
    
    // Calculate statistics
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    report.testGroups.forEach(group => {
      totalTests += group.tests.length;
      passedTests += group.tests.filter(test => test.passed).length;
      failedTests += group.tests.filter(test => !test.passed).length;
    });
    
    // Save report to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../test-reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, `api-test-report-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Log summary
    console.log('\n📊 Test Results Summary');
    console.log('=====================');
    console.log(`🕒 Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📝 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📋 Overall result: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // List failed tests
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      console.log('==============');
      
      report.testGroups.forEach(group => {
        const groupFailedTests = group.tests.filter(test => !test.passed);
        if (groupFailedTests.length > 0) {
          console.log(`\n📝 ${group.name}:`);
          groupFailedTests.forEach(test => {
            console.log(`  ❌ ${test.name}: ${test.result}`);
            console.log(`     Expected: ${test.expected}`);
            console.log(`     Actual: ${test.actual}`);
          });
        }
      });
    }
    
    // Run additional tests that aren't covered by the API test service
    await runAdditionalAPITests();
    
    return report;
  } catch (error) {
    console.error('Error running API tests:', error);
    throw error;
  }
}

/**
 * Run additional API tests that aren't covered by the API test service
 */
async function runAdditionalAPITests() {
  console.log('\n🔍 Running additional API tests...');
  
  // Define additional endpoints to test
  const additionalEndpoints = [
    // Health and status
    { name: 'Health Check', path: '/api/health', method: 'GET', expectedStatus: 200 },
    { name: 'Test Mode Status', path: '/api/tests/status', method: 'GET', expectedStatus: [200, 404] },
    
    // News API integration
    { name: 'News API Endpoint', path: '/api/news/payment-industry', method: 'GET', expectedStatus: 200 },
    
    // Documentation endpoints
    { name: 'Documentation Versions', path: '/api/documentation/versions', method: 'GET', expectedStatus: [200, 404] },
    
    // Microsite APIs
    { name: 'Microsite Check', path: '/api/microsites/merchant/test', method: 'GET', expectedStatus: [200, 404] },
    
    // ISO Partner APIs
    { name: 'ISO Partner Dashboard', path: '/api/iso-partners/me', method: 'GET', headers: { 'X-Test-Mode': 'true' }, expectedStatus: [200, 404] },
  ];
  
  let passedCount = 0;
  let failedCount = 0;
  
  // Test each additional endpoint
  for (const endpoint of additionalEndpoints) {
    try {
      console.log(`  🔹 Testing ${endpoint.name}: ${endpoint.method} ${endpoint.path}`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...endpoint.headers
      };
      
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers
      });
      
      const status = response.status;
      const expectedStatus = Array.isArray(endpoint.expectedStatus) 
        ? endpoint.expectedStatus 
        : [endpoint.expectedStatus];
      
      const isStatusCorrect = expectedStatus.includes(status);
      
      if (isStatusCorrect) {
        console.log(`  ✅ ${endpoint.name}: Status ${status} (Expected: ${expectedStatus.join(' or ')})`);
        passedCount++;
      } else {
        console.log(`  ❌ ${endpoint.name}: Status ${status} (Expected: ${expectedStatus.join(' or ')})`);
        failedCount++;
      }
    } catch (error) {
      console.error(`  ❌ ${endpoint.name}: Error - ${(error as Error).message}`);
      failedCount++;
    }
  }
  
  console.log(`\n✅ Additional API Tests: ${passedCount} passed, ${failedCount} failed`);
}

/**
 * Run stress tests on critical API endpoints
 */
async function runAPIStressTests() {
  console.log('\n🔥 Running API stress tests...');
  
  // Define critical endpoints to stress test
  const criticalEndpoints = [
    { name: 'Health Check', path: '/api/health', method: 'GET' },
    { name: 'News API', path: '/api/news/payment-industry', method: 'GET' },
  ];
  
  const REQUEST_COUNT = 10; // Number of concurrent requests
  const TIMEOUT_MS = 5000;   // Request timeout
  
  for (const endpoint of criticalEndpoints) {
    console.log(`  🔹 Stress testing ${endpoint.name}: ${endpoint.method} ${endpoint.path}`);
    
    const startTime = Date.now();
    const promises = [];
    
    // Create multiple concurrent requests
    for (let i = 0; i < REQUEST_COUNT; i++) {
      promises.push(
        fetch(`${BASE_URL}${endpoint.path}`, {
          method: endpoint.method,
          timeout: TIMEOUT_MS
        })
      );
    }
    
    try {
      // Wait for all requests to complete
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Count successful and failed requests
      const fulfilled = results.filter(r => r.status === 'fulfilled').length;
      const rejected = results.filter(r => r.status === 'rejected').length;
      
      // Calculate success rate and average response time
      const successRate = (fulfilled / REQUEST_COUNT) * 100;
      const avgResponseTime = duration / REQUEST_COUNT;
      
      console.log(`  📊 Results for ${endpoint.name}:`);
      console.log(`    ✅ Success rate: ${successRate.toFixed(1)}% (${fulfilled}/${REQUEST_COUNT})`);
      console.log(`    ⏱️ Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`    ⏱️ Total duration: ${duration}ms`);
      
      // Warn if success rate is too low or response time is too high
      if (successRate < 90) {
        console.log(`  ⚠️ Warning: Success rate below 90% for ${endpoint.name}`);
      }
      
      if (avgResponseTime > 500) {
        console.log(`  ⚠️ Warning: Average response time above 500ms for ${endpoint.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Error during stress test for ${endpoint.name}:`, error);
    }
  }
  
  console.log('\n✅ API stress tests complete');
}

// Run tests
const runTests = async () => {
  try {
    await runAPITests();
    await runAPIStressTests();
    console.log('\nAPI tests complete.');
    process.exit(0);
  } catch (error) {
    console.error('API tests failed:', error);
    process.exit(1);
  }
};

// Run if this is the main module
runTests();

// Export functions
export { runAPITests, runAPIStressTests, runAdditionalAPITests };