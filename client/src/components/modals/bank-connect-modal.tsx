import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  onAddFunds: (id: string) => void;
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
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Select a bank account to add funds to your wallet.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {accounts.length > 0 ? (
            <div className="space-y-3 mb-6">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border"
                >
                  <div>
                    <h3 className="font-medium">{account.bankName}</h3>
                    <p className="text-sm text-neutral-500">
                      {account.accountType} • {account.accountNumber}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => account.onAddFunds(account.id)}
                    >
                      Add Funds
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => account.onRemove(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-4">
              <p className="text-neutral-500 mb-4">No bank accounts connected</p>
            </div>
          )}
          
          <Button
            onClick={onConnectNew}
            variant="outline"
            className="w-full"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Connect New Bank Account
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}