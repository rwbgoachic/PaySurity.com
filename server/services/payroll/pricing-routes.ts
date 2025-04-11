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
  // Initialization and setup routes
  // =====================================

  // Initialize default pricing tiers and features based on our pricing strategy
  app.post(`${basePath}/initialize-defaults`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user has admin privileges
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Initialize standard pricing tiers based on our competitive pricing strategy
      const starterTier = await payrollPricingService.createStandardPricingTier({
        tier: 'starter',
        name: 'Basic Payroll',
        description: 'Affordable payroll processing with no hidden fees',
        basePrice: '15.00',
        perEmployeePrice: '3.00',
        perContractorPrice: '1.00',
        freeContractors: 10,
        globalPayrollPerEmployeePrice: '8.00',
        onDemandPayFee: '0.50',
        minEmployees: 1,
        maxEmployees: 50,
        isActive: true,
        features: {
          includedFeatures: ['basic_payroll', 'tax_compliance', 'direct_deposit', 'customer_support']
        }
      });

      const professionalTier = await payrollPricingService.createStandardPricingTier({
        tier: 'professional',
        name: 'Professional Payroll',
        description: 'Complete payroll solution with HR tools for growing businesses',
        basePrice: '25.00',
        perEmployeePrice: '4.00',
        perContractorPrice: '1.00',
        freeContractors: 10,
        globalPayrollPerEmployeePrice: '8.00',
        onDemandPayFee: '0.50',
        minEmployees: 10,
        maxEmployees: 100,
        isActive: true,
        features: {
          includedFeatures: [
            'basic_payroll', 
            'tax_compliance', 
            'direct_deposit', 
            'customer_support',
            'hr_tools',
            'time_tracking',
            'global_payroll'
          ]
        }
      });

      const enterpriseTier = await payrollPricingService.createStandardPricingTier({
        tier: 'enterprise',
        name: 'Enterprise Payroll',
        description: 'Full-featured payroll and HR solution for larger organizations',
        basePrice: '40.00',
        perEmployeePrice: '5.00',
        perContractorPrice: '1.00',
        freeContractors: 25,
        globalPayrollPerEmployeePrice: '7.00',
        onDemandPayFee: '0.00',
        minEmployees: 50,
        isActive: true,
        features: {
          includedFeatures: [
            'basic_payroll', 
            'tax_compliance', 
            'direct_deposit', 
            'customer_support',
            'hr_tools',
            'time_tracking',
            'global_payroll',
            'advanced_hr',
            'benefits_administration',
            'on_demand_pay',
            'analytics'
          ]
        }
      });

      // Initialize standard features
      const features = [
        {
          name: 'Basic Payroll Processing',
          description: 'Calculate wages, taxes, and deductions',
          category: 'core',
          isStandard: true
        },
        {
          name: 'Tax Compliance',
          description: 'Automated filings (all 50 U.S. states + international)',
          category: 'compliance',
          isStandard: true
        },
        {
          name: 'Direct Deposit',
          description: 'Automatic payroll deposits to employee bank accounts',
          category: 'payments',
          isStandard: true
        },
        {
          name: 'Customer Support',
          description: '24/7 live chat + dedicated account manager',
          category: 'service',
          isStandard: true
        },
        {
          name: 'HR Tools',
          description: 'Basic HR suite (PTO tracking, onboarding, e-signatures)',
          category: 'hr',
          isStandard: false
        },
        {
          name: 'Time Tracking',
          description: 'Track employee hours and overtime',
          category: 'core',
          isStandard: false
        },
        {
          name: 'Global Payroll',
          description: 'Process payroll for international employees (100+ countries)',
          category: 'international',
          isStandard: false
        },
        {
          name: 'Advanced HR',
          description: 'Complete HR management tools and reporting',
          category: 'hr',
          isStandard: false
        },
        {
          name: 'Benefits Administration',
          description: 'Manage and administer employee benefits',
          category: 'hr',
          isStandard: false
        },
        {
          name: 'On-Demand Pay',
          description: 'Allow employees to access earned wages before payday',
          category: 'advanced',
          isStandard: false
        },
        {
          name: 'Analytics',
          description: 'Advanced payroll analytics and insights',
          category: 'advanced',
          isStandard: false
        },
        {
          name: 'Contractor Management',
          description: 'Manage contractors and generate 1099s',
          category: 'core',
          isStandard: true
        },
      ];

      // Create all features and track the created features
      const createdFeatures = [];
      for (const feature of features) {
        const created = await payrollPricingService.createPricingFeature(feature);
        createdFeatures.push(created);
      }

      // Create associations between tiers and features
      // This would involve more complex logic to maintain the feature availability records

      res.json({ 
        success: true, 
        message: 'Default pricing tiers and features initialized successfully',
        tiers: [starterTier, professionalTier, enterpriseTier],
        features: createdFeatures
      });
    } catch (error) {
      console.error('Error initializing default pricing:', error);
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