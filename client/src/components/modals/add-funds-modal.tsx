import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, PlusCircle, DollarSign } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Wallet } from "@shared/schema";
import { type BankAccount } from "../modals/bank-connect-modal";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccount: BankAccount;
  wallets: Wallet[];
  onAddFunds: (bankAccountId: string, walletId: number, amount: string) => void;
  isSubmitting?: boolean;
  error?: string;
}

export default function AddFundsModal({
  isOpen,
  onClose,
  bankAccount,
  wallets,
  onAddFunds,
  isSubmitting = false,
  error,
}: AddFundsModalProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");

  const handleSubmit = () => {
    // Basic validation
    if (!selectedWalletId) {
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Please enter a valid amount greater than 0");
      return;
    }

    setAmountError("");
    onAddFunds(bankAccount.id, parseInt(selectedWalletId), amount);
  };

  const handleCloseModal = () => {
    // Reset form state
    setSelectedWalletId("");
    setAmount("");
    setAmountError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Add Funds</DialogTitle>
          <DialogDescription className="text-center">
            Transfer funds from your bank account to your wallet
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border border-neutral-200 rounded-md p-4 flex items-center">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700 flex-shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-neutral-900">{bankAccount.bankName}</div>
              <div className="text-xs text-neutral-500">
                {bankAccount.accountType} • {bankAccount.accountNumber}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Select wallet</Label>
              <Select
                value={selectedWalletId}
                onValueChange={(value) => setSelectedWalletId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id.toString()}>
                      {wallet.isMain ? "Main Wallet" : "Personal Wallet"} (Balance: ${parseFloat(wallet.balance.toString()).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAmountError("");
                  }}
                />
              </div>
              {amountError && <p className="text-sm text-red-500">{amountError}</p>}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={handleCloseModal} className="sm:flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="sm:flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Add Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}