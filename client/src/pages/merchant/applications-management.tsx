import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { WebSocketHandler } from "@/components/merchant/notifications/websocket-handler";

// UI Components
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  ChevronUp, 
  Search, 
  FileText, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  RefreshCw,
  ArrowUpDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

// Define application type based on schema
type MerchantApplication = {
  id: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    industry: string;
    yearsInBusiness: string;
    estimatedMonthlyVolume: string;
    businessDescription?: string;
    employeeCount: string;
    website?: string;
  };
  addressInfo: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentProcessing: {
    acceptsCardPresent?: boolean;
    acceptsOnlinePayments?: boolean;
    acceptsACH?: boolean;
    acceptsRecurringPayments?: boolean;
    needsPOS?: boolean;
    needsPaymentGateway?: boolean;
    currentProcessor?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Define status badge styling
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  reviewing: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  approved: "bg-green-100 text-green-800 hover:bg-green-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
};

// Status icons
const statusIcons = {
  pending: <Clock className="h-4 w-4 mr-1" />,
  reviewing: <RefreshCw className="h-4 w-4 mr-1" />,
  approved: <CheckCircle2 className="h-4 w-4 mr-1" />,
  rejected: <XCircle className="h-4 w-4 mr-1" />,
};

export default function ApplicationsManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // State for filtering, sorting, and pagination
  const [status, setStatus] = useState<string | undefined>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  
  // Redirect non-admin users
  if (user && user.role !== "admin") {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }
  
  // Fetch applications with all filters
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "/api/merchant/applications", 
      status, 
      searchTerm, 
      sortField, 
      sortDirection, 
      currentPage, 
      perPage
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      if (searchTerm) queryParams.set("search", searchTerm);
      queryParams.set("sortBy", sortField);
      queryParams.set("sortDir", sortDirection);
      queryParams.set("page", currentPage.toString());
      queryParams.set("limit", perPage.toString());
      
      const response = await fetch(`/api/merchant/applications?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      return response.json();
    },
  });
  
  // Handle status change mutation
  const handleStatusChange = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      await apiRequest("PATCH", `/api/merchant/applications/${applicationId}`, {
        status: newStatus,
        notes: notes || "",
      });
      
      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus}`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update application status",
        variant: "destructive",
      });
    }
  };
  
  // Handle sort toggle
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Generate page links for pagination
  const renderPageLinks = () => {
    if (!data || !data.totalPages) return null;
    
    const pages = [];
    
    // Show first page
    if (data.currentPage > 3) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      if (data.currentPage > 4) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <span className="px-4">...</span>
          </PaginationItem>
        );
      }
    }
    
    // Show pages around current page
    for (let i = Math.max(1, data.currentPage - 2); i <= Math.min(data.totalPages, data.currentPage + 2); i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setCurrentPage(i)}
            isActive={data.currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show last page
    if (data.currentPage < data.totalPages - 2) {
      if (data.currentPage < data.totalPages - 3) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <span className="px-4">...</span>
          </PaginationItem>
        );
      }
      
      pages.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(data.totalPages)}>
            {data.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };
  
  return (
    <div className="container mx-auto py-6">
      <WebSocketHandler />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Merchant Applications</h1>
          <p className="text-gray-500 mt-1">
            Review and manage merchant onboarding applications
          </p>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Filters and Search</CardTitle>
          <CardDescription>
            Narrow down applications by status, name, or other details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/4">
              <Select
                value={status || "all"}
                onValueChange={(value) => setStatus(value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-3/4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by business name, contact, industry..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      refetch();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold text-red-500">Error loading applications</h3>
          <p className="mb-4">Unable to fetch merchant applications from the server.</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      ) : data?.applications && data.applications.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableCaption>
                  Showing {data.applications.length} of {data.totalCount} applications
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <div 
                        className="flex items-center cursor-pointer" 
                        onClick={() => toggleSort("businessInfo.businessName")}
                      >
                        Business
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer" 
                        onClick={() => toggleSort("businessInfo.industry")}
                      >
                        Industry
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer" 
                        onClick={() => toggleSort("contactInfo.firstName")}
                      >
                        Contact
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer" 
                        onClick={() => toggleSort("createdAt")}
                      >
                        Submitted
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.applications.map((app: MerchantApplication) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.businessInfo.businessName}
                        {app.businessInfo.website && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <a 
                              href={app.businessInfo.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {app.businessInfo.website}
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{app.businessInfo.industry}</TableCell>
                      <TableCell>
                        <div>
                          {app.personalInfo.firstName} {app.personalInfo.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {app.personalInfo.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {app.personalInfo.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[app.status as keyof typeof statusColors]} 
                          variant="outline"
                        >
                          {statusIcons[app.status as keyof typeof statusIcons]}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(app.createdAt).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(app.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/merchant/applications/${app.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Status
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(app.id, "pending")}
                                disabled={app.status === "pending"}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(app.id, "reviewing")}
                                disabled={app.status === "reviewing"}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Mark as Reviewing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(app.id, "approved")}
                                disabled={app.status === "approved"}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve Application
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(app.id, "rejected")}
                                disabled={app.status === "rejected"}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Application
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="gap-1 pl-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>
                  </PaginationItem>
                  
                  {renderPageLinks()}
                  
                  <PaginationItem>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
                      disabled={currentPage >= data.totalPages}
                      className="gap-1 pr-2"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing page {data.currentPage} of {data.totalPages}, {data.totalCount} total applications
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold">No Applications Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? "No applications match your search filters." 
              : "There are no merchant applications available at this time."}
          </p>
          {searchTerm && (
            <Button onClick={() => {
              setSearchTerm("");
              refetch();
            }}>
              Clear Search
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}