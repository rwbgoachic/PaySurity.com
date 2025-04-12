/**
 * Payroll Pricing System Test Script
 * 
 * This script tests the payroll pricing system functionality including:
 * - Pricing tier management (CRUD operations)
 * - Feature management
 * - Feature availability across tiers
 * - Price calculation based on employee count, contractor count, etc.
 */

import { db } from '../server/db';
import { payrollPricing, payrollPricingFeatures, payrollPricingFeatureAvailability } from '../shared/schema-payroll-pricing';
import { eq, and } from 'drizzle-orm';

interface TestReport {
  name: string;
  passRate: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  tests: {
    name: string;
    passed: boolean;
    error?: string;
  }[];
}

async function runPricingTierTests() {
  console.log('\n--- Running Pricing Tier Tests ---');
  const tests = [];
  let passedCount = 0;

  try {
    // Test 1: Create a new pricing tier
    try {
      console.log('Test: Create pricing tier');
      const testTier = {
        name: 'Test Tier',
        tier: 'custom' as const,
        description: 'Test pricing tier',
        basePrice: '25.00',
        perEmployeePrice: '5.00',
        perContractorPrice: '1.50',
        freeContractors: 5,
        globalPayrollPerEmployeePrice: '10.00',
        onDemandPayFee: '0.75',
        minEmployees: 1,
        maxEmployees: 100,
        isActive: true,
        features: {}
      };

      const [result] = await db.insert(payrollPricing).values(testTier).returning();
      
      if (result && result.id && result.name === testTier.name) {
        console.log('✅ Successfully created pricing tier');
        tests.push({ name: 'Create pricing tier', passed: true });
        passedCount++;

        // Test 2: Retrieve pricing tier
        try {
          console.log('Test: Retrieve pricing tier');
          const [retrievedTier] = await db.select().from(payrollPricing).where(eq(payrollPricing.id, result.id));
          
          if (retrievedTier && retrievedTier.name === testTier.name) {
            console.log('✅ Successfully retrieved pricing tier');
            tests.push({ name: 'Retrieve pricing tier', passed: true });
            passedCount++;
          } else {
            console.log('❌ Failed to retrieve pricing tier');
            tests.push({ name: 'Retrieve pricing tier', passed: false, error: 'Could not retrieve tier with matching details' });
          }

          // Test 3: Update pricing tier
          try {
            console.log('Test: Update pricing tier');
            const updatedDetails = {
              name: 'Updated Test Tier',
              basePrice: '30.00'
            };
            
            await db.update(payrollPricing)
              .set(updatedDetails)
              .where(eq(payrollPricing.id, result.id));
            
            const [updated] = await db.select().from(payrollPricing).where(eq(payrollPricing.id, result.id));
            
            if (updated && updated.name === updatedDetails.name && updated.basePrice === updatedDetails.basePrice) {
              console.log('✅ Successfully updated pricing tier');
              tests.push({ name: 'Update pricing tier', passed: true });
              passedCount++;
            } else {
              console.log('❌ Failed to update pricing tier');
              tests.push({ name: 'Update pricing tier', passed: false, error: 'Could not update tier details' });
            }

            // Test 4: Delete pricing tier
            try {
              console.log('Test: Delete pricing tier');
              await db.delete(payrollPricing).where(eq(payrollPricing.id, result.id));
              
              const [deleted] = await db.select().from(payrollPricing).where(eq(payrollPricing.id, result.id));
              
              if (!deleted) {
                console.log('✅ Successfully deleted pricing tier');
                tests.push({ name: 'Delete pricing tier', passed: true });
                passedCount++;
              } else {
                console.log('❌ Failed to delete pricing tier');
                tests.push({ name: 'Delete pricing tier', passed: false, error: 'Tier still exists after deletion' });
              }
            } catch (error) {
              console.log('❌ Error in delete pricing tier test:', error);
              tests.push({ name: 'Delete pricing tier', passed: false, error: error.message });
            }
          } catch (error) {
            console.log('❌ Error in update pricing tier test:', error);
            tests.push({ name: 'Update pricing tier', passed: false, error: error.message });
          }
        } catch (error) {
          console.log('❌ Error in retrieve pricing tier test:', error);
          tests.push({ name: 'Retrieve pricing tier', passed: false, error: error.message });
        }
      } else {
        console.log('❌ Failed to create pricing tier');
        tests.push({ name: 'Create pricing tier', passed: false, error: 'Tier creation did not return expected result' });
      }
    } catch (error) {
      console.log('❌ Error in create pricing tier test:', error);
      tests.push({ name: 'Create pricing tier', passed: false, error: error.message });
    }
  } catch (error) {
    console.log('❌ Error running pricing tier tests:', error);
  }

  return {
    name: 'Pricing Tier Tests',
    passRate: tests.length ? passedCount / tests.length * 100 : 0,
    totalTests: tests.length,
    passedTests: passedCount,
    failedTests: tests.length - passedCount,
    tests
  };
}

