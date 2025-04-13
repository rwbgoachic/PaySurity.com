/**
 * Fix IOLTA Test Transaction Handling
 * 
 * This script addresses issues with the IOLTA transaction tests by updating
 * the transaction creation logic to properly handle balance_after field
 * in test-legal-iolta.ts.
 * 
 * Run with: npx tsx scripts/fix-iolta-test-transactions.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// Main function to fix IOLTA test transactions
async function fixIoltaTestTransactions() {
  console.log(chalk.blue('Starting IOLTA test transaction fix...'));
  
  try {
    // 1. First, fix the testTransactionOperations method in test-legal-iolta.ts
    const testFilePath = path.join(process.cwd(), 'server/services/testing/test-legal-iolta.ts');
    
    // Read the file
    let fileContent = fs.readFileSync(testFilePath, 'utf8');
    
    // Update the transaction creation code with a custom override method
    if (!fileContent.includes('createTransaction')) {
      const originalTestTransactionOperations = fileContent.match(/private async testTransactionOperations\(report: TestReport\) {\s*console\.log\('Testing transaction operations\.\.\.'\);[\s\S]*?testGroup\.passed = testGroup\.tests\.every\(test => test\.passed\);\s*report\.testGroups!\.push\(testGroup\);\s*}/);
      
      if (originalTestTransactionOperations) {
        const newTestTransactionOperations = `private async testTransactionOperations(report: TestReport) {
    console.log('Testing transaction operations...');
    
    const testGroup: TestGroup = {
      name: 'Transaction Operations',
      description: 'Tests for IOLTA transaction functionality',
      tests: [],
      passed: true
    };
    
    // Helper function to create a transaction safely with balance calculation
    async function createTransaction(db, data) {
      // Get current balance from client ledger
      const ledgerResult = await db.execute(sql\`
        SELECT current_balance 
        FROM iolta_client_ledgers 
        WHERE id = \${data.clientLedgerId}
      \`);
      
      const currentBalance = ledgerResult.rows[0]?.current_balance || '0';
      let newBalance = parseFloat(currentBalance);
      
      // Update balance based on transaction type
      if (data.transactionType === 'deposit' || data.transactionType === 'interest') {
        newBalance += parseFloat(data.amount);
      } else if (data.transactionType === 'withdrawal' || data.transactionType === 'fee') {
        newBalance -= parseFloat(data.amount);
      }
      
      // Add balance_after to the transaction data
      const transactionData = {
        ...data,
        balanceAfter: newBalance.toString()
      };
      
      // Insert the transaction
      const [transaction] = await db.insert(ioltaTransactions)
        .values(transactionData)
        .returning();
      
      // Update the client ledger balance
      await db.execute(sql\`
        UPDATE iolta_client_ledgers
        SET current_balance = \${newBalance.toString()}, balance = \${newBalance.toString()}
        WHERE id = \${data.clientLedgerId}
      \`);
      
      return transaction;
    }
    
    // Test creating a deposit transaction
    try {
      const depositData = insertIoltaTransactionSchema.parse({
        trustAccountId: this.trustAccountId,
        clientLedgerId: this.clientLedgerId,
        merchantId: this.merchantId,
        transactionDate: new Date().toISOString().split('T')[0],
        transactionType: 'deposit',
        amount: '1000.00',
        description: 'Initial deposit',
        referenceNumber: 'DEP-12345',
        fundType: 'trust',
        createdBy: 1,
        status: 'completed'
      });
      
      // Use our helper function instead of direct db.insert
      const deposit = await createTransaction(db, depositData);
      
      this.transactionIds.push(deposit.id);
      
      testGroup.tests.push({
        name: 'Create Deposit Transaction',
        description: 'Test that a deposit transaction can be created',
        passed: !!deposit && deposit.transactionType === 'deposit' && deposit.amount === '1000.00',
        error: (!!deposit && deposit.transactionType === 'deposit' && deposit.amount === '1000.00') ? null : 'Failed to create deposit transaction'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Deposit Transaction',
        description: 'Test that a deposit transaction can be created',
        passed: false,
        error: \`Error: \${error instanceof Error ? error.message : String(error)}\`
      });
    }
    
    // Test creating a withdrawal transaction
    try {
      const withdrawalData = insertIoltaTransactionSchema.parse({
        trustAccountId: this.trustAccountId,
        clientLedgerId: this.clientLedgerId,
        merchantId: this.merchantId,
        transactionDate: new Date().toISOString().split('T')[0],
        transactionType: 'withdrawal',
        amount: '300.00',
        description: 'Withdrawal for client expenses',
        referenceNumber: 'WIT-12345',
        fundType: 'trust',
        createdBy: 1,
        status: 'completed'
      });
      
      // Use our helper function instead of direct db.insert
      const withdrawal = await createTransaction(db, withdrawalData);
      
      this.transactionIds.push(withdrawal.id);
      
      testGroup.tests.push({
        name: 'Create Withdrawal Transaction',
        description: 'Test that a withdrawal transaction can be created',
        passed: !!withdrawal && withdrawal.transactionType === 'withdrawal' && withdrawal.amount === '300.00',
        error: (!!withdrawal && withdrawal.transactionType === 'withdrawal' && withdrawal.amount === '300.00') ? null : 'Failed to create withdrawal transaction'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Create Withdrawal Transaction',
        description: 'Test that a withdrawal transaction can be created',
        passed: false,
        error: \`Error: \${error instanceof Error ? error.message : String(error)}\`
      });
    }
    
    // Test retrieving transactions
    try {
      const transactions = await db.select().from(ioltaTransactions)
        .where(eq(ioltaTransactions.clientLedgerId, this.clientLedgerId!));
      
      testGroup.tests.push({
        name: 'Retrieve Transactions',
        description: 'Test that transactions can be retrieved',
        passed: Array.isArray(transactions) && transactions.length === 2,
        error: (Array.isArray(transactions) && transactions.length === 2) ? null : 'Failed to retrieve transactions or incorrect number of transactions'
      });
    } catch (error) {
      testGroup.tests.push({
        name: 'Retrieve Transactions',
        description: 'Test that transactions can be retrieved',
        passed: false,
        error: \`Error: \${error instanceof Error ? error.message : String(error)}\`
      });
    }
    
    testGroup.passed = testGroup.tests.every(test => test.passed);
    report.testGroups!.push(testGroup);
  }`;
        
        fileContent = fileContent.replace(originalTestTransactionOperations[0], newTestTransactionOperations);
        
        // Write the updated file
        fs.writeFileSync(testFilePath, fileContent);
        console.log(chalk.green('✅ Successfully updated testTransactionOperations method in test-legal-iolta.ts'));
      } else {
        console.error(chalk.red('Could not find testTransactionOperations method in file'));
      }
    } else {
      console.log(chalk.yellow('createTransaction helper already exists in the file, skipping modification'));
    }
    
    // 2. Fix any existing transaction data - ensure all transactions have a balance_after value
    console.log(chalk.blue('Ensuring all transactions have proper balance_after values...'));
    
    // Get all transactions without balance_after value
    const nullBalanceTransactions = await db.execute(sql`
      SELECT id, trust_account_id, client_ledger_id, transaction_type, amount 
      FROM iolta_transactions 
      WHERE balance_after IS NULL;
    `);
    
    console.log(chalk.blue(`Found ${nullBalanceTransactions.rows.length} transactions with NULL balance_after`));
    
    // Process each transaction to set the balance_after
    for (const tx of nullBalanceTransactions.rows) {
      // Get current balance for the client ledger
      const ledgerResult = await db.execute(sql`
        SELECT current_balance 
        FROM iolta_client_ledgers 
        WHERE id = ${tx.client_ledger_id}
      `);
      
      // Default to 0 if no current_balance exists
      const currentBalance = parseFloat(ledgerResult.rows[0]?.current_balance || '0');
      const txAmount = parseFloat(tx.amount || '0');
      
      // Calculate new balance based on transaction type
      let newBalance = currentBalance;
      if (tx.transaction_type === 'deposit' || tx.transaction_type === 'interest') {
        newBalance = currentBalance + txAmount;
      } else if (tx.transaction_type === 'withdrawal' || tx.transaction_type === 'fee') {
        newBalance = currentBalance - txAmount;
      }
      
      // Update the transaction with the calculated balance_after
      await db.execute(sql`
        UPDATE iolta_transactions
        SET balance_after = ${newBalance.toString()}
        WHERE id = ${tx.id}
      `);
      
      console.log(chalk.green(`Updated transaction ID: ${tx.id} with balance_after: ${newBalance.toString()}`));
    }
    
    console.log(chalk.blue('IOLTA test transaction fix completed successfully.'));
    
  } catch (error) {
    console.error(chalk.red('Error fixing IOLTA test transactions:'), error);
    throw error;
  }
}

// Run the fix function
fixIoltaTestTransactions()
  .then(() => {
    console.log(chalk.green.bold('✅ IOLTA test transactions have been fixed successfully!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red.bold('❌ Failed to fix IOLTA test transactions:'), error);
    process.exit(1);
  });