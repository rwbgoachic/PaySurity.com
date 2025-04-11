import { TestService, TestReport, TestResult } from './test-interfaces';
import { documentService } from '../legal/document-service';
import { db } from '../../db';
import { 
  legalClients, 
  legalMatters,
  legalDocuments,
  legalDocumentTemplates,
  legalDocumentVersions
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

export class DocumentManagementTestService implements TestService {
  private merchantId: number | null = null;
  private clientId: number | null = null;
  private matterId: number | null = null;
  private documentId: number | null = null;
  private templateId: number | null = null;
  private versionId: number | null = null;
  private testFilePath: string | null = null;
  
  constructor() {}
  
  /**
   * Run all document management tests
   */
  async runTests(): Promise<TestReport> {
    const report: TestReport = {
      serviceName: 'Document Management Service',
      testGroups: [
        {
          name: 'Document Management Tests',
          tests: []
        }
      ],
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      passRate: 0,
      testsPassed: 0,
      testsFailed: 0,
      tests: []
    };
    
    try {
      // Set up test environment
      await this.setupTestEnvironment();
      
      // Run document management tests
      await this.testCreateDocument(report);
      await this.testGetDocuments(report);
      await this.testUpdateDocument(report);
      await this.testCreateTemplate(report);
      await this.testGetTemplates(report);
      await this.testCreateDocumentFromTemplate(report);
      await this.testCreateVersion(report);
      await this.testGetVersions(report);
      
      // Clean up test environment
      await this.cleanupTestEnvironment();
      
      // Calculate test metrics
      report.testsPassed = report.tests.filter(t => t.passed).length;
      report.testsFailed = report.tests.filter(t => !t.passed).length;
      report.passRate = report.testsPassed / report.tests.length * 100;
      
      // Set end time and calculate duration
      report.endTime = new Date();
      report.duration = report.endTime.getTime() - report.startTime.getTime();
      
      console.log(`Document Management Tests: ${report.testsPassed}/${report.tests.length} tests passed (${report.passRate.toFixed(2)}%)`);
      
      return report;
    } catch (error) {
      console.error('Error in Document Management tests:', error);
      
      // Calculate metrics even in case of error
      report.testsPassed = report.tests.filter(t => t.passed).length;
      report.testsFailed = report.tests.filter(t => !t.passed).length;
      report.passRate = report.tests.length > 0 ? (report.testsPassed / report.tests.length * 100) : 0;
      
      report.endTime = new Date();
      report.duration = report.endTime.getTime() - report.startTime.getTime();
      
      return report;
    }
  }
  
  /**
   * Set up test environment with test data
   */
  private async setupTestEnvironment() {
    try {
      // Create test merchant
      const [merchant] = await db.insert(legalClients)
        .values({
          clientType: 'corporate',
          status: 'active',
          firstName: 'Test',
          lastName: 'Firm',
          companyName: 'Test Law Firm',
          email: 'test@lawfirm.com',
          phone: '555-123-4567',
          address: '123 Law St',
          city: 'Legal City',
          state: 'LS',
          zipCode: '12345',
          notes: 'Test merchant for document management tests'
        })
        .returning();
      
      this.merchantId = merchant.id;
      
      // Create test client
      const [client] = await db.insert(legalClients)
        .values({
          clientType: 'individual',
          status: 'active',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-987-6543',
          address: '456 Client Ave',
          city: 'Legal City',
          state: 'LS',
          zipCode: '12345',
          notes: 'Test client for document management tests'
        })
        .returning();
      
      this.clientId = client.id;
      
      // Create test matter
      const [matter] = await db.insert(legalMatters)
        .values({
          merchantId: this.merchantId,
          clientId: this.clientId,
          matterNumber: 'DOC-001',
          matterDescription: 'Test Matter for Document Tests',
          matterStatus: 'active',
          practiceArea: 'litigation',
          responsibleAttorneyId: 1,
          openDate: new Date().toISOString().slice(0, 10),
          billingType: 'hourly'
        })
        .returning();
      
      this.matterId = matter.id;
      
      // Create test file
      this.testFilePath = path.join(__dirname, 'test-document.txt');
      fs.writeFileSync(this.testFilePath, 'This is a test document for the document management service');
      
    } catch (error) {
      console.error('Error setting up test environment:', error);
      throw error;
    }
  }
  
  /**
   * Clean up test environment after tests complete
   */
  private async cleanupTestEnvironment() {
    try {
      // Delete test data in reverse order of creation
      if (this.versionId) {
        await db.delete(legalDocumentVersions)
          .where(eq(legalDocumentVersions.id, this.versionId));
      }
      
      if (this.documentId) {
        await db.delete(legalDocuments)
          .where(eq(legalDocuments.id, this.documentId));
      }
      
      if (this.templateId) {
        await db.delete(legalDocumentTemplates)
          .where(eq(legalDocumentTemplates.id, this.templateId));
      }
      
      if (this.matterId) {
        await db.delete(legalMatters)
          .where(eq(legalMatters.id, this.matterId));
      }
      
      // Delete test client and merchant
      if (this.clientId) {
        await db.delete(legalClients)
          .where(eq(legalClients.id, this.clientId));
      }
      
      if (this.merchantId) {
        await db.delete(legalClients)
          .where(eq(legalClients.id, this.merchantId));
      }
      
      // Delete test file
      if (this.testFilePath && fs.existsSync(this.testFilePath)) {
        fs.unlinkSync(this.testFilePath);
      }
    } catch (error) {
      console.error('Error cleaning up test environment:', error);
    }
  }
  
  /**
   * Test creating a document
   */
  private async testCreateDocument(report: TestReport) {
    const testResult: TestResult = {
      name: 'Create Document',
      passed: false,
      description: 'Test creating a new legal document',
      expected: 'Successfully create a document with correct data',
      actual: null,
      error: null
    };
    
    try {
      const document = await documentService.createDocument({
        merchantId: this.merchantId,
        clientId: this.clientId,
        matterId: this.matterId,
        title: 'Test Document',
        documentType: 'pleading',
        practiceArea: 'litigation',
        documentStatus: 'draft',
        filePath: this.testFilePath,
        fileSize: fs.statSync(this.testFilePath).size,
        mimeType: 'text/plain',
        createdBy: 1
      });
      
      this.documentId = document.id;
      
      if (document && 
          document.title === 'Test Document' &&
          document.documentType === 'pleading' &&
          document.clientId === this.clientId) {
        testResult.passed = true;
        testResult.actual = `Successfully created document with ID: ${document.id}`;
      } else {
        testResult.actual = 'Failed to create document or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during document creation test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
  
  /**
   * Test retrieving documents
   */
  private async testGetDocuments(report: TestReport) {
    const testResult: TestResult = {
      name: 'Get Documents',
      passed: false,
      description: 'Test retrieving documents for a merchant',
      expected: 'Successfully retrieve documents with correct data',
      actual: null,
      error: null
    };
    
    try {
      const documents = await documentService.getDocuments({
        merchantId: this.merchantId
      });
      
      if (documents.length > 0 && 
          documents.some(doc => doc.id === this.documentId && doc.title === 'Test Document')) {
        testResult.passed = true;
        testResult.actual = `Successfully retrieved ${documents.length} document(s) with correct data`;
      } else {
        testResult.actual = 'Failed to retrieve documents or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during documents retrieval test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
  
  /**
   * Test updating a document
   */
  private async testUpdateDocument(report: TestReport) {
    const testResult: TestResult = {
      name: 'Update Document',
      passed: false,
      description: 'Test updating a legal document',
      expected: 'Successfully update a document with new data',
      actual: null,
      error: null
    };
    
    try {
      const updatedDocument = await documentService.updateDocument(this.documentId, {
        title: 'Updated Test Document',
        documentStatus: 'final'
      });
      
      if (updatedDocument && 
          updatedDocument.id === this.documentId &&
          updatedDocument.title === 'Updated Test Document' &&
          updatedDocument.documentStatus === 'final') {
        testResult.passed = true;
        testResult.actual = 'Successfully updated document with new title and status';
      } else {
        testResult.actual = 'Failed to update document or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during document update test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
  
  /**
   * Test creating a document template
   */
  private async testCreateTemplate(report: TestReport) {
    const testResult: TestResult = {
      name: 'Create Template',
      passed: false,
      description: 'Test creating a new document template',
      expected: 'Successfully create a template with correct data',
      actual: null,
      error: null
    };
    
    try {
      const template = await documentService.createTemplate({
        merchantId: this.merchantId,
        title: 'Test Template',
        documentType: 'pleading',
        practiceArea: 'litigation',
        content: 'This is a test template with {{VARIABLE_1}} and {{VARIABLE_2}}',
        createdBy: 1
      });
      
      this.templateId = template.id;
      
      if (template && 
          template.title === 'Test Template' &&
          template.documentType === 'pleading') {
        testResult.passed = true;
        testResult.actual = `Successfully created template with ID: ${template.id}`;
      } else {
        testResult.actual = 'Failed to create template or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during template creation test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
  
  /**
   * Test retrieving templates
   */
  private async testGetTemplates(report: TestReport) {
    const testResult: TestResult = {
      name: 'Get Templates',
      passed: false,
      description: 'Test retrieving document templates for a merchant',
      expected: 'Successfully retrieve templates with correct data',
      actual: null,
      error: null
    };
    
    try {
      const templates = await documentService.getTemplates({
        merchantId: this.merchantId
      });
      
      if (templates.length > 0 && 
          templates.some(tpl => tpl.id === this.templateId && tpl.title === 'Test Template')) {
        testResult.passed = true;
        testResult.actual = `Successfully retrieved ${templates.length} template(s) with correct data`;
      } else {
        testResult.actual = 'Failed to retrieve templates or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during templates retrieval test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
  
  /**
   * Test creating a document from a template
   */
  private async testCreateDocumentFromTemplate(report: TestReport) {
    const testResult: TestResult = {
      name: 'Create Document From Template',
      passed: false,
      description: 'Test creating a document from a template',
      expected: 'Successfully create a document using template data',
      actual: null,
      error: null
    };
    
    try {
      const document = await documentService.createDocumentFromTemplate({
        merchantId: this.merchantId,
        clientId: this.clientId,
        matterId: this.matterId,
        templateId: this.templateId,
        title: 'Document From Template',
        documentStatus: 'draft',
        createdBy: 1,
        variables: {
          VARIABLE_1: 'Custom Value 1',
          VARIABLE_2: 'Custom Value 2'
        }
      });
      
      // Keep the ID of the new document to avoid conflict with the existing one
      const tempDocId = document.id;
      
      if (document && 
          document.title === 'Document From Template' &&
          document.templateId === this.templateId) {
        testResult.passed = true;
        testResult.actual = `Successfully created document from template with ID: ${document.id}`;
        
        // Clean up the temporary document
        await db.delete(legalDocuments)
          .where(eq(legalDocuments.id, tempDocId));
      } else {
        testResult.actual = 'Failed to create document from template or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during document creation from template test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
  
  /**
   * Test creating a document version
   */
  private async testCreateVersion(report: TestReport) {
    const testResult: TestResult = {
      name: 'Create Document Version',
      passed: false,
      description: 'Test creating a new version of a document',
      expected: 'Successfully create a document version with correct data',
      actual: null,
      error: null
    };
    
    try {
      const version = await documentService.createDocumentVersion({
        documentId: this.documentId,
        versionNumber: '1.1',
        changeDescription: 'Updated content and added new sections',
        filePath: this.testFilePath,
        fileSize: fs.statSync(this.testFilePath).size,
        mimeType: 'text/plain',
        createdBy: 1
      });
      
      this.versionId = version.id;
      
      if (version && 
          version.documentId === this.documentId &&
          version.versionNumber === '1.1') {
        testResult.passed = true;
        testResult.actual = `Successfully created document version with ID: ${version.id}`;
      } else {
        testResult.actual = 'Failed to create document version or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during document version creation test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
  
  /**
   * Test retrieving document versions
   */
  private async testGetVersions(report: TestReport) {
    const testResult: TestResult = {
      name: 'Get Document Versions',
      passed: false,
      description: 'Test retrieving versions of a document',
      expected: 'Successfully retrieve document versions with correct data',
      actual: null,
      error: null
    };
    
    try {
      const versions = await documentService.getDocumentVersions(this.documentId);
      
      if (versions.length > 0 && 
          versions.some(ver => ver.id === this.versionId && ver.versionNumber === '1.1')) {
        testResult.passed = true;
        testResult.actual = `Successfully retrieved ${versions.length} version(s) with correct data`;
      } else {
        testResult.actual = 'Failed to retrieve document versions or incorrect data returned';
      }
    } catch (error) {
      testResult.error = error.message;
      testResult.actual = 'Error occurred during document versions retrieval test';
    }
    
    report.tests.push(testResult);
    report.testGroups[0].tests.push(testResult);
  }
}