import { Router, Express } from 'express';
import { createServer, type Server } from "http";
import path from 'path';
import { setupThemeWebsocket } from './services/theme-websocket';
import themeRoutes from './routes/theme';

// Create a simple diagnostic-only routes file
export async function registerRoutes(app: Express): Promise<Server> {
  const router = Router();
  
  // Add theme API routes
  app.use('/api', themeRoutes);
  
  // Add a simple diagnostic route
  router.get('/diagnostic', (req, res) => {
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
  
  // Add route for static HTML file test
  router.get('/static-test', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
  <head>
    <title>Static Test Page</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 2rem; }
      .container { max-width: 500px; margin: 0 auto; }
      h1 { text-align: center; }
      .box { padding: 1rem; margin: 1rem 0; border-radius: 0.5rem; }
      .connection { background-color: #e0ffe0; border: 1px solid #90ee90; }
      .css { background-color: #e0e0ff; border: 1px solid #9090ee; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Static Test Page</h1>
      <div class="box connection">
        <h2>Connection Test</h2>
        <p>If you can see this page, the web server is responding correctly.</p>
      </div>
      <div class="box css">
        <h2>CSS Test</h2>
        <p>If you can see colors and styling, CSS is working properly.</p>
      </div>
    </div>
  </body>
</html>
    `);
  });

  // Use the router
  app.use(router);
  
  // Create and return an HTTP server
  const server = createServer(app);
  app.set('host', '0.0.0.0');
  
  // Setup WebSocket for theme preview
  setupThemeWebsocket(server);
  
  return server;
}