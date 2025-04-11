/**
 * PaySurity Payroll Pricing Service
 * 
 * This service manages payroll pricing including standard pricing tiers,
 * custom merchant pricing, and feature availability.
 */

import { db } from '../../db';
import { eq, and, lte, gte, desc, isNull } from 'drizzle-orm';
import {
  payrollPricing,
  merchantPayrollPricing,
  payrollPricingFeatures,
  payrollPricingFeatureAvailability,
  PayrollPricing,
  MerchantPayrollPricing,
  PayrollPricingFeature,
  PayrollPricingFeatureAvailability
} from '@shared/schema-payroll-pricing';

/**
 * Payroll Pricing Service class
 */
export class PayrollPricingService {
  /**
   * Get all standard pricing tiers
   */
  async getStandardPricingTiers(): Promise<PayrollPricing[]> {
    return db
      .select()
      .from(payrollPricing)
      .where(eq(payrollPricing.isActive, true))
      .orderBy(payrollPricing.basePrice);
  }

  /**
   * Get a specific standard pricing tier
   */
  async getStandardPricingTier(id: number): Promise<PayrollPricing | undefined> {
    const [tier] = await db
      .select()
      .from(payrollPricing)
      .where(eq(payrollPricing.id, id));
    
    return tier;
  }

  /**
   * Create a new standard pricing tier
   */
  async createStandardPricingTier(data: Omit<PayrollPricing, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollPricing> {
    const [tier] = await db
      .insert(payrollPricing)
      .values(data)
      .returning();
    
    return tier;
  }

  /**
   * Update a standard pricing tier
   */
  async updateStandardPricingTier(id: number, data: Partial<Omit<PayrollPricing, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PayrollPricing> {
    const [tier] = await db
      .update(payrollPricing)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payrollPricing.id, id))
      .returning();
    
    return tier;
  }

  /**
   * Delete a standard pricing tier (mark as inactive)
   */
  async deleteStandardPricingTier(id: number): Promise<boolean> {
    await db
      .update(payrollPricing)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(payrollPricing.id, id));
    
