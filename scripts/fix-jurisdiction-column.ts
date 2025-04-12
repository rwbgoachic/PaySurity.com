/**
 * Fix Jurisdiction Column Script
 * 
 * This script adds the jurisdiction column to the iolta_client_ledgers table
 * if it doesn't exist, as it's required for client ledger operations.
 * 
 * Run with: npx tsx scripts/fix-jurisdiction-column.ts
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixJurisdictionColumn() {
  console.log("Starting jurisdiction column fix...");
  
  try {
    // Check if jurisdiction column exists in iolta_client_ledgers
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'iolta_client_ledgers' 
      AND column_name = 'jurisdiction'
    `;
    
    const columnExists = await db.execute(checkColumnQuery);
    
    if (columnExists.rows.length === 0) {
      console.log("Jurisdiction column does not exist in iolta_client_ledgers table. Adding it now...");
      
      // Add the jurisdiction column
      const addColumnQuery = sql`
        ALTER TABLE iolta_client_ledgers
        ADD COLUMN jurisdiction TEXT
      `;
      
      await db.execute(addColumnQuery);
      console.log("Jurisdiction column added successfully.");
      
      // Add default value for existing records
      const updateDefaultsQuery = sql`
        UPDATE iolta_client_ledgers 
        SET jurisdiction = 'CA' 
        WHERE jurisdiction IS NULL
      `;
      
      await db.execute(updateDefaultsQuery);
      console.log("Set default jurisdiction value for existing records.");
    } else {
      console.log("Jurisdiction column already exists in iolta_client_ledgers table.");
    }
    
    console.log("✅ Jurisdiction column fix completed successfully!");
  } catch (error) {
    console.error("Error fixing jurisdiction column:", error);
    process.exit(1);
  }
}

fixJurisdictionColumn().catch(console.error);