import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

// Define the form schema for 2FA verification
const twoFactorVerifySchema = z.object({
  token: z.string()
    .min(6, { message: 'Verification code must be at least 6 characters' })
    .max(8, { message: 'Verification code must be at most 8 characters' }),
});

type TwoFactorVerifyValues = z.infer<typeof twoFactorVerifySchema>;

export default function TwoFactorSetupPage() {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [, navigate] = useLocation();

  // Initialize the form
  const form = useForm<TwoFactorVerifyValues>({
    resolver: zodResolver(twoFactorVerifySchema),
    defaultValues: {
      token: '',
    },
  });

  // Query to get the 2FA setup information
  const setupQuery = useQuery({
    queryKey: ['/api/admin/2fa/setup'],
    queryFn: async () => {
      const response = await apiRequest("POST", '/api/admin/2fa/setup');
      return response;
    },
    enabled: !isSetupComplete,
  });

  // Set state when setup data is fetched
  useEffect(() => {
    if (setupQuery.data) {
      setQrCode(setupQuery.data.qrCode);
      setSecret(setupQuery.data.secret);
    }
  }, [setupQuery.data]);

  // Mutation to verify and enable 2FA
  const verifyMutation = useMutation({
    mutationFn: async (data: TwoFactorVerifyValues) => {
      return apiRequest("POST", '/api/admin/2fa/verify', data);
    },
    onSuccess: () => {
      setIsSetupComplete(true);
      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now more secure with 2FA",
      });
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "The code you entered is invalid. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TwoFactorVerifyValues) => {
    verifyMutation.mutate(data);
  };

  if (setupQuery.isPending) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Setting up two-factor authentication...</p>
        </div>
      </div>
    );
  }

  if (setupQuery.isError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to set up two-factor authentication. Please try again or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Two-Factor Authentication Setup</h1>
          <p className="text-muted-foreground">
            Secure your admin account with two-factor authentication
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6">
        {isSetupComplete ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Setup Complete</AlertTitle>
            <AlertDescription className="text-green-700">
              Two-factor authentication has been successfully enabled for your account.
              You will be redirected to the dashboard.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="bg-yellow-50 border-yellow-200">
              <ShieldAlert className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Security Enhancement</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Two-factor authentication adds an extra layer of security to your admin account.
                After setup, you'll need your password and a verification code to log in.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {qrCode && (
                    <div className="border p-4 rounded-md bg-white">
                      <img src={qrCode} alt="QR Code for 2FA" className="w-48 h-48" />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="w-full">
                    <div className="mb-2">
                      <Label>Or enter this code manually:</Label>
                      {secret && (
                        <div className="mt-1 bg-gray-100 p-2 rounded-md font-mono text-sm break-all">
                          {secret}
                        </div>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verify Setup</CardTitle>
                  <CardDescription>
                    Enter the verification code from your authenticator app to complete setup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the 6-digit code" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the 6-digit code from your authenticator app
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full mt-4"
                        disabled={verifyMutation.isPending}
                      >
                        {verifyMutation.isPending 
                          ? "Verifying..." 
                          : "Verify and Enable"
                        }
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}