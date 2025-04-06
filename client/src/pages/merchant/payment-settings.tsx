import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Settings, Lock, CreditCard } from "lucide-react";
import { HelcimSettingsForm } from "@/components/merchant/payment-gateway/helcim-settings-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Create payment gateway form schema
const gatewayFormSchema = z.object({
  gatewayType: z.enum(["helcim", "stripe", "square", "custom"]),
  name: z.string().min(1, "Name is required"),
});

type GatewayFormValues = z.infer<typeof gatewayFormSchema>;

// Define types for the gateway objects
interface PaymentGateway {
  id: number;
  name: string;
  gatewayType: string;
  merchantId: number;
  isActive: boolean;
  supportedPaymentMethods: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PaymentSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(null);
  const [isAddGatewayOpen, setIsAddGatewayOpen] = useState(false);

  // Form for adding a new gateway
  const form = useForm<GatewayFormValues>({
    resolver: zodResolver(gatewayFormSchema),
    defaultValues: {
      gatewayType: "helcim",
      name: "",
    },
  });

  // Get merchant profile to get merchantId
  const {
    data: merchantProfile,
    isLoading: isLoadingMerchant,
  } = useQuery({
    queryKey: ["/api/merchant-profiles/current"],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await apiRequest("GET", "/api/merchant-profiles/current");
        return await res.json();
      } catch (err) {
        // If 404, it means profile doesn't exist yet
        if (err instanceof Response && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!user,
  });
  
  // Get merchant ID from profile
  const merchantId = merchantProfile?.id || 0;

  // Query to get payment gateways
  const {
    data: gateways,
    isLoading,
    error,
  } = useQuery<PaymentGateway[]>({
    queryKey: ["/api/payment-gateways"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/payment-gateways");
      return await res.json();
    },
    enabled: !!merchantId,
  });

  // Mutation to create a new gateway
  const { mutate: createGateway, isPending: isCreating } = useMutation({
    mutationFn: async (data: GatewayFormValues) => {
      const res = await apiRequest("POST", "/api/payment-gateways", {
        ...data,
        merchantId,
        isActive: true,
      });
      return await res.json();
    },
    onSuccess: (newGateway) => {
      toast({
        title: "Gateway Created",
        description: "Payment gateway has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] });
      setIsAddGatewayOpen(false);
      setSelectedGatewayId(newGateway.id);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create payment gateway: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a gateway
  const { mutate: deleteGateway } = useMutation({
    mutationFn: async (gatewayId: number) => {
      await apiRequest("DELETE", `/api/payment-gateways/${gatewayId}`);
    },
    onSuccess: () => {
      toast({
        title: "Gateway Deleted",
        description: "Payment gateway has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] });
      setSelectedGatewayId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete payment gateway: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GatewayFormValues) => {
    createGateway(data);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-2/3" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load payment gateways. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] })}
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // No merchant ID
  if (!merchantId) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Merchant Account Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You need to create a merchant account before you can configure payment gateways.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="default" asChild>
              <a href="/merchant/onboarding">Create Merchant Account</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar: Gateway list and add button */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Payment Gateways</span>
                <Dialog open={isAddGatewayOpen} onOpenChange={setIsAddGatewayOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Gateway</DialogTitle>
                      <DialogDescription>
                        Add a new payment processor to accept payments from your customers.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gateway Name</FormLabel>
                              <FormControl>
                                <Input placeholder="My Payment Gateway" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gatewayType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gateway Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a gateway type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="helcim">Helcim</SelectItem>
                                  <SelectItem value="stripe" disabled>Stripe (Coming Soon)</SelectItem>
                                  <SelectItem value="square" disabled>Square (Coming Soon)</SelectItem>
                                  <SelectItem value="custom" disabled>Custom (Coming Soon)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Gateway
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Configure your payment processors to accept payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gateways && gateways.length > 0 ? (
                  gateways.map((gateway: PaymentGateway) => (
                    <div
                      key={gateway.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer border ${
                        selectedGatewayId === gateway.id
                          ? "border-primary bg-primary/5"
                          : "border-input"
                      }`}
                      onClick={() => setSelectedGatewayId(gateway.id)}
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          {gateway.gatewayType === "helcim" ? (
                            <CreditCard className="h-5 w-5 text-blue-500" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{gateway.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {gateway.gatewayType}
                          </p>
                        </div>
                      </div>
                      <Badge variant={gateway.isActive ? "default" : "outline"}>
                        {gateway.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No payment gateways configured yet</p>
                    <Button
                      variant="link"
                      onClick={() => setIsAddGatewayOpen(true)}
                      className="mt-2"
                    >
                      Add your first gateway
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area: Selected gateway details */}
        <div className="md:col-span-2">
          {selectedGatewayId ? (
            <Tabs defaultValue="settings">
              <TabsList className="mb-4">
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings">
                {/* Display gateway configuration based on gateway type */}
                {gateways && gateways.find((g: PaymentGateway) => g.id === selectedGatewayId)?.gatewayType === "helcim" && (
                  <HelcimSettingsForm 
                    gatewayId={selectedGatewayId} 
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] });
                    }}
                  />
                )}
                
                {/* For other gateway types, show coming soon or placeholder */}
                {gateways && gateways.find((g: PaymentGateway) => g.id === selectedGatewayId)?.gatewayType !== "helcim" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuration Coming Soon</CardTitle>
                      <CardDescription>
                        Support for this gateway type is coming soon.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>
                        We're working on adding support for this payment gateway. 
                        Please check back later.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage security settings for this payment gateway
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Fraud Protection</h3>
                          <p className="text-sm text-muted-foreground">
                            Enable additional fraud protection measures
                          </p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">IP Address Restrictions</h3>
                          <p className="text-sm text-muted-foreground">
                            Limit access to payment processing by IP
                          </p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Transaction Limits</h3>
                          <p className="text-sm text-muted-foreground">
                            Set limits for single transactions
                          </p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this payment gateway? This action cannot be undone.")) {
                          deleteGateway(selectedGatewayId);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Gateway
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Payment Gateway</CardTitle>
                <CardDescription>
                  Select a payment gateway from the list to configure it, or add a new one.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  Configure your payment gateways to start accepting payments from your customers.
                </p>
                <Button onClick={() => setIsAddGatewayOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Gateway
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}