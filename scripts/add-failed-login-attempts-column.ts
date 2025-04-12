/**
 * Add missing failed_login_attempts column to legal_portal_users table
 * 
 * Run with: npx tsx scripts/add-failed-login-attempts-column.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { legalPortalUsers } from '../shared/schema-portal';

neonConfig.webSocketConstructor = ws;

async function addFailedLoginAttemptsColumn() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Adding failed_login_attempts column to legal_portal_users table if it doesn't exist...");
    
    // Check if the column exists
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_portal_users' AND column_name = 'failed_login_attempts'
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Column doesn't exist, add it
      await pool.query(`
        ALTER TABLE legal_portal_users
        ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0
      `);
      console.log("Added failed_login_attempts column to legal_portal_users table");
    } else {
      console.log("failed_login_attempts column already exists in legal_portal_users table");
    }
    
    console.log("Done!");
  } catch (error) {
    console.error("Error adding failed_login_attempts column:", error);
  } finally {
    await pool.end();
  }
}

addFailedLoginAttemptsColumn().catch(console.error);