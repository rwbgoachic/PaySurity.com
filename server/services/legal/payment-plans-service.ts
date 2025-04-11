import { db } from "../../db";
import { 
  paymentPlans, 
  paymentPlanTransactions, 
  clientFinancingApplications,
  InsertPaymentPlan,
  InsertPaymentPlanTransaction,
  InsertClientFinancingApplication,
  legalInvoices,
  transactions
} from "@shared/schema";
import { processPayment } from "../payment.service";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { Decimal } from "decimal.js";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

/**
 * Legal Payment Plans and Financing Service
 * 
 * Provides functionality for scheduling recurring payments and
 * client financing options (pay later).
 */
export class PaymentPlansService {
  
  /**
   * Creates a new payment plan
   */
  async createPaymentPlan(data: InsertPaymentPlan) {
    return await db.transaction(async (tx) => {
      // Insert the payment plan record
      const [plan] = await tx.insert(paymentPlans).values(data).returning();
      
      // Generate planned payment transactions based on the schedule
      const transactionDates = this.generatePaymentSchedule(
        data.startDate,
        data.frequency,
        data.numberOfInstallments
      );
      
      // Create a transaction for each payment date
      for (let i = 0; i < transactionDates.length; i++) {
        await tx.insert(paymentPlanTransactions).values({
          paymentPlanId: plan.id,
          plannedDate: transactionDates[i],
          amount: data.installmentAmount,
          status: "scheduled"
        });
      }
      
      // If this plan is linked to an invoice, update the invoice status
      if (data.invoiceId) {
        await tx.update(legalInvoices)
          .set({ 
            status: "payment_plan",
            updatedAt: new Date()
          })
          .where(eq(legalInvoices.id, data.invoiceId));
      }
      
      return plan;
    });
  }
  
  /**
   * Gets a payment plan by ID
   */
  async getPaymentPlan(id: number) {
    const [plan] = await db.select().from(paymentPlans).where(eq(paymentPlans.id, id));
    return plan;
  }
  
  /**
   * Gets payment plans for a merchant
   */
  async getPaymentPlansByMerchant(merchantId: number, options: {
    clientId?: number,
    status?: string,
    active?: boolean
  } = {}) {
    let query = db.select().from(paymentPlans)
      .where(eq(paymentPlans.merchantId, merchantId));
    
    if (options.clientId) {
      query = query.where(eq(paymentPlans.clientId, options.clientId));
    }
    
    if (options.status) {
      query = query.where(eq(paymentPlans.status, options.status));
    }
    
    if (options.active) {
      query = query.where(eq(paymentPlans.status, "active"));
    }
    
    return await query.orderBy(paymentPlans.nextPaymentDate);
  }
  
  /**
   * Gets payment plans for a client
   */
  async getPaymentPlansByClient(clientId: number) {
    return await db.select().from(paymentPlans)
      .where(eq(paymentPlans.clientId, clientId))
      .orderBy(paymentPlans.nextPaymentDate);
  }
  
  /**
   * Gets scheduled transactions for a payment plan
   */
  async getPaymentPlanTransactions(paymentPlanId: number) {
    return await db.select().from(paymentPlanTransactions)
      .where(eq(paymentPlanTransactions.paymentPlanId, paymentPlanId))
      .orderBy(paymentPlanTransactions.plannedDate);
  }
  
  /**
   * Updates a payment plan
   */
  async updatePaymentPlan(id: number, data: Partial<InsertPaymentPlan>) {
    const [updatedPlan] = await db.update(paymentPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentPlans.id, id))
      .returning();
      
