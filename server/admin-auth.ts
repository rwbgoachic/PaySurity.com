/**
 * Secure Admin Authentication System
 * 
 * This module provides a completely separate authentication system for admin access
 * that doesn't depend on the session mechanism. This gives us a separate, more reliable
 * method to access admin functionality even when the main auth system has issues.
 */

import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "../shared/schema";
import { timingSafeEqual } from "crypto";

// Add admin user to the Express Request type
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: number;
        role: string;
      };
    }
  }
}

// Secret key for admin auth tokens (ideally from env variable in production)
const ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || "paysurity-admin-auth-secret-key";

// Token expiration time (24 hours)
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;

// Secure token generation function
function generateSecureToken(userId: number, role: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${role}:${timestamp}`;
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', ADMIN_AUTH_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  // Format as base64 to use as a token
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');
  return token;
}

// Verify admin token
function verifyAdminToken(token: string): { valid: boolean; userId?: number; role?: string } {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, role, timestamp, signature] = decoded.split(':');
    
    // Regenerate signature to verify
    const payload = `${userId}:${role}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', ADMIN_AUTH_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // Check if token has expired
    const tokenTime = parseInt(timestamp, 10);
    if (Date.now() - tokenTime > TOKEN_EXPIRATION) {
      return { valid: false };
    }
    
    // Verify signature using constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false };
    }
    
    const isValid = timingSafeEqual(signatureBuffer, expectedBuffer);
    
    // Only return user info if valid
    if (isValid) {
      return { 
        valid: true, 
        userId: parseInt(userId, 10), 
        role 
      };
    }
    
    return { valid: false };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false };
  }
}

// Admin authentication API endpoint
export async function handleAdminAuth(req: Request, res: Response) {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  
  try {
    // Directly query the database for the admin user
    const adminUser = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (!adminUser || adminUser.length === 0) {
      console.log("Admin auth failed: User not found:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = adminUser[0];
    
    // Verify this is an admin account
    if (user.role !== 'super_admin') {
      console.log("Admin auth failed: Not an admin account:", username);
      return res.status(401).json({ error: "Unauthorized access" });
    }
    
    // Verify password (directly using the database stored hash)
    const [storedHash, salt] = user.password.split('.');
    
    if (!storedHash || !salt) {
      console.error("Invalid password format in database");
      return res.status(500).json({ error: "Authentication system error" });
    }
    
    // Hash the provided password with the same salt
    const hashedBuf = Buffer.from(storedHash, 'hex');
    const suppliedBuf = crypto.scryptSync(password, salt, 128) as Buffer;
    
    // Compare hashes using constant-time comparison
    const passwordMatch = timingSafeEqual(hashedBuf, suppliedBuf);
    
    if (!passwordMatch) {
      console.log("Admin auth failed: Invalid password for:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate admin auth token
    const token = generateSecureToken(user.id, user.role);
    
    // Return admin token and user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Admin authentication error:", error);
    return res.status(500).json({ error: "Authentication failed due to server error" });
  }
}

// Middleware to verify admin token for protected routes
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const { valid, userId, role } = verifyAdminToken(token);
  
  if (!valid) {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
  
  if (role !== 'super_admin') {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  
  // Add admin user info to the request
  if (userId !== undefined && role !== undefined) {
    req.adminUser = { id: userId, role };
    next();
  } else {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
}

// Register admin auth routes
export function setupAdminAuth(app: any) {
  // Special admin authentication endpoint
  app.post('/api/admin/auth', handleAdminAuth);
  
  // Example of a protected admin route
  app.get('/api/admin/system-info', requireAdminAuth, (req: Request, res: Response) => {
    res.json({ 
      info: "System information accessible only to admins",
      admin: req.adminUser
    });
  });
}