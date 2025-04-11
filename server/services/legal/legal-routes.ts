/**
 * Register all legal payment features routes
 */

import type { Express, Request, Response, NextFunction } from "express";
import { legalReportingService } from "./reporting-service";

/**
 * Helper to ensure user is authenticated
 */
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized - Login required" });
};

/**
 * Helper to ensure user belongs to the merchant
 */
const ensureLegalMerchant = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized - Login required" });
  }

  // In a real implementation, you'd check if the user belongs to the merchant
  // and has appropriate permissions. For now, we're just checking if authenticated.
  next();
};

export function registerLegalRoutes(app: Express) {
  /**
   * Legal Report Definitions Routes
   */
  
  // Create a new report definition
  app.post("/api/legal/report-definitions", ensureLegalMerchant, async (req, res) => {
    try {
      // Add the merchant ID and created by ID from the authenticated user
      const data = {
        ...req.body,
        merchantId: req.user.merchantId,
        createdById: req.user.id
      };
      
      const reportDefinition = await legalReportingService.createReportDefinition(data);
      res.status(201).json(reportDefinition);
    } catch (error) {
      console.error("Error creating report definition:", error);
      res.status(500).json({ error: "Failed to create report definition" });
    }
  });
  
  // Get all report definitions for the merchant
  app.get("/api/legal/report-definitions", ensureLegalMerchant, async (req, res) => {
    try {
      const reportDefinitions = await legalReportingService.getReportDefinitions(req.user.merchantId);
      res.status(200).json(reportDefinitions);
    } catch (error) {
      console.error("Error getting report definitions:", error);
      res.status(500).json({ error: "Failed to retrieve report definitions" });
    }
  });
  
  // Get a specific report definition by ID
  app.get("/api/legal/report-definitions/:id", ensureLegalMerchant, async (req, res) => {
    try {
      const reportDefinition = await legalReportingService.getReportDefinitionById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant
      if (!reportDefinition || reportDefinition.merchantId !== req.user.merchantId) {
        return res.status(404).json({ error: "Report definition not found" });
      }
      
      res.status(200).json(reportDefinition);
    } catch (error) {
      console.error("Error getting report definition:", error);
      res.status(500).json({ error: "Failed to retrieve report definition" });
    }
  });
  
  // Update a report definition
  app.patch("/api/legal/report-definitions/:id", ensureLegalMerchant, async (req, res) => {
    try {
      const reportDefinition = await legalReportingService.getReportDefinitionById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant
      if (!reportDefinition || reportDefinition.merchantId !== req.user.merchantId) {
        return res.status(404).json({ error: "Report definition not found" });
      }
      
      const updatedDefinition = await legalReportingService.updateReportDefinition(
        parseInt(req.params.id),
        req.body
      );
      
      res.status(200).json(updatedDefinition);
    } catch (error) {
      console.error("Error updating report definition:", error);
      res.status(500).json({ error: "Failed to update report definition" });
    }
  });
  
  // Delete a report definition
  app.delete("/api/legal/report-definitions/:id", ensureLegalMerchant, async (req, res) => {
    try {
      const reportDefinition = await legalReportingService.getReportDefinitionById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant
      if (!reportDefinition || reportDefinition.merchantId !== req.user.merchantId) {
        return res.status(404).json({ error: "Report definition not found" });
      }
      
      await legalReportingService.deleteReportDefinition(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting report definition:", error);
      res.status(500).json({ error: "Failed to delete report definition" });
    }
  });
  
  /**
   * Scheduled Reports Routes
   */
  
  // Schedule a report
  app.post("/api/legal/scheduled-reports", ensureLegalMerchant, async (req, res) => {
    try {
      // Add the merchant ID and created by ID from the authenticated user
      const data = {
        ...req.body,
        merchantId: req.user.merchantId,
        createdById: req.user.id
      };
      
      const scheduledReport = await legalReportingService.scheduleReport(data);
      res.status(201).json(scheduledReport);
    } catch (error) {
      console.error("Error scheduling report:", error);
      res.status(500).json({ error: "Failed to schedule report" });
    }
  });
  
  // Get all scheduled reports for the merchant
  app.get("/api/legal/scheduled-reports", ensureLegalMerchant, async (req, res) => {
    try {
      const scheduledReports = await legalReportingService.getScheduledReports(req.user.merchantId);
      res.status(200).json(scheduledReports);
    } catch (error) {
      console.error("Error getting scheduled reports:", error);
      res.status(500).json({ error: "Failed to retrieve scheduled reports" });
    }
  });
  
  // Get a specific scheduled report by ID
  app.get("/api/legal/scheduled-reports/:id", ensureLegalMerchant, async (req, res) => {
    try {
      const scheduledReport = await legalReportingService.getScheduledReportById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant
      if (!scheduledReport || scheduledReport.merchantId !== req.user.merchantId) {
        return res.status(404).json({ error: "Scheduled report not found" });
      }
      
      res.status(200).json(scheduledReport);
    } catch (error) {
      console.error("Error getting scheduled report:", error);
      res.status(500).json({ error: "Failed to retrieve scheduled report" });
    }
  });
  
  // Update a scheduled report
  app.patch("/api/legal/scheduled-reports/:id", ensureLegalMerchant, async (req, res) => {
    try {
      const scheduledReport = await legalReportingService.getScheduledReportById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant
      if (!scheduledReport || scheduledReport.merchantId !== req.user.merchantId) {
        return res.status(404).json({ error: "Scheduled report not found" });
      }
      
      const updatedReport = await legalReportingService.updateScheduledReport(
        parseInt(req.params.id),
        req.body
      );
      
      res.status(200).json(updatedReport);
    } catch (error) {
      console.error("Error updating scheduled report:", error);
      res.status(500).json({ error: "Failed to update scheduled report" });
    }
  });
  
  // Delete a scheduled report
  app.delete("/api/legal/scheduled-reports/:id", ensureLegalMerchant, async (req, res) => {
    try {
      const scheduledReport = await legalReportingService.getScheduledReportById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant
      if (!scheduledReport || scheduledReport.merchantId !== req.user.merchantId) {
        return res.status(404).json({ error: "Scheduled report not found" });
      }
      
      await legalReportingService.deleteScheduledReport(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scheduled report:", error);
      res.status(500).json({ error: "Failed to delete scheduled report" });
    }
  });
  
  // Process due reports (could be triggered by a cron job in production)
  app.post("/api/legal/process-due-reports", ensureAuthenticated, async (req, res) => {
    try {
      // In production, you might want to restrict this to admin users
      // or have it triggered by a cron job instead of an API endpoint
      
      const results = await legalReportingService.processDueReports();
      res.status(200).json(results);
    } catch (error) {
      console.error("Error processing due reports:", error);
      res.status(500).json({ error: "Failed to process due reports" });
    }
  });
  
  /**
   * Report Generation Routes
   */
  
  // Generate a report
  app.post("/api/legal/generate-report", ensureLegalMerchant, async (req, res) => {
    try {
      const { reportDefinitionId, ...parameters } = req.body;
      
      if (!reportDefinitionId) {
        return res.status(400).json({ error: "Report definition ID is required" });
      }
      
      const reportDefinition = await legalReportingService.getReportDefinitionById(reportDefinitionId);
      
      // Check if the report definition belongs to the merchant
      if (!reportDefinition || reportDefinition.merchantId !== req.user.merchantId) {
        return res.status(404).json({ error: "Report definition not found" });
      }
      
      const generatedReport = await legalReportingService.generateReport(
        reportDefinitionId,
        parameters,
        req.user.id
      );
      
      res.status(201).json(generatedReport);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });
  
  // Get all generated reports for the merchant
  app.get("/api/legal/generated-reports", ensureLegalMerchant, async (req, res) => {
    try {
      const generatedReports = await legalReportingService.getGeneratedReports(req.user.merchantId);
      res.status(200).json(generatedReports);
    } catch (error) {
      console.error("Error getting generated reports:", error);
      res.status(500).json({ error: "Failed to retrieve generated reports" });
    }
  });
  
  // Get a specific generated report by ID
  app.get("/api/legal/generated-reports/:id", ensureLegalMerchant, async (req, res) => {
    try {
      const generatedReport = await legalReportingService.getGeneratedReportById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant or is public
      if (!generatedReport || 
          (generatedReport.merchantId !== req.user.merchantId && !generatedReport.isPublic)) {
        return res.status(404).json({ error: "Generated report not found" });
      }
      
      res.status(200).json(generatedReport);
    } catch (error) {
      console.error("Error getting generated report:", error);
      res.status(500).json({ error: "Failed to retrieve generated report" });
    }
  });
  
  // Download a generated report
  app.get("/api/legal/generated-reports/:id/download", ensureLegalMerchant, async (req, res) => {
    try {
      const generatedReport = await legalReportingService.getGeneratedReportById(parseInt(req.params.id));
      
      // Check if the report belongs to the merchant or is public
      if (!generatedReport || 
          (generatedReport.merchantId !== req.user.merchantId && !generatedReport.isPublic)) {
        return res.status(404).json({ error: "Generated report not found" });
      }
      
      // Get the file path
      const filePath = legalReportingService.getReportFilePath(generatedReport.filePath);
      
      // Set the appropriate content type based on the report format
      let contentType = "application/octet-stream";
      switch (generatedReport.format) {
        case "pdf":
          contentType = "application/pdf";
          break;
        case "csv":
          contentType = "text/csv";
          break;
        case "excel":
          contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        case "json":
          contentType = "application/json";
          break;
        case "html":
          contentType = "text/html";
          break;
      }
      
      // Set the response headers
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${generatedReport.name.replace(/\s+/g, "_")}_${generatedReport.id}.${generatedReport.format}"`);
      
      // Send the file
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error downloading generated report:", error);
      res.status(500).json({ error: "Failed to download generated report" });
    }
  });
}