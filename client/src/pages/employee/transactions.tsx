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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmployeeTransactions() {
  const { toast } = useToast();
  
  // Filter states
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined);
  const [expenseType, setExpenseType] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Transaction detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  // Sample comprehensive transaction data
  const transactionData = [
    {
      id: "1",
      date: "Oct 12, 2023",
      time: "10:45 AM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Starbucks",
      merchantLocation: "San Francisco, CA",
      amount: "-$24.50",
      expenseType: "Meals",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "2",
      date: "Oct 11, 2023",
      time: "3:15 PM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Uber",
      merchantLocation: "San Francisco, CA",
      amount: "-$32.75",
      expenseType: "Transportation",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "3",
      date: "Oct 11, 2023",
      time: "11:20 AM",
      type: "Outgoing" as const,
      method: "Credit Card",
      merchantName: "Facebook Ads",
      merchantLocation: "Online",
      amount: "-$350.00",
      expenseType: "Marketing",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "4",
      date: "Oct 10, 2023",
      time: "2:00 PM",
      type: "Incoming" as const,
      method: "Wallet",
      merchantName: "Main Wallet",
      merchantLocation: "Allocation",
      amount: "+$500.00",
      expenseType: "Allocation",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "5",
      date: "Oct 9, 2023",
      time: "1:30 PM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Olive Garden",
      merchantLocation: "San Francisco, CA",
      amount: "-$78.40",
      expenseType: "Meals",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "6",
      date: "Oct 8, 2023",
      time: "4:45 PM",
      type: "Outgoing" as const,
      method: "Credit Card",
      merchantName: "Adobe",
      merchantLocation: "Online",
      amount: "-$52.99",
      expenseType: "Software",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "7",
      date: "Oct 7, 2023",
      time: "11:30 AM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Lyft",
      merchantLocation: "San Francisco, CA",
      amount: "-$18.50",
      expenseType: "Transportation",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "8",
      date: "Oct 5, 2023",
      time: "1:15 PM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Panera Bread",
      merchantLocation: "San Francisco, CA",
      amount: "-$15.75",
      expenseType: "Meals",
      isUserEditable: true,
      onExpenseTypeChange: (id: string, type: string) => handleExpenseTypeChange(id, type),
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
  ];

  // Filter transactions based on filters
  const filteredTransactions = transactionData.filter(transaction => {
    // Filter by search query
    if (searchQuery && 
        !transaction.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.expenseType.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by transaction type
    if (transactionType && transaction.type !== transactionType) {
      return false;
    }
    
    // Filter by expense type
    if (expenseType && transaction.expenseType !== expenseType) {
      return false;
    }
    
    // More filters can be added as needed
    
    return true;
  });

  const handleExpenseTypeChange = (transactionId: string, newType: string) => {
    toast({
      title: "Expense Type Updated",
      description: `Transaction has been categorized as ${newType}.`,
    });
  };

  const handleViewTransactionDetails = (transactionId: string) => {
    const transaction = transactionData.find(t => t.id === transactionId);
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

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
    setExpenseType(undefined);
    setSearchQuery("");
  };

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">My Transactions</h1>
          <p className="text-sm text-neutral-500">View and manage all your wallet transactions</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    id="search"
                    placeholder="Merchant or expense type..."
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
              
              <div>
                <Label className="mb-2 block">Expense Type</Label>
                <Select
                  value={expenseType}
                  onValueChange={setExpenseType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Meals">Meals</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Allocation">Allocation</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
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
          isEmployer={false}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
        />
        
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                View detailed information about this transaction
              </DialogDescription>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-neutral-600">Amount</span>
                    <span className={`text-xl font-bold ${
                      selectedTransaction.type === "Outgoing" ? "text-red-600" : "text-green-600"
                    }`}>{selectedTransaction.amount}</span>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedTransaction.type === "Outgoing" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {selectedTransaction.type}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Date & Time</h3>
                    <p className="text-sm">{selectedTransaction.date} at {selectedTransaction.time}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Method</h3>
                    <p className="text-sm">{selectedTransaction.method}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Merchant</h3>
                    <p className="text-sm">{selectedTransaction.merchantName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Location</h3>
                    <p className="text-sm">{selectedTransaction.merchantLocation}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-neutral-700">Expense Category</h3>
                  <Select
                    defaultValue={selectedTransaction.expenseType}
                    onValueChange={(value) => handleExpenseTypeChange(selectedTransaction.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Meals">Meals</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Allocation">Allocation</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-neutral-700">Notes</h3>
                  <textarea 
                    className="w-full p-3 border border-neutral-300 rounded-md h-24 text-sm"
                    placeholder="Add notes about this transaction..."
                  ></textarea>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
