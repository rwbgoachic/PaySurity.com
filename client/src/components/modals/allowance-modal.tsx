import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Repeat, Calendar, DollarSign, Clock, ArrowRight, Info } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format, addDays, addWeeks, addMonths, parse, isValid } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface Allowance {
  id?: string;
  childId: string;
  amount: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  lastPaymentDate: Date | null;
  nextPaymentDate: Date | null;
  status: "active" | "paused" | "completed" | "cancelled";
  autoTransfer: boolean;
}

interface ChildInfo {
  id: string;
  name: string;
}

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (allowance: Allowance) => void;
  childInfo: ChildInfo;
  currentAllowance?: Allowance;
}

export default function AllowanceModal({
  isOpen,
  onClose,
  onSave,
  childInfo,
  currentAllowance,
}: AllowanceModalProps) {
  const [allowance, setAllowance] = useState<Allowance>(() => {
    if (currentAllowance) {
      return { 
        ...currentAllowance,
        startDate: currentAllowance.startDate ? new Date(currentAllowance.startDate) : new Date(),
        endDate: currentAllowance.endDate ? new Date(currentAllowance.endDate) : null,
        lastPaymentDate: currentAllowance.lastPaymentDate ? new Date(currentAllowance.lastPaymentDate) : null,
        nextPaymentDate: currentAllowance.nextPaymentDate ? new Date(currentAllowance.nextPaymentDate) : null,
      };
    }
    
    // Default values for a new allowance
    const today = new Date();
    return {
      childId: childInfo.id,
      amount: "",
      frequency: "weekly",
      startDate: today,
      endDate: null,
      description: "",
      lastPaymentDate: null,
      nextPaymentDate: updateNextPaymentDate("weekly", today),
      status: "active",
      autoTransfer: true,
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasEndDate, setHasEndDate] = useState<boolean>(!!allowance.endDate);
  
  function updateNextPaymentDate(frequency: "daily" | "weekly" | "biweekly" | "monthly", startDate: Date) {
    let nextDate: Date;
    
    switch (frequency) {
      case "daily":
        nextDate = addDays(startDate, 1);
        break;
      case "weekly":
        nextDate = addWeeks(startDate, 1);
        break;
      case "biweekly":
        nextDate = addWeeks(startDate, 2);
        break;
      case "monthly":
        nextDate = addMonths(startDate, 1);
        break;
    }
    
    return nextDate;
  }
  
  const handleAmountChange = (value: string) => {
    // Only allow numbers and up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAllowance({
        ...allowance,
        amount: value
      });
      
      if (errors.amount) {
        setErrors({
          ...errors,
          amount: ""
        });
      }
    }
  };
  
  const handleTextChange = (field: keyof Allowance, value: string) => {
    setAllowance({
      ...allowance,
      [field]: value
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ""
      });
    }
  };
  
  const handleFrequencyChange = (value: "daily" | "weekly" | "biweekly" | "monthly") => {
    const updatedAllowance = {
      ...allowance,
      frequency: value,
      nextPaymentDate: updateNextPaymentDate(value, allowance.startDate)
    };
    
    setAllowance(updatedAllowance);
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    const updatedAllowance = {
      ...allowance,
      startDate: date,
      nextPaymentDate: updateNextPaymentDate(allowance.frequency, date)
    };
    
    setAllowance(updatedAllowance);
    
    if (errors.startDate) {
      setErrors({
        ...errors,
        startDate: ""
      });
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setAllowance({
      ...allowance,
      endDate: date || null
    });
    
    if (errors.endDate) {
      setErrors({
        ...errors,
        endDate: ""
      });
    }
  };
  
  const handleHasEndDateChange = (checked: boolean) => {
    setHasEndDate(checked);
    
    if (!checked) {
      setAllowance({
        ...allowance,
        endDate: null
      });
    }
  };
  
  const handleStatusChange = (value: "active" | "paused" | "completed" | "cancelled") => {
    setAllowance({
      ...allowance,
      status: value
    });
  };
  
  const handleAutoTransferChange = (checked: boolean) => {
    setAllowance({
      ...allowance,
      autoTransfer: checked
    });
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!allowance.amount) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(allowance.amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }
    
    if (!allowance.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (hasEndDate && !allowance.endDate) {
      newErrors.endDate = "End date is required when enabled";
    }
    
    if (allowance.startDate && allowance.endDate && allowance.startDate > allowance.endDate) {
      newErrors.endDate = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      onSave(allowance);
      onClose();
    }
  };
  
  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '';
    return amount;
  };
  
  const getFrequencyText = (frequency: "daily" | "weekly" | "biweekly" | "monthly") => {
    switch (frequency) {
      case "daily":
        return "Every day";
      case "weekly":
        return "Every week";
      case "biweekly":
        return "Every two weeks";
      case "monthly":
        return "Every month";
    }
  };
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not set';
    return format(date, 'MMM d, yyyy');
  };
  
  const getStatusBadgeColor = () => {
    switch (allowance.status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          <Repeat className="mr-2 h-5 w-5" />
          {currentAllowance ? "Edit Allowance" : "Set Up Allowance"}
        </DialogTitle>
        
        <DialogDescription>
          {currentAllowance 
            ? `Modify the allowance settings for ${childInfo.name}.`
            : `Set up a regular allowance payment for ${childInfo.name}.`}
        </DialogDescription>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Payment Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                value={formatCurrency(allowance.amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-9"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">
              Payment Frequency
            </Label>
            <Select
              value={allowance.frequency}
              onValueChange={(value) => handleFrequencyChange(value as "daily" | "weekly" | "biweekly" | "monthly")}
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every Two Weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Start Date
            </Label>
            <DatePicker
              date={allowance.startDate}
              onSelect={handleStartDateChange}
              placeholder="When to start payments"
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="hasEndDate" className="cursor-pointer">
              Set an end date?
            </Label>
            <Switch
              id="hasEndDate"
              checked={hasEndDate}
              onCheckedChange={handleHasEndDateChange}
            />
          </div>
          
          {hasEndDate && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="endDate" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                End Date
              </Label>
              <DatePicker
                date={allowance.endDate || undefined}
                onSelect={handleEndDateChange}
                placeholder="When to stop payments"
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={allowance.description || ""}
              onChange={(e) => handleTextChange("description", e.target.value)}
              placeholder="Add any notes about this allowance"
              rows={3}
            />
          </div>
          
          {currentAllowance && (
            <div className="space-y-3">
              <Label>Status</Label>
              <RadioGroup 
                value={allowance.status} 
                onValueChange={(value) => handleStatusChange(value as "active" | "paused" | "completed" | "cancelled")}
                className="flex flex-wrap gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="cursor-pointer">
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paused" id="paused" />
                  <Label htmlFor="paused" className="cursor-pointer">
                    Paused
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="cursor-pointer">
                    Completed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cancelled" id="cancelled" />
                  <Label htmlFor="cancelled" className="cursor-pointer">
                    Cancelled
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="autoTransfer" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Automatic Transfer
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically transfer allowance to child's wallet
              </p>
            </div>
            <Switch
              id="autoTransfer"
              checked={allowance.autoTransfer}
              onCheckedChange={handleAutoTransferChange}
            />
          </div>
          
          {currentAllowance && (
            <div className="bg-muted/40 rounded-lg p-4 space-y-3 mt-2">
              <h3 className="font-medium">Payment Schedule</h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Frequency:</div>
                <div>{getFrequencyText(allowance.frequency)}</div>
                
                <div className="text-muted-foreground">Start date:</div>
                <div>{formatDate(allowance.startDate)}</div>
                
                <div className="text-muted-foreground">End date:</div>
                <div>{formatDate(allowance.endDate)}</div>
                
                <div className="text-muted-foreground">Last payment:</div>
                <div>{formatDate(allowance.lastPaymentDate)}</div>
                
                <div className="text-muted-foreground">Next payment:</div>
                <div className="font-medium">{formatDate(allowance.nextPaymentDate)}</div>
                
                <div className="text-muted-foreground">Status:</div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor()}`}>
                    {allowance.status.charAt(0).toUpperCase() + allowance.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {!currentAllowance && (
            <div className="flex items-start bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Payment Preview</p>
                <p className="mb-2">
                  ${formatCurrency(allowance.amount)} will be transferred {getFrequencyText(allowance.frequency).toLowerCase()}, 
                  starting on {formatDate(allowance.startDate)}.
                </p>
                <p>
                  First payment: {formatDate(allowance.startDate)}
                  <br />
                  Next payment: {formatDate(allowance.nextPaymentDate)}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{currentAllowance ? "Update" : "Create"} Allowance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}