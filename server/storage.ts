import { users, wallets, transactions, bankAccounts, fundRequests, type User, type InsertUser, type Wallet, type InsertWallet, type Transaction, type InsertTransaction, type BankAccount, type InsertBankAccount, type FundRequest, type InsertFundRequest } from "@shared/schema";
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
  createUser(user: InsertUser): Promise<User>;
  
  // Session store
  sessionStore: session.Store;
  
  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, balance: string): Promise<Wallet>;
  allocateFunds(walletId: number, amount: string): Promise<Wallet>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionExpenseType(id: number, expenseType: string): Promise<Transaction>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
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

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    // Start by getting the wallet to check balance
    const wallet = await this.getWallet(insertTransaction.walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${insertTransaction.walletId} not found`);
    }
    
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
}

// Export a new instance of the DatabaseStorage
export const storage = new DatabaseStorage();
