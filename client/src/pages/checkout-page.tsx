import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  CreditCard, 
  ArrowLeft,
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  LockIcon,
  CalendarIcon,
  User,
  Mail,
  Phone
} from "lucide-react";
import { MetaTags } from "@/components/seo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Payment method types
enum PaymentMethod {
  CREDIT_CARD = 'creditCard',
  BANK_ACCOUNT = 'bankAccount',
  DIGITAL_WALLET = 'digitalWallet'
}

// Transaction types
enum TransactionType {
  PURCHASE = 'purchase'
}

// Payment response interface
interface PaymentResponse {
  success: boolean;
  approved?: boolean;
  response?: {
    transactionId: string;
    amount: string;
    currency: string;
    cardNumber?: string;
    cardType?: string;
    cardholderName?: string;
  };
  notice?: string;
  error?: string;
}

// Define checkout form schema
const checkoutFormSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than 0" }),
  currency: z.string().default("USD"),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CREDIT_CARD),
  
  // Credit card fields (required when paymentMethod is creditCard)
  cardNumber: z.string()
    .min(13, { message: "Card number must be at least 13 digits" })
    .max(19, { message: "Card number must be at most 19 digits" })
    .optional()
    .refine(val => val !== undefined && val.length >= 13, {
      message: "Card number is required",
      path: ["cardNumber"]
    }),
  cardExpiry: z.string()
    .min(5, { message: "Expiry date must be in MM/YY format" })
    .max(5, { message: "Expiry date must be in MM/YY format" })
    .optional()
    .refine(val => val !== undefined && /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), {
      message: "Expiry date must be in MM/YY format",
      path: ["cardExpiry"]
    }),
  cardCvv: z.string()
    .min(3, { message: "CVV must be 3-4 digits" })
    .max(4, { message: "CVV must be 3-4 digits" })
    .optional()
    .refine(val => val !== undefined && /^\d{3,4}$/.test(val), {
      message: "CVV must be 3-4 digits",
      path: ["cardCvv"]
    }),
  cardHolderName: z.string()
    .min(2, { message: "Cardholder name is required" })
    .optional()
    .refine(val => val !== undefined && val.length >= 2, {
      message: "Cardholder name is required", 
      path: ["cardHolderName"]
    }),
  
  // Customer info
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  
  // Billing information (optional)
  billingName: z.string().optional(),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
  
  // Order info (optional)
  orderNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  orderDescription: z.string().optional(),
  saveCardForFuture: z.boolean().default(false),
}).refine(
  (data) => {
    // If payment method is credit card, validate required fields
    if (data.paymentMethod === PaymentMethod.CREDIT_CARD) {
      return !!data.cardNumber && !!data.cardExpiry && !!data.cardCvv && !!data.cardHolderName;
    }
    return true;
  },
  {
    message: "Please fill out all required card fields",
    path: ["paymentMethod"],
  }
);

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get URL parameters (amount, currency, description, etc.)
  const searchParams = new URLSearchParams(window.location.search);
  const amountParam = searchParams.get('amount');
  const currencyParam = searchParams.get('currency') || 'USD';
  const descriptionParam = searchParams.get('description') || '';
  const orderParam = searchParams.get('order') || '';

  // Find an available payment gateway
  const { data: availableGateways, isLoading: isLoadingGateways } = useQuery({
    queryKey: ["/api/payment-gateways/available"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/payment-gateways/available');
      if (!response.ok) {
        throw new Error('No payment gateways available');
      }
      return await response.json();
    },
    retry: 1,
  });

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      amount: amountParam ? parseFloat(amountParam) : 0,
      currency: currencyParam,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      orderDescription: descriptionParam,
      orderNumber: orderParam,
      saveCardForFuture: false,
    },
  });

  // Payment processing mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      setIsProcessing(true);
      
      if (!availableGateways || availableGateways.length === 0) {
        throw new Error("No payment gateway available");
      }
      
      // Get the first available gateway (preferably Helcim)
      const gateway = availableGateways.find(g => g.gatewayType === 'helcim') || availableGateways[0];
      
      // Transform form data to match API expectations
      const payload: any = {
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        transactionType: TransactionType.PURCHASE,
      };
      
      // Add card details if payment method is credit card
      if (data.paymentMethod === PaymentMethod.CREDIT_CARD) {
        payload.cardNumber = data.cardNumber;
        payload.cardExpiry = data.cardExpiry;
        payload.cardCvv = data.cardCvv;
        payload.cardHolderName = data.cardHolderName;
      }
      
      // Add billing address if provided
      if (data.billingName || data.billingStreet) {
        payload.billingAddress = {
          name: data.billingName || data.cardHolderName,
          street1: data.billingStreet,
          city: data.billingCity,
          province: data.billingState,
          postalCode: data.billingZip,
          country: data.billingCountry || 'US',
        };
      }
      
      // Add customer info if provided
      if (data.customerName || data.customerEmail || data.customerPhone) {
        payload.customer = {
          name: data.customerName || data.cardHolderName,
          email: data.customerEmail,
          phone: data.customerPhone,
        };
      }
      
      // Additional fields
      if (data.orderNumber) payload.orderNumber = data.orderNumber;
      if (data.invoiceNumber) payload.invoiceNumber = data.invoiceNumber;
      if (data.orderDescription) payload.comments = data.orderDescription;
      
      try {
        // Process payment using Helcim if available
        if (gateway.gatewayType === 'helcim') {
          const response = await apiRequest(
            'POST',
            `/api/payment-gateways/${gateway.id}/helcim/payment`,
            payload
          );
          return await response.json();
        } else {
          throw new Error(`Gateway type ${gateway.gatewayType} not supported`);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (response) => {
      setPaymentResult(response);
      toast({
        title: response.success ? "Payment Successful" : "Payment Failed",
        description: response.success
          ? `Transaction ID: ${response.response?.transactionId}`
          : response.notice || "There was an issue processing your payment",
        variant: response.success ? "default" : "destructive",
      });
      
      // Redirect to success page after successful payment
      if (response.success) {
        // After 2 seconds, redirect to success page
        setTimeout(() => {
          const returnUrl = searchParams.get('returnUrl');
          if (returnUrl) {
            window.location.href = returnUrl;
          }
        }, 2000);
      }
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast({
        title: "Payment Processing Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(data: CheckoutFormValues) {
    processPaymentMutation.mutate(data);
  }

  // If no amount is specified, show error
  if (!amountParam) {
    return (
      <div className="container max-w-4xl py-12 px-4 md:px-6 lg:px-8">
        <MetaTags 
          title="Checkout Error | PaySurity"
          description="Secure payment checkout page"
        />
        <Card>
          <CardHeader>
            <CardTitle>Invalid Checkout Request</CardTitle>
            <CardDescription>
              This checkout session is invalid. Please return to the merchant and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No payment amount specified. Please return to the merchant site.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6 lg:px-8">
      <MetaTags 
        title="Secure Checkout | PaySurity"
        description="Secure payment checkout page"
      />
      
      <div className="flex flex-col gap-2 mb-6">
        <Button 
          variant="ghost" 
          className="w-fit p-0 flex items-center gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Merchant</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Secure Checkout</h1>
        <p className="text-muted-foreground">
          Complete your purchase securely with PaySurity
        </p>
      </div>
      
      {/* Payment Processing Result */}
      {paymentResult && (
        <Alert
          className={`mb-6 ${
            paymentResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {paymentResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <AlertTitle>
                {paymentResult.success
                  ? "Payment Successful"
                  : "Payment Failed"}
              </AlertTitle>
              <AlertDescription>
                {paymentResult.success ? (
                  <div>
                    <p>Transaction ID: {paymentResult.response?.transactionId}</p>
                    <p>Amount: ${paymentResult.response?.amount} {paymentResult.response?.currency}</p>
                    {paymentResult.response?.cardNumber && (
                      <p>Card: {paymentResult.response?.cardNumber}</p>
                    )}
                  </div>
                ) : (
                  <p>{paymentResult.notice || "There was an error processing the payment"}</p>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <LockIcon className="mr-2 h-5 w-5 text-primary" />
                  Payment Information
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <img src="/visa.svg" alt="Visa" className="h-8" />
                  <img src="/mastercard.svg" alt="Mastercard" className="h-8" />
                  <img src="/amex.svg" alt="Amex" className="h-8" />
                </div>
              </div>
              <CardDescription>
                Your payment is secure and encrypted
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payment Method</h3>
                    <Tabs defaultValue="credit-card" className="w-full">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="credit-card" className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Credit Card
                        </TabsTrigger>
                        <TabsTrigger value="digital-wallet" disabled>
                          Digital Wallet
                        </TabsTrigger>
                        <TabsTrigger value="bank-transfer" disabled>
                          Bank Transfer
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="credit-card" className="mt-4 space-y-4">
                        {/* Card Number */}
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="4111 1111 1111 1111"
                                  {...field}
                                  value={field.value || ""}
                                  className="font-mono"
                                  autoComplete="cc-number"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Card Expiry */}
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date*</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="MM/YY"
                                      {...field}
                                      value={field.value || ""}
                                      className="pl-9 font-mono"
                                      autoComplete="cc-exp"
                                    />
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Card CVV */}
                          <FormField
                            control={form.control}
                            name="cardCvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV*</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="123"
                                    {...field}
                                    value={field.value || ""}
                                    className="font-mono"
                                    autoComplete="cc-csc"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Cardholder Name */}
                        <FormField
                          control={form.control}
                          name="cardHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name*</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="John Smith"
                                    {...field}
                                    value={field.value || ""}
                                    className="pl-9"
                                    autoComplete="cc-name"
                                  />
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <Separator />
                  
                  {/* Billing Information (optional) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="your@email.com"
                                  {...field}
                                  value={field.value || ""}
                                  className="pl-9"
                                  type="email"
                                  autoComplete="email"
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              For receipt and confirmation
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="(123) 456-7890"
                                  {...field}
                                  value={field.value || ""}
                                  className="pl-9"
                                  autoComplete="tel"
                                />
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Save Card for Future Purchases */}
                  {/*
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveCard"
                      checked={form.watch("saveCardForFuture")}
                      onCheckedChange={(checked) => 
                        form.setValue("saveCardForFuture", checked as boolean)
                      }
                    />
                    <label
                      htmlFor="saveCard"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Save card for future purchases
                    </label>
                  </div>
                  */}
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay ${amountParam} {currencyParam}</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {descriptionParam && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Description:</h4>
                    <p>{descriptionParam}</p>
                  </div>
                )}
                
                {orderParam && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Order #:</h4>
                    <p>{orderParam}</p>
                  </div>
                )}
                
                <div className="border-t pt-2 mt-6">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${amountParam} {currencyParam}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-t font-medium">
                    <span>Total:</span>
                    <span>${amountParam} {currencyParam}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-center text-xs text-muted-foreground">
              <div className="flex items-center">
                <LockIcon className="h-3 w-3 mr-1" />
                Secured by PaySurity Payment Processing
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Questions? Contact support@paysurity.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}