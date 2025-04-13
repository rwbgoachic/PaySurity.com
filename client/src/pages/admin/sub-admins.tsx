import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

// Define the form schema for creating a sub-super admin
const subAdminFormSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be less than 50 characters' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must be less than 100 characters' }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SubAdminFormValues = z.infer<typeof subAdminFormSchema>;

export default function SubAdminManagementPage() {
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize the form
  const form = useForm<SubAdminFormValues>({
    resolver: zodResolver(subAdminFormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  // Mutation to create a sub-super admin
  const createSubAdminMutation = useMutation({
    mutationFn: async (data: Omit<SubAdminFormValues, 'confirmPassword'>) => {
      return apiRequest("POST", '/api/admin/sub-admins', data);
    },
    onSuccess: () => {
      setSuccessMessage('Sub-super admin created successfully! They must set up 2FA after first login.');
      toast({
        title: "Sub-super admin created",
        description: "The new administrator has been added successfully",
      });
      // Reset the form
      form.reset();
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sub-admins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating admin",
        description: error.message || "There was an error creating the sub-super admin",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SubAdminFormValues) => {
    // Remove the confirmPassword field before sending to API
    const { confirmPassword, ...submitData } = data;
    createSubAdminMutation.mutate(submitData);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sub-Super Admin Management</h1>
          <p className="text-muted-foreground">
            Create and manage sub-super administrator accounts
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6">
        {successMessage && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
          <ShieldAlert className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Security Notice</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Only create sub-super admin accounts for trusted individuals. They will have extensive access to the system.
            Two-factor authentication will be enforced for all sub-super admin accounts.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Create New Sub-Super Admin</CardTitle>
            <CardDescription>
              Fill out this form to create a new sub-super administrator account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be used for logging into the admin portal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createSubAdminMutation.isPending}
                  >
                    {createSubAdminMutation.isPending 
                      ? "Creating..." 
                      : "Create Sub-Super Admin"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}