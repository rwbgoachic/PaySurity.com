import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaTags } from "@/components/seo";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AffiliatePortalPage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth?returnTo=/affiliate-portal" />;
  }
  
  return (
    <>
      <MetaTags
        title="Affiliate Portal | PaySurity"
        description="Access your PaySurity affiliate account to track referrals, monitor earnings, and access promotional materials."
        canonicalUrl="/affiliate-portal"
        keywords="payment processing affiliate dashboard, payment affiliate login, merchant services affiliate portal"
      />
      
      <div className="bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  Standard Affiliate
                </span>
                <UserCircle className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Affiliate ID: {user.id}</span>
              </div>
              <Button variant="outline" size="sm">Help</Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">$0.00</div>
              <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">$0.00</div>
              <p className="text-sm text-gray-500 mt-1">May 2025</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Active Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-500 mt-1">Paying merchants</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">0%</div>
              <p className="text-sm text-gray-500 mt-1">Clicks to signups</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="performance" className="w-full mb-8">
          <TabsList className="w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p>No performance data available yet.</p>
                  <p className="text-sm mt-2">Start promoting your affiliate link to see your performance metrics.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p>You haven't referred any merchants yet.</p>
                  <p className="text-sm mt-2">Use your affiliate link to refer merchants and earn commissions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payouts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p>No payment history available.</p>
                  <p className="text-sm mt-2">Payments will appear here once you've earned commissions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Promotion Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Banner Ads
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Standard banner ads in various sizes for your website or blog.
                    </p>
                    <Button size="sm" variant="outline">Download Banners</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Templates
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Pre-designed email templates to promote PaySurity to your audience.
                    </p>
                    <Button size="sm" variant="outline">Access Templates</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Content Library
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Articles, guides, and resources to share with potential merchants.
                    </p>
                    <Button size="sm" variant="outline">Browse Content</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Landing Pages
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Custom landing pages for different merchant categories.
                    </p>
                    <Button size="sm" variant="outline">View Landing Pages</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Affiliate Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 rounded-md border text-sm font-mono mb-4 overflow-x-auto">
                  https://paysurity.com/a/{user.id}
                </div>
                <Button variant="outline" className="w-full">Copy Link</Button>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Quick Links</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="text-xs">+ Digital Wallet</Button>
                    <Button size="sm" variant="outline" className="text-xs">+ POS Systems</Button>
                    <Button size="sm" variant="outline" className="text-xs">+ Restaurants</Button>
                    <Button size="sm" variant="outline" className="text-xs">+ Retail</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to Premium</span>
                      <span className="font-medium">0/10 merchants</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Refer 10 active merchants to qualify for Premium status
                    </p>
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Upgrade to Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Our affiliate support team is here to help you maximize your earnings.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">Contact Support</Button>
                  <Button variant="outline" className="w-full">View FAQ</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}