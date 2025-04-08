/**
 * Test module for delivery service
 * 
 * This file contains test functions to validate the delivery service and adapters
 */

import { 
  DeliveryProviderAdapter,
  Address,
  OrderDetails,
  DeliveryOrderDetails
} from './interfaces';
import { InternalDeliveryAdapter } from './providers/internal-adapter';
import { DoorDashAdapter } from './providers/doordash-adapter';
import { deliveryService } from './delivery-service';

/**
 * Sample data for testing
 */
const testRestaurantAddress: Address = {
  street: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  businessName: 'Test Restaurant',
  phone: '415-555-1234',
  latitude: 37.7749,
  longitude: -122.4194
};

const testCustomerAddress: Address = {
  street: '456 Market Street',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94103',
  apartment: 'Apt 2B',
  phone: '415-555-5678',
  instructions: 'Please leave at the door',
  latitude: 37.7899,
  longitude: -122.4021
};

const testOrderDetails: OrderDetails = {
  orderId: 12345,
  items: [
    { id: 1, name: 'Cheeseburger', quantity: 1, price: 9.99 },
    { id: 2, name: 'French Fries', quantity: 1, price: 3.99 },
    { id: 3, name: 'Soda', quantity: 2, price: 1.99 }
  ],
  totalValue: 17.96,
  currency: 'USD',
  specialInstructions: 'Extra ketchup please'
};

/**
 * Test the DoorDash adapter
 */
async function testDoorDashAdapter() {
  console.log('Testing DoorDash adapter...');
  
  try {
    // Initialize with test credentials
    // In a real environment, these would be loaded from environment variables or a secure vault
    const doorDashAdapter = new DoorDashAdapter({
      apiKey: 'test_key',
      apiSecret: 'test_secret'
    });
    
    console.log('Getting delivery quote...');
    // This will likely fail with test credentials, but it's useful to verify the code path
    try {
      const quote = await doorDashAdapter.getQuote(
        testRestaurantAddress,
        testCustomerAddress,
        testOrderDetails
      );
      console.log('Quote received:', quote);
    } catch (error) {
      console.log('Quote error (expected with test credentials):', error.message);
    }
    
    // Test webhook parsing with mock data
    const mockWebhookData = {
      event_type: 'delivery.delivered',
      external_delivery_id: 'dd_1234567890',
      status: 'delivered',
      event_timestamp: new Date().toISOString(),
      dasher: {
        dasher_id: 'dasher123',
        first_name: 'John',
        phone_number: '555-123-4567',
        location: {
          lat: 37.7855,
          lng: -122.4090
        }
      }
    };
    
    console.log('Testing webhook data parsing...');
    const parsedWebhook = await doorDashAdapter.parseWebhookData(
      mockWebhookData,
      { 'doordash-signature': 't=1234567890,v1=abcdef123456' }
    );
    
    console.log('Parsed webhook:', parsedWebhook);
    
    // Verify the mapping of DoorDash statuses
    console.log('Verifying status mapping:');
    const statuses = ['created', 'accepted', 'picked_up', 'delivered', 'canceled'];
    for (const status of statuses) {
      const mappedStatus = await doorDashAdapter.getDeliveryStatus('test-' + status);
      console.log(`DoorDash status '${status}' mapped to '${mappedStatus}'`);
    }
    
    console.log('DoorDash adapter tests completed');
  } catch (error) {
    console.error('Error testing DoorDash adapter:', error);
  }
}

/**
 * Test the Internal delivery adapter
 */
async function testInternalAdapter() {
  console.log('Testing Internal delivery adapter...');
  
  try {
    const internalAdapter = new InternalDeliveryAdapter();
    
    console.log('Getting delivery quote...');
    const quote = await internalAdapter.getQuote(
      testRestaurantAddress,
      testCustomerAddress,
      testOrderDetails
    );
    
    console.log('Quote received:', quote);
    
    // Create a test delivery
    const mockDeliveryDetails: DeliveryOrderDetails = {
      orderId: 12345,
      businessId: 1,
      providerId: 1,
      customerName: 'Test Customer',
      customerPhone: '415-555-5678',
      customerAddress: testCustomerAddress,
      businessAddress: testRestaurantAddress,
      orderDetails: testOrderDetails,
      providerFee: '5.99',
      platformFee: '1.50',
      customerFee: '7.49',
      specialInstructions: 'Please deliver ASAP'
    };
    
    console.log('Creating test delivery...');
    try {
      const delivery = await internalAdapter.createDelivery(mockDeliveryDetails);
      console.log('Delivery created:', delivery);
      
      console.log('Testing status updates...');
      const statusUpdates = [
        'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered'
      ];
      
      for (const status of statusUpdates) {
        console.log(`Updating status to '${status}'...`);
        // Update the status via the method that would be called from the web app
        await internalAdapter.updateDeliveryStatus(delivery.externalOrderId, status as any);
        
        // Verify the status is updated
        const currentStatus = await internalAdapter.getDeliveryStatus(delivery.externalOrderId);
        console.log(`Status updated to '${currentStatus}'`);
      }
    } catch (error) {
      console.log('Error in delivery creation/updates:', error.message);
    }
    
    console.log('Internal adapter tests completed');
  } catch (error) {
    console.error('Error testing Internal adapter:', error);
  }
}

/**
 * Test the delivery service coordinator
 */
async function testDeliveryService() {
  console.log('Testing Delivery Service coordinator...');
  
  try {
    // Initialize the service (will load providers from DB in production)
    await deliveryService.initialize();
    
    console.log('Getting quotes from all providers...');
    try {
      const quotes = await deliveryService.getDeliveryQuotes(
        testRestaurantAddress,
        testCustomerAddress,
        testOrderDetails
      );
      
      console.log(`Received ${quotes.length} quotes`);
      quotes.forEach((quote, index) => {
        console.log(`Quote ${index + 1}: ${quote.providerName} - $${quote.customerFee} (${quote.valid ? 'valid' : 'invalid'})`);
      });
    } catch (error) {
      console.log('Error getting quotes:', error.message);
    }
    
    console.log('Delivery Service coordinator tests completed');
  } catch (error) {
    console.error('Error testing Delivery Service coordinator:', error);
  }
}

/**
 * Run all tests
 */
export async function runDeliveryTests() {
  console.log('=== STARTING DELIVERY SERVICE TESTS ===');
  
  await testInternalAdapter();
  console.log('\n');
  
  await testDoorDashAdapter();
  console.log('\n');
  
  await testDeliveryService();
  
  console.log('=== DELIVERY SERVICE TESTS COMPLETED ===');
}

// Only run tests when called directly
if (require.main === module) {
  runDeliveryTests()
    .then(() => console.log('Tests completed'))
    .catch(err => console.error('Test error:', err));
}