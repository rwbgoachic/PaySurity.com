import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Calendar, Store, Tag, Clock, AlertTriangle, ShoppingCart } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format, addDays } from "date-fns";
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

export interface SpendingRequest {
  id?: string;
  title: string;
  amount: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'canceled';
  childId?: string;
  parentId?: string;
  merchantName?: string | null;
  merchantCategory?: string | null;
  requestedDate?: Date | null;
  responseDate?: Date | null;
  expirationDate?: Date | null;
  rejectionReason?: string | null;
  receiptImage?: string | null;
  urgent?: boolean;
}

interface SpendingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: SpendingRequest) => void;
  currentRequest?: SpendingRequest;
  isParentMode?: boolean;
}

const merchantCategories = [
  { value: "retail", label: "Retail Stores" },
  { value: "online", label: "Online Shopping" },
  { value: "food", label: "Restaurants & Food" },
  { value: "grocery", label: "Grocery Stores" },
  { value: "entertainment", label: "Entertainment" },
  { value: "games", label: "Video Games" },
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books & Education" },
  { value: "sports", label: "Sports Equipment" },
  { value: "other", label: "Other" }
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

export default function SpendingRequestModal({
  isOpen,
  onClose,
  onSave,
  currentRequest,
  isParentMode = false,
}: SpendingRequestModalProps) {
  const [request, setRequest] = useState<SpendingRequest>(() => {
    if (currentRequest) {
      return { ...currentRequest };
    }
    
    // Default values for new request
    return {
      title: "",
      amount: "",
      description: null,
      status: "pending",
      merchantName: null,
      merchantCategory: null,
      requestedDate: new Date(),
      expirationDate: addDays(new Date(), 7),
      urgent: false
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResponse, setShowResponse] = useState<boolean>(isParentMode);
  const [rejectionReason, setRejectionReason] = useState<string>(request.rejectionReason || "");
  const [activeTab, setActiveTab] = useState("details");
  
  const handleTextChange = (field: keyof SpendingRequest, value: string) => {
    setRequest({
      ...request,
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
      setRequest({
        ...request,
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
  
  const handleMerchantCategoryChange = (value: string) => {
    setRequest({
      ...request,
      merchantCategory: value
    });
  };
  
  const handleMerchantNameChange = (value: string) => {
    setRequest({
      ...request,
      merchantName: value
    });
  };
  
  const handleExpirationDateChange = (date: Date | undefined) => {
    setRequest({
      ...request,
      expirationDate: date || null
    });
  };
  
  const handleUrgentToggle = (checked: boolean) => {
    setRequest({
      ...request,
      urgent: checked
    });
  };
  
  const handleStatusChange = (status: 'approved' | 'rejected') => {
    setRequest({
      ...request,
      status,
      responseDate: new Date()
    });
    
    if (status === 'rejected') {
      setShowResponse(true);
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!request.title?.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!request.amount) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(request.amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }
    
    if (isParentMode && request.status === 'rejected' && !rejectionReason.trim()) {
      newErrors.rejectionReason = "Please provide a reason for rejecting this request";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      const finalRequest = {
        ...request,
        rejectionReason: request.status === 'rejected' ? rejectionReason : null
      };
      
      onSave(finalRequest);
      onClose();
    }
  };
  
  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '';
    return amount;
  };
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '';
    return format(date, "PPP");
  };
  
  // Determine if we should show parent response section
  const isEditable = !isParentMode || (isParentMode && request.status === 'pending');
  
  const getStatusBadgeVariant = () => {
    switch (request.status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'canceled':
        return 'outline';
      case 'pending':
      default:
        return 'secondary';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          {currentRequest && isParentMode 
            ? "Review Spending Request" 
            : currentRequest 
              ? "Edit Spending Request" 
              : "Create Spending Request"
          }
        </DialogTitle>
        
        <DialogDescription>
          {isParentMode 
            ? "Review and approve or reject this spending request" 
            : "Request permission to spend money"
          }
        </DialogDescription>
        
        {currentRequest && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Status:</span>
            <Badge variant={getStatusBadgeVariant()}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="details" disabled={!isEditable && !isParentMode}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Request Details
            </TabsTrigger>
            <TabsTrigger value="merchant" disabled={!isEditable && !isParentMode}>
              <Store className="mr-2 h-4 w-4" />
              Merchant Info
            </TabsTrigger>
          </TabsList>
          
          {/* Request Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                What do you want to buy?
              </Label>
              <Input
                id="title"
                value={request.title}
                onChange={(e) => handleTextChange("title", e.target.value)}
                placeholder="New headphones, Movie ticket, etc."
                disabled={!isEditable}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">
                <DollarSign className="inline-block mr-1 h-4 w-4" />
                How much will it cost?
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  value={formatCurrency(request.amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                  disabled={!isEditable}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">
                Why do you want to buy this? (Optional)
              </Label>
              <Textarea
                id="description"
                value={request.description || ""}
                onChange={(e) => handleTextChange("description", e.target.value)}
                placeholder="Explain why you want to purchase this item"
                rows={3}
                disabled={!isEditable}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2 pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="urgent" className="cursor-pointer">
                  <AlertTriangle className="inline-block mr-1 h-4 w-4 text-amber-500" />
                  Mark as Urgent
                </Label>
                <p className="text-xs text-muted-foreground">
                  Request a quick response for time-sensitive purchases
                </p>
              </div>
              <Switch
                id="urgent"
                checked={request.urgent === true}
                onCheckedChange={handleUrgentToggle}
                disabled={!isEditable}
              />
            </div>
            
            {request.urgent && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-900 text-sm text-amber-600 dark:text-amber-300">
                Urgent requests will be highlighted for faster review.
              </div>
            )}
          </TabsContent>
          
          {/* Merchant Info Tab */}
          <TabsContent value="merchant" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="merchantName">
                <Store className="inline-block mr-1 h-4 w-4" />
                Store or Website Name (Optional)
              </Label>
              <Select
                value={request.merchantName || ""}
                onValueChange={handleMerchantNameChange}
                disabled={!isEditable}
              >
                <SelectTrigger id="merchantName">
                  <SelectValue placeholder="Where will you shop?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select a merchant or enter below</SelectItem>
                  {commonMerchants.map((merchant) => (
                    <SelectItem key={merchant.value} value={merchant.value}>
                      {merchant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!commonMerchants.some(m => m.value === request.merchantName) && (
                <Input
                  placeholder="Or enter a different store name"
                  value={request.merchantName || ""}
                  onChange={(e) => handleTextChange("merchantName", e.target.value)}
                  className="mt-2"
                  disabled={!isEditable}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="merchantCategory">
                <Tag className="inline-block mr-1 h-4 w-4" />
                Category (Optional)
              </Label>
              <Select
                value={request.merchantCategory || ""}
                onValueChange={handleMerchantCategoryChange}
                disabled={!isEditable}
              >
                <SelectTrigger id="merchantCategory">
                  <SelectValue placeholder="What type of purchase is this?" />
                </SelectTrigger>
                <SelectContent>
                  {merchantCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expirationDate">
                <Clock className="inline-block mr-1 h-4 w-4" />
                When do you need an answer by? (Optional)
              </Label>
              <DatePicker
                date={request.expirationDate || undefined}
                onSelect={handleExpirationDateChange}
                placeholder="Select a date"
                disabled={!isEditable}
              />
              <p className="text-xs text-muted-foreground">
                Default is one week from today
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {isParentMode && (
          <div className="mt-6 pt-6 border-t space-y-4">
            <h3 className="text-lg font-medium">Parent Response</h3>
            
            {request.status === 'pending' ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="default" 
                    onClick={() => handleStatusChange('approved')}
                    className="flex-1"
                  >
                    Approve Request
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleStatusChange('rejected')}
                    className="flex-1"
                  >
                    Deny Request
                  </Button>
                </div>
                
                {showResponse && (
                  <div className="space-y-2 animate-in fade-in">
                    <Label htmlFor="rejectionReason">
                      Reason for Denial
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for denying this request"
                      rows={2}
                    />
                    {errors.rejectionReason && (
                      <p className="text-sm text-red-500">{errors.rejectionReason}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={getStatusBadgeVariant()}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
                
                {request.responseDate && (
                  <div className="flex justify-between text-sm">
                    <span>Response date:</span>
                    <span>{formatDate(request.responseDate)}</span>
                  </div>
                )}
                
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="mt-2">
                    <Label>Reason for Denial:</Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">
                      {request.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {(isEditable || (isParentMode && request.status === 'pending')) && (
            <Button onClick={handleSave}>
              {isParentMode 
                ? (request.status === 'pending' ? "Submit Response" : "Update Response") 
                : (currentRequest ? "Update Request" : "Submit Request")
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}