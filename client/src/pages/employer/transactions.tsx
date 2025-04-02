import { useState } from "react";
import Layout from "@/components/layout/layout";
import TransactionsTable from "@/components/transactions/transactions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function EmployerTransactions() {
  const { toast } = useToast();
  
  // Filter states
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample comprehensive transaction data
  const transactionData = [
    {
      id: "1",
      user: { id: "1", name: "Sarah Johnson", initials: "SJ", department: "Marketing" },
      date: "Oct 12, 2023",
      time: "10:45 AM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Starbucks",
      merchantLocation: "San Francisco, CA",
      amount: "-$24.50",
      expenseType: "Meals",
    },
    {
      id: "2",
      user: { id: "2", name: "Michael Chen", initials: "MC", department: "Engineering" },
      date: "Oct 12, 2023",
      time: "9:30 AM",
      type: "Outgoing" as const,
      method: "Credit Card",
      merchantName: "Amazon Web Services",
      merchantLocation: "Online",
      amount: "-$199.99",
      expenseType: "Software",
    },
    {
      id: "3",
      user: { id: "3", name: "James Wilson", initials: "JW", department: "Sales" },
      date: "Oct 11, 2023",
      time: "3:15 PM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Uber",
      merchantLocation: "New York, NY",
      amount: "-$45.75",
      expenseType: "Transportation",
    },
    {
      id: "4",
      user: { id: "1", name: "Sarah Johnson", initials: "SJ", department: "Marketing" },
      date: "Oct 11, 2023",
      time: "11:20 AM",
      type: "Outgoing" as const,
      method: "Credit Card",
      merchantName: "Facebook Ads",
      merchantLocation: "Online",
      amount: "-$350.00",
      expenseType: "Marketing",
    },
    {
      id: "5",
      user: { id: "4", name: "John Doe", initials: "JD", department: "Admin" },
      date: "Oct 10, 2023",
      time: "2:00 PM",
      type: "Incoming" as const,
      method: "ACH",
      merchantName: "Bank of America",
      merchantLocation: "Transfer",
      amount: "+$5,000.00",
      expenseType: "Deposit",
    },
    {
      id: "6",
      user: { id: "2", name: "Michael Chen", initials: "MC", department: "Engineering" },
      date: "Oct 9, 2023",
      time: "1:15 PM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Home Depot",
      merchantLocation: "San Francisco, CA",
      amount: "-$85.25",
      expenseType: "Office Supplies",
    },
    {
      id: "7",
      user: { id: "5", name: "Emma Lopez", initials: "EL", department: "Customer Support" },
      date: "Oct 9, 2023",
      time: "10:30 AM",
      type: "Outgoing" as const,
      method: "Credit Card",
      merchantName: "Zoom",
      merchantLocation: "Online",
      amount: "-$14.99",
      expenseType: "Software",
    },
    {
      id: "8",
      user: { id: "3", name: "James Wilson", initials: "JW", department: "Sales" },
      date: "Oct 8, 2023",
      time: "4:45 PM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Delta Airlines",
      merchantLocation: "Online",
      amount: "-$450.00",
      expenseType: "Travel",
    },
    {
      id: "9",
      user: { id: "4", name: "John Doe", initials: "JD", department: "Admin" },
      date: "Oct 7, 2023",
      time: "3:00 PM",
      type: "Incoming" as const,
      method: "ACH",
      merchantName: "Chase Bank",
      merchantLocation: "Transfer",
      amount: "+$10,000.00",
      expenseType: "Deposit",
    },
    {
      id: "10",
      user: { id: "1", name: "Sarah Johnson", initials: "SJ", department: "Marketing" },
      date: "Oct 6, 2023",
      time: "1:30 PM",
      type: "Outgoing" as const,
      method: "Credit Card",
      merchantName: "Adobe",
      merchantLocation: "Online",
      amount: "-$52.99",
      expenseType: "Software",
    },
  ];

  // Filter transactions based on filters
  const filteredTransactions = transactionData.filter(transaction => {
    // Filter by search query
    if (searchQuery && 
        !transaction.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.expenseType.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by transaction type
    if (transactionType && transaction.type !== transactionType) {
      return false;
    }
    
    // More filters can be added as needed
    
    return true;
  });

  const handleExportCSV = () => {
    toast({
      title: "CSV Export",
      description: "Transactions have been exported to CSV.",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Excel Export",
      description: "Transactions have been exported to Excel.",
    });
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setTransactionType(undefined);
    setSearchQuery("");
  };

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Transactions</h1>
          <p className="text-sm text-neutral-500">View and manage all transactions across your organization</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    id="search"
                    placeholder="Merchant, user, or type..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="mb-2 block">Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="mb-2 block">Transaction Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={setTransactionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="Incoming">Incoming</SelectItem>
                    <SelectItem value="Outgoing">Outgoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                size="sm"
              >
                Clear Filters
              </Button>
              
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV}
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" /> CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportExcel}
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" /> Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <TransactionsTable 
          title="All Transactions" 
          transactions={filteredTransactions}
          isEmployer={true}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
        />
      </div>
    </Layout>
  );
}