    return true;
  }

  /**
   * Get merchant-specific pricing
   */
  async getMerchantPricing(merchantId: number): Promise<MerchantPayrollPricing | undefined> {
    const [pricing] = await db
      .select()
      .from(merchantPayrollPricing)
      .where(eq(merchantPayrollPricing.merchantId, merchantId));
    
    return pricing;
  }

  /**
   * Create or update merchant-specific pricing
   */
  async setMerchantPricing(merchantId: number, data: Partial<Omit<MerchantPayrollPricing, 'id' | 'merchantId' | 'createdAt' | 'updatedAt'>>): Promise<MerchantPayrollPricing> {
    // Check if merchant already has custom pricing
    const existingPricing = await this.getMerchantPricing(merchantId);
    
    if (existingPricing) {
      // Update existing pricing
      const [updatedPricing] = await db
        .update(merchantPayrollPricing)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(merchantPayrollPricing.id, existingPricing.id))
        .returning();
      
      return updatedPricing;
    } else {
      // Create new pricing
      const [newPricing] = await db
        .insert(merchantPayrollPricing)
        .values({ merchantId, ...data })
        .returning();
      
      return newPricing;
    }
  }

  /**
   * Delete merchant-specific pricing
   */
  async deleteMerchantPricing(merchantId: number): Promise<boolean> {
    await db
      .update(merchantPayrollPricing)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(merchantPayrollPricing.merchantId, merchantId));
    
    return true;
  }

  /**
   * Get all pricing features
   */
  async getPricingFeatures(): Promise<PayrollPricingFeature[]> {
    return db
      .select()
      .from(payrollPricingFeatures)
      .orderBy(payrollPricingFeatures.category, payrollPricingFeatures.name);
  }

  /**
   * Create a new pricing feature
   */
  async createPricingFeature(data: Omit<PayrollPricingFeature, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollPricingFeature> {
    const [feature] = await db
      .insert(payrollPricingFeatures)
      .values(data)
      .returning();
    
    return feature;
  }

  /**
   * Get features for a specific pricing tier
   */
  async getPricingTierFeatures(pricingId: number): Promise<(PayrollPricingFeatureAvailability & { feature: PayrollPricingFeature })[]> {
    // This would typically use a join query
    // For simplicity, we'll fetch feature availability and features separately
    const availabilities = await db
      .select()
      .from(payrollPricingFeatureAvailability)
      .where(eq(payrollPricingFeatureAvailability.pricingId, pricingId));
    
    const features = await db
      .select()
      .from(payrollPricingFeatures);
    
    // Combine feature availability with feature details
    return availabilities.map(availability => {
      const feature = features.find(f => f.id === availability.featureId);
      return {
        ...availability,
        feature: feature!
      };
    });
  }

  /**
   * Set feature availability for a pricing tier
   */
  async setFeatureAvailability(
    pricingId: number,
    featureId: number,
    data: Partial<Omit<PayrollPricingFeatureAvailability, 'id' | 'pricingId' | 'featureId' | 'createdAt' | 'updatedAt'>>
  ): Promise<PayrollPricingFeatureAvailability> {
    // Check if a record already exists
    const [existingAvailability] = await db
      .select()
      .from(payrollPricingFeatureAvailability)
      .where(
        and(
          eq(payrollPricingFeatureAvailability.pricingId, pricingId),
          eq(payrollPricingFeatureAvailability.featureId, featureId)
        )
      );
    
    if (existingAvailability) {
      // Update existing record
      const [updated] = await db
        .update(payrollPricingFeatureAvailability)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(payrollPricingFeatureAvailability.id, existingAvailability.id))
        .returning();
      
      return updated;
    } else {
      // Create new record
      const [newAvailability] = await db
        .insert(payrollPricingFeatureAvailability)
        .values({
          pricingId,
          featureId,
          ...data
        })
        .returning();
      
      return newAvailability;
    }
  }

  /**
   * Calculate price for a merchant based on their pricing tier and employees/contractors
   */
  async calculatePrice(
    merchantId: number,
    employees: number,
    contractors: number,
    globalEmployees: number = 0,
    additionalOptions: Record<string, any> = {}
  ): Promise<{
    basePrice: number;
    perEmployeePrice: number;
    totalEmployeesCost: number;
    perContractorPrice: number;
    totalContractorsCost: number;
    globalEmployeesCost: number;
    additionalCosts: Record<string, number>;
    discountAmount: number;
    totalPrice: number;
  }> {
    // Get merchant-specific pricing if available
    const merchantPricing = await this.getMerchantPricing(merchantId);
    
    let basePrice = 0;
    let perEmployeePrice = 0;
    let perContractorPrice = 0;
    let freeContractors = 0;
    let globalPayrollPerEmployeePrice = 0;
    let discountPercentage = 0;
    
    if (merchantPricing && merchantPricing.isActive) {
      // Use merchant-specific pricing if available
      if (merchantPricing.basePricingId) {
        // Based on a standard tier with customizations
        const baseTier = await this.getStandardPricingTier(merchantPricing.basePricingId);
        
        if (baseTier) {
          basePrice = parseFloat(merchantPricing.customBasePrice?.toString() ?? baseTier.basePrice.toString());
          perEmployeePrice = parseFloat(merchantPricing.customPerEmployeePrice?.toString() ?? baseTier.perEmployeePrice.toString());
          perContractorPrice = parseFloat(merchantPricing.customPerContractorPrice?.toString() ?? baseTier.perContractorPrice?.toString() ?? '0');
          freeContractors = merchantPricing.customFreeContractors ?? baseTier.freeContractors ?? 0;
          globalPayrollPerEmployeePrice = parseFloat(merchantPricing.customGlobalPayrollPerEmployeePrice?.toString() ?? baseTier.globalPayrollPerEmployeePrice?.toString() ?? '0');
        }
      } else {
        // Fully custom pricing
        basePrice = parseFloat(merchantPricing.customBasePrice?.toString() ?? '15.00');
        perEmployeePrice = parseFloat(merchantPricing.customPerEmployeePrice?.toString() ?? '3.00');
        perContractorPrice = parseFloat(merchantPricing.customPerContractorPrice?.toString() ?? '1.00');
        freeContractors = merchantPricing.customFreeContractors ?? 10;
        globalPayrollPerEmployeePrice = parseFloat(merchantPricing.customGlobalPayrollPerEmployeePrice?.toString() ?? '8.00');
      }

      // Apply merchant-specific discount
      discountPercentage = parseFloat(merchantPricing.discountPercentage?.toString() ?? '0');
      
      // Check if discount is currently active
      if (discountPercentage > 0 && merchantPricing.discountStartDate && merchantPricing.discountEndDate) {
        const now = new Date();
        if (now < merchantPricing.discountStartDate || now > merchantPricing.discountEndDate) {
          discountPercentage = 0;
        }
      }
    } else {
      // Use default pricing
      const defaultTier = await db
        .select()
        .from(payrollPricing)
        .where(eq(payrollPricing.tier, 'starter'))
        .limit(1);
      
      if (defaultTier.length > 0) {
        basePrice = parseFloat(defaultTier[0].basePrice.toString());
        perEmployeePrice = parseFloat(defaultTier[0].perEmployeePrice.toString());
        perContractorPrice = parseFloat(defaultTier[0].perContractorPrice?.toString() ?? '1.00');
        freeContractors = defaultTier[0].freeContractors ?? 10;
        globalPayrollPerEmployeePrice = parseFloat(defaultTier[0].globalPayrollPerEmployeePrice?.toString() ?? '8.00');
      } else {
        // Fallback to hardcoded default pricing
        basePrice = 15.00;
        perEmployeePrice = 3.00;
        perContractorPrice = 1.00;
        freeContractors = 10;
        globalPayrollPerEmployeePrice = 8.00;
      }
    }

    // Calculate costs
    const totalEmployeesCost = employees * perEmployeePrice;
    
    // Calculate contractor cost (first N are free)
    const paidContractors = Math.max(0, contractors - freeContractors);
    const totalContractorsCost = paidContractors * perContractorPrice;
    
    // Calculate global employees cost
    const globalEmployeesCost = globalEmployees * globalPayrollPerEmployeePrice;
    
    // Calculate additional costs
    const additionalCosts: Record<string, number> = {};
    // This would be where we calculate costs for additional options
    
    // Calculate discount
    const subtotal = basePrice + totalEmployeesCost + totalContractorsCost + globalEmployeesCost + 
                    Object.values(additionalCosts).reduce((sum, cost) => sum + cost, 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    
    // Calculate total
    const totalPrice = subtotal - discountAmount;
    
    return {
      basePrice,
      perEmployeePrice,
      totalEmployeesCost,
      perContractorPrice,
      totalContractorsCost,
      globalEmployeesCost,
      additionalCosts,
      discountAmount,
      totalPrice
    };
  }
}

// Export an instance of the service
export const payrollPricingService = new PayrollPricingService();