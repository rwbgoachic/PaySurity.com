import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Clock, MessageSquare, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface SMSProvider {
  id: string;
  name: string;
  description: string;
  envVariables: Array<{
    name: string;
    description: string;
    placeholder: string;
    required: boolean;
  }>;
}

interface ProvidersResponse {
  active: string;
  available: string[];
  isConfigured: boolean;
}

// Provider configuration details
const PROVIDERS: SMSProvider[] = [
  {
    id: "twilio",
    name: "Twilio",
    description:
      "Twilio is a cloud communications platform that enables sending SMS messages through their API.",
    envVariables: [
      {
        name: "TWILIO_ACCOUNT_SID",
        description: "Twilio Account SID",
        placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        name: "TWILIO_AUTH_TOKEN",
        description: "Twilio Auth Token",
        placeholder: "your_auth_token",
        required: true,
      },
      {
        name: "TWILIO_PHONE_NUMBER",
        description: "Twilio Phone Number",
        placeholder: "+15551234567",
        required: true,
      },
    ],
  },
  {
    id: "textmagic",
    name: "TextMagic",
    description:
      "TextMagic is an SMS service provider with a simple API for sending text messages.",
    envVariables: [
      {
        name: "TEXTMAGIC_USERNAME",
        description: "TextMagic Username",
        placeholder: "your_username",
        required: true,
      },
      {
        name: "TEXTMAGIC_API_KEY",
        description: "TextMagic API Key",
        placeholder: "your_api_key",
        required: true,
      },
    ],
  },
  {
    id: "messagebird",
    name: "MessageBird",
    description:
      "MessageBird provides SMS, Voice and Chat messaging services for businesses.",
    envVariables: [
      {
        name: "MESSAGEBIRD_API_KEY",
        description: "MessageBird API Key",
        placeholder: "your_api_key",
        required: true,
      },
      {
        name: "MESSAGEBIRD_ORIGINATOR",
        description: "MessageBird Originator (Phone Number or Name)",
        placeholder: "+1234567890 or YourBrand",
        required: true,
      },
    ],
  },
  {
    id: "mock",
    name: "Mock Provider (Development Only)",
    description:
      "A mock provider that logs messages to the console instead of sending real SMS messages. Use this for development and testing.",
    envVariables: [],
  },
];

interface TestMessage {
  to: string;
  message: string;
  timestamp: Date;
}

interface TestMessageLogsResponse {
  logs: TestMessage[];
  provider: string;
  count: number;
  note: string;
}

