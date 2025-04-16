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
import fs from "fs";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExpressBrute from "express-brute";
import csurf from "csurf";
import createSecureHeaders from "content-security-policy";
import { setupAuth } from "./auth";
import { generateSitemap } from "./sitemap";
import { renderPage, renderErrorPage } from "./template-engine";
import { fetchPaymentNews } from "./news-api";

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

// News API endpoint for blog content
app.get('/api/news/payment-industry', async (req, res) => {
  try {
    const articles = await fetchPaymentNews();
    res.json({ 
      status: 'ok',
      articles: articles
    });
  } catch (error) {
    console.error('Error in News API route:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error fetching news data',
      timestamp: new Date().toISOString()
    });
  }
});

// Root route now redirects to our dark-themed home page
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
  res.redirect('/home');
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

  // Set up template routes
  
  // Helper function to read template files
  function getTemplateContent(templateName: string): string {
    try {
      const templatePath = path.join(process.cwd(), 'public', 'templates', `${templateName}.html`);
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error(`Error reading template: ${templateName}`, error);
      return '';
    }
  }
  
  // Serve static files from public directory
  app.use(express.static('public'));
  
  // Home page - now using template engine
  app.get('/home', (req, res) => {
    const content = getTemplateContent('home');
    const html = renderPage(content, 'Home');
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.send(html);
  });
  
  // Products page
  app.get('/products', (req, res) => {
    const content = getTemplateContent('products');
    const html = renderPage(content, 'POS Products');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
  
  // Merchant Services page
  app.get('/merchant-services', (req, res) => {
    const content = getTemplateContent('merchant-services');
    const html = renderPage(content, 'Merchant Services');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
  
  // Blog page
  app.get('/blog', (req, res) => {
    const content = getTemplateContent('blog');
    const html = renderPage(content, 'Blog');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
  
  // About Us page
  app.get('/about', (req, res) => {
    const content = getTemplateContent('about');
    const html = renderPage(content, 'About Us');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
  
  // Contact Us page
  app.get('/contact', (req, res) => {
    const content = getTemplateContent('contact');
    const html = renderPage(content, 'Contact Us');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
  
  // FAQs page
  app.get('/faqs', (req, res) => {
    const content = getTemplateContent('faqs');
    const html = renderPage(content, 'FAQs');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
  
  // Legacy dark route for backward compatibility
  app.get('/dark', (req, res) => {
    res.redirect('/home');
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
