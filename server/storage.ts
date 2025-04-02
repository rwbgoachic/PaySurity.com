import { users, wallets, transactions, bankAccounts, fundRequests, type User, type InsertUser, type Wallet, type InsertWallet, type Transaction, type InsertTransaction, type BankAccount, type InsertBankAccount, type FundRequest, type InsertFundRequest } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private bankAccounts: Map<number, BankAccount>;
  private fundRequests: Map<number, FundRequest>;
  
  sessionStore: session.Store;
  
  private userIdCounter: number;
  private walletIdCounter: number;
  private transactionIdCounter: number;
  private bankAccountIdCounter: number;
  private fundRequestIdCounter: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.bankAccounts = new Map();
    this.fundRequests = new Map();
    
    this.userIdCounter = 1;
    this.walletIdCounter = 1;
    this.transactionIdCounter = 1;
    this.bankAccountIdCounter = 1;
    this.fundRequestIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter(
      (wallet) => wallet.userId === userId
    );
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIdCounter++;
    const createdAt = new Date();
    const wallet: Wallet = { ...insertWallet, id, createdAt };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWalletBalance(id: number, balance: string): Promise<Wallet> {
    const wallet = this.wallets.get(id);
    if (!wallet) {
      throw new Error(`Wallet with id ${id} not found`);
    }
    
    const updatedWallet = { ...wallet, balance };
    this.wallets.set(id, updatedWallet);
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
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const date = new Date();
    const createdAt = new Date();
    const transaction: Transaction = { ...insertTransaction, id, date, createdAt };
    
    // Update wallet balance based on transaction type
    const wallet = await this.getWallet(transaction.walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${transaction.walletId} not found`);
    }
    
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
    
    // Save the transaction
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionExpenseType(id: number, expenseType: string): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    const updatedTransaction = { ...transaction, expenseType };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Bank account operations
  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }

  async getBankAccountsByUserId(userId: number): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values()).filter(
      (bankAccount) => bankAccount.userId === userId
    );
  }

  async createBankAccount(insertBankAccount: InsertBankAccount): Promise<BankAccount> {
    const id = this.bankAccountIdCounter++;
    const createdAt = new Date();
    const bankAccount: BankAccount = { ...insertBankAccount, id, createdAt };
    this.bankAccounts.set(id, bankAccount);
    return bankAccount;
  }

  async deleteBankAccount(id: number): Promise<void> {
    if (!this.bankAccounts.has(id)) {
      throw new Error(`Bank account with id ${id} not found`);
    }
    
    this.bankAccounts.delete(id);
  }

  // Fund request operations
  async getFundRequest(id: number): Promise<FundRequest | undefined> {
    return this.fundRequests.get(id);
  }

  async getFundRequestsByUserId(userId: number): Promise<FundRequest[]> {
    return Array.from(this.fundRequests.values()).filter(
      (fundRequest) => fundRequest.requesterId === userId
    );
  }

  async getAllFundRequests(): Promise<FundRequest[]> {
    return Array.from(this.fundRequests.values());
  }

  async createFundRequest(insertFundRequest: InsertFundRequest): Promise<FundRequest> {
    const id = this.fundRequestIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const fundRequest: FundRequest = { ...insertFundRequest, id, createdAt, updatedAt };
    this.fundRequests.set(id, fundRequest);
    return fundRequest;
  }

  async approveFundRequest(id: number, approverId: number): Promise<FundRequest> {
    const fundRequest = this.fundRequests.get(id);
    if (!fundRequest) {
      throw new Error(`Fund request with id ${id} not found`);
    }
    
    // Update fund request
    const updatedRequest = { 
      ...fundRequest, 
      approverId, 
      status: "approved", 
      updatedAt: new Date() 
    };
    this.fundRequests.set(id, updatedRequest);
    
    // Find the requester's wallet and allocate funds
    const requesterWallets = await this.getWalletsByUserId(fundRequest.requesterId);
    if (requesterWallets.length === 0) {
      throw new Error(`No wallet found for user ${fundRequest.requesterId}`);
    }
    
    // Allocate to the first wallet
    await this.allocateFunds(requesterWallets[0].id, fundRequest.amount.toString());
    
    return updatedRequest;
  }

  async rejectFundRequest(id: number, approverId: number, reason?: string): Promise<FundRequest> {
    const fundRequest = this.fundRequests.get(id);
    if (!fundRequest) {
      throw new Error(`Fund request with id ${id} not found`);
    }
    
    const updatedRequest = { 
      ...fundRequest, 
      approverId, 
      status: "rejected", 
      updatedAt: new Date(),
      reason
    };
    this.fundRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
