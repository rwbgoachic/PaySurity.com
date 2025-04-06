import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWallet } from "@/hooks/use-wallet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Define the form validation schema
const formSchema = z.object({
  walletType: z.enum(["main", "expense", "savings", "hsa", "retirement", "child"], {
    required_error: "Please select a wallet type",
  }),
  balance: z.string()
    .min(1, "Initial balance is required")
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Balance must be a valid number",
    }),
  isMain: z.boolean().default(false),
  monthlyLimit: z.string().optional(),
  dailyLimit: z.string().optional(),
  weeklyLimit: z.string().optional(),
  autoRefill: z.boolean().default(false),
  refillAmount: z.string().optional(),
  refillFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWalletDialog({ open, onOpenChange }: CreateWalletDialogProps) {
  const [step, setStep] = useState<"basic" | "limits" | "refill">("basic");
  const { mutate: createWallet, isPending } = useCreateWallet();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletType: "main",
      balance: "0",
      isMain: false,
      monthlyLimit: "",
      dailyLimit: "",
      weeklyLimit: "",
      autoRefill: false,
      refillAmount: "",
      refillFrequency: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    createWallet(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        setStep("basic");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
              <DialogDescription>
                Configure your new digital wallet for secure transactions and financial management.
              </DialogDescription>
            </DialogHeader>

            {step === "basic" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="walletType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select wallet type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="main">Main Wallet</SelectItem>
                          <SelectItem value="expense">Expense Wallet</SelectItem>
                          <SelectItem value="savings">Savings Wallet</SelectItem>
                          <SelectItem value="hsa">Health Savings Account</SelectItem>
                          <SelectItem value="retirement">Retirement Account</SelectItem>
                          <SelectItem value="child">Child Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the purpose of this wallet.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Balance</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            $
                          </span>
                          <Input
                            placeholder="0.00"
                            {...field}
                            className="pl-7"
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Starting balance for this wallet.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isMain"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Main Wallet</FormLabel>
                        <FormDescription>
                          Designate as your primary wallet for everyday transactions.
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

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep("limits")}
                  >
                    Next: Spending Limits
                  </Button>
                </div>
              </div>
            )}

            {step === "limits" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="dailyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Spending Limit</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            $
                          </span>
                          <Input
                            placeholder="No limit"
                            {...field}
                            className="pl-7"
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Maximum amount to spend per day. Leave blank for no limit.
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
                      <FormLabel>Weekly Spending Limit</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            $
                          </span>
                          <Input
                            placeholder="No limit"
                            {...field}
                            className="pl-7"
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Maximum amount to spend per week. Leave blank for no limit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Spending Limit</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            $
                          </span>
                          <Input
                            placeholder="No limit"
                            {...field}
                            className="pl-7"
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Maximum amount to spend per month. Leave blank for no limit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep("basic")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep("refill")}
                  >
                    Next: Auto Refill
                  </Button>
                </div>
              </div>
            )}

            {step === "refill" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="autoRefill"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Refill</FormLabel>
                        <FormDescription>
                          Automatically add funds to this wallet on a schedule.
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

                {form.watch("autoRefill") && (
                  <>
                    <FormField
                      control={form.control}
                      name="refillAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refill Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                $
                              </span>
                              <Input
                                placeholder="0.00"
                                {...field}
                                className="pl-7"
                                type="number"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Amount to add on each refill.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="refillFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refill Frequency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often to add funds to this wallet.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep("limits")}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Wallet"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}