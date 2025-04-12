/**
 * Fix Client Portal Test Script
 * 
 * This script creates a modified version of the client portal test class
 * that doesn't rely on the jurisdiction column to fix recurring errors.
 */

import { sql } from 'drizzle-orm';
import { db } from '../server/db';
import chalk from 'chalk';
import { ClientPortalTestService } from '../server/services/testing/test-client-portal';
import { ClientPortalService } from '../server/services/legal/client-portal-service';

// Define a new class that extends the original test service and overrides setupTestData
class FixedClientPortalTestService extends ClientPortalTestService {
  clientPortalService = new ClientPortalService();
  // Override the setupTestData method
  async setupTestData(): Promise<void> {
    console.log(chalk.blue('Setting up test data with modified approach...'));
    
    try {
      // Create test client directly with SQL
      console.log('Creating test client...');
      const result = await db.execute(sql`
        INSERT INTO legal_clients (
          id, merchant_id, client_number, email, status, client_type, first_name, last_name, is_active
        ) VALUES (
          1, 1, 'TEST-PORTAL-FIXED', 'test.portal.fixed@example.com', 'active', 'individual', 
          'Test', 'PortalFixed', true
        ) ON CONFLICT (id) DO NOTHING
        RETURNING id
      `);
      console.log('Test client created or already exists');
      
      // Create test matter
      console.log('Creating test matter...');
      await db.execute(sql`
        INSERT INTO legal_matters (
          id, merchant_id, client_id, matter_number, status, title, description, 
          practice_area, open_date, billing_type, matter_type
        ) VALUES (
          1, 1, 1, 'PORTAL-FIXED-001', 'active', 'Test Portal Fixed Matter', 
          'Test client portal fixed matter', 'other', CURRENT_DATE, 'hourly', 'general'
        ) ON CONFLICT (id) DO NOTHING
      `);
      console.log('Test matter created or already exists');
      
      // Create IOLTA account
      console.log('Creating IOLTA account...');
      const accountResult = await db.execute(sql`
        INSERT INTO iolta_trust_accounts (
          id, merchant_id, client_id, account_number, account_name, bank_name,
          routing_number, account_type, status, balance
        ) VALUES (
          1, 1, 1, 'PORTAL-FIXED-12345', 'Test Portal Fixed IOLTA Account', 
          'First National Test Bank', '123456789', 'iolta', 'active', '10000.00'
        ) ON CONFLICT (id) DO NOTHING
        RETURNING id
      `);
      console.log('IOLTA account created or already exists');
      
      // Add client ledger
      console.log('Creating client ledger...');
      
      // First check if client ledger already exists
      const existingLedger = await db.execute(sql`
        SELECT id FROM iolta_client_ledgers 
        WHERE client_id = '1' AND trust_account_id = 1
      `);
      
      // Only insert if no record exists
      if (!existingLedger.rows.length) {
        await db.execute(sql`
          INSERT INTO iolta_client_ledgers (
            merchant_id, client_id, trust_account_id, client_name, matter_name, matter_number,
            balance, status
          ) VALUES (
            1, '1', 1, 'Test PortalFixed', 'Test Portal Fixed Matter', 'TPFM-001',
            '5000.00', 'active'
          )
        `);
      }
      console.log('Client ledger created or already exists');
      
      // Create test transaction
      console.log('Creating test transaction...');
      await db.execute(sql`
        INSERT INTO iolta_transactions (
          amount, balance_after, description, transaction_type, created_by, merchant_id,
          trust_account_id, client_ledger_id, fund_type, status, bank_reference, 
          check_number, payee, reference, transaction_date
        ) VALUES (
          '5000.00', '5000.00', 'Initial client retainer', 'deposit', 1, 1,
          1, 1, 'retainer', 'completed', 'TPORTAL-FIXED-1001',
          'N/A', 'N/A', 'Portal Test Fixed Transaction', CURRENT_DATE
        ) ON CONFLICT DO NOTHING
      `);
      console.log('Transaction created or already exists');
      
      // Create test document
      console.log('Creating test document...');
      await db.execute(sql`
        INSERT INTO legal_documents (
          merchant_id, title, document_type, status, client_id, 
          matter_id, file_url, file_size, is_private, uploaded_by
        ) VALUES (
          1, 'Test Portal Fixed Document', 'client_communication', 'final',
          1, 1, '/test/portal/fixed-document.pdf',
          1024, false, 1
        ) ON CONFLICT DO NOTHING
      `);
      console.log('Test document created or already exists');
      
      // Create test invoice
      console.log('Creating test invoice...');
      await db.execute(sql`
        INSERT INTO legal_invoices (
          merchant_id, client_id, matter_id, invoice_number, issue_date, 
          due_date, status, total_amount, notes, subtotal, discount_amount,
          tax_amount, amount_paid, balance_due, time_entries_total, expenses_total
        ) VALUES (
          1, 1, 1, 'TEST-PORTAL-FIXED-001', CURRENT_DATE, 
          CURRENT_DATE + INTERVAL '30 days', 'sent', '500.00', 'Test portal fixed invoice',
          '500.00', '0.00', '0.00', '0.00', '500.00', '400.00', '100.00'
        ) ON CONFLICT DO NOTHING
      `);
      console.log('Test invoice created or already exists');
      
      // Create test portal user
      console.log('Creating test portal user...');
      // First check if user already exists
      const existingUser = await db.execute(sql`
        SELECT id FROM legal_portal_users 
        WHERE email = 'test.portal.fixed@example.com' AND merchant_id = 1
      `);
      
      if (existingUser.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO legal_portal_users (
            email, client_id, password_hash, merchant_id, first_name, last_name,
            is_active, phone_number
          ) VALUES (
            'test.portal.fixed@example.com', 1, 'P@ssw0rd123!', 1, 'Test', 'PortalUser',
            true, '555-123-4567'
          )
        `);
      }
      console.log('Test portal user created or already exists');
      
      console.log(chalk.green('✓ Test data setup complete'));
    } catch (error) {
      console.error(chalk.red('Error setting up test data:'), error);
      throw error;
    }
  }
}

// Main function to run the tests
async function runFixedTests() {
  console.log(chalk.blue.bold('Running Fixed Client Portal Tests...'));
  
  try {
    // Create an instance of our fixed test service
    const fixedTestService = new FixedClientPortalTestService();
    
    // Run the tests
    console.log(chalk.blue('Running tests with fixed data setup...'));
    const testReport = await fixedTestService.runTests();
    
    // Display test results
    console.log(chalk.cyan('\n===== CLIENT PORTAL TEST RESULTS =====\n'));
    console.log(`Service: ${chalk.bold(testReport.serviceName)}`);
    console.log(`Status: ${testReport.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
    console.log(`Duration: ${testReport.duration}ms`);
    
    if (testReport.error) {
      console.log(chalk.red(`Error: ${testReport.error}`));
    }
    
    console.log(chalk.cyan('\n===== TEST GROUPS =====\n'));
    testReport.testGroups.forEach(group => {
      console.log(`${chalk.bold(group.name)}: ${group.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
      console.log(`Description: ${group.description}`);
      console.log(`Tests: ${group.tests.length} total, ${group.tests.filter(t => t.passed).length} passed`);
      
      group.tests.forEach(test => {
        console.log(`  - ${test.name}: ${test.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
        if (test.error) {
          console.log(`    Error: ${chalk.red(test.error)}`);
        }
      });
      
      console.log('');
    });
    
    console.log(chalk.cyan('===== SUMMARY ====='));
    console.log(`Total Tests: ${testReport.testGroups.reduce((acc, group) => acc + group.tests.length, 0)}`);
    console.log(`Passed Tests: ${testReport.testGroups.reduce((acc, group) => acc + group.tests.filter(t => t.passed).length, 0)}`);
    console.log(`Pass Rate: ${(testReport.testGroups.reduce((acc, group) => acc + group.tests.filter(t => t.passed).length, 0) / 
                              testReport.testGroups.reduce((acc, group) => acc + group.tests.length, 0) * 100).toFixed(2)}%`);
    
    console.log(chalk.cyan('\n==============================\n'));
    
    process.exit(testReport.passed ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('Error running tests:'), error);
    process.exit(1);
  }
}

// Run the tests
runFixedTests();