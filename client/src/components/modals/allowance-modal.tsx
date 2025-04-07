import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Calendar, Clock, Repeat, Gift, Sparkles, GiftIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format, addDays, addWeeks, addMonths, isBefore } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Badge
} from "@/components/ui/badge";

export interface Allowance {
  id?: string;
  title: string;
  amount: string;
  type: 'recurring' | 'one_time' | 'reward';
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
  startDate: string;
  endDate?: string | null;
  lastPaymentDate?: string | null;
  nextPaymentDate?: string | null;
  description?: string | null;
  childId?: string;
  parentId?: string;
  conditions?: string | null;
  autoTransfer?: boolean | null;
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
      return { ...currentAllowance };
    }
    
    // Default values for new allowance
    const today = new Date();
    return {
      title: "",
      amount: "",
      type: "recurring",
      frequency: "weekly",
      startDate: format(today, "yyyy-MM-dd"),
      endDate: null,
      description: null,
      conditions: null,
      autoTransfer: true
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasConditions, setHasConditions] = useState<boolean>(!!allowance.conditions);
  const [startDate, setStartDate] = useState<Date>(() => {
    if (allowance.startDate) {
      return new Date(allowance.startDate);
    }
    return new Date();
  });
  
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (allowance.endDate) {
      return new Date(allowance.endDate);
    }
    return undefined;
  });
  
  const [activeTab, setActiveTab] = useState("details");
  
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
  
  const handleTypeChange = (value: 'recurring' | 'one_time' | 'reward') => {
    setAllowance({
      ...allowance,
      type: value,
      // Reset frequency if not recurring
      frequency: value === 'recurring' ? (allowance.frequency || 'weekly') : null
    });
  };
  
  const handleFrequencyChange = (value: 'daily' | 'weekly' | 'biweekly' | 'monthly') => {
    setAllowance({
      ...allowance,
      frequency: value
    });
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      setAllowance({
        ...allowance,
        startDate: format(date, "yyyy-MM-dd"),
        nextPaymentDate: format(getNextPaymentDate(date, allowance.frequency), "yyyy-MM-dd")
      });
      
      // Check if end date is before start date and reset if needed
      if (endDate && isBefore(endDate, date)) {
        setEndDate(undefined);
        setAllowance({
          ...allowance,
          startDate: format(date, "yyyy-MM-dd"),
          endDate: null,
          nextPaymentDate: format(getNextPaymentDate(date, allowance.frequency), "yyyy-MM-dd")
        });
      }
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setAllowance({
      ...allowance,
      endDate: date ? format(date, "yyyy-MM-dd") : null
    });
  };
  
  const handleConditionsToggle = (checked: boolean) => {
    setHasConditions(checked);
    if (!checked) {
      setAllowance({
        ...allowance,
        conditions: null
      });
    }
  };
  
  const handleAutoTransferToggle = (checked: boolean) => {
    setAllowance({
      ...allowance,
      autoTransfer: checked
    });
  };
  
  const getNextPaymentDate = (startDate: Date, frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null | undefined): Date => {
    const today = new Date();
    
    // If start date is in the future, that's the next payment date
    if (isBefore(today, startDate)) {
      return startDate;
    }
    
    // Otherwise calculate based on frequency
    switch (frequency) {
      case 'daily':
        return addDays(today, 1);
      case 'weekly':
        return addWeeks(today, 1);
      case 'biweekly':
        return addWeeks(today, 2);
      case 'monthly':
        return addMonths(today, 1);
      default:
        return addWeeks(today, 1); // Default to weekly
    }
  };
  
  const updateNextPaymentDate = (startDate: Date, frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null | undefined) => {
    if (frequency && allowance.type === 'recurring') {
      setAllowance({
        ...allowance,
        nextPaymentDate: format(getNextPaymentDate(startDate, frequency), "yyyy-MM-dd")
      });
    } else {
      setAllowance({
        ...allowance,
        nextPaymentDate: null
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!allowance.title?.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!allowance.amount) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(allowance.amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }
    
    if (allowance.type === 'recurring' && !allowance.frequency) {
      newErrors.frequency = "Frequency is required for recurring allowances";
    }
    
    if (hasConditions && !allowance.conditions?.trim()) {
      newErrors.conditions = "Conditions are required if enabled";
    }
    
    // Validate that endDate is after startDate if provided
    if (endDate && startDate && isBefore(endDate, startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      // Prepare final allowance object with all computed fields
      const finalAllowance: Allowance = {
        ...allowance,
        childId: childInfo.id,
        conditions: hasConditions ? allowance.conditions : null,
        // Compute nextPaymentDate if needed
        nextPaymentDate: allowance.type === 'recurring' 
          ? format(getNextPaymentDate(startDate, allowance.frequency), "yyyy-MM-dd") 
          : null
      };
      
      onSave(finalAllowance);
      onClose();
    }
  };
  
  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '';
    return amount;
  };
  
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '';
    return format(new Date(date), "PPP");
  };
  
  const getTypeLabel = (type: 'recurring' | 'one_time' | 'reward') => {
    switch (type) {
      case 'recurring':
        return 'Regular Allowance';
      case 'one_time':
        return 'One-Time Payment';
      case 'reward':
        return 'Reward';
      default:
        return type;
    }
  };
  
  const getFrequencyLabel = (frequency: string | null | undefined) => {
    if (!frequency) return '';
    
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Every Two Weeks';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
    }
  };
  
  const getTypeIcon = (type: 'recurring' | 'one_time' | 'reward') => {
    switch (type) {
      case 'recurring':
        return <Repeat className="h-5 w-5" />;
      case 'one_time':
        return <Clock className="h-5 w-5" />;
      case 'reward':
        return <Gift className="h-5 w-5" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          {getTypeIcon(allowance.type)}
          <span className="ml-2">
            {currentAllowance ? "Edit Allowance" : "Create Allowance"}
          </span>
        </DialogTitle>
        
        <DialogDescription>
          {currentAllowance 
            ? `Update the allowance details for ${childInfo.name}` 
            : `Set up a new allowance for ${childInfo.name}`
          }
        </DialogDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="details">
              <DollarSign className="mr-2 h-4 w-4" />
              Allowance Details
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Sparkles className="mr-2 h-4 w-4" />
              Additional Settings
            </TabsTrigger>
          </TabsList>
          
          {/* Allowance Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Allowance Name
              </Label>
              <Input
                id="title"
                value={allowance.title}
                onChange={(e) => handleTextChange("title", e.target.value)}
                placeholder="Weekly Allowance, Chore Money, Birthday Gift, etc."
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">
                <DollarSign className="inline-block mr-1 h-4 w-4" />
                Amount
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
              <Label htmlFor="type">
                Allowance Type
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={allowance.type === 'recurring' ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-20 py-2"
                  onClick={() => handleTypeChange('recurring')}
                >
                  <Repeat className="h-5 w-5 mb-1" />
                  <span className="text-xs">Regular</span>
                  <span className="text-xs">Allowance</span>
                </Button>
                <Button
                  type="button"
                  variant={allowance.type === 'one_time' ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-20 py-2"
                  onClick={() => handleTypeChange('one_time')}
                >
                  <Clock className="h-5 w-5 mb-1" />
                  <span className="text-xs">One-Time</span>
                  <span className="text-xs">Payment</span>
                </Button>
                <Button
                  type="button"
                  variant={allowance.type === 'reward' ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-20 py-2"
                  onClick={() => handleTypeChange('reward')}
                >
                  <Gift className="h-5 w-5 mb-1" />
                  <span className="text-xs">Reward</span>
                  <span className="text-xs invisible">X</span>
                </Button>
              </div>
            </div>
            
            {allowance.type === 'recurring' && (
              <div className="space-y-2">
                <Label htmlFor="frequency">
                  <Repeat className="inline-block mr-1 h-4 w-4" />
                  How Often
                </Label>
                <Select
                  value={allowance.frequency || undefined}
                  onValueChange={(value) => handleFrequencyChange(value as 'daily' | 'weekly' | 'biweekly' | 'monthly')}
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
                {errors.frequency && (
                  <p className="text-sm text-red-500">{errors.frequency}</p>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  <Calendar className="inline-block mr-1 h-4 w-4" />
                  Start Date
                </Label>
                <DatePicker
                  date={startDate}
                  onSelect={handleStartDateChange}
                  placeholder="When to start"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  <Calendar className="inline-block mr-1 h-4 w-4" />
                  End Date (Optional)
                </Label>
                <DatePicker
                  date={endDate}
                  onSelect={handleEndDateChange}
                  placeholder="No end date"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={allowance.description || ""}
                onChange={(e) => handleTextChange("description", e.target.value)}
                placeholder="Add details about this allowance"
                rows={2}
              />
            </div>
          </TabsContent>
          
          {/* Additional Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="autoTransfer" className="cursor-pointer">
                    <Sparkles className="inline-block mr-1 h-4 w-4" />
                    Automatic Transfer
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically deposit funds to {childInfo.name}'s account
                  </p>
                </div>
                <Switch
                  id="autoTransfer"
                  checked={allowance.autoTransfer === true}
                  onCheckedChange={handleAutoTransferToggle}
                />
              </div>
              
              {!allowance.autoTransfer && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-900 text-sm text-amber-600 dark:text-amber-300">
                  You'll need to manually transfer funds when this allowance is due.
                </div>
              )}
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="hasConditions" className="cursor-pointer">
                    <GiftIcon className="inline-block mr-1 h-4 w-4" />
                    Conditions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add conditions that must be met to receive this allowance
                  </p>
                </div>
                <Switch
                  id="hasConditions"
                  checked={hasConditions}
                  onCheckedChange={handleConditionsToggle}
                />
              </div>
              
              {hasConditions && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <Textarea
                    value={allowance.conditions || ""}
                    onChange={(e) => handleTextChange("conditions", e.target.value)}
                    placeholder="Example: Complete all homework, Keep room clean, etc."
                    rows={3}
                  />
                  {errors.conditions && (
                    <p className="text-sm text-red-500">{errors.conditions}</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Next Payment Information */}
            {allowance.type === 'recurring' && (
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Schedule:</span>
                  <Badge variant="outline">
                    {getFrequencyLabel(allowance.frequency)}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>First payment:</span>
                  <span>{formatDate(allowance.startDate)}</span>
                </div>
                
                {allowance.endDate && (
                  <div className="flex justify-between text-sm">
                    <span>Last payment:</span>
                    <span>{formatDate(allowance.endDate)}</span>
                  </div>
                )}
                
                {allowance.nextPaymentDate && (
                  <div className="flex justify-between text-sm">
                    <span>Next payment:</span>
                    <span>{formatDate(allowance.nextPaymentDate)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Auto-transfer:</span>
                  <span>{allowance.autoTransfer ? "Yes" : "No"}</span>
                </div>
              </div>
            )}
            
            {/* One-time information */}
            {allowance.type === 'one_time' && (
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Type:</span>
                  <Badge variant="outline">
                    One-Time Payment
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Payment date:</span>
                  <span>{formatDate(allowance.startDate)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Auto-transfer:</span>
                  <span>{allowance.autoTransfer ? "Yes" : "No"}</span>
                </div>
              </div>
            )}
            
            {/* Reward information */}
            {allowance.type === 'reward' && (
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Type:</span>
                  <Badge variant="outline">
                    Reward
                  </Badge>
                </div>
                
                {allowance.conditions && (
                  <div className="text-sm">
                    <span className="font-medium">Conditions:</span>
                    <p className="text-muted-foreground mt-1">{allowance.conditions}</p>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Available from:</span>
                  <span>{formatDate(allowance.startDate)}</span>
                </div>
                
                {allowance.endDate && (
                  <div className="flex justify-between text-sm">
                    <span>Available until:</span>
                    <span>{formatDate(allowance.endDate)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Auto-transfer:</span>
                  <span>{allowance.autoTransfer ? "Yes (when conditions met)" : "No"}</span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {currentAllowance ? "Update Allowance" : "Create Allowance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}