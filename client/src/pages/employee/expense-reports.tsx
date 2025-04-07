import { useExpenseReports } from "@/hooks/use-expense-reports";
import { ExpenseReportCard } from "@/components/expense-reports/expense-report-card";
import { ExpenseReportSummary } from "@/components/expense-reports/expense-report-summary";
import { ExpenseReportFilters, ExpenseReportFilterOptions } from "@/components/expense-reports/expense-report-filters";
import { CreateExpenseReportForm } from "@/components/expense-reports/create-expense-report-form";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseReport } from "@shared/schema";
import { format } from "date-fns";

export default function EmployeeExpenseReportsPage() {
  const { expenseReports, isLoading, createExpenseReport, isCreating } = useExpenseReports();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<ExpenseReportFilterOptions>({});

  // Apply filters to reports
  const filteredReports = useMemo(() => {
    let result = [...expenseReports];
    
    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(report => filters.status?.includes(report.status));
    } else if (activeTab === "draft") {
      result = result.filter(report => report.status === "draft");
    } else if (activeTab === "pending") {
      result = result.filter(report => ["submitted", "under_review"].includes(report.status));
    } else if (activeTab === "completed") {
      result = result.filter(report => ["approved", "rejected", "paid", "canceled"].includes(report.status));
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
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      result = result.filter(report => {
        const reportDate = new Date(report.submissionDate || report.createdAt);
        
        if (filters.dateRange?.from && reportDate < filters.dateRange.from) {
          return false;
        }
        
        if (filters.dateRange?.to) {
          const endDate = new Date(filters.dateRange.to);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (reportDate > endDate) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    // Apply amount range filter
    if (filters.amountRange) {
      const [min, max] = filters.amountRange;
      result = result.filter(report => {
        const amount = parseFloat(report.totalAmount);
        return amount >= min && amount <= max;
      });
    }
    
    return result;
  }, [expenseReports, filters, activeTab]);

  // Categorize filtered reports by status
  const draftReports = filteredReports.filter((report) => report.status === "draft");
  const pendingReports = filteredReports.filter((report) => ["submitted", "under_review"].includes(report.status));
  const completedReports = filteredReports.filter((report) => ["approved", "rejected", "paid", "canceled"].includes(report.status));

  // Mock data for employers (in a production app, this would come from an API)
  const employers = [
    { id: 1, name: "Acme Corporation" },
    { id: 2, name: "Global Industries" },
    { id: 3, name: "Tech Solutions Inc." },
  ];

  const handleCreateReport = (data: any) => {
    createExpenseReport({
      ...data,
      userId: 1, // This would be the current user's ID in a real app
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  return (
    <div className="container py-8">
      <Helmet>
        <title>My Expense Reports | PaySurity</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Expense Reports</h1>
          <p className="text-gray-600">
            Manage and track your expense submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFilters({});
              setActiveTab("all");
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="default" className="gap-2">
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Expense Report</DialogTitle>
                <DialogDescription>
                  Add basic information for your new expense report. You'll be able to
                  add expense items after creation.
                </DialogDescription>
              </DialogHeader>
              
              <CreateExpenseReportForm
                onSubmit={handleCreateReport}
                isSubmitting={isCreating}
                employers={employers}
              />
            </DialogContent>
          </Dialog>
        </div>
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
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Expense Report</DialogTitle>
                    <DialogDescription>
                      Add basic information for your new expense report. You'll be able to
                      add expense items after creation.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <CreateExpenseReportForm
                    onSubmit={handleCreateReport}
                    isSubmitting={isCreating}
                    employers={employers}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary cards */}
              <ExpenseReportSummary reports={expenseReports} view="employee" />

              {/* Filters */}
              <ExpenseReportFilters
                reports={expenseReports}
                onFilterChange={setFilters}
                view="employee"
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
                  <TabsTrigger value="draft">
                    Drafts
                    <Badge className="ml-2 bg-gray-100 text-gray-800">
                      {draftReports.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending
                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                      {pendingReports.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {completedReports.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
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
                          view="employee"
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="draft">
                  {draftReports.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No draft reports</p>
                    </div>
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
                </TabsContent>

                <TabsContent value="pending">
                  {pendingReports.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No pending reports</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingReports.map((report) => (
                        <ExpenseReportCard
                          key={report.id}
                          report={report}
                          view="employee"
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed">
                  {completedReports.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No completed reports</p>
                    </div>
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
                </TabsContent>
              </Tabs>
            </div>
          )}
        </>
      )}
    </div>
  );
}