import { useEmployerExpenseReports } from "@/hooks/use-expense-reports";
import { ExpenseReportCard } from "@/components/expense-reports/expense-report-card";
import { ExpenseReportSummary } from "@/components/expense-reports/expense-report-summary";
import { ExpenseReportFilters, ExpenseReportFilterOptions } from "@/components/expense-reports/expense-report-filters-simple";
import { ExpenseReportPayment } from "@/components/expense-reports/expense-report-payment";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
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
import { ExpenseReport } from "@shared/schema";

export default function EmployerExpenseReportsPage() {
  const { 
    expenseReports, 
    isLoading, 
    updateExpenseReportStatus, 
    isUpdating,
    processPayment,
    isProcessingPayment
  } = useEmployerExpenseReports();
  
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("pending");
  const [filters, setFilters] = useState<ExpenseReportFilterOptions>({});
  const [reviewingReportId, setReviewingReportId] = useState<number | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Apply filters to reports
  const filteredReports = useMemo(() => {
    let result = [...expenseReports];
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(report => report.status === filters.status);
    } else if (activeTab === "pending") {
      result = result.filter(report => ["submitted", "under_review"].includes(report.status));
    } else if (activeTab === "approved") {
      result = result.filter(report => ["approved", "paid"].includes(report.status));
    } else if (activeTab === "rejected") {
      result = result.filter(report => ["rejected", "canceled"].includes(report.status));
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(report => 
        report.title.toLowerCase().includes(searchLower) || 
        (report.description && report.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      result = result.filter(report => {
        const reportDate = new Date(report.submissionDate || report.createdAt || '');
        
        if (filters.startDate && reportDate < filters.startDate) {
          return false;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (reportDate > endDate) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    // Apply amount range filter
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      result = result.filter(report => {
        const amount = parseFloat(report.totalAmount);
        
        if (filters.minAmount !== undefined && amount < filters.minAmount) {
          return false;
        }
        
        if (filters.maxAmount !== undefined && amount > filters.maxAmount) {
          return false;
        }
        
        return true;
      });
    }
    
    return result;
  }, [expenseReports, filters, activeTab]);

  // Categorize filtered reports by status
  const pendingReports = filteredReports.filter(report => 
    report.status === "submitted" || report.status === "under_review"
  );
  
  const approvedReports = filteredReports.filter(report => 
    report.status === "approved" || report.status === "paid"
  );
  
  const rejectedReports = filteredReports.filter(report => 
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

  const handleProcessPayment = (reportId: number, paymentMethod: string, referenceNumber?: string) => {
    processPayment({
      id: reportId,
      paymentMethod,
      paymentReference: referenceNumber,
    });
  };

  // Find a report by ID
  const getReportById = (id: number | null): ExpenseReport | undefined => {
    if (id === null) return undefined;
    return expenseReports.find(report => report.id === id);
  };

  const reviewingReport = getReportById(reviewingReportId);

  return (
    <div className="container py-8">
      <Helmet>
        <title>Employee Expense Reports | PaySurity</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employee Expense Reports</h1>
          <p className="text-gray-600">
            Review and manage expense reports from your employees
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setFilters({});
            setActiveTab("pending");
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Filters
        </Button>
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
            <div className="space-y-6">
              {/* Summary cards */}
              <ExpenseReportSummary reports={expenseReports} view="employer" />

              {/* Filters */}
              <ExpenseReportFilters
                reports={expenseReports}
                onFilterChange={setFilters}
                view="employer"
              />

              {/* Expense report tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    All Reports
                    <Badge className="ml-2 bg-gray-100 text-gray-800">
                      {filteredReports.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending
                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                      {pendingReports.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Approved
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {approvedReports.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected
                    <Badge className="ml-2 bg-red-100 text-red-800">
                      {rejectedReports.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No reports match your filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredReports.map((report) => (
                        <ExpenseReportCard
                          key={report.id}
                          report={report}
                          view="employer"
                          onReviewClick={handleReviewClick}
                          onApproveClick={report.status === "submitted" ? handleApproveClick : undefined}
                          onRejectClick={report.status === "submitted" ? handleRejectClick : undefined}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

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
                        <div key={report.id} className="relative">
                          <ExpenseReportCard
                            report={report}
                            view="employer"
                            onReviewClick={handleReviewClick}
                          />
                          {report.status === "approved" && (
                            <div className="mt-2">
                              <ExpenseReportPayment
                                report={report}
                                onProcessPayment={handleProcessPayment}
                                isProcessing={isProcessingPayment}
                              />
                            </div>
                          )}
                        </div>
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
            </div>
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
              {reviewingReport && (
                <div className="mt-2">
                  <div className="mb-2">
                    <span className="font-semibold">Report:</span> {reviewingReport.title}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Amount:</span> ${parseFloat(reviewingReport.totalAmount).toFixed(2)}
                  </div>
                </div>
              )}
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
              {reviewingReport && (
                <div className="mt-2 mb-4">
                  <div className="mb-1">
                    <span className="font-semibold">Report:</span> {reviewingReport.title}
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span> ${parseFloat(reviewingReport.totalAmount).toFixed(2)}
                  </div>
                </div>
              )}
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