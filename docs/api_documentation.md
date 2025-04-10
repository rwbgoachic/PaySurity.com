# PaySurity API Documentation

## Overview

PaySurity provides a comprehensive RESTful API that enables interaction with all system components. This documentation outlines the available endpoints, request/response formats, and authentication requirements.

## Authentication

### Session-Based Authentication

PaySurity uses session-based authentication with Passport.js:

- `POST /api/register`: Create a new user account
- `POST /api/login`: Authenticate and create a session
- `POST /api/logout`: End the current session
- `GET /api/user`: Get the currently authenticated user

All authenticated API requests must include the session cookie provided after login.

### CSRF Protection

Cross-Site Request Forgery protection is implemented:

1. Obtain a CSRF token via the `csrfToken()` function
2. Include the token in the `X-CSRF-Token` header for all POST, PUT, PATCH, and DELETE requests

## General Information

### Base URL

- Development: `http://localhost:5000/api`
- Production: `https://paysurity.com/api`

### Response Format

All API responses follow this format:

```json
{
  "data": { /* Response data */ },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

Error responses:

```json
{
  "data": null,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": { /* Additional error details */ }
  },
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

## API Endpoints

### Wallet Management

#### List Wallets

```
GET /api/wallets
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 123,
      "name": "Personal Wallet",
      "balance": "1250.00",
      "walletType": "personal",
      "status": "active",
      "dailyLimit": "1000.00",
      "weeklyLimit": "5000.00",
      "monthlyLimit": "10000.00",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Create Wallet

```
POST /api/wallets
```

**Request:**

```json
{
  "name": "Business Expenses",
  "walletType": "business",
  "dailyLimit": "2000.00",
  "weeklyLimit": "10000.00",
  "monthlyLimit": "30000.00"
}
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "userId": 123,
    "name": "Business Expenses",
    "balance": "0.00",
    "walletType": "business",
    "status": "active",
    "dailyLimit": "2000.00",
    "weeklyLimit": "10000.00",
    "monthlyLimit": "30000.00",
    "createdAt": "2025-04-10T12:34:56.789Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Get Wallet Details