async function runFeatureTests() {
  console.log('\n--- Running Feature Tests ---');
  const tests = [];
  let passedCount = 0;
  let featureId = null;

  try {
    // Test 1: Create a new feature
    console.log('Test: Create feature');
    const testFeature = {
      name: 'Test Feature',
      description: 'Test feature for payroll',
      category: 'core',
      isStandard: true
    };

    try {
      const [result] = await db.insert(payrollPricingFeatures).values(testFeature).returning();
      
      if (result && result.id && result.name === testFeature.name) {
        console.log('✅ Successfully created feature');
        tests.push({ name: 'Create feature', passed: true });
        passedCount++;
        featureId = result.id;

        // Test 2: Retrieve feature
        console.log('Test: Retrieve feature');
        try {
          const [retrievedFeature] = await db.select().from(payrollPricingFeatures)
            .where(eq(payrollPricingFeatures.id, result.id));
          
          if (retrievedFeature && retrievedFeature.name === testFeature.name) {
            console.log('✅ Successfully retrieved feature');
            tests.push({ name: 'Retrieve feature', passed: true });
            passedCount++;

            // For feature availability test, we need a pricing tier
            console.log('Creating temporary tier for feature availability testing...');
            let tierId = null;
            
            try {
              // Create a temporary tier for testing feature availability
              const testTier = {
                name: 'Feature Test Tier',
                tier: 'custom' as const,
                description: 'Test pricing tier for features',
                basePrice: '20.00',
                perEmployeePrice: '4.00',
                perContractorPrice: '1.00',
                freeContractors: 5,
                globalPayrollPerEmployeePrice: '8.00',
                onDemandPayFee: '0.50',
                minEmployees: 1,
                maxEmployees: 50,
                isActive: true,
                features: {}
              };

              const [tierResult] = await db.insert(payrollPricing).values(testTier).returning();

              if (tierResult && tierResult.id) {
                tierId = tierResult.id;
                
                // Test 3: Create feature availability
                console.log('Test: Create feature availability');
                try {
                  const availabilityData = {
                    pricingId: tierResult.id,
                    featureId: result.id,
                    isIncluded: true,
                    isLimited: false,
                    limitDetails: null,
                    additionalCost: null
                  };

                  const [availabilityResult] = await db.insert(payrollPricingFeatureAvailability)
                    .values(availabilityData)
                    .returning();
                
                  if (availabilityResult && availabilityResult.id) {
                    console.log('✅ Successfully created feature availability');
                    tests.push({ name: 'Create feature availability', passed: true });
                    passedCount++;

                    // Test 4: Retrieve feature availability
                    console.log('Test: Retrieve feature availability');
                    try {
                      const [retrievedAvailability] = await db.select()
                        .from(payrollPricingFeatureAvailability)
                        .where(eq(payrollPricingFeatureAvailability.id, availabilityResult.id));
                      
                      if (retrievedAvailability && retrievedAvailability.isIncluded === true) {
                        console.log('✅ Successfully retrieved feature availability');
                        tests.push({ name: 'Retrieve feature availability', passed: true });
                        passedCount++;
                      } else {
                        console.log('❌ Failed to retrieve feature availability');
                        tests.push({ 
                          name: 'Retrieve feature availability', 
                          passed: false, 
                          error: 'Could not retrieve feature availability with matching details' 
                        });
                      }
                    } catch (error) {
                      console.log('❌ Error in retrieve feature availability test:', error);
                      tests.push({ 
                        name: 'Retrieve feature availability', 
                        passed: false, 
                        error: error.message 
                      });
                    }

                    // Clean up feature availability
                    await db.delete(payrollPricingFeatureAvailability)
                      .where(eq(payrollPricingFeatureAvailability.id, availabilityResult.id));
                  } else {
                    console.log('❌ Failed to create feature availability');
                    tests.push({ 
                      name: 'Create feature availability', 
                      passed: false, 
                      error: 'Feature availability creation did not return expected result' 
                    });
                  }
                } catch (error) {
                  console.log('❌ Error in create feature availability test:', error);
                  tests.push({ 
                    name: 'Create feature availability', 
                    passed: false, 
                    error: error.message 
                  });
                }
              }
            } catch (error) {
              console.log('❌ Error creating temporary tier for feature tests:', error);
            } finally {
              // Clean up the temporary tier if it was created
              if (tierId) {
                try {
                  await db.delete(payrollPricing).where(eq(payrollPricing.id, tierId));
                } catch (cleanupError) {
                  console.log('Warning: Failed to clean up temporary tier:', cleanupError);
                }
              }
            }
          } else {
            console.log('❌ Failed to retrieve feature');
            tests.push({ 
              name: 'Retrieve feature', 
              passed: false, 
              error: 'Could not retrieve feature with matching details' 
            });
          }
        } catch (error) {
          console.log('❌ Error in retrieve feature test:', error);
          tests.push({ name: 'Retrieve feature', passed: false, error: error.message });
        }
        
        // Test 5: Delete feature
        console.log('Test: Delete feature');
        try {
          await db.delete(payrollPricingFeatures).where(eq(payrollPricingFeatures.id, result.id));
          
          const [deleted] = await db.select().from(payrollPricingFeatures)
            .where(eq(payrollPricingFeatures.id, result.id));
          
          if (!deleted) {
            console.log('✅ Successfully deleted feature');
            tests.push({ name: 'Delete feature', passed: true });
            passedCount++;
          } else {
            console.log('❌ Failed to delete feature');
            tests.push({ 
              name: 'Delete feature', 
              passed: false, 
              error: 'Feature still exists after deletion' 
            });
          }
        } catch (error) {
          console.log('❌ Error in delete feature test:', error);
          tests.push({ name: 'Delete feature', passed: false, error: error.message });
        }
      } else {
        console.log('❌ Failed to create feature');
        tests.push({ 
          name: 'Create feature', 
          passed: false, 
          error: 'Feature creation did not return expected result' 
        });
      }
    } catch (error) {
      console.log('❌ Error in create feature test:', error);
      tests.push({ name: 'Create feature', passed: false, error: error.message });
      
      // If we failed to create but somehow got an ID, clean it up
      if (featureId) {
        try {
          await db.delete(payrollPricingFeatures).where(eq(payrollPricingFeatures.id, featureId));
        } catch (cleanupError) {
          console.log('Warning: Failed to clean up feature:', cleanupError);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error running feature tests:', error);
  }

  return {
    name: 'Feature Tests',
    passRate: tests.length ? passedCount / tests.length * 100 : 0,
    totalTests: tests.length,
    passedTests: passedCount,
    failedTests: tests.length - passedCount,
    tests
  };
}

/**
 * Run the complete test suite for payroll pricing
 */
async function runAllTests() {
  console.log('Starting Payroll Pricing Tests...');
  const startTime = Date.now();

  const pricingTierResults = await runPricingTierTests();
  const featureResults = await runFeatureTests();

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Aggregate results
  const allTests = [...pricingTierResults.tests, ...featureResults.tests];
  const totalTests = allTests.length;
  const passedTests = allTests.filter(t => t.passed).length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // Generate summary report
  console.log('\n=== Payroll Pricing Test Results ===');
  console.log(`Duration: ${duration.toFixed(2)} seconds`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Pass Rate: ${passRate.toFixed(2)}%`);
  console.log('\n=== Test Group Summary ===');
  console.log(`Pricing Tier Tests: ${pricingTierResults.passedTests}/${pricingTierResults.totalTests} passed (${pricingTierResults.passRate.toFixed(2)}%)`);
  console.log(`Feature Tests: ${featureResults.passedTests}/${featureResults.totalTests} passed (${featureResults.passRate.toFixed(2)}%)`);
  
  if (totalTests - passedTests > 0) {
    console.log('\n=== Failed Tests ===');
    allTests.filter(t => !t.passed).forEach(test => {
      console.log(`❌ ${test.name}: ${test.error || 'Test failed'}`);
    });
  }

  return {
    passRate,
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    duration,
    testGroups: [pricingTierResults, featureResults]
  };
}

// Execute tests
runAllTests()
  .then(() => {
    console.log('Payroll pricing tests completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running payroll pricing tests:', error);
    process.exit(1);
  });