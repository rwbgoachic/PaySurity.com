import { Request, Response } from 'express';

interface PaymentRequest {
  merchantId: string;
  reference: string;
  baseAmount: number;
  taxAmount: number;
  tipAmount: number;
  totalAmount: number;
  currency: string;
  cardDetails: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
  };
  timestamp: string;
}

/**
 * Process a payment request
 * This is a mock implementation - in a real application, this would integrate with a payment gateway like Stripe or Helcim
 */
export async function processPayment(req: Request, res: Response) {
  try {
    const paymentRequest: PaymentRequest = req.body;
    
    // Basic validation
    if (!paymentRequest.merchantId || !paymentRequest.totalAmount || !paymentRequest.cardDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information',
      });
    }
    
    // Validate credit card (very basic validation for demo purposes)
    const { number, name, expiry, cvc } = paymentRequest.cardDetails;
    
    if (!number || !name || !expiry || !cvc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card details',
      });
    }
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would call the payment gateway API
    // For demonstration, we'll simulate a successful payment
    
    // Create a transaction record
    const transactionId = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    
    // Create transaction receipt
    const receipt = {
      transactionId,
      merchantId: paymentRequest.merchantId,
      reference: paymentRequest.reference,
      amount: paymentRequest.totalAmount,
      currency: paymentRequest.currency,
      timestamp: new Date().toISOString(),
      status: 'approved',
      // In a real implementation, we would never return the full card details
      cardLast4: paymentRequest.cardDetails.number.slice(-4),
    };
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      receipt,
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred processing the payment',
      error: error?.message || 'Unknown error',
    });
  }
}