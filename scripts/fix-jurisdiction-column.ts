/**
 * Fix Jurisdiction Column Script
 * 
 * This script adds the jurisdiction column to the iolta_client_ledgers table
 * if it doesn't exist, as it's required for client ledger operations.
 * 
 * Run with: npx tsx scripts/fix-jurisdiction-column.ts
 */

import { db } from '../server/db';
import { eq, sql } from 'drizzle-orm';
import { ioltaClientLedgers } from '../shared/schema-legal';

async function fixJurisdictionColumn() {
  console.log("Starting jurisdiction column fix...");
  
  try {
    // Check if the jurisdiction column exists
    const columnExists = await checkColumnExists('iolta_client_ledgers', 'jurisdiction');
    
    if (columnExists) {
      console.log("✅ jurisdiction column already exists in iolta_client_ledgers table");
    } else {
      console.log("❌ jurisdiction column missing from iolta_client_ledgers table. Adding it...");
      
      // Add the jurisdiction column
      await db.execute(sql`
        ALTER TABLE iolta_client_ledgers 
        ADD COLUMN jurisdiction TEXT;
      `);
      
      console.log("✅ jurisdiction column successfully added to iolta_client_ledgers");
    }
    
    // Verify that the column exists and update any NULL values
    if (await checkColumnExists('iolta_client_ledgers', 'jurisdiction')) {
      console.log("Updating NULL jurisdiction values to 'Unknown'...");
      
      await db.execute(sql`
        UPDATE iolta_client_ledgers
        SET jurisdiction = 'Unknown'
        WHERE jurisdiction IS NULL;
      `);
      
      console.log("✅ NULL jurisdiction values updated");
    }
    
    console.log("Jurisdiction column fix completed successfully!");
  } catch (error) {
    console.error("Error fixing jurisdiction column:", error);
    process.exit(1);
  }
}

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${tableName} 
      AND column_name = ${columnName};
    `);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}

// Run the fix
fixJurisdictionColumn()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });