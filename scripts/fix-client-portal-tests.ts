/**
 * Fix Client Portal Tests
 * 
 * This script modifies the client portal test implementation to handle 
 * the jurisdiction column issue. It adds the missing column to relevant tables
 * and updates test implementations to avoid jurisdication-related SQL errors.
 * 
 * Run with: npx tsx scripts/fix-client-portal-tests.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

async function fixClientPortalTests() {
  console.log(chalk.blue('Starting Client Portal tests fix...'));
  
  try {
    // 1. First identify all tables that might need jurisdiction column
    await ensureColumnExists('legal_clients', 'jurisdiction', 'TEXT');
    await ensureColumnExists('legal_portal_users', 'jurisdiction', 'TEXT');
    await ensureColumnExists('legal_matters', 'jurisdiction', 'TEXT');
    await ensureColumnExists('iolta_client_ledgers', 'jurisdiction', 'TEXT');
    
    // 2. Now modify the test-client-portal.ts implementation to handle the jurisdiction field
    await fixTestImplementation();
    
    console.log(chalk.green('Client Portal tests fix completed successfully'));
  } catch (error) {
    console.error(chalk.red('Error fixing Client Portal tests:'), error);
    throw error;
  }
}

async function ensureColumnExists(tableName: string, columnName: string, columnType: string) {
  console.log(`Checking if ${columnName} column exists in ${tableName}...`);
  
  // Check if column exists
  const columnCheck = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName} AND column_name = ${columnName}
  `);
  
  if (columnCheck.rows.length === 0) {
    console.log(`Adding ${columnName} column to ${tableName}...`);
    
    await db.execute(sql`
      ALTER TABLE ${sql.raw(tableName)} 
      ADD COLUMN ${sql.raw(columnName)} ${sql.raw(columnType)}
    `);
    
    console.log(chalk.green(`Added ${columnName} column to ${tableName}`));
  } else {
    console.log(`Column ${columnName} already exists in ${tableName}`);
  }
}

async function fixTestImplementation() {
  const testFilePath = path.join(process.cwd(), 'server/services/testing/test-client-portal.ts');
  
  // Create backup
  fs.copyFileSync(testFilePath, `${testFilePath}.bak`);
  
  // Read the file
  let content = fs.readFileSync(testFilePath, 'utf8');
  
  // Update client creation code to include jurisdiction
  let updatedContent = content.replace(
    /INSERT INTO legal_clients \(\s*id, merchant_id, client_number, email, status, client_type, first_name, last_name, is_active\s*\) VALUES \(/,
    'INSERT INTO legal_clients (\n            id, merchant_id, client_number, email, status, client_type, first_name, last_name, is_active, jurisdiction\n          ) VALUES ('
  );
  
  updatedContent = updatedContent.replace(
    /'active', 'individual', 'Test', 'PortalUser', true/,
    "'active', 'individual', 'Test', 'PortalUser', true, 'CA'"
  );
  
  // Also update the portal user creation code 
  updatedContent = updatedContent.replace(
    /registerPortalUser\(\{\s*firstName: 'Test',\s*lastName: 'PortalUser',\s*email: 'test\.portal@example\.com',\s*merchantId: this\.testMerchantId,\s*clientId: this\.testClientId,\s*password: 'TestPortal123!'/g,
    "registerPortalUser({\n        firstName: 'Test',\n        lastName: 'PortalUser',\n        email: 'test.portal@example.com',\n        merchantId: this.testMerchantId,\n        clientId: this.testClientId,\n        jurisdiction: 'CA',\n        password: 'TestPortal123!'"
  );
  
  // Update IOLTA client ledger creation to include jurisdiction
  updatedContent = updatedContent.replace(
    /createClientLedger\(\{\s*merchantId: this\.testMerchantId,\s*clientId: this\.testClientId\.toString\(\),.*?\s*matterNumber: 'TPM-001',\s*balance: '5000\.00',\s*status: 'active'/g,
    "createClientLedger({\n      merchantId: this.testMerchantId,\n      clientId: this.testClientId.toString(),\n      trustAccountId: account.id,\n      clientName: 'Test PortalUser',\n      matterName: 'Test Portal Matter',\n      matterNumber: 'TPM-001',\n      jurisdiction: 'CA',\n      balance: '5000.00',\n      status: 'active'"
  );
  
  // Write updated file
  fs.writeFileSync(testFilePath, updatedContent);
  
  console.log(chalk.green('Updated test-client-portal.ts implementation'));
}

// Run the function
fixClientPortalTests()
  .then(() => {
    console.log(chalk.green.bold('✅ Client Portal tests have been fixed!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red.bold('❌ Failed to fix Client Portal tests:'), error);
    process.exit(1);
  });