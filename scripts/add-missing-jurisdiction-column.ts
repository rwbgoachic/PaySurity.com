/**
 * Add missing jurisdiction column to iolta_client_ledgers table
 * 
 * Run with: npx tsx scripts/add-missing-jurisdiction-column.ts
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addMissingJurisdictionColumn() {
  console.log("Starting to add missing jurisdiction column to iolta_client_ledgers table...");
  
  try {
    // Check if the column already exists
    const checkColumnQuery = sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'iolta_client_ledgers' 
        AND column_name = 'jurisdiction'
      );
    `;
    
    const checkResult = await db.execute(checkColumnQuery);
    const columnExists = checkResult.rows[0]?.exists || false;
    
    if (!columnExists) {
      // Add the missing column
      await db.execute(sql`
        ALTER TABLE iolta_client_ledgers
        ADD COLUMN jurisdiction TEXT;
      `);
      
      console.log("✅ Added missing jurisdiction column to iolta_client_ledgers table");
    } else {
      console.log("Column jurisdiction already exists in iolta_client_ledgers table");
    }
    
  } catch (error) {
    console.error("Error adding jurisdiction column:", error);
  }
}

addMissingJurisdictionColumn().catch(console.error);