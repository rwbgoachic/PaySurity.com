import { useState } from "react";
import { z } from "zod";
import { ExpenseReport } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, Banknote, Wallet, DollarSign, RefreshCw, CheckCircle2 } from "lucide-react";

interface ExpenseReportPaymentProps {
  report: ExpenseReport;
  onSuccess: () => void;
  onCancel: () => void;
}

type PaymentMethod = "bank_transfer" | "card" | "wallet" | "cash";

const paymentFormSchema = z.object({
  paymentMethod: z.enum(["bank_transfer", "card", "wallet", "cash"], {
    required_error: "Please select a payment method.",
  }),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  sendReceipt: z.boolean().default(true),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function ExpenseReportPayment({ report, onSuccess, onCancel }: ExpenseReportPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: "bank_transfer",
      referenceNumber: "",
      notes: "",
      sendReceipt: true,
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const res = await apiRequest("POST", `/api/expense-reports/${report.id}/pay`, {
        ...data,
        paymentDate: new Date().toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-reports"] });
      toast({
        title: "Payment successful",
        description: "The expense report has been marked as paid.",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    setIsLoading(true);
    paymentMutation.mutate(data);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "bank_transfer":
        return <Banknote className="h-5 w-5" />;
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "wallet":
        return <Wallet className="h-5 w-5" />;
      case "cash":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Complete Payment</CardTitle>
        <CardDescription>
          Process payment for expense report #{report.id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Report Details</h3>
              <div className="bg-muted/40 p-4 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Title:</span>
                  <span className="font-medium">{report.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Amount:</span>
                  <span className="font-medium text-lg">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: report.currency || 'USD',
                    }).format(parseFloat(report.totalAmount))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status:</span>
                  <Badge variant="outline" className="capitalize">
                    {report.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Date:</span>
                  <span>
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Instructions</h3>
              <div className="bg-primary/5 p-4 rounded-md space-y-2 text-sm">
                <p>Please select a payment method and complete the form to process this payment.</p>
                <p>The expense report will be automatically marked as paid once the payment is processed.</p>
                <p>Include a reference number for bank transfers and card payments for easier tracking.</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center">
                            <Banknote className="h-4 w-4 mr-2" />
                            <span>Bank Transfer</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            <span>Credit / Debit Card</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="wallet">
                          <div className="flex items-center">
                            <Wallet className="h-4 w-4 mr-2" />
                            <span>Digital Wallet</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cash">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>Cash</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the method used to process this payment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter reference number (optional)"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Transaction ID, confirmation number, or other payment reference.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes about this payment"
                        className="resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sendReceipt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Send payment receipt</FormLabel>
                      <FormDescription>
                        Send an email receipt to the employee once payment is complete.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="ml-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Payment
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}