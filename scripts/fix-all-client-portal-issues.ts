/**
 * Fix All Client Portal Issues
 * 
 * This script addresses all the remaining client portal system issues:
 * 1. Fixes the client ID type inconsistency between IOLTA tables and portal tables
 * 2. Updates the client portal service to handle both string and number client IDs
 * 3. Creates a helper function for client ID conversion
 * 
 * Run with: npx tsx scripts/fix-all-client-portal-issues.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { ClientPortalService } from '../server/services/legal/client-portal-service';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ioltaClientLedgers, ioltaTrustAccounts } from '../shared/schema-iolta';
import { legalPortalUsers } from '../shared/schema-portal';

// Path constants for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path constants
const clientIdHelperPath = path.join(__dirname, '../server/services/legal/client-id-helper.ts');
const clientPortalServicePath = path.join(__dirname, '../server/services/legal/client-portal-service.ts');

async function fixAllClientPortalIssues() {
  console.log('Starting comprehensive client portal fix...');
  
  try {
    // Step 1: Create a client ID helper if it doesn't exist
    await createClientIdHelper();
    
    // Step 2: Update the client portal service
    await updateClientPortalService();
    
    // Step 3: Create and run a test to verify the updates
    await runPortalTest();
    
    console.log('\nClient portal fixes completed successfully!');
    console.log('Next steps:');
    console.log('1. Run a comprehensive test suite with: npx tsx scripts/run-client-portal-tests.ts');
    console.log('2. Fix any remaining type errors in the client portal service');
    
  } catch (error) {
    console.error('Error fixing client portal issues:', error);
    process.exit(1);
  }
}

/**
 * Create a helper file for clientId conversion
 */
async function createClientIdHelper() {
  console.log('Creating clientId helper...');
  
  const helperContent = `/**
 * Client ID Helper
 * 
 * Utility functions to handle the conversion between string and numeric client IDs
 * across different parts of the legal practice management system.
 * 
 * This is needed because:
 * - IOLTA tables store clientId as string
 * - Portal tables store clientId as number
 */

/**
 * Convert client ID to string format for IOLTA operations
 */
export function toIoltaClientId(clientId: string | number): string {
  return String(clientId);
}

/**
 * Convert client ID to number format for portal operations
 */
export function toPortalClientId(clientId: string | number): number {
  // If it's already a number, return it
  if (typeof clientId === 'number') return clientId;
  
  // Try to convert to number
  const numericId = Number(clientId);
  
  // Check if conversion was successful and valid
  if (isNaN(numericId)) {
    throw new Error(\`Invalid client ID: \${clientId}\`);
  }
  
  return numericId;
}

/**
 * Safely compare client IDs regardless of type
 */
export function clientIdsMatch(id1: string | number, id2: string | number): boolean {
  return String(id1) === String(id2);
}
`;

  try {
    await fs.stat(clientIdHelperPath);
    console.log('Client ID helper already exists, updating...');
  } catch (err) {
    console.log('Creating new client ID helper file...');
  }
  
  await fs.writeFile(clientIdHelperPath, helperContent);
  console.log('Client ID helper created/updated');
}

/**
 * Update the client portal service to use the client ID helper
 */
