import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardCheck,
  FileCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  Clock,
  Shield,
  Upload,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MerchantVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [verificationDocuments, setVerificationDocuments] = useState<{
    businessLicense?: File;
    identityDocument?: File;
    bankStatement?: File;
    additionalDocs?: File[];
  }>({});
  
  // Fetch the merchant profile data
  const {
    data: merchantProfiles,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["/api/merchant-profiles"],
  });
  
  const merchantProfile = merchantProfiles && merchantProfiles.length > 0 ? merchantProfiles[0] : null;
  
  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async (status: string) => {
      const formData = new FormData();
      formData.append("verificationStatus", status);
      
      // In a real application, we would upload the document files here
      // For this prototype, we'll just mark them as reviewed
      
      const res = await apiRequest("PATCH", `/api/merchant-profiles/${merchantProfile.id}`, {
        verificationStatus: status
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchant-profiles"] });
      
      toast({
        title: "Verification status updated",
        description: "Your verification information has been submitted successfully!",
      });
      
      navigate("/merchant/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating verification status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle document upload
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setVerificationDocuments((prev) => ({
        ...prev,
        [fileType]: file,
      }));
      
      toast({
        title: "File selected",
        description: `${file.name} has been selected.`,
      });
    }
  };
  
  // Handle verification submission
  const handleSubmitVerification = async () => {
    // Check if required documents are uploaded
    if (!verificationDocuments.businessLicense || !verificationDocuments.identityDocument) {
      toast({
        title: "Missing documents",
        description: "Please upload all required documents.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit for verification
    updateVerificationMutation.mutate("pending");
  };
  
  // Determine progress based on merchant verification status
  const getVerificationProgress = () => {
    if (!merchantProfile) return 0;
    
    switch (merchantProfile.verificationStatus) {
      case "verified":
        return 100;
      case "pending":
        return 50;
      case "not_started":
        return 25;
      default:
        return 0;
    }
  };
  
  // Show loading state if data is being fetched
  if (isLoadingProfile) {
    return (
      <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[280px]" />
            <Skeleton className="h-4 w-[340px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid gap-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state if there was an error fetching
  if (profileError || !merchantProfile) {
    return (
      <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {profileError ? 
                "There was an error loading your merchant profile." : 
                "No merchant profile found. Please create a merchant profile first."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => navigate("/merchant/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // If already verified, show verification complete
  if (merchantProfile.verificationStatus === "verified") {
    return (
      <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto my-4 rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Verification Complete</CardTitle>
            <CardDescription>
              Your merchant account has been fully verified and is ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Verified Business</p>
                    <p className="text-sm text-muted-foreground">
                      {merchantProfile.businessName}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Business identity verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Business documents verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Payment processing enabled</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/merchant/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // If verification is pending, show pending status
  if (merchantProfile.verificationStatus === "pending") {
    return (
      <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto my-4 rounded-full bg-yellow-100 p-3 w-16 h-16 flex items-center justify-center">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Verification In Progress</CardTitle>
            <CardDescription>
              Your merchant verification is being reviewed. This process typically takes 1-3 business days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm text-muted-foreground">50%</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-1">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Review In Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {merchantProfile.businessName}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">What happens next?</h3>
              <div className="grid gap-4">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/20 p-1">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Review</p>
                    <p className="text-sm text-muted-foreground">
                      Our team is reviewing your submitted documents
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/20 p-1">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Verification</p>
                    <p className="text-sm text-muted-foreground">
                      We verify your business details and documents
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/20 p-1">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Approval</p>
                    <p className="text-sm text-muted-foreground">
                      Once approved, you'll receive a confirmation email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground w-full text-center mb-2">
              Need help? Contact our support team.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate("/merchant/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Default: Show verification form for not_started status
  return (
    <div className="container max-w-3xl py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Merchant Verification</h1>
          <p className="text-muted-foreground">
            Complete the verification process to unlock all merchant services
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification Progress</span>
            <span className="text-sm text-muted-foreground">
              {getVerificationProgress()}%
            </span>
          </div>
          <Progress value={getVerificationProgress()} className="h-2" />
        </div>
        
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Upload Verification Documents</CardTitle>
                <CardDescription>
                  Please upload the following documents to verify your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business License Upload */}
                <div className="space-y-2">
                  <Label htmlFor="businessLicense" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business License or Registration <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-muted p-2">
                        <Upload className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {verificationDocuments.businessLicense ? 
                          verificationDocuments.businessLicense.name : 
                          "Drag and drop or click to upload"}
                      </p>
                      <Input
                        id="businessLicense"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "businessLicense")}
                      />
                      <Label
                        htmlFor="businessLicense"
                        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      >
                        Select File
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        PDF, PNG, JPG or JPEG (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* ID Verification Upload */}
                <div className="space-y-2">
                  <Label htmlFor="identityDocument" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Identity Document (Passport, ID) <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-muted p-2">
                        <Upload className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {verificationDocuments.identityDocument ? 
                          verificationDocuments.identityDocument.name : 
                          "Drag and drop or click to upload"}
                      </p>
                      <Input
                        id="identityDocument"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "identityDocument")}
                      />
                      <Label
                        htmlFor="identityDocument"
                        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      >
                        Select File
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        PDF, PNG, JPG or JPEG (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Bank Statement Upload */}
                <div className="space-y-2">
                  <Label htmlFor="bankStatement" className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Bank Statement (Optional)
                  </Label>
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-muted p-2">
                        <Upload className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {verificationDocuments.bankStatement ? 
                          verificationDocuments.bankStatement.name : 
                          "Drag and drop or click to upload"}
                      </p>
                      <Input
                        id="bankStatement"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "bankStatement")}
                      />
                      <Label
                        htmlFor="bankStatement"
                        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      >
                        Select File
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        PDF, PNG, JPG or JPEG (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea 
                    id="additionalInfo" 
                    placeholder="Provide any additional information that might help with verification"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/merchant/dashboard")}
                  >
                    Save for Later
                  </Button>
                  <Button
                    onClick={handleSubmitVerification}
                    disabled={
                      updateVerificationMutation.isPending ||
                      !verificationDocuments.businessLicense ||
                      !verificationDocuments.identityDocument
                    }
                  >
                    {updateVerificationMutation.isPending ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Requirements Tab */}
          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Verification Requirements</CardTitle>
                <CardDescription>
                  Learn about the requirements for merchant verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Business Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Proof of business registration, such as a business license, articles of incorporation, or other government-issued business documentation.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Identity Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        Valid government-issued photo ID of the business owner or authorized representative. This could be a passport, driver's license, or national ID card.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Financial Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Recent bank statement (within the last 3 months) or financial records to verify your business's financial stability.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Compliance Requirements</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensure your business complies with all relevant regulations, including KYC (Know Your Customer) and AML (Anti-Money Laundering) requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => document.getElementById("documents-tab")?.click()}
                >
                  Start Document Upload
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions about merchant verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">How long does verification take?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verification typically takes 1-3 business days after all required documents are submitted. You'll be notified via email once the review is complete.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium">Can I use the platform while waiting for verification?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Yes, you can set up your merchant profile and explore the platform, but certain features like processing payments and accessing advanced tools will only be available after verification is complete.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium">What if my verification is rejected?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      If your verification is rejected, you'll receive an email with the specific reasons. You can then address those issues and resubmit your application.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium">Is my information secure?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Yes, all your documents and information are encrypted and stored securely. We comply with the highest security standards to protect your sensitive data.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium">What happens after verification?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Once verified, you'll have full access to all merchant features including payment processing, loyalty programs, promotional tools, analytics, and more.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => document.getElementById("documents-tab")?.click()}
                >
                  Start Document Upload
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}