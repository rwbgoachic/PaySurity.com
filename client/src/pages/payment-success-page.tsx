import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download, Mail, Printer } from "lucide-react";
import { MetaTags } from "@/components/seo";
import { useQueryParams } from "@/lib/useQueryParams";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

/**
 * Interface for success page URL parameters
 */
interface SuccessParams {
  reference: string;
  amount: string;
  currency: string;
  merchant: string;
}

export default function PaymentSuccessPage() {
  const params = useQueryParams<SuccessParams>();
  const [, navigate] = useLocation();
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [sendReceiptEmail, setSendReceiptEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Validate required parameters
  if (!params.reference || !params.amount || !params.currency || !params.merchant) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Invalid Payment Success</CardTitle>
            <CardDescription>
              The payment success details are missing required parameters.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  useEffect(() => {
    // Fetch transaction details if needed
    const fetchTransactionDetails = async () => {
      try {
        setIsLoadingDetails(true);
        // In a real implementation, this would fetch from the server
        // For demo purposes, we'll create the details from URL params
        
        setTransactionDetails({
          id: `TRX-${Math.floor(Math.random() * 1000000)}`,
          reference: params.reference,
          amount: parseFloat(params.amount),
          currency: params.currency,
          merchant: params.merchant,
          merchantName: getMerchantName(params.merchant),
          date: new Date().toLocaleString(),
          status: 'Completed',
          paymentMethod: 'Credit Card',
          maskedCard: `**** **** **** ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        });
      } catch (error) {
        console.error("Error fetching transaction details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    
    fetchTransactionDetails();
  }, [params]);
  
  // Helper function to get merchant name from ID
  const getMerchantName = (merchantId: string) => {
    // In production, this would query the merchant database
    const merchantMap: Record<string, string> = {
      'MERCHANT001': 'BistroBeast Restaurant',
      'MERCHANT002': 'GrocerEase Market',
      'MERCHANT003': 'HealthCare Clinic',
      'MERCHANT004': 'LegalPro Services',
      'HOTEL001': 'Luxury Resort & Spa',
      'CAMPUS001': 'University Bookstore',
      'DONATION001': 'Charity Foundation',
    };
    
    return merchantMap[merchantId] || 'PaySurity Merchant';
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadReceipt = () => {
    // In a production app, this would generate a proper PDF receipt
    // For demo purposes, we'll create a simple text blob
    if (!transactionDetails) return;
    
    const receipt = `
PaySurity Receipt
-----------------
Transaction ID: ${transactionDetails.id}
Reference: ${transactionDetails.reference}
Merchant: ${transactionDetails.merchantName}
Date: ${transactionDetails.date}
Amount: ${transactionDetails.currency} ${transactionDetails.amount.toFixed(2)}
Payment Method: ${transactionDetails.paymentMethod}
Card: ${transactionDetails.maskedCard}
Status: ${transactionDetails.status}
    `;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transactionDetails.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleEmailReceipt = async () => {
    if (!emailAddress) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the receipt to.",
        variant: "destructive",
      });
      return;
    }
    
    if (!transactionDetails) return;
    
    setIsSendingEmail(true);
    
    try {
      // In production, this would send via the server
      // For demo purposes, we'll just simulate a server call
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Receipt Sent",
        description: `The receipt has been sent to ${emailAddress}`,
      });
    } catch (error) {
      console.error("Error sending receipt:", error);
      toast({
        title: "Error Sending Receipt",
        description: "There was a problem sending the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
      setSendReceiptEmail(false);
      setEmailAddress('');
    }
  };
  
  const navigateToHome = () => {
    navigate('/');
  };
  
  return (
    <>
      <MetaTags
        title="Payment Successful | PaySurity"
        description="Your payment has been processed successfully. View and download your receipt."
        canonicalUrl="/payment-success"
        keywords="payment success, payment receipt, transaction confirmation, secure payment"
      />
      
      <div className="container mx-auto py-12 px-4 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Payment Successful</CardTitle>
              <CardDescription className="text-center text-white/90">
                Your transaction has been completed successfully
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {isLoadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : transactionDetails && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Transaction Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-medium">{transactionDetails.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-medium">{transactionDetails.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{transactionDetails.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Merchant</span>
                        <span className="font-medium">{transactionDetails.merchantName}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">{transactionDetails.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Card</span>
                        <span className="font-medium">{transactionDetails.maskedCard}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount</span>
                        <span>{transactionDetails.currency} {transactionDetails.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium text-emerald-600">{transactionDetails.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Receipt Options</h3>
                    
                    <div className="flex flex-col gap-4">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 justify-center"
                        onClick={handlePrint}
                      >
                        <Printer className="w-4 h-4" />
                        Print Receipt
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 justify-center"
                        onClick={handleDownloadReceipt}
                      >
                        <Download className="w-4 h-4" />
                        Download Receipt
                      </Button>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <Label htmlFor="email-receipt">Email Receipt</Label>
                          </div>
                          <Switch 
                            id="email-receipt" 
                            checked={sendReceiptEmail}
                            onCheckedChange={setSendReceiptEmail}
                          />
                        </div>
                        
                        {sendReceiptEmail && (
                          <div className="mt-2 space-y-3">
                            <input
                              type="email"
                              placeholder="Enter your email address"
                              className="w-full px-3 py-2 border border-border rounded"
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                            />
                            <Button 
                              variant="default" 
                              className="w-full"
                              onClick={handleEmailReceipt}
                              disabled={isSendingEmail}
                            >
                              {isSendingEmail ? 'Sending...' : 'Send Receipt'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col md:flex-row gap-3 items-center pt-6">
              <Button 
                variant="outline" 
                className="w-full md:w-auto"
                onClick={navigateToHome}
              >
                Return to Home
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Transaction processed securely by PaySurity.</p>
            <p className="mt-1">A notification has been sent to the merchant.</p>
          </div>
        </div>
      </div>
    </>
  );
}