# PaySurity Industry-Specific POS Solutions

## Overview

PaySurity has developed a suite of industry-specific Point of Sale (POS) solutions to meet the unique needs of different business types. Each vertical-specific solution is built on a common core framework but includes specialized features for that industry.

## Common POS Core Framework

All PaySurity POS solutions share these core components:

### Base Infrastructure

- **Backend Services**: Express.js with PostgreSQL
- **Real-time Updates**: WebSocket implementation
- **Frontend UI**: React with TailwindCSS and Shadcn UI
- **Payment Processing**: Helcim integration
- **Reporting**: Standard sales and inventory reports
- **User Management**: Role-based access control

### Common Database Tables

```sql
-- Core Location Management
CREATE TABLE pos_locations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Staff Management
CREATE TABLE pos_staff (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  pin TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Payment Processing
CREATE TABLE pos_payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_id TEXT,
  card_last_four TEXT,
  card_brand TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Common API Endpoints

All POS systems expose these standard endpoints:

- `GET /api/pos/locations`: List all locations for the merchant
- `POST /api/pos/locations`: Create a new location
- `GET /api/pos/staff`: List all staff members
- `POST /api/pos/staff`: Create a new staff member
- `GET /api/pos/payments`: List payments by various filters
- `POST /api/pos/payments`: Process a new payment

## BistroBeast (Restaurant POS)

BistroBeast is a comprehensive restaurant management system designed for full-service restaurants, cafes, and bars.

### Key Features

- **Table Management**: Interactive floor plan with table status
- **Order Management**: Order creation, modification, and tracking
- **Menu Management**: Menu items, categories, and modifiers
- **Kitchen Display System**: Real-time order notification for kitchen
- **Split Checks**: Ability to split by seat, percentage, or items
- **Reservations**: Table reservation and waitlist management
- **Server Performance**: Track sales by server

### Database Structure

Additional tables specific to BistroBeast:

```sql
-- Restaurant Tables
CREATE TABLE restaurant_tables (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'available',
  current_order_id INTEGER,
  x_position INTEGER,
  y_position INTEGER,
  width INTEGER,
  height INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Restaurant Orders
CREATE TABLE restaurant_orders (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  table_id INTEGER,
  server_id INTEGER NOT NULL,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal TEXT NOT NULL,
  tax TEXT NOT NULL,
  total TEXT NOT NULL,
  special_instructions TEXT,
  discount_amount TEXT,
  discount_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Menu Items
CREATE TABLE pos_menu_items (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  category_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  item_type TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### API Endpoints

BistroBeast specific endpoints:

- `GET /api/pos/tables`: Get all tables for a location
- `PUT /api/pos/tables/:id/status`: Update table status
- `GET /api/pos/orders`: Get orders (filterable by status)
- `POST /api/pos/orders`: Create a new order
- `GET /api/pos/menu-items`: Get menu items
- `POST /api/pos/menu-items`: Create a menu item

### User Interface Components

BistroBeast includes specialized UI components:

- Interactive floor plan designer
- Table status indicators
- Kitchen display view
- Order ticket interface
- Menu builder
- Modifier configuration panel

## ECom Ready (Retail POS)

ECom Ready is designed for retail businesses with both in-person and online sales capabilities.

### Key Features

- **Inventory Management**: Track stock across locations
- **Barcode Scanning**: Support for various barcode formats
- **Product Variants**: Size, color, and other attribute management
- **Customer Profiles**: Customer tracking and history
- **Loyalty Program**: Points and rewards system
- **Promotions**: Discount and promotion management
- **E-commerce Integration**: Sync with online store

### Database Structure

Additional tables specific to ECom Ready:

```sql
-- Inventory Items
CREATE TABLE pos_inventory_items (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  barcode TEXT,
  category_id INTEGER,
  price TEXT NOT NULL,
  cost TEXT,
  tax_rate TEXT,
  quantity INTEGER NOT NULL,
  low_stock_threshold INTEGER,
  reorder_point INTEGER,
  vendor_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id INTEGER,
  notes TEXT,
  staff_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Profiles
CREATE TABLE retail_customers (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_spent TEXT DEFAULT '0.00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### API Endpoints

ECom Ready specific endpoints:

- `GET /api/pos/inventory`: Get inventory items
- `POST /api/pos/inventory`: Create an inventory item
- `PUT /api/pos/inventory/:id/quantity`: Update inventory quantity
- `GET /api/pos/customers`: Get customer profiles
- `POST /api/pos/customers`: Create a customer profile
- `GET /api/pos/reports/inventory`: Get inventory reports

### User Interface Components

ECom Ready includes specialized UI components:

- Barcode scanner interface
- Inventory management dashboard
- Customer profile viewer
- Product variant matrix
- Promotion builder
- Loyalty program manager

## LegalEdge (Legal Firm POS)

LegalEdge is designed for law firms and legal service providers to track time, bill clients, and manage trust accounts.

### Key Features

- **Time Tracking**: Billable hours and activity tracking
- **Client Billing**: Automated billing and invoicing
- **Trust Accounting**: IOLTA-compliant trust account management
- **Document Management**: Document storage and organization
- **Matter Management**: Case and matter tracking
- **Conflict Checking**: Client conflict detection
- **E-signature**: Document signing capabilities

### Database Structure

Additional tables specific to LegalEdge:

```sql
-- Matters
CREATE TABLE legal_matters (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  matter_number TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  practice_area TEXT,
  responsible_attorney_id INTEGER NOT NULL,
  opened_date TIMESTAMP DEFAULT NOW(),
  closed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Time Entries
CREATE TABLE legal_time_entries (
  id SERIAL PRIMARY KEY,
  matter_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  activity_code TEXT,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL(8,2) NOT NULL,
  billable BOOLEAN DEFAULT TRUE,
  rate TEXT,
  amount TEXT,
  status TEXT NOT NULL DEFAULT 'unbilled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Trust Transactions
CREATE TABLE trust_transactions (
  id SERIAL PRIMARY KEY,
  matter_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  amount TEXT NOT NULL,
  description TEXT,
  check_number TEXT,
  reference_number TEXT,
  date DATE NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

LegalEdge specific endpoints:

- `GET /api/pos/legal/matters`: Get matters
- `POST /api/pos/legal/matters`: Create a matter
- `GET /api/pos/legal/time-entries`: Get time entries
- `POST /api/pos/legal/time-entries`: Create a time entry
- `GET /api/pos/legal/trust-transactions`: Get trust transactions
- `POST /api/pos/legal/trust-transactions`: Create a trust transaction

## MedPay (Healthcare POS)

MedPay is designed for medical practices, clinics, and healthcare providers with a focus on patient payments and insurance processing.

### Key Features

- **Patient Management**: Patient demographics and history
- **Insurance Verification**: Real-time insurance eligibility checking
- **Copay Collection**: Point-of-service payment collection
- **Claim Management**: Track insurance claims
- **Patient Statements**: Generate and send patient statements
- **Payment Plans**: Setup and manage payment plans
- **HIPAA Compliance**: Secure, compliant data handling

### Database Structure

Additional tables specific to MedPay:

```sql
-- Patients
CREATE TABLE medical_patients (
  id SERIAL PRIMARY KEY,
  practice_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Insurance Plans
CREATE TABLE insurance_plans (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  insurance_provider TEXT NOT NULL,
  plan_name TEXT,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  subscriber_name TEXT,
  subscriber_relationship TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Medical Claims
CREATE TABLE medical_claims (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  insurance_plan_id INTEGER NOT NULL,
  service_date DATE NOT NULL,
  claim_number TEXT,
  total_charge TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  submission_date DATE,
  paid_amount TEXT,
  patient_responsibility TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### API Endpoints

MedPay specific endpoints:

- `GET /api/pos/medical/patients`: Get patients
- `POST /api/pos/medical/patients`: Create a patient
- `GET /api/pos/medical/insurance-plans`: Get insurance plans
- `POST /api/pos/medical/claims`: Create a medical claim
- `PUT /api/pos/medical/claims/:id/status`: Update claim status
- `GET /api/pos/medical/reports/collections`: Get collections reports

## HotelPay (Hospitality POS)

HotelPay is designed for hotels, motels, and other lodging businesses, focusing on reservation management and guest billing.

### Key Features

- **Reservation Management**: Room booking and availability
- **Guest Check-in/Check-out**: Streamlined process
- **Room Charges**: Post charges to guest folios
- **Housekeeping Management**: Track room status
- **Group Bookings**: Manage group reservations
- **Point of Sale Integration**: Restaurant and gift shop integration
- **Night Audit**: Automated end-of-day processing

### Database Structure

Additional tables specific to HotelPay:

```sql
-- Rooms
CREATE TABLE hotel_rooms (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL,
  room_number TEXT NOT NULL,
  room_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'vacant',
  housekeeping_status TEXT NOT NULL DEFAULT 'clean',
  rate TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  amenities JSONB,
  floor TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Reservations
CREATE TABLE hotel_reservations (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL,
  room_id INTEGER,
  guest_id INTEGER NOT NULL,
  confirmation_number TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  rate_code TEXT,
  rate_amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Folios (Guest Bill)
CREATE TABLE hotel_folios (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL,
  guest_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  balance TEXT NOT NULL DEFAULT '0.00',
  tax_total TEXT NOT NULL DEFAULT '0.00',
  grand_total TEXT NOT NULL DEFAULT '0.00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Folio Charges
CREATE TABLE hotel_folio_charges (
  id SERIAL PRIMARY KEY,
  folio_id INTEGER NOT NULL,
  charge_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  charge_type TEXT NOT NULL,
  reference_id INTEGER,
  staff_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

HotelPay specific endpoints:

- `GET /api/pos/hotel/rooms`: Get hotel rooms
- `PUT /api/pos/hotel/rooms/:id/status`: Update room status
- `GET /api/pos/hotel/reservations`: Get reservations
- `POST /api/pos/hotel/reservations`: Create a reservation
- `GET /api/pos/hotel/folios/:id`: Get a guest folio
- `POST /api/pos/hotel/folios/:id/charges`: Add a charge to a folio

## Implementation Status

| POS System | Status | Core Features | Remaining Work |
|------------|--------|---------------|----------------|
| BistroBeast | Complete | All core features implemented | Advanced reporting, mobile app |
| ECom Ready | Complete | All core features implemented | E-commerce sync, advanced inventory |
| LegalEdge | In Progress | Base framework, time tracking | Trust accounting, document management |
| MedPay | In Progress | Patient management | Insurance verification, claim management |
| HotelPay | In Progress | Room management | Reservation system, folio management |

## Technical Architecture

All POS systems follow this architecture:

1. **Frontend**: React components with industry-specific UI
2. **API Layer**: Express.js endpoints for each POS type
3. **Business Logic**: Service classes for each industry
4. **Data Layer**: PostgreSQL with Drizzle ORM
5. **Real-time Updates**: WebSocket for live status changes

## Future Enhancements

Planned enhancements across all POS systems:

1. **Mobile Applications**: Native apps for each POS type
2. **Offline Mode**: Continue operations during internet outages
3. **Advanced Analytics**: Industry-specific KPIs and dashboards
4. **AI Integration**: Predictive analytics and recommendations
5. **Hardware Integration**: Better support for printers, scanners, etc.