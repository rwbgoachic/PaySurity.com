import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, FileQuestion, Loader2, Plus, DollarSign, FileText, LifeBuoy, Presentation, RotateCcw, UserPlus, UserCheck, CheckCircle2, Video, XCircle, Download, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Type definitions
type MerchantProfile = {
  id: number;
  businessName: string;
  businessType: string;
  status: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isoPartnerId: number;
  estimatedMonthlyVolume?: string;
  processingVolume?: string;
  commission?: string;
  dateEnrolled?: string;
  createdAt: Date;
};

type Commission = {
  id: number;
  merchantId: number;
  merchantName: string;
  isoPartnerId: number;
  amount: string;
  date: string | Date;
  status: string;
  createdAt: Date;
};

type TrainingDocument = {
  id: number;
  title: string;
  description: string;
  link: string;
  documentType: string;
  category: string;
  createdAt: Date;
};

// Insert types
type InsertMerchantProfile = Omit<MerchantProfile, 'id' | 'createdAt'>;
type InsertSupportTicket = {
  isoPartnerId?: number;
  subject: string;
  description: string;
  priority: string;
  status?: string;
  merchantId?: number;
};

// Custom hooks
function useMerchants() {
  return useQuery({
    queryKey: ['/api/iso-partner/merchants'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/iso-partner/merchants');
      if (!response.ok) {
        throw new Error('Failed to fetch merchants');
      }
      return response.json();
    }
  });
}

function useCommissions() {
  return useQuery({
    queryKey: ['/api/iso-partner/commissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/iso-partner/commissions');
      if (!response.ok) {
        throw new Error('Failed to fetch commissions');
      }
      return response.json();
    }
  });
}

function useTrainingDocuments() {
  return useQuery({
    queryKey: ['/api/training-documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/training-documents');
      if (!response.ok) {
        throw new Error('Failed to fetch training documents');
      }
      return response.json();
    }
  });
}

function usePaymentNews() {
  return useQuery({
    queryKey: ['/api/news/payment-industry'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/news/payment-industry');
        if (!response.ok) {
          throw new Error('Failed to fetch payment industry news');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching payment news:", error);
        throw error;
      }
    }
  });
}

function useCreateMerchant() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (merchantData: Partial<InsertMerchantProfile>) => {
      const response = await apiRequest('POST', '/api/merchants', merchantData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create merchant');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/iso-partner/merchants'] });
      toast({
        title: "Merchant Enrollment Successful",
        description: "The merchant has been enrolled and is pending approval",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Merchant Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

function useCreateSupportTicket() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (ticketData: InsertSupportTicket) => {
      const response = await apiRequest('POST', '/api/support-tickets', ticketData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create support ticket');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been submitted to our team",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Support Ticket Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Type definition for News item
type NewsItem = {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
};

// News Section Component
function NewsSection() {
  const { data: newsItems = [], isLoading, error } = usePaymentNews();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-80" />
        <p>Error loading news: {error.message}</p>
        <p className="text-sm mt-2">Please try again later or contact support.</p>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>No payment industry news available at the moment.</p>
        <p className="text-sm mt-2">Check back soon for updates.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {newsItems.map((item: NewsItem, index: number) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="mr-2">{item.source.name}</Badge>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(item.publishedAt).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {item.description || "No description available"}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                Read More <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function IsoDashboard() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: 'retail',
    estimatedMonthlyVolume: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });
  const [ticketData, setTicketData] = useState({
    subject: '',
    merchantId: 'all',
    priority: 'medium',
    description: ''
  });

  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // React Query Hooks
  const { 
    data: merchants = [], 
    isLoading: merchantsLoading 
  } = useMerchants();
  
  const { 
    data: commissions = [], 
    isLoading: commissionsLoading 
  } = useCommissions();
  
  const { 
    data: trainingDocs = [], 
    isLoading: docsLoading 
  } = useTrainingDocuments();

  const createMerchantMutation = useCreateMerchant();
  const createTicketMutation = useCreateSupportTicket();

  // Check if any data is still loading
  const isLoading = authLoading || merchantsLoading || commissionsLoading || docsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Redirect if not authenticated or not an affiliate/ISO
  if (!user) {
    return <Redirect to="/auth?returnTo=/iso-dashboard" />;
  }

  // We would normally verify the role here, but for now we'll display for everyone
  // if (user.role !== "iso_partner") {
  //   return <Redirect to="/" />;
  // }

  // Handler for merchant enrollment form submission
  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const merchantData = {
      ...formData,
      isoPartnerId: user.id,
      status: 'pending'
    };
    
    createMerchantMutation.mutate(merchantData, {
      onSuccess: () => {
        setFormData({
          businessName: '',
          contactName: '',
          email: '',
          phone: '',
          businessType: 'retail',
          estimatedMonthlyVolume: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          notes: ''
        });
        setEnrollOpen(false);
      }
    });
  };

  // Handler for support ticket submission
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ticketPayload = {
      ...ticketData,
      isoPartnerId: user.id,
      status: 'open',
      merchantId: ticketData.merchantId === 'all' ? undefined : parseInt(ticketData.merchantId)
    };
    
    createTicketMutation.mutate(ticketPayload, {
      onSuccess: () => {
        setTicketData({
          subject: '',
          merchantId: 'all',
          priority: 'medium',
          description: ''
        });
        setTicketOpen(false);
      }
    });
  };

  // Form input change handlers
  const handleMerchantFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTicketFormChange = (field: string, value: string) => {
    setTicketData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate total commission for the dashboard
  const totalCommission = commissions.reduce((total: number, commission: Commission) => {
    return total + parseFloat(commission.amount.replace('$', ''));
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">ISO Partner Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Enroll Merchant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Enroll a New Merchant</DialogTitle>
                <DialogDescription>
                  Enter the merchant details to start the enrollment process.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMerchantSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="businessName" className="text-right">
                      Business Name
                    </Label>
                    <Input id="businessName" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contactName" className="text-right">
                      Contact Name
                    </Label>
                    <Input id="contactName" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" type="email" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input id="phone" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="businessType" className="text-right">
                      Business Type
                    </Label>
                    <Select defaultValue="retail">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="estimatedVolume" className="text-right">
                      Est. Monthly Volume
                    </Label>
                    <Input id="estimatedVolume" placeholder="$" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea id="notes" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Submit Enrollment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Submit a support request for assistance with your merchant accounts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTicketSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subject" className="text-right">
                      Subject
                    </Label>
                    <Input id="subject" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="merchant" className="text-right">
                      Merchant
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select merchant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Merchants</SelectItem>
                        {merchants.map((merchant) => (
                          <SelectItem key={merchant.id} value={merchant.id.toString()}>
                            {merchant.businessName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="details" className="text-right">
                      Details
                    </Label>
                    <Textarea id="details" className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Submit Ticket</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserCheck className="h-6 w-6 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{merchants.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {merchants.filter((m: MerchantProfile) => m.status === "active").length} active, {merchants.filter((m: MerchantProfile) => m.status === "pending").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-6 w-6 text-green-500 mr-1" />
              ${merchants.reduce((total: number, merchant: MerchantProfile) => {
                return total + (merchant.processingVolume ? parseFloat(merchant.processingVolume.replace(/[$,]/g, '')) : 0);
              }, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active merchants
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-6 w-6 text-green-500 mr-1" />
              ${totalCommission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 3 months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="news">Industry News</TabsTrigger>
        </TabsList>

        {/* Merchants Tab */}
        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Merchants</CardTitle>
                <Button size="sm" onClick={() => setEnrollOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Merchant
                </Button>
              </div>
              <CardDescription>
                View and manage the merchants you've enrolled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Business Name</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Monthly Volume</th>
                      <th className="text-right py-3 px-4 font-medium">Commission</th>
                      <th className="text-left py-3 px-4 font-medium">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          No merchants found. Start by enrolling your first merchant.
                        </td>
                      </tr>
                    ) : (
                      merchants.map((merchant: MerchantProfile) => (
                        <tr key={merchant.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{merchant.businessName}</td>
                          <td className="py-3 px-4">
                            {merchant.status === "active" ? (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Active
                              </span>
                            ) : merchant.status === "pending" ? (
                              <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Pending
                              </span>
                            ) : merchant.status === "suspended" ? (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-700">
                                <XCircle className="mr-1 h-3 w-3" />
                                {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">{merchant.processingVolume || "$0"}</td>
                          <td className="py-3 px-4 text-right">{merchant.commission || "0%"}</td>
                          <td className="py-3 px-4">
                            {merchant.dateEnrolled ? new Date(merchant.dateEnrolled).toLocaleDateString() : 
                              new Date(merchant.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>
                Track your earnings from referred merchants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Merchant</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground">
                          No commissions found yet. Commissions will appear as merchants process payments.
                        </td>
                      </tr>
                    ) : (
                      commissions.map((commission: Commission) => (
                        <tr key={commission.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{commission.merchantName}</td>
                          <td className="py-3 px-4 text-right">{commission.amount}</td>
                          <td className="py-3 px-4">
                            {typeof commission.date === 'string' ? 
                              new Date(commission.date).toLocaleDateString() :
                              commission.date.toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {commission.status === "paid" ? (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Paid
                              </span>
                            ) : commission.status === "pending" ? (
                              <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Pending
                              </span>
                            ) : commission.status === "clawed_back" ? (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Clawed Back
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-700">
                                <XCircle className="mr-1 h-3 w-3" />
                                {commission.status.charAt(0).toUpperCase() + commission.status.slice(1).replace('_', ' ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Resources</CardTitle>
              <CardDescription>
                Access guides and resources to help you succeed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {trainingDocs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No training documents available yet.</p>
                    <p className="text-sm mt-1">Check back soon for new training resources.</p>
                  </div>
                ) : (
                  trainingDocs.map((doc: TrainingDocument) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg flex items-center">
                          {doc.documentType === 'video' ? (
                            <Video className="mr-2 h-5 w-5 text-blue-500" />
                          ) : doc.documentType === 'pdf' ? (
                            <FileText className="mr-2 h-5 w-5 text-red-500" />
                          ) : doc.documentType === 'presentation' ? (
                            <Presentation className="mr-2 h-5 w-5 text-green-500" />
                          ) : (
                            <FileText className="mr-2 h-5 w-5 text-blue-500" />
                          )}
                          {doc.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          Category: {doc.category.charAt(0).toUpperCase() + doc.category.slice(1).replace('_', ' ')}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={doc.link} target="_blank" rel="noopener noreferrer">View Document</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Industry News Tab */}
        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>Payment Industry News</CardTitle>
              <CardDescription>
                Stay up-to-date with the latest trends and developments in the payment processing industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Add the News Section */}
                <NewsSection />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}