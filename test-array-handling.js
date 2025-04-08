/**
 * This script tests that PostgreSQL array handling is working correctly.
 * It checks if enabledProviders array in business_delivery_settings is saved and retrieved properly.
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

async function testArrayHandling() {
  try {
    console.log('Starting array handling test...');
    
    // Connect to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Create a test business delivery settings record
    const testProviderIds = [1, 2, 3, 4];
    const insertResult = await pool.query(`
      INSERT INTO business_delivery_settings 
      (business_id, enabled_providers, default_provider, auto_assign, is_active)
      VALUES (9999, $1, 1, true, true)
      RETURNING id, enabled_providers
    `, [JSON.stringify(testProviderIds)]);
    
    console.log('Insert result:', insertResult.rows[0]);
    
    // Retrieve the record
    const id = insertResult.rows[0].id;
    const selectResult = await pool.query(`
      SELECT id, enabled_providers FROM business_delivery_settings 
      WHERE id = $1
    `, [id]);
    
    console.log('Select result:', selectResult.rows[0]);
    
    // Verify the data
    const retrieved = selectResult.rows[0].enabled_providers;
    console.log('Retrieved enabledProviders:', retrieved);
    console.log('Original enabledProviders:', testProviderIds);
    
    const success = JSON.stringify(retrieved) === JSON.stringify(testProviderIds);
    console.log('Test result:', success ? 'PASSED' : 'FAILED');
    
    // Clean up the test data
    await pool.query('DELETE FROM business_delivery_settings WHERE id = $1', [id]);
    console.log('Test data cleaned up');
    
    await pool.end();
    return success;
  } catch (error) {
    console.error('Error during array handling test:', error);
    return false;
  }
}

// Run the test
testArrayHandling()
  .then(result => {
    console.log('Test completed with result:', result);
    process.exit(result ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });