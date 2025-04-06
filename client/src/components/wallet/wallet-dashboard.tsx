import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BarChart4, Clock } from "lucide-react";
import { formatCurrency } from "@/hooks/use-wallet";
import { WalletSelector } from "./wallet-selector";
import { TransactionsList } from "./transactions-list";
import { CreateWalletDialog } from "./create-wallet-dialog";
import { useWallets, useTransactions } from "@/hooks/use-wallet";

export function WalletDashboard() {
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [createWalletOpen, setCreateWalletOpen] = useState(false);
  
  // Fetch wallets
  const { data: wallets = [], isLoading: walletsLoading } = useWallets();
  
  // Set the first wallet as selected when data loads
  if (wallets.length > 0 && selectedWalletId === null) {
    // Find the main wallet first, otherwise use the first wallet
    const mainWallet = wallets.find(wallet => wallet.isMain);
    setSelectedWalletId(mainWallet ? mainWallet.id : wallets[0].id);
  }
  
  // Fetch transactions for the selected wallet
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(selectedWalletId);
  
  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, wallet) => {
    return sum + parseFloat(wallet.balance);
  }, 0);
  
  // Handle wallet selection
  const handleSelectWallet = (walletId: number) => {
    setSelectedWalletId(walletId);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your digital wallets and transactions.
          </p>
        </div>
        <Button onClick={() => setCreateWalletOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Wallet
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance.toString())}</div>
            <p className="text-xs text-muted-foreground">
              Across all {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Transaction{transactions.length !== 1 ? 's' : ''} in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Wallet Selector */}
      <div className="border rounded-lg p-4 bg-card">
        <h2 className="text-lg font-semibold mb-4">Your Wallets</h2>
        {walletsLoading ? (
          <p className="text-muted-foreground">Loading wallets...</p>
        ) : wallets.length > 0 ? (
          <WalletSelector 
            wallets={wallets} 
            selectedWalletId={selectedWalletId} 
            onSelectWallet={handleSelectWallet} 
          />
        ) : (
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">You don't have any wallets yet.</p>
            <Button onClick={() => setCreateWalletOpen(true)}>Create Your First Wallet</Button>
          </div>
        )}
      </div>
      
      {/* Wallet Details & Transactions */}
      {selectedWalletId && (
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Wallet Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <TransactionsList 
              transactions={transactions} 
              isLoading={transactionsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Settings</CardTitle>
                <CardDescription>
                  Manage your wallet preferences and spending limits.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Wallet settings functionality coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Create Wallet Dialog */}
      <CreateWalletDialog 
        open={createWalletOpen} 
        onOpenChange={setCreateWalletOpen} 
      />
    </div>
  );
}