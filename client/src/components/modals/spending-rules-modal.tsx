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
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

interface ChildSelectOption {
  id: string;
  name: string;
  age: number;
}

interface SpendingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ChildSelectOption[];
  onSetRules: (childId: string, rules: any) => void;
  selectedChildId?: string;
}

export default function SpendingRulesModal({
  isOpen,
  onClose,
  children,
  onSetRules,
  selectedChildId,
}: SpendingRulesModalProps) {
  const [childId, setChildId] = useState(selectedChildId || "");
  const [dailyLimit, setDailyLimit] = useState("");
  const [weeklyLimit, setWeeklyLimit] = useState("");
  const [transactionLimit, setTransactionLimit] = useState("");
  const [requireApproval, setRequireApproval] = useState(true);
  const [notifyOnTransaction, setNotifyOnTransaction] = useState(true);
  const [restrictedCategories, setRestrictedCategories] = useState<string[]>([]);
  const [restrictedMerchants, setRestrictedMerchants] = useState("");
  
  // Reset the form when opening the modal or when selectedChildId changes
  useEffect(() => {
    if (isOpen) {
      if (selectedChildId) {
        setChildId(selectedChildId);
      } else {
        setChildId(children[0]?.id || "");
      }
      setDailyLimit("20");
      setWeeklyLimit("50");
      setTransactionLimit("25");
      setRequireApproval(true);
      setNotifyOnTransaction(true);
      setRestrictedCategories(["gambling", "adult"]);
      setRestrictedMerchants("");
    }
  }, [isOpen, selectedChildId, children]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rules = {
      dailyLimit: dailyLimit ? parseFloat(dailyLimit) : null,
      weeklyLimit: weeklyLimit ? parseFloat(weeklyLimit) : null,
      transactionLimit: transactionLimit ? parseFloat(transactionLimit) : null,
      requireApproval,
      notifyOnTransaction,
      restrictedCategories,
      restrictedMerchants: restrictedMerchants
        ? restrictedMerchants.split(",").map(m => m.trim())
        : [],
    };
    
    onSetRules(childId, rules);
    onClose();
  };

  const categories = [
    { id: "gambling", label: "Gambling" },
    { id: "adult", label: "Adult Content" },
    { id: "gaming", label: "Gaming" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "social", label: "Social Media" },
    { id: "inapp", label: "In-App Purchases" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Spending Rules</DialogTitle>
            <DialogDescription>
              Configure spending rules and restrictions for your child's wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4 mb-4">
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
            </div>
              
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="spending-limits">
                <AccordionTrigger className="text-base font-medium">
                  Spending Limits
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="daily-limit" className="text-right">
                        Daily Limit ($)
                      </Label>
                      <Input
                        id="daily-limit"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(e.target.value)}
                        placeholder="0.00"
                        className="col-span-3"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="weekly-limit" className="text-right">
                        Weekly Limit ($)
                      </Label>
                      <Input
                        id="weekly-limit"
                        value={weeklyLimit}
                        onChange={(e) => setWeeklyLimit(e.target.value)}
                        placeholder="0.00"
                        className="col-span-3"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="transaction-limit" className="text-right">
                        Per Transaction ($)
                      </Label>
                      <Input
                        id="transaction-limit"
                        value={transactionLimit}
                        onChange={(e) => setTransactionLimit(e.target.value)}
                        placeholder="0.00"
                        className="col-span-3"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="approval-settings">
                <AccordionTrigger className="text-base font-medium">
                  Approval Settings
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="require-approval">Require Purchase Approval</Label>
                        <p className="text-sm text-neutral-500">
                          Child must request approval for purchases above transaction limit
                        </p>
                      </div>
                      <Switch
                        id="require-approval"
                        checked={requireApproval}
                        onCheckedChange={setRequireApproval}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-transaction">Transaction Notifications</Label>
                        <p className="text-sm text-neutral-500">
                          Receive notifications for all child transactions
                        </p>
                      </div>
                      <Switch
                        id="notify-transaction"
                        checked={notifyOnTransaction}
                        onCheckedChange={setNotifyOnTransaction}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="restrictions">
                <AccordionTrigger className="text-base font-medium">
                  Restrictions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label className="mb-2 block">Restricted Categories</Label>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={restrictedCategories.includes(category.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setRestrictedCategories([...restrictedCategories, category.id]);
                                } else {
                                  setRestrictedCategories(
                                    restrictedCategories.filter((c) => c !== category.id)
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="text-sm font-normal"
                            >
                              {category.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="restricted-merchants" className="mb-2 block">
                        Restricted Merchants
                      </Label>
                      <Input
                        id="restricted-merchants"
                        value={restrictedMerchants}
                        onChange={(e) => setRestrictedMerchants(e.target.value)}
                        placeholder="e.g. Steam, Roblox (comma separated)"
                        className="w-full"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Rules</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}