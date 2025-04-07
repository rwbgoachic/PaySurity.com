import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DollarSign,
  Calendar,
  ShoppingBag,
  Store,
  Smartphone,
  CreditCard,
  ShieldAlert,
  AlertOctagon,
  Banknote
} from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface SpendingRules {
  id?: string;
  childId: string;
  dailyLimit?: string | null;
  weeklyLimit?: string | null;
  monthlyLimit?: string | null;
  perTransactionLimit?: string | null;
  withdrawalLimit?: string | null;
  allowedCategories?: string[] | null;
  blockedCategories?: string[] | null;
  allowedMerchants?: string[] | null;
  blockedMerchants?: string[] | null;
  requireApprovalAbove?: string | null;
  allowInAppPurchases?: boolean | null;
  allowInStorePurchases?: boolean | null;
  allowOnlinePurchases?: boolean | null;
  allowATMWithdrawals?: boolean | null;
}

interface ChildInfo {
  id: string;
  name: string;
}

interface SpendingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: SpendingRules) => void;
  childInfo: ChildInfo;
  currentRules?: SpendingRules;
}

const purchaseCategories = [
  { value: "retail", label: "Retail Stores" },
  { value: "online", label: "Online Shopping" },
  { value: "food", label: "Restaurants & Food" },
  { value: "grocery", label: "Grocery Stores" },
  { value: "entertainment", label: "Entertainment" },
  { value: "games", label: "Video Games" },
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books & Education" },
  { value: "sports", label: "Sports Equipment" }
];

const commonMerchants = [
  { value: "amazon", label: "Amazon" },
  { value: "walmart", label: "Walmart" },
  { value: "target", label: "Target" },
  { value: "apple", label: "Apple Store" },
  { value: "mcdonalds", label: "McDonald's" },
  { value: "starbucks", label: "Starbucks" },
  { value: "netflix", label: "Netflix" },
  { value: "steam", label: "Steam (Games)" },
  { value: "playstation", label: "PlayStation Store" },
  { value: "xbox", label: "Xbox Store" },
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" }
];

