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
import TransferToBankModal from "@/components/modals/transfer-to-bank-modal";
import { type BankAccount } from "@/components/modals/bank-connect-modal";
import { type NewBankAccountFormData } from "@/components/modals/new-bank-account-modal";
import { type Wallet } from "@/components/modals/transfer-to-bank-modal";
import { Plus, Building, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Banking() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bankConnectModalOpen, setBankConnectModalOpen] = useState(false);
  const [newBankAccountModalOpen, setNewBankAccountModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [transferToBankModalOpen, setTransferToBankModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

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

  // Transfer to bank mutation
  const transferToBankMutation = useMutation({
    mutationFn: async ({ walletId, bankAccountId, amount }: { walletId: number, bankAccountId: string, amount: string }) => {
      const res = await apiRequest("POST", `/api/wallets/${walletId}/transfer-to-bank`, { bankAccountId: parseInt(bankAccountId), amount });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to transfer funds to bank account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setTransferToBankModalOpen(false);
      toast({
        title: "Funds transferred",
        description: "Funds have been successfully transferred to your bank account.",
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

  // Handle transferring funds to bank
  const handleTransferToBank = (walletId: number, bankAccountId: string, amount: string) => {
    transferToBankMutation.mutate({ walletId, bankAccountId, amount });
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Banking</h1>
            <p className="text-neutral-500">Manage your connected bank accounts and transfer funds</p>
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
              <CardTitle>Connected Bank Accounts</CardTitle>
              <CardDescription>Your linked financial accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBankAccounts ? (
                <div className="py-6 text-center text-neutral-500">Loading bank accounts...</div>
              ) : formattedBankAccounts.length === 0 ? (
                <div className="py-6 text-center text-neutral-500">
                  <p>No bank accounts connected</p>
                  <Button 
                    variant="outline" 
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
                          variant="outline" 
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
                    Connect Another Bank Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Wallets</CardTitle>
              <CardDescription>Wallets available for funding</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWallets ? (
                <div className="py-6 text-center text-neutral-500">Loading wallets...</div>
              ) : wallets.length === 0 ? (
                <div className="py-6 text-center text-neutral-500">
                  <p>No wallets found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wallets.map((wallet: any) => (
                    <div key={wallet.id} className="border border-neutral-200 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">
                            {wallet.isMain ? "Main Wallet" : "Personal Wallet"}
                          </div>
                          <div className="text-xs text-neutral-500">ID: {wallet.id}</div>
                        </div>
                        <div className="text-xl font-semibold">${parseFloat(wallet.balance.toString()).toFixed(2)}</div>
                      </div>
                      {wallet.monthlyLimit && (
                        <div className="mt-2 text-xs text-neutral-500">
                          Monthly Limit: ${parseFloat(wallet.monthlyLimit.toString()).toFixed(2)}
                        </div>
                      )}
                      {formattedBankAccounts.length > 0 && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            className="flex-1"
                            variant="outline"
                            onClick={() => {
                              setSelectedBankAccount(formattedBankAccounts[0]);
                              setAddFundsModalOpen(true);
                            }}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Add Funds
                          </Button>
                          <Button 
                            className="flex-1"
                            variant="outline"
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setTransferToBankModalOpen(true);
                            }}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Transfer to Bank
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

        {/* Transfer to Bank Modal */}
        {selectedWallet && (
          <TransferToBankModal
            isOpen={transferToBankModalOpen}
            onClose={() => setTransferToBankModalOpen(false)}
            bankAccounts={formattedBankAccounts}
            wallets={[selectedWallet]}
            onTransferFunds={handleTransferToBank}
            isSubmitting={transferToBankMutation.isPending}
            error={transferToBankMutation.error?.message}
          />
        )}
      </div>
    </Layout>
  );
}