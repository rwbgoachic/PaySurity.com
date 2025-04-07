import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Pencil,
  Trash,
  Plus
} from "lucide-react";

// Types
type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
  preparationTime?: number; // in minutes
  specialInstructions?: string;
  price: number;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
};

type Order = {
  id: number;
  orderNumber: string;
  status: "draft" | "placed" | "preparing" | "ready" | "served" | "completed" | "canceled" | "modifying";
  items: OrderItem[];
  tableId?: number;
  tableName?: string;
  createdAt: string;
  guestCount?: number;
  specialInstructions?: string;
  serverName?: string;
  isBeingModified?: boolean;
  modificationStartTime?: string;
  customerName?: string;
  customerPhone?: string;
  isTakeout?: boolean;
  isDelivery?: boolean;
  isQrOrder?: boolean;
  restaurantId?: number;
  restaurantName?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  modificationToken?: string;
  modificationExpiry?: string;
};

type ModifyParams = {
  token: string;
};

type MenuCategory = {
  id: number;
  name: string;
  description?: string;
};

type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
};

export default function OrderModifyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useState<ModifyParams>(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    return {
      token: params.get('token') || '',
    };
  });
  
  const [modifiedItems, setModifiedItems] = useState<OrderItem[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  // Fetch order details using the token
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ['/api/orders/modify', searchParams.token],
    queryFn: async () => {
      if (!searchParams.token) {
        throw new Error('Invalid modification token');
      }
      
      const res = await fetch(`/api/orders/modify?token=${searchParams.token}`);
      if (!res.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      return res.json();
    },
    enabled: !!searchParams.token,
    refetchInterval: 15000, // Refresh every 15 seconds to maintain session
    retry: 1,
  });
  
  // Fetch menu categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['/api/restaurant/menu/categories', order?.restaurantId],
    queryFn: async () => {
      if (!order?.restaurantId) {
        return [];
      }
      
      const res = await fetch(`/api/restaurant/menu/categories?restaurantId=${order.restaurantId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch menu categories');
      }
      
      return res.json();
    },
    enabled: !!order?.restaurantId,
  });
  
  // Fetch menu items based on selected category
  const {
    data: menuItems,
    isLoading: isLoadingMenuItems,
  } = useQuery({
    queryKey: ['/api/restaurant/menu/items', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory || !order?.restaurantId) {
        return [];
      }
      
      const res = await fetch(`/api/restaurant/menu/items?categoryId=${selectedCategory}&restaurantId=${order.restaurantId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch menu items');
      }
      
      return res.json();
    },
    enabled: !!selectedCategory && !!order?.restaurantId,
  });
  
  // Mutation to save order modifications
  const saveModificationsMutation = useMutation({
    mutationFn: async (updatedOrder: Partial<Order>) => {
      const response = await apiRequest('PATCH', `/api/orders/modify?token=${searchParams.token}`, updatedOrder);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Order updated',
        description: 'Your modifications have been saved successfully.',
      });
      
      // Close dialog and reset state
      setSaveDialogOpen(false);
      
      // Navigate to success page
      setLocation(`/merchant/pos/bistro/order-modify-success?orderNumber=${order?.orderNumber}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving modifications',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to cancel order modifications
  const cancelModificationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/orders/modify?token=${searchParams.token}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Modifications cancelled',
        description: 'Your order remains unchanged.',
      });
      
      // Close dialog and navigate away
      setCancelDialogOpen(false);
      setLocation(`/merchant/pos/bistro/order-modify-cancelled?orderNumber=${order?.orderNumber}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error cancelling modifications',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Initialize modifiedItems when order data is loaded
  useEffect(() => {
    if (order && order.items) {
      setModifiedItems(JSON.parse(JSON.stringify(order.items))); // Deep copy
      setSpecialInstructions(order.specialInstructions || '');
    }
  }, [order]);
  
  // Calculate time remaining based on modificationExpiry
  useEffect(() => {
    if (!order?.modificationExpiry) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(order.modificationExpiry);
      const diffMs = expiry.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeRemaining(0);
        return;
      }
      
      const diffMinutes = Math.floor(diffMs / 60000);
      setTimeRemaining(diffMinutes);
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [order?.modificationExpiry]);
  
  // Handlers
  const handleQuantityChange = (itemId: number, change: number) => {
    setModifiedItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, item.quantity + change) } 
          : item
      ).filter(item => item.quantity > 0) // Remove items with zero quantity
    );
  };
  
  const handleSpecialInstructionsChange = (itemId: number, instructions: string) => {
    setModifiedItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, specialInstructions: instructions } 
          : item
      )
    );
  };
  
  const handleAddItem = (menuItem: MenuItem) => {
    // Check if item already exists in order
    const existingItemIndex = modifiedItems.findIndex(item => 
      item.id === menuItem.id || item.name === menuItem.name
    );
    
    if (existingItemIndex >= 0) {
      // Increase quantity if item already exists
      setModifiedItems(items => 
        items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
        status: "pending",
        categoryId: menuItem.categoryId,
        categoryName: categories?.find((c: MenuCategory) => c.id === menuItem.categoryId)?.name,
        imageUrl: menuItem.imageUrl,
      };
      
      setModifiedItems(items => [...items, newItem]);
    }
    
    setShowAddDialog(false);
    setSelectedCategory(null);
  };
  
  const handleRemoveItem = (itemId: number) => {
    setModifiedItems(items => items.filter(item => item.id !== itemId));
  };
  
  const handleSaveModifications = () => {
    const updatedOrder: Partial<Order> = {
      items: modifiedItems,
      specialInstructions,
    };
    
    saveModificationsMutation.mutate(updatedOrder);
  };
  
  // Loading state
  if (isLoadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Loading Order Details</h2>
          <p className="text-muted-foreground">Please wait while we retrieve your order...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (orderError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-center">Invalid or Expired Link</CardTitle>
            <CardDescription className="text-center">
              This order modification link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {orderError instanceof Error 
                  ? orderError.message 
                  : 'Unable to fetch order details. Please contact the restaurant.'}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.close()}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Time expired state
  if (timeRemaining === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-center">Modification Time Expired</CardTitle>
            <CardDescription className="text-center">
              The time allowed for modifying this order has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              If you still need to make changes to your order, please contact the restaurant directly.
            </p>
            <div className="bg-muted p-4 rounded-md text-center">
              <p className="font-medium">Order #{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">{order.restaurantName}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.close()}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Calculate totals
  const subtotal = modifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.0825; // 8.25% tax rate (example)
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-primary">Modify Your Order</h1>
              <p className="text-sm text-muted-foreground">
                Order #{order.orderNumber} 
                {order.tableName && ` • Table ${order.tableName}`}
              </p>
            </div>
            <div className="flex items-center">
              {timeRemaining !== null && (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                  <Clock className="h-3 w-3 mr-1.5" />
                  {timeRemaining} {timeRemaining === 1 ? 'minute' : 'minutes'} left
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              Add, remove, or modify items in your order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modifiedItems.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">Your order is empty</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Items
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {modifiedItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1 pr-4">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        ${item.price.toFixed(2)} each
                      </div>
                      
                      <Textarea
                        placeholder="Special instructions (optional)"
                        value={item.specialInstructions || ''}
                        onChange={(e) => handleSpecialInstructionsChange(item.id, e.target.value)}
                        className="text-sm h-20 resize-none mt-2"
                      />
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-l-md"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <div className="w-8 text-center">{item.quantity}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-r-md"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-auto"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Items
                </Button>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <Label htmlFor="special-instructions">Special Instructions for the Entire Order</Label>
              <Textarea
                id="special-instructions"
                placeholder="Any special instructions for this order? (allergies, preferences, etc.)"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Changes
            </Button>
            <Button
              className="w-full"
              onClick={() => setSaveDialogOpen(true)}
              disabled={saveModificationsMutation.isPending}
            >
              {saveModificationsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      {/* Item selection dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Items to Your Order</DialogTitle>
            <DialogDescription>
              Select from the menu below
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {!selectedCategory ? (
              <div className="space-y-2">
                <h3 className="font-medium mb-3">Menu Categories</h3>
                {isLoadingCategories ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading categories...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories?.map((category: MenuCategory) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    {categories?.find((c: MenuCategory) => c.id === selectedCategory)?.name || 'Menu Items'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Back to Categories
                  </Button>
                </div>
                
                {isLoadingMenuItems ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading menu items...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {menuItems?.map((item: MenuItem) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start p-3 border rounded-lg hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleAddItem(item)}
                      >
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm save changes dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Changes?</DialogTitle>
            <DialogDescription>
              Your order will be updated with these modifications
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert>
              <AlertTitle>Please note:</AlertTitle>
              <AlertDescription>
                This will update your current order. The restaurant will be notified of your changes.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveModifications}
              disabled={saveModificationsMutation.isPending}
            >
              {saveModificationsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm cancel dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Your Changes?</DialogTitle>
            <DialogDescription>
              Your original order will remain unchanged
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTitle>Are you sure?</AlertTitle>
              <AlertDescription>
                All modifications you've made will be discarded. This cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelModificationsMutation.mutate()}
              disabled={cancelModificationsMutation.isPending}
            >
              {cancelModificationsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Discard Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}