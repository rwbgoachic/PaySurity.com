import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckCircle, Calendar, Building2, MapPin, CreditCard } from "lucide-react";

// Define the schemas for each step
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

const businessInfoSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(1, "Please select a business type"),
  industry: z.string().min(1, "Please select an industry"),
  yearsInBusiness: z.string().min(1, "Please select years in business"),
  estimatedMonthlyVolume: z.string().min(1, "Please select an estimated monthly volume"),
  businessDescription: z.string().optional(),
  employeeCount: z.string().min(1, "Please select number of employees"),
});

const addressInfoSchema = z.object({
  address1: z.string().min(5, "Address must be at least 5 characters"),
  address2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "Please select a state"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  country: z.string().min(2, "Please select a country").default("US"),
});

const paymentProcessingSchema = z.object({
  acceptsCardPresent: z.boolean().optional(),
  acceptsOnlinePayments: z.boolean().optional(),
  acceptsACH: z.boolean().optional(),
  acceptsRecurringPayments: z.boolean().optional(),
  needsPOS: z.boolean().optional(),
  needsPaymentGateway: z.boolean().optional(),
  currentProcessor: z.string().optional(),
});

// Create types from the schemas
type PersonalInfo = z.infer<typeof personalInfoSchema>;
type BusinessInfo = z.infer<typeof businessInfoSchema>;
type AddressInfo = z.infer<typeof addressInfoSchema>;
type PaymentProcessing = z.infer<typeof paymentProcessingSchema>;

// Combined application schema
const applicationSchema = z.object({
  personalInfo: personalInfoSchema,
  businessInfo: businessInfoSchema,
  addressInfo: addressInfoSchema,
  paymentProcessing: paymentProcessingSchema,
});

type Application = z.infer<typeof applicationSchema>;

