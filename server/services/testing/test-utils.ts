/**
 * Legal Practice Management Test Utilities
 * 
 * This module provides utility functions and shared resources for testing
 * the Legal Practice Management System components.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../../db';
import { 
  merchants, 
  legalClients, 
  legalMatters, 
  users, 
  legalPortalUsers 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Generate a random string for test data
 */
export function generateRandomString(length: number = 8): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Create a temporary test file with specified content
 */
export function createTempTestFile(content: string = 'Test file content'): string {
  const testDir = path.join(process.cwd(), 'test-reports', 'temp');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const filePath = path.join(testDir, `test-file-${Date.now()}.txt`);
  fs.writeFileSync(filePath, content);
  
  return filePath;
}

/**
 * Remove a temporary test file
 */
export function removeTempTestFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Create a test merchant for testing purposes
 */
export async function createTestMerchant() {
  const merchantName = `Test Merchant ${generateRandomString(4)}`;
  
  const [merchant] = await db.insert(merchants).values({
    name: merchantName,
    isoPartnerId: 1,
    businessName: merchantName,
    contactName: 'Test Contact',
    email: `test-${generateRandomString(6)}@example.com`,
    phone: '555-123-4567',
    address: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zip: '12345',
    businessType: 'legal_services',
    taxId: generateRandomString(9),
    status: 'active',
    processingVolume: 10000,
    commissionRate: 0.25,
    monthlyFee: 49.99
  }).returning();
  
  return merchant;
}

/**
 * Create a test client for testing purposes
 */
export async function createTestClient(merchantId: number) {
  const firstName = `Test${generateRandomString(4)}`;
  const lastName = `Client${generateRandomString(4)}`;
  
  const [client] = await db.insert(legalClients).values({
    merchantId,
    clientNumber: `CL-${generateRandomString(6)}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: '555-987-6543',
    address: '456 Client Avenue',
    city: 'Client City',
    state: 'CC',
    zipCode: '54321',
    clientType: 'individual',
    status: 'active',
    contactMethod: 'email'
  }).returning();
  
  return client;
}

/**
 * Create a test matter for testing purposes
 */
export async function createTestMatter(merchantId: number, clientId: number) {
  const [matter] = await db.insert(legalMatters).values({
    merchantId,
    clientId,
    title: `Test Matter ${generateRandomString(6)}`,
    description: 'This is a test matter for automated testing',
    status: 'active',
    practiceArea: 'general',
    assignedAttorneyId: 1, // This would usually be a valid attorney user ID
    openDate: new Date(),
    billableStatus: 'billable'
  }).returning();
  
  return matter;
}

/**
 * Create a test user for testing
 */
export async function createTestUser(merchantId: number, role: string = 'attorney') {
  const username = `test_user_${generateRandomString(6)}`;
  
  const [user] = await db.insert(users).values({
    username,
    email: `${username}@example.com`,
    password: hashPassword('TestPassword123!'),
    firstName: 'Test',
    lastName: 'User',
    status: 'active',
    role,
    merchantId
  }).returning();
  
  return user;
}

/**
 * Create a test portal user for client access
 */
export async function createTestPortalUser(clientId: number, merchantId: number) {
  const email = `portal_user_${generateRandomString(6)}@example.com`;
  
  const [portalUser] = await db.insert(legalPortalUsers).values({
    clientId,
    merchantId,
    email,
    password: hashPassword('PortalPass123!'),
    status: 'active',
    lastLogin: null
  }).returning();
  
  return portalUser;
}

/**
 * Clean up test data created during tests
 */
export async function cleanupTestData(testIds: {
  merchantId?: number;
  clientId?: number;
  matterId?: number;
  userId?: number;
  portalUserId?: number;
}) {
  try {
    if (testIds.portalUserId) {
      await db.delete(legalPortalUsers).where(eq(legalPortalUsers.id, testIds.portalUserId));
    }
    
    if (testIds.matterId) {
      await db.delete(legalMatters).where(eq(legalMatters.id, testIds.matterId));
    }
    
    if (testIds.clientId) {
      await db.delete(legalClients).where(eq(legalClients.id, testIds.clientId));
    }
    
    if (testIds.userId) {
      await db.delete(users).where(eq(users.id, testIds.userId));
    }
    
    if (testIds.merchantId) {
      await db.delete(merchants).where(eq(merchants.id, testIds.merchantId));
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Hash a password for test user creation
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${hash}.${salt}`;
}

/**
 * Create a test directory structure for document tests
 */
export function createTestDirectoryStructure(): string {
  const testDir = path.join(process.cwd(), 'test-reports', 'documents', generateRandomString(8));
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(path.join(testDir, 'client_files'));
    fs.mkdirSync(path.join(testDir, 'templates'));
    fs.mkdirSync(path.join(testDir, 'case_documents'));
    
    // Create some test files
    fs.writeFileSync(path.join(testDir, 'templates', 'contract_template.txt'), 'This is a contract template');
    fs.writeFileSync(path.join(testDir, 'templates', 'letter_template.txt'), 'This is a letter template');
  }
  
  return testDir;
}

/**
 * Remove test directory structure
 */
export function removeTestDirectoryStructure(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}