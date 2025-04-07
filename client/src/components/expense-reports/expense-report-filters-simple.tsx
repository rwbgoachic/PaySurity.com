import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { ExpenseReport } from "@shared/schema";
import { CalendarIcon, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define the filter schema with Zod
export const filterSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

export type ExpenseReportFilterOptions = z.infer<typeof filterSchema>;

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
  // State for filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [filterCount, setFilterCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Available status options depending on view (employee/employer)
  const statusOptions = useMemo(() => {
    if (view === "employee") {
      return [
        { value: "draft", label: "Draft" },
        { value: "submitted", label: "Submitted" },
        { value: "under_review", label: "Under Review" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "paid", label: "Paid" },
        { value: "canceled", label: "Canceled" },
      ];
    } else {
      return [
        { value: "submitted", label: "Pending Approval" },
        { value: "under_review", label: "Under Review" },
        { value: "approved", label: "Approved (Unpaid)" },
        { value: "rejected", label: "Rejected" },
        { value: "paid", label: "Paid" },
        { value: "canceled", label: "Canceled" },
      ];
    }
  }, [view]);

  // Update filter count when filters change
  useEffect(() => {
    let count = 0;
    if (search) count++;
    if (status) count++;
    if (startDate || endDate) count++;
    if (minAmount || maxAmount) count++;
    
    setFilterCount(count);
  }, [search, status, startDate, endDate, minAmount, maxAmount]);

  // Apply filters
  const applyFilters = (data: ExpenseReportFilterOptions) => {
    onFilterChange({
      search: data.search ? data.search.toLowerCase() : undefined,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount,
    });
  };

  // Handle search input
  const handleSearch = () => {
    applyFilters({
      search,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    });
  };

  // Handle clearing all filters
  const clearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    
    applyFilters({});
  };

  // Format date for display
  const formatDateRange = (): string => {
    if (!startDate && !endDate) return "Select date range";
    
    if (startDate && endDate) {
      return `${format(new Date(startDate), "MMM d, yyyy")} - ${format(new Date(endDate), "MMM d, yyyy")}`;
    }
    
    if (startDate) {
      return `From ${format(new Date(startDate), "MMM d, yyyy")}`;
    }
    
    if (endDate) {
      return `Until ${format(new Date(endDate), "MMM d, yyyy")}`;
    }
    
    return "Select date range";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports by title, description or ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="flex space-x-2">
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {filterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full" align="end">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Filter Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectGroup>
                          <SelectLabel>Filter by status</SelectLabel>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">From</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">To</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount Range ($)</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-0 pb-0">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleSearch();
                      setFiltersOpen(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                </CardFooter>
              </Card>
            </PopoverContent>
          </Popover>

          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
            <span className="ml-2 sr-only sm:not-sr-only">Search</span>
          </Button>
        </div>
      </div>

      {filterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusOptions.find(s => s.value === status)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setStatus(undefined);
                  applyFilters({
                    ...{
                      search,
                      startDate: startDate ? new Date(startDate) : undefined,
                      endDate: endDate ? new Date(endDate) : undefined,
                      minAmount: minAmount ? parseFloat(minAmount) : undefined,
                      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
                    },
                    status: undefined,
                  });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {formatDateRange()}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  applyFilters({
                    ...{
                      search,
                      status,
                      minAmount: minAmount ? parseFloat(minAmount) : undefined,
                      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
                    },
                    startDate: undefined,
                    endDate: undefined,
                  });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(minAmount || maxAmount) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Amount: {minAmount || "0"} - {maxAmount || "∞"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setMinAmount("");
                  setMaxAmount("");
                  applyFilters({
                    ...{
                      search,
                      status,
                      startDate: startDate ? new Date(startDate) : undefined,
                      endDate: endDate ? new Date(endDate) : undefined,
                    },
                    minAmount: undefined,
                    maxAmount: undefined,
                  });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-muted-foreground"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}