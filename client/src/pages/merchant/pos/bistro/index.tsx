import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftRight,
  Clock,
  Coffee,
  FileText,
  Users,
  Settings,
  ShoppingCart,
  Utensils,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function BistroBeastPOS() {
  const { user } = useAuth();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Mock data for demonstration
  const tables = [
    { id: 1, name: "Table 1", status: "available" },
    { id: 2, name: "Table 2", status: "occupied" },
    { id: 3, name: "Table 3", status: "reserved" },
    { id: 4, name: "Table 4", status: "available" },
    { id: 5, name: "Table 5", status: "available" },
    { id: 6, name: "Table 6", status: "occupied" },
    { id: 7, name: "Table 7", status: "occupied" },
    { id: 8, name: "Table 8", status: "available" },
  ];

  const categories = [
    { id: 1, name: "Appetizers", icon: <Coffee /> },
    { id: 2, name: "Main Courses", icon: <Utensils /> },
    { id: 3, name: "Desserts", icon: <Coffee /> },
    { id: 4, name: "Drinks", icon: <Coffee /> },
    { id: 5, name: "Specials", icon: <AlertTriangle /> },
  ];

  const menuItems = [
    { id: 1, name: "Garlic Bread", price: 4.99, category: 1 },
    { id: 2, name: "Calamari", price: 9.99, category: 1 },
    { id: 3, name: "Bruschetta", price: 6.99, category: 1 },
    { id: 4, name: "Mozzarella Sticks", price: 7.99, category: 1 },
    { id: 5, name: "Grilled Salmon", price: 18.99, category: 2 },
    { id: 6, name: "Ribeye Steak", price: 24.99, category: 2 },
    { id: 7, name: "Chicken Parmesan", price: 16.99, category: 2 },
    { id: 8, name: "Vegetable Pasta", price: 13.99, category: 2 },
    { id: 9, name: "Tiramisu", price: 7.99, category: 3 },
    { id: 10, name: "Cheesecake", price: 6.99, category: 3 },
    { id: 11, name: "Chocolate Lava Cake", price: 8.99, category: 3 },
    { id: 12, name: "Ice Cream Sundae", price: 5.99, category: 3 },
    { id: 13, name: "Soft Drink", price: 2.99, category: 4 },
    { id: 14, name: "Coffee", price: 3.49, category: 4 },
    { id: 15, name: "Iced Tea", price: 2.99, category: 4 },
    { id: 16, name: "Wine (Glass)", price: 8.99, category: 4 },
    { id: 17, name: "Chef's Special", price: 21.99, category: 5 },
    { id: 18, name: "Seasonal Soup", price: 6.99, category: 5 },
  ];

  // Filter menu items by category
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const filteredMenuItems = menuItems.filter(item => item.category === selectedCategory);

  // Add item to current order
  const addItemToOrder = (item: any) => {
    if (!activeOrderId) {
      // Create a new order if none is active
      setActiveOrderId("order-" + Date.now());
    }

    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(orderItem => orderItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedOrderItems = [...orderItems];
      updatedOrderItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedOrderItems);
    } else {
      // Add new item with quantity 1
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from current order
  const removeItemFromOrder = (itemId: number) => {
    const existingItemIndex = orderItems.findIndex(orderItem => orderItem.id === itemId);
    
    if (existingItemIndex >= 0) {
      const updatedOrderItems = [...orderItems];
      if (updatedOrderItems[existingItemIndex].quantity > 1) {
        // Decrease quantity if more than 1
        updatedOrderItems[existingItemIndex].quantity -= 1;
      } else {
        // Remove item if quantity is 1
        updatedOrderItems.splice(existingItemIndex, 1);
      }
      setOrderItems(updatedOrderItems);
    }
  };

  // Calculate total for current order
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Process payment
  const processPayment = () => {
    if (orderItems.length === 0) return;
    
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setOrderItems([]);
      setActiveOrderId(null);
      // In a real app, this would send data to the server
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Top navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">BistroBeast POS</h1>
            <div className="text-sm text-neutral-500">
              <span>Server: {user?.firstName} {user?.lastName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Clock In/Out
            </Button>
            <Link href="/blog/industry/restaurant">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Restaurant Tips
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-16 bg-primary flex flex-col items-center py-4 space-y-8">
          <Button variant="ghost" className="w-12 h-12 p-0 rounded-full flex items-center justify-center text-white">
            <ShoppingCart className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="w-12 h-12 p-0 rounded-full flex items-center justify-center text-white">
            <Utensils className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="w-12 h-12 p-0 rounded-full flex items-center justify-center text-white">
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="w-12 h-12 p-0 rounded-full flex items-center justify-center text-white">
            <FileText className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="w-12 h-12 p-0 rounded-full flex items-center justify-center text-white">
            <ArrowLeftRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Main POS interface */}
        <div className="flex-1 flex">
          {/* Left panel - Menu */}
          <div className="w-2/3 p-4 bg-white">
            <Tabs defaultValue="menu">
              <TabsList className="mb-4">
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="tables">Tables</TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="space-y-4">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      {category.icon}
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* Menu items */}
                <div className="grid grid-cols-3 gap-4">
                  {filteredMenuItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addItemToOrder(item)}
                    >
                      <CardContent className="p-4">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-neutral-500 mt-1">${item.price.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tables">
                <div className="grid grid-cols-4 gap-4">
                  {tables.map(table => (
                    <Card 
                      key={table.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        table.status === 'available' ? 'border-green-500' : 
                        table.status === 'occupied' ? 'border-red-500' : 'border-yellow-500'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="font-medium">{table.name}</div>
                        <div className="text-sm mt-1 capitalize">{table.status}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right panel - Current Order */}
          <div className="w-1/3 border-l border-neutral-200 bg-white flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Current Order</h2>
              {activeOrderId && <p className="text-sm text-neutral-500">Order #{activeOrderId.split('-')[1]}</p>}
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-auto p-4">
              {orderItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Add items to the order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-neutral-100">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-neutral-500">${item.price.toFixed(2)} x {item.quantity}</div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-4">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 h-8 w-8 p-0"
                          onClick={() => removeItemFromOrder(item.id)}
                        >
                          −
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="p-4 border-t">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Tax (8%)</span>
                  <span className="font-medium">${(calculateTotal() * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${(calculateTotal() * 1.08).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button variant="outline" disabled={orderItems.length === 0}>
                    Save Order
                  </Button>
                  <Button 
                    onClick={processPayment} 
                    disabled={orderItems.length === 0 || paymentProcessing}
                  >
                    {paymentProcessing ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}