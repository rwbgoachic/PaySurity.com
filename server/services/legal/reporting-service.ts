/**
 * Legal Reporting Service
 * 
 * This service provides functionality for creating, scheduling, and generating
 * various types of legal practice management reports.
 */

import { db } from "../../db";
import { 
  legalReportDefinitions, 
  legalScheduledReports, 
  legalGeneratedReports,
  InsertLegalReportDefinition 
} from "../../../shared/schema";
import { 
  eq, 
  and, 
  sql, 
  asc, 
  desc, 
  lt, 
  gte, 
  lte 
} from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

// Define report parameter types
export interface ReportParameters {
  startDate?: Date;
  endDate?: Date;
  format?: "pdf" | "excel" | "csv" | "json" | "html";
  attorneyId?: number;
  clientId?: number;
  matterIds?: number[];
  includeInactive?: boolean;
  groupBy?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
  fields?: string[];
  filters?: Record<string, any>;
  templateId?: number;
  scheduledReportId?: number;
  parameters?: Record<string, any>;
  [key: string]: any;
}

class LegalReportingService {
  private reportDir = path.join(process.cwd(), "reports");

  constructor() {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Create a new report definition
   */
  async createReportDefinition(data: InsertLegalReportDefinition & { format?: string, frequency?: string }) {
    try {
      const values = {
        merchantId: data.merchantId,
        createdById: data.createdById,
        name: data.name,
        description: data.description || null,
        reportType: data.reportType,
        isPublic: data.isPublic || false,
        parameters: data.parameters || {},
        // Frequency and format are handled elsewhere, not in schema
      };
      
      const [reportDefinition] = await db.insert(legalReportDefinitions)
        .values(values)
        .returning();

      return reportDefinition;
    } catch (error) {
      console.error("Error creating report definition:", error);
      throw new Error("Failed to create report definition");
    }
  }

  /**
   * Get all report definitions for a merchant
   */
  async getReportDefinitions(merchantId: number) {
    try {
      const reportDefinitions = await db.select()
        .from(legalReportDefinitions)
        .where(eq(legalReportDefinitions.merchantId, merchantId))
        .orderBy(desc(legalReportDefinitions.createdAt));

      return reportDefinitions;
    } catch (error) {
      console.error("Error getting report definitions:", error);
      throw new Error("Failed to retrieve report definitions");
    }
  }

  /**
   * Get a report definition by ID
   */
  async getReportDefinitionById(id: number) {
    try {
      const [reportDefinition] = await db.select()
        .from(legalReportDefinitions)
        .where(eq(legalReportDefinitions.id, id));

      return reportDefinition;
    } catch (error) {
      console.error("Error getting report definition:", error);
      throw new Error("Failed to retrieve report definition");
    }
  }

  /**
   * Update a report definition
   */
  async updateReportDefinition(id: number, data: any) {
    try {
      const [updatedDefinition] = await db.update(legalReportDefinitions)
        .set({
          name: data.name,
          description: data.description,
          reportType: data.reportType,
          isPublic: data.isPublic,
          parameters: data.parameters,
          updatedAt: new Date()
        })
        .where(eq(legalReportDefinitions.id, id))
        .returning();

      return updatedDefinition;
    } catch (error) {
      console.error("Error updating report definition:", error);
      throw new Error("Failed to update report definition");
    }
  }

  /**
   * Delete a report definition
   */
  async deleteReportDefinition(id: number) {
    try {
      await db.delete(legalReportDefinitions)
        .where(eq(legalReportDefinitions.id, id));

      return { success: true };
    } catch (error) {
      console.error("Error deleting report definition:", error);
      throw new Error("Failed to delete report definition");
    }
  }

  /**
   * Schedule a report for recurring generation
   */
  async scheduleReport(data: any) {
    try {
      // Calculate the next run date based on frequency
      const nextRunAt = this.calculateNextRunDate(data.frequency, data.scheduledDayOfMonth, data.scheduledDayOfWeek, data.scheduledTime);

      const [scheduledReport] = await db.insert(legalScheduledReports)
        .values({
          merchantId: data.merchantId,
          createdById: data.createdById,
          reportDefinitionId: data.reportDefinitionId,
          name: data.name,
          description: data.description || null,
          frequency: data.frequency,
          scheduledTime: data.scheduledTime,
          scheduledDayOfMonth: data.scheduledDayOfMonth || null,
          scheduledDayOfWeek: data.scheduledDayOfWeek || null,
          parameters: data.parameters || {},
          recipientEmails: data.recipientEmails || [],
          isActive: data.isActive || true,
          nextRunAt: nextRunAt,
          createdAt: new Date()
        })
        .returning();

      return scheduledReport;
    } catch (error) {
      console.error("Error scheduling report:", error);
      throw new Error("Failed to schedule report");
    }
  }

  /**
   * Get all scheduled reports for a merchant
   */
  async getScheduledReports(merchantId: number) {
    try {
      const scheduledReports = await db.select()
        .from(legalScheduledReports)
        .where(eq(legalScheduledReports.merchantId, merchantId))
        .orderBy(desc(legalScheduledReports.createdAt));

      return scheduledReports;
    } catch (error) {
      console.error("Error getting scheduled reports:", error);
      throw new Error("Failed to retrieve scheduled reports");
    }
  }

  /**
   * Get a scheduled report by ID
   */
  async getScheduledReportById(id: number) {
    try {
      const [scheduledReport] = await db.select()
        .from(legalScheduledReports)
        .where(eq(legalScheduledReports.id, id));

      return scheduledReport;
    } catch (error) {
      console.error("Error getting scheduled report:", error);
      throw new Error("Failed to retrieve scheduled report");
    }
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(id: number, data: any) {
    try {
      // If frequency or scheduled day/time has changed, recalculate next run date
      let nextRunAt = undefined;
      if (
        data.frequency || 
        data.scheduledDayOfMonth !== undefined || 
        data.scheduledDayOfWeek !== undefined || 
        data.scheduledTime
      ) {
        const currentReport = await this.getScheduledReportById(id);
        nextRunAt = this.calculateNextRunDate(
          data.frequency || currentReport.frequency,
          data.scheduledDayOfMonth !== undefined ? data.scheduledDayOfMonth : currentReport.scheduledDayOfMonth,
          data.scheduledDayOfWeek !== undefined ? data.scheduledDayOfWeek : currentReport.scheduledDayOfWeek,
          data.scheduledTime || currentReport.scheduledTime
        );
      }

      const [updatedReport] = await db.update(legalScheduledReports)
        .set({
          name: data.name,
          description: data.description,
          frequency: data.frequency,
          scheduledTime: data.scheduledTime,
          scheduledDayOfMonth: data.scheduledDayOfMonth,
          scheduledDayOfWeek: data.scheduledDayOfWeek,
          parameters: data.parameters,
          recipientEmails: data.recipientEmails,
          isActive: data.isActive,
          nextRunAt: nextRunAt,
          updatedAt: new Date()
        })
        .where(eq(legalScheduledReports.id, id))
        .returning();

      return updatedReport;
    } catch (error) {
      console.error("Error updating scheduled report:", error);
      throw new Error("Failed to update scheduled report");
    }
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(id: number) {
    try {
      await db.delete(legalScheduledReports)
        .where(eq(legalScheduledReports.id, id));

      return { success: true };
    } catch (error) {
      console.error("Error deleting scheduled report:", error);
      throw new Error("Failed to delete scheduled report");
    }
  }

  /**
   * Process all scheduled reports that are due to run
   */
  async processDueReports() {
    try {
      const now = new Date();
      
      // Find all active scheduled reports that are due to run
      const dueReports = await db.select()
        .from(legalScheduledReports)
        .where(
          and(
            eq(legalScheduledReports.isActive, true),
            lt(legalScheduledReports.nextRunAt, now)
          )
        );
      
      console.log(`Found ${dueReports.length} scheduled reports to process`);
      
      // Process each due report
      const results = await Promise.all(
        dueReports.map(async (report) => {
          try {
            // Get the report definition
            const reportDefinition = await this.getReportDefinitionById(report.reportDefinitionId);
            
            // Generate the report
            const parameters = {
              ...reportDefinition.parameters,
              ...report.parameters,
              scheduledReportId: report.id
            };
            
            const generatedReport = await this.generateReport(
              reportDefinition.id,
              parameters,
              report.createdById
            );
            
            // Update the next run date
            const nextRunAt = this.calculateNextRunDate(
              report.frequency,
              report.scheduledDayOfMonth,
              report.scheduledDayOfWeek,
              report.scheduledTime
            );
            
            await db.update(legalScheduledReports)
              .set({ nextRunAt, lastRunAt: now })
              .where(eq(legalScheduledReports.id, report.id));
            
            // Send email notifications if configured
            if (report.recipientEmails && report.recipientEmails.length > 0) {
              // Implementation for sending email would go here
              console.log(`Would send report ${generatedReport.id} to ${report.recipientEmails.join(', ')}`);
            }
            
            return { 
              id: report.id, 
              status: 'success', 
              generatedReportId: generatedReport.id 
            };
          } catch (error) {
            console.error(`Error processing scheduled report ${report.id}:`, error);
            return { 
              id: report.id, 
              status: 'error', 
              error: error.message 
            };
          }
        })
      );
      
      const successful = results.filter(r => r.status === 'success').length;
      return { 
        processed: dueReports.length, 
        successful, 
        failed: dueReports.length - successful,
        results
      };
    } catch (error) {
      console.error("Error processing due reports:", error);
      throw new Error("Failed to process due reports");
    }
  }

  /**
   * Generate a report based on a report definition
   */
  async generateReport(reportDefinitionId: number, parameters: ReportParameters, userId: number) {
    try {
      // Get the report definition
      const reportDefinition = await this.getReportDefinitionById(reportDefinitionId);
      if (!reportDefinition) {
        throw new Error("Report definition not found");
      }
      
      // Merge parameters with defaults
      const mergedParams: ReportParameters = {
        ...(reportDefinition.parameters || {}),
        ...parameters
      };
      
      // Set the format from parameters or use default (pdf as fallback)
      const format = (parameters.format || "pdf") as "pdf" | "excel" | "csv" | "json" | "html";
      
      // Get report data
      const reportData = await this.getReportData(reportDefinition.reportType, mergedParams);
      
      // Create a unique filename
      const fileId = uuidv4();
      const fileName = `${reportDefinition.reportType}_${fileId}.${format}`;
      const filePath = path.join(this.reportDir, fileName);
      
      // Generate the file based on format
      const startTime = Date.now();
      await this.generateFile(reportData, filePath, format, reportDefinition, mergedParams);
      const generationTime = Date.now() - startTime;
      
      // Record the generated report in the database
      const [generatedReport] = await db.insert(legalGeneratedReports)
        .values({
          merchantId: reportDefinition.merchantId,
          createdById: userId,
          reportDefinitionId: reportDefinition.id,
          scheduledReportId: parameters.scheduledReportId || null,
          name: reportDefinition.name,
          reportType: reportDefinition.reportType,
          format: format,
          filePath: fileName,
          parameters: mergedParams as any, // Using type assertion to work around the spread type issue
          fileSize: fs.statSync(filePath).size,
          isPublic: reportDefinition.isPublic,
          generationTime,
          createdAt: new Date()
        })
        .returning();
      
      return generatedReport;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error generating report:", error);
      throw new Error(`Failed to generate report: ${errorMessage}`);
    }
  }

  /**
   * Get all generated reports for a merchant
   */
  async getGeneratedReports(merchantId: number) {
    try {
      const reports = await db.select()
        .from(legalGeneratedReports)
        .where(eq(legalGeneratedReports.merchantId, merchantId))
        .orderBy(desc(legalGeneratedReports.createdAt));
      
      return reports;
    } catch (error) {
      console.error("Error getting generated reports:", error);
      throw new Error("Failed to retrieve generated reports");
    }
  }

  /**
   * Get a generated report by ID
   */
  async getGeneratedReportById(id: number) {
    try {
      const [report] = await db.select()
        .from(legalGeneratedReports)
        .where(eq(legalGeneratedReports.id, id));
      
      return report;
    } catch (error) {
      console.error("Error getting generated report:", error);
      throw new Error("Failed to retrieve generated report");
    }
  }

  /**
   * Delete a generated report
   */
  async deleteGeneratedReport(id: number) {
    try {
      const report = await this.getGeneratedReportById(id);
      if (!report) {
        throw new Error("Report not found");
      }
      
      // Delete the file
      const filePath = path.join(this.reportDir, report.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete the database record
      await db.delete(legalGeneratedReports)
        .where(eq(legalGeneratedReports.id, id));
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting generated report:", error);
      throw new Error("Failed to delete generated report");
    }
  }

  /**
   * Get the file path for a generated report
   */
  getReportFilePath(reportFileName: string) {
    return path.join(this.reportDir, reportFileName);
  }

  /**
   * Calculate the next run date for a scheduled report
   */
  private calculateNextRunDate(
    frequency: string,
    dayOfMonth?: number | null,
    dayOfWeek?: number | null,
    timeOfDay?: string
  ): Date {
    const now = new Date();
    let nextRun = new Date(now);
    
    // Parse the time of day (format: "HH:MM")
    let hours = 0;
    let minutes = 0;
    
    if (timeOfDay) {
      const [hoursStr, minutesStr] = timeOfDay.split(':');
      hours = parseInt(hoursStr, 10);
      minutes = parseInt(minutesStr, 10);
    }
    
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If the time is in the past for today, start from tomorrow
    if (nextRun < now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    switch (frequency) {
      case 'daily':
        // Already set for tomorrow if needed
        break;
        
      case 'weekly':
        const targetDayOfWeek = dayOfWeek !== null && dayOfWeek !== undefined ? dayOfWeek : 1; // Default to Monday (1)
        const currentDay = nextRun.getDay();
        const daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
        
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        break;
        
      case 'monthly':
        const targetDayOfMonth = dayOfMonth !== null && dayOfMonth !== undefined ? dayOfMonth : 1; // Default to 1st of month
        
        // Set to the next month if we've already passed this day in the current month
        if (nextRun.getDate() > targetDayOfMonth) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        
        // Set the target day of month
        nextRun.setDate(targetDayOfMonth);
        break;
        
      case 'quarterly':
        // Set to the first day of the next quarter
        const currentMonth = nextRun.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        const firstMonthOfNextQuarter = (currentQuarter + 1) * 3 % 12;
        
        nextRun.setMonth(firstMonthOfNextQuarter);
        nextRun.setDate(dayOfMonth || 1);
        break;
        
      case 'annual':
        // Set to the same day next year
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        if (dayOfMonth) {
          nextRun.setDate(dayOfMonth);
        }
        break;
        
      default:
        // Default to daily
        nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun;
  }

  /**
   * Generate a file for the report based on format
   */
  private async generateFile(
    data: any,
    filePath: string,
    format: "pdf" | "excel" | "csv" | "json" | "html",
    reportDefinition: any,
    parameters: ReportParameters
  ): Promise<string> {
    switch (format) {
      case 'pdf':
        return this.generatePDF(data, filePath, reportDefinition, parameters);
        
      case 'csv':
        return this.generateCSV(data, filePath);
        
      case 'excel':
        return this.generateExcel(data, filePath);
        
      case 'json':
        return this.generateJSON(data, filePath);
        
      case 'html':
        return this.generateHTML(data, filePath, reportDefinition, parameters);
        
      default:
        return this.generatePDF(data, filePath, reportDefinition, parameters);
    }
  }

  /**
   * Generate a PDF report
   */
  private async generatePDF(
    data: any[],
    filePath: string,
    reportDefinition: any,
    parameters: ReportParameters
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);
        
        // Add report header
        doc.fontSize(25).text(reportDefinition.name, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(reportDefinition.description || '', { align: 'center' });
        doc.moveDown();
        
        // Add date range if applicable
        if (parameters.startDate && parameters.endDate) {
          const startDate = new Date(parameters.startDate).toLocaleDateString();
          const endDate = new Date(parameters.endDate).toLocaleDateString();
          doc.fontSize(10).text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });
          doc.moveDown();
        }
        
        // Add generation timestamp
        doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);
        
        // If there's no data, show a message
        if (!data || data.length === 0) {
          doc.fontSize(12).text('No data available for this report.', { align: 'center' });
          doc.end();
          stream.on('finish', () => resolve(filePath));
          return;
        }
        
        // For financial reports, add a chart if applicable
        if (reportDefinition.reportType === 'financial' && data.length > 0) {
          // Generate a chart image and attach it to the PDF
          this.generateChartImage(data, reportDefinition, parameters)
            .then(chartImagePath => {
              if (chartImagePath) {
                // Add the chart to the PDF
                doc.image(chartImagePath, {
                  fit: [500, 300],
                  align: 'center'
                });
                doc.moveDown(2);
                
                // Clean up the temporary chart image
                fs.unlinkSync(chartImagePath);
              }
              
              // Continue with the rest of the PDF generation
              continuePdfGeneration(this, doc, data, stream, resolve, filePath);
            })
            .catch(error => {
              console.error("Error generating chart:", error);
              // Continue without a chart if there was an error
              continuePdfGeneration(this, doc, data, stream, resolve, filePath);
            });
            
          return; // Return early and let the promise callbacks finish the PDF
        }
        
        // If we got here, we don't need a chart
        continuePdfGeneration(this, doc, data, stream, resolve, filePath);
      } catch (error) {
        reject(error);
      }
    });
    
    // Function to continue generating the PDF after chart processing
    function continuePdfGeneration(self: any, doc: any, data: any[], stream: any, resolve: (value: string) => void, filePath: string) {
      try {
        // Now add the data as a table
        const table = self.formatDataForTable(data);
        
        // Add table headers
        const columnCount = table.headers.length;
        const columnWidth = 500 / columnCount;
        
        doc.fontSize(10);
        
        // Draw header row
        doc.font('Helvetica-Bold');
        for (let i = 0; i < table.headers.length; i++) {
          doc.text(
            table.headers[i], 
            50 + (i * columnWidth), 
            doc.y, 
            { width: columnWidth, align: 'left' }
          );
        }
        doc.moveDown();
        
        // Draw a line
        doc.moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown(0.5);
        for (const row of table.rows) {
          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();
            
            // Redraw header on new page
            doc.font('Helvetica-Bold');
            for (let i = 0; i < table.headers.length; i++) {
              doc.text(
                table.headers[i], 
                50 + (i * columnWidth), 
                50, 
                { width: columnWidth, align: 'left' }
              );
            }
            doc.moveDown();
            
            // Draw a line
            doc.moveTo(50, doc.y)
              .lineTo(550, doc.y)
              .stroke();
            doc.moveDown(0.5);
            
            doc.font('Helvetica');
          }
          
          // Calculate the max height needed for this row
          let maxHeight = 0;
          const heights = row.map(cell => {
            const cellText = cell.toString();
            const textHeight = doc.heightOfString(cellText, { width: columnWidth });
            return textHeight;
          });
          maxHeight = Math.max(...heights);
          
          const rowStartY = doc.y;
          
          // Draw each cell in the row
          for (let i = 0; i < row.length; i++) {
            doc.text(
              row[i].toString(), 
              50 + (i * columnWidth), 
              rowStartY, 
              { width: columnWidth, align: 'left' }
            );
          }
          
          // Move to position after the row
          doc.y = rowStartY + maxHeight;
          doc.moveDown(0.5);
        }
        
        // Add a summary if needed
        if (table.summary) {
          doc.moveDown();
          doc.font('Helvetica-Bold').text('Summary', { align: 'left' });
          doc.moveDown(0.5);
          
          for (const [key, value] of Object.entries(table.summary)) {
            doc.font('Helvetica').text(`${key}: ${value}`, { align: 'left' });
          }
        }
        
        // Finalize the PDF
        doc.end();
        
        stream.on('finish', () => resolve(filePath));
        stream.on('error', (err) => reject(err));
      } catch (error) {
        reject(error);
      }
    }
  }

  /**
   * Generate a CSV report
   */
  private generateCSV(data: any[], filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (!data || data.length === 0) {
          fs.writeFileSync(filePath, 'No data available for this report.');
          resolve(filePath);
          return;
        }
        
        // Extract headers from the first data item
        const headers = Object.keys(data[0]);
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        // Add data rows
        for (const row of data) {
          const rowValues = headers.map(header => {
            const value = row[header];
            // Properly escape values for CSV
            if (value === null || value === undefined) {
              return '';
            } else if (typeof value === 'string') {
              // Escape quotes and wrap in quotes
              return `"${value.replace(/"/g, '""')}"`;
            } else if (value instanceof Date) {
              return `"${value.toISOString()}"`;
            } else {
              return value;
            }
          });
          
          csvContent += rowValues.join(',') + '\n';
        }
        
        fs.writeFileSync(filePath, csvContent);
        resolve(filePath);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate an Excel report (stub - would require xlsx or similar package)
   */
  private generateExcel(data: any[], filePath: string): Promise<string> {
    // This is a stub - would need the xlsx package installed
    return new Promise((resolve, reject) => {
      try {
        // For now, just generate a CSV as a placeholder
        this.generateCSV(data, filePath)
          .then(() => resolve(filePath))
          .catch(err => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a JSON report
   */
  private generateJSON(data: any, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const jsonContent = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonContent);
        resolve(filePath);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate an HTML report
   */
  private generateHTML(
    data: any[],
    filePath: string,
    reportDefinition: any,
    parameters: ReportParameters
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${reportDefinition.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1, h2 { text-align: center; }
              .report-info { text-align: center; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #f2f2f2; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .summary { margin-top: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${reportDefinition.name}</h1>
            <div class="report-info">
              ${reportDefinition.description ? `<p>${reportDefinition.description}</p>` : ''}
              ${parameters.startDate && parameters.endDate ? 
                `<p>Date Range: ${new Date(parameters.startDate).toLocaleDateString()} to ${new Date(parameters.endDate).toLocaleDateString()}</p>` : 
                ''}
              <p><small>Generated: ${new Date().toLocaleString()}</small></p>
            </div>
        `;
        
        if (!data || data.length === 0) {
          htmlContent += '<p style="text-align: center;">No data available for this report.</p>';
        } else {
          // Format the data as an HTML table
          const table = this.formatDataForTable(data);
          
          htmlContent += '<table>';
          
          // Add headers
          htmlContent += '<tr>';
          for (const header of table.headers) {
            htmlContent += `<th>${header}</th>`;
          }
          htmlContent += '</tr>';
          
          // Add data rows
          for (const row of table.rows) {
            htmlContent += '<tr>';
            for (const cell of row) {
              htmlContent += `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`;
            }
            htmlContent += '</tr>';
          }
          
          htmlContent += '</table>';
          
          // Add summary if available
          if (table.summary) {
            htmlContent += '<div class="summary"><p>Summary:</p><ul>';
            for (const [key, value] of Object.entries(table.summary)) {
              htmlContent += `<li>${key}: ${value}</li>`;
            }
            htmlContent += '</ul></div>';
          }
        }
        
        htmlContent += `
          </body>
          </html>
        `;
        
        fs.writeFileSync(filePath, htmlContent);
        resolve(filePath);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a chart image for the report
   */
  private async generateChartImage(
    data: any[],
    reportDefinition: any,
    parameters: ReportParameters
  ): Promise<string | null> {
    try {
      // Only generate charts for certain report types with appropriate data
      if (!data || data.length === 0 || !reportDefinition.reportType) {
        return null;
      }
      
      // Create a temporary file path for the chart image
      const chartFileName = `chart_${uuidv4()}.png`;
      const chartFilePath = path.join(this.reportDir, chartFileName);
      
      // Create the chart based on report type
      const width = 800;
      const height = 500;
      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
      
      let chartConfig = null;
      
      switch (reportDefinition.reportType) {
        case 'financial':
          chartConfig = this.createFinancialChart(data, parameters);
          break;
          
        case 'timesheet':
          chartConfig = this.createTimesheetChart(data, parameters);
          break;
          
        case 'billing':
          chartConfig = this.createBillingChart(data, parameters);
          break;
          
        case 'matter':
          chartConfig = this.createMatterChart(data, parameters);
          break;
          
        default:
          return null;
      }
      
      if (!chartConfig) return null;
      
      // Render the chart to a buffer and save it to a file
      const buffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
      fs.writeFileSync(chartFilePath, buffer);
      
      return chartFilePath;
    } catch (error) {
      console.error("Error generating chart image:", error);
      return null;
    }
  }

  /**
   * Create a chart configuration for financial reports
   */
  private createFinancialChart(data: any[], parameters: ReportParameters): any {
    // Assuming data has structure with period, revenue, expenses, profit
    const labels = data.map(item => item.period);
    const revenueData = data.map(item => parseFloat(item.revenue || 0));
    const expensesData = data.map(item => parseFloat(item.expenses || 0));
    const profitData = data.map(item => parseFloat(item.profit || 0));
    
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: expensesData,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Profit',
            data: profitData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Financial Performance'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)'
            }
          }
        }
      }
    };
  }

  /**
   * Create a chart configuration for timesheet reports
   */
  private createTimesheetChart(data: any[], parameters: ReportParameters): any {
    // Assuming data has structure with attorney, hours, billableHours
    const labels = data.map(item => item.attorney || item.user || item.period);
    const hoursData = data.map(item => parseFloat(item.hours || 0));
    const billableHoursData = data.map(item => parseFloat(item.billableHours || 0));
    
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Hours',
            data: hoursData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Billable Hours',
            data: billableHoursData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Timesheet Analysis'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Hours'
            }
          }
        }
      }
    };
  }

  /**
   * Create a chart configuration for billing reports
   */
  private createBillingChart(data: any[], parameters: ReportParameters): any {
    // Assuming data has invoiced, paid, outstanding amounts by period
    const labels = data.map(item => item.period);
    const invoicedData = data.map(item => parseFloat(item.invoiced || 0));
    const paidData = data.map(item => parseFloat(item.paid || 0));
    const outstandingData = data.map(item => parseFloat(item.outstanding || 0));
    
    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Invoiced',
            data: invoicedData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true
          },
          {
            label: 'Paid',
            data: paidData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            fill: true
          },
          {
            label: 'Outstanding',
            data: outstandingData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Billing Performance'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)'
            }
          }
        }
      }
    };
  }

  /**
   * Create a chart configuration for matter reports
   */
  private createMatterChart(data: any[], parameters: ReportParameters): any {
    // Assuming data has matter status counts
    const statuses = ['Open', 'Pending', 'Closed', 'Suspended'];
    const statusCounts = statuses.map(status => {
      const count = data.filter(item => item.status === status).length;
      return count || 0;
    });
    
    return {
      type: 'pie',
      data: {
        labels: statuses,
        datasets: [
          {
            data: statusCounts,
            backgroundColor: [
              'rgba(75, 192, 192, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Matter Status Distribution'
          },
          legend: {
            position: 'right'
          }
        }
      }
    };
  }

  /**
   * Format data for table representation in reports
   */
  private formatDataForTable(data: any[]): {
    headers: string[];
    rows: any[][];
    summary?: Record<string, any>;
  } {
    if (!data || data.length === 0) {
      return { headers: [], rows: [] };
    }
    
    // Extract headers from the first data item
    const headers = Object.keys(data[0]);
    
    // Format rows
    const rows = data.map(item => {
      return headers.map(header => {
        const value = item[header];
        
        // Format different types of values
        if (value === null || value === undefined) {
          return '';
        } else if (value instanceof Date) {
          return value.toLocaleDateString();
        } else if (typeof value === 'number') {
          // Format currency values
          if (header.toLowerCase().includes('amount') || 
              header.toLowerCase().includes('revenue') || 
              header.toLowerCase().includes('expense') || 
              header.toLowerCase().includes('profit') ||
              header.toLowerCase().includes('fee')) {
            return `$${value.toFixed(2)}`;
          }
          return value.toString();
        } else if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        } else {
          return value.toString();
        }
      });
    });
    
    // Create summary for certain report types
    let summary: Record<string, any> | undefined = undefined;
    
    if (headers.includes('amount') || headers.includes('revenue') || headers.includes('hours')) {
      summary = {};
      
      // Sum numeric columns
      for (const header of headers) {
        if (header.toLowerCase().includes('amount') || 
            header.toLowerCase().includes('revenue') || 
            header.toLowerCase().includes('expense') || 
            header.toLowerCase().includes('profit') ||
            header.toLowerCase().includes('fee') ||
            header.toLowerCase().includes('hours')) {
          
          const sum = data.reduce((acc, item) => {
            const value = parseFloat(item[header] || 0);
            return acc + (isNaN(value) ? 0 : value);
          }, 0);
          
          // Format the sum
          if (header.toLowerCase().includes('hours')) {
            summary[`Total ${header}`] = sum.toFixed(2);
          } else {
            summary[`Total ${header}`] = `$${sum.toFixed(2)}`;
          }
        }
      }
      
      // Add count of records
      summary['Total Records'] = data.length;
    }
    
    return { headers, rows, summary };
  }

  /**
   * Get report data based on report type and parameters
   */
  private async getReportData(reportType: string, parameters: ReportParameters): Promise<any[]> {
    switch (reportType) {
      case 'financial':
        return this.getFinancialReportData(parameters);
        
      case 'timesheet':
        return this.getTimesheetReportData(parameters);
        
      case 'billing':
        return this.getBillingReportData(parameters);
        
      case 'matter':
        return this.getMatterReportData(parameters);
        
      case 'client':
        return this.getClientReportData(parameters);
        
      case 'trust':
        return this.getTrustReportData(parameters);
        
      case 'expense':
        return this.getExpenseReportData(parameters);
        
      case 'custom':
        return this.getCustomReportData(parameters);
        
      default:
        return [];
    }
  }

  /**
   * Get data for financial reports
   */
  private async getFinancialReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run SQL queries
    // to generate the financial report data
    return [
      { period: 'Jan 2025', revenue: 45000, expenses: 32000, profit: 13000, collectionsRate: '85%', outstandingAR: 9500 },
      { period: 'Feb 2025', revenue: 52000, expenses: 35000, profit: 17000, collectionsRate: '88%', outstandingAR: 8200 },
      { period: 'Mar 2025', revenue: 48500, expenses: 33500, profit: 15000, collectionsRate: '82%', outstandingAR: 10200 },
      { period: 'Apr 2025', revenue: 55000, expenses: 34000, profit: 21000, collectionsRate: '90%', outstandingAR: 7500 }
    ];
  }

  /**
   * Get data for timesheet reports
   */
  private async getTimesheetReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run SQL queries
    // to generate the timesheet report data
    return [
      { attorney: 'John Smith', hours: 165, billableHours: 142, billingRate: 250, totalBilled: 35500, utilization: '86%', realization: '92%' },
      { attorney: 'Jane Doe', hours: 155, billableHours: 138, billingRate: 275, totalBilled: 37950, utilization: '89%', realization: '95%' },
      { attorney: 'Robert Brown', hours: 160, billableHours: 130, billingRate: 225, totalBilled: 29250, utilization: '81%', realization: '90%' },
      { attorney: 'Sarah Wilson', hours: 170, billableHours: 152, billingRate: 300, totalBilled: 45600, utilization: '89%', realization: '94%' }
    ];
  }

  /**
   * Get data for billing reports
   */
  private async getBillingReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run SQL queries
    // to generate the billing report data
    return [
      { period: 'Jan 2025', invoiced: 52000, paid: 44200, outstanding: 7800, aging30: 5200, aging60: 1600, aging90: 1000, collectionsRate: '85%' },
      { period: 'Feb 2025', invoiced: 58000, paid: 51040, outstanding: 6960, aging30: 4800, aging60: 1200, aging90: 960, collectionsRate: '88%' },
      { period: 'Mar 2025', invoiced: 55000, paid: 45100, outstanding: 9900, aging30: 6500, aging60: 2400, aging90: 1000, collectionsRate: '82%' },
      { period: 'Apr 2025', invoiced: 60000, paid: 54000, outstanding: 6000, aging30: 4800, aging60: 1200, aging90: 0, collectionsRate: '90%' }
    ];
  }

  /**
   * Get data for matter reports
   */
  private async getMatterReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run SQL queries
    // to generate the matter report data
    return [
      { matterNumber: 'M20250001', client: 'Acme Corp', matterType: 'Corporate', status: 'Open', openDate: new Date(2025, 0, 15), attorney: 'John Smith', totalBilled: 25000, outstanding: 5000 },
      { matterNumber: 'M20250002', client: 'Beta LLC', matterType: 'Litigation', status: 'Open', openDate: new Date(2025, 1, 10), attorney: 'Jane Doe', totalBilled: 32000, outstanding: 8000 },
      { matterNumber: 'M20250003', client: 'Gamma Inc', matterType: 'Real Estate', status: 'Closed', openDate: new Date(2025, 1, 20), attorney: 'Robert Brown', totalBilled: 15000, outstanding: 0 },
      { matterNumber: 'M20250004', client: 'Delta SA', matterType: 'IP', status: 'Pending', openDate: new Date(2025, 2, 5), attorney: 'Sarah Wilson', totalBilled: 18000, outstanding: 4500 },
      { matterNumber: 'M20250005', client: 'Epsilon GmbH', matterType: 'Employment', status: 'Open', openDate: new Date(2025, 2, 15), attorney: 'John Smith', totalBilled: 9500, outstanding: 3000 }
    ];
  }

  /**
   * Get data for client reports
   */
  private async getClientReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run SQL queries
    // to generate the client report data
    return [
      { clientId: 'C10001', name: 'Acme Corp', type: 'Corporate', openMatters: 3, totalBilled: 45000, outstanding: 9500, lastActivity: new Date(2025, 3, 1) },
      { clientId: 'C10002', name: 'Beta LLC', type: 'Corporate', openMatters: 2, totalBilled: 32000, outstanding: 8000, lastActivity: new Date(2025, 3, 5) },
      { clientId: 'C10003', name: 'Gamma Inc', type: 'Individual', openMatters: 1, totalBilled: 15000, outstanding: 0, lastActivity: new Date(2025, 2, 20) },
      { clientId: 'C10004', name: 'Delta SA', type: 'International', openMatters: 4, totalBilled: 65000, outstanding: 12500, lastActivity: new Date(2025, 3, 8) },
      { clientId: 'C10005', name: 'Epsilon GmbH', type: 'International', openMatters: 2, totalBilled: 28000, outstanding: 7000, lastActivity: new Date(2025, 3, 10) }
    ];
  }

  /**
   * Get data for trust reports
   */
  private async getTrustReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run SQL queries
    // to generate the trust report data
    return [
      { accountId: 'T10001', accountType: 'IOLTA', balance: 45000, clientName: 'Acme Corp', deposits: 60000, withdrawals: 15000, lastActivity: new Date(2025, 3, 10) },
      { accountId: 'T10002', accountType: 'IOLTA', balance: 32000, clientName: 'Beta LLC', deposits: 40000, withdrawals: 8000, lastActivity: new Date(2025, 3, 5) },
      { accountId: 'T10003', accountType: 'Escrow', balance: 95000, clientName: 'Multiple Clients', deposits: 120000, withdrawals: 25000, lastActivity: new Date(2025, 3, 8) },
      { accountId: 'T10004', accountType: 'IOLTA', balance: 18000, clientName: 'Delta SA', deposits: 20000, withdrawals: 2000, lastActivity: new Date(2025, 3, 12) },
      { accountId: 'T10005', accountType: 'IOLTA', balance: 27000, clientName: 'Epsilon GmbH', deposits: 35000, withdrawals: 8000, lastActivity: new Date(2025, 3, 9) }
    ];
  }

  /**
   * Get data for expense reports
   */
  private async getExpenseReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run SQL queries
    // to generate the expense report data
    return [
      { expenseId: 'E20250001', type: 'Travel', amount: 1250, date: new Date(2025, 1, 15), attorney: 'John Smith', client: 'Acme Corp', matter: 'M20250001', billable: true, status: 'Billed' },
      { expenseId: 'E20250002', type: 'Filing Fees', amount: 350, date: new Date(2025, 2, 10), attorney: 'Jane Doe', client: 'Beta LLC', matter: 'M20250002', billable: true, status: 'Billed' },
      { expenseId: 'E20250003', type: 'Research', amount: 500, date: new Date(2025, 2, 20), attorney: 'Robert Brown', client: 'Gamma Inc', matter: 'M20250003', billable: true, status: 'Billed' },
      { expenseId: 'E20250004', type: 'Expert Witness', amount: 3000, date: new Date(2025, 3, 5), attorney: 'Sarah Wilson', client: 'Delta SA', matter: 'M20250004', billable: true, status: 'Unbilled' },
      { expenseId: 'E20250005', type: 'Office Supplies', amount: 150, date: new Date(2025, 3, 8), attorney: 'John Smith', client: null, matter: null, billable: false, status: 'Internal' }
    ];
  }

  /**
   * Get data for custom reports
   */
  private async getCustomReportData(parameters: ReportParameters): Promise<any[]> {
    // This is a placeholder - in a real implementation, this would run custom SQL queries
    // based on the parameters
    return [
      { customField1: 'Value 1', customField2: 'Value 2', customField3: 100, customField4: new Date(2025, 3, 10) },
      { customField1: 'Value 5', customField2: 'Value 6', customField3: 200, customField4: new Date(2025, 3, 11) },
      { customField1: 'Value 9', customField2: 'Value 10', customField3: 300, customField4: new Date(2025, 3, 12) }
    ];
  }
}

export const legalReportingService = new LegalReportingService();