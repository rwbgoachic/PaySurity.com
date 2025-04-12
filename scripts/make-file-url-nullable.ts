/**
 * Make file_url column nullable in legal_documents table
 * 
 * Run with: npx tsx scripts/make-file-url-nullable.ts
 */

import { sqlService } from '../server/services/sql-service';

async function makeFileUrlNullable() {
  try {
    console.log("Checking if file_url column exists in legal_documents table...");
    
    const columnExists = await checkColumnExists('legal_documents', 'file_url');
    
    if (!columnExists) {
      console.log("Column file_url doesn't exist in legal_documents table.");
      return;
    }
    
    console.log("Making file_url column nullable in legal_documents table...");
    
    await sqlService.rawSQL(`
      ALTER TABLE legal_documents
      ALTER COLUMN file_url DROP NOT NULL;
    `);
    
    console.log("Successfully made file_url column nullable in legal_documents table.");
  } catch (error) {
    console.error("Error modifying file_url column:", error);
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
makeFileUrlNullable().then(() => {
  console.log("Script completed.");
  process.exit(0);
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});