export default function SpendingRulesModal({
  isOpen,
  onClose,
  onSave,
  childInfo,
  currentRules,
}: SpendingRulesModalProps) {
  const [rules, setRules] = useState<SpendingRules>(() => {
    if (currentRules) {
      return { ...currentRules };
    }
    
    // Default values for new rules
    return {
      childId: childInfo.id,
      dailyLimit: null,
      weeklyLimit: null,
      monthlyLimit: null,
      perTransactionLimit: null,
      withdrawalLimit: null,
      allowedCategories: null,
      blockedCategories: null,
      allowedMerchants: null,
      blockedMerchants: null,
      requireApprovalAbove: null,
      allowInAppPurchases: true,
      allowInStorePurchases: true,
      allowOnlinePurchases: true,
      allowATMWithdrawals: false
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("limits");
  
  const handleTextChange = (field: keyof SpendingRules, value: string) => {
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
  };
  
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
  
  const handleBooleanToggle = (field: keyof SpendingRules, checked: boolean) => {
    setRules({
      ...rules,
      [field]: checked
    });
  };
  
  const handleCategorySelect = (categories: string[], isAllowed: boolean) => {
    setRules({
      ...rules,
      [isAllowed ? 'allowedCategories' : 'blockedCategories']: categories.length > 0 ? categories : null
    });
  };
  
  const handleMerchantSelect = (merchants: string[], isAllowed: boolean) => {
    setRules({
      ...rules,
      [isAllowed ? 'allowedMerchants' : 'blockedMerchants']: merchants.length > 0 ? merchants : null
    });
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate limits are positive if provided
    ['dailyLimit', 'weeklyLimit', 'monthlyLimit', 'perTransactionLimit', 'withdrawalLimit', 'requireApprovalAbove'].forEach(field => {
      const value = rules[field as keyof SpendingRules] as string | null;
      if (value && parseFloat(value) <= 0) {
        newErrors[field] = "Amount must be greater than zero";
      }
    });
    
    // Validate logical relationships between limits
    if (rules.dailyLimit && rules.weeklyLimit && 
        parseFloat(rules.dailyLimit) > parseFloat(rules.weeklyLimit)) {
      newErrors.dailyLimit = "Daily limit cannot be greater than weekly limit";
    }
    
    if (rules.weeklyLimit && rules.monthlyLimit && 
        parseFloat(rules.weeklyLimit) > parseFloat(rules.monthlyLimit)) {
      newErrors.weeklyLimit = "Weekly limit cannot be greater than monthly limit";
    }
    
    if (rules.dailyLimit && rules.monthlyLimit && 
        parseFloat(rules.dailyLimit) > parseFloat(rules.monthlyLimit)) {
      newErrors.dailyLimit = "Daily limit cannot be greater than monthly limit";
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
  
  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '';
    return amount;
  };
  
  // Helper to check if array contains a value
  const arrayIncludes = (arr: string[] | null | undefined, value: string): boolean => {
    return arr ? arr.includes(value) : false;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          <ShieldAlert className="mr-2 h-5 w-5" />
          {currentRules ? "Edit Spending Rules" : "Set Spending Rules"}
        </DialogTitle>
        
        <DialogDescription>
          Control how {childInfo.name} can spend money
        </DialogDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="limits">
              <DollarSign className="mr-2 h-4 w-4" />
              Spending Limits
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="merchants">
              <Store className="mr-2 h-4 w-4" />
              Merchants
            </TabsTrigger>
          </TabsList>
          
          {/* Spending Limits Tab */}
          <TabsContent value="limits" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">
                  <Calendar className="inline-block mr-1 h-4 w-4" />
                  Daily Spending Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dailyLimit"
                    value={formatCurrency(rules.dailyLimit)}
                    onChange={(e) => handleAmountChange("dailyLimit", e.target.value)}
                    className="pl-9"
                    placeholder="No limit"
                  />
                </div>
                {errors.dailyLimit && (
                  <p className="text-sm text-red-500">{errors.dailyLimit}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weeklyLimit">
                  <Calendar className="inline-block mr-1 h-4 w-4" />
                  Weekly Spending Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="weeklyLimit"
                    value={formatCurrency(rules.weeklyLimit)}
                    onChange={(e) => handleAmountChange("weeklyLimit", e.target.value)}
                    className="pl-9"
                    placeholder="No limit"
                  />
                </div>
                {errors.weeklyLimit && (
                  <p className="text-sm text-red-500">{errors.weeklyLimit}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">
                  <Calendar className="inline-block mr-1 h-4 w-4" />
                  Monthly Spending Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthlyLimit"
                    value={formatCurrency(rules.monthlyLimit)}
                    onChange={(e) => handleAmountChange("monthlyLimit", e.target.value)}
                    className="pl-9"
                    placeholder="No limit"
                  />
                </div>
                {errors.monthlyLimit && (
                  <p className="text-sm text-red-500">{errors.monthlyLimit}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perTransactionLimit">
                  <CreditCard className="inline-block mr-1 h-4 w-4" />
                  Per Transaction Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="perTransactionLimit"
                    value={formatCurrency(rules.perTransactionLimit)}
                    onChange={(e) => handleAmountChange("perTransactionLimit", e.target.value)}
                    className="pl-9"
                    placeholder="No limit"
                  />
                </div>
                {errors.perTransactionLimit && (
                  <p className="text-sm text-red-500">{errors.perTransactionLimit}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawalLimit">
                  <Banknote className="inline-block mr-1 h-4 w-4" />
                  ATM Withdrawal Limit
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="withdrawalLimit"
                    value={formatCurrency(rules.withdrawalLimit)}
                    onChange={(e) => handleAmountChange("withdrawalLimit", e.target.value)}
                    className="pl-9"
                    placeholder="No limit"
                    disabled={rules.allowATMWithdrawals !== true}
                  />
                </div>
                {errors.withdrawalLimit && (
                  <p className="text-sm text-red-500">{errors.withdrawalLimit}</p>
                )}
                {rules.allowATMWithdrawals !== true && (
                  <p className="text-xs text-muted-foreground">Enable ATM withdrawals in the Permissions tab first</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requireApprovalAbove">
                  <AlertOctagon className="inline-block mr-1 h-4 w-4" />
                  Require Approval Above
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="requireApprovalAbove"
                    value={formatCurrency(rules.requireApprovalAbove)}
                    onChange={(e) => handleAmountChange("requireApprovalAbove", e.target.value)}
                    className="pl-9"
                    placeholder="No automatic approval threshold"
                  />
                </div>
                {errors.requireApprovalAbove && (
                  <p className="text-sm text-red-500">{errors.requireApprovalAbove}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Purchases above this amount will require your approval
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Methods</CardTitle>
                <CardDescription>
                  Control where and how {childInfo.name} can make purchases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowInStorePurchases" className="cursor-pointer">
                      <ShoppingBag className="inline-block mr-1 h-4 w-4" />
                      In-Store Purchases
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow purchases at physical stores with a card
                    </p>
                  </div>
                  <Switch
                    id="allowInStorePurchases"
                    checked={rules.allowInStorePurchases === true}
                    onCheckedChange={(checked) => handleBooleanToggle("allowInStorePurchases", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowOnlinePurchases" className="cursor-pointer">
                      <CreditCard className="inline-block mr-1 h-4 w-4" />
                      Online Shopping
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow purchases on websites and online retailers
                    </p>
                  </div>
                  <Switch
                    id="allowOnlinePurchases"
                    checked={rules.allowOnlinePurchases === true}
                    onCheckedChange={(checked) => handleBooleanToggle("allowOnlinePurchases", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowInAppPurchases" className="cursor-pointer">
                      <Smartphone className="inline-block mr-1 h-4 w-4" />
                      In-App Purchases
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow purchases within mobile apps and games
                    </p>
                  </div>
                  <Switch
                    id="allowInAppPurchases"
                    checked={rules.allowInAppPurchases === true}
                    onCheckedChange={(checked) => handleBooleanToggle("allowInAppPurchases", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowATMWithdrawals" className="cursor-pointer">
                      <Banknote className="inline-block mr-1 h-4 w-4" />
                      ATM Withdrawals
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow cash withdrawals from ATM machines
                    </p>
                  </div>
                  <Switch
                    id="allowATMWithdrawals"
                    checked={rules.allowATMWithdrawals === true}
                    onCheckedChange={(checked) => handleBooleanToggle("allowATMWithdrawals", checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Purchase Categories</CardTitle>
                <CardDescription>
                  Control what types of purchases {childInfo.name} can make
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Allowed Categories (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = rules.allowedCategories || [];
                      const newSelected = selected.includes(value)
                        ? selected.filter(v => v !== value)
                        : [...selected, value];
                      handleCategorySelect(newSelected, true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select allowed categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseCategories.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value}
                          className={arrayIncludes(rules.allowedCategories, category.value) ? "bg-primary/20" : ""}
                        >
                          {category.label}
                          {arrayIncludes(rules.allowedCategories, category.value) && " ✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rules.allowedCategories?.map((category) => {
                      const categoryInfo = purchaseCategories.find(c => c.value === category);
                      return (
                        <div 
                          key={category}
                          className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs flex items-center"
                        >
                          {categoryInfo?.label || category}
                          <button
                            onClick={() => {
                              const newSelected = rules.allowedCategories?.filter(c => c !== category) || [];
                              handleCategorySelect(newSelected, true);
                            }}
                            className="ml-1 rounded-full hover:bg-primary/20 p-1"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rules.allowedCategories?.length 
                      ? "Only these categories will be allowed" 
                      : "If none selected, all categories are allowed except blocked ones"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Blocked Categories (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = rules.blockedCategories || [];
                      const newSelected = selected.includes(value)
                        ? selected.filter(v => v !== value)
                        : [...selected, value];
                      handleCategorySelect(newSelected, false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blocked categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseCategories.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value}
                          className={arrayIncludes(rules.blockedCategories, category.value) ? "bg-destructive/20" : ""}
                        >
                          {category.label}
                          {arrayIncludes(rules.blockedCategories, category.value) && " ✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rules.blockedCategories?.map((category) => {
                      const categoryInfo = purchaseCategories.find(c => c.value === category);
                      return (
                        <div 
                          key={category}
                          className="bg-destructive/10 text-destructive rounded-full px-2 py-1 text-xs flex items-center"
                        >
                          {categoryInfo?.label || category}
                          <button
                            onClick={() => {
                              const newSelected = rules.blockedCategories?.filter(c => c !== category) || [];
                              handleCategorySelect(newSelected, false);
                            }}
                            className="ml-1 rounded-full hover:bg-destructive/20 p-1"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rules.blockedCategories?.length 
                      ? "These categories will be blocked" 
                      : "If none selected, no categories are explicitly blocked"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Merchants Tab */}
          <TabsContent value="merchants" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Controls</CardTitle>
                <CardDescription>
                  Control which specific stores or websites {childInfo.name} can shop at
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Allowed Merchants (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = rules.allowedMerchants || [];
                      const newSelected = selected.includes(value)
                        ? selected.filter(v => v !== value)
                        : [...selected, value];
                      handleMerchantSelect(newSelected, true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select allowed merchants" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonMerchants.map((merchant) => (
                        <SelectItem
                          key={merchant.value}
                          value={merchant.value}
                          className={arrayIncludes(rules.allowedMerchants, merchant.value) ? "bg-primary/20" : ""}
                        >
                          {merchant.label}
                          {arrayIncludes(rules.allowedMerchants, merchant.value) && " ✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rules.allowedMerchants?.map((merchant) => {
                      const merchantInfo = commonMerchants.find(m => m.value === merchant);
                      return (
                        <div 
                          key={merchant}
                          className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs flex items-center"
                        >
                          {merchantInfo?.label || merchant}
                          <button
                            onClick={() => {
                              const newSelected = rules.allowedMerchants?.filter(m => m !== merchant) || [];
                              handleMerchantSelect(newSelected, true);
                            }}
                            className="ml-1 rounded-full hover:bg-primary/20 p-1"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rules.allowedMerchants?.length 
                      ? "Only these merchants will be allowed" 
                      : "If none selected, all merchants are allowed except blocked ones"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Blocked Merchants (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = rules.blockedMerchants || [];
                      const newSelected = selected.includes(value)
                        ? selected.filter(v => v !== value)
                        : [...selected, value];
                      handleMerchantSelect(newSelected, false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blocked merchants" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonMerchants.map((merchant) => (
                        <SelectItem
                          key={merchant.value}
                          value={merchant.value}
                          className={arrayIncludes(rules.blockedMerchants, merchant.value) ? "bg-destructive/20" : ""}
                        >
                          {merchant.label}
                          {arrayIncludes(rules.blockedMerchants, merchant.value) && " ✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rules.blockedMerchants?.map((merchant) => {
                      const merchantInfo = commonMerchants.find(m => m.value === merchant);
                      return (
                        <div 
                          key={merchant}
                          className="bg-destructive/10 text-destructive rounded-full px-2 py-1 text-xs flex items-center"
                        >
                          {merchantInfo?.label || merchant}
                          <button
                            onClick={() => {
                              const newSelected = rules.blockedMerchants?.filter(m => m !== merchant) || [];
                              handleMerchantSelect(newSelected, false);
                            }}
                            className="ml-1 rounded-full hover:bg-destructive/20 p-1"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rules.blockedMerchants?.length 
                      ? "These merchants will be blocked" 
                      : "If none selected, no merchants are explicitly blocked"}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm">
                    Add custom merchants by typing their name and pressing Enter
                  </p>
                  <div className="mt-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customAllowedMerchant">Custom Allowed Merchant</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="customAllowedMerchant"
                          placeholder="Enter merchant name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const value = e.currentTarget.value.trim().toLowerCase();
                              const selected = rules.allowedMerchants || [];
                              if (!selected.includes(value)) {
                                handleMerchantSelect([...selected, value], true);
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = document.getElementById('customAllowedMerchant') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              const value = input.value.trim().toLowerCase();
                              const selected = rules.allowedMerchants || [];
                              if (!selected.includes(value)) {
                                handleMerchantSelect([...selected, value], true);
                              }
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customBlockedMerchant">Custom Blocked Merchant</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="customBlockedMerchant"
                          placeholder="Enter merchant name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const value = e.currentTarget.value.trim().toLowerCase();
                              const selected = rules.blockedMerchants || [];
                              if (!selected.includes(value)) {
                                handleMerchantSelect([...selected, value], false);
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = document.getElementById('customBlockedMerchant') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              const value = input.value.trim().toLowerCase();
                              const selected = rules.blockedMerchants || [];
                              if (!selected.includes(value)) {
                                handleMerchantSelect([...selected, value], false);
                              }
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {currentRules ? "Update Rules" : "Save Rules"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}