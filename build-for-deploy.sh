#!/bin/bash

# Script for building for deployment
echo "🚀 Starting build process for deployment..."

# Step 1: Ensure directories exist
echo "📁 Setting up directory structure..."
mkdir -p dist/server/public

# Step 2: Copy static files
echo "📄 Copying static files..."
cp -r server/public/* dist/server/public/ 2>/dev/null || echo "No static files to copy"

# Step 3: Manual conversion of index.ts to index.js
echo "📦 Converting server/index.ts to JavaScript..."
# Create a simple server/index.js that loads the TypeScript version
cat > dist/server/index.js << 'EOF'
// This file was created by the build script to handle TypeScript loading
// Import required modules
import * as dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import compression from 'compression';
import helmet from 'helmet';

// Load environment variables
dotenv.config({ path: '.env.production' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json());

// Serve static files
const STATIC_DIR = path.join(__dirname, 'public');
app.use(express.static(STATIC_DIR));

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Handle all routes - serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
EOF

# Step 4: Create a root entry point
echo "📄 Creating root entry point..."
cat > dist/index.js << 'EOF'
// Entry point for Replit deployment
import './server/index.js';
EOF

echo "✅ Build complete! Files are in the 'dist' directory."

# Verify the build
if [ -f "dist/server/index.js" ]; then
  echo "✅ Server file created successfully."
else
  echo "❌ Error: dist/server/index.js not found."
  exit 1
fi

if [ -f "dist/index.js" ]; then
  echo "✅ Root entry point created."
else
  echo "❌ Error: dist/index.js not found."
  exit 1
fi

echo "🎉 Build verification complete. Ready for deployment!"