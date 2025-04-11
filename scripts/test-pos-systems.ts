/**
 * POS Systems Testing Script
 * 
 * This script tests the industry-specific POS systems including:
 * - Restaurant POS (BistroBeast)
 * - Retail POS (ECom Ready)
 * - Legal POS (LegalEdge)
 * - Healthcare POS (MedPay)
 * - Hospitality POS (HotelPay)
 */

import { posSystemsTestService } from '../server/services/testing/test-pos-systems';
import { TestReport } from '../server/services/testing/test-delivery-service';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db';

async function runPOSSystemsTests() {
  console.log('📋 PaySurity.com POS Systems Tests');
  console.log('================================');
  console.log('Starting POS systems tests...\n');
  
  try {
    // Run POS systems tests
    const startTime = Date.now();
    const report: TestReport = await posSystemsTestService.runComprehensiveTests();
    const duration = Date.now() - startTime;
    
    // Calculate statistics
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    report.testGroups.forEach(group => {
      totalTests += group.tests.length;
      passedTests += group.tests.filter(test => test.passed).length;
      failedTests += group.tests.filter(test => !test.passed).length;
    });
    
    // Save report to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportDir = path.join(__dirname, '../test-reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, `pos-test-report-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Log summary
    console.log('\n📊 Test Results Summary');
    console.log('=====================');
    console.log(`🕒 Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📝 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📋 Overall result: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // List failed tests
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      console.log('==============');
      
      report.testGroups.forEach(group => {
        const groupFailedTests = group.tests.filter(test => !test.passed);
        if (groupFailedTests.length > 0) {
          console.log(`\n📝 ${group.name}:`);
          groupFailedTests.forEach(test => {
            console.log(`  ❌ ${test.name}: ${test.result}`);
            console.log(`     Expected: ${test.expected}`);
            console.log(`     Actual: ${test.actual}`);
          });
        }
      });
    }
    
    return report;
  } catch (error) {
    console.error('Error running POS systems tests:', error);
    throw error;
  }
}

/**
 * Prepare test data for POS systems tests
 */
async function preparePOSTestData() {
  console.log('\n🔧 Preparing test data for POS systems tests...');
  
  try {
    // Create test merchant if needed
    await prepareMerchantTestData();
    
    // Check each POS system and prepare test data
    await prepareRestaurantPOSTestData();
    await prepareRetailPOSTestData();
    
    console.log('  ✅ POS test data preparation complete');
  } catch (error) {
    console.error('  ❌ Error preparing POS test data:', error);
    throw error;
  }
}

/**
 * Prepare merchant test data
 */
async function prepareMerchantTestData() {
  console.log('  🏪 Checking test merchant data...');
  
  try {
    // Check if test merchant exists
    const merchantCheckQuery = `
      SELECT EXISTS (
        SELECT 1 FROM merchants 
        WHERE user_id = 9999
      );
    `;
    
    const merchantCheckResult = await db.execute(merchantCheckQuery);
    const merchantExists = merchantCheckResult.rows[0]?.exists === true;
    
    if (!merchantExists) {
      console.log('  🏪 Creating test merchant...');
      
      // Create test merchant
      const createMerchantQuery = `
        INSERT INTO merchants (
          user_id,
          status,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip,
          country
        )
        VALUES (
          9999,
          'active',
          'Test Merchant',
          'test@merchant.com',
          '555-555-5555',
          '123 Test St',
          'Test City',
          'TS',
          '12345',
          'USA'
        )
        RETURNING id;
      `;
      
      try {
        const merchantResult = await db.execute(createMerchantQuery);
        const merchantId = merchantResult.rows[0]?.id;
        console.log(`  ✅ Created test merchant with ID: ${merchantId}`);
        return merchantId;
      } catch (error) {
        // Table might not exist yet
        console.log(`  ⚠️ Could not create test merchant: ${(error as Error).message}`);
        if ((error as Error).message.includes('relation "merchants" does not exist')) {
          // Create merchants table
          const createMerchantsTableQuery = `
            CREATE TABLE merchants (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT,
              address TEXT,
              city TEXT,
              state TEXT,
              zip TEXT,
              country TEXT DEFAULT 'USA',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `;
          
          await db.execute(createMerchantsTableQuery);
          console.log('  ✅ Created merchants table');
          
          // Try creating the merchant again
          const retryMerchantResult = await db.execute(createMerchantQuery);
          const merchantId = retryMerchantResult.rows[0]?.id;
          console.log(`  ✅ Created test merchant with ID: ${merchantId}`);
          return merchantId;
        }
        
        throw error;
      }
    } else {
      console.log('  ✅ Test merchant already exists');
      // Get the merchant ID
      const merchantIdQuery = `
        SELECT id FROM merchants 
        WHERE user_id = 9999
        LIMIT 1;
      `;
      
      const merchantResult = await db.execute(merchantIdQuery);
      const merchantId = merchantResult.rows[0]?.id;
      console.log(`  ✅ Using existing merchant with ID: ${merchantId}`);
      return merchantId;
    }
  } catch (error) {
    console.error('  ❌ Error preparing merchant data:', error);
    throw error;
  }
}

/**
 * Prepare restaurant POS test data
 */
async function prepareRestaurantPOSTestData() {
  console.log('  🍽️ Preparing BistroBeast (Restaurant POS) test data...');
  
  try {
    // Check if restaurant tables table exists
    const tablesCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_tables'
      );
    `;
    
    const tablesCheckResult = await db.execute(tablesCheckQuery);
    const tablesTableExists = tablesCheckResult.rows[0]?.exists === true;
    
    if (tablesTableExists) {
      console.log('  ✅ Restaurant tables table exists');
      
      // Check if test restaurant area exists
      try {
        const areaCheckQuery = `
          SELECT EXISTS (
            SELECT FROM restaurant_areas 
            WHERE merchant_id = 9999
          );
        `;
        
        const areaCheckResult = await db.execute(areaCheckQuery);
        const areaExists = areaCheckResult.rows[0]?.exists === true;
        
        if (!areaExists) {
          console.log('  🏠 Creating test restaurant area...');
          
          const createAreaQuery = `
            INSERT INTO restaurant_areas (
              merchant_id,
              name,
              description
            )
            VALUES (
              9999,
              'Main Dining',
              'Main dining area'
            )
            RETURNING id;
          `;
          
          const areaResult = await db.execute(createAreaQuery);
          const areaId = areaResult.rows[0]?.id;
          console.log(`  ✅ Created test restaurant area with ID: ${areaId}`);
          
          // Create test table
          console.log('  🪑 Creating test restaurant table...');
          
          const createTableQuery = `
            INSERT INTO restaurant_tables (
              merchant_id,
              area_id,
              table_number,
              seats,
              status
            )
            VALUES (
              9999,
              ${areaId},
              'T1',
              4,
              'available'
            )
            RETURNING id;
          `;
          
          const tableResult = await db.execute(createTableQuery);
          const tableId = tableResult.rows[0]?.id;
          console.log(`  ✅ Created test restaurant table with ID: ${tableId}`);
        } else {
          console.log('  ✅ Test restaurant area already exists');
        }
      } catch (error) {
        console.log(`  ⚠️ Restaurant area operations error: ${(error as Error).message}`);
      }
    } else {
      console.log('  ℹ️ Restaurant tables table does not exist yet, no test data created');
    }
  } catch (error) {
    console.error('  ❌ Error preparing restaurant POS data:', error);
  }
}

/**
 * Prepare retail POS test data
 */
async function prepareRetailPOSTestData() {
  console.log('  🛒 Preparing ECom Ready (Retail POS) test data...');
  
  try {
    // Check if retail products table exists
    const productsCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'retail_products'
      );
    `;
    
    const productsCheckResult = await db.execute(productsCheckQuery);
    const productsTableExists = productsCheckResult.rows[0]?.exists === true;
    
    if (productsTableExists) {
      console.log('  ✅ Retail products table exists');
      
      // Check if test product exists
      try {
        const productCheckQuery = `
          SELECT EXISTS (
            SELECT FROM retail_products 
            WHERE merchant_id = 9999
          );
        `;
        
        const productCheckResult = await db.execute(productCheckQuery);
        const productExists = productCheckResult.rows[0]?.exists === true;
        
        if (!productExists) {
          console.log('  📦 Creating test retail product...');
          
          const createProductQuery = `
            INSERT INTO retail_products (
              merchant_id,
              sku,
              barcode,
              name,
              description,
              retail_price,
              cost_price,
              stock_quantity,
              is_active
            )
            VALUES (
              9999,
              'TEST-SKU-001',
              '123456789012',
              'Test Product',
              'A test product for ECom Ready',
              29.99,
              15.00,
              100,
              true
            )
            RETURNING id;
          `;
          
          const productResult = await db.execute(createProductQuery);
          const productId = productResult.rows[0]?.id;
          console.log(`  ✅ Created test retail product with ID: ${productId}`);
        } else {
          console.log('  ✅ Test retail product already exists');
        }
      } catch (error) {
        console.log(`  ⚠️ Retail product operations error: ${(error as Error).message}`);
      }
    } else {
      console.log('  ℹ️ Retail products table does not exist yet, no test data created');
    }
  } catch (error) {
    console.error('  ❌ Error preparing retail POS data:', error);
  }
}

// Run tests
const runTests = async () => {
  try {
    await preparePOSTestData();
    await runPOSSystemsTests();
    console.log('\nPOS systems test run complete.');
    process.exit(0);
  } catch (error) {
    console.error('POS systems test run failed:', error);
    process.exit(1);
  }
};

// Run if this is the main module
runTests();

// Export functions
export { runPOSSystemsTests, preparePOSTestData };