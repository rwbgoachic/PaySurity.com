import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { db } from '../../db';
import { 
  legalDocuments, 
  legalDocumentVersions, 
  legalDocumentTemplates, 
  type LegalDocument,
  type InsertLegalDocument,
  type LegalDocumentVersion,
  type InsertLegalDocumentVersion,
  type LegalDocumentTemplate,
  type InsertLegalDocumentTemplate
} from '@shared/schema';
import { eq, and, like, desc, sql } from 'drizzle-orm';

/**
 * Legal Document Management Service
 * 
 * Provides functionality for managing legal documents including:
 * - Document creation, retrieval, update, and deletion
 * - Version control with audit trails
 * - Document templates management
 * - Document access control
 * - Document search and filtering
 */
export class DocumentService {
  private documentDir: string;
  private templateDir: string;
  
  constructor() {
    // Create document directories if they don't exist
    this.documentDir = path.join(process.cwd(), 'documents');
    this.templateDir = path.join(this.documentDir, 'templates');
    
    if (!fs.existsSync(this.documentDir)) {
      fs.mkdirSync(this.documentDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.templateDir)) {
      fs.mkdirSync(this.templateDir, { recursive: true });
    }
  }
  
  /**
   * Create a new document
   */
  async createDocument(document: InsertLegalDocument, fileBuffer: Buffer): Promise<LegalDocument> {
    try {
      // Generate a unique filename
      const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}${path.extname(document.fileLocation)}`;
      const filePath = path.join(this.documentDir, fileName);
      
      // Save the file
      fs.writeFileSync(filePath, fileBuffer);
      
      // Update the file location to the stored path
      const documentToInsert = {
        ...document,
        fileLocation: fileName,
        lastModifiedAt: new Date()
      };
      
      // Insert document record
      const [newDocument] = await db.insert(legalDocuments)
        .values(documentToInsert)
        .returning();
      
      // Create initial version record
      await this.createDocumentVersion({
        documentId: newDocument.id,
        versionNumber: newDocument.versionNumber || '1.0',
        createdById: newDocument.authorId,
        fileLocation: newDocument.fileLocation,
        fileSize: newDocument.fileSize,
        changeDescription: 'Initial version'
      });
      
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  }
  
  /**
   * Get document by ID
   */
  async getDocumentById(id: number): Promise<LegalDocument | undefined> {
    try {
      const [document] = await db.select()
        .from(legalDocuments)
        .where(eq(legalDocuments.id, id));
      
      return document;
    } catch (error) {
      console.error('Error getting document:', error);
      throw new Error('Failed to retrieve document');
    }
  }
  
  /**
   * Get all documents with optional filtering
   */
  async getDocuments(
    merchantId: number, 
    matterId?: number, 
    clientId?: number, 
    documentType?: string,
    status?: string,
    searchTerm?: string
  ): Promise<LegalDocument[]> {
    try {
      let query = db.select()
        .from(legalDocuments)
        .where(eq(legalDocuments.merchantId, merchantId));
      
      // Apply filters if provided
      if (matterId) {
        query = query.where(eq(legalDocuments.matterId, matterId));
      }
      
      if (clientId) {
        query = query.where(eq(legalDocuments.clientId, clientId));
      }
      
      if (documentType) {
        query = query.where(eq(legalDocuments.documentType, documentType));
      }
      
      if (status) {
        query = query.where(eq(legalDocuments.status, status));
      }
      
      if (searchTerm) {
        query = query.where(like(legalDocuments.title, `%${searchTerm}%`));
      }
      
      // Order by most recently created
      query = query.orderBy(desc(legalDocuments.createdAt));
      
      const documents = await query;
      return documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw new Error('Failed to retrieve documents');
    }
  }
  
  /**
   * Update document
   */
  async updateDocument(
    id: number, 
    updates: Partial<InsertLegalDocument>, 
    fileBuffer?: Buffer
  ): Promise<LegalDocument> {
    try {
      const document = await this.getDocumentById(id);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // If a new file is provided, save it
      if (fileBuffer) {
        // Generate a unique filename
        const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}${path.extname(updates.fileLocation || document.fileLocation)}`;
        const filePath = path.join(this.documentDir, fileName);
        
        // Save the file
        fs.writeFileSync(filePath, fileBuffer);
        
        // Update the file location
        updates.fileLocation = fileName;
      }
      
      // Update version if not specified
      if (!updates.versionNumber) {
        const currentVersion = parseFloat(document.versionNumber || '1.0');
        updates.versionNumber = (currentVersion + 0.1).toFixed(1);
      }
      
      updates.lastModifiedAt = new Date();
      
      // Update document record
      const [updatedDocument] = await db.update(legalDocuments)
        .set(updates)
        .where(eq(legalDocuments.id, id))
        .returning();
      
      // Create new version record
      if (fileBuffer || updates.versionNumber !== document.versionNumber) {
        await this.createDocumentVersion({
          documentId: updatedDocument.id,
          versionNumber: updatedDocument.versionNumber || '1.0',
          createdById: updates.lastModifiedById || document.authorId,
          fileLocation: updatedDocument.fileLocation,
          fileSize: updatedDocument.fileSize,
          changeDescription: updates.metaData?.changeDescription || 'Updated document'
        });
      }
      
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }
  
  /**
   * Delete document
   */
  async deleteDocument(id: number): Promise<{ success: boolean }> {
    try {
      const document = await this.getDocumentById(id);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Delete the file if it exists
      const filePath = path.join(this.documentDir, document.fileLocation);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete all versions
      await db.delete(legalDocumentVersions)
        .where(eq(legalDocumentVersions.documentId, id));
      
      // Delete the document record
      await db.delete(legalDocuments)
        .where(eq(legalDocuments.id, id));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }
  
  /**
   * Get document file
   */
  getDocumentFile(fileLocation: string): Buffer {
    try {
      const filePath = path.join(this.documentDir, fileLocation);
      if (!fs.existsSync(filePath)) {
        throw new Error('Document file not found');
      }
      
      return fs.readFileSync(filePath);
    } catch (error) {
      console.error('Error getting document file:', error);
      throw new Error('Failed to retrieve document file');
    }
  }
  
  /**
   * Create document version
   */
  async createDocumentVersion(version: InsertLegalDocumentVersion): Promise<LegalDocumentVersion> {
    try {
      const [newVersion] = await db.insert(legalDocumentVersions)
        .values(version)
        .returning();
      
      return newVersion;
    } catch (error) {
      console.error('Error creating document version:', error);
      throw new Error('Failed to create document version');
    }
  }
  
  /**
   * Get document versions
   */
  async getDocumentVersions(documentId: number): Promise<LegalDocumentVersion[]> {
    try {
      const versions = await db.select()
        .from(legalDocumentVersions)
        .where(eq(legalDocumentVersions.documentId, documentId))
        .orderBy(desc(legalDocumentVersions.createdAt));
      
      return versions;
    } catch (error) {
      console.error('Error getting document versions:', error);
      throw new Error('Failed to retrieve document versions');
    }
  }
  
  /**
   * Get document version file
   */
  getDocumentVersionFile(fileLocation: string): Buffer {
    try {
      const filePath = path.join(this.documentDir, fileLocation);
      if (!fs.existsSync(filePath)) {
        throw new Error('Document version file not found');
      }
      
      return fs.readFileSync(filePath);
    } catch (error) {
      console.error('Error getting document version file:', error);
      throw new Error('Failed to retrieve document version file');
    }
  }
  
  /**
   * Create document template
   */
  async createDocumentTemplate(
    template: InsertLegalDocumentTemplate, 
    fileBuffer: Buffer
  ): Promise<LegalDocumentTemplate> {
    try {
      // Generate a unique filename
      const fileName = `template-${Date.now()}-${randomBytes(8).toString('hex')}${path.extname(template.fileLocation)}`;
      const filePath = path.join(this.templateDir, fileName);
      
      // Save the file
      fs.writeFileSync(filePath, fileBuffer);
      
      // Update the file location
      const templateToInsert = {
        ...template,
        fileLocation: fileName,
        lastModifiedAt: new Date()
      };
      
      // Insert template record
      const [newTemplate] = await db.insert(legalDocumentTemplates)
        .values(templateToInsert)
        .returning();
      
      return newTemplate;
    } catch (error) {
      console.error('Error creating document template:', error);
      throw new Error('Failed to create document template');
    }
  }
  
  /**
   * Get document template by ID
   */
  async getDocumentTemplateById(id: number): Promise<LegalDocumentTemplate | undefined> {
    try {
      const [template] = await db.select()
        .from(legalDocumentTemplates)
        .where(eq(legalDocumentTemplates.id, id));
      
      return template;
    } catch (error) {
      console.error('Error getting document template:', error);
      throw new Error('Failed to retrieve document template');
    }
  }
  
  /**
   * Get all document templates
   */
  async getDocumentTemplates(
    merchantId: number,
    documentType?: string,
    practiceArea?: string,
    searchTerm?: string
  ): Promise<LegalDocumentTemplate[]> {
    try {
      let query = db.select()
        .from(legalDocumentTemplates)
        .where(and(
          eq(legalDocumentTemplates.merchantId, merchantId),
          eq(legalDocumentTemplates.isActive, true)
        ));
      
      // Apply filters if provided
      if (documentType) {
        query = query.where(eq(legalDocumentTemplates.documentType, documentType));
      }
      
      if (practiceArea) {
        query = query.where(eq(legalDocumentTemplates.practiceArea, practiceArea));
      }
      
      if (searchTerm) {
        query = query.where(like(legalDocumentTemplates.title, `%${searchTerm}%`));
      }
      
      // Order by most used
      query = query.orderBy(desc(legalDocumentTemplates.usageCount));
      
      const templates = await query;
      return templates;
    } catch (error) {
      console.error('Error getting document templates:', error);
      throw new Error('Failed to retrieve document templates');
    }
  }
  
  /**
   * Update document template
   */
  async updateDocumentTemplate(
    id: number,
    updates: Partial<InsertLegalDocumentTemplate>,
    fileBuffer?: Buffer
  ): Promise<LegalDocumentTemplate> {
    try {
      const template = await this.getDocumentTemplateById(id);
      if (!template) {
        throw new Error('Document template not found');
      }
      
      // If a new file is provided, save it
      if (fileBuffer) {
        // Generate a unique filename
        const fileName = `template-${Date.now()}-${randomBytes(8).toString('hex')}${path.extname(updates.fileLocation || template.fileLocation)}`;
        const filePath = path.join(this.templateDir, fileName);
        
        // Save the file
        fs.writeFileSync(filePath, fileBuffer);
        
        // Update the file location
        updates.fileLocation = fileName;
      }
      
      updates.lastModifiedAt = new Date();
      
      // Update template record
      const [updatedTemplate] = await db.update(legalDocumentTemplates)
        .set(updates)
        .where(eq(legalDocumentTemplates.id, id))
        .returning();
      
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating document template:', error);
      throw new Error('Failed to update document template');
    }
  }
  
  /**
   * Delete document template
   */
  async deleteDocumentTemplate(id: number): Promise<{ success: boolean }> {
    try {
      const template = await this.getDocumentTemplateById(id);
      if (!template) {
        throw new Error('Document template not found');
      }
      
      // Delete the file if it exists
      const filePath = path.join(this.templateDir, template.fileLocation);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete the template record
      await db.delete(legalDocumentTemplates)
        .where(eq(legalDocumentTemplates.id, id));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting document template:', error);
      throw new Error('Failed to delete document template');
    }
  }
  
  /**
   * Get document template file
   */
  getDocumentTemplateFile(fileLocation: string): Buffer {
    try {
      const filePath = path.join(this.templateDir, fileLocation);
      if (!fs.existsSync(filePath)) {
        throw new Error('Document template file not found');
      }
      
      return fs.readFileSync(filePath);
    } catch (error) {
      console.error('Error getting document template file:', error);
      throw new Error('Failed to retrieve document template file');
    }
  }
  
  /**
   * Create document from template
   */
  async createDocumentFromTemplate(
    templateId: number,
    document: InsertLegalDocument,
    variables: Record<string, string>
  ): Promise<LegalDocument> {
    try {
      const template = await this.getDocumentTemplateById(templateId);
      if (!template) {
        throw new Error('Document template not found');
      }
      
      // Get the template file
      const templateFileBuffer = this.getDocumentTemplateFile(template.fileLocation);
      
      // In a real implementation, this would process the template with the variables
      // For now, we'll just copy the template file
      
      // Increment the template usage count
      await db.update(legalDocumentTemplates)
        .set({
          usageCount: sql`${legalDocumentTemplates.usageCount} + 1`
        })
        .where(eq(legalDocumentTemplates.id, templateId));
      
      // Create the new document
      return this.createDocument({
        ...document,
        fileLocation: document.fileLocation || template.fileLocation,
        documentType: document.documentType || template.documentType,
        metaData: {
          ...document.metaData,
          templateId,
          variables
        }
      }, templateFileBuffer);
    } catch (error) {
      console.error('Error creating document from template:', error);
      throw new Error('Failed to create document from template');
    }
  }
  
  /**
   * Search documents by text content
   * Note: In a production environment, this would use a full-text search engine
   */
  async searchDocuments(
    merchantId: number,
    searchTerm: string,
    matterId?: number,
    clientId?: number
  ): Promise<LegalDocument[]> {
    try {
      let query = db.select()
        .from(legalDocuments)
        .where(and(
          eq(legalDocuments.merchantId, merchantId),
          like(legalDocuments.title, `%${searchTerm}%`)
        ));
      
      if (matterId) {
        query = query.where(eq(legalDocuments.matterId, matterId));
      }
      
      if (clientId) {
        query = query.where(eq(legalDocuments.clientId, clientId));
      }
      
      const documents = await query;
      return documents;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }
}

export const documentService = new DocumentService();