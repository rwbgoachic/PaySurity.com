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
