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
import { Loader2, Search, Plus, FilterIcon, DollarSign, Users } from "lucide-react";
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

export default function SuperAdminPartners() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  // Fetch ISO partners data
  const { data: partners, isLoading } = useQuery({
    queryKey: ["/api/iso-partners"],
  });
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter partners based on search query and current tab
  const filteredPartners = partners ? partners.filter((partner: any) => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === "" || 
      partner.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply tab filter
    const matchesTab = 
      currentTab === "all" || 
      partner.status?.toLowerCase() === currentTab;
    
    return matchesSearch && matchesTab;
  }) : [];

  // Mock stats for demonstration
  const partnerStats = [
    {
      title: "Total Partners",
      value: partners ? partners.length : 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Active ISO partnerships",
    },
    {
      title: "Total Commission",
      value: formatCurrency(1250000),
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      description: "Year to date",
    },
    {
      title: "Average Retention",
      value: "94%",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Partner retention rate",
    },
  ];
  
  return (
    <AdminLayout title="ISO Partner Management">
      <div className="flex flex-col space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partnerStats.map((stat, index) => (
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

        {/* Partners Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>ISO Partner Directory</CardTitle>
                <CardDescription>
                  Manage Independent Sales Organization partners and their accounts
                </CardDescription>
              </div>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Partner
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
                    placeholder="Search partners..."
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
                  <TabsTrigger value="terminated">Terminated</TabsTrigger>
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
                        <TableHead>Company Name</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Merchants</TableHead>
                        <TableHead>Monthly Volume</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPartners.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No ISO partners found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPartners.map((partner: any) => (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">
                              {partner.businessName}
                            </TableCell>
                            <TableCell>
                              {partner.contactName}
                            </TableCell>
                            <TableCell>{partner.merchantCount || 0}</TableCell>
                            <TableCell>{formatCurrency(partner.monthlyVolume || 0)}</TableCell>
                            <TableCell>{formatDate(partner.createdAt)}</TableCell>
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
              Showing {filteredPartners?.length || 0} of {partners?.length || 0} partners
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