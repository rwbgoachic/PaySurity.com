import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { storage } from "../storage";
import crypto from "crypto";

export class DocumentationService {
  // Document Version Management
  async getDocumentVersions(): Promise<any[]> {
    try {
      const versions = await db.select().from(schema.documentVersions)
        .orderBy(desc(schema.documentVersions.createdAt));
      return versions;
    } catch (error) {
      console.error("Error fetching document versions:", error);
      return [];
    }
  }

  async createDocumentVersion(version: any): Promise<any> {
    try {
      const [newVersion] = await db.insert(schema.documentVersions)
        .values({
          ...version,
          createdAt: new Date(),
        })
        .returning();
      return newVersion;
    } catch (error) {
      console.error("Error creating document version:", error);
      throw error;
    }
  }

  // Document Section Management
  async getDocumentSections(documentType: string): Promise<any[]> {
    try {
      const sections = await db.select().from(schema.documentSections)
        .where(eq(schema.documentSections.documentType, documentType))
        .orderBy(schema.documentSections.order);
      return sections;
    } catch (error) {
      console.error(`Error fetching ${documentType} sections:`, error);
      return [];
    }
  }

  async updateDocumentSection(id: number, content: string, userId: number): Promise<any> {
    try {
      // First, archive the current version
      const currentSection = await db.select().from(schema.documentSections)
        .where(eq(schema.documentSections.id, id))
        .limit(1);
      
      if (currentSection.length > 0) {
        await db.insert(schema.documentVersions).values({
          documentId: id,
          documentType: currentSection[0].documentType,
          title: currentSection[0].title,
          content: currentSection[0].content,
          updatedBy: userId,
          createdAt: new Date(),
          changeDescription: `Updated ${currentSection[0].title} section`
        });
        
        // Now update the section
        const [updatedSection] = await db.update(schema.documentSections)
          .set({
            content,
            updatedAt: new Date(),
            updatedBy: userId
          })
          .where(eq(schema.documentSections.id, id))
          .returning();
        
        return updatedSection;
      }
      
      throw new Error("Section not found");
    } catch (error) {
      console.error("Error updating document section:", error);
      throw error;
    }
  }

  // Pending Tasks Management
  async getPendingTasks(): Promise<any[]> {
    try {
      const tasks = await db.select().from(schema.documentationTasks)
        .where(
          and(
            eq(schema.documentationTasks.isComplete, false),
            eq(schema.documentationTasks.isDeleted, false)
          )
        )
        .orderBy(schema.documentationTasks.priority, desc(schema.documentationTasks.createdAt));
      return tasks;
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      return [];
    }
  }

  async getTasksByStatus(status: string): Promise<any[]> {
    try {
      const tasks = await db.select().from(schema.documentationTasks)
        .where(
          and(
            eq(schema.documentationTasks.status, status),
            eq(schema.documentationTasks.isDeleted, false)
          )
        )
        .orderBy(schema.documentationTasks.priority, desc(schema.documentationTasks.createdAt));
      return tasks;
    } catch (error) {
      console.error(`Error fetching tasks with status ${status}:`, error);
      return [];
    }
  }

  async createTask(task: any): Promise<any> {
    try {
      const [newTask] = await db.insert(schema.documentationTasks)
        .values({
          ...task,
          isComplete: false,
          isDeleted: false,
          createdAt: new Date(),
        })
        .returning();
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTaskStatus(id: number, status: string, userId: number): Promise<any> {
    try {
      const [updatedTask] = await db.update(schema.documentationTasks)
        .set({
          status,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(eq(schema.documentationTasks.id, id))
        .returning();
      return updatedTask;
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  }

  async completeTask(id: number, userId: number): Promise<any> {
    try {
      const [completedTask] = await db.update(schema.documentationTasks)
        .set({
          isComplete: true,
          completedAt: new Date(),
          completedBy: userId,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(eq(schema.documentationTasks.id, id))
        .returning();
      return completedTask;
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  }

  // Report Definitions Management
  async getReportDefinitions(): Promise<any[]> {
    try {
      const reports = await db.select().from(schema.reportDefinitions)
        .orderBy(schema.reportDefinitions.category, schema.reportDefinitions.name);
      return reports;
    } catch (error) {
      console.error("Error fetching report definitions:", error);
      return [];
    }
  }

  async createReportDefinition(report: any): Promise<any> {
    try {
      const [newReport] = await db.insert(schema.reportDefinitions)
        .values({
          ...report,
          createdAt: new Date(),
        })
        .returning();
      return newReport;
    } catch (error) {
      console.error("Error creating report definition:", error);
      throw error;
    }
  }

  // Commission Structure Management
  async getCommissionStructures(type?: string): Promise<any[]> {
    try {
      let query = db.select().from(schema.commissionStructures);
      
      if (type) {
        query = query.where(eq(schema.commissionStructures.type, type));
      }
      
      const structures = await query.orderBy(schema.commissionStructures.name);
      
      // For each structure, fetch the milestones
      for (const structure of structures) {
        const milestones = await db.select().from(schema.commissionMilestones)
          .where(eq(schema.commissionMilestones.structureId, structure.id))
          .orderBy(schema.commissionMilestones.days);
        
        structure.milestones = milestones;
      }
      
      return structures;
    } catch (error) {
      console.error("Error fetching commission structures:", error);
      return [];
    }
  }

  // Excel Export Helper
  async generateExcelExport(): Promise<{ url: string }> {
    try {
      // In a real implementation, this would generate an Excel file using a library
      // For this prototype, we'll simulate the process
      
      // Generate a unique ID for this export
      const exportId = crypto.randomUUID();
      
      // In a real implementation, you would:
      // 1. Fetch all documentation data
      // 2. Use a library like xlsx or exceljs to create the Excel file
      // 3. Save it to storage or upload to a cloud service
      // 4. Return the URL to access the file
      
      return {
        url: `/api/documentation/download/${exportId}`
      };
    } catch (error) {
      console.error("Error generating Excel export:", error);
      throw error;
    }
  }
}

export const documentationService = new DocumentationService();