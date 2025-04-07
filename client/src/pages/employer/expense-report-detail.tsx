import { useParams, Link, useLocation } from "wouter";
import { useExpenseReport } from "@/hooks/use-expense-report";
import { useEmployerExpenseReports } from "@/hooks/use-expense-reports";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { 
  ArrowLeft, 
  Loader2, 
  Receipt, 
  Check,
  X,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ExpenseLineItemList } from "@/components/expense-reports/expense-line-item-list";
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
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function EmployerExpenseReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const reportId = id ? parseInt(id) : undefined;
  
  const { 
    expenseReport, 
    lineItems, 
    isLoading,
  } = useExpenseReport(reportId);
  
  const { updateExpenseReportStatus, isUpdating } = useEmployerExpenseReports();
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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
          <Link to="/employer/expense-reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    updateExpenseReportStatus({
      id: reportId,
      status: "approved"
    }, {
      onSuccess: () => {
        setShowApproveDialog(false);
        navigate("/employer/expense-reports");
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    
    updateExpenseReportStatus({
      id: reportId,
      status: "rejected",
      rejectionReason: rejectionReason.trim()
    }, {
      onSuccess: () => {
        setShowRejectDialog(false);
        navigate("/employer/expense-reports");
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

  const isPending = expenseReport.status === "submitted" || expenseReport.status === "under_review";

  return (
    <div className="container py-8">
      <Helmet>
        <title>Review Expense Report | PaySurity</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/employer/expense-reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Review Expense Report</h1>
          <Badge className={`${statusColors[expenseReport.status]} text-white`}>
            {statusLabels[expenseReport.status]}
          </Badge>
        </div>
        
        {isPending && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowRejectDialog(true)}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button 
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => setShowApproveDialog(true)}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{expenseReport.title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Employee #{expenseReport.employeeId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Calendar className="h-4 w-4" />
                <span>Submitted {format(new Date(expenseReport.submissionDate || Date.now()), "MMM dd, yyyy")}</span>
              </div>
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
          
          {expenseReport.status === "rejected" && expenseReport.rejectionReason && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h3>
              <p className="text-red-700">{expenseReport.rejectionReason}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Report Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                <Receipt className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="font-medium">{lineItems.length} Expense Items</p>
                <p className="text-sm text-gray-600">
                  Total: {formatCurrency(parseFloat(expenseReport.totalAmount))}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="font-medium">Timeline</p>
                <p className="text-sm text-gray-600">
                  Submitted {format(new Date(expenseReport.submissionDate || Date.now()), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                <FileText className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="font-medium">Status</p>
                <Badge className={`${statusColors[expenseReport.status]} mt-1 text-white`}>
                  {statusLabels[expenseReport.status]}
                </Badge>
              </div>
            </div>
            
            {isPending && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="font-medium text-amber-700">Action Required</p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  This expense report requires your review and approval.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-6">Expense Items</h2>
        <ExpenseLineItemList
          items={lineItems}
          isEditable={false}
        />
      </div>
      
      {/* Approve Confirmation Dialog */}
      <AlertDialog 
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Expense Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this expense report for {formatCurrency(parseFloat(expenseReport.totalAmount))}?
              This will mark it for payment processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Report"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog 
        open={showRejectDialog} 
        onOpenChange={setShowRejectDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense Report</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this expense report. This feedback will be shared with the employee.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Missing required receipts for meal expenses"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isUpdating || !rejectionReason.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}