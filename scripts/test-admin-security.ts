/**
 * Admin Security Test Script
 * 
 * This script tests the admin security features including:
 * - Authentication checks
 * - Role-based authorization
 * - UI element visibility based on user role
 * - Password security measures
 */

import { testAdminSecurity } from '../server/services/testing/test-admin-security';

async function main() {
  try {
    console.log('🛡️ Running Admin Security Tests');
    const result = await testAdminSecurity();
    
    if (result.success) {
      console.log('✅ All admin security tests passed!');
      process.exit(0);
    } else {
      console.error(`❌ Admin security tests failed: ${result.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running admin security tests:', error);
    process.exit(1);
  }
}

main();