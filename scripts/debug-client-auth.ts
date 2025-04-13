/**
 * Debug Client Portal Authentication
 * 
 * This script isolates and tests the client portal user creation and authentication
 * to debug the authentication issues.
 * 
 * Run with: npx tsx scripts/debug-client-auth.ts
 */

import { db } from '../server/db';
import { clientPortalService } from '../server/services/legal/client-portal-service';
import { legalPortalUsers } from '../shared/schema-portal';
import { eq } from 'drizzle-orm';

// Test user data
const TEST_EMAIL = `test.portal.${Date.now()}@example.com`;
const TEST_PASSWORD = 'P@ssw0rd123!';
const TEST_MERCHANT_ID = 1;
const TEST_CLIENT_ID = 1;

async function debugAuthentication() {
  console.log('Debugging client portal authentication...');
  
  try {
    // Clean up any existing test user
    console.log(`Removing any existing test user with email ${TEST_EMAIL}...`);
    await db.delete(legalPortalUsers)
      .where(eq(legalPortalUsers.email, TEST_EMAIL));
    
    // Create test portal user
    console.log('\nCreating test portal user...');
    const portalUser = await clientPortalService.createPortalUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD, // Using password field
      clientId: TEST_CLIENT_ID,
      merchantId: TEST_MERCHANT_ID,
      firstName: 'Debug',
      lastName: 'User',
      isActive: true
    });
    
    console.log('Created portal user:', {
      id: portalUser.id,
      email: portalUser.email,
      clientId: portalUser.clientId,
      password_hash: portalUser.password_hash ? '[REDACTED]' : 'NULL'
    });
    
    // Test authentication with correct password
    console.log('\nTesting authentication with correct password...');
    try {
      const authResult = await clientPortalService.authenticatePortalUser(
        TEST_EMAIL,
        TEST_PASSWORD,
        TEST_MERCHANT_ID
      );
      
      console.log('Authentication result:', {
        success: !!authResult && !!authResult.user,
        userId: authResult?.user?.id,
        userEmail: authResult?.user?.email,
        sessionInfo: authResult?.session ? 'SESSION_CREATED' : 'NO_SESSION'
      });
    } catch (error) {
      console.error('Authentication error:', error.message);
      
      // Get the user from the database to check password_hash
      const [dbUser] = await db.select({
        id: legalPortalUsers.id,
        email: legalPortalUsers.email,
        password_hash: legalPortalUsers.password_hash,
        clientId: legalPortalUsers.clientId
      })
      .from(legalPortalUsers)
      .where(eq(legalPortalUsers.email, TEST_EMAIL));
      
      if (dbUser) {
        console.log('\nUser found in database:');
        console.log({
          id: dbUser.id,
          email: dbUser.email,
          clientId: dbUser.clientId,
          password_hash_format: dbUser.password_hash.includes('.') ? 'HASH.SALT' : 'NOT_HASHED',
          password_hash_length: dbUser.password_hash.length
        });
      } else {
        console.log('User not found in database!');
      }
    }
    
    // Clean up
    console.log('\nCleaning up test user...');
    const deleteResult = await db.delete(legalPortalUsers)
      .where(eq(legalPortalUsers.email, TEST_EMAIL));
    
    console.log(`Deleted ${deleteResult.count} test user(s)`);
    
  } catch (error) {
    console.error('Debug session error:', error);
  } finally {
    console.log('\nDebug session complete');
  }
}

// Run the debug
debugAuthentication().catch(console.error);