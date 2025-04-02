import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeftRight } from "lucide-react";

export interface UserOption {
  id: string;
  name: string;
  department: string;
}

interface AllocateFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserOption[];
  onAllocate: (userId: string, amount: string, note: string, isRecurring: boolean) => void;
  selectedUserId?: string;
}

export default function AllocateFundsModal({ 
  isOpen, 
  onClose, 
  users, 
  onAllocate,
  selectedUserId
}: AllocateFundsModalProps) {
  const [userId, setUserId] = useState(selectedUserId || (users.length > 0 ? users[0].id : ""));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = () => {
    onAllocate(userId, amount, note, isRecurring);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    // Don't reset the userId if a specific user was pre-selected
    if (!selectedUserId) {
      setUserId(users.length > 0 ? users[0].id : "");
    }
    setAmount("");
    setNote("");
    setIsRecurring(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Allocate Funds to User</DialogTitle>
          <DialogDescription className="text-center">
            Transfer funds from the main wallet to a user's sub-wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="user">User</Label>
            <select
              id="user"
              className="w-full rounded-md border border-neutral-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={!!selectedUserId}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.department})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocate-amount">Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-neutral-500 sm:text-sm">$</span>
              </div>
              <Input
                id="allocate-amount"
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
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note to this allocation"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recurrence" 
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
            />
            <Label htmlFor="recurrence" className="text-sm font-normal cursor-pointer">
              Set up recurring allocation
            </Label>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Allocate Funds
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
