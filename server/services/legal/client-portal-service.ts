import { db } from '../../db';
import { 
  legalClients, 
  legalMatters, 
  legalDocuments, 
  legalInvoices, 
  legalTimeEntries,
  legalExpenseEntries,
  ioltaTrustAccounts,
  ioltaClientLedgers,
  ioltaTransactions,
  type LegalClient,
  type LegalMatter,
  type LegalDocument,
  type LegalInvoice,
  type IoltaTrustAccount,
  type IoltaClientLedger,
  type IoltaTransaction
} from '@shared/schema';

import {
  legalPortalUsers,
  legalPortalSessions,
  legalPortalActivities,
  legalPortalSharedDocuments,
  legalPortalMessages,
  type LegalPortalUser,
  type LegalPortalSession,
  type LegalPortalActivity,
  type LegalPortalMessage,
  type InsertLegalPortalUser,
  type InsertLegalPortalSession,
  type InsertLegalPortalActivity,
  type InsertLegalPortalSharedDocument,
  type InsertLegalPortalMessage
} from '@shared/schema-portal';
import { eq, and, or, like, desc, sql, gte, lte, isNull, not } from 'drizzle-orm';
import { randomBytes, createHash, scrypt } from 'crypto';
import { promisify } from 'util';
import { generateToken } from '../../utils/security';
import { sendEmail } from '../../utils/email';

const scryptAsync = promisify(scrypt);

/**
 * Client Portal Service
 * 
 * Provides functionality for the client portal including:
 * - Portal user management
 * - Client authentication
 * - Document sharing
 * - Client-matter activity tracking
 * - Client communications
 * - Invoice and payment access
 */
export class ClientPortalService {
  
  /**
   * Create a new portal user account for a client
   */
  async createPortalUser(userData: InsertLegalPortalUser): Promise<LegalPortalUser> {
    try {
      // Check if a portal user already exists for this client
      const [existingUser] = await db.select()
        .from(legalPortalUsers)
        .where(and(
          eq(legalPortalUsers.clientId, userData.clientId),
          eq(legalPortalUsers.email, userData.email)
        ));
      
      if (existingUser) {
        throw new Error('A portal user already exists for this client and email');
      }
      
      // Generate salt and hash password
      const salt = randomBytes(16).toString('hex');
      const hash = await this.hashPassword(userData.password, salt);
      
      // Insert portal user
      const [portalUser] = await db.insert(legalPortalUsers)
        .values({
          ...userData,
          password_hash: `${hash}.${salt}`, // Using password_hash instead of password
          isActive: true,
          lastLogin: null,
          failedLoginAttempts: 0
        })
        .returning();
      
      // Create welcome activity
      await this.logPortalActivity({
        portalUserId: portalUser.id,
        clientId: portalUser.clientId,
        merchantId: portalUser.merchantId,
        activityType: 'account_created',
        description: 'Client portal account was created',
        details: { method: 'system' }
      });
      
      // Send welcome email to client (implementation would be in email service)
      // await this.sendWelcomeEmail(portalUser);
      
      return portalUser;
    } catch (error) {
      console.error('Error creating portal user:', error);
      throw new Error(`Failed to create portal user: ${error.message}`);
    }
  }
  
