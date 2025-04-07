import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ChildAccount {
  id: string;
  name: string;
  age: number;
  walletType: string;
  initials: string;
  balance: string;
  weeklyAllowance: string;
  savingsGoals: number;
  lastActivity: string;
  status: "Active" | "Inactive" | "Locked";
  onSetAllowance: (id: string) => void;
  onSetRules: (id: string) => void;
  onViewAccount: (id: string) => void;
}

interface ChildAccountsOverviewProps {
  children: ChildAccount[];
  onAddChild?: () => void;
}

export default function ChildAccountsOverview({ children, onAddChild }: ChildAccountsOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Child Accounts</CardTitle>
          <CardDescription>Manage your children's wallets and allowances</CardDescription>
        </div>
        {onAddChild && (
          <Button size="sm" onClick={onAddChild}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age / Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Allowance</TableHead>
              <TableHead>Savings Goals</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {child.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{child.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{child.age} years</span>
                    <span className="text-xs text-neutral-500">{child.walletType}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{child.balance}</TableCell>
                <TableCell>{child.weeklyAllowance}/week</TableCell>
                <TableCell>{child.savingsGoals}</TableCell>
                <TableCell>{child.lastActivity}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      child.status === "Active"
                        ? "default"
                        : child.status === "Inactive"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {child.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => child.onViewAccount(child.id)}>
                        View Account
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => child.onSetAllowance(child.id)}>
                        Set Allowance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => child.onSetRules(child.id)}>
                        Set Spending Rules
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}