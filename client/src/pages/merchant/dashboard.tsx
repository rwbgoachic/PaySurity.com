import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
  Activity,
  Users,
  ShoppingBag,
  Tag,
  LineChart,
  Wallet,
  Calendar,
  BarChart,
  Award,
  DollarSign,
  CreditCard,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function MerchantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch the merchant profile data
  const {
    data: merchantProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["/api/merchant-profiles"],
    select: (data) => (data && data.length > 0 ? data[0] : null),
  });

  // Fetch payment gateways
  const {
    data: paymentGateways,
    isLoading: isLoadingGateways,
  } = useQuery({
    queryKey: ["/api/merchant-profiles", merchantProfile?.id, "payment-gateways"],
    enabled: !!merchantProfile?.id,
  });

  // Fetch loyalty programs
  const {
    data: loyaltyPrograms,
    isLoading: isLoadingLoyalty,
  } = useQuery({
    queryKey: ["/api/merchant-profiles", merchantProfile?.id, "loyalty-programs"],
    enabled: !!merchantProfile?.id,
  });

  // Fetch promotional campaigns
  const {
    data: promotionalCampaigns,
    isLoading: isLoadingCampaigns,
  } = useQuery({
    queryKey: ["/api/merchant-profiles", merchantProfile?.id, "promotional-campaigns"],
    enabled: !!merchantProfile?.id,
  });

  // Fetch analytics reports
  const {
    data: analyticsReports,
    isLoading: isLoadingAnalytics,
  } = useQuery({
    queryKey: ["/api/merchant-profiles", merchantProfile?.id, "analytics-reports"],
    enabled: !!merchantProfile?.id,
  });

  // Fetch business financing
  const {
    data: businessFinancing,
    isLoading: isLoadingFinancing,
  } = useQuery({
    queryKey: ["/api/merchant-profiles", merchantProfile?.id, "financing"],
    enabled: !!merchantProfile?.id,
  });

  // Handle merchant profile creation
  const createMerchantProfileHandler = () => {
    // Navigate to the merchant onboarding page
    window.location.href = "/merchant/onboarding";
  };

  // If merchant profile doesn't exist, show the creation prompt
  if (!isLoadingProfile && !merchantProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Become a Merchant</CardTitle>
            <CardDescription>
              Create a merchant profile to access value-added services like payment processing,
              loyalty programs, promotional campaigns, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              As a merchant, you'll be able to:
            </p>
            <ul className="space-y-2 mb-4 ml-6 list-disc text-sm text-muted-foreground">
              <li>Process payments online and in-person</li>
              <li>Create and manage loyalty programs</li>
              <li>Run promotional campaigns</li>
              <li>Access business analytics</li>
              <li>Apply for business financing</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={createMerchantProfileHandler}
            >
              Create Merchant Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show loading state while fetching merchant profile
  if (isLoadingProfile) {
    return (
      <div className="p-4 md:p-8">
        <div className="grid gap-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[150px] rounded-lg" />
            <Skeleton className="h-[150px] rounded-lg" />
            <Skeleton className="h-[150px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there was an error fetching the merchant profile
  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error loading your merchant profile. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Determine merchant status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Dashboard content with tabs
  return (
    <div className="p-4 md:p-8">
      <div className="grid gap-6">
        {/* Header with merchant info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{merchantProfile.businessName || 'Merchant Dashboard'}</h1>
            <p className="text-muted-foreground">
              Manage your merchant services, loyalty programs, and more
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(merchantProfile.status)}`}>
              {merchantProfile.status.charAt(0).toUpperCase() + merchantProfile.status.slice(1)}
            </span>
            <Button asChild>
              <Link href="/merchant/settings">
                Merchant Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Display warning banner if merchant is not active */}
        {merchantProfile.status !== 'active' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {merchantProfile.status === 'pending' ? (
                  <p className="text-yellow-800">
                    Your merchant account is pending approval. You can set up your services, but you won't be able to process transactions until your account is active.
                  </p>
                ) : (
                  <p className="text-red-800">
                    Your merchant account is {merchantProfile.status}. Please contact support for assistance.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main dashboard tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 lg:grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden md:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden md:inline">Promotions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="financing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Financing</span>
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">POS</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Overview Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payment Gateways</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingGateways ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      paymentGateways?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active payment methods
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/merchant/payment-gateways">Manage Gateways</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loyalty Programs</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingLoyalty ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      loyaltyPrograms?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active loyalty programs
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/merchant/loyalty-programs">Manage Programs</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingCampaigns ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      promotionalCampaigns?.filter(c => c.isActive)?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active promotional campaigns
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/merchant/campaigns">Manage Campaigns</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingAnalytics ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      analyticsReports?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available reports
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/merchant/analytics">View Reports</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Affiliate Marketing</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Earn commissions by referring merchants
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/merchant/affiliate-dashboard">Manage Referrals</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Verification Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Your merchant verification status and required actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {merchantProfile.verificationStatus === 'verified' 
                        ? '100%' 
                        : merchantProfile.verificationStatus === 'pending' 
                          ? '50%' 
                          : '25%'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      merchantProfile.verificationStatus === 'verified' 
                        ? 100 
                        : merchantProfile.verificationStatus === 'pending' 
                          ? 50 
                          : 25
                    } 
                    className="h-2" 
                  />
                  
                  {/* Verification steps checklist */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="h-3 w-3 text-white"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm">Basic profile information</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {merchantProfile.verificationStatus !== 'not_started' ? (
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-3 w-3 text-white"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-200"></div>
                      )}
                      <span className="text-sm">Business verification documents</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {merchantProfile.verificationStatus === 'verified' ? (
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-3 w-3 text-white"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-200"></div>
                      )}
                      <span className="text-sm">Final review and approval</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {merchantProfile.verificationStatus !== 'verified' && (
                  <Button asChild className="w-full">
                    <Link href="/merchant/verification">
                      {merchantProfile.verificationStatus === 'not_started' 
                        ? 'Start Verification' 
                        : 'Continue Verification'}
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateways</CardTitle>
                <CardDescription>
                  Manage your payment processing methods and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingGateways ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : paymentGateways?.length ? (
                  <div className="space-y-4">
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{gateway.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {gateway.type} • {gateway.isDefault ? 'Default Gateway' : 'Secondary Gateway'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/merchant/payment-gateways/${gateway.id}`}>Manage</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No payment gateways</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't set up any payment gateways yet. Add one to start accepting payments.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/payment-gateways/new">
                    Add Payment Gateway
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Virtual Terminals</CardTitle>
                <CardDescription>
                  Set up and manage virtual terminals for in-person payments
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Virtual Terminals</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create virtual terminals to process in-person payments
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/virtual-terminals">
                    Manage Virtual Terminals
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Programs</CardTitle>
                <CardDescription>
                  Create and manage customer loyalty programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLoyalty ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : loyaltyPrograms?.length ? (
                  <div className="space-y-4">
                    {loyaltyPrograms.map((program) => (
                      <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{program.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {program.type} • {program.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/merchant/loyalty-programs/${program.id}`}>Manage</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No loyalty programs</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't set up any loyalty programs yet. Create one to start rewarding your customers.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/loyalty-programs/new">
                    Create Loyalty Program
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>
                  View loyalty program statistics and customer engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Customer Insights</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Analyze customer engagement and loyalty program performance
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/customer-insights">
                    View Insights
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Promotional Campaigns</CardTitle>
                <CardDescription>
                  Create and manage promotional campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : promotionalCampaigns?.length ? (
                  <div className="space-y-4">
                    {promotionalCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {campaign.campaignType} • {campaign.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/merchant/campaigns/${campaign.id}`}>Manage</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Tag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No promotional campaigns</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't set up any promotional campaigns yet. Create one to start attracting customers.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/campaigns/new">
                    Create Campaign
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Campaign Analytics</CardTitle>
                <CardDescription>
                  Track the performance of your promotional campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <LineChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Campaign Performance</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Analyze the effectiveness of your promotional campaigns
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/campaign-analytics">
                    View Analytics
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
                <CardDescription>
                  View detailed reports and analytics for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : analyticsReports?.length ? (
                  <div className="space-y-4">
                    {analyticsReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.reportType} • Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/merchant/analytics/${report.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BarChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No analytics reports</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't generated any analytics reports yet. Create one to gain insights into your business.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/analytics/new">
                    Generate New Report
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  View your sales performance and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Sales Dashboard</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track your revenue, transaction volume, and sales trends
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/sales-dashboard">
                    View Sales Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Financing Tab */}
          <TabsContent value="financing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Financing</CardTitle>
                <CardDescription>
                  Apply for and manage business financing options
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFinancing ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : businessFinancing?.length ? (
                  <div className="space-y-4">
                    {businessFinancing.map((financing) => (
                      <div key={financing.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{financing.financingType}</p>
                          <p className="text-sm text-muted-foreground">
                            Amount: ${parseFloat(financing.amount).toLocaleString()} • Status: {financing.status}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/merchant/financing/${financing.id}`}>View Details</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No financing applications</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't applied for business financing yet. Apply now to grow your business.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/financing/apply">
                    Apply for Financing
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>
                  View metrics about your business's financial health
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <LineChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Financial Overview</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track your business's financial health and performance
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/financial-health">
                    View Financial Health
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* POS Tab */}
          <TabsContent value="pos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Point of Sale Systems</CardTitle>
                <CardDescription>
                  Manage your point of sale systems and terminals
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">POS Systems</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set up and manage your point of sale systems
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/pos-systems">
                    Manage POS Systems
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Virtual Terminal</CardTitle>
                <CardDescription>
                  Process payments through a virtual terminal
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Virtual Terminal</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Process card payments manually without physical hardware
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/merchant/virtual-terminal">
                    Launch Virtual Terminal
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}