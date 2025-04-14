/**
 * Deployment helper script
 * This script helps prepare the application for deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing application for deployment...');

try {
  // Step 1: Compile TypeScript to JavaScript
  console.log('📦 Compiling TypeScript...');
  execSync('npx tsc --skipLibCheck server/index.ts --outDir dist/server --esModuleInterop true --target ES2020 --moduleResolution NodeNext --module NodeNext');
  
  // Step 2: Copy package.json to dist
  console.log('📄 Copying package.json to dist...');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Simplify package.json for deployment
  const deployPackage = {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,
    scripts: {
      start: "NODE_ENV=production node server/index.js"
    },
    dependencies: packageJson.dependencies
  };
  
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
  }
  
  fs.writeFileSync('./dist/package.json', JSON.stringify(deployPackage, null, 2));
  
  // Step 3: Create a simple index.js in the root of dist to redirect to server/index.js
  console.log('🔄 Creating server redirector...');
  fs.writeFileSync('./dist/index.js', `// Redirect to server/index.js
import './server/index.js';
`);
  
  console.log('✅ Deployment preparation complete!');
} catch (error) {
  console.error('❌ Error preparing for deployment:', error);
  process.exit(1);
}