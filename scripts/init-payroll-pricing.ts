/**
 * Initialize Payroll Pricing Tiers
 * 
 * This script sets up default pricing tiers for the payroll system including
 * standard features and availability.
 * 
 * Usage: npx tsx scripts/init-payroll-pricing.ts
 */

import { db } from '../server/db';
import { 
  payrollPricing, 
  payrollPricingFeatures, 
  payrollPricingFeatureAvailability,
  productTierEnum
} from '../shared/schema-payroll-pricing';

// Standard pricing tiers
const standardTiers = [
  {
    tier: 'starter' as typeof productTierEnum.enumValues[number],
    name: 'Basic Payroll',
    description: 'Essential payroll processing for small businesses',
    basePrice: '15.00',
    perEmployeePrice: '4.00',
    perContractorPrice: '2.00',
    freeContractors: 5,
    minEmployees: 1,
    maxEmployees: 25,
    isActive: true,
    features: { includedFeatures: ['basic_payroll', 'direct_deposit', 'tax_filing'] }
  },
  {
    tier: 'professional' as typeof productTierEnum.enumValues[number],
    name: 'Professional Payroll',
    description: 'Comprehensive payroll solution for growing businesses',
    basePrice: '35.00',
    perEmployeePrice: '3.50',
    perContractorPrice: '1.50',
    freeContractors: 10,
    globalPayrollPerEmployeePrice: '10.00',
    minEmployees: 10,
    maxEmployees: 100,
    isActive: true,
    features: { 
      includedFeatures: [
        'basic_payroll', 
        'direct_deposit', 
        'tax_filing', 
        'time_tracking', 
        'leave_management', 
        'employee_portal'
      ] 
    }
  },
  {
    tier: 'enterprise' as typeof productTierEnum.enumValues[number],
    name: 'Enterprise Payroll',
    description: 'Complete payroll and HR management for large organizations',
    basePrice: '75.00',
    perEmployeePrice: '3.00',
    perContractorPrice: '1.00',
    freeContractors: 20,
    globalPayrollPerEmployeePrice: '8.00',
    onDemandPayFee: '1.00',
    minEmployees: 50,
    isActive: true,
    features: { 
      includedFeatures: [
        'basic_payroll', 
        'direct_deposit', 
        'tax_filing', 
        'time_tracking', 
        'leave_management', 
        'employee_portal', 
        'global_payroll', 
        'on_demand_pay', 
        'hr_management', 
        'benefits_administration'
      ] 
    }
  }
];

// Standard features
const standardFeatures = [
  {
    name: 'Basic Payroll Processing',
    description: 'Calculate wages, taxes, and deductions',
    category: 'core',
    isStandard: true
  },
  {
    name: 'Direct Deposit',
    description: 'Automatic payroll deposits to employee bank accounts',
    category: 'payments',
    isStandard: true
  },
  {
    name: 'Tax Filing',
    description: 'Automatic tax calculations and filing',
    category: 'compliance',
    isStandard: true
  },
  {
    name: 'Time Tracking',
    description: 'Track employee hours and overtime',
    category: 'core',
    isStandard: false
  },
  {
    name: 'Leave Management',
    description: 'Track and manage PTO, sick leave, and vacation time',
    category: 'hr',
    isStandard: false
  },
  {
    name: 'Employee Portal',
    description: 'Self-service portal for employees to view paystubs and tax forms',
    category: 'hr',
    isStandard: false
  },
  {
    name: 'Global Payroll',
    description: 'Process payroll for international employees',
    category: 'international',
    isStandard: false
  },
  {
    name: 'On-Demand Pay',
    description: 'Allow employees to access earned wages before payday',
    category: 'advanced',
    isStandard: false
  },
  {
    name: 'HR Management',
    description: 'Complete HR management tools and reporting',
    category: 'hr',
    isStandard: false
  },
  {
    name: 'Benefits Administration',
    description: 'Manage and administer employee benefits',
    category: 'hr',
    isStandard: false
  },
  {
    name: 'Tax Form Generation',
    description: 'Generate W-2s, 1099s, and other tax forms',
    category: 'compliance',
    isStandard: true
  },
  {
    name: 'Multi-State Tax Filing',
    description: 'Support for multi-state tax compliance',
    category: 'compliance',
    isStandard: false
  }
];

