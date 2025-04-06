import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";

// Form validation schema
const helcimFormSchema = z.object({
  helcimAccountId: z.string().min(1, "Account ID is required"),
  helcimApiKey: z.string().min(1, "API Key is required"),
  helcimTerminalId: z.string().optional(),
  testMode: z.boolean().default(true),
});

type HelcimFormValues = z.infer<typeof helcimFormSchema>;

interface HelcimSettingsFormProps {
  gatewayId: number;
  onSuccess?: () => void;
}

export function HelcimSettingsForm({ gatewayId, onSuccess }: HelcimSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Query to fetch existing Helcim integration settings
  const {
    data: integration,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/payment-gateways", gatewayId, "helcim"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/payment-gateways/${gatewayId}/helcim`);
        return await res.json();
      } catch (err) {
        // If 404, it means integration doesn't exist yet
        if (err instanceof Response && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
  });

  // Setup form with validation
  const form = useForm<HelcimFormValues>({
    resolver: zodResolver(helcimFormSchema),
    defaultValues: {
      helcimAccountId: "",
      helcimApiKey: "",
      helcimTerminalId: "",
      testMode: true,
    },
  });

  // Update form when integration data is loaded
  useEffect(() => {
    if (integration) {
      form.reset({
        helcimAccountId: integration.helcimAccountId,
        helcimApiKey: integration.helcimApiKey,
        helcimTerminalId: integration.helcimTerminalId || "",
        testMode: integration.testMode,
      });
    }
  }, [integration, form]);

  // Mutation to create or update Helcim integration
  const { mutate: saveIntegration, isPending: isSaving } = useMutation({
    mutationFn: async (data: HelcimFormValues) => {
      const method = integration ? "PUT" : "POST";
      const res = await apiRequest(
        method,
        `/api/payment-gateways/${gatewayId}/helcim`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: integration
          ? "Helcim integration updated successfully."
          : "Helcim integration created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways", gatewayId, "helcim"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to save Helcim integration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to test Helcim connection
  const { mutate: testConnection } = useMutation({
    mutationFn: async () => {
      setIsTestingConnection(true);
      try {
        const res = await apiRequest(
          "POST",
          `/api/payment-gateways/${gatewayId}/helcim/test`
        );
        return await res.json();
      } finally {
        setIsTestingConnection(false);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Connection Successful",
          description: "Your Helcim integration is working correctly.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Helcim. Please verify your credentials.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Test Failed",
        description: `Failed to test Helcim connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HelcimFormValues) => {
    saveIntegration(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !(error instanceof Response && error.status === 404)) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load Helcim integration settings. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Helcim Integration Settings</CardTitle>
            <CardDescription>
              Configure your Helcim integration for payment processing
            </CardDescription>
          </div>
          {integration && (
            <Badge variant={integration.testMode ? "outline" : "default"}>
              {integration.testMode ? "Test Mode" : "Live Mode"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <InfoCircledIcon className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            You'll need your Helcim merchant account ID and API key to set up this integration.
            These can be found in your Helcim merchant dashboard.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="helcimAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Helcim Account ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Helcim Account ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="helcimApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Helcim API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Helcim API Key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="helcimTerminalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Terminal ID for card-present transactions"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="testMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Test Mode</FormLabel>
                    <CardDescription>
                      Enable test mode to use Helcim's sandbox environment
                    </CardDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {integration ? "Update Integration" : "Create Integration"}
              </Button>
              
              {integration && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConnection()}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Test Connection
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      {integration && (
        <CardFooter className="flex flex-col items-start border-t bg-muted/50 px-6 py-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Integration ID:</strong> {integration.id}</p>
            <p><strong>Created:</strong> {new Date(integration.createdAt).toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> {new Date(integration.updatedAt).toLocaleDateString()}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}