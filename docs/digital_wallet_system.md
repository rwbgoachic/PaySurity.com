# PaySurity Digital Wallet System

## Overview

The PaySurity Digital Wallet is a comprehensive financial management system that enables users to store funds, conduct transactions, link external accounts, and manage their financial activities. It serves as the foundation for PaySurity's payment ecosystem.

## Core Components

### Wallet Management

The digital wallet system consists of multiple components:

1. **Wallet Creation and Management**: Users can create and manage multiple wallets
2. **Balance Tracking**: Real-time balance updates and history
3. **Transaction Processing**: Secure payment processing
4. **Spending Controls**: Limits and restrictions on transactions
5. **Bank Account Connectivity**: Link external bank accounts
6. **Security Features**: Multi-factor authentication and fraud protection

## Technical Implementation

### Database Schema

The wallet system is built on these database tables:

```sql
-- Core Wallet Table
CREATE TABLE wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  balance TEXT NOT NULL DEFAULT '0.00',
  wallet_type TEXT NOT NULL DEFAULT 'personal',
  status TEXT NOT NULL DEFAULT 'active',
  daily_limit TEXT,
  weekly_limit TEXT,
  monthly_limit TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  recipient_id INTEGER,
  recipient_type TEXT,
  description TEXT,
  reference_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Bank Accounts
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  wallet_id INTEGER,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  account_number_last_four TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Fund Requests
CREATE TABLE fund_requests (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  request_type TEXT NOT NULL,
  source_id INTEGER,
  source_type TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### API Endpoints

The wallet system is accessed through these API endpoints:

#### Wallet Management

- `GET /api/wallets`: List all wallets for the authenticated user
- `POST /api/wallets`: Create a new wallet
- `GET /api/wallets/:id`: Get details of a specific wallet
- `PATCH /api/wallets/:id/balance`: Update wallet balance
- `PATCH /api/wallets/:id/limits`: Update wallet spending limits
- `PATCH /api/wallets/:id/status`: Update wallet status (activate/deactivate)

#### Transaction Processing

- `GET /api/wallets/:id/transactions`: Get transactions for a wallet
- `POST /api/transactions`: Create a new transaction
- `GET /api/transactions/:id`: Get details of a specific transaction
- `PATCH /api/transactions/:id/status`: Update transaction status

#### Bank Account Management

- `GET /api/bank-accounts`: List all bank accounts for the user
- `POST /api/bank-accounts`: Add a new bank account
- `DELETE /api/bank-accounts/:id`: Remove a bank account
- `POST /api/bank-accounts/:id/verify`: Verify a bank account
- `POST /api/bank-accounts/:id/transfer`: Transfer funds to/from bank account

#### Fund Requests

- `GET /api/fund-requests`: List all fund requests
- `POST /api/fund-requests`: Create a new fund request
- `PATCH /api/fund-requests/:id/approve`: Approve a fund request
- `PATCH /api/fund-requests/:id/deny`: Deny a fund request

### Implementation Details

#### Backend Service Logic

The wallet system is implemented in `walletService.ts` with these key methods:

```typescript
class WalletService {
  // Core wallet operations
  async createWallet(userId: number, walletData: CreateWalletDto): Promise<Wallet>
  async getWallet(walletId: number): Promise<Wallet>
  async updateWalletBalance(walletId: number, amount: string, operation: 'add' | 'subtract'): Promise<Wallet>
  async setWalletLimits(walletId: number, limits: WalletLimitsDto): Promise<Wallet>
  
  // Transaction processing
  async createTransaction(transactionData: CreateTransactionDto): Promise<Transaction>
  async processTransaction(transactionId: number): Promise<Transaction>
  async getTransactionsByWalletId(walletId: number, filter?: TransactionFilterDto): Promise<Transaction[]>
  
  // Bank account operations
  async addBankAccount(userId: number, accountData: AddBankAccountDto): Promise<BankAccount>
  async verifyBankAccount(bankAccountId: number, verificationData: VerifyBankAccountDto): Promise<BankAccount>
  async transferToBank(bankAccountId: number, amount: string): Promise<Transaction>
  async transferFromBank(bankAccountId: number, amount: string): Promise<Transaction>
}
```

#### Storage Implementation

The wallet system storage is implemented in `storage.ts`:

```typescript
// Wallet operations
async getWalletsByUserId(userId: number): Promise<Wallet[]> {
  return db.select().from(wallets).where(eq(wallets.userId, userId));
}

async getWallet(id: number): Promise<Wallet | undefined> {
  const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
  return wallet;
}

async createWallet(walletData: InsertWallet): Promise<Wallet> {
  const [wallet] = await db
    .insert(wallets)
    .values(walletData)
    .returning();
  return wallet;
}

async updateWalletBalance(id: number, balance: string): Promise<Wallet> {
  const [wallet] = await db
    .update(wallets)
    .set({
      balance,
      updatedAt: new Date()
    })
    .where(eq(wallets.id, id))
    .returning();
  
  if (!wallet) {
    throw new Error(`Wallet with id ${id} not found`);
  }
  
  return wallet;
}

