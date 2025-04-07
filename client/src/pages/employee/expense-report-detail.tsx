import { useParams, Link, useLocation } from "wouter";
import { useExpenseReport } from "@/hooks/use-expense-report";
import { useExpenseReports } from "@/hooks/use-expense-reports";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Receipt, 
  Send 
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ExpenseLineItemList } from "@/components/expense-reports/expense-line-item-list";
import { ExpenseLineItemForm } from "@/components/expense-reports/expense-line-item-form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { ExpenseLineItem, InsertExpenseLineItem } from "@shared/schema";

export default function EmployeeExpenseReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const reportId = id ? parseInt(id) : undefined;
  
  const { 
    expenseReport, 
    lineItems, 
    isLoading, 
    addLineItem, 
    isAddingLineItem, 
    updateLineItem,
    isUpdatingLineItem, 
    deleteLineItem,
    isDeletingLineItem
  } = useExpenseReport(reportId);
  
  const { submitExpenseReport, isSubmitting } = useExpenseReports();
  
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseLineItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!reportId || !expenseReport) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Expense report not found</h1>
        <p className="mb-8">The expense report you're looking for does not exist or you don't have access to it.</p>
        <Button asChild>
          <Link to="/employee/expense-reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    );
  }

  const handleAddItem = (data: Omit<InsertExpenseLineItem, "expenseReportId">) => {
    addLineItem(data, {
      onSuccess: () => {
        setIsAddItemDialogOpen(false);
      }
    });
  };

  const handleUpdateItem = (data: Omit<InsertExpenseLineItem, "expenseReportId">) => {
    if (!editingItem) return;
    
    updateLineItem({
      id: editingItem.id,
      data
    }, {
      onSuccess: () => {
        setEditingItem(null);
      }
    });
  };

  const handleDelete = (itemId: number) => {
    setItemToDelete(itemId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete === null) return;
    
    deleteLineItem(itemToDelete, {
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
        setItemToDelete(null);
      }
    });
  };

  const handleEditClick = (item: ExpenseLineItem) => {
    setEditingItem(item);
  };

  const handleSubmitReport = () => {
    submitExpenseReport({ id: reportId }, {
      onSuccess: () => {
        navigate("/employee/expense-reports");
      }
    });
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500",
    submitted: "bg-blue-500",
    under_review: "bg-amber-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
    paid: "bg-purple-500",
    canceled: "bg-gray-700",
  };

  const statusLabels: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    paid: "Paid",
    canceled: "Canceled",
  };

  const canEdit = expenseReport.status === "draft";
  const canSubmit = canEdit && lineItems.length > 0;

  return (
    <div className="container py-8">
      <Helmet>
        <title>{expenseReport.title} | Expense Report | PaySurity</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/employee/expense-reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{expenseReport.title}</h1>
          <Badge className={`${statusColors[expenseReport.status]} text-white`}>
            {statusLabels[expenseReport.status]}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button 
              onClick={() => setIsAddItemDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Expense Item
            </Button>
          )}
          
          {canSubmit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit for Approval
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Expense Report</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to submit this expense report for approval? 
                    Once submitted, you will no longer be able to make changes to the report.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Report Details</h2>
              <p className="text-gray-600 text-sm">
                Created on {format(new Date(expenseReport.createdAt || Date.now()), "MMM dd, yyyy")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold">
                {formatCurrency(parseFloat(expenseReport.totalAmount))}
              </div>
            </div>
          </div>
          
          {expenseReport.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p>{expenseReport.description}</p>
            </div>
          )}
          
          {expenseReport.submissionDate && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted On</h3>
              <p>{format(new Date(expenseReport.submissionDate), "MMM dd, yyyy")}</p>
            </div>
          )}
          
          {expenseReport.status === "rejected" && expenseReport.rejectionReason && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h3>
              <p className="text-red-700">{expenseReport.rejectionReason}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Report Status</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{lineItems.length} Expense Items</p>
                <p className="text-sm text-gray-600">
                  {expenseReport.totalAmount === "0" 
                    ? "No expenses added" 
                    : `Total: ${formatCurrency(parseFloat(expenseReport.totalAmount))}`
                  }
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Status</h3>
              <Badge className={`${statusColors[expenseReport.status]} text-white`}>
                {statusLabels[expenseReport.status]}
              </Badge>
              
              {expenseReport.status !== "draft" && (
                <div className="mt-4 text-sm text-gray-600">
                  Submitted on {format(new Date(expenseReport.submissionDate || Date.now()), "MMM dd, yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Expense Items</h2>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddItemDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
        
        <ExpenseLineItemList
          items={lineItems}
          onEditItem={canEdit ? handleEditClick : undefined}
          onDeleteItem={canEdit ? handleDelete : undefined}
          isEditable={canEdit}
        />
      </div>
      
      {/* Add Expense Item Dialog */}
      <Dialog 
        open={isAddItemDialogOpen} 
        onOpenChange={setIsAddItemDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense Item</DialogTitle>
            <DialogDescription>
              Add details for your new expense item. Be sure to include all required information.
            </DialogDescription>
          </DialogHeader>
          
          <ExpenseLineItemForm
            onSubmit={handleAddItem}
            isSubmitting={isAddingLineItem}
          />
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddItemDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Expense Item Dialog */}
      <Dialog 
        open={!!editingItem} 
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Expense Item</DialogTitle>
            <DialogDescription>
              Update the details for this expense item.
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <ExpenseLineItemForm
              onSubmit={handleUpdateItem}
              isSubmitting={isUpdatingLineItem}
              defaultValues={{
                description: editingItem.description,
                amount: editingItem.amount,
                category: editingItem.category,
                date: new Date(editingItem.date),
                merchant: editingItem.merchant,
                notes: editingItem.notes,
                receiptUrl: editingItem.receiptUrl,
              }}
            />
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeletingLineItem}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingLineItem ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Item"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}