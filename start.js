/**
 * Entry point for Replit deployment
 * This file redirects to the compiled server code
 */

// Check if we're in production or development mode
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Starting server in production mode...');
  try {
    // In production, we import the compiled JavaScript file
    import('./dist/server/index.js')
      .catch(err => {
        console.error('❌ Failed to import compiled server code:', err);
        console.log('⚠️ Trying fallback location...');
        
        // Try fallback location
        import('./server/index.js')
          .catch(err2 => {
            console.error('❌ Failed to import fallback server code:', err2);
            console.error('💥 Server failed to start');
            process.exit(1);
          });
      });
  } catch (error) {
    console.error('❌ Critical error starting server:', error);
    process.exit(1);
  }
} else {
  console.log('🚀 Starting server in development mode...');
  try {
    // In development, we use tsx to run TypeScript directly
    import('tsx')
      .then(tsx => {
        // Use the Node.js register hook to transpile TypeScript on the fly
        require('tsx/cjs').register();
        require('./server/index.ts');
      })
      .catch(err => {
        console.error('❌ Failed to import tsx:', err);
        console.error('💥 Server failed to start');
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ Critical error starting server:', error);
    process.exit(1);
  }
}