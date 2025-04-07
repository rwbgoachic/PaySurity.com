import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SpendingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: string, merchant: string, reason: string) => void;
  maxAmount: number;
}

export default function SpendingRequestModal({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
}: SpendingRequestModalProps) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [reason, setReason] = useState("");
  const [amountError, setAmountError] = useState("");
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setMerchant("");
      setReason("");
      setAmountError("");
    }
  }, [isOpen]);

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError("Please enter a valid amount");
      return false;
    }
    
    if (numValue > maxAmount) {
      setAmountError(`Amount cannot exceed your balance ($${maxAmount.toFixed(2)})`);
      return false;
    }
    
    setAmountError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAmount(amount) || !merchant.trim()) {
      return;
    }
    
    onSubmit(amount, merchant, reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Purchase</DialogTitle>
            <DialogDescription>
              Ask your parent for permission to make a purchase.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-neutral-500">$</span>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      validateAmount(e.target.value);
                    }}
                    placeholder="0.00"
                    className="w-full"
                    type="number"
                    step="0.01"
                    min="0"
                    max={maxAmount}
                    required
                  />
                </div>
                {amountError && (
                  <p className="text-sm text-red-600 mt-1">{amountError}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchant" className="text-right">
                Merchant
              </Label>
              <Input
                id="merchant"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Amazon, Nintendo"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reason" className="text-right pt-2">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why do you want to make this purchase?"
                className="col-span-3 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!!amountError}>Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}