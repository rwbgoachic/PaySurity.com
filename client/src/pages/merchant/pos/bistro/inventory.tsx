import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowLeftRight,
  AlertTriangle,
  Truck,
  RefreshCw,
  ShoppingBag,
  Check,
  X,
} from "lucide-react";

export default function BistroBeastInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    unit: "ea",
    price: "",
    cost: "",
    stock: "",
    lowThreshold: "",
  });

  // Mock inventory data
  const inventoryItems = [
    { id: 1, name: "Beef - Ground", category: "Meat", unit: "lb", price: 5.99, cost: 3.50, stock: 45, lowThreshold: 10, status: "ok" },
    { id: 2, name: "Chicken - Breast", category: "Meat", unit: "lb", price: 4.99, cost: 2.75, stock: 32, lowThreshold: 15, status: "ok" },
    { id: 3, name: "Tomatoes", category: "Produce", unit: "lb", price: 2.99, cost: 1.20, stock: 18, lowThreshold: 10, status: "ok" },
    { id: 4, name: "Lettuce - Iceberg", category: "Produce", unit: "ea", price: 1.99, cost: 0.89, stock: 12, lowThreshold: 5, status: "ok" },
    { id: 5, name: "Potatoes - Russet", category: "Produce", unit: "lb", price: 1.49, cost: 0.59, stock: 50, lowThreshold: 15, status: "ok" },
    { id: 6, name: "Flour - All Purpose", category: "Dry Goods", unit: "lb", price: 0.79, cost: 0.35, stock: 24, lowThreshold: 10, status: "ok" },
    { id: 7, name: "Sugar - Granulated", category: "Dry Goods", unit: "lb", price: 0.89, cost: 0.42, stock: 18, lowThreshold: 8, status: "ok" },
    { id: 8, name: "Olive Oil", category: "Oils", unit: "oz", price: 0.50, cost: 0.28, stock: 64, lowThreshold: 20, status: "ok" },
    { id: 9, name: "Salt - Kosher", category: "Spices", unit: "oz", price: 0.15, cost: 0.07, stock: 32, lowThreshold: 10, status: "ok" },
    { id: 10, name: "Pepper - Black", category: "Spices", unit: "oz", price: 0.25, cost: 0.12, stock: 24, lowThreshold: 8, status: "ok" },
    { id: 11, name: "Garlic", category: "Produce", unit: "oz", price: 0.30, cost: 0.15, stock: 36, lowThreshold: 12, status: "ok" },
    { id: 12, name: "Wine - Red", category: "Beverages", unit: "bottle", price: 12.99, cost: 7.50, stock: 8, lowThreshold: 5, status: "ok" },
    { id: 13, name: "Wine - White", category: "Beverages", unit: "bottle", price: 11.99, cost: 6.75, stock: 6, lowThreshold: 5, status: "ok" },
    { id: 14, name: "Beer - Craft IPA", category: "Beverages", unit: "bottle", price: 5.99, cost: 3.25, stock: 24, lowThreshold: 12, status: "ok" },
    { id: 15, name: "Cheese - Mozzarella", category: "Dairy", unit: "lb", price: 4.99, cost: 2.75, stock: 10, lowThreshold: 5, status: "ok" },
    { id: 16, name: "Cheese - Parmesan", category: "Dairy", unit: "oz", price: 0.75, cost: 0.45, stock: 24, lowThreshold: 8, status: "low" },
    { id: 17, name: "Milk", category: "Dairy", unit: "gal", price: 3.49, cost: 2.10, stock: 3, lowThreshold: 4, status: "low" },
    { id: 18, name: "Eggs", category: "Dairy", unit: "dozen", price: 2.99, cost: 1.75, stock: 8, lowThreshold: 5, status: "ok" },
    { id: 19, name: "Bacon", category: "Meat", unit: "lb", price: 6.99, cost: 4.25, stock: 12, lowThreshold: 6, status: "ok" },
    { id: 20, name: "Onions - Yellow", category: "Produce", unit: "lb", price: 1.29, cost: 0.60, stock: 1, lowThreshold: 5, status: "critical" },
  ];

  // Filter items based on search term
  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    // This would typically make an API call to add the item
    console.log("Adding new item:", newItem);
    setShowAddItemDialog(false);
    // Reset form
    setNewItem({
      name: "",
      category: "",
      unit: "ea",
      price: "",
      cost: "",
      stock: "",
      lowThreshold: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800">Low</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge className="bg-neutral-100 text-neutral-800">Unknown</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Top navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">BistroBeast Inventory</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Back to POS
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Inventory Management</h2>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your inventory. All fields are required.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g., Tomatoes" 
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input 
                          id="category" 
                          placeholder="e.g., Produce" 
                          value={newItem.category}
                          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select
                          value={newItem.unit}
                          onValueChange={(value) => setNewItem({...newItem, unit: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ea">Each</SelectItem>
                            <SelectItem value="lb">Pound</SelectItem>
                            <SelectItem value="oz">Ounce</SelectItem>
                            <SelectItem value="gal">Gallon</SelectItem>
                            <SelectItem value="bottle">Bottle</SelectItem>
                            <SelectItem value="dozen">Dozen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Sale Price ($)</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00" 
                          value={newItem.price}
                          onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cost">Cost ($)</Label>
                        <Input 
                          id="cost" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00" 
                          value={newItem.cost}
                          onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Current Stock</Label>
                        <Input 
                          id="stock" 
                          type="number" 
                          min="0" 
                          placeholder="0" 
                          value={newItem.stock}
                          onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowThreshold">Low Stock Threshold</Label>
                      <Input 
                        id="lowThreshold" 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        value={newItem.lowThreshold}
                        onChange={(e) => setNewItem({...newItem, lowThreshold: e.target.value})}
                      />
                      <p className="text-sm text-neutral-500">
                        You'll be alerted when stock falls below this level
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-4 w-1/2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-order" />
                <Label htmlFor="auto-order">Auto order when low</Label>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Stock
              </Button>
              <Button variant="outline" size="sm">
                <Truck className="h-4 w-4 mr-2" />
                Place Order
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="low">
                Low Stock <Badge className="ml-2 bg-yellow-100 text-yellow-800">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical <Badge className="ml-2 bg-red-100 text-red-800">1</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.stock}</TableCell>
                          <TableCell className="text-right">{item.lowThreshold}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ShoppingBag className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowLeftRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="low">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.filter(item => item.status === 'low').map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{item.stock}</TableCell>
                          <TableCell className="text-right">{item.lowThreshold}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Truck className="h-4 w-4 mr-2" />
                              Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="critical">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.filter(item => item.status === 'critical').map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{item.stock}</TableCell>
                          <TableCell className="text-right">{item.lowThreshold}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <Button size="sm">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Urgent Order
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
    </div>
  );
}