async updateWalletLimits(
  id: number, 
  dailyLimit?: string, 
  weeklyLimit?: string, 
  monthlyLimit?: string
): Promise<Wallet> {
  const updateData: Partial<Wallet> = {
    updatedAt: new Date()
  };
  
  if (dailyLimit !== undefined) {
    updateData.dailyLimit = dailyLimit;
  }
  
  if (weeklyLimit !== undefined) {
    updateData.weeklyLimit = weeklyLimit;
  }
  
  if (monthlyLimit !== undefined) {
    updateData.monthlyLimit = monthlyLimit;
  }
  
  const [wallet] = await db
    .update(wallets)
    .set(updateData)
    .where(eq(wallets.id, id))
    .returning();
  
  if (!wallet) {
    throw new Error(`Wallet with id ${id} not found`);
  }
  
  return wallet;
}
```

## Wallet Features and Functionality

### Multiple Wallet Types

The system supports different wallet types for various use cases:

1. **Personal Wallet**: General-purpose wallet for individual users
2. **Business Wallet**: For merchant payments and business operations
3. **Family Wallet**: Shared wallet with parental controls for family members
4. **Savings Wallet**: Goal-oriented wallet with limited withdrawals
5. **Expense Wallet**: For tracking and controlling specific expense categories

### Transaction Types

The wallet supports various transaction types:

1. **Payment**: Sending funds to another user or merchant
2. **Deposit**: Adding funds from external source
3. **Withdrawal**: Removing funds to external destination
4. **Transfer**: Moving funds between wallets
5. **Refund**: Returning funds from a merchant
6. **Fee**: System-generated fee transaction
7. **Adjustment**: Administrative balance adjustment

### Spending Controls

The wallet system implements several types of spending controls:

1. **Transaction Limits**: Maximum amount per transaction
2. **Daily/Weekly/Monthly Limits**: Cumulative spending limits
3. **Merchant Category Restrictions**: Block specific merchant types
4. **Time-based Restrictions**: Limit transactions during certain hours
5. **Location-based Controls**: Geographic restrictions on transactions
6. **Approval Requirements**: Require approval for transactions over a threshold

## Integration with Other Systems

### Payment Gateway Integration

The wallet system integrates with Helcim payment processing:

1. **Card Processing**: Process credit/debit card transactions
2. **ACH Transfers**: Direct bank transfers
3. **Settlement**: Funds settlement into merchant wallets
4. **Refund Processing**: Handle return of funds to customers

### POS System Integration

Integration with the industry-specific POS systems:

1. **Payment Acceptance**: Accept wallet payments at POS terminals
2. **Real-time Balance Updates**: Update wallet balances instantly
3. **Receipt Generation**: Digital receipts stored in the wallet
4. **Loyalty Integration**: Connect loyalty programs with wallet activity

### Affiliate System Integration

The wallet connects to the affiliate system for commission processing:

1. **Commission Payments**: Automated affiliate payouts
2. **Tracking**: Connect payments to referral sources
3. **Reporting**: Detailed commission payment reporting

## Security Measures

The wallet system implements extensive security features:

1. **Encryption**: All sensitive data is encrypted at rest and in transit
2. **Two-Factor Authentication**: Required for high-value transactions
3. **Fraud Detection**: AI-powered abnormal transaction detection
4. **Transaction Verification**: Step-up verification for unusual activity
5. **Activity Monitoring**: Real-time monitoring and alerts
6. **IP Restrictions**: Geo-location validation
7. **Device Fingerprinting**: Verify trusted devices

## Compliance Features

The system implements various compliance features:

1. **AML Checks**: Anti-money laundering screening
2. **KYC Integration**: Know Your Customer verification
3. **Transaction Monitoring**: Detection of suspicious patterns
4. **Reporting**: Regulatory reporting capabilities
5. **Audit Trails**: Complete transaction history

## User Experience

### Mobile Interface

The wallet provides a mobile-first experience:

1. **Quick Access**: Fast access to frequently used features
2. **Biometric Authentication**: Fingerprint/Face ID support
3. **QR Payments**: Scan to pay functionality
4. **Push Notifications**: Real-time transaction alerts
5. **Offline Capabilities**: Limited functionality without connectivity

### Web Interface

The web dashboard offers comprehensive management:

1. **Transaction History**: Detailed view and filtering of all activity
2. **Spending Analytics**: Visual representations of spending patterns
3. **Budget Tools**: Budget tracking and management
4. **Account Management**: Link/unlink bank accounts and cards
5. **Statement Generation**: Create and download statements

## Future Enhancements

Planned improvements to the wallet system:

1. **Cryptocurrency Support**: Add support for digital currencies
2. **Advanced Budgeting**: AI-powered budget recommendations
3. **Financial Insights**: Personalized financial advice
4. **Cross-border Payments**: International payment capabilities
5. **Installment Plans**: Buy now, pay later functionality
6. **Investment Integration**: Connect to investment accounts
7. **Voice Commands**: Voice-activated payment processing