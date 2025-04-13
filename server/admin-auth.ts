/**
 * Secure Admin Authentication System with Two-Factor Authentication
 * 
 * This module provides a completely separate authentication system for admin access
 * that doesn't depend on the session mechanism. This gives us a separate, more reliable
 * method to access admin functionality even when the main auth system has issues.
 * 
 * Now with enhanced security via Two-Factor Authentication (2FA) for super_admin and 
 * sub_super_admin roles.
 */

import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import { eq, and, or } from "drizzle-orm";
import { db } from "./db";
import { users } from "../shared/schema";
import { timingSafeEqual } from "crypto";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";

// Add admin user to the Express Request type
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: number;
        role: string;
        requiresTwoFactor?: boolean;
        twoFactorVerified?: boolean;
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

// Admin authentication API endpoint - Step 1: Password validation
export async function handleAdminAuth(req: Request, res: Response) {
  const { username, password, twoFactorCode } = req.body;
  
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
    
    // Verify this is an admin account with proper role
    if (user.role !== 'super_admin' && user.role !== 'sub_super_admin') {
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
    
    // Check if 2FA is enabled for this user
    if (user.twoFactorEnabled) {
      // If 2FA is required but code wasn't provided, request it
      if (!twoFactorCode) {
        return res.status(200).json({
          requiresTwoFactor: true,
          userId: user.id,
          message: "Two-factor authentication code required"
        });
      }
      
      // Verify the provided 2FA code
      const isValidToken = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token: twoFactorCode,
        window: 1 // Allow a 30-second window before/after current time
      });
      
      if (!isValidToken) {
        return res.status(401).json({ error: "Invalid two-factor authentication code" });
      }
    }
    
    // If we got here, either 2FA is not enabled or the code was valid
    // Generate admin auth token
    const token = generateSecureToken(user.id, user.role);
    
    // Return admin token and user info (excluding password and 2FA secret)
    const { password: _, twoFactorSecret: __, ...userWithoutSensitiveData } = user;
    
    return res.status(200).json({ 
      token,
      user: userWithoutSensitiveData,
      twoFactorVerified: user.twoFactorEnabled
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
  
  // Check if role is either super_admin or sub_super_admin
  if (role !== 'super_admin' && role !== 'sub_super_admin') {
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

// Middleware specifically for super_admin only routes
export function requireSuperAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const { valid, userId, role } = verifyAdminToken(token);
  
  if (!valid) {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
  
  // Only super_admin can access these routes
  if (role !== 'super_admin') {
    return res.status(403).json({ error: "This action requires super admin privileges" });
  }
  
  // Add admin user info to the request
  if (userId !== undefined && role !== undefined) {
    req.adminUser = { id: userId, role };
    next();
  } else {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
}

// Generate 2FA setup for an admin user
export async function setupTwoFactorAuth(req: Request, res: Response) {
  try {
    // Ensure this is a valid admin user
    if (!req.adminUser || !req.adminUser.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `Paysurity Admin (${req.adminUser.id})`,
      issuer: 'Paysurity'
    });

    // Generate QR code for easy setup with authenticator apps
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    // Save the secret to the user's record in the database
    await db.update(users)
      .set({
        twoFactorSecret: secret.base32,
        // Don't enable 2FA yet until it's verified
      })
      .where(eq(users.id, req.adminUser.id));

    // Return the secret and QR code
    return res.status(200).json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: "Scan this QR code with your authenticator app, then verify with a code"
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return res.status(500).json({ error: "Failed to setup two-factor authentication" });
  }
}

// Verify and enable 2FA for an admin user
export async function verifyAndEnableTwoFactorAuth(req: Request, res: Response) {
  try {
    const { token } = req.body;

    // Ensure this is a valid admin user
    if (!req.adminUser || !req.adminUser.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Fetch the user with their stored secret
    const adminUser = await db.select().from(users)
      .where(eq(users.id, req.adminUser.id))
      .limit(1);

    if (!adminUser || adminUser.length === 0 || !adminUser[0].twoFactorSecret) {
      return res.status(400).json({ error: "Two-factor authentication not set up" });
    }

    // Verify the token against the stored secret
    const verified = speakeasy.totp.verify({
      secret: adminUser[0].twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Enable 2FA on the user account
    await db.update(users)
      .set({
        twoFactorEnabled: true
      })
      .where(eq(users.id, req.adminUser.id));

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication has been enabled"
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return res.status(500).json({ error: "Failed to verify and enable two-factor authentication" });
  }
}

// Create a new sub-super admin - only available to super_admin
export async function createSubSuperAdmin(req: Request, res: Response) {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    // Ensure this is a super_admin
    if (!req.adminUser || req.adminUser.role !== 'super_admin') {
      return res.status(403).json({ error: "Only super admins can create sub-super admin accounts" });
    }

    // Validate inputs
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if username or email already exists
    const existingUser = await db.select().from(users)
      .where(
        or(
          eq(users.username, username),
          eq(users.email, email)
        )
      ).limit(1);

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Generate a salt and hash the password
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.scryptSync(password, salt, 128).toString('hex');
    const passwordWithSalt = `${hashedPassword}.${salt}`;

    // Create the new sub-super admin
    const result = await db.insert(users).values({
      username,
      password: passwordWithSalt,
      email,
      firstName,
      lastName,
      role: 'sub_super_admin',
      twoFactorEnabled: false, // Will be enabled during setup
      createdAt: new Date()
    }).returning({ id: users.id });

    if (!result || result.length === 0) {
      throw new Error("Failed to create user record");
    }

    return res.status(201).json({
      success: true,
      message: "Sub-super admin created successfully",
      userId: result[0].id
    });
  } catch (error) {
    console.error("Create sub-super admin error:", error);
    return res.status(500).json({ error: "Failed to create sub-super admin" });
  }
}

// Register admin auth routes
export function setupAdminAuth(app: any) {
  // Special admin authentication endpoint
  app.post('/api/admin/auth', handleAdminAuth);
  
  // Two-Factor Authentication endpoints
  app.post('/api/admin/2fa/setup', requireAdminAuth, setupTwoFactorAuth);
  app.post('/api/admin/2fa/verify', requireAdminAuth, verifyAndEnableTwoFactorAuth);
  
  // Sub-super admin management - only super_admin can access
  app.post('/api/admin/sub-admins', requireSuperAdminAuth, createSubSuperAdmin);
  
  // Example of a protected admin route
  app.get('/api/admin/system-info', requireAdminAuth, (req: Request, res: Response) => {
    res.json({ 
      info: "System information accessible only to admins",
      admin: req.adminUser
    });
  });
}