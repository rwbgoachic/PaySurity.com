import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  ShoppingCart, 
  Store, 
  AtomIcon, 
  CreditCardIcon 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SpendingRules {
  id?: string;
  childId: string;
  dailyLimit: string | null;
  weeklyLimit: string | null;
  monthlyLimit: string | null;
  perTransactionLimit: string | null;
  withdrawalLimit: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  allowedMerchantCategories: string[] | null;
  blockedMerchantCategories: string[] | null;
  restrictedDaysOfWeek: string[] | null;
  allowInternationalTransactions: boolean | null;
  requireParentalApprovalAbove: string | null;
  requireParentalApprovalForMerchants: string[] | null;
  allowOnlineTransactions: boolean | null;
  allowWithdrawals: boolean | null;
}

interface SpendingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: SpendingRules) => void;
  currentRules?: SpendingRules;
  childId: string;
  childName: string;
}

const merchantCategories = [
  { id: "retail", name: "Retail Stores" },
  { id: "food", name: "Restaurants & Food" },
  { id: "entertainment", name: "Entertainment" },
  { id: "digital", name: "Digital & Online Services" },
  { id: "education", name: "Education" },
  { id: "health", name: "Health & Wellness" },
  { id: "gaming", name: "Gaming" },
  { id: "transportation", name: "Transportation" },
  { id: "subscriptions", name: "Subscriptions" },
  { id: "cashback", name: "ATM Withdrawals" },
];

const daysOfWeek = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
  { id: "saturday", name: "Saturday" },
  { id: "sunday", name: "Sunday" },
];