export default function SmsSettingsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [testPhone, setTestPhone] = useState<string>("");
  const [testMessage, setTestMessage] = useState<string>("");
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  
  // For test message logs
  const [refreshLogs, setRefreshLogs] = useState<number>(0);

  // If user is not admin, redirect to home
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

  // Get current SMS provider settings
  const { data, isLoading, error, refetch } = useQuery<ProvidersResponse>({
    queryKey: ["/api/admin/sms-providers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/sms-providers");
      if (!response.ok) {
        throw new Error("Failed to fetch SMS provider settings");
      }
      return response.json();
    },
    enabled: !!user && user.role === "admin",
  });
  
  // Get test message logs for the mock provider
  const { 
    data: messageLogs, 
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs 
  } = useQuery<TestMessageLogsResponse>({
    queryKey: ["/api/admin/test-sms/logs", refreshLogs],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/test-sms/logs");
      if (!response.ok) {
        throw new Error("Failed to fetch SMS message logs");
      }
      return response.json();
    },
    enabled: !!user && user.role === "admin",
  });

  // Set active provider
  const setProviderMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest("POST", "/api/admin/sms-providers", {
        provider,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to set SMS provider");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Provider Updated",
        description: `SMS provider has been updated successfully.`,
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update provider",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set active provider
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    setProviderMutation.mutate(value);
  };

  // Test SMS
  const handleTestSms = async () => {
    if (!testPhone || !testMessage) {
      toast({
        title: "Missing Information",
        description: "Please provide both phone number and message.",
        variant: "destructive",
      });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const response = await apiRequest("POST", "/api/admin/test-sms", {
        phoneNumber: testPhone,
        message: testMessage,
      });

      if (response.ok) {
        setTestResult({ success: true });
        toast({
          title: "Test SMS Sent",
          description: "The test SMS was sent successfully.",
        });
      } else {
        const error = await response.json();
        setTestResult({
          success: false,
          error: error.error || "Failed to send test SMS",
        });
        toast({
          title: "Failed to send SMS",
          description: error.error || "Failed to send test SMS",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || "Failed to send test SMS",
      });
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Set initial selected provider
  useEffect(() => {
    if (data && data.active) {
      setSelectedProvider(data.active);
    }
  }, [data]);

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load settings"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const availableProviders = data?.available || [];
  const hasConfiguredProvider = data?.isConfigured || false;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">SMS Provider Settings</h1>

      {!hasConfiguredProvider && (
        <Alert className="mb-6 border-amber-500 text-amber-800 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No SMS Provider Configured</AlertTitle>
          <AlertDescription>
            You haven't configured any SMS provider yet. Set up environment
            variables for your preferred provider or use the mock provider for
            testing.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="providers">SMS Providers</TabsTrigger>
          <TabsTrigger value="test">Test SMS</TabsTrigger>
          <TabsTrigger value="logs">Message Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid gap-6">
            <RadioGroup
              value={selectedProvider}
              onValueChange={handleProviderChange}
              className="space-y-4"
            >
              {PROVIDERS.map((provider) => {
                const isConfigured = availableProviders.includes(provider.id);
                return (
                  <div
                    key={provider.id}
                    className={`border ${
                      selectedProvider === provider.id
                        ? "border-primary"
                        : "border-border"
                    } rounded-lg p-4 transition-all hover:border-primary`}
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={provider.id}
                        id={`provider-${provider.id}`}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={`provider-${provider.id}`}
                            className="text-base font-medium cursor-pointer"
                          >
                            {provider.name}
                          </Label>
                          {provider.id !== "mock" && (
                            <div
                              className={`flex items-center text-sm ${
                                isConfigured
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {isConfigured ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Configured
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                  Not Configured
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {provider.description}
                        </p>

                        {provider.envVariables.length > 0 && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-sm font-medium mb-2">
                              Required Environment Variables:
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {provider.envVariables.map((variable) => (
                                <li
                                  key={variable.name}
                                  className="flex items-start"
                                >
                                  <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded mr-2">
                                    {variable.name}
                                  </span>
                                  <span className="text-xs">
                                    {variable.description}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">How to Configure SMS Providers</h3>
              <p className="text-sm text-muted-foreground mb-2">
                To use a provider other than the Mock provider, you need to add the required environment variables to your Replit project:
              </p>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Click on the Tools tab in your Replit sidebar</li>
                <li>Select "Secrets" from the menu</li>
                <li>Add each required environment variable for your chosen provider</li>
                <li>Restart your application</li>
              </ol>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Test SMS</CardTitle>
              <CardDescription>
                Test your SMS configuration by sending a message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+15551234567"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter phone number in international format (e.g.,
                  +15551234567)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="This is a test message from your restaurant."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>

              {testResult && (
                <Alert
                  variant={testResult.success ? "default" : "destructive"}
                  className="mt-4"
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {testResult.success ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {testResult.success
                      ? "Test message sent successfully"
                      : testResult.error || "Failed to send test message"}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleTestSms}
                disabled={
                  !hasConfiguredProvider ||
                  !testPhone ||
                  !testMessage ||
                  testLoading ||
                  setProviderMutation.isPending
                }
                className="w-full"
              >
                {testLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {testLoading ? "Sending..." : "Send Test Message"}
              </Button>
            </CardFooter>
          </Card>

          {!hasConfiguredProvider && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Provider Configured</AlertTitle>
              <AlertDescription>
                You need to configure an SMS provider before you can send test
                messages.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Message Logs</CardTitle>
                <CardDescription>
                  View history of test messages sent through the system
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setRefreshLogs(prev => prev + 1);
                  refetchLogs();
                  toast({
                    title: "Refreshing logs",
                    description: "Getting the latest message logs",
                  });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : logsError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Loading Logs</AlertTitle>
                  <AlertDescription>
                    {logsError instanceof Error 
                      ? logsError.message 
                      : "Failed to load message logs"}
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {messageLogs?.logs && messageLogs.logs.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground mb-2">
                        Provider: <span className="font-medium">{messageLogs.provider}</span>
                        {messageLogs.note && (
                          <p className="text-xs italic mt-1">{messageLogs.note}</p>
                        )}
                      </div>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-32">Timestamp</TableHead>
                              <TableHead className="w-32">Phone Number</TableHead>
                              <TableHead>Message</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {messageLogs.logs.map((log, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-xs">
                                  {new Date(log.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {log.to}
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm">{log.message}</p>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                      <p className="mt-2 text-muted-foreground">No message logs found</p>
                      <p className="text-xs text-muted-foreground mt-1">Send a test message to see logs here</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
