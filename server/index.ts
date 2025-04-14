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

// Serve a static landing page on the root route to ensure we always have content
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paysurity - Advanced Payment Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #2563eb;
      --primary-darker: #1d4ed8;
      --primary-light: #dbeafe;
      --gray-800: #1f2937;
      --gray-700: #374151;
      --gray-500: #6b7280;
      --gray-200: #e5e7eb;
      --gray-100: #f3f4f6;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', sans-serif;
      color: var(--gray-800);
      line-height: 1.5;
      background-color: white;
    }
    header {
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      position: fixed;
      width: 100%;
      top: 0;
      z-index: 1000;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: var(--gray-700);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover {
      color: var(--primary);
    }
    .auth-buttons {
      display: flex;
      gap: 1rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-outline {
      border: 1px solid var(--primary);
      color: var(--primary);
      background-color: transparent;
    }
    .btn-primary {
      background-color: var(--primary);
      color: white;
      border: 1px solid var(--primary);
    }
    .btn-outline:hover {
      background-color: var(--primary-light);
    }
    .btn-primary:hover {
      background-color: var(--primary-darker);
    }
    .hero {
      padding: 8rem 0 4rem;
      background-color: var(--gray-100);
    }
    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }
    .hero h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
      color: var(--gray-800);
    }
    .hero p {
      font-size: 1.125rem;
      color: var(--gray-500);
      margin-bottom: 2rem;
    }
    .hero-buttons {
      display: flex;
      gap: 1rem;
    }
    .features {
      padding: 4rem 0;
    }
    .section-title {
      text-align: center;
      margin-bottom: 3rem;
    }
    .section-title h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-800);
      margin-bottom: 1rem;
    }
    .section-title p {
      font-size: 1.125rem;
      color: var(--gray-500);
      max-width: 700px;
      margin: 0 auto;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .feature-card {
      background-color: white;
      border-radius: 0.5rem;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.3s;
    }
    .feature-card:hover {
      transform: translateY(-5px);
    }
    .feature-icon {
      width: 48px;
      height: 48px;
      background-color: var(--primary-light);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .feature-icon svg {
      width: 24px;
      height: 24px;
      color: var(--primary);
    }
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--gray-800);
    }
    .feature-card p {
      color: var(--gray-500);
    }
    .solutions {
      padding: 4rem 0;
      background-color: var(--gray-100);
    }
    .solutions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .solution-card {
      background-color: white;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .solution-image {
      height: 200px;
      background-color: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .solution-content {
      padding: 1.5rem;
    }
    .solution-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--gray-800);
    }
    .solution-card p {
      color: var(--gray-500);
      margin-bottom: 1rem;
    }
    .cta {
      padding: 4rem 0;
      background-color: var(--primary);
      color: white;
    }
    .cta-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .cta h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .cta p {
      font-size: 1.125rem;
      margin-bottom: 2rem;
      max-width: 700px;
    }
    .cta-btn {
      background-color: white;
      color: var(--primary);
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 0.375rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .cta-btn:hover {
      background-color: var(--gray-100);
    }
    footer {
      background-color: var(--gray-800);
      color: white;
      padding: 4rem 0 2rem;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .footer-column h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .footer-links {
      list-style: none;
    }
    .footer-links li {
      margin-bottom: 0.5rem;
    }
    .footer-links a {
      color: var(--gray-200);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: white;
    }
    .footer-bottom {
      padding-top: 2rem;
      border-top: 1px solid var(--gray-700);
      text-align: center;
      color: var(--gray-500);
      font-size: 0.875rem;
    }
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        gap: 1rem;
      }
      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
      }
      .hero h1 {
        font-size: 2rem;
      }
      .hero-buttons {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-container">
      <a href="/" class="logo">Paysurity</a>
      <nav class="nav-links">
        <a href="/products">Products</a>
        <a href="/solutions">Solutions</a>
        <a href="/pricing">Pricing</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      <div class="auth-buttons">
        <a href="/login" class="btn btn-outline">Log In</a>
        <a href="/signup" class="btn btn-primary">Sign Up</a>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-content">
      <h1>Advanced Payment Solutions for Modern Businesses</h1>
      <p>Paysurity provides integrated payment processing, financial management, and workflow optimization tools to streamline your business operations.</p>
      <div class="hero-buttons">
        <a href="/products" class="btn btn-primary">Explore Solutions</a>
        <a href="/contact" class="btn btn-outline">Contact Sales</a>
      </div>
    </div>
  </section>

  <section class="features">
    <div class="container">
      <div class="section-title">
        <h2>Core Features</h2>
        <p>Discover how our comprehensive platform can help you manage payments, optimize workflows, and grow your business.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>Secure Payment Processing</h3>
          <p>Process payments securely with multiple gateway options, fraud protection, and PCI compliance.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3>Financial Management</h3>
          <p>Comprehensive tools for invoicing, accounting, and financial reporting to keep your business on track.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3>Workflow Optimization</h3>
          <p>Automate routine tasks, streamline approvals, and optimize business processes for maximum efficiency.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="solutions">
    <div class="container">
      <div class="section-title">
        <h2>Industry Solutions</h2>
        <p>Tailored solutions for various industries to address specific payment and workflow challenges.</p>
      </div>
      <div class="solutions-grid">
        <div class="solution-card">
          <div class="solution-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="solution-content">
            <h3>Retail & E-commerce</h3>
            <p>Omnichannel payment solutions, inventory management, and customer loyalty programs.</p>
            <a href="/solutions/retail" class="btn btn-outline">Learn More</a>
          </div>
        </div>
        <div class="solution-card">
          <div class="solution-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div class="solution-content">
            <h3>Legal Services</h3>
            <p>IOLTA trust accounting, document management, and client portal solutions for law firms.</p>
            <a href="/solutions/legal" class="btn btn-outline">Learn More</a>
          </div>
        </div>
        <div class="solution-card">
          <div class="solution-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="solution-content">
            <h3>Healthcare & Medical</h3>
            <p>HIPAA-compliant payment processing, billing management, and patient portal integration.</p>
            <a href="/solutions/healthcare" class="btn btn-outline">Learn More</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container cta-container">
      <h2>Ready to Transform Your Payment Operations?</h2>
      <p>Join thousands of businesses that trust Paysurity for their payment processing and workflow optimization needs.</p>
      <a href="/signup" class="cta-btn">Get Started Today</a>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-column">
          <h3>Products</h3>
          <ul class="footer-links">
            <li><a href="/products/payment-processing">Payment Processing</a></li>
            <li><a href="/products/digital-wallet">Digital Wallet</a></li>
            <li><a href="/products/pos-systems">POS Systems</a></li>
            <li><a href="/products/workflow-automation">Workflow Automation</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Solutions</h3>
          <ul class="footer-links">
            <li><a href="/solutions/retail">Retail & E-commerce</a></li>
            <li><a href="/solutions/legal">Legal Services</a></li>
            <li><a href="/solutions/healthcare">Healthcare</a></li>
            <li><a href="/solutions/hospitality">Hospitality</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Resources</h3>
          <ul class="footer-links">
            <li><a href="/documentation">Documentation</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/support">Support Center</a></li>
            <li><a href="/partners">Partner Program</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Company</h3>
          <ul class="footer-links">
            <li><a href="/about">About Us</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/press">Press</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} Paysurity. All rights reserved. | <a href="/terms" style="color: inherit;">Terms of Service</a> | <a href="/privacy" style="color: inherit;">Privacy Policy</a></p>
      </div>
    </div>
  </footer>
</body>
</html>
  `);
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

// Add global options handler for CORS preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(200).end();
});

// Add performance-optimized caching strategy for assets
app.use((req, res, next) => {
  // Performance headers
  res.setHeader('Vary', 'Accept-Encoding, User-Agent');
  
  // Set explicit mime types for common file extensions
  const path = req.path;
  if (path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (path.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  } else if (path.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  
  // Advanced caching strategy for different types of assets
  // Cache fonts and immutable assets for 1 year (immutable, 31536000s)
  if (/\.(woff|woff2|ttf|eot)$/.test(path)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cache images and media for 1 week (604800s) with stale-while-revalidate
  else if (/\.(png|jpg|jpeg|gif|ico|svg|webp|avif|mp4|webm)$/.test(path)) {
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  }
  // Cache CSS/JS for 1 day (86400s) with stale-while-revalidate
  else if (/\.(css|js)$/.test(path)) {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  }
  // Don't cache HTML and API endpoints
  else if (/\.html$/.test(path) || path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // Default - short cache for everything else (30 seconds) for better performance
  else {
    res.setHeader('Cache-Control', 'public, max-age=30, must-revalidate');
  }
  
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

  // Add a special route for client-side routing paths that should not be handled by the API
  app.get([
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
  
  // For deployment purposes, we'll set a safety mechanism
  // This ensures the application starts even if built files aren't found
  const forceDevMode = false; // Set to false to allow production mode for deployment
  
  // Try to detect if we're in a deployment environment where built files might not be available yet
  const isDeploymentBuild = process.env.NODE_ENV === 'production' && !forceDevMode;
  
  // Only set development mode if it's not already set to production
  if (!isDeploymentBuild) {
    process.env.NODE_ENV = 'development';
  }
  
  try {
    if (forceDevMode || app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  } catch (err: any) {
    console.warn('Error serving static files:', err.message || 'Unknown error');
    console.warn('Falling back to development mode');
    // If serveStatic fails, fall back to development mode
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