    return updatedPlan;
  }
  
  /**
   * Cancel a payment plan
   */
  async cancelPaymentPlan(id: number, reason: string) {
    return await db.transaction(async (tx) => {
      // Update the payment plan status
      const [updatedPlan] = await tx.update(paymentPlans)
        .set({ 
          status: "cancelled", 
          notes: reason,
          updatedAt: new Date() 
        })
        .where(eq(paymentPlans.id, id))
        .returning();
      
      // Cancel any scheduled transactions
      await tx.update(paymentPlanTransactions)
        .set({ 
          status: "cancelled",
          failureReason: reason,
          updatedAt: new Date()
        })
        .where(and(
          eq(paymentPlanTransactions.paymentPlanId, id),
          eq(paymentPlanTransactions.status, "scheduled")
        ));
        
      return updatedPlan;
    });
  }
  
  /**
   * Process a scheduled payment
   */
  async processScheduledPayment(paymentPlanTransactionId: number) {
    return await db.transaction(async (tx) => {
      // Get the payment plan transaction
      const [planTransaction] = await tx.select().from(paymentPlanTransactions)
        .where(eq(paymentPlanTransactions.id, paymentPlanTransactionId));
        
      if (!planTransaction) {
        throw new Error("Payment plan transaction not found");
      }
      
      if (planTransaction.status !== "scheduled") {
        throw new Error(`Cannot process transaction with status: ${planTransaction.status}`);
      }
      
      // Get the payment plan
      const [plan] = await tx.select().from(paymentPlans)
        .where(eq(paymentPlans.id, planTransaction.paymentPlanId));
        
      if (!plan) {
        throw new Error("Payment plan not found");
      }
      
      if (plan.status !== "active") {
        throw new Error(`Cannot process payment for plan with status: ${plan.status}`);
      }
      
      try {
        // Update transaction status to processing
        await tx.update(paymentPlanTransactions)
          .set({ 
            status: "processing",
            updatedAt: new Date()
          })
          .where(eq(paymentPlanTransactions.id, paymentPlanTransactionId));
        
        // Process the payment using the stored payment method
        const paymentResult = await processPayment({
          amount: planTransaction.amount,
          paymentMethodId: plan.paymentMethodId,
          merchantId: plan.merchantId,
          description: `Payment plan: ${plan.planName} - Installment #${plan.installmentsPaid + 1}`,
          metadata: {
            paymentPlanId: plan.id.toString(),
            paymentPlanTransactionId: planTransaction.id.toString(),
            invoiceId: plan.invoiceId ? plan.invoiceId.toString() : undefined
          }
        });
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || "Payment processing failed");
        }
        
        // Update the payment plan transaction
        await tx.update(paymentPlanTransactions)
          .set({ 
            status: "completed",
            actualDate: new Date(),
            transactionId: paymentResult.transactionId,
            updatedAt: new Date()
          })
          .where(eq(paymentPlanTransactions.id, paymentPlanTransactionId));
        
        // Update the payment plan
        const newInstallmentsPaid = plan.installmentsPaid + 1;
        const newRemainingBalance = new Decimal(plan.remainingBalance).minus(planTransaction.amount).toString();
        
        // Find the next scheduled payment
        const [nextPayment] = await tx.select().from(paymentPlanTransactions)
          .where(and(
            eq(paymentPlanTransactions.paymentPlanId, plan.id),
            eq(paymentPlanTransactions.status, "scheduled")
          ))
          .orderBy(paymentPlanTransactions.plannedDate)
          .limit(1);
        
        const planUpdates: any = {
          installmentsPaid: newInstallmentsPaid,
          remainingBalance: newRemainingBalance,
          lastPaymentDate: new Date(),
          updatedAt: new Date()
        };
        
        if (nextPayment) {
          planUpdates.nextPaymentDate = nextPayment.plannedDate;
        }
        
        // Check if this was the last payment
        if (newInstallmentsPaid >= plan.numberOfInstallments) {
          planUpdates.status = "completed";
        }
        
        await tx.update(paymentPlans)
          .set(planUpdates)
          .where(eq(paymentPlans.id, plan.id));
        
        // If the plan is linked to an invoice, update the invoice
        if (plan.invoiceId) {
          const [invoice] = await tx.select().from(legalInvoices)
            .where(eq(legalInvoices.id, plan.invoiceId));
            
          if (invoice) {
            const newAmountPaid = new Decimal(invoice.amountPaid).plus(planTransaction.amount).toString();
            const newBalanceDue = new Decimal(invoice.totalAmount).minus(newAmountPaid).toString();
            
            const invoiceStatus = newBalanceDue === "0" ? "paid" : "partial_payment";
            
            await tx.update(legalInvoices)
              .set({
                amountPaid: newAmountPaid,
                balanceDue: newBalanceDue,
                status: invoiceStatus,
                updatedAt: new Date()
              })
              .where(eq(legalInvoices.id, plan.invoiceId));
          }
        }
        
        return {
          success: true,
          transaction: paymentResult,
          planTransaction: {
            ...planTransaction,
            status: "completed",
            actualDate: new Date(),
            transactionId: paymentResult.transactionId
          }
        };
      } catch (error) {
        // Handle payment failure
        console.error("Payment plan transaction failed:", error);
        
        // Update the transaction status
        await tx.update(paymentPlanTransactions)
          .set({ 
            status: "failed",
            failureReason: error.message,
            retryCount: (planTransaction.retryCount || 0) + 1,
            nextRetryDate: addDays(new Date(), 1), // Retry tomorrow
            updatedAt: new Date()
          })
          .where(eq(paymentPlanTransactions.id, paymentPlanTransactionId));
        
        return {
          success: false,
          error: error.message,
          retryDate: addDays(new Date(), 1)
        };
      }
    });
  }
  
  /**
   * Process all due payments for a merchant
   */
  async processDuePaymentsForMerchant(merchantId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    
    // Find all active payment plans for this merchant with due payments
    const plans = await db.select().from(paymentPlans)
      .where(and(
        eq(paymentPlans.merchantId, merchantId),
        eq(paymentPlans.status, "active"),
        eq(paymentPlans.autoProcess, true),
        lte(paymentPlans.nextPaymentDate, today)
      ))
      .orderBy(paymentPlans.nextPaymentDate);
    
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      details: []
    };
    
    // Process each plan's next payment
    for (const plan of plans) {
      // Find the next scheduled transaction
      const [nextTransaction] = await db.select().from(paymentPlanTransactions)
        .where(and(
          eq(paymentPlanTransactions.paymentPlanId, plan.id),
          eq(paymentPlanTransactions.status, "scheduled"),
          lte(paymentPlanTransactions.plannedDate, today)
        ))
        .orderBy(paymentPlanTransactions.plannedDate)
        .limit(1);
      
      if (nextTransaction) {
        results.processed++;
        
        // Process the payment
        try {
          const paymentResult = await this.processScheduledPayment(nextTransaction.id);
          if (paymentResult.success) {
            results.successful++;
          } else {
            results.failed++;
          }
          
          results.details.push({
            paymentPlanId: plan.id,
            transactionId: nextTransaction.id,
            result: paymentResult
          });
        } catch (error) {
          results.failed++;
          results.details.push({
            paymentPlanId: plan.id,
            transactionId: nextTransaction.id,
            error: error.message
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Generate payment dates based on frequency and number of installments
   */
  private generatePaymentSchedule(startDate: Date, frequency: string, numberOfInstallments: number): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < numberOfInstallments; i++) {
      dates.push(new Date(currentDate));
      
      // Add appropriate time interval based on frequency
      switch (frequency) {
        case "weekly":
          currentDate = addWeeks(currentDate, 1);
          break;
        case "biweekly":
          currentDate = addWeeks(currentDate, 2);
          break;
        case "monthly":
          currentDate = addMonths(currentDate, 1);
          break;
        case "quarterly":
          currentDate = addMonths(currentDate, 3);
          break;
        case "semiannual":
          currentDate = addMonths(currentDate, 6);
          break;
        case "annual":
          currentDate = addYears(currentDate, 1);
          break;
        default:
          currentDate = addMonths(currentDate, 1); // Default to monthly
      }
    }
    
    return dates;
  }
  
  /**
   * Create a financing application
   */
  async createFinancingApplication(data: InsertClientFinancingApplication) {
    const [application] = await db.insert(clientFinancingApplications).values(data).returning();
    return application;
  }
  
  /**
   * Get a financing application by ID
   */
  async getFinancingApplication(id: number) {
    const [application] = await db.select().from(clientFinancingApplications).where(eq(clientFinancingApplications.id, id));
    return application;
  }
  
  /**
   * Get financing applications for a merchant
   */
  async getFinancingApplicationsByMerchant(merchantId: number, status?: string) {
    let query = db.select().from(clientFinancingApplications)
      .where(eq(clientFinancingApplications.merchantId, merchantId));
    
    if (status) {
      query = query.where(eq(clientFinancingApplications.status, status));
    }
    
    return await query.orderBy(desc(clientFinancingApplications.applicationDate));
  }
  
  /**
   * Approve a financing application and create a payment plan
   */
  async approveFinancingApplication(id: number, approvedBy: string) {
    return await db.transaction(async (tx) => {
      // Get the application
      const [application] = await tx.select().from(clientFinancingApplications)
        .where(eq(clientFinancingApplications.id, id));
        
      if (!application) {
        throw new Error("Financing application not found");
      }
      
      if (application.status !== "pending_application") {
        throw new Error(`Cannot approve application with status: ${application.status}`);
      }
      
      // Update the application status
      const [updatedApplication] = await tx.update(clientFinancingApplications)
        .set({
          status: "approved",
          approvalDate: new Date(),
          approvedBy,
          updatedAt: new Date()
        })
        .where(eq(clientFinancingApplications.id, id))
        .returning();
      
      // Create a payment plan
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // Start in 30 days
      
      const [paymentPlan] = await tx.insert(paymentPlans).values({
        merchantId: application.merchantId,
        clientId: application.clientId,
        invoiceId: application.invoiceId,
        planName: `Financing Plan #${application.id}`,
        totalAmount: application.totalPaybackAmount,
        remainingBalance: application.totalPaybackAmount,
        installmentAmount: application.monthlyPayment,
        numberOfInstallments: application.termMonths,
        installmentsPaid: 0,
        frequency: "monthly",
        startDate,
        endDate: addMonths(startDate, application.termMonths),
        nextPaymentDate: startDate,
        paymentMethodId: 0, // Placeholder - needs to be updated with actual payment method
        status: "pending",
        autoProcess: true,
        notes: `Created from financing application #${application.id}`
      }).returning();
      
      // Link the payment plan to the application
      await tx.update(clientFinancingApplications)
        .set({ paymentPlanId: paymentPlan.id })
        .where(eq(clientFinancingApplications.id, id));
      
      // If the application is linked to an invoice, update the invoice
      if (application.invoiceId) {
        await tx.update(legalInvoices)
          .set({
            status: "financing",
            updatedAt: new Date()
          })
          .where(eq(legalInvoices.id, application.invoiceId));
      }
      
      return {
        application: updatedApplication,
        paymentPlan
      };
    });
  }
  
  /**
   * Reject a financing application
   */
  async rejectFinancingApplication(id: number, rejectionReason: string) {
    const [updatedApplication] = await db.update(clientFinancingApplications)
      .set({
        status: "rejected",
        rejectionReason,
        updatedAt: new Date()
      })
      .where(eq(clientFinancingApplications.id, id))
      .returning();
      
    return updatedApplication;
  }
  
  /**
   * Activate a financing application's payment plan with a payment method
   */
  async activateFinancingPaymentPlan(applicationId: number, paymentMethodId: number) {
    return await db.transaction(async (tx) => {
      // Get the application
      const [application] = await tx.select().from(clientFinancingApplications)
        .where(eq(clientFinancingApplications.id, applicationId));
        
      if (!application) {
        throw new Error("Financing application not found");
      }
      
      if (application.status !== "approved" || !application.paymentPlanId) {
        throw new Error("Application is not approved or missing payment plan");
      }
      
      // Update the payment plan with the payment method
      const [updatedPlan] = await tx.update(paymentPlans)
        .set({
          paymentMethodId,
          status: "active",
          updatedAt: new Date()
        })
        .where(eq(paymentPlans.id, application.paymentPlanId))
        .returning();
      
      // Update the application status
      const [updatedApplication] = await tx.update(clientFinancingApplications)
        .set({
          status: "active",
          updatedAt: new Date()
        })
        .where(eq(clientFinancingApplications.id, applicationId))
        .returning();
      
      // Generate scheduled payments
      const transactionDates = this.generatePaymentSchedule(
        updatedPlan.startDate,
        updatedPlan.frequency,
        updatedPlan.numberOfInstallments
      );
      
      // Create a transaction for each payment date
      for (let i = 0; i < transactionDates.length; i++) {
        await tx.insert(paymentPlanTransactions).values({
          paymentPlanId: updatedPlan.id,
          plannedDate: transactionDates[i],
          amount: updatedPlan.installmentAmount,
          status: "scheduled"
        });
      }
      
      return {
        application: updatedApplication,
        plan: updatedPlan
      };
    });
  }
}

export const paymentPlansService = new PaymentPlansService();