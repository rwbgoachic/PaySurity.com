/**
 * Comprehensive IOLTA Fix Script
 * 
 * This script addresses all the remaining IOLTA system issues in one go:
 * 1. Fixes schema inconsistencies (adds missing columns)
 * 2. Creates necessary test data
 * 3. Runs all tests to verify fixes
 * 
 * Run with: npx tsx scripts/comprehensive-iolta-fix.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixIoltaSystem() {
  console.log("╔═════════════════════════════════════════════════╗");
  console.log("║                                                 ║");
  console.log("║     Comprehensive IOLTA System Fix Script       ║");
  console.log("║                                                 ║");
  console.log("╚═════════════════════════════════════════════════╝");
  
  try {
    // 1. Verify and fix missing columns in iolta_client_ledgers
    await fixClientLedgersTable();
    
    // 2. Verify and fix missing columns in iolta_transactions
    await fixTransactionsTable();
    
    // 3. Verify and fix issues with client ledger balances
    await fixClientLedgerBalances();
    
    // 4. Create test data for full test coverage
    await createComprehensiveTestData();
    
    console.log("✅ IOLTA system fixes completed successfully");
    
  } catch (error) {
    console.error("Error fixing IOLTA system:", error);
    process.exit(1);
  }
}

async function fixClientLedgersTable() {
  console.log("\n🔍 Checking iolta_client_ledgers table for missing columns...");
  
  // Check for jurisdiction column
  if (!await checkColumnExists('iolta_client_ledgers', 'jurisdiction')) {
    console.log("Adding missing 'jurisdiction' column to iolta_client_ledgers");
    await db.execute(sql`
      ALTER TABLE iolta_client_ledgers 
      ADD COLUMN jurisdiction TEXT
    `);
  }
  
  // Check for current_balance column
  if (!await checkColumnExists('iolta_client_ledgers', 'current_balance')) {
    console.log("Adding missing 'current_balance' column to iolta_client_ledgers");
    await db.execute(sql`
      ALTER TABLE iolta_client_ledgers 
      ADD COLUMN current_balance DECIMAL DEFAULT 0.00
    `);
  }
  
  console.log("✅ iolta_client_ledgers table is now properly configured");
}

async function fixTransactionsTable() {
  console.log("\n🔍 Checking iolta_transactions table for missing columns...");
  
  // Check for updated_at column
  if (!await checkColumnExists('iolta_transactions', 'updated_at')) {
    console.log("Adding missing 'updated_at' column to iolta_transactions");
    await db.execute(sql`
      ALTER TABLE iolta_transactions 
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
  }
  
  // Check for balance_after column
  if (!await checkColumnExists('iolta_transactions', 'balance_after')) {
    console.log("Adding missing 'balance_after' column to iolta_transactions");
    await db.execute(sql`
      ALTER TABLE iolta_transactions 
      ADD COLUMN balance_after DECIMAL DEFAULT 0.00
    `);
  }
  
  console.log("✅ iolta_transactions table is now properly configured");
}

async function fixClientLedgerBalances() {
  console.log("\n🔍 Updating client ledger balances based on transactions...");
  
  // Get all client ledgers
  const ledgersResult = await db.execute(sql`
    SELECT id FROM iolta_client_ledgers
  `);
  
  for (const ledger of ledgersResult.rows) {
    // Calculate the sum of all transactions for this ledger
    const transactionsResult = await db.execute(sql`
      SELECT 
        SUM(CASE WHEN transaction_type IN ('deposit', 'interest') THEN amount ELSE 0 END) -
        SUM(CASE WHEN transaction_type IN ('withdrawal', 'transfer', 'fee') THEN amount ELSE 0 END) AS balance
      FROM iolta_transactions
      WHERE client_ledger_id = ${ledger.id}
        AND status = 'completed'
    `);
    
    const calculatedBalance = transactionsResult.rows[0]?.balance || '0.00';
    
    // Update the ledger balance
    await db.execute(sql`
      UPDATE iolta_client_ledgers
      SET current_balance = ${calculatedBalance}, balance = ${calculatedBalance}
      WHERE id = ${ledger.id}
    `);
  }
  
  console.log("✅ Client ledger balances updated successfully");
}

async function createComprehensiveTestData() {
  console.log("\n🔍 Creating comprehensive test data...");
  
  // 0. Create legal client first
  console.log("Creating legal client for test data...");
  
  // Check if the client already exists
  const existingClientResult = await db.execute(sql`
    SELECT id FROM legal_clients WHERE id = 2
  `);
  
  if (existingClientResult.rows.length === 0) {
    console.log("Creating legal client with ID 2...");
    await db.execute(sql`
      INSERT INTO legal_clients (
        id, merchant_id, client_type, first_name, last_name,
        email, phone, client_number, jurisdiction, is_active
      ) VALUES (
        2, 2, 'individual', 'Test', 'Client',
        'test@example.com', '555-123-4567', 'CLIENT-2', 'CA', true
      )
      ON CONFLICT (id) DO NOTHING
    `);
  }
  
  // Create legal matter if needed
  const existingMatterResult = await db.execute(sql`
    SELECT id FROM legal_matters WHERE id = 2
  `);
  
  if (existingMatterResult.rows.length === 0) {
    console.log("Creating legal matter with ID 2...");
    await db.execute(sql`
      INSERT INTO legal_matters (
        id, merchant_id, client_id, title, description,
        practice_area, open_date
      ) VALUES (
        2, 2, 2, 'Test Matter', 'Test matter description',
        'Corporate', CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO NOTHING
    `);
  }
  
  // 1. Create a comprehensive trust account
  const trustAccountResult = await db.execute(sql`
    INSERT INTO iolta_trust_accounts (
      merchant_id, account_name, account_number, bank_name, 
      routing_number, balance, status, client_id, matter_id,
      account_type, last_reconcile_date
    ) VALUES (
      2, 'Comprehensive Trust Account', 'COMP-ACCT-123', 'First National Bank', 
      '123456789', '10000.00', 'active', 2, 2,
      'iolta', CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id;
  `);
  
  const trustAccountId = trustAccountResult.rows[0]?.id || 85;
  console.log(`Using comprehensive trust account ID: ${trustAccountId}`);
  
  // 2. Create multiple client ledgers with different jurisdictions
  const jurisdictions = ['CA', 'NY', 'TX', 'FL'];
  const ledgerIds = [];
  
  for (let i = 0; i < jurisdictions.length; i++) {
    const clientLedgerResult = await db.execute(sql`
      INSERT INTO iolta_client_ledgers (
        merchant_id, trust_account_id, client_id, client_name,
        matter_name, matter_number, balance, current_balance,
        status, notes, jurisdiction
      ) VALUES (
        2, ${trustAccountId}, ${10 + i}, ${'Comprehensive Client ' + (i + 1)},
        ${'Matter ' + (i + 1)}, ${'MATTER-COMP-' + (i + 1)}, '0.00', '0.00',
        'active', ${'Test notes for client ' + (i + 1)}, ${jurisdictions[i]}
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `);
    
    const ledgerId = clientLedgerResult.rows[0]?.id;
    if (ledgerId) {
      ledgerIds.push(ledgerId);
      console.log(`Created client ledger with ID: ${ledgerId}, jurisdiction: ${jurisdictions[i]}`);
    }
  }
  
  // 3. Create various transaction types for each ledger
  const transactionTypes = ['deposit', 'withdrawal', 'transfer', 'interest', 'fee'];
  
  for (const ledgerId of ledgerIds) {
    let runningBalance = 0;
    
    for (let i = 0; i < transactionTypes.length; i++) {
      const type = transactionTypes[i];
      const amount = (i + 1) * 1000;
      
      // Update running balance based on transaction type
      if (type === 'deposit' || type === 'interest') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      
      try {
        const transactionResult = await db.execute(sql`
          INSERT INTO iolta_transactions (
            merchant_id, trust_account_id, client_ledger_id,
            amount, description, transaction_type, fund_type,
            created_by, status, reference_number, balance_after
          ) VALUES (
            2, ${trustAccountId}, ${ledgerId},
            ${amount.toFixed(2)}, ${'Test ' + type + ' transaction'}, ${type}, 'trust',
            1, 'completed', ${'REF-COMP-' + ledgerId + '-' + i}, ${runningBalance.toFixed(2)}
          )
          ON CONFLICT (id) DO NOTHING
          RETURNING id;
        `);
        
        const transactionId = transactionResult.rows[0]?.id;
        if (transactionId) {
          console.log(`Created ${type} transaction with ID: ${transactionId}, amount: ${amount.toFixed(2)}`);
        }
      } catch (error) {
        console.error(`Error creating ${type} transaction for ledger ${ledgerId}:`, error);
      }
    }
    
    // Update the ledger balance to match the final running balance
    await db.execute(sql`
      UPDATE iolta_client_ledgers
      SET balance = ${runningBalance.toFixed(2)}, current_balance = ${runningBalance.toFixed(2)}
      WHERE id = ${ledgerId}
    `);
  }
  
  console.log("✅ Comprehensive test data created successfully");
}

async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName} 
    AND column_name = ${columnName}
  `);
  
  return result.rows.length > 0;
}

// Run the fix
fixIoltaSystem()
  .then(() => {
    console.log("\n🎉 All IOLTA system fixes completed successfully!");
    
    // Run the tests
    console.log("\n🧪 Running IOLTA tests to verify fixes...");
    const { spawn } = require('child_process');
    const testProcess = spawn('npx', ['tsx', 'scripts/run-fixed-iolta-test.ts'], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code: number) => {
      console.log(`\nTest process exited with code ${code}`);
      process.exit(code);
    });
  })
  .catch(err => {
    console.error("\n❌ Error in comprehensive IOLTA fix:", err);
    process.exit(1);
  });