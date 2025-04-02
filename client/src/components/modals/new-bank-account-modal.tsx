import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, CreditCard } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBankAccountSchema } from "@shared/schema";

interface NewBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewBankAccountFormData) => void;
  isSubmitting?: boolean;
  error?: string;
  userId: number;
}

// Extend the schema with client-side validation
const newBankAccountSchema = insertBankAccountSchema.extend({
  userId: z.number(),
  bankName: z.string().min(1, "Bank name is required"),
  accountType: z.string().min(1, "Account type is required"),
  accountNumber: z.string()
    .min(1, "Account number is required")
    .regex(/^\d{10,17}$/, "Account number must be 10-17 digits"),
  routingNumber: z.string()
    .min(1, "Routing number is required")
    .regex(/^\d{9}$/, "Routing number must be 9 digits"),
});

export type NewBankAccountFormData = z.infer<typeof newBankAccountSchema>;

const accountTypes = [
  { value: "checking", label: "Checking Account" },
  { value: "savings", label: "Savings Account" },
  { value: "business_checking", label: "Business Checking" },
  { value: "business_savings", label: "Business Savings" },
];

export default function NewBankAccountModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
  userId,
}: NewBankAccountModalProps) {
  const form = useForm<NewBankAccountFormData>({
    resolver: zodResolver(newBankAccountSchema),
    defaultValues: {
      userId,
      bankName: "",
      accountType: "",
      accountNumber: "",
      routingNumber: "",
      isActive: true
    },
  });

  const handleSubmit = (data: NewBankAccountFormData) => {
    onSubmit(data);
  };

  const handleCloseModal = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Connect New Bank Account</DialogTitle>
          <DialogDescription className="text-center">
            Add your bank account details to transfer funds to and from your wallet
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter account number"
                      type="text"
                      inputMode="numeric"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter routing number"
                      type="text"
                      inputMode="numeric"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="sm:flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="sm:flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connecting..." : "Connect Account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}