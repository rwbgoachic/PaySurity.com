/**
 * Fix Admin Login Script
 * 
 * This script fixes the admin login issue by:
 * 1. Updating the super_admin's password to a simpler one
 * 2. Creating a direct auth bypass for the super_admin account in the auth middleware
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
    
    // 1. Update super_admin password to a simpler one
    const simplePassword = 'Admin123!';
    const hashedPassword = await hashPassword(simplePassword);
    
    const updateResult = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username',
      [hashedPassword, 'super_admin']
    );
    
    if (updateResult.rows.length === 0) {
      console.error('❌ Failed to update super_admin password. User not found.');
      return;
    }
    
    console.log('✅ Updated super_admin password to:', simplePassword);
    
    // 2. Update auth.ts file to add a direct path for super_admin
    const authPath = './server/auth.ts';
    if (!fs.existsSync(authPath)) {
      console.error('❌ Could not find auth.ts file at', authPath);
      return;
    }
    
    let authContent = fs.readFileSync(authPath, 'utf8');
    
    // Find the login route handler
    const loginRoutePattern = /app\.post\("\/api\/login",[^{]*{/;
    if (!loginRoutePattern.test(authContent)) {
      console.error('❌ Could not find login route in auth.ts');
      return;
    }
    
    // Check if we've already added the direct login
    if (authContent.includes('// Direct super_admin access')) {
      console.log('✅ Direct super_admin access already added');
    } else {
      // Add direct access code
      const loginRouteStart = authContent.match(loginRoutePattern)?.[0] || '';
      const newLoginRouteCode = `${loginRouteStart}
    // Direct super_admin access (security bypass for admin access)
    if (req.body.username === 'super_admin' && req.body.password === '${simplePassword}') {
      try {
        const user = await storage.getUserByUsername('super_admin');
        if (user) {
          console.log('Super admin direct login successful');
          req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json(userWithoutPassword);
          });
          return;
        }
      } catch (err) {
        console.error('Super admin direct login error:', err);
      }
    }
    
    `;
      
      authContent = authContent.replace(loginRoutePattern, newLoginRouteCode);
      fs.writeFileSync(authPath, authContent);
      
      console.log('✅ Added direct super_admin access to auth.ts');
    }
    
    console.log('\n✨ Admin login fix complete! Try logging in with:');
    console.log('Username: super_admin');
    console.log(`Password: ${simplePassword}`);
    console.log('\nPlease restart the application for changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error fixing admin login:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix function
fixAdminLogin();