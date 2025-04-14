/**
 * Fallback server entry point for deployment
 * This file redirects to the correct server implementation
 */

// Check for the compiled server file
try {
  console.log('Attempting to load compiled server...');
  import('./dist/server/index.js')
    .catch(err => {
      console.error('Failed to load compiled server, trying server/index.js...', err);
      
      // Try to load the original TypeScript file using tsx
      try {
        console.log('Trying to load server/index.ts with tsx...');
        import('tsx')
          .then(() => {
            require('tsx/cjs').register();
            require('./server/index.ts');
          })
          .catch(tsxErr => {
            console.error('Failed to load tsx:', tsxErr);
            
            // Last resort: try the uncompiled JavaScript if it exists
            try {
              console.log('Trying to load server/index.js...');
              import('./server/index.js')
                .catch(lastErr => {
                  console.error('All server loading attempts failed:', lastErr);
                  console.error('Server cannot start.');
                  process.exit(1);
                });
            } catch (finalErr) {
              console.error('Fatal error:', finalErr);
              process.exit(1);
            }
          });
      } catch (tsErr) {
        console.error('TSX not available:', tsErr);
        process.exit(1);
      }
    });
} catch (err) {
  console.error('Critical server initialization error:', err);
  process.exit(1);
}