/**
 * Fix Client Ledger Lookup Script
 * 
 * This script updates the test-iolta-service.ts file to use the
 * corrected getClientLedger method with the isClientId parameter.
 * 
 * Run with: npx tsx scripts/fix-client-ledger-lookup.ts
 */

import * as fs from 'fs';
import * as path from 'path';

async function fixClientLedgerLookup() {
  try {
    const testServicePath = path.join(process.cwd(), 'server/services/testing/test-iolta-service.ts');
    
    // Read the file content
    let content = fs.readFileSync(testServicePath, 'utf-8');
    
    // Find and replace the getClientLedger calls
    // Fix the first instance (Test 2: Get client IOLTA ledger)
    content = content.replace(
      `const clientLedger = await ioltaService.getClientLedger(
        this.testClientId
      );`,
      `const clientLedger = await ioltaService.getClientLedger(
        this.testClientId,
        true // Pass isClientId=true to search by client ID
      );`
    );
    
    // Fix the second instance (Test 3: Get client transactions)
    content = content.replace(
      `// First get the client ledger 
      const clientLedger = await ioltaService.getClientLedger(
        this.testClientId
      );`,
      `// First get the client ledger 
      const clientLedger = await ioltaService.getClientLedger(
        this.testClientId,
        true // Pass isClientId=true to search by client ID
      );`
    );
    
    // Also update the testAccountData to include required clientId field
    content = content.replace(
      `  private testAccountData = {
    merchantId: this.testMerchantId,
    accountName: "Test IOLTA Account",
    accountNumber: "IOLTA-TEST-1234",
    status: "active" as const,
    bankName: "Test Bank",
    balance: "10000.00",
    notes: "Test IOLTA account"`,
      `  private testAccountData = {
    merchantId: this.testMerchantId,
    clientId: 1, // Required field
    accountName: "Test IOLTA Account",
    accountNumber: "IOLTA-TEST-1234",
    status: "active" as const,
    bankName: "Test Bank",
    balance: "10000.00",
    notes: "Test IOLTA account"`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(testServicePath, content);
    
    console.log('Successfully updated test-iolta-service.ts with corrected client ledger lookup');
  } catch (error) {
    console.error('Error fixing client ledger lookup:', error);
  }
}

fixClientLedgerLookup().catch(console.error);