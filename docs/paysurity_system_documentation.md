# PaySurity System Documentation

## 1. Executive Summary

PaySurity is a comprehensive digital payment ecosystem targeting merchant acquisition as its core priority. The platform delivers significant value through its digital wallet system, merchant onboarding, industry-specific POS solutions, and value-added services.

### Core Business Components
- Digital wallet system with card-present transactions, online payments, and ACH services
- Merchant acquisition and onboarding with streamlined verification
- Industry-specific POS solutions (BistroBeast, ECom Ready, LegalEdge, MedPay, HotelPay)
- Independent Sales Organization (ISO) partnership with Helcim.com for backend infrastructure
- Affiliate and ISO partner programs with milestone-based commission structures

## 2. Technical Architecture

### 2.1 Technology Stack

- **Frontend**: React.js, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js, PostgreSQL, Drizzle ORM
- **Real-time Communication**: WebSockets for live updates
- **API Integration**: Helcim payment processing API
- **Deployment**: Replit

### 2.2 Database Schema

The system uses PostgreSQL with Drizzle ORM for database operations. Key tables include:

- **User Management**: `users`, `sessions`
- **Merchant System**: `merchant_profiles`, `merchant_applications`
- **Digital Wallet**: `wallets`, `transactions`, `bank_accounts`
- **Affiliate System**: `affiliate_profiles`, `merchant_referrals`, `affiliate_payouts`
- **ISO Partners**: `iso_partners`, `iso_commissions`, `support_tickets`
- **POS Systems**: Various tables for each industry-specific POS solution
- **Documentation**: `document_versions`, `document_sections`, `tasks`, `report_definitions`

### 2.3 API Architecture

The API is RESTful with these main endpoint groups:

- `/api/auth/*` - Authentication and user management
- `/api/wallets/*` - Digital wallet operations
- `/api/merchants/*` - Merchant profile management
- `/api/affiliates/*` - Affiliate program management
- `/api/iso/*` - ISO partner operations
- `/api/pos/*` - Point of Sale system operations
- `/api/microsites/*` - Microsite subdomain management
- `/api/documentation/*` - Documentation system endpoints

### 2.4 Microsite Architecture

The system supports a subdomain architecture for merchants, affiliates, and ISO partners:
- Merchant microsites: `[merchant-name].paysurity.com`
- Affiliate microsites: `[affiliate-name].paysurity.com`
- ISO partner microsites: `[iso-name].paysurity.com`

## 3. Core System Components

### 3.1 Digital Wallet System

The digital wallet system provides:
- Card-present transactions
- Online payments
- ACH services
- Specialized wallet management
- Transaction history and reporting
- Balance limits and controls

### 3.2 Merchant Acquisition System

The merchant onboarding process includes:
- Business information collection
- KYC/KYB verification
- Payment integration setup
- Microsite configuration (optional)
- Integration code provision (for existing websites)
- Merchant dashboard access
- Assignment to ISO partner (if applicable)

### 3.3 Affiliate Marketing System

The affiliate system includes:
- Affiliate profile management
- Referral tracking via unique codes
- Milestone-based commission structure
- Automated commission calculations
- Marketing materials distribution
- Performance analytics dashboard

#### Affiliate Commission Structure

| Milestone | Days | Fixed Amount | Percentage | Recurring |
|-----------|------|--------------|------------|-----------|
| Seven Day | 7 | $25 | - | No |
| Thirty Day | 30 | $25 | - | No |
| Ninety Day | 90 | $25 | 5% | No |
| One Eighty Day | 180 | $25 | 6.25% | No |
| Recurring | 30 | $28.75 | - | Yes |

### 3.4 ISO Partner System

The ISO (Independent Sales Organization) partner system provides:
- Merchant enrollment capabilities
- Commission tracking and reporting
- Training documents and resources
- Support ticket creation and tracking

#### ISO Commission Structure

| Milestone | Days | Fixed Amount | Percentage | Recurring |
|-----------|------|--------------|------------|-----------|
| Activation | 1 | $50 | - | No |
| Processing | 30 | $0 | 10% | Yes |
| Bonus Tier | 90 | $100 | 12% | Yes |

### 3.5 POS Systems

PaySurity offers industry-specific POS solutions:

#### BistroBeast (Restaurant)
- Table management
- Order processing
- Kitchen display system
- Menu management
- Inventory tracking
- Staff management

#### ECom Ready (Retail)
- Inventory management
- Point of sale
- Customer management
- Promotions and discounts
- Reporting and analytics

#### LegalEdge (Legal Firms)
- Client billing
- Time tracking
- Document management
- Payment processing
- Trust accounting

#### MedPay (Healthcare)
- Patient payment processing
- Insurance verification
- Appointment scheduling
- Payment plans
- Compliance features

#### HotelPay (Hospitality)
- Reservation management
- Room charges
- Amenity billing
- Guest management
- Point of sale integration

## 4. Key System Features

### 4.1 WebSocket Integration

Real-time communications are implemented through WebSockets for:
- Live order updates in BistroBeast
- Instant payment notifications
- Real-time dashboard updates
- Affiliate referral notifications
- ISO partner alerts

### 4.2 Helcim Integration

As an ISO, PaySurity partners with Helcim.com for payment processing:
- Secure API integration
- Transaction processing
- Merchant account management
- Payment gateway configuration
- Settlement and reconciliation

### 4.3 Microsite System

Merchants have two options for website integration:
1. PaySurity-hosted microsite ([merchant-name].paysurity.com)
2. Integration with existing website via JavaScript code snippet

### 4.4 Commission Processing

The system handles complex commission calculations:
- Multi-milestone tracking
- Status management (pending/paid/clawed_back/canceled)
- Automatic or manual payment processing
- Commission recovery (clawback) when applicable
- Performance reporting

## 5. Testing and Quality Assurance

The system includes comprehensive testing:
- Automated test suites for frontend and backend
- Integration tests for payment processing
- Security and penetration testing
- Performance and load testing
- Reporting and analytics verification

## 6. Documentation System

The documentation system includes:
- Version management for all documents
- Section-based editing capabilities
- Task tracking for documentation work
- Report definition management
- Commission structure documentation
- Export capabilities to Excel

## 7. Reporting System

The reporting system provides:
- Merchant acquisition reports
- Affiliate performance metrics
- ISO partner performance tracking
- Transaction volume analytics
- Revenue and commission reporting
- System health monitoring

## 8. Deployment Status

The system is deployed via Replit with:
- Public URL access for end users
- Database connectivity to PostgreSQL
- WebSocket server for real-time features
- API endpoints for all system functions
- Documentation and task tracking features

## 9. Future Enhancements

Planned enhancements include:
- Enhanced KYC provider integration
- Additional payment methods
- Mobile application development
- Advanced fraud prevention
- International expansion capabilities
- Additional industry-specific POS solutions