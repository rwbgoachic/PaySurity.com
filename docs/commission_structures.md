# PaySurity Commission Structures

## Overview

PaySurity implements two distinct commission structures for its partners:

1. **Affiliate Commission Structure**: For online-only promoters who use digital marketing channels
2. **ISO Partner Commission Structure**: For face-to-face sales professionals who meet merchants in person

Both structures use milestone-based commission calculations with different payout methods and qualification criteria.

## Affiliate Commission Structure

### Standard Affiliate Program

Affiliates earn commissions through a milestone-based structure tied to the lifecycle of merchant referrals:

| Milestone | Time Period | Fixed Payment | Percentage | Recurring | Requirements |
|-----------|-------------|---------------|------------|-----------|--------------|
| Seven Day | 7 days post-activation | $25 | - | No | Merchant remains active for 7 days |
| Thirty Day | 30 days post-activation | $25 | - | No | Merchant processes ≥ $2,500 |
| Ninety Day | 90 days post-activation | $25 | 5% | No | Merchant processes ≥ $5,000 |
| One Eighty Day | 180 days post-activation | $25 | 6.25% | No | Merchant processes ≥ $10,000 |
| Recurring | Monthly (after 180 days) | $28.75 | - | Yes | Merchant remains active |

### Bonus Structures

Additional bonuses available to affiliates:

| Bonus Type | Amount | Requirements |
|------------|--------|--------------|
| Loyalty | $30/month | Refer a merchant who stays active for 12+ months |
| High Volume | $25/month | Refer a merchant processing ≥ $25,000/month |
| Bulk Referral | $300 one-time | Refer 10+ merchants in a single month |

### Commission Status Tracking

All commissions track through multiple status stages:

1. **Pending**: Commission calculated but not yet paid
2. **Paid**: Commission has been transferred to affiliate
3. **Clawed Back**: Commission was paid but later recovered (merchant canceled/fraudulent)
4. **Canceled**: Commission will not be paid (failed to meet requirements)

### Implementation Details

The affiliate commission system is implemented in `affiliateCommissionService.ts` with these key methods:

- `calculateSevenDayCommission`: Checks 7-day milestone
- `calculateThirtyDayCommission`: Checks 30-day milestone
- `calculateNinetyDayCommission`: Checks 90-day milestone
- `calculateOneEightyDayCommission`: Checks 180-day milestone
- `calculateRecurringCommission`: Checks recurring commission eligibility
- `markAffiliatePayoutAsClawedBack`: Processes commission recovery

## ISO Partner Commission Structure

### Gold Partner Program

ISO partners earn through a different structure focused on long-term merchant relationships:

| Milestone | Time Period | Fixed Payment | Percentage | Recurring | Requirements |
|-----------|-------------|---------------|------------|-----------|--------------|
| Activation | Upon merchant approval | $50 | - | No | Merchant account activated |
| Processing | Monthly | - | 10% | Yes | Based on merchant processing volume |
| Bonus Tier | After 90 days | $100 | 12% | Yes | Merchant processes ≥ $20,000/quarter |

### Territory Bonuses

ISO partners can earn additional territory-based bonuses:

| Bonus Type | Amount | Requirements |
|------------|--------|--------------|
| Territory Leader | +2% | Highest merchant acquisition in territory |
| Regional Champion | $500/quarter | Top performer in region |
| Industry Specialist | +1.5% | 5+ merchants in same industry vertical |

### Commission Management

ISO commissions have additional features:

1. **Merchant Assignment**: ISO partners are permanently assigned to specific merchants
2. **Tiered Rates**: Processing percentages adjust based on merchant volume
3. **Territory Protection**: Geographical exclusivity for qualified partners
4. **Training Requirements**: Commission rates tied to training completion

### Implementation Details

The ISO commission system leverages:

- `isoCommissionService.ts`: Handles commission calculations
- `isoPartnerDashboard.tsx`: Displays commission data to partners
- `adminIsoManagement.tsx`: Allows administrators to adjust rates and territories

## Commission Payment Processing

### Payment Methods

- **Affiliates**: PaySurity wallet, direct deposit, or bank transfer
- **ISO Partners**: Direct deposit only with monthly reconciliation reports

### Payment Schedule

- **Affiliates**: Weekly payments for fixed milestone amounts, monthly for percentage-based
- **ISO Partners**: Monthly payments with quarterly reconciliation

### Minimum Payout Thresholds

- **Affiliates**: $50 minimum for payment processing
- **ISO Partners**: No minimum

## Commission Reporting

### Affiliate Reporting

Reports available to affiliates include:

- Milestone achievement reports
- Pending commission reports
- Historical payout reports
- Merchant performance tracking
- Referral source analytics

### ISO Partner Reporting

Reports available to ISO partners include:

- Territory performance reports
- Merchant processing volume reports
- Monthly and quarterly reconciliation
- Commission projection forecasts
- Merchant retention analytics

## Reporting Implementation

The reporting system provides:

- Real-time commission dashboards
- Downloadable CSV/Excel reports
- Email notifications for milestone achievements
- Tax documentation preparation
- Weekly and monthly automated reports

## Legal and Compliance

### Commission Agreements

Both affiliate and ISO programs require signed agreements covering:

- Commission rates and structures
- Payment terms and conditions
- Clawback provisions
- Prohibited marketing practices
- Termination conditions

### Tax Reporting

The system automatically:

- Tracks payments for 1099 preparation
- Records commission history for audit purposes
- Maintains payment logs for compliance
- Generates annual earnings statements