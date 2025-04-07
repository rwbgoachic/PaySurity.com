import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, CreditCard, DollarSign, Clock, AlertTriangle, Check, X, HelpCircle } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Badge
} from "@/components/ui/badge";

export interface SpendingRequest {
  id?: string;
  title: string;
  amount: string;
  description: string | null;
  category: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'canceled';
  createdAt?: Date | null;
  updatedAt?: Date | null;
  expirationDate?: Date | null;
  rejectionReason?: string | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  parentNote?: string | null;
  urgent?: boolean | null;
}

interface SpendingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: SpendingRequest) => void;
  currentRequest?: SpendingRequest;
  viewOnly?: boolean;
  isParentMode?: boolean;
}

const requestCategories = [
  { value: "clothing", label: "Clothing & Accessories" },
  { value: "entertainment", label: "Entertainment" },
  { value: "food", label: "Food & Drinks" },
  { value: "games", label: "Games & Apps" },
  { value: "gifts", label: "Gifts" },
  { value: "health", label: "Health & Beauty" },
  { value: "school", label: "School Supplies" },
  { value: "sports", label: "Sports & Activities" },
  { value: "tech", label: "Technology" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

export default function SpendingRequestModal({
  isOpen,
  onClose,
  onSave,
  currentRequest,
  viewOnly = false,
  isParentMode = false,
}: SpendingRequestModalProps) {
  const [request, setRequest] = useState<SpendingRequest>(() => {
    if (currentRequest) {
      return { 
        ...currentRequest,
        expirationDate: currentRequest.expirationDate ? new Date(currentRequest.expirationDate) : undefined,
        createdAt: currentRequest.createdAt ? new Date(currentRequest.createdAt) : undefined,
        updatedAt: currentRequest.updatedAt ? new Date(currentRequest.updatedAt) : undefined,
        approvedAt: currentRequest.approvedAt ? new Date(currentRequest.approvedAt) : undefined,
        rejectedAt: currentRequest.rejectedAt ? new Date(currentRequest.rejectedAt) : undefined,
      };
    }
    
    // Default values for a new request
    return {
      title: "",
      amount: "",
      description: "",
      category: "other",
      status: "pending",
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      urgent: false,
    };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [parentResponse, setParentResponse] = useState<{
    status: 'approved' | 'rejected';
    note: string;
  }>({
    status: 'approved',
    note: currentRequest?.parentNote || "",
  });
  
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
  
  const handleCategoryChange = (value: string) => {
    setRequest({
      ...request,
      category: value
    });
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setRequest({
      ...request,
      expirationDate: date || null
    });
    
    if (errors.expirationDate) {
      setErrors({
        ...errors,
        expirationDate: ""
      });
    }
  };
  
  const handleUrgentChange = (checked: boolean) => {
    setRequest({
      ...request,
      urgent: checked
    });
  };
  
  const handleParentResponseChange = (field: 'status' | 'note', value: string) => {
    setParentResponse({
      ...parentResponse,
      [field]: value
    });
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
    
    if (request.expirationDate && request.expirationDate < new Date()) {
      newErrors.expirationDate = "Expiration date must be in the future";
    }
    
    if (isParentMode && parentResponse.status === 'rejected' && !parentResponse.note?.trim()) {
      newErrors.parentNote = "Please provide a reason for rejection";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (validateForm()) {
      if (isParentMode) {
        // When parent is responding to a request
        onSave({
          ...request,
          status: parentResponse.status,
          parentNote: parentResponse.note,
          rejectionReason: parentResponse.status === 'rejected' ? parentResponse.note : request.rejectionReason,
          approvedAt: parentResponse.status === 'approved' ? new Date() : request.approvedAt,
          rejectedAt: parentResponse.status === 'rejected' ? new Date() : request.rejectedAt,
        });
      } else {
        // Normal save for child creating/editing request
        onSave(request);
      }
      onClose();
    }
  };
  
  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '';
    return amount;
  };
  
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return format(date, 'MMM d, yyyy');
  };
  
  const getStatusBadge = (status: string | undefined) => {
    let label = status || 'pending';
    let icon = null;
    
    switch (status) {
      case 'approved':
        icon = <Check className="h-3 w-3 mr-1" />;
        break;
      case 'rejected':
        icon = <X className="h-3 w-3 mr-1" />;
        break;
      case 'pending':
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case 'canceled':
        icon = <X className="h-3 w-3 mr-1" />;
        break;
    }
    
    return (
      <Badge variant="outline" className={`flex items-center capitalize ${getStatusColor(status)}`}>
        {icon}
        {label}
      </Badge>
    );
  };
  
  // Render different content based on view mode
  const renderContent = () => {
    if (viewOnly) {
      // View only mode (details)
      return (
        <div className="grid gap-6 py-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{request.title}</h3>
            {getStatusBadge(request.status)}
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">${formatCurrency(request.amount)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground">Category:</span>
              <span>{requestCategories.find(c => c.value === request.category)?.label || request.category}</span>
            </div>
            {request.expirationDate && (
              <div className="flex justify-between mt-2">
                <span className="text-muted-foreground">Expires on:</span>
                <span>{formatDate(request.expirationDate)}</span>
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground">Requested on:</span>
              <span>{formatDate(request.createdAt)}</span>
            </div>
            {request.urgent && (
              <div className="flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg p-2 mt-3">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Urgent Request</span>
              </div>
            )}
          </div>
          
          {request.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <div className="bg-muted/30 p-3 rounded text-sm">
                {request.description}
              </div>
            </div>
          )}
          
          {request.status === 'rejected' && request.rejectionReason && (
            <div>
              <h4 className="font-medium mb-2 text-red-600 dark:text-red-400 flex items-center">
                <X className="h-4 w-4 mr-2" />
                Rejection Reason
              </h4>
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-sm">
                {request.rejectionReason}
              </div>
            </div>
          )}
          
          {request.status === 'approved' && request.parentNote && (
            <div>
              <h4 className="font-medium mb-2 text-green-600 dark:text-green-400 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Parent Note
              </h4>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-800 text-sm">
                {request.parentNote}
              </div>
            </div>
          )}
          
          {(request.approvedAt || request.rejectedAt) && (
            <div className="text-xs text-muted-foreground mt-2">
              {request.approvedAt && <div>Approved on: {formatDate(request.approvedAt)}</div>}
              {request.rejectedAt && <div>Rejected on: {formatDate(request.rejectedAt)}</div>}
            </div>
          )}
        </div>
      );
    } else if (isParentMode && currentRequest) {
      // Parent response mode
      return (
        <div className="grid gap-6 py-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{request.title}</h3>
            {getStatusBadge('pending')}
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">${formatCurrency(request.amount)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground">Category:</span>
              <span>{requestCategories.find(c => c.value === request.category)?.label || request.category}</span>
            </div>
            {request.expirationDate && (
              <div className="flex justify-between mt-2">
                <span className="text-muted-foreground">Expires on:</span>
                <span>{formatDate(request.expirationDate)}</span>
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground">Requested on:</span>
              <span>{formatDate(request.createdAt)}</span>
            </div>
            {request.urgent && (
              <div className="flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg p-2 mt-3">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Urgent Request</span>
              </div>
            )}
          </div>
          
          {request.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <div className="bg-muted/30 p-3 rounded text-sm">
                {request.description}
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Your Response</h4>
            
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={parentResponse.status === 'approved' ? 'default' : 'outline'}
                className={parentResponse.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => handleParentResponseChange('status', 'approved')}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                type="button"
                variant={parentResponse.status === 'rejected' ? 'destructive' : 'outline'}
                onClick={() => handleParentResponseChange('status', 'rejected')}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentNote">
                {parentResponse.status === 'approved' ? 'Note (Optional)' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="parentNote"
                value={parentResponse.note}
                onChange={(e) => handleParentResponseChange('note', e.target.value)}
                placeholder={parentResponse.status === 'approved' 
                  ? "Add an optional note for your child"
                  : "Please explain why you're rejecting this request"}
                rows={3}
              />
              {errors.parentNote && (
                <p className="text-sm text-red-500">{errors.parentNote}</p>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Standard form for creating/editing requests
      return (
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              What do you need money for?
            </Label>
            <Input
              id="title"
              value={request.title}
              onChange={(e) => handleTextChange("title", e.target.value)}
              placeholder="Enter a title for your request"
              disabled={viewOnly}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                How much do you need? ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  value={formatCurrency(request.amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                  disabled={viewOnly}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">
                Category
              </Label>
              <Select
                value={request.category || "other"}
                onValueChange={handleCategoryChange}
                disabled={viewOnly}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {requestCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={request.description || ""}
              onChange={(e) => handleTextChange("description", e.target.value)}
              placeholder="Explain why you need this money and what it's for"
              rows={3}
              disabled={viewOnly}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expirationDate" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              By when do you need an answer?
            </Label>
            <DatePicker
              date={request.expirationDate || undefined}
              onSelect={handleDateChange}
              placeholder="Select an expiration date"
              disabled={viewOnly}
            />
            {errors.expirationDate && (
              <p className="text-sm text-red-500">{errors.expirationDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              After this date, your request will expire if not answered
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="urgent" className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                Urgent Request
              </Label>
              <p className="text-sm text-muted-foreground">
                Mark this as urgent if you need a quick response
              </p>
            </div>
            <Switch
              id="urgent"
              checked={request.urgent || false}
              onCheckedChange={handleUrgentChange}
              disabled={viewOnly}
            />
          </div>
          
          {request.urgent && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100 dark:border-red-800">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  Only use urgent requests for time-sensitive needs. Your parent will be notified immediately.
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          {(() => {
            if (viewOnly) return "Spending Request Details";
            if (isParentMode) return "Respond to Spending Request";
            return currentRequest ? "Edit Spending Request" : "New Spending Request";
          })()}
        </DialogTitle>
        
        <DialogDescription>
          {(() => {
            if (viewOnly) return "View the details of this spending request.";
            if (isParentMode) return "Review and respond to your child's spending request.";
            return currentRequest 
              ? "Update your spending request details." 
              : "Ask your parent for money for a specific purchase.";
          })()}
        </DialogDescription>
        
        {renderContent()}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {viewOnly ? "Close" : "Cancel"}
          </Button>
          
          {!viewOnly && (
            <Button onClick={handleSave}>
              {isParentMode ? "Submit Response" : (currentRequest ? "Update" : "Submit")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}