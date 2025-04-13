import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  Search,
  UsersRound,
  UserPlus,
  UserX,
  UserMinus,
  ShieldCheck,
  ChevronLeft,
  Check,
  X,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Trash2,
  AlertTriangle,
  EditIcon,
  DownloadIcon,
  MoreVertical,
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Customer type definition
interface CustomerPackage {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  status: "active" | "suspended" | "pending";
  createdAt: string;
  packages: CustomerPackage[];
}

// Admin Customer Management Page
export default function AdminCustomersPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  
  // New customer form data
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    packageId: ""
  });
  
  // Mock packages for selection
  const availablePackages = [
    { id: "basic", name: "Basic Plan", price: 99.99 },
    { id: "pro", name: "Professional Plan", price: 199.99 },
    { id: "enterprise", name: "Enterprise Plan", price: 499.99 },
    { id: "custom", name: "Custom Solution", price: 0 } // Price determined after consultation
  ];
  
  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/admin/customers");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        // Use demo data for testing purposes
        const demoCustomers: Customer[] = [
          {
            id: "c001",
            name: "John Smith",
            email: "john@oceanblue.com",
            phone: "(555) 123-4567",
            businessName: "Ocean Blue Boutique",
            status: "active",
            createdAt: "2023-09-15T10:30:00Z",
            packages: [
              { id: "p001", name: "Professional Plan", price: 199.99, billingCycle: "monthly", status: "active" }
            ]
          },
          {
            id: "c002",
            name: "Emma Johnson",
            email: "emma@techsolutions.com",
            phone: "(555) 987-6543",
            businessName: "Tech Solutions Inc",
            status: "active",
            createdAt: "2023-07-22T14:15:00Z",
            packages: [
              { id: "p002", name: "Enterprise Plan", price: 499.99, billingCycle: "monthly", status: "active" },
              { id: "p003", name: "API Access Add-on", price: 50.00, billingCycle: "monthly", status: "active" }
            ]
          },
          {
            id: "c003",
            name: "Michael Brown",
            email: "michael@greencafe.com",
            phone: "(555) 456-7890",
            businessName: "Green Cafe",
            status: "suspended",
            createdAt: "2023-08-05T09:45:00Z",
            packages: [
              { id: "p004", name: "Basic Plan", price: 99.99, billingCycle: "monthly", status: "suspended" }
            ]
          },
          {
            id: "c004",
            name: "Sarah Davis",
            email: "sarah@moderndesign.com",
            phone: "(555) 789-0123",
            businessName: "Modern Design Studio",
            status: "pending",
            createdAt: "2023-10-01T16:20:00Z",
            packages: [
              { id: "p005", name: "Professional Plan", price: 199.99, billingCycle: "annual", status: "pending" }
            ]
          },
          {
            id: "c005",
            name: "Robert Wilson",
            email: "robert@fitnessfirst.com",
            phone: "(555) 234-5678",
            businessName: "Fitness First Gym",
            status: "active",
            createdAt: "2023-06-10T11:00:00Z",
            packages: [
              { id: "p006", name: "Custom Solution", price: 349.99, billingCycle: "monthly", status: "active" }
            ]
          }
        ];
        setCustomers(demoCustomers);
        setFilteredCustomers(demoCustomers);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // Filter customers when searchTerm or statusFilter changes
  useEffect(() => {
    let filtered = customers;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }
    
    setFilteredCustomers(filtered);
  }, [searchTerm, statusFilter, customers]);
  
  // Add new customer handler
  const handleAddCustomer = async () => {
    // Validate form fields
    if (!newCustomer.name || !newCustomer.email || !newCustomer.businessName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your API
      // const response = await apiRequest("POST", "/api/admin/customers", newCustomer);
      // if (!response.ok) throw new Error("Failed to add customer");
      
      // For demo, we'll just add the customer to the local state
      const newCustomerId = `c${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const selectedPackage = availablePackages.find(pkg => pkg.id === newCustomer.packageId);
      
      const createdCustomer: Customer = {
        id: newCustomerId,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        businessName: newCustomer.businessName,
        status: "active",
        createdAt: new Date().toISOString(),
        packages: selectedPackage ? [
          { 
            id: `p${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            name: selectedPackage.name,
            price: selectedPackage.price,
            billingCycle: "monthly",
            status: "active"
          }
        ] : []
      };
      
      setCustomers(prev => [...prev, createdCustomer]);
      
      toast({
        title: "Customer Added",
        description: `${newCustomer.name} has been successfully added.`,
        variant: "default"
      });
      
      // Reset form
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        businessName: "",
        packageId: ""
      });
      
      // Close dialog
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Suspend customer handler
  const handleSuspendCustomer = async () => {
    if (!selectedCustomer) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your API
      // const response = await apiRequest("PATCH", `/api/admin/customers/${selectedCustomer.id}/suspend`);
      // if (!response.ok) throw new Error("Failed to suspend customer");
      
      // For demo, we'll just update the local state
      setCustomers(prev => prev.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...customer, status: "suspended", packages: customer.packages.map(pkg => ({ ...pkg, status: "suspended" })) } 
          : customer
      ));
      
      toast({
        title: "Customer Suspended",
        description: `${selectedCustomer.name} has been suspended.`,
        variant: "default"
      });
      
      // Close dialog
      setIsSuspendDialogOpen(false);
      
    } catch (error) {
      console.error("Error suspending customer:", error);
      toast({
        title: "Error",
        description: "Failed to suspend customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSelectedCustomer(null);
    }
  };
  
  // Delete customer handler
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your API
      // const response = await apiRequest("DELETE", `/api/admin/customers/${selectedCustomer.id}`);
      // if (!response.ok) throw new Error("Failed to delete customer");
      
      // For demo, we'll just update the local state
      setCustomers(prev => prev.filter(customer => customer.id !== selectedCustomer.id));
      
      toast({
        title: "Customer Deleted",
        description: `${selectedCustomer.name} has been permanently deleted.`,
        variant: "default"
      });
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSelectedCustomer(null);
    }
  };
  
  // Status badge component based on customer status
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800 border-green-200",
      suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pending: "bg-blue-100 text-blue-800 border-blue-200"
    };
    
    const style = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800 border-gray-200";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">Customer Management</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-md overflow-hidden bg-white">
            <Input
              type="text"
              placeholder="Search customers..."
              className="border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="px-3 py-2 bg-gray-50">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Customer
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-500">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
          
          <div>
            <Button variant="outline" className="flex items-center">
              <DownloadIcon className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Customer Accounts</CardTitle>
            <CardDescription>
              Manage all customers and their subscription packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-8 text-center">
                <UsersRound className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Add your first customer to get started"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Customer
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{customer.businessName}</TableCell>
                      <TableCell>
                        <StatusBadge status={customer.status} />
                      </TableCell>
                      <TableCell>
                        {customer.packages.length > 0 
                          ? customer.packages[0].name 
                          : <span className="text-gray-400">No package</span>
                        }
                        {customer.packages.length > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{customer.packages.length - 1} more
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.packages.length > 0 ? (
                          <div>
                            <p className="font-medium">
                              ${customer.packages.reduce((sum, pkg) => sum + pkg.price, 0).toFixed(2)}
                              <span className="text-xs text-gray-500 ml-1">
                                /{customer.packages[0].billingCycle}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              since {new Date(customer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => navigate(`/admin/customers/${customer.id}`)}
                              className="cursor-pointer"
                            >
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit details
                            </DropdownMenuItem>
                            
                            {customer.status === "active" ? (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setIsSuspendDialogOpen(true);
                                }}
                                className="cursor-pointer text-yellow-600"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Suspend account
                              </DropdownMenuItem>
                            ) : customer.status === "suspended" ? (
                              <DropdownMenuItem 
                                onClick={() => {
                                  // Activate customer logic
                                  setCustomers(prev => prev.map(c => 
                                    c.id === customer.id 
                                      ? { ...c, status: "active", packages: c.packages.map(pkg => ({ ...pkg, status: "active" })) } 
                                      : c
                                  ));
                                  
                                  toast({
                                    title: "Customer Activated",
                                    description: `${customer.name} has been activated.`,
                                  });
                                }}
                                className="cursor-pointer text-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Activate account
                              </DropdownMenuItem>
                            ) : null}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer account and assign a subscription package
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Smith" 
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="(555) 123-4567" 
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business">Business Name</Label>
                <Input 
                  id="business" 
                  placeholder="Acme Inc" 
                  value={newCustomer.businessName}
                  onChange={(e) => setNewCustomer({...newCustomer, businessName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="package">Subscription Package</Label>
              <Select 
                value={newCustomer.packageId} 
                onValueChange={(value) => setNewCustomer({...newCustomer, packageId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - ${pkg.price > 0 ? pkg.price.toFixed(2) : "Custom pricing"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer}
              disabled={isLoading}
            >
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Suspend Customer Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Suspend Customer Account
            </DialogTitle>
            <DialogDescription>
              This will temporarily disable the customer's access to services. All data will be preserved.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="py-4">
              <p className="mb-2">Are you sure you want to suspend:</p>
              <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                <p className="text-sm text-gray-500">{selectedCustomer.businessName}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSuspendDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleSuspendCustomer}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Suspend Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Customer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Customer
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The customer and all associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="py-4">
              <p className="mb-2">Are you sure you want to delete:</p>
              <div className="bg-red-50 p-3 rounded-md border border-red-100">
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                <p className="text-sm text-gray-500">{selectedCustomer.businessName}</p>
              </div>
              
              <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-100">
                <p className="text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                  This will also delete all subscription packages and billing information.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteCustomer}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}