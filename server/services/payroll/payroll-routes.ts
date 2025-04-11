/**
 * PaySurity Payroll Routes
 * 
 * API routes for the payroll system including employee management,
 * payroll processing, tax calculations, and reporting.
 */

import { Express } from 'express';
import { payrollService } from './payroll-service';
import { taxCalculationService } from './tax-calculation-service';
import { z } from 'zod';
import { insertEmployeeSchema, insertPayrollRunSchema, insertPayrollEntrySchema } from '@shared/schema-employees';
import { insertTaxJurisdictionSchema } from '@shared/schema-payroll';
import { format } from 'date-fns';

/**
 * Register payroll routes
 */
export function registerPayrollRoutes(app: Express): void {
  // Base path for all payroll routes
  const basePath = '/api/payroll';

  // =====================================
  // Employee routes
  // =====================================

  // Get all employees for merchant
  app.get(`${basePath}/employees`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const merchantId = req.query.merchantId ? Number(req.query.merchantId) : req.user.merchantId;
      const employees = await payrollService.getEmployees(merchantId);
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get employee by ID
  app.get(`${basePath}/employees/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const employee = await payrollService.getEmployee(id);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create employee
  app.post(`${basePath}/employees`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request data
      const validatedData = insertEmployeeSchema.parse(req.body);
      
      // Create employee
      const employee = await payrollService.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid employee data', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update employee
  app.put(`${basePath}/employees/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const updatedEmployee = await payrollService.updateEmployee(id, req.body);

      if (!updatedEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete employee (mark as inactive)
  app.delete(`${basePath}/employees/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const success = await payrollService.deleteEmployee(id);

      if (!success) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // =====================================
  // Payroll run routes
  // =====================================

  // Get all payroll runs for merchant
  app.get(`${basePath}/runs`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const merchantId = req.query.merchantId ? Number(req.query.merchantId) : req.user.merchantId;
      const runs = await payrollService.getPayrollRuns(merchantId);
      res.json(runs);
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get payroll run by ID
  app.get(`${basePath}/runs/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const run = await payrollService.getPayrollRun(id);

      if (!run) {
        return res.status(404).json({ error: 'Payroll run not found' });
      }

      res.json(run);
    } catch (error) {
      console.error('Error fetching payroll run:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create payroll run
  app.post(`${basePath}/runs`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request data
      const validatedData = insertPayrollRunSchema.parse(req.body);
      
      // Create payroll run
      const run = await payrollService.createPayrollRun(validatedData);
      res.status(201).json(run);
    } catch (error) {
      console.error('Error creating payroll run:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid payroll run data', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Generate a new payroll run
  app.post(`${basePath}/runs/generate`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { merchantId, payrollPeriodStart, payrollPeriodEnd, payDate, payFrequency } = req.body;

      // Validate required fields
      if (!merchantId || !payrollPeriodStart || !payrollPeriodEnd || !payDate || !payFrequency) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate payroll run
      const run = await payrollService.generatePayrollRun(
        Number(merchantId),
        new Date(payrollPeriodStart),
        new Date(payrollPeriodEnd),
        new Date(payDate),
        payFrequency,
        req.user.id
      );

      res.status(201).json(run);
    } catch (error) {
      console.error('Error generating payroll run:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Process a payroll run
  app.post(`${basePath}/runs/:id/process`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const processedRun = await payrollService.processPayrollRun(id);

      res.json(processedRun);
    } catch (error) {
      console.error('Error processing payroll run:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update payroll run
  app.put(`${basePath}/runs/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const updatedRun = await payrollService.updatePayrollRun(id, req.body);

      if (!updatedRun) {
        return res.status(404).json({ error: 'Payroll run not found' });
      }

      res.json(updatedRun);
    } catch (error) {
      console.error('Error updating payroll run:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete payroll run
  app.delete(`${basePath}/runs/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const success = await payrollService.deletePayrollRun(id);

      if (!success) {
        return res.status(404).json({ error: 'Payroll run not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting payroll run:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // =====================================
  // Payroll entry routes
  // =====================================

  // Get payroll entries for a run
  app.get(`${basePath}/runs/:runId/entries`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const runId = Number(req.params.runId);
      const entries = await payrollService.getPayrollEntries(runId);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching payroll entries:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get payroll entry by ID
  app.get(`${basePath}/entries/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const entry = await payrollService.getPayrollEntry(id);

      if (!entry) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }

      res.json(entry);
    } catch (error) {
      console.error('Error fetching payroll entry:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create payroll entry
  app.post(`${basePath}/entries`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request data
      const validatedData = insertPayrollEntrySchema.parse(req.body);
      
      // Create payroll entry
      const entry = await payrollService.createPayrollEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error('Error creating payroll entry:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid payroll entry data', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update payroll entry
  app.put(`${basePath}/entries/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const updatedEntry = await payrollService.updatePayrollEntry(id, req.body);

      if (!updatedEntry) {
        return res.status(404).json({ error: 'Payroll entry not found' });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error('Error updating payroll entry:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Calculate taxes for a payroll entry
  app.post(`${basePath}/entries/:id/calculate-taxes`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const updatedEntry = await payrollService.calculatePayrollEntryTaxes(id);

      res.json(updatedEntry);
    } catch (error) {
      console.error('Error calculating taxes for payroll entry:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // =====================================
  // Tax jurisdiction routes
  // =====================================

  // Get all tax jurisdictions
  app.get(`${basePath}/tax-jurisdictions`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implement logic to fetch tax jurisdictions
      // This would typically call into the tax calculation service
      res.json([]);
    } catch (error) {
      console.error('Error fetching tax jurisdictions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create tax jurisdiction
  app.post(`${basePath}/tax-jurisdictions`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request data
      const validatedData = insertTaxJurisdictionSchema.parse(req.body);
      
      // Implement logic to create tax jurisdiction
      // This would typically call into the tax calculation service
      res.status(201).json({ message: 'Not implemented yet' });
    } catch (error) {
      console.error('Error creating tax jurisdiction:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid tax jurisdiction data', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // =====================================
  // Payroll pricing routes
  // =====================================

  // Get current payroll pricing
  app.get(`${basePath}/pricing`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // For now, we'll return hardcoded pricing data
      // In a real implementation, this would come from a database
      const pricing = {
        basePricing: {
          monthly: 15.00,
          perEmployee: 3.00
        },
        globalPayroll: {
          perEmployee: 8.00
        },
        contractorManagement: {
          freeContractors: 10,
          perContractorAfterFree: 1.00
        },
        onDemandPay: {
          perTransaction: 0.50
        }
      };

      res.json(pricing);
    } catch (error) {
      console.error('Error fetching payroll pricing:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update payroll pricing
  app.put(`${basePath}/pricing`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user has admin privileges
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // In a real implementation, this would update pricing in the database
      // For now, we'll just return success
      res.json({ 
        success: true,
        message: 'Pricing updated successfully',
        pricing: req.body
      });
    } catch (error) {
      console.error('Error updating payroll pricing:', error);
      res.status(500).json({ error: error.message });
    }
  });
}