```
GET /api/wallets/:id
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "userId": 123,
    "name": "Personal Wallet",
    "balance": "1250.00",
    "walletType": "personal",
    "status": "active",
    "dailyLimit": "1000.00",
    "weeklyLimit": "5000.00",
    "monthlyLimit": "10000.00",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Update Wallet Balance

```
PATCH /api/wallets/:id/balance
```

**Request:**

```json
{
  "balance": "1500.00"
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "userId": 123,
    "name": "Personal Wallet",
    "balance": "1500.00",
    "walletType": "personal",
    "status": "active",
    "dailyLimit": "1000.00",
    "weeklyLimit": "5000.00",
    "monthlyLimit": "10000.00",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Update Wallet Limits

```
PATCH /api/wallets/:id/limits
```

**Request:**

```json
{
  "dailyLimit": "1500.00",
  "weeklyLimit": "7500.00",
  "monthlyLimit": "20000.00"
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "userId": 123,
    "name": "Personal Wallet",
    "balance": "1500.00",
    "walletType": "personal",
    "status": "active",
    "dailyLimit": "1500.00",
    "weeklyLimit": "7500.00",
    "monthlyLimit": "20000.00",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

### Merchant Management

#### List Merchant Profiles

```
GET /api/merchants
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 123,
      "businessName": "Acme Coffee Shop",
      "businessType": "restaurant",
      "taxId": "12-3456789",
      "address": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zip": "90210",
      "country": "USA",
      "phone": "555-123-4567",
      "email": "info@acmecoffee.com",
      "website": "https://acmecoffee.com",
      "description": "Specialty coffee shop",
      "logo": "https://storage.paysurity.com/logos/acme-coffee.png",
      "referralCode": "REF123456",
      "subdomain": "acme-coffee",
      "useMicrosite": true,
      "status": "active",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### Create Merchant Profile

```
POST /api/merchants
```

**Request:**

```json
{
  "businessName": "Tech Gadgets Store",
  "businessType": "retail",
  "taxId": "98-7654321",
  "address": "456 Oak Ave",
  "city": "Tech City",
  "state": "CA",
  "zip": "94103",
  "country": "USA",
  "phone": "555-987-6543",
  "email": "info@techgadgets.com",
  "website": "https://techgadgets.com",
  "description": "Premium tech gadgets and accessories",
  "subdomain": "tech-gadgets",
  "useMicrosite": true
}
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "userId": 123,
    "businessName": "Tech Gadgets Store",
    "businessType": "retail",
    "taxId": "98-7654321",
    "address": "456 Oak Ave",
    "city": "Tech City",
    "state": "CA",
    "zip": "94103",
    "country": "USA",
    "phone": "555-987-6543",
    "email": "info@techgadgets.com",
    "website": "https://techgadgets.com",
    "description": "Premium tech gadgets and accessories",
    "subdomain": "tech-gadgets",
    "useMicrosite": true,
    "status": "pending",
    "createdAt": "2025-04-10T12:34:56.789Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Get Merchant Profile

```
GET /api/merchants/:id
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "userId": 123,
    "businessName": "Acme Coffee Shop",
    "businessType": "restaurant",
    "taxId": "12-3456789",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "90210",
    "country": "USA",
    "phone": "555-123-4567",
    "email": "info@acmecoffee.com",
    "website": "https://acmecoffee.com",
    "description": "Specialty coffee shop",
    "logo": "https://storage.paysurity.com/logos/acme-coffee.png",
    "referralCode": "REF123456",
    "subdomain": "acme-coffee",
    "useMicrosite": true,
    "status": "active",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Update Merchant Status

```
PATCH /api/merchants/:id/status
```

**Request:**

```json
{
  "status": "active"
}
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "status": "active",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

### Affiliate Management

#### List Affiliate Profiles

```
GET /api/affiliates
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 456,
      "companyName": "Digital Marketers Pro",
      "contactName": "Jane Smith",
      "email": "jane@digitalmarketerspro.com",
      "phone": "555-789-0123",
      "websiteUrl": "https://digitalmarketerspro.com",
      "referralCode": "DMP123",
      "subdomain": "dmp",
      "marketingSpecialty": "Content Marketing",
      "isActive": true,
      "totalEarned": "2450.00",
      "pendingPayouts": "350.00",
      "lifetimeReferrals": 12,
      "activeReferrals": 8,
      "createdAt": "2025-02-10T14:20:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### Create Affiliate Profile

```
POST /api/affiliates
```

**Request:**

```json
{
  "companyName": "Growth Hackers Club",
  "contactName": "John Doe",
  "email": "john@growthhackers.club",
  "phone": "555-456-7890",
  "websiteUrl": "https://growthhackers.club",
  "marketingSpecialty": "SEM",
  "subdomain": "ghc"
}
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "userId": 789,
    "companyName": "Growth Hackers Club",
    "contactName": "John Doe",
    "email": "john@growthhackers.club",
    "phone": "555-456-7890",
    "websiteUrl": "https://growthhackers.club",
    "referralCode": "GHC456",
    "subdomain": "ghc",
    "marketingSpecialty": "SEM",
    "isActive": true,
    "totalEarned": "0.00",
    "pendingPayouts": "0.00",
    "lifetimeReferrals": 0,
    "activeReferrals": 0,
    "createdAt": "2025-04-10T12:34:56.789Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Get Affiliate Statistics

```
GET /api/affiliates/:id/stats?range=month
```

**Response:**

```json
{
  "data": {
    "affiliateId": 1,
    "timeRange": "month",
    "totalReferrals": 3,
    "activeReferrals": 2,
    "pendingReferrals": 1,
    "totalCommission": "125.00",
    "pendingCommission": "50.00",
    "conversionRate": 0.67,
    "topMerchantTypes": ["restaurant", "retail"],
    "performanceTrend": "up"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

### ISO Partner Management

#### List ISO Partners

```
GET /api/iso-partners
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 321,
      "companyName": "Payment Solutions Inc.",
      "contactName": "Robert Johnson",
      "email": "robert@paymentsolutions.com",
      "phone": "555-222-3333",
      "address": "789 Business Ave",
      "city": "Commerce City",
      "state": "NY",
      "zip": "10001",
      "territory": "Northeast",
      "subdomain": "psi",
      "status": "active",
      "merchantCount": 15,
      "createdAt": "2025-01-05T09:15:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### Create ISO Partner

```
POST /api/iso-partners
```

**Request:**

```json
{
  "companyName": "Merchant Services Group",
  "contactName": "Alice Williams",
  "email": "alice@merchantservices.group",
  "phone": "555-333-4444",
  "address": "101 Commerce Blvd",
  "city": "Finance District",
  "state": "IL",
  "zip": "60601",
  "territory": "Midwest",
  "subdomain": "msg"
}
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "userId": 654,
    "companyName": "Merchant Services Group",
    "contactName": "Alice Williams",
    "email": "alice@merchantservices.group",
    "phone": "555-333-4444",
    "address": "101 Commerce Blvd",
    "city": "Finance District",
    "state": "IL",
    "zip": "60601",
    "territory": "Midwest",
    "subdomain": "msg",
    "status": "pending",
    "merchantCount": 0,
    "createdAt": "2025-04-10T12:34:56.789Z",
    "updatedAt": "2025-04-10T12:34:56.789Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

#### Get ISO Partner Merchants

```
GET /api/iso-partners/:id/merchants
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "businessName": "Acme Coffee Shop",
      "businessType": "restaurant",
      "city": "Anytown",
      "state": "CA",
      "status": "active",
      "processingVolume": "12500.00",
      "commissionRate": "0.10",
      "dateEnrolled": "2025-01-15T10:30:00.000Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 1,
    "page": 1,
    "limit": 10
  }
}
```

### POS System APIs

#### Get POS Locations

```
GET /api/pos/locations
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 123,
      "name": "Downtown Cafe",
      "address": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zip": "90210",
      "phone": "555-123-4567",
      "email": "cafe@acmecoffee.com",
      "timezone": "America/Los_Angeles",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### Get Restaurant Tables

```
GET /api/pos/tables?locationId=1
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "locationId": 1,
      "name": "Table 1",
      "capacity": 4,
      "status": "available",
      "currentOrderId": null,
      "xPosition": 100,
      "yPosition": 150,
      "width": 80,
      "height": 80,
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z"
    },
    {
      "id": 2,
      "locationId": 1,
      "name": "Table 2",
      "capacity": 2,
      "status": "occupied",
      "currentOrderId": 15,
      "xPosition": 200,
      "yPosition": 150,
      "width": 60,
      "height": 60,
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 2,
    "page": 1,
    "limit": 10
  }
}
```

#### Create Restaurant Order

```
POST /api/pos/orders
```

**Request:**

```json
{
  "locationId": 1,
  "tableId": 1,
  "serverId": 3,
  "items": [
    {
      "menuItemId": 5,
      "quantity": 2,
      "price": "12.99",
      "notes": "No onions"
    },
    {
      "menuItemId": 10,
      "quantity": 1,
      "price": "4.99",
      "notes": ""
    }
  ],
  "specialInstructions": "Allergen alert: Gluten-free table"
}
```

**Response:**

```json
{
  "data": {
    "id": 16,
    "locationId": 1,
    "tableId": 1,
    "serverId": 3,
    "customerName": null,
    "status": "draft",
    "subtotal": "30.97",
    "tax": "3.10",
    "total": "34.07",
    "specialInstructions": "Allergen alert: Gluten-free table",
    "discountAmount": null,
    "discountReason": null,
    "createdAt": "2025-04-10T12:34:56.789Z",
    "updatedAt": "2025-04-10T12:34:56.789Z",
    "items": [
      {
        "id": 25,
        "orderId": 16,
        "menuItemId": 5,
        "name": "Chicken Caesar Salad",
        "quantity": 2,
        "price": "12.99",
        "notes": "No onions",
        "status": "new",
        "createdAt": "2025-04-10T12:34:56.789Z"
      },
      {
        "id": 26,
        "orderId": 16,
        "menuItemId": 10,
        "name": "Iced Tea",
        "quantity": 1,
        "price": "4.99",
        "notes": "",
        "status": "new",
        "createdAt": "2025-04-10T12:34:56.789Z"
      }
    ]
  },
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z"
  }
}
```

### Documentation System APIs

#### Get Document Versions

```
GET /api/documentation/versions
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "documentId": 101,
      "documentType": "brd",
      "title": "Business Requirements Document",
      "content": "...",
      "updatedBy": 123,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "changeDescription": "Initial documentation structure established",
      "version": "1.0.0"
    },
    {
      "id": 2,
      "documentId": 101,
      "documentType": "brd",
      "title": "Business Requirements Document",
      "content": "...",
      "updatedBy": 123,
      "createdAt": "2025-01-18T14:15:00.000Z",
      "changeDescription": "Added affiliate commission structure documentation",
      "version": "1.0.1"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 2,
    "page": 1,
    "limit": 10
  }
}
```

#### Get Document Sections

```
GET /api/documentation/sections/brd
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "documentType": "brd",
      "title": "Executive Summary",
      "content": "...",
      "order": 1,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z",
      "updatedBy": 123
    },
    {
      "id": 2,
      "documentType": "brd",
      "title": "Core Business Components",
      "content": "...",
      "order": 2,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z",
      "updatedBy": 123
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 2,
    "page": 1,
    "limit": 10
  }
}
```

#### Get Commission Structures

```
GET /api/documentation/commission-structures?type=affiliate
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "type": "affiliate",
      "name": "Standard Affiliate",
      "description": "Standard commission structure for affiliate partners",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-04-10T12:34:56.789Z",
      "updatedBy": 123,
      "milestones": [
        {
          "name": "seven_day",
          "days": 7,
          "amount": "25.00",
          "percentage": null,
          "recurring": false
        },
        {
          "name": "thirty_day",
          "days": 30,
          "amount": "25.00",
          "percentage": null,
          "recurring": false
        },
        {
          "name": "ninety_day",
          "days": 90,
          "amount": "25.00",
          "percentage": "5.00",
          "recurring": false
        },
        {
          "name": "one_eighty_day",
          "days": 180,
          "amount": "25.00",
          "percentage": "6.25",
          "recurring": false
        },
        {
          "name": "recurring",
          "days": 30,
          "amount": "28.75",
          "percentage": null,
          "recurring": true
        }
      ]
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2025-04-10T12:34:56.789Z",
    "totalCount": 1,
    "page": 1,
    "limit": 10
  }
}
```

## WebSocket API

### Connection

Connect to the WebSocket server at:

```
ws://localhost:5000/ws  # Development
wss://paysurity.com/ws  # Production
```

### Authentication

Authentication is performed by sending a message after connection:

```json
{
  "type": "auth",
  "token": "SESSION_ID_HERE"
}
```

### Channel Subscription

Subscribe to channels for real-time updates:

```json
{
  "type": "subscribe",
  "channels": ["user-123", "wallet-456", "pos-location-1"]
}
```

### Message Format

All WebSocket messages follow this format:

```json
{
  "type": "event_type",
  "data": { /* Event data */ },
  "timestamp": "2025-04-10T12:34:56.789Z"
}
```

### Event Types

Common event types include:

- `wallet_updated`: When a wallet balance changes
- `transaction_created`: When a new transaction is created
- `merchant_status_changed`: When a merchant status changes
- `table_updated`: When a restaurant table status changes
- `order_status_changed`: When an order status changes
- `commission_earned`: When an affiliate earns a commission

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication is required for this endpoint |
| `INVALID_CREDENTIALS` | Invalid username or password |
| `INSUFFICIENT_PERMISSIONS` | User lacks necessary permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `VALIDATION_ERROR` | Request data failed validation |
| `INSUFFICIENT_FUNDS` | Wallet has insufficient funds |
| `LIMIT_EXCEEDED` | Transaction exceeds wallet limits |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `INVALID_STATUS_TRANSITION` | Invalid status change |
| `DEPENDENCY_CONFLICT` | Operation conflicts with dependencies |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

API requests are rate limited:

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

Rate limit headers:

- `X-RateLimit-Limit`: Total requests allowed in the time window
- `X-RateLimit-Remaining`: Requests remaining in the current window
- `X-RateLimit-Reset`: Timestamp when the rate limit window resets