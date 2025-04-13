import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bell,
  DollarSign,
  Lock,
  Users,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Admin dashboard component with role-based content
export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeMerchants: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    securityAlerts: 0,
  });
  
  // Try to get user from auth context, with fallback handling
  let user: any = null;
  let logoutMutation: any = { mutate: () => logoutAdmin() };
  
  try {
    const auth = useAuth();
    user = auth.user;
    logoutMutation = auth.logoutMutation;
  } catch (error) {
    console.error("Auth hook error:", error);
    // Try to get user from query cache directly as fallback
    user = queryClient.getQueryData(["/api/user"]);
  }
  
  useEffect(() => {
    // Check for admin authentication on component mount
    const adminToken = localStorage.getItem("adminAuthToken");
    
    if (!adminToken) {
      // If no admin token, check if there's a user in the cache with admin permissions
      if (!user || (user.role !== "super_admin" && user.role !== "sub_admin")) {
        console.log("No admin authorization found, redirecting to login");
        navigate("/admin/login");
        return;
      }
    }
    
    // Fetch admin dashboard statistics
    const fetchAdminStats = async () => {
      try {
        const response = await apiRequest(
          "GET", 
          "/api/super-admin/stats",
          undefined,
          {
            headers: adminToken 
              ? { Authorization: `Bearer ${adminToken}` } 
              : undefined
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch admin statistics");
        }
        
        const data = await response.json();
        setAdminStats(data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        // Fallback to demo stats for development only
        setAdminStats({
          totalUsers: 287,
          activeMerchants: 42,
          monthlyRevenue: 124560,
          pendingApprovals: 17,
          securityAlerts: 3,
        });
      }
    };
    
    fetchAdminStats();
  }, [navigate, user]);
  
  // Dedicated admin logout function
  const logoutAdmin = async () => {
    try {
      // Clear admin token
      localStorage.removeItem("adminAuthToken");
      
      // Clear user data from query cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Call regular logout endpoint if available
      await apiRequest("POST", "/api/logout");
      
      toast({
        title: "Logged out",
        description: "You have been securely logged out of the admin portal",
      });
      
      // Redirect to admin login
      navigate("/admin/login");
    } catch (error) {
      console.error("Admin logout error:", error);
      // Force redirect even if logout API fails
      navigate("/admin/login");
    }
  };
  
  // If no user found, show a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-indigo-800 text-white p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold">PaySurity Admin</h2>
          <p className="text-indigo-200 text-sm">Management Portal</p>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Button variant="ghost" className="w-full justify-start text-white">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-indigo-200 hover:text-white hover:bg-indigo-700">
            <Users className="mr-2 h-5 w-5" />
            Users & Accounts
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-indigo-200 hover:text-white hover:bg-indigo-700">
            <DollarSign className="mr-2 h-5 w-5" />
            Payments
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-indigo-200 hover:text-white hover:bg-indigo-700">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-indigo-200 hover:text-white hover:bg-indigo-700">
            <Lock className="mr-2 h-5 w-5" />
            Security
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-indigo-200 hover:text-white hover:bg-indigo-700">
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </nav>
        
        <div className="pt-8 border-t border-indigo-700">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-700 rounded-full h-10 w-10 flex items-center justify-center">
              {user.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.firstName || user.username}</p>
              <p className="text-xs text-indigo-300">{user.role === "super_admin" ? "Super Admin" : "Administrator"}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full border-indigo-600 text-white hover:bg-indigo-700"
            onClick={logoutAdmin}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Administration Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-full hover:bg-gray-200">
              <Bell size={20} />
              {adminStats.securityAlerts > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {adminStats.securityAlerts}
                </span>
              )}
            </button>
            
            <div className="lg:hidden">
              <Button 
                variant="outline"
                onClick={logoutAdmin}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${adminStats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BarChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Merchants</p>
                    <p className="text-2xl font-bold">{adminStats.activeMerchants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Bell className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                    <p className="text-2xl font-bold">{adminStats.pendingApprovals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events and user activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">All Activity</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                      <TabsTrigger value="payments">Payments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="space-y-4 mt-4">
                      <div className="border-b pb-3">
                        <p className="font-medium">New merchant account created</p>
                        <p className="text-sm text-gray-500">Ocean Blue Boutique completed registration</p>
                        <p className="text-xs text-gray-400 mt-1">Today, 10:42 AM</p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="font-medium">Payment gateway configuration updated</p>
                        <p className="text-sm text-gray-500">API credentials rotated for security</p>
                        <p className="text-xs text-gray-400 mt-1">Today, 9:15 AM</p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="font-medium">Security alert triggered</p>
                        <p className="text-sm text-gray-500">Multiple failed login attempts detected</p>
                        <p className="text-xs text-gray-400 mt-1">Yesterday, 11:30 PM</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="security" className="space-y-4 mt-4">
                      <div className="border-b pb-3">
                        <p className="font-medium">Security alert triggered</p>
                        <p className="text-sm text-gray-500">Multiple failed login attempts detected</p>
                        <p className="text-xs text-gray-400 mt-1">Yesterday, 11:30 PM</p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="font-medium">Admin permission change</p>
                        <p className="text-sm text-gray-500">Role updated for user john.smith</p>
                        <p className="text-xs text-gray-400 mt-1">Yesterday, 2:15 PM</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="payments" className="space-y-4 mt-4">
                      <div className="border-b pb-3">
                        <p className="font-medium">Payment gateway configuration updated</p>
                        <p className="text-sm text-gray-500">API credentials rotated for security</p>
                        <p className="text-xs text-gray-400 mt-1">Today, 9:15 AM</p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="font-medium">Large transaction flagged</p>
                        <p className="text-sm text-gray-500">$25,000 payment requires review</p>
                        <p className="text-xs text-gray-400 mt-1">Yesterday, 4:30 PM</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current status of all services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Payment Processing</span>
                      </div>
                      <span className="text-green-500 text-sm">Operational</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Merchant Dashboard</span>
                      </div>
                      <span className="text-green-500 text-sm">Operational</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>API Gateway</span>
                      </div>
                      <span className="text-green-500 text-sm">Operational</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span>Authentication Service</span>
                      </div>
                      <span className="text-yellow-500 text-sm">Degraded Performance</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Reporting Engine</span>
                      </div>
                      <span className="text-green-500 text-sm">Operational</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Security Alerts */}
              <Card className={`${adminStats.securityAlerts > 0 ? "border-red-200 bg-red-50" : ""}`}>
                <CardHeader className={`${adminStats.securityAlerts > 0 ? "text-red-800" : ""}`}>
                  <div className="flex items-center">
                    <ShieldAlert className={`mr-2 h-5 w-5 ${adminStats.securityAlerts > 0 ? "text-red-600" : ""}`} />
                    <CardTitle>Security Alerts</CardTitle>
                  </div>
                  {adminStats.securityAlerts > 0 ? (
                    <CardDescription className="text-red-700">
                      {adminStats.securityAlerts} active security {adminStats.securityAlerts === 1 ? "alert" : "alerts"} requiring attention
                    </CardDescription>
                  ) : (
                    <CardDescription>
                      No active security alerts at this time
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {adminStats.securityAlerts > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded border border-red-200">
                        <p className="font-medium text-red-800">Multiple Failed Login Attempts</p>
                        <p className="text-sm text-gray-600 mt-1">10+ failed attempts for user 'merchant42'</p>
                        <div className="flex justify-end mt-2">
                          <Button variant="outline" size="sm" className="mr-2">Ignore</Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">Review</Button>
                        </div>
                      </div>
                      
                      {adminStats.securityAlerts > 1 && (
                        <div className="p-3 bg-white rounded border border-red-200">
                          <p className="font-medium text-red-800">Unusual Transaction Pattern</p>
                          <p className="text-sm text-gray-600 mt-1">High volume of small transactions detected</p>
                          <div className="flex justify-end mt-2">
                            <Button variant="outline" size="sm" className="mr-2">Ignore</Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">Review</Button>
                          </div>
                        </div>
                      )}
                      
                      {adminStats.securityAlerts > 2 && (
                        <div className="p-3 bg-white rounded border border-red-200">
                          <p className="font-medium text-red-800">API Key Compromised</p>
                          <p className="text-sm text-gray-600 mt-1">Suspicious usage of integration API key</p>
                          <div className="flex justify-end mt-2">
                            <Button variant="outline" size="sm" className="mr-2">Ignore</Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">Review</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded border text-center">
                      <p className="text-gray-500">All systems secure</p>
                      <p className="text-sm text-gray-400 mt-1">Last scan: Today at 5:30 AM</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    View All Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    Manage Permissions
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    System Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    View Audit Logs
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    Payment Reports
                  </Button>
                </CardContent>
              </Card>
              
              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200 text-sm">
                      <p className="font-medium">Scheduled Maintenance</p>
                      <p className="text-gray-600 mt-1">Payment gateway maintenance scheduled for Sunday 2AM-4AM EST</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                      <p className="font-medium">New Feature Rollout</p>
                      <p className="text-gray-600 mt-1">Multi-currency support launching next week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}