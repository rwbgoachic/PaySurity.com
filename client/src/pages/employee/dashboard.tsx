import { useState } from "react";
import Layout from "@/components/layout/layout";
import BalanceCard from "@/components/dashboard/balance-card";
import TransactionSummary from "@/components/dashboard/transaction-summary";
import ExpenseCategories from "@/components/dashboard/expense-categories";
import TransactionsTable from "@/components/transactions/transactions-table";
import FundRequestModal from "@/components/modals/fund-request-modal";
import BankConnectModal from "@/components/modals/bank-connect-modal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [fundRequestModalOpen, setFundRequestModalOpen] = useState(false);
  const [bankConnectModalOpen, setBankConnectModalOpen] = useState(false);

  // Sample data for the employee dashboard
  const walletBalance = "$1,250.50";
  const monthlyLimit = "$2,000";

  const transactionSummaryData = [
    { label: "This Month", value: "$749.50", color: "text-red-600" },
    { label: "Last Month", value: "$1,325.80" },
    { label: "Pending", value: "$120.45", color: "text-amber-600" },
    { label: "Last Allocation", value: "$500.00", color: "text-green-600" },
  ];

  const expenseCategoriesData = [
    { name: "Meals", amount: "$245.80", percentage: 32, color: "bg-primary" },
    { name: "Transportation", amount: "$187.25", percentage: 25, color: "bg-cyan-500" },
    { name: "Marketing", amount: "$350.00", percentage: 46, color: "bg-amber-500" },
    { name: "Software", amount: "$85.90", percentage: 12, color: "bg-neutral-500" },
  ];

  const recentTransactionsData = [
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
  ];

  const bankAccounts = [
    {
      id: "1",
      bankName: "Bank of America",
      accountType: "Checking",
      accountNumber: "****4567",
      onRemove: (id: string) => handleRemoveBank(id),
    },
    {
      id: "2",
      bankName: "Chase",
      accountType: "Savings",
      accountNumber: "****7890",
      onRemove: (id: string) => handleRemoveBank(id),
    },
  ];

  // Event handlers
  const handleFundRequest = (amount: string, reason: string, urgency: string) => {
    toast({
      title: "Fund Request Submitted",
      description: `Your request for $${amount} has been sent to your employer.`,
    });
  };

  const handleExpenseTypeChange = (transactionId: string, newType: string) => {
    toast({
      title: "Expense Type Updated",
      description: `Transaction has been categorized as ${newType}.`,
    });
  };

  const handleViewTransactionDetails = (transactionId: string) => {
    toast({
      title: "Transaction Details",
      description: `Viewing details for transaction #${transactionId}.`,
    });
  };

  const handleRemoveBank = (bankId: string) => {
    toast({
      title: "Bank Removed",
      description: "Bank account has been disconnected.",
      variant: "destructive",
    });
  };

  const handleConnectNewBank = () => {
    toast({
      title: "Connect Bank",
      description: "Bank connection feature will be implemented soon.",
    });
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

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">My Wallet Dashboard</h1>
          <div className="text-sm text-neutral-500 flex items-center">
            <span>{user?.firstName} {user?.lastName}</span>
            <span className="mx-2">•</span>
            <span>{user?.department}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <BalanceCard 
            balance={walletBalance} 
            monthlyLimit={monthlyLimit}
            onRequestFunds={() => setFundRequestModalOpen(true)}
            onTransferFunds={() => setBankConnectModalOpen(true)}
            isEmployer={false}
          />
          
          <TransactionSummary 
            title="My Spending Summary" 
            data={transactionSummaryData} 
          />
          
          <ExpenseCategories categories={expenseCategoriesData} />
        </div>
        
        <div className="mb-6">
          <TransactionsTable 
            title="My Recent Transactions" 
            viewAllLink="/employee/transactions"
            transactions={recentTransactionsData}
            isEmployer={false}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
          />
        </div>

        <FundRequestModal 
          isOpen={fundRequestModalOpen}
          onClose={() => setFundRequestModalOpen(false)}
          onSubmit={handleFundRequest}
        />

        <BankConnectModal 
          isOpen={bankConnectModalOpen}
          onClose={() => setBankConnectModalOpen(false)}
          accounts={bankAccounts}
          onConnectNew={handleConnectNewBank}
        />
      </div>
    </Layout>
  );
}
