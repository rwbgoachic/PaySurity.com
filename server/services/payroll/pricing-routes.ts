/**
 * PaySurity Payroll Pricing Routes
 * 
 * API routes for managing payroll pricing tiers, features, and merchant-specific pricing.
 */

import { Express } from 'express';
import { payrollPricingService } from './pricing-service';
import {
  insertPayrollPricingSchema,
  insertMerchantPayrollPricingSchema,
  insertPayrollPricingFeaturesSchema,
  insertPayrollPricingFeatureAvailabilitySchema
} from '@shared/schema-payroll-pricing';

/**
 * Register payroll pricing routes
 */
export function registerPayrollPricingRoutes(app: Express): void {
  // Base path for all payroll pricing routes
  const basePath = '/api/payroll/pricing';

  // =====================================
  // Standard pricing tier routes
  // =====================================

  // Get all standard pricing tiers
  app.get(`${basePath}/tiers`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tiers = await payrollPricingService.getStandardPricingTiers();
      res.json(tiers);
    } catch (error) {
      console.error('Error fetching pricing tiers:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific standard pricing tier
  app.get(`${basePath}/tiers/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const tier = await payrollPricingService.getStandardPricingTier(id);

      if (!tier) {
        return res.status(404).json({ error: 'Pricing tier not found' });
      }

      res.json(tier);
    } catch (error) {
      console.error('Error fetching pricing tier:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new standard pricing tier
  app.post(`${basePath}/tiers`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user has admin privileges
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Validate request data
      const validatedData = insertPayrollPricingSchema.parse(req.body);
      
      // Create pricing tier
      const tier = await payrollPricingService.createStandardPricingTier(validatedData);
      res.status(201).json(tier);
    } catch (error) {
      console.error('Error creating pricing tier:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid pricing tier data', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update a standard pricing tier
  app.put(`${basePath}/tiers/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user has admin privileges
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const id = Number(req.params.id);
      const updatedTier = await payrollPricingService.updateStandardPricingTier(id, req.body);

      if (!updatedTier) {
        return res.status(404).json({ error: 'Pricing tier not found' });
      }

      res.json(updatedTier);
    } catch (error) {
      console.error('Error updating pricing tier:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a standard pricing tier
  app.delete(`${basePath}/tiers/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user has admin privileges
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const id = Number(req.params.id);
      const success = await payrollPricingService.deleteStandardPricingTier(id);

      if (!success) {
        return res.status(404).json({ error: 'Pricing tier not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting pricing tier:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // =====================================
  // Merchant pricing routes
  // =====================================

  // Get merchant-specific pricing
  app.get(`${basePath}/merchant/:merchantId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const merchantId = Number(req.params.merchantId);
      
      // Check if the user has permission to access this merchant's pricing
      if (req.user.merchantId !== merchantId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const pricing = await payrollPricingService.getMerchantPricing(merchantId);

      if (!pricing) {
        return res.status(404).json({ error: 'Merchant pricing not found' });
      }

      res.json(pricing);
    } catch (error) {
      console.error('Error fetching merchant pricing:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create or update merchant-specific pricing
  app.put(`${basePath}/merchant/:merchantId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const merchantId = Number(req.params.merchantId);
      
      // Check if the user has permission to modify this merchant's pricing
      if (req.user.merchantId !== merchantId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const pricing = await payrollPricingService.setMerchantPricing(merchantId, req.body);
      res.json(pricing);
    } catch (error) {
      console.error('Error updating merchant pricing:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete merchant-specific pricing
  app.delete(`${basePath}/merchant/:merchantId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const merchantId = Number(req.params.merchantId);
      
      // Check if the user has permission to delete this merchant's pricing
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const success = await payrollPricingService.deleteMerchantPricing(merchantId);

      if (!success) {
        return res.status(404).json({ error: 'Merchant pricing not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting merchant pricing:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // =====================================
  // Pricing features routes
  // =====================================

  // Get all pricing features
  app.get(`${basePath}/features`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const features = await payrollPricingService.getPricingFeatures();
      res.json(features);
    } catch (error) {
      console.error('Error fetching pricing features:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new pricing feature
  app.post(`${basePath}/features`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user has admin privileges
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Validate request data
      const validatedData = insertPayrollPricingFeaturesSchema.parse(req.body);
      
      // Create feature
      const feature = await payrollPricingService.createPricingFeature(validatedData);
      res.status(201).json(feature);
    } catch (error) {
      console.error('Error creating pricing feature:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid pricing feature data', details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get features for a specific pricing tier
  app.get(`${basePath}/tiers/:id/features`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = Number(req.params.id);
      const features = await payrollPricingService.getPricingTierFeatures(id);
      res.json(features);
    } catch (error) {
      console.error('Error fetching tier features:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Set feature availability for a pricing tier
  app.put(`${basePath}/tiers/:tierId/features/:featureId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user has admin privileges
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const tierId = Number(req.params.tierId);
      const featureId = Number(req.params.featureId);
      
      const availability = await payrollPricingService.setFeatureAvailability(
        tierId,
        featureId,
        req.body
      );
      
      res.json(availability);
    } catch (error) {
      console.error('Error setting feature availability:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // =====================================
  // Price calculation routes
  // =====================================

  // Calculate price for a merchant
  app.post(`${basePath}/calculate`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { 
        merchantId, 
        employees = 0, 
        contractors = 0, 
        globalEmployees = 0,
        additionalOptions = {}
      } = req.body;

      if (!merchantId) {
        return res.status(400).json({ error: 'Missing merchantId' });
      }
      
      // Check if the user has permission to calculate pricing for this merchant
      if (req.user.merchantId !== merchantId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const pricingDetails = await payrollPricingService.calculatePrice(
        Number(merchantId),
        Number(employees),
        Number(contractors),
        Number(globalEmployees),
        additionalOptions
      );
      
      res.json(pricingDetails);
    } catch (error) {
      console.error('Error calculating price:', error);
      res.status(500).json({ error: error.message });
    }
  });
}