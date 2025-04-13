/**
 * Fix Admin Login Script
 * 
 * This script fixes the admin login issue by:
 * 1. Updating the super_admin's password to a secure, randomly generated password
 * 2. Requiring proper authentication (no backdoors or direct access)
 * 
 * Run with: npx tsx scripts/fix-admin-login.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import ws from 'ws';
import fs from 'fs';
import 'dotenv/config';

// Set up WebSocket for NeonDB
neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(scrypt);

// Generate a secure but simpler password hash
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function fixAdminLogin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Starting admin login fix process...');
    
    // 1. Update super_admin password to a secure one
    const securePassword = 'P@y$ur1ty_Admin_' + randomBytes(4).toString('hex') + '!2024';
    const hashedPassword = await hashPassword(securePassword);
    
    const updateResult = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username',
      [hashedPassword, 'super_admin']
    );
    
    if (updateResult.rows.length === 0) {
      console.error('❌ Failed to update super_admin password. User not found.');
      return;
    }
    
    console.log('✅ Updated super_admin password to:', securePassword);
    
    // We no longer add a direct path for super_admin
    // This ensures proper secure authentication is always required
    console.log('✅ Proper authentication required - no backdoor access');
    
    console.log('\n✨ Admin login fix complete! Try logging in with:');
    console.log('Username: super_admin');
    console.log(`Password: ${securePassword}`);
    console.log('\nPlease restart the application for changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error fixing admin login:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix function
fixAdminLogin();