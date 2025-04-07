import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutGrid,
  Plus,
  Search,
  User,
  Clock,
  Utensils,
  Coffee,
  Pizza,
  Beef,
  Soup,
  Wine,
  LucideIceCream2,
  Package,
  ArrowLeftRight,
  Printer,
  Trash,
  CreditCard,
  Banknote,
  Users,
  Settings,
  CalendarDays,
  ChefHat,
  Loader2,
  Save,
} from "lucide-react";

// Define order types
type OrderItem = {
  id: string;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  modifiers?: { id: number; name: string; price: number }[];
  specialInstructions?: string;
  status: "pending" | "preparing" | "ready" | "served";
  subtotal: number;
};

type Order = {
  id: string;
  tableId: number;
  tableName: string;
  status: "open" | "paid" | "void";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  server: string;
  customer?: string;
  guestCount: number;
};

export default function BistroBeastPOS() {
  const authData = useAuth();
  // Enhance user object with needed properties
  const user = authData.user ? {
    ...authData.user,
    name: authData.user.firstName + ' ' + authData.user.lastName,
    avatarUrl: authData.user.avatar || null
  } : null;
  const [activeTab, setActiveTab] = useState("tables");
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [tableSearchFilter, setTableSearchFilter] = useState("");
  const [menuSearchFilter, setMenuSearchFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  
  // Sample data for demonstration
  const tables = [
    { id: 1, name: "Table 1", status: "available", seats: 4, shape: "round" },
    { id: 2, name: "Table 2", status: "seated", seats: 2, shape: "square", order: { id: "ORD-001", guestCount: 2, startTime: "5:30 PM" } },
    { id: 3, name: "Table 3", status: "available", seats: 6, shape: "rect" },
    { id: 4, name: "Table 4", status: "available", seats: 4, shape: "round" },
    { id: 5, name: "Bar 1", status: "seated", seats: 2, shape: "bar", order: { id: "ORD-002", guestCount: 1, startTime: "6:15 PM" } },
    { id: 6, name: "Bar 2", status: "available", seats: 2, shape: "bar" },
    { id: 7, name: "Bar 3", status: "available", seats: 2, shape: "bar" },
    { id: 8, name: "Table 5", status: "available", seats: 8, shape: "rect" },
    { id: 9, name: "Table 6", status: "seated", seats: 4, shape: "round", order: { id: "ORD-003", guestCount: 3, startTime: "7:00 PM" } },
    { id: 10, name: "Table 7", status: "available", seats: 2, shape: "square" },
    { id: 11, name: "Table 8", status: "available", seats: 6, shape: "rect" },
    { id: 12, name: "Table 9", status: "available", seats: 4, shape: "round" },
  ];

  const menuCategories = [
    { id: 1, name: "Appetizers", icon: <Soup size={20} /> },
    { id: 2, name: "Main Courses", icon: <Utensils size={20} /> },
    { id: 3, name: "Pizzas", icon: <Pizza size={20} /> },
    { id: 4, name: "Steaks", icon: <Beef size={20} /> },
    { id: 5, name: "Beverages", icon: <Coffee size={20} /> },
    { id: 6, name: "Desserts", icon: <LucideIceCream2 size={20} /> },
    { id: 7, name: "Wine & Beer", icon: <Wine size={20} /> },
  ];

  const menuItems = [
    { id: 1, categoryId: 1, name: "Spinach Artichoke Dip", price: 9.99, popular: true },
    { id: 2, categoryId: 1, name: "Fried Calamari", price: 11.99 },
    { id: 3, categoryId: 1, name: "Buffalo Wings", price: 12.99, popular: true },
    { id: 4, categoryId: 1, name: "Bruschetta", price: 8.99 },
    { id: 5, categoryId: 2, name: "Grilled Salmon", price: 21.99, popular: true },
    { id: 6, categoryId: 2, name: "Chicken Alfredo", price: 17.99, popular: true },
    { id: 7, categoryId: 2, name: "Vegetable Stir Fry", price: 15.99 },
    { id: 8, categoryId: 2, name: "Eggplant Parmesan", price: 16.99 },
    { id: 9, categoryId: 3, name: "Margherita Pizza", price: 14.99, popular: true },
    { id: 10, categoryId: 3, name: "Pepperoni Pizza", price: 15.99, popular: true },
    { id: 11, categoryId: 3, name: "Vegetarian Pizza", price: 15.99 },
    { id: 12, categoryId: 3, name: "BBQ Chicken Pizza", price: 16.99 },
    { id: 13, categoryId: 4, name: "Filet Mignon", price: 29.99, popular: true },
    { id: 14, categoryId: 4, name: "Ribeye Steak", price: 27.99 },
    { id: 15, categoryId: 4, name: "NY Strip Steak", price: 25.99 },
    { id: 16, categoryId: 5, name: "Iced Tea", price: 2.99 },
    { id: 17, categoryId: 5, name: "Soft Drinks", price: 2.99 },
    { id: 18, categoryId: 5, name: "Coffee", price: 3.50 },
    { id: 19, categoryId: 6, name: "Chocolate Lava Cake", price: 7.99, popular: true },
    { id: 20, categoryId: 6, name: "Cheesecake", price: 6.99 },
    { id: 21, categoryId: 7, name: "House Red Wine", price: 8.99 },
    { id: 22, categoryId: 7, name: "Craft Beer", price: 6.99 },
  ];

  // Filter tables based on search query
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(tableSearchFilter.toLowerCase())
  );

  // Filter menu items based on selected category and search
  const filteredMenuItems = menuItems.filter(item => 
    (selectedCategory === null || item.categoryId === parseInt(selectedCategory)) &&
    item.name.toLowerCase().includes(menuSearchFilter.toLowerCase())
  );

  // Function to add items to the current order
  const addItemToOrder = (menuItem: any) => {
    if (!currentOrder) return;
    
    // Check if item already exists in order
    const existingItemIndex = currentOrder.items.findIndex(item => item.menuItemId === menuItem.id);
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const updatedItems = [...currentOrder.items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      
      const updatedOrder = {...currentOrder, items: updatedItems};
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.0825; // 8.25% tax rate
      
      setCurrentOrder({
        ...updatedOrder,
        subtotal,
        tax,
        total: subtotal + tax
      });
    } else {
      // Add new item to order
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        status: "pending",
        subtotal: menuItem.price
      };
      
      const updatedItems = [...currentOrder.items, newItem];
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.0825; // 8.25% tax rate
      
      setCurrentOrder({
        ...currentOrder,
        items: updatedItems,
        subtotal,
        tax,
        total: subtotal + tax
      });
    }
  };

  // Function to remove item from the current order
  const removeItemFromOrder = (itemId: string) => {
    if (!currentOrder) return;
    
    const updatedItems = currentOrder.items.filter(item => item.id !== itemId);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.0825; // 8.25% tax rate
    
    setCurrentOrder({
      ...currentOrder,
      items: updatedItems,
      subtotal,
      tax,
      total: subtotal + tax
    });
  };

  // Function to update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!currentOrder || quantity < 1) return;
    
    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          subtotal: quantity * item.price
        };
      }
      return item;
    });
    
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.0825; // 8.25% tax rate
    
    setCurrentOrder({
      ...currentOrder,
      items: updatedItems,
      subtotal,
      tax,
      total: subtotal + tax
    });
  };

  // Function to open a table and create a new order or load existing one
  const openTable = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    setActiveTable(tableId);
    
    // Check if table has an existing order
    if (table.status === "seated" && table.order) {
      // For this demo, we'd load the order from API in reality
      setCurrentOrder({
        id: table.order.id,
        tableId: table.id,
        tableName: table.name,
        status: "open",
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        createdAt: new Date(),
        server: user?.name || "Server",
        guestCount: table.order.guestCount,
      });
    } else {
      // Create new order for this table
      setCurrentOrder({
        id: `ORD-${Date.now()}`,
        tableId: table.id,
        tableName: table.name,
        status: "open",
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        createdAt: new Date(),
        server: user?.name || "Server",
        guestCount: 1,
      });
    }
    
    // Switch to menu tab for ordering
    setActiveTab("menu");
  };

  // Function to handle saving the order
  const saveOrder = () => {
    if (!currentOrder) return;
    
    setIsSavingOrder(true);
    
    // Simulate an API call/delay
    setTimeout(() => {
      setIsSavingOrder(false);
      // In a real app, we would save to API here
      setActiveTab("tables");
      setCurrentOrder(null);
      setActiveTable(null);
    }, 1000);
  };

  // Function to handle payment process
  const processPayment = (paymentType: string) => {
    setIsSavingOrder(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsSavingOrder(false);
      setShowPayDialog(false);
      setActiveTab("tables");
      setCurrentOrder(null);
      setActiveTable(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Top Bar */}
      <header className="bg-white border-b shadow-sm py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/merchant/dashboard">
              <Button variant="ghost" size="icon">
                <ChefHat className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">BistroBeast</h1>
            <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
              Restaurant POS
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/merchant/pos/bistro/inventory">
                <Package className="h-4 w-4 mr-1" />
                Inventory
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="sm:hidden">
              <Link href="/merchant/pos/bistro/inventory">
                <Package className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Users className="h-4 w-4 mr-1" />
              Staff
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <CalendarDays className="h-4 w-4 mr-1" />
              Reservations
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left sidebar - tables/menu navigation */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 m-2">
              <TabsTrigger value="tables">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Tables
              </TabsTrigger>
              <TabsTrigger value="menu">
                <Utensils className="h-4 w-4 mr-2" />
                Menu
              </TabsTrigger>
            </TabsList>
            
            <div className="p-2">
              <Input 
                placeholder={activeTab === "tables" ? "Search tables..." : "Search menu..."}
                className="mb-2" 
                value={activeTab === "tables" ? tableSearchFilter : menuSearchFilter}
                onChange={(e) => {
                  if (activeTab === "tables") {
                    setTableSearchFilter(e.target.value);
                  } else {
                    setMenuSearchFilter(e.target.value);
                  }
                }}
              />
            </div>
            
            <ScrollArea className="flex-1">
              <TabsContent value="tables" className="h-full flex flex-col p-0 m-0">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {filteredTables.map((table) => (
                    <Card 
                      key={table.id} 
                      onClick={() => openTable(table.id)} 
                      className={`cursor-pointer transition-colors ${
                        table.status === "seated" 
                          ? "border-orange-300 bg-orange-50" 
                          : "hover:bg-neutral-50"
                      } ${activeTable === table.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <CardContent className="p-3 text-center flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          table.status === "seated" 
                            ? "bg-orange-100 text-orange-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {table.seats}
                        </div>
                        <div className="font-medium text-sm">{table.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {table.status === "seated" 
                            ? <span className="text-orange-600 font-medium">Seated</span> 
                            : "Available"}
                        </div>
                        {table.status === "seated" && table.order && (
                          <div className="mt-1 text-xs flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {table.order.startTime}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="menu" className="h-full flex flex-col p-0 m-0">
                {/* Menu categories */}
                <div className="flex-none overflow-x-auto">
                  <div className="flex flex-wrap p-2 gap-2">
                    <Button 
                      variant={selectedCategory === null ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Items
                    </Button>
                    {menuCategories.map((category) => (
                      <Button 
                        key={category.id}
                        variant={selectedCategory === category.id.toString() ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedCategory(category.id.toString())}
                        className="flex items-center gap-1"
                      >
                        {category.icon}
                        <span>{category.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Menu items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {filteredMenuItems.map((item) => (
                    <Card 
                      key={item.id} 
                      onClick={() => addItemToOrder(item)} 
                      className="cursor-pointer hover:bg-neutral-50"
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-sm font-bold mt-1">${item.price.toFixed(2)}</div>
                          {item.popular && (
                            <Badge className="w-fit mt-1 text-xs" variant="secondary">Popular</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
        
        {/* Main area - order details */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Order header */}
          <div className="p-4 border-b">
            {currentOrder ? (
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">{currentOrder.tableName}</h2>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    <span className="mr-3">Guests: {currentOrder.guestCount}</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {currentOrder.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("tables")} className="hidden sm:flex">
                    <ArrowLeftRight className="h-4 w-4 mr-1" />
                    Change Table
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setActiveTab("tables")} className="sm:hidden">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" size="icon" className="sm:hidden">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-muted-foreground">
                Select a table to start an order
              </div>
            )}
          </div>
          
          {/* Order items */}
          {currentOrder ? (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {currentOrder.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No items in this order yet.</p>
                    <p className="text-sm">Select items from the menu to add them to this order.</p>
                  </div>
                ) : (
                  currentOrder.items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="flex items-center p-3">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium">{item.name}</div>
                            <div className="font-bold">${item.subtotal.toFixed(2)}</div>
                          </div>
                          <div className="flex flex-wrap items-center mt-2 gap-2">
                            <div className="flex items-center">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="mx-3">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} each
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-auto"
                              onClick={() => removeItemFromOrder(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg">No table selected</p>
                <p className="text-sm">Select a table from the left panel to manage orders.</p>
              </div>
            </div>
          )}
          
          {/* Order footer with totals */}
          {currentOrder && (
            <div className="border-t p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8.25%)</span>
                  <span>${currentOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={saveOrder}
                  disabled={isSavingOrder || currentOrder.items.length === 0}
                >
                  {isSavingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Order
                    </>
                  )}
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => setShowPayDialog(true)}
                  disabled={currentOrder.items.length === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Select a payment method to complete this order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${currentOrder?.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8.25%)</span>
                <span>${currentOrder?.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${currentOrder?.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button onClick={() => processPayment("credit")} className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Credit Card</span>
              </Button>
              <Button onClick={() => processPayment("cash")} variant="outline" className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Cash</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setShowPayDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}