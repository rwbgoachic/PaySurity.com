/**
 * Production server for Replit deployment
 * This file is a standalone Express server for the deployment environment
 */

// Import required modules
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Set production mode
process.env.NODE_ENV = 'production';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Simple health check endpoint for deployment verification
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    service: 'paysurity-api',
    timestamp: new Date().toISOString()
  });
});

// Handle all routes with basic HTML
app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PaySurity - Payment Processing Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      background-color: #f9fafb;
      color: #1f2937;
    }
    .container {
      max-width: 800px;
      text-align: center;
      background-color: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #4f46e5;
    }
    p {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      color: #4b5563;
    }
    .status {
      margin-top: 30px;
      padding: 15px;
      background-color: #ecfdf5;
      color: #064e3b;
      border-radius: 8px;
      font-weight: 500;
    }
    .technical {
      margin-top: 20px;
      font-size: 0.8rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>PaySurity</h1>
    <p>Comprehensive Enterprise Payment Processing Platform</p>
    <p>Our platform provides advanced financial infrastructure with intelligent payment solutions, multi-tenant management, and comprehensive security.</p>
    <div class="status">
      ✅ Server is running correctly in production mode
    </div>
    <div class="technical">
      Server running at: ${new Date().toISOString()}<br>
      Environment: ${process.env.NODE_ENV || 'development'}<br>
      Node.js: ${process.version}
    </div>
  </div>
</body>
</html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Current directory: ${__dirname}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});