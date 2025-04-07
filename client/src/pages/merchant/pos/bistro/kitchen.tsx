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
  
  // Handle item status update
  const handleItemStatusChange = (orderId: number, itemId: number, newStatus: string) => {
    updateOrderItemStatusMutation.mutate({ orderId, itemId, status: newStatus });
  };
  
  // Handle start cooking action
  const handleStartCooking = (orderId: number) => {
    updateOrderStatusMutation.mutate({ orderId, status: "preparing" });
  };
  
  // Handle order ready action
  const handleOrderReady = (orderId: number) => {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/merchant/pos/bistro">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">Kitchen Display</h1>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              BistroBeast
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchOrders()}
              disabled={isLoadingOrders}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingOrders ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Select 
              value={viewMode} 
              onValueChange={setViewMode}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-4">
        {/* Tabs for filtering orders */}
        <Tabs defaultValue="all" value={visibleItems} onValueChange={setVisibleItems} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">New</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready to Serve</TabsTrigger>
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
              onClick={() => refetchOrders()}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
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
                className={`${
                  order.status === "placed" 
                    ? "border-blue-300 bg-blue-50" 
                    : order.status === "preparing" 
                    ? "border-amber-300 bg-amber-50" 
                    : "border-green-300 bg-green-50"
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
                      className={`
                        ${order.status === "placed" 
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                          : order.status === "preparing" 
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                        }
                      `}
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
                        className={`
                          flex items-start justify-between p-2 rounded-md
                          ${item.status === "pending" 
                            ? "bg-white" 
                            : item.status === "preparing" 
                            ? "bg-amber-100" 
                            : "bg-green-100"
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
                              className="h-7 text-xs bg-background hover:bg-amber-100"
                              onClick={() => handleItemStatusChange(order.id, item.id, "preparing")}
                            >
                              Start
                            </Button>
                          )}
                          {item.status === "preparing" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-amber-100 hover:bg-green-100"
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
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => handleStartCooking(order.id)}
                    >
                      <Timer className="h-4 w-4 mr-1" />
                      Start Preparing
                    </Button>
                  ) : order.status === "preparing" ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={() => handleOrderReady(order.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Order Ready
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
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