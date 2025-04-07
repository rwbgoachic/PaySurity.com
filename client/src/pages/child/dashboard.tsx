import { useState } from "react";
import Layout from "@/components/layout/layout";
import BalanceCard from "@/components/dashboard/balance-card";
import TransactionSummary from "@/components/dashboard/transaction-summary";
import SavingsGoalsDisplay from "@/components/child/savings-goals-display";
import TransactionsTable from "@/components/transactions/transactions-table";
import SpendingRequestModal from "@/components/modals/spending-request-modal";
import SavingsGoalModal from "@/components/modals/savings-goal-modal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ChildDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [savingsGoalModalOpen, setSavingsGoalModalOpen] = useState(false);

  // Sample data for the child dashboard
  const walletBalance = "$87.25";
  const weeklyAllowance = "$15.00";

  const transactionSummaryData = [
    { label: "This Week", value: "$12.99", color: "text-red-600" },
    { label: "Last Allowance", value: "$15.00", color: "text-green-600" },
    { label: "Savings", value: "$45.50", color: "text-cyan-600" },
    { label: "Next Allowance", value: "Saturday", color: "text-amber-600" },
  ];

  const savingsGoalsData = [
    {
      id: "1",
      name: "Nintendo Switch",
      targetAmount: "$299.99",
      currentAmount: "$45.50",
      percentComplete: 15,
      parentMatching: "25%",
      estimatedCompletion: "Dec 25, 2023",
      onAddFunds: (id: string) => handleAddFundsToGoal(id),
      onViewDetails: (id: string) => handleViewGoalDetails(id),
    },
  ];

  const recentTransactionsData = [
    {
      id: "1",
      date: "Oct 12, 2023",
      time: "9:30 AM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "McDonalds",
      merchantLocation: "San Francisco, CA",
      amount: "-$12.99",
      expenseType: "Food",
      isUserEditable: false,
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "2",
      date: "Oct 10, 2023",
      time: "2:15 PM",
      type: "Incoming" as const,
      method: "Wallet",
      merchantName: "Weekly Allowance",
      merchantLocation: "Automatic",
      amount: "+$15.00",
      expenseType: "Allowance",
      isUserEditable: false,
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "3",
      date: "Oct 10, 2023",
      time: "2:30 PM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "Nintendo Switch Savings",
      merchantLocation: "Transfer",
      amount: "-$5.00",
      expenseType: "Savings",
      isUserEditable: false,
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
    {
      id: "4",
      date: "Oct 8, 2023",
      time: "11:45 AM",
      type: "Outgoing" as const,
      method: "Wallet",
      merchantName: "App Store",
      merchantLocation: "Online",
      amount: "-$1.99",
      expenseType: "Entertainment",
      isUserEditable: false,
      onViewDetails: (id: string) => handleViewTransactionDetails(id),
    },
  ];

  // Event handlers
  const handleSpendingRequest = (amount: string, merchant: string, reason: string) => {
    toast({
      title: "Purchase Request Submitted",
      description: `Your request for $${amount} at ${merchant} has been sent to your parent for approval.`,
    });
    setRequestModalOpen(false);
  };

  const handleViewTransactionDetails = (transactionId: string) => {
    toast({
      title: "Transaction Details",
      description: `Viewing details for transaction #${transactionId}.`,
    });
  };

  const handleAddFundsToGoal = (goalId: string) => {
    toast({
      title: "Funds Added",
      description: "You've added funds to your savings goal.",
    });
  };

  const handleViewGoalDetails = (goalId: string) => {
    toast({
      title: "Savings Goal Details",
      description: "Viewing details of your savings goal.",
    });
  };

  const handleCreateSavingsGoal = (name: string, amount: string, description: string) => {
    toast({
      title: "Savings Goal Created",
      description: `Your savings goal "${name}" for $${amount} has been created.`,
    });
    setSavingsGoalModalOpen(false);
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
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <BalanceCard 
            balance={walletBalance} 
            allowance={weeklyAllowance}
            onRequestPurchase={() => setRequestModalOpen(true)}
            isChild={true}
          />
          
          <TransactionSummary 
            title="My Wallet Summary" 
            data={transactionSummaryData} 
          />
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRequestModalOpen(true)}
                className="p-3 bg-primary text-white rounded-md text-sm font-medium transition hover:bg-primary/90"
              >
                Request Purchase
              </button>
              <button
                onClick={() => setSavingsGoalModalOpen(true)}
                className="p-3 bg-cyan-600 text-white rounded-md text-sm font-medium transition hover:bg-cyan-700"
              >
                New Savings Goal
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <SavingsGoalsDisplay 
            goals={savingsGoalsData} 
            onCreateNew={() => setSavingsGoalModalOpen(true)}
          />
        </div>
        
        <div className="mb-6">
          <TransactionsTable 
            title="My Recent Transactions" 
            viewAllLink="/child/transactions"
            transactions={recentTransactionsData}
            isChild={true}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
          />
        </div>

        <SpendingRequestModal 
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          onSubmit={handleSpendingRequest}
          maxAmount={parseFloat(walletBalance.replace('$', ''))}
        />

        <SavingsGoalModal 
          isOpen={savingsGoalModalOpen}
          onClose={() => setSavingsGoalModalOpen(false)}
          onSubmit={handleCreateSavingsGoal}
        />
      </div>
    </Layout>
  );
}