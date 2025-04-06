import { 
  paymentGateways, 
  insertPaymentGatewaySchema, 
  PaymentGateway,
  helcimIntegrations,
  insertHelcimIntegrationSchema,
  InsertHelcimIntegration,
  HelcimIntegration
} from '@shared/schema';
import type { z } from 'zod';

// Define the InsertPaymentGateway type if not already available
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { createHelcimService, HelcimService } from './helcim';

/**
 * Service for managing payment gateway configurations
 */
export class PaymentGatewayService {
  /**
   * Get a payment gateway by ID
   */
  async getPaymentGateway(id: number): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    return gateway;
  }

  /**
   * Get all payment gateways for a merchant
   */
  async getMerchantPaymentGateways(merchantId: number): Promise<PaymentGateway[]> {
    return db.select().from(paymentGateways).where(eq(paymentGateways.merchantId, merchantId));
  }

  /**
   * Create a new payment gateway
   */
  async createPaymentGateway(data: InsertPaymentGateway): Promise<PaymentGateway> {
    const [gateway] = await db.insert(paymentGateways).values(data).returning();
    return gateway;
  }

  /**
   * Update a payment gateway
   */
  async updatePaymentGateway(id: number, data: Partial<InsertPaymentGateway>): Promise<PaymentGateway> {
    const [gateway] = await db
      .update(paymentGateways)
      .set(data)
      .where(eq(paymentGateways.id, id))
      .returning();
    
    return gateway;
  }

  /**
   * Delete a payment gateway
   */
  async deletePaymentGateway(id: number): Promise<void> {
    await db.delete(paymentGateways).where(eq(paymentGateways.id, id));
  }

  /**
   * Get Helcim integration for a payment gateway
   */
  async getHelcimIntegration(paymentGatewayId: number): Promise<HelcimIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(helcimIntegrations)
      .where(eq(helcimIntegrations.paymentGatewayId, paymentGatewayId));
    
    return integration;
  }

  /**
   * Create a new Helcim integration for a payment gateway
   */
  async createHelcimIntegration(data: InsertHelcimIntegration): Promise<HelcimIntegration> {
    // First, update the payment gateway to use Helcim
    await db
      .update(paymentGateways)
      .set({ gatewayType: 'helcim' })
      .where(eq(paymentGateways.id, data.paymentGatewayId));
    
    // Then create the Helcim integration
    const [integration] = await db.insert(helcimIntegrations).values(data).returning();
    return integration;
  }

  /**
   * Update a Helcim integration
   */
  async updateHelcimIntegration(
    paymentGatewayId: number, 
    data: Partial<InsertHelcimIntegration>
  ): Promise<HelcimIntegration> {
    const [integration] = await db
      .update(helcimIntegrations)
      .set(data)
      .where(eq(helcimIntegrations.paymentGatewayId, paymentGatewayId))
      .returning();
    
    return integration;
  }

  /**
   * Delete a Helcim integration
   */
  async deleteHelcimIntegration(paymentGatewayId: number): Promise<void> {
    await db
      .delete(helcimIntegrations)
      .where(eq(helcimIntegrations.paymentGatewayId, paymentGatewayId));
  }

  /**
   * Get a Helcim service instance for a merchant
   * Creates a new gateway and integration if none exists
   */
  async getOrCreateHelcimService(
    merchantId: number,
    accountId: string,
    apiKey: string,
    terminalId?: string,
    testMode: boolean = true
  ): Promise<HelcimService> {
    // Check if merchant already has a Helcim gateway
    const existingGateways = await db
      .select()
      .from(paymentGateways)
      .where(and(
        eq(paymentGateways.merchantId, merchantId),
        eq(paymentGateways.gatewayType, 'helcim')
      ));
    
    let gateway: PaymentGateway;
    
    if (existingGateways.length === 0) {
      // Create a new gateway
      [gateway] = await db.insert(paymentGateways).values({
        merchantId,
        gatewayType: 'helcim',
        isActive: true,
        supportedPaymentMethods: ['credit', 'debit', 'bank'],
      }).returning();
    } else {
      gateway = existingGateways[0];
    }
    
    // Check if integration exists
    let integration = await this.getHelcimIntegration(gateway.id);
    
    if (!integration) {
      // Create new integration
      integration = await this.createHelcimIntegration({
        paymentGatewayId: gateway.id,
        merchantId,
        helcimAccountId: accountId,
        helcimApiKey: apiKey,
        helcimTerminalId: terminalId,
        testMode
      });
    } else {
      // Update existing integration if needed
      const updates: Partial<InsertHelcimIntegration> = {};
      let needsUpdate = false;
      
      if (integration.helcimAccountId !== accountId) {
        updates.helcimAccountId = accountId;
        needsUpdate = true;
      }
      
      if (integration.helcimApiKey !== apiKey) {
        updates.helcimApiKey = apiKey;
        needsUpdate = true;
      }
      
      if (integration.helcimTerminalId !== terminalId) {
        updates.helcimTerminalId = terminalId;
        needsUpdate = true;
      }
      
      if (integration.testMode !== testMode) {
        updates.testMode = testMode;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        integration = await this.updateHelcimIntegration(gateway.id, updates);
      }
    }
    
    // Create and return the Helcim service
    return createHelcimService(integration);
  }

  /**
   * Verify a Helcim integration is valid by testing the connection
   */
  async verifyHelcimIntegration(paymentGatewayId: number): Promise<boolean> {
    const integration = await this.getHelcimIntegration(paymentGatewayId);
    
    if (!integration) {
      return false;
    }
    
    const helcimService = createHelcimService(integration);
    return helcimService.verifyConnection();
  }
}

export const paymentGatewayService = new PaymentGatewayService();