import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Check, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function HubSpotSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [merchantId, setMerchantId] = useState<string>('');
  const [applicationId, setApplicationId] = useState<string>('');
  const connected = location.includes('connected=true');
  const error = location.includes('error=true');
  
  useEffect(() => {
    if (connected) {
      toast({
        title: 'HubSpot Connected',
        description: 'Your HubSpot account has been successfully connected.',
        variant: 'default',
      });
    } else if (error) {
      toast({
        title: 'Connection Failed',
        description: 'There was an error connecting to HubSpot. Please try again.',
        variant: 'destructive',
      });
    }
  }, [connected, error, toast]);
  
  interface AuthUrlResponse {
    authUrl: string;
  }
  
  const authUrlQuery = useQuery<AuthUrlResponse>({
    queryKey: ['/api/hubspot/auth-url'],
    enabled: user?.role === 'admin' || user?.role === 'employer',
  });
  
  const syncMerchantMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', '/api/hubspot/sync/merchant', { merchantId: id });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Merchant Synced',
        description: 'The merchant was successfully synced to HubSpot.',
        variant: 'default',
      });
      setMerchantId('');
    },
    onError: (error) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'There was an error syncing the merchant to HubSpot.',
        variant: 'destructive',
      });
    },
  });
  
  const syncApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', '/api/hubspot/sync/application', { applicationId: id });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application Synced',
        description: 'The application was successfully synced to HubSpot.',
        variant: 'default',
      });
      setApplicationId('');
    },
    onError: (error) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'There was an error syncing the application to HubSpot.',
        variant: 'destructive',
      });
    },
  });

  const handleConnectHubSpot = () => {
    if (authUrlQuery.data) {
      window.location.href = authUrlQuery.data.authUrl;
    }
  };

  const handleSyncMerchant = () => {
    if (!merchantId) {
      toast({
        title: 'Missing Merchant ID',
        description: 'Please enter a merchant ID to sync.',
        variant: 'destructive',
      });
      return;
    }
    
    const id = parseInt(merchantId);
    if (isNaN(id)) {
      toast({
        title: 'Invalid Merchant ID',
        description: 'Please enter a valid numeric ID.',
        variant: 'destructive',
      });
      return;
    }
    
    syncMerchantMutation.mutate(id);
  };

  const handleSyncApplication = () => {
    if (!applicationId) {
      toast({
        title: 'Missing Application ID',
        description: 'Please enter an application ID to sync.',
        variant: 'destructive',
      });
      return;
    }
    
    const id = parseInt(applicationId);
    if (isNaN(id)) {
      toast({
        title: 'Invalid Application ID',
        description: 'Please enter a valid numeric ID.',
        variant: 'destructive',
      });
      return;
    }
    
    syncApplicationMutation.mutate(id);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'employer')) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access HubSpot settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">HubSpot Integration Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Connect your HubSpot account to sync merchant data and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="flex items-center text-green-500 mb-4">
              <Check className="mr-2" />
              <span>Connected to HubSpot</span>
            </div>
          ) : (
            <p className="mb-4">Not connected to HubSpot</p>
          )}
          
          <Button 
            onClick={handleConnectHubSpot}
            disabled={authUrlQuery.isLoading}
          >
            {authUrlQuery.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                {connected ? 'Reconnect to HubSpot' : 'Connect to HubSpot'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {connected && (
        <Tabs defaultValue="merchants">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="merchants">Sync Merchants</TabsTrigger>
            <TabsTrigger value="applications">Sync Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="merchants" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Merchants to HubSpot</CardTitle>
                <CardDescription>
                  Sync merchant data to HubSpot as contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="merchantId">Merchant ID</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="merchantId"
                      placeholder="Enter merchant ID"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                    />
                    <Button 
                      onClick={handleSyncMerchant}
                      disabled={syncMerchantMutation.isPending}
                    >
                      {syncMerchantMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : 'Sync'}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  This will create or update a contact in HubSpot with the merchant's information.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="applications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Applications to HubSpot</CardTitle>
                <CardDescription>
                  Sync merchant applications to HubSpot as deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="applicationId"
                      placeholder="Enter application ID"
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                    />
                    <Button 
                      onClick={handleSyncApplication}
                      disabled={syncApplicationMutation.isPending}
                    >
                      {syncApplicationMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : 'Sync'}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  This will create a deal in HubSpot with the application details and link it to the merchant's contact.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}