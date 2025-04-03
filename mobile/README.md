# PaySurity Mobile App

This directory contains the React Native mobile application for PaySurity, including:

1. **BistroBeast POS System** - A complete point-of-sale system for restaurants
2. **PaySurity Digital Wallet** - A digital wallet for managing payments, cards, and transactions

## Setup Instructions

### Prerequisites

- Node.js 16+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

```bash
# Install dependencies
cd mobile
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Features

### BistroBeast POS System
- Table management
- Menu and order management
- Inventory tracking
- Staff management
- Payment processing

### PaySurity Digital Wallet
- Multi-wallet management
- Transaction history
- Card management
- Payment processing
- Money transfers

## Project Structure

- `/src/assets` - Images and other static assets
- `/src/components` - Reusable UI components
- `/src/hooks` - Custom React hooks
- `/src/navigation` - Navigation configuration
- `/src/screens` - Screen components
  - `/auth` - Authentication screens
  - `/pos` - BistroBeast POS screens
  - `/wallet` - Digital Wallet screens
  - `/common` - Shared screens
- `/src/services` - API and other service integrations
- `/src/utils` - Utility functions and helper code

## API Integration

The mobile app connects to the same backend services as the web application, ensuring consistent data across both platforms. The API service is configured in `/src/services/api.ts`.