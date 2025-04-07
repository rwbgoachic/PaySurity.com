import { useExpenseReports } from "@/hooks/use-expense-reports";
import { ExpenseReportCard } from "@/components/expense-reports/expense-report-card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

export default function EmployeeExpenseReportsPage() {
  const { expenseReports, isLoading, createExpenseReport, isCreating } = useExpenseReports();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState("");
  const [newReportDescription, setNewReportDescription] = useState("");

  const handleCreateReport = () => {
    if (!newReportTitle.trim()) return;

    createExpenseReport({
      title: newReportTitle.trim(),
      description: newReportDescription.trim() || null,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewReportTitle("");
        setNewReportDescription("");
      },
    });
  };

  // Filter reports by status for better organization
  const draftReports = expenseReports.filter((report) => report.status === "draft");
  const submittedReports = expenseReports.filter((report) => ["submitted", "under_review"].includes(report.status));
  const completedReports = expenseReports.filter((report) => ["approved", "rejected", "paid", "canceled"].includes(report.status));

  return (
    <div className="container py-8">
      <Helmet>
        <title>My Expense Reports | PaySurity</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Expense Reports</h1>
          <p className="text-gray-600">
            Manage and track your expense submissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              New Expense Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Expense Report</DialogTitle>
              <DialogDescription>
                Add basic information for your new expense report. You'll be able to
                add expense items after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  placeholder="Q1 Business Trip to New York"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="All expenses related to the Q1 client meetings in New York"
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={!newReportTitle.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Report"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {!expenseReports.length ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No expense reports yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first expense report to start tracking your expenses
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Your First Report</Button>
                </DialogTrigger>
                <DialogContent>
                  {/* Duplicate dialog content */}
                  <DialogHeader>
                    <DialogTitle>Create New Expense Report</DialogTitle>
                    <DialogDescription>
                      Add basic information for your new expense report. You'll be able to
                      add expense items after creation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="title-empty">Report Title</Label>
                      <Input
                        id="title-empty"
                        placeholder="Q1 Business Trip to New York"
                        value={newReportTitle}
                        onChange={(e) => setNewReportTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description-empty">Description (Optional)</Label>
                      <Textarea
                        id="description-empty"
                        placeholder="All expenses related to the Q1 client meetings in New York"
                        value={newReportDescription}
                        onChange={(e) => setNewReportDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateReport}
                      disabled={!newReportTitle.trim() || isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Report"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Draft Reports */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold">Draft Reports</h2>
                  <Badge variant="outline" className="bg-gray-100">
                    {draftReports.length}
                  </Badge>
                </div>
                {draftReports.length === 0 ? (
                  <p className="text-gray-500 italic">No draft reports</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {draftReports.map((report) => (
                      <ExpenseReportCard
                        key={report.id}
                        report={report}
                        view="employee"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Submitted Reports */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold">Pending Approval</h2>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {submittedReports.length}
                  </Badge>
                </div>
                {submittedReports.length === 0 ? (
                  <p className="text-gray-500 italic">No reports pending approval</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {submittedReports.map((report) => (
                      <ExpenseReportCard
                        key={report.id}
                        report={report}
                        view="employee"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Reports */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold">Completed Reports</h2>
                  <Badge variant="outline" className="bg-gray-100">
                    {completedReports.length}
                  </Badge>
                </div>
                {completedReports.length === 0 ? (
                  <p className="text-gray-500 italic">No completed reports</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedReports.map((report) => (
                      <ExpenseReportCard
                        key={report.id}
                        report={report}
                        view="employee"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}