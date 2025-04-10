import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { 
  Loader2, 
  Search, 
  Plus, 
  FilterIcon, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Link as LinkIcon 
} from "lucide-react";
import { useState } from "react";

// Helper function to format currency
const formatCurrency = (amount: string | number) => {
  if (!amount) return "$0.00";
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

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

export default function SuperAdminAffiliates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  // Fetch affiliates data
  const { data: affiliates, isLoading } = useQuery({
    queryKey: ["/api/affiliates"],
  });
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter affiliates based on search query and current tab
  const filteredAffiliates = affiliates ? affiliates.filter((affiliate: any) => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === "" || 
      affiliate.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.website?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply tab filter
    const matchesTab = 
      currentTab === "all" || 
      affiliate.status?.toLowerCase() === currentTab;
    
    return matchesSearch && matchesTab;
  }) : [];

  // Mock stats for demonstration
  const affiliateStats = [
    {
      title: "Total Affiliates",
      value: affiliates ? affiliates.length : 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Active affiliate marketers",
    },
    {
      title: "Total Commission Paid",
      value: formatCurrency(780000),
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      description: "Year to date",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "Average conversion rate",
    },
  ];
  
  return (
    <AdminLayout title="Affiliate Management">
      <div className="flex flex-col space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {affiliateStats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Affiliates Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Affiliate Directory</CardTitle>
                <CardDescription>
                  Manage digital affiliate marketers and their commission structures
                </CardDescription>
              </div>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Affiliate
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
                    placeholder="Search affiliates..."
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
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="suspended">Suspended</TabsTrigger>
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
                        <TableHead>Name</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Referrals</TableHead>
                        <TableHead>Earnings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAffiliates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No affiliates found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAffiliates.map((affiliate: any) => (
                          <TableRow key={affiliate.id}>
                            <TableCell className="font-medium">
                              {affiliate.displayName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <LinkIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span className="text-sm truncate max-w-[180px]">
                                  {affiliate.website || "No website"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{affiliate.referralCount || 0}</TableCell>
                            <TableCell>{formatCurrency(affiliate.totalEarnings || 0)}</TableCell>
                            <TableCell>
                              <StatusBadge status={affiliate.status} />
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
          <CardFooter className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAffiliates?.length || 0} of {affiliates?.length || 0} affiliates
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}