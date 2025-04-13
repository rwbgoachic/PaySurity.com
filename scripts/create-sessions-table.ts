/**
 * Create Sessions Table Script
 * 
 * This script creates the required PostgreSQL sessions table for Express 
 * sessions with connect-pg-simple. This fixes the server 503 error during login.
 * 
 * Run with: npx tsx scripts/create-sessions-table.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

// Set up WebSocket for NeonDB
neonConfig.webSocketConstructor = ws;

async function createSessionsTable() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Checking for sessions table...');
    
    // Check if table exists
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      )
    `);
    
    const tableExists = tableResult.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Sessions table already exists.');
      return;
    }
    
    console.log('⚠️ Sessions table missing. Creating now...');
    
    // SQL for connect-pg-simple sessions table
    // From: https://github.com/voxpelli/node-connect-pg-simple/blob/main/table.sql
    await pool.query(`
      CREATE TABLE "sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
      );
      
      CREATE INDEX "IDX_sessions_expire" ON "sessions" ("expire");
    `);
    
    console.log('✅ Sessions table created successfully!');
    
    // Create an index on the sid column for better performance
    console.log('📊 Creating additional performance index...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sessions_sid" ON "sessions" ("sid");
    `);
    
    console.log('✨ Setup complete! The login system should now work correctly.');
  } catch (error) {
    console.error('❌ Error creating sessions table:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
createSessionsTable();