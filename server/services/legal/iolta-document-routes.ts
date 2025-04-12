import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { ioltaService } from './iolta-service';
import { documentService } from './document-service';
import { insertLegalDocumentSchema } from '@shared/schema';
import { IoltaTransaction } from '@shared/schema';

// Extend Request to include transaction and user properties
declare global {
  namespace Express {
    interface Request {
      transaction?: IoltaTransaction;
      user: {
        id: string | number;
        merchantId: number;
        [key: string]: any;
      };
      file?: Express.Multer.File;
      isAuthenticated(): boolean;
    }
  }
}

const ioltaDocumentRouter = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      '.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx',
      '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.html'
    ];
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      callback(null, true);
    } else {
      callback(new Error('File type not allowed'));
    }
  }
});

// Middleware to validate that the user has access to the transaction
const validateTransactionAccess = async (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const transactionId = parseInt(req.params.transactionId);
    if (isNaN(transactionId)) {
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }
    
    const transaction = await ioltaService.getTransaction(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // In a real implementation, we would check if the user has access to this transaction
    // by checking if they belong to the same merchant (law firm)
    
    // For now, we'll just attach the transaction to the request for later use
    req.transaction = transaction;
    next();
  } catch (error) {
    console.error('Error validating transaction access:', error);
    res.status(500).json({ error: 'Failed to validate transaction access' });
  }
};

// Attach a document to a transaction
ioltaDocumentRouter.post(
  '/transactions/:transactionId/documents',
  validateTransactionAccess,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const transactionId = parseInt(req.params.transactionId);
      
      // Parse and validate document data
      const documentDataSchema = insertLegalDocumentSchema.extend({
        metaData: z.any().optional()
      });
      
      // Get the transaction for additional data
      const transaction = req.transaction;
      
      // Create document data with transaction metadata
      const documentData = documentDataSchema.parse({
        ...req.body,
        merchantId: transaction.merchantId,
        // Use transaction.transactionType as documentType if not provided
        documentType: req.body.documentType || `IOLTA ${transaction.transactionType}`,
        title: req.body.title || `${transaction.transactionType} - ${transaction.amount} - ${new Date(transaction.createdAt).toLocaleDateString()}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileLocation: req.file.originalname,
        authorId: req.user.id,
        lastModifiedById: req.user.id,
        metaData: {
          ...req.body.metaData,
          transactionId: transaction.id,
          transactionType: transaction.transactionType,
          transactionDate: transaction.createdAt
        }
      });
      
      // Create the document and attach it to the transaction
      const document = await documentService.createDocument(documentData, req.file.buffer);
      const updatedTransaction = await ioltaService.attachDocumentToTransaction(transactionId, document.id);
      
      res.status(201).json({
        transaction: updatedTransaction,
        document
      });
    } catch (error) {
      console.error('Error attaching document to transaction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to attach document to transaction' });
    }
  }
);

// Get document attached to a transaction
ioltaDocumentRouter.get(
  '/transactions/:transactionId/documents',
  validateTransactionAccess,
  async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.transactionId);
      const document = await ioltaService.getTransactionDocument(transactionId);
      
      if (!document) {
        return res.status(404).json({ error: 'No document attached to this transaction' });
      }
      
      res.json(document);
    } catch (error) {
      console.error('Error getting transaction document:', error);
      res.status(500).json({ error: 'Failed to retrieve transaction document' });
    }
  }
);

// Download document attached to a transaction
ioltaDocumentRouter.get(
  '/transactions/:transactionId/documents/download',
  validateTransactionAccess,
  async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.transactionId);
      const document = await ioltaService.getTransactionDocument(transactionId);
      
      if (!document) {
        return res.status(404).json({ error: 'No document attached to this transaction' });
      }
      
      const fileBuffer = documentService.getDocumentFile(document.fileLocation);
      
      res.setHeader('Content-Type', document.fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.title)}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error downloading transaction document:', error);
      res.status(500).json({ error: 'Failed to download transaction document' });
    }
  }
);

// Get all documents related to a client ledger
ioltaDocumentRouter.get(
  '/client-ledgers/:clientLedgerId/documents',
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const clientLedgerId = parseInt(req.params.clientLedgerId);
      if (isNaN(clientLedgerId)) {
        return res.status(400).json({ error: 'Invalid client ledger ID' });
      }
      
      const documents = await ioltaService.getClientLedgerDocuments(clientLedgerId);
      res.json(documents);
    } catch (error) {
      console.error('Error getting client ledger documents:', error);
      res.status(500).json({ error: 'Failed to retrieve client ledger documents' });
    }
  }
);

// Create transaction with document in a single request
ioltaDocumentRouter.post(
  '/transactions/with-document',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Parse transaction data from the request body
      const transactionData = JSON.parse(req.body.transactionData);
      
      // Parse document data from the request body
      const documentData = JSON.parse(req.body.documentData);
      
      // Set the created by to the current user
      transactionData.createdBy = req.user.id;
      documentData.authorId = req.user.id;
      documentData.lastModifiedById = req.user.id;
      
      // Add file information to document data
      documentData.fileSize = req.file.size;
      documentData.fileType = req.file.mimetype;
      documentData.fileLocation = req.file.originalname;
      
      // Record the transaction with the document
      const transactionWithDocument = await ioltaService.recordTransactionWithDocument(
        transactionData,
        documentData,
        req.file.buffer
      );
      
      res.status(201).json(transactionWithDocument);
    } catch (error) {
      console.error('Error creating transaction with document:', error);
      res.status(500).json({ error: 'Failed to create transaction with document' });
    }
  }
);

export { ioltaDocumentRouter };