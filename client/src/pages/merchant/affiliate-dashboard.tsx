import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format } from "date-fns";
import { 
  Download, Copy, ChevronDown, Filter, RefreshCw, UserPlus, 
  DollarSign, Share2, Mail, Image, Tv, Facebook, Twitter, 
  Linkedin, Instagram, AlertCircle, CheckCircle2, Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Badge
} from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Sample data - would be replaced with actual API calls
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AffiliateDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [referralLink, setReferralLink] = useState("https://paysurity.com/ref/merchant123");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    totalReferrals: 0,
    totalRevenue: 0,
    totalCommission: 0,
    activeVisitors: 0
  });
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  
  const { data: affiliateStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/affiliate/stats", dateRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/affiliate/stats?range=${dateRange}`);
      if (!res.ok) throw new Error("Failed to fetch affiliate stats");
      return res.json();
    },
  });
  
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/affiliate/referrals"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/affiliate/referrals");
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return res.json();
    },
  });
  
  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ["/api/affiliate/payouts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/affiliate/payouts");
      if (!res.ok) throw new Error("Failed to fetch payouts");
      return res.json();
    },
  });
  
  const { data: marketingMaterials, isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/affiliate/marketing-materials"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/affiliate/marketing-materials");
      if (!res.ok) throw new Error("Failed to fetch marketing materials");
      return res.json();
    },
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Only connect if we have a user
    if (!user) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to affiliate channel
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'subscribe',
          channel: 'affiliate',
          userId: user.id
        }));
      }
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'stats_update':
          setRealtimeStats(prev => ({
            ...prev,
            ...data.stats
          }));
          break;
        
        case 'new_referral':
          // Add new referral to notifications
          setNotifications(prev => [data.referral, ...prev]);
          setHasNewNotifications(true);
          
          // Update stats
          setRealtimeStats(prev => ({
            ...prev,
            totalReferrals: prev.totalReferrals + 1
          }));
          
          // Force refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/affiliate/referrals"] });
          queryClient.invalidateQueries({ queryKey: ["/api/affiliate/stats"] });
          
          // Show toast notification
          toast({
            title: "New Referral!",
            description: `${data.referral.name} just signed up using your referral link`,
          });
          break;
          
        case 'visitor_activity':
          setLiveActivity(prev => [data.activity, ...prev.slice(0, 9)]);
          setRealtimeStats(prev => ({
            ...prev,
            activeVisitors: data.activeVisitors
          }));
          break;
          
        case 'payout_update':
          setNotifications(prev => [data.payout, ...prev]);
          setHasNewNotifications(true);
          
          // Force refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/affiliate/payouts"] });
          
          // Show toast notification
          toast({
            title: "Payout Status Updated",
            description: `Your payout of $${data.payout.amount} has been ${data.payout.status}`,
          });
          break;
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    // Clean up on unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user]);
  
  // Chart data - would come from API
  const conversionData = [
    { name: 'Visits', value: realtimeStats.activeVisitors || 1000 },
    { name: 'Sign-ups', value: 250 },
    { name: 'Activated', value: 120 },
    { name: 'Paying', value: 80 },
  ];
  
  const monthlyData = [
    { month: 'Jan', referrals: 12, revenue: 1200, commission: 120 },
    { month: 'Feb', referrals: 19, revenue: 1900, commission: 190 },
    { month: 'Mar', referrals: 15, revenue: 1500, commission: 150 },
    { month: 'Apr', referrals: 22, revenue: 2200, commission: 220 },
    { month: 'May', referrals: 28, revenue: 2800, commission: 280 },
    { month: 'Jun', referrals: 25, revenue: 2500, commission: 250 },
  ];
  
  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/affiliate/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/affiliate/referrals"] });
    queryClient.invalidateQueries({ queryKey: ["/api/affiliate/payouts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/affiliate/marketing-materials"] });
  };
  
  const handleNotificationsOpen = () => {
    setIsNotificationsOpen(true);
    setHasNewNotifications(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
        <div className="flex space-x-2">
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleNotificationsOpen} className="relative">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {hasNewNotifications && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-background"></span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  Real-time updates about your affiliate activities
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex p-3 border rounded-lg">
                        {notification.type === 'referral' ? (
                          <UserPlus className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                        ) : notification.type === 'payout' ? (
                          <DollarSign className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        ) : (
                          <Bell className="h-5 w-5 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time || 'Just now'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {dateRange === "week" ? "This Week" : 
                 dateRange === "month" ? "This Month" : 
                 dateRange === "quarter" ? "This Quarter" : "This Year"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDateRange("week")}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("month")}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("quarter")}>This Quarter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("year")}>This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-lg font-medium">Your Referral Link</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Share this link to earn commissions</p>
            </div>
            <div className="flex mt-2 md:mt-0">
              <div className="relative">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="py-2 px-3 border rounded-l-md w-full md:w-80 focus:outline-none"
                />
                <Button 
                  variant="outline" 
                  className="absolute right-0 top-0 h-full rounded-l-none"
                  onClick={handleCopyReferralLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="ml-2">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check%20out%20PaySurity%20for%20your%20payment%20processing%20needs!%20${encodeURIComponent(referralLink)}`)}>
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`)}>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`)}>
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`mailto:?subject=PaySurity%20Payment%20Solutions&body=Check%20out%20PaySurity%20for%20your%20payment%20processing%20needs!%20${encodeURIComponent(referralLink)}`)}>
                    Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Referrals</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{affiliateStats?.totalReferrals || 85}</h3>
              )}
            </div>
            <div className="p-2 bg-blue-100 rounded-md dark:bg-blue-900">
              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-green-600 dark:text-green-400">
              +12% from last {dateRange}
            </p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">${affiliateStats?.totalRevenue || "8,500"}</h3>
              )}
            </div>
            <div className="p-2 bg-green-100 rounded-md dark:bg-green-900">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-green-600 dark:text-green-400">
              +18% from last {dateRange}
            </p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Commission</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">${affiliateStats?.totalCommission || "850"}</h3>
              )}
            </div>
            <div className="p-2 bg-purple-100 rounded-md dark:bg-purple-900">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-green-600 dark:text-green-400">
              +15% from last {dateRange}
            </p>
          </div>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Referral Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="referrals" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="commission" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
                
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Conversion Funnel</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={conversionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {conversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
                
                <Card className="p-4 md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Monthly Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8884d8" />
                      <Bar dataKey="commission" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
            
            <div className="h-full">
              <Card className="p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Live Activity</h3>
                  <Badge className="bg-green-600">
                    {realtimeStats.activeVisitors || 0} Active Visitors
                  </Badge>
                </div>
                
                {liveActivity.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                      <AlertCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No live activity yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        When visitors use your referral link, you'll see their activity here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {liveActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="relative pl-6 pb-4 border-l border-dashed border-gray-200 dark:border-gray-700"
                      >
                        <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium">{activity.event}</span>
                            {activity.isConversion && (
                              <TooltipProvider>
                                <TooltipComponent>
                                  <TooltipTrigger>
                                    <CheckCircle2 className="ml-1 h-4 w-4 text-green-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Conversion</p>
                                  </TooltipContent>
                                </TooltipComponent>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.details}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time || 'Just now'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="referrals">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Referrals</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            {referralsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(referrals || [
                    { id: 1, name: "Acme Corp", date: "2025-03-15", status: "active", revenue: 1250, commission: 125 },
                    { id: 2, name: "XYZ Retailers", date: "2025-03-10", status: "pending", revenue: 0, commission: 0 },
                    { id: 3, name: "ABC Store", date: "2025-03-05", status: "active", revenue: 980, commission: 98 },
                    { id: 4, name: "123 Merchants", date: "2025-02-28", status: "inactive", revenue: 300, commission: 30 },
                    { id: 5, name: "Best Buy Coffee", date: "2025-02-20", status: "active", revenue: 1120, commission: 112 }
                  ]).map((referral: { id: number, name: string, date: string, status: string, revenue: number, commission: number }) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">{referral.name}</TableCell>
                      <TableCell>{format(new Date(referral.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          referral.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}>
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>${referral.revenue.toFixed(2)}</TableCell>
                      <TableCell>${referral.commission.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="payouts">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Payouts</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            {payoutsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payouts || [
                    { id: 1, date: "2025-03-01", amount: 365.25, method: "Bank Transfer", status: "completed", transactionId: "TRX12345" },
                    { id: 2, date: "2025-02-01", amount: 290.00, method: "Bank Transfer", status: "completed", transactionId: "TRX12258" },
                    { id: 3, date: "2025-04-01", amount: 420.50, method: "Bank Transfer", status: "pending", transactionId: "TRX12490" }
                  ]).map((payout: { id: number, date: string, amount: number, method: string, status: string, transactionId: string }) => (
                    <TableRow key={payout.id}>
                      <TableCell>{format(new Date(payout.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                      <TableCell>{payout.method}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payout.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          payout.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono">{payout.transactionId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="marketing">
          {materialsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Banners</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(marketingMaterials?.banners || []).map((banner: { id: number, name: string, size: string, type: string }) => (
                    <Card key={banner.id} className="p-4 flex flex-col">
                      <div className="flex-grow">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-md h-32 mb-2 flex items-center justify-center">
                          <Image className="h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-sm text-gray-500">{banner.size}</span>
                        </div>
                        <h4 className="font-medium">{banner.name}</h4>
                        <p className="text-sm text-gray-500">{banner.type}</p>
                      </div>
                      <Button variant="outline" className="mt-2" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Email Templates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(marketingMaterials?.emailTemplates || []).map((template: { id: number, name: string, content: string }) => (
                    <Card key={template.id} className="p-4 flex flex-col">
                      <div className="flex-grow">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-md h-32 mb-2 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{template.content.substring(0, 50)}...</p>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline" className="flex-1" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" className="flex-1" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Social Media Posts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(marketingMaterials?.socialMedia || []).map((post: { id: number, name: string, content: string, platform: string }) => (
                    <Card key={post.id} className="p-4 flex flex-col">
                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          {post.platform === 'facebook' && <Facebook className="h-5 w-5 text-blue-600" />}
                          {post.platform === 'twitter' && <Twitter className="h-5 w-5 text-blue-400" />}
                          {post.platform === 'linkedin' && <Linkedin className="h-5 w-5 text-blue-700" />}
                          {post.platform === 'instagram' && <Instagram className="h-5 w-5 text-pink-600" />}
                          {post.platform === 'all' && <Tv className="h-5 w-5 text-purple-600" />}
                          <span className="ml-2 font-medium capitalize">{post.platform === 'all' ? 'All Platforms' : post.platform}</span>
                        </div>
                        <h4 className="font-medium">{post.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{post.content.substring(0, 50)}...</p>
                      </div>
                      <Button variant="outline" className="mt-2" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateDashboard;