/**
 * Add missing court_document_id column to legal_documents table
 * 
 * Run with: npx tsx scripts/add-court-document-id-column.ts
 */

import { sql } from '@neondatabase/serverless';
import { db } from '../server/db';
import { sqlService } from '../server/services/sql-service';

async function addCourtDocumentIdColumn() {
  try {
    console.log("Checking if court_document_id column exists in legal_documents table...");
    
    const columnExists = await checkColumnExists('legal_documents', 'court_document_id');
    
    if (columnExists) {
      console.log("Column court_document_id already exists in legal_documents table.");
      return;
    }
    
    console.log("Adding court_document_id column to legal_documents table...");
    
    await sqlService.rawSQL(`
      ALTER TABLE legal_documents
      ADD COLUMN court_document_id TEXT;
    `);
    
    console.log("Successfully added court_document_id column to legal_documents table.");
  } catch (error) {
    console.error("Error adding court_document_id column:", error);
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
addCourtDocumentIdColumn().then(() => {
  console.log("Script completed.");
  process.exit(0);
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});