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
import { Label } from "@/components/ui/label";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { SavingsGoal } from "@/components/child/savings-goals-display";

const goalCategories = [
  { value: "toys", label: "Toys" },
  { value: "games", label: "Video Games" },
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "education", label: "Education" },
  { value: "travel", label: "Travel" },
  { value: "sports", label: "Sports Equipment" },
  { value: "music", label: "Music" },
  { value: "other", label: "Other" },
];

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, "id" | "isCompleted">) => void;
  currentGoal?: Partial<SavingsGoal>;
  isEditing?: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a number",
    })
    .refine(val => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  currentAmount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a number",
    })
    .refine(val => parseFloat(val) >= 0, {
      message: "Amount cannot be negative",
    }),
  dueDate: z.date().optional(),
  category: z.string().min(1, "Please select a category"),
  parentContribution: z.number().min(0).max(100).default(0),
});

export default function SavingsGoalModal({
  isOpen,
  onClose,
  onSave,
  currentGoal,
  isEditing = false,
}: SavingsGoalModalProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentGoal?.name || "",
      targetAmount: currentGoal?.targetAmount || "",
      currentAmount: currentGoal?.currentAmount || "0.00",
      dueDate: currentGoal?.dueDate ? new Date(currentGoal.dueDate) : undefined,
      category: currentGoal?.category || "",
      parentContribution: currentGoal?.parentContribution || 0,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const goal = {
      name: values.name,
      targetAmount: values.targetAmount,
      currentAmount: values.currentAmount,
      dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : undefined,
      category: values.category,
      parentContribution: values.parentContribution,
    };
    
    onSave(goal);
    
    toast({
      title: isEditing ? "Goal updated" : "Goal created",
      description: isEditing 
        ? "Your savings goal has been updated."
        : "Your new savings goal has been created.",
    });
    
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Savings Goal" : "New Savings Goal"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your savings goal details."
              : "Set a goal to save for something you want."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you saving for?</FormLabel>
                  <FormControl>
                    <Input placeholder="New bike, video game, toy, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      How much you need to save
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Amount ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      How much you already have saved
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
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
                        {goalCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date (Optional)</FormLabel>
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
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When do you want to reach this goal?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="parentContribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Contribution Request (%)</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 25, 50, 75, 100].map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant={field.value === value ? "default" : "outline"}
                          className={cn(
                            "h-8",
                            field.value === value && "text-primary-foreground"
                          )}
                          onClick={() => field.onChange(value)}
                        >
                          {value}%
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Ask your parent to match a percentage of what you save
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}