import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftRight,
  BarChart,
  Boxes,
  ChevronDown,
  Download,
  Filter,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  Edit,
  Trash2,
  Tag,
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

// Mock data types
type Product = {
  id: number;
  name: string;
  barcode: string;
  sku: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  taxable: boolean;
  inStock: number;
  lowStockThreshold?: number;
  categoryId?: number;
  categoryName?: string;
  imageUrl?: string;
  tags?: string[];
  options?: { name: string; values: string[] }[];
  hasVariants: boolean;
  createdAt: string;
  updatedAt: string;
};

type Supplier = {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  status: "active" | "inactive";
}

type Category = {
  id: number;
  name: string;
  description?: string;
  productCount: number;
  parentId?: number;
}

type InventoryTransaction = {
  id: number;
  type: "stock_in" | "stock_out" | "adjustment" | "transfer" | "sale" | "return";
  productId: number;
  productName: string;
  quantity: number;
  reason?: string;
  notes?: string;
  supplierId?: number;
  supplierName?: string;
  createdAt: string;
  createdBy: string;
}

export default function RetailInventoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  
  // Mock data for demonstration
  const products: Product[] = [
    {
      id: 1,
      name: "Basic T-Shirt",
      barcode: "8901234567890",
      sku: "TSH-1001",
      price: 19.99,
      comparePrice: 24.99,
      cost: 8.50,
      taxable: true,
      inStock: 45,
      lowStockThreshold: 10,
      categoryId: 1,
      categoryName: "Clothing",
      imageUrl: "https://via.placeholder.com/50",
      tags: ["summer", "casual", "cotton"],
      options: [
        { name: "Size", values: ["S", "M", "L", "XL"] },
        { name: "Color", values: ["Black", "White", "Navy", "Gray"] }
      ],
      hasVariants: true,
      createdAt: "2023-04-15T09:12:34",
      updatedAt: "2023-06-20T14:23:45"
    },
    {
      id: 2,
      name: "Wireless Earbuds",
      barcode: "7891234567890",
      sku: "EAR-2001",
      price: 89.99,
      cost: 42.00,
      taxable: true,
      inStock: 18,
      lowStockThreshold: 5,
      categoryId: 2,
      categoryName: "Electronics",
      imageUrl: "https://via.placeholder.com/50",
      tags: ["audio", "bluetooth", "wireless"],
      hasVariants: false,
      createdAt: "2023-05-03T11:45:22",
      updatedAt: "2023-05-03T11:45:22"
    },
    {
      id: 3,
      name: "Ceramic Coffee Mug",
      barcode: "6789123456789",
      sku: "MUG-3001",
      price: 12.99,
      cost: 4.25,
      taxable: true,
      inStock: 32,
      categoryId: 3,
      categoryName: "Home Goods",
      imageUrl: "https://via.placeholder.com/50",
      tags: ["kitchenware", "ceramic", "dishwasher-safe"],
      hasVariants: false,
      createdAt: "2023-05-15T08:30:17",
      updatedAt: "2023-05-15T08:30:17"
    },
    {
      id: 4,
      name: "Facial Moisturizer",
      barcode: "5678912345678",
      sku: "SKIN-4001",
      price: 24.99,
      cost: 9.75,
      taxable: true,
      inStock: 15,
      lowStockThreshold: 3,
      categoryId: 4,
      categoryName: "Beauty",
      imageUrl: "https://via.placeholder.com/50",
      tags: ["skincare", "moisturizer", "face"],
      hasVariants: false,
      createdAt: "2023-06-02T16:12:44",
      updatedAt: "2023-06-02T16:12:44"
    },
    {
      id: 5,
      name: "Leather Wallet",
      barcode: "4567891234567",
      sku: "ACC-5001",
      price: 34.99,
      comparePrice: 39.99,
      cost: 17.50,
      taxable: true,
      inStock: 22,
      categoryId: 5,
      categoryName: "Accessories",
      imageUrl: "https://via.placeholder.com/50",
      tags: ["leather", "wallet", "accessories"],
      hasVariants: false,
      createdAt: "2023-06-10T09:25:33",
      updatedAt: "2023-06-10T09:25:33"
    },
    {
      id: 6,
      name: "Denim Jeans",
      barcode: "3456789123456",
      sku: "JNS-6001",
      price: 49.99,
      cost: 22.75,
      taxable: true,
      inStock: 2,
      lowStockThreshold: 5,
      categoryId: 1,
      categoryName: "Clothing",
      imageUrl: "https://via.placeholder.com/50",
      options: [
        { name: "Size", values: ["28", "30", "32", "34", "36"] },
        { name: "Style", values: ["Slim", "Regular", "Relaxed"] }
      ],
      hasVariants: true,
      createdAt: "2023-06-15T13:40:19",
      updatedAt: "2023-06-15T13:40:19"
    },
    {
      id: 7,
      name: "Smartphone Charger",
      barcode: "2345678912345",
      sku: "CHG-7001",
      price: 14.99,
      cost: 5.25,
      taxable: true,
      inStock: 0,
      lowStockThreshold: 8,
      categoryId: 2,
      categoryName: "Electronics",
      imageUrl: "https://via.placeholder.com/50",
      tags: ["smartphone", "charger", "accessories"],
      hasVariants: false,
      createdAt: "2023-06-20T10:15:51",
      updatedAt: "2023-06-20T10:15:51"
    },
  ];

  const categories: Category[] = [
    { id: 1, name: "Clothing", description: "Apparel and fashion items", productCount: 58 },
    { id: 2, name: "Electronics", description: "Electronic devices and accessories", productCount: 27 },
    { id: 3, name: "Home Goods", description: "Home decor and kitchen items", productCount: 42 },
    { id: 4, name: "Beauty", description: "Skincare, cosmetics, and beauty products", productCount: 34 },
    { id: 5, name: "Accessories", description: "Fashion accessories and add-ons", productCount: 19 },
    { id: 6, name: "Books", description: "Books and publications", productCount: 62 },
    { id: 7, name: "Toys", description: "Toys and games", productCount: 48 },
    { id: 8, name: "Sports", description: "Sports equipment and activewear", productCount: 39 },
  ];

  const suppliers: Supplier[] = [
    { id: 1, name: "GlobalSupply Co.", contactName: "John Smith", email: "contact@globalsupply.com", phone: "555-123-4567", status: "active" },
    { id: 2, name: "Fashion Wholesale Ltd.", contactName: "Emma Johnson", email: "emma@fashionwholesale.com", phone: "555-789-1234", status: "active" },
    { id: 3, name: "Tech Distributors", contactName: "David Chen", email: "david@techdist.com", phone: "555-456-7890", status: "active" },
    { id: 4, name: "Beauty Essentials", contactName: "Sarah Williams", email: "sarah@beautyessentials.com", phone: "555-321-6547", status: "inactive" },
    { id: 5, name: "HomeStyle Suppliers", contactName: "Michael Brown", email: "michael@homestylesuppliers.com", phone: "555-654-3210", status: "active" },
  ];

  const recentTransactions: InventoryTransaction[] = [
    { id: 101, type: "stock_in", productId: 2, productName: "Wireless Earbuds", quantity: 20, supplierId: 3, supplierName: "Tech Distributors", notes: "Regular order", createdAt: "2023-07-15T09:45:22", createdBy: "Jane Admin" },
    { id: 100, type: "sale", productId: 1, productName: "Basic T-Shirt", quantity: -2, createdAt: "2023-07-15T08:30:12", createdBy: "POS System" },
    { id: 99, type: "adjustment", productId: 5, productName: "Leather Wallet", quantity: -1, reason: "Damaged", notes: "Item returned by customer in damaged condition", createdAt: "2023-07-14T16:22:45", createdBy: "John Manager" },
    { id: 98, type: "stock_in", productId: 4, productName: "Facial Moisturizer", quantity: 12, supplierId: 4, supplierName: "Beauty Essentials", createdAt: "2023-07-14T11:05:33", createdBy: "Jane Admin" },
    { id: 97, type: "transfer", productId: 3, productName: "Ceramic Coffee Mug", quantity: -5, notes: "Transfer to downtown location", createdAt: "2023-07-13T14:48:19", createdBy: "John Manager" },
  ];

  // Filter products based on search query and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.trim() === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    
    const matchesCategory = categoryFilter === null || 
      (product.categoryName && product.categoryName === categoryFilter);
    
    const matchesStock = stockFilter === null || (
      (stockFilter === "in_stock" && product.inStock > 0) ||
      (stockFilter === "out_of_stock" && product.inStock === 0) ||
      (stockFilter === "low_stock" && product.lowStockThreshold !== undefined && product.inStock <= product.lowStockThreshold)
    );
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Top navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">PaySurity ECom Ready - Inventory Management</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Retail POS
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/merchant/pos/retail">
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
              <TabsTrigger value="products">
                <Package className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Boxes className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                <Truck className="h-4 w-4 mr-2" />
                Suppliers
              </TabsTrigger>
              <TabsTrigger value="history">
                <BarChart className="h-4 w-4 mr-2" />
                Stock History
              </TabsTrigger>
            </TabsList>
            <div>
              <Button className="mr-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-grow">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <Input
                      placeholder="Search products by name, SKU, or barcode..."
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
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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
                      <TableHead>Product</TableHead>
                      <TableHead>SKU / Barcode</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">In Stock</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center overflow-hidden">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                              ) : (
                                <Package className="h-5 w-5 text-neutral-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.hasVariants && (
                                <div className="text-xs text-neutral-500">Has variants</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{product.sku}</div>
                          <div className="text-xs text-neutral-500">{product.barcode}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>${product.price.toFixed(2)}</div>
                          {product.comparePrice && (
                            <div className="text-xs line-through text-neutral-500">
                              ${product.comparePrice.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.inStock === 0 ? (
                            <Badge variant="destructive">Out of stock</Badge>
                          ) : product.lowStockThreshold !== undefined && product.inStock <= product.lowStockThreshold ? (
                            <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Low: {product.inStock}
                            </Badge>
                          ) : (
                            <Badge variant="outline">{product.inStock}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.categoryName || "Uncategorized"}
                        </TableCell>
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
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Plus className="h-4 w-4 mr-2" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No products match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Stock alerts */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="flex items-center text-amber-800">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.filter(p => p.inStock === 0 || (p.lowStockThreshold !== undefined && p.inStock <= p.lowStockThreshold)).length === 0 ? (
                    <div className="text-center py-4 text-neutral-500">
                      <p>No stock alerts at this time.</p>
                    </div>
                  ) : (
                    products
                      .filter(p => p.inStock === 0 || (p.lowStockThreshold !== undefined && p.inStock <= p.lowStockThreshold))
                      .map(product => (
                        <div key={`alert-${product.id}`} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-10 rounded-l-md ${product.inStock === 0 ? 'bg-red-500' : 'bg-amber-500'}`} />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-neutral-500">SKU: {product.sku}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            {product.inStock === 0 ? (
                              <Badge variant="destructive">Out of stock</Badge>
                            ) : (
                              <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                Low: {product.inStock}/{product.lowStockThreshold}
                              </Badge>
                            )}
                          </div>
                          <Button size="sm">Order Stock</Button>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Products</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || "—"}</TableCell>
                        <TableCell className="text-right">{category.productCount}</TableCell>
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
                      <TableHead>Contact</TableHead>
                      <TableHead>Email/Phone</TableHead>
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
                          <div>{supplier.email}</div>
                          <div className="text-xs text-neutral-500">{supplier.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.status === "active" ? "outline" : "secondary"}>
                            {supplier.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
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

          {/* Stock History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inventory Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Source/Destination</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                          <div className="text-xs text-neutral-500">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.type === "stock_in" ? "outline" :
                              transaction.type === "sale" ? "secondary" :
                              transaction.type === "adjustment" ? "destructive" :
                              "default"
                            }
                          >
                            {transaction.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.productName}
                        </TableCell>
                        <TableCell className={`text-right ${transaction.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
                        </TableCell>
                        <TableCell>
                          {transaction.supplierName || transaction.reason || "—"}
                        </TableCell>
                        <TableCell>
                          {transaction.createdBy}
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