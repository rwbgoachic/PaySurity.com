/**
 * Fix Transaction Test Script
 * 
 * This script modifies the test-iolta-service.ts file to fix the transaction test
 * by updating how client ledger IDs are handled.
 * 
 * Run with: npx tsx scripts/fix-transaction-test.ts
 */

import { db } from "../server/db";
import { sql, eq } from "drizzle-orm";
import { ioltaClientLedgers, ioltaTrustAccounts } from "../shared/schema-legal";

async function fixTransactionTest() {
  console.log("Starting transaction test fix...");
  
  try {
    // Clean up any existing test data
    await db.delete(ioltaClientLedgers).where(eq(ioltaClientLedgers.merchantId, 1));
    await db.delete(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.merchantId, 1));
    console.log("Removed existing test data");
    
    // First create a trust account
    const createAccountQuery = sql`
      INSERT INTO iolta_trust_accounts (
        merchant_id, client_id, account_name, account_number, 
        bank_name, balance, status, notes
      ) VALUES (
        1, 1, 'Test IOLTA Account', 'IOLTA-TEST-1234',
        'Test Bank', '10000.00', 'active', 'Test IOLTA account for transaction tests'
      ) RETURNING id;
    `;
    
    const accountResult = await db.execute(createAccountQuery);
    const trustAccountId = accountResult.rows[0].id;
    console.log(`Created test trust account with ID: ${trustAccountId}`);
    
    // Now create a client ledger with the trust account ID
    const createLedgerQuery = sql`
      INSERT INTO iolta_client_ledgers (
        merchant_id, trust_account_id, client_id, client_name, 
        matter_name, matter_number, jurisdiction, balance, 
        current_balance, status, notes
      ) VALUES (
        1, ${trustAccountId}, '1', 'Test Client', 
        'Test Matter', 'MAT-001', 'CA', '5000.00',
        '5000.00', 'active', 'Test client ledger for transaction tests'
      ) RETURNING id;
    `;
    
    const result = await db.execute(createLedgerQuery);
    const ledgerId = result.rows[0].id;
    
    console.log(`Created test client ledger with ID: ${ledgerId}`);
    
    // Instead of modifying the test file directly, we'll output instructions to update
    // the test data in the test-iolta-service.ts file
    console.log("\nTo fix the transaction test errors:");
    console.log("1. Update the testTransactionData.clientLedgerId to use the known ledger ID");
    console.log(`   Replace 'clientLedgerId: 0' with 'clientLedgerId: ${ledgerId}'`);
    console.log("2. Use the 'isClientId' parameter when calling getClientLedger() in the test");
    
    console.log("✅ Transaction test fix preparation completed!");
  } catch (error) {
    console.error("Error fixing transaction test:", error);
  }
}

fixTransactionTest().catch(console.error);