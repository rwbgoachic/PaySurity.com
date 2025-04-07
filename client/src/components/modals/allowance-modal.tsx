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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface ChildSelectOption {
  id: string;
  name: string;
  age: number;
}

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ChildSelectOption[];
  onSetAllowance: (childId: string, amount: string, frequency: string, startDate: string, notes: string) => void;
  selectedChildId?: string;
}

export default function AllowanceModal({
  isOpen,
  onClose,
  children,
  onSetAllowance,
  selectedChildId,
}: AllowanceModalProps) {
  const [childId, setChildId] = useState(selectedChildId || "");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  
  // Reset the form when opening the modal or when selectedChildId changes
  useEffect(() => {
    if (isOpen) {
      if (selectedChildId) {
        setChildId(selectedChildId);
      } else {
        setChildId(children[0]?.id || "");
      }
      setAmount("");
      setFrequency("weekly");
      setDate(new Date());
      setNotes("");
    }
  }, [isOpen, selectedChildId, children]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !amount || !frequency || !date) return;
    
    onSetAllowance(
      childId,
      amount,
      frequency,
      format(date, "PP"),
      notes,
    );
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Allowance</DialogTitle>
            <DialogDescription>
              Configure regular allowance payments for your child.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="child" className="text-right">
                Child
              </Label>
              <Select
                value={childId}
                onValueChange={setChildId}
                disabled={!!selectedChildId}
              >
                <SelectTrigger className="col-span-3" id="child">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} ({child.age} years)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Select
                value={frequency}
                onValueChange={setFrequency}
              >
                <SelectTrigger className="col-span-3" id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-3 text-left font-normal justify-start"
                    id="startDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this allowance"
                className="col-span-3 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Set Allowance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}