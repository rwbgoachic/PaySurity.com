/**
 * Simple start file to launch the server with proper environment
 * This provides a consistent entry point regardless of environment
 */

// Set production mode by default for deployments
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Try to load the server module
import('./server.js').catch(err => {
  console.error('Failed to load server:', err);
  process.exit(1);
});