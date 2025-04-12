/**
 * Add missing phone_number column to legal_portal_users table
 * 
 * Run with: npx tsx scripts/add-phone-number-column.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { legalPortalUsers } from '../shared/schema-portal';

neonConfig.webSocketConstructor = ws;

async function addPhoneNumberColumn() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Adding phone_number column to legal_portal_users table if it doesn't exist...");
    
    // Check if the column exists
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_portal_users' AND column_name = 'phone_number'
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Column doesn't exist, add it
      await pool.query(`
        ALTER TABLE legal_portal_users
        ADD COLUMN phone_number VARCHAR(20)
      `);
      console.log("Added phone_number column to legal_portal_users table");
    } else {
      console.log("phone_number column already exists in legal_portal_users table");
    }
    
    console.log("Done!");
  } catch (error) {
    console.error("Error adding phone_number column:", error);
  } finally {
    await pool.end();
  }
}

addPhoneNumberColumn().catch(console.error);