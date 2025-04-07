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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  CreditCard,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export interface SpendingRules {
  dailyLimit: string;
  weeklyLimit: string;
  monthlyLimit: string;
  perTransactionLimit: string;
  blockedCategories: string[];
  blockedMerchants: string[];
  requireApprovalAmount: string;
  requireApprovalForAll: boolean;
  allowOnlinePurchases: boolean;
  allowInStorePurchases: boolean;
  allowWithdrawals: boolean;
  withdrawalLimit: string;
}

interface SpendingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (childId: string, rules: SpendingRules) => void;
  childAccount: {
    id: string;
    name: string;
  };
  currentRules?: Partial<SpendingRules>;
}

// Categories that can be blocked
const categories = [
  { value: "gaming", label: "Gaming & Apps" },
  { value: "entertainment", label: "Entertainment" },
  { value: "food_delivery", label: "Food Delivery" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Accessories" },
  { value: "transportation", label: "Transportation" },
  { value: "toys", label: "Toys & Games" },
  { value: "social_media", label: "Social Media" },
];

const formSchema = z.object({
  dailyLimit: z.string().optional(),
  weeklyLimit: z.string().optional(),
  monthlyLimit: z.string().optional(),
  perTransactionLimit: z.string().optional(),
  blockedCategories: z.array(z.string()).default([]),
  blockedMerchants: z.string().optional(),
  requireApprovalAmount: z.string().optional(),
  requireApprovalForAll: z.boolean().default(false),
  allowOnlinePurchases: z.boolean().default(true),
  allowInStorePurchases: z.boolean().default(true),
  allowWithdrawals: z.boolean().default(false),
  withdrawalLimit: z.string().optional(),
});

export default function SpendingRulesModal({
  isOpen,
  onClose,
  onSave,
  childAccount,
  currentRules,
}: SpendingRulesModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("limits");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dailyLimit: currentRules?.dailyLimit || "",
      weeklyLimit: currentRules?.weeklyLimit || "",
      monthlyLimit: currentRules?.monthlyLimit || "",
      perTransactionLimit: currentRules?.perTransactionLimit || "",
      blockedCategories: currentRules?.blockedCategories || [],
      blockedMerchants: currentRules?.blockedMerchants?.join(", ") || "",
      requireApprovalAmount: currentRules?.requireApprovalAmount || "",
      requireApprovalForAll: currentRules?.requireApprovalForAll || false,
      allowOnlinePurchases: currentRules?.allowOnlinePurchases !== undefined 
        ? currentRules.allowOnlinePurchases 
        : true,
      allowInStorePurchases: currentRules?.allowInStorePurchases !== undefined 
        ? currentRules.allowInStorePurchases 
        : true,
      allowWithdrawals: currentRules?.allowWithdrawals || false,
      withdrawalLimit: currentRules?.withdrawalLimit || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const merchants = values.blockedMerchants 
      ? values.blockedMerchants.split(",").map(m => m.trim()).filter(Boolean)
      : [];
    
    const rules: SpendingRules = {
      ...values,
      blockedMerchants: merchants,
    };
    
    onSave(childAccount.id, rules);
    
    toast({
      title: "Spending rules updated",
      description: `Spending rules for ${childAccount.name} have been updated.`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Spending Rules for {childAccount.name}</DialogTitle>
          <DialogDescription>
            Set rules and limits to help manage your child's spending.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="limits" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="limits">Spending Limits</TabsTrigger>
                <TabsTrigger value="permissions">Purchase Types</TabsTrigger>
                <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="limits" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dailyLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Limit ($)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="No limit" />
                        </FormControl>
                        <FormDescription>
                          Maximum amount to spend per day
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weeklyLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weekly Limit ($)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="No limit" />
                        </FormControl>
                        <FormDescription>
                          Maximum amount to spend per week
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Limit ($)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="No limit" />
                        </FormControl>
                        <FormDescription>
                          Maximum amount to spend per month
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="perTransactionLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Per Transaction Limit ($)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="No limit" />
                        </FormControl>
                        <FormDescription>
                          Maximum amount per individual purchase
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-1">
                  <FormField
                    control={form.control}
                    name="requireApprovalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Require Approval Above ($)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="No approval required" />
                        </FormControl>
                        <FormDescription>
                          Transactions above this amount require your approval
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="requireApprovalForAll"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Approval for All Spending</FormLabel>
                        <FormDescription>
                          All transactions require your approval regardless of amount
                        </FormDescription>
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
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-4">
                <FormField
                  control={form.control}
                  name="allowInStorePurchases"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5 flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <FormLabel className="text-base">In-Store Purchases</FormLabel>
                          <FormDescription>
                            Allow purchases in physical stores
                          </FormDescription>
                        </div>
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
                
                <FormField
                  control={form.control}
                  name="allowOnlinePurchases"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5 flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <FormLabel className="text-base">Online Purchases</FormLabel>
                          <FormDescription>
                            Allow purchases online and in apps
                          </FormDescription>
                        </div>
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
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="allowWithdrawals"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5 flex items-center">
                          <DollarSign className="h-5 w-5 mr-3 text-primary" />
                          <div>
                            <FormLabel className="text-base">Cash Withdrawals</FormLabel>
                            <FormDescription>
                              Allow ATM and cash withdrawals
                            </FormDescription>
                          </div>
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
                  
                  {form.watch("allowWithdrawals") && (
                    <div className="pl-10 pb-2">
                      <FormField
                        control={form.control}
                        name="withdrawalLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Withdrawal Limit ($)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="No limit" />
                            </FormControl>
                            <FormDescription>
                              Maximum amount per withdrawal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="restrictions" className="space-y-6">
                <div>
                  <FormField
                    control={form.control}
                    name="blockedCategories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blocked Categories</FormLabel>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2 pt-1">
                            {categories.map((category) => {
                              const isSelected = field.value?.includes(category.value);
                              return (
                                <Badge
                                  key={category.value}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer px-3 py-1 rounded-full ${
                                    isSelected ? "bg-primary" : ""
                                  }`}
                                  onClick={() => {
                                    const newValue = isSelected
                                      ? field.value?.filter(
                                          (value) => value !== category.value
                                        )
                                      : [...(field.value || []), category.value];
                                    field.onChange(newValue);
                                  }}
                                >
                                  {isSelected && (
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  {category.label}
                                </Badge>
                              );
                            })}
                          </div>
                          <FormDescription>
                            Transactions in these categories will be blocked
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="blockedMerchants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blocked Merchants</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter merchant names separated by commas"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Transactions with these merchants will be blocked
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit">Save Rules</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}