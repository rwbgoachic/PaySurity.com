import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PayrollPricingTiersTable } from '@/components/admin/PayrollPricingTiersTable';
import { PayrollPricingFeaturesTable } from '@/components/admin/PayrollPricingFeaturesTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const AdminPayrollPricingPage: React.FC = () => {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = React.useState(false);
  
  const handleInitializeDefaultTiers = async () => {
    if (!confirm('Are you sure you want to initialize default pricing tiers? This will create standard tiers based on our pricing strategy.')) {
      return;
    }
    
    setIsInitializing(true);
    try {
      const response = await apiRequest('POST', '/api/payroll/pricing/initialize-defaults', {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize default pricing tiers');
      }
      
      toast({
        title: 'Success',
        description: 'Default pricing tiers initialized successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payroll Pricing Management</h1>
        <Button 
          onClick={handleInitializeDefaultTiers}
          disabled={isInitializing}
        >
          {isInitializing ? 'Initializing...' : 'Initialize Default Tiers'}
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pricing Strategy Overview</CardTitle>
          <CardDescription>
            Our payroll pricing is designed to be competitive and transparent, with no hidden fees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Value Proposition</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Lowest base fee + 50% cheaper per-employee cost vs. most competitors</li>
                <li>Affordable global payroll with no setup fees</li>
                <li>Zero cost for small gig teams; targets Uber-like startups</li>
                <li>No upcharges for tax filings; eliminates surprise fees</li>
                <li>Premium support included at no extra cost</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">Strategic Positioning</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Micro/SMB Focus: Underprice competitors for businesses with &lt;50 employees</li>
                <li>Gig Economy: Dominate contractor-heavy verticals with free tiers</li>
                <li>Global Startups: Beat competitors on price for early-stage companies hiring overseas</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">Marketing Messages</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>"Enterprise Features at SMB Prices — But 50% Cheaper."</li>
                <li>"No Surprise Fees. Ever."</li>
                <li>"24/7 Support, Not 24/7 Upsells."</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="tiers">
        <TabsList className="mb-4">
          <TabsTrigger value="tiers">Pricing Tiers</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tiers">
          <PayrollPricingTiersTable />
        </TabsContent>
        
        <TabsContent value="features">
          <PayrollPricingFeaturesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayrollPricingPage;