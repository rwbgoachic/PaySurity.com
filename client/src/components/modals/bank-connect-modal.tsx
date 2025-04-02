import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, X, Building, CreditCard, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  isActive: boolean;
  userId: number;
  onAddFunds?: (id: string) => void;
  onRemove: (id: string) => void;
}

interface BankConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onConnectNew: () => void;
}

export default function BankConnectModal({
  isOpen,
  onClose,
  accounts,
  onConnectNew,
}: BankConnectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Connected Bank Accounts</DialogTitle>
          <DialogDescription className="text-center">
            Add or remove your bank accounts to transfer funds to and from your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 space-y-4">
          <div className="border border-neutral-200 rounded-md divide-y divide-neutral-200">
            {accounts.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">
                <p>No bank accounts connected</p>
                <p className="text-sm">Click below to connect your first account</p>
              </div>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                        {account.bankName}
                        {account.isActive ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">{account.accountType} • {account.accountNumber}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {account.onAddFunds && account.isActive && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => account.onAddFunds && account.onAddFunds(account.id)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add funds to wallet</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => account.onRemove(account.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove account</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={onConnectNew}
          >
            <Plus className="h-5 w-5 mr-2 text-neutral-500" />
            Connect New Bank Account
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