// Feature mapping to pricing tiers
const featureMapping = {
  'starter': [
    { featureName: 'Basic Payroll Processing', isIncluded: true },
    { featureName: 'Direct Deposit', isIncluded: true },
    { featureName: 'Tax Filing', isIncluded: true },
    { featureName: 'Tax Form Generation', isIncluded: true },
    { featureName: 'Time Tracking', isIncluded: false, additionalCost: '5.00' },
    { featureName: 'Leave Management', isIncluded: false, additionalCost: '3.00' },
    { featureName: 'Employee Portal', isIncluded: false, additionalCost: '4.00' },
    { featureName: 'Global Payroll', isIncluded: false },
    { featureName: 'On-Demand Pay', isIncluded: false },
    { featureName: 'HR Management', isIncluded: false },
    { featureName: 'Benefits Administration', isIncluded: false },
    { featureName: 'Multi-State Tax Filing', isIncluded: false, additionalCost: '10.00' }
  ],
  'professional': [
    { featureName: 'Basic Payroll Processing', isIncluded: true },
    { featureName: 'Direct Deposit', isIncluded: true },
    { featureName: 'Tax Filing', isIncluded: true },
    { featureName: 'Tax Form Generation', isIncluded: true },
    { featureName: 'Time Tracking', isIncluded: true },
    { featureName: 'Leave Management', isIncluded: true },
    { featureName: 'Employee Portal', isIncluded: true },
    { featureName: 'Global Payroll', isIncluded: false, additionalCost: '10.00' },
    { featureName: 'On-Demand Pay', isIncluded: false, additionalCost: '2.00' },
    { featureName: 'HR Management', isIncluded: false, additionalCost: '15.00' },
    { featureName: 'Benefits Administration', isIncluded: false, additionalCost: '10.00' },
    { featureName: 'Multi-State Tax Filing', isIncluded: true }
  ],
  'enterprise': [
    { featureName: 'Basic Payroll Processing', isIncluded: true },
    { featureName: 'Direct Deposit', isIncluded: true },
    { featureName: 'Tax Filing', isIncluded: true },
    { featureName: 'Tax Form Generation', isIncluded: true },
    { featureName: 'Time Tracking', isIncluded: true },
    { featureName: 'Leave Management', isIncluded: true },
    { featureName: 'Employee Portal', isIncluded: true },
    { featureName: 'Global Payroll', isIncluded: true },
    { featureName: 'On-Demand Pay', isIncluded: true },
    { featureName: 'HR Management', isIncluded: true },
    { featureName: 'Benefits Administration', isIncluded: true },
    { featureName: 'Multi-State Tax Filing', isIncluded: true }
  ]
};

/**
 * Initialize standard pricing tiers
 */
async function initializeStandardPricingTiers() {
  console.log('Initializing standard pricing tiers...');
  
  // Check if pricing tiers already exist
  const existingTiers = await db.select().from(payrollPricing);
  if (existingTiers.length > 0) {
    console.log(`Found ${existingTiers.length} existing pricing tiers.`);
    
    // Ask for confirmation before continuing
    const answer = await askQuestion('Pricing tiers already exist. Do you want to continue and potentially create duplicates? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborting initialization.');
      process.exit(0);
    }
  }
  
  // Insert pricing tiers
  for (const tier of standardTiers) {
    const [insertedTier] = await db.insert(payrollPricing).values(tier).returning();
    console.log(`Created pricing tier: ${insertedTier.name} (ID: ${insertedTier.id})`);
  }
  
  console.log('Standard pricing tiers initialized successfully.');
}

/**
 * Initialize standard features
 */
async function initializeStandardFeatures() {
  console.log('Initializing standard features...');
  
  // Check if features already exist
  const existingFeatures = await db.select().from(payrollPricingFeatures);
  if (existingFeatures.length > 0) {
    console.log(`Found ${existingFeatures.length} existing features.`);
    
    // Ask for confirmation before continuing
    const answer = await askQuestion('Features already exist. Do you want to continue and potentially create duplicates? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborting initialization.');
      process.exit(0);
    }
  }
  
  // Insert features
  const insertedFeatures = [];
  for (const feature of standardFeatures) {
    const [insertedFeature] = await db.insert(payrollPricingFeatures).values(feature).returning();
    console.log(`Created feature: ${insertedFeature.name} (ID: ${insertedFeature.id})`);
    insertedFeatures.push(insertedFeature);
  }
  
  console.log('Standard features initialized successfully.');
  return insertedFeatures;
}

/**
 * Create feature availability mappings
 */
async function createFeatureAvailability() {
  console.log('Creating feature availability mappings...');
  
  // Get all pricing tiers
  const pricingTiers = await db.select().from(payrollPricing);
  
  // Get all features
  const features = await db.select().from(payrollPricingFeatures);
  
  // Create mappings
  for (const tier of pricingTiers) {
    const tierMappings = featureMapping[tier.tier as keyof typeof featureMapping];
    if (!tierMappings) continue;
    
    console.log(`Creating feature mappings for ${tier.name}...`);
    
    for (const mapping of tierMappings) {
      const feature = features.find(f => f.name === mapping.featureName);
      if (!feature) {
        console.warn(`Feature "${mapping.featureName}" not found, skipping.`);
        continue;
      }
      
      const [availability] = await db.insert(payrollPricingFeatureAvailability).values({
        pricingId: tier.id,
        featureId: feature.id,
        isIncluded: mapping.isIncluded,
        additionalCost: mapping.additionalCost,
        isLimited: false
      }).returning();
      
      console.log(`  - ${feature.name}: ${mapping.isIncluded ? 'Included' : 'Not included'}${mapping.additionalCost ? ` (Additional cost: $${mapping.additionalCost})` : ''}`);
    }
  }
  
  console.log('Feature availability mappings created successfully.');
}

/**
 * Helper function to ask a question and get user input
 */
function askQuestion(query: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => readline.question(query, (answer: string) => {
    readline.close();
    resolve(answer);
  }));
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('=== Initializing Payroll Pricing System ===');
    
    await initializeStandardPricingTiers();
    await initializeStandardFeatures();
    await createFeatureAvailability();
    
    console.log('Payroll pricing system initialized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing payroll pricing system:', error);
    process.exit(1);
  }
}

// Run the main function
main();