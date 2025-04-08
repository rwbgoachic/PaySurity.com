/**
 * Delivery Service Test Suite
 * 
 * Comprehensive tests for the delivery service and its providers
 */

import {
  Address,
  OrderDetails,
  DeliveryStatus,
  DeliveryOrderDetails
} from './interfaces';
import { DeliveryService, deliveryService } from './delivery-service';
import { DoorDashConfig } from './providers/doordash-adapter';
import { InternalDeliveryAdapter } from './providers/internal-adapter';

export interface TestReport {
  name: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: Date;
  duration: number;
}

export interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  reports: TestReport[];
}

/**
 * Test the delivery service and all registered providers
 */
export async function runDeliveryServiceTests(
  doordashConfig?: DoorDashConfig
): Promise<TestSuiteResult> {
  const result: TestSuiteResult = {
    suiteName: 'DeliveryServiceTests',
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    reports: []
  };
  
  // Sample data for tests
  const samplePickupAddress: Address = {
    street: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90001',
    businessName: 'Test Restaurant',
    phone: '555-123-4567',
    latitude: 34.052235,
    longitude: -118.243683
  };
  
  const sampleDeliveryAddress: Address = {
    street: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90002',
    apartment: 'Apt 2B',
    phone: '555-987-6543',
    latitude: 34.048213,
    longitude: -118.259583
  };
  
  const sampleOrderDetails: OrderDetails = {
    totalValue: 45.99,
    items: [
      { id: 'item-1', name: 'Burger', quantity: 2, price: 12.99 },
      { id: 'item-2', name: 'Fries', quantity: 1, price: 4.99 },
      { id: 'item-3', name: 'Soda', quantity: 2, price: 2.99 }
    ],
    requiresContactlessDelivery: true
  };
  
  // Run tests
  try {
    // Test 1: Initialize delivery service
    await testServiceInitialization(result, doordashConfig);
    
    // Test 2: Test internal provider adapter
    await testInternalProviderAdapter(result);
    
    // Test 3: Test DoorDash adapter
    if (doordashConfig) {
      await testDoorDashAdapter(result, doordashConfig);
    } else {
      addReport(result, {
        name: 'DoorDashAdapterTest',
        success: false,
        message: 'Skipped - DoorDash config not provided',
        timestamp: new Date(),
        duration: 0
      });
      result.skippedTests++;
    }
    
    // Test 4: Get quotes from all providers
    await testGetQuotes(result, samplePickupAddress, sampleDeliveryAddress, sampleOrderDetails);
    
    // Test 5: Create delivery with internal provider
    await testCreateDelivery(result, samplePickupAddress, sampleDeliveryAddress, sampleOrderDetails);
  } catch (error) {
    console.error('Error during delivery service tests:', error);
    addReport(result, {
      name: 'DeliveryServiceTests',
      success: false,
      message: `Unexpected error: ${(error as Error).message}`,
      timestamp: new Date(),
      duration: 0
    });
  }
  
  // Calculate results
  result.endTime = new Date();
  result.duration = result.endTime.getTime() - result.startTime.getTime();
  result.totalTests = result.passedTests + result.failedTests + result.skippedTests;
  
  return result;
}

/**
 * Test delivery service initialization
 */
async function testServiceInitialization(result: TestSuiteResult, doordashConfig?: DoorDashConfig): Promise<void> {
  const startTime = Date.now();
  try {
    // Reset/reinitialize the delivery service
    deliveryService.initialize(doordashConfig);
    
    // Check if providers are registered
    const providers = deliveryService.listProviders();
    const expectedProviderCount = doordashConfig ? 2 : 1;
    
    if (providers.length !== expectedProviderCount) {
      throw new Error(`Expected ${expectedProviderCount} providers, but got ${providers.length}`);
    }
    
    // Internal provider should always be registered with ID 1
    const internalProvider = deliveryService.getProvider(1);
    if (!internalProvider || internalProvider.getName() !== 'Restaurant Delivery') {
      throw new Error('Internal provider not registered correctly');
    }
    
    // If DoorDash config is provided, check if it's registered with ID 2
    if (doordashConfig) {
      const doordashProvider = deliveryService.getProvider(2);
      if (!doordashProvider || doordashProvider.getName() !== 'DoorDash Delivery') {
        throw new Error('DoorDash provider not registered correctly');
      }
    }
    
    addReport(result, {
      name: 'ServiceInitializationTest',
      success: true,
      message: `Successfully initialized delivery service with ${providers.length} providers`,
      details: { providers },
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.passedTests++;
  } catch (error) {
    addReport(result, {
      name: 'ServiceInitializationTest',
      success: false,
      message: `Failed to initialize delivery service: ${(error as Error).message}`,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.failedTests++;
  }
}

/**
 * Test internal provider adapter
 */
async function testInternalProviderAdapter(result: TestSuiteResult): Promise<void> {
  const startTime = Date.now();
  try {
    const internalAdapter = new InternalDeliveryAdapter();
    
    // Check basic provider information
    if (internalAdapter.getName() !== 'Restaurant Delivery') {
      throw new Error('Incorrect provider name');
    }
    
    if (internalAdapter.getProviderType() !== 'internal') {
      throw new Error('Incorrect provider type');
    }
    
    addReport(result, {
      name: 'InternalProviderBasicTest',
      success: true,
      message: 'Internal provider adapter basic tests passed',
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.passedTests++;
  } catch (error) {
    addReport(result, {
      name: 'InternalProviderBasicTest',
      success: false,
      message: `Internal provider test failed: ${(error as Error).message}`,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.failedTests++;
  }
}

/**
 * Test DoorDash adapter
 */
async function testDoorDashAdapter(result: TestSuiteResult, config: DoorDashConfig): Promise<void> {
  const startTime = Date.now();
  try {
    // This is a mock test since we can't make actual API calls without valid credentials
    
    // First, check that the DoorDash adapter can be initialized
    const provider = deliveryService.getProvider(2);
    if (!provider) {
      throw new Error('DoorDash provider not found');
    }
    
    if (provider.getName() !== 'DoorDash Delivery') {
      throw new Error(`Expected 'DoorDash Delivery' provider name, got '${provider.getName()}'`);
    }
    
    if (provider.getProviderType() !== 'external') {
      throw new Error(`Expected 'external' provider type, got '${provider.getProviderType()}'`);
    }
    
    addReport(result, {
      name: 'DoorDashAdapterTest',
      success: true,
      message: 'DoorDash adapter initialized correctly',
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.passedTests++;
  } catch (error) {
    addReport(result, {
      name: 'DoorDashAdapterTest',
      success: false,
      message: `DoorDash adapter test failed: ${(error as Error).message}`,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.failedTests++;
  }
}

/**
 * Test getting quotes from all providers
 */
async function testGetQuotes(
  result: TestSuiteResult,
  pickup: Address,
  delivery: Address,
  orderDetails: OrderDetails
): Promise<void> {
  const startTime = Date.now();
  try {
    // Get quotes from all providers
    const quotes = await deliveryService.getDeliveryQuotes(pickup, delivery, orderDetails);
    
    // Check if we got at least one quote
    if (!quotes || quotes.length === 0) {
      throw new Error('No delivery quotes returned');
    }
    
    // Verify quote structure for each provider
    quotes.forEach((quote, index) => {
      if (!quote.providerName) {
        throw new Error(`Quote ${index} missing provider name`);
      }
      
      if (typeof quote.fee !== 'number') {
        throw new Error(`Quote ${index} has invalid fee`);
      }
      
      if (!(quote.estimatedPickupTime instanceof Date)) {
        throw new Error(`Quote ${index} has invalid pickup time`);
      }
      
      if (!(quote.estimatedDeliveryTime instanceof Date)) {
        throw new Error(`Quote ${index} has invalid delivery time`);
      }
    });
    
    addReport(result, {
      name: 'GetQuotesTest',
      success: true,
      message: `Successfully retrieved ${quotes.length} delivery quotes`,
      details: { quotes },
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.passedTests++;
  } catch (error) {
    addReport(result, {
      name: 'GetQuotesTest',
      success: false,
      message: `Failed to get delivery quotes: ${(error as Error).message}`,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.failedTests++;
  }
}

/**
 * Test creating a delivery with the internal provider
 */
async function testCreateDelivery(
  result: TestSuiteResult,
  pickup: Address,
  delivery: Address,
  orderDetails: OrderDetails
): Promise<void> {
  const startTime = Date.now();
  try {
    // First get quotes
    const quotes = await deliveryService.getDeliveryQuotes(pickup, delivery, orderDetails);
    
    // Find the internal provider quote (should be provider ID 1)
    const internalQuote = quotes.find(q => q.providerId === 1);
    if (!internalQuote) {
      throw new Error('Internal provider quote not found');
    }
    
    // Create delivery order details
    const deliveryOrderDetails: DeliveryOrderDetails = {
      providerId: 1, // Internal provider
      businessId: 123,
      orderId: 'test-order-123',
      orderDetails,
      businessAddress: pickup,
      customerAddress: delivery,
      customerName: 'Test Customer',
      customerPhone: '555-987-6543',
      specialInstructions: 'Please knock on the door',
      providerQuoteId: internalQuote.providerData?.quoteId
    };
    
    // Create the delivery
    const deliveryResult = await deliveryService.createDelivery(deliveryOrderDetails);
    
    // Verify the result
    if (!deliveryResult.externalOrderId) {
      throw new Error('No external order ID returned');
    }
    
    if (!deliveryResult.status) {
      throw new Error('No status returned');
    }
    
    if (!(deliveryResult.estimatedPickupTime instanceof Date)) {
      throw new Error('Invalid pickup time');
    }
    
    if (!(deliveryResult.estimatedDeliveryTime instanceof Date)) {
      throw new Error('Invalid delivery time');
    }
    
    addReport(result, {
      name: 'CreateDeliveryTest',
      success: true,
      message: 'Successfully created delivery',
      details: { deliveryResult },
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.passedTests++;
    
    // Test getting status
    await testGetDeliveryStatus(result, deliveryResult.externalOrderId);
  } catch (error) {
    addReport(result, {
      name: 'CreateDeliveryTest',
      success: false,
      message: `Failed to create delivery: ${(error as Error).message}`,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.failedTests++;
  }
}

/**
 * Test getting the status of a delivery
 */
async function testGetDeliveryStatus(
  result: TestSuiteResult,
  externalOrderId: string
): Promise<void> {
  const startTime = Date.now();
  try {
    // For internal deliveries, provider ID is 1
    const status = await deliveryService.getDeliveryStatus(1, externalOrderId);
    
    // Check if the status is valid
    const validStatuses: DeliveryStatus[] = [
      'pending', 'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    addReport(result, {
      name: 'GetDeliveryStatusTest',
      success: true,
      message: `Successfully retrieved delivery status: ${status}`,
      details: { externalOrderId, status },
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.passedTests++;
  } catch (error) {
    addReport(result, {
      name: 'GetDeliveryStatusTest',
      success: false,
      message: `Failed to get delivery status: ${(error as Error).message}`,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    result.failedTests++;
  }
}

/**
 * Helper to add a test report to the results
 */
function addReport(result: TestSuiteResult, report: TestReport): void {
  result.reports.push(report);
  console.log(`[${report.success ? 'PASS' : 'FAIL'}] ${report.name}: ${report.message}`);
}

/**
 * Run all tests and return the results
 */
export async function testDeliveryService(doordashConfig?: DoorDashConfig): Promise<TestSuiteResult> {
  console.log('Starting delivery service tests...');
  const results = await runDeliveryServiceTests(doordashConfig);
  
  console.log('\nDelivery Service Test Summary:');
  console.log(`Total tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests}`);
  console.log(`Failed: ${results.failedTests}`);
  console.log(`Skipped: ${results.skippedTests}`);
  console.log(`Duration: ${results.duration}ms`);
  
  return results;
}

// Run the tests if this file is executed directly
if (require.main === module) {
  // Create minimal DoorDash config for testing - replace with actual values for real tests
  const config: DoorDashConfig = {
    developerId: 'your-developer-id',
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret'
  };
  
  testDeliveryService(config).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}