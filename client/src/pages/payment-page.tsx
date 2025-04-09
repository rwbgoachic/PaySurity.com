import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryParams } from "@/lib/useQueryParams";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MetaTags } from "@/components/seo";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface PaymentParams {
  ref: string;    // Order reference
  amt: string;    // Base amount
  tax: string;    // Tax amount
  total: string;  // Total amount (base + tax)
  curr: string;   // Currency code (USD, EUR, etc.)
  mid: string;    // Merchant ID
  ts: string;     // Timestamp
  tip?: string;   // Optional tip amount
}

export default function PaymentPage() {
  const params = useQueryParams<PaymentParams>();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Validate required parameters
  if (!params.ref || !params.amt || !params.total || !params.curr || !params.mid) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Invalid Payment Request</CardTitle>
            <CardDescription>
              This payment request is missing required parameters. Please contact the merchant.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const baseAmount = parseFloat(params.amt);
  const taxAmount = parseFloat(params.tax || '0');
  const currentTip = parseFloat(params.tip || '0');
  
  // Calculate different tip options
  const tipOptions = [
    { value: '0', label: 'No Tip', amount: 0 },
    { value: '15', label: '15%', amount: Math.round(baseAmount * 0.15 * 100) / 100 },
    { value: '18', label: '18%', amount: Math.round(baseAmount * 0.18 * 100) / 100 },
    { value: '20', label: '20%', amount: Math.round(baseAmount * 0.20 * 100) / 100 },
    { value: 'custom', label: 'Custom', amount: 0 },
  ];
  
  const [selectedTip, setSelectedTip] = useState(currentTip === 0 ? '0' : 
    tipOptions.some(t => t.amount === currentTip) ? 
      tipOptions.find(t => t.amount === currentTip)?.value || 'custom' : 'custom');
  
  const [customTipAmount, setCustomTipAmount] = useState(
    !tipOptions.some(t => t.amount === currentTip) && currentTip > 0 ? 
      currentTip.toFixed(2) : '');
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const calculateTotalWithTip = () => {
    const tipAmount = selectedTip === 'custom' ? 
      (customTipAmount ? parseFloat(customTipAmount) : 0) : 
      tipOptions.find(t => t.value === selectedTip)?.amount || 0;
    
    return (parseFloat(params.total) + tipAmount).toFixed(2);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const tipAmount = selectedTip === 'custom' ? 
        (customTipAmount ? parseFloat(customTipAmount) : 0) : 
        tipOptions.find(t => t.value === selectedTip)?.amount || 0;
      
      const total = parseFloat(params.total) + tipAmount;
      
      const response = await apiRequest('POST', '/api/process-payment', {
        merchantId: params.mid,
        reference: params.ref,
        baseAmount,
        taxAmount,
        tipAmount,
        totalAmount: total,
        currency: params.curr,
        cardDetails,
        timestamp: params.ts || new Date().toISOString()
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Redirect to success page with transaction details
        navigate(`/payment-success?reference=${params.ref}&amount=${total.toFixed(2)}&currency=${params.curr}&merchant=${params.mid}`);
      } else {
        const errorData = await response.json();
        toast({
          title: "Payment Failed",
          description: errorData.message || "There was an error processing your payment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const validateForm = () => {
    if (!cardDetails.number || cardDetails.number.length < 15) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid credit card number.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!cardDetails.name) {
      toast({
        title: "Missing Name",
        description: "Please enter the cardholder name.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!cardDetails.expiry || !cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter a valid expiry date (MM/YY).",
        variant: "destructive"
      });
      return false;
    }
    
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      toast({
        title: "Invalid CVC",
        description: "Please enter a valid security code.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  return (
    <>
      <MetaTags
        title="Secure Payment | PaySurity"
        description="Complete your secure payment transaction with PaySurity's protected payment processing system."
        canonicalUrl="/payment"
        keywords="secure payment, payment processing, credit card payment, online transaction"
      />
      
      <div className="container mx-auto py-12 px-4 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-2xl font-bold">Secure Payment</CardTitle>
              <CardDescription>
                Complete your purchase securely with PaySurity
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-medium">{params.ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{params.curr} {parseFloat(params.amt).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{params.curr} {taxAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Would you like to add a tip?</h3>
                <RadioGroup value={selectedTip} onValueChange={setSelectedTip} className="grid grid-cols-5 gap-2">
                  {tipOptions.map((option) => (
                    <div key={option.value} className="flex flex-col items-center">
                      <RadioGroupItem value={option.value} id={`tip-${option.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`tip-${option.value}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.value !== 'custom' && (
                          <span className="mt-1">{params.curr} {option.amount.toFixed(2)}</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {selectedTip === 'custom' && (
                  <div className="mt-4 flex items-center">
                    <span className="mr-2">{params.curr}</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter tip amount"
                      value={customTipAmount}
                      onChange={(e) => setCustomTipAmount(e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      name="number"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={handleCardDetailsChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={handleCardDetailsChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        name="expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={handleCardDetailsChange}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        name="cvc"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={handleCardDetailsChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>{params.curr} {calculateTotalWithTip()}</span>
                  </div>
                </div>
                
                <CardFooter className="flex justify-end pt-6 pb-0 px-0">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isProcessing}
                    className="w-full md:w-auto"
                  >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Payments are processed securely by PaySurity.</p>
            <p className="mt-1">Your card details are encrypted and never stored.</p>
          </div>
        </div>
      </div>
    </>
  );
}