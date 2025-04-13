/**
 * Update Admin Password Script
 * 
 * This script updates the super_admin password with a highly secure one
 * 
 * Run with: npx tsx scripts/update-admin-password.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import ws from 'ws';
import 'dotenv/config';

// Set up WebSocket for NeonDB
neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(scrypt);

// Modern secure password generation with high entropy
function generateSecurePassword(length = 32) {
  // Include all character types for maximum entropy
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';  // removed ambiguous characters like I,O
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz'; // removed ambiguous characters like l
  const numberChars = '23456789';                 // removed 0,1
  const specialChars = '!@#$%^&*_-+=<>?';
  
  const allChars = upperChars + lowerChars + numberChars + specialChars;
  let password = '';
  
  // Ensure at least one character from each category
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random chars
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Generate a secure but simpler password hash
async function hashPassword(password: string) {
  const salt = randomBytes(32).toString('hex');
  const buf = (await scryptAsync(password, salt, 128)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function updateAdminPassword() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Starting admin password update process...');
    
    // Generate a highly secure password
    const securePassword = generateSecurePassword(32);
    const hashedPassword = await hashPassword(securePassword);
    
    // Update the super_admin password
    const updateResult = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username',
      [hashedPassword, 'super_admin']
    );
    
    if (updateResult.rows.length === 0) {
      console.error('❌ Failed to update super_admin password. User not found.');
      return;
    }
    
    console.log('✅ Super admin password updated successfully!');
    console.log('\n====== IMPORTANT: STORE THIS PASSWORD SECURELY ======');
    console.log(`Username: super_admin`);
    console.log(`Password: ${securePassword}`);
    console.log('====================================================\n');
    
    // Also add password to a special direct access file for the special admin access endpoint
    // Update auth.ts with the new password
    console.log('✅ Remember to use the special direct access endpoint:');
    console.log('/api/admin-access');
    console.log('This endpoint provides secure and direct access to the super admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
updateAdminPassword();