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
import { Switch } from "@/components/ui/switch";

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, amount: string, description: string) => void;
  initialValues?: {
    name: string;
    amount: string;
    description: string;
  };
}

export default function SavingsGoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: SavingsGoalModalProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [amount, setAmount] = useState(initialValues?.amount || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [requestParentMatch, setRequestParentMatch] = useState(false);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setName(initialValues.name);
        setAmount(initialValues.amount);
        setDescription(initialValues.description);
      } else {
        setName("");
        setAmount("");
        setDescription("");
        setRequestParentMatch(false);
      }
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount.trim()) return;
    
    const formattedDescription = requestParentMatch
      ? `${description} (Parent match requested)`
      : description;
      
    onSubmit(name, amount, formattedDescription);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
            <DialogDescription>
              Set up a new goal to save for something special.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Goal Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nintendo Switch"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Target Amount
              </Label>
              <div className="col-span-3 flex items-center">
                <span className="mr-2 text-sm text-neutral-500">$</span>
                <Input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why do you want to save for this?"
                className="col-span-3 resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4 flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="request-match">Request Parent Match</Label>
                  <p className="text-sm text-neutral-500">
                    Ask your parents to match a percentage of what you save
                  </p>
                </div>
                <Switch
                  id="request-match"
                  checked={requestParentMatch}
                  onCheckedChange={setRequestParentMatch}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}