  /**
   * Authenticate a portal user
   */
  async authenticatePortalUser(email: string, password: string, merchantId: number): Promise<{ user: LegalPortalUser, session: LegalPortalSession }> {
    try {
      // Find the portal user
      const [portalUser] = await db.select()
        .from(legalPortalUsers)
        .where(and(
          eq(legalPortalUsers.email, email),
          eq(legalPortalUsers.merchantId, merchantId)
        ));
      
      if (!portalUser) {
        throw new Error('Invalid email or password');
      }
      
      // Check if the account is active
      if (!portalUser.isActive) {
        throw new Error('Account is inactive or suspended');
      }
      
      // Check password
      const isValidPassword = await this.verifyPassword(password, portalUser.password_hash);
      
      if (!isValidPassword) {
        // Increment failed login attempts
        await db.update(legalPortalUsers)
          .set({
            failedLoginAttempts: (portalUser.failedLoginAttempts || 0) + 1,
            // Optionally lock account if too many failed attempts
            isActive: (portalUser.failedLoginAttempts || 0) >= 4 ? false : portalUser.isActive
          })
          .where(eq(legalPortalUsers.id, portalUser.id));
        
        // Log failed login attempt
        await this.logPortalActivity({
          portalUserId: portalUser.id,
          clientId: portalUser.clientId,
          merchantId: portalUser.merchantId,
          activityType: 'login_failed',
          description: 'Failed login attempt',
          details: { ipAddress: '0.0.0.0' } // This would be the actual IP in production
        });
        
        throw new Error('Invalid email or password');
      }
      
      // Update last login and reset failed attempts
      await db.update(legalPortalUsers)
        .set({
          lastLogin: new Date(),
          failedLoginAttempts: 0
        })
        .where(eq(legalPortalUsers.id, portalUser.id));
      
      // Create a session
      const sessionToken = generateToken(48);
      const sessionExpiry = new Date();
      sessionExpiry.setDate(sessionExpiry.getDate() + 7); // 7-day session
      
      const [session] = await db.insert(legalPortalSessions)
        .values({
          portalUserId: portalUser.id,
          clientId: portalUser.clientId,
          merchantId: portalUser.merchantId,
          token: sessionToken,
          expiresAt: sessionExpiry,
          ipAddress: '0.0.0.0', // This would be the actual IP in production
          userAgent: 'Unknown' // This would be the actual user agent in production
        })
        .returning();
      
      // Log successful login
      await this.logPortalActivity({
        portalUserId: portalUser.id,
        clientId: portalUser.clientId,
        merchantId: portalUser.merchantId,
        activityType: 'login_success',
        description: 'Successful login',
        details: { ipAddress: '0.0.0.0', sessionId: session.id }
      });
      
      return { user: portalUser, session };
    } catch (error) {
      console.error('Error authenticating portal user:', error);
      throw error;
    }
  }
  
