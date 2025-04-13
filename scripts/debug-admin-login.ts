/**
 * Debug Admin Login Script
 * 
 * This script tests the super_admin login directly against the database
 * and helps diagnose authentication issues with the super_admin account.
 * 
 * Run with: npx tsx scripts/debug-admin-login.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import ws from 'ws';
import 'dotenv/config';

// Set up WebSocket for NeonDB
neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(scrypt);

// Custom password comparison function from auth.ts
async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 128)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

// Create a new hashed password for super_admin
async function hashPassword(password: string) {
  const salt = randomBytes(32).toString("hex");
  const buf = (await scryptAsync(password, salt, 128)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Debug login function
async function debugAdminLogin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Starting super_admin login debug process...');
    
    // 1. Check if super_admin exists
    const userResult = await pool.query(
      'SELECT id, username, password, role FROM users WHERE username = $1',
      ['super_admin']
    );
    
    if (userResult.rows.length === 0) {
      console.error('❌ super_admin user not found in database!');
      
      // Create super_admin
      console.log('👤 Creating new super_admin account...');
      const password = 'admin123'; // Simple password for testing
      const hashedPassword = await hashPassword(password);
      
      const createResult = await pool.query(
        `INSERT INTO users 
        (username, password, email, first_name, last_name, role) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, role`,
        ['super_admin', hashedPassword, 'admin@paysurity.com', 'Super', 'Admin', 'super_admin']
      );
      
      console.log('✅ Created super_admin user:', createResult.rows[0]);
      console.log('🔑 Password set to:', password);
      
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Found super_admin user:', {
      id: user.id,
      username: user.username,
      role: user.role
    });
    
    // 2. Test password verification
    console.log('🔐 Testing password verification...');
    const testPassword = 'c2f6a31c393b340e77ed6e91'; // The original password provided
    
    // Check stored format
    console.log('Stored password format:', user.password.includes('.') ? 'Valid (contains separator)' : 'Invalid (missing separator)');
    
    // Attempt verification
    try {
      const passwordMatches = await comparePasswords(testPassword, user.password);
      console.log('Password verification result:', passwordMatches ? '✅ Success' : '❌ Failed');
      
      if (!passwordMatches) {
        // Reset password for testing
        console.log('🔄 Resetting super_admin password...');
        const newPassword = 'admin123'; // Simple password for testing
        const hashedPassword = await hashPassword(newPassword);
        
        await pool.query(
          'UPDATE users SET password = $1 WHERE username = $2 RETURNING id',
          [hashedPassword, 'super_admin']
        );
        
        console.log('✅ Password reset complete!');
        console.log('🔑 New password is:', newPassword);
      }
    } catch (error) {
      console.error('⚠️ Error during password verification:', error);
      
      // Reset password as a fallback
      console.log('🔄 Error occurred. Resetting super_admin password...');
      const newPassword = 'admin123'; // Simple password for testing
      const hashedPassword = await hashPassword(newPassword);
      
      await pool.query(
        'UPDATE users SET password = $1 WHERE username = $2',
        [hashedPassword, 'super_admin']
      );
      
      console.log('✅ Password reset complete!');
      console.log('🔑 New password is:', newPassword);
    }
    
    // Test sessions table
    console.log('\n📊 Checking session store...');
    try {
      const sessionResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'sessions'
        )
      `);
      
      const sessionsTableExists = sessionResult.rows[0].exists;
      console.log('Sessions table exists:', sessionsTableExists ? '✅ Yes' : '❌ No');
      
      if (!sessionsTableExists) {
        console.log('⚠️ Missing sessions table may cause login issues');
      } else {
        // Check session count
        const countResult = await pool.query('SELECT COUNT(*) FROM sessions');
        console.log('Total stored sessions:', countResult.rows[0].count);
      }
    } catch (error) {
      console.error('⚠️ Error checking sessions table:', error);
    }
    
    console.log('\n✅ Debug process complete! Try logging in with the credentials above.');
    
  } catch (error) {
    console.error('❌ Database error during debug process:', error);
  } finally {
    await pool.end();
  }
}

// Run the debug function
debugAdminLogin();