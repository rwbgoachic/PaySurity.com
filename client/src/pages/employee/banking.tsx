import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import BankConnectModal from "@/components/modals/bank-connect-modal";
import { Building, CreditCard, PlusCircle, RefreshCcw, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmployeeBanking() {
  const { toast } = useToast();
  const [bankConnectModalOpen, setBankConnectModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [withdrawFundsModalOpen, setWithdrawFundsModalOpen] = useState(false);
  
  // Sample bank accounts
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
  const handleAddFundsClick = () => {
    setAddFundsModalOpen(true);
  };

  const handleWithdrawFundsClick = () => {
    setWithdrawFundsModalOpen(true);
  };

  const handleAddFunds = (formData: FormData) => {
    const amount = formData.get("amount") as string;
    toast({
      title: "Funds Added",
      description: `$${amount} has been added to your wallet.`,
    });
    setAddFundsModalOpen(false);
  };

  const handleWithdrawFunds = (formData: FormData) => {
    const amount = formData.get("amount") as string;
    toast({
      title: "Funds Withdrawn",
      description: `$${amount} has been withdrawn to your bank account.`,
    });
    setWithdrawFundsModalOpen(false);
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

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Banking</h1>
          <p className="text-sm text-neutral-500">Manage your connected bank accounts and fund transfers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <Wallet className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-bold text-neutral-900 mb-2">My Wallet Balance</h2>
              <p className="text-3xl font-bold text-primary mb-4">$1,250.50</p>
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={handleAddFundsClick}
                  className="flex-1"
                >
                  Add Funds
                </Button>
                <Button 
                  onClick={handleWithdrawFundsClick}
                  variant="outline" 
                  className="flex-1"
                >
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-neutral-900">Recent Transfers</h2>
                <Button variant="ghost" size="sm">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Allocation from Main Wallet</span>
                    <span className="text-sm font-bold text-green-600">+$500.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Oct 10, 2023</span>
                    <span>Completed</span>
                  </div>
                </div>
                
                <div className="p-3 bg-neutral-50 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Withdrawal to Bank of America</span>
                    <span className="text-sm font-bold text-red-600">-$200.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Oct 7, 2023</span>
                    <span>Completed</span>
                  </div>
                </div>
                
                <div className="p-3 bg-neutral-50 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Deposit from Chase</span>
                    <span className="text-sm font-bold text-green-600">+$300.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Oct 5, 2023</span>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-neutral-900">Connected Accounts</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setBankConnectModalOpen(true)}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
              
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="p-3 bg-neutral-50 rounded flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700 mr-3">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{account.bankName}</div>
                        <div className="text-xs text-neutral-500">{account.accountType} • {account.accountNumber}</div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleWithdrawFundsClick}
                    >
                      Transfer
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={() => setBankConnectModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Connect New Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
            <CardDescription>All your transfers to and from your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Amount</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">Oct 10, 2023</td>
                    <td className="px-6 py-4">Allocation from Main Wallet</td>
                    <td className="px-6 py-4">Wallet Transfer</td>
                    <td className="px-6 py-4 text-green-600 font-medium">+$500.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                    </td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">Oct 7, 2023</td>
                    <td className="px-6 py-4">Withdrawal to Bank of America</td>
                    <td className="px-6 py-4">Bank Transfer</td>
                    <td className="px-6 py-4 text-red-600 font-medium">-$200.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                    </td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">Oct 5, 2023</td>
                    <td className="px-6 py-4">Deposit from Chase</td>
                    <td className="px-6 py-4">Bank Transfer</td>
                    <td className="px-6 py-4 text-green-600 font-medium">+$300.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                    </td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">Sep 30, 2023</td>
                    <td className="px-6 py-4">Salary Payment</td>
                    <td className="px-6 py-4">Wallet Transfer</td>
                    <td className="px-6 py-4 text-green-600 font-medium">+$3,850.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4">Sep 28, 2023</td>
                    <td className="px-6 py-4">Withdrawal to Chase</td>
                    <td className="px-6 py-4">Bank Transfer</td>
                    <td className="px-6 py-4 text-red-600 font-medium">-$500.00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <BankConnectModal 
          isOpen={bankConnectModalOpen}
          onClose={() => setBankConnectModalOpen(false)}
          accounts={bankAccounts}
          onConnectNew={handleConnectNewBank}
        />
        
        <Dialog open={addFundsModalOpen} onOpenChange={setAddFundsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funds to Wallet</DialogTitle>
              <DialogDescription>
                Transfer funds from your bank account to your wallet.
              </DialogDescription>
            </DialogHeader>
            
            <form action={handleAddFunds}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">From Bank Account</Label>
                  <select
                    id="bank"
                    name="bank"
                    className="w-full rounded-md border border-neutral-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} ({account.accountType}) - {account.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">$</span>
                    </div>
                    <Input id="amount" name="amount" className="pl-7" placeholder="100.00" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" name="notes" placeholder="e.g., Adding funds for expenses" />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddFundsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Funds</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={withdrawFundsModalOpen} onOpenChange={setWithdrawFundsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Transfer funds from your wallet to a connected bank account.
              </DialogDescription>
            </DialogHeader>
            
            <form action={handleWithdrawFunds}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="toBank">To Bank Account</Label>
                  <select
                    id="toBank"
                    name="toBank"
                    className="w-full rounded-md border border-neutral-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} ({account.accountType}) - {account.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">$</span>
                    </div>
                    <Input id="amount" name="amount" className="pl-7" placeholder="100.00" required />
                  </div>
                  <p className="text-xs text-neutral-500">Your available balance: $1,250.50</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" name="notes" placeholder="e.g., Moving funds to personal account" />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setWithdrawFundsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Withdraw Funds</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
