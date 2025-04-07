import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter } from "lucide-react";
import { ExpenseReport } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface ExpenseReportFilterOptions {
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

interface ExpenseReportFiltersProps {
  reports: ExpenseReport[];
  onFilterChange: (filters: ExpenseReportFilterOptions) => void;
  view: "employee" | "employer";
}

export function ExpenseReportFilters({
  reports,
  onFilterChange,
  view,
}: ExpenseReportFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseReportFilterOptions>({});

  // Calculate some statistics from reports for the filter ranges
  const stats = {
    minAmount: Math.min(...reports.map(r => parseFloat(r.totalAmount))),
    maxAmount: Math.max(...reports.map(r => parseFloat(r.totalAmount))),
    earliestDate: reports.length > 0 ? new Date(Math.min(...reports.map(r => new Date(r.submissionDate || r.createdAt || '').getTime()))) : new Date(),
    latestDate: reports.length > 0 ? new Date(Math.max(...reports.map(r => new Date(r.submissionDate || r.createdAt || '').getTime()))) : new Date(),
  };

  // Set of status values based on view
  const employeeStatuses = [
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "paid", label: "Paid" },
    { value: "canceled", label: "Canceled" },
  ];

  const employerStatuses = [
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "paid", label: "Paid" },
    { value: "canceled", label: "Canceled" },
  ];

  const statusOptions = view === "employee" ? employeeStatuses : employerStatuses;

  // Update parent component's filters when local filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle filter changes
  const handleFilterChange = (name: keyof ExpenseReportFilterOptions, value: any) => {
    setFilters(prev => {
      // Handle clearing a filter if value is empty
      if (value === "" || value === null || value === undefined) {
        const newFilters = { ...prev };
        delete newFilters[name];
        return newFilters;
      }
      return { ...prev, [name]: value };
    });
  };

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return format(date, "PPP");
  };

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        {/* Search input */}
        <div className="flex-1">
          <Label htmlFor="search" className="text-xs text-gray-500">
            Search Reports
          </Label>
          <Input
            id="search"
            placeholder="Search by title or description"
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Status filter */}
        <div className="flex-1">
          <Label htmlFor="status" className="text-xs text-gray-500">
            Status
          </Label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger id="status" className="mt-1">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced filters button */}
        <div className="mt-auto">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-auto gap-2"
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-4 md:w-[500px]" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Date Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="startDate" className="text-xs text-gray-500">
                        Start Date
                      </Label>
                      <div className="flex items-center mt-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="startDate"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !filters.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.startDate ? formatDate(filters.startDate) : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={filters.startDate}
                              onSelect={(date) => handleFilterChange("startDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-xs text-gray-500">
                        End Date
                      </Label>
                      <div className="flex items-center mt-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="endDate"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !filters.endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.endDate ? formatDate(filters.endDate) : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={filters.endDate}
                              onSelect={(date) => handleFilterChange("endDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Amount Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="minAmount" className="text-xs text-gray-500">
                        Min Amount
                      </Label>
                      <Input
                        id="minAmount"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={`${stats.minAmount.toFixed(2)}`}
                        value={filters.minAmount || ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          handleFilterChange("minAmount", value);
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAmount" className="text-xs text-gray-500">
                        Max Amount
                      </Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={`${stats.maxAmount.toFixed(2)}`}
                        value={filters.maxAmount || ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          handleFilterChange("maxAmount", value);
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({});
                      setIsOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button onClick={() => setIsOpen(false)}>Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters display */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            let displayValue = "";
            let displayKey = "";
            
            switch (key) {
              case "search":
                displayKey = "Search";
                displayValue = value as string;
                break;
              case "status":
                displayKey = "Status";
                displayValue = statusOptions.find(s => s.value === value)?.label || value as string;
                break;
              case "startDate":
                displayKey = "From";
                displayValue = formatDate(value as Date);
                break;
              case "endDate":
                displayKey = "To";
                displayValue = formatDate(value as Date);
                break;
              case "minAmount":
                displayKey = "Min $";
                displayValue = `$${(value as number).toFixed(2)}`;
                break;
              case "maxAmount":
                displayKey = "Max $";
                displayValue = `$${(value as number).toFixed(2)}`;
                break;
            }
            
            return (
              <div
                key={key}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm flex items-center"
              >
                <span className="font-semibold mr-1">{displayKey}:</span> {displayValue}
                <button
                  onClick={() => handleFilterChange(key as keyof ExpenseReportFilterOptions, undefined)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            );
          })}
          
          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="rounded-full bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}