export default function OnboardingWizard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [application, setApplication] = useState<Application>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    businessInfo: {
      businessName: "",
      businessType: "",
      industry: "",
      yearsInBusiness: "",
      estimatedMonthlyVolume: "",
      businessDescription: "",
      employeeCount: "",
    },
    addressInfo: {
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
    paymentProcessing: {
      acceptsCardPresent: false,
      acceptsOnlinePayments: false,
      acceptsACH: false,
      acceptsRecurringPayments: false,
      needsPOS: false,
      needsPaymentGateway: false,
      currentProcessor: "",
    },
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Personal Info Form
  const personalInfoForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: application.personalInfo,
  });

  // Business Info Form
  const businessInfoForm = useForm<BusinessInfo>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: application.businessInfo,
  });

  // Address Info Form
  const addressInfoForm = useForm<AddressInfo>({
    resolver: zodResolver(addressInfoSchema),
    defaultValues: application.addressInfo,
  });

  // Payment Processing Form
  const paymentProcessingForm = useForm<PaymentProcessing>({
    resolver: zodResolver(paymentProcessingSchema),
    defaultValues: application.paymentProcessing,
  });

  // Mutation for submitting the application
  const submitApplication = useMutation({
    mutationFn: async (data: Application) => {
      const response = await apiRequest("POST", "/api/merchant/applications", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setApplicationId(data.applicationId);
      setFormSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Your merchant application has been submitted successfully. We'll review it shortly.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit application: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle step submission
  const handleStepSubmit = (stepData: any, nextStep: number) => {
    let updatedApplication = { ...application };
    
    switch (step) {
      case 1:
        updatedApplication.personalInfo = stepData;
        break;
      case 2:
        updatedApplication.businessInfo = stepData;
        break;
      case 3:
        updatedApplication.addressInfo = stepData;
        break;
      case 4:
        updatedApplication.paymentProcessing = stepData;
        break;
    }
    
    setApplication(updatedApplication);
    
    if (nextStep === 5) {
      // Final step, submit the application
      submitApplication.mutate(updatedApplication);
    } else {
      // Move to the next step
      setStep(nextStep);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Show confirmation screen after submission
  if (formSubmitted && applicationId) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <CardTitle className="text-center text-3xl">Application Submitted!</CardTitle>
            <CardDescription className="text-center text-gray-100 text-lg">
              Thank you for applying to become a Paysurity merchant.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6 text-center">
            <h3 className="text-xl font-semibold mb-2">What happens next?</h3>
            <p className="mb-4">
              Your application has been received and is now being reviewed by our team. 
              You'll be notified via email about the status of your application.
            </p>
            <div className="bg-gray-100 p-4 rounded-md my-4">
              <p className="font-medium">Application Reference:</p>
              <p className="text-xl font-bold text-blue-700">{applicationId}</p>
            </div>
            <p className="text-gray-600 text-sm">
              Please save this reference number for future communications.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.href = "/"} className="bg-blue-600 hover:bg-blue-700 px-8">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render different form based on current step
  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <Form {...personalInfoForm}>
            <form onSubmit={personalInfoForm.handleSubmit(data => handleStepSubmit(data, 2))} className="space-y-6">
              <div className="flex items-center space-x-2 mb-4 text-blue-700">
                <Calendar className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={personalInfoForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalInfoForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={personalInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john.smith@example.com" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalInfoForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="(123) 456-7890" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );
      case 2:
        return (
          <Form {...businessInfoForm}>
            <form onSubmit={businessInfoForm.handleSubmit(data => handleStepSubmit(data, 3))} className="space-y-6">
              <div className="flex items-center space-x-2 mb-4 text-blue-700">
                <Building2 className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Business Information</h2>
              </div>
              <FormField
                control={businessInfoForm.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Business LLC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={businessInfoForm.control}
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
                          <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="nonprofit">Non-Profit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessInfoForm.control}
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
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="restaurant">Restaurant/Food Service</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="professional_services">Professional Services</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="hospitality">Hospitality</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={businessInfoForm.control}
                  name="yearsInBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years in Business</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="startup">Startup/Not yet operating</SelectItem>
                          <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                          <SelectItem value="1_to_2">1-2 years</SelectItem>
                          <SelectItem value="3_to_5">3-5 years</SelectItem>
                          <SelectItem value="6_to_10">6-10 years</SelectItem>
                          <SelectItem value="over_10">Over 10 years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessInfoForm.control}
                  name="estimatedMonthlyVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Monthly Sales Volume</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select volume" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under_5k">Under $5,000</SelectItem>
                          <SelectItem value="5k_to_10k">$5,000 - $10,000</SelectItem>
                          <SelectItem value="10k_to_25k">$10,000 - $25,000</SelectItem>
                          <SelectItem value="25k_to_50k">$25,000 - $50,000</SelectItem>
                          <SelectItem value="50k_to_100k">$50,000 - $100,000</SelectItem>
                          <SelectItem value="over_100k">Over $100,000</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={businessInfoForm.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee count" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Just me</SelectItem>
                        <SelectItem value="2_to_5">2-5 employees</SelectItem>
                        <SelectItem value="6_to_10">6-10 employees</SelectItem>
                        <SelectItem value="11_to_50">11-50 employees</SelectItem>
                        <SelectItem value="51_to_200">51-200 employees</SelectItem>
                        <SelectItem value="over_200">Over 200 employees</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={businessInfoForm.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us more about your business and what you sell or offer..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of your products or services.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );
      case 3:
        return (
          <Form {...addressInfoForm}>
            <form onSubmit={addressInfoForm.handleSubmit(data => handleStepSubmit(data, 4))} className="space-y-6">
              <div className="flex items-center space-x-2 mb-4 text-blue-700">
                <MapPin className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Business Address</h2>
              </div>
              <FormField
                control={addressInfoForm.control}
                name="address1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressInfoForm.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Suite 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={addressInfoForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressInfoForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="AK">Alaska</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          <SelectItem value="AR">Arkansas</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="CO">Colorado</SelectItem>
                          <SelectItem value="CT">Connecticut</SelectItem>
                          <SelectItem value="DE">Delaware</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="GA">Georgia</SelectItem>
                          <SelectItem value="HI">Hawaii</SelectItem>
                          <SelectItem value="ID">Idaho</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                          <SelectItem value="IN">Indiana</SelectItem>
                          <SelectItem value="IA">Iowa</SelectItem>
                          <SelectItem value="KS">Kansas</SelectItem>
                          <SelectItem value="KY">Kentucky</SelectItem>
                          <SelectItem value="LA">Louisiana</SelectItem>
                          <SelectItem value="ME">Maine</SelectItem>
                          <SelectItem value="MD">Maryland</SelectItem>
                          <SelectItem value="MA">Massachusetts</SelectItem>
                          <SelectItem value="MI">Michigan</SelectItem>
                          <SelectItem value="MN">Minnesota</SelectItem>
                          <SelectItem value="MS">Mississippi</SelectItem>
                          <SelectItem value="MO">Missouri</SelectItem>
                          <SelectItem value="MT">Montana</SelectItem>
                          <SelectItem value="NE">Nebraska</SelectItem>
                          <SelectItem value="NV">Nevada</SelectItem>
                          <SelectItem value="NH">New Hampshire</SelectItem>
                          <SelectItem value="NJ">New Jersey</SelectItem>
                          <SelectItem value="NM">New Mexico</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="NC">North Carolina</SelectItem>
                          <SelectItem value="ND">North Dakota</SelectItem>
                          <SelectItem value="OH">Ohio</SelectItem>
                          <SelectItem value="OK">Oklahoma</SelectItem>
                          <SelectItem value="OR">Oregon</SelectItem>
                          <SelectItem value="PA">Pennsylvania</SelectItem>
                          <SelectItem value="RI">Rhode Island</SelectItem>
                          <SelectItem value="SC">South Carolina</SelectItem>
                          <SelectItem value="SD">South Dakota</SelectItem>
                          <SelectItem value="TN">Tennessee</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="UT">Utah</SelectItem>
                          <SelectItem value="VT">Vermont</SelectItem>
                          <SelectItem value="VA">Virginia</SelectItem>
                          <SelectItem value="WA">Washington</SelectItem>
                          <SelectItem value="WV">West Virginia</SelectItem>
                          <SelectItem value="WI">Wisconsin</SelectItem>
                          <SelectItem value="WY">Wyoming</SelectItem>
                          <SelectItem value="DC">District of Columbia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={addressInfoForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressInfoForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        );
      case 4:
        return (
          <Form {...paymentProcessingForm}>
            <form onSubmit={paymentProcessingForm.handleSubmit(data => handleStepSubmit(data, 5))} className="space-y-6">
              <div className="flex items-center space-x-2 mb-4 text-blue-700">
                <CreditCard className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Payment Processing Needs</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Tell us about your payment processing needs so we can recommend the best solution for your business.
              </p>
              <div className="space-y-4">
                <h3 className="font-medium">Payment Types Needed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={paymentProcessingForm.control}
                    name="acceptsCardPresent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>In-Person Payments</FormLabel>
                          <FormDescription>
                            Card-present transactions at a physical location
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentProcessingForm.control}
                    name="acceptsOnlinePayments"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Online Payments</FormLabel>
                          <FormDescription>
                            E-commerce or website payments
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentProcessingForm.control}
                    name="acceptsACH"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>ACH/Bank Transfers</FormLabel>
                          <FormDescription>
                            Direct bank-to-bank payments
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentProcessingForm.control}
                    name="acceptsRecurringPayments"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Recurring Payments</FormLabel>
                          <FormDescription>
                            Subscriptions or scheduled billing
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-medium">Additional Services</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={paymentProcessingForm.control}
                    name="needsPOS"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Point of Sale (POS) System</FormLabel>
                          <FormDescription>
                            Complete solution for in-person sales
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentProcessingForm.control}
                    name="needsPaymentGateway"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Payment Gateway</FormLabel>
                          <FormDescription>
                            For online transaction processing
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <FormField
                  control={paymentProcessingForm.control}
                  name="currentProcessor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Payment Processor (if any)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Square, Stripe, PayPal, etc." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Let us know if you're switching from another provider
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={submitApplication.isPending}
                >
                  {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        );
      default:
        return null;
    }
  };

  // Progress indicator
  const ProgressIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between">
          <div className={`text-center ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>Personal</div>
          <div className={`text-center ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>Business</div>
          <div className={`text-center ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>Address</div>
          <div className={`text-center ${step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>Processing</div>
        </div>
        <div className="relative mt-2">
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200"></div>
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300" 
            style={{ width: `${(step - 1) * (100 / 3)}%` }}
          ></div>
          <div className="relative flex justify-between">
            <div className={`w-6 h-6 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'} flex items-center justify-center text-white text-sm`}>
              1
            </div>
            <div className={`w-6 h-6 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'} flex items-center justify-center text-white text-sm`}>
              2
            </div>
            <div className={`w-6 h-6 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'} flex items-center justify-center text-white text-sm`}>
              3
            </div>
            <div className={`w-6 h-6 rounded-full ${step >= 4 ? 'bg-blue-600' : 'bg-gray-200'} flex items-center justify-center text-white text-sm`}>
              4
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardTitle className="text-2xl text-center">Merchant Application</CardTitle>
          <CardDescription className="text-center text-gray-100">
            Join Paysurity's network of merchants and start accepting payments today.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <ProgressIndicator />
          {renderForm()}
        </CardContent>
      </Card>
    </div>
  );
}