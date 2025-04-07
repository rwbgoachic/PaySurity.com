import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";

export interface SpendingRequest {
  id?: string;
  amount: string;
  reason: string;
  category: string;
  purchaseType: "in_store" | "online" | "withdrawal";
  merchant?: string;
  status?: "pending" | "approved" | "rejected";
  requestDate?: string;
  responseDate?: string;
  parentNote?: string;
}

interface SpendingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<SpendingRequest, "id" | "status" | "requestDate" | "responseDate" | "parentNote">) => void;
  availableBalance: string;
}

const spendingCategories = [
  { value: "food", label: "Food & Restaurants" },
  { value: "groceries", label: "Groceries" },
  { value: "entertainment", label: "Entertainment" },
  { value: "gaming", label: "Gaming" },
  { value: "clothing", label: "Clothing" },
  { value: "education", label: "Education" },
  { value: "toys", label: "Toys & Games" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "transportation", label: "Transportation" },
  { value: "electronics", label: "Electronics" },
  { value: "apps", label: "Mobile Apps" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a number",
    })
    .refine(val => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  reason: z.string().min(3, "Please provide a reason for this request"),
  category: z.string().min(1, "Please select a category"),
  purchaseType: z.enum(["in_store", "online", "withdrawal"]),
  merchant: z.string().optional(),
});

export default function SpendingRequestModal({
  isOpen,
  onClose,
  onSubmit,
  availableBalance,
}: SpendingRequestModalProps) {
  const { toast } = useToast();
  const availableAmount = parseFloat(availableBalance);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      reason: "",
      category: "",
      purchaseType: "in_store",
      merchant: "",
    },
  });

  const amountValue = form.watch("amount");
  const requestAmount = amountValue ? parseFloat(amountValue) : 0;
  const isOverBudget = requestAmount > availableAmount;
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (isOverBudget) {
      toast({
        title: "Amount exceeds available balance",
        description: "Please request an amount within your available balance.",
        variant: "destructive",
      });
      return;
    }
    
    const request = {
      amount: values.amount,
      reason: values.reason,
      category: values.category,
      purchaseType: values.purchaseType,
      merchant: values.merchant,
    };
    
    onSubmit(request);
    
    toast({
      title: "Spending request submitted",
      description: "Your request has been sent to your parent for approval.",
    });
    
    form.reset();
    onClose();
  };

  const getPurchaseTypeLabel = (type: string) => {
    switch (type) {
      case "in_store": return "In-store Purchase";
      case "online": return "Online/Mobile Purchase";
      case "withdrawal": return "Cash Withdrawal";
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Spending Approval</DialogTitle>
          <DialogDescription>
            Submit a request to your parent for spending approval.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <h3 className="text-xl font-bold">${availableBalance}</h3>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-80" />
            </div>
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  {isOverBudget && (
                    <FormDescription className="text-destructive">
                      This amount exceeds your available balance.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {spendingCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the category that best describes this expense
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purchaseType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Purchase Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="in_store" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          In-store Purchase
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="online" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Online/Mobile Purchase
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="withdrawal" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Cash Withdrawal
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="merchant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Store or website name" />
                  </FormControl>
                  <FormDescription>
                    Where will you be spending this money?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Request</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Please explain why you need this money..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Providing clear details improves your chances of approval
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isOverBudget}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}