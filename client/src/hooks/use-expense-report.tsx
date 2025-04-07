import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ExpenseReport, ExpenseLineItem, InsertExpenseLineItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing a single expense report and its line items
 */
export function useExpenseReport(reportId: number | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: expenseReport,
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery<ExpenseReport>({
    queryKey: ['/api/expense-reports', reportId],
    enabled: !!reportId,
  });

  const {
    data: lineItems = [],
    isLoading: isLoadingLineItems,
    error: lineItemsError,
  } = useQuery<ExpenseLineItem[]>({
    queryKey: ['/api/expense-reports', reportId, 'line-items'],
    queryFn: async () => {
      if (!reportId) return [];
      const res = await apiRequest("GET", `/api/expense-reports/${reportId}/line-items`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch expense line items");
      }
      return res.json();
    },
    enabled: !!reportId,
  });

  const createLineItemMutation = useMutation({
    mutationFn: async (data: Omit<InsertExpenseLineItem, 'expenseReportId'>) => {
      if (!reportId) throw new Error("Report ID is required");
      const lineItem: InsertExpenseLineItem = {
        ...data,
        expenseReportId: reportId,
      };
      const res = await apiRequest("POST", `/api/expense-reports/${reportId}/line-items`, lineItem);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add expense item");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense item added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', reportId, 'line-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', reportId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense item",
        variant: "destructive",
      });
    },
  });

  const updateLineItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertExpenseLineItem> }) => {
      const res = await apiRequest("PATCH", `/api/expense-reports/line-items/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update expense item");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', reportId, 'line-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', reportId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense item",
        variant: "destructive",
      });
    },
  });

  const deleteLineItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/expense-reports/line-items/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete expense item");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', reportId, 'line-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expense-reports', reportId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense item",
        variant: "destructive",
      });
    },
  });

  return {
    expenseReport,
    lineItems,
    isLoading: isLoadingReport || isLoadingLineItems,
    error: reportError || lineItemsError,
    addLineItem: createLineItemMutation.mutate,
    isAddingLineItem: createLineItemMutation.isPending,
    updateLineItem: updateLineItemMutation.mutate,
    isUpdatingLineItem: updateLineItemMutation.isPending,
    deleteLineItem: deleteLineItemMutation.mutate,
    isDeletingLineItem: deleteLineItemMutation.isPending,
    totalAmount: expenseReport?.totalAmount || "0",
  };
}