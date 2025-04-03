import { 
  users, wallets, transactions, bankAccounts, fundRequests, 
  payrollEntries, timeEntries, accountRequests, spendingControls, 
  educationalContent, savingsGoals, accountingIntegrations,
  // New merchant and value-added service entities
  merchantProfiles, paymentGateways, pointOfSaleSystems, loyaltyPrograms, 
  customerLoyaltyAccounts, promotionalCampaigns, analyticsReports,
  businessFinancing, virtualTerminals,
  // Affiliate system entities
  affiliateProfiles, merchantReferrals, affiliatePayouts,
  
  // Core types
  type User, type InsertUser, 
  type Wallet, type InsertWallet, 
  type Transaction, type InsertTransaction, 
  type BankAccount, type InsertBankAccount, 
  type FundRequest, type InsertFundRequest,
  type PayrollEntry, type InsertPayrollEntry,
  type TimeEntry, type InsertTimeEntry,
  type AccountRequest, type InsertAccountRequest,
  type SpendingControl, type InsertSpendingControl,
  type EducationalContent, type InsertEducationalContent,
  type SavingsGoal, type InsertSavingsGoal,
  type AccountingIntegration, type InsertAccountingIntegration,
  
  // New merchant and value-added service types
  type MerchantProfile, type InsertMerchantProfile,
  type PaymentGateway, type InsertPaymentGateway,
  type PointOfSaleSystem, type InsertPointOfSaleSystem,
  type LoyaltyProgram, type InsertLoyaltyProgram,
  type CustomerLoyaltyAccount, type InsertCustomerLoyaltyAccount,
  type PromotionalCampaign, type InsertPromotionalCampaign,
  type AnalyticsReport, type InsertAnalyticsReport,
  type BusinessFinancing, type InsertBusinessFinancing,
  type VirtualTerminal, type InsertVirtualTerminal,
  
  // Affiliate system types
  type AffiliateProfile, type InsertAffiliateProfile,
  type MerchantReferral, type InsertMerchantReferral,
  type AffiliatePayout, type InsertAffiliatePayout
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";

const PostgresSessionStore = connectPg(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  getChildrenByParentId(parentId: number): Promise<User[]>;
  getEmployeesByEmployerId(employerId: number): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  updateLastLogin(id: number): Promise<User>;
  
  // Session store
  sessionStore: session.Store;
  
  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  getWalletsByType(userId: number, walletType: string): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, balance: string): Promise<Wallet>;
  updateWalletLimits(id: number, dailyLimit?: string, weeklyLimit?: string, monthlyLimit?: string): Promise<Wallet>;
  updateWalletRestrictions(id: number, categoryRestrictions?: string, merchantRestrictions?: string): Promise<Wallet>;
  updateWalletRefillSettings(id: number, autoRefill: boolean, refillAmount?: string, refillFrequency?: string): Promise<Wallet>;
  allocateFunds(walletId: number, amount: string): Promise<Wallet>;
  transferFundsToBank(walletId: number, bankAccountId: number, amount: string): Promise<Wallet>;
  transferBetweenWallets(sourceWalletId: number, targetWalletId: number, amount: string): Promise<[Wallet, Wallet]>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByWalletId(walletId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getPendingApprovalTransactions(approverId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionExpenseType(id: number, expenseType: string): Promise<Transaction>;
  updateTransactionApprovalStatus(id: number, status: string, approverId: number, rejectionReason?: string): Promise<Transaction>;
  
  // Bank account operations
  getBankAccount(id: number): Promise<BankAccount | undefined>;
  getBankAccountsByUserId(userId: number): Promise<BankAccount[]>;
  createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  deleteBankAccount(id: number): Promise<void>;
  
  // Fund request operations
  getFundRequest(id: number): Promise<FundRequest | undefined>;
  getFundRequestsByUserId(userId: number): Promise<FundRequest[]>;
  getAllFundRequests(): Promise<FundRequest[]>;
  createFundRequest(fundRequest: InsertFundRequest): Promise<FundRequest>;
  approveFundRequest(id: number, approverId: number): Promise<FundRequest>;
  rejectFundRequest(id: number, approverId: number, reason?: string): Promise<FundRequest>;
  
  // Payroll operations
  getPayrollEntry(id: number): Promise<PayrollEntry | undefined>;
  getPayrollEntriesByUserId(userId: number): Promise<PayrollEntry[]>;
  getPayrollEntriesByEmployerId(employerId: number): Promise<PayrollEntry[]>;
  createPayrollEntry(payrollEntry: InsertPayrollEntry): Promise<PayrollEntry>;
  updatePayrollEntryStatus(id: number, status: string): Promise<PayrollEntry>;
  processPayrollEntry(id: number): Promise<PayrollEntry>;
  
  // Time tracking operations
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getTimeEntriesByUserId(userId: number): Promise<TimeEntry[]>;
  getTimeEntriesByEmployerId(employerId: number): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntryStatus(id: number, status: string): Promise<TimeEntry>;
  
  // HSA and Retirement Account operations
  getAccountRequest(id: number): Promise<AccountRequest | undefined>;
  getAccountRequestsByUserId(userId: number): Promise<AccountRequest[]>;
  getAccountRequestsByEmployerId(employerId: number): Promise<AccountRequest[]>;
  createAccountRequest(accountRequest: InsertAccountRequest): Promise<AccountRequest>;
  approveAccountRequest(id: number): Promise<AccountRequest>;
  rejectAccountRequest(id: number, notes?: string): Promise<AccountRequest>;
  
  // Spending Controls operations
  getSpendingControl(id: number): Promise<SpendingControl | undefined>;
  getSpendingControlsByWalletId(walletId: number): Promise<SpendingControl[]>;
  getSpendingControlsByCreatedById(createdById: number): Promise<SpendingControl[]>;
  createSpendingControl(spendingControl: InsertSpendingControl): Promise<SpendingControl>;
  updateSpendingControl(id: number, data: Partial<InsertSpendingControl>): Promise<SpendingControl>;
  deleteSpendingControl(id: number): Promise<void>;
  
  // Educational Content operations
  getEducationalContent(id: number): Promise<EducationalContent | undefined>;
  getEducationalContentByCategory(category: string): Promise<EducationalContent[]>;
  getEducationalContentByAgeGroup(targetAgeGroup: string): Promise<EducationalContent[]>;
  createEducationalContent(educationalContent: InsertEducationalContent): Promise<EducationalContent>;
  updateEducationalContent(id: number, data: Partial<InsertEducationalContent>): Promise<EducationalContent>;
  deleteEducationalContent(id: number): Promise<void>;
  
  // Savings Goals operations
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoalsByWalletId(walletId: number): Promise<SavingsGoal[]>;
  createSavingsGoal(savingsGoal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoalProgress(id: number, currentAmount: string): Promise<SavingsGoal>;
  completeSavingsGoal(id: number): Promise<SavingsGoal>;
  
  // Accounting Integrations operations
  getAccountingIntegration(id: number): Promise<AccountingIntegration | undefined>;
  getAccountingIntegrationsByUserId(userId: number): Promise<AccountingIntegration[]>;
  createAccountingIntegration(accountingIntegration: InsertAccountingIntegration): Promise<AccountingIntegration>;
  updateAccountingIntegration(id: number, data: Partial<InsertAccountingIntegration>): Promise<AccountingIntegration>;
  deleteAccountingIntegration(id: number): Promise<void>;
  
  // Merchant Profile operations
  getMerchantProfile(id: number): Promise<MerchantProfile | undefined>;
  getMerchantProfileByUserId(userId: number): Promise<MerchantProfile | undefined>;
  getMerchantProfilesByStatus(status: string): Promise<MerchantProfile[]>;
  createMerchantProfile(merchantProfile: InsertMerchantProfile): Promise<MerchantProfile>;
  updateMerchantProfile(id: number, data: Partial<InsertMerchantProfile>): Promise<MerchantProfile>;
  updateMerchantStatus(id: number, status: string): Promise<MerchantProfile>;
  updateVerificationStatus(id: number, verificationStatus: string, verificationDocuments?: any): Promise<MerchantProfile>;
  
  // Payment Gateway operations
  getPaymentGateway(id: number): Promise<PaymentGateway | undefined>;
  getPaymentGatewaysByMerchantId(merchantId: number): Promise<PaymentGateway[]>;
  createPaymentGateway(paymentGateway: InsertPaymentGateway): Promise<PaymentGateway>;
  updatePaymentGateway(id: number, data: Partial<InsertPaymentGateway>): Promise<PaymentGateway>;
  deletePaymentGateway(id: number): Promise<void>;
  
  // Point of Sale operations
  getPointOfSaleSystem(id: number): Promise<PointOfSaleSystem | undefined>;
  getPointOfSaleSystemsByMerchantId(merchantId: number): Promise<PointOfSaleSystem[]>;
  createPointOfSaleSystem(posSystem: InsertPointOfSaleSystem): Promise<PointOfSaleSystem>;
  updatePointOfSaleSystem(id: number, data: Partial<InsertPointOfSaleSystem>): Promise<PointOfSaleSystem>;
  updatePointOfSaleLastCheckIn(id: number): Promise<PointOfSaleSystem>;
  deletePointOfSaleSystem(id: number): Promise<void>;
  
  // Loyalty Program operations
  getLoyaltyProgram(id: number): Promise<LoyaltyProgram | undefined>;
  getLoyaltyProgramsByMerchantId(merchantId: number): Promise<LoyaltyProgram[]>;
  getActiveLoyaltyPrograms(): Promise<LoyaltyProgram[]>;
  createLoyaltyProgram(loyaltyProgram: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  updateLoyaltyProgram(id: number, data: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram>;
  deactivateLoyaltyProgram(id: number): Promise<LoyaltyProgram>;
  
  // Customer Loyalty Account operations
  getCustomerLoyaltyAccount(id: number): Promise<CustomerLoyaltyAccount | undefined>;
  getCustomerLoyaltyAccountsByUserId(userId: number): Promise<CustomerLoyaltyAccount[]>;
  getCustomerLoyaltyAccountsByProgramId(programId: number): Promise<CustomerLoyaltyAccount[]>;
  createCustomerLoyaltyAccount(account: InsertCustomerLoyaltyAccount): Promise<CustomerLoyaltyAccount>;
  updateLoyaltyPoints(id: number, pointsToAdd: number): Promise<CustomerLoyaltyAccount>;
  updateLoyaltyVisits(id: number, visitsToAdd: number): Promise<CustomerLoyaltyAccount>;
  updateLoyaltyTier(id: number, tier: string, expirationDate?: Date): Promise<CustomerLoyaltyAccount>;
  deactivateLoyaltyAccount(id: number): Promise<CustomerLoyaltyAccount>;
  
  // Promotional Campaign operations
  getPromotionalCampaign(id: number): Promise<PromotionalCampaign | undefined>;
  getPromotionalCampaignsByMerchantId(merchantId: number): Promise<PromotionalCampaign[]>;
  getActivePromotionalCampaigns(): Promise<PromotionalCampaign[]>;
  getLocationBasedCampaigns(latitude: number, longitude: number, radius: number): Promise<PromotionalCampaign[]>;
  createPromotionalCampaign(campaign: InsertPromotionalCampaign): Promise<PromotionalCampaign>;
  updatePromotionalCampaign(id: number, data: Partial<InsertPromotionalCampaign>): Promise<PromotionalCampaign>;
  incrementCampaignRedemptions(id: number): Promise<PromotionalCampaign>;
  deactivatePromotionalCampaign(id: number): Promise<PromotionalCampaign>;
  
  // Analytics Reports operations
  getAnalyticsReport(id: number): Promise<AnalyticsReport | undefined>;
  getAnalyticsReportsByMerchantId(merchantId: number): Promise<AnalyticsReport[]>;
  createAnalyticsReport(report: InsertAnalyticsReport): Promise<AnalyticsReport>;
  updateAnalyticsReport(id: number, data: Partial<InsertAnalyticsReport>): Promise<AnalyticsReport>;
  generateAnalyticsReport(id: number, reportData: any): Promise<AnalyticsReport>;
  deleteAnalyticsReport(id: number): Promise<void>;
  
  // Business Financing operations
  getBusinessFinancing(id: number): Promise<BusinessFinancing | undefined>;
  getBusinessFinancingsByMerchantId(merchantId: number): Promise<BusinessFinancing[]>;
  getBusinessFinancingsByStatus(status: string): Promise<BusinessFinancing[]>;
  createBusinessFinancing(financing: InsertBusinessFinancing): Promise<BusinessFinancing>;
  updateBusinessFinancingStatus(id: number, status: string): Promise<BusinessFinancing>;
  updateBusinessFinancingRepayment(id: number, amountPaid: string): Promise<BusinessFinancing>;
  
  // Virtual Terminal operations
  getVirtualTerminal(id: number): Promise<VirtualTerminal | undefined>;
  getVirtualTerminalsByMerchantId(merchantId: number): Promise<VirtualTerminal[]>;
  createVirtualTerminal(terminal: InsertVirtualTerminal): Promise<VirtualTerminal>;
  updateVirtualTerminal(id: number, data: Partial<InsertVirtualTerminal>): Promise<VirtualTerminal>;
  recordVirtualTerminalAccess(id: number, userId: number, ipAddress: string): Promise<VirtualTerminal>;
  deactivateVirtualTerminal(id: number): Promise<VirtualTerminal>;
  
  // Affiliate Profile operations
  getAffiliateProfile(id: number): Promise<AffiliateProfile | undefined>;
  getAffiliateProfileByUserId(userId: number): Promise<AffiliateProfile | undefined>;
  getAffiliateProfileByReferralCode(referralCode: string): Promise<AffiliateProfile | undefined>;
  getAllAffiliateProfiles(): Promise<AffiliateProfile[]>;
  getActiveAffiliateProfiles(): Promise<AffiliateProfile[]>;
  createAffiliateProfile(profile: InsertAffiliateProfile): Promise<AffiliateProfile>;
  updateAffiliateProfile(id: number, data: Partial<InsertAffiliateProfile>): Promise<AffiliateProfile>;
  updateAffiliateStats(id: number, totalEarned?: string, pendingPayouts?: string, lifetimeReferrals?: number, activeReferrals?: number): Promise<AffiliateProfile>;
  
  // Merchant Referral operations
  getMerchantReferral(id: number): Promise<MerchantReferral | undefined>;
  getMerchantReferralsByAffiliateId(affiliateId: number): Promise<MerchantReferral[]>;
  getMerchantReferralsByMerchantId(merchantId: number): Promise<MerchantReferral[]>;
  getMerchantReferralsByStatus(status: string): Promise<MerchantReferral[]>;
  createMerchantReferral(referral: InsertMerchantReferral): Promise<MerchantReferral>;
  updateMerchantReferralStatus(id: number, status: string): Promise<MerchantReferral>;
  updateMerchantReferralMilestone(id: number, milestoneName: string, reached: boolean): Promise<MerchantReferral>;
  updateMerchantReferralVolume(id: number, period: string, volume: string): Promise<MerchantReferral>;
  
  // Affiliate Payout operations
  getAffiliatePayout(id: number): Promise<AffiliatePayout | undefined>;
  getAffiliatePayoutsByAffiliateId(affiliateId: number): Promise<AffiliatePayout[]>;
  getAffiliatePayoutsByStatus(status: string): Promise<AffiliatePayout[]>;
  getAffiliatePayoutsByReferralId(referralId: number): Promise<AffiliatePayout[]>;
  createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout>;
  updateAffiliatePayoutStatus(id: number, status: string): Promise<AffiliatePayout>;
  markAffiliatePayoutAsPaid(id: number, transactionId: string): Promise<AffiliatePayout>;
  clawbackAffiliatePayout(id: number, notes?: string): Promise<AffiliatePayout>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set");
    }
    
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateLastLogin(id: number): Promise<User> {
    const now = new Date();
    const [updatedUser] = await db
      .update(users)
      .set({ lastLoginAt: now })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role as any, role));
  }
  
  async getChildrenByParentId(parentId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.parentId, parentId));
  }
  
  async getEmployeesByEmployerId(employerId: number): Promise<User[]> {
    return await db.select().from(users).where(and(
      eq(users.role, "employee"),
      eq(users.organizationId, employerId)
    ));
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }
  
  async getWalletsByType(userId: number, walletType: string): Promise<Wallet[]> {
    return await db.select().from(wallets).where(and(
      eq(wallets.userId, userId),
      eq(wallets.walletType as any, walletType)
    ));
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(insertWallet).returning();
    return wallet;
  }

  async updateWalletBalance(id: number, balance: string): Promise<Wallet> {
    const [updatedWallet] = await db
      .update(wallets)
      .set({ balance })
      .where(eq(wallets.id, id))
      .returning();
    
    if (!updatedWallet) {
      throw new Error(`Wallet with id ${id} not found`);
    }
    
    return updatedWallet;
  }
  
  async updateWalletLimits(id: number, dailyLimit?: string, weeklyLimit?: string, monthlyLimit?: string): Promise<Wallet> {
    const updateData: Partial<Wallet> = {};
    
    if (dailyLimit !== undefined) {
      updateData.dailyLimit = dailyLimit;
    }
    
    if (weeklyLimit !== undefined) {
      updateData.weeklyLimit = weeklyLimit;
    }
    
    if (monthlyLimit !== undefined) {
      updateData.monthlyLimit = monthlyLimit;
    }
    
    const [updatedWallet] = await db
      .update(wallets)
      .set(updateData)
      .where(eq(wallets.id, id))
      .returning();
    
    if (!updatedWallet) {
      throw new Error(`Wallet with id ${id} not found`);
    }
    
    return updatedWallet;
  }
  
  async updateWalletRestrictions(id: number, categoryRestrictions?: string, merchantRestrictions?: string): Promise<Wallet> {
    const updateData: Partial<Wallet> = {};
    
    if (categoryRestrictions !== undefined) {
      updateData.categoryRestrictions = categoryRestrictions;
    }
    
    if (merchantRestrictions !== undefined) {
      updateData.merchantRestrictions = merchantRestrictions;
    }
    
    const [updatedWallet] = await db
      .update(wallets)
      .set(updateData)
      .where(eq(wallets.id, id))
      .returning();
    
    if (!updatedWallet) {
      throw new Error(`Wallet with id ${id} not found`);
    }
    
    return updatedWallet;
  }
  
  async updateWalletRefillSettings(id: number, autoRefill: boolean, refillAmount?: string, refillFrequency?: string): Promise<Wallet> {
    const updateData: Partial<Wallet> = {
      autoRefill,
    };
    
    if (refillAmount !== undefined) {
      updateData.refillAmount = refillAmount;
    }
    
    if (refillFrequency !== undefined) {
      updateData.refillFrequency = refillFrequency;
    }
    
    const [updatedWallet] = await db
      .update(wallets)
      .set(updateData)
      .where(eq(wallets.id, id))
      .returning();
    
    if (!updatedWallet) {
      throw new Error(`Wallet with id ${id} not found`);
    }
    
    return updatedWallet;
  }

  async allocateFunds(walletId: number, amount: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${walletId} not found`);
    }
    
    // Convert to numbers for calculation
    const currentBalance = parseFloat(wallet.balance.toString());
    const allocationAmount = parseFloat(amount);
    
    // Add the amount to the wallet balance
    const newBalance = (currentBalance + allocationAmount).toString();
    
    return this.updateWalletBalance(walletId, newBalance);
  }

  async transferFundsToBank(walletId: number, bankAccountId: number, amount: string): Promise<Wallet> {
    // Get wallet
    const wallet = await this.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${walletId} not found`);
    }
    
    // Get bank account to verify it exists and belongs to the same user
    const bankAccount = await this.getBankAccount(bankAccountId);
    if (!bankAccount) {
      throw new Error(`Bank account with id ${bankAccountId} not found`);
    }
    
    // Verify the bank account belongs to the same user as the wallet
    if (bankAccount.userId !== wallet.userId) {
      throw new Error("Bank account does not belong to the wallet owner");
    }
    
    // Check if wallet is HSA or retirement and has withdrawal restrictions
    if (wallet.walletType === "hsa" || wallet.walletType === "retirement") {
      // For HSA, we might need additional validation for qualified medical expenses
      // For retirement, we might need to check age restrictions
      // This is a simplified implementation
      if (wallet.walletType === "hsa") {
        // In a real implementation, we would check if the withdrawal is for a qualified medical expense
        // We might also require a receipt upload
      }
      
      if (wallet.walletType === "retirement") {
        // In a real implementation, we would check the user's age and possible penalties
        // We might also need to handle tax implications
      }
    }
    
    // Convert to numbers for calculation
    const currentBalance = parseFloat(wallet.balance.toString());
    const transferAmount = parseFloat(amount);
    
    // Check if wallet has enough funds
    if (currentBalance < transferAmount) {
      throw new Error("Insufficient funds in wallet");
    }
    
    // Subtract the amount from the wallet balance
    const newBalance = (currentBalance - transferAmount).toString();
    
    // Create a transaction record for this transfer
    await this.createTransaction({
      userId: wallet.userId,
      walletId,
      type: "outgoing",
      method: "ach",
      merchantName: "Bank Transfer",
      amount: transferAmount.toString(),
      expenseType: "transfer",
      isPersonal: false,
      sourceOfFunds: `Wallet ID: ${walletId}`,
    });
    
    // Update the wallet balance
    return this.updateWalletBalance(walletId, newBalance);
  }
  
  async transferBetweenWallets(sourceWalletId: number, targetWalletId: number, amount: string): Promise<[Wallet, Wallet]> {
    // Get source wallet
    const sourceWallet = await this.getWallet(sourceWalletId);
    if (!sourceWallet) {
      throw new Error(`Source wallet with id ${sourceWalletId} not found`);
    }
    
    // Get target wallet
    const targetWallet = await this.getWallet(targetWalletId);
    if (!targetWallet) {
      throw new Error(`Target wallet with id ${targetWalletId} not found`);
    }
    
    // Convert to numbers for calculation
    const sourceBalance = parseFloat(sourceWallet.balance.toString());
    const targetBalance = parseFloat(targetWallet.balance.toString());
    const transferAmount = parseFloat(amount);
    
    // Check if source wallet has enough funds
    if (sourceBalance < transferAmount) {
      throw new Error("Insufficient funds in source wallet");
    }
    
    // Subtract from source wallet
    const newSourceBalance = (sourceBalance - transferAmount).toString();
    
    // Add to target wallet
    const newTargetBalance = (targetBalance + transferAmount).toString();
    
    // Create transaction records for this transfer
    await this.createTransaction({
      userId: sourceWallet.userId,
      walletId: sourceWalletId,
      type: "outgoing",
      method: "wallet",
      merchantName: "Wallet Transfer",
      amount: transferAmount.toString(),
      expenseType: "transfer",
      isPersonal: false,
      sourceOfFunds: `Wallet ID: ${sourceWalletId}`,
    });
    
    await this.createTransaction({
      userId: targetWallet.userId,
      walletId: targetWalletId,
      type: "incoming",
      method: "wallet",
      merchantName: "Wallet Transfer",
      amount: transferAmount.toString(),
      expenseType: "transfer",
      isPersonal: false,
      sourceOfFunds: `Wallet ID: ${sourceWalletId}`,
    });
    
    // Update wallet balances
    const updatedSourceWallet = await this.updateWalletBalance(sourceWalletId, newSourceBalance);
    const updatedTargetWallet = await this.updateWalletBalance(targetWalletId, newTargetBalance);
    
    return [updatedSourceWallet, updatedTargetWallet];
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }
  
  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.walletId, walletId));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }
  
  async getPendingApprovalTransactions(approverId: number): Promise<Transaction[]> {
    // Get all transactions that need approval and are related to wallets that this approver manages
    // This is a simplified implementation that would need more complex logic in a real app
    return await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.needsApproval, true),
        eq(transactions.approvalStatus, "pending")
      ));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    // Start by getting the wallet to check balance
    const wallet = await this.getWallet(insertTransaction.walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${insertTransaction.walletId} not found`);
    }
    
    // Check if the wallet requires approval for transactions
    if (wallet.requiresApproval && !insertTransaction.needsApproval) {
      insertTransaction.needsApproval = true;
      insertTransaction.approvalStatus = "pending";
    }
    
    // Check if the transaction needs to be reviewed based on wallet restrictions
    if (wallet.categoryRestrictions && wallet.categoryRestrictions.length > 0) {
      // Parse category restrictions (comma-separated list)
      const allowedCategories = wallet.categoryRestrictions.split(',').map(c => c.trim().toLowerCase());
      
      // If expenseType is provided and not in allowed categories, require approval
      if (insertTransaction.expenseType && 
          !allowedCategories.includes(insertTransaction.expenseType.toLowerCase())) {
        insertTransaction.needsApproval = true;
        insertTransaction.approvalStatus = "pending";
      }
    }
    
    // Check merchant restrictions if provided
    if (wallet.merchantRestrictions && wallet.merchantRestrictions.length > 0 && 
        insertTransaction.merchantName) {
      // Parse merchant restrictions (comma-separated list)
      const allowedMerchants = wallet.merchantRestrictions.split(',').map(m => m.trim().toLowerCase());
      
      // If merchant is not in allowed list, require approval
      if (!allowedMerchants.includes(insertTransaction.merchantName.toLowerCase())) {
        insertTransaction.needsApproval = true;
        insertTransaction.approvalStatus = "pending";
      }
    }
    
    // If transaction requires approval, don't update the balance yet
    if (insertTransaction.needsApproval && insertTransaction.approvalStatus === "pending") {
      // Create the transaction without updating the balance
      const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
      return transaction;
    }
    
    // Normal transaction processing for approved transactions
    const currentBalance = parseFloat(wallet.balance.toString());
    const transactionAmount = parseFloat(insertTransaction.amount.toString());
    
    let newBalance: number;
    if (insertTransaction.type === "incoming") {
      newBalance = currentBalance + transactionAmount;
    } else {
      newBalance = currentBalance - transactionAmount;
      
      // Check if there are sufficient funds
      if (newBalance < 0) {
        throw new Error("Insufficient funds in wallet");
      }
    }
    
    // Create the transaction
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    
    // Update wallet balance
    await this.updateWalletBalance(wallet.id, newBalance.toString());
    
    return transaction;
  }

  async updateTransactionExpenseType(id: number, expenseType: string): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ expenseType })
      .where(eq(transactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    return updatedTransaction;
  }
  
  async updateTransactionApprovalStatus(id: number, status: string, approverId: number, rejectionReason?: string): Promise<Transaction> {
    // Get the transaction
    const transaction = await this.getTransaction(id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    // Get the wallet
    const wallet = await this.getWallet(transaction.walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${transaction.walletId} not found`);
    }
    
    // Update approval status
    const updateData: Partial<Transaction> = {
      approvalStatus: status,
      approvedBy: approverId,
      approvalDate: new Date(),
    };
    
    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      throw new Error(`Transaction with id ${id} not found after update`);
    }
    
    // If approved, update wallet balance
    if (status === "approved" && transaction.needsApproval) {
      const currentBalance = parseFloat(wallet.balance.toString());
      const transactionAmount = parseFloat(transaction.amount.toString());
      
      let newBalance: number;
      if (transaction.type === "incoming") {
        newBalance = currentBalance + transactionAmount;
      } else {
        newBalance = currentBalance - transactionAmount;
        
        // Check if there are sufficient funds
        if (newBalance < 0) {
          throw new Error("Insufficient funds in wallet");
        }
      }
      
      // Update wallet balance
      await this.updateWalletBalance(wallet.id, newBalance.toString());
    }
    
    return updatedTransaction;
  }

  // Bank account operations
  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    const [bankAccount] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return bankAccount;
  }

  async getBankAccountsByUserId(userId: number): Promise<BankAccount[]> {
    return await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId));
  }

  async createBankAccount(insertBankAccount: InsertBankAccount): Promise<BankAccount> {
    const [bankAccount] = await db.insert(bankAccounts).values(insertBankAccount).returning();
    return bankAccount;
  }

  async deleteBankAccount(id: number): Promise<void> {
    const [deletedAccount] = await db
      .delete(bankAccounts)
      .where(eq(bankAccounts.id, id))
      .returning();
    
    if (!deletedAccount) {
      throw new Error(`Bank account with id ${id} not found`);
    }
  }

  // Fund request operations
  async getFundRequest(id: number): Promise<FundRequest | undefined> {
    const [fundRequest] = await db.select().from(fundRequests).where(eq(fundRequests.id, id));
    return fundRequest;
  }

  async getFundRequestsByUserId(userId: number): Promise<FundRequest[]> {
    return await db.select().from(fundRequests).where(eq(fundRequests.requesterId, userId));
  }

  async getAllFundRequests(): Promise<FundRequest[]> {
    return await db.select().from(fundRequests);
  }

  async createFundRequest(insertFundRequest: InsertFundRequest): Promise<FundRequest> {
    const [fundRequest] = await db.insert(fundRequests).values(insertFundRequest).returning();
    return fundRequest;
  }

  async approveFundRequest(id: number, approverId: number): Promise<FundRequest> {
    // Update fund request
    const [updatedRequest] = await db
      .update(fundRequests)
      .set({ 
        approverId, 
        status: "approved",
        updatedAt: new Date()
      })
      .where(eq(fundRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Fund request with id ${id} not found`);
    }
    
    // Find the requester's wallet and allocate funds
    const requesterWallets = await this.getWalletsByUserId(updatedRequest.requesterId);
    if (requesterWallets.length === 0) {
      throw new Error(`No wallet found for user ${updatedRequest.requesterId}`);
    }
    
    // Allocate to the first wallet
    await this.allocateFunds(requesterWallets[0].id, updatedRequest.amount.toString());
    
    return updatedRequest;
  }

  async rejectFundRequest(id: number, approverId: number, reason?: string): Promise<FundRequest> {
    const [updatedRequest] = await db
      .update(fundRequests)
      .set({ 
        approverId, 
        status: "rejected",
        reason,
        updatedAt: new Date()
      })
      .where(eq(fundRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Fund request with id ${id} not found`);
    }
    
    return updatedRequest;
  }
  
  // Payroll operations
  async getPayrollEntry(id: number): Promise<PayrollEntry | undefined> {
    const [payrollEntry] = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id));
    return payrollEntry;
  }
  
  async getPayrollEntriesByUserId(userId: number): Promise<PayrollEntry[]> {
    return await db.select().from(payrollEntries).where(eq(payrollEntries.userId, userId));
  }
  
  async getPayrollEntriesByEmployerId(employerId: number): Promise<PayrollEntry[]> {
    return await db.select().from(payrollEntries).where(eq(payrollEntries.employerId, employerId));
  }
  
  async createPayrollEntry(payrollEntry: InsertPayrollEntry): Promise<PayrollEntry> {
    const [entry] = await db.insert(payrollEntries).values(payrollEntry).returning();
    return entry;
  }
  
  async updatePayrollEntryStatus(id: number, status: string): Promise<PayrollEntry> {
    const [updatedEntry] = await db
      .update(payrollEntries)
      .set({ 
        status,
        ...(status === "completed" ? { processedAt: new Date() } : {})
      })
      .where(eq(payrollEntries.id, id))
      .returning();
    
    if (!updatedEntry) {
      throw new Error(`Payroll entry with id ${id} not found`);
    }
    
    return updatedEntry;
  }
  
  async processPayrollEntry(id: number): Promise<PayrollEntry> {
    // Get the payroll entry
    const payrollEntry = await this.getPayrollEntry(id);
    if (!payrollEntry) {
      throw new Error(`Payroll entry with id ${id} not found`);
    }
    
    // Check if it's already been processed
    if (payrollEntry.status === "completed") {
      throw new Error(`Payroll entry with id ${id} has already been processed`);
    }
    
    // Get the employee's main wallet
    const wallets = await this.getWalletsByUserId(payrollEntry.userId);
    const mainWallet = wallets.find(w => w.isMain);
    
    if (!mainWallet) {
      throw new Error(`No main wallet found for user ${payrollEntry.userId}`);
    }
    
    // Process HSA contribution if applicable
    if (payrollEntry.hsaContribution && parseFloat(payrollEntry.hsaContribution.toString()) > 0) {
      // Find or create HSA wallet
      let hsaWallet = wallets.find(w => w.walletType === "hsa");
      
      if (!hsaWallet) {
        // Create an HSA wallet if one doesn't exist
        hsaWallet = await this.createWallet({
          userId: payrollEntry.userId,
          balance: "0",
          walletType: "hsa",
          isMain: false,
          taxAdvantaged: true,
        });
      }
      
      // Process employee contribution
      await this.createTransaction({
        userId: payrollEntry.userId,
        walletId: hsaWallet.id,
        type: "incoming",
        method: "ach",
        merchantName: "Payroll - HSA Contribution",
        amount: payrollEntry.hsaContribution.toString(),
        expenseType: "deposit",
        isPersonal: false,
      });
      
      // Process employer match if applicable
      if (payrollEntry.employerHsaMatch && parseFloat(payrollEntry.employerHsaMatch.toString()) > 0) {
        await this.createTransaction({
          userId: payrollEntry.userId,
          walletId: hsaWallet.id,
          type: "incoming",
          method: "ach",
          merchantName: "Payroll - Employer HSA Match",
          amount: payrollEntry.employerHsaMatch.toString(),
          expenseType: "deposit",
          isPersonal: false,
        });
      }
    }
    
    // Process retirement contribution if applicable
    if (payrollEntry.retirementContribution && parseFloat(payrollEntry.retirementContribution.toString()) > 0) {
      // Find or create retirement wallet
      let retirementWallet = wallets.find(w => w.walletType === "retirement");
      
      if (!retirementWallet) {
        // Create a retirement wallet if one doesn't exist
        retirementWallet = await this.createWallet({
          userId: payrollEntry.userId,
          balance: "0",
          walletType: "retirement",
          isMain: false,
          taxAdvantaged: true,
        });
      }
      
      // Process employee contribution
      await this.createTransaction({
        userId: payrollEntry.userId,
        walletId: retirementWallet.id,
        type: "incoming",
        method: "ach",
        merchantName: "Payroll - Retirement Contribution",
        amount: payrollEntry.retirementContribution.toString(),
        expenseType: "deposit",
        isPersonal: false,
      });
      
      // Process employer match if applicable
      if (payrollEntry.employerRetirementMatch && parseFloat(payrollEntry.employerRetirementMatch.toString()) > 0) {
        await this.createTransaction({
          userId: payrollEntry.userId,
          walletId: retirementWallet.id,
          type: "incoming",
          method: "ach",
          merchantName: "Payroll - Employer Retirement Match",
          amount: payrollEntry.employerRetirementMatch.toString(),
          expenseType: "deposit",
          isPersonal: false,
        });
      }
    }
    
    // Process main payroll deposit
    await this.createTransaction({
      userId: payrollEntry.userId,
      walletId: mainWallet.id,
      type: "incoming",
      method: "ach",
      merchantName: "Payroll - Net Pay",
      amount: payrollEntry.netPay.toString(),
      expenseType: "salary",
      isPersonal: false,
    });
    
    // Update the payroll entry as completed
    return this.updatePayrollEntryStatus(id, "completed");
  }
  
  // Time tracking operations
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    const [timeEntry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return timeEntry;
  }
  
  async getTimeEntriesByUserId(userId: number): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).where(eq(timeEntries.userId, userId));
  }
  
  async getTimeEntriesByEmployerId(employerId: number): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).where(eq(timeEntries.employerId, employerId));
  }
  
  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [entry] = await db.insert(timeEntries).values(timeEntry).returning();
    return entry;
  }
  
  async updateTimeEntryStatus(id: number, status: string): Promise<TimeEntry> {
    const [updatedEntry] = await db
      .update(timeEntries)
      .set({ status })
      .where(eq(timeEntries.id, id))
      .returning();
    
    if (!updatedEntry) {
      throw new Error(`Time entry with id ${id} not found`);
    }
    
    return updatedEntry;
  }
  
  // HSA and Retirement Account operations
  async getAccountRequest(id: number): Promise<AccountRequest | undefined> {
    const [accountRequest] = await db.select().from(accountRequests).where(eq(accountRequests.id, id));
    return accountRequest;
  }
  
  async getAccountRequestsByUserId(userId: number): Promise<AccountRequest[]> {
    return await db.select().from(accountRequests).where(eq(accountRequests.userId, userId));
  }
  
  async getAccountRequestsByEmployerId(employerId: number): Promise<AccountRequest[]> {
    return await db.select().from(accountRequests).where(eq(accountRequests.employerId, employerId));
  }
  
  async createAccountRequest(accountRequest: InsertAccountRequest): Promise<AccountRequest> {
    const [request] = await db.insert(accountRequests).values(accountRequest).returning();
    return request;
  }
  
  async approveAccountRequest(id: number): Promise<AccountRequest> {
    // Get the account request
    const accountRequest = await this.getAccountRequest(id);
    if (!accountRequest) {
      throw new Error(`Account request with id ${id} not found`);
    }
    
    // Get the wallet
    const wallet = await this.getWallet(accountRequest.walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${accountRequest.walletId} not found`);
    }
    
    // Update account request status
    const [updatedRequest] = await db
      .update(accountRequests)
      .set({ 
        status: "approved",
        approvedAt: new Date()
      })
      .where(eq(accountRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Account request with id ${id} not found after update`);
    }
    
    // Process the contribution
    await this.createTransaction({
      userId: accountRequest.userId,
      walletId: accountRequest.walletId,
      type: "incoming",
      method: "ach",
      merchantName: `${accountRequest.requestType === "hsa_contribution" ? "HSA" : "Retirement"} Contribution`,
      amount: accountRequest.amount.toString(),
      expenseType: "deposit",
      isPersonal: false,
    });
    
    // Process employer match if applicable
    if (accountRequest.employerMatchAmount && parseFloat(accountRequest.employerMatchAmount.toString()) > 0) {
      await this.createTransaction({
        userId: accountRequest.userId,
        walletId: accountRequest.walletId,
        type: "incoming",
        method: "ach",
        merchantName: `Employer ${accountRequest.requestType === "hsa_contribution" ? "HSA" : "Retirement"} Match`,
        amount: accountRequest.employerMatchAmount.toString(),
        expenseType: "deposit",
        isPersonal: false,
      });
    }
    
    return updatedRequest;
  }
  
  async rejectAccountRequest(id: number, notes?: string): Promise<AccountRequest> {
    const [updatedRequest] = await db
      .update(accountRequests)
      .set({ 
        status: "rejected",
        notes
      })
      .where(eq(accountRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Account request with id ${id} not found`);
    }
    
    return updatedRequest;
  }
  
  // Spending Controls operations
  async getSpendingControl(id: number): Promise<SpendingControl | undefined> {
    const [spendingControl] = await db.select().from(spendingControls).where(eq(spendingControls.id, id));
    return spendingControl;
  }
  
  async getSpendingControlsByWalletId(walletId: number): Promise<SpendingControl[]> {
    return await db.select().from(spendingControls).where(eq(spendingControls.walletId, walletId));
  }
  
  async getSpendingControlsByCreatedById(createdById: number): Promise<SpendingControl[]> {
    return await db.select().from(spendingControls).where(eq(spendingControls.createdById, createdById));
  }
  
  async createSpendingControl(spendingControl: InsertSpendingControl): Promise<SpendingControl> {
    const [control] = await db.insert(spendingControls).values(spendingControl).returning();
    return control;
  }
  
  async updateSpendingControl(id: number, data: Partial<InsertSpendingControl>): Promise<SpendingControl> {
    const [updatedControl] = await db
      .update(spendingControls)
      .set(data)
      .where(eq(spendingControls.id, id))
      .returning();
    
    if (!updatedControl) {
      throw new Error(`Spending control with id ${id} not found`);
    }
    
    return updatedControl;
  }
  
  async deleteSpendingControl(id: number): Promise<void> {
    const [deletedControl] = await db
      .delete(spendingControls)
      .where(eq(spendingControls.id, id))
      .returning();
    
    if (!deletedControl) {
      throw new Error(`Spending control with id ${id} not found`);
    }
  }
  
  // Educational Content operations
  async getEducationalContent(id: number): Promise<EducationalContent | undefined> {
    const [content] = await db.select().from(educationalContent).where(eq(educationalContent.id, id));
    return content;
  }
  
  async getEducationalContentByCategory(category: string): Promise<EducationalContent[]> {
    return await db.select().from(educationalContent).where(eq(educationalContent.category, category));
  }
  
  async getEducationalContentByAgeGroup(targetAgeGroup: string): Promise<EducationalContent[]> {
    return await db.select().from(educationalContent).where(eq(educationalContent.targetAgeGroup, targetAgeGroup));
  }
  
  async createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent> {
    const [newContent] = await db.insert(educationalContent).values(content).returning();
    return newContent;
  }
  
  async updateEducationalContent(id: number, data: Partial<InsertEducationalContent>): Promise<EducationalContent> {
    const [updatedContent] = await db
      .update(educationalContent)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(educationalContent.id, id))
      .returning();
    
    if (!updatedContent) {
      throw new Error(`Educational content with id ${id} not found`);
    }
    
    return updatedContent;
  }
  
  async deleteEducationalContent(id: number): Promise<void> {
    const [deletedContent] = await db
      .delete(educationalContent)
      .where(eq(educationalContent.id, id))
      .returning();
    
    if (!deletedContent) {
      throw new Error(`Educational content with id ${id} not found`);
    }
  }
  
  // Savings Goals operations
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    const [goal] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, id));
    return goal;
  }
  
  async getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]> {
    return await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId));
  }
  
  async getSavingsGoalsByWalletId(walletId: number): Promise<SavingsGoal[]> {
    return await db.select().from(savingsGoals).where(eq(savingsGoals.walletId, walletId));
  }
  
  async createSavingsGoal(savingsGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [goal] = await db.insert(savingsGoals).values(savingsGoal).returning();
    return goal;
  }
  
  async updateSavingsGoalProgress(id: number, currentAmount: string): Promise<SavingsGoal> {
    // Get the savings goal
    const goal = await this.getSavingsGoal(id);
    if (!goal) {
      throw new Error(`Savings goal with id ${id} not found`);
    }
    
    // Check if goal is already completed
    if (goal.isCompleted) {
      throw new Error(`Savings goal with id ${id} is already completed`);
    }
    
    // Parse amounts
    const targetAmount = parseFloat(goal.targetAmount.toString());
    const newCurrentAmount = parseFloat(currentAmount);
    
    // Check if goal has been reached
    const isCompleted = newCurrentAmount >= targetAmount;
    
    // Update the goal
    const [updatedGoal] = await db
      .update(savingsGoals)
      .set({ 
        currentAmount: currentAmount.toString(),
        isCompleted,
        updatedAt: new Date()
      })
      .where(eq(savingsGoals.id, id))
      .returning();
    
    if (!updatedGoal) {
      throw new Error(`Savings goal with id ${id} not found after update`);
    }
    
    // If parent matching is enabled and this is a child's goal
    if (goal.parentMatchPercentage && 
        parseFloat(goal.parentMatchPercentage.toString()) > 0) {
      // Get the child user
      const childUser = await this.getUser(goal.userId);
      if (childUser && childUser.parentId) {
        // Get the parent wallet (assuming main wallet)
        const parentWallets = await this.getWalletsByUserId(childUser.parentId);
        const parentMainWallet = parentWallets.find(w => w.isMain);
        
        if (parentMainWallet) {
          // Calculate the match amount (as a percentage of the new contribution)
          const previousAmount = parseFloat(goal.currentAmount.toString());
          const contribution = newCurrentAmount - previousAmount;
          const matchPercentage = parseFloat(goal.parentMatchPercentage.toString());
          const matchAmount = (contribution * matchPercentage / 100);
          
          if (matchAmount > 0) {
            // Transfer the match amount from parent to child
            // For now, we'll just credit the child's wallet directly
            const childWallet = await this.getWallet(goal.walletId);
            if (childWallet) {
              await this.transferBetweenWallets(
                parentMainWallet.id, 
                childWallet.id, 
                matchAmount.toString()
              );
            }
          }
        }
      }
    }
    
    return updatedGoal;
  }
  
  async completeSavingsGoal(id: number): Promise<SavingsGoal> {
    const [updatedGoal] = await db
      .update(savingsGoals)
      .set({ 
        isCompleted: true,
        updatedAt: new Date()
      })
      .where(eq(savingsGoals.id, id))
      .returning();
    
    if (!updatedGoal) {
      throw new Error(`Savings goal with id ${id} not found`);
    }
    
    return updatedGoal;
  }
  
  // Accounting Integrations operations
  async getAccountingIntegration(id: number): Promise<AccountingIntegration | undefined> {
    const [integration] = await db.select().from(accountingIntegrations).where(eq(accountingIntegrations.id, id));
    return integration;
  }
  
  async getAccountingIntegrationsByUserId(userId: number): Promise<AccountingIntegration[]> {
    return await db.select().from(accountingIntegrations).where(eq(accountingIntegrations.userId, userId));
  }
  
  async createAccountingIntegration(accountingIntegration: InsertAccountingIntegration): Promise<AccountingIntegration> {
    const [integration] = await db.insert(accountingIntegrations).values(accountingIntegration).returning();
    return integration;
  }
  
  async updateAccountingIntegration(id: number, data: Partial<InsertAccountingIntegration>): Promise<AccountingIntegration> {
    const [updatedIntegration] = await db
      .update(accountingIntegrations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(accountingIntegrations.id, id))
      .returning();
    
    if (!updatedIntegration) {
      throw new Error(`Accounting integration with id ${id} not found`);
    }
    
    return updatedIntegration;
  }
  
  async deleteAccountingIntegration(id: number): Promise<void> {
    const [deletedIntegration] = await db
      .delete(accountingIntegrations)
      .where(eq(accountingIntegrations.id, id))
      .returning();
    
    if (!deletedIntegration) {
      throw new Error(`Accounting integration with id ${id} not found`);
    }
  }

  // Merchant Profile operations
  async getMerchantProfile(id: number): Promise<MerchantProfile | undefined> {
    const [merchantProfile] = await db.select().from(merchantProfiles).where(eq(merchantProfiles.id, id));
    return merchantProfile;
  }

  async getMerchantProfileByUserId(userId: number): Promise<MerchantProfile | undefined> {
    const [merchantProfile] = await db.select().from(merchantProfiles).where(eq(merchantProfiles.userId, userId));
    return merchantProfile;
  }

  async getMerchantProfilesByStatus(status: string): Promise<MerchantProfile[]> {
    return await db.select().from(merchantProfiles).where(eq(merchantProfiles.status as any, status));
  }

  async createMerchantProfile(merchantProfile: InsertMerchantProfile): Promise<MerchantProfile> {
    const [newMerchantProfile] = await db.insert(merchantProfiles).values(merchantProfile).returning();
    return newMerchantProfile;
  }

  async updateMerchantProfile(id: number, data: Partial<InsertMerchantProfile>): Promise<MerchantProfile> {
    const [updatedMerchantProfile] = await db
      .update(merchantProfiles)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(merchantProfiles.id, id))
      .returning();

    if (!updatedMerchantProfile) {
      throw new Error(`Merchant profile with id ${id} not found`);
    }

    return updatedMerchantProfile;
  }

  async updateMerchantStatus(id: number, status: string): Promise<MerchantProfile> {
    const [updatedMerchantProfile] = await db
      .update(merchantProfiles)
      .set({
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(merchantProfiles.id, id))
      .returning();

    if (!updatedMerchantProfile) {
      throw new Error(`Merchant profile with id ${id} not found`);
    }

    return updatedMerchantProfile;
  }

  async updateVerificationStatus(id: number, verificationStatus: string, verificationDocuments?: any): Promise<MerchantProfile> {
    const updateData: any = {
      verificationStatus,
      updatedAt: new Date()
    };

    if (verificationDocuments) {
      updateData.verificationDocuments = verificationDocuments;
    }

    const [updatedMerchantProfile] = await db
      .update(merchantProfiles)
      .set(updateData)
      .where(eq(merchantProfiles.id, id))
      .returning();

    if (!updatedMerchantProfile) {
      throw new Error(`Merchant profile with id ${id} not found`);
    }

    return updatedMerchantProfile;
  }

  // Payment Gateway operations
  async getPaymentGateway(id: number): Promise<PaymentGateway | undefined> {
    const [paymentGateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    return paymentGateway;
  }

  async getPaymentGatewaysByMerchantId(merchantId: number): Promise<PaymentGateway[]> {
    return await db.select().from(paymentGateways).where(eq(paymentGateways.merchantId, merchantId));
  }

  async createPaymentGateway(paymentGateway: InsertPaymentGateway): Promise<PaymentGateway> {
    const [newPaymentGateway] = await db.insert(paymentGateways).values(paymentGateway).returning();
    return newPaymentGateway;
  }

  async updatePaymentGateway(id: number, data: Partial<InsertPaymentGateway>): Promise<PaymentGateway> {
    const [updatedPaymentGateway] = await db
      .update(paymentGateways)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(paymentGateways.id, id))
      .returning();

    if (!updatedPaymentGateway) {
      throw new Error(`Payment gateway with id ${id} not found`);
    }

    return updatedPaymentGateway;
  }

  async deletePaymentGateway(id: number): Promise<void> {
    const [deletedPaymentGateway] = await db
      .delete(paymentGateways)
      .where(eq(paymentGateways.id, id))
      .returning();

    if (!deletedPaymentGateway) {
      throw new Error(`Payment gateway with id ${id} not found`);
    }
  }

  // Point of Sale operations
  async getPointOfSaleSystem(id: number): Promise<PointOfSaleSystem | undefined> {
    const [pointOfSaleSystem] = await db.select().from(pointOfSaleSystems).where(eq(pointOfSaleSystems.id, id));
    return pointOfSaleSystem;
  }

  async getPointOfSaleSystemsByMerchantId(merchantId: number): Promise<PointOfSaleSystem[]> {
    return await db.select().from(pointOfSaleSystems).where(eq(pointOfSaleSystems.merchantId, merchantId));
  }

  async createPointOfSaleSystem(posSystem: InsertPointOfSaleSystem): Promise<PointOfSaleSystem> {
    const [newPointOfSaleSystem] = await db.insert(pointOfSaleSystems).values(posSystem).returning();
    return newPointOfSaleSystem;
  }

  async updatePointOfSaleSystem(id: number, data: Partial<InsertPointOfSaleSystem>): Promise<PointOfSaleSystem> {
    const [updatedPointOfSaleSystem] = await db
      .update(pointOfSaleSystems)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(pointOfSaleSystems.id, id))
      .returning();

    if (!updatedPointOfSaleSystem) {
      throw new Error(`Point of sale system with id ${id} not found`);
    }

    return updatedPointOfSaleSystem;
  }

  async updatePointOfSaleLastCheckIn(id: number): Promise<PointOfSaleSystem> {
    const [updatedPointOfSaleSystem] = await db
      .update(pointOfSaleSystems)
      .set({
        lastCheckIn: new Date(),
        updatedAt: new Date()
      })
      .where(eq(pointOfSaleSystems.id, id))
      .returning();

    if (!updatedPointOfSaleSystem) {
      throw new Error(`Point of sale system with id ${id} not found`);
    }

    return updatedPointOfSaleSystem;
  }

  async deletePointOfSaleSystem(id: number): Promise<void> {
    const [deletedPointOfSaleSystem] = await db
      .delete(pointOfSaleSystems)
      .where(eq(pointOfSaleSystems.id, id))
      .returning();

    if (!deletedPointOfSaleSystem) {
      throw new Error(`Point of sale system with id ${id} not found`);
    }
  }

  // Loyalty Program operations
  async getLoyaltyProgram(id: number): Promise<LoyaltyProgram | undefined> {
    const [loyaltyProgram] = await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.id, id));
    return loyaltyProgram;
  }

  async getLoyaltyProgramsByMerchantId(merchantId: number): Promise<LoyaltyProgram[]> {
    return await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.merchantId, merchantId));
  }

  async getActiveLoyaltyPrograms(): Promise<LoyaltyProgram[]> {
    return await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.isActive, true));
  }

  async createLoyaltyProgram(loyaltyProgram: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const [newLoyaltyProgram] = await db.insert(loyaltyPrograms).values(loyaltyProgram).returning();
    return newLoyaltyProgram;
  }

  async updateLoyaltyProgram(id: number, data: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram> {
    const [updatedLoyaltyProgram] = await db
      .update(loyaltyPrograms)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(loyaltyPrograms.id, id))
      .returning();

    if (!updatedLoyaltyProgram) {
      throw new Error(`Loyalty program with id ${id} not found`);
    }

    return updatedLoyaltyProgram;
  }

  async deactivateLoyaltyProgram(id: number): Promise<LoyaltyProgram> {
    const [updatedLoyaltyProgram] = await db
      .update(loyaltyPrograms)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(loyaltyPrograms.id, id))
      .returning();

    if (!updatedLoyaltyProgram) {
      throw new Error(`Loyalty program with id ${id} not found`);
    }

    return updatedLoyaltyProgram;
  }

  // Customer Loyalty Account operations
  async getCustomerLoyaltyAccount(id: number): Promise<CustomerLoyaltyAccount | undefined> {
    const [loyaltyAccount] = await db.select().from(customerLoyaltyAccounts).where(eq(customerLoyaltyAccounts.id, id));
    return loyaltyAccount;
  }

  async getCustomerLoyaltyAccountsByUserId(userId: number): Promise<CustomerLoyaltyAccount[]> {
    return await db.select().from(customerLoyaltyAccounts).where(eq(customerLoyaltyAccounts.userId, userId));
  }

  async getCustomerLoyaltyAccountsByProgramId(programId: number): Promise<CustomerLoyaltyAccount[]> {
    return await db.select().from(customerLoyaltyAccounts).where(eq(customerLoyaltyAccounts.programId, programId));
  }

  async createCustomerLoyaltyAccount(account: InsertCustomerLoyaltyAccount): Promise<CustomerLoyaltyAccount> {
    const [newLoyaltyAccount] = await db.insert(customerLoyaltyAccounts).values(account).returning();
    return newLoyaltyAccount;
  }

  async updateLoyaltyPoints(id: number, pointsToAdd: number): Promise<CustomerLoyaltyAccount> {
    const account = await this.getCustomerLoyaltyAccount(id);
    if (!account) {
      throw new Error(`Customer loyalty account with id ${id} not found`);
    }

    const newPointsBalance = account.pointsBalance + pointsToAdd;
    const newLifetimePoints = account.lifetimePoints + (pointsToAdd > 0 ? pointsToAdd : 0);

    const [updatedAccount] = await db
      .update(customerLoyaltyAccounts)
      .set({
        pointsBalance: newPointsBalance,
        lifetimePoints: newLifetimePoints,
        lastActivityDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(customerLoyaltyAccounts.id, id))
      .returning();

    return updatedAccount;
  }

  async updateLoyaltyVisits(id: number, visitsToAdd: number): Promise<CustomerLoyaltyAccount> {
    const account = await this.getCustomerLoyaltyAccount(id);
    if (!account) {
      throw new Error(`Customer loyalty account with id ${id} not found`);
    }

    const newVisitsCount = account.visitsCount + visitsToAdd;

    const [updatedAccount] = await db
      .update(customerLoyaltyAccounts)
      .set({
        visitsCount: newVisitsCount,
        lastActivityDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(customerLoyaltyAccounts.id, id))
      .returning();

    return updatedAccount;
  }

  async updateLoyaltyTier(id: number, tier: string, expirationDate?: Date): Promise<CustomerLoyaltyAccount> {
    const [updatedAccount] = await db
      .update(customerLoyaltyAccounts)
      .set({
        currentTier: tier,
        tierExpirationDate: expirationDate,
        updatedAt: new Date()
      })
      .where(eq(customerLoyaltyAccounts.id, id))
      .returning();

    if (!updatedAccount) {
      throw new Error(`Customer loyalty account with id ${id} not found`);
    }

    return updatedAccount;
  }

  async deactivateLoyaltyAccount(id: number): Promise<CustomerLoyaltyAccount> {
    const [updatedAccount] = await db
      .update(customerLoyaltyAccounts)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(customerLoyaltyAccounts.id, id))
      .returning();

    if (!updatedAccount) {
      throw new Error(`Customer loyalty account with id ${id} not found`);
    }

    return updatedAccount;
  }

  // Promotional Campaign operations
  async getPromotionalCampaign(id: number): Promise<PromotionalCampaign | undefined> {
    const [campaign] = await db.select().from(promotionalCampaigns).where(eq(promotionalCampaigns.id, id));
    return campaign;
  }

  async getPromotionalCampaignsByMerchantId(merchantId: number): Promise<PromotionalCampaign[]> {
    return await db.select().from(promotionalCampaigns).where(eq(promotionalCampaigns.merchantId, merchantId));
  }

  async getActivePromotionalCampaigns(): Promise<PromotionalCampaign[]> {
    const now = new Date();
    return await db
      .select()
      .from(promotionalCampaigns)
      .where(eq(promotionalCampaigns.isActive, true));
  }

  async getLocationBasedCampaigns(latitude: number, longitude: number, radius: number): Promise<PromotionalCampaign[]> {
    // This would normally use a spatial query, but for simplicity we'll just return active campaigns marked as location-based
    // In a real implementation, you would use a GIS extension or calculate distances between points
    const campaigns = await db
      .select()
      .from(promotionalCampaigns)
      .where(eq(promotionalCampaigns.isActive, true));
    
    // Filter campaigns by type after the database query to avoid TypeScript errors
    return campaigns.filter(campaign => campaign.campaignType === "location_based");
  }

  async createPromotionalCampaign(campaign: InsertPromotionalCampaign): Promise<PromotionalCampaign> {
    const [newCampaign] = await db.insert(promotionalCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async updatePromotionalCampaign(id: number, data: Partial<InsertPromotionalCampaign>): Promise<PromotionalCampaign> {
    const [updatedCampaign] = await db
      .update(promotionalCampaigns)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(promotionalCampaigns.id, id))
      .returning();

    if (!updatedCampaign) {
      throw new Error(`Promotional campaign with id ${id} not found`);
    }

    return updatedCampaign;
  }

  async incrementCampaignRedemptions(id: number): Promise<PromotionalCampaign> {
    const campaign = await this.getPromotionalCampaign(id);
    if (!campaign) {
      throw new Error(`Promotional campaign with id ${id} not found`);
    }

    const newCount = campaign.currentRedemptions + 1;
    
    // If campaign has a max redemption limit and we've reached it, deactivate the campaign
    const shouldDeactivate = campaign.maxRedemptions !== null && campaign.maxRedemptions !== undefined && newCount >= campaign.maxRedemptions;

    const [updatedCampaign] = await db
      .update(promotionalCampaigns)
      .set({
        currentRedemptions: newCount,
        isActive: shouldDeactivate ? false : campaign.isActive,
        updatedAt: new Date()
      })
      .where(eq(promotionalCampaigns.id, id))
      .returning();

    return updatedCampaign;
  }

  async deactivatePromotionalCampaign(id: number): Promise<PromotionalCampaign> {
    const [updatedCampaign] = await db
      .update(promotionalCampaigns)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(promotionalCampaigns.id, id))
      .returning();

    if (!updatedCampaign) {
      throw new Error(`Promotional campaign with id ${id} not found`);
    }

    return updatedCampaign;
  }

  // Analytics Reports operations
  async getAnalyticsReport(id: number): Promise<AnalyticsReport | undefined> {
    const [report] = await db.select().from(analyticsReports).where(eq(analyticsReports.id, id));
    return report;
  }

  async getAnalyticsReportsByMerchantId(merchantId: number): Promise<AnalyticsReport[]> {
    return await db.select().from(analyticsReports).where(eq(analyticsReports.merchantId, merchantId));
  }

  async createAnalyticsReport(report: InsertAnalyticsReport): Promise<AnalyticsReport> {
    const [newReport] = await db.insert(analyticsReports).values(report).returning();
    return newReport;
  }

  async updateAnalyticsReport(id: number, data: Partial<InsertAnalyticsReport>): Promise<AnalyticsReport> {
    const [updatedReport] = await db
      .update(analyticsReports)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(analyticsReports.id, id))
      .returning();

    if (!updatedReport) {
      throw new Error(`Analytics report with id ${id} not found`);
    }

    return updatedReport;
  }

  async generateAnalyticsReport(id: number, reportData: any): Promise<AnalyticsReport> {
    const [updatedReport] = await db
      .update(analyticsReports)
      .set({
        reportData,
        lastGenerated: new Date(),
        updatedAt: new Date()
      })
      .where(eq(analyticsReports.id, id))
      .returning();

    if (!updatedReport) {
      throw new Error(`Analytics report with id ${id} not found`);
    }

    return updatedReport;
  }

  async deleteAnalyticsReport(id: number): Promise<void> {
    const [deletedReport] = await db
      .delete(analyticsReports)
      .where(eq(analyticsReports.id, id))
      .returning();

    if (!deletedReport) {
      throw new Error(`Analytics report with id ${id} not found`);
    }
  }

  // Business Financing operations
  async getBusinessFinancing(id: number): Promise<BusinessFinancing | undefined> {
    const [financing] = await db.select().from(businessFinancing).where(eq(businessFinancing.id, id));
    return financing;
  }

  async getBusinessFinancingsByMerchantId(merchantId: number): Promise<BusinessFinancing[]> {
    return await db.select().from(businessFinancing).where(eq(businessFinancing.merchantId, merchantId));
  }

  async getBusinessFinancingsByStatus(status: string): Promise<BusinessFinancing[]> {
    return await db.select().from(businessFinancing).where(eq(businessFinancing.status as any, status));
  }

  async createBusinessFinancing(financing: InsertBusinessFinancing): Promise<BusinessFinancing> {
    const [newFinancing] = await db.insert(businessFinancing).values(financing).returning();
    return newFinancing;
  }

  async updateBusinessFinancingStatus(id: number, status: string): Promise<BusinessFinancing> {
    const [updatedFinancing] = await db
      .update(businessFinancing)
      .set({
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(businessFinancing.id, id))
      .returning();

    if (!updatedFinancing) {
      throw new Error(`Business financing with id ${id} not found`);
    }

    return updatedFinancing;
  }

  async updateBusinessFinancingRepayment(id: number, amountPaid: string): Promise<BusinessFinancing> {
    const financing = await this.getBusinessFinancing(id);
    if (!financing) {
      throw new Error(`Business financing with id ${id} not found`);
    }

    // Convert to numbers for calculation
    const currentRepaid = parseFloat(financing.totalRepaid?.toString() || "0");
    const paymentAmount = parseFloat(amountPaid);
    const newTotalRepaid = (currentRepaid + paymentAmount).toString();

    const [updatedFinancing] = await db
      .update(businessFinancing)
      .set({
        totalRepaid: newTotalRepaid,
        updatedAt: new Date()
      })
      .where(eq(businessFinancing.id, id))
      .returning();

    return updatedFinancing;
  }

  // Virtual Terminal operations
  async getVirtualTerminal(id: number): Promise<VirtualTerminal | undefined> {
    const [terminal] = await db.select().from(virtualTerminals).where(eq(virtualTerminals.id, id));
    return terminal;
  }

  async getVirtualTerminalsByMerchantId(merchantId: number): Promise<VirtualTerminal[]> {
    return await db.select().from(virtualTerminals).where(eq(virtualTerminals.merchantId, merchantId));
  }

  async createVirtualTerminal(terminal: InsertVirtualTerminal): Promise<VirtualTerminal> {
    const [newTerminal] = await db.insert(virtualTerminals).values(terminal).returning();
    return newTerminal;
  }

  async updateVirtualTerminal(id: number, data: Partial<InsertVirtualTerminal>): Promise<VirtualTerminal> {
    const [updatedTerminal] = await db
      .update(virtualTerminals)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(virtualTerminals.id, id))
      .returning();

    if (!updatedTerminal) {
      throw new Error(`Virtual terminal with id ${id} not found`);
    }

    return updatedTerminal;
  }

  async recordVirtualTerminalAccess(id: number, userId: number, ipAddress: string): Promise<VirtualTerminal> {
    const [updatedTerminal] = await db
      .update(virtualTerminals)
      .set({
        lastAccessedAt: new Date(),
        lastAccessedByUserId: userId,
        lastAccessedIp: ipAddress,
        updatedAt: new Date()
      })
      .where(eq(virtualTerminals.id, id))
      .returning();

    if (!updatedTerminal) {
      throw new Error(`Virtual terminal with id ${id} not found`);
    }

    return updatedTerminal;
  }

  async deactivateVirtualTerminal(id: number): Promise<VirtualTerminal> {
    const [updatedTerminal] = await db
      .update(virtualTerminals)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(virtualTerminals.id, id))
      .returning();

    if (!updatedTerminal) {
      throw new Error(`Virtual terminal with id ${id} not found`);
    }

    return updatedTerminal;
  }

  // Affiliate Profile operations
  async getAffiliateProfile(id: number): Promise<AffiliateProfile | undefined> {
    const [profile] = await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.id, id));
    return profile;
  }

  async getAffiliateProfileByUserId(userId: number): Promise<AffiliateProfile | undefined> {
    const [profile] = await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.userId, userId));
    return profile;
  }

  async getAffiliateProfileByReferralCode(referralCode: string): Promise<AffiliateProfile | undefined> {
    const [profile] = await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.referralCode, referralCode));
    return profile;
  }

  async getAllAffiliateProfiles(): Promise<AffiliateProfile[]> {
    return await db.select().from(affiliateProfiles);
  }

  async getActiveAffiliateProfiles(): Promise<AffiliateProfile[]> {
    return await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.isActive, true));
  }

  async createAffiliateProfile(profile: InsertAffiliateProfile): Promise<AffiliateProfile> {
    const [newProfile] = await db.insert(affiliateProfiles).values({
      ...profile,
      // Set initial metrics
      totalEarned: "0",
      pendingPayouts: "0",
      lifetimeReferrals: 0,
      activeReferrals: 0,
      updatedAt: new Date()
    }).returning();
    
    return newProfile;
  }

  async updateAffiliateProfile(id: number, data: Partial<InsertAffiliateProfile>): Promise<AffiliateProfile> {
    const [profile] = await db
      .update(affiliateProfiles)
      .set({ 
        ...data,
        updatedAt: new Date() 
      })
      .where(eq(affiliateProfiles.id, id))
      .returning();
    
    if (!profile) {
      throw new Error(`Affiliate profile with id ${id} not found`);
    }
    
    return profile;
  }

  async updateAffiliateStats(
    id: number, 
    totalEarned?: string, 
    pendingPayouts?: string, 
    lifetimeReferrals?: number, 
    activeReferrals?: number
  ): Promise<AffiliateProfile> {
    const updateData: Partial<AffiliateProfile> = {
      updatedAt: new Date()
    };
    
    if (totalEarned !== undefined) {
      updateData.totalEarned = totalEarned;
    }
    
    if (pendingPayouts !== undefined) {
      updateData.pendingPayouts = pendingPayouts;
    }
    
    if (lifetimeReferrals !== undefined) {
      updateData.lifetimeReferrals = lifetimeReferrals;
    }
    
    if (activeReferrals !== undefined) {
      updateData.activeReferrals = activeReferrals;
    }
    
    const [profile] = await db
      .update(affiliateProfiles)
      .set(updateData)
      .where(eq(affiliateProfiles.id, id))
      .returning();
    
    if (!profile) {
      throw new Error(`Affiliate profile with id ${id} not found`);
    }
    
    return profile;
  }

  // Merchant Referral operations
  async getMerchantReferral(id: number): Promise<MerchantReferral | undefined> {
    const [referral] = await db.select().from(merchantReferrals).where(eq(merchantReferrals.id, id));
    return referral;
  }

  async getMerchantReferralsByAffiliateId(affiliateId: number): Promise<MerchantReferral[]> {
    return await db.select().from(merchantReferrals).where(eq(merchantReferrals.affiliateId, affiliateId));
  }

  async getMerchantReferralsByMerchantId(merchantId: number): Promise<MerchantReferral[]> {
    return await db.select().from(merchantReferrals).where(eq(merchantReferrals.merchantId, merchantId));
  }

  async getMerchantReferralsByStatus(status: string): Promise<MerchantReferral[]> {
    return await db.select().from(merchantReferrals).where(eq(merchantReferrals.status as any, status));
  }

  async createMerchantReferral(referral: InsertMerchantReferral): Promise<MerchantReferral> {
    const [newReferral] = await db.insert(merchantReferrals).values({
      ...referral,
      dateReferred: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Update the affiliate's lifetime referrals count
    const affiliate = await this.getAffiliateProfile(referral.affiliateId);
    if (affiliate) {
      await this.updateAffiliateStats(
        affiliate.id,
        undefined,
        undefined,
        (affiliate.lifetimeReferrals || 0) + 1,
        undefined
      );
    }
    
    return newReferral;
  }

  async updateMerchantReferralStatus(id: number, status: "pending" | "active" | "churned" | "suspended"): Promise<MerchantReferral> {
    const referral = await this.getMerchantReferral(id);
    if (!referral) {
      throw new Error(`Merchant referral with id ${id} not found`);
    }
    
    // Check status transition
    if (status === "active" && referral.status !== "active") {
      // If activating, set the activation date
      const [updatedReferral] = await db
        .update(merchantReferrals)
        .set({
          status,
          activationDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(merchantReferrals.id, id))
        .returning();
      
      // Update the affiliate's active referrals count
      const affiliate = await this.getAffiliateProfile(referral.affiliateId);
      if (affiliate) {
        await this.updateAffiliateStats(
          affiliate.id,
          undefined,
          undefined,
          undefined,
          (affiliate.activeReferrals || 0) + 1
        );
      }
      
      return updatedReferral;
    } else if (status === "churned" && referral.status === "active") {
      // If churning, set the churn date
      const [updatedReferral] = await db
        .update(merchantReferrals)
        .set({
          status,
          churnDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(merchantReferrals.id, id))
        .returning();
      
      // Update the affiliate's active referrals count
      const affiliate = await this.getAffiliateProfile(referral.affiliateId);
      if (affiliate && affiliate.activeReferrals && affiliate.activeReferrals > 0) {
        await this.updateAffiliateStats(
          affiliate.id,
          undefined,
          undefined,
          undefined,
          affiliate.activeReferrals - 1
        );
      }
      
      return updatedReferral;
    } else {
      // Simple status update for other transitions
      const [updatedReferral] = await db
        .update(merchantReferrals)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(merchantReferrals.id, id))
        .returning();
      
      return updatedReferral;
    }
  }

  async updateMerchantReferralMilestone(id: number, milestoneName: string, reached: boolean): Promise<MerchantReferral> {
    const referral = await this.getMerchantReferral(id);
    if (!referral) {
      throw new Error(`Merchant referral with id ${id} not found`);
    }
    
    const updateData: Partial<MerchantReferral> = {
      updatedAt: new Date()
    };
    
    // Set the appropriate milestone field
    switch (milestoneName) {
      case "seven_day":
        updateData.sevenDayMilestoneReached = reached;
        break;
      case "thirty_day":
        updateData.thirtyDayMilestoneReached = reached;
        break;
      case "ninety_day":
        updateData.ninetyDayMilestoneReached = reached;
        break;
      case "one_eighty_day":
        updateData.oneEightyDayMilestoneReached = reached;
        break;
      case "three_sixty_five_day":
        updateData.threeSixtyFiveDayMilestoneReached = reached;
        break;
      default:
        throw new Error(`Unknown milestone name: ${milestoneName}`);
    }
    
    const [updatedReferral] = await db
      .update(merchantReferrals)
      .set(updateData)
      .where(eq(merchantReferrals.id, id))
      .returning();
    
    return updatedReferral;
  }

  async updateMerchantReferralVolume(id: number, period: string, volume: string): Promise<MerchantReferral> {
    const referral = await this.getMerchantReferral(id);
    if (!referral) {
      throw new Error(`Merchant referral with id ${id} not found`);
    }
    
    const updateData: Partial<MerchantReferral> = {
      updatedAt: new Date(),
      lastTransactionDate: new Date()
    };
    
    // Set the appropriate volume field
    switch (period) {
      case "7_days":
        updateData.transactionVolume7Days = volume;
        break;
      case "30_days":
        updateData.transactionVolume30Days = volume;
        break;
      case "90_days":
        updateData.transactionVolume90Days = volume;
        break;
      case "180_days":
        updateData.transactionVolume180Days = volume;
        break;
      case "monthly":
        updateData.transactionVolumeMonthly = volume;
        break;
      default:
        throw new Error(`Unknown period: ${period}`);
    }
    
    const [updatedReferral] = await db
      .update(merchantReferrals)
      .set(updateData)
      .where(eq(merchantReferrals.id, id))
      .returning();
    
    return updatedReferral;
  }

  // Affiliate Payout operations
  async getAffiliatePayout(id: number): Promise<AffiliatePayout | undefined> {
    const [payout] = await db.select().from(affiliatePayouts).where(eq(affiliatePayouts.id, id));
    return payout;
  }

  async getAffiliatePayoutsByAffiliateId(affiliateId: number): Promise<AffiliatePayout[]> {
    return await db.select().from(affiliatePayouts).where(eq(affiliatePayouts.affiliateId, affiliateId));
  }

  async getAffiliatePayoutsByStatus(status: "pending" | "paid" | "clawed_back" | "canceled"): Promise<AffiliatePayout[]> {
    return await db.select().from(affiliatePayouts).where(eq(affiliatePayouts.status, status));
  }

  async getAffiliatePayoutsByReferralId(referralId: number): Promise<AffiliatePayout[]> {
    return await db.select().from(affiliatePayouts).where(eq(affiliatePayouts.referralId, referralId));
  }

  async createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout> {
    const [newPayout] = await db.insert(affiliatePayouts).values({
      ...payout,
      updatedAt: new Date()
    }).returning();
    
    // Update the affiliate's pending payouts
    const affiliate = await this.getAffiliateProfile(payout.affiliateId);
    if (affiliate) {
      const currentPending = parseFloat(affiliate.pendingPayouts || "0");
      const payoutAmount = parseFloat(payout.amount || "0");
      const newPendingAmount = (currentPending + payoutAmount).toString();
      
      await this.updateAffiliateStats(
        affiliate.id,
        undefined,
        newPendingAmount,
        undefined,
        undefined
      );
    }
    
    return newPayout;
  }

  async updateAffiliatePayoutStatus(id: number, status: "pending" | "paid" | "clawed_back" | "canceled"): Promise<AffiliatePayout> {
    const [payout] = await db
      .update(affiliatePayouts)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(affiliatePayouts.id, id))
      .returning();
    
    if (!payout) {
      throw new Error(`Affiliate payout with id ${id} not found`);
    }
    
    return payout;
  }

  async markAffiliatePayoutAsPaid(id: number, transactionId: string): Promise<AffiliatePayout> {
    const payout = await this.getAffiliatePayout(id);
    if (!payout) {
      throw new Error(`Affiliate payout with id ${id} not found`);
    }
    
    // Convert processedDate to a string format that Drizzle can handle
    const now = new Date();
    const processedDateStr = now.toISOString();
    
    const [updatedPayout] = await db
      .update(affiliatePayouts)
      .set({
        status: "paid",
        processedDate: processedDateStr,
        transactionId,
        updatedAt: now
      })
      .where(eq(affiliatePayouts.id, id))
      .returning();
    
    // Update affiliate stats
    const affiliate = await this.getAffiliateProfile(payout.affiliateId);
    if (affiliate) {
      const payoutAmount = parseFloat(payout.amount);
      
      // Increase total earned
      const currentTotal = parseFloat(affiliate.totalEarned || "0");
      const newTotal = (currentTotal + payoutAmount).toString();
      
      // Decrease pending payouts
      const currentPending = parseFloat(affiliate.pendingPayouts || "0");
      const newPending = Math.max(0, currentPending - payoutAmount).toString();
      
      await this.updateAffiliateStats(
        affiliate.id,
        newTotal,
        newPending,
        undefined,
        undefined
      );
    }
    
    return updatedPayout;
  }

  async clawbackAffiliatePayout(id: number, notes?: string): Promise<AffiliatePayout> {
    const payout = await this.getAffiliatePayout(id);
    if (!payout) {
      throw new Error(`Affiliate payout with id ${id} not found`);
    }
    
    // Use an ISO string for updatedAt to match expected SQL type
    const updatedAtStr = new Date().toISOString();
    
    const [updatedPayout] = await db
      .update(affiliatePayouts)
      .set({
        status: "clawed_back",
        notes: notes || "Payout clawed back",
        // Cast updatedAt to any to bypass TypeScript's type checking
        updatedAt: updatedAtStr as any
      })
      .where(eq(affiliatePayouts.id, id))
      .returning();
    
    // Only update affiliate stats if the payout was pending
    if (payout.status === "pending") {
      const affiliate = await this.getAffiliateProfile(payout.affiliateId);
      if (affiliate) {
        const payoutAmount = parseFloat(payout.amount);
        
        // Decrease pending payouts
        const currentPending = parseFloat(affiliate.pendingPayouts || "0");
        const newPending = Math.max(0, currentPending - payoutAmount).toString();
        
        await this.updateAffiliateStats(
          affiliate.id,
          undefined,
          newPending,
          undefined,
          undefined
        );
      }
    } else if (payout.status === "paid") {
      // If it was already paid, we might need to track a negative adjustment
      // in a real system, but we'll keep it simple here
      console.log(`Clawed back a paid payout: ${id}. In a real system, this might need additional accounting adjustments.`);
    }
    
    return updatedPayout;
  }
}

// Export a new instance of the DatabaseStorage
export const storage = new DatabaseStorage();
