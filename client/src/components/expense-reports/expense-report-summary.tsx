import { useMemo } from "react";
import { ExpenseReport } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  Ban,
  RefreshCw,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ExpenseReportSummaryProps {
  reports: ExpenseReport[];
  view: "employee" | "employer";
}

export function ExpenseReportSummary({ reports, view }: ExpenseReportSummaryProps) {
  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalReports = reports.length;
    
    // Convert string amounts to numbers and calculate totals
    const amounts = reports.map((report) => parseFloat(report.amount));
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    
    // Status counts
    const statusCounts = {
      draft: reports.filter((r) => r.status === "draft").length,
      submitted: reports.filter((r) => r.status === "submitted").length,
      under_review: reports.filter((r) => r.status === "under_review").length,
      approved: reports.filter((r) => r.status === "approved").length,
      rejected: reports.filter((r) => r.status === "rejected").length,
      paid: reports.filter((r) => r.status === "paid").length,
      canceled: reports.filter((r) => r.status === "canceled").length,
    };
    
    // Calculate percentages
    const pendingCount = statusCounts.submitted + statusCounts.under_review;
    const pendingAmount = reports
      .filter((r) => r.status === "submitted" || r.status === "under_review")
      .reduce((sum, report) => sum + parseFloat(report.amount), 0);
    
    const approvedAmount = reports
      .filter((r) => r.status === "approved")
      .reduce((sum, report) => sum + parseFloat(report.amount), 0);
    
    const paidAmount = reports
      .filter((r) => r.status === "paid")
      .reduce((sum, report) => sum + parseFloat(report.amount), 0);
    
    const rejectedAmount = reports
      .filter((r) => r.status === "rejected")
      .reduce((sum, report) => sum + parseFloat(report.amount), 0);
    
    // Calculate percentages (avoid division by zero)
    const pendingPercentage = totalReports > 0 ? (pendingCount / totalReports) * 100 : 0;
    const approvedPercentage = totalReports > 0 ? (statusCounts.approved / totalReports) * 100 : 0;
    const paidPercentage = totalReports > 0 ? (statusCounts.paid / totalReports) * 100 : 0;
    const rejectedPercentage = totalReports > 0 ? (statusCounts.rejected / totalReports) * 100 : 0;
    
    return {
      totalReports,
      totalAmount,
      statusCounts,
      pendingCount,
      pendingAmount,
      approvedAmount,
      paidAmount,
      rejectedAmount,
      pendingPercentage,
      approvedPercentage,
      paidPercentage,
      rejectedPercentage,
    };
  }, [reports]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{summary.totalReports}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total value: {formatCurrency(summary.totalAmount)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {view === "employee" ? "Pending Review" : "Pending Approval"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-500 mr-2" />
            <div className="text-2xl font-bold">{summary.pendingCount}</div>
            <div className="text-xs ml-2 text-muted-foreground">{formatPercentage(summary.pendingPercentage)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Value: {formatCurrency(summary.pendingAmount)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {view === "employee" ? "Approved" : "Approved & Pending Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div className="text-2xl font-bold">{summary.statusCounts.approved}</div>
            <div className="text-xs ml-2 text-muted-foreground">{formatPercentage(summary.approvedPercentage)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Value: {formatCurrency(summary.approvedAmount)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {view === "employee" ? "Rejected" : "Rejected Reports"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Ban className="h-5 w-5 text-red-500 mr-2" />
            <div className="text-2xl font-bold">{summary.statusCounts.rejected}</div>
            <div className="text-xs ml-2 text-muted-foreground">{formatPercentage(summary.rejectedPercentage)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Value: {formatCurrency(summary.rejectedAmount)}
          </p>
        </CardContent>
      </Card>

      {/* Advanced summary for employer view with more detailed status breakdown */}
      {view === "employer" && (
        <div className="col-span-full">
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
              <CardDescription>
                Detailed overview of all expense reports by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Draft</p>
                    <p className="text-2xl font-bold">{summary.statusCounts.draft}</p>
                  </div>
                  <RefreshCw className="h-5 w-5 text-slate-400" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-2xl font-bold">{summary.statusCounts.submitted}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-blue-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Under Review</p>
                    <p className="text-2xl font-bold">{summary.statusCounts.under_review}</p>
                  </div>
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Paid</p>
                    <p className="text-2xl font-bold">{summary.statusCounts.paid}</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Pending Approval: </span>
                  <span className="font-medium">{summary.statusCounts.submitted} reports</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Under Review: </span>
                  <span className="font-medium">{summary.statusCounts.under_review} reports</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Approved: </span>
                  <span className="font-medium">{summary.statusCounts.approved} reports</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Paid: </span>
                  <span className="font-medium">{summary.statusCounts.paid} reports</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}