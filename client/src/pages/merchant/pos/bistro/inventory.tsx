import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftRight,
  BarChart,
  ChevronDown,
  Clock,
  Coffee,
  Download,
  Edit,
  FileText,
  Filter,
  Package,
  Plus,
  Search,
  Settings,
  Trash2,
  Truck,
  Utensils,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data types
type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  minStockLevel: number;
  categoryId: number;
  categoryName: string;
  lastUpdated: string;
  expiryDate?: string;
  supplierId?: number;
  supplierName?: string;
};

type Category = {
  id: number;
  name: string;
  itemCount: number;
  description?: string;
};

type Supplier = {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive";
};

type InventoryTransaction = {
  id: number;
  date: string;
  itemId: number;
  itemName: string;
  type: "purchase" | "waste" | "usage" | "adjustment" | "transfer";
  quantity: number;
  unit: string;
  notes?: string;
  createdBy: string;
  cost?: number;
  supplierId?: number;
  supplierName?: string;
};

export default function RestaurantInventoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  // Mock data for demonstration
  const categories: Category[] = [
    { id: 1, name: "Proteins", itemCount: 12, description: "Meat, poultry, fish" },
    { id: 2, name: "Produce", itemCount: 18, description: "Fruits and vegetables" },
    { id: 3, name: "Dairy", itemCount: 8, description: "Milk, cheese, eggs" },
    { id: 4, name: "Dry Goods", itemCount: 15, description: "Pasta, rice, grains" },
    { id: 5, name: "Spices", itemCount: 22, description: "Herbs, spices, seasonings" },
    { id: 6, name: "Beverages", itemCount: 10, description: "Non-alcoholic drinks" },
    { id: 7, name: "Alcohol", itemCount: 14, description: "Wine, spirits, beer" },
    { id: 8, name: "Desserts", itemCount: 7, description: "Sweet ingredients" },
  ];

  const suppliers: Supplier[] = [
    { id: 1, name: "Farm Fresh Foods", contactName: "John Smith", email: "john@farmfresh.com", phone: "555-123-4567", status: "active" },
    { id: 2, name: "Premier Meats", contactName: "Sarah Johnson", email: "sarah@premiermeats.com", phone: "555-234-5678", status: "active" },
    { id: 3, name: "Vineyard Suppliers", contactName: "Robert Davis", email: "robert@vineyardsuppliers.com", phone: "555-345-6789", status: "active" },
    { id: 4, name: "Global Spice Traders", contactName: "Amanda Chen", email: "amanda@globalspice.com", phone: "555-456-7890", status: "inactive" },
    { id: 5, name: "Ocean Catch Seafood", contactName: "Michael Lee", email: "michael@oceancatch.com", phone: "555-567-8901", status: "active" },
  ];

  const inventoryItems: InventoryItem[] = [
    {
      id: 1,
      name: "Chicken Breast",
      sku: "PROT-001",
      currentStock: 18.5,
      unit: "kg",
      unitCost: 8.99,
      totalValue: 166.32,
      minStockLevel: 10,
      categoryId: 1,
      categoryName: "Proteins",
      lastUpdated: "2023-07-15",
      expiryDate: "2023-07-22",
      supplierId: 2,
      supplierName: "Premier Meats"
    },
    {
      id: 2,
      name: "Potatoes",
      sku: "PROD-001",
      currentStock: 45,
      unit: "kg",
      unitCost: 1.99,
      totalValue: 89.55,
      minStockLevel: 20,
      categoryId: 2,
      categoryName: "Produce",
      lastUpdated: "2023-07-14",
      expiryDate: "2023-08-01",
      supplierId: 1,
      supplierName: "Farm Fresh Foods"
    },
    {
      id: 3,
      name: "Whole Milk",
      sku: "DAIRY-001",
      currentStock: 24,
      unit: "L",
      unitCost: 2.49,
      totalValue: 59.76,
      minStockLevel: 12,
      categoryId: 3,
      categoryName: "Dairy",
      lastUpdated: "2023-07-15",
      expiryDate: "2023-07-20",
      supplierId: 1,
      supplierName: "Farm Fresh Foods"
    },
    {
      id: 4,
      name: "White Rice",
      sku: "DRY-001",
      currentStock: 40,
      unit: "kg",
      unitCost: 2.29,
      totalValue: 91.60,
      minStockLevel: 15,
      categoryId: 4,
      categoryName: "Dry Goods",
      lastUpdated: "2023-07-10",
      supplierId: 1,
      supplierName: "Farm Fresh Foods"
    },
    {
      id: 5,
      name: "Black Pepper",
      sku: "SPICE-001",
      currentStock: 3.2,
      unit: "kg",
      unitCost: 12.99,
      totalValue: 41.57,
      minStockLevel: 1,
      categoryId: 5,
      categoryName: "Spices",
      lastUpdated: "2023-07-12",
      supplierId: 4,
      supplierName: "Global Spice Traders"
    },
    {
      id: 6,
      name: "Organic Tomatoes",
      sku: "PROD-002",
      currentStock: 8.4,
      unit: "kg",
      unitCost: 3.99,
      totalValue: 33.52,
      minStockLevel: 5,
      categoryId: 2,
      categoryName: "Produce",
      lastUpdated: "2023-07-15",
      expiryDate: "2023-07-19",
      supplierId: 1,
      supplierName: "Farm Fresh Foods"
    },
    {
      id: 7,
      name: "Salmon Fillet",
      sku: "PROT-002",
      currentStock: 4.6,
      unit: "kg",
      unitCost: 22.99,
      totalValue: 105.75,
      minStockLevel: 3,
      categoryId: 1,
      categoryName: "Proteins",
      lastUpdated: "2023-07-15",
      expiryDate: "2023-07-18",
      supplierId: 5,
      supplierName: "Ocean Catch Seafood"
    },
    {
      id: 8,
      name: "Red Wine",
      sku: "ALC-001",
      currentStock: 18,
      unit: "bottle",
      unitCost: 14.99,
      totalValue: 269.82,
      minStockLevel: 10,
      categoryId: 7,
      categoryName: "Alcohol",
      lastUpdated: "2023-07-08",
      supplierId: 3,
      supplierName: "Vineyard Suppliers"
    },
    {
      id: 9,
      name: "Honey",
      sku: "SWEET-001",
      currentStock: 1.8,
      unit: "kg",
      unitCost: 8.99,
      totalValue: 16.18,
      minStockLevel: 2,
      categoryId: 8,
      categoryName: "Desserts",
      lastUpdated: "2023-07-13",
      supplierId: 1,
      supplierName: "Farm Fresh Foods"
    }
  ];

  const transactions: InventoryTransaction[] = [
    {
      id: 1001,
      date: "2023-07-15",
      itemId: 1,
      itemName: "Chicken Breast",
      type: "purchase",
      quantity: 10,
      unit: "kg",
      notes: "Weekly order",
      createdBy: "John Manager",
      cost: 89.90,
      supplierId: 2,
      supplierName: "Premier Meats"
    },
    {
      id: 1002,
      date: "2023-07-15",
      itemId: 7,
      itemName: "Salmon Fillet",
      type: "purchase",
      quantity: 5,
      unit: "kg",
      createdBy: "John Manager",
      cost: 114.95,
      supplierId: 5,
      supplierName: "Ocean Catch Seafood"
    },
    {
      id: 1003,
      date: "2023-07-14",
      itemId: 6,
      itemName: "Organic Tomatoes",
      type: "waste",
      quantity: 1.2,
      unit: "kg",
      notes: "Spoiled",
      createdBy: "Maria Chef"
    },
    {
      id: 1004,
      date: "2023-07-14",
      itemId: 3,
      itemName: "Whole Milk",
      type: "usage",
      quantity: 4,
      unit: "L",
      notes: "Used for sauce preparation",
      createdBy: "Maria Chef"
    },
    {
      id: 1005,
      date: "2023-07-14",
      itemId: 5,
      itemName: "Black Pepper",
      type: "adjustment",
      quantity: 0.3,
      unit: "kg",
      notes: "Inventory correction",
      createdBy: "John Manager"
    }
  ];

  // Filter inventory items based on search query and filters
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = searchQuery.trim() === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === null || 
      item.categoryName === categoryFilter;
    
    const matchesStock = stockFilter === null || (
      (stockFilter === "normal" && item.currentStock > item.minStockLevel) ||
      (stockFilter === "low" && item.currentStock <= item.minStockLevel && item.currentStock > 0) ||
      (stockFilter === "out" && item.currentStock === 0)
    );
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get low stock items
  const lowStockItems = inventoryItems.filter(
    item => item.currentStock <= item.minStockLevel
  );

  // Get expiring soon items (within 3 days)
  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  
  const expiringSoonItems = inventoryItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    return expiryDate <= threeDaysLater && expiryDate >= today;
  });

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Top navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">BistroBeast - Inventory Management</h1>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Restaurant Management
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/merchant/pos/bistro">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Back to POS
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto p-4 md:p-6 flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="inventory">
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Coffee className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                <Truck className="h-4 w-4 mr-2" />
                Suppliers
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <BarChart className="h-4 w-4 mr-2" />
                Transactions
              </TabsTrigger>
            </TabsList>
            <div>
              <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                <DialogTrigger asChild>
                  <Button className="mr-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new inventory item.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Form fields would go here in a real implementation */}
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input placeholder="Item name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">SKU</label>
                        <Input placeholder="SKU" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Current Stock</label>
                        <Input type="number" min="0" step="0.1" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Unit</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="g">Gram (g)</SelectItem>
                            <SelectItem value="L">Liter (L)</SelectItem>
                            <SelectItem value="ml">Milliliter (ml)</SelectItem>
                            <SelectItem value="unit">Unit</SelectItem>
                            <SelectItem value="bottle">Bottle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Unit Cost ($)</label>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Min Stock Level</label>
                        <Input type="number" min="0" step="0.1" placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Supplier</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expiry Date</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>Cancel</Button>
                    <Button onClick={() => setShowAddItemDialog(false)}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-grow">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <Input
                      placeholder="Search inventory by name or SKU..."
                      className="pl-9 max-w-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={categoryFilter || ""}
                      onValueChange={(value) => setCategoryFilter(value === "" ? null : value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={stockFilter || ""}
                      onValueChange={(value) => setStockFilter(value === "" ? null : value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Stock Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Stock Levels</SelectItem>
                        <SelectItem value="normal">Normal Stock</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                          {item.expiryDate && new Date(item.expiryDate) <= threeDaysLater && (
                            <Badge variant="destructive" className="ml-2">Expires soon</Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center">
                            <span className={
                              item.currentStock === 0 ? "text-red-600" :
                              item.currentStock <= item.minStockLevel ? "text-amber-600" :
                              "text-green-600"
                            }>
                              {item.currentStock} {item.unit}
                            </span>
                            {item.currentStock <= item.minStockLevel && item.currentStock > 0 && (
                              <AlertTriangle className="h-4 w-4 ml-1 text-amber-500" />
                            )}
                            {item.currentStock === 0 && (
                              <AlertTriangle className="h-4 w-4 ml-1 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.unitCost.toFixed(2)}/{item.unit}</TableCell>
                        <TableCell className="text-right">${item.totalValue.toFixed(2)}</TableCell>
                        <TableCell>{item.categoryName}</TableCell>
                        <TableCell>{item.supplierName || "—"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ArrowLeftRight className="h-4 w-4 mr-2" />
                                Record Usage
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No inventory items match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Alerts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Low Stock Alerts */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center text-amber-700">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-4 text-neutral-500">All items have sufficient stock levels.</div>
                  ) : (
                    <div className="space-y-3">
                      {lowStockItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-neutral-500">{item.sku} | {item.categoryName}</div>
                          </div>
                          <div className="text-amber-600 font-medium">
                            {item.currentStock} / {item.minStockLevel} {item.unit}
                          </div>
                          <Button size="sm">Order</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Soon Alerts */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center text-red-700">
                    <Clock className="h-5 w-5 mr-2 text-red-500" />
                    Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expiringSoonItems.length === 0 ? (
                    <div className="text-center py-4 text-neutral-500">No items expiring in the next 3 days.</div>
                  ) : (
                    <div className="space-y-3">
                      {expiringSoonItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-neutral-500">{item.sku} | {item.categoryName}</div>
                          </div>
                          <div className="text-red-600 font-medium">
                            Expires: {new Date(item.expiryDate!).toLocaleDateString()}
                          </div>
                          <Button size="sm" variant="outline">Mark Used</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || "—"}</TableCell>
                        <TableCell className="text-right">{category.itemCount}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map(supplier => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.contactName || "—"}</TableCell>
                        <TableCell>
                          {supplier.email && <div>{supplier.email}</div>}
                          {supplier.phone && <div className="text-sm text-neutral-500">{supplier.phone}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.status === "active" ? "outline" : "secondary"}>
                            {supplier.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.type === "purchase" ? "outline" :
                              transaction.type === "usage" ? "secondary" :
                              transaction.type === "waste" ? "destructive" :
                              "default"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.itemName}</TableCell>
                        <TableCell className="text-right">
                          {transaction.quantity} {transaction.unit}
                          {transaction.cost && (
                            <div className="text-xs text-neutral-500">
                              ${transaction.cost.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.notes || "—"}
                          {transaction.supplierName && (
                            <div className="text-xs text-neutral-500">
                              From: {transaction.supplierName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{transaction.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}