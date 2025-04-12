/**
 * Add missing e_filing_date column to legal_documents table
 * 
 * Run with: npx tsx scripts/add-e-filing-date-column.ts
 */

import { sql } from '@neondatabase/serverless';
import { db } from '../server/db';
import { sqlService } from '../server/services/sql-service';

async function addEFilingDateColumn() {
  try {
    console.log("Checking if e_filing_date column exists in legal_documents table...");
    
    const columnExists = await checkColumnExists('legal_documents', 'e_filing_date');
    
    if (columnExists) {
      console.log("Column e_filing_date already exists in legal_documents table.");
      return;
    }
    
    console.log("Adding e_filing_date column to legal_documents table...");
    
    await sqlService.rawSQL(`
      ALTER TABLE legal_documents
      ADD COLUMN e_filing_date TIMESTAMP;
    `);
    
    console.log("Successfully added e_filing_date column to legal_documents table.");
  } catch (error) {
    console.error("Error adding e_filing_date column:", error);
  }
}

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await sqlService.rawSQL(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = '${tableName}'
    AND column_name = '${columnName}';
  `);
  
  return result.length > 0;
}

// Run the function
addEFilingDateColumn().then(() => {
  console.log("Script completed.");
  process.exit(0);
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});