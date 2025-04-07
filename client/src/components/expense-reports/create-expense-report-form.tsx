import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { InsertExpenseReport } from "@shared/schema";

// Extend the expense report schema with additional validation
const expenseReportSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  currency: z.string().default("USD"),
  employerId: z.number({
    required_error: "Please select an employer.",
  }),
});

type ExpenseReportFormValues = z.infer<typeof expenseReportSchema>;

interface Employer {
  id: number;
  name: string;
}

interface CreateExpenseReportFormProps {
  onSubmit: (data: Omit<InsertExpenseReport, "userId" | "status" | "totalAmount">) => void;
  isSubmitting: boolean;
  employers: Employer[];
}

export function CreateExpenseReportForm({
  onSubmit,
  isSubmitting,
  employers,
}: CreateExpenseReportFormProps) {
  const form = useForm<ExpenseReportFormValues>({
    resolver: zodResolver(expenseReportSchema),
    defaultValues: {
      title: "",
      description: "",
      currency: "USD",
    },
  });

  const handleSubmit = (values: ExpenseReportFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || "",
      currency: values.currency,
      employerId: values.employerId,
    });
  };

  const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "JPY", label: "JPY - Japanese Yen" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Title</FormLabel>
              <FormControl>
                <Input placeholder="Q1 Business Trip Expenses" {...field} />
              </FormControl>
              <FormDescription>
                Give your expense report a descriptive title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about this expense report"
                  className="resize-none min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employer</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employers.map((employer) => (
                      <SelectItem key={employer.id} value={employer.id.toString()}>
                        {employer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the employer for this expense report
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Currency for this expense report
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Expense Report"}
        </Button>
      </form>
    </Form>
  );
}