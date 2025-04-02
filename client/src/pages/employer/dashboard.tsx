import { useState } from "react";
import Layout from "@/components/layout/layout";
import BalanceCard from "@/components/dashboard/balance-card";
import TransactionSummary from "@/components/dashboard/transaction-summary";
import FundRequests from "@/components/dashboard/fund-requests";
import TransactionsTable from "@/components/transactions/transactions-table";
import SubWalletOverview from "@/components/wallets/sub-wallet-overview";
import AllocateFundsModal from "@/components/modals/allocate-funds-modal";
import BankConnectModal from "@/components/modals/bank-connect-modal";
import { useToast } from "@/hooks/use-toast";

export default function EmployerDashboard() {
  const { toast } = useToast();
  const [allocateFundsModalOpen, setAllocateFundsModalOpen] = useState(false);
  const [bankConnectModalOpen, setBankConnectModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

  // Sample data for the employer dashboard
  const mainWalletBalance = "$24,586.75";
  const percentChange = "+2.3%";

  const transactionSummaryData = [
    { label: "Incoming", value: "$36,245.80", color: "text-green-600" },
    { label: "Outgoing", value: "$11,659.05", color: "text-red-600" },
    { label: "This Month", value: "$8,742.50" },
    { label: "Pending", value: "$1,230.45", color: "text-amber-600" },
  ];

  const fundRequestsData = [
    {
      id: "1",
      name: "Sarah Johnson",
      department: "Marketing",
      amount: "$250.00",
      onApprove: (id: string) => handleApproveFundRequest(id),
      onReject: (id: string) => handleRejectFundRequest(id),
    },
    {
      id: "2",
      name: "Michael Chen",
      department: "Engineering",
      amount: "$175.00",
      onApprove: (id: string) => handleApproveFundRequest(id),
      onReject: (id: string) => handleRejectFundRequest(id),
    },
    {
      id: "3",
      name: "James Wilson",
      department: "Sales",
      amount: "$500.00",
      onApprove: (id: string) => handleApproveFundRequest(id),
      onReject: (id: string) => handleRejectFundRequest(id),
    },
  ];

  const recentTransactionsData = [
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
  ];

  const subWalletUsers = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      initials: "SJ",
      department: "Marketing",
      balance: "$1,250.50",
      monthlyLimit: "$2,000.00",
      lastActivity: "Oct 12, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@company.com",
      initials: "MC",
      department: "Engineering",
      balance: "$725.80",
      monthlyLimit: "$1,500.00",
      lastActivity: "Oct 12, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "3",
      name: "James Wilson",
      email: "james.wilson@company.com",
      initials: "JW",
      department: "Sales",
      balance: "$2,154.25",
      monthlyLimit: "$3,000.00",
      lastActivity: "Oct 11, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "4",
      name: "Emma Lopez",
      email: "emma.lopez@company.com",
      initials: "EL",
      department: "Customer Support",
      balance: "$540.15",
      monthlyLimit: "$1,000.00",
      lastActivity: "Oct 9, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "5",
      name: "Robert Brown",
      email: "robert.brown@company.com",
      initials: "RB",
      department: "HR",
      balance: "$875.60",
      monthlyLimit: "$1,200.00",
      lastActivity: "Oct 8, 2023",
      status: "Inactive" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
  ];

  const bankAccounts = [
    {
      id: "1",
      bankName: "Bank of America",
      accountType: "Checking",
      accountNumber: "****4567",
      onAddFunds: (id: string) => handleAddFundsFromBank(id),
      onRemove: (id: string) => handleRemoveBank(id),
    },
    {
      id: "2",
      bankName: "Chase",
      accountType: "Savings",
      accountNumber: "****7890",
      onAddFunds: (id: string) => handleAddFundsFromBank(id),
      onRemove: (id: string) => handleRemoveBank(id),
    },
  ];

  // Event handlers
  const handleAllocateFundsClick = (userId?: string) => {
    setSelectedUserId(userId);
    setAllocateFundsModalOpen(true);
  };

  const handleAddFunds = () => {
    setBankConnectModalOpen(true);
  };

  const handleAddFundsFromBank = (bankId: string) => {
    toast({
      title: "Funds Added",
      description: "Successfully added funds from your bank account.",
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

  const handleAllocateFunds = (userId: string, amount: string, note: string, isRecurring: boolean) => {
    const user = subWalletUsers.find(user => user.id === userId);
    toast({
      title: "Funds Allocated",
      description: `Successfully allocated ${amount} to ${user?.name}.`,
    });
  };

  const handleApproveFundRequest = (requestId: string) => {
    const request = fundRequestsData.find(req => req.id === requestId);
    toast({
      title: "Request Approved",
      description: `You've approved ${request?.name}'s request for ${request?.amount}.`,
    });
  };

  const handleRejectFundRequest = (requestId: string) => {
    const request = fundRequestsData.find(req => req.id === requestId);
    toast({
      title: "Request Rejected",
      description: `You've rejected ${request?.name}'s request for ${request?.amount}.`,
      variant: "destructive",
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
          <h1 className="text-2xl font-bold text-neutral-900">Main Wallet Dashboard</h1>
          <p className="text-sm text-neutral-500">Manage your organization's wallet and track expenses</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <BalanceCard 
            balance={mainWalletBalance} 
            percentChange={percentChange}
            onAllocateFunds={() => handleAllocateFundsClick()}
            onAddFunds={handleAddFunds}
            isEmployer={true}
          />
          
          <TransactionSummary 
            title="Transaction Summary" 
            data={transactionSummaryData} 
          />
          
          <FundRequests requests={fundRequestsData} />
        </div>
        
        <div className="mb-6">
          <TransactionsTable 
            title="Recent Transactions" 
            viewAllLink="/transactions"
            transactions={recentTransactionsData}
            isEmployer={true}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
          />
        </div>

        <div>
          <SubWalletOverview users={subWalletUsers} />
        </div>

        <AllocateFundsModal 
          isOpen={allocateFundsModalOpen}
          onClose={() => {
            setAllocateFundsModalOpen(false);
            setSelectedUserId(undefined);
          }}
          users={subWalletUsers.map(user => ({
            id: user.id,
            name: user.name,
            department: user.department
          }))}
          onAllocate={handleAllocateFunds}
          selectedUserId={selectedUserId}
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
