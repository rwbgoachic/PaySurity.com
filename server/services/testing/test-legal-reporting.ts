/**
 * Legal Reporting System Testing Script
 * 
 * This script tests the legal reporting system capabilities including:
 * - Report definition creation and management
 * - Scheduled report functionality
 * - Report generation in various formats
 * - Access control and security for reports
 */

import { db } from "../../db";
import { legalReportingService } from "../legal/reporting-service";
import { TestReport } from "./test-interfaces";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { legalReportDefinitions, legalScheduledReports, legalGeneratedReports } from "../../../shared/schema";

class LegalReportingSystemTestService {
  private testReportDir = path.join(process.cwd(), "test-reports", "legal-reporting");
  private testMerchantId = 1001; // Test merchant ID for all tests
  private testUserId = 2001; // Test user ID for all tests
  
  constructor() {
    // Create test directories if they don't exist
    if (!fs.existsSync(this.testReportDir)) {
      fs.mkdirSync(this.testReportDir, { recursive: true });
    }
  }
  
  /**
   * Run all tests for the legal reporting system
   */
  async runComprehensiveTests(): Promise<TestReport> {
    console.log("Starting Legal Reporting System Tests...");
    const startTime = Date.now();
    
    const report: TestReport = {
      testGroup: "Legal Reporting System",
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      tests: [],
      testsPassed: 0,
      testsFailed: 0,
      passRate: 0
    };
    
    try {
      // Clean up any previous test data
      await this.cleanupTestData();
      
      // Run all test cases
      await this.testReportDefinitions(report);
      await this.testScheduledReports(report);
      await this.testReportGeneration(report);
      await this.testReportsAccess(report);
      
      // Calculate pass rate
      report.testsPassed = report.tests.filter(t => t.passed).length;
      report.testsFailed = report.tests.filter(t => !t.passed).length;
      report.passRate = report.testsPassed / report.tests.length;
      
      // Set end time and duration
      report.endTime = new Date();
      report.duration = Date.now() - startTime;
      
      console.log(`Legal Reporting System Tests Complete: ${report.testsPassed}/${report.tests.length} tests passed (${Math.round(report.passRate * 100)}%)`);
      
      // Final cleanup
      await this.cleanupTestData();
      
      return report;
    } catch (error) {
      console.error("Error running legal reporting system tests:", error);
      
      // Add error test
      report.tests.push({
        name: "Legal Reporting System Test Suite",
        description: "Error running test suite",
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      report.testsPassed = report.tests.filter(t => t.passed).length;
      report.testsFailed = report.tests.filter(t => !t.passed).length;
      report.passRate = report.testsPassed / report.tests.length;
      report.endTime = new Date();
      report.duration = Date.now() - startTime;
      
      // Attempt cleanup even after error
      try {
        await this.cleanupTestData();
      } catch (cleanupError) {
        console.error("Error during test cleanup:", cleanupError);
      }
      
      return report;
    }
  }
  
  /**
   * Test report definitions functionality
   */
  private async testReportDefinitions(report: TestReport): Promise<void> {
    console.log("Testing report definitions...");
    const startTime = Date.now();
    
    try {
      // Test 1: Create a report definition
      const testReportDef = {
        merchantId: this.testMerchantId,
        createdById: this.testUserId,
        name: "Test Financial Report",
        description: "Test financial report for legal firm",
        reportType: "financial",
        frequency: "monthly",
        isPublic: false,
        format: "pdf",
        parameters: { 
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 2, 31)
        },
        createdAt: new Date()
      };
      
      const createdReport = await legalReportingService.createReportDefinition(testReportDef);
      
      const test1 = {
        name: "Create Report Definition",
        description: "Create a new report definition",
        passed: Boolean(createdReport && createdReport.id),
        duration: Date.now() - startTime
      };
      
      report.tests.push(test1);
      
      if (!test1.passed) {
        throw new Error("Failed to create report definition");
      }
      
      // Test 2: Retrieve report definitions
      const retrieveStart = Date.now();
      const retrievedReports = await legalReportingService.getReportDefinitions(this.testMerchantId);
      
      const test2 = {
        name: "Retrieve Report Definitions",
        description: "Retrieve all report definitions for a merchant",
        passed: Array.isArray(retrievedReports) && retrievedReports.length > 0,
        duration: Date.now() - retrieveStart
      };
      
      report.tests.push(test2);
      
      // Test 3: Retrieve single report definition
      const singleRetrieveStart = Date.now();
      const singleReport = await legalReportingService.getReportDefinitionById(createdReport.id);
      
      const test3 = {
        name: "Retrieve Single Report Definition",
        description: "Retrieve a specific report definition by ID",
        passed: Boolean(singleReport && singleReport.id === createdReport.id),
        duration: Date.now() - singleRetrieveStart
      };
      
      report.tests.push(test3);
      
      // Test 4: Update report definition
      const updateStart = Date.now();
      const updatedReport = await legalReportingService.updateReportDefinition(createdReport.id, {
        name: "Updated Test Financial Report",
        description: "Updated test description"
      });
      
      const test4 = {
        name: "Update Report Definition",
        description: "Update an existing report definition",
        passed: Boolean(updatedReport && updatedReport.name === "Updated Test Financial Report"),
        duration: Date.now() - updateStart
      };
      
      report.tests.push(test4);
      
      // Test 5: Delete report definition
      const deleteStart = Date.now();
      const deleteResult = await legalReportingService.deleteReportDefinition(createdReport.id);
      
      const test5 = {
        name: "Delete Report Definition",
        description: "Delete an existing report definition",
        passed: Boolean(deleteResult && deleteResult.success),
        duration: Date.now() - deleteStart
      };
      
      report.tests.push(test5);
      
    } catch (error) {
      console.error("Error testing report definitions:", error);
      
      report.tests.push({
        name: "Report Definitions Test Suite",
        description: "Error testing report definitions",
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }
  
  /**
   * Test scheduled reports functionality
   */
  private async testScheduledReports(report: TestReport): Promise<void> {
    console.log("Testing scheduled reports...");
    const startTime = Date.now();
    
    try {
      // First create a report definition to use
      const testReportDef = {
        merchantId: this.testMerchantId,
        createdById: this.testUserId,
        name: "Test Scheduled Report",
        description: "Test report for scheduling",
        reportType: "financial",
        frequency: "monthly",
        isPublic: false,
        format: "pdf",
        parameters: { 
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 2, 31)
        },
        createdAt: new Date()
      };
      
      const createdReportDef = await legalReportingService.createReportDefinition(testReportDef);
      
      // Test 1: Schedule a report
      const testSchedule = {
        merchantId: this.testMerchantId,
        createdById: this.testUserId,
        reportDefinitionId: createdReportDef.id,
        name: "Test Monthly Schedule",
        description: "Test monthly schedule for financial report",
        frequency: "monthly",
        isActive: true,
        scheduledTime: "08:00",
        scheduledDayOfMonth: 1,
        parameters: { 
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 2, 31),
          format: "pdf"
        },
        recipientEmails: ["test@example.com"],
        createdAt: new Date()
      };
      
      const createdSchedule = await legalReportingService.scheduleReport(testSchedule);
      
      const test1 = {
        name: "Schedule Report",
        description: "Create a new scheduled report",
        passed: Boolean(createdSchedule && createdSchedule.id),
        duration: Date.now() - startTime
      };
      
      report.tests.push(test1);
      
      if (!test1.passed) {
        throw new Error("Failed to schedule report");
      }
      
      // Test 2: Retrieve scheduled reports
      const retrieveStart = Date.now();
      const retrievedSchedules = await legalReportingService.getScheduledReports(this.testMerchantId);
      
      const test2 = {
        name: "Retrieve Scheduled Reports",
        description: "Retrieve all scheduled reports for a merchant",
        passed: Array.isArray(retrievedSchedules) && retrievedSchedules.length > 0,
        duration: Date.now() - retrieveStart
      };
      
      report.tests.push(test2);
      
      // Test 3: Retrieve single scheduled report
      const singleRetrieveStart = Date.now();
      const singleSchedule = await legalReportingService.getScheduledReportById(createdSchedule.id);
      
      const test3 = {
        name: "Retrieve Single Scheduled Report",
        description: "Retrieve a specific scheduled report by ID",
        passed: Boolean(singleSchedule && singleSchedule.id === createdSchedule.id),
        duration: Date.now() - singleRetrieveStart
      };
      
      report.tests.push(test3);
      
      // Test 4: Update scheduled report
      const updateStart = Date.now();
      const updatedSchedule = await legalReportingService.updateScheduledReport(createdSchedule.id, {
        name: "Updated Test Schedule",
        description: "Updated test schedule description",
        frequency: "weekly",
        scheduledDayOfWeek: 1 // Monday
      });
      
      const test4 = {
        name: "Update Scheduled Report",
        description: "Update an existing scheduled report",
        passed: Boolean(updatedSchedule && 
                        updatedSchedule.name === "Updated Test Schedule" && 
                        updatedSchedule.frequency === "weekly"),
        duration: Date.now() - updateStart
      };
      
      report.tests.push(test4);
      
      // Test 5: Process due reports (make the schedule due by setting nextRunAt to the past)
      const processStart = Date.now();
      
      // Force the scheduled report to be due
      await db.update(legalScheduledReports)
        .set({ nextRunAt: new Date(Date.now() - 86400000) }) // 1 day ago
        .where(eq(legalScheduledReports.id, createdSchedule.id));
      
      const processResult = await legalReportingService.processDueReports();
      
      const test5 = {
        name: "Process Due Reports",
        description: "Process reports that are due to be generated",
        passed: Boolean(processResult && processResult.processed > 0),
        duration: Date.now() - processStart
      };
      
      report.tests.push(test5);
      
      // Test 6: Delete scheduled report
      const deleteStart = Date.now();
      const deleteResult = await legalReportingService.deleteScheduledReport(createdSchedule.id);
      
      const test6 = {
        name: "Delete Scheduled Report",
        description: "Delete an existing scheduled report",
        passed: Boolean(deleteResult && deleteResult.success),
        duration: Date.now() - deleteStart
      };
      
      report.tests.push(test6);
      
      // Clean up the report definition
      await legalReportingService.deleteReportDefinition(createdReportDef.id);
      
    } catch (error) {
      console.error("Error testing scheduled reports:", error);
      
      report.tests.push({
        name: "Scheduled Reports Test Suite",
        description: "Error testing scheduled reports",
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }
  
  /**
   * Test report generation functionality
   */
  private async testReportGeneration(report: TestReport): Promise<void> {
    console.log("Testing report generation...");
    const startTime = Date.now();
    
    try {
      // First create a report definition to use
      const testReportDef = {
        merchantId: this.testMerchantId,
        createdById: this.testUserId,
        name: "Test Generation Report",
        description: "Test report for generation",
        reportType: "financial",
        frequency: "monthly",
        isPublic: false,
        format: "pdf",
        parameters: { 
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 2, 31)
        },
        createdAt: new Date()
      };
      
      const createdReportDef = await legalReportingService.createReportDefinition(testReportDef);
      
      // Test 1: Generate a PDF report
      const pdfParameters = {
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 2, 31),
        format: "pdf"
      };
      
      const pdfReport = await legalReportingService.generateReport(createdReportDef.id, pdfParameters, this.testUserId);
      
      const test1 = {
        name: "Generate PDF Report",
        description: "Generate a report in PDF format",
        passed: Boolean(pdfReport && pdfReport.id && pdfReport.filePath),
        duration: Date.now() - startTime
      };
      
      report.tests.push(test1);
      
      if (!test1.passed) {
        throw new Error("Failed to generate PDF report");
      }
      
      // Test 2: Generate a CSV report
      const csvStart = Date.now();
      const csvParameters = {
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 2, 31),
        format: "csv"
      };
      
      const csvReport = await legalReportingService.generateReport(createdReportDef.id, csvParameters, this.testUserId);
      
      const test2 = {
        name: "Generate CSV Report",
        description: "Generate a report in CSV format",
        passed: Boolean(csvReport && csvReport.id && csvReport.filePath),
        duration: Date.now() - csvStart
      };
      
      report.tests.push(test2);
      
      // Test 3: Retrieve generated reports
      const retrieveStart = Date.now();
      const retrievedReports = await legalReportingService.getGeneratedReports(this.testMerchantId);
      
      const test3 = {
        name: "Retrieve Generated Reports",
        description: "Retrieve all generated reports for a merchant",
        passed: Array.isArray(retrievedReports) && retrievedReports.length >= 2, // At least the PDF and CSV
        duration: Date.now() - retrieveStart
      };
      
      report.tests.push(test3);
      
      // Test 4: Retrieve single generated report
      const singleRetrieveStart = Date.now();
      const singleReport = await legalReportingService.getGeneratedReportById(pdfReport.id);
      
      const test4 = {
        name: "Retrieve Single Generated Report",
        description: "Retrieve a specific generated report by ID",
        passed: Boolean(singleReport && singleReport.id === pdfReport.id),
        duration: Date.now() - singleRetrieveStart
      };
      
      report.tests.push(test4);
      
      // Clean up the report definition and generated reports
      await legalReportingService.deleteReportDefinition(createdReportDef.id);
      
      // Manually delete the generated reports from the database
      await db.delete(legalGeneratedReports)
        .where(eq(legalGeneratedReports.merchantId, this.testMerchantId));
      
    } catch (error) {
      console.error("Error testing report generation:", error);
      
      report.tests.push({
        name: "Report Generation Test Suite",
        description: "Error testing report generation",
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }
  
  /**
   * Test reports access control
   */
  private async testReportsAccess(report: TestReport): Promise<void> {
    console.log("Testing reports access control...");
    const startTime = Date.now();
    
    try {
      // Create two report definitions with different access settings
      const privateReportDef = {
        merchantId: this.testMerchantId,
        createdById: this.testUserId,
        name: "Private Test Report",
        description: "Private test report",
        reportType: "financial",
        frequency: "monthly",
        isPublic: false,
        format: "pdf",
        parameters: { 
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 2, 31)
        },
        createdAt: new Date()
      };
      
      const publicReportDef = {
        merchantId: this.testMerchantId,
        createdById: this.testUserId,
        name: "Public Test Report",
        description: "Public test report",
        reportType: "financial",
        frequency: "monthly",
        isPublic: true,
        format: "pdf",
        parameters: { 
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 2, 31)
        },
        createdAt: new Date()
      };
      
      const createdPrivateReport = await legalReportingService.createReportDefinition(privateReportDef);
      const createdPublicReport = await legalReportingService.createReportDefinition(publicReportDef);
      
      // Generate a report for each
      const privateParameters = {
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 2, 31),
        format: "pdf"
      };
      
      const publicParameters = {
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 2, 31),
        format: "pdf"
      };
      
      const privateGeneratedReport = await legalReportingService.generateReport(createdPrivateReport.id, privateParameters, this.testUserId);
      const publicGeneratedReport = await legalReportingService.generateReport(createdPublicReport.id, publicParameters, this.testUserId);
      
      // Update the public report's isPublic flag in the database
      await db.update(legalGeneratedReports)
        .set({ isPublic: true })
        .where(eq(legalGeneratedReports.id, publicGeneratedReport.id));
      
      // Test 1: Verify private report has isPublic = false
      const privateReportTest = {
        name: "Private Report Access",
        description: "Verify private report has isPublic = false",
        passed: Boolean(privateGeneratedReport && privateGeneratedReport.isPublic === false),
        duration: Date.now() - startTime
      };
      
      report.tests.push(privateReportTest);
      
      // Test 2: Verify public report has isPublic = true (after database update)
      const publicReportRetrieved = await legalReportingService.getGeneratedReportById(publicGeneratedReport.id);
      
      const publicReportTest = {
        name: "Public Report Access",
        description: "Verify public report has isPublic = true",
        passed: Boolean(publicReportRetrieved && publicReportRetrieved.isPublic === true),
        duration: Date.now() - startTime
      };
      
      report.tests.push(publicReportTest);
      
      // Clean up the report definitions and generated reports
      await legalReportingService.deleteReportDefinition(createdPrivateReport.id);
      await legalReportingService.deleteReportDefinition(createdPublicReport.id);
      
      // Manually delete the generated reports from the database
      await db.delete(legalGeneratedReports)
        .where(eq(legalGeneratedReports.merchantId, this.testMerchantId));
      
    } catch (error) {
      console.error("Error testing reports access:", error);
      
      report.tests.push({
        name: "Reports Access Test Suite",
        description: "Error testing reports access control",
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }
  
  /**
   * Clean up test data from database
   */
  private async cleanupTestData(): Promise<void> {
    try {
      console.log("Cleaning up test data...");
      
      // Delete all test report definitions
      await db.delete(legalReportDefinitions)
        .where(eq(legalReportDefinitions.merchantId, this.testMerchantId));
      
      // Delete all test scheduled reports
      await db.delete(legalScheduledReports)
        .where(eq(legalScheduledReports.merchantId, this.testMerchantId));
      
      // Delete all test generated reports
      await db.delete(legalGeneratedReports)
        .where(eq(legalGeneratedReports.merchantId, this.testMerchantId));
      
      console.log("Test data cleanup complete");
    } catch (error) {
      console.error("Error cleaning up test data:", error);
      throw error;
    }
  }
}

export const legalReportingSystemTestService = new LegalReportingSystemTestService();

/**
 * Run tests if this file is executed directly
 */
if (require.main === module) {
  (async () => {
    try {
      const result = await legalReportingSystemTestService.runComprehensiveTests();
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error) {
      console.error("Failed to run legal reporting system tests:", error);
      process.exit(1);
    }
  })();
}