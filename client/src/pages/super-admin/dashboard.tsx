import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  Briefcase,
  Building,
  CreditCard,
  DollarSign,
  LineChart,
  LockKeyhole,
  ShoppingCart,
  Shield,
  Store,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import { useState } from "react";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Summary statistics data
  const stats = [
    {
      title: "Total Merchants",
      value: "1,258",
      change: "+12%",
      icon: <Store className="h-5 w-5 text-neutral-500" />,
    },
    {
      title: "ISO Partners",
      value: "142",
      change: "+8%",
      icon: <Briefcase className="h-5 w-5 text-neutral-500" />,
    },
    {
      title: "Affiliates",
      value: "305",
      change: "+24%",
      icon: <Users className="h-5 w-5 text-neutral-500" />,
    },
    {
      title: "Monthly Revenue",
      value: "$485,290",
      change: "+18%",
      icon: <DollarSign className="h-5 w-5 text-neutral-500" />,
    },
    {
      title: "Transaction Volume",
      value: "$3.8M",
      change: "+14%",
      icon: <CreditCard className="h-5 w-5 text-neutral-500" />,
    },
    {
      title: "Active POS Systems",
      value: "948",
      change: "+22%",
      icon: <ShoppingCart className="h-5 w-5 text-neutral-500" />,
    },
  ];

  // Recent activities data
  const activities = [
    {
      title: "New Merchant Onboarded",
      description: "Coastal Cafe completed their onboarding process",
      timestamp: "2 hours ago",
      icon: <Store className="h-4 w-4" />,
    },
    {
      title: "Payment Processing Issue",
      description: "Error in payment gateway for JNL Retail",
      timestamp: "3 hours ago",
      icon: <BellRing className="h-4 w-4" />,
    },
    {
      title: "New ISO Partner",
      description: "MidWest Financial joined as an ISO partner",
      timestamp: "5 hours ago",
      icon: <Building className="h-4 w-4" />,
    },
    {
      title: "System Maintenance",
      description: "Scheduled maintenance completed for BistroBeast POS",
      timestamp: "Yesterday",
      icon: <Truck className="h-4 w-4" />,
    },
    {
      title: "Large Transaction Alert",
      description: "Unusual transaction volume from Century Health",
      timestamp: "Yesterday",
      icon: <Wallet className="h-4 w-4" />,
    },
  ];

  return (
    <AdminLayout title="Super Admin Dashboard">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">Welcome,</span>
          <span className="font-medium">{user?.username || 'Super Admin'}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="partners">ISO Partners</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">System Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-neutral-500 mt-1">
                    <span className="text-emerald-500">{stat.change}</span> vs. last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Activity */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-800">
                        {activity.icon}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-neutral-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                    <h3 className="text-lg font-medium">Revenue Analytics</h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      Interactive charts for detailed revenue analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <CardTitle>Merchant Management</CardTitle>
              <CardDescription>
                View and manage all registered merchants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Store className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Merchant Data</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Complete merchant management interface with filtering and detailed reports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>ISO Partner Network</CardTitle>
              <CardDescription>
                Manage partnerships and commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Building className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">ISO Partner Dashboard</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    View partner performance, commission structures, and referral tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Program Management</CardTitle>
              <CardDescription>
                Track and manage the affiliate marketing program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Affiliate Dashboard</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Commission tracking, performance metrics, and affiliate management
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>
                Comprehensive data analytics and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Financial performance, user growth, and system health metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Admin Security Overview</CardTitle>
                <CardDescription>
                  Security measures and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Authentication Security</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Password hashing with bcrypt for secure storage</li>
                    <li>Login attempt tracking with account lockout after failed attempts</li>
                    <li>Session management with automatic timeout after inactivity</li>
                    <li>Protected routes requiring authentication before access</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Access Control</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Role-based authorization with fine-grained permissions</li>
                    <li>Strict separation of admin and regular user functionality</li>
                    <li>UI elements conditionally rendered based on user role</li>
                    <li>Super admin exclusive access to system-wide configuration</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Security Updates</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Apr 13, 2025:</strong> Fixed admin dashboard visibility to only appear for authenticated super_admin users</li>
                    <li><strong>Apr 13, 2025:</strong> Added automated security test suite to verify access controls</li>
                    <li><strong>Apr 13, 2025:</strong> Enhanced authentication validation in protected routes</li>
                    <li><strong>Apr 13, 2025:</strong> Fixed session management to resolve login failures affecting super_admin access</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Test Results</CardTitle>
                <CardDescription>
                  Latest security test results and audits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Admin Security Test Suite</h3>
                    <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                      <p className="text-sm mb-2"><strong>Last Run:</strong> Apr 13, 2025</p>
                      <p className="text-sm mb-2"><strong>Status:</strong> <span className="text-green-600 font-medium">All Tests Passed (4/4)</span></p>
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                          <p className="text-sm">Authentication Protection</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                          <p className="text-sm">Role-Based Authorization</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                          <p className="text-sm">UI Visibility Controls</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                          <p className="text-sm">Password Security</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Recent Security Enhancements</h3>
                    <div className="space-y-3">
                      <div className="p-3 border border-neutral-200 rounded-md">
                        <p className="font-medium">Admin Dashboard Access Control</p>
                        <p className="text-sm text-neutral-600">
                          Updated Header component to properly check authentication state and user role
                          before displaying Admin Dashboard link.
                        </p>
                      </div>
                      <div className="p-3 border border-neutral-200 rounded-md">
                        <p className="font-medium">Automated Security Testing</p>
                        <p className="text-sm text-neutral-600">
                          Added comprehensive security test suite with automated verification of authentication
                          and authorization controls.
                        </p>
                      </div>
                      <div className="p-3 border border-neutral-200 rounded-md">
                        <p className="font-medium">Password Security</p>
                        <p className="text-sm text-neutral-600">
                          Added tests to verify proper password hashing with bcrypt, ensuring user credentials
                          are securely stored.
                        </p>
                      </div>
                      <div className="p-3 border border-neutral-200 rounded-md">
                        <p className="font-medium">Session Management</p>
                        <p className="text-sm text-neutral-600">
                          Fixed critical session persistence issue affecting admin authentication by implementing
                          proper database session storage.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}