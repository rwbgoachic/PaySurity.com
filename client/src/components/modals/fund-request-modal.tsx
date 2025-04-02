import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";

interface FundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: string, reason: string, urgency: string) => void;
}

export default function FundRequestModal({ isOpen, onClose, onSubmit }: FundRequestModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState("Standard (1-2 days)");

  const handleSubmit = () => {
    onSubmit(amount, reason, urgency);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount("");
    setReason("");
    setUrgency("Standard (1-2 days)");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Request Additional Funds</DialogTitle>
          <DialogDescription className="text-center">
            Your request will be sent to your employer for approval. You'll be notified once it's processed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-neutral-500 sm:text-sm">$</span>
              </div>
              <Input
                id="amount"
                type="text"
                placeholder="0.00"
                className="pl-7 pr-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-neutral-500 sm:text-sm">USD</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Briefly describe why you need these funds"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <select
              id="urgency"
              className="w-full rounded-md border border-neutral-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option>Standard (1-2 days)</option>
              <option>Urgent (within 24 hours)</option>
              <option>Immediate (ASAP)</option>
            </select>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
