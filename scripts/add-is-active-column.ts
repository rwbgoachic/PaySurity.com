/**
 * Add missing is_active column to legal_portal_users table
 * 
 * Run with: npx tsx scripts/add-is-active-column.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { legalPortalUsers } from '../shared/schema-portal';

neonConfig.webSocketConstructor = ws;

async function addIsActiveColumn() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Adding is_active column to legal_portal_users table if it doesn't exist...");
    
    // Check if the column exists
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_portal_users' AND column_name = 'is_active'
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Column doesn't exist, add it
      await pool.query(`
        ALTER TABLE legal_portal_users
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE
      `);
      console.log("Added is_active column to legal_portal_users table");
    } else {
      console.log("is_active column already exists in legal_portal_users table");
    }
    
    console.log("Done!");
  } catch (error) {
    console.error("Error adding is_active column:", error);
  } finally {
    await pool.end();
  }
}

addIsActiveColumn().catch(console.error);