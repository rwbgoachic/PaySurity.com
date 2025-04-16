// Load environment variables early
import * as dotenv from 'dotenv';
// First try loading production-specific env file, then fall back to regular .env
try {
  dotenv.config({ path: '.env.production' });
} catch (e) {
  console.log('No production env file found, using default');
}
dotenv.config(); // Regular .env file

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes-diagnostic";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExpressBrute from "express-brute";
import csurf from "csurf";
import createSecureHeaders from "content-security-policy";
import { setupAuth } from "./auth";
import { generateSitemap } from "./sitemap";

const app = express();

// Enable compression for all requests
app.use(compression());

// Secure app with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://*.replit.dev", "wss://*.replit.dev"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*.stripe.com", "wss://*.replit.dev", "https://*.replit.dev"],
      connectSrc: ["'self'", "api.stripe.com", "newsapi.org", "*.paysurity.com", "wss://*.replit.dev", "https://*.replit.dev", "ws://localhost:*", "ws://*", "wss://*"],
      frameSrc: ["'self'", "*.stripe.com"],
      imgSrc: ["'self'", "data:", "*.stripe.com", "*.newsapi.org", "*.paysurity.com", "https://*.replit.dev", "*"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "https://*.replit.dev", "*"],
      fontSrc: ["'self'", "fonts.gstatic.com", "data:", "https://*.replit.dev", "*"],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  xssFilter: true,
  noSniff: false, // Allow proper MIME type detection for Vite HMR websockets
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// Global rate limiter - preventing DoS attacks but more generous for development
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 requests per windowMs for development
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

// Body parser middleware - MUST come before authentication routes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Apply rate limiting to all requests
app.use(globalLimiter);

// Less strict rate limit for authentication endpoints during development
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased to 100 attempts per hour for development
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts, please try again after an hour"
});

// Brute force protection for login - more lenient for development
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
  freeRetries: 20, // Increased for development
  minWait: 10 * 1000, // 10 seconds - reduced for development
  maxWait: 15 * 60 * 1000, // 15 minutes - reduced for development
  failCallback: (_req: Request, res: Response, _next: NextFunction, nextValidRequestDate: Date) => {
    const waitTime = Math.ceil((nextValidRequestDate.getTime() - Date.now()) / 1000);
    res.status(429).json({
      message: `Too many failed login attempts. Please try again in ${waitTime} seconds.`
    });
  }
});

// Apply auth limiter to login and register routes
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// First set up the routes that need to be registered before authentication and CSRF
app.get('/sitemap.xml', generateSitemap);

// Health check endpoint - useful for deployment verification and monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    service: 'paysurity-api',
    timestamp: new Date().toISOString()
  });
});

// Root route now redirects to our dark-themed landing page
app.get('/', (req, res) => {
  // Log request details for debugging
  console.log('Root route accessed:');
  console.log('- Headers:', req.headers);
  console.log('- Host:', req.get('host'));
  console.log('- URL:', req.url);
  console.log('- Original URL:', req.originalUrl);
  
  // Check if we're being redirected by an external service
  const host = req.get('host');
  if (host && host.includes('paysurity.com')) {
    console.log('WARNING: Request is being handled by paysurity.com domain!');
  }
  
  // Redirect to our dark-themed landing page
  res.redirect('/dark');
});

// Static test page for debugging connectivity issues
app.get('/static-test', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(import.meta.dirname, '..', 'client', 'static-test.html'));
});

