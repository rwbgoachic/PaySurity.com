import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  KeyRound,
  AlertCircle,
  Check,
} from "lucide-react";

// Form validation schema
const gatewaySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Gateway type is required"),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  merchantId: z.string().optional(),
  publicKey: z.string().optional(),
  accountId: z.string().optional(),
  terminalId: z.string().optional(),
  customEndpoint: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isDefault: z.boolean().default(false),
  testMode: z.boolean().default(true),
  amlKycCompliant: z.boolean().default(false),
  nachaPolicyAccepted: z.boolean().default(false),
  cardNetworkCompliance: z.boolean().default(false),
});

type GatewayFormValues = z.infer<typeof gatewaySchema>;

export default function NewPaymentGateway() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const preselectedProvider = searchParams.get("provider");
  
  // Set provider if specified in URL
  useEffect(() => {
    if (preselectedProvider) {
      setSelectedGateway(preselectedProvider);
    }
  }, [preselectedProvider]);
  
  // Fetch the merchant profile data
  const {
    data: merchantProfiles,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ["/api/merchant-profiles"],
  });
  
  const merchantProfile = merchantProfiles && merchantProfiles.length > 0 ? merchantProfiles[0] : null;
  
  // Payment gateway provider info
  const gatewayProviders = [
    { 
      id: "helcim", 
      name: "Helcim",
      logo: "", // In a real app, use a local Helcim logo
      description: "Paysurity's recommended payment processor with transparent Interchange Plus pricing and advanced features.",
      fields: ["apiKey", "accountId", "terminalId"],
      testPrefix: "test_",
      livePrefix: "live_",
      additionalFields: {
        amlKycCompliant: true,
        nachaPolicyAccepted: true,
        cardNetworkCompliance: true
      },
      preferred: true
    },
    { 
      id: "stripe", 
      name: "Stripe",
      logo: "https://stripe.com/img/v3/home/twitter.png", // In a real app, use a local logo
      description: "Connect your Stripe account to accept payments via credit cards, digital wallets, and more.",
      fields: ["apiKey", "apiSecret", "publicKey"],
      testPrefix: "pk_test_ / sk_test_",
      livePrefix: "pk_live_ / sk_live_"
    },
    {
      id: "paypal",
      name: "PayPal",
      logo: "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg", // In a real app, use a local logo
      description: "Connect your PayPal Business account to accept PayPal payments and credit cards.",
      fields: ["merchantId", "apiKey", "apiSecret"],
      testPrefix: "sb-",
      livePrefix: "live-"
    },
    {
      id: "square",
      name: "Square",
      logo: "https://cdn.worldvectorlogo.com/logos/square-2.svg", // In a real app, use a local logo
      description: "Connect your Square account for in-person and online payments.",
      fields: ["merchantId", "apiKey"],
      testPrefix: "sandbox-",
      livePrefix: ""
    },
    {
      id: "custom",
      name: "Custom Gateway",
      logo: "", // Would use a generic logo in real app
      description: "Connect a custom payment gateway using your own API credentials.",
      fields: ["apiKey", "apiSecret", "customEndpoint"],
      testPrefix: "",
      livePrefix: ""
    }
  ];
  
  // Define form with validation
  const form = useForm<GatewayFormValues>({
    resolver: zodResolver(gatewaySchema),
    defaultValues: {
      name: preselectedProvider
        ? gatewayProviders.find(p => p.id === preselectedProvider)?.name || ""
        : "",
      type: preselectedProvider || "",
      apiKey: "",
      apiSecret: "",
      merchantId: "",
      publicKey: "",
      accountId: "",
      terminalId: "",
      customEndpoint: "",
      isDefault: false,
      testMode: true,
      amlKycCompliant: false,
      nachaPolicyAccepted: false,
      cardNetworkCompliance: false,
    },
  });
  
  // Update form values when selected gateway changes
  useEffect(() => {
    if (selectedGateway) {
      const provider = gatewayProviders.find(p => p.id === selectedGateway);
      if (provider) {
        form.setValue("name", provider.name);
        form.setValue("type", provider.id);
        
        // Set compliance defaults for Helcim
        if (provider.id === "helcim" && provider.additionalFields) {
          if (provider.additionalFields.amlKycCompliant) {
            form.setValue("amlKycCompliant", false);
          }
          if (provider.additionalFields.nachaPolicyAccepted) {
            form.setValue("nachaPolicyAccepted", false);
          }
          if (provider.additionalFields.cardNetworkCompliance) {
            form.setValue("cardNetworkCompliance", false);
          }
        }
      }
    }
  }, [selectedGateway, form]);
  
  // Create payment gateway mutation
  const createGatewayMutation = useMutation({
    mutationFn: async (data: GatewayFormValues) => {
      const res = await apiRequest(
        "POST", 
        `/api/merchant-profiles/${merchantProfile?.id}/payment-gateways`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/merchant-profiles", merchantProfile?.id, "payment-gateways"] 
      });
      
      toast({
        title: "Payment gateway added",
        description: "Your payment gateway has been connected successfully.",
      });
      
      navigate("/merchant/payment-gateways");
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding payment gateway",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: GatewayFormValues) => {
    // Extra validation for Helcim to ensure compliance checkboxes are checked
    if (data.type === "helcim") {
      if (!data.amlKycCompliant || !data.nachaPolicyAccepted || !data.cardNetworkCompliance) {
        toast({
          title: "Compliance Acknowledgement Required",
          description: "You must acknowledge all compliance requirements to use Helcim as your payment processor.",
          variant: "destructive",
        });
        return;
      }
    }
    
    createGatewayMutation.mutate(data);
  };
  
  // Handle gateway selection
  const handleGatewaySelect = (gatewayId: string) => {
    setSelectedGateway(gatewayId);
  };
  
  // Show loading state if data is being fetched
  if (isLoadingProfile) {
    return (
      <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid gap-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  // Show merchant profile creation prompt if no profile exists
  if (!merchantProfile) {
    return (
      <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Merchant Profile Required</CardTitle>
            <CardDescription>
              You need to create a merchant profile before you can add payment gateways.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A merchant profile is required to set up and manage payment gateways.
              Create your merchant profile to continue.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/merchant/onboarding")}>
              Create Merchant Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show verification required message if merchant is not verified
  if (merchantProfile.verificationStatus !== "verified") {
    return (
      <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-6">
          <Button 
            variant="ghost" 
            className="w-fit p-0 flex items-center gap-2"
            onClick={() => navigate("/merchant/payment-gateways")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Payment Gateways</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Add Payment Gateway</h1>
          <p className="text-muted-foreground">
            Connect a new payment gateway to your merchant account
          </p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto my-4 rounded-full bg-yellow-100 p-3 w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Verification Required</CardTitle>
            <CardDescription>
              Your merchant account must be verified before you can add payment gateways.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              To ensure security and compliance with financial regulations, we require all merchants to complete the verification process before accepting payments.
            </p>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-1">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Verification Status</p>
                    <p className="text-sm text-muted-foreground">
                      {merchantProfile.verificationStatus === "not_started" ? "Not Started" : "Pending Approval"}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {merchantProfile.verificationStatus === "not_started" ? "Not Started" : "Pending"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/merchant/payment-gateways")}
            >
              Back
            </Button>
            <Button
              onClick={() => navigate("/merchant/verification")}
            >
              {merchantProfile.verificationStatus === "not_started" ? "Start Verification" : "Check Verification Status"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col gap-2 mb-6">
        <Button 
          variant="ghost" 
          className="w-fit p-0 flex items-center gap-2"
          onClick={() => navigate("/merchant/payment-gateways")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Payment Gateways</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Payment Gateway</h1>
        <p className="text-muted-foreground">
          Connect a new payment gateway to your merchant account
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Gateway Selection Step */}
          {!selectedGateway && (
            <Card>
              <CardHeader>
                <CardTitle>Select a Payment Gateway</CardTitle>
                <CardDescription>
                  Choose a payment provider to connect to your merchant account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {gatewayProviders.map((provider) => (
                    <div 
                      key={provider.id}
                      className={`flex items-start space-x-4 rounded-md border p-4 cursor-pointer hover:border-primary transition-colors ${provider.preferred ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleGatewaySelect(provider.id)}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{provider.name}</p>
                          {provider.preferred && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {provider.description}
                        </p>
                      </div>
                      <Button 
                        variant={provider.preferred ? "default" : "ghost"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGatewaySelect(provider.id);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/merchant/payment-gateways")}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Gateway Configuration Step */}
          {selectedGateway && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <span>Gateway Selected: <strong>{gatewayProviders.find(p => p.id === selectedGateway)?.name}</strong></span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setSelectedGateway("")}
                >
                  Change
                </Button>
              </div>
              
              <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="credentials">API Credentials</TabsTrigger>
                  <TabsTrigger value="settings">Gateway Settings</TabsTrigger>
                </TabsList>
                
                {/* API Credentials Tab */}
                <TabsContent value="credentials">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        API Credentials
                      </CardTitle>
                      <CardDescription>
                        Enter your {gatewayProviders.find(p => p.id === selectedGateway)?.name} API credentials
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Hidden field for gateway type */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* Gateway Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gateway Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter a name for this gateway" {...field} />
                            </FormControl>
                            <FormDescription>
                              This name will be used to identify this gateway in your dashboard
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Test Mode Toggle */}
                      <FormField
                        control={form.control}
                        name="testMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Test Mode
                              </FormLabel>
                              <FormDescription>
                                Use test credentials for development and testing. No real payments will be processed.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {/* Dynamically render fields based on the selected gateway */}
                      {gatewayProviders.find(p => p.id === selectedGateway)?.fields.includes("apiKey") && (
                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={`Enter your ${form.getValues("testMode") ? "test" : "live"} API key`} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                {form.getValues("testMode") 
                                  ? `Test API key (${gatewayProviders.find(p => p.id === selectedGateway)?.testPrefix}...)`
                                  : `Live API key (${gatewayProviders.find(p => p.id === selectedGateway)?.livePrefix}...)`
                                }
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Helcim-specific Account ID field */}
                      {gatewayProviders.find(p => p.id === selectedGateway)?.fields.includes("accountId") && (
                        <FormField
                          control={form.control}
                          name="accountId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Helcim Account ID</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your Helcim account ID" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                The unique account identifier provided by Helcim
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Helcim-specific Terminal ID field */}
                      {gatewayProviders.find(p => p.id === selectedGateway)?.fields.includes("terminalId") && (
                        <FormField
                          control={form.control}
                          name="terminalId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Terminal ID</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your terminal ID (optional)" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Required for in-person transactions. Leave blank if only processing online payments.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {gatewayProviders.find(p => p.id === selectedGateway)?.fields.includes("apiSecret") && (
                        <FormField
                          control={form.control}
                          name="apiSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Secret</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={`Enter your ${form.getValues("testMode") ? "test" : "live"} API secret`} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Keep this secret secure and never share it
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {gatewayProviders.find(p => p.id === selectedGateway)?.fields.includes("merchantId") && (
                        <FormField
                          control={form.control}
                          name="merchantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Merchant ID</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your merchant ID" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {gatewayProviders.find(p => p.id === selectedGateway)?.fields.includes("publicKey") && (
                        <FormField
                          control={form.control}
                          name="publicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Public Key</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={`Enter your ${form.getValues("testMode") ? "test" : "live"} public key`} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {gatewayProviders.find(p => p.id === selectedGateway)?.fields.includes("customEndpoint") && (
                        <FormField
                          control={form.control}
                          name="customEndpoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Endpoint URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://api.your-gateway.com" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                The base URL for your custom payment gateway API
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Security Notice */}
                      <div className="rounded-md bg-yellow-50 p-4 mt-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Shield className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Your API credentials are securely encrypted and stored. We adhere to
                                PCI DSS requirements to protect your sensitive payment data.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => document.getElementById("settings-tab")?.click()}
                      >
                        Continue to Settings
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Gateway Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Gateway Settings
                      </CardTitle>
                      <CardDescription>
                        Configure payment gateway settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Default Gateway Toggle */}
                      <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Set as Default Gateway
                              </FormLabel>
                              <FormDescription>
                                This gateway will be used as the default payment method for all transactions
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {/* Compliance Section - Only shown for Helcim integration */}
                      {selectedGateway === "helcim" && (
                        <div className="space-y-4 mt-4">
                          <h3 className="text-sm font-medium">Compliance Acknowledgements</h3>
                          <div className="rounded-md border p-4 bg-blue-50">
                            <p className="text-sm text-blue-900 mb-4">
                              As a Paysurity merchant partnering with Helcim, please acknowledge the following compliance requirements:
                            </p>
                            
                            {/* AML/KYC Compliance */}
                            <FormField
                              control={form.control}
                              name="amlKycCompliant"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      required
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-blue-950">
                                      AML/KYC Compliance
                                    </FormLabel>
                                    <FormDescription className="text-blue-800">
                                      I confirm that my business has implemented Anti-Money Laundering (AML) and Know Your Customer (KYC) procedures as required by financial regulations.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            {/* Nacha Policy */}
                            <FormField
                              control={form.control}
                              name="nachaPolicyAccepted"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      required
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-blue-950">
                                      Nacha Rules Acknowledgement
                                    </FormLabel>
                                    <FormDescription className="text-blue-800">
                                      I agree to comply with Nacha Operating Rules for ACH transactions and understand the requirements for proper authorization and processing.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            {/* Card Network Compliance */}
                            <FormField
                              control={form.control}
                              name="cardNetworkCompliance"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      required
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-blue-950">
                                      Card Network Compliance
                                    </FormLabel>
                                    <FormDescription className="text-blue-800">
                                      I confirm that my business follows card network (Visa, Mastercard, etc.) guidelines and PCI DSS requirements for handling cardholder data.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Additional Settings Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Payment Methods</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cc" defaultChecked />
                            <label
                              htmlFor="cc"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Credit Cards
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="debit" defaultChecked />
                            <label
                              htmlFor="debit"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Debit Cards
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="apple" defaultChecked />
                            <label
                              htmlFor="apple"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Apple Pay
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="google" defaultChecked />
                            <label
                              htmlFor="google"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Google Pay
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Configuration Tips</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                After connecting your payment gateway, you'll need to configure your
                                webhook endpoints and checkout settings to ensure proper payment processing.
                                Visit our documentation for detailed setup instructions.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("credentials-tab")?.click()}
                      >
                        Back to Credentials
                      </Button>
                      <Button
                        type="submit"
                        disabled={createGatewayMutation.isPending}
                      >
                        {createGatewayMutation.isPending ? "Connecting..." : "Connect Gateway"}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}