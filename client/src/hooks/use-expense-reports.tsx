import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ExpenseReport, InsertExpenseReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing expense reports
 */
export function useExpenseReports() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenseReports = [], isLoading, error } = useQuery<ExpenseReport[]>({
    queryKey: ['/api/expense-reports'],
    staleTime: 30000, // 30 seconds
  });

  const createExpenseReportMutation = useMutation({
    mutationFn: async (data: Omit<InsertExpenseReport, 'status' | 'submissionDate'>) => {
      const res = await apiRequest("POST", "/api/expense-reports", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create expense report");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense report created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense report",
        variant: "destructive",
      });
    },
  });

  const submitExpenseReportMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await apiRequest("PATCH", `/api/expense-reports/${id}/status`, {
        status: "submitted",
        submissionDate: new Date().toISOString(),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit expense report");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Expense report submitted for approval",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', variables.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit expense report",
        variant: "destructive",
      });
    },
  });

  return {
    expenseReports,
    isLoading,
    error,
    createExpenseReport: createExpenseReportMutation.mutate,
    isCreating: createExpenseReportMutation.isPending,
    submitExpenseReport: submitExpenseReportMutation.mutate,
    isSubmitting: submitExpenseReportMutation.isPending,
  };
}

/**
 * Hook for managing employer expense report reviews
 */
export function useEmployerExpenseReports() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenseReports = [], isLoading, error } = useQuery<ExpenseReport[]>({
    queryKey: ['/api/employer/expense-reports'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expense-reports?role=employer");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch expense reports");
      }
      return res.json();
    },
    staleTime: 30000, // 30 seconds
  });

  const updateExpenseReportStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      rejectionReason,
    }: {
      id: number;
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/expense-reports/${id}/status`, {
        status,
        rejectionReason,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${status} expense report`);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      const actionText = variables.status === 'approved' ? 'approved' : 'rejected';
      toast({
        title: "Success",
        description: `Expense report ${actionText} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/expense-reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', variables.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense report",
        variant: "destructive",
      });
    },
  });

  return {
    expenseReports,
    isLoading,
    error,
    updateExpenseReportStatus: updateExpenseReportStatusMutation.mutate,
    isUpdating: updateExpenseReportStatusMutation.isPending,
  };
}