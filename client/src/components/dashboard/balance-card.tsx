import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface BalanceCardProps {
  balance: string;
  percentChange?: string;
  allowance?: string; // For child accounts
  isActive?: boolean;
  monthlyLimit?: string;
  onAllocateFunds?: () => void;
  onAddFunds?: () => void;
  onRequestFunds?: () => void;
  onTransferFunds?: () => void;
  onRequestPurchase?: () => void; // For child accounts
  isEmployer?: boolean;
  isParent?: boolean;
  isChild?: boolean;
}

export default function BalanceCard({
  balance,
  percentChange,
  allowance,
  isActive = true,
  monthlyLimit,
  onAllocateFunds,
  onAddFunds,
  onRequestFunds,
  onTransferFunds,
  onRequestPurchase,
  isEmployer = false,
  isParent = false,
  isChild = false
}: BalanceCardProps) {
  // Determine the card title based on role
  let cardTitle = "Available Balance";
  
  if (isEmployer) {
    cardTitle = "Available Balance";
  } else if (isParent) {
    cardTitle = "Family Wallet Balance";
  } else if (isChild) {
    cardTitle = "My Wallet Balance";
  } else {
    cardTitle = "My Available Balance";
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-neutral-700">{cardTitle}</h2>
          {isActive && (
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-neutral-900">{balance}</span>
          {percentChange && (
            <span className="ml-2 text-sm text-green-600 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {percentChange}
            </span>
          )}
          {monthlyLimit && (
            <div className="ml-2 text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
              Monthly Limit: {monthlyLimit}
            </div>
          )}
        </div>
        
        {/* Display allowance for child accounts */}
        {isChild && allowance && (
          <div className="mt-2">
            <span className="text-sm text-neutral-600">Weekly Allowance: </span>
            <span className="text-sm font-medium">{allowance}</span>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          {/* Employer buttons */}
          {isEmployer && (
            <>
              {onAllocateFunds && (
                <Button
                  onClick={onAllocateFunds}
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Allocate Funds
                </Button>
              )}
              {onAddFunds && (
                <Button
                  onClick={onAddFunds}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Add Funds
                </Button>
              )}
            </>
          )}
          
          {/* Parent buttons */}
          {isParent && (
            <>
              {onAddFunds && (
                <Button
                  onClick={onAddFunds}
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Add Funds
                </Button>
              )}
              {onTransferFunds && (
                <Button
                  onClick={onTransferFunds}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Transfer Funds
                </Button>
              )}
            </>
          )}
          
          {/* Child buttons */}
          {isChild && (
            <>
              {onRequestPurchase && (
                <Button
                  onClick={onRequestPurchase}
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Request Purchase
                </Button>
              )}
              {onTransferFunds && (
                <Button
                  onClick={onTransferFunds}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Add to Savings
                </Button>
              )}
            </>
          )}
          
          {/* Employee buttons */}
          {!isEmployer && !isParent && !isChild && (
            <>
              {onRequestFunds && (
                <Button
                  onClick={onRequestFunds}
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Request Funds
                </Button>
              )}
              {onTransferFunds && (
                <Button
                  onClick={onTransferFunds}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1.5"
                >
                  Transfer Funds
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