  /**
   * Validate a portal session
   */
  async validateSession(token: string): Promise<{ valid: boolean, session?: LegalPortalSession, user?: LegalPortalUser }> {
    try {
      const [session] = await db.select()
        .from(legalPortalSessions)
        .where(and(
          eq(legalPortalSessions.token, token),
          gte(legalPortalSessions.expiresAt, new Date()),
          isNull(legalPortalSessions.invalidatedAt)
        ));
      
      if (!session) {
        return { valid: false };
      }
      
      // Get the portal user
      const [user] = await db.select()
        .from(legalPortalUsers)
        .where(and(
          eq(legalPortalUsers.id, session.portalUserId),
          eq(legalPortalUsers.isActive, true)
        ));
      
      if (!user) {
        return { valid: false };
      }
      
      return { valid: true, session, user };
    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false };
    }
  }
  
  /**
   * Log out a portal user (invalidate session)
   */
  async logoutPortalUser(token: string): Promise<boolean> {
    try {
      const [session] = await db.update(legalPortalSessions)
        .set({
          invalidatedAt: new Date()
        })
        .where(and(
          eq(legalPortalSessions.token, token),
          isNull(legalPortalSessions.invalidatedAt)
        ))
        .returning();
      
      if (!session) {
        return false;
      }
      
      // Log logout activity
      await this.logPortalActivity({
        portalUserId: session.portalUserId,
        clientId: session.clientId,
        merchantId: session.merchantId,
        activityType: 'logout',
        description: 'User logged out',
        details: { sessionId: session.id }
      });
      
      return true;
    } catch (error) {
      console.error('Error logging out portal user:', error);
      return false;
    }
  }
  
  /**
   * Reset portal user password
   */
  async resetPassword(email: string, merchantId: number): Promise<boolean> {
    try {
      // Find the portal user
      const [portalUser] = await db.select()
        .from(legalPortalUsers)
        .where(and(
          eq(legalPortalUsers.email, email),
          eq(legalPortalUsers.merchantId, merchantId),
          eq(legalPortalUsers.isActive, true)
        ));
      
      if (!portalUser) {
        // Don't reveal that the email doesn't exist for security reasons
        return true;
      }
      
      // Generate a reset token
      const resetToken = generateToken(32);
      const resetExpiry = new Date();
      resetExpiry.setHours(resetExpiry.getHours() + 24); // 24-hour token validity
      
      // Store the reset token
      await db.update(legalPortalUsers)
        .set({
          resetToken,
          resetTokenExpiry: resetExpiry
        })
        .where(eq(legalPortalUsers.id, portalUser.id));
      
      // Log password reset request
      await this.logPortalActivity({
        portalUserId: portalUser.id,
        clientId: portalUser.clientId,
        merchantId: portalUser.merchantId,
        activityType: 'password_reset_requested',
        description: 'Password reset requested',
        details: { method: 'email' }
      });
      
      // Send reset email (implementation would be in email service)
      // await this.sendPasswordResetEmail(portalUser, resetToken);
      
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }
  
  /**
   * Complete password reset
   */
  async completePasswordReset(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find the portal user with the reset token
      const [portalUser] = await db.select()
        .from(legalPortalUsers)
        .where(and(
          eq(legalPortalUsers.resetToken, token),
          gte(legalPortalUsers.resetTokenExpiry, new Date()),
          eq(legalPortalUsers.isActive, true)
        ));
      
      if (!portalUser) {
        throw new Error('Invalid or expired reset token');
      }
      
      // Generate salt and hash password
      const salt = randomBytes(16).toString('hex');
      const hash = await this.hashPassword(newPassword, salt);
      
      // Update the password and clear reset token
      await db.update(legalPortalUsers)
        .set({
          password_hash: `${hash}.${salt}`,
          resetToken: null,
          resetTokenExpiry: null,
          failedLoginAttempts: 0
        })
        .where(eq(legalPortalUsers.id, portalUser.id));
      
      // Invalidate all existing sessions
      await db.update(legalPortalSessions)
        .set({
          invalidatedAt: new Date()
        })
        .where(and(
          eq(legalPortalSessions.portalUserId, portalUser.id),
          isNull(legalPortalSessions.invalidatedAt)
        ));
      
      // Log password reset completion
      await this.logPortalActivity({
        portalUserId: portalUser.id,
        clientId: portalUser.clientId,
        merchantId: portalUser.merchantId,
        activityType: 'password_reset_completed',
        description: 'Password reset completed',
        details: { invalidatedSessions: true }
      });
      
      return true;
    } catch (error) {
      console.error('Error completing password reset:', error);
      return false;
    }
  }
  
  /**
   * Get client matters for the portal
   */
  async getClientMatters(clientId: number, merchantId: number): Promise<LegalMatter[]> {
    try {
      const matters = await db.select()
        .from(legalMatters)
        .where(and(
          eq(legalMatters.clientId, clientId),
          eq(legalMatters.merchantId, merchantId),
          not(eq(legalMatters.status, 'closed')),
          eq(legalMatters.showInClientPortal, true)
        ))
        .orderBy(desc(legalMatters.openDate));
      
      return matters;
    } catch (error) {
      console.error('Error getting client matters:', error);
      throw new Error('Failed to retrieve client matters');
    }
  }
  
  /**
   * Get client matter details
   */
  async getMatterDetails(matterId: number, clientId: number, merchantId: number): Promise<any> {
    try {
      // Get the matter
      const [matter] = await db.select()
        .from(legalMatters)
        .where(and(
          eq(legalMatters.id, matterId),
          eq(legalMatters.clientId, clientId),
          eq(legalMatters.merchantId, merchantId),
          eq(legalMatters.showInClientPortal, true)
        ));
      
      if (!matter) {
        throw new Error('Matter not found or not accessible');
      }
      
      // Get associated documents
      const sharedDocuments = await db.select({
        document: legalDocuments,
        sharedInfo: legalPortalSharedDocuments
      })
        .from(legalPortalSharedDocuments)
        .innerJoin(legalDocuments, eq(legalPortalSharedDocuments.documentId, legalDocuments.id))
        .where(and(
          eq(legalPortalSharedDocuments.matterId, matterId),
          eq(legalPortalSharedDocuments.clientId, clientId),
          eq(legalPortalSharedDocuments.merchantId, merchantId),
          eq(legalPortalSharedDocuments.isActive, true)
        ));
      
      // Get billable summary
      const timeEntries = await db.select()
        .from(legalTimeEntries)
        .where(and(
          eq(legalTimeEntries.matterId, matterId),
          eq(legalTimeEntries.merchantId, merchantId),
          eq(legalTimeEntries.showInClientPortal, true)
        ));
      
      const expenseEntries = await db.select()
        .from(legalExpenseEntries)
        .where(and(
          eq(legalExpenseEntries.matterId, matterId),
          eq(legalExpenseEntries.merchantId, merchantId),
          eq(legalExpenseEntries.showInClientPortal, true)
        ));
      
      // Get invoices
      const invoices = await db.select()
        .from(legalInvoices)
        .where(and(
          eq(legalInvoices.matterId, matterId),
          eq(legalInvoices.merchantId, merchantId),
          eq(legalInvoices.status, 'sent')
        ));
      
      // Log matter view activity
      await this.logPortalActivity({
        portalUserId: 0, // This would need to be provided in the actual call
        clientId,
        merchantId,
        activityType: 'matter_viewed',
        description: `Viewed matter: ${matter.title}`,
        details: { matterId: matter.id }
      });
      
      return {
        matter,
        documents: sharedDocuments.map(item => ({
          ...item.document,
          sharedAt: item.sharedInfo.sharedAt,
          sharedBy: item.sharedInfo.sharedById
        })),
        timeEntries,
        expenseEntries,
        invoices,
        billableSummary: {
          totalHours: timeEntries.reduce((sum, entry) => sum + parseFloat(entry.duration || '0'), 0),
          totalExpenses: expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || '0'), 0),
          totalBilled: invoices.reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount || '0'), 0),
          totalPaid: invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount || '0'), 0)
        }
      };
    } catch (error) {
      console.error('Error getting matter details:', error);
      throw new Error('Failed to retrieve matter details');
    }
  }
  
  /**
   * Share a document with a client
   */
  async shareDocument(documentData: InsertLegalPortalSharedDocument): Promise<any> {
    try {
      // Check if the document exists
      const [document] = await db.select()
        .from(legalDocuments)
        .where(and(
          eq(legalDocuments.id, documentData.documentId),
          eq(legalDocuments.merchantId, documentData.merchantId)
        ));
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Check if document is already shared
      const [existingShare] = await db.select()
        .from(legalPortalSharedDocuments)
        .where(and(
          eq(legalPortalSharedDocuments.documentId, documentData.documentId),
          eq(legalPortalSharedDocuments.clientId, documentData.clientId)
        ));
      
      if (existingShare) {
        // Update existing share
        const [updatedShare] = await db.update(legalPortalSharedDocuments)
          .set({
            isActive: true,
            note: documentData.note || existingShare.note,
            sharedById: documentData.sharedById,
            sharedAt: new Date()
          })
          .where(eq(legalPortalSharedDocuments.id, existingShare.id))
          .returning();
        
        // Log document share activity
        await this.logPortalActivity({
          portalUserId: null,
          clientId: documentData.clientId,
          merchantId: documentData.merchantId,
          activityType: 'document_shared',
          description: `Document shared/updated: ${document.title}`,
          details: { documentId: document.id, sharedBy: documentData.sharedById }
        });
        
        return updatedShare;
      } else {
        // Create new share
        const [newShare] = await db.insert(legalPortalSharedDocuments)
          .values({
            ...documentData,
            sharedAt: new Date(),
            isActive: true
          })
          .returning();
        
        // Log document share activity
        await this.logPortalActivity({
          portalUserId: null,
          clientId: documentData.clientId,
          merchantId: documentData.merchantId,
          activityType: 'document_shared',
          description: `Document shared: ${document.title}`,
          details: { documentId: document.id, sharedBy: documentData.sharedById }
        });
        
        // Notify client if portal user exists
        const [portalUser] = await db.select()
          .from(legalPortalUsers)
          .where(and(
            eq(legalPortalUsers.clientId, documentData.clientId),
            eq(legalPortalUsers.isActive, true)
          ));
        
        if (portalUser) {
          // Send email notification (implementation would be in email service)
          // await this.sendDocumentNotification(portalUser, document);
        }
        
        return newShare;
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      throw new Error('Failed to share document');
    }
  }
  
  /**
   * Get client shared documents
   */
  async getClientDocuments(clientId: number, merchantId: number): Promise<any[]> {
    try {
      // Use raw SQL to avoid issues with schema not matching all table columns
      const documentsResult = await db.execute(sql`
        SELECT 
          d.*,
          s.shared_at as "sharedAt",
          s.shared_by_id as "sharedBy",
          s.note,
          s.matter_id as "matterId"
        FROM 
          legal_portal_shared_documents s
        INNER JOIN 
          legal_documents d ON s.document_id = d.id
        WHERE 
          s.client_id = ${clientId}
          AND s.merchant_id = ${merchantId}
          AND s.is_active = true
        ORDER BY 
          s.shared_at DESC
      `);
      
      // Parse the result
      return documentsResult.rows.map(row => ({
        id: row.id,
        title: row.title,
        documentType: row.document_type,
        status: row.status,
        clientId: row.client_id,
        matterId: row.matter_id || row.matterId, // Use the joined matter_id if document's is null
        fileUrl: row.file_url,
        fileSize: row.file_size,
        sharedAt: row.sharedAt,
        sharedBy: row.sharedBy,
        note: row.note,
        isPrivate: row.is_private,
        uploadedBy: row.uploaded_by,
        createdAt: row.created_at,
        merchant_id: row.merchant_id
        // We don't need to include e_filing_id and e_filing_status here
      }));
    } catch (error) {
      console.error('Error getting client documents:', error);
      throw new Error('Failed to retrieve client documents');
    }
  }
  
  /**
   * Get client invoices
   */
  async getClientInvoices(clientId: number, merchantId: number): Promise<LegalInvoice[]> {
    try {
      // Use raw SQL to avoid matter_number column reference issues
      const result = await db.execute(sql`
        SELECT * FROM legal_invoices
        WHERE client_id = ${clientId}
        AND merchant_id = ${merchantId}
        AND status = 'sent'
        ORDER BY created_at DESC
      `);
      
      // Transform the raw results to match the expected type
      const invoices = result.rows.map(row => ({
        id: row.id,
        merchantId: row.merchant_id,
        clientId: row.client_id,
        matterId: row.matter_id,
        invoiceNumber: row.invoice_number,
        amount: row.amount,
        status: row.status,
        dueDate: row.due_date ? new Date(row.due_date) : null,
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
      }));
      
      return invoices;
    } catch (error) {
      console.error('Error getting client invoices:', error);
      throw new Error('Failed to retrieve client invoices');
    }
  }
  
  /**
   * Get client invoice details
   */
  async getInvoiceDetails(invoiceId: number, clientId: number, merchantId: number): Promise<any> {
    try {
      // Use raw SQL to get the invoice to avoid schema mismatches
      const invoiceResult = await db.execute(sql`
        SELECT *
        FROM legal_invoices
        WHERE 
          id = ${invoiceId}
          AND client_id = ${clientId}
          AND merchant_id = ${merchantId}
      `);
      
      if (!invoiceResult.rows || invoiceResult.rows.length === 0) {
        throw new Error('Invoice not found or not accessible');
      }
      
      const invoice = invoiceResult.rows[0];
      
      // Get time entries directly with SQL
      const timeEntriesResult = await db.execute(sql`
        SELECT * FROM legal_time_entries
        WHERE invoice_id = ${invoiceId}
      `);
      
      // Get expense entries directly with SQL
      const expenseEntriesResult = await db.execute(sql`
        SELECT * FROM legal_expense_entries
        WHERE invoice_id = ${invoiceId}
      `);
      
      // Prepare the invoice entries data structure
      const invoiceWithEntries = {
        timeEntries: timeEntriesResult.rows || [],
        expenseEntries: expenseEntriesResult.rows || []
      };
      
      // Log invoice view activity
      await this.logPortalActivity({
        portalUserId: 0, // This would need to be provided in the actual call
        clientId,
        merchantId,
        activityType: 'invoice_viewed',
        description: `Viewed invoice #${invoice.invoice_number}`,
        details: { invoiceId: invoice.id }
      });
      
      // Format invoice data to match expected structure
      const formattedInvoice = {
        id: invoice.id,
        merchantId: invoice.merchant_id,
        clientId: invoice.client_id,
        matterId: invoice.matter_id,
        invoiceNumber: invoice.invoice_number,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        status: invoice.status,
        totalAmount: invoice.total_amount,
        notes: invoice.notes,
        subtotal: invoice.subtotal,
        discountAmount: invoice.discount_amount,
        taxAmount: invoice.tax_amount,
        amountPaid: invoice.amount_paid,
        balanceDue: invoice.balance_due,
        timeEntriesTotal: invoice.time_entries_total,
        expensesTotal: invoice.expenses_total,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      };
      
      return {
        invoice: formattedInvoice,
        timeEntries: invoiceWithEntries.timeEntries || [],
        expenseEntries: invoiceWithEntries.expenseEntries || []
      };
    } catch (error) {
      console.error('Error getting invoice details:', error);
      throw new Error('Failed to retrieve invoice details');
    }
  }
  
  /**
   * Log portal activity
   */
  async logPortalActivity(activityData: InsertLegalPortalActivity): Promise<LegalPortalActivity> {
    try {
      const [activity] = await db.insert(legalPortalActivities)
        .values({
          ...activityData,
          timestamp: new Date()
        })
        .returning();
      
      return activity;
    } catch (error) {
      console.error('Error logging portal activity:', error);
      return null;
    }
  }
  
  /**
   * Get portal activity log for a client
   */
  async getClientActivityLog(clientId: number, merchantId: number, options: { limit?: number, offset?: number } = {}): Promise<LegalPortalActivity[]> {
    try {
      const { limit = 50, offset = 0 } = options;
      
      const activities = await db.select()
        .from(legalPortalActivities)
        .where(and(
          eq(legalPortalActivities.clientId, clientId),
          eq(legalPortalActivities.merchantId, merchantId)
        ))
        .orderBy(desc(legalPortalActivities.timestamp))
        .limit(limit)
        .offset(offset);
      
      return activities;
    } catch (error) {
      console.error('Error getting client activity log:', error);
      throw new Error('Failed to retrieve activity log');
    }
  }
  
  /**
   * Helper method to hash a password
   */
  private async hashPassword(password: string, salt: string): Promise<string> {
    const buf = await scryptAsync(password, salt, 64) as Buffer;
    return buf.toString('hex');
  }
  
  /**
   * Helper method to verify a password
   */
  private async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
    // For testing: direct comparison if not using salt format
    if (!storedPassword.includes('.')) {
      return password === storedPassword;
    }
    
    // Production: use scrypt for hashed passwords
    try {
      const [hash, salt] = storedPassword.split('.');
      const buf = await scryptAsync(password, salt, 64) as Buffer;
      return buf.toString('hex') === hash;
    } catch (error) {
      console.error('Password verification error:', error);
      // Fallback to direct comparison if scrypt fails
      return password === storedPassword;
    }
  }

  /**
   * Send a message in the client portal
   */
  async sendMessage(messageData: InsertLegalPortalMessage): Promise<LegalPortalMessage> {
    try {
      // Insert the message
      const [message] = await db.insert(legalPortalMessages)
        .values({
          ...messageData,
          isRead: false,
          readAt: null
        })
        .returning();
      
      // Log message sent activity
      await this.logPortalActivity({
        portalUserId: messageData.senderType === 'client' ? messageData.senderId : 0,
        clientId: messageData.clientId,
        merchantId: messageData.merchantId,
        activityType: 'message_sent',
        description: `${messageData.senderType === 'client' ? 'Client' : 'Firm'} sent a message: ${messageData.subject}`,
        details: { messageId: message.id }
      });
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }
  
  /**
   * Get messages for a client
   */
  async getClientMessages(clientId: number, merchantId: number, options: { limit?: number, offset?: number, matterId?: number } = {}): Promise<LegalPortalMessage[]> {
    try {
      const { limit = 50, offset = 0, matterId } = options;
      
      // Base query
      let query = db.select()
        .from(legalPortalMessages)
        .where(and(
          eq(legalPortalMessages.clientId, clientId),
          eq(legalPortalMessages.merchantId, merchantId)
        ));
      
      // Filter by matter if specified
      if (matterId) {
        query = query.where(eq(legalPortalMessages.matterId, matterId));
      }
      
      // Get messages
      const messages = await query
        .orderBy(desc(legalPortalMessages.createdAt))
        .limit(limit)
        .offset(offset);
      
      return messages;
    } catch (error) {
      console.error('Error getting client messages:', error);
      throw new Error('Failed to retrieve messages');
    }
  }
  
  /**
   * Get a specific message
   */
  async getMessage(messageId: number, clientId: number, merchantId: number): Promise<LegalPortalMessage | undefined> {
    try {
      const [message] = await db.select()
        .from(legalPortalMessages)
        .where(and(
          eq(legalPortalMessages.id, messageId),
          eq(legalPortalMessages.clientId, clientId),
          eq(legalPortalMessages.merchantId, merchantId)
        ));
      
      return message;
    } catch (error) {
      console.error('Error getting message:', error);
      throw new Error('Failed to retrieve message');
    }
  }
  
  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: number, clientId: number, merchantId: number, portalUserId: number): Promise<LegalPortalMessage | undefined> {
    try {
      // Check if the message exists and belongs to the client
      const [existingMessage] = await db.select()
        .from(legalPortalMessages)
        .where(and(
          eq(legalPortalMessages.id, messageId),
          eq(legalPortalMessages.clientId, clientId),
          eq(legalPortalMessages.merchantId, merchantId)
        ));
      
      if (!existingMessage) {
        throw new Error('Message not found or not accessible');
      }
      
      // Only mark as read if it's not already read
      if (!existingMessage.isRead) {
        // Mark the message as read
        const [updatedMessage] = await db.update(legalPortalMessages)
          .set({
            isRead: true,
            readAt: new Date()
          })
          .where(eq(legalPortalMessages.id, messageId))
          .returning();
        
        // Log message read activity
        await this.logPortalActivity({
          portalUserId,
          clientId,
          merchantId,
          activityType: 'message_read',
          description: `Message read: ${existingMessage.subject}`,
          details: { messageId }
        });
        
        return updatedMessage;
      }
      
      return existingMessage;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }
  
  /**
   * Get unread message count for a client
   */
  async getUnreadMessageCount(clientId: number, merchantId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(*)` })
        .from(legalPortalMessages)
        .where(and(
          eq(legalPortalMessages.clientId, clientId),
          eq(legalPortalMessages.merchantId, merchantId),
          eq(legalPortalMessages.isRead, false)
        ));
      
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  /**
   * Get client trust accounts (IOLTA)
   */
  async getClientTrustAccounts(clientId: number, merchantId: number): Promise<IoltaTrustAccount[]> {
    try {
      // Get all trust accounts for this merchant
      const trustAccounts = await db.select()
        .from(ioltaTrustAccounts)
        .where(
          eq(ioltaTrustAccounts.merchantId, merchantId)
        );
      
      // Get all client ledgers for this client
      const clientLedgers = await db.select()
        .from(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.clientId, clientId),
          eq(ioltaClientLedgers.merchantId, merchantId)
        ));
      
      // Filter to only include trust accounts that have ledgers for this client
      const trustAccountIds = new Set(clientLedgers.map(ledger => ledger.trustAccountId));
      const filteredTrustAccounts = trustAccounts.filter(account => 
        trustAccountIds.has(account.id) && account.accountStatus === 'active'
      );
      
      // Log trust account view activity
      await this.logPortalActivity({
        portalUserId: 0, // Will be replaced in the route handler
        clientId,
        merchantId,
        activityType: 'document_viewed',
        description: 'Viewed trust accounts',
        details: { trustAccountCount: filteredTrustAccounts.length }
      });
      
      return filteredTrustAccounts;
    } catch (error) {
      console.error('Error getting client trust accounts:', error);
      throw new Error('Failed to retrieve client trust accounts');
    }
  }

  /**
   * Get client ledgers for a specific trust account
   */
  async getClientTrustLedgers(clientId: number, merchantId: number, trustAccountId: number): Promise<IoltaClientLedger[]> {
    try {
      // Verify the trust account exists and belongs to the merchant
      const [trustAccount] = await db.select()
        .from(ioltaTrustAccounts)
        .where(and(
          eq(ioltaTrustAccounts.id, trustAccountId),
          eq(ioltaTrustAccounts.merchantId, merchantId)
        ));
      
      if (!trustAccount) {
        throw new Error('Trust account not found or not accessible');
      }
      
      // Get client ledgers for this client and trust account
      const clientLedgers = await db.select()
        .from(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.clientId, clientId),
          eq(ioltaClientLedgers.merchantId, merchantId),
          eq(ioltaClientLedgers.trustAccountId, trustAccountId),
          eq(ioltaClientLedgers.status, 'active')
        ));
      
      // Log ledger view activity
      await this.logPortalActivity({
        portalUserId: 0, // Will be replaced in the route handler
        clientId,
        merchantId,
        activityType: 'document_viewed',
        description: `Viewed trust account ledgers for account ${trustAccount.accountName}`,
        details: { trustAccountId, ledgerCount: clientLedgers.length }
      });
      
      return clientLedgers;
    } catch (error) {
      console.error('Error getting client trust ledgers:', error);
      throw new Error('Failed to retrieve client trust ledgers');
    }
  }

  /**
   * Get transactions for a specific client ledger
   */
  async getLedgerTransactions(clientId: number, merchantId: number, ledgerId: number): Promise<IoltaTransaction[]> {
    try {
      // Verify the ledger exists and belongs to the client
      const [clientLedger] = await db.select()
        .from(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.id, ledgerId),
          eq(ioltaClientLedgers.clientId, clientId),
          eq(ioltaClientLedgers.merchantId, merchantId)
        ));
      
      if (!clientLedger) {
        throw new Error('Client ledger not found or not accessible');
      }
      
      // Get transactions for this ledger
      const transactions = await db.select()
        .from(ioltaTransactions)
        .where(and(
          eq(ioltaTransactions.clientLedgerId, ledgerId),
          eq(ioltaTransactions.merchantId, merchantId)
        ))
        .orderBy(desc(ioltaTransactions.transactionDate));
      
      // Log transaction view activity
      await this.logPortalActivity({
        portalUserId: 0, // Will be replaced in the route handler
        clientId,
        merchantId,
        activityType: 'document_viewed',
        description: `Viewed transactions for trust account ledger ${clientLedger.matterName}`,
        details: { ledgerId, transactionCount: transactions.length }
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting ledger transactions:', error);
      throw new Error('Failed to retrieve ledger transactions');
    }
  }

  /**
   * Get a combined client trust statement with all ledgers and transactions
   */
  async getClientTrustStatement(clientId: number, merchantId: number, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // Default date range if not provided
      const now = new Date();
      const defaultEndDate = new Date(now);
      const defaultStartDate = new Date(now);
      defaultStartDate.setMonth(defaultStartDate.getMonth() - 3); // Default to 3 months ago
      
      const effectiveStartDate = startDate || defaultStartDate;
      const effectiveEndDate = endDate || defaultEndDate;
      
      // Get all trust accounts the client has ledgers in
      const trustAccounts = await this.getClientTrustAccounts(clientId, merchantId);
      
      const statement: any = {
        clientId,
        merchantId,
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        generatedDate: new Date(),
        accounts: []
      };
      
      // For each trust account, get client ledgers and transactions
      for (const account of trustAccounts) {
        const ledgers = await this.getClientTrustLedgers(clientId, merchantId, account.id);
        
        const accountData: any = {
          trustAccount: account,
          ledgers: []
        };
        
        for (const ledger of ledgers) {
          // Get transactions in the date range
          const transactions = await db.select()
            .from(ioltaTransactions)
            .where(and(
              eq(ioltaTransactions.clientLedgerId, ledger.id),
              eq(ioltaTransactions.merchantId, merchantId),
              gte(ioltaTransactions.transactionDate, effectiveStartDate),
              lte(ioltaTransactions.transactionDate, effectiveEndDate)
            ))
            .orderBy(desc(ioltaTransactions.transactionDate));
          
          // Calculate the running balance
          let runningBalance = 0;
          
          // Get previous balance (all transactions before start date)
          const previousTransactions = await db.select()
            .from(ioltaTransactions)
            .where(and(
              eq(ioltaTransactions.clientLedgerId, ledger.id),
              eq(ioltaTransactions.merchantId, merchantId),
              lt(ioltaTransactions.transactionDate, effectiveStartDate)
            ));
          
          // Calculate opening balance
          for (const transaction of previousTransactions) {
            if (transaction.transactionType === 'deposit') {
              runningBalance += parseFloat(transaction.amount);
            } else if (transaction.transactionType === 'withdrawal') {
              runningBalance -= parseFloat(transaction.amount);
            }
          }
          
          const openingBalance = runningBalance;
          
          // Add running balance to each transaction
          const transactionsWithBalance = transactions.map(transaction => {
            if (transaction.transactionType === 'deposit') {
              runningBalance += parseFloat(transaction.amount);
            } else if (transaction.transactionType === 'withdrawal') {
              runningBalance -= parseFloat(transaction.amount);
            }
            
            return {
              ...transaction,
              runningBalance: runningBalance.toFixed(2)
            };
          });
          
          accountData.ledgers.push({
            ledger,
            openingBalance: openingBalance.toFixed(2),
            closingBalance: runningBalance.toFixed(2),
            transactions: transactionsWithBalance
          });
        }
        
        statement.accounts.push(accountData);
      }
      
      // Log statement view activity
      await this.logPortalActivity({
        portalUserId: 0, // Will be replaced in the route handler
        clientId,
        merchantId,
        activityType: 'document_viewed',
        description: 'Generated trust account statement',
        details: { 
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
          accountCount: statement.accounts.length
        }
      });
      
      return statement;
    } catch (error) {
      console.error('Error generating client trust statement:', error);
      throw new Error('Failed to generate client trust statement');
    }
  }
}

export const clientPortalService = new ClientPortalService();