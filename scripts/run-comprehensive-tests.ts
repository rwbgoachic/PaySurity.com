/**
 * Comprehensive Test Runner Script
 * 
 * This script runs all the major test suites in order to verify the entire system is working properly.
 * It includes:
 * 1. IOLTA trust account system tests
 * 2. Client portal tests
 * 3. IOLTA-Client portal integration tests
 * 4. Legal document management tests
 * 5. Affiliate marketing tests
 * 6. Legal reporting tests
 * 
 * Run with: npx tsx scripts/run-comprehensive-tests.ts
 */

import { execSync } from 'child_process';

async function runComprehensiveTests() {
  console.log('\n🔍 Starting Comprehensive System Tests\n');
  const startTime = Date.now();
  
  const tests = [
    {
      name: 'IOLTA Trust Accounting System',
      script: 'npx tsx scripts/test-iolta.ts',
      description: 'Tests core IOLTA trust accounting functionality'
    },
    {
      name: 'Client Portal System',
      script: 'npx tsx scripts/test-client-portal.ts',
      description: 'Tests client portal user management and authentication'
    },
    {
      name: 'IOLTA-Client Portal Integration',
      script: 'npx tsx scripts/test-iolta-client-portal-integration.ts',
      description: 'Tests IOLTA and client portal systems work together correctly'
    },
    {
      name: 'Legal Document Management',
      script: 'npx tsx scripts/test-legal-document-management.ts',
      description: 'Tests document uploading, versioning, and retrieval'
    },
    {
      name: 'Affiliate Marketing System',
      script: 'npx tsx scripts/test-affiliate-marketing.ts',
      description: 'Tests affiliate registration, referrals and commission tracking'
    },
    {
      name: 'Payroll Pricing System',
      script: 'npx tsx scripts/test-payroll-pricing.ts',
      description: 'Tests payroll pricing tiers and feature management'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Running Test Suite: ${test.name}`);
    console.log(`📝 ${test.description}`);
    
    try {
      console.log(`Executing: ${test.script}`);
      execSync(test.script, { stdio: 'inherit' });
      results.push({ name: test.name, status: 'PASSED' });
      console.log(`✅ ${test.name} tests PASSED`);
    } catch (error) {
      results.push({ name: test.name, status: 'FAILED' });
      console.error(`❌ ${test.name} tests FAILED`);
    }
  }
  
  // Print summary
  const endTime = Date.now();
  const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const passedTests = results.filter(r => r.status === 'PASSED').length;
  const failedTests = results.length - passedTests;
  
  console.log(`Total Test Suites: ${results.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Duration: ${durationInSeconds} seconds`);
  console.log('=======================');
  
  // Detailed results
  console.log('\nDetailed Results:');
  results.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
  });
  
  // Exit with error code if any tests failed
  if (failedTests > 0) {
    console.log('\n❌ Some tests failed. Please review the output above for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully! The system is working properly.');
    process.exit(0);
  }
}

runComprehensiveTests();