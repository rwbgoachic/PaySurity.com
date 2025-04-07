import { useEmployerExpenseReports } from "@/hooks/use-expense-reports";
import { ExpenseReportCard } from "@/components/expense-reports/expense-report-card";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EmployerExpenseReportsPage() {
  const { expenseReports, isLoading, updateExpenseReportStatus, isUpdating } = useEmployerExpenseReports();
  const [, navigate] = useLocation();
  
  const [activeTab, setActiveTab] = useState("pending");
  const [reviewingReportId, setReviewingReportId] = useState<number | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingReports = expenseReports.filter(report => 
    report.status === "submitted" || report.status === "under_review"
  );
  
  const approvedReports = expenseReports.filter(report => 
    report.status === "approved" || report.status === "paid"
  );
  
  const rejectedReports = expenseReports.filter(report => 
    report.status === "rejected" || report.status === "canceled"
  );

  const handleReviewClick = (reportId: number) => {
    navigate(`/employer/expense-reports/${reportId}`);
  };

  const handleApproveClick = (reportId: number) => {
    setReviewingReportId(reportId);
    setShowApproveDialog(true);
  };

  const handleRejectClick = (reportId: number) => {
    setReviewingReportId(reportId);
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (reviewingReportId === null) return;
    
    updateExpenseReportStatus({
      id: reviewingReportId,
      status: "approved"
    }, {
      onSuccess: () => {
        setShowApproveDialog(false);
        setReviewingReportId(null);
      }
    });
  };

  const confirmReject = () => {
    if (reviewingReportId === null) return;
    
    updateExpenseReportStatus({
      id: reviewingReportId,
      status: "rejected",
      rejectionReason: rejectionReason.trim() || "Report rejected by employer."
    }, {
      onSuccess: () => {
        setShowRejectDialog(false);
        setReviewingReportId(null);
        setRejectionReason("");
      }
    });
  };

  return (
    <div className="container py-8">
      <Helmet>
        <title>Employee Expense Reports | PaySurity</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Employee Expense Reports</h1>
        <p className="text-gray-600">
          Review and manage expense reports from your employees
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {!expenseReports.length ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No expense reports to review</h3>
              <p className="text-gray-600">
                Your employees haven't submitted any expense reports yet.
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="gap-2">
                  Pending Approval
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 ml-1">
                    {pendingReports.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  Approved
                  <Badge variant="outline" className="bg-green-100 text-green-800 ml-1">
                    {approvedReports.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  Rejected
                  <Badge variant="outline" className="bg-red-100 text-red-800 ml-1">
                    {rejectedReports.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-0">
                {pendingReports.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No reports pending approval</h3>
                    <p className="text-gray-600">
                      All employee expense reports have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingReports.map((report) => (
                      <ExpenseReportCard
                        key={report.id}
                        report={report}
                        view="employer"
                        onReviewClick={handleReviewClick}
                        onApproveClick={handleApproveClick}
                        onRejectClick={handleRejectClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                {approvedReports.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No approved reports</h3>
                    <p className="text-gray-600">
                      You haven't approved any expense reports yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {approvedReports.map((report) => (
                      <ExpenseReportCard
                        key={report.id}
                        report={report}
                        view="employer"
                        onReviewClick={handleReviewClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                {rejectedReports.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No rejected reports</h3>
                    <p className="text-gray-600">
                      You haven't rejected any expense reports.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rejectedReports.map((report) => (
                      <ExpenseReportCard
                        key={report.id}
                        report={report}
                        view="employer"
                        onReviewClick={handleReviewClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {/* Approve Confirmation Dialog */}
      <AlertDialog 
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Expense Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this expense report? This will mark it for payment processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewingReportId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
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
                setReviewingReportId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={isUpdating}
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