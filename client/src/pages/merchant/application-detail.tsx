import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  MapPin, 
  CreditCard,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Types
type MerchantApplication = {
  id: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    industry: string;
    yearsInBusiness: string;
    estimatedMonthlyVolume: string;
    businessDescription?: string;
    employeeCount: string;
    website?: string;
  };
  addressInfo: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentProcessing: {
    acceptsCardPresent?: boolean;
    acceptsOnlinePayments?: boolean;
    acceptsACH?: boolean;
    acceptsRecurringPayments?: boolean;
    needsPOS?: boolean;
    needsPaymentGateway?: boolean;
    currentProcessor?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Status badge styling
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  reviewing: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  approved: "bg-green-100 text-green-800 hover:bg-green-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
};

// Status icons
const statusIcons = {
  pending: <Clock className="h-5 w-5 mr-2" />,
  reviewing: <RefreshCw className="h-5 w-5 mr-2" />,
  approved: <CheckCircle2 className="h-5 w-5 mr-2" />,
  rejected: <XCircle className="h-5 w-5 mr-2" />,
};

export default function ApplicationDetailPage() {
  const [path] = useLocation();
  const id = path.split("/")[3];
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [notes, setNotes] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusToChange, setStatusToChange] = useState<string | null>(null);
  
  // Fetch application details
  const {
    data: application,
    isLoading,
    isError,
    refetch,
  } = useQuery<MerchantApplication>({
    queryKey: ["/api/merchant/applications", id],
    queryFn: async () => {
      const response = await fetch(`/api/merchant/applications/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch application details");
      }
      const data = await response.json();
      setNotes(data.notes || "");
      return data;
    },
    enabled: !!id && !!user && user.role === "admin",
  });
  
  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      const response = await apiRequest("PATCH", `/api/merchant/applications/${id}`, {
        status,
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: `Application status has been changed to ${statusToChange}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/merchant/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/merchant/applications"] });
      setStatusModalOpen(false);
      setStatusToChange(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update application status",
        variant: "destructive",
      });
    },
  });
  
  // Redirect non-admin users
  if (user && user.role !== "admin") {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }
  
  const handleUpdateStatus = () => {
    if (!statusToChange) return;
    
    updateStatusMutation.mutate({
      status: statusToChange,
      notes,
    });
  };
  
  const formatCurrency = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    return isNaN(num) 
      ? value 
      : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/merchant/applications-management")}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Applications
        </Button>
        <h1 className="text-3xl font-bold">Merchant Application</h1>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-500">Error loading application</h3>
          <p className="mb-4">Unable to fetch the merchant application details from the server.</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      ) : application ? (
        <>
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">{application.businessInfo.businessName}</CardTitle>
                  <CardDescription>
                    Application ID: {application.id}
                  </CardDescription>
                </div>
                <Badge 
                  className={`text-base px-3 py-1.5 ${statusColors[application.status]}`}
                  variant="outline"
                >
                  {statusIcons[application.status]}
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Industry</div>
                    <div>{application.businessInfo.industry}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Contact</div>
                    <div>{application.personalInfo.firstName} {application.personalInfo.lastName}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Submitted On</div>
                    <div>{new Date(application.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 border-t rounded-b-lg p-4">
              <div>
                <h4 className="font-medium">Current Status</h4>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Change Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Application Status</DialogTitle>
                      <DialogDescription>
                        Change the status for {application.businessInfo.businessName}'s application
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <Button
                        variant={statusToChange === "pending" ? "default" : "outline"}
                        className="flex justify-center items-center py-6"
                        onClick={() => setStatusToChange("pending")}
                      >
                        <Clock className="h-6 w-6 mb-2" />
                        <span className="block">Pending</span>
                      </Button>
                      
                      <Button
                        variant={statusToChange === "reviewing" ? "default" : "outline"}
                        className="flex justify-center items-center py-6"
                        onClick={() => setStatusToChange("reviewing")}
                      >
                        <RefreshCw className="h-6 w-6 mb-2" />
                        <span className="block">Reviewing</span>
                      </Button>
                      
                      <Button
                        variant={statusToChange === "approved" ? "default" : "outline"}
                        className="flex justify-center items-center py-6"
                        onClick={() => setStatusToChange("approved")}
                      >
                        <CheckCircle2 className="h-6 w-6 mb-2" />
                        <span className="block">Approved</span>
                      </Button>
                      
                      <Button
                        variant={statusToChange === "rejected" ? "default" : "outline"}
                        className="flex justify-center items-center py-6"
                        onClick={() => setStatusToChange("rejected")}
                      >
                        <XCircle className="h-6 w-6 mb-2" />
                        <span className="block">Rejected</span>
                      </Button>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <Textarea
                        placeholder="Add notes about this status change..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateStatus}
                        disabled={!statusToChange || updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject This Application?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the application as rejected. The merchant will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Rejection Notes</label>
                      <Textarea
                        placeholder="Add notes about why this application is being rejected..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setStatusToChange("rejected");
                          updateStatusMutation.mutate({
                            status: "rejected",
                            notes,
                          });
                        }}
                      >
                        Reject Application
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
          
          <Tabs defaultValue="details" className="mb-8">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="details">Application Details</TabsTrigger>
              <TabsTrigger value="processing">Payment Processing</TabsTrigger>
              <TabsTrigger value="notes">Notes & History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Business Name</h4>
                      <p>{application.businessInfo.businessName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Business Type</h4>
                      <p>{application.businessInfo.businessType}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
                      <p>{application.businessInfo.industry}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Years in Business</h4>
                      <p>{application.businessInfo.yearsInBusiness}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Estimated Monthly Volume</h4>
                      <p>{formatCurrency(application.businessInfo.estimatedMonthlyVolume)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Employee Count</h4>
                      <p>{application.businessInfo.employeeCount}</p>
                    </div>
                    {application.businessInfo.website && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Website</h4>
                        <p>
                          <a 
                            href={application.businessInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {application.businessInfo.website}
                          </a>
                        </p>
                      </div>
                    )}
                    {application.businessInfo.businessDescription && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Business Description</h4>
                        <p className="whitespace-pre-wrap">{application.businessInfo.businessDescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                        <p>{application.personalInfo.firstName} {application.personalInfo.lastName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                        <p>
                          <a href={`mailto:${application.personalInfo.email}`} className="text-blue-600 hover:underline">
                            {application.personalInfo.email}
                          </a>
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                        <p>
                          <a href={`tel:${application.personalInfo.phone}`} className="text-blue-600 hover:underline">
                            {application.personalInfo.phone}
                          </a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Business Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Street Address</h4>
                        <p>{application.addressInfo.address1}</p>
                        {application.addressInfo.address2 && (
                          <p>{application.addressInfo.address2}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">City, State, ZIP</h4>
                        <p>
                          {application.addressInfo.city}, {application.addressInfo.state} {application.addressInfo.zipCode}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Country</h4>
                        <p>{application.addressInfo.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="processing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Processing Requirements
                  </CardTitle>
                  <CardDescription>
                    Details about the merchant's payment processing needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Payment Types</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${application.paymentProcessing.acceptsCardPresent ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Card-Present Transactions
                          </li>
                          <li className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${application.paymentProcessing.acceptsOnlinePayments ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Online Payments
                          </li>
                          <li className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${application.paymentProcessing.acceptsACH ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            ACH Transactions
                          </li>
                          <li className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${application.paymentProcessing.acceptsRecurringPayments ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Recurring Payments
                          </li>
                        </ul>
                      </div>
                      
                      {application.paymentProcessing.currentProcessor && (
                        <div>
                          <h4 className="font-medium mb-2">Current Processor</h4>
                          <p>{application.paymentProcessing.currentProcessor}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Service Requirements</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${application.paymentProcessing.needsPOS ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Point of Sale System
                          </li>
                          <li className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${application.paymentProcessing.needsPaymentGateway ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Payment Gateway
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recommended Solutions</h4>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          {application.paymentProcessing.needsPOS && (
                            <li>
                              <span className="font-medium">POS System:</span> {application.businessInfo.industry === "Restaurant" ? "BistroBeast" : "Paysurity POS"}
                            </li>
                          )}
                          {application.paymentProcessing.acceptsCardPresent && (
                            <li>
                              <span className="font-medium">Card-Present:</span> Helcim Terminal Integration
                            </li>
                          )}
                          {application.paymentProcessing.acceptsOnlinePayments && (
                            <li>
                              <span className="font-medium">Online Gateway:</span> Paysurity PayPortal
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Application History</CardTitle>
                  <CardDescription>
                    View and update notes on this application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Application Notes</h4>
                    <Textarea
                      placeholder="Add notes about this application..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={6}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={() => {
                          updateStatusMutation.mutate({
                            status: application.status,
                            notes,
                          });
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? "Saving..." : "Save Notes"}
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-4">Application Timeline</h4>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="h-full w-px bg-gray-200 my-1"></div>
                        </div>
                        <div>
                          <h5 className="font-medium">Application Submitted</h5>
                          <p className="text-sm text-muted-foreground">
                            {new Date(application.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm mt-1">
                            {application.businessInfo.businessName} submitted a new merchant application
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {statusIcons[application.status]}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium">Current Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}</h5>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(application.updatedAt).toLocaleString()}
                          </p>
                          {application.notes && (
                            <p className="text-sm mt-1 whitespace-pre-wrap">{application.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold">Application Not Found</h3>
          <p className="mb-4">The merchant application you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/merchant/applications-management")}>
            Return to Applications
          </Button>
        </Card>
      )}
    </div>
  );
}