import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { DateRange } from "react-day-picker";
import { format, subDays, isWithinInterval } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Download,
  Filter,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Transaction types based on your business requirements
type TransactionType = "sale" | "refund" | "void" | "adjustment" | "payout";
type PaymentMethod = "credit" | "debit" | "cash" | "mobile" | "gift" | "other";
type Status = "completed" | "pending" | "failed" | "void";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  status: Status;
  customerName?: string;
  note?: string;
  items?: { name: string; quantity: number; price: number }[];
  employeeId?: string;
  employeeName?: string;
  tax?: number;
  tip?: number;
}

// Mock data for demonstration
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-10001",
    date: "2025-04-03T09:15:00Z",
    amount: 68.75,
    type: "sale",
    paymentMethod: "credit",
    status: "completed",
    customerName: "John Smith",
    items: [
      { name: "Grilled Salmon", quantity: 1, price: 28.99 },
      { name: "House Salad", quantity: 1, price: 12.99 },
      { name: "Craft Beer", quantity: 2, price: 9.99 },
    ],
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    tax: 4.12,
    tip: 12.75,
  },
  {
    id: "TXN-10002",
    date: "2025-04-03T12:30:00Z",
    amount: 45.29,
    type: "sale",
    paymentMethod: "debit",
    status: "completed",
    customerName: "Maria Garcia",
    items: [
      { name: "Pasta Primavera", quantity: 1, price: 18.99 },
      { name: "Garlic Bread", quantity: 1, price: 5.99 },
      { name: "Tiramisu", quantity: 1, price: 8.99 },
      { name: "Sparkling Water", quantity: 2, price: 3.99 },
    ],
    employeeId: "EMP-002",
    employeeName: "Michael Chen",
    tax: 3.35,
    tip: 7.94,
  },
  {
    id: "TXN-10003",
    date: "2025-04-02T19:45:00Z",
    amount: 112.50,
    type: "sale",
    paymentMethod: "credit",
    status: "completed",
    customerName: "Robert Davis",
    items: [
      { name: "Filet Mignon", quantity: 2, price: 42.99 },
      { name: "Lobster Bisque", quantity: 2, price: 12.99 },
      { name: "Bottle of Wine", quantity: 1, price: 36.99 },
    ],
    employeeId: "EMP-003",
    employeeName: "Jessica Wilson",
    tax: 8.44,
    tip: 22.50,
  },
  {
    id: "TXN-10004",
    date: "2025-04-02T14:10:00Z",
    amount: -25.98,
    type: "refund",
    paymentMethod: "credit",
    status: "completed",
    customerName: "Emma Thompson",
    note: "Customer dissatisfied with meal quality",
    items: [
      { name: "Chicken Parmesan", quantity: 1, price: 21.99 },
      { name: "House Salad", quantity: 1, price: 3.99 },
    ],
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    tax: -1.95,
    tip: 0,
  },
  {
    id: "TXN-10005",
    date: "2025-04-01T17:30:00Z",
    amount: 89.97,
    type: "sale",
    paymentMethod: "cash",
    status: "completed",
    customerName: "David Wilson",
    items: [
      { name: "BBQ Ribs", quantity: 1, price: 32.99 },
      { name: "Mac & Cheese", quantity: 1, price: 8.99 },
      { name: "Fried Calamari", quantity: 1, price: 14.99 },
      { name: "House Cocktails", quantity: 3, price: 11.00 },
    ],
    employeeId: "EMP-004",
    employeeName: "Daniel Brown",
    tax: 6.75,
    tip: 15.25,
  },
  {
    id: "TXN-10006",
    date: "2025-04-01T11:20:00Z",
    amount: 0.00,
    type: "void",
    paymentMethod: "debit",
    status: "void",
    customerName: "Sophia Martinez",
    note: "Order entered incorrectly",
    items: [
      { name: "Veggie Burger", quantity: 1, price: 16.99 },
      { name: "Sweet Potato Fries", quantity: 1, price: 5.99 },
      { name: "Lemonade", quantity: 1, price: 3.99 },
    ],
    employeeId: "EMP-002",
    employeeName: "Michael Chen",
    tax: 0,
    tip: 0,
  },
  {
    id: "TXN-10007",
    date: "2025-03-31T20:15:00Z",
    amount: 150.25,
    type: "sale",
    paymentMethod: "credit",
    status: "completed",
    customerName: "James Anderson",
    note: "Birthday celebration",
    items: [
      { name: "Ribeye Steak", quantity: 2, price: 39.99 },
      { name: "Lobster Tail", quantity: 1, price: 45.99 },
      { name: "Bottle of Champagne", quantity: 1, price: 45.99 },
      { name: "Chocolate Cake", quantity: 1, price: 9.99 },
    ],
    employeeId: "EMP-003",
    employeeName: "Jessica Wilson",
    tax: 11.27,
    tip: 30.00,
  },
  {
    id: "TXN-10008",
    date: "2025-03-31T15:40:00Z",
    amount: 35.48,
    type: "sale",
    paymentMethod: "mobile",
    status: "completed",
    customerName: "Olivia Johnson",
    items: [
      { name: "Caesar Salad", quantity: 1, price: 13.99 },
      { name: "Soup of the Day", quantity: 1, price: 7.99 },
      { name: "Grilled Chicken Sandwich", quantity: 1, price: 15.99 },
    ],
    employeeId: "EMP-005",
    employeeName: "Amanda Rodriguez",
    tax: 2.66,
    tip: 7.10,
  },
  {
    id: "TXN-10009",
    date: "2025-03-30T13:25:00Z",
    amount: 75.99,
    type: "sale",
    paymentMethod: "gift",
    status: "completed",
    customerName: "William Taylor",
    items: [
      { name: "Duck Confit", quantity: 1, price: 36.99 },
      { name: "Truffle Fries", quantity: 1, price: 12.99 },
      { name: "Craft Cocktail", quantity: 2, price: 14.99 },
    ],
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    tax: 5.70,
    tip: 15.20,
  },
  {
    id: "TXN-10010",
    date: "2025-03-30T18:05:00Z",
    amount: -15.99,
    type: "refund",
    paymentMethod: "credit",
    status: "completed",
    customerName: "Isabella Brown",
    note: "Food allergic reaction",
    items: [
      { name: "Seafood Pasta", quantity: 1, price: 15.99 },
    ],
    employeeId: "EMP-002",
    employeeName: "Michael Chen",
    tax: -1.20,
    tip: 0,
  },
];

