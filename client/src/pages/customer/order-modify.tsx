import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, calculateTotal } from "@/lib/utils";

type OrderModificationState = 
  | "loading" 
  | "modifying" 
  | "submitting" 
  | "completed" 
  | "error";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  modifiedQuantity?: number;
  modifiedNotes?: string;
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  notes?: string;
  modificationToken: string;
  modificationStartTime: string;
};

export default function OrderModifyPage() {
  const [, params] = useRoute("/order-modify/:token");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [state, setState] = useState<OrderModificationState>("loading");
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [modified, setModified] = useState(false);
  const [timer, setTimer] = useState<number>(900); // 15 minutes in seconds
  const [loading, setLoading] = useState(true);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer logic
  useEffect(() => {
    if (state !== "modifying") return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setState("error");
          toast({
            title: "Modification time expired",
            description: "Your order modification time has expired. The order may be cancelled automatically.",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state, toast]);
  
  useEffect(() => {
    if (!params?.token) {
      setState("error");
      toast({
        title: "Invalid token",
        description: "No modification token provided",
        variant: "destructive",
      });
      return;
    }
    
    const fetchOrder = async () => {
      try {
        const response = await apiRequest(
          "GET", 
          `/api/orders/${params.token}/modify`
        );
        
        if (!response.ok) {
          throw new Error("Failed to load order");
        }
        
        const data = await response.json();
        setOrder(data.order);
        
        // Initialize items with both original and modified values
        const initializedItems = data.items.map((item: OrderItem) => ({
          ...item,
          modifiedQuantity: item.quantity,
          modifiedNotes: item.notes || ""
        }));
        
        setItems(initializedItems);
        setState("modifying");
      } catch (error) {
        console.error("Error fetching order:", error);
        setState("error");
        toast({
          title: "Error",
          description: "Failed to load your order for modification",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [params?.token, toast]);
  
  const handleQuantityChange = (id: number, newQuantity: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, modifiedQuantity: newQuantity } 
          : item
      )
    );
    setModified(true);
  };
  
  const handleNotesChange = (id: number, notes: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, modifiedNotes: notes } 
          : item
      )
    );
    setModified(true);
  };
  
  const handleCompleteModification = async () => {
    try {
      setState("submitting");
      
      const response = await apiRequest(
        "POST",
        `/api/orders/${params?.token}/complete`,
        { wasModified: modified }
      );
      
      if (!response.ok) {
        throw new Error("Failed to complete order modification");
      }
      
      setState("completed");
      toast({
        title: "Success",
        description: "Your order has been updated successfully",
      });
    } catch (error) {
      console.error("Error completing modification:", error);
      setState("error");
      toast({
        title: "Error",
        description: "Failed to complete your order modification",
        variant: "destructive",
      });
    }
  };
  
  if (loading || state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h1 className="text-2xl font-bold">Loading your order...</h1>
        <p className="text-muted-foreground">Please wait while we retrieve your order details.</p>
      </div>
    );
  }
  
  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-muted-foreground text-center max-w-md">
          We couldn't load your order or the modification time has expired.
          If you're having issues, please contact the restaurant directly.
        </p>
        <Button 
          className="mt-6" 
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </div>
    );
  }
  
  if (state === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold">Order Updated</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Your order has been successfully {modified ? "modified" : "confirmed"}.
          The restaurant will prepare your order as requested.
        </p>
        <Button 
          className="mt-6" 
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </div>
    );
  }
  
  // Calculate modified total
  const originalTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const modifiedTotal = items.reduce((total, item) => {
    const quantity = item.modifiedQuantity !== undefined ? item.modifiedQuantity : item.quantity;
    return total + (item.price * quantity);
  }, 0);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Modify Your Order</CardTitle>
              <CardDescription>
                Order #{order?.orderNumber} • {order?.customerName}
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-sm font-medium flex items-center">
                Time remaining: {formatTime(timer)}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newQty = Math.max((item.modifiedQuantity || item.quantity) - 1, 0);
                          handleQuantityChange(item.id, newQty);
                        }}
                        disabled={state === "submitting"}
                      >
                        -
                      </Button>
                      
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="0"
                        className="w-16 h-8 text-center"
                        value={item.modifiedQuantity !== undefined ? item.modifiedQuantity : item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        disabled={state === "submitting"}
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newQty = (item.modifiedQuantity || item.quantity) + 1;
                          handleQuantityChange(item.id, newQty);
                        }}
                        disabled={state === "submitting"}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`notes-${item.id}`}>Special instructions</Label>
                  <Input
                    id={`notes-${item.id}`}
                    className="mt-1"
                    placeholder="e.g. No onions, extra sauce, etc."
                    value={item.modifiedNotes || ""}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    disabled={state === "submitting"}
                  />
                </div>
                
                {(item.quantity !== item.modifiedQuantity || 
                  (item.notes || "") !== (item.modifiedNotes || "")) && (
                  <div className="text-sm bg-blue-50 p-2 rounded text-blue-700">
                    <p className="font-medium">Item modified</p>
                    {item.quantity !== item.modifiedQuantity && (
                      <p>Quantity: {item.quantity} → {item.modifiedQuantity}</p>
                    )}
                    {(item.notes || "") !== (item.modifiedNotes || "") && (
                      <p>Notes changed</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <div>
                {modified && originalTotal !== modifiedTotal && (
                  <span className="text-muted-foreground line-through mr-2">
                    {formatCurrency(originalTotal)}
                  </span>
                )}
                <span className={modified && originalTotal !== modifiedTotal ? "text-primary font-bold" : ""}>
                  {formatCurrency(modifiedTotal)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {modified && (
            <div className="w-full bg-amber-50 p-3 rounded text-amber-800 text-sm">
              You've made changes to your order. Please confirm to update.
            </div>
          )}
          
          <div className="w-full flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              className="w-full"
              onClick={handleCompleteModification}
              disabled={state === "submitting"}
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : modified ? (
                "Confirm Changes"
              ) : (
                "Confirm Order (No Changes)"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
