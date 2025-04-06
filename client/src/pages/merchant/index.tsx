import { MerchantLayout } from "@/components/layout/merchant-layout";
import { MetaTags } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, CreditCard, FileText, CheckCircle2, AlertCircle, ArrowRightCircle } from "lucide-react";

export default function MerchantIndexPage() {
  return (
    <MerchantLayout>
      <MetaTags 
        title="Merchant Services Dashboard | PaySurity"
        description="Manage your merchant account, payment gateways, and application processing through PaySurity's comprehensive merchant services platform."
        canonicalUrl="/merchant"
        keywords="merchant services, payment processing, payment gateway, merchant account, application processing"
      />
      
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Merchant Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your merchant services, payment gateways, and applications.
            </p>
          </div>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$145,780.45</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Gateways</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Stripe, PayPal, Square
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                2 require additional information
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                Higher than industry average
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="applications" className="w-full">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Manage and track merchant application status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Application #{1000 + i}</p>
                        <p className="text-sm text-muted-foreground">Restaurant • Submitted 3 days ago</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          In Review
                        </span>
                        <Button variant="outline" size="sm">
                          <ArrowRightCircle className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="gateways">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Status</CardTitle>
                <CardDescription>
                  Monitor the health and performance of your payment gateways.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Stripe", status: "Operational", health: "99.9%" },
                    { name: "PayPal", status: "Operational", health: "99.7%" },
                    { name: "Square", status: "Operational", health: "99.8%" }
                  ].map((gateway, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <p className="font-medium">{gateway.name}</p>
                        <p className="text-sm text-muted-foreground">Health: {gateway.health}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                          {gateway.status}
                        </span>
                        <Button variant="outline" size="sm">
                          Settings
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>
                  Important notifications about your merchant services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-md bg-amber-50 border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Verification Documents Needed</p>
                      <p className="text-sm text-muted-foreground">
                        Please upload additional verification documents for your merchant account.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border rounded-md bg-blue-50 border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Gateway Update Available</p>
                      <p className="text-sm text-muted-foreground">
                        An update is available for your Stripe integration.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        View Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MerchantLayout>
  );
}