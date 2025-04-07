import { useState } from "react";
import Layout from "@/components/layout/layout";
import BalanceCard from "@/components/dashboard/balance-card";
import TransactionSummary from "@/components/dashboard/transaction-summary";
import ChildAccountsOverview from "@/components/parent/child-accounts-overview";
import TransactionsTable from "@/components/transactions/transactions-table";
import AllowanceModal from "@/components/modals/allowance-modal";
import SpendingRulesModal from "@/components/modals/spending-rules-modal";
import BankConnectModal from "@/components/modals/bank-connect-modal";
import { useToast } from "@/hooks/use-toast";

export default function ParentDashboard() {
  const { toast } = useToast();
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
  const [spendingRulesModalOpen, setSpendingRulesModalOpen] = useState(false);
  const [bankConnectModalOpen, setBankConnectModalOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(undefined);

  // Sample data for the parent dashboard
  const mainWalletBalance = "$8,456.25";
  const percentChange = "+1.8%";

  const transactionSummaryData = [
    { label: "Incoming", value: "$6,245.80", color: "text-green-600" },
    { label: "Outgoing", value: "$1,859.55", color: "text-red-600" },
    { label: "Allowances", value: "$350.00", color: "text-amber-600" },
    { label: "This Month", value: "$2,209.55" },
  ];

  const spendingRequestsData = [
    {
      id: "1",
      name: "Emma Smith",
      type: "Purchase",
      amount: "$45.00",
      merchant: "Amazon",
      onApprove: (id: string) => handleApproveSpendingRequest(id),
      onReject: (id: string) => handleRejectSpendingRequest(id),
    },
    {
      id: "2",
      name: "Jacob Smith",
      type: "Game",
      amount: "$19.99",
      merchant: "Nintendo",
      onApprove: (id: string) => handleApproveSpendingRequest(id),
      onReject: (id: string) => handleRejectSpendingRequest(id),
    },
  ];

  const recentTransactionsData = [
    {
      id: "1",
      user: { id: "1", name: "Emma Smith", initials: "ES", department: "Child" },
      date: "Oct 12, 2023",
      time: "10:45 AM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Target",
      merchantLocation: "Online",
      amount: "-$24.50",
      expenseType: "Shopping",
    },
    {
      id: "2",
      user: { id: "2", name: "Jacob Smith", initials: "JS", department: "Child" },
      date: "Oct 12, 2023",
      time: "9:30 AM",
      type: "Outgoing" as const,
      method: "Debit Card",
      merchantName: "McDonalds",
      merchantLocation: "San Francisco, CA",
      amount: "-$12.99",
      expenseType: "Food",
    },
    {
      id: "3",
      user: { id: "1", name: "Emma Smith", initials: "ES", department: "Child" },
      date: "Oct 10, 2023",
      time: "2:15 PM",
      type: "Incoming" as const,
      method: "Wallet",
      merchantName: "Weekly Allowance",
      merchantLocation: "Automatic",
      amount: "+$20.00",
      expenseType: "Allowance",
    },
    {
      id: "4",
      user: { id: "2", name: "Jacob Smith", initials: "JS", department: "Child" },
      date: "Oct 10, 2023",
      time: "2:15 PM",
      type: "Incoming" as const,
      method: "Wallet",
      merchantName: "Weekly Allowance",
      merchantLocation: "Automatic",
      amount: "+$15.00",
      expenseType: "Allowance",
    },
  ];

  const childAccounts = [
    {
      id: "1",
      name: "Emma Smith",
      age: 15,
      walletType: "Teen",
      initials: "ES",
      balance: "$156.50",
      weeklyAllowance: "$20.00",
      savingsGoals: 2,
      lastActivity: "Oct 12, 2023",
      status: "Active" as const,
      onSetAllowance: (id: string) => handleSetAllowanceClick(id),
      onSetRules: (id: string) => handleSetRulesClick(id),
      onViewAccount: (id: string) => handleViewAccount(id),
    },
    {
      id: "2",
      name: "Jacob Smith",
      age: 10,
      walletType: "Child",
      initials: "JS",
      balance: "$87.25",
      weeklyAllowance: "$15.00",
      savingsGoals: 1,
      lastActivity: "Oct 12, 2023",
      status: "Active" as const,
      onSetAllowance: (id: string) => handleSetAllowanceClick(id),
      onSetRules: (id: string) => handleSetRulesClick(id),
      onViewAccount: (id: string) => handleViewAccount(id),
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
  const handleSetAllowanceClick = (childId?: string) => {
    setSelectedChildId(childId);
    setAllowanceModalOpen(true);
  };

  const handleSetRulesClick = (childId?: string) => {
    setSelectedChildId(childId);
    setSpendingRulesModalOpen(true);
  };

  const handleViewAccount = (childId?: string) => {
    toast({
      title: "View Child Account",
      description: `Viewing account details for child ID: ${childId}`,
    });
    // Navigation to child account details would go here
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

  const handleSetAllowance = (childId: string, amount: string, frequency: string, startDate: string, notes: string) => {
    const child = childAccounts.find(child => child.id === childId);
    toast({
      title: "Allowance Set",
      description: `Successfully set ${frequency} allowance of ${amount} for ${child?.name}.`,
    });
  };

  const handleSetSpendingRules = (childId: string, rules: any) => {
    const child = childAccounts.find(child => child.id === childId);
    toast({
      title: "Spending Rules Updated",
      description: `Successfully updated spending rules for ${child?.name}.`,
    });
  };

  const handleApproveSpendingRequest = (requestId: string) => {
    const request = spendingRequestsData.find(req => req.id === requestId);
    toast({
      title: "Request Approved",
      description: `You've approved ${request?.name}'s purchase of ${request?.amount} at ${request?.merchant}.`,
    });
  };

  const handleRejectSpendingRequest = (requestId: string) => {
    const request = spendingRequestsData.find(req => req.id === requestId);
    toast({
      title: "Request Rejected",
      description: `You've rejected ${request?.name}'s purchase of ${request?.amount} at ${request?.merchant}.`,
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
          <h1 className="text-2xl font-bold text-neutral-900">Family Wallet Dashboard</h1>
          <p className="text-sm text-neutral-500">Manage your family's wallets and track spending</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <BalanceCard 
            balance={mainWalletBalance} 
            percentChange={percentChange}
            onAddFunds={handleAddFunds}
            isParent={true}
          />
          
          <TransactionSummary 
            title="Transaction Summary" 
            data={transactionSummaryData} 
          />
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Pending Requests</h2>
            </div>
            <div className="space-y-3">
              {spendingRequestsData.length > 0 ? (
                spendingRequestsData.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-neutral-500">{request.merchant} • {request.amount}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => request.onApprove(request.id)}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => request.onReject(request.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-neutral-500">
                  No pending requests
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <TransactionsTable 
            title="Recent Family Transactions" 
            viewAllLink="/parent/transactions"
            transactions={recentTransactionsData}
            isParent={true}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
          />
        </div>

        <div>
          <ChildAccountsOverview children={childAccounts} />
        </div>

        <AllowanceModal 
          isOpen={allowanceModalOpen}
          onClose={() => {
            setAllowanceModalOpen(false);
            setSelectedChildId(undefined);
          }}
          children={childAccounts.map(child => ({
            id: child.id,
            name: child.name,
            age: child.age
          }))}
          onSetAllowance={handleSetAllowance}
          selectedChildId={selectedChildId}
        />

        <SpendingRulesModal 
          isOpen={spendingRulesModalOpen}
          onClose={() => {
            setSpendingRulesModalOpen(false);
            setSelectedChildId(undefined);
          }}
          children={childAccounts.map(child => ({
            id: child.id,
            name: child.name,
            age: child.age
          }))}
          onSetRules={handleSetSpendingRules}
          selectedChildId={selectedChildId}
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