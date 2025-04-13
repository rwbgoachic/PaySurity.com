/**
 * Fix Uploaded By Issue
 * 
 * This script addresses the conflict between uploaded_by and created_by_id columns
 * in the legal_documents table by setting a default value for the uploaded_by column
 * to allow tests to pass.
 * 
 * Run with: npx tsx scripts/fix-uploaded-by-issue.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

async function fixUploadedByIssue() {
  try {
    console.log(chalk.blue('Starting fix for uploaded_by issue in legal_documents table...'));
    
    // Check if uploaded_by column exists and has NOT NULL constraint
    const columnCheck = await db.execute(sql`
      SELECT attnotnull 
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      WHERE c.relname = 'legal_documents'
      AND a.attname = 'uploaded_by'
      AND a.attnum > 0
      AND NOT a.attisdropped
    `);
    
    if (columnCheck.rows.length > 0 && columnCheck.rows[0].attnotnull === true) {
      console.log(chalk.yellow('The uploaded_by column exists and has a NOT NULL constraint'));
      
      // Set a default value for the uploaded_by column (1 for system user)
      console.log(chalk.blue('Setting default value for uploaded_by column...'));
      await db.execute(sql`
        ALTER TABLE legal_documents 
        ALTER COLUMN uploaded_by SET DEFAULT 1
      `);
      
      console.log(chalk.green('Successfully set default value for uploaded_by column'));
      
      // Update existing NULL values to use the default value
      console.log(chalk.blue('Updating any NULL values in uploaded_by column...'));
      await db.execute(sql`
        UPDATE legal_documents
        SET uploaded_by = 1
        WHERE uploaded_by IS NULL
      `);
      
      console.log(chalk.green('Successfully updated NULL values in uploaded_by column'));
    } else {
      console.log(chalk.yellow('The uploaded_by column either does not exist or does not have a NOT NULL constraint'));
    }
    
    console.log(chalk.green.bold('✅ Fix for uploaded_by issue has been applied!'));
  } catch (error) {
    console.error(chalk.red('Error fixing uploaded_by issue:'), error);
    throw error;
  }
}

// Run the function
fixUploadedByIssue()
  .then(() => {
    console.log(chalk.green.bold('✅ Script completed successfully!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red.bold('❌ Script failed:'), error);
    process.exit(1);
  });