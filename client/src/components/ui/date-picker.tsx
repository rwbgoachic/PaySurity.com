import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Select date",
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onSelect?: (range: { from?: Date; to?: Date }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  placeholder = "Select date range",
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<{
    from?: Date;
    to?: Date;
  }>({ from, to });

  // Update internal state when props change
  React.useEffect(() => {
    setDate({ from, to });
  }, [from, to]);

  // When the internal state changes, call the onSelect callback
  const handleSelect = (selectedDate: Date | undefined) => {
    const newDate = {
      from: date?.from,
      to: date?.to,
    };

    // If no date selected yet or both dates selected, start a new selection
    if (!newDate.from || (newDate.from && newDate.to)) {
      newDate.from = selectedDate;
      newDate.to = undefined;
    } 
    // If only 'from' is selected and the new date is after it
    else if (selectedDate && newDate.from && selectedDate > newDate.from) {
      newDate.to = selectedDate;
    } 
    // If only 'from' is selected and the new date is before it
    else if (selectedDate && newDate.from && selectedDate < newDate.from) {
      newDate.to = newDate.from;
      newDate.from = selectedDate;
    }
    // If dates are the same, select just that one day
    else if (selectedDate && newDate.from && selectedDate.getTime() === newDate.from.getTime()) {
      newDate.to = selectedDate;
    }

    setDate(newDate);
    
    if (onSelect) {
      onSelect(newDate);
    }
  };

  const formattedDateRange = () => {
    if (date?.from && date?.to) {
      return `${format(date.from, "PP")} - ${format(date.to, "PP")}`;
    }
    if (date?.from) {
      return `${format(date.from, "PP")} - ?`;
    }
    return placeholder;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date?.from && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formattedDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ 
            from: date?.from,
            to: date?.to
          }}
          onSelect={handleSelect}
          initialFocus
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}