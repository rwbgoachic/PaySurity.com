import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Timer, Check, ChefHat, ArrowLeftRight, Clock3, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
  preparationTime?: number; // in minutes
  specialInstructions?: string;
};

type Order = {
  id: number;
  orderNumber: string;
  status: "draft" | "placed" | "preparing" | "ready" | "served" | "completed" | "canceled";
  items: OrderItem[];
  tableId?: number;
  tableName?: string;
  createdAt: string;
  guestCount?: number;
  specialInstructions?: string;
  serverName?: string;
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 min ago";
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export default function KitchenDisplay() {
  const { toast } = useToast();
  const [visibleItems, setVisibleItems] = useState("all"); // "all", "pending", "preparing", "ready"
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Get active restaurant location
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["/api/pos/locations"],
    queryFn: async () => {
      const res = await fetch("/api/pos/locations");
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
    enabled: !!user
  });
  
  // Use the first location for now. In a real application, you would want to add location selection
  const locationId = locations && locations.length > 0 ? locations[0].id : null;
  
  // Get orders that need kitchen attention (placed, preparing)
  const { 
    data: orders, 
    isLoading: isLoadingOrders,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ["/api/restaurant/orders", "kitchen", locationId],
    queryFn: async () => {
      if (!locationId) return [];
      const statusParams = new URLSearchParams({ status: "placed,preparing" }).toString();
      const res = await fetch(`/api/restaurant/orders?${statusParams}`);
      if (!res.ok) throw new Error("Failed to fetch kitchen orders");
      return res.json();
    },
    enabled: !!locationId,
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/restaurant/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurant/orders", "kitchen"] });
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating order",
        description: error.message || "There was an error updating the order.",
        variant: "destructive",
      });
    },
  });
  
  // Update order item status mutation
  const updateOrderItemStatusMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      itemId, 
      status 
    }: { 
      orderId: number, 
      itemId: number, 
      status: string 
    }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/restaurant/orders/${orderId}/items/${itemId}/status`, 
        { status }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurant/orders", "kitchen"] });
      toast({
        title: "Item updated",
        description: "Item status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating item",
        description: error.message || "There was an error updating the item.",
        variant: "destructive",
      });
    },
  });
  
  // Play sound when new orders arrive
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);
  
  // Filter orders based on status filter
  const filteredOrders = orders ? orders
    .filter((order: Order) => {
      if (visibleItems === "all") return true;
      if (visibleItems === "pending") return order.status === "placed";
      if (visibleItems === "preparing") return order.status === "preparing";
      if (visibleItems === "ready") return order.status === "ready";
      return true;
    })
    .sort((a: Order, b: Order) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) : [];
    
  // Handle order status update
  const handleOrderStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };
  
  // Handle item status update with enhanced visual feedback
  const handleItemStatusChange = (orderId: number, itemId: number, newStatus: string) => {
    // Find both the parent order element and the specific item element
    const orderElement = document.getElementById(`order-${orderId}`);
    const itemElement = document.getElementById(`item-${orderId}-${itemId}`);
    
    // Provide item-specific visual feedback
    if (itemElement) {
      // Add a highlight effect to the specific item being updated
      itemElement.classList.add('animate-pulse');
      itemElement.style.transform = 'scale(0.98)';
      
      // Apply appropriate status class immediately for better UX
      if (newStatus === "preparing") {
        itemElement.classList.remove('bg-white');
        itemElement.classList.add('kitchen-status-preparing');
      } else if (newStatus === "ready") {
        itemElement.classList.remove('kitchen-status-preparing');
        itemElement.classList.add('kitchen-status-ready');
      }
      
      // Remove animation after a short delay
      setTimeout(() => {
        itemElement.classList.remove('animate-pulse');
        itemElement.style.transform = '';
      }, 500);
    }
    
    // Also provide subtle feedback on the parent order card
    if (orderElement) {
      orderElement.classList.add('shadow-md');
      setTimeout(() => {
        orderElement.classList.remove('shadow-md');
      }, 500);
    }
    
    // Update the item status in the database
    updateOrderItemStatusMutation.mutate({ orderId, itemId, status: newStatus });
  };
  
  // Handle start cooking action with enhanced visual feedback
  const handleStartCooking = (orderId: number) => {
    // Show immediate visual feedback
    const orderElement = document.getElementById(`order-${orderId}`);
    if (orderElement) {
      // Add visual feedback animation
      orderElement.classList.add('animate-pulse');
      
      // Add a scaling effect for touch feedback
      orderElement.style.transform = 'scale(0.98)';
      
      // Immediately apply the new status styling for better UX
      orderElement.classList.remove('border-blue-300', 'bg-blue-50');
      orderElement.classList.add('border-amber-300', 'bg-amber-50', 'kitchen-status-preparing');
      
      // Find the status badge inside this order card and update it
      const statusBadge = orderElement.querySelector('.kitchen-status-new');
      if (statusBadge) {
        statusBadge.classList.remove('kitchen-status-new');
        statusBadge.classList.add('kitchen-status-preparing');
        statusBadge.textContent = 'Preparing';
      }
      
      // Reset animations after a short delay
      setTimeout(() => {
        orderElement.classList.remove('animate-pulse');
        orderElement.style.transform = '';
      }, 300);
    }
    
    // Update the order status in the database
    updateOrderStatusMutation.mutate({ orderId, status: "preparing" });
  };
  
  // Handle order ready action with enhanced visual feedback
  const handleOrderReady = (orderId: number) => {
    // Show immediate visual feedback
    const orderElement = document.getElementById(`order-${orderId}`);
    if (orderElement) {
      // Add visual feedback animation
      orderElement.classList.add('animate-pulse');
      
      // Add a scaling effect for touch feedback
      orderElement.style.transform = 'scale(0.98)';
      
      // Immediately apply the new status styling for better UX
      orderElement.classList.remove('border-amber-300', 'bg-amber-50', 'kitchen-status-preparing');
      orderElement.classList.add('border-green-300', 'bg-green-50', 'kitchen-status-ready');
      
      // Find the status badge inside this order card and update it
      const statusBadge = orderElement.querySelector('.kitchen-status-preparing');
      if (statusBadge) {
        statusBadge.classList.remove('kitchen-status-preparing');
        statusBadge.classList.add('kitchen-status-ready');
        statusBadge.textContent = 'Ready';
      }
      
      // Reset animations after a short delay
      setTimeout(() => {
        orderElement.classList.remove('animate-pulse');
        orderElement.style.transform = '';
      }, 300);
    }
    
    // Update the order status in the database
    updateOrderStatusMutation.mutate({ orderId, status: "ready" });
  };
  
  if (isLoadingLocations || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading kitchen display...</span>
      </div>
    );
  }

  if (!locationId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 p-4">
        <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-center">No Restaurant Location Found</h1>
        <p className="text-muted-foreground text-center mb-6">
          You need to set up a restaurant location before using the kitchen display system.
        </p>
        <Button asChild>
          <Link href="/merchant/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src="/sounds/bell.mp3" />
      
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-2 px-4">
        <div className="flex items-center justify-between flex-wrap kitchen-display-header">
          <div className="flex items-center space-x-4">
            <Link href="/merchant/pos/bistro">
              <Button variant="ghost" size="icon" className="bistro-touch-target h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">Kitchen Display</h1>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              BistroBeast
            </Badge>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              className="bistro-touch-target"
              onClick={() => refetchOrders()}
              disabled={isLoadingOrders}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingOrders ? "animate-spin" : ""}`} />
              <span className="ml-1">Refresh</span>
            </Button>
            <Select 
              value={viewMode} 
              onValueChange={setViewMode}
            >
              <SelectTrigger className="w-32 bistro-touch-target min-h-[44px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid" className="bistro-touch-target min-h-[44px]">Grid View</SelectItem>
                <SelectItem value="list" className="bistro-touch-target min-h-[44px]">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-4">
        {/* Tabs for filtering orders */}
        <Tabs defaultValue="all" value={visibleItems} onValueChange={setVisibleItems} className="mb-6 kitchen-tabs">
          <TabsList className="w-full flex justify-between sm:justify-start bistro-touch-target">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial py-3 bistro-touch-target">All Orders</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 sm:flex-initial py-3 bistro-touch-target">New</TabsTrigger>
            <TabsTrigger value="preparing" className="flex-1 sm:flex-initial py-3 bistro-touch-target">Preparing</TabsTrigger>
            <TabsTrigger value="ready" className="flex-1 sm:flex-initial py-3 bistro-touch-target">Ready</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoadingOrders ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-border shadow-sm p-8 text-center">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No Orders to Display</h2>
            <p className="text-muted-foreground mb-4">
              {visibleItems === "all" 
                ? "There are no active orders requiring kitchen attention at the moment." 
                : `There are no orders in the "${visibleItems}" status.`}
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="bistro-touch-target h-12 min-w-[120px]"
              onClick={() => refetchOrders()}
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              <span>Refresh</span>
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
          }>
            {filteredOrders.map((order: Order) => (
              <Card 
                key={order.id}
                id={`order-${order.id}`}
                className={`kitchen-order-card ${
                  order.status === "placed" 
                    ? "border-blue-300 bg-blue-50" 
                    : order.status === "preparing" 
                    ? "border-amber-300 bg-amber-50 kitchen-status-preparing" 
                    : "border-green-300 bg-green-50 kitchen-status-ready"
                } transition-all hover:shadow-md`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center text-lg">
                        {order.orderNumber}
                        {order.tableName && (
                          <Badge variant="outline" className="ml-2 bg-background">
                            {order.tableName}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock3 className="h-3 w-3 mr-1" />
                        {formatTimeAgo(order.createdAt)}
                        {order.serverName && (
                          <span className="ml-2">• Server: {order.serverName}</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge 
                      className={`bistro-touch-target px-3 py-1 ${
                        order.status === "placed" 
                          ? "kitchen-status-new" 
                          : order.status === "preparing" 
                          ? "kitchen-status-preparing" 
                          : "kitchen-status-ready"
                      }`}
                    >
                      {order.status === "placed" 
                        ? "New Order" 
                        : order.status === "preparing" 
                        ? "Preparing" 
                        : "Ready"
                      }
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`
                    space-y-2 
                    ${order.items.length > 3 ? "max-h-64 overflow-y-auto pr-2" : ""}
                  `}>
                    {order.items.map((item: OrderItem) => (
                      <div 
                        key={item.id}
                        id={`item-${order.id}-${item.id}`}
                        className={`
                          flex items-start justify-between bistro-order-item
                          ${item.status === "pending" 
                            ? "bg-white" 
                            : item.status === "preparing" 
                            ? "kitchen-status-preparing" 
                            : "kitchen-status-ready"
                          } 
                        `}
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {item.quantity}x {item.name}
                            </span>
                          </div>
                          {item.specialInstructions && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {item.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-[60px] text-xs kitchen-button-item-start bistro-touch-target"
                              onClick={() => handleItemStatusChange(order.id, item.id, "preparing")}
                            >
                              Start
                            </Button>
                          )}
                          {item.status === "preparing" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-[60px] text-xs kitchen-button-item-ready bistro-touch-target"
                              onClick={() => handleItemStatusChange(order.id, item.id, "ready")}
                            >
                              Ready
                            </Button>
                          )}
                          {item.status === "ready" && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {order.specialInstructions && (
                    <div className="mt-3 p-2 bg-background rounded border border-border">
                      <p className="text-xs font-medium mb-1">Special Instructions:</p>
                      <p className="text-xs">{order.specialInstructions}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  {order.status === "placed" ? (
                    <Button 
                      className="w-full kitchen-button-preparing h-10 bistro-touch-target"
                      onClick={() => handleStartCooking(order.id)}
                    >
                      <Timer className="h-4 w-4 mr-1" />
                      Start Preparing
                    </Button>
                  ) : order.status === "preparing" ? (
                    <Button 
                      className="w-full kitchen-button-ready h-10 bistro-touch-target" 
                      onClick={() => handleOrderReady(order.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Order Ready
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-10 bistro-touch-target kitchen-button-served"
                      variant="outline"
                      disabled
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Ready to Serve
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}