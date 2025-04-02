import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type BankAccount } from "./bank-connect-modal";

export interface Wallet {
  id: number;
  name: string;
  isMain: boolean;
  balance: string;
  userId: number;
  monthlyLimit?: string;
}

interface TransferToBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  wallets: Wallet[];
  onTransferFunds: (walletId: number, bankAccountId: string, amount: string) => void;
  isSubmitting?: boolean;
  error?: string;
}

export default function TransferToBankModal({
  isOpen,
  onClose,
  bankAccounts,
  wallets,
  onTransferFunds,
  isSubmitting,
  error,
}: TransferToBankModalProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(
    wallets.length > 0 ? wallets[0].id : null
  );
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(
    bankAccounts.length > 0 ? bankAccounts[0].id.toString() : null
  );
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  // Get the selected wallet
  const selectedWallet = wallets.find(wallet => wallet.id === selectedWalletId);
  const walletBalance = selectedWallet ? parseFloat(selectedWallet.balance.toString()) : 0;

  // Handle form submission
  const handleSubmit = () => {
    // Clear previous errors
    setAmountError("");

    // Validate input
    if (!selectedWalletId) {
      return;
    }

    if (!selectedBankAccountId) {
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > walletBalance) {
      setAmountError("Insufficient balance in wallet");
      return;
    }

    // Call the transfer function
    onTransferFunds(selectedWalletId, selectedBankAccountId, amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => {
      if (!isOpen) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer to Bank Account</DialogTitle>
          <DialogDescription>
            Transfer funds from your wallet to your connected bank account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="wallet">From Wallet</Label>
            <Select 
              value={selectedWalletId?.toString() || ""} 
              onValueChange={value => setSelectedWalletId(parseInt(value))}
            >
              <SelectTrigger id="wallet">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id.toString()}>
                    {wallet.isMain ? "Main Wallet" : wallet.name || "Personal Wallet"} (${parseFloat(wallet.balance.toString()).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank-account">To Bank Account</Label>
            <Select 
              value={selectedBankAccountId || ""} 
              onValueChange={setSelectedBankAccountId}
            >
              <SelectTrigger id="bank-account">
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.bankName} • {account.accountType} (••••{account.accountNumber.slice(-4)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={amountError ? "border-red-500" : ""}
            />
            {amountError && (
              <p className="text-sm text-red-500">{amountError}</p>
            )}
            {selectedWallet && (
              <p className="text-sm text-neutral-500">
                Available Balance: ${parseFloat(selectedWallet.balance.toString()).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="w-full sm:w-auto"
            disabled={isSubmitting || !selectedWalletId || !selectedBankAccountId || !amount || parseFloat(amount) <= 0}
          >
            {isSubmitting ? "Processing..." : "Transfer Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}