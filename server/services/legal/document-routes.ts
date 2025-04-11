import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { documentService } from './document-service';
import { insertLegalDocumentSchema, insertLegalDocumentTemplateSchema } from '@shared/schema';

const documentRouter = Router();

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

// Middleware to validate that the user has the right to access this document
const validateDocumentAccess = async (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const document = await documentService.getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // In a real implementation, we would check if the user has access to this document
    // This might involve checking if the user belongs to the same merchant (law firm)
    // or if they have explicit access to the matter/client
    
    // For now, we'll just attach the document to the request for later use
    req.document = document;
    next();
  } catch (error) {
    console.error('Error validating document access:', error);
    res.status(500).json({ error: 'Failed to validate document access' });
  }
};

// Create document
documentRouter.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Parse and validate document data
      const documentDataSchema = insertLegalDocumentSchema.extend({
        metaData: z.any().optional()
      });
      
      const documentData = documentDataSchema.parse({
        ...req.body,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileLocation: req.file.originalname,
        authorId: req.user.id,
        lastModifiedById: req.user.id
      });
      
      const document = await documentService.createDocument(
        documentData, 
        req.file.buffer
      );
      
      res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create document' });
    }
  }
);

// Get documents
documentRouter.get('/', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const merchantId = parseInt(req.query.merchantId as string);
    if (isNaN(merchantId)) {
      return res.status(400).json({ error: 'Invalid merchant ID' });
    }
    
    // Parse optional filters
    const matterId = req.query.matterId ? parseInt(req.query.matterId as string) : undefined;
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
    const documentType = req.query.documentType as string | undefined;
    const status = req.query.status as string | undefined;
    const searchTerm = req.query.search as string | undefined;
    
    const documents = await documentService.getDocuments(
      merchantId,
      matterId,
      clientId,
      documentType,
      status,
      searchTerm
    );
    
    res.json(documents);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// Get document by ID
documentRouter.get('/:id', validateDocumentAccess, (req: Request, res: Response) => {
  // Document is already attached to the request by the validateDocumentAccess middleware
  res.json(req.document);
});

// Update document
documentRouter.patch(
  '/:id',
  validateDocumentAccess,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Parse and validate updates
      const updateSchema = z.object({
        title: z.string().optional(),
        status: z.string().optional(),
        confidentialityLevel: z.string().optional(),
        description: z.string().optional(),
        versionNumber: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metaData: z.any().optional()
      });
      
      const updates = updateSchema.parse(req.body);
      
      // Add current user as last modified by
      updates.lastModifiedById = req.user.id;
      
      // Update the document
      const updatedDocument = await documentService.updateDocument(
        id,
        updates,
        req.file?.buffer
      );
      
      res.json(updatedDocument);
    } catch (error) {
      console.error('Error updating document:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update document' });
    }
  }
);

// Delete document
documentRouter.delete('/:id', validateDocumentAccess, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await documentService.deleteDocument(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Download document file
documentRouter.get('/:id/file', validateDocumentAccess, (req: Request, res: Response) => {
  try {
    const document = req.document;
    const fileBuffer = documentService.getDocumentFile(document.fileLocation);
    
    res.setHeader('Content-Type', document.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.title)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Get document versions
documentRouter.get('/:id/versions', validateDocumentAccess, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const versions = await documentService.getDocumentVersions(id);
    res.json(versions);
  } catch (error) {
    console.error('Error getting document versions:', error);
    res.status(500).json({ error: 'Failed to retrieve document versions' });
  }
});

// Download specific version file
documentRouter.get(
  '/:id/versions/:versionId/file',
  validateDocumentAccess,
  async (req: Request, res: Response) => {
    try {
      const versionId = parseInt(req.params.versionId);
      if (isNaN(versionId)) {
        return res.status(400).json({ error: 'Invalid version ID' });
      }
      
      const versions = await documentService.getDocumentVersions(parseInt(req.params.id));
      const version = versions.find(v => v.id === versionId);
      
      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }
      
      const fileBuffer = documentService.getDocumentVersionFile(version.fileLocation);
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(req.document.title)}_v${version.versionNumber}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error downloading version file:', error);
      res.status(500).json({ error: 'Failed to download version file' });
    }
  }
);

// Search documents
documentRouter.get('/search', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const merchantId = parseInt(req.query.merchantId as string);
    const searchTerm = req.query.q as string;
    
    if (isNaN(merchantId) || !searchTerm) {
      return res.status(400).json({ error: 'Invalid search parameters' });
    }
    
    const matterId = req.query.matterId ? parseInt(req.query.matterId as string) : undefined;
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
    
    const documents = await documentService.searchDocuments(
      merchantId,
      searchTerm,
      matterId,
      clientId
    );
    
    res.json(documents);
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
});

