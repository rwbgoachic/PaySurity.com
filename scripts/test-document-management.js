/**
 * Legal Document Management System Testing Script
 * 
 * This script tests the document management system functionality including:
 * - Document upload and creation
 * - Document retrieval
 * - Document versioning
 * - Template management
 * - Document search
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const API_BASE_URL = 'http://localhost:5000';
const TEST_DOCUMENT_PATH = path.join(process.cwd(), 'documents', 'test-document.txt');
const TEST_TEMPLATE_PATH = path.join(process.cwd(), 'documents', 'templates', 'sample-template.txt');

// Mock user and merchant data for testing
const testUser = {
  id: 1,
  username: 'test_user',
  email: 'test@example.com'
};

const testMerchant = {
  id: 1,
  name: 'Test Law Firm'
};

// Mock authentication token (in a real app, this would be obtained through login)
const mockAuthToken = 'mock_token';

// Configure axios for testing
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${mockAuthToken}`
  }
});

async function testDocumentManagement() {
  console.log('Testing Legal Document Management System...');
  
  try {
    // Test document creation
    const documentId = await testCreateDocument();
    
    // Test document retrieval
    await testGetDocument(documentId);
    
    // Test document updating
    await testUpdateDocument(documentId);
    
    // Test document versioning
    await testDocumentVersions(documentId);
    
    // Test template creation
    const templateId = await testCreateTemplate();
    
    // Test creating document from template
    await testCreateFromTemplate(templateId);
    
    // Test document search
    await testSearchDocuments();
    
    console.log('All document management tests completed successfully!');
  } catch (error) {
    console.error('Document management tests failed:', error.message);
    console.error(error.response?.data || error);
  }
}

async function testCreateDocument() {
  console.log('\nTesting document creation...');
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(TEST_DOCUMENT_PATH));
  formData.append('title', 'Test Legal Document');
  formData.append('description', 'This is a test document for the legal document management system');
  formData.append('merchantId', testMerchant.id);
  formData.append('authorId', testUser.id);
  formData.append('documentType', 'correspondence');
  formData.append('confidentialityLevel', 'attorney_client_privilege');
  formData.append('status', 'draft');
  formData.append('tags', JSON.stringify(['test', 'document', 'legal']));
  
  try {
    const response = await api.post('/api/legal/documents', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Document created successfully:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Failed to create document:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetDocument(documentId) {
  console.log(`\nTesting document retrieval for ID ${documentId}...`);
  
  try {
    const response = await api.get(`/api/legal/documents/${documentId}`);
    console.log('Document retrieved successfully:', response.data.title);
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve document:', error.response?.data || error.message);
    throw error;
  }
}

async function testUpdateDocument(documentId) {
  console.log(`\nTesting document update for ID ${documentId}...`);
  
  try {
    const updates = {
      title: 'Updated Test Document',
      status: 'final',
      metaData: {
        changeDescription: 'Updated document title and status'
      }
    };
    
    const response = await api.patch(`/api/legal/documents/${documentId}`, updates);
    console.log('Document updated successfully:', response.data.title);
    return response.data;
  } catch (error) {
    console.error('Failed to update document:', error.response?.data || error.message);
    throw error;
  }
}

async function testDocumentVersions(documentId) {
  console.log(`\nTesting document versions for ID ${documentId}...`);
  
  try {
    const response = await api.get(`/api/legal/documents/${documentId}/versions`);
    console.log(`Retrieved ${response.data.length} versions of the document`);
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve document versions:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateTemplate() {
  console.log('\nTesting template creation...');
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(TEST_TEMPLATE_PATH));
  formData.append('title', 'Test Legal Template');
  formData.append('description', 'Template for testing document generation');
  formData.append('merchantId', testMerchant.id);
  formData.append('createdById', testUser.id);
  formData.append('documentType', 'correspondence');
  formData.append('practiceArea', 'general');
  formData.append('variables', JSON.stringify({
    DOCUMENT_TYPE: 'String',
    ATTORNEY_NAME: 'String',
    CASE_NUMBER: 'String',
    JURISDICTION: 'String',
    FILING_DATE: 'Date'
  }));
  
  try {
    const response = await api.post('/api/legal/documents/templates', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Template created successfully:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Failed to create template:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateFromTemplate(templateId) {
  console.log(`\nTesting document creation from template ID ${templateId}...`);
  
  try {
    const documentData = {
      title: 'Document From Template',
      description: 'This document was generated from a template',
      merchantId: testMerchant.id,
      authorId: testUser.id,
      status: 'draft',
      confidentialityLevel: 'attorney_client_privilege',
      variables: {
        DOCUMENT_TYPE: 'Engagement Letter',
        ATTORNEY_NAME: 'Jane Smith',
        CASE_NUMBER: 'CASE-2025-001',
        JURISDICTION: 'California',
        FILING_DATE: '2025-04-15'
      }
    };
    
    const response = await api.post(`/api/legal/documents/templates/${templateId}/create-document`, documentData);
    
    console.log('Document created from template successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Failed to create document from template:', error.response?.data || error.message);
    throw error;
  }
}

async function testSearchDocuments() {
  console.log('\nTesting document search...');
  
  try {
    const response = await api.get('/api/legal/documents/search', {
      params: {
        merchantId: testMerchant.id,
        q: 'test'
      }
    });
    
    console.log(`Found ${response.data.length} documents in search results`);
    return response.data;
  } catch (error) {
    console.error('Failed to search documents:', error.response?.data || error.message);
    throw error;
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  testDocumentManagement().catch(console.error);
}

module.exports = {
  testDocumentManagement
};