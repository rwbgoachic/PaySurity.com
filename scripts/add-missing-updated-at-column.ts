/**
 * Add missing updated_at column to iolta_transactions table
 * 
 * Run with: npx tsx scripts/add-missing-updated-at-column.ts
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addMissingUpdatedAtColumn() {
  console.log("Starting to add missing updated_at column to iolta_transactions table...");
  
  try {
    // Check if the column already exists
    const checkColumnQuery = sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'updated_at'
      );
    `;
    
    const checkResult = await db.execute(checkColumnQuery);
    const columnExists = checkResult.rows[0]?.exists || false;
    
    if (!columnExists) {
      // Add the missing column
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      
      console.log("✅ Added missing updated_at column to iolta_transactions table");
    } else {
      console.log("Column updated_at already exists in iolta_transactions table");
    }
    
  } catch (error) {
    console.error("Error adding updated_at column:", error);
  }
}

addMissingUpdatedAtColumn().catch(console.error);