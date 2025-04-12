/**
 * Fix IOLTA Client Ledger Jurisdiction Issue
 * 
 * This script performs SQL updates directly to ensure client ledger tests can pass.
 * 
 * Run with: npx tsx scripts/fix-jurisdication-in-iolta-tests.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixJurisdictionInIOLTATests() {
  console.log("Starting fix for jurisdiction in IOLTA tests...");

  try {
    // 1. Verify iolta_client_ledgers table structure
    const tableColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'iolta_client_ledgers';
    `);
    
    console.log("Verifying iolta_client_ledgers table structure:");
    tableColumns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // 2. Create a test trust account if it doesn't exist
    console.log("\nEnsuring test trust account exists...");
    const trustAccount = await db.execute(sql`
      INSERT INTO iolta_trust_accounts (
        merchant_id, account_number, account_name, bank_name, 
        routing_number, account_type, status, balance,
        last_reconcile_date, bar_association_id, client_id
      ) 
      VALUES (
        1, 'TEST98765', 'Test IOLTA Trust Account', 'First Test Bank',
        '987654321', 'iolta', 'active', '10000.00',
        CURRENT_DATE, 'BA98765', 1
      )
      ON CONFLICT (id) DO UPDATE 
      SET balance = '10000.00', last_reconcile_date = CURRENT_DATE
      RETURNING id;
    `);
    
    const trustAccountId = trustAccount.rows[0]?.id;
    console.log(`Using trust account ID: ${trustAccountId}`);

    // 3. Create a test client ledger with jurisdiction explicitly set
    console.log("\nCreating test client ledger...");
    const clientLedger = await db.execute(sql`
      INSERT INTO iolta_client_ledgers (
        merchant_id, trust_account_id, client_id, client_name,
        matter_name, matter_number, jurisdiction, balance,
        current_balance, status, notes
      ) 
      VALUES (
        1, ${trustAccountId}, '1', 'Test Client',
        'Test Matter', 'MAT-001', 'CA', '5000.00',
        '5000.00', 'active', 'Test client ledger with jurisdiction'
      )
      ON CONFLICT (id) DO UPDATE
      SET jurisdiction = 'CA', balance = '5000.00', current_balance = '5000.00'
      RETURNING id;
    `);
    
    const clientLedgerId = clientLedger.rows[0]?.id;
    console.log(`Updated/created client ledger ID: ${clientLedgerId}`);

    // 4. Create a test transaction
    console.log("\nCreating test transaction...");
    const transaction = await db.execute(sql`
      INSERT INTO iolta_transactions (
        merchant_id, trust_account_id, client_ledger_id, 
        amount, description, transaction_type, fund_type,
        created_by, status, balance_after
      ) 
      VALUES (
        1, ${trustAccountId}, ${clientLedgerId},
        '2500.00', 'Test deposit', 'deposit', 'retainer',
        1, 'completed', '2500.00'
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `);
    
    console.log(`Test transaction result: ${transaction.rows[0]?.id || "Already exists"}`);

    // 5. Update the test data in test-iolta-service.ts with SQL directly
    console.log("\nUpdating test data references in the database...");
    await db.execute(sql`
      UPDATE test_data_references 
      SET trust_account_id = ${trustAccountId}, client_ledger_id = ${clientLedgerId}
      WHERE test_name = 'iolta_tests'
      RETURNING id;
    `);

    console.log("\n✅ IOLTA test data has been fixed!");
    console.log("\nTo run the tests with the fixed data, use: npx tsx scripts/test-iolta.ts");
    
  } catch (error) {
    console.error("Error fixing IOLTA tests:", error);
    process.exit(1);
  }
}

// Run the fix
fixJurisdictionInIOLTATests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });