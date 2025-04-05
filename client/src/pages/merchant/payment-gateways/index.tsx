import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  PlusCircle,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  CreditCard as CreditCardIcon,
  Wallet,
  ShieldCheck,
  Lock,
  ShoppingCart,
  Landmark,
} from "lucide-react";

export default function PaymentGateways() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch the merchant profile data
  const {
    data: merchantProfiles,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ["/api/merchant-profiles"],
  });
  
  const merchantProfile = merchantProfiles && merchantProfiles.length > 0 ? merchantProfiles[0] : null;
  
  // Fetch payment gateways if merchant profile exists
  const {
    data: paymentGateways,
    isLoading: isLoadingGateways,
  } = useQuery({
    queryKey: ["/api/merchant-profiles", merchantProfile?.id, "payment-gateways"],
    enabled: !!merchantProfile?.id,
  });
  
  // Payment gateway provider info
  const gatewayProviders = [
    { 
      id: "helcim", 
      name: "Helcim", 
      description: "PaySurity's preferred payment processor with transparent pricing and advanced features.",
      processingFee: "Interchange + 0.30%",
      features: ["Competitive Interchange Plus", "In-Person & Online", "Virtual Terminal", "PCI Compliant"],
      preferred: true
    },
    { 
      id: "stripe", 
      name: "Stripe", 
      description: "Comprehensive payment solution with support for cards, wallets, and international payments.",
      processingFee: "2.9% + $0.30",
      features: ["Credit Cards", "Digital Wallets", "ACH Transfers", "International Payments"]
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Global payment platform with built-in buyer and seller protection.",
      processingFee: "3.49% + $0.49",
      features: ["PayPal Balance", "Credit Cards", "Buy Now Pay Later", "Cross-border Payments"]
    },
    {
      id: "square",
      name: "Square",
      description: "All-in-one solution for retail and online payments.",
      processingFee: "2.6% + $0.10",
      features: ["Point of Sale", "Online Checkout", "Card Processing", "Contactless Payments"]
    },
    {
      id: "custom",
      name: "Custom Gateway",
      description: "Connect your existing payment processor.",
      processingFee: "Varies",
      features: ["Custom Integration", "API Access", "Existing Relationships", "Specialized Processing"]
    }
  ];
  
  // Show loading state if data is being fetched
  if (isLoadingProfile || (merchantProfile && isLoadingGateways)) {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[320px]" />
            <Skeleton className="h-4 w-[380px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid gap-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  // Show merchant profile creation prompt if no profile exists
  if (!merchantProfile) {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Merchant Profile Required</CardTitle>
            <CardDescription>
              You need to create a merchant profile before you can manage payment gateways.
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
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-6">
          <Button 
            variant="ghost" 
            className="w-fit p-0 flex items-center gap-2"
            onClick={() => navigate("/merchant/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Payment Gateways</h1>
          <p className="text-muted-foreground">
            Manage your payment processing methods and settings
          </p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto my-4 rounded-full bg-yellow-100 p-3 w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Verification Required</CardTitle>
            <CardDescription>
              Your merchant account must be verified before you can set up payment gateways.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
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
          <CardFooter>
            <Button
              className="w-full"
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
    <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col gap-2 mb-6">
        <Button 
          variant="ghost" 
          className="w-fit p-0 flex items-center gap-2"
          onClick={() => navigate("/merchant/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Payment Gateways</h1>
        <p className="text-muted-foreground">
          Manage your payment processing methods and settings
        </p>
      </div>
      
      {/* Active Payment Gateways */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Active Payment Gateways</h2>
        
        {paymentGateways?.length ? (
          <div className="grid gap-4">
            {paymentGateways.map((gateway) => (
              <Card key={gateway.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] divide-y md:divide-y-0 md:divide-x">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-md bg-primary/10 p-2">
                          <CreditCardIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{gateway.name}</CardTitle>
                          <CardDescription>
                            {gateway.type.charAt(0).toUpperCase() + gateway.type.slice(1).replace('_', ' ')}
                          </CardDescription>
                        </div>
                      </div>
                      {gateway.isDefault && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Default Gateway
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <div className="flex items-center justify-center px-6 py-4">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => navigate(`/merchant/payment-gateways/${gateway.id}`)}
                    >
                      Manage
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Active</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Processing Fee</span>
                      <span className="text-sm">
                        {gatewayProviders.find(p => p.id === gateway.type)?.processingFee || "Custom rate"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Last Transaction</span>
                      <span className="text-sm">
                        {gateway.lastTransaction ? new Date(gateway.lastTransaction).toLocaleDateString() : "None"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto my-4 rounded-full bg-muted p-3 w-16 h-16 flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-muted-foreground" />
              </div>
              <CardTitle>No Payment Gateways</CardTitle>
              <CardDescription>
                You haven't set up any payment gateways yet
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Set up a payment gateway to start accepting payments from your customers.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate("/merchant/payment-gateways/new")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Payment Gateway
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Main CTA if no gateways or for adding more */}
        {(!paymentGateways?.length || paymentGateways.length < 2) && (
          <div className="mt-8">
            <Button 
              size="lg" 
              className="gap-2 w-full"
              onClick={() => navigate("/merchant/payment-gateways/new")}
            >
              <PlusCircle className="h-5 w-5" />
              Add Payment Gateway
            </Button>
          </div>
        )}
      </div>
      
      {/* Available Payment Gateway Providers */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold">Available Payment Providers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {gatewayProviders.map((provider) => (
            <Card key={provider.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{provider.name}</CardTitle>
                  {paymentGateways?.some(g => g.type === provider.id) && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {provider.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Processing Fee</span>
                    <span className="text-sm">{provider.processingFee}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Features</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {provider.features.map((feature, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={paymentGateways?.some(g => g.type === provider.id) ? "outline" : "default"}
                  className="w-full"
                  onClick={() => navigate(`/merchant/payment-gateways/new?provider=${provider.id}`)}
                >
                  {paymentGateways?.some(g => g.type === provider.id) 
                    ? "Add Another"
                    : "Connect"
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Security Features */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold">Payment Security Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">PCI Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All payment gateways adhere to the Payment Card Industry Data Security Standard (PCI DSS).
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Encrypted Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption for all payment data with secure TLS 1.2+ connections.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Fraud Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced fraud detection and prevention tools to protect your business and customers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}