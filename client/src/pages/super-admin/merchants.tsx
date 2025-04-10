import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Plus, FilterIcon } from "lucide-react";
import { useState } from "react";

// Helper function to format date strings
const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Status badge component with appropriate colors
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "default";
  
  switch (status.toLowerCase()) {
    case "active":
      variant = "success";
      break;
    case "pending":
      variant = "secondary";
      break;
    case "rejected":
    case "suspended":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function SuperAdminMerchants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  // Fetch merchants data
  const { data: merchants, isLoading } = useQuery({
    queryKey: ["/api/merchants"],
  });
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter merchants based on search query and current tab
  const filteredMerchants = merchants ? merchants.filter((merchant: any) => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === "" || 
      merchant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply tab filter
    const matchesTab = 
      currentTab === "all" || 
      merchant.status.toLowerCase() === currentTab;
    
    return matchesSearch && matchesTab;
  }) : [];
  
  return (
    <AdminLayout title="Merchant Management">
      <div className="flex flex-col space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Merchant Directory</CardTitle>
                <CardDescription>
                  Manage all merchant accounts and view their details
                </CardDescription>
              </div>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Merchant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search merchants..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full md:w-auto">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              <Tabs defaultValue="all" 
                onValueChange={(value) => setCurrentTab(value)}
                className="w-full">
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="suspended">Suspended</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMerchants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No merchants found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMerchants.map((merchant: any) => (
                          <TableRow key={merchant.id}>
                            <TableCell className="font-medium">
                              {merchant.businessName}
                            </TableCell>
                            <TableCell>
                              {merchant.businessType.charAt(0).toUpperCase() + merchant.businessType.slice(1)}
                            </TableCell>
                            <TableCell>{merchant.email}</TableCell>
                            <TableCell>{formatDate(merchant.createdAt)}</TableCell>
                            <TableCell>
                              <StatusBadge status={merchant.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}