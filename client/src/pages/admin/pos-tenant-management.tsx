import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, PlusCircle, Settings, Package, Store, Users, FileText, Edit, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define the schema for POS tenant creation
const posBusinessSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  subscriptionType: z.string().min(1, "Subscription type is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid color hex code required"),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid color hex code required").optional(),
  customDomain: z.string().optional(),
  additionalFeatures: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type POSBusiness = z.infer<typeof posBusinessSchema>;

const industryOptions = [
  { value: "restaurant", label: "Restaurant/Food Service" },
  { value: "retail", label: "Retail" },
  { value: "grocery", label: "Grocery Store" },
  { value: "healthcare", label: "Healthcare" },
  { value: "legal", label: "Legal Services" },
  { value: "salon", label: "Salon/Spa" },
  { value: "other", label: "Other" },
];

const subscriptionOptions = [
  { value: "basic", label: "Basic ($20/month)" },
  { value: "standard", label: "Standard ($50/month)" },
  { value: "premium", label: "Premium ($100/month)" },
  { value: "enterprise", label: "Enterprise (Custom pricing)" },
];

const featureOptions = [
  { value: "inventory", label: "Inventory Management" },
  { value: "staff", label: "Staff Management" },
  { value: "loyalty", label: "Loyalty Programs" },
  { value: "reservations", label: "Reservations" },
  { value: "kitchen_display", label: "Kitchen Display System" },
  { value: "delivery", label: "Delivery Management" },
  { value: "online_ordering", label: "Online Ordering" },
  { value: "customer_tracking", label: "Customer Tracking" },
  { value: "advanced_reports", label: "Advanced Reports" },
];

export default function POSTenantManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Query to fetch existing POS tenants
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['/api/pos/tenants'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Form for creating new POS tenants
  const form = useForm<POSBusiness>({
    resolver: zodResolver(posBusinessSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      subscriptionType: "basic",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      logoUrl: "",
      primaryColor: "#4F46E5",
      secondaryColor: "#10B981",
      customDomain: "",
      additionalFeatures: [],
      notes: "",
    },
  });

  // Mutation for creating a new POS tenant
  const createTenantMutation = useMutation({
    mutationFn: async (data: POSBusiness) => {
      const response = await apiRequest("POST", "/api/pos/tenants", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tenant created successfully",
        description: `${data.businessName} has been added as a new POS tenant.`,
      });
      setIsCreatingTenant(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/tenants'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for generating a new POS instance
  const generateInstanceMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const response = await apiRequest("POST", `/api/pos/tenants/${tenantId}/generate`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "POS instance generated",
        description: `Instance is ready at ${data.instanceUrl}`,
      });
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/pos/tenants'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate POS instance",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: POSBusiness) => {
    createTenantMutation.mutate(data);
  };

  // Handle instance generation
  const handleGenerateInstance = (tenantId: number) => {
    setIsGenerating(true);
    generateInstanceMutation.mutate(tenantId);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POS Tenant Management</h1>
          <p className="text-muted-foreground">
            Create and manage POS instances for clients with custom branding and features.
          </p>
        </div>
        <Button onClick={() => setIsCreatingTenant(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Tenant
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Tenants</TabsTrigger>
          <TabsTrigger value="pending">Pending Setup</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading tenants...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* For demonstration purposes - will be replaced with actual data */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2">Restaurant</Badge>
                      <CardTitle>Joe's Bistro</CardTitle>
                      <CardDescription>Active since Jan 1, 2025</CardDescription>
                    </div>
                    <div 
                      className="w-12 h-12 rounded bg-cover bg-center" 
                      style={{backgroundColor: "#4F46E5"}}
                    ></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription:</span>
                      <span className="font-medium">Premium</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instances:</span>
                      <span className="font-medium">3 active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="font-medium">joesbistro.paysurity.com</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                  <Button size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2">Retail</Badge>
                      <CardTitle>Urban Threads</CardTitle>
                      <CardDescription>Active since Feb 15, 2025</CardDescription>
                    </div>
                    <div 
                      className="w-12 h-12 rounded bg-cover bg-center" 
                      style={{backgroundColor: "#10B981"}}
                    ></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription:</span>
                      <span className="font-medium">Standard</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instances:</span>
                      <span className="font-medium">1 active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="font-medium">ut-retail.paysurity.com</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                  <Button size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">Healthcare</Badge>
                    <CardTitle>Metro Medical Center</CardTitle>
                    <CardDescription>Created on Mar 28, 2025</CardDescription>
                  </div>
                  <div 
                    className="w-12 h-12 rounded bg-cover bg-center" 
                    style={{backgroundColor: "#0EA5E9"}}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subscription:</span>
                    <span className="font-medium">Enterprise</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-amber-500">Pending Setup</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
                <Button size="sm" onClick={() => handleGenerateInstance(123)}>
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Generate Instance
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <div className="text-center py-10 text-muted-foreground">
            No inactive tenants found.
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog for creating a new tenant */}
      <Dialog open={isCreatingTenant} onOpenChange={setIsCreatingTenant}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New POS Tenant</DialogTitle>
            <DialogDescription>
              Set up a new business with their own branded POS system. After creation, you'll be able to generate their instance.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriptionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subscription" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subscriptionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input placeholder="https://example.com/logo.png" {...field} />
                            <Button type="button" variant="outline" size="icon">
                              <UploadCloud className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter a URL or upload a logo for the business
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Brand Color</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input type="color" className="w-12 p-1 h-10" {...field} />
                            <Input 
                              placeholder="#000000" 
                              value={field.value}
                              onChange={field.onChange}
                              className="flex-1"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Brand Color (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input 
                              type="color" 
                              className="w-12 p-1 h-10" 
                              value={field.value || "#10B981"} 
                              onChange={field.onChange}
                            />
                            <Input 
                              placeholder="#000000" 
                              value={field.value || ""}
                              onChange={field.onChange}
                              className="flex-1"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Domain (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="pos.businessname.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          If left blank, we'll create a [businessname].paysurity.com subdomain
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalFeatures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Features</FormLabel>
                        <FormDescription>
                          Select additional features based on subscription level
                        </FormDescription>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {featureOptions.map((feature) => (
                            <div key={feature.value} className="flex items-center space-x-2">
                              <Switch
                                id={`feature-${feature.value}`}
                                checked={field.value?.includes(feature.value)}
                                onCheckedChange={(checked) => {
                                  const updatedFeatures = checked 
                                    ? [...(field.value || []), feature.value]
                                    : (field.value || []).filter(f => f !== feature.value);
                                  field.onChange(updatedFeatures);
                                }}
                              />
                              <Label htmlFor={`feature-${feature.value}`}>{feature.label}</Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any special requirements or configurations needed..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreatingTenant(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTenantMutation.isPending}>
                  {createTenantMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Tenant"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}