export default function BistroBeastTransactions() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Function to fetch transactions (In a real app, this would fetch from the API)
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/merchant/pos/bistro/transactions"],
    queryFn: () => MOCK_TRANSACTIONS,
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      // In a real scenario, this would call the API
      // await apiRequest("DELETE", `/api/merchant/pos/bistro/transactions/${id}`);
      // For demonstration, we're just returning the ID
      return id;
    },
    onSuccess: (id) => {
      // In a real app, invalidate the transaction list query to refresh the data
      queryClient.setQueryData(
        ["/api/merchant/pos/bistro/transactions"],
        (old: Transaction[] | undefined) =>
          (old || []).filter((t) => t.id !== id)
      );
      toast({
        title: "Transaction deleted",
        description: `Transaction ${id} has been permanently deleted.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteTransactionMutation.mutate(id);
  };

  // Filter functions
  const toggleTransactionType = (type: TransactionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setSelectedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const toggleStatus = (status: Status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedMethods([]);
    setSelectedStatuses([]);
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date(),
    });
  };

  // Apply filters to transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Search query filter
    const matchesSearch = searchQuery
      ? transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.customerName &&
          transaction.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (transaction.employeeName &&
          transaction.employeeName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
      : true;

    // Transaction type filter
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(transaction.type);

    // Payment method filter
    const matchesMethod =
      selectedMethods.length === 0 ||
      selectedMethods.includes(transaction.paymentMethod);

    // Status filter
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(transaction.status);

    // Date range filter
    const transactionDate = new Date(transaction.date);
    const matchesDateRange =
      !dateRange ||
      !dateRange.from ||
      (dateRange.from &&
        dateRange.to &&
        transactionDate >= dateRange.from &&
        transactionDate <= dateRange.to) ||
      (dateRange.from && !dateRange.to && transactionDate >= dateRange.from);

    return (
      matchesSearch &&
      matchesType &&
      matchesMethod &&
      matchesStatus &&
      matchesDateRange
    );
  });

  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground p-6">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/merchant/pos/bistro")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Transaction History</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full border rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {(selectedTypes.length > 0 ||
                  selectedMethods.length > 0 ||
                  selectedStatuses.length > 0) && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {selectedTypes.length +
                      selectedMethods.length +
                      selectedStatuses.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <div className="font-medium mb-2">Transaction Type</div>
                <div className="space-y-1">
                  {["sale", "refund", "void", "adjustment", "payout"].map(
                    (type) => (
                      <label
                        key={type}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type as TransactionType)}
                          onChange={() =>
                            toggleTransactionType(type as TransactionType)
                          }
                          className="rounded"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    )
                  )}
                </div>

                <div className="font-medium mb-2 mt-4">Payment Method</div>
                <div className="space-y-1">
                  {["credit", "debit", "cash", "mobile", "gift", "other"].map(
                    (method) => (
                      <label
                        key={method}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMethods.includes(
                            method as PaymentMethod
                          )}
                          onChange={() =>
                            togglePaymentMethod(method as PaymentMethod)
                          }
                          className="rounded"
                        />
                        <span className="capitalize">{method}</span>
                      </label>
                    )
                  )}
                </div>

                <div className="font-medium mb-2 mt-4">Status</div>
                <div className="space-y-1">
                  {["completed", "pending", "failed", "void"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status as Status)}
                        onChange={() => toggleStatus(status as Status)}
                        className="rounded"
                      />
                      <span className="capitalize">{status}</span>
                    </label>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </div>

        {/* Transactions Table */}
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <Clock className="animate-spin h-5 w-5 mr-2" />
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <div className="text-lg font-medium">No transactions found</div>
                      <div className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </div>
                      <Button onClick={clearFilters} variant="outline" className="mt-2">
                        Clear all filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(transaction.date), "MMM d, yyyy h:mm a")}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-medium ${
                        transaction.amount < 0
                          ? "text-red-600"
                          : transaction.type === "void"
                          ? "text-muted-foreground"
                          : "text-green-600"
                      }`}
                    >
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            transaction.type === "sale"
                              ? "bg-green-100 text-green-800"
                              : transaction.type === "refund"
                              ? "bg-red-100 text-red-800"
                              : transaction.type === "void"
                              ? "bg-gray-100 text-gray-800"
                              : transaction.type === "adjustment"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-purple-100 text-purple-800"
                          }
                        `}
                      >
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transaction.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        `}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.customerName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}