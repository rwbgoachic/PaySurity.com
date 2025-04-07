import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Calendar, Tag, Bookmark, Sparkles, PiggyBank } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";
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
  Progress
} from "@/components/ui/progress";

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
  { value: "electronics", label: "Electronics" },
  { value: "toys", label: "Toys & Games" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "travel", label: "Travel" },
  { value: "events", label: "Events & Experiences" },
  { value: "education", label: "Education" },
  { value: "charity", label: "Charity & Donations" },
  { value: "sports", label: "Sports Equipment" },
  { value: "other", label: "Other" }
];

const contributionFrequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every Two Weeks" },
  { value: "monthly", label: "Monthly" }
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
      return { ...currentGoal };
    }
    
    // Default values for new goal
    return {
      name: "",
      targetAmount: "",
      currentAmount: "0",
      category: null,
      isCompleted: false,
      description: null,
      dueDate: null,
      autoContributeAmount: null,
      autoContributeFrequency: null,
      parentContribution: ""
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoContribute, setAutoContribute] = useState<boolean>(!!goal.autoContributeAmount);
  const [activeTab, setActiveTab] = useState("details");
  
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
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
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
  
  const handleCategoryChange = (value: string) => {
    setGoal({
      ...goal,
      category: value
    });
  };
  
  const handleDueDateChange = (date: Date | undefined) => {
    setGoal({
      ...goal,
      dueDate: date || null
    });
  };
  
  const handleFrequencyChange = (value: string) => {
    setGoal({
      ...goal,
      autoContributeFrequency: value
    });
  };
  
  const handleAutoContributeToggle = (checked: boolean) => {
    setAutoContribute(checked);
    
    if (!checked) {
      setGoal({
        ...goal,
        autoContributeAmount: null,
        autoContributeFrequency: null
      });
    } else if (!goal.autoContributeFrequency) {
      setGoal({
        ...goal,
        autoContributeFrequency: "weekly"
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!goal.name?.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!goal.targetAmount) {
      newErrors.targetAmount = "Target amount is required";
    } else if (parseFloat(goal.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be greater than zero";
    }
    
    if (autoContribute) {
      if (!goal.autoContributeAmount) {
        newErrors.autoContributeAmount = "Contribution amount is required when auto-contribute is enabled";
      } else if (parseFloat(goal.autoContributeAmount) <= 0) {
        newErrors.autoContributeAmount = "Contribution amount must be greater than zero";
      }
      
      if (!goal.autoContributeFrequency) {
        newErrors.autoContributeFrequency = "Contribution frequency is required when auto-contribute is enabled";
      }
    }
    
    if (isParentMode && goal.parentContribution) {
      if (!/^\d*\.?\d{0,2}$/.test(goal.parentContribution)) {
        newErrors.parentContribution = "Parent contribution must be a valid amount";
      } else if (parseFloat(goal.parentContribution) < 0) {
        newErrors.parentContribution = "Parent contribution cannot be negative";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      const finalGoal = {
        ...goal,
        autoContributeAmount: autoContribute ? goal.autoContributeAmount : null,
        autoContributeFrequency: autoContribute ? goal.autoContributeFrequency : null
      };
      
      onSave(finalGoal);
      onClose();
    }
  };
  
  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '';
    return amount;
  };
  
  const getProgress = (): number => {
    if (!goal.targetAmount || !goal.currentAmount) return 0;
    
    const target = parseFloat(goal.targetAmount);
    const current = parseFloat(goal.currentAmount);
    
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '';
    return format(date, "PPP");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          <PiggyBank className="mr-2 h-5 w-5" />
          {currentGoal ? "Edit Savings Goal" : "Create Savings Goal"}
        </DialogTitle>
        
        <DialogDescription>
          {currentGoal 
            ? "Update your savings goal details" 
            : "Set up a new savings goal to help save for something special"
          }
        </DialogDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="details">
              <Bookmark className="mr-2 h-4 w-4" />
              Goal Details
            </TabsTrigger>
            <TabsTrigger value="contribution">
              <PiggyBank className="mr-2 h-4 w-4" />
              Contributions
            </TabsTrigger>
          </TabsList>
          
          {/* Goal Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Goal Name
              </Label>
              <Input
                id="name"
                value={goal.name}
                onChange={(e) => handleTextChange("name", e.target.value)}
                placeholder="New bicycle, Video game console, etc."
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">
                  <DollarSign className="inline-block mr-1 h-4 w-4" />
                  Target Amount
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
                  <Tag className="inline-block mr-1 h-4 w-4" />
                  Category (Optional)
                </Label>
                <Select
                  value={goal.category || ""}
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
              <Label htmlFor="dueDate">
                <Calendar className="inline-block mr-1 h-4 w-4" />
                Goal Date (Optional)
              </Label>
              <DatePicker
                date={goal.dueDate || undefined}
                onSelect={handleDueDateChange}
                placeholder="When do you want to reach this goal?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={goal.description || ""}
                onChange={(e) => handleTextChange("description", e.target.value)}
                placeholder="Describe what you're saving for and why it's important to you"
                rows={3}
              />
            </div>
          </TabsContent>
          
          {/* Contribution Tab */}
          <TabsContent value="contribution" className="space-y-4 mt-4">
            {currentGoal && (
              <div className="space-y-2 mb-4">
                <Label>Current Progress</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      ${parseFloat(goal.currentAmount || "0").toFixed(2)}
                    </span>
                    <span>
                      ${parseFloat(goal.targetAmount || "0").toFixed(2)}
                    </span>
                  </div>
                  <Progress value={getProgress()} />
                  <p className="text-xs text-muted-foreground text-center">
                    {getProgress()}% of your goal
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="autoContribute" className="cursor-pointer">
                    <Sparkles className="inline-block mr-1 h-4 w-4" />
                    Automatic Contributions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically contribute to this goal on a regular schedule
                  </p>
                </div>
                <Switch
                  id="autoContribute"
                  checked={autoContribute}
                  onCheckedChange={handleAutoContributeToggle}
                />
              </div>
              
              {autoContribute && (
                <div className="pl-4 border-l-2 border-l-primary/20 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="autoContributeAmount">
                      Contribution Amount
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
                      value={goal.autoContributeFrequency || ""}
                      onValueChange={handleFrequencyChange}
                    >
                      <SelectTrigger id="autoContributeFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {contributionFrequencies.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.autoContributeFrequency && (
                      <p className="text-sm text-red-500">{errors.autoContributeFrequency}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {isParentMode && (
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="parentContribution">
                  <Sparkles className="inline-block mr-1 h-4 w-4" />
                  Parent Contribution
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="parentContribution"
                    value={formatCurrency(goal.parentContribution)}
                    onChange={(e) => handleAmountChange("parentContribution", e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add a one-time contribution from your account to help reach this goal
                </p>
                {errors.parentContribution && (
                  <p className="text-sm text-red-500">{errors.parentContribution}</p>
                )}
              </div>
            )}
            
            {currentGoal && goal.dueDate && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Created on:</span>
                    <span>{goal.createdAt ? formatDate(goal.createdAt) : "—"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Goal date:</span>
                    <span>{formatDate(goal.dueDate)}</span>
                  </div>
                  
                  {autoContribute && goal.autoContributeAmount && goal.autoContributeFrequency && (
                    <div className="flex justify-between">
                      <span>Auto-contribute:</span>
                      <span>${parseFloat(goal.autoContributeAmount).toFixed(2)} {goal.autoContributeFrequency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {currentGoal ? "Update Goal" : "Create Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}