export default function SpendingRulesModal({
  isOpen,
  onClose,
  onSave,
  currentRules,
  childId,
  childName,
}: SpendingRulesModalProps) {
  const [rules, setRules] = useState<SpendingRules>(() => {
    if (currentRules) {
      return {
        ...currentRules,
        createdAt: currentRules.createdAt ? new Date(currentRules.createdAt) : null,
        updatedAt: currentRules.updatedAt ? new Date(currentRules.updatedAt) : null,
      };
    }
    
    // Default values for new rules
    return {
      childId,
      dailyLimit: "10",
      weeklyLimit: "50",
      monthlyLimit: "150",
      perTransactionLimit: "25",
      withdrawalLimit: "20",
      allowedMerchantCategories: [],
      blockedMerchantCategories: ["gaming"],
      restrictedDaysOfWeek: [],
      allowInternationalTransactions: false,
      requireParentalApprovalAbove: "25",
      requireParentalApprovalForMerchants: [],
      allowOnlineTransactions: true,
      allowWithdrawals: true,
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [limitType, setLimitType] = useState<'all' | 'specific'>(
    rules.allowedMerchantCategories && rules.allowedMerchantCategories.length > 0 ? 'specific' : 'all'
  );
  
  const [merchantControlType, setMerchantControlType] = useState<'allowed' | 'blocked'>(
    rules.allowedMerchantCategories && rules.allowedMerchantCategories.length > 0 ? 'allowed' : 'blocked'
  );
  
  const handleAmountChange = (field: keyof SpendingRules, value: string) => {
    // Only allow numbers and up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setRules({
        ...rules,
        [field]: value || null
      });
      
      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: ""
        });
      }
    }
  };
  
  const handleSwitchChange = (field: keyof SpendingRules, checked: boolean) => {
    setRules({
      ...rules,
      [field]: checked
    });
  };
  
  const handleMerchantCategorySelection = (selectedCategories: string[]) => {
    if (merchantControlType === 'allowed') {
      setRules({
        ...rules,
        allowedMerchantCategories: selectedCategories.length > 0 ? selectedCategories : null,
        blockedMerchantCategories: null
      });
    } else {
      setRules({
        ...rules,
        blockedMerchantCategories: selectedCategories.length > 0 ? selectedCategories : null,
        allowedMerchantCategories: null
      });
    }
  };
  
  const handleRestrictedDaysChange = (selectedDays: string[]) => {
    setRules({
      ...rules,
      restrictedDaysOfWeek: selectedDays.length > 0 ? selectedDays : null
    });
  };
  
  const handleApprovalMerchantsChange = (selectedCategories: string[]) => {
    setRules({
      ...rules,
      requireParentalApprovalForMerchants: selectedCategories.length > 0 ? selectedCategories : null
    });
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const validateLimit = (field: keyof SpendingRules, value: string | null, label: string) => {
      if (value !== null && value !== "") {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = `${label} must be a positive number`;
        }
      }
    };
    
    validateLimit('dailyLimit', rules.dailyLimit, 'Daily limit');
    validateLimit('weeklyLimit', rules.weeklyLimit, 'Weekly limit');
    validateLimit('monthlyLimit', rules.monthlyLimit, 'Monthly limit');
    validateLimit('perTransactionLimit', rules.perTransactionLimit, 'Transaction limit');
    validateLimit('withdrawalLimit', rules.withdrawalLimit, 'Withdrawal limit');
    validateLimit('requireParentalApprovalAbove', rules.requireParentalApprovalAbove, 'Approval threshold');
    
    // Check if daily limit is less than weekly limit
    if (rules.dailyLimit && rules.weeklyLimit) {
      const dailyLimit = parseFloat(rules.dailyLimit);
      const weeklyLimit = parseFloat(rules.weeklyLimit);
      if (dailyLimit > weeklyLimit) {
        newErrors.dailyLimit = "Daily limit cannot be greater than weekly limit";
      }
    }
    
    // Check if weekly limit is less than monthly limit
    if (rules.weeklyLimit && rules.monthlyLimit) {
      const weeklyLimit = parseFloat(rules.weeklyLimit);
      const monthlyLimit = parseFloat(rules.monthlyLimit);
      if (weeklyLimit > monthlyLimit) {
        newErrors.weeklyLimit = "Weekly limit cannot be greater than monthly limit";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      onSave(rules);
      onClose();
    }
  };
  
  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return '';
    return amount;
  };
  
  // Helper to check if a value is included in an array
  const isSelected = (arr: string[] | null, value: string) => {
    return arr ? arr.includes(value) : false;
  };
  
  // Toggle selection in an array
  const toggleSelected = (arr: string[] | null, value: string) => {
    if (!arr) arr = [];
    
    if (arr.includes(value)) {
      return arr.filter(item => item !== value);
    } else {
      return [...arr, value];
    }
  };
  
  const handleMerchantControlTypeChange = (value: 'allowed' | 'blocked') => {
    setMerchantControlType(value);
    
    // Convert existing selections if changing types
    if (value === 'allowed') {
      if (rules.blockedMerchantCategories && rules.blockedMerchantCategories.length > 0) {
        const allCategories = merchantCategories.map(cat => cat.id);
        const allowedCategories = allCategories.filter(
          cat => !rules.blockedMerchantCategories?.includes(cat)
        );
        
        setRules({
          ...rules,
          allowedMerchantCategories: allowedCategories.length > 0 ? allowedCategories : null,
          blockedMerchantCategories: null
        });
      }
    } else {
      if (rules.allowedMerchantCategories && rules.allowedMerchantCategories.length > 0) {
        const allCategories = merchantCategories.map(cat => cat.id);
        const blockedCategories = allCategories.filter(
          cat => !rules.allowedMerchantCategories?.includes(cat)
        );
        
        setRules({
          ...rules,
          blockedMerchantCategories: blockedCategories.length > 0 ? blockedCategories : null,
          allowedMerchantCategories: null
        });
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Spending Rules for {childName}
        </DialogTitle>
        
        <DialogDescription>
          Configure spending limits and restrictions to help your child learn financial responsibility.
        </DialogDescription>
        
        <div className="grid gap-6 py-4">
          <div>
            <h3 className="text-base font-medium mb-3">Spending Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Daily Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dailyLimit"
                    value={formatCurrency(rules.dailyLimit)}
                    onChange={(e) => handleAmountChange("dailyLimit", e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
                {errors.dailyLimit && (
                  <p className="text-sm text-red-500">{errors.dailyLimit}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weeklyLimit" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Weekly Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="weeklyLimit"
                    value={formatCurrency(rules.weeklyLimit)}
                    onChange={(e) => handleAmountChange("weeklyLimit", e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
                {errors.weeklyLimit && (
                  <p className="text-sm text-red-500">{errors.weeklyLimit}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Monthly Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthlyLimit"
                    value={formatCurrency(rules.monthlyLimit)}
                    onChange={(e) => handleAmountChange("monthlyLimit", e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
                {errors.monthlyLimit && (
                  <p className="text-sm text-red-500">{errors.monthlyLimit}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perTransactionLimit" className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Per Transaction Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="perTransactionLimit"
                    value={formatCurrency(rules.perTransactionLimit)}
                    onChange={(e) => handleAmountChange("perTransactionLimit", e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
                {errors.perTransactionLimit && (
                  <p className="text-sm text-red-500">{errors.perTransactionLimit}</p>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-base font-medium mb-3">Merchant Controls</h3>
            
            <RadioGroup 
              value={merchantControlType} 
              onValueChange={(v) => handleMerchantControlTypeChange(v as 'allowed' | 'blocked')}
              className="flex flex-col space-y-3 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blocked" id="blocked" />
                <Label htmlFor="blocked" className="cursor-pointer">Block specific merchant categories</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="allowed" id="allowed" />
                <Label htmlFor="allowed" className="cursor-pointer">Only allow specific merchant categories</Label>
              </div>
            </RadioGroup>
            
            <div className="space-y-3">
              <Label>
                {merchantControlType === 'allowed' ? 'Allowed Categories' : 'Blocked Categories'}:
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {merchantCategories.map((category) => {
                  const isChecked = merchantControlType === 'allowed'
                    ? isSelected(rules.allowedMerchantCategories, category.id)
                    : isSelected(rules.blockedMerchantCategories, category.id);
                    
                  return (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={isChecked}
                        onChange={() => {
                          if (merchantControlType === 'allowed') {
                            const newCategories = toggleSelected(rules.allowedMerchantCategories, category.id);
                            handleMerchantCategorySelection(newCategories);
                          } else {
                            const newCategories = toggleSelected(rules.blockedMerchantCategories, category.id);
                            handleMerchantCategorySelection(newCategories);
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-base font-medium mb-3">Parental Approval</h3>
            
            <div className="space-y-2 mb-4">
              <Label htmlFor="requireParentalApprovalAbove" className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Require approval for purchases above
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="requireParentalApprovalAbove"
                  value={formatCurrency(rules.requireParentalApprovalAbove)}
                  onChange={(e) => handleAmountChange("requireParentalApprovalAbove", e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              {errors.requireParentalApprovalAbove && (
                <p className="text-sm text-red-500">{errors.requireParentalApprovalAbove}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your child will need to request approval for any purchases above this amount
              </p>
            </div>
            
            <div className="space-y-3">
              <Label>Always require approval for these categories:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {merchantCategories.map((category) => (
                  <div key={`approval-${category.id}`} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`approval-${category.id}`}
                      checked={isSelected(rules.requireParentalApprovalForMerchants, category.id)}
                      onChange={() => {
                        const newCategories = toggleSelected(
                          rules.requireParentalApprovalForMerchants, 
                          category.id
                        );
                        handleApprovalMerchantsChange(newCategories);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`approval-${category.id}`} className="cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-base font-medium mb-3">Time Restrictions</h3>
            
            <div className="space-y-3">
              <Label>Restrict spending on these days:</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`day-${day.id}`}
                      checked={isSelected(rules.restrictedDaysOfWeek, day.id)}
                      onChange={() => {
                        const newDays = toggleSelected(
                          rules.restrictedDaysOfWeek, 
                          day.id
                        );
                        handleRestrictedDaysChange(newDays);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`day-${day.id}`} className="cursor-pointer">
                      {day.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Your child will not be able to make purchases on selected days
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-base font-medium mb-3">Additional Controls</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowWithdrawals" className="flex items-center">
                    <CreditCardIcon className="mr-2 h-4 w-4" />
                    Allow ATM Withdrawals
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Let your child withdraw cash from ATMs
                  </p>
                </div>
                <Switch
                  id="allowWithdrawals"
                  checked={rules.allowWithdrawals || false}
                  onCheckedChange={(checked) => handleSwitchChange("allowWithdrawals", checked)}
                />
              </div>
              
              {rules.allowWithdrawals && (
                <div className="pl-6 border-l-2 border-muted space-y-2">
                  <Label htmlFor="withdrawalLimit">
                    Maximum withdrawal amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="withdrawalLimit"
                      value={formatCurrency(rules.withdrawalLimit)}
                      onChange={(e) => handleAmountChange("withdrawalLimit", e.target.value)}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.withdrawalLimit && (
                    <p className="text-sm text-red-500">{errors.withdrawalLimit}</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowOnlineTransactions" className="flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Allow Online Purchases
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable online shopping
                  </p>
                </div>
                <Switch
                  id="allowOnlineTransactions"
                  checked={rules.allowOnlineTransactions || false}
                  onCheckedChange={(checked) => handleSwitchChange("allowOnlineTransactions", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowInternationalTransactions" className="flex items-center">
                    <Store className="mr-2 h-4 w-4" />
                    Allow International Purchases
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable purchases from foreign merchants
                  </p>
                </div>
                <Switch
                  id="allowInternationalTransactions"
                  checked={rules.allowInternationalTransactions || false}
                  onCheckedChange={(checked) => handleSwitchChange("allowInternationalTransactions", checked)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Rules</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}