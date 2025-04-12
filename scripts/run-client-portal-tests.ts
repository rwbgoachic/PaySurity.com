/**
 * Run Client Portal Tests
 * 
 * This script runs only the tests for the client portal component
 * of the legal practice management system.
 * 
 * Usage: npx tsx scripts/run-client-portal-tests.ts
 */

import chalk from 'chalk';
import { initializeLegalSystemTests, runLegalSystemTest } from '../server/services/testing/test-legal-system';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Format test results for display
 */
function formatTestResults(report: any) {
  console.log(chalk.blue.bold('\n===== CLIENT PORTAL TEST RESULTS ====='));
  
  console.log(`\n${chalk.bold(report.serviceName)}`);
  console.log(`Status: ${report.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const group of report.testGroups) {
    console.log(`\n  ${chalk.cyan(group.name)}`);
    console.log(`  Status: ${group.passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
    
    for (const test of group.tests) {
      const icon = test.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`    ${icon} ${test.name}`);
      
      if (!test.passed && test.error) {
        console.log(`      ${chalk.yellow('Error:')} ${test.error}`);
      }
      
      if (test.actual) {
        console.log(`      ${chalk.cyan('Expected:')}`, test.expected);
        console.log(`      ${chalk.cyan('Actual:')}`, test.actual);
      }
      
      totalTests++;
      if (test.passed) passedTests++;
    }
  }
  
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  
  console.log(chalk.blue.bold('\n===== SUMMARY ====='));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed Tests: ${passedTests}`);
  console.log(`Pass Rate: ${passRate.toFixed(2)}%`);
  console.log(`Duration: ${report.duration}ms`);
  console.log(chalk.blue.bold('\n==============================\n'));
  
  return {
    totalTests,
    passedTests,
    passRate
  };
}

/**
 * Run client portal tests and display results
 */
async function runTests() {
  console.log(chalk.blue.bold('Running Client Portal Tests...'));
  
  try {
    // Fix IOLTA tables first for proper functioning
    console.log(chalk.blue('Ensuring database schema is correct...'));
    
    // Check if jurisdiction column exists and has proper casing
    console.log(chalk.blue('Checking legal_clients table columns...'));
    const columnInfo = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'legal_clients'
    `);
    
    console.log('Available columns in legal_clients table:');
    columnInfo.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
    // Try a direct test query that uses the jurisdiction column
    console.log(chalk.blue('Trying direct query with jurisdiction column...'));
    try {
      const result = await db.execute(sql`
        INSERT INTO legal_clients (
          id, merchant_id, client_number, email, first_name, last_name, jurisdiction
        ) VALUES (
          999999, 1, 'TEST-DIRECT', 'test.direct@example.com', 'Test', 'Direct', 'CA'
        ) RETURNING id
      `);
      console.log('Direct query succeeded, jurisdiction column exists!');
      
      // Clean up the test entry
      await db.execute(sql`DELETE FROM legal_clients WHERE id = 999999`);
    } catch (err) {
      console.error(chalk.red('Direct query failed:'), err);
      console.log(chalk.yellow('Detailed error information:'), JSON.stringify(err, null, 2));
      
      // Try a more basic query without jurisdiction
      try {
        console.log(chalk.blue('Trying direct query WITHOUT jurisdiction column...'));
        const result = await db.execute(sql`
          INSERT INTO legal_clients (
            id, merchant_id, client_number, email, first_name, last_name
          ) VALUES (
            999999, 1, 'TEST-DIRECT', 'test.direct@example.com', 'Test', 'Direct'
          ) RETURNING id
        `);
        console.log('Basic query succeeded!');
        
        // Clean up the test entry
        await db.execute(sql`DELETE FROM legal_clients WHERE id = 999999`);
      } catch (basicErr) {
        console.error(chalk.red('Even basic query failed:'), basicErr);
      }
    }
    
    // Check table schemas
    console.log(chalk.blue('Checking schema information...'));
    const schemaInfo = await db.execute(sql`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name = 'legal_clients'
    `);
    console.log('Schema information for legal_clients:');
    schemaInfo.rows.forEach(info => {
      console.log(`  Table: ${info.table_name}, Schema: ${info.table_schema}`);
    });
    
    // Create a modified test client portal service without depending on jurisdiction
    console.log(chalk.blue('Creating custom test client portal service...'));
    
    // Specifically checking line 126 - this is where the error is occurring
    try {
      await db.execute(sql`
        SELECT EXISTS(
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'legal_matters' 
          AND column_name = 'jurisdiction'
        )
      `);
      console.log('Legal matters successfully queried');
    } catch (err) {
      console.error('Error querying legal_matters:', err);
    }
    
    // Instead of running the regular tests, let's try step by step
    console.log(chalk.blue('Trying steps from the client portal test individually...'));
    
    // Create a test client directly 
    try {
      console.log('Creating test client...');
      await db.execute(sql`
        INSERT INTO legal_clients (
          id, merchant_id, client_number, email, status, client_type, first_name, last_name, is_active
        ) VALUES (
          9999, 1, 'TEST-PORTAL-DIRECT', 'test.direct.portal@example.com', 'active', 'individual', 
          'Test', 'DirectPortal', true
        ) ON CONFLICT (id) DO NOTHING
      `);
      console.log('Test client created');
      
      // Create test matter
      console.log('Creating test matter...');
      await db.execute(sql`
        INSERT INTO legal_matters (
          id, merchant_id, client_id, status, title, description, practice_area, open_date
        ) VALUES (
          9999, 1, 9999, 'active', 'Test Direct Matter', 'Test direct portal matter', 
          'other', ${new Date().toISOString().split('T')[0]}
        ) ON CONFLICT (id) DO NOTHING
      `);
      console.log('Test matter created');
      
      // Clean up when done
      console.log('Test setup completed successfully');
    } catch (setupErr) {
      console.error('Error in direct test setup:', setupErr);
      console.log('Detailed error:', JSON.stringify(setupErr, null, 2));
    }
    
    try {
      // Run the client portal tests
      console.log(chalk.blue('Running actual client portal tests...'));
      const testReport = await runLegalSystemTest('client-portal');
      const summary = formatTestResults(testReport);
      
      // Return exit code based on test success
      process.exit(summary.passRate === 100 ? 0 : 1);
    } catch (testErr) {
      console.error('Error running tests:', testErr);
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error running tests:'), error);
    process.exit(1);
  }
}

// Execute the tests
runTests();