// Diagnostic page for troubleshooting
app.get('/diagnostic', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnostic Page</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .success {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
    }
    .info {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
    }
    .warning {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
    }
    h2 {
      margin-top: 0;
      font-size: 1.25rem;
    }
    ul {
      padding-left: 1.5rem;
    }
    li {
      margin-bottom: 0.5rem;
    }
    code {
      background: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    th, td {
      text-align: left;
      padding: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f8fafc;
    }
  </style>
</head>
<body>
  <h1>System Diagnostic Page</h1>

  <div class="card success">
    <h2>Express Server Status</h2>
    <p><strong>✅ Working:</strong> If you can see this page, the Express server is functioning correctly.</p>
  </div>

  <div class="card info">
    <h2>Environment Information</h2>
    <table>
      <tr>
        <th>Item</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Node.js Version</td>
        <td>${process.version}</td>
      </tr>
      <tr>
        <td>Environment</td>
        <td>${process.env.NODE_ENV || 'development'}</td>
      </tr>
      <tr>
        <td>Server Time</td>
        <td>${new Date().toLocaleString()}</td>
      </tr>
    </table>
  </div>

  <div class="card warning">
    <h2>Troubleshooting Steps</h2>
    <ol>
      <li>Verify that the <code>/static-test</code> route works</li>
      <li>Check if <code>/admin/simple</code> or <code>/admin/minimal</code> loads in React</li>
      <li>If React routes fail but static routes work, the issue is with the Vite/React setup</li>
      <li>Consider adding <code>?v=timestamp</code> to URL query parameters to bypass caching</li>
    </ol>
  </div>
</body>
</html>
  `);
});

// Set up auth which will handle session creation
setupAuth(app);

// Import and setup admin authentication endpoints (bypassing session issues)
import { setupAdminAuth } from "./admin-auth";
setupAdminAuth(app);

// CSRF protection - using the session to store csrf secret
// This must come AFTER session setup
const csrfProtection = csurf({
  cookie: false, 
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  // We're using the default session key 'csrfSecret'
});

// Provide CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection for non-GET non-OPTIONS routes
app.use((req, res, next) => {
  // Skip CSRF for these requests
  if (
    req.method === 'GET' || 
    req.method === 'HEAD' || 
    req.method === 'OPTIONS' || 
    req.path.includes('/api/webhook') ||
    req.path === '/api/csrf-token' ||
    req.path === '/api/login' ||
    req.path === '/api/register' ||
    // Allow PUT on health endpoint for testing Method Not Allowed
    (req.path === '/api/health' && req.method === 'PUT') ||
    // Skip CSRF protection in test mode (for automated testing)
    req.headers['x-test-mode'] === 'true'
  ) {
    if (req.headers['x-test-mode'] === 'true') {
      console.log('CSRF protection bypassed for test mode request:', req.path);
    }
    return next();
  }
  
  // Apply CSRF protection to all other routes
  csrfProtection(req, res, next);
});

// Body parser already set up above

// DISABLED: Domain handling middleware
// We're no longer redirecting to paysurity.com to fix the landing page issue
app.use((req, res, next) => {
  next();
});

// Add global options handler for CORS preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(200).end();
});

// Simple caching strategy - disable caching for all routes to ensure fresh content
app.use((req, res, next) => {
  // Don't cache anything to ensure fresh content during development
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Log all registered routes
  console.log('Registered routes:');
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    }
  });
  
  // Add a 404 handler for API routes - must be before the UI routes
  app.use('/api/*', (req, res, next) => {
    // Check if the route is already registered
    const route = app._router.stack.find((layer: any) => 
      layer.route && 
      layer.route.path && 
      (layer.route.path === req.path || layer.route.path === req.originalUrl)
    );
    
    // Only handle as 404 if no matching route exists
    if (!route) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // If route exists, let it be handled by the registered handler
    next();
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // EMERGENCY DARK THEME ROUTE - Direct dark themed landing page
app.get('/dark', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PaySurity - Modern Payment Infrastructure</title>
  
  <style>
    :root {
      --blue-400: #60a5fa;
      --blue-500: #3b82f6;
      --blue-600: #2563eb;
      --blue-700: #1d4ed8;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-400: #9ca3af;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
      --black: #000000;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      background-color: var(--black);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      height: 100%;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      width: 100%;
      border-bottom: 1px solid var(--gray-800);
      background-color: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
    }
    
    header .container {
      display: flex;
      height: 4rem;
      align-items: center;
      justify-content: space-between;
    }
    
    .logo {
      color: var(--blue-500);
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
    }
    
    nav {
      display: none;
    }
    
    @media (min-width: 768px) {
      nav {
        display: flex;
        gap: 2rem;
      }
    }
    
    nav a {
      color: var(--gray-300);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    nav a:hover {
      color: var(--blue-500);
    }
    
    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }
    
    .btn-ghost {
      color: white;
    }
    
    .btn-ghost:hover {
      color: var(--blue-400);
    }
    
    .btn-primary {
      background-color: var(--blue-600);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: var(--blue-700);
    }
    
    .hero {
      position: relative;
      overflow: hidden;
      padding: 6rem 1.5rem;
      background-color: var(--black);
      text-align: center;
    }
    
    .bg-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.05'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.8;
      z-index: 0;
    }
    
    .hero-content {
      position: relative;
      z-index: 10;
      max-width: 42rem;
      margin: 0 auto;
    }
    
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.025em;
      margin-bottom: 1.5rem;
    }
    
    @media (min-width: 640px) {
      h1 {
        font-size: 3.75rem;
      }
    }
    
    .text-blue {
      color: var(--blue-500);
    }
    
    .hero-description {
      font-size: 1.125rem;
      color: var(--gray-300);
      margin-bottom: 2.5rem;
      max-width: 36rem;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
    }
    
    .features {
      padding: 6rem 1.5rem;
      background-color: var(--black);
    }
    
    .section-title {
      max-width: 42rem;
      margin: 0 auto 3rem;
      text-align: center;
    }
    
    h2 {
      font-size: 1.875rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.025em;
      margin-bottom: 1.5rem;
    }
    
    @media (min-width: 640px) {
      h2 {
        font-size: 2.25rem;
      }
    }
    
    .section-description {
      font-size: 1.125rem;
      color: var(--gray-300);
      max-width: 32rem;
      margin-left: auto;
      margin-right: auto;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    @media (min-width: 768px) {
      .feature-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    .feature {
      display: flex;
      flex-direction: column;
    }
    
    .feature-icon {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .icon-bg {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      background-color: var(--blue-600);
      margin-right: 0.75rem;
    }
    
    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .feature-description {
      font-size: 1rem;
      color: var(--gray-400);
      flex-grow: 1;
    }
    
    footer {
      border-top: 1px solid var(--gray-800);
      background-color: var(--black);
      padding: 3rem 1.5rem;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .footer-main {
      display: flex;
      flex-direction: column;
      margin-bottom: 2rem;
    }
    
    @media (min-width: 768px) {
      .footer-main {
        flex-direction: row;
        justify-content: space-between;
      }
    }
    
    .footer-brand {
      margin-bottom: 2rem;
    }
    
    @media (min-width: 768px) {
      .footer-brand {
        margin-bottom: 0;
      }
    }
    
    .footer-brand h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .footer-brand p {
      font-size: 0.875rem;
      color: var(--gray-400);
      max-width: 20rem;
    }
    
    .footer-links {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
    
    @media (min-width: 640px) {
      .footer-links {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    .footer-group h4 {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--gray-200);
      margin-bottom: 1rem;
    }
    
    .footer-group ul {
      list-style: none;
    }
    
    .footer-group li {
      margin-bottom: 0.5rem;
    }
    
    .footer-group a {
      font-size: 0.875rem;
      color: var(--gray-400);
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .footer-group a:hover {
      color: var(--blue-500);
    }
    
    .footer-bottom {
      padding-top: 2rem;
      border-top: 1px solid var(--gray-800);
      text-align: center;
    }
    
    .copyright {
      font-size: 0.875rem;
      color: var(--gray-400);
    }
  </style>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <header>
    <div class="container">
      <a href="/dark" class="logo">PaySurity</a>
      
      <nav>
        <a href="/dark?page=products">Products</a>
        <a href="/dark?page=pricing">Pricing</a>
        <a href="/dark?page=industries">Industries</a>
        <a href="/dark?page=wallet">Digital Wallet</a>
      </nav>
      
      <div class="actions">
        <a href="/dark?page=login" class="btn btn-ghost">Log in</a>
        <a href="/dark?page=signup" class="btn btn-primary">Get Started</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="bg-grid"></div>
    <div class="hero-content">
      <h1>Modern Payment <span class="text-blue">Infrastructure</span></h1>
      <p class="hero-description">
        Comprehensive payment solutions empowering businesses with seamless 
        processing, digital wallets, and integrated POS systems.
      </p>
      <div class="hero-actions">
        <a href="/dark?page=signup" class="btn btn-primary">Get started</a>
        <a href="/dark?page=products" class="btn btn-ghost">Explore products →</a>
      </div>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="features">
    <div class="section-title">
      <h2>Payment solutions for every business</h2>
      <p class="section-description">
        Our comprehensive suite of tools helps businesses process payments securely and efficiently,
        with solutions tailored to your specific needs.
      </p>
    </div>
    
    <div class="feature-grid">
      <!-- Feature 1 -->
      <div class="feature">
        <div class="feature-icon">
          <div class="icon-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.25 8.25H21.75M2.25 9H21.75M5.25 14.25H11.25M5.25 16.5H8.25M4.5 19.5H19.5C20.0967 19.5 20.669 19.2629 21.091 18.841C21.5129 18.419 21.75 17.8467 21.75 17.25V6.75C21.75 6.15326 21.5129 5.58097 21.091 5.15901C20.669 4.73705 20.0967 4.5 19.5 4.5H4.5C3.90326 4.5 3.33097 4.73705 2.90901 5.15901C2.48705 5.58097 2.25 6.15326 2.25 6.75V17.25C2.25 17.8467 2.48705 18.419 2.90901 18.841C3.33097 19.2629 3.90326 19.5 4.5 19.5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="feature-title">Payment Processing</h3>
        </div>
        <p class="feature-description">
          Fast, secure payment processing for online and in-person transactions with competitive rates.
        </p>
      </div>
      
      <!-- Feature 2 -->
      <div class="feature">
        <div class="feature-icon">
          <div class="icon-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5H15C13.6193 10.5 12.5 11.6193 12.5 13C12.5 14.3807 13.6193 15.5 15 15.5H19.5C20.3284 15.5 21 14.8284 21 14M21 12V9M21 12V14M21 14C21 15.1046 20.1046 16 19 16H5C3.89543 16 3 15.1046 3 14M3 12C3 13.1046 3.89543 14 5 14M3 12C3 10.8954 3.89543 10 5 10M3 12V9M3 12V14M21 9C21 7.89543 20.1046 7 19 7H5C3.89543 7 3 7.89543 3 9M21 9V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="feature-title">Digital Wallet</h3>
        </div>
        <p class="feature-description">
          Secure multi-wallet management with instant transfers, advanced authentication, and detailed transaction history.
        </p>
      </div>
      
      <!-- Feature 3 -->
      <div class="feature">
        <div class="feature-icon">
          <div class="icon-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17.25V18.257C9 19.1835 8.65079 20.0718 8.02252 20.7215C7.87897 20.8692 7.72602 21 7.5 21H16.5C16.274 21 16.121 20.8692 15.9775 20.7215C15.3492 20.0718 15 19.1835 15 18.257V17.25M6 12H18C19.2426 12 20.25 10.9926 20.25 9.75V5.25C20.25 4.00736 19.2426 3 18 3H6C4.75736 3 3.75 4.00736 3.75 5.25V9.75C3.75 10.9926 4.75736 12 6 12Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="feature-title">POS Systems</h3>
        </div>
        <p class="feature-description">
          Complete point-of-sale solutions with hardware options, inventory management, and customer relationship tools.
        </p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <h3>PaySurity</h3>
          <p>Modern payment infrastructure for businesses of all sizes</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-group">
            <h4>Products</h4>
            <ul>
              <li><a href="/dark?page=products">Payment Processing</a></li>
              <li><a href="/dark?page=wallet">Digital Wallet</a></li>
              <li><a href="/dark?page=pos">POS Systems</a></li>
            </ul>
          </div>
          
          <div class="footer-group">
            <h4>Company</h4>
            <ul>
              <li><a href="/dark?page=about">About</a></li>
              <li><a href="/dark?page=contact">Contact</a></li>
              <li><a href="/dark?page=careers">Careers</a></li>
            </ul>
          </div>
          
          <div class="footer-group">
            <h4>Resources</h4>
            <ul>
              <li><a href="/dark?page=docs">Documentation</a></li>
              <li><a href="/dark?page=support">Support</a></li>
              <li><a href="/dark?page=faq">FAQ</a></li>
            </ul>
          </div>
          
          <div class="footer-group">
            <h4>Legal</h4>
            <ul>
              <li><a href="/dark?page=terms">Terms</a></li>
              <li><a href="/dark?page=privacy">Privacy</a></li>
              <li><a href="/dark?page=security">Security</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">© ${new Date().getFullYear()} PaySurity, Inc. All rights reserved.</p>
      </div>
    </div>
  </footer>
  
  <script>
    console.log('PaySurity Direct Dark Theme Landing Page Loaded - April ${new Date().toISOString().split('T')[0]}');
  </script>
</body>
</html>`);
});