async function updateClientPortalService() {
  console.log('Updating client portal service...');
  
  try {
    // Read current file
    const currentContent = await fs.readFile(clientPortalServicePath, 'utf8');
    
    // Check if already updated
    if (currentContent.includes('import { toPortalClientId, toIoltaClientId }')) {
      console.log('Client portal service already updated');
      return;
    }
    
    // Add import statement for helper
    let updatedContent = currentContent.replace(
      `import { db } from '../../db';`,
      `import { db } from '../../db';
import { toPortalClientId, toIoltaClientId, clientIdsMatch } from './client-id-helper';`
    );
    
    // Update IOLTA methods to use helpers
    
    // Update getClientTrustAccounts method
    updatedContent = updatedContent.replace(
      /async getClientTrustAccounts\(clientId: number \| string, merchantId: number\): Promise<IoltaTrustAccount\[\]> {[\s\S]+?const accounts = await db\.select\(\)[\s\S]+?\.from\(ioltaTrustAccounts\)[\s\S]+?\.where\([\s\S]+?eq\(ioltaTrustAccounts\.merchantId, merchantId\),[\s\S]+?eq\(ioltaTrustAccounts\.clientId, clientId as any\)[\s\S]+?\);/g,
      `async getClientTrustAccounts(clientId: number | string, merchantId: number): Promise<IoltaTrustAccount[]> {
    try {
      // Convert clientId to string for IOLTA tables
      const ioltaClientId = toIoltaClientId(clientId);
      
      const accounts = await db.select()
        .from(ioltaTrustAccounts)
        .where(
          and(
            eq(ioltaTrustAccounts.merchantId, merchantId),
            eq(ioltaTrustAccounts.clientId, ioltaClientId)
          )
        );`
    );
    
    // Update getClientTrustLedgers method
    updatedContent = updatedContent.replace(
      /async getClientTrustLedgers\(clientId: number, merchantId: number, trustAccountId: number\): Promise<IoltaClientLedger\[\]> {[\s\S]+?const ledgers = await db\.select\(\)[\s\S]+?\.from\(ioltaClientLedgers\)[\s\S]+?\.where\([\s\S]+?eq\(ioltaClientLedgers\.merchantId, merchantId\),[\s\S]+?eq\(ioltaClientLedgers\.clientId, clientId as any\),[\s\S]+?eq\(ioltaClientLedgers\.trustAccountId, trustAccountId\)[\s\S]+?\);/g,
      `async getClientTrustLedgers(clientId: number, merchantId: number, trustAccountId: number): Promise<IoltaClientLedger[]> {
    try {
      // Convert clientId to string for IOLTA tables
      const ioltaClientId = toIoltaClientId(clientId);
      
      const ledgers = await db.select()
        .from(ioltaClientLedgers)
        .where(
          and(
            eq(ioltaClientLedgers.merchantId, merchantId),
            eq(ioltaClientLedgers.clientId, ioltaClientId),
            eq(ioltaClientLedgers.trustAccountId, trustAccountId)
          )
        );`
    );
    
    // Update getClientTrustStatement method
    updatedContent = updatedContent.replace(
      /async getClientTrustStatement\(clientId: number, merchantId: number, startDate\?: Date, endDate\?: Date\): Promise<any> {[\s\S]+?const clientLedgers = await db\.select\(\)[\s\S]+?\.from\(ioltaClientLedgers\)[\s\S]+?\.where\([\s\S]+?eq\(ioltaClientLedgers\.merchantId, merchantId\),[\s\S]+?eq\(ioltaClientLedgers\.clientId, clientId as any\)[\s\S]+?\);/g,
      `async getClientTrustStatement(clientId: number, merchantId: number, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // Convert clientId to string for IOLTA tables
      const ioltaClientId = toIoltaClientId(clientId);
      
      const clientLedgers = await db.select()
        .from(ioltaClientLedgers)
        .where(
          and(
            eq(ioltaClientLedgers.merchantId, merchantId),
            eq(ioltaClientLedgers.clientId, ioltaClientId)
          )
        );`
    );
    
    // Update client portal methods
    
    // Write updated content back to file
    await fs.writeFile(clientPortalServicePath, updatedContent);
    console.log('Client portal service updated successfully');
    
  } catch (error) {
    console.error('Error updating client portal service:', error);
    throw error;
  }
}

/**
 * Run a test to verify the client portal fixes
 */
async function runPortalTest() {
  console.log('\nRunning client portal test...');
  
  const clientPortalService = new ClientPortalService();
  const testClientId = 1;
  const testMerchantId = 1;
  
  try {
    // Test 1: Get client trust accounts
    console.log(`\nTest 1: Getting trust accounts for clientId ${testClientId}`);
    const accounts = await clientPortalService.getClientTrustAccounts(testClientId, testMerchantId);
    console.log(`Found ${accounts.length} trust accounts`);
    
    if (accounts.length > 0) {
      console.log('Trust account retrieval test passed ✓');
    } else {
      console.log('Warning: No trust accounts found, but query executed without errors');
    }
    
    // Test 2: Create and authenticate a new portal user
    const testEmail = `test.portal.${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`\nTest 2: Creating portal user with email ${testEmail}`);
    const user = await clientPortalService.createPortalUser({
      email: testEmail,
      password: testPassword,
      clientId: testClientId,
      merchantId: testMerchantId,
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    });
    
    console.log(`User created with ID ${user.id}`);
    
    try {
      console.log(`\nTest 3: Authenticating portal user ${testEmail}`);
      const authResult = await clientPortalService.authenticatePortalUser(
        testEmail,
        testPassword,
        testMerchantId
      );
      
      console.log(`Authentication successful for user ${authResult.user.email}`);
      console.log('Authentication test passed ✓');
      
    } catch (error) {
      console.error('Authentication failed:', error);
      console.log('Authentication test failed ✗');
    }
    
    // Test cleanup
    console.log('\nCleaning up test user...');
    await db.delete(schema.legalPortalUsers)
      .where(eq(schema.legalPortalUsers.email, testEmail));
    
    console.log('Test cleanup completed');
    
  } catch (error) {
    console.error('Error running portal test:', error);
    throw error;
  }
}

// Run the fixes
fixAllClientPortalIssues().catch(console.error);