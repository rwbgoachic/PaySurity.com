// This script creates a super admin user in the system
import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import crypto from 'crypto';
import { promisify } from 'util';
import ws from 'ws';

// Set up WebSocket for NeonDB
neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const buf = await scryptAsync(password, salt, 128);
  return `${buf.toString('hex')}.${salt}`;
}

async function createSuperAdmin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Random but secure password
    const password = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await hashPassword(password);
    
    const username = 'super_admin';
    const email = 'super_admin@paysurity.com';

    // Insert using direct SQL to avoid any potential Drizzle schema issues
    const result = await pool.query(
      `INSERT INTO users 
       (username, password, email, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (username) DO UPDATE
       SET password = $2, role = $6
       RETURNING id, username, email, role`,
      [username, hashedPassword, email, 'Super', 'Admin', 'super_admin']
    );

    const user = result.rows[0];
    
    console.log('Super admin created successfully:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('\nURL: https://paysurity.com/super-admin');
    console.log('\nIMPORTANT: Save these credentials securely!');
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
createSuperAdmin();