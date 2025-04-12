/**
 * Test IOLTA Transactions
 * 
 * This script runs specific tests for IOLTA transaction operations
 * to diagnose issues with transaction creation and balances
 * 
 * Run with: npx tsx scripts/test-iolta-transactions.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';
import { IoltaTransactionSqlService } from '../server/services/legal/iolta-transaction-sql-service';

async function testIoltaTransactions() {
  console.log(chalk.blue('Starting IOLTA transaction tests...'));

  // Create a test environment with real data
  try {
    // First create a test merchant
    console.log(chalk.blue('Creating test merchant...'));
    const merchantResult = await db.execute(sql`
      INSERT INTO merchants (
        name, business_name, business_type, status, 
        contact_name, email, phone, address, city, state, 
        zip, country, created_at, updated_at
      )
      VALUES (
        'Test Merchant', 'Test Law Firm LLC', 'legal', 'active',
        'John Doe', 'test@example.com', '555-123-4567', '123 Test St',
        'Testville', 'TS', '12345', 'US', NOW(), NOW()
      )
      RETURNING id
    `);
    
    const merchantId = merchantResult.rows[0].id;
    console.log(chalk.green(`Created test merchant with ID: ${merchantId}`));
    
    // Create a test client first (needed for trust account)
    console.log(chalk.blue('Creating test client...'));
    const clientResult = await db.execute(sql`
      INSERT INTO legal_clients (
        merchant_id, first_name, last_name, email, phone, address, city, state, 
        zip, client_number, client_type, status, jurisdiction, is_active, intake_date,
        created_at, updated_at
      )
      VALUES (
        ${merchantId}, 'Test', 'Client', 'test@example.com', '555-123-4567',
        '123 Test St', 'Testville', 'TS', '12345', 'CLIENT-001',
        'individual', 'active', 'CA', true, NOW(), NOW(), NOW()
      )
      RETURNING id
    `);
    
    const clientId = clientResult.rows[0].id;
    console.log(chalk.green(`Created test client with ID: ${clientId}`));
    
    // Create a test trust account
    console.log(chalk.blue('Creating test trust account...'));
    const trustAccountResult = await db.execute(sql`
      INSERT INTO iolta_trust_accounts (
        merchant_id, client_id, account_number, bank_name, description, 
        account_type, balance, status, created_at, updated_at
      )
      VALUES (
        ${merchantId}, ${clientId}, 'TEST-ACCT-12345', 'Test Bank', 'Test Trust Account', 
        'checking', '0.00', 'active', NOW(), NOW()
      )
      RETURNING id
    `);
    
    const trustAccountId = trustAccountResult.rows[0].id;
    console.log(chalk.green(`Created test trust account with ID: ${trustAccountId}`));
    
    // Create a test client ledger
    console.log(chalk.blue('Creating test client ledger...'));
    const ledgerResult = await db.execute(sql`
      INSERT INTO iolta_client_ledgers (
        merchant_id, trust_account_id, client_id, matter_id,
        description, balance, current_balance, status, created_at, updated_at
      )
      VALUES (
        ${merchantId}, ${trustAccountId}, ${clientId}, NULL,
        'Test Client Ledger', '0.00', '0.00', 'active', NOW(), NOW()
      )
      RETURNING id
    `);
    
    const ledgerId = ledgerResult.rows[0].id;
    console.log(chalk.green(`Created test client ledger with ID: ${ledgerId}`));
    
    // Create a test user for the transactions
    console.log(chalk.blue('Creating test user...'));
    const userResult = await db.execute(sql`
      INSERT INTO users (
        username, password, first_name, last_name, email, role, merchant_id,
        created_at
      )
      VALUES (
        'testuser', 'password', 'Test', 'User', 'testuser@example.com', 'admin', ${merchantId},
        NOW()
      )
      RETURNING id
    `);
    
    const userId = userResult.rows[0].id;
    console.log(chalk.green(`Created test user with ID: ${userId}`));
    
    // Now test creating a deposit transaction
    console.log(chalk.blue('Creating deposit transaction...'));
    
    const transactionService = new IoltaTransactionSqlService();
    
    try {
      const depositResult = await transactionService.createTransaction({
        merchantId: Number(merchantId),
        trustAccountId: Number(trustAccountId),
        clientLedgerId: Number(ledgerId),
        amount: '500.00',
        description: 'Test Deposit',
        transactionType: 'deposit',
        fundType: 'retainer',
        createdBy: Number(userId),
        status: 'completed',
        referenceNumber: 'REF-001',
        payee: '',
        payor: 'Test Client',
        notes: 'Test deposit transaction'
      });
      
      console.log(chalk.green('Deposit transaction created successfully'));
      console.log(chalk.green(`Transaction ID: ${depositResult.transaction.id}`));
      console.log(chalk.green(`Updated ledger balance: ${depositResult.updatedLedgerBalance}`));
      console.log(chalk.green(`Updated account balance: ${depositResult.updatedAccountBalance}`));
      
      // Test creating a withdrawal transaction
      console.log(chalk.blue('Creating withdrawal transaction...'));
      
      const withdrawalResult = await transactionService.createTransaction({
        merchantId: Number(merchantId),
        trustAccountId: Number(trustAccountId),
        clientLedgerId: Number(ledgerId),
        amount: '200.00',
        description: 'Test Withdrawal',
        transactionType: 'withdrawal',
        fundType: 'operating', // changed from 'earned' to match allowed values
        createdBy: Number(userId),
        status: 'completed',
        referenceNumber: 'REF-002',
        payee: 'Law Firm',
        payor: '',
        notes: 'Test withdrawal transaction'
      });
      
      console.log(chalk.green('Withdrawal transaction created successfully'));
      console.log(chalk.green(`Transaction ID: ${withdrawalResult.transaction.id}`));
      console.log(chalk.green(`Updated ledger balance: ${withdrawalResult.updatedLedgerBalance}`));
      console.log(chalk.green(`Updated account balance: ${withdrawalResult.updatedAccountBalance}`));
      
      // Test retrieving transactions
      console.log(chalk.blue('Retrieving transactions...'));
      const transactions = await transactionService.getClientLedgerTransactions(Number(ledgerId));
      
      console.log(chalk.green(`Retrieved ${transactions.length} transactions`));
      transactions.forEach((tx, index) => {
        console.log(chalk.green(`Transaction ${index + 1}:`));
        console.log(chalk.blue(`  ID: ${tx.id}`));
        console.log(chalk.blue(`  Type: ${tx.transactionType}`));
        console.log(chalk.blue(`  Amount: ${tx.amount}`));
        console.log(chalk.blue(`  Balance After: ${tx.balanceAfter}`));
        console.log(chalk.blue(`  Description: ${tx.description}`));
      });
      
      console.log(chalk.green('All transaction tests completed successfully!'));
      
    } catch (error) {
      console.error(chalk.red('Error creating transaction:'), error);
      throw error;
    }
    
    // Clean up test data
    console.log(chalk.blue('Cleaning up test data...'));
    
    await db.execute(sql`DELETE FROM iolta_transactions WHERE client_ledger_id = ${ledgerId}`);
    await db.execute(sql`DELETE FROM iolta_client_ledgers WHERE id = ${ledgerId}`);
    await db.execute(sql`DELETE FROM iolta_trust_accounts WHERE id = ${trustAccountId}`);
    await db.execute(sql`DELETE FROM legal_clients WHERE id = ${clientId}`);
    await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
    await db.execute(sql`DELETE FROM merchants WHERE id = ${merchantId}`);
    
    console.log(chalk.green('Test data cleaned up successfully'));
    
  } catch (error) {
    console.error(chalk.red('Error in IOLTA transaction tests:'), error);
    throw error;
  }
}

// Run the test function
testIoltaTransactions()
  .then(() => {
    console.log(chalk.green.bold('✅ IOLTA transaction tests completed successfully!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red.bold('❌ IOLTA transaction tests failed:'), error);
    process.exit(1);
  });