// SUPER EMERGENCY ROUTE - A unique route that shouldn't be cached anywhere
app.get('/emergency-april-16-landing', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PaySurity - Emergency April 16 Landing Page</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #121212;
          color: #e0e0e0;
        }
        h1, h2, h3 {
          color: #7661E2;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #333;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(90deg, #7661E2, #8A63D2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .nav {
          display: flex;
          gap: 1.5rem;
        }
        .nav a {
          color: #aaa;
          text-decoration: none;
        }
        .nav a:hover {
          color: #fff;
        }
        .buttons {
          display: flex;
          gap: 1rem;
        }
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
        }
        .btn-primary {
          background-color: #7661E2;
          color: white;
        }
        .btn-secondary {
          background-color: transparent;
          color: #7661E2;
          border: 1px solid #7661E2;
        }
        .hero {
          text-align: center;
          padding: 4rem 0;
          background-color: #1a1a1a;
          border-radius: 8px;
          margin-bottom: 3rem;
        }
        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .hero p {
          font-size: 1.25rem;
          color: #bbb;
          max-width: 800px;
          margin: 0 auto 2rem auto;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .feature {
          padding: 1.5rem;
          border-radius: 8px;
          background-color: #1a1a1a;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        .feature-icon {
          display: inline-block;
          width: 3rem;
          height: 3rem;
          background-color: #271d59;
          border-radius: 8px;
          margin-bottom: 1rem;
          position: relative;
        }
        .feature h3 {
          margin-top: 0;
        }
        .section-title {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .section-title h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .section-title p {
          color: #bbb;
          max-width: 700px;
          margin: 0 auto;
        }
        .timestamp {
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.5);
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          color: #aaa;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">PaySurity</div>
        <div class="nav">
          <a href="/products">Products</a>
          <a href="/solutions">Solutions</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <div class="buttons">
          <a href="/auth" class="btn btn-secondary">Log In</a>
          <a href="/auth" class="btn btn-primary">Sign Up</a>
        </div>
      </div>

      <div class="hero">
        <h1>Advanced Payment Solutions for Modern Businesses</h1>
        <p>PaySurity provides integrated payment processing, financial management, and workflow optimization tools to streamline your business operations.</p>
        <div class="buttons">
          <a href="/solutions" class="btn btn-primary">Explore Solutions</a>
          <a href="/contact" class="btn btn-secondary">Contact Sales</a>
        </div>
      </div>

      <div class="section-title">
        <h2>Core Features</h2>
        <p>Discover how our comprehensive platform can help you manage payments, optimize workflows, and grow your business.</p>
      </div>

      <div class="features">
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>Payment Processing</h3>
          <p>Process payments securely with multiple gateway options, fraud protection, and PCI compliance.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>Financial Management</h3>
          <p>Comprehensive tools for invoicing, accounting, and financial reporting to keep your business on track.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>Workflow Optimization</h3>
          <p>Automate routine tasks, streamline approvals, and optimize business processes for maximum efficiency.</p>
        </div>
      </div>

      <div class="section-title">
        <h2>Our POS Solutions</h2>
        <p>Specialized point-of-sale systems designed for different industries</p>
      </div>

      <div class="features">
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>BistroBeast</h3>
          <p>Complete restaurant management system with tableside ordering, kitchen display, and staff management.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>GrocerEase</h3>
          <p>Grocery and convenience store POS with inventory management and customer loyalty programs.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>ECom Ready Retail</h3>
          <p>Omnichannel retail solution that integrates in-store and online sales with inventory tracking.</p>
        </div>
      </div>
      
      <div class="section-title">
        <h2>Digital Wallet Solutions</h2>
        <p>Complete digital payment infrastructure for modern finance</p>
      </div>

      <div class="features">
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>Multi-Currency Support</h3>
          <p>Handle transactions in multiple currencies with real-time exchange rates and low conversion fees.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>Secure Authentication</h3>
          <p>Multi-factor authentication, biometric verification, and advanced fraud detection systems.</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h3>Payment Routing</h3>
          <p>Intelligent routing to optimize transaction costs and success rates across payment methods.</p>
        </div>
      </div>
      
      <div class="timestamp">
        Emergency Landing Page (April 16, 2025) - Generated at ${new Date().toISOString()}
      </div>
    </body>
    </html>
  `);
});

// Add a special route for client-side routing paths that should not be handled by the API
  app.get([
    // Root path explicitly listed to ensure React routing
    '/',
    
    // Main routes
    '/partners', '/affiliates', '/partner-portal', '/affiliate-portal',
    '/products', '/pricing', '/industry-solutions', '/digital-wallet', '/pos-systems',
    
    // Blog and resource pages
    '/blog', '/blog/*', '/documentation', '/faq', '/support',
    
    // Company pages
    '/about', '/careers', '/customers', '/contact',
    
    // Legal pages
    '/terms', '/privacy', '/compliance', '/security',
    
    // Admin portal routes
    '/admin', '/admin/*',
    
    // All other client-side routes that might be in the footer
    '/payments'
  ], (req, res, next) => {
    // Force these paths to be handled by Vite/client-side routing
    if (app.get("env") === "development") {
      // In development, let Vite handle it
      next();
    } else {
      // In production, serve the index.html
      res.sendFile(path.join(import.meta.dirname, "public", "index.html"));
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  
  // Check if we're in development or production mode
  // Force development mode to ensure Vite is used for our new dark themed UI
  const isDevelopment = true; // Override for our redesign
  console.log(`Running in ${isDevelopment ? 'development' : 'production'} mode - Force development ON for dark theme redesign`);
  
  try {
    // Always use Vite for now since we're testing our new dark theme
    console.log('Setting up Vite development middleware for dark theme testing');
    await setupVite(app, server);
  } catch (err: any) {
    console.warn('Error setting up server:', err.message || 'Unknown error');
    console.warn('Attempting to fall back to Vite middleware');
    // Fallback to Vite if there's an error
    await setupVite(app, server);
  }

  // Use PORT environment variable if available (for deployment) or default to 5000
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port} in ${app.get("env")} mode`);
  });
})();
