import { ExpenseReport } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ChevronRight, Receipt } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";

type ExpenseReportCardProps = {
  report: ExpenseReport;
  onReviewClick?: (reportId: number) => void;
  onApproveClick?: (reportId: number) => void;
  onRejectClick?: (reportId: number) => void;
  view: "employee" | "employer";
};

export function ExpenseReportCard({
  report,
  onReviewClick,
  onApproveClick,
  onRejectClick,
  view
}: ExpenseReportCardProps) {
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

  const submissionDate = report.submissionDate
    ? format(new Date(report.submissionDate), "MMM dd, yyyy")
    : "Not submitted";

  const creationDate = report.createdAt
    ? format(new Date(report.createdAt), "MMM dd, yyyy")
    : "";

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold">{report.title}</CardTitle>
            <CardDescription>
              Created: {creationDate}
              {report.submissionDate && ` • Submitted: ${submissionDate}`}
            </CardDescription>
          </div>
          <Badge className={`${statusColors[report.status]} text-white`}>
            {statusLabels[report.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-gray-500" />
            <span>
              {formatCurrency(parseFloat(report.totalAmount))}
            </span>
          </div>
        </div>
        {report.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{report.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {view === "employee" ? (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            asChild
          >
            <Link to={`/employee/expense-reports/${report.id}`}>
              <span>View Details</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <>
            {report.status === "submitted" && (
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReviewClick?.(report.id)}
                >
                  Review
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onApproveClick?.(report.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRejectClick?.(report.id)}
                >
                  Reject
                </Button>
              </div>
            )}
            {report.status !== "submitted" && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                asChild
              >
                <Link to={`/employer/expense-reports/${report.id}`}>
                  <span>View Details</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}