// DOCUMENT TEMPLATES

// Create document template
documentRouter.post(
  '/templates',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Parse and validate template data
      const templateDataSchema = insertLegalDocumentTemplateSchema.extend({
        variables: z.record(z.string(), z.any()).optional()
      });
      
      const templateData = templateDataSchema.parse({
        ...req.body,
        fileLocation: req.file.originalname,
        createdById: req.user.id,
        lastModifiedById: req.user.id
      });
      
      const template = await documentService.createDocumentTemplate(
        templateData,
        req.file.buffer
      );
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating document template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create document template' });
    }
  }
);

// Get document templates
documentRouter.get('/templates', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const merchantId = parseInt(req.query.merchantId as string);
    if (isNaN(merchantId)) {
      return res.status(400).json({ error: 'Invalid merchant ID' });
    }
    
    const documentType = req.query.documentType as string | undefined;
    const practiceArea = req.query.practiceArea as string | undefined;
    const searchTerm = req.query.search as string | undefined;
    
    const templates = await documentService.getDocumentTemplates(
      merchantId,
      documentType,
      practiceArea,
      searchTerm
    );
    
    res.json(templates);
  } catch (error) {
    console.error('Error getting document templates:', error);
    res.status(500).json({ error: 'Failed to retrieve document templates' });
  }
});

// Get document template by ID
documentRouter.get('/templates/:id', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    const template = await documentService.getDocumentTemplateById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error getting document template:', error);
    res.status(500).json({ error: 'Failed to retrieve document template' });
  }
});

// Update document template
documentRouter.patch(
  '/templates/:id',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      // Parse and validate updates
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        documentType: z.string().optional(),
        practiceArea: z.string().optional(),
        variables: z.record(z.string(), z.any()).optional(),
        isActive: z.boolean().optional()
      });
      
      const updates = updateSchema.parse(req.body);
      
      // Add current user as last modified by
      updates.lastModifiedById = req.user.id;
      
      // Update the template
      const updatedTemplate = await documentService.updateDocumentTemplate(
        id,
        updates,
        req.file?.buffer
      );
      
      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating document template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update document template' });
    }
  }
);

// Delete document template
documentRouter.delete('/templates/:id', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    await documentService.deleteDocumentTemplate(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document template:', error);
    res.status(500).json({ error: 'Failed to delete document template' });
  }
});

// Download document template file
documentRouter.get('/templates/:id/file', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    const template = await documentService.getDocumentTemplateById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const fileBuffer = documentService.getDocumentTemplateFile(template.fileLocation);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(template.title)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading template file:', error);
    res.status(500).json({ error: 'Failed to download template file' });
  }
});

// Create document from template
documentRouter.post(
  '/templates/:id/create-document',
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      // Parse and validate document data
      const documentDataSchema = insertLegalDocumentSchema.extend({
        metaData: z.any().optional(),
        variables: z.record(z.string(), z.string()).optional()
      });
      
      const documentData = documentDataSchema.parse({
        ...req.body,
        authorId: req.user.id,
        lastModifiedById: req.user.id
      });
      
      const variables = req.body.variables || {};
      
      const document = await documentService.createDocumentFromTemplate(
        templateId,
        documentData,
        variables
      );
      
      res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document from template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create document from template' });
    }
  }
);

export { documentRouter };