/**
 * Legal Time and Expense Testing Module
 * 
 * This module tests the legal time and expense tracking functionality including:
 * - Time entry creation, retrieval, update, and deletion
 * - Expense entry creation, retrieval, update, and deletion
 * - Invoice generation from time and expense entries
 * - Billable summary calculation
 */

import { db } from "../../db";
import { insertLegalTimeEntrySchema, insertLegalExpenseEntrySchema, insertLegalInvoiceSchema, legalInvoices } from "@shared/schema";
import { legalTimeExpenseService } from "../legal/time-expense-service";
import { TestReport, TestGroup } from "./test-interfaces";
import { Decimal } from "decimal.js";
import { eq, desc } from "drizzle-orm";

export class LegalTimeExpenseTestService {
  private merchantId = 1001;
  private userId = 500;
  private clientId = 2001;
  private testMatterNumber = "LEGAL-TEST-2024-001";
  
  /**
   * Run comprehensive test suite for legal time and expense functionality
   */
  async runComprehensiveTests(): Promise<TestReport> {
    const startTime = new Date();
    const report: TestReport = {
      name: "Legal Time and Expense System Tests",
      timestamp: new Date(),
      passed: true,
      testGroups: []
    };
    
    try {
      // Run the test groups
      const timeEntryTests = await this.testTimeEntries();
      const expenseEntryTests = await this.testExpenseEntries();
      const billableSummaryTests = await this.testBillableSummary();
      const invoiceTests = await this.testInvoicing();
      
      // Add the test groups to the report
      report.testGroups = [
        timeEntryTests,
        expenseEntryTests,
        billableSummaryTests,
        invoiceTests
      ];
      
      // Check if all tests passed
      report.passed = report.testGroups.every(group => group.passed);
      
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      
      console.log(`Legal Time and Expense System Tests completed in ${durationMs}ms - ${report.passed ? 'PASSED' : 'FAILED'}`);
      
      return report;
    } catch (error) {
      console.error("Error running tests:", error);
      report.passed = false;
      return report;
    }
  }
  
