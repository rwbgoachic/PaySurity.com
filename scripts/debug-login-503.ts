/**
 * Debug Login 503 Error Script
 * 
 * This script checks the most common causes of 503 errors during login:
 * 1. Missing sessions table
 * 2. Corrupted session data
 * 3. Connection issues with the database
 * 4. Middleware configuration problems
 * 
 * Run with: npx tsx scripts/debug-login-503.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import ws from 'ws';
import fs from 'fs';
import 'dotenv/config';

// Set up WebSocket for NeonDB
neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(scrypt);

// Method to check if we can connect to the database
async function checkDatabaseConnection() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Testing database connection...');
    const { rows } = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Method to check and fix sessions table
async function checkSessionsTable() {
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
      console.log('✅ Sessions table exists.');
      
      // Check if there are any sessions
      const sessionCount = await pool.query(`
        SELECT COUNT(*) FROM sessions
      `);
      
      console.log(`ℹ️ Found ${sessionCount.rows[0].count} sessions in the database.`);
      
      // Clean up expired sessions
      const deleteResult = await pool.query(`
        DELETE FROM sessions WHERE expire < NOW()
      `);
      
      console.log(`🧹 Cleaned up ${deleteResult.rowCount} expired sessions.`);
      
      return true;
    } else {
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
      
      return true;
    }
  } catch (error) {
    console.error('❌ Error checking/creating sessions table:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Check if auth.ts has the correct session setup
async function checkAuthConfig() {
  try {
    console.log('🔍 Checking auth configuration...');
    
    const authPath = './server/auth.ts';
    if (!fs.existsSync(authPath)) {
      console.error('❌ Could not find auth.ts file at', authPath);
      return false;
    }
    
    const authContent = fs.readFileSync(authPath, 'utf8');
    
    // Check for session setup
    const hasSessionStore = authContent.includes('store: storage.sessionStore');
    if (!hasSessionStore) {
      console.error('❌ Missing session store configuration in auth.ts');
      return false;
    }
    
    console.log('✅ Auth configuration looks good.');
    
    // Check login route configuration
    const hasLoginRoute = authContent.includes('app.post("/api/login"');
    if (!hasLoginRoute) {
      console.error('❌ Login route not found in auth.ts');
      return false;
    }
    
    console.log('✅ Login route configuration looks good.');
    return true;
  } catch (error) {
    console.error('❌ Error checking auth configuration:', error);
    return false;
  }
}

// Check if storage.ts has the correct session store setup
async function checkStorageConfig() {
  try {
    console.log('🔍 Checking storage configuration...');
    
    const storagePath = './server/storage.ts';
    if (!fs.existsSync(storagePath)) {
      console.error('❌ Could not find storage.ts file at', storagePath);
      return false;
    }
    
    const storageContent = fs.readFileSync(storagePath, 'utf8');
    
    // Check for session store setup
    const hasSessionStore = storageContent.includes('sessionStore:');
    if (!hasSessionStore) {
      console.error('❌ Missing sessionStore property in storage.ts');
      return false;
    }
    
    // Check for PgSession import
    const hasPgSession = storageContent.includes('connect-pg-simple');
    if (!hasPgSession) {
      console.error('❌ Missing connect-pg-simple import in storage.ts');
      return false;
    }
    
    console.log('✅ Storage configuration looks good.');
    return true;
  } catch (error) {
    console.error('❌ Error checking storage configuration:', error);
    return false;
  }
}

// Check if we can authenticate super_admin 
async function checkSuperAdminAuth() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Checking super_admin account...');
    
    const result = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1',
      ['super_admin']
    );
    
    if (result.rows.length === 0) {
      console.error('❌ super_admin user not found in database');
      return false;
    }
    
    const user = result.rows[0];
    console.log('✅ super_admin user exists (ID:', user.id, ')');
    
    // Check if password field has the expected format (hash.salt)
    const passwordParts = user.password.split('.');
    if (passwordParts.length !== 2) {
      console.error('❌ super_admin password has incorrect format. It should be "hash.salt"');
      return false;
    }
    
    console.log('✅ super_admin password has correct format');
    return true;
  } catch (error) {
    console.error('❌ Error checking super_admin account:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Main function to run all checks
async function debugLogin503() {
  console.log('🔍 Starting login 503 error debugging...\n');
  
  // Perform all checks
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    console.error('❌ Cannot proceed with further checks due to database connection failure.');
    return;
  }
  
  console.log('\n--- Sessions Table Check ---');
  await checkSessionsTable();
  
  console.log('\n--- Auth Configuration Check ---');
  await checkAuthConfig();
  
  console.log('\n--- Storage Configuration Check ---');
  await checkStorageConfig();
  
  console.log('\n--- Super Admin Account Check ---');
  await checkSuperAdminAuth();
  
  console.log('\n✨ Debug complete!');
  console.log('If all checks passed but you still experience 503 errors, try:');
  console.log('1. Restart the application');
  console.log('2. Clear your browser cookies and cache');
  console.log('3. Verify there are no network issues');
  console.log('4. Check for any error messages in the server logs during login attempts');
}

// Run the debug function
debugLogin503();