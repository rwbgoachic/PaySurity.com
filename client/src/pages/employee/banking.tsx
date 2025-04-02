import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import BankConnectModal from "@/components/modals/bank-connect-modal";
import NewBankAccountModal from "@/components/modals/new-bank-account-modal";
import AddFundsModal from "@/components/modals/add-funds-modal";
import { type BankAccount } from "@/components/modals/bank-connect-modal";
import { type NewBankAccountFormData } from "@/components/modals/new-bank-account-modal";
import { Plus, Building, AlertTriangle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EmployeeBanking() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bankConnectModalOpen, setBankConnectModalOpen] = useState(false);
  const [newBankAccountModalOpen, setNewBankAccountModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);

  // Fetch bank accounts
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, error: bankAccountsError } = useQuery({
    queryKey: ["/api/bank-accounts"],
    queryFn: async () => {
      const response = await fetch("/api/bank-accounts");
      if (!response.ok) {
        throw new Error("Failed to fetch bank accounts");
      }
      return response.json();
    }
  });

  // Fetch wallets
  const { data: wallets = [], isLoading: isLoadingWallets, error: walletsError } = useQuery({
    queryKey: ["/api/wallets"],
    queryFn: async () => {
      const response = await fetch("/api/wallets");
      if (!response.ok) {
        throw new Error("Failed to fetch wallets");
      }
      return response.json();
    }
  });

  // Create bank account mutation
  const createBankAccountMutation = useMutation({
    mutationFn: async (data: NewBankAccountFormData) => {
      const res = await apiRequest("POST", "/api/bank-accounts", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create bank account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setNewBankAccountModalOpen(false);
      toast({
        title: "Bank account connected",
        description: "Your bank account has been successfully connected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete bank account mutation
  const deleteBankAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/bank-accounts/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete bank account");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      toast({
        title: "Bank account removed",
        description: "The bank account has been successfully removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ bankAccountId, walletId, amount }: { bankAccountId: string, walletId: number, amount: string }) => {
      const res = await apiRequest("POST", `/api/bank-accounts/${bankAccountId}/add-funds`, { walletId, amount });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add funds");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setAddFundsModalOpen(false);
      toast({
        title: "Funds added",
        description: "Funds have been successfully added to your wallet.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format bank accounts for the BankConnectModal
  const formattedBankAccounts: BankAccount[] = bankAccounts.map((account: any) => ({
    ...account,
    onAddFunds: (id: string) => {
      const bankAccount = bankAccounts.find((acc: any) => acc.id.toString() === id);
      if (bankAccount) {
        setSelectedBankAccount(bankAccount);
        setAddFundsModalOpen(true);
      }
    },
    onRemove: (id: string) => {
      if (confirm("Are you sure you want to remove this bank account?")) {
        deleteBankAccountMutation.mutate(id);
      }
    },
  }));

  // Handle connecting a new bank account
  const handleConnectNewBankAccount = (data: NewBankAccountFormData) => {
    createBankAccountMutation.mutate(data);
  };

  // Handle adding funds
  const handleAddFunds = (bankAccountId: string, walletId: number, amount: string) => {
    addFundsMutation.mutate({ bankAccountId, walletId, amount });
  };

  // Get transaction history
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions");
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    }
  });

  // Filter to show only deposit transactions
  const depositTransactions = transactions.filter((transaction: any) => 
    transaction.type === "incoming" && 
    transaction.expenseType === "deposit" &&
    transaction.method === "ach"
  ).slice(0, 5); // Get only the latest 5

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Banking</h1>
            <p className="text-neutral-500">Manage your connected bank accounts and fund your wallet</p>
          </div>
          <Button 
            onClick={() => setBankConnectModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
            Manage Bank Accounts
          </Button>
        </div>

        {walletsError || bankAccountsError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(walletsError as Error)?.message || (bankAccountsError as Error)?.message || "Failed to load data"}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Wallet</CardTitle>
              <CardDescription>Current balance and funding options</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWallets ? (
                <div className="py-6 text-center text-neutral-500">Loading wallet...</div>
              ) : wallets.length === 0 ? (
                <div className="py-6 text-center text-neutral-500">
                  <p>No wallet found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wallets.map((wallet: any) => (
                    <div key={wallet.id} className="border border-neutral-200 rounded-md p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-sm font-medium">
                            {wallet.isMain ? "Main Wallet" : "Personal Wallet"}
                          </div>
                          <div className="text-xs text-neutral-500">ID: {wallet.id}</div>
                        </div>
                        <div className="text-3xl font-semibold">${parseFloat(wallet.balance.toString()).toFixed(2)}</div>
                      </div>
                      
                      {wallet.monthlyLimit && (
                        <div className="py-2 border-t border-neutral-200 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Monthly Limit:</span>
                            <span className="text-sm font-medium">${parseFloat(wallet.monthlyLimit.toString()).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      
                      {formattedBankAccounts.length > 0 ? (
                        <Button 
                          className="w-full mt-4"
                          onClick={() => {
                            setSelectedBankAccount(formattedBankAccounts[0]);
                            setAddFundsModalOpen(true);
                          }}
                        >
                          Add Funds to Wallet
                        </Button>
                      ) : (
                        <Button 
                          className="w-full mt-4"
                          variant="outline"
                          onClick={() => setNewBankAccountModalOpen(true)}
                        >
                          Connect Bank Account to Add Funds
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Your connected financial accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBankAccounts ? (
                <div className="py-6 text-center text-neutral-500">Loading bank accounts...</div>
              ) : formattedBankAccounts.length === 0 ? (
                <div className="py-6 text-center text-neutral-500">
                  <p>No bank accounts connected</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setNewBankAccountModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Bank Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formattedBankAccounts.map((account) => (
                    <div key={account.id} className="border border-neutral-200 rounded-md p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium">{account.bankName}</div>
                          <div className="text-xs text-neutral-500">
                            {account.accountType} • ••••{account.accountNumber.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedBankAccount(account);
                            setAddFundsModalOpen(true);
                          }}
                        >
                          Add Funds
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setNewBankAccountModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect New Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Fund Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Fund Transfers</CardTitle>
            <CardDescription>Recent transfers from your bank accounts to your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="py-6 text-center text-neutral-500">Loading transactions...</div>
            ) : depositTransactions.length === 0 ? (
              <div className="py-6 text-center text-neutral-500">
                <p>No transfers found</p>
                {formattedBankAccounts.length > 0 && wallets.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedBankAccount(formattedBankAccounts[0]);
                      setAddFundsModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Make Your First Transfer
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {depositTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="border border-neutral-200 rounded-md p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-700">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">{transaction.merchantName}</div>
                        <div className="text-xs text-neutral-500">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.sourceOfFunds}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">+${parseFloat(transaction.amount.toString()).toFixed(2)}</div>
                        <div className="text-xs text-neutral-500">Deposit</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Connect Modal */}
        <BankConnectModal
          isOpen={bankConnectModalOpen}
          onClose={() => setBankConnectModalOpen(false)}
          accounts={formattedBankAccounts}
          onConnectNew={() => {
            setBankConnectModalOpen(false);
            setNewBankAccountModalOpen(true);
          }}
        />

        {/* New Bank Account Modal */}
        <NewBankAccountModal
          isOpen={newBankAccountModalOpen}
          onClose={() => setNewBankAccountModalOpen(false)}
          onSubmit={handleConnectNewBankAccount}
          isSubmitting={createBankAccountMutation.isPending}
          error={createBankAccountMutation.error?.message}
          userId={user?.id || 0}
        />

        {/* Add Funds Modal */}
        {selectedBankAccount && (
          <AddFundsModal
            isOpen={addFundsModalOpen}
            onClose={() => setAddFundsModalOpen(false)}
            bankAccount={selectedBankAccount}
            wallets={wallets}
            onAddFunds={handleAddFunds}
            isSubmitting={addFundsMutation.isPending}
            error={addFundsMutation.error?.message}
          />
        )}
      </div>
    </Layout>
  );
}