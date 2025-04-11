import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { clientPortalService } from './client-portal-service';
import { documentService } from './document-service';
import { legalTimeExpenseService } from './time-expense-service';
import { 
  insertLegalPortalUserSchema, 
  insertLegalPortalSharedDocumentSchema,
  insertLegalPortalActivitySchema,
  insertLegalPortalMessageSchema
} from '@shared/schema-portal';

const clientPortalRouter = Router();

/**
 * Middleware to ensure the user is authenticated to the client portal
 */
const ensurePortalAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // Get the authorization token from the header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Validate the session
  const { valid, session, user } = await clientPortalService.validateSession(token);
  
  if (!valid || !session || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  // Attach the portal user and session to the request
  req.portalUser = user;
  req.portalSession = session;
  
  next();
};

// Register a new portal user
clientPortalRouter.post('/users', async (req: Request, res: Response) => {
  try {
    // Validate input
    const userData = insertLegalPortalUserSchema.parse(req.body);
    
    // Create the portal user
    const portalUser = await clientPortalService.createPortalUser(userData);
    
    // Return the created user (excluding password)
    const { password, resetToken, resetTokenExpiry, ...userResponse } = portalUser;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating portal user:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to create portal user' });
  }
});

// Authenticate a portal user
clientPortalRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, merchantId } = req.body;
    
    if (!email || !password || !merchantId) {
      return res.status(400).json({ error: 'Email, password, and merchantId are required' });
    }
    
    // Authenticate the user
    const { user, session } = await clientPortalService.authenticatePortalUser(email, password, merchantId);
    
    // Return the user and session token (excluding password)
    const { password: _, resetToken, resetTokenExpiry, ...userResponse } = user;
    res.json({
      user: userResponse,
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Error authenticating portal user:', error);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
});

// Log out a portal user
clientPortalRouter.post('/auth/logout', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    // Log out the user
    const success = await clientPortalService.logoutPortalUser(token);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to log out' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging out portal user:', error);
    res.status(500).json({ error: error.message || 'Failed to log out' });
  }
});

// Request a password reset
clientPortalRouter.post('/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, merchantId } = req.body;
    
    if (!email || !merchantId) {
      return res.status(400).json({ error: 'Email and merchantId are required' });
    }
    
    // Process the reset request
    await clientPortalService.resetPassword(email, merchantId);
    
    // Always return success to prevent email enumeration
    res.json({ success: true });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    // Still return success to prevent email enumeration
    res.json({ success: true });
  }
});

// Complete a password reset
clientPortalRouter.post('/auth/reset-password/complete', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    // Complete the password reset
    const success = await clientPortalService.completePasswordReset(token, newPassword);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error completing password reset:', error);
    res.status(400).json({ error: error.message || 'Failed to reset password' });
  }
});

// Get current portal user information
clientPortalRouter.get('/user', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    // Return the authenticated user (already attached by middleware)
    const { password, resetToken, resetTokenExpiry, ...userResponse } = req.portalUser;
    res.json(userResponse);
  } catch (error) {
    console.error('Error getting portal user information:', error);
    res.status(500).json({ error: error.message || 'Failed to get user information' });
  }
});

// Get client matters
clientPortalRouter.get('/matters', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const { clientId, merchantId } = req.portalUser;
    
    // Get matters for the client
    const matters = await clientPortalService.getClientMatters(clientId, merchantId);
    
    res.json(matters);
  } catch (error) {
    console.error('Error getting client matters:', error);
    res.status(500).json({ error: error.message || 'Failed to get client matters' });
  }
});

// Get matter details
clientPortalRouter.get('/matters/:matterId', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const matterId = parseInt(req.params.matterId);
    const { clientId, merchantId, id: portalUserId } = req.portalUser;
    
    if (isNaN(matterId)) {
      return res.status(400).json({ error: 'Invalid matter ID' });
    }
    
    // Get matter details
    const matterDetails = await clientPortalService.getMatterDetails(matterId, clientId, merchantId);
    
    // Log the activity
    await clientPortalService.logPortalActivity({
      portalUserId,
      clientId,
      merchantId,
      activityType: 'matter_viewed',
      description: `Viewed matter: ${matterDetails.matter.title}`,
      details: { matterId }
    });
    
    res.json(matterDetails);
  } catch (error) {
    console.error('Error getting matter details:', error);
    res.status(500).json({ error: error.message || 'Failed to get matter details' });
  }
});

// Get shared documents
clientPortalRouter.get('/documents', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const { clientId, merchantId } = req.portalUser;
    
    // Get documents shared with the client
    const documents = await clientPortalService.getClientDocuments(clientId, merchantId);
    
    res.json(documents);
  } catch (error) {
    console.error('Error getting client documents:', error);
    res.status(500).json({ error: error.message || 'Failed to get client documents' });
  }
});