  /**
   * Test time entry functionality
   */
  async testTimeEntries(): Promise<TestGroup> {
    const group: TestGroup = {
      name: "Time Entry Tests",
      tests: [],
      passed: true
    };
    
    try {
      // Test 1: Create a time entry
      const createTimeEntryTest = {
        name: "Create time entry",
        passed: false,
        result: null,
        expected: "Time entry created successfully"
      };
      
      try {
        const now = new Date();
        const timeEntryData = {
          merchantId: this.merchantId,
          userId: this.userId,
          clientId: this.clientId,
          matterNumber: this.testMatterNumber,
          dateOfWork: now,
          duration: new Decimal(2.5),
          description: "Test time entry for legal work",
          entryType: "billable",
          billingRate: new Decimal(250),
          taskCode: "L110",
          activityCode: "A103"
        };
        
        const validatedData = insertLegalTimeEntrySchema.parse(timeEntryData);
        const createdTimeEntry = await legalTimeExpenseService.createTimeEntry(validatedData);
        
        if (createdTimeEntry && createdTimeEntry.id) {
          createTimeEntryTest.passed = true;
          createTimeEntryTest.result = `Created time entry with ID ${createdTimeEntry.id}`;
        } else {
          createTimeEntryTest.result = "Failed to create time entry";
        }
      } catch (error) {
        createTimeEntryTest.passed = false;
        createTimeEntryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(createTimeEntryTest);
      
      // Test 2: Retrieve time entries for a merchant
      const getTimeEntriesTest = {
        name: "Get time entries",
        passed: false,
        result: null,
        expected: "Retrieved time entries successfully"
      };
      
      try {
        const timeEntries = await legalTimeExpenseService.getTimeEntriesByMerchant(this.merchantId);
        
        if (timeEntries && timeEntries.length > 0) {
          getTimeEntriesTest.passed = true;
          getTimeEntriesTest.result = `Retrieved ${timeEntries.length} time entries`;
        } else {
          getTimeEntriesTest.result = "No time entries found or retrieval failed";
        }
      } catch (error) {
        getTimeEntriesTest.passed = false;
        getTimeEntriesTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(getTimeEntriesTest);
      
      // Test 3: Update a time entry
      const updateTimeEntryTest = {
        name: "Update time entry",
        passed: false,
        result: null,
        expected: "Time entry updated successfully"
      };
      
      try {
        // Get the most recent time entry
        const timeEntries = await legalTimeExpenseService.getTimeEntriesByMerchant(this.merchantId);
        
        if (timeEntries && timeEntries.length > 0) {
          const timeEntryToUpdate = timeEntries[0];
          
          const updateData = {
            description: "Updated test time entry description",
            duration: new Decimal(3.0),
            billingRate: new Decimal(275)
          };
          
          const updatedTimeEntry = await legalTimeExpenseService.updateTimeEntry(timeEntryToUpdate.id, updateData);
          
          if (updatedTimeEntry && 
              updatedTimeEntry.description === updateData.description &&
              updatedTimeEntry.duration.toString() === updateData.duration.toString()) {
            updateTimeEntryTest.passed = true;
            updateTimeEntryTest.result = `Updated time entry with ID ${updatedTimeEntry.id}`;
          } else {
            updateTimeEntryTest.result = "Time entry was not updated correctly";
          }
        } else {
          updateTimeEntryTest.result = "No time entries found to update";
        }
      } catch (error) {
        updateTimeEntryTest.passed = false;
        updateTimeEntryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(updateTimeEntryTest);
      
      // Test 4: Delete a time entry (soft delete)
      const deleteTimeEntryTest = {
        name: "Delete time entry",
        passed: false,
        result: null,
        expected: "Time entry deleted successfully"
      };
      
      try {
        // Create a temporary time entry to delete
        const now = new Date();
        const tempTimeEntryData = {
          merchantId: this.merchantId,
          userId: this.userId,
          clientId: this.clientId,
          matterNumber: this.testMatterNumber,
          dateOfWork: now,
          duration: new Decimal(1.0),
          description: "Temporary time entry to delete",
          entryType: "billable",
          billingRate: new Decimal(250)
        };
        
        const validatedTempData = insertLegalTimeEntrySchema.parse(tempTimeEntryData);
        const tempTimeEntry = await legalTimeExpenseService.createTimeEntry(validatedTempData);
        
        if (tempTimeEntry && tempTimeEntry.id) {
          const deletedTimeEntry = await legalTimeExpenseService.deleteTimeEntry(tempTimeEntry.id);
          
          if (deletedTimeEntry && deletedTimeEntry.status === "deleted") {
            deleteTimeEntryTest.passed = true;
            deleteTimeEntryTest.result = `Deleted time entry with ID ${deletedTimeEntry.id}`;
          } else {
            deleteTimeEntryTest.result = "Time entry was not deleted correctly";
          }
        } else {
          deleteTimeEntryTest.result = "Failed to create temporary time entry for deletion test";
        }
      } catch (error) {
        deleteTimeEntryTest.passed = false;
        deleteTimeEntryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(deleteTimeEntryTest);
      
      // Determine if all tests in the group passed
      group.passed = group.tests.every(test => test.passed);
      
      return group;
    } catch (error) {
      console.error("Error in time entry tests:", error);
      group.passed = false;
      
      const errorTest = {
        name: "Time Entry Test Error",
        passed: false,
        result: `Unhandled error: ${error.message}`,
        expected: "No errors"
      };
      
      group.tests.push(errorTest);
      return group;
    }
  }
  
  /**
   * Test expense entry functionality
   */
  async testExpenseEntries(): Promise<TestGroup> {
    const group: TestGroup = {
      name: "Expense Entry Tests",
      tests: [],
      passed: true
    };
    
    try {
      // Test 1: Create an expense entry
      const createExpenseEntryTest = {
        name: "Create expense entry",
        passed: false,
        result: null,
        expected: "Expense entry created successfully"
      };
      
      try {
        const now = new Date();
        const expenseEntryData = {
          merchantId: this.merchantId,
          userId: this.userId,
          clientId: this.clientId,
          matterNumber: this.testMatterNumber,
          expenseDate: now,
          expenseType: "filing_fees",
          description: "Test expense entry for court filing",
          amount: new Decimal(350),
          billable: true,
          markupPercentage: new Decimal(0)
        };
        
        const validatedData = insertLegalExpenseEntrySchema.parse(expenseEntryData);
        const createdExpenseEntry = await legalTimeExpenseService.createExpenseEntry(validatedData);
        
        if (createdExpenseEntry && createdExpenseEntry.id) {
          createExpenseEntryTest.passed = true;
          createExpenseEntryTest.result = `Created expense entry with ID ${createdExpenseEntry.id}`;
        } else {
          createExpenseEntryTest.result = "Failed to create expense entry";
        }
      } catch (error) {
        createExpenseEntryTest.passed = false;
        createExpenseEntryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(createExpenseEntryTest);
      
      // Test 2: Retrieve expense entries for a merchant
      const getExpenseEntriesTest = {
        name: "Get expense entries",
        passed: false,
        result: null,
        expected: "Retrieved expense entries successfully"
      };
      
      try {
        const expenseEntries = await legalTimeExpenseService.getExpenseEntriesByMerchant(this.merchantId);
        
        if (expenseEntries && expenseEntries.length > 0) {
          getExpenseEntriesTest.passed = true;
          getExpenseEntriesTest.result = `Retrieved ${expenseEntries.length} expense entries`;
        } else {
          getExpenseEntriesTest.result = "No expense entries found or retrieval failed";
        }
      } catch (error) {
        getExpenseEntriesTest.passed = false;
        getExpenseEntriesTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(getExpenseEntriesTest);
      
      // Test 3: Update an expense entry
      const updateExpenseEntryTest = {
        name: "Update expense entry",
        passed: false,
        result: null,
        expected: "Expense entry updated successfully"
      };
      
      try {
        // Get the most recent expense entry
        const expenseEntries = await legalTimeExpenseService.getExpenseEntriesByMerchant(this.merchantId);
        
        if (expenseEntries && expenseEntries.length > 0) {
          const expenseEntryToUpdate = expenseEntries[0];
          
          const updateData = {
            description: "Updated test expense entry description",
            amount: new Decimal(375),
            markupPercentage: new Decimal(5)
          };
          
          const updatedExpenseEntry = await legalTimeExpenseService.updateExpenseEntry(expenseEntryToUpdate.id, updateData);
          
          if (updatedExpenseEntry && 
              updatedExpenseEntry.description === updateData.description &&
              updatedExpenseEntry.amount.toString() === updateData.amount.toString()) {
            updateExpenseEntryTest.passed = true;
            updateExpenseEntryTest.result = `Updated expense entry with ID ${updatedExpenseEntry.id}`;
          } else {
            updateExpenseEntryTest.result = "Expense entry was not updated correctly";
          }
        } else {
          updateExpenseEntryTest.result = "No expense entries found to update";
        }
      } catch (error) {
        updateExpenseEntryTest.passed = false;
        updateExpenseEntryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(updateExpenseEntryTest);
      
      // Test 4: Delete an expense entry (soft delete)
      const deleteExpenseEntryTest = {
        name: "Delete expense entry",
        passed: false,
        result: null,
        expected: "Expense entry deleted successfully"
      };
      
      try {
        // Create a temporary expense entry to delete
        const now = new Date();
        const tempExpenseEntryData = {
          merchantId: this.merchantId,
          userId: this.userId,
          clientId: this.clientId,
          matterNumber: this.testMatterNumber,
          expenseDate: now,
          expenseType: "copying",
          description: "Temporary expense entry to delete",
          amount: new Decimal(25),
          billable: true
        };
        
        const validatedTempData = insertLegalExpenseEntrySchema.parse(tempExpenseEntryData);
        const tempExpenseEntry = await legalTimeExpenseService.createExpenseEntry(validatedTempData);
        
        if (tempExpenseEntry && tempExpenseEntry.id) {
          const deletedExpenseEntry = await legalTimeExpenseService.deleteExpenseEntry(tempExpenseEntry.id);
          
          if (deletedExpenseEntry && deletedExpenseEntry.status === "deleted") {
            deleteExpenseEntryTest.passed = true;
            deleteExpenseEntryTest.result = `Deleted expense entry with ID ${deletedExpenseEntry.id}`;
          } else {
            deleteExpenseEntryTest.result = "Expense entry was not deleted correctly";
          }
        } else {
          deleteExpenseEntryTest.result = "Failed to create temporary expense entry for deletion test";
        }
      } catch (error) {
        deleteExpenseEntryTest.passed = false;
        deleteExpenseEntryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(deleteExpenseEntryTest);
      
      // Determine if all tests in the group passed
      group.passed = group.tests.every(test => test.passed);
      
      return group;
    } catch (error) {
      console.error("Error in expense entry tests:", error);
      group.passed = false;
      
      const errorTest = {
        name: "Expense Entry Test Error",
        passed: false,
        result: `Unhandled error: ${error.message}`,
        expected: "No errors"
      };
      
      group.tests.push(errorTest);
      return group;
    }
  }
  
  /**
   * Test billable summary functionality
   */
  async testBillableSummary(): Promise<TestGroup> {
    const group: TestGroup = {
      name: "Billable Summary Tests",
      tests: [],
      passed: true
    };
    
    try {
      // Test 1: Get billable summary for a merchant
      const getBillableSummaryTest = {
        name: "Get billable summary",
        passed: false,
        result: null,
        expected: "Retrieved billable summary successfully"
      };
      
      try {
        const summary = await legalTimeExpenseService.getBillableSummary(this.merchantId);
        
        if (summary) {
          getBillableSummaryTest.passed = true;
          getBillableSummaryTest.result = `Retrieved billable summary with total amount: ${summary.totalBillable}`;
        } else {
          getBillableSummaryTest.result = "Failed to retrieve billable summary";
        }
      } catch (error) {
        getBillableSummaryTest.passed = false;
        getBillableSummaryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(getBillableSummaryTest);
      
      // Test 2: Get billable summary with date range filter
      const getFilteredSummaryTest = {
        name: "Get filtered billable summary",
        passed: false,
        result: null,
        expected: "Retrieved filtered billable summary successfully"
      };
      
      try {
        // Set date range for the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const filteredSummary = await legalTimeExpenseService.getBillableSummary(this.merchantId, {
          startDate,
          endDate
        });
        
        if (filteredSummary) {
          getFilteredSummaryTest.passed = true;
          getFilteredSummaryTest.result = `Retrieved filtered billable summary with total amount: ${filteredSummary.totalBillable}`;
        } else {
          getFilteredSummaryTest.result = "Failed to retrieve filtered billable summary";
        }
      } catch (error) {
        getFilteredSummaryTest.passed = false;
        getFilteredSummaryTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(getFilteredSummaryTest);
      
      // Determine if all tests in the group passed
      group.passed = group.tests.every(test => test.passed);
      
      return group;
    } catch (error) {
      console.error("Error in billable summary tests:", error);
      group.passed = false;
      
      const errorTest = {
        name: "Billable Summary Test Error",
        passed: false,
        result: `Unhandled error: ${error.message}`,
        expected: "No errors"
      };
      
      group.tests.push(errorTest);
      return group;
    }
  }
  
  /**
   * Test invoicing functionality
   */
  async testInvoicing(): Promise<TestGroup> {
    const group: TestGroup = {
      name: "Invoicing Tests",
      tests: [],
      passed: true
    };
    
    try {
      // Test 1: Create an invoice from time and expense entries
      const createInvoiceTest = {
        name: "Create invoice",
        passed: false,
        result: null,
        expected: "Invoice created successfully"
      };
      
      try {
        // Create a new time entry and expense entry to include in the invoice
        const now = new Date();
        
        // Create a time entry
        const timeEntryData = {
          merchantId: this.merchantId,
          userId: this.userId,
          clientId: this.clientId,
          matterNumber: this.testMatterNumber,
          dateOfWork: now,
          duration: new Decimal(1.5),
          description: "Invoice test - time entry",
          entryType: "billable",
          billingRate: new Decimal(300)
        };
        
        const validatedTimeData = insertLegalTimeEntrySchema.parse(timeEntryData);
        const timeEntry = await legalTimeExpenseService.createTimeEntry(validatedTimeData);
        
        // Create an expense entry
        const expenseEntryData = {
          merchantId: this.merchantId,
          userId: this.userId,
          clientId: this.clientId,
          matterNumber: this.testMatterNumber,
          expenseDate: now,
          expenseType: "expert_witness",
          description: "Invoice test - expense entry",
          amount: new Decimal(500),
          billable: true
        };
        
        const validatedExpenseData = insertLegalExpenseEntrySchema.parse(expenseEntryData);
        const expenseEntry = await legalTimeExpenseService.createExpenseEntry(validatedExpenseData);
        
        if (timeEntry && timeEntry.id && expenseEntry && expenseEntry.id) {
          // Create the invoice
          const invoiceNumber = `INV-TEST-${new Date().getTime()}`;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          
          const invoiceData = {
            merchantId: this.merchantId,
            clientId: this.clientId,
            matterNumber: this.testMatterNumber,
            invoiceNumber: invoiceNumber,
            issueDate: now,
            dueDate: dueDate,
            subtotal: "0", // Will be auto-calculated
            totalAmount: "0", // Will be auto-calculated
            balanceDue: "0", // Will be auto-calculated
            termsAndConditions: "Test invoice terms and conditions"
          };
          
          const validatedInvoiceData = insertLegalInvoiceSchema.parse(invoiceData);
          
          const invoice = await legalTimeExpenseService.createInvoiceFromEntries(
            validatedInvoiceData,
            {
              timeEntryIds: [timeEntry.id],
              expenseEntryIds: [expenseEntry.id],
              autoCalculateSubtotal: true
            }
          );
          
          if (invoice && invoice.id) {
            createInvoiceTest.passed = true;
            createInvoiceTest.result = `Created invoice with ID ${invoice.id} and total amount ${invoice.totalAmount}`;
          } else {
            createInvoiceTest.result = "Failed to create invoice";
          }
        } else {
          createInvoiceTest.result = "Failed to create time and expense entries for invoice test";
        }
      } catch (error) {
        createInvoiceTest.passed = false;
        createInvoiceTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(createInvoiceTest);
      
      // Test 2: Get invoice entries
      const getInvoiceEntriesTest = {
        name: "Get invoice entries",
        passed: false,
        result: null,
        expected: "Retrieved invoice entries successfully"
      };
      
      try {
        // Create a simple query to get the latest invoice
        const [latestInvoice] = await db.select()
          .from(legalInvoices)
          .where(eq(legalInvoices.merchantId, this.merchantId))
          .orderBy(desc(legalInvoices.createdAt))
          .limit(1);
        
        if (latestInvoice && latestInvoice.id) {
          const invoiceEntries = await legalTimeExpenseService.getInvoiceEntries(latestInvoice.id);
          
          if (invoiceEntries) {
            getInvoiceEntriesTest.passed = true;
            getInvoiceEntriesTest.result = `Retrieved invoice entries: ${invoiceEntries.timeEntries.length} time entries and ${invoiceEntries.expenseEntries.length} expense entries`;
          } else {
            getInvoiceEntriesTest.result = "Failed to retrieve invoice entries";
          }
        } else {
          getInvoiceEntriesTest.result = "No invoices found to test with";
        }
      } catch (error) {
        getInvoiceEntriesTest.passed = false;
        getInvoiceEntriesTest.result = `Error: ${error.message}`;
      }
      
      group.tests.push(getInvoiceEntriesTest);
      
      // Determine if all tests in the group passed
      group.passed = group.tests.every(test => test.passed);
      
      return group;
    } catch (error) {
      console.error("Error in invoicing tests:", error);
      group.passed = false;
      
      const errorTest = {
        name: "Invoicing Test Error",
        passed: false,
        result: `Unhandled error: ${error.message}`,
        expected: "No errors"
      };
      
      group.tests.push(errorTest);
      return group;
    }
  }
}

export const legalTimeExpenseTestService = new LegalTimeExpenseTestService();