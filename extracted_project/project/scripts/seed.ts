import { faker } from '@faker-js/faker';
import { supabase } from '../src/lib/supabase';
import Decimal from 'decimal.js';

interface SeedOptions {
  users?: number;
  orgs?: number;
  transactions?: number;
}

async function generateTestData(options: SeedOptions = {}) {
  const {
    users = 10,
    orgs = 3,
    transactions = 100,
  } = options;

  try {
    console.log('Starting test data generation...');

    // Create test users
    console.log(`Creating ${users} test users...`);
    const testUsers = [];
    
    for (let i = 0; i < users; i++) {
      const email = faker.internet.email();
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
      });

      if (userError) {
        console.error(`Error creating user ${email}:`, userError);
        continue;
      }

      testUsers.push(userData.user);
      console.log(`Created user: ${email}`);
    }

    // Create test organizations
    console.log(`Creating ${orgs} test organizations...`);
    const testOrgs = [];
    
    // Get business line IDs
    const { data: businessLines } = await supabase
      .from('business_lines')
      .select('id')
      .limit(10);
      
    if (!businessLines || businessLines.length === 0) {
      throw new Error('No business lines found');
    }

    for (let i = 0; i < orgs; i++) {
      const name = faker.company.name();
      const businessLineId = businessLines[Math.floor(Math.random() * businessLines.length)].id;
      const subdomain = faker.internet.domainWord();
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          business_line_id: businessLineId,
          subdomain,
          service_data: {
            monthly_volume: faker.number.float({ min: 10000, max: 1000000, precision: 0.01 }),
            employee_count: faker.number.int({ min: 5, max: 500 }),
          },
          service_config: {
            features: {
              fraud_detection: true,
              cashflow_monitoring: true,
            }
          },
          cashflow_threshold: faker.number.float({ min: 1000, max: 5000, precision: 0.01 }),
          alert_email: faker.internet.email(),
          alert_threshold: faker.number.float({ min: 500, max: 2000, precision: 0.01 }),
        })
        .select()
        .single();

      if (orgError) {
        console.error(`Error creating organization ${name}:`, orgError);
        continue;
      }

      testOrgs.push(orgData);
      console.log(`Created organization: ${name}`);
      
      // Assign users to organizations
      const usersToAssign = faker.helpers.arrayElements(testUsers, faker.number.int({ min: 1, max: 3 }));
      
      // Get role IDs
      const { data: roles } = await supabase
        .from('roles')
        .select('id, name');
        
      if (!roles || roles.length === 0) {
        throw new Error('No roles found');
      }
      
      const ownerRole = roles.find(r => r.name === 'Owner')?.id;
      const adminRole = roles.find(r => r.name === 'Admin')?.id;
      const memberRole = roles.find(r => r.name === 'Member')?.id;
      
      for (let j = 0; j < usersToAssign.length; j++) {
        const user = usersToAssign[j];
        let roleId;
        
        if (j === 0) {
          roleId = ownerRole;
        } else if (j === 1) {
          roleId = adminRole;
        } else {
          roleId = memberRole;
        }
        
        await supabase
          .from('organization_users')
          .insert({
            user_id: user.id,
            organization_id: orgData.id,
            role_id: roleId,
          });
          
        console.log(`Assigned user ${user.email} to organization ${name} with role ${roles.find(r => r.id === roleId)?.name}`);
      }
    }

    // Create test transactions
    console.log(`Creating ${transactions} test transactions...`);
    
    const serviceTypes = ['pos', 'payroll', 'subscription', 'invoice'];
    const batchSize = 50; // Insert in batches to avoid rate limits
    
    for (let i = 0; i < transactions; i += batchSize) {
      const batch = [];
      const currentBatchSize = Math.min(batchSize, transactions - i);
      
      for (let j = 0; j < currentBatchSize; j++) {
        const org = faker.helpers.arrayElement(testOrgs);
        const amount = new Decimal(faker.number.float({ min: 10, max: 1000, precision: 0.01 })).toFixed(4);
        const serviceType = faker.helpers.arrayElement(serviceTypes);
        const createdAt = faker.date.recent({ days: 30 });
        
        batch.push({
          organization_id: org.id,
          service_type: serviceType,
          amount,
          created_at: createdAt.toISOString(),
        });
      }
      
      const { error: txError } = await supabase
        .from('transactions')
        .insert(batch);
        
      if (txError) {
        console.error('Error creating transactions batch:', txError);
      } else {
        console.log(`Created ${batch.length} transactions (${i + batch.length}/${transactions})`);
      }
    }

    // Create some anomalous transactions for testing
    console.log('Creating anomalous transactions for testing...');
    
    for (const org of testOrgs) {
      const amount = new Decimal(faker.number.float({ min: 5000, max: 10000, precision: 0.01 })).toFixed(4);
      const serviceType = faker.helpers.arrayElement(serviceTypes);
      
      const { error: anomalyError } = await supabase
        .from('transactions')
        .insert({
          organization_id: org.id,
          service_type: serviceType,
          amount,
          created_at: new Date().toISOString(),
        });
        
      if (anomalyError) {
        console.error(`Error creating anomalous transaction for ${org.name}:`, anomalyError);
      } else {
        console.log(`Created anomalous transaction for ${org.name}: $${amount}`);
      }
    }

    console.log('Test data generation complete!');
  } catch (error) {
    console.error('Error generating test data:', error);
  }
}

// Run seeder if called directly
if (process.argv[1] === import.meta.url) {
  const options: SeedOptions = {};
  
  // Parse command line arguments
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--users' && i + 1 < process.argv.length) {
      options.users = parseInt(process.argv[++i]);
    } else if (arg === '--orgs' && i + 1 < process.argv.length) {
      options.orgs = parseInt(process.argv[++i]);
    } else if (arg === '--transactions' && i + 1 < process.argv.length) {
      options.transactions = parseInt(process.argv[++i]);
    }
  }
  
  generateTestData(options).catch(console.error);
}

export { generateTestData };