// Download a document
clientPortalRouter.get('/documents/:documentId/file', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const { clientId, merchantId, id: portalUserId } = req.portalUser;
    
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    // Check if the document is shared with the client
    const documents = await clientPortalService.getClientDocuments(clientId, merchantId);
    const sharedDocument = documents.find(doc => doc.id === documentId);
    
    if (!sharedDocument) {
      return res.status(403).json({ error: 'Document not accessible' });
    }
    
    // Get the document file
    const fileBuffer = documentService.getDocumentFile(sharedDocument.fileLocation);
    
    // Log the download activity
    await clientPortalService.logPortalActivity({
      portalUserId,
      clientId,
      merchantId,
      activityType: 'document_downloaded',
      description: `Downloaded document: ${sharedDocument.title}`,
      details: { documentId }
    });
    
    // Set response headers
    res.setHeader('Content-Type', sharedDocument.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(sharedDocument.title)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Send the file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: error.message || 'Failed to download document' });
  }
});

// Share a document with a client (admin operation)
clientPortalRouter.post('/share-document', async (req: Request, res: Response) => {
  try {
    // Validate the request
    const shareData = insertLegalPortalSharedDocumentSchema.parse(req.body);
    
    // Share the document
    const sharedDocument = await clientPortalService.shareDocument(shareData);
    
    res.status(201).json(sharedDocument);
  } catch (error) {
    console.error('Error sharing document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to share document' });
  }
});

// Get client invoices
clientPortalRouter.get('/invoices', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const { clientId, merchantId } = req.portalUser;
    
    // Get invoices for the client
    const invoices = await clientPortalService.getClientInvoices(clientId, merchantId);
    
    res.json(invoices);
  } catch (error) {
    console.error('Error getting client invoices:', error);
    res.status(500).json({ error: error.message || 'Failed to get client invoices' });
  }
});

// Get invoice details
clientPortalRouter.get('/invoices/:invoiceId', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const { clientId, merchantId, id: portalUserId } = req.portalUser;
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }
    
    // Get invoice details
    const invoiceDetails = await clientPortalService.getInvoiceDetails(invoiceId, clientId, merchantId);
    
    // Log the activity
    await clientPortalService.logPortalActivity({
      portalUserId,
      clientId,
      merchantId,
      activityType: 'invoice_viewed',
      description: `Viewed invoice #${invoiceDetails.invoice.invoiceNumber}`,
      details: { invoiceId }
    });
    
    res.json(invoiceDetails);
  } catch (error) {
    console.error('Error getting invoice details:', error);
    res.status(500).json({ error: error.message || 'Failed to get invoice details' });
  }
});

// Download invoice PDF
clientPortalRouter.get('/invoices/:invoiceId/pdf', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const { clientId, merchantId, id: portalUserId } = req.portalUser;
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }
    
    // Check if the invoice belongs to the client
    const invoices = await clientPortalService.getClientInvoices(clientId, merchantId);
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
      return res.status(403).json({ error: 'Invoice not accessible' });
    }
    
    // Generate the invoice PDF using the time-expense service
    const pdfBuffer = await legalTimeExpenseService.generateInvoicePdf(invoiceId);
    
    // Log the download activity
    await clientPortalService.logPortalActivity({
      portalUserId,
      clientId,
      merchantId,
      activityType: 'invoice_downloaded',
      description: `Downloaded invoice #${invoice.invoiceNumber}`,
      details: { invoiceId }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the file
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ error: error.message || 'Failed to download invoice' });
  }
});

// Get client activity log
clientPortalRouter.get('/activity', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const { clientId, merchantId } = req.portalUser;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Get activity log
    const activities = await clientPortalService.getClientActivityLog(clientId, merchantId, { limit, offset });
    
    res.json(activities);
  } catch (error) {
    console.error('Error getting activity log:', error);
    res.status(500).json({ error: error.message || 'Failed to get activity log' });
  }
});

// Get client messages
clientPortalRouter.get('/messages', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const { clientId, merchantId } = req.portalUser;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const matterId = req.query.matterId ? parseInt(req.query.matterId as string) : undefined;
    
    // Get messages for the client
    const messages = await clientPortalService.getClientMessages(clientId, merchantId, { limit, offset, matterId });
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting client messages:', error);
    res.status(500).json({ error: error.message || 'Failed to get client messages' });
  }
});

// Get unread message count
clientPortalRouter.get('/messages/unread-count', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const { clientId, merchantId } = req.portalUser;
    
    // Get unread message count
    const count = await clientPortalService.getUnreadMessageCount(clientId, merchantId);
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    res.status(500).json({ error: error.message || 'Failed to get unread message count' });
  }
});

// Get a specific message
clientPortalRouter.get('/messages/:messageId', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const { clientId, merchantId } = req.portalUser;
    
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    
    // Get message details
    const message = await clientPortalService.getMessage(messageId, clientId, merchantId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: error.message || 'Failed to get message' });
  }
});

// Mark a message as read
clientPortalRouter.patch('/messages/:messageId/read', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const { clientId, merchantId, id: portalUserId } = req.portalUser;
    
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    
    // Mark message as read
    const updatedMessage = await clientPortalService.markMessageAsRead(messageId, clientId, merchantId, portalUserId);
    
    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message || 'Failed to mark message as read' });
  }
});

// Send a message
clientPortalRouter.post('/messages', ensurePortalAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate input
    const messageData = insertLegalPortalMessageSchema.parse({
      ...req.body,
      clientId: req.portalUser.clientId,
      merchantId: req.portalUser.merchantId,
      senderType: 'client',
      senderId: req.portalUser.id,
      isRead: false
    });
    
    // Send the message
    const message = await clientPortalService.sendMessage(messageData);
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

export { clientPortalRouter };