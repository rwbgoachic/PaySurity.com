import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  CreditCard, 
  Store, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  ChevronRight 
} from "lucide-react";

// Form validation schema
const merchantFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessDescription: z.string().optional(),
  businessType: z.string().min(1, "Please select a business type"),
  merchantType: z.string().min(1, "Please select a merchant type"),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  streetAddress: z.string().min(5, "Please enter a valid street address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  postalCode: z.string().min(5, "Please enter a valid postal code"),
  country: z.string().min(2, "Please enter a valid country"),
  taxId: z.string().optional(),
  referralCode: z.string().optional(),
});

type MerchantFormValues = z.infer<typeof merchantFormSchema>;

export default function MerchantOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);

  // Multi-step form states
  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      businessName: "",
      businessDescription: "",
      businessType: "",
      merchantType: "",
      websiteUrl: "",
      contactEmail: user?.email || "",
      contactPhone: "",
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      taxId: "",
      referralCode: "",
    },
  });

  // Create merchant profile mutation
  const createMerchantMutation = useMutation({
    mutationFn: async (data: MerchantFormValues) => {
      const res = await apiRequest("POST", "/api/merchant-profiles", {
        ...data,
        userId: user?.id,
        status: "pending",
        verificationStatus: "not_started",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchant-profiles"] });
      
      toast({
        title: "Merchant profile created",
        description: "Your merchant profile has been created successfully!",
      });
      
      navigate("/merchant/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating merchant profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission for basic information (step 1)
  const handleBasicInfoNext = async () => {
    const isValid = await form.trigger([
      "businessName", 
      "businessDescription", 
      "businessType",
      "merchantType"
    ]);
    
    if (isValid) {
      setStep(2);
    }
  };

  // Handle form submission for contact information (step 2)
  const handleContactInfoNext = async () => {
    const isValid = await form.trigger([
      "contactEmail", 
      "contactPhone", 
      "websiteUrl"
    ]);
    
    if (isValid) {
      setStep(3);
    }
  };

  // Handle form submission for location information (step 3)
  const handleLocationNext = async () => {
    const isValid = await form.trigger([
      "streetAddress", 
      "city", 
      "state", 
      "postalCode", 
      "country"
    ]);
    
    if (isValid) {
      setStep(4);
    }
  };

  // Handle final form submission
  const onSubmit = (data: MerchantFormValues) => {
    createMerchantMutation.mutate(data);
  };

  // Business types options
  const businessTypes = [
    { value: "retail", label: "Retail Store" },
    { value: "restaurant", label: "Restaurant" },
    { value: "service", label: "Service Provider" },
    { value: "online", label: "Online Business" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" },
  ];

  // Merchant types options
  const merchantTypes = [
    { value: "small_business", label: "Small Business" },
    { value: "medium_business", label: "Medium Business" },
    { value: "large_business", label: "Large Business" },
    { value: "sole_proprietor", label: "Sole Proprietor" },
    { value: "nonprofit", label: "Non-Profit Organization" },
    { value: "government", label: "Government Entity" },
  ];

  // Step indicator
  const steps = [
    { number: 1, label: "Business Information" },
    { number: 2, label: "Contact Information" },
    { number: 3, label: "Location" },
    { number: 4, label: "Review & Submit" },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to create a merchant profile.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Become a Merchant</h1>
          <p className="text-muted-foreground">
            Fill out the form below to create your merchant profile and access value-added services.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex justify-between">
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= s.number 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {step > s.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  s.number
                )}
              </div>
              <span className={`text-xs mt-2 ${step >= s.number ? "text-primary" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Business Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your business (products, services, etc.)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="merchantType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merchant Size</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select merchant type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {merchantTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate("/merchant/dashboard")}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleBasicInfoNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>
                    How can customers reach your business?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@business.com" {...field} />
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
                        <FormLabel>Business Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourbusiness.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional. Enter your business website URL if you have one.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleContactInfoNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 3: Location Information */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                  <CardDescription>
                    Where is your business located?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Tax ID / EIN" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your business tax ID or EIN (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleLocationNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 4: Review and Submit */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>
                    Please review your information before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Business Information
                    </h3>
                    <Separator className="my-2" />
                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-medium">Business Name:</dt>
                        <dd>{form.getValues("businessName")}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Business Type:</dt>
                        <dd className="capitalize">{form.getValues("businessType").replace("_", " ")}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-medium">Business Description:</dt>
                        <dd>{form.getValues("businessDescription") || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Merchant Size:</dt>
                        <dd className="capitalize">{form.getValues("merchantType").replace("_", " ")}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </h3>
                    <Separator className="my-2" />
                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-medium">Email:</dt>
                        <dd>{form.getValues("contactEmail")}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Phone:</dt>
                        <dd>{form.getValues("contactPhone")}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-medium">Website:</dt>
                        <dd>{form.getValues("websiteUrl") || "Not provided"}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location Information
                    </h3>
                    <Separator className="my-2" />
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <dt className="font-medium">Address:</dt>
                        <dd>
                          {form.getValues("streetAddress")}, {form.getValues("city")}, {form.getValues("state")} {form.getValues("postalCode")}, {form.getValues("country")}
                        </dd>
                      </div>
                      {form.getValues("taxId") && (
                        <div>
                          <dt className="font-medium">Tax ID:</dt>
                          <dd>{form.getValues("taxId")}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  {/* Referral Code Section */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4" />
                      Referral Information
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      If you were referred by an affiliate, please enter their referral code below.
                    </p>
                    <FormField
                      control={form.control}
                      name="referralCode"
                      render={({ field }) => {
                        const [validatingCode, setValidatingCode] = useState(false);
                        const [validCode, setValidCode] = useState(false);
                        const [affiliateInfo, setAffiliateInfo] = useState<{id: number, name: string, referralCode: string} | null>(null);
                        
                        // Function to validate the referral code
                        const validateReferralCode = async (code: string | undefined) => {
                          if (!code) return;
                          
                          setValidatingCode(true);
                          try {
                            const response = await fetch(`/api/validate-referral-code/${code}`);
                            const data = await response.json();
                            
                            if (data.valid) {
                              setValidCode(true);
                              setAffiliateInfo(data.affiliate);
                            } else {
                              setValidCode(false);
                              setAffiliateInfo(null);
                            }
                          } catch (error) {
                            setValidCode(false);
                            setAffiliateInfo(null);
                          } finally {
                            setValidatingCode(false);
                          }
                        };
                        
                        return (
                          <FormItem>
                            <FormLabel>Referral Code (Optional)</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input 
                                  placeholder="Enter referral code if you have one" 
                                  {...field} 
                                  onChange={(e) => {
                                    field.onChange(e);
                                    // Remove validation if field is cleared
                                    if (!e.target.value) {
                                      setValidCode(false);
                                      setAffiliateInfo(null);
                                    }
                                  }}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => field.value && validateReferralCode(field.value)}
                                disabled={!field.value || validatingCode}
                                size="sm"
                              >
                                {validatingCode ? "Checking..." : "Verify"}
                              </Button>
                            </div>
                            
                            {validCode && affiliateInfo && (
                              <div className="mt-2 p-3 bg-muted/50 rounded-md border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Referred by:</p>
                                <p className="text-sm font-medium">{affiliateInfo.name}</p>
                                <p className="text-xs text-muted-foreground">Code: {affiliateInfo.referralCode}</p>
                              </div>
                            )}
                            
                            <FormDescription>
                              Leave blank if you don't have a referral code.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMerchantMutation.isPending}
                  >
                    {createMerchantMutation.isPending ? "Submitting..." : "Create Merchant Profile"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}