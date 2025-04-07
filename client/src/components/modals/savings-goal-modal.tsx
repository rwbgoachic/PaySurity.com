import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Target, DollarSign, Clock, CreditCard, Upload, Check } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SavingsGoal {
  id?: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  category?: string | null;
  isCompleted?: boolean | null;
  createdAt?: Date | null;
  dueDate?: Date | null;
  description?: string | null;
  image?: string | null;
  autoContributeAmount?: string | null;
  autoContributeFrequency?: string | null;
  // Parent contribution fields for parent-child goals
  parentContribution?: string;
}

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
  currentGoal?: SavingsGoal;
  isParentMode?: boolean;
}

const goalCategories = [
  { value: "education", label: "Education" },
  { value: "electronics", label: "Electronics" },
  { value: "games", label: "Games" },
  { value: "clothing", label: "Clothing" },
  { value: "toys", label: "Toys" },
  { value: "vacation", label: "Vacation" },
  { value: "bike", label: "Bicycle" },
  { value: "car", label: "Car" },
  { value: "gift", label: "Gift for Someone" },
  { value: "charity", label: "Charity" },
  { value: "other", label: "Other" },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 Weeks" },
  { value: "monthly", label: "Monthly" },
];

export default function SavingsGoalModal({
  isOpen,
  onClose,
  onSave,
  currentGoal,
  isParentMode = false,
}: SavingsGoalModalProps) {
  const [goal, setGoal] = useState<SavingsGoal>(() => {
    if (currentGoal) {
      return { 
        ...currentGoal, 
        dueDate: currentGoal.dueDate ? new Date(currentGoal.dueDate) : undefined,
        createdAt: currentGoal.createdAt ? new Date(currentGoal.createdAt) : undefined,
      };
    }
    
    // Default values for a new goal
    return {
      name: "",
      targetAmount: "",
      currentAmount: "0",
      category: "other",
      isCompleted: false,
      dueDate: addMonths(new Date(), 3),
      description: "",
      autoContributeAmount: null,
      autoContributeFrequency: null,
      parentContribution: "",
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enableAutoContribute, setEnableAutoContribute] = useState<boolean>(
    !!goal.autoContributeAmount && !!goal.autoContributeFrequency
  );
  const [enableParentContribution, setEnableParentContribution] = useState<boolean>(
    isParentMode && !!goal.parentContribution
  );
  
  const handleTextChange = (field: keyof SavingsGoal, value: string) => {
    setGoal({
      ...goal,
      [field]: value
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ""
      });
    }
  };
  
  const handleAmountChange = (field: keyof SavingsGoal, value: string) => {
    // Only allow numbers and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setGoal({
        ...goal,
        [field]: value
      });
      
      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: ""
        });
      }
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setGoal({
      ...goal,
      dueDate: date || null
    });
    
    if (errors.dueDate) {
      setErrors({
        ...errors,
        dueDate: ""
      });
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setGoal({
      ...goal,
      category: value
    });
  };
  
  const handleFrequencyChange = (value: string) => {
    setGoal({
      ...goal,
      autoContributeFrequency: value
    });
  };
  
  const handleEnableAutoContribute = (checked: boolean) => {
    setEnableAutoContribute(checked);
    
    if (!checked) {
      setGoal({
        ...goal,
        autoContributeAmount: null,
        autoContributeFrequency: null
      });
    } else if (!goal.autoContributeAmount || !goal.autoContributeFrequency) {
      setGoal({
        ...goal,
        autoContributeAmount: "",
        autoContributeFrequency: "weekly"
      });
    }
  };
  
  const handleEnableParentContribution = (checked: boolean) => {
    setEnableParentContribution(checked);
    
    if (!checked) {
      setGoal({
        ...goal,
        parentContribution: ""
      });
    } else if (!goal.parentContribution) {
      setGoal({
        ...goal,
        parentContribution: ""
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!goal.name?.trim()) {
      newErrors.name = "Goal name is required";
    }
    
    if (!goal.targetAmount) {
      newErrors.targetAmount = "Target amount is required";
    } else if (parseFloat(goal.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be greater than zero";
    }
    
    if (goal.dueDate && goal.dueDate < new Date()) {
      newErrors.dueDate = "Due date must be in the future";
    }
    
    if (enableAutoContribute) {
      if (!goal.autoContributeAmount) {
        newErrors.autoContributeAmount = "Contribution amount is required when auto-contribute is enabled";
      } else if (parseFloat(goal.autoContributeAmount) <= 0) {
        newErrors.autoContributeAmount = "Contribution amount must be greater than zero";
      }
      
      if (!goal.autoContributeFrequency) {
        newErrors.autoContributeFrequency = "Contribution frequency is required when auto-contribute is enabled";
      }
    }
    
    if (enableParentContribution) {
      if (!goal.parentContribution) {
        newErrors.parentContribution = "Parent contribution amount is required when enabled";
      } else if (parseFloat(goal.parentContribution) <= 0) {
        newErrors.parentContribution = "Parent contribution must be greater than zero";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      onSave(goal);
      onClose();
    }
  };
  
  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '';
    return amount;
  };
  
  const calculateProgress = () => {
    if (!goal.targetAmount || !goal.currentAmount) return 0;
    const current = parseFloat(goal.currentAmount);
    const target = parseFloat(goal.targetAmount);
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          <Target className="mr-2 h-5 w-5" />
          {currentGoal ? "Edit Savings Goal" : "Create Savings Goal"}
        </DialogTitle>
        
        <DialogDescription>
          {currentGoal
            ? "Update your savings goal details to keep track of your progress."
            : "Set up a new savings goal to help save for something special."}
        </DialogDescription>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              What are you saving for?
            </Label>
            <Input
              id="name"
              value={goal.name}
              onChange={(e) => handleTextChange("name", e.target.value)}
              placeholder="Enter the name of your goal"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">
                Target Amount ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  value={formatCurrency(goal.targetAmount)}
                  onChange={(e) => handleAmountChange("targetAmount", e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              {errors.targetAmount && (
                <p className="text-sm text-red-500">{errors.targetAmount}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">
                Category
              </Label>
              <Select
                value={goal.category || "other"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Target Date
            </Label>
            <DatePicker
              date={goal.dueDate || undefined}
              onSelect={handleDateChange}
              placeholder="When do you want to reach this goal?"
            />
            {errors.dueDate && (
              <p className="text-sm text-red-500">{errors.dueDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This is when you hope to reach your savings goal.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={goal.description || ""}
              onChange={(e) => handleTextChange("description", e.target.value)}
              placeholder="Add any notes about this savings goal"
              rows={3}
            />
          </div>
          
          {currentGoal && (
            <div className="space-y-4">
              <Label>Progress</Label>
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  ${formatCurrency(goal.currentAmount)} of ${formatCurrency(goal.targetAmount)}
                </span>
                <span>{calculateProgress()}%</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="enableAutoContribute" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Automatic Contributions
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically contribute to this goal on a schedule
              </p>
            </div>
            <Switch
              id="enableAutoContribute"
              checked={enableAutoContribute}
              onCheckedChange={handleEnableAutoContribute}
            />
          </div>
          
          {enableAutoContribute && (
            <div className="pl-6 border-l-2 border-muted space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="autoContributeAmount">
                    Contribution Amount ($)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="autoContributeAmount"
                      value={formatCurrency(goal.autoContributeAmount)}
                      onChange={(e) => handleAmountChange("autoContributeAmount", e.target.value)}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.autoContributeAmount && (
                    <p className="text-sm text-red-500">{errors.autoContributeAmount}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autoContributeFrequency">
                    Contribution Frequency
                  </Label>
                  <Select
                    value={goal.autoContributeFrequency || "weekly"}
                    onValueChange={handleFrequencyChange}
                  >
                    <SelectTrigger id="autoContributeFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.autoContributeFrequency && (
                    <p className="text-sm text-red-500">{errors.autoContributeFrequency}</p>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This amount will be automatically moved from your wallet to this savings goal at the frequency you select.
              </p>
            </div>
          )}
          
          {isParentMode && (
            <>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="enableParentContribution" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Parent Contribution
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add your contribution to help your child reach this goal
                  </p>
                </div>
                <Switch
                  id="enableParentContribution"
                  checked={enableParentContribution}
                  onCheckedChange={handleEnableParentContribution}
                />
              </div>
              
              {enableParentContribution && (
                <div className="pl-6 border-l-2 border-muted space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentContribution">
                      Your Contribution ($)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parentContribution"
                        value={formatCurrency(goal.parentContribution)}
                        onChange={(e) => handleTextChange("parentContribution", e.target.value)}
                        className="pl-9"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.parentContribution && (
                      <p className="text-sm text-red-500">{errors.parentContribution}</p>
                    )}
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-md">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-primary mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Match your child's savings</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your contribution will be added immediately to help motivate your child to reach their goal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {currentGoal ? "Update" : "Create"} Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}