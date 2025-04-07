import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftRight,
  BarChart,
  Boxes,
  CreditCard,
  DollarSign,
  Gift,
  LayoutGrid,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import type definitions as we develop them
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
  variants?: ProductVariant[];
};

type ProductVariant = {
  id: number;
  productId: number;
  title: string;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  inStock: number;
  options: { name: string; value: string }[];
  imageUrl?: string;
};

type CartItem = {
  id: string;
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  quantity: number;
  options?: { name: string; value: string }[];
  notes?: string;
  discountAmount?: number;
  subtotal: number;
};

export default function RetailPOSSystem() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data for demonstration
  const categories = [
    { id: 1, name: "Clothing" },
    { id: 2, name: "Electronics" },
    { id: 3, name: "Home Goods" },
    { id: 4, name: "Beauty" },
    { id: 5, name: "Accessories" },
    { id: 6, name: "Books" },
    { id: 7, name: "Toys" },
    { id: 8, name: "Sports" },
  ];

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
      imageUrl: "https://via.placeholder.com/100",
      tags: ["summer", "casual", "cotton"],
      options: [
        { name: "Size", values: ["S", "M", "L", "XL"] },
        { name: "Color", values: ["Black", "White", "Navy", "Gray"] }
      ],
      variants: [
        {
          id: 101,
          productId: 1,
          title: "Small / Black",
          sku: "TSH-1001-S-BLK",
          price: 19.99,
          inStock: 12,
          options: [
            { name: "Size", value: "S" },
            { name: "Color", value: "Black" }
          ]
        },
        {
          id: 102,
          productId: 1,
          title: "Medium / Black",
          sku: "TSH-1001-M-BLK",
          price: 19.99,
          inStock: 8,
          options: [
            { name: "Size", value: "M" },
            { name: "Color", value: "Black" }
          ]
        },
        // Additional variants would be here
      ]
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
      imageUrl: "https://via.placeholder.com/100",
      tags: ["audio", "bluetooth", "wireless"]
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
      imageUrl: "https://via.placeholder.com/100",
      tags: ["kitchenware", "ceramic", "dishwasher-safe"]
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
      imageUrl: "https://via.placeholder.com/100",
      tags: ["skincare", "moisturizer", "face"]
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
      imageUrl: "https://via.placeholder.com/100",
      tags: ["leather", "wallet", "accessories"]
    },
  ];

  // Filter products based on search query and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.trim() === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    
    const matchesCategory = selectedCategory === null || 
      (product.categoryName && product.categoryName === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Add item to cart
  const addToCart = (product: Product) => {
    const existingItemIndex = cart.findIndex(item => item.productId === product.id && !item.variantId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already in cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].price;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        id: `${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  // Add variant to cart
  const addVariantToCart = (product: Product, variant: ProductVariant) => {
    const existingItemIndex = cart.findIndex(item => 
      item.productId === product.id && item.variantId === variant.id
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if variant already in cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].price;
      setCart(updatedCart);
    } else {
      // Add new variant to cart
      const newItem: CartItem = {
        id: `${Date.now()}`,
        productId: product.id,
        variantId: variant.id,
        name: `${product.name} - ${variant.title}`,
        price: variant.price,
        quantity: 1,
        options: variant.options,
        subtotal: variant.price
      };
      setCart([...cart, newItem]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          subtotal: quantity * item.price
        };
      }
      return item;
    });
    
    setCart(updatedCart);
  };

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 0.0825; // 8.25% tax rate
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const totals = calculateTotals();

  // Process payment
  const processPayment = (paymentMethod: string) => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Clear cart after successful payment
      setCart([]);
      setPaymentProcessing(false);
      setShowPaymentOptions(false);
      // Here you would normally save the transaction to the database
      alert(`Payment of $${totals.total.toFixed(2)} processed successfully via ${paymentMethod}!`);
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
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-primary">PaySurity ECom Ready</h1>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              Retail POS
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/merchant/pos/retail/inventory">
                <Package className="h-4 w-4 mr-1" />
                Inventory
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/merchant/pos/retail/reports">
                <BarChart className="h-4 w-4 mr-1" />
                Reports
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/merchant/pos/retail/customers">
                <Users className="h-4 w-4 mr-1" />
                Customers
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/merchant/pos/retail/settings">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Product Navigation and Search */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-4 bg-white border-b">
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory || ""}
                onValueChange={(value) => setSelectedCategory(value === "" ? null : value)}
              >
                <SelectTrigger className="w-[200px]">
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
            </div>

            {/* Category Quick Select */}
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.slice(0, 6).map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:border-primary transition-all"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 text-center">
                  <div className="aspect-square bg-neutral-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                    ) : (
                      <Package className="h-10 w-10 text-neutral-400" />
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-left line-clamp-2">{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <div className="font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      Stock: {product.inStock}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-neutral-500">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No products found. Try a different search or category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="w-2/5 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">Current Sale</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCart([])}
                disabled={cart.length === 0}
              >
                Clear Cart
              </Button>
            </div>
            <div className="text-sm text-neutral-500">
              Items: {totals.itemCount} | Total: ${totals.total.toFixed(2)}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-center">Cart is empty</p>
                <p className="text-center text-sm mt-1">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start p-3 border rounded-md bg-neutral-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      {item.options && item.options.length > 0 && (
                        <div className="text-xs text-neutral-500 mt-1">
                          {item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <button 
                          className="w-6 h-6 flex items-center justify-center border rounded"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 flex items-center justify-center border rounded"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${item.subtotal.toFixed(2)}</div>
                      <div className="text-xs text-neutral-500">${item.price.toFixed(2)} each</div>
                      <button 
                        className="text-red-500 text-xs mt-2"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals and Checkout */}
          <div className="p-4 border-t">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8.25%)</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            {showPaymentOptions ? (
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => processPayment("Cash")}
                    disabled={paymentProcessing}
                    className="justify-start"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cash
                  </Button>
                  <Button 
                    onClick={() => processPayment("Credit Card")}
                    disabled={paymentProcessing}
                    className="justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit Card
                  </Button>
                  <Button 
                    onClick={() => processPayment("Gift Card")}
                    disabled={paymentProcessing}
                    className="justify-start"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Gift Card
                  </Button>
                  <Button 
                    onClick={() => processPayment("Store Credit")}
                    disabled={paymentProcessing}
                    className="justify-start"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Store Credit
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setShowPaymentOptions(false)}
                  disabled={paymentProcessing}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full" 
                size="lg"
                disabled={cart.length === 0}
                onClick={() => setShowPaymentOptions(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Checkout
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}