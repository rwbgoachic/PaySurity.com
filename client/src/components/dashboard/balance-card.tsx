import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface BalanceCardProps {
  balance: string;
  percentChange?: string;
  isActive?: boolean;
  monthlyLimit?: string;
  onAllocateFunds?: () => void;
  onAddFunds?: () => void;
  onRequestFunds?: () => void;
  onTransferFunds?: () => void;
  isEmployer?: boolean;
}

export default function BalanceCard({
  balance,
  percentChange,
  isActive = true,
  monthlyLimit,
  onAllocateFunds,
  onAddFunds,
  onRequestFunds,
  onTransferFunds,
  isEmployer = true
}: BalanceCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-neutral-700">
            {isEmployer ? "Available Balance" : "My Available Balance"}
          </h2>
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
        <div className="mt-4 flex justify-between">
          {isEmployer ? (
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
          ) : (
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
