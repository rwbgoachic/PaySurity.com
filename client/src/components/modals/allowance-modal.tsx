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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";

export interface AllowanceSettings {
  amount: string;
  frequency: "weekly" | "biweekly" | "monthly";
  startDate: string;
  autoDeposit: boolean;
  distributionRatio?: {
    spendable: number;
    savings: number;
  };
}

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (childId: string, settings: AllowanceSettings) => void;
  childAccount: {
    id: string;
    name: string;
  };
  currentSettings?: Partial<AllowanceSettings>;
}

const formSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a number",
    })
    .refine(val => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  startDate: z.date(),
  autoDeposit: z.boolean(),
  spendablePercentage: z.number().min(0).max(100),
});

export default function AllowanceModal({
  isOpen,
  onClose,
  onSave,
  childAccount,
  currentSettings,
}: AllowanceModalProps) {
  const { toast } = useToast();
  
  // Calculate default distribution values
  const defaultSpendablePercentage = currentSettings?.distributionRatio?.spendable 
    ? Math.round(currentSettings.distributionRatio.spendable * 100) 
    : 70;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: currentSettings?.amount || "10.00",
      frequency: currentSettings?.frequency || "weekly",
      startDate: currentSettings?.startDate ? new Date(currentSettings.startDate) : new Date(),
      autoDeposit: currentSettings?.autoDeposit !== undefined 
        ? currentSettings.autoDeposit 
        : true,
      spendablePercentage: defaultSpendablePercentage,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const settings: AllowanceSettings = {
      amount: values.amount,
      frequency: values.frequency,
      startDate: format(values.startDate, "yyyy-MM-dd"),
      autoDeposit: values.autoDeposit,
      distributionRatio: {
        spendable: values.spendablePercentage / 100,
        savings: (100 - values.spendablePercentage) / 100,
      },
    };
    
    onSave(childAccount.id, settings);
    
    toast({
      title: "Allowance settings saved",
      description: `Allowance for ${childAccount.name} has been set to $${values.amount} ${values.frequency}.`,
    });
    
    onClose();
  };

  const spendablePercentage = form.watch("spendablePercentage");
  const savingsPercentage = 100 - spendablePercentage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Allowance for {childAccount.name}</DialogTitle>
          <DialogDescription>
            Configure the allowance amount and payment schedule.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Allowance amount per period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
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
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often the allowance is paid
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When to start paying the allowance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <FormLabel>Distribution</FormLabel>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">{spendablePercentage}%</span> spendable, <span className="font-medium text-primary">{savingsPercentage}%</span> savings
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="spendablePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-1">
                        <div className="grid grid-cols-11 gap-2 pb-1">
                          <div className="col-span-5 text-left text-sm">Savings</div>
                          <div className="col-span-1 text-center text-sm"></div>
                          <div className="col-span-5 text-right text-sm">Spendable</div>
                        </div>
                        <Input
                          type="range"
                          min={0}
                          max={100}
                          step={10}
                          className="accent-primary"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How the allowance is distributed between spending and savings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="autoDeposit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Automatic Deposits</FormLabel>
                    <FormDescription>
                      Automatically deposit allowance on schedule
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
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}