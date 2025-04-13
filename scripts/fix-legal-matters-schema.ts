/**
 * Fix Legal Matters Schema
 * 
 * This script adds missing columns to the legal_matters table
 * that are needed for the client portal tests.
 * 
 * Run with: npx tsx scripts/fix-legal-matters-schema.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

async function fixLegalMattersSchema() {
  console.log(chalk.blue('Starting legal_matters schema fix...'));
  
  try {
    // Add court_case_number column if it doesn't exist
    await ensureColumnExists('legal_matters', 'court_case_number', 'TEXT');
    
    // Add other columns that might be needed for portal tests
    await ensureColumnExists('legal_matters', 'show_in_client_portal', 'BOOLEAN', 'true');
    await ensureColumnExists('legal_matters', 'billing_type', 'TEXT');
    await ensureColumnExists('legal_matters', 'fixed_fee_amount', 'TEXT');
    await ensureColumnExists('legal_matters', 'contingency_percentage', 'TEXT');
    await ensureColumnExists('legal_matters', 'estimated_fees', 'TEXT');
    await ensureColumnExists('legal_matters', 'conflict_check_complete', 'BOOLEAN', 'true');
    await ensureColumnExists('legal_matters', 'court_name', 'TEXT');
    await ensureColumnExists('legal_matters', 'judge_name', 'TEXT');
    await ensureColumnExists('legal_matters', 'opposing_counsel', 'TEXT');
    await ensureColumnExists('legal_matters', 'opposing_party', 'TEXT');
    await ensureColumnExists('legal_matters', 'case_summary', 'TEXT');
    
    // Add similar columns to legal_clients
    await ensureColumnExists('legal_clients', 'portal_access', 'BOOLEAN', 'true');
    await ensureColumnExists('legal_clients', 'is_active', 'BOOLEAN', 'true');
    
    // Add columns to legal_documents
    await ensureColumnExists('legal_documents', 'show_in_client_portal', 'BOOLEAN', 'true');
    await ensureColumnExists('legal_documents', 'description', 'TEXT');
    await ensureColumnExists('legal_documents', 'document_status', 'TEXT');
    await ensureColumnExists('legal_documents', 'file_path', 'TEXT');
    await ensureColumnExists('legal_documents', 'mime_type', 'TEXT');
    await ensureColumnExists('legal_documents', 'created_by_id', 'INTEGER');
    
    // Add columns to legal_invoices 
    await ensureColumnExists('legal_invoices', 'show_in_client_portal', 'BOOLEAN', 'true');
    await ensureColumnExists('legal_invoices', 'invoice_date', 'TIMESTAMP');
    await ensureColumnExists('legal_invoices', 'subtotal', 'DECIMAL(10,2)', '0');
    await ensureColumnExists('legal_invoices', 'tax_amount', 'DECIMAL(10,2)', '0');
    await ensureColumnExists('legal_invoices', 'discount_amount', 'DECIMAL(10,2)', '0');
    await ensureColumnExists('legal_invoices', 'balance_due', 'DECIMAL(10,2)', '0');
    
    console.log(chalk.green('legal_matters schema fix completed successfully'));
  } catch (error) {
    console.error(chalk.red('Error fixing legal_matters schema:'), error);
    throw error;
  }
}

async function ensureColumnExists(tableName: string, columnName: string, columnType: string, defaultValue: string | null = null) {
  console.log(`Checking if ${columnName} column exists in ${tableName}...`);
  
  // Check if column exists
  const columnCheck = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName} AND column_name = ${columnName}
  `);
  
  if (columnCheck.rows.length === 0) {
    console.log(`Adding ${columnName} column to ${tableName}...`);
    
    // Different SQL for columns with default values
    if (defaultValue !== null) {
      await db.execute(sql`
        ALTER TABLE ${sql.raw(tableName)} 
        ADD COLUMN ${sql.raw(columnName)} ${sql.raw(columnType)} DEFAULT ${sql.raw(defaultValue)}
      `);
    } else {
      await db.execute(sql`
        ALTER TABLE ${sql.raw(tableName)} 
        ADD COLUMN ${sql.raw(columnName)} ${sql.raw(columnType)}
      `);
    }
    
    console.log(chalk.green(`Added ${columnName} column to ${tableName}`));
  } else {
    console.log(`Column ${columnName} already exists in ${tableName}`);
  }
}

// Run the function
fixLegalMattersSchema()
  .then(() => {
    console.log(chalk.green.bold('✅ legal_matters schema has been fixed!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red.bold('❌ Failed to fix legal_matters schema:'), error);
    process.exit(1);
  });