import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SuperAdminDashboard() {
  const { user, isLoading, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalAffiliates: 0,
    totalIsoPartners: 0,
    totalTransactions: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load stats
  useEffect(() => {
    if (!user || user.role !== "super_admin") return;

    async function loadStats() {
      try {
        setIsLoadingStats(true);
        // This is a placeholder - the actual endpoint will be implemented in the backend
        // For now, we'll use dummy data
        setStats({
          totalUsers: 127,
          totalMerchants: 42,
          totalAffiliates: 18,
          totalIsoPartners: 7,
          totalTransactions: 5382,
        });
      } catch (error) {
        console.error("Failed to load statistics:", error);
        toast({
          title: "Failed to load statistics",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStats(false);
      }
    }

    loadStats();
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only allow super_admin access
  if (!user || user.role !== "super_admin") {
    toast({
      title: "Access Denied",
      description: "You do not have permission to view this page.",
      variant: "destructive",
    });
    return <Redirect to="/auth" />;
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b">
        <div className="container py-4 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              PaySurity - Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              System administration and monitoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user.firstName} {user.lastName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* System Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>System Statistics</CardTitle>
              <CardDescription>
                Overview of system metrics and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Users:</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Merchants:</span>
                    <span className="font-medium">{stats.totalMerchants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Affiliates:</span>
                    <span className="font-medium">{stats.totalAffiliates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total ISO Partners:</span>
                    <span className="font-medium">{stats.totalIsoPartners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Transactions:</span>
                    <span className="font-medium">{stats.totalTransactions}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View Detailed Stats
              </Button>
            </CardFooter>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Current system performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Healthy
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">API Services</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">WebSocket Server</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Task Queue</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Processing
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cache</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    OK
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View System Logs
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full mb-2">
                Manage Users
              </Button>
              <Button variant="secondary" size="sm" className="w-full mb-2">
                System Configuration
              </Button>
              <Button variant="secondary" size="sm" className="w-full mb-2">
                Security Settings
              </Button>
              <Button variant="secondary" size="sm" className="w-full mb-2">
                Database Management
              </Button>
              <Button variant="secondary" size="sm" className="w-full">
                API Documentation
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Actions
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest events and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <p className="text-sm font-medium">Database Backup Completed</p>
                  <p className="text-xs text-muted-foreground">Today at 4:30 AM</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-1">
                  <p className="text-sm font-medium">New Merchant Registered</p>
                  <p className="text-xs text-muted-foreground">Yesterday at 2:15 PM</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4 py-1">
                  <p className="text-sm font-medium">System Update Scheduled</p>
                  <p className="text-xs text-muted-foreground">Tomorrow at 1:00 AM</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-1">
                  <p className="text-sm font-medium">New ISO Partner Application</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4 py-1">
                  <p className="text-sm font-medium">Security Alert Resolved</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">System Update Required</h4>
                  <p className="text-xs text-yellow-700">
                    New security updates available for deployment.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Database Optimization</h4>
                  <p className="text-xs text-blue-700">
                    Regular database maintenance scheduled for tonight.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-1">API Usage Spike</h4>
                  <p className="text-xs text-green-700">
                    Increased API traffic detected from merchant portals.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Manage Alerts
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}