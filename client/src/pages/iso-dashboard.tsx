import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, DollarSign, FileText, LifeBuoy, UserPlus, UserCheck, CheckCircle2, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

// Type definitions
type Merchant = {
  id: number;
  businessName: string;
  status: string;
  processingVolume: string;
  commission: string;
  dateEnrolled: string;
};

type Commission = {
  id: number;
  merchantName: string;
  amount: string;
  date: string;
  status: string;
};

type TrainingDocument = {
  id: number;
  title: string;
  description: string;
  link: string;
};

// Mock data (will be replaced with API calls)
const mockMerchants: Merchant[] = [
  { id: 1, businessName: "Joe's Pizza", status: "active", processingVolume: "$12,500", commission: "$750", dateEnrolled: "02/15/2025" },
  { id: 2, businessName: "Main Street Retail", status: "pending", processingVolume: "$0", commission: "$0", dateEnrolled: "04/01/2025" },
  { id: 3, businessName: "City Dental Clinic", status: "active", processingVolume: "$28,900", commission: "$1,734", dateEnrolled: "01/10/2025" },
  { id: 4, businessName: "The Grand Hotel", status: "active", processingVolume: "$45,200", commission: "$2,712", dateEnrolled: "03/05/2025" }
];

const mockCommissions: Commission[] = [
  { id: 1, merchantName: "Joe's Pizza", amount: "$250", date: "04/01/2025", status: "paid" },
  { id: 2, merchantName: "Joe's Pizza", amount: "$250", date: "03/01/2025", status: "paid" },
  { id: 3, merchantName: "Joe's Pizza", amount: "$250", date: "02/01/2025", status: "paid" },
  { id: 4, merchantName: "City Dental Clinic", amount: "$578", date: "04/01/2025", status: "paid" },
  { id: 5, merchantName: "City Dental Clinic", amount: "$578", date: "03/01/2025", status: "paid" },
  { id: 6, merchantName: "City Dental Clinic", amount: "$578", date: "02/01/2025", status: "paid" },
  { id: 7, merchantName: "The Grand Hotel", amount: "$904", date: "04/01/2025", status: "paid" },
  { id: 8, merchantName: "The Grand Hotel", amount: "$904", date: "03/01/2025", status: "paid" },
  { id: 9, merchantName: "The Grand Hotel", amount: "$904", date: "02/01/2025", status: "paid" }
];

const mockTrainingDocs: TrainingDocument[] = [
  { id: 1, title: "ISO Partner Onboarding Guide", description: "Complete guide to get started as a PaySurity ISO partner", link: "#" },
  { id: 2, title: "Merchant Enrollment Process", description: "Step-by-step merchant application process", link: "#" },
  { id: 3, title: "Industry-Specific Sales Guides", description: "Specialized guides for each vertical market", link: "#" },
  { id: 4, title: "Payment Processing Overview", description: "Technical overview of the payment processing flow", link: "#" },
  { id: 5, title: "Commission Structure", description: "Detailed explanation of the commission tiers and structure", link: "#" }
];

export default function IsoDashboard() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  // When integrated with API, these would be React Query hooks
  // const { data: merchants, isLoading: merchantsLoading } = useQuery...
  // const { data: commissions, isLoading: commissionsLoading } = useQuery...

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
  // if (user.role !== "affiliate") {
  //   return <Redirect to="/" />;
  // }

  // Handler for merchant enrollment form submission
  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Merchant Enrollment Started",
      description: "Your merchant enrollment request has been submitted.",
    });
    setEnrollOpen(false);
  };

  // Handler for support ticket submission
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support Ticket Created",
      description: "Your support ticket has been submitted to our team.",
    });
    setTicketOpen(false);
  };

  // Calculate total commission for the dashboard
  const totalCommission = mockCommissions.reduce((total, commission) => {
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
                        {mockMerchants.map(merchant => (
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
              <div className="text-2xl font-bold">{mockMerchants.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockMerchants.filter(m => m.status === "active").length} active, {mockMerchants.filter(m => m.status === "pending").length} pending
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
              $86,600
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
                    {mockMerchants.map((merchant) => (
                      <tr key={merchant.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{merchant.businessName}</td>
                        <td className="py-3 px-4">
                          {merchant.status === "active" ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">{merchant.processingVolume}</td>
                        <td className="py-3 px-4 text-right">{merchant.commission}</td>
                        <td className="py-3 px-4">{merchant.dateEnrolled}</td>
                      </tr>
                    ))}
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
                    {mockCommissions.map((commission) => (
                      <tr key={commission.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{commission.merchantName}</td>
                        <td className="py-3 px-4 text-right">{commission.amount}</td>
                        <td className="py-3 px-4">{commission.date}</td>
                        <td className="py-3 px-4">
                          {commission.status === "paid" ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
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
                {mockTrainingDocs.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-blue-500" />
                        {doc.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={doc.link}>View Document</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}