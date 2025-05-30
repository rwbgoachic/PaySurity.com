import { 
  users, wallets, transactions, bankAccounts, fundRequests, 
  payrollEntries, timeEntries, accountRequests, spendingControls, 
  educationalContent, savingsGoals, accountingIntegrations,
  expenseReports, expenseLineItems,
  // ISO Partner entities
  isoPartners, merchants, commissions, trainingDocuments, supportTickets,
  // New merchant and value-added service entities
  merchantProfiles, paymentGateways, pointOfSaleSystems, loyaltyPrograms, 
  customerLoyaltyAccounts, promotionalCampaigns, analyticsReports,
  businessFinancing, virtualTerminals, merchantApplications, merchantTransactions,
  // Affiliate system entities
  affiliateProfiles, merchantReferrals, affiliatePayouts,
  // Tax calculation system entities
  federalTaxBrackets, stateTaxBrackets, ficaRates, taxAllowances,
  employeeTaxProfiles, taxCalculations,
  // POS Tenant entities
  posTenants,
  // POS system entities
  posLocations, posCategories, posInventoryItems, posMenuItems, 
  posMenuItemModifiers, posTables, posAreas, posStaff, posOrders, 
  posOrderItems, posPayments, posStaffAvailability, posScheduleTemplates,
  posTemplateShifts, posTimeOffRequests,
  // Restaurant POS entities
  restaurantTables, restaurantOrders, restaurantOrderItems, 
  restaurantInventoryItems, restaurantInventoryTransactions,
  // Appointment scheduling
  demoRequests,
  // Analytics tracking
  clickEvents,
  // HubSpot integration entities
  hubspotTokens,
  // Family wallet system entities
  familyGroups, familyMembers, allowances, spendingRules, 
  familyTasks, spendingRequests,
  
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
  type ExpenseReport, type InsertExpenseReport,
  type ExpenseLineItem, type InsertExpenseLineItem,
  
  // ISO Partner types
  type IsoPartner, type InsertIsoPartner,
  type Merchant, type InsertMerchant,
  type Commission, type InsertCommission,
  type TrainingDocument, type InsertTrainingDocument,
  type SupportTicket, type InsertSupportTicket,
  
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
  type MerchantApplication, type InsertMerchantApplication,
  type MerchantTransaction, type InsertMerchantTransaction,
  
  // Affiliate system types
  type AffiliateProfile, type InsertAffiliateProfile,
  type MerchantReferral, type InsertMerchantReferral,
  type AffiliatePayout, type InsertAffiliatePayout,
  
  // Tax calculation system types
  type FederalTaxBracket, type InsertFederalTaxBracket,
  type StateTaxBracket, type InsertStateTaxBracket,
  type FicaRate, type InsertFicaRate,
  type TaxAllowance, type InsertTaxAllowance,
  type EmployeeTaxProfile, type InsertEmployeeTaxProfile,
  type TaxCalculation, type InsertTaxCalculation,
  
  // POS Tenant types
  type PosTenant, type InsertPosTenant,
  
  // POS system types
  type PosLocation, type InsertPosLocation,
  type PosCategory, type InsertPosCategory,
  type PosInventoryItem, type InsertPosInventoryItem,
  type PosMenuItem, type InsertPosMenuItem,
  type PosMenuItemModifier, type InsertPosMenuItemModifier,
  type PosTable, type InsertPosTable,
  type PosArea, type InsertPosArea,
  type PosStaff, type InsertPosStaff,
  type PosOrder, type InsertPosOrder,
  type PosOrderItem, type InsertPosOrderItem,
  type PosPayment, type InsertPosPayment,
  type PosStaffAvailability, type InsertPosStaffAvailability,
  type PosScheduleTemplate, type InsertPosScheduleTemplate,
  type PosTemplateShift, type InsertPosTemplateShift,
  type PosTimeOffRequest, type InsertPosTimeOffRequest,
  
  // Restaurant POS types
  type RestaurantTable, type InsertRestaurantTable,
  type RestaurantOrder, type InsertRestaurantOrder,
  type RestaurantOrderItem, type InsertRestaurantOrderItem,
  type RestaurantInventoryItem, type InsertRestaurantInventoryItem,
  type RestaurantInventoryTransaction, type InsertRestaurantInventoryTransaction,
  
  // Analytics tracking types
  type ClickEvent, type InsertClickEvent,
  
  // Demo request types
  type DemoRequest, type InsertDemoRequest,
  
  // HubSpot integration types
  type HubspotToken, type InsertHubspotToken,
  
  // Family wallet system types
  type FamilyGroup, type InsertFamilyGroup,
  type FamilyMember, type InsertFamilyMember,
  type Allowance, type InsertAllowance,
  type SpendingRules, type InsertSpendingRules,
  type FamilyTask, type InsertFamilyTask,
  type SpendingRequest, type InsertSpendingRequest
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and, gte, lte, or, desc, asc, isNull, ne, gt, count, sql, inArray } from "drizzle-orm";
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
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // HubSpot operations
  getHubSpotToken(userId: number): Promise<any | undefined>;
  saveHubSpotToken(userId: number, token: any): Promise<any>;
  
  // POS operations
  getPosLocationsByUserId(userId: number): Promise<PosLocation[]>;
  getPosLocation(id: number): Promise<PosLocation | undefined>;
  createPosLocation(location: InsertPosLocation): Promise<PosLocation>;
  updatePosLocation(id: number, updates: Partial<PosLocation>): Promise<PosLocation | undefined>;
  deletePosLocation(id: number): Promise<void>;
  
  // POS Areas operations
  getPosAreas(locationId: number): Promise<PosArea[]>;
  getPosArea(id: number): Promise<PosArea | undefined>;
  createPosArea(area: InsertPosArea): Promise<PosArea>;
  updatePosArea(id: number, updates: Partial<PosArea>): Promise<PosArea | undefined>;
  deletePosArea(id: number): Promise<void>;
  
  // POS Tables operations
  getPosTables(locationId: number): Promise<PosTable[]>;
  getPosTable(id: number): Promise<PosTable | undefined>;
  createPosTable(table: InsertPosTable): Promise<PosTable>;
  updatePosTable(id: number, updates: Partial<PosTable>): Promise<PosTable | undefined>;
  updatePosTableStatus(id: number, status: string, currentOrderId?: number): Promise<PosTable | undefined>;
  deletePosTable(id: number): Promise<void>;
  
  // POS Orders operations
  getPosOrders(locationId: number): Promise<PosOrder[]>;
  getPosOrdersByStatus(locationId: number, status: string): Promise<PosOrder[]>;
  getPosOrder(id: number): Promise<PosOrder | undefined>;
  createPosOrder(order: InsertPosOrder): Promise<PosOrder>;
  updatePosOrder(id: number, updates: Partial<PosOrder>): Promise<PosOrder | undefined>;
  updatePosOrderStatus(id: number, status: string): Promise<PosOrder | undefined>;
  completePosOrder(id: number, paymentMethod: string, totalPaid: string): Promise<PosOrder | undefined>;
  deletePosOrder(id: number): Promise<void>;
  
  // POS Order Items operations
  getPosOrderItems(orderId: number): Promise<PosOrderItem[]>;
  getPosOrderItem(id: number): Promise<PosOrderItem | undefined>;
  createPosOrderItem(item: InsertPosOrderItem): Promise<PosOrderItem>;
  updatePosOrderItem(id: number, updates: Partial<PosOrderItem>): Promise<PosOrderItem | undefined>;
  updatePosOrderItemQuantity(id: number, quantity: number): Promise<PosOrderItem | undefined>;
  deletePosOrderItem(id: number): Promise<void>;
  
  // POS Inventory operations
  getPosInventoryItems(locationId: number): Promise<PosInventoryItem[]>;
  getPosInventoryItem(id: number): Promise<PosInventoryItem | undefined>;
  createPosInventoryItem(item: InsertPosInventoryItem): Promise<PosInventoryItem>;
  updatePosInventoryItem(id: number, updates: Partial<PosInventoryItem>): Promise<PosInventoryItem | undefined>;
  updatePosInventoryItemStock(id: number, newStock: string): Promise<PosInventoryItem | undefined>;
  deletePosInventoryItem(id: number): Promise<void>;
  
  // POS Categories operations
  getPosCategories(locationId: number): Promise<PosCategory[]>;
  getPosCategory(id: number): Promise<PosCategory | undefined>;
  createPosCategory(category: InsertPosCategory): Promise<PosCategory>;
  updatePosCategory(id: number, updates: Partial<PosCategory>): Promise<PosCategory | undefined>;
  deletePosCategory(id: number): Promise<void>;
  
  // POS Menu Items operations
  getPosMenuItems(locationId: number): Promise<PosMenuItem[]>;
  getPosMenuItemsByCategory(categoryId: number): Promise<PosMenuItem[]>;
  getPosMenuItem(id: number): Promise<PosMenuItem | undefined>;
  createPosMenuItem(item: InsertPosMenuItem): Promise<PosMenuItem>;
  updatePosMenuItem(id: number, updates: Partial<PosMenuItem>): Promise<PosMenuItem | undefined>;
  deletePosMenuItem(id: number): Promise<void>;
  
  // POS Staff operations
  getPosStaffByLocationId(locationId: number): Promise<PosStaff[]>;
  getPosStaff(id: number): Promise<PosStaff | undefined>;
  createPosStaff(staff: InsertPosStaff): Promise<PosStaff>;
  updatePosStaff(id: number, updates: Partial<PosStaff>): Promise<PosStaff | undefined>;
  deletePosStaff(id: number): Promise<void>;
  
  // Staff Scheduling operations
  getPosStaffAvailabilityByStaffId(staffId: number): Promise<PosStaffAvailability[]>;
  createPosStaffAvailability(availability: InsertPosStaffAvailability): Promise<PosStaffAvailability>;
  updatePosStaffAvailability(id: number, updates: Partial<PosStaffAvailability>): Promise<PosStaffAvailability | undefined>;
  deletePosStaffAvailability(id: number): Promise<void>;
  
  // Schedule Templates operations
  getPosScheduleTemplatesByLocationId(locationId: number): Promise<PosScheduleTemplate[]>;
  getPosScheduleTemplate(id: number): Promise<PosScheduleTemplate | undefined>;
  createPosScheduleTemplate(template: InsertPosScheduleTemplate): Promise<PosScheduleTemplate>;
  updatePosScheduleTemplate(id: number, updates: Partial<PosScheduleTemplate>): Promise<PosScheduleTemplate | undefined>;
  deletePosScheduleTemplate(id: number): Promise<void>;
  
  // Template Shifts operations
  getPosTemplateShiftsByTemplateId(templateId: number): Promise<PosTemplateShift[]>;
  createPosTemplateShift(shift: InsertPosTemplateShift): Promise<PosTemplateShift>;
  updatePosTemplateShift(id: number, updates: Partial<PosTemplateShift>): Promise<PosTemplateShift | undefined>;
  deletePosTemplateShift(id: number): Promise<void>;
  
  // Time Off Requests operations
  getPosTimeOffRequestsByStaffId(staffId: number): Promise<PosTimeOffRequest[]>;
  getPosTimeOffRequestsByLocationId(locationId: number): Promise<PosTimeOffRequest[]>;
  getPosTimeOffRequest(id: number): Promise<PosTimeOffRequest | undefined>;
  createPosTimeOffRequest(request: InsertPosTimeOffRequest): Promise<PosTimeOffRequest>;
  updatePosTimeOffRequest(id: number, updates: Partial<PosTimeOffRequest>): Promise<PosTimeOffRequest | undefined>;
  approvePosTimeOffRequest(id: number, approvedById: number, isPaid: boolean): Promise<PosTimeOffRequest | undefined>;
  denyPosTimeOffRequest(id: number, approvedById: number): Promise<PosTimeOffRequest | undefined>;
  
  // POS Payments operations
  getPosPaymentsByLocationId(locationId: number): Promise<PosPayment[]>;
  getPosPaymentsByOrderId(orderId: number): Promise<PosPayment[]>;
  getPosPayment(id: number): Promise<PosPayment | undefined>;
  createPosPayment(payment: InsertPosPayment): Promise<PosPayment>;
  
  // POS Tenant operations
  getPosTenant(id: number): Promise<PosTenant | undefined>;
  getPosTenantBySubdomain(subdomain: string): Promise<PosTenant | undefined>;
  getPosTenantsByStatus(status: string): Promise<PosTenant[]>;
  getAllPosTenants(): Promise<PosTenant[]>;
  createPosTenant(tenant: InsertPosTenant): Promise<PosTenant>;
  updatePosTenant(id: number, data: Partial<InsertPosTenant>): Promise<PosTenant>;
  updatePosTenantStatus(id: number, status: string): Promise<PosTenant>;
  incrementPosTenantActiveInstances(id: number): Promise<PosTenant>;
  generatePosTenantInstance(id: number): Promise<{instanceUrl: string}>;
  
  // ISO Partner operations
  getIsoPartner(id: number): Promise<IsoPartner | undefined>;
  getIsoPartnerByUserId(userId: number): Promise<IsoPartner | undefined>;
  getActiveIsoPartners(): Promise<IsoPartner[]>;
  createIsoPartner(partner: InsertIsoPartner): Promise<IsoPartner>;
  updateIsoPartner(id: number, data: Partial<InsertIsoPartner>): Promise<IsoPartner>;
  updateIsoPartnerCommissionTotal(id: number, amount: string): Promise<IsoPartner>;
  updateIsoPartnerMerchantCount(id: number): Promise<IsoPartner>;
  
  // Merchant operations (for ISO partners)
  getMerchant(id: number): Promise<Merchant | undefined>;
  getMerchantsByIsoPartnerId(isoPartnerId: number): Promise<Merchant[]>;
  getMerchantsByStatus(isoPartnerId: number, status: string): Promise<Merchant[]>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  updateMerchant(id: number, data: Partial<InsertMerchant>): Promise<Merchant>;
  updateMerchantStatus(id: number, status: string, rejectionReason?: string): Promise<Merchant>;
  
  // Commission operations
  getCommission(id: number): Promise<Commission | undefined>;
  getCommissionsByIsoPartnerId(isoPartnerId: number): Promise<Commission[]>;
  getCommissionsByMerchantId(merchantId: number): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommissionStatus(id: number, status: string): Promise<Commission>;
  
  // Training Document operations
  getTrainingDocument(id: number): Promise<TrainingDocument | undefined>;
  getTrainingDocumentsByCategory(category: string): Promise<TrainingDocument[]>;
  getAllTrainingDocuments(): Promise<TrainingDocument[]>;
  createTrainingDocument(document: InsertTrainingDocument): Promise<TrainingDocument>;
  updateTrainingDocument(id: number, data: Partial<InsertTrainingDocument>): Promise<TrainingDocument>;
  deleteTrainingDocument(id: number): Promise<void>;
  
  // Support Ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketsByIsoPartnerId(isoPartnerId: number): Promise<SupportTicket[]>;
  getOpenSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicketStatus(id: number, status: string, assignedTo?: number): Promise<SupportTicket>;
  resolveSupportTicket(id: number, resolution: string): Promise<SupportTicket>;
  
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
  getAllTransactions(limit?: number): Promise<Transaction[]>;
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
  
  // Expense Reports operations
  getExpenseReport(id: number): Promise<ExpenseReport | undefined>;
  getExpenseReportsByUserId(userId: number): Promise<ExpenseReport[]>;
  getExpenseReportsByEmployerId(employerId: number): Promise<ExpenseReport[]>;
  getPendingExpenseReportsByEmployerId(employerId: number): Promise<ExpenseReport[]>;
  createExpenseReport(expenseReport: InsertExpenseReport): Promise<ExpenseReport>;
  updateExpenseReportStatus(id: number, status: string, reviewedBy?: number, reviewedAt?: Date, rejectionReason?: string): Promise<ExpenseReport>;
  updateExpenseReportTotalAmount(id: number, totalAmount: string): Promise<ExpenseReport>;
  updateExpenseReportPayment(id: number, status: string, reviewedBy: number, paymentDate: Date, paymentMethod: string, paymentReference?: string, notes?: string): Promise<ExpenseReport>;
  
  // Expense Line Items operations
  getExpenseLineItem(id: number): Promise<ExpenseLineItem | undefined>;
  getExpenseLineItemsByReportId(expenseReportId: number): Promise<ExpenseLineItem[]>;
  createExpenseLineItem(lineItem: InsertExpenseLineItem): Promise<ExpenseLineItem>;
  updateExpenseLineItem(id: number, data: Partial<InsertExpenseLineItem>): Promise<ExpenseLineItem>;
  deleteExpenseLineItem(id: number): Promise<void>;
  
  // Merchant Profile operations
  getMerchantProfile(id: number): Promise<MerchantProfile | undefined>;
  getMerchantProfileByUserId(userId: number): Promise<MerchantProfile | undefined>;
  getMerchantProfileBySubdomain(subdomain: string): Promise<MerchantProfile | undefined>;
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
  
  // Restaurant POS - Tables
  getRestaurantTable(id: number): Promise<RestaurantTable | undefined>;
  getRestaurantTablesByMerchantId(merchantId: number): Promise<RestaurantTable[]>;
  createRestaurantTable(table: InsertRestaurantTable): Promise<RestaurantTable>;
  updateRestaurantTableStatus(id: number, status: string, currentOrderId?: number): Promise<RestaurantTable>;
  deleteRestaurantTable(id: number): Promise<void>;
  
  // Restaurant POS - Orders
  getRestaurantOrder(id: number): Promise<RestaurantOrder | undefined>;
  getRestaurantOrdersByMerchantId(merchantId: number): Promise<RestaurantOrder[]>;
  getRestaurantOrdersByStatus(merchantId: number, status: string): Promise<RestaurantOrder[]>;
  createRestaurantOrder(order: InsertRestaurantOrder): Promise<RestaurantOrder>;
  updateRestaurantOrderStatus(id: number, status: string): Promise<RestaurantOrder>;
  completeRestaurantOrder(id: number, paymentMethod: string, totalPaid: string): Promise<RestaurantOrder>;
  deleteRestaurantOrder(id: number): Promise<void>;
  
  // Restaurant POS - Order Items
  getRestaurantOrderItem(id: number): Promise<RestaurantOrderItem | undefined>;
  getRestaurantOrderItemsByOrderId(orderId: number): Promise<RestaurantOrderItem[]>;
  createRestaurantOrderItem(item: InsertRestaurantOrderItem): Promise<RestaurantOrderItem>;
  updateRestaurantOrderItemQuantity(id: number, quantity: number): Promise<RestaurantOrderItem>;
  deleteRestaurantOrderItem(id: number): Promise<void>;
  
  // Restaurant POS - Inventory
  getRestaurantInventoryItem(id: number): Promise<RestaurantInventoryItem | undefined>;
  getRestaurantInventoryItems(merchantId: number): Promise<RestaurantInventoryItem[]>;
  createRestaurantInventoryItem(item: InsertRestaurantInventoryItem): Promise<RestaurantInventoryItem>;
  updateRestaurantInventoryItem(id: number, data: Partial<InsertRestaurantInventoryItem>, merchantId: number): Promise<RestaurantInventoryItem>;
  updateRestaurantInventoryStock(id: number, newStock: number): Promise<RestaurantInventoryItem>;
  deleteRestaurantInventoryItem(id: number, merchantId: number): Promise<void>;
  
  // Restaurant POS - Inventory Transactions
  getRestaurantInventoryTransaction(id: number): Promise<RestaurantInventoryTransaction | undefined>;
  getRestaurantInventoryTransactions(merchantId: number): Promise<RestaurantInventoryTransaction[]>;
  getRestaurantInventoryTransactionsByItemId(itemId: number): Promise<RestaurantInventoryTransaction[]>;
  createRestaurantInventoryTransaction(transaction: InsertRestaurantInventoryTransaction): Promise<RestaurantInventoryTransaction>;
  
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
  getAffiliateBySubdomain(subdomain: string): Promise<AffiliateProfile | undefined>;
  getAllAffiliateProfiles(): Promise<AffiliateProfile[]>;
  getActiveAffiliateProfiles(): Promise<AffiliateProfile[]>;
  createAffiliateProfile(profile: InsertAffiliateProfile): Promise<AffiliateProfile>;
  updateAffiliateProfile(id: number, data: Partial<InsertAffiliateProfile>): Promise<AffiliateProfile>;
  updateAffiliateStats(id: number, totalEarned?: string, pendingPayouts?: string, lifetimeReferrals?: number, activeReferrals?: number): Promise<AffiliateProfile>;
  
  // ISO Partner operations
  getIsoPartner(id: number): Promise<IsoPartner | undefined>;
  getIsoPartnerByUserId(userId: number): Promise<IsoPartner | undefined>;
  getIsoPartnerBySubdomain(subdomain: string): Promise<IsoPartner | undefined>;
  getActiveIsoPartners(): Promise<IsoPartner[]>;
  createIsoPartner(partner: InsertIsoPartner): Promise<IsoPartner>;
  updateIsoPartner(id: number, data: Partial<InsertIsoPartner>): Promise<IsoPartner>;
  updateIsoPartnerStats(id: number, totalCommissionEarned?: string, merchantCount?: number): Promise<IsoPartner>;
  
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
  getAffiliateStats(affiliateId: number, range: string): Promise<any>;
  getAffiliateMarketingMaterials(): Promise<any>;
  createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout>;
  
  // POS Tenant operations
  getPosTenant(id: number): Promise<PosTenant | undefined>;
  getPosTenantBySubdomain(subdomain: string): Promise<PosTenant | undefined>;
  getPosTenantsByStatus(status: string): Promise<PosTenant[]>;
  createPosTenant(tenant: InsertPosTenant): Promise<PosTenant>;
  updatePosTenant(id: number, data: Partial<InsertPosTenant>): Promise<PosTenant>;
  updatePosTenantStatus(id: number, status: string): Promise<PosTenant>;
  incrementPosTenantActiveInstances(id: number): Promise<PosTenant>;
  generatePosTenantInstance(id: number): Promise<{instanceUrl: string}>;
  getAllPosTenants(): Promise<PosTenant[]>;
  updateAffiliatePayoutStatus(id: number, status: string): Promise<AffiliatePayout>;
  markAffiliatePayoutAsPaid(id: number, transactionId: string): Promise<AffiliatePayout>;
  markAffiliatePayoutAsClawedBack(id: number, notes?: string): Promise<AffiliatePayout>;
  
  // Merchant Application operations
  createMerchantApplication(application: InsertMerchantApplication): Promise<MerchantApplication>;
  getMerchantApplication(id: string): Promise<MerchantApplication | undefined>;
  getMerchantApplicationsByStatus(status: string): Promise<MerchantApplication[]>;
  getMerchantApplications(params: {
    status?: "pending" | "reviewing" | "approved" | "rejected";
    searchTerm?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }): Promise<{
    applications: MerchantApplication[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;
  updateMerchantApplicationStatus(id: string, status: string, notes?: string): Promise<MerchantApplication | undefined>;
  
  // Analytics tracking operations
  getClickEvent(id: number): Promise<ClickEvent | undefined>;
  getClickEventsByUserId(userId: number): Promise<ClickEvent[]>;
  getClickEventsBySession(sessionId: string): Promise<ClickEvent[]>;
  getClickEventsByDateRange(startDate: Date, endDate: Date): Promise<ClickEvent[]>;
  getClickEventsByElementType(elementType: string): Promise<ClickEvent[]>;
  getClickEventsByPagePath(pagePath: string): Promise<ClickEvent[]>;
  createClickEvent(event: InsertClickEvent): Promise<ClickEvent>;
  getClickMetricsByPage(): Promise<any>;
  
  // Demo request operations
  createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequest(id: number): Promise<DemoRequest | undefined>;
  getDemoRequestsByStatus(status: string): Promise<DemoRequest[]>;
  getDemoRequestsByEmail(email: string): Promise<DemoRequest[]>;
  getDemoRequestsByDateRange(startDate: Date, endDate: Date): Promise<DemoRequest[]>;
  updateDemoRequestStatus(id: number, status: string): Promise<DemoRequest>;
  processDemoRequest(id: number, processedBy: number): Promise<DemoRequest>;
  
  // Family Group operations
  createFamilyGroup(familyGroup: InsertFamilyGroup): Promise<FamilyGroup>;
  getFamilyGroup(id: number): Promise<FamilyGroup | undefined>;
  getFamilyGroupsByParentId(parentId: number): Promise<FamilyGroup[]>;
  updateFamilyGroup(id: number, data: Partial<InsertFamilyGroup>): Promise<FamilyGroup>;
  
  // Family Member operations
  createFamilyMember(familyMember: InsertFamilyMember): Promise<FamilyMember>;
  getFamilyMember(id: number): Promise<FamilyMember | undefined>;
  getFamilyMemberByUserId(userId: number): Promise<FamilyMember | undefined>;
  getFamilyMembersByGroupId(groupId: number): Promise<FamilyMember[]>;
  getFamilyMembersByParentId(parentId: number): Promise<FamilyMember[]>;
  getFamilyMemberIdsByGroupIds(groupIds: number[]): Promise<number[]>;
  updateFamilyMember(id: number, data: Partial<InsertFamilyMember>): Promise<FamilyMember>;
  
  // Allowance operations
  createAllowance(allowance: InsertAllowance): Promise<Allowance>;
  getAllowance(id: number): Promise<Allowance | undefined>;
  getAllowanceByChildId(childId: number): Promise<Allowance[]>;
  updateAllowance(id: number, data: Partial<InsertAllowance>): Promise<Allowance>;
  
  // Spending Rules operations
  createSpendingRules(spendingRules: InsertSpendingRules): Promise<SpendingRules>;
  getSpendingRules(id: number): Promise<SpendingRules | undefined>;
  getSpendingRulesByChildId(childId: number): Promise<SpendingRules | undefined>;
  updateSpendingRules(id: number, data: Partial<InsertSpendingRules>): Promise<SpendingRules>;
  
  // Family Task operations
  createFamilyTask(familyTask: InsertFamilyTask): Promise<FamilyTask>;
  getFamilyTask(id: number): Promise<FamilyTask | undefined>;
  getFamilyTasksByAssignedToUserId(userId: number): Promise<FamilyTask[]>;
  getFamilyTasksByFamilyGroupId(familyGroupId: number): Promise<FamilyTask[]>;
  updateFamilyTask(id: number, data: Partial<InsertFamilyTask>): Promise<FamilyTask>;
  
  // Spending Request operations
  createSpendingRequest(spendingRequest: InsertSpendingRequest): Promise<SpendingRequest>;
  getSpendingRequest(id: number): Promise<SpendingRequest | undefined>;
  getSpendingRequestsByChildId(childId: number): Promise<SpendingRequest[]>;
  getSpendingRequestsByChildrenIds(childrenIds: number[]): Promise<SpendingRequest[]>;
  updateSpendingRequestStatus(id: number, status: string, notes?: string): Promise<SpendingRequest>;
  
  // Enhanced Savings Goals operations for parent-child
  getSavingsGoalsByChildId(childId: number): Promise<SavingsGoal[]>;
  
  // Tax Calculation System operations
  // Federal Tax Brackets
  getFederalTaxBracket(id: number): Promise<FederalTaxBracket | undefined>;
  getFederalTaxBracketsByYear(year: number): Promise<FederalTaxBracket[]>;
  getFederalTaxBracketsByFilingStatus(year: number, filingStatus: string): Promise<FederalTaxBracket[]>;
  createFederalTaxBracket(bracket: InsertFederalTaxBracket): Promise<FederalTaxBracket>;
  updateFederalTaxBracket(id: number, data: Partial<InsertFederalTaxBracket>): Promise<FederalTaxBracket>;
  
  // State Tax Brackets
  getStateTaxBracket(id: number): Promise<StateTaxBracket | undefined>;
  getStateTaxBracketsByState(state: string, year: number): Promise<StateTaxBracket[]>;
  getStateTaxBracketsByFilingStatus(state: string, year: number, filingStatus: string): Promise<StateTaxBracket[]>;
  createStateTaxBracket(bracket: InsertStateTaxBracket): Promise<StateTaxBracket>;
  updateStateTaxBracket(id: number, data: Partial<InsertStateTaxBracket>): Promise<StateTaxBracket>;
  
  // FICA Rates
  getFicaRate(id: number): Promise<FicaRate | undefined>;
  getFicaRateByYear(year: number): Promise<FicaRate | undefined>;
  createFicaRate(rate: InsertFicaRate): Promise<FicaRate>;
  updateFicaRate(id: number, data: Partial<InsertFicaRate>): Promise<FicaRate>;
  
  // Tax Allowances
  getTaxAllowance(id: number): Promise<TaxAllowance | undefined>;
  getTaxAllowanceByYear(year: number): Promise<TaxAllowance | undefined>;
  createTaxAllowance(allowance: InsertTaxAllowance): Promise<TaxAllowance>;
  updateTaxAllowance(id: number, data: Partial<InsertTaxAllowance>): Promise<TaxAllowance>;
  
  // Employee Tax Profiles
  getEmployeeTaxProfile(id: number): Promise<EmployeeTaxProfile | undefined>;
  getEmployeeTaxProfileByUserId(userId: number, year: number): Promise<EmployeeTaxProfile | undefined>;
  getEmployeeTaxProfilesByYear(year: number): Promise<EmployeeTaxProfile[]>;
  createEmployeeTaxProfile(profile: InsertEmployeeTaxProfile): Promise<EmployeeTaxProfile>;
  updateEmployeeTaxProfile(id: number, data: Partial<InsertEmployeeTaxProfile>): Promise<EmployeeTaxProfile>;
  
  // Tax Calculations
  getTaxCalculation(id: number): Promise<TaxCalculation | undefined>;
  getTaxCalculationsByPayrollEntryId(payrollEntryId: number): Promise<TaxCalculation[]>;
  getTaxCalculationsByPerformedBy(userId: number): Promise<TaxCalculation[]>;
  createTaxCalculation(calculation: InsertTaxCalculation): Promise<TaxCalculation>;
  
  // Tax Calculation Operations
  calculateFederalTax(income: string, filingStatus: string, year: number): Promise<{tax: string, effectiveRate: string, marginRate: string}>;
  calculateStateTax(income: string, state: string, filingStatus: string, year: number): Promise<{tax: string, effectiveRate: string}>;
  calculateFicaTax(income: string, ytdEarnings: string, filingStatus: string, year: number): Promise<{socialSecurity: string, medicare: string, additionalMedicare: string, total: string}>;
  calculatePayrollTaxes(payrollEntryId: number, performedBy: number): Promise<TaxCalculation>;
  
  // Analytics Tracking
  getClickEvent(id: number): Promise<ClickEvent | undefined>;
  getClickEventsByUserId(userId: number): Promise<ClickEvent[]>;
  getClickEventsBySession(sessionId: string): Promise<ClickEvent[]>;
  getClickEventsByDateRange(startDate: Date, endDate: Date): Promise<ClickEvent[]>;
  getClickEventsByElementType(elementType: string): Promise<ClickEvent[]>;
  getClickEventsByPagePath(pagePath: string): Promise<ClickEvent[]>;
  createClickEvent(event: InsertClickEvent): Promise<ClickEvent>;
  getClickMetricsByPage(): Promise<any>;
  
  // Merchant Transaction operations
  getMerchantTransaction(id: number): Promise<MerchantTransaction | undefined>;
  getMerchantTransactionsByMerchantId(merchantId: number): Promise<MerchantTransaction[]>;
  getMerchantTransactionsByPaymentGatewayId(paymentGatewayId: number): Promise<MerchantTransaction[]>;
  getMerchantTransactionsByStatus(status: string): Promise<MerchantTransaction[]>;
  createMerchantTransaction(transaction: InsertMerchantTransaction): Promise<MerchantTransaction>;
  updateMerchantTransactionStatus(id: number, status: string): Promise<MerchantTransaction>;
  updateMerchantTransactionMetadata(id: number, metadata: any): Promise<MerchantTransaction>;

  // Restaurant POS - Tables
  getRestaurantTable(id: number): Promise<RestaurantTable | undefined>;
  getRestaurantTablesByMerchantId(merchantId: number): Promise<RestaurantTable[]>;
  createRestaurantTable(table: InsertRestaurantTable): Promise<RestaurantTable>;
  updateRestaurantTableStatus(id: number, status: string, currentOrderId?: number): Promise<RestaurantTable>;
  deleteRestaurantTable(id: number): Promise<void>;
  
  // Restaurant POS - Orders
  getRestaurantOrder(id: number): Promise<RestaurantOrder | undefined>;
  getRestaurantOrdersByMerchantId(merchantId: number): Promise<RestaurantOrder[]>;
  getRestaurantOrdersByStatus(merchantId: number, status: string): Promise<RestaurantOrder[]>;
  createRestaurantOrder(order: InsertRestaurantOrder): Promise<RestaurantOrder>;
  updateRestaurantOrderStatus(id: number, status: string): Promise<RestaurantOrder>;
  completeRestaurantOrder(id: number, paymentMethod: string, totalPaid: string): Promise<RestaurantOrder>;
  deleteRestaurantOrder(id: number): Promise<void>;
  
  // Restaurant POS - Order Items
  getRestaurantOrderItem(id: number): Promise<RestaurantOrderItem | undefined>;
  getRestaurantOrderItemsByOrderId(orderId: number): Promise<RestaurantOrderItem[]>;
  createRestaurantOrderItem(item: InsertRestaurantOrderItem): Promise<RestaurantOrderItem>;
  updateRestaurantOrderItemQuantity(id: number, quantity: number): Promise<RestaurantOrderItem>;
  deleteRestaurantOrderItem(id: number): Promise<void>;
  
  // Restaurant POS - Inventory
  getRestaurantInventoryItem(id: number): Promise<RestaurantInventoryItem | undefined>;
  getRestaurantInventoryItems(merchantId: number): Promise<RestaurantInventoryItem[]>;
  createRestaurantInventoryItem(item: InsertRestaurantInventoryItem): Promise<RestaurantInventoryItem>;
  updateRestaurantInventoryItem(id: number, data: Partial<InsertRestaurantInventoryItem>, merchantId: number): Promise<RestaurantInventoryItem>;
  updateRestaurantInventoryStock(id: number, newStock: number): Promise<RestaurantInventoryItem>;
  deleteRestaurantInventoryItem(id: number, merchantId: number): Promise<void>;
  
  // Restaurant POS - Inventory Transactions
  getRestaurantInventoryTransaction(id: number): Promise<RestaurantInventoryTransaction | undefined>;
  getRestaurantInventoryTransactions(merchantId: number): Promise<RestaurantInventoryTransaction[]>;
  getRestaurantInventoryTransactionsByItemId(itemId: number): Promise<RestaurantInventoryTransaction[]>;
  createRestaurantInventoryTransaction(transaction: InsertRestaurantInventoryTransaction): Promise<RestaurantInventoryTransaction>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private pool: Pool;
  private _merchantApplications: MerchantApplication[] = [];
  
  // Restaurant POS tables for implementation
  private restaurantTablesMap: Map<number, RestaurantTable> = new Map();
  private restaurantOrdersMap: Map<number, RestaurantOrder> = new Map();
  private restaurantOrderItemsMap: Map<number, RestaurantOrderItem> = new Map();
  private restaurantInventoryItemsMap: Map<number, RestaurantInventoryItem> = new Map();
  private restaurantInventoryTransactionsMap: Map<number, RestaurantInventoryTransaction> = new Map();

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
  
  // HubSpot operations
  async getHubSpotToken(userId: number): Promise<any | undefined> {
    try {
      const [token] = await db
        .select()
        .from(hubspotTokens)
        .where(eq(hubspotTokens.userId, userId));
      
      if (token) {
        return {
          access_token: token.accessToken,
          refresh_token: token.refreshToken,
          expires_at: new Date(token.expiresAt).getTime(),
          tokenData: token.tokenData,
        };
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting HubSpot token:", error);
      return undefined;
    }
  }
  
  async saveHubSpotToken(userId: number, token: any): Promise<any> {
    try {
      // Check if token already exists for this user
      const existingToken = await this.getHubSpotToken(userId);
      
      if (existingToken) {
        // Update existing token
        const [updatedToken] = await db
          .update(hubspotTokens)
          .set({
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            expiresAt: new Date(token.expires_at),
            tokenData: token.tokenData || null,
            updatedAt: new Date(),
          })
          .where(eq(hubspotTokens.userId, userId))
          .returning();
        
        return {
          access_token: updatedToken.accessToken,
          refresh_token: updatedToken.refreshToken,
          expires_at: new Date(updatedToken.expiresAt).getTime(),
          tokenData: updatedToken.tokenData,
        };
      } else {
        // Create new token
        const [newToken] = await db
          .insert(hubspotTokens)
          .values({
            userId,
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            expiresAt: new Date(token.expires_at),
            tokenData: token.tokenData || null,
          })
          .returning();
        
        return {
          access_token: newToken.accessToken,
          refresh_token: newToken.refreshToken,
          expires_at: new Date(newToken.expiresAt).getTime(),
          tokenData: newToken.tokenData,
        };
      }
    } catch (error) {
      console.error("Error saving HubSpot token:", error);
      throw new Error("Failed to save HubSpot token");
    }
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role as any, role));
  }
  
  async getChildrenByParentId(parentId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.parentUserId, parentId));
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

  // Placeholder for super admin functionality
  async getUserRoles(): Promise<string[]> {
    const result = await db.select({
      role: users.role,
    })
    .from(users)
    .groupBy(users.role);
    
    return result.map(r => r.role);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<void> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    
    if (!deletedUser) {
      throw new Error(`User with id ${id} not found`);
    }
  }

  async getAllMerchants(): Promise<MerchantProfile[]> {
    return await db.select().from(merchantProfiles).orderBy(desc(merchantProfiles.createdAt));
  }
  
  async getAllAffiliates(): Promise<AffiliateProfile[]> {
    return await db.select().from(affiliateProfiles).orderBy(desc(affiliateProfiles.createdAt));
  }
  
  async getAllIsoPartners(): Promise<IsoPartner[]> {
    return await db.select().from(isoPartners).orderBy(desc(isoPartners.id));
  }
  
  async getIsoPartnerByUserId(userId: number): Promise<IsoPartner | undefined> {
    const [isoPartner] = await db.select().from(isoPartners).where(eq(isoPartners.userId, userId));
    return isoPartner;
  }

  async getMerchantsByIsoPartnerId(isoPartnerId: number): Promise<MerchantProfile[]> {
    return await db.select()
      .from(merchantProfiles)
      .where(eq(merchantProfiles.isoPartnerId, isoPartnerId));
  }

  async getCommissionsByIsoPartnerId(isoPartnerId: number): Promise<Commission[]> {
    return await db.select()
      .from(commissions)
      .where(eq(commissions.isoPartnerId, isoPartnerId))
      .orderBy(desc(commissions.createdAt));
  }
  
  async getAllTrainingDocuments(): Promise<TrainingDocument[]> {
    return await db.select()
      .from(trainingDocuments)
      .orderBy(desc(trainingDocuments.createdAt));
  }
  
  async createTrainingDocument(documentData: InsertTrainingDocument): Promise<TrainingDocument> {
    const [document] = await db
      .insert(trainingDocuments)
      .values(documentData)
      .returning();
    
    return document;
  }
  
  async createMerchant(merchantData: InsertMerchantProfile): Promise<MerchantProfile> {
    const [merchant] = await db
      .insert(merchantProfiles)
      .values(merchantData)
      .returning();
    
    return merchant;
  }
  
  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values(ticketData)
      .returning();
    
    return ticket;
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

  async getAllTransactions(limit?: number): Promise<Transaction[]> {
    if (limit) {
      return await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
    }
    
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
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
      if (childUser && childUser.parentUserId) {
        // Get the parent wallet (assuming main wallet)
        const parentWallets = await this.getWalletsByUserId(childUser.parentUserId);
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

  // Expense Reports operations
  async getExpenseReport(id: number): Promise<ExpenseReport | undefined> {
    const [report] = await db.select().from(expenseReports).where(eq(expenseReports.id, id));
    return report;
  }

  async getExpenseReportsByUserId(userId: number): Promise<ExpenseReport[]> {
    return await db
      .select()
      .from(expenseReports)
      .where(eq(expenseReports.userId, userId))
      .orderBy(desc(expenseReports.createdAt));
  }

  async getExpenseReportsByEmployerId(employerId: number): Promise<ExpenseReport[]> {
    return await db
      .select()
      .from(expenseReports)
      .where(eq(expenseReports.employerId, employerId))
      .orderBy(desc(expenseReports.createdAt));
  }

  async getPendingExpenseReportsByEmployerId(employerId: number): Promise<ExpenseReport[]> {
    return await db
      .select()
      .from(expenseReports)
      .where(and(
        eq(expenseReports.employerId, employerId),
        eq(expenseReports.status, 'pending')
      ))
      .orderBy(desc(expenseReports.createdAt));
  }

  async createExpenseReport(expenseReport: InsertExpenseReport): Promise<ExpenseReport> {
    const [report] = await db
      .insert(expenseReports)
      .values(expenseReport)
      .returning();
    return report;
  }

  async updateExpenseReportStatus(
    id: number, 
    status: string, 
    reviewedBy?: number, 
    reviewedAt?: Date, 
    rejectionReason?: string
  ): Promise<ExpenseReport> {
    const [updatedReport] = await db
      .update(expenseReports)
      .set({
        status,
        reviewedBy: reviewedBy || null,
        reviewedAt: reviewedAt || null,
        rejectionReason: rejectionReason || null,
        updatedAt: new Date()
      })
      .where(eq(expenseReports.id, id))
      .returning();
    return updatedReport;
  }

  async updateExpenseReportTotalAmount(
    id: number,
    totalAmount: string
  ): Promise<ExpenseReport> {
    const [updatedReport] = await db
      .update(expenseReports)
      .set({
        totalAmount,
        updatedAt: new Date()
      })
      .where(eq(expenseReports.id, id))
      .returning();
    return updatedReport;
  }
  
  async updateExpenseReportPayment(
    id: number,
    status: string,
    reviewedBy: number,
    paymentDate: Date,
    paymentMethod: string,
    paymentReference?: string,
    notes?: string
  ): Promise<ExpenseReport> {
    const [updatedReport] = await db
      .update(expenseReports)
      .set({
        status,
        reviewedBy,
        reviewDate: new Date(),
        approvalDate: new Date(), // Consider the approval part of the payment process
        paymentDate,
        paymentMethod,
        paymentReference: paymentReference || null,
        notes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(expenseReports.id, id))
      .returning();
    return updatedReport;
  }

  // Expense Line Items operations
  async getExpenseLineItem(id: number): Promise<ExpenseLineItem | undefined> {
    const [lineItem] = await db.select().from(expenseLineItems).where(eq(expenseLineItems.id, id));
    return lineItem;
  }

  async getExpenseLineItemsByReportId(expenseReportId: number): Promise<ExpenseLineItem[]> {
    return await db
      .select()
      .from(expenseLineItems)
      .where(eq(expenseLineItems.expenseReportId, expenseReportId))
      .orderBy(asc(expenseLineItems.date));
  }

  async createExpenseLineItem(lineItem: InsertExpenseLineItem): Promise<ExpenseLineItem> {
    const [item] = await db
      .insert(expenseLineItems)
      .values(lineItem)
      .returning();
    return item;
  }

  async updateExpenseLineItem(id: number, data: Partial<InsertExpenseLineItem>): Promise<ExpenseLineItem> {
    const [updatedItem] = await db
      .update(expenseLineItems)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(expenseLineItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteExpenseLineItem(id: number): Promise<void> {
    await db.delete(expenseLineItems).where(eq(expenseLineItems.id, id));
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

  async getMerchantProfileBySubdomain(subdomain: string): Promise<MerchantProfile | undefined> {
    // Ensure we're selecting from the correct column (subdomain matches schema.ts)
    const [merchantProfile] = await db.select().from(merchantProfiles).where(eq(merchantProfiles.subdomain, subdomain));
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
  
  // Function to get affiliate by subdomain for microsite
  async getAffiliateBySubdomain(subdomain: string): Promise<AffiliateProfile | undefined> {
    const [profile] = await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.subdomain, subdomain));
    return profile;
  }
  
  // ISO Partner operations
  async getIsoPartner(id: number): Promise<IsoPartner | undefined> {
    const [partner] = await db.select().from(isoPartners).where(eq(isoPartners.id, id));
    return partner;
  }
  
  async getIsoPartnerByUserId(userId: number): Promise<IsoPartner | undefined> {
    const [partner] = await db.select().from(isoPartners).where(eq(isoPartners.userId, userId));
    return partner;
  }
  
  async getIsoPartnerBySubdomain(subdomain: string): Promise<IsoPartner | undefined> {
    const [partner] = await db.select().from(isoPartners).where(eq(isoPartners.subdomain, subdomain));
    return partner;
  }
  
  async getActiveIsoPartners(): Promise<IsoPartner[]> {
    return await db.select().from(isoPartners).where(eq(isoPartners.status, "active"));
  }
  
  async createIsoPartner(partner: InsertIsoPartner): Promise<IsoPartner> {
    const [newPartner] = await db.insert(isoPartners).values({
      ...partner,
      totalCommissionEarned: "0",
      merchantCount: 0,
      updatedAt: new Date()
    }).returning();
    
    return newPartner;
  }
  
  async updateIsoPartner(id: number, data: Partial<InsertIsoPartner>): Promise<IsoPartner> {
    const [partner] = await db
      .update(isoPartners)
      .set({ 
        ...data,
        updatedAt: new Date() 
      })
      .where(eq(isoPartners.id, id))
      .returning();
    
    if (!partner) {
      throw new Error(`ISO partner with id ${id} not found`);
    }
    
    return partner;
  }
  
  async updateIsoPartnerStats(
    id: number,
    totalCommissionEarned?: string,
    merchantCount?: number
  ): Promise<IsoPartner> {
    const updateData: Partial<IsoPartner> = {
      updatedAt: new Date()
    };
    
    if (totalCommissionEarned !== undefined) {
      updateData.totalCommissionEarned = totalCommissionEarned;
    }
    
    if (merchantCount !== undefined) {
      updateData.merchantCount = merchantCount;
    }
    
    const [partner] = await db
      .update(isoPartners)
      .set(updateData)
      .where(eq(isoPartners.id, id))
      .returning();
    
    if (!partner) {
      throw new Error(`ISO partner with id ${id} not found`);
    }
    
    return partner;
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
  
  async getAllAffiliateProfiles(): Promise<AffiliateProfile[]> {
    return await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.isActive, true));
  }
  
  async createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout> {
    const [newPayout] = await db.insert(affiliatePayouts).values({
      ...payout,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newPayout;
  }
  
  async updateAffiliatePayout(id: number, data: Partial<InsertAffiliatePayout>): Promise<AffiliatePayout> {
    const [updatedPayout] = await db
      .update(affiliatePayouts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(affiliatePayouts.id, id))
      .returning();
    
    if (!updatedPayout) {
      throw new Error(`Affiliate payout with id ${id} not found`);
    }
    
    return updatedPayout;
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
    
    const [updatedProfile] = await db
      .update(affiliateProfiles)
      .set(updateData)
      .where(eq(affiliateProfiles.id, id))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`Affiliate profile with id ${id} not found`);
    }
    
    return updatedProfile;
  }

  async getAffiliateStats(affiliateId: number, range: string): Promise<any> {
    // Calculate date cutoffs based on the range
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(range) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    // Get referrals within the date range
    const referrals = await db.select()
      .from(merchantReferrals)
      .where(and(
        eq(merchantReferrals.affiliateId, affiliateId),
        gte(merchantReferrals.createdAt, cutoffDate)
      ));
    
    // Get payouts within the date range
    const payouts = await db.select()
      .from(affiliatePayouts)
      .where(and(
        eq(affiliatePayouts.affiliateId, affiliateId),
        gte(affiliatePayouts.createdAt, cutoffDate)
      ));
    
    // Calculate totals
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    
    // Calculate revenue and commission
    const totalRevenue = referrals
      .filter(r => r.status === 'active')
      .reduce((sum, r) => {
        // Type-safe check for merchant value in merchant referral
        const merchantValue = (r as any).merchantRevenue ? 
          parseFloat((r as any).merchantRevenue) : 
          (r as any).merchantValue ? parseFloat((r as any).merchantValue) : 0;
        return sum + merchantValue;
      }, 0);
      
    const totalCommission = payouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    // Calculate conversion rates
    const conversionRate = totalReferrals > 0 
      ? (activeReferrals / totalReferrals * 100).toFixed(2) 
      : "0.00";
    
    // Monthly breakdown
    const monthlyData = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const monthDate = new Date();
        monthDate.setMonth(now.getMonth() - i);
        
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const monthReferrals = await db.select()
          .from(merchantReferrals)
          .where(and(
            eq(merchantReferrals.affiliateId, affiliateId),
            gte(merchantReferrals.createdAt, monthStart),
            lte(merchantReferrals.createdAt, monthEnd)
          ));
        
        const monthPayouts = await db.select()
          .from(affiliatePayouts)
          .where(and(
            eq(affiliatePayouts.affiliateId, affiliateId),
            gte(affiliatePayouts.createdAt, monthStart),
            lte(affiliatePayouts.createdAt, monthEnd)
          ));
        
        return {
          month: monthDate.toLocaleString('default', { month: 'short' }),
          referrals: monthReferrals.length,
          revenue: monthReferrals
            .filter(r => r.status === 'active')
            .reduce((sum, r) => {
              // Type-safe check for merchant value in merchant referral
              const merchantValue = (r as any).merchantRevenue ? 
                parseFloat((r as any).merchantRevenue) : 
                (r as any).merchantValue ? parseFloat((r as any).merchantValue) : 0;
              return sum + merchantValue;
            }, 0),
          commission: monthPayouts
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0)
        };
      })
    );
    
    return {
      totalReferrals,
      activeReferrals,
      pendingReferrals,
      totalRevenue,
      totalCommission,
      conversionRate,
      monthlyData: monthlyData.reverse() // Most recent month first
    };
  }
  
  async getAffiliateMarketingMaterials(): Promise<any> {
    // This would typically fetch from a database table, but for this example we'll return predefined materials
    const materials = {
      banners: [
        { id: 1, name: "Banner 1", type: "image", size: "300x250", url: "/affiliate/banners/banner1.png" },
        { id: 2, name: "Banner 2", type: "image", size: "728x90", url: "/affiliate/banners/banner2.png" },
        { id: 3, name: "Banner 3", type: "image", size: "300x250", url: "/affiliate/banners/banner3.png" },
        { id: 4, name: "Banner 4", type: "image", size: "728x90", url: "/affiliate/banners/banner4.png" }
      ],
      emailTemplates: [
        { id: 1, name: "Introduction Email", type: "email", content: "Email template content..." },
        { id: 2, name: "Follow-up Email", type: "email", content: "Email template content..." },
        { id: 3, name: "Case Study Email", type: "email", content: "Email template content..." },
        { id: 4, name: "Testimonial Email", type: "email", content: "Email template content..." }
      ],
      socialMedia: [
        { id: 1, name: "Facebook Post", type: "social", platform: "facebook", content: "Social media content..." },
        { id: 2, name: "Twitter Post", type: "social", platform: "twitter", content: "Social media content..." },
        { id: 3, name: "LinkedIn Post", type: "social", platform: "linkedin", content: "Social media content..." },
        { id: 4, name: "Instagram Post", type: "social", platform: "instagram", content: "Social media content..." },
        { id: 5, name: "Product Feature", type: "social", platform: "all", content: "Social media content..." },
        { id: 6, name: "Customer Testimonial", type: "social", platform: "all", content: "Social media content..." }
      ]
    };
    
    return materials;
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

  async markAffiliatePayoutAsClawedBack(id: number, notes?: string): Promise<AffiliatePayout> {
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
  
  // Merchant Application operations
  async createMerchantApplication(application: InsertMerchantApplication): Promise<MerchantApplication> {
    // Generate a UUID for applicationId if not provided
    const applicationData: InsertMerchantApplication = {
      ...application,
      applicationId: application.applicationId || crypto.randomUUID(),
    };

    const [newApplication] = await db.insert(merchantApplications)
      .values(applicationData)
      .returning();
    
    return newApplication;
  }
  
  async getMerchantApplication(id: string): Promise<MerchantApplication | undefined> {
    const [application] = await db.select()
      .from(merchantApplications)
      .where(eq(merchantApplications.applicationId, id));
    
    return application;
  }
  
  async getMerchantApplicationsByStatus(status: string): Promise<MerchantApplication[]> {
    // If status is "all", return all applications
    if (status === "all") {
      return await db.select().from(merchantApplications);
    }
    
    // Filter applications by status
    return await db.select()
      .from(merchantApplications)
      .where(eq(merchantApplications.status, status as "pending" | "reviewing" | "approved" | "rejected"));
  }
  
  async getMerchantApplications(params: {
    status?: "pending" | "reviewing" | "approved" | "rejected";
    searchTerm?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }): Promise<{
    applications: MerchantApplication[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      status,
      searchTerm = "",
      sortField = "createdAt",
      sortDirection = "desc",
      page = 1,
      perPage = 10
    } = params;
    
    // Create base query with filters
    let baseQuery = db.select().from(merchantApplications);
    
    // Apply status filter if provided
    if (status) {
      baseQuery = baseQuery.where(eq(merchantApplications.status, status));
    }
    
    // Apply search filter if provided
    if (searchTerm) {
      const searchLower = `%${searchTerm.toLowerCase()}%`;
      
      baseQuery = baseQuery.where(
        or(
          sql`LOWER(${merchantApplications.businessName}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.industry}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.firstName}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.lastName}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.email}) LIKE ${searchLower}`,
          sql`${merchantApplications.phone} LIKE ${searchLower}`
        )
      );
    }
    
    // Get the total count with the same filters
    const countResult = await db
      .select({ value: count() })
      .from(merchantApplications)
      .where(status ? eq(merchantApplications.status, status) : sql`TRUE`)
      .$if(!!searchTerm, query => {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        return query.where(
          or(
            sql`LOWER(${merchantApplications.businessName}) LIKE ${searchLower}`,
            sql`LOWER(${merchantApplications.industry}) LIKE ${searchLower}`,
            sql`LOWER(${merchantApplications.firstName}) LIKE ${searchLower}`,
            sql`LOWER(${merchantApplications.lastName}) LIKE ${searchLower}`,
            sql`LOWER(${merchantApplications.email}) LIKE ${searchLower}`,
            sql`${merchantApplications.phone} LIKE ${searchLower}`
          )
        );
      });
    
    const totalCount = Number(countResult[0]?.value || 0);
    
    // Create a new query for sorted and paginated results
    let sortedQuery = db.select().from(merchantApplications);
    
    // Apply the same filters again
    if (status) {
      sortedQuery = sortedQuery.where(eq(merchantApplications.status, status));
    }
    
    if (searchTerm) {
      const searchLower = `%${searchTerm.toLowerCase()}%`;
      
      sortedQuery = sortedQuery.where(
        or(
          sql`LOWER(${merchantApplications.businessName}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.industry}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.firstName}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.lastName}) LIKE ${searchLower}`,
          sql`LOWER(${merchantApplications.email}) LIKE ${searchLower}`,
          sql`${merchantApplications.phone} LIKE ${searchLower}`
        )
      );
    }
    
    // Apply sorting
    if (sortDirection === 'asc') {
      // Handle different sort fields
      switch (sortField) {
        case 'businessName':
          sortedQuery = sortedQuery.orderBy(asc(merchantApplications.businessName));
          break;
        case 'createdAt':
          sortedQuery = sortedQuery.orderBy(asc(merchantApplications.createdAt));
          break;
        case 'updatedAt':
          sortedQuery = sortedQuery.orderBy(asc(merchantApplications.updatedAt));
          break;
        case 'status':
          sortedQuery = sortedQuery.orderBy(asc(merchantApplications.status));
          break;
        default:
          sortedQuery = sortedQuery.orderBy(asc(merchantApplications.createdAt));
      }
    } else {
      // desc sorting
      switch (sortField) {
        case 'businessName':
          sortedQuery = sortedQuery.orderBy(desc(merchantApplications.businessName));
          break;
        case 'createdAt':
          sortedQuery = sortedQuery.orderBy(desc(merchantApplications.createdAt));
          break;
        case 'updatedAt':
          sortedQuery = sortedQuery.orderBy(desc(merchantApplications.updatedAt));
          break;
        case 'status':
          sortedQuery = sortedQuery.orderBy(desc(merchantApplications.status));
          break;
        default:
          sortedQuery = sortedQuery.orderBy(desc(merchantApplications.createdAt));
      }
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / perPage);
    const currentPage = page > totalPages && totalPages > 0 ? totalPages : page;
    const offset = (currentPage - 1) * perPage;
    
    // Apply pagination
    sortedQuery = sortedQuery.limit(perPage).offset(offset);
    
    // Execute the query
    const applications = await sortedQuery;
    
    return {
      applications,
      totalCount,
      totalPages,
      currentPage
    };
  }
  
  async updateMerchantApplicationStatus(id: string, status: string, notes?: string): Promise<MerchantApplication | undefined> {
    const application = await this.getMerchantApplication(id);
    
    if (!application) {
      return undefined;
    }
    
    // Update the application status
    const [updatedApplication] = await db.update(merchantApplications)
      .set({
        status: status as "pending" | "reviewing" | "approved" | "rejected",
        notes: notes || application.notes,
        updatedAt: new Date()
      })
      .where(eq(merchantApplications.applicationId, id))
      .returning();
    
    return updatedApplication;
  }

  // Analytics Tracking Implementation
  
  async getClickEvent(id: number): Promise<ClickEvent | undefined> {
    const [event] = await db.select().from(clickEvents).where(eq(clickEvents.id, id));
    return event;
  }
  
  async getClickEventsByUserId(userId: number): Promise<ClickEvent[]> {
    return await db.select().from(clickEvents).where(eq(clickEvents.userId, userId));
  }
  
  async getClickEventsBySession(sessionId: string): Promise<ClickEvent[]> {
    return await db.select().from(clickEvents).where(eq(clickEvents.sessionId, sessionId));
  }
  
  async getClickEventsByDateRange(startDate: Date, endDate: Date): Promise<ClickEvent[]> {
    return await db.select().from(clickEvents).where(
      and(
        gte(clickEvents.timestamp, startDate),
        lte(clickEvents.timestamp, endDate)
      )
    );
  }
  
  async getClickEventsByElementType(elementType: string): Promise<ClickEvent[]> {
    return await db.select().from(clickEvents).where(eq(clickEvents.elementType, elementType));
  }
  
  async getClickEventsByPagePath(pagePath: string): Promise<ClickEvent[]> {
    return await db.select().from(clickEvents).where(eq(clickEvents.pagePath, pagePath));
  }
  
  async createClickEvent(event: InsertClickEvent): Promise<ClickEvent> {
    const [createdEvent] = await db.insert(clickEvents).values(event).returning();
    return createdEvent;
  }
  
  async getClickMetricsByPage(): Promise<any> {
    const results = await db.select({
      pagePath: clickEvents.pagePath,
      count: count(),
    })
    .from(clickEvents)
    .groupBy(clickEvents.pagePath)
    .orderBy(desc(count()));
    
    return results;
  }
  
  // Demo Request operations
  async createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest> {
    const [demoRequest] = await db.insert(demoRequests).values(request).returning();
    return demoRequest;
  }
  
  async getDemoRequest(id: number): Promise<DemoRequest | undefined> {
    const [demoRequest] = await db.select().from(demoRequests).where(eq(demoRequests.id, id));
    return demoRequest;
  }
  
  async getDemoRequestsByStatus(status: string): Promise<DemoRequest[]> {
    return await db.select().from(demoRequests).where(eq(demoRequests.status, status));
  }
  
  async getDemoRequestsByEmail(email: string): Promise<DemoRequest[]> {
    return await db.select().from(demoRequests).where(eq(demoRequests.email, email));
  }
  
  async getDemoRequestsByDateRange(startDate: Date, endDate: Date): Promise<DemoRequest[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return await db.select().from(demoRequests).where(
      and(
        gte(demoRequests.appointmentDate, startDateStr),
        lte(demoRequests.appointmentDate, endDateStr)
      )
    );
  }
  
  async updateDemoRequestStatus(id: number, status: string): Promise<DemoRequest> {
    const [updatedDemoRequest] = await db
      .update(demoRequests)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(demoRequests.id, id))
      .returning();
    return updatedDemoRequest;
  }
  
  async processDemoRequest(id: number, processedBy: number): Promise<DemoRequest> {
    const [processedDemoRequest] = await db
      .update(demoRequests)
      .set({ 
        status: 'processed',
        processedBy,
        processedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(demoRequests.id, id))
      .returning();
    return processedDemoRequest;
  }
  
  // Tax Calculation System Implementation

  // Federal Tax Brackets
  async getFederalTaxBracket(id: number): Promise<FederalTaxBracket | undefined> {
    const [bracket] = await db.select().from(federalTaxBrackets).where(eq(federalTaxBrackets.id, id));
    return bracket;
  }

  async getFederalTaxBracketsByYear(year: number): Promise<FederalTaxBracket[]> {
    return await db.select().from(federalTaxBrackets).where(eq(federalTaxBrackets.year, year))
      .orderBy(federalTaxBrackets.bracketOrder);
  }

  async getFederalTaxBracketsByFilingStatus(year: number, filingStatus: string): Promise<FederalTaxBracket[]> {
    return await db.select().from(federalTaxBrackets)
      .where(and(
        eq(federalTaxBrackets.year, year),
        eq(federalTaxBrackets.filingStatus, filingStatus as any)
      ))
      .orderBy(federalTaxBrackets.bracketOrder);
  }

  async createFederalTaxBracket(bracket: InsertFederalTaxBracket): Promise<FederalTaxBracket> {
    const [newBracket] = await db.insert(federalTaxBrackets).values(bracket).returning();
    return newBracket;
  }

  async updateFederalTaxBracket(id: number, data: Partial<InsertFederalTaxBracket>): Promise<FederalTaxBracket> {
    const [updated] = await db
      .update(federalTaxBrackets)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(federalTaxBrackets.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Federal tax bracket with id ${id} not found`);
    }
    
    return updated;
  }

  // State Tax Brackets
  async getStateTaxBracket(id: number): Promise<StateTaxBracket | undefined> {
    const [bracket] = await db.select().from(stateTaxBrackets).where(eq(stateTaxBrackets.id, id));
    return bracket;
  }

  async getStateTaxBracketsByState(state: string, year: number): Promise<StateTaxBracket[]> {
    return await db.select().from(stateTaxBrackets)
      .where(and(
        eq(stateTaxBrackets.state, state),
        eq(stateTaxBrackets.year, year)
      ))
      .orderBy(stateTaxBrackets.bracketOrder);
  }

  async getStateTaxBracketsByFilingStatus(state: string, year: number, filingStatus: string): Promise<StateTaxBracket[]> {
    return await db.select().from(stateTaxBrackets)
      .where(and(
        eq(stateTaxBrackets.state, state),
        eq(stateTaxBrackets.year, year),
        eq(stateTaxBrackets.filingStatus, filingStatus as any)
      ))
      .orderBy(stateTaxBrackets.bracketOrder);
  }

  async createStateTaxBracket(bracket: InsertStateTaxBracket): Promise<StateTaxBracket> {
    const [newBracket] = await db.insert(stateTaxBrackets).values(bracket).returning();
    return newBracket;
  }

  async updateStateTaxBracket(id: number, data: Partial<InsertStateTaxBracket>): Promise<StateTaxBracket> {
    const [updated] = await db
      .update(stateTaxBrackets)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(stateTaxBrackets.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`State tax bracket with id ${id} not found`);
    }
    
    return updated;
  }

  // FICA Rates
  async getFicaRate(id: number): Promise<FicaRate | undefined> {
    const [rate] = await db.select().from(ficaRates).where(eq(ficaRates.id, id));
    return rate;
  }

  async getFicaRateByYear(year: number): Promise<FicaRate | undefined> {
    const [rate] = await db.select().from(ficaRates).where(eq(ficaRates.year, year));
    return rate;
  }

  async createFicaRate(rate: InsertFicaRate): Promise<FicaRate> {
    const [newRate] = await db.insert(ficaRates).values(rate).returning();
    return newRate;
  }

  async updateFicaRate(id: number, data: Partial<InsertFicaRate>): Promise<FicaRate> {
    const [updated] = await db
      .update(ficaRates)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(ficaRates.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`FICA rate with id ${id} not found`);
    }
    
    return updated;
  }

  // Tax Allowances
  async getTaxAllowance(id: number): Promise<TaxAllowance | undefined> {
    const [allowance] = await db.select().from(taxAllowances).where(eq(taxAllowances.id, id));
    return allowance;
  }

  async getTaxAllowanceByYear(year: number): Promise<TaxAllowance | undefined> {
    const [allowance] = await db.select().from(taxAllowances).where(eq(taxAllowances.year, year));
    return allowance;
  }

  async createTaxAllowance(allowance: InsertTaxAllowance): Promise<TaxAllowance> {
    const [newAllowance] = await db.insert(taxAllowances).values(allowance).returning();
    return newAllowance;
  }

  async updateTaxAllowance(id: number, data: Partial<InsertTaxAllowance>): Promise<TaxAllowance> {
    const [updated] = await db
      .update(taxAllowances)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(taxAllowances.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Tax allowance with id ${id} not found`);
    }
    
    return updated;
  }

  // Employee Tax Profiles
  async getEmployeeTaxProfile(id: number): Promise<EmployeeTaxProfile | undefined> {
    const [profile] = await db.select().from(employeeTaxProfiles).where(eq(employeeTaxProfiles.id, id));
    return profile;
  }

  async getEmployeeTaxProfileByUserId(userId: number, year: number): Promise<EmployeeTaxProfile | undefined> {
    const [profile] = await db.select().from(employeeTaxProfiles)
      .where(and(
        eq(employeeTaxProfiles.userId, userId),
        eq(employeeTaxProfiles.year, year)
      ));
    return profile;
  }

  async getEmployeeTaxProfilesByYear(year: number): Promise<EmployeeTaxProfile[]> {
    return await db.select().from(employeeTaxProfiles).where(eq(employeeTaxProfiles.year, year));
  }

  async createEmployeeTaxProfile(profile: InsertEmployeeTaxProfile): Promise<EmployeeTaxProfile> {
    const [newProfile] = await db.insert(employeeTaxProfiles).values(profile).returning();
    return newProfile;
  }

  async updateEmployeeTaxProfile(id: number, data: Partial<InsertEmployeeTaxProfile>): Promise<EmployeeTaxProfile> {
    const [updated] = await db
      .update(employeeTaxProfiles)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(employeeTaxProfiles.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Employee tax profile with id ${id} not found`);
    }
    
    return updated;
  }

  // Tax Calculations
  async getTaxCalculation(id: number): Promise<TaxCalculation | undefined> {
    const [calculation] = await db.select().from(taxCalculations).where(eq(taxCalculations.id, id));
    return calculation;
  }

  async getTaxCalculationsByPayrollEntryId(payrollEntryId: number): Promise<TaxCalculation[]> {
    return await db.select().from(taxCalculations).where(eq(taxCalculations.payrollEntryId, payrollEntryId));
  }

  async getTaxCalculationsByPerformedBy(userId: number): Promise<TaxCalculation[]> {
    return await db.select().from(taxCalculations).where(eq(taxCalculations.performedBy, userId));
  }

  async createTaxCalculation(calculation: InsertTaxCalculation): Promise<TaxCalculation> {
    const [newCalculation] = await db.insert(taxCalculations).values(calculation).returning();
    return newCalculation;
  }

  // Tax Calculation Operations
  async calculateFederalTax(income: string, filingStatus: string, year: number): Promise<{tax: string, effectiveRate: string, marginRate: string}> {
    // Get the federal tax brackets for the specified year and filing status
    const brackets = await this.getFederalTaxBracketsByFilingStatus(year, filingStatus);
    
    if (brackets.length === 0) {
      throw new Error(`No federal tax brackets found for year ${year} and filing status ${filingStatus}`);
    }
    
    // Get tax allowances for the year
    const allowance = await this.getTaxAllowanceByYear(year);
    
    if (!allowance) {
      throw new Error(`No tax allowances found for year ${year}`);
    }
    
    // Get standard deduction based on filing status
    let standardDeduction = 0;
    switch (filingStatus) {
      case "single":
        standardDeduction = parseFloat(allowance.standardDeductionSingle);
        break;
      case "married_joint":
        standardDeduction = parseFloat(allowance.standardDeductionJoint);
        break;
      case "head_of_household":
        standardDeduction = parseFloat(allowance.standardDeductionHeadOfHousehold);
        break;
      default:
        standardDeduction = parseFloat(allowance.standardDeductionSingle);
    }
    
    // Calculate taxable income after standard deduction
    const grossIncome = parseFloat(income);
    const taxableIncome = Math.max(grossIncome - standardDeduction, 0);
    
    // Calculate tax using progressive brackets
    let tax = 0;
    let marginRate = 0;
    
    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const bracketStart = parseFloat(bracket.incomeFrom.toString());
      const bracketEnd = bracket.incomeTo ? parseFloat(bracket.incomeTo.toString()) : Infinity;
      const rate = parseFloat(bracket.rate.toString());
      
      if (taxableIncome > bracketStart) {
        // This is the marginal tax rate if this is the highest bracket the income falls into
        marginRate = rate;
        
        // Calculate tax for this bracket
        const incomeInBracket = Math.min(taxableIncome, bracketEnd) - bracketStart;
        
        if (bracket.baseAmount) {
          // If the bracket has a base amount, use that plus the rate times the excess
          if (i === 0) {
            // If this is the first bracket, just use the rate times income
            tax += incomeInBracket * rate;
          } else {
            // Otherwise, for higher brackets we add the base amount from previous brackets
            // and calculate the tax on the income in this bracket
            tax = parseFloat(bracket.baseAmount.toString()) + (taxableIncome - bracketStart) * rate;
            break; // We've found the correct bracket, so we can stop
          }
        } else {
          // If no base amount is provided, calculate normally
          tax += incomeInBracket * rate;
        }
      }
    }
    
    // Calculate effective tax rate
    const effectiveRate = taxableIncome > 0 ? (tax / taxableIncome) : 0;
    
    return {
      tax: tax.toFixed(2),
      effectiveRate: (effectiveRate * 100).toFixed(2),
      marginRate: (marginRate * 100).toFixed(2)
    };
  }

  async calculateStateTax(income: string, state: string, filingStatus: string, year: number): Promise<{tax: string, effectiveRate: string}> {
    // Get the state tax brackets for the specified state, year, and filing status
    const brackets = await this.getStateTaxBracketsByFilingStatus(state, year, filingStatus);
    
    if (brackets.length === 0) {
      // Some states don't have income tax
      if (['WY', 'WA', 'TX', 'SD', 'NV', 'FL', 'AK'].includes(state.toUpperCase())) {
        return { tax: "0.00", effectiveRate: "0.00" };
      }
      throw new Error(`No state tax brackets found for state ${state}, year ${year}, and filing status ${filingStatus}`);
    }
    
    // Get tax allowances for the year
    const allowance = await this.getTaxAllowanceByYear(year);
    
    if (!allowance) {
      throw new Error(`No tax allowances found for year ${year}`);
    }
    
    // Calculate taxable income (most states start with federal AGI/taxable income)
    // This is a simplified version - in reality, states have varying deductions and credits
    const grossIncome = parseFloat(income);
    const taxableIncome = grossIncome;
    
    // Calculate tax using progressive brackets
    let tax = 0;
    
    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const bracketStart = parseFloat(bracket.incomeFrom.toString());
      const bracketEnd = bracket.incomeTo ? parseFloat(bracket.incomeTo.toString()) : Infinity;
      const rate = parseFloat(bracket.rate.toString());
      
      if (taxableIncome > bracketStart) {
        // Calculate tax for this bracket
        const incomeInBracket = Math.min(taxableIncome, bracketEnd) - bracketStart;
        
        if (bracket.baseAmount) {
          // If the bracket has a base amount, use that plus the rate times the excess
          if (i === 0) {
            // If this is the first bracket, just use the rate times income
            tax += incomeInBracket * rate;
          } else {
            // For higher brackets, add base amount and calculate tax on income in this bracket
            tax = parseFloat(bracket.baseAmount.toString()) + (taxableIncome - bracketStart) * rate;
            break; // We've found the correct bracket, so we can stop
          }
        } else {
          // If no base amount is provided, calculate normally
          tax += incomeInBracket * rate;
        }
      }
    }
    
    // Calculate effective tax rate
    const effectiveRate = taxableIncome > 0 ? (tax / taxableIncome) : 0;
    
    return {
      tax: tax.toFixed(2),
      effectiveRate: (effectiveRate * 100).toFixed(2)
    };
  }

  async calculateFicaTax(income: string, ytdEarnings: string, filingStatus: string, year: number): Promise<{socialSecurity: string, medicare: string, additionalMedicare: string, total: string}> {
    // Get FICA rates for the year
    const ficaRate = await this.getFicaRateByYear(year);
    
    if (!ficaRate) {
      throw new Error(`No FICA rates found for year ${year}`);
    }
    
    const grossIncome = parseFloat(income);
    const ytdGrossEarnings = parseFloat(ytdEarnings);
    
    // Calculate Social Security tax (subject to wage cap)
    const ssRate = parseFloat(ficaRate.socialSecurityRate.toString());
    const ssWageCap = parseFloat(ficaRate.socialSecurityWageCap.toString());
    
    // If YTD earnings have already exceeded the wage cap, no SS tax is due
    // If the current income will put them over the wage cap, only tax the portion up to the cap
    let socialSecurityTaxableIncome = 0;
    if (ytdGrossEarnings >= ssWageCap) {
      socialSecurityTaxableIncome = 0;
    } else if (ytdGrossEarnings + grossIncome > ssWageCap) {
      socialSecurityTaxableIncome = ssWageCap - ytdGrossEarnings;
    } else {
      socialSecurityTaxableIncome = grossIncome;
    }
    
    const socialSecurityTax = socialSecurityTaxableIncome * ssRate;
    
    // Calculate Medicare tax (no income limit for basic rate)
    const medicareRate = parseFloat(ficaRate.medicareRate.toString());
    const medicareAdditionalRate = parseFloat(ficaRate.additionalMedicareRate.toString());
    
    // Determine the threshold for additional Medicare tax based on filing status
    let additionalMedicareThreshold;
    if (filingStatus === "married_joint") {
      additionalMedicareThreshold = parseFloat(ficaRate.additionalMedicareThresholdJoint?.toString() || ficaRate.additionalMedicareThreshold.toString());
    } else {
      additionalMedicareThreshold = parseFloat(ficaRate.additionalMedicareThreshold.toString());
    }
    
    // Calculate regular Medicare tax
    const medicareTax = grossIncome * medicareRate;
    
    // Calculate additional Medicare tax if applicable
    let additionalMedicareTax = 0;
    if (ytdGrossEarnings + grossIncome > additionalMedicareThreshold) {
      // Only apply additional tax to the portion exceeding the threshold
      const incomeExceedingThreshold = Math.max(0, 
        (ytdGrossEarnings > additionalMedicareThreshold)
          ? grossIncome // All income is above threshold if YTD already exceeds threshold
          : (ytdGrossEarnings + grossIncome - additionalMedicareThreshold) // Only the portion that puts them over
      );
      
      additionalMedicareTax = incomeExceedingThreshold * medicareAdditionalRate;
    }
    
    // Calculate total FICA tax
    const totalFicaTax = socialSecurityTax + medicareTax + additionalMedicareTax;
    
    return {
      socialSecurity: socialSecurityTax.toFixed(2),
      medicare: medicareTax.toFixed(2),
      additionalMedicare: additionalMedicareTax.toFixed(2),
      total: totalFicaTax.toFixed(2)
    };
  }

  // POS Tenant operations
  async getPosTenant(id: number): Promise<PosTenant | undefined> {
    const [tenant] = await db.select().from(posTenants).where(eq(posTenants.id, id));
    return tenant;
  }
  
  async getPosTenantBySubdomain(subdomain: string): Promise<PosTenant | undefined> {
    const [tenant] = await db.select().from(posTenants).where(eq(posTenants.subdomain, subdomain));
    return tenant;
  }
  
  async getPosTenantsByStatus(status: string): Promise<PosTenant[]> {
    return await db.select().from(posTenants).where(eq(posTenants.status, status));
  }
  
  async getAllPosTenants(): Promise<PosTenant[]> {
    return await db.select().from(posTenants);
  }
  
  async createPosTenant(tenant: InsertPosTenant): Promise<PosTenant> {
    // Generate a subdomain from business name if not provided
    if (!tenant.subdomain) {
      tenant.subdomain = tenant.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const [newTenant] = await db.insert(posTenants).values(tenant).returning();
    return newTenant;
  }
  
  async updatePosTenant(id: number, data: Partial<InsertPosTenant>): Promise<PosTenant> {
    const [updatedTenant] = await db
      .update(posTenants)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(posTenants.id, id))
      .returning();
    
    if (!updatedTenant) {
      throw new Error(`Tenant with id ${id} not found`);
    }
    
    return updatedTenant;
  }
  
  async updatePosTenantStatus(id: number, status: string): Promise<PosTenant> {
    const [updatedTenant] = await db
      .update(posTenants)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === 'active' ? { activatedAt: new Date() } : {})
      })
      .where(eq(posTenants.id, id))
      .returning();
    
    if (!updatedTenant) {
      throw new Error(`Tenant with id ${id} not found`);
    }
    
    return updatedTenant;
  }
  
  async incrementPosTenantActiveInstances(id: number): Promise<PosTenant> {
    const tenant = await this.getPosTenant(id);
    if (!tenant) {
      throw new Error(`Tenant with id ${id} not found`);
    }
    
    const [updatedTenant] = await db
      .update(posTenants)
      .set({
        activeInstancesCount: tenant.activeInstancesCount + 1,
        updatedAt: new Date()
      })
      .where(eq(posTenants.id, id))
      .returning();
    
    return updatedTenant;
  }
  
  async generatePosTenantInstance(id: number): Promise<{instanceUrl: string}> {
    const tenant = await this.getPosTenant(id);
    if (!tenant) {
      throw new Error(`Tenant with id ${id} not found`);
    }
    
    // Update the tenant status to active if it's pending
    if (tenant.status === 'pending') {
      await this.updatePosTenantStatus(id, 'active');
    }
    
    // Increment the active instances count
    await this.incrementPosTenantActiveInstances(id);
    
    // In a production environment, this would trigger the actual deployment
    // of a new instance with the tenant's configuration
    
    // Generate the instance URL
    const instanceUrl = tenant.customDomain || `https://${tenant.subdomain}.paysurity.com`;
    
    return { instanceUrl };
  }

  async calculatePayrollTaxes(payrollEntryId: number, performedBy: number): Promise<TaxCalculation> {
    // Get the payroll entry
    const payrollEntry = await this.getPayrollEntry(payrollEntryId);
    if (!payrollEntry) {
      throw new Error(`Payroll entry with id ${payrollEntryId} not found`);
    }
    
    // Get the employee
    const employee = await this.getUser(payrollEntry.employeeId);
    if (!employee) {
      throw new Error(`Employee with id ${payrollEntry.employeeId} not found`);
    }
    
    // Get the employee's tax profile for the current year
    const currentYear = new Date().getFullYear();
    const taxProfile = await this.getEmployeeTaxProfileByUserId(employee.id, currentYear);
    
    if (!taxProfile) {
      throw new Error(`No tax profile found for employee ${employee.id} for year ${currentYear}`);
    }
    
    // Calculate gross income for this pay period
    const grossIncome = parseFloat(payrollEntry.grossAmount);
    
    // Get year-to-date earnings before this payroll
    const pastPayrolls = await this.getPayrollEntriesByUserId(employee.id);
    const ytdEarnings = pastPayrolls
      .filter(entry => entry.id !== payrollEntryId && new Date(entry.payPeriodEnd).getFullYear() === currentYear)
      .reduce((sum, entry) => sum + parseFloat(entry.grossAmount), 0);
    
    // Calculate federal tax withholding (if not exempt)
    let federalWithholding = 0;
    let federalTaxableIncome = grossIncome;
    
    if (!taxProfile.exemptFromFederal) {
      // Apply federal tax calculation
      const federalTaxResult = await this.calculateFederalTax(
        grossIncome.toString(),
        taxProfile.filingStatus,
        currentYear
      );
      federalWithholding = parseFloat(federalTaxResult.tax);
    }
    
    // Calculate state tax withholding (if not exempt)
    let stateWithholding = 0;
    let stateTaxableIncome = grossIncome;
    
    if (!taxProfile.exemptFromState) {
      // Apply state tax calculation
      const stateTaxResult = await this.calculateStateTax(
        grossIncome.toString(),
        taxProfile.stateOfEmployment,
        taxProfile.filingStatus,
        currentYear
      );
      stateWithholding = parseFloat(stateTaxResult.tax);
    }
    
    // Calculate FICA taxes
    const ficaResult = await this.calculateFicaTax(
      grossIncome.toString(),
      ytdEarnings.toString(),
      taxProfile.filingStatus,
      currentYear
    );
    
    const socialSecurityWithholding = parseFloat(ficaResult.socialSecurity);
    const medicareWithholding = parseFloat(ficaResult.medicare) + parseFloat(ficaResult.additionalMedicare);
    
    // Calculate local tax if applicable
    let localTaxWithholding = 0;
    if (!taxProfile.exemptFromLocalTax && taxProfile.localTaxRate) {
      localTaxWithholding = grossIncome * parseFloat(taxProfile.localTaxRate.toString());
    }
    
    // Add additional withholding if specified in tax profile
    if (taxProfile.additionalWithholding) {
      federalWithholding += parseFloat(taxProfile.additionalWithholding.toString());
    }
    
    // Calculate total withholding
    const totalWithholding = federalWithholding + stateWithholding + 
                            socialSecurityWithholding + medicareWithholding + 
                            localTaxWithholding;
    
    // Calculate YTD totals including this payroll
    const ytdGrossEarnings = ytdEarnings + grossIncome;
    
    // Get previous tax calculations for the year
    const previousTaxCalcs = await this.getTaxCalculationsByPerformedBy(performedBy);
    const yearTaxCalcs = previousTaxCalcs.filter(calc => {
      const payroll = pastPayrolls.find(p => p.id === calc.payrollEntryId);
      return payroll && new Date(payroll.payPeriodEnd).getFullYear() === currentYear;
    });
    
    // Calculate YTD tax totals
    const ytdFederalWithholding = yearTaxCalcs.reduce((sum, calc) => sum + parseFloat(calc.federalWithholding.toString()), 0) + federalWithholding;
    const ytdStateWithholding = yearTaxCalcs.reduce((sum, calc) => sum + parseFloat(calc.stateWithholding.toString()), 0) + stateWithholding;
    const ytdSocialSecurityWithholding = yearTaxCalcs.reduce((sum, calc) => sum + parseFloat(calc.socialSecurityWithholding.toString()), 0) + socialSecurityWithholding;
    const ytdMedicareWithholding = yearTaxCalcs.reduce((sum, calc) => sum + parseFloat(calc.medicareWithholding.toString()), 0) + medicareWithholding;
    
    // Create and save the tax calculation record
    const taxCalculation: InsertTaxCalculation = {
      payrollEntryId,
      federalTaxableIncome: federalTaxableIncome.toString(),
      stateTaxableIncome: stateTaxableIncome.toString(),
      federalWithholding: federalWithholding.toString(),
      stateWithholding: stateWithholding.toString(),
      socialSecurityWithholding: socialSecurityWithholding.toString(),
      medicareWithholding: medicareWithholding.toString(),
      localTaxWithholding: localTaxWithholding.toString(),
      totalWithholding: totalWithholding.toString(),
      ytdGrossEarnings: ytdGrossEarnings.toString(),
      ytdFederalWithholding: ytdFederalWithholding.toString(),
      ytdStateWithholding: ytdStateWithholding.toString(),
      ytdSocialSecurityWithholding: ytdSocialSecurityWithholding.toString(),
      ytdMedicareWithholding: ytdMedicareWithholding.toString(),
      calculationMethod: "percentage", // Or "wage_bracket" depending on implementation
      calculationNotes: `Calculated for pay period ending ${payrollEntry.payPeriodEnd}`,
      performedBy
    };
    
    return await this.createTaxCalculation(taxCalculation);
  }

  // Merchant Transaction operations
  async getMerchantTransaction(id: number): Promise<MerchantTransaction | undefined> {
    try {
      const [transaction] = await db.select().from(merchantTransactions).where(eq(merchantTransactions.id, id));
      return transaction;
    } catch (error) {
      console.error(`Error getting merchant transaction ${id}:`, error);
      return undefined;
    }
  }

  async getMerchantTransactionsByMerchantId(merchantId: number): Promise<MerchantTransaction[]> {
    try {
      return await db.select().from(merchantTransactions).where(eq(merchantTransactions.merchantId, merchantId));
    } catch (error) {
      console.error(`Error getting merchant transactions for merchant ${merchantId}:`, error);
      return [];
    }
  }

  async getMerchantTransactionsByPaymentGatewayId(paymentGatewayId: number): Promise<MerchantTransaction[]> {
    try {
      return await db.select().from(merchantTransactions).where(eq(merchantTransactions.paymentGatewayId, paymentGatewayId));
    } catch (error) {
      console.error(`Error getting merchant transactions for payment gateway ${paymentGatewayId}:`, error);
      return [];
    }
  }

  async getMerchantTransactionsByStatus(status: string): Promise<MerchantTransaction[]> {
    try {
      return await db.select().from(merchantTransactions).where(eq(merchantTransactions.status as any, status));
    } catch (error) {
      console.error(`Error getting merchant transactions with status ${status}:`, error);
      return [];
    }
  }

  async createMerchantTransaction(transaction: InsertMerchantTransaction): Promise<MerchantTransaction> {
    try {
      const [newTransaction] = await db.insert(merchantTransactions).values(transaction).returning();
      return newTransaction;
    } catch (error) {
      console.error("Error creating merchant transaction:", error);
      throw new Error("Failed to create merchant transaction");
    }
  }

  async updateMerchantTransactionStatus(id: number, status: string): Promise<MerchantTransaction> {
    try {
      const [updatedTransaction] = await db
        .update(merchantTransactions)
        .set({ status, updatedAt: new Date() })
        .where(eq(merchantTransactions.id, id))
        .returning();
      
      if (!updatedTransaction) {
        throw new Error(`Merchant transaction with id ${id} not found`);
      }
      
      return updatedTransaction;
    } catch (error) {
      console.error(`Error updating merchant transaction ${id} status:`, error);
      throw new Error("Failed to update merchant transaction status");
    }
  }

  async updateMerchantTransactionMetadata(id: number, metadata: any): Promise<MerchantTransaction> {
    try {
      const [updatedTransaction] = await db
        .update(merchantTransactions)
        .set({ metadata, updatedAt: new Date() })
        .where(eq(merchantTransactions.id, id))
        .returning();
      
      if (!updatedTransaction) {
        throw new Error(`Merchant transaction with id ${id} not found`);
      }
      
      return updatedTransaction;
    } catch (error) {
      console.error(`Error updating merchant transaction ${id} metadata:`, error);
      throw new Error("Failed to update merchant transaction metadata");
    }
  }
  // Family Group operations
  async createFamilyGroup(familyGroup: InsertFamilyGroup): Promise<FamilyGroup> {
    const [newGroup] = await db.insert(familyGroups).values(familyGroup).returning();
    return newGroup;
  }

  async getFamilyGroup(id: number): Promise<FamilyGroup | undefined> {
    const [group] = await db.select().from(familyGroups).where(eq(familyGroups.id, id));
    return group;
  }

  async getFamilyGroupsByParentId(parentId: number): Promise<FamilyGroup[]> {
    return db
      .select()
      .from(familyGroups)
      .where(
        or(
          eq(familyGroups.parentUserId, parentId),
          eq(familyGroups.secondaryParentUserId, parentId)
        )
      );
  }

  async updateFamilyGroup(id: number, data: Partial<InsertFamilyGroup>): Promise<FamilyGroup> {
    const [updated] = await db
      .update(familyGroups)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(familyGroups.id, id))
      .returning();
    return updated;
  }

  // Family Member operations
  async createFamilyMember(familyMember: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db.insert(familyMembers).values(familyMember).returning();
    return newMember;
  }

  async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
    const [member] = await db.select().from(familyMembers).where(eq(familyMembers.id, id));
    return member;
  }

  async getFamilyMemberByUserId(userId: number): Promise<FamilyMember | undefined> {
    const [member] = await db.select().from(familyMembers).where(eq(familyMembers.userId, userId));
    return member;
  }

  async getFamilyMembersByGroupId(groupId: number): Promise<FamilyMember[]> {
    return db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.familyGroupId, groupId));
  }

  async getFamilyMembersByParentId(parentId: number): Promise<FamilyMember[]> {
    // Get all groups where user is a parent
    const groups = await this.getFamilyGroupsByParentId(parentId);
    if (!groups.length) return [];

    const groupIds = groups.map(g => g.id);
    
    // Get all family members in these groups
    return db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.isActive, true),
          eq(familyMembers.role, 'child'),
          familyMembers.familyGroupId.in(groupIds)
        )
      );
  }

  async getFamilyMemberIdsByGroupIds(groupIds: number[]): Promise<number[]> {
    const members = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.isActive, true),
          eq(familyMembers.role, 'child'),
          familyMembers.familyGroupId.in(groupIds)
        )
      );
    return members.map(m => m.id);
  }

  async updateFamilyMember(id: number, data: Partial<InsertFamilyMember>): Promise<FamilyMember> {
    const [updated] = await db
      .update(familyMembers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(familyMembers.id, id))
      .returning();
    return updated;
  }

  // Allowance operations
  async createAllowance(allowance: InsertAllowance): Promise<Allowance> {
    const [newAllowance] = await db.insert(allowances).values(allowance).returning();
    return newAllowance;
  }

  async getAllowance(id: number): Promise<Allowance | undefined> {
    const [allowance] = await db.select().from(allowances).where(eq(allowances.id, id));
    return allowance;
  }

  async getAllowanceByChildId(childId: number): Promise<Allowance[]> {
    return db
      .select()
      .from(allowances)
      .where(
        and(
          eq(allowances.childUserId, childId),
          eq(allowances.isActive, true)
        )
      );
  }

  async updateAllowance(id: number, data: Partial<InsertAllowance>): Promise<Allowance> {
    const [updated] = await db
      .update(allowances)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(allowances.id, id))
      .returning();
    return updated;
  }

  // Spending Rules operations
  async createSpendingRules(spendingRules: InsertSpendingRules): Promise<SpendingRules> {
    const [rules] = await db.insert(spendingRules).values(spendingRules).returning();
    return rules;
  }

  async getSpendingRules(id: number): Promise<SpendingRules | undefined> {
    const [rules] = await db.select().from(spendingRules).where(eq(spendingRules.id, id));
    return rules;
  }

  async getSpendingRulesByChildId(childId: number): Promise<SpendingRules | undefined> {
    const [rules] = await db.select().from(spendingRules).where(eq(spendingRules.childId, childId));
    return rules;
  }

  async updateSpendingRules(id: number, data: Partial<InsertSpendingRules>): Promise<SpendingRules> {
    const [updated] = await db
      .update(spendingRules)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(spendingRules.id, id))
      .returning();
    return updated;
  }

  // Family Task operations
  async createFamilyTask(familyTask: InsertFamilyTask): Promise<FamilyTask> {
    const [task] = await db.insert(familyTasks).values(familyTask).returning();
    return task;
  }

  async getFamilyTask(id: number): Promise<FamilyTask | undefined> {
    const [task] = await db.select().from(familyTasks).where(eq(familyTasks.id, id));
    return task;
  }

  async getFamilyTasksByAssignedToUserId(userId: number): Promise<FamilyTask[]> {
    return db
      .select()
      .from(familyTasks)
      .where(eq(familyTasks.assignedToUserId, userId));
  }

  async getFamilyTasksByFamilyGroupId(familyGroupId: number): Promise<FamilyTask[]> {
    return db
      .select()
      .from(familyTasks)
      .where(eq(familyTasks.familyGroupId, familyGroupId));
  }

  async updateFamilyTask(id: number, data: Partial<InsertFamilyTask>): Promise<FamilyTask> {
    const [updated] = await db
      .update(familyTasks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(familyTasks.id, id))
      .returning();
    return updated;
  }

  // Spending Request operations
  async createSpendingRequest(spendingRequest: InsertSpendingRequest): Promise<SpendingRequest> {
    const [request] = await db.insert(spendingRequests).values(spendingRequest).returning();
    return request;
  }

  async getSpendingRequest(id: number): Promise<SpendingRequest | undefined> {
    const [request] = await db.select().from(spendingRequests).where(eq(spendingRequests.id, id));
    return request;
  }

  async getSpendingRequestsByChildId(childId: number): Promise<SpendingRequest[]> {
    return db
      .select()
      .from(spendingRequests)
      .where(eq(spendingRequests.childId, childId))
      .orderBy(desc(spendingRequests.createdAt));
  }

  async getSpendingRequestsByChildrenIds(childrenIds: number[]): Promise<SpendingRequest[]> {
    return db
      .select()
      .from(spendingRequests)
      .where(inArray(spendingRequests.childId, childrenIds))
      .orderBy(desc(spendingRequests.createdAt));
  }

  async updateSpendingRequestStatus(id: number, status: string, notes?: string): Promise<SpendingRequest> {
    const [updated] = await db
      .update(spendingRequests)
      .set({
        status,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(spendingRequests.id, id))
      .returning();
    return updated;
  }
  
  // Enhanced Savings Goals operations for parent-child
  async getSavingsGoalsByChildId(childId: number): Promise<SavingsGoal[]> {
    // Get the user id for the child member
    const childMember = await this.getFamilyMember(childId);
    if (!childMember) {
      return [];
    }
    
    return this.getSavingsGoalsByUserId(childMember.userId);
  }

  // =========================================
  // Restaurant POS - Tables Implementation
  // =========================================
  async getRestaurantTable(id: number): Promise<RestaurantTable | undefined> {
    const [table] = await db.select().from(restaurantTables).where(eq(restaurantTables.id, id));
    return table;
  }

  async getRestaurantTablesByMerchantId(merchantId: number): Promise<RestaurantTable[]> {
    return await db.select()
      .from(restaurantTables)
      .where(eq(restaurantTables.merchantId, merchantId));
  }

  async createRestaurantTable(table: InsertRestaurantTable): Promise<RestaurantTable> {
    const [newTable] = await db.insert(restaurantTables).values(table).returning();
    return newTable;
  }

  async updateRestaurantTableStatus(id: number, status: string, currentOrderId?: number): Promise<RestaurantTable> {
    const updateData: Partial<RestaurantTable> = {
      status,
    };
    
    if (currentOrderId !== undefined) {
      updateData.currentOrderId = currentOrderId;
    }
    
    const [updatedTable] = await db
      .update(restaurantTables)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(restaurantTables.id, id))
      .returning();
    
    if (!updatedTable) {
      throw new Error(`Table with id ${id} not found`);
    }
    
    return updatedTable;
  }

  async deleteRestaurantTable(id: number): Promise<void> {
    await db.delete(restaurantTables).where(eq(restaurantTables.id, id));
  }

  // =========================================
  // Restaurant POS - Orders Implementation
  // =========================================
  async getRestaurantOrder(id: number): Promise<RestaurantOrder | undefined> {
    const [order] = await db.select().from(restaurantOrders).where(eq(restaurantOrders.id, id));
    return order;
  }

  async getRestaurantOrdersByMerchantId(merchantId: number): Promise<RestaurantOrder[]> {
    return await db.select()
      .from(restaurantOrders)
      .where(eq(restaurantOrders.merchantId, merchantId))
      .orderBy(desc(restaurantOrders.createdAt));
  }

  async getRestaurantOrdersByStatus(merchantId: number, status: string): Promise<RestaurantOrder[]> {
    return await db.select()
      .from(restaurantOrders)
      .where(and(
        eq(restaurantOrders.merchantId, merchantId),
        eq(restaurantOrders.status, status)
      ))
      .orderBy(desc(restaurantOrders.createdAt));
  }

  async createRestaurantOrder(order: InsertRestaurantOrder): Promise<RestaurantOrder> {
    const [newOrder] = await db.insert(restaurantOrders).values(order).returning();
    
    // If the order is associated with a table, update the table status to occupied
    if (newOrder.tableId) {
      await this.updateRestaurantTableStatus(newOrder.tableId, "occupied", newOrder.id);
    }
    
    return newOrder;
  }

  async updateRestaurantOrderStatus(
    id: number, 
    status: string, 
    updateInfo?: { 
      actualPrepTime?: number, 
      smsNotificationSent?: boolean,
      smsNotificationCount?: number,
      lastSmsTimestamp?: Date
    }
  ): Promise<RestaurantOrder> {
    const [updatedOrder] = await db
      .update(restaurantOrders)
      .set({ 
        status, 
        updatedAt: new Date(),
        ...(status === "completed" ? { completedAt: new Date() } : {}),
        ...(updateInfo?.actualPrepTime !== undefined ? { actualPrepTime: updateInfo.actualPrepTime } : {}),
        ...(updateInfo?.smsNotificationSent !== undefined ? { smsNotificationSent: updateInfo.smsNotificationSent } : {}),
        ...(updateInfo?.smsNotificationCount !== undefined ? { smsNotificationCount: updateInfo.smsNotificationCount } : {}),
        ...(updateInfo?.lastSmsTimestamp ? { lastSmsTimestamp: updateInfo.lastSmsTimestamp } : {})
      })
      .where(eq(restaurantOrders.id, id))
      .returning();
    
    if (!updatedOrder) {
      throw new Error(`Order with id ${id} not found`);
    }
    
    // If the order status is completed or canceled and it has a table, update the table status
    if ((status === "completed" || status === "canceled") && updatedOrder.tableId) {
      await this.updateRestaurantTableStatus(updatedOrder.tableId, "available", null);
    }
    
    return updatedOrder;
  }

  async completeRestaurantOrder(id: number, paymentMethod: string, totalPaid: string): Promise<RestaurantOrder> {
    const [updatedOrder] = await db
      .update(restaurantOrders)
      .set({ 
        status: "completed", 
        paymentMethod,
        paymentStatus: "paid",
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(restaurantOrders.id, id))
      .returning();
    
    if (!updatedOrder) {
      throw new Error(`Order with id ${id} not found`);
    }
    
    // If the order has a table, update the table status to available
    if (updatedOrder.tableId) {
      await this.updateRestaurantTableStatus(updatedOrder.tableId, "available", null);
    }
    
    return updatedOrder;
  }

  async deleteRestaurantOrder(id: number): Promise<void> {
    // First get the order to check if it has a table
    const order = await this.getRestaurantOrder(id);
    
    if (order && order.tableId) {
      // Update the table status to available
      await this.updateRestaurantTableStatus(order.tableId, "available", null);
    }
    
    // Delete all order items associated with this order
    await db.delete(restaurantOrderItems).where(eq(restaurantOrderItems.orderId, id));
    
    // Delete the order
    await db.delete(restaurantOrders).where(eq(restaurantOrders.id, id));
  }

  // =========================================
  // Restaurant POS - Order Items Implementation
  // =========================================
  async getRestaurantOrderItem(id: number): Promise<RestaurantOrderItem | undefined> {
    const [item] = await db.select().from(restaurantOrderItems).where(eq(restaurantOrderItems.id, id));
    return item;
  }

  async getRestaurantOrderItemsByOrderId(orderId: number): Promise<RestaurantOrderItem[]> {
    return await db.select()
      .from(restaurantOrderItems)
      .where(eq(restaurantOrderItems.orderId, orderId));
  }

  async createRestaurantOrderItem(item: InsertRestaurantOrderItem): Promise<RestaurantOrderItem> {
    const [newItem] = await db.insert(restaurantOrderItems).values(item).returning();
    
    // Update order total with the new item
    const order = await this.getRestaurantOrder(newItem.orderId);
    if (order) {
      // Calculate new order subtotal
      const orderItems = await this.getRestaurantOrderItemsByOrderId(order.id);
      const subtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0);
      const tax = orderItems.reduce((sum, item) => sum + parseFloat(item.taxAmount.toString()), 0);
      const discount = orderItems.reduce((sum, item) => sum + parseFloat(item.discountAmount?.toString() || "0"), 0);
      const total = subtotal + tax - discount;
      
      // Update order totals
      await db.update(restaurantOrders)
        .set({ 
          subtotal: subtotal.toString(),
          taxAmount: tax.toString(),
          discountAmount: discount.toString(),
          total: total.toString(),
          updatedAt: new Date()
        })
        .where(eq(restaurantOrders.id, order.id));
    }
    
    return newItem;
  }

  async updateRestaurantOrderItemStatus(id: number, status: string): Promise<RestaurantOrderItem | undefined> {
    const [updatedItem] = await db
      .update(restaurantOrderItems)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(restaurantOrderItems.id, id))
      .returning();
    
    return updatedItem;
  }

  async updateRestaurantOrderItemQuantity(id: number, quantity: number): Promise<RestaurantOrderItem> {
    // First get the current item
    const currentItem = await this.getRestaurantOrderItem(id);
    if (!currentItem) {
      throw new Error(`Order item with id ${id} not found`);
    }
    
    // Calculate new amounts based on quantity change
    const unitPrice = parseFloat(currentItem.price.toString());
    const newSubtotal = unitPrice * quantity;
    const taxRate = parseFloat(currentItem.taxAmount.toString()) / parseFloat(currentItem.subtotal.toString());
    const newTaxAmount = newSubtotal * taxRate;
    const newTotalAmount = newSubtotal + newTaxAmount;
    
    // Update the item
    const [updatedItem] = await db
      .update(restaurantOrderItems)
      .set({ 
        quantity,
        subtotal: newSubtotal.toString(),
        taxAmount: newTaxAmount.toString(),
        totalAmount: newTotalAmount.toString(),
        updatedAt: new Date()
      })
      .where(eq(restaurantOrderItems.id, id))
      .returning();
    
    // Update the parent order totals
    const order = await this.getRestaurantOrder(updatedItem.orderId);
    if (order) {
      const orderItems = await this.getRestaurantOrderItemsByOrderId(order.id);
      const subtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0);
      const tax = orderItems.reduce((sum, item) => sum + parseFloat(item.taxAmount.toString()), 0);
      const discount = orderItems.reduce((sum, item) => sum + parseFloat(item.discountAmount?.toString() || "0"), 0);
      const total = subtotal + tax - discount;
      
      await db.update(restaurantOrders)
        .set({ 
          subtotal: subtotal.toString(),
          taxAmount: tax.toString(),
          discountAmount: discount.toString(),
          total: total.toString(),
          updatedAt: new Date()
        })
        .where(eq(restaurantOrders.id, order.id));
    }
    
    return updatedItem;
  }

  async deleteRestaurantOrderItem(id: number): Promise<void> {
    // First get the item to know which order to update
    const item = await this.getRestaurantOrderItem(id);
    if (!item) {
      return; // Item doesn't exist, nothing to do
    }
    
    const orderId = item.orderId;
    
    // Delete the item
    await db.delete(restaurantOrderItems).where(eq(restaurantOrderItems.id, id));
    
    // Update the parent order totals
    const order = await this.getRestaurantOrder(orderId);
    if (order) {
      const orderItems = await this.getRestaurantOrderItemsByOrderId(order.id);
      const subtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0);
      const tax = orderItems.reduce((sum, item) => sum + parseFloat(item.taxAmount.toString()), 0);
      const discount = orderItems.reduce((sum, item) => sum + parseFloat(item.discountAmount?.toString() || "0"), 0);
      const total = subtotal + tax - discount;
      
      await db.update(restaurantOrders)
        .set({ 
          subtotal: subtotal.toString(),
          taxAmount: tax.toString(),
          discountAmount: discount.toString(),
          total: total.toString(),
          updatedAt: new Date()
        })
        .where(eq(restaurantOrders.id, order.id));
    }
  }

  // =========================================
  // Restaurant POS - Inventory Implementation
  // =========================================
  async getRestaurantInventoryItem(id: number): Promise<RestaurantInventoryItem | undefined> {
    const [item] = await db.select().from(restaurantInventoryItems).where(eq(restaurantInventoryItems.id, id));
    return item;
  }

  async getRestaurantInventoryItems(merchantId: number): Promise<RestaurantInventoryItem[]> {
    return await db.select()
      .from(restaurantInventoryItems)
      .where(eq(restaurantInventoryItems.merchantId, merchantId))
      .orderBy(asc(restaurantInventoryItems.name));
  }

  async createRestaurantInventoryItem(item: InsertRestaurantInventoryItem): Promise<RestaurantInventoryItem> {
    // Calculate total value from currentStock and unitCost
    const currentStock = parseFloat(item.currentStock.toString());
    const unitCost = parseFloat(item.unitCost.toString());
    const totalValue = (currentStock * unitCost).toString();
    
    const [newItem] = await db.insert(restaurantInventoryItems).values({
      ...item,
      totalValue,
      lastUpdated: new Date()
    }).returning();
    
    // Create initial inventory transaction
    if (currentStock > 0) {
      await this.createRestaurantInventoryTransaction({
        merchantId: item.merchantId,
        itemId: newItem.id,
        itemName: newItem.name,
        transactionType: "purchase",
        quantity: item.currentStock.toString(),
        unit: item.unit,
        cost: (currentStock * unitCost).toString(),
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        userId: item.merchantId, // Using merchantId as userId if not specified
        createdBy: "System"
      });
    }
    
    return newItem;
  }

  async updateRestaurantInventoryItem(id: number, data: Partial<InsertRestaurantInventoryItem>, merchantId: number): Promise<RestaurantInventoryItem> {
    // Get current item
    const currentItem = await this.getRestaurantInventoryItem(id);
    if (!currentItem) {
      throw new Error(`Inventory item with id ${id} not found`);
    }
    
    // Verify merchant ownership
    if (currentItem.merchantId !== merchantId) {
      throw new Error("Unauthorized to modify this inventory item");
    }
    
    // Calculate new total value if stock or cost changed
    let totalValue = currentItem.totalValue;
    if (data.currentStock !== undefined || data.unitCost !== undefined) {
      const currentStock = data.currentStock !== undefined ? 
        parseFloat(data.currentStock.toString()) : 
        parseFloat(currentItem.currentStock.toString());
      
      const unitCost = data.unitCost !== undefined ? 
        parseFloat(data.unitCost.toString()) : 
        parseFloat(currentItem.unitCost.toString());
      
      totalValue = (currentStock * unitCost).toString();
    }
    
    // Update the item
    const [updatedItem] = await db
      .update(restaurantInventoryItems)
      .set({ 
        ...data,
        totalValue,
        lastUpdated: new Date(),
        updatedAt: new Date()
      })
      .where(eq(restaurantInventoryItems.id, id))
      .returning();
    
    return updatedItem;
  }

  async updateRestaurantInventoryStock(id: number, newStock: number): Promise<RestaurantInventoryItem> {
    // Get current item
    const currentItem = await this.getRestaurantInventoryItem(id);
    if (!currentItem) {
      throw new Error(`Inventory item with id ${id} not found`);
    }
    
    // Calculate new total value
    const unitCost = parseFloat(currentItem.unitCost.toString());
    const totalValue = (newStock * unitCost).toString();
    
    // Calculate quantity change
    const currentStock = parseFloat(currentItem.currentStock.toString());
    const stockChange = newStock - currentStock;
    
    // Update the item
    const [updatedItem] = await db
      .update(restaurantInventoryItems)
      .set({ 
        currentStock: newStock.toString(),
        totalValue,
        lastUpdated: new Date(),
        updatedAt: new Date()
      })
      .where(eq(restaurantInventoryItems.id, id))
      .returning();
    
    // Create an inventory transaction to record the adjustment
    await this.createRestaurantInventoryTransaction({
      merchantId: currentItem.merchantId,
      itemId: id,
      itemName: currentItem.name,
      transactionType: stockChange > 0 ? "purchase" : "adjustment",
      quantity: Math.abs(stockChange).toString(),
      unit: currentItem.unit,
      cost: (Math.abs(stockChange) * unitCost).toString(),
      supplierId: currentItem.supplierId,
      supplierName: currentItem.supplierName,
      userId: currentItem.merchantId, // Using merchantId as userId if not specified
      createdBy: "System",
      notes: `Stock ${stockChange > 0 ? 'increase' : 'decrease'} adjustment`
    });
    
    return updatedItem;
  }

  async deleteRestaurantInventoryItem(id: number, merchantId: number): Promise<void> {
    // Get the item to verify merchant ownership
    const item = await this.getRestaurantInventoryItem(id);
    if (!item) {
      return; // Item doesn't exist, nothing to do
    }
    
    // Verify merchant ownership
    if (item.merchantId !== merchantId) {
      throw new Error("Unauthorized to delete this inventory item");
    }
    
    // Delete the item
    await db.delete(restaurantInventoryItems).where(eq(restaurantInventoryItems.id, id));
  }

  // =========================================
  // Restaurant POS - Inventory Transactions Implementation
  // =========================================
  async getRestaurantInventoryTransaction(id: number): Promise<RestaurantInventoryTransaction | undefined> {
    const [transaction] = await db.select().from(restaurantInventoryTransactions).where(eq(restaurantInventoryTransactions.id, id));
    return transaction;
  }

  async getRestaurantInventoryTransactions(merchantId: number): Promise<RestaurantInventoryTransaction[]> {
    return await db.select()
      .from(restaurantInventoryTransactions)
      .where(eq(restaurantInventoryTransactions.merchantId, merchantId))
      .orderBy(desc(restaurantInventoryTransactions.createdAt));
  }

  async getRestaurantInventoryTransactionsByItemId(itemId: number): Promise<RestaurantInventoryTransaction[]> {
    return await db.select()
      .from(restaurantInventoryTransactions)
      .where(eq(restaurantInventoryTransactions.itemId, itemId))
      .orderBy(desc(restaurantInventoryTransactions.createdAt));
  }

  async createRestaurantInventoryTransaction(transaction: InsertRestaurantInventoryTransaction): Promise<RestaurantInventoryTransaction> {
    const [newTransaction] = await db.insert(restaurantInventoryTransactions).values(transaction).returning();
    return newTransaction;
  }

  // QR code order implementation
  async getRestaurantOrderByToken(token: string): Promise<RestaurantOrder | undefined> {
    const [order] = await db
      .select()
      .from(restaurantOrders)
      .where(eq(restaurantOrders.modificationToken, token))
      .limit(1);
    return order;
  }
  
  // Update restaurant order with modification token
  async updateRestaurantOrderModificationToken(
    id: number,
    token: string,
    expiry: Date
  ): Promise<RestaurantOrder> {
    const [order] = await db
      .update(restaurantOrders)
      .set({
        modificationToken: token,
        modificationTokenExpiry: expiry,
        updatedAt: new Date()
      })
      .where(eq(restaurantOrders.id, id))
      .returning();
    
    return order;
  }

  async getRecentRestaurantOrders(merchantId: number, minutes: number): Promise<RestaurantOrder[]> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);
    
    const orders = await db
      .select()
      .from(restaurantOrders)
      .where(
        and(
          eq(restaurantOrders.merchantId, merchantId),
          gte(restaurantOrders.createdAt, cutoffTime)
        )
      )
      .orderBy(desc(restaurantOrders.createdAt));
    
    return orders;
  }
  
  // Order modification functions
  async startModifyingOrder(orderId: number): Promise<RestaurantOrder> {
    const now = new Date();
    const [order] = await db
      .update(restaurantOrders)
      .set({
        status: "modifying",
        isBeingModified: true,
        modificationStartTime: now,
        modificationReminderSent: false,
        modificationTimeoutSent: false,
        updatedAt: now
      })
      .where(eq(restaurantOrders.id, orderId))
      .returning();
      
    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    
    return order;
  }
  
  async finishModifyingOrder(orderId: number, wasModified: boolean = false): Promise<RestaurantOrder> {
    const now = new Date();
    const [order] = await db
      .update(restaurantOrders)
      .set({
        status: "placed", // Reset to placed status
        isBeingModified: false,
        updatedAt: now,
        notes: wasModified ? 
          "This order was modified by the customer" : 
          "This order was confirmed by the customer without changes"
      })
      .where(eq(restaurantOrders.id, orderId))
      .returning();
      
    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    
    return order;
  }
  
  async cancelOrderDueToModificationTimeout(orderId: number): Promise<RestaurantOrder> {
    const now = new Date();
    const [order] = await db
      .update(restaurantOrders)
      .set({
        status: "canceled",
        isBeingModified: false,
        updatedAt: now,
        notes: "Order automatically canceled due to modification timeout"
      })
      .where(eq(restaurantOrders.id, orderId))
      .returning();
      
    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    
    // If the order has a table, update the table status
    if (order.tableId) {
      await this.updateRestaurantTableStatus(order.tableId, "available", null);
    }
    
    return order;
  }
  
  async updateOrderModificationReminder(orderId: number, reminderSent: boolean): Promise<RestaurantOrder> {
    const [order] = await db
      .update(restaurantOrders)
      .set({
        modificationReminderSent: reminderSent,
        lastSmsTimestamp: new Date(),
        smsNotificationCount: db.sql`${restaurantOrders.smsNotificationCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(restaurantOrders.id, orderId))
      .returning();
      
    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    
    return order;
  }
  
  async updateOrderModificationTimeout(orderId: number, timeoutSent: boolean): Promise<RestaurantOrder> {
    const [order] = await db
      .update(restaurantOrders)
      .set({
        modificationTimeoutSent: timeoutSent,
        lastSmsTimestamp: new Date(),
        smsNotificationCount: db.sql`${restaurantOrders.smsNotificationCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(restaurantOrders.id, orderId))
      .returning();
      
    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    
    return order;
  }
  
  async getOrdersBeingModified(): Promise<RestaurantOrder[]> {
    try {
      return await db
        .select()
        .from(restaurantOrders)
        .where(eq(restaurantOrders.isBeingModified, true))
        .orderBy(asc(restaurantOrders.modificationStartTime));
    } catch (error) {
      console.error("Error fetching orders being modified:", error);
      return [];
    }
  }

  // =========================================
  // New Modern POS Implementation
  // =========================================
  
  // ======== POS Locations ========
  async getPosLocationsByUserId(userId: number): Promise<PosLocation[]> {
    return await db.select().from(posLocations).where(eq(posLocations.merchantId, userId));
  }
  
  async getPosLocation(id: number): Promise<PosLocation | undefined> {
    const [location] = await db.select().from(posLocations).where(eq(posLocations.id, id));
    return location;
  }
  
  async createPosLocation(locationData: InsertPosLocation): Promise<PosLocation> {
    const [location] = await db.insert(posLocations).values(locationData).returning();
    return location;
  }
  
  async updatePosLocation(id: number, updates: Partial<PosLocation>): Promise<PosLocation | undefined> {
    const [location] = await db
      .update(posLocations)
      .set(updates)
      .where(eq(posLocations.id, id))
      .returning();
    return location;
  }
  
  async deletePosLocation(id: number): Promise<void> {
    await db.delete(posLocations).where(eq(posLocations.id, id));
  }
  
  // ======== POS Areas ========
  async getPosAreas(locationId: number): Promise<PosArea[]> {
    return await db.select().from(posAreas).where(eq(posAreas.locationId, locationId));
  }
  
  async getPosArea(id: number): Promise<PosArea | undefined> {
    const [area] = await db.select().from(posAreas).where(eq(posAreas.id, id));
    return area;
  }
  
  async createPosArea(areaData: InsertPosArea): Promise<PosArea> {
    const [area] = await db.insert(posAreas).values(areaData).returning();
    return area;
  }
  
  async updatePosArea(id: number, updates: Partial<PosArea>): Promise<PosArea | undefined> {
    const [area] = await db
      .update(posAreas)
      .set(updates)
      .where(eq(posAreas.id, id))
      .returning();
    return area;
  }
  
  async deletePosArea(id: number): Promise<void> {
    await db.delete(posAreas).where(eq(posAreas.id, id));
  }
  
  // ======== POS Tables ========
  async getPosTables(locationId: number): Promise<PosTable[]> {
    return await db.select().from(posTables).where(eq(posTables.locationId, locationId));
  }
  
  async getPosTable(id: number): Promise<PosTable | undefined> {
    const [table] = await db.select().from(posTables).where(eq(posTables.id, id));
    return table;
  }
  
  async createPosTable(tableData: InsertPosTable): Promise<PosTable> {
    const [table] = await db.insert(posTables).values(tableData).returning();
    return table;
  }
  
  async updatePosTable(id: number, updates: Partial<PosTable>): Promise<PosTable | undefined> {
    const [table] = await db
      .update(posTables)
      .set(updates)
      .where(eq(posTables.id, id))
      .returning();
    return table;
  }
  
  async updatePosTableStatus(id: number, status: string, currentOrderId?: number): Promise<PosTable | undefined> {
    const updateData: Partial<PosTable> = {
      status,
    };
    
    if (currentOrderId !== undefined) {
      updateData.currentOrderId = currentOrderId;
    }
    
    const [table] = await db
      .update(posTables)
      .set(updateData)
      .where(eq(posTables.id, id))
      .returning();
    return table;
  }
  
  async deletePosTable(id: number): Promise<void> {
    await db.delete(posTables).where(eq(posTables.id, id));
  }
  
  // ======== POS Orders ========
  async getPosOrders(locationId: number): Promise<PosOrder[]> {
    return await db.select().from(posOrders)
      .where(eq(posOrders.locationId, locationId))
      .orderBy(desc(posOrders.createdAt));
  }
  
  async getPosOrdersByStatus(locationId: number, status: string): Promise<PosOrder[]> {
    return await db
      .select()
      .from(posOrders)
      .where(
        and(
          eq(posOrders.locationId, locationId),
          eq(posOrders.status, status)
        )
      )
      .orderBy(desc(posOrders.createdAt));
  }
  
  async getPosOrder(id: number): Promise<PosOrder | undefined> {
    const [order] = await db.select().from(posOrders).where(eq(posOrders.id, id));
    return order;
  }
  
  async createPosOrder(orderData: InsertPosOrder): Promise<PosOrder> {
    // Generate order number if not provided
    if (!orderData.orderNumber) {
      orderData.orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    }
    
    const [order] = await db.insert(posOrders).values(orderData).returning();
    return order;
  }
  
  async updatePosOrder(id: number, updates: Partial<PosOrder>): Promise<PosOrder | undefined> {
    const [order] = await db
      .update(posOrders)
      .set(updates)
      .where(eq(posOrders.id, id))
      .returning();
    return order;
  }
  
  async updatePosOrderStatus(id: number, status: string): Promise<PosOrder | undefined> {
    const updateData: Partial<PosOrder> = {
      status,
    };
    
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    
    const [order] = await db
      .update(posOrders)
      .set(updateData)
      .where(eq(posOrders.id, id))
      .returning();
    return order;
  }
  
  async completePosOrder(id: number, paymentMethod: string, totalPaid: string): Promise<PosOrder | undefined> {
    const [order] = await db
      .update(posOrders)
      .set({ 
        status: "completed",
        paymentStatus: "paid", 
        completedAt: new Date(),
      })
      .where(eq(posOrders.id, id))
      .returning();
      
    // Create payment record
    if (order) {
      await db.insert(posPayments).values({
        orderId: id,
        locationId: order.locationId,
        amount: totalPaid,
        method: paymentMethod,
        status: "completed"
      });
    }
    
    return order;
  }
  
  async deletePosOrder(id: number): Promise<void> {
    await db.delete(posOrders).where(eq(posOrders.id, id));
  }
  
  // ======== POS Order Items ========
  async getPosOrderItems(orderId: number): Promise<PosOrderItem[]> {
    return await db.select().from(posOrderItems).where(eq(posOrderItems.orderId, orderId));
  }
  
  async getPosOrderItem(id: number): Promise<PosOrderItem | undefined> {
    const [item] = await db.select().from(posOrderItems).where(eq(posOrderItems.id, id));
    return item;
  }
  
  async createPosOrderItem(item: InsertPosOrderItem): Promise<PosOrderItem> {
    // Calculate totals if not provided
    if (!item.subtotal && item.unitPrice && item.quantity) {
      item.subtotal = (parseFloat(item.unitPrice) * item.quantity).toString();
    }
    
    if (!item.totalAmount && item.subtotal && item.taxAmount) {
      const subtotal = parseFloat(item.subtotal);
      const tax = parseFloat(item.taxAmount);
      const discount = item.discount ? parseFloat(item.discount) : 0;
      item.totalAmount = (subtotal + tax - discount).toString();
    }
    
    const [orderItem] = await db.insert(posOrderItems).values(item).returning();
    
    // Update order totals
    if (orderItem) {
      const allItems = await this.getPosOrderItems(orderItem.orderId);
      
      const subtotal = allItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const taxAmount = allItems.reduce((sum, item) => sum + parseFloat(item.taxAmount), 0);
      const discountAmount = allItems.reduce((sum, item) => sum + parseFloat(item.discount ? item.discount : "0"), 0);
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      await db
        .update(posOrders)
        .set({ 
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toString(),
          discountAmount: discountAmount.toString(),
          totalAmount: totalAmount.toString()
        })
        .where(eq(posOrders.id, orderItem.orderId));
    }
    
    return orderItem;
  }
  
  async updatePosOrderItem(id: number, updates: Partial<PosOrderItem>): Promise<PosOrderItem | undefined> {
    const [orderItem] = await db
      .update(posOrderItems)
      .set(updates)
      .where(eq(posOrderItems.id, id))
      .returning();
    
    // Update order totals
    if (orderItem) {
      const allItems = await this.getPosOrderItems(orderItem.orderId);
      
      const subtotal = allItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const taxAmount = allItems.reduce((sum, item) => sum + parseFloat(item.taxAmount), 0);
      const discountAmount = allItems.reduce((sum, item) => sum + parseFloat(item.discount ? item.discount : "0"), 0);
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      await db
        .update(posOrders)
        .set({ 
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toString(),
          discountAmount: discountAmount.toString(),
          totalAmount: totalAmount.toString()
        })
        .where(eq(posOrders.id, orderItem.orderId));
    }
    
    return orderItem;
  }
  
  async updatePosOrderItemQuantity(id: number, quantity: number): Promise<PosOrderItem | undefined> {
    const item = await this.getPosOrderItem(id);
    if (!item) return undefined;
    
    const unitPrice = parseFloat(item.unitPrice);
    const subtotal = (unitPrice * quantity).toString();
    
    // Recalculate tax based on the original tax rate
    const originalSubtotal = parseFloat(item.subtotal);
    const originalTax = parseFloat(item.taxAmount);
    const taxRate = originalTax / originalSubtotal;
    const taxAmount = (parseFloat(subtotal) * taxRate).toString();
    
    // Keep discount the same
    const discount = item.discount || "0";
    
    // Calculate total
    const totalAmount = (parseFloat(subtotal) + parseFloat(taxAmount) - parseFloat(discount)).toString();
    
    const updates: Partial<PosOrderItem> = {
      quantity,
      subtotal,
      taxAmount,
      totalAmount
    };
    
    return this.updatePosOrderItem(id, updates);
  }
  
  async deletePosOrderItem(id: number): Promise<void> {
    const item = await this.getPosOrderItem(id);
    if (!item) return;
    
    const orderId = item.orderId;
    
    await db.delete(posOrderItems).where(eq(posOrderItems.id, id));
    
    // Update order totals
    const allItems = await this.getPosOrderItems(orderId);
    
    if (allItems.length > 0) {
      const subtotal = allItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const taxAmount = allItems.reduce((sum, item) => sum + parseFloat(item.taxAmount), 0);
      const discountAmount = allItems.reduce((sum, item) => sum + parseFloat(item.discount ? item.discount : "0"), 0);
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      await db
        .update(posOrders)
        .set({ 
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toString(),
          discountAmount: discountAmount.toString(),
          totalAmount: totalAmount.toString()
        })
        .where(eq(posOrders.id, orderId));
    } else {
      // If no items left, set totals to 0
      await db
        .update(posOrders)
        .set({ 
          subtotal: "0",
          taxAmount: "0",
          discountAmount: "0",
          totalAmount: "0"
        })
        .where(eq(posOrders.id, orderId));
    }
  }
  
  // ======== POS Categories ========
  async getPosCategories(locationId: number): Promise<PosCategory[]> {
    return await db.select().from(posCategories).where(eq(posCategories.locationId, locationId));
  }
  
  async getPosCategory(id: number): Promise<PosCategory | undefined> {
    const [category] = await db.select().from(posCategories).where(eq(posCategories.id, id));
    return category;
  }
  
  async createPosCategory(categoryData: InsertPosCategory): Promise<PosCategory> {
    const [category] = await db.insert(posCategories).values(categoryData).returning();
    return category;
  }
  
  async updatePosCategory(id: number, updates: Partial<PosCategory>): Promise<PosCategory | undefined> {
    const [category] = await db
      .update(posCategories)
      .set(updates)
      .where(eq(posCategories.id, id))
      .returning();
    return category;
  }
  
  async deletePosCategory(id: number): Promise<void> {
    await db.delete(posCategories).where(eq(posCategories.id, id));
  }
  
  // ======== POS Menu Items ========
  async getPosMenuItems(locationId: number): Promise<PosMenuItem[]> {
    return await db.select().from(posMenuItems).where(eq(posMenuItems.locationId, locationId));
  }
  
  async getPosMenuItemsByCategory(categoryId: number): Promise<PosMenuItem[]> {
    return await db.select().from(posMenuItems).where(eq(posMenuItems.categoryId, categoryId));
  }
  
  async getPosMenuItem(id: number): Promise<PosMenuItem | undefined> {
    const [item] = await db.select().from(posMenuItems).where(eq(posMenuItems.id, id));
    return item;
  }
  
  async createPosMenuItem(itemData: InsertPosMenuItem): Promise<PosMenuItem> {
    const [item] = await db.insert(posMenuItems).values(itemData).returning();
    return item;
  }
  
  async updatePosMenuItem(id: number, updates: Partial<PosMenuItem>): Promise<PosMenuItem | undefined> {
    const [item] = await db
      .update(posMenuItems)
      .set(updates)
      .where(eq(posMenuItems.id, id))
      .returning();
    return item;
  }
  
  async deletePosMenuItem(id: number): Promise<void> {
    await db.delete(posMenuItems).where(eq(posMenuItems.id, id));
  }
  
  // ======== POS Staff ========
  async getPosStaffByLocationId(locationId: number): Promise<PosStaff[]> {
    return await db.select().from(posStaff).where(eq(posStaff.locationId, locationId));
  }
  
  async getPosStaff(id: number): Promise<PosStaff | undefined> {
    const [staff] = await db.select().from(posStaff).where(eq(posStaff.id, id));
    return staff;
  }
  
  async createPosStaff(staffData: InsertPosStaff): Promise<PosStaff> {
    const [staff] = await db.insert(posStaff).values(staffData).returning();
    return staff;
  }
  
  async updatePosStaff(id: number, updates: Partial<PosStaff>): Promise<PosStaff | undefined> {
    const [staff] = await db
      .update(posStaff)
      .set(updates)
      .where(eq(posStaff.id, id))
      .returning();
    return staff;
  }
  
  async deletePosStaff(id: number): Promise<void> {
    await db.delete(posStaff).where(eq(posStaff.id, id));
  }
  
  // ======== Staff Scheduling ========
  async getPosStaffAvailabilityByStaffId(staffId: number): Promise<PosStaffAvailability[]> {
    return await db.select().from(posStaffAvailability).where(eq(posStaffAvailability.staffId, staffId));
  }
  
  async createPosStaffAvailability(availability: InsertPosStaffAvailability): Promise<PosStaffAvailability> {
    const [result] = await db.insert(posStaffAvailability).values(availability).returning();
    return result;
  }
  
  async updatePosStaffAvailability(id: number, updates: Partial<PosStaffAvailability>): Promise<PosStaffAvailability | undefined> {
    const [result] = await db.update(posStaffAvailability).set(updates).where(eq(posStaffAvailability.id, id)).returning();
    return result;
  }
  
  async deletePosStaffAvailability(id: number): Promise<void> {
    await db.delete(posStaffAvailability).where(eq(posStaffAvailability.id, id));
  }
  
  // ======== Schedule Templates ========
  async getPosScheduleTemplatesByLocationId(locationId: number): Promise<PosScheduleTemplate[]> {
    return await db.select().from(posScheduleTemplates).where(eq(posScheduleTemplates.locationId, locationId));
  }
  
  async getPosScheduleTemplate(id: number): Promise<PosScheduleTemplate | undefined> {
    const [template] = await db.select().from(posScheduleTemplates).where(eq(posScheduleTemplates.id, id));
    return template;
  }
  
  async createPosScheduleTemplate(template: InsertPosScheduleTemplate): Promise<PosScheduleTemplate> {
    const [result] = await db.insert(posScheduleTemplates).values(template).returning();
    return result;
  }
  
  async updatePosScheduleTemplate(id: number, updates: Partial<PosScheduleTemplate>): Promise<PosScheduleTemplate | undefined> {
    const [result] = await db.update(posScheduleTemplates).set(updates).where(eq(posScheduleTemplates.id, id)).returning();
    return result;
  }
  
  async deletePosScheduleTemplate(id: number): Promise<void> {
    await db.delete(posScheduleTemplates).where(eq(posScheduleTemplates.id, id));
  }
  
  // ======== Template Shifts ========
  async getPosTemplateShiftsByTemplateId(templateId: number): Promise<PosTemplateShift[]> {
    return await db.select().from(posTemplateShifts).where(eq(posTemplateShifts.templateId, templateId));
  }
  
  async createPosTemplateShift(shift: InsertPosTemplateShift): Promise<PosTemplateShift> {
    const [result] = await db.insert(posTemplateShifts).values(shift).returning();
    return result;
  }
  
  async updatePosTemplateShift(id: number, updates: Partial<PosTemplateShift>): Promise<PosTemplateShift | undefined> {
    const [result] = await db.update(posTemplateShifts).set(updates).where(eq(posTemplateShifts.id, id)).returning();
    return result;
  }
  
  async deletePosTemplateShift(id: number): Promise<void> {
    await db.delete(posTemplateShifts).where(eq(posTemplateShifts.id, id));
  }
  
  // ======== Time Off Requests ========
  async getPosTimeOffRequestsByStaffId(staffId: number): Promise<PosTimeOffRequest[]> {
    return await db.select().from(posTimeOffRequests).where(eq(posTimeOffRequests.staffId, staffId));
  }
  
  async getPosTimeOffRequestsByLocationId(locationId: number): Promise<PosTimeOffRequest[]> {
    // First, we need to get all staff IDs for this location
    const staffMembers = await this.getPosStaffByLocationId(locationId);
    const staffIds = staffMembers.map(staff => staff.id);
    
    if (staffIds.length === 0) {
      return [];
    }
    
    // Then we get all time-off requests for these staff members
    const result = await db
      .select()
      .from(posTimeOffRequests)
      .where(
        inArray(posTimeOffRequests.staffId, staffIds)
      );
    
    return result;
  }
  
  async getPosTimeOffRequest(id: number): Promise<PosTimeOffRequest | undefined> {
    const [request] = await db.select().from(posTimeOffRequests).where(eq(posTimeOffRequests.id, id));
    return request;
  }
  
  async createPosTimeOffRequest(request: InsertPosTimeOffRequest): Promise<PosTimeOffRequest> {
    const [result] = await db.insert(posTimeOffRequests).values(request).returning();
    return result;
  }
  
  async updatePosTimeOffRequest(id: number, updates: Partial<PosTimeOffRequest>): Promise<PosTimeOffRequest | undefined> {
    const [result] = await db.update(posTimeOffRequests).set(updates).where(eq(posTimeOffRequests.id, id)).returning();
    return result;
  }
  
  async approvePosTimeOffRequest(id: number, approvedById: number, isPaid: boolean): Promise<PosTimeOffRequest | undefined> {
    const [result] = await db
      .update(posTimeOffRequests)
      .set({
        status: "approved",
        approvedById: approvedById,
        approvedAt: new Date(),
        isPaid: isPaid
      })
      .where(eq(posTimeOffRequests.id, id))
      .returning();
    
    return result;
  }
  
  async denyPosTimeOffRequest(id: number, approvedById: number): Promise<PosTimeOffRequest | undefined> {
    const [result] = await db
      .update(posTimeOffRequests)
      .set({
        status: "rejected",
        approvedById: approvedById,
        approvedAt: new Date(),
      })
      .where(eq(posTimeOffRequests.id, id))
      .returning();
    
    return result;
  }
  
  // ======== POS Payments ========
  async getPosPaymentsByLocationId(locationId: number): Promise<PosPayment[]> {
    return await db.select().from(posPayments).where(eq(posPayments.locationId, locationId));
  }
  
  async getPosPaymentsByOrderId(orderId: number): Promise<PosPayment[]> {
    return await db.select().from(posPayments).where(eq(posPayments.orderId, orderId));
  }
  
  async getPosPayment(id: number): Promise<PosPayment | undefined> {
    const [payment] = await db.select().from(posPayments).where(eq(posPayments.id, id));
    return payment;
  }
  
  async createPosPayment(paymentData: InsertPosPayment): Promise<PosPayment> {
    const [payment] = await db.insert(posPayments).values(paymentData).returning();
    
    // If this payment completes the order, update the order status
    if (paymentData.status === 'completed') {
      const order = await this.getPosOrder(paymentData.orderId);
      if (order) {
        await this.updatePosOrderStatus(paymentData.orderId, 'completed');
      }
    }
    
    return payment;
  }
  
  async updatePosPayment(id: number, updateData: Partial<PosPayment>): Promise<PosPayment | undefined> {
    const [payment] = await db
      .update(posPayments)
      .set(updateData)
      .where(eq(posPayments.id, id))
      .returning();
    
    return payment;
  }
  
  // ======== POS Inventory Items ========
  async getPosInventoryItems(locationId: number): Promise<PosInventoryItem[]> {
    return await db.select().from(posInventoryItems).where(eq(posInventoryItems.locationId, locationId));
  }
  
  async getPosInventoryItem(id: number): Promise<PosInventoryItem | undefined> {
    const [item] = await db.select().from(posInventoryItems).where(eq(posInventoryItems.id, id));
    return item;
  }
  
  async createPosInventoryItem(itemData: InsertPosInventoryItem): Promise<PosInventoryItem> {
    const [item] = await db.insert(posInventoryItems).values(itemData).returning();
    return item;
  }
  
  async updatePosInventoryItem(id: number, updates: Partial<PosInventoryItem>): Promise<PosInventoryItem | undefined> {
    const [item] = await db
      .update(posInventoryItems)
      .set(updates)
      .where(eq(posInventoryItems.id, id))
      .returning();
    return item;
  }
  
  async updatePosInventoryItemStock(id: number, newStock: string): Promise<PosInventoryItem | undefined> {
    const [item] = await db
      .update(posInventoryItems)
      .set({ stock: newStock })
      .where(eq(posInventoryItems.id, id))
      .returning();
    return item;
  }
  
  async deletePosInventoryItem(id: number): Promise<void> {
    await db.delete(posInventoryItems).where(eq(posInventoryItems.id, id));
  }
  
  // The duplicated order modification functions were removed to fix TypeScript errors

  /**
   * Update a restaurant order status with additional fields
   * @param orderId The order ID
   * @param status The new status
   * @param additionalFields Optional additional fields to update
   * @returns The updated order
   */
  async updateRestaurantOrderStatus(
    orderId: number, 
    status: "draft" | "placed" | "preparing" | "ready" | "served" | "completed" | "canceled" | "modifying",
    additionalFields: Partial<RestaurantOrder> = {}
  ): Promise<RestaurantOrder> {
    try {
      const updateData = {
        status,
        updatedAt: new Date(),
        ...additionalFields
      };
      
      // Conditionally set completedAt if status is completed
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
      
      const [updatedOrder] = await db
        .update(restaurantOrders)
        .set(updateData)
        .where(eq(restaurantOrders.id, orderId))
        .returning();
        
      if (!updatedOrder) {
        throw new Error(`Order with id ${orderId} not found`);
      }
      
      return updatedOrder;
    } catch (error) {
      console.error(`Error updating order ${orderId} status to ${status}:`, error);
      throw error;
    }
  }
  
}

export const storage = new DatabaseStorage();
