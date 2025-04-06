import { PosLayout } from "@/components/layout/pos-layout";
import { MetaTags } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, ShoppingBag, Users, Calendar, ArrowRightCircle } from "lucide-react";

export default function PosIndexPage() {
  return (
    <PosLayout>
      <MetaTags 
        title="POS System Dashboard | PaySurity"
        description="Manage your business operations with PaySurity's powerful point-of-sale system designed for restaurants, retail, and service businesses."
        canonicalUrl="/pos"
        keywords="point of sale, POS system, restaurant management, retail POS, payment processing"
      />
      
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">POS Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your point-of-sale system and track business performance.
            </p>
          </div>
          <Button>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Open Register
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,350.45</div>
              <p className="text-xs text-muted-foreground">
                +15% from yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                8 orders pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                4 new customers today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff on Shift</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                3 front-of-house, 2 back-of-house
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="sales" className="w-full">
          <TabsList>
            <TabsTrigger value="sales">Sales Overview</TabsTrigger>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>
                  View your sales performance across different metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">Sales chart will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Track recent orders and their status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Order #{1000 + i}</p>
                        <p className="text-sm text-muted-foreground">Table 5 • 3 items • $78.50</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRightCircle className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>
                  Items that are running low and need attention.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-md bg-amber-50 border-amber-200">
                      <div>
                        <p className="font-medium">Item #{i}</p>
                        <p className="text-sm text-muted-foreground">Only 3 units remaining</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Restock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PosLayout>
  );
}