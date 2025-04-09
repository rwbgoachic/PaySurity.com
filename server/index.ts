import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExpressBrute from "express-brute";
import csurf from "csurf";
import { createSecureHeaders } from "content-security-policy";
import { setupAuth } from "./auth";
import { generateSitemap } from "./sitemap";

const app = express();

// Enable compression for all requests
app.use(compression());

// Secure app with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "*.stripe.com"],
      connectSrc: ["'self'", "api.stripe.com", "newsapi.org", "*.paysurity.com"],
      frameSrc: ["'self'", "*.stripe.com"],
      imgSrc: ["'self'", "data:", "*.stripe.com", "*.newsapi.org", "*.paysurity.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      upgradeInsecureRequests: [],
    },
  },
  xssFilter: true,
  noSniff: true,
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

// Set up auth which will handle session creation
setupAuth(app);

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
    req.path === '/api/register'
  ) {
    return next();
  }
  
  // Apply CSRF protection to all other routes
  csrfProtection(req, res, next);
});

// Body parser middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Add performance-optimized caching strategy for assets
app.use((req, res, next) => {
  // Performance headers
  res.setHeader('Vary', 'Accept-Encoding, User-Agent');
  
  // Advanced caching strategy for different types of assets
  const path = req.path;
  
  // Improved pattern matching for better performance
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
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
