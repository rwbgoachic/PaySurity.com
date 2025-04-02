import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TransactionUser {
  id: string;
  name: string;
  initials: string;
  department: string;
}

export interface Transaction {
  id: string;
  user?: TransactionUser;
  date: string;
  time: string;
  type: "Incoming" | "Outgoing";
  method: string;
  merchantName: string;
  merchantLocation: string;
  amount: string;
  expenseType: string;
  isUserEditable?: boolean;
  onExpenseTypeChange?: (id: string, type: string) => void;
  onViewDetails?: (id: string) => void;
}

interface TransactionsTableProps {
  title: string;
  viewAllLink?: string;
  transactions: Transaction[];
  isEmployer?: boolean;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

export default function TransactionsTable({ 
  title, 
  viewAllLink, 
  transactions, 
  isEmployer = true,
  onExportCSV,
  onExportExcel
}: TransactionsTableProps) {
  // Filter states
  const [filters, setFilters] = useState({});

  // Export options
  const handleExport = (format: "csv" | "excel") => {
    if (format === "csv" && onExportCSV) {
      onExportCSV();
    } else if (format === "excel" && onExportExcel) {
      onExportExcel();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <CardTitle className="text-lg font-medium text-neutral-900">{title}</CardTitle>
        <div className="flex space-x-2">
          {(onExportCSV || onExportExcel) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Download className="h-4 w-4 mr-2" /> Export
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExportCSV && (
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                )}
                {onExportExcel && (
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    Export as Excel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {viewAllLink && (
            <Button variant="link" className="text-sm font-medium text-primary">
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                {isEmployer && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Department
                    </th>
                  </>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Expense Type
                </th>
                {!isEmployer && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {transactions.length === 0 ? (
                <tr>
                  <td 
                    colSpan={isEmployer ? 8 : 7} 
                    className="px-6 py-4 text-sm text-neutral-500 text-center"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    {isEmployer && transaction.user && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                              <span>{transaction.user.initials}</span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-neutral-900">{transaction.user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {transaction.user.department}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div>{transaction.date}</div>
                      <div className="text-xs">{transaction.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${
                        transaction.type === "Outgoing" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                        } rounded-full`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {transaction.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{transaction.merchantName}</div>
                      <div className="text-xs text-neutral-500">{transaction.merchantLocation}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                      transaction.type === "Outgoing" ? "text-red-600" : "text-green-600"
                    }`}>
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.isUserEditable ? (
                        <select 
                          className="text-xs border-neutral-300 rounded-md focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                          defaultValue={transaction.expenseType}
                          onChange={(e) => {
                            if (transaction.onExpenseTypeChange) {
                              transaction.onExpenseTypeChange(transaction.id, e.target.value);
                            }
                          }}
                        >
                          <option value="Meals">Meals</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Office Supplies">Office Supplies</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Software">Software</option>
                          <option value="Personal">Personal</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded-full">
                          {transaction.expenseType}
                        </span>
                      )}
                    </td>
                    {!isEmployer && transaction.onViewDetails && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button 
                          variant="link" 
                          className="text-primary font-medium"
                          onClick={() => transaction.onViewDetails(transaction.id)}
                        >
                          Details
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
