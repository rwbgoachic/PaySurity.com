import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Payment gateway type definitions
interface PaymentGateway {
  id: number;
  name: string;
  gatewayType: string; // Primary field for gateway type
  merchantId: number;
  isActive: boolean;
  supportedPaymentMethods: string[];
  createdAt: string;
  updatedAt: string;
}

interface HelcimIntegration {
  id: number;
  paymentGatewayId: number;
  merchantId: number;
  helcimAccountId: string; // Matches the schema definition
  helcimApiKey: string; // Matches the schema definition
  helcimTerminalId?: string; // Matches the schema definition
  testMode: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HelcimPaymentResponse {
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

// Define payment processing form schema
const processPaymentSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than 0" }),
  currency: z.string().default("USD"),
  paymentMethod: z.enum(["creditCard", "bankAccount", "cash", "check", "debitCard"]),
  transactionType: z.enum(["purchase", "preAuth", "capture", "refund", "verification"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  cardHolderName: z.string().optional(),
  billingName: z.string().optional(),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  orderNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  comments: z.string().optional(),
});

type ProcessPaymentFormValues = z.infer<typeof processPaymentSchema>;

export default function ProcessPaymentPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/merchant/payment-gateways/:id/process-payment");
  const { toast } = useToast();
  const [paymentResult, setPaymentResult] = useState<HelcimPaymentResponse | null>(null);
  const gatewayId = params?.id ? parseInt(params.id) : undefined;

  // Active payment tab
  const [activeTab, setActiveTab] = useState<string>("credit-card");

  // Fetch payment gateway details
  const { data: gateway, isLoading: isLoadingGateway } = useQuery<PaymentGateway>({
    queryKey: ["/api/payment-gateways", gatewayId],
    enabled: gatewayId !== undefined,
  });

  // Fetch Helcim integration if available
  const { data: helcimIntegration, isLoading: isLoadingHelcim } = useQuery<HelcimIntegration>({
    queryKey: ["/api/payment-gateways", gatewayId, "helcim"],
    enabled: gatewayId !== undefined && gateway?.gatewayType === "helcim",
  });

  // Form setup
  const form = useForm<ProcessPaymentFormValues>({
    resolver: zodResolver(processPaymentSchema),
    defaultValues: {
      amount: 0,
      currency: "USD",
      paymentMethod: "creditCard",
      transactionType: "purchase",
    },
  });

  // Payment processing mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (data: ProcessPaymentFormValues) => {
      if (!gatewayId) {
        throw new Error("Gateway ID is required");
      }
      
      // Transform form data to match API expectations
      const payload: any = {
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        transactionType: data.transactionType,
      };
      
      // Add card details if payment method is credit or debit card
      if (data.paymentMethod === "creditCard" || data.paymentMethod === "debitCard") {
        payload.cardNumber = data.cardNumber;
        payload.cardExpiry = data.cardExpiry;
        payload.cardCvv = data.cardCvv;
        payload.cardHolderName = data.cardHolderName;
      }
      
      // Add billing address if provided
      if (data.billingName || data.billingStreet) {
        payload.billingAddress = {
          name: data.billingName,
          street1: data.billingStreet,
          city: data.billingCity,
          province: data.billingState,
          postalCode: data.billingZip,
          country: data.billingCountry,
        };
      }
      
      // Add customer info if provided
      if (data.customerName || data.customerEmail) {
        payload.customer = {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        };
      }
      
      // Additional fields
      if (data.orderNumber) payload.orderNumber = data.orderNumber;
      if (data.invoiceNumber) payload.invoiceNumber = data.invoiceNumber;
      if (data.comments) payload.comments = data.comments;
      
      // Process payment based on gateway type
      if (gateway?.gatewayType === "helcim") {
        const response = await apiRequest(
          "POST",
          `/api/payment-gateways/${gatewayId}/helcim/payment`,
          payload
        );
        return await response.json();
      } else {
        throw new Error("Unsupported gateway type");
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
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Processing Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(data: ProcessPaymentFormValues) {
    processPaymentMutation.mutate(data);
  }

  // Payment method tab change handler
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Update form for the payment method
    let paymentMethod;
    switch (tab) {
      case "credit-card":
        paymentMethod = "creditCard";
        break;
      case "bank-account":
        paymentMethod = "bankAccount";
        break;
      case "cash":
        paymentMethod = "cash";
        break;
      case "check":
        paymentMethod = "check";
        break;
      default:
        paymentMethod = "creditCard";
    }
    
    form.setValue("paymentMethod", paymentMethod as any);
  };

  // Redirect if no gateway ID
  useEffect(() => {
    if (!match) {
      setLocation("/merchant/payment-gateways");
    }
  }, [match, setLocation]);

  if (isLoadingGateway || isLoadingHelcim) {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!gateway) {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-6">
          <Button 
            variant="ghost" 
            className="w-fit p-0 flex items-center gap-2"
            onClick={() => setLocation("/merchant/payment-gateways")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Payment Gateways</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Process Payment</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Gateway Not Found</CardTitle>
            <CardDescription>
              The payment gateway you requested was not found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please select a valid payment gateway to process payments.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation("/merchant/payment-gateways")}>
              View Payment Gateways
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Handle case when Helcim gateway doesn't have integration
  if (gateway.gatewayType === "helcim" && !helcimIntegration) {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-6">
          <Button 
            variant="ghost" 
            className="w-fit p-0 flex items-center gap-2"
            onClick={() => setLocation("/merchant/payment-gateways")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Payment Gateways</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Process Payment</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Helcim Integration Not Configured</CardTitle>
            <CardDescription>
              You need to configure your Helcim integration before processing payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please set up your Helcim integration with your account details.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation(`/merchant/payment-gateways/${gatewayId}/helcim`)}>
              Configure Helcim
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col gap-2 mb-6">
        <Button 
          variant="ghost" 
          className="w-fit p-0 flex items-center gap-2"
          onClick={() => setLocation("/merchant/payment-gateways")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Payment Gateways</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Process Payment</h1>
        <p className="text-muted-foreground">
          Process a payment using {gateway.name || gateway.gatewayType}
        </p>
      </div>
      
      {/* Payment Processing Result */}
      {paymentResult && (
        <Alert
          className={`mb-6 ${
            paymentResult.success || paymentResult.response?.transactionId
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {paymentResult.success || paymentResult.response?.transactionId ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <AlertTitle>
                {paymentResult.success || paymentResult.response?.transactionId
                  ? "Payment Successful"
                  : "Payment Failed"}
              </AlertTitle>
              <AlertDescription>
                {paymentResult.success || paymentResult.response?.transactionId ? (
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
      
      {/* Payment Processing Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Enter the payment details to process a transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount and Currency */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Transaction Type */}
                <FormField
                  control={form.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="purchase">Purchase</SelectItem>
                            <SelectItem value="preAuth">Pre-Authorization</SelectItem>
                            <SelectItem value="verification">Verification</SelectItem>
                            <SelectItem value="refund">Refund</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Order Number */}
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Order #123"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Payment Method Tabs */}
              <div>
                <h3 className="text-md font-medium mb-3">Payment Method</h3>
                <Tabs 
                  defaultValue="credit-card" 
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                    <TabsTrigger value="bank-account">Bank Account</TabsTrigger>
                    <TabsTrigger value="cash">Cash</TabsTrigger>
                    <TabsTrigger value="check">Check</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="credit-card" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Card Expiry */}
                      <FormField
                        control={form.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiration Date*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MM/YY"
                                {...field}
                                value={field.value || ""}
                              />
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
                                placeholder="123"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Cardholder Name */}
                      <FormField
                        control={form.control}
                        name="cardHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cardholder Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bank-account" className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Bank account processing</AlertTitle>
                      <AlertDescription>
                        Bank account processing requires additional setup. Please contact support for more information.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="cash" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Cash transactions will be recorded in the system but no electronic payment will be processed.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="check" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Check transactions will be recorded in the system but no electronic payment will be processed.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Billing Information */}
              <div>
                <h3 className="text-md font-medium mb-3">Billing Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingStreet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main St"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="New York"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NY"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingZip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="10001"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="US"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Customer Information */}
              <div>
                <h3 className="text-md font-medium mb-3">Customer Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Smith"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="customer@example.com"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
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
                          <Input
                            placeholder="(555) 123-4567"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Additional Notes */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Additional comments"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any additional information about this transaction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={processPaymentMutation.isPending}
              >
                {processPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Payment"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}