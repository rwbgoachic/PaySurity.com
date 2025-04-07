import { useState, useEffect } from "react";
import { z } from "zod";
import { ExpenseReport } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar as CalendarIcon, Filter, X, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const filterSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.string()).optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

export type ExpenseReportFilterOptions = z.infer<typeof filterSchema>;

type DateRange = {
  from?: Date;
  to?: Date;
};

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
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Get all unique statuses from the reports
  const statuses = Array.from(
    new Set(reports.map((report) => report.status))
  ).sort();

  // Get min and max amounts for range selection
  const amounts = reports.map((report) => parseFloat(report.amount));
  const minAvailableAmount = amounts.length ? Math.min(...amounts) : 0;
  const maxAvailableAmount = amounts.length ? Math.max(...amounts) : 1000;

  // Apply filters
  const applyFilters = (data: ExpenseReportFilterOptions) => {
    onFilterChange(data);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    
    // Apply filters
    applyFilters({
      search,
      status: statusFilters.length ? statusFilters : undefined,
      dateRange: range.from || range.to ? range : undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    });
  };

  const handleStatusToggle = (status: string) => {
    setStatusFilters((prev) => {
      const newStatuses = prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status];
      
      // Apply filters
      applyFilters({
        search,
        status: newStatuses.length ? newStatuses : undefined,
        dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      });
      
      return newStatuses;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    // Apply filters with a slight delay to avoid excessive updates during typing
    const timeoutId = setTimeout(() => {
      applyFilters({
        search: value,
        status: statusFilters.length ? statusFilters : undefined,
        dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleAmountChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinAmount(value);
    } else {
      setMaxAmount(value);
    }
    
    // Apply filters with a slight delay
    const timeoutId = setTimeout(() => {
      const min = type === 'min' ? value : minAmount;
      const max = type === 'max' ? value : maxAmount;
      
      applyFilters({
        search,
        status: statusFilters.length ? statusFilters : undefined,
        dateRange: dateRange.from || dateRange.to ? dateRange : undefined,
        minAmount: min ? parseFloat(min) : undefined,
        maxAmount: max ? parseFloat(max) : undefined,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilters([]);
    setDateRange({});
    setMinAmount("");
    setMaxAmount("");
    
    applyFilters({});
  };

  const formatDateRange = (range?: DateRange): string => {
    if (!range || (!range.from && !range.to)) {
      return "Select date range";
    }

    if (range.from && range.to) {
      return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
    }

    if (range.from) {
      return `From ${format(range.from, "MMM d, yyyy")}`;
    }

    if (range.to) {
      return `Until ${format(range.to, "MMM d, yyyy")}`;
    }

    return "Select date range";
  };

  // Count active filters
  const activeFilterCount = [
    search ? 1 : 0,
    statusFilters.length > 0 ? 1 : 0,
    dateRange.from || dateRange.to ? 1 : 0,
    minAmount || maxAmount ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title or description..."
            className="pl-8"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        
        <Button
          variant={filtersVisible ? "default" : "outline"}
          className="h-10 px-3 lg:w-auto"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-full px-1 py-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
        {activeFilterCount > 0 && (
          <Button 
            variant="outline" 
            className="h-10 px-3"
            onClick={clearFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
      
      {filtersVisible && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="space-y-2">
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => handleStatusToggle(status)}
                      />
                      <Label
                        htmlFor={`status-${status}`}
                        className="text-sm font-normal capitalize cursor-pointer"
                      >
                        {status.replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRange(dateRange)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => handleDateRangeChange(range || {})}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min-amount">Min Amount</Label>
                <Input
                  id="min-amount"
                  type="number"
                  placeholder={`Min: ${minAvailableAmount}`}
                  value={minAmount}
                  onChange={(e) => handleAmountChange("min", e.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-amount">Max Amount</Label>
                <Input
                  id="max-amount"
                  type="number"
                  placeholder={`Max: ${maxAvailableAmount}`}
                  value={maxAmount}
                  onChange={(e) => handleAmountChange("max", e.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button size="sm" onClick={clearFilters} variant="outline" className="mr-2">
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
              <Button size="sm" onClick={() => setFiltersVisible(false)}>
                <Check className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}