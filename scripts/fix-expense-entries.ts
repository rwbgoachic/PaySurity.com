/**
 * Fix Expense Entries Table Script
 * 
 * This script creates the legal_expense_entries table if missing
 * 
 * Run with: npx tsx scripts/fix-expense-entries.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function fixExpenseEntries() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Checking legal_expense_entries table...");

    // 1. Check if table exists
    const tableExists = await checkTableExists('legal_expense_entries');
    
    if (!tableExists) {
      console.log("Creating legal_expense_entries table");
      
      await pool.query(`
        CREATE TABLE legal_expense_entries (
          id SERIAL PRIMARY KEY,
          merchant_id INTEGER NOT NULL,
          client_id INTEGER,
          matter_id INTEGER,
          user_id INTEGER NOT NULL,
          date DATE NOT NULL,
          expense_type TEXT NOT NULL,
          amount NUMERIC(10, 2) NOT NULL,
          description TEXT,
          billable BOOLEAN NOT NULL DEFAULT TRUE,
          show_in_client_portal BOOLEAN NOT NULL DEFAULT TRUE,
          invoice_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          receipt_id INTEGER,
          status TEXT DEFAULT 'pending'
        )
      `);
      
      console.log("Created legal_expense_entries table");
    } else {
      console.log("legal_expense_entries table already exists");
      
      // Check and add show_in_client_portal column if needed
      const hasColumn = await checkColumnExists('legal_expense_entries', 'show_in_client_portal');
      
      if (!hasColumn) {
        await pool.query(`
          ALTER TABLE legal_expense_entries
          ADD COLUMN show_in_client_portal BOOLEAN NOT NULL DEFAULT TRUE
        `);
        console.log("Added show_in_client_portal column to legal_expense_entries");
      } else {
        console.log("show_in_client_portal column already exists");
      }
    }
    
    console.log("Expense entries table setup complete!");
  } catch (error) {
    console.error("Error with expense entries table:", error);
  } finally {
    await pool.end();
  }

  /**
   * Check if a table exists
   */
  async function checkTableExists(tableName: string): Promise<boolean> {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [tableName]);
    
    return result.rows[0].exists;
  }
  
  /**
   * Check if a column exists in a table
   */
  async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      )
    `, [tableName, columnName]);
    
    return result.rows[0].exists;
  }
}

fixExpenseEntries().catch(console.error);