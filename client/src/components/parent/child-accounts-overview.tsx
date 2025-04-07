import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  MoreVertical,
  PiggyBank,
  Settings,
  CreditCard,
  User,
  Clock,
  Plus,
  Bell,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface ChildAccount {
  id: string;
  name: string;
  age: number;
  balances: {
    spendable: string;
    savings: string;
    total: string;
  };
  allowance?: {
    amount: string;
    frequency: "weekly" | "biweekly" | "monthly";
    autoDeposit: boolean;
  };
  savingsGoalsCount: number;
  spendingRequestsCount: number;
}

interface ChildAccountsOverviewProps {
  childAccounts: ChildAccount[];
  onManageAllowance: (childId: string) => void;
  onManageSpendingRules: (childId: string) => void;
  onViewChildDetails: (childId: string) => void;
  onAddChild?: () => void;
}

export default function ChildAccountsOverview({
  childAccounts,
  onManageAllowance,
  onManageSpendingRules,
  onViewChildDetails,
  onAddChild,
}: ChildAccountsOverviewProps) {
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "biweekly":
        return "Every 2 Weeks";
      case "monthly":
        return "Monthly";
      default:
        return frequency;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Child Accounts</h2>
          <p className="text-muted-foreground">Manage your children's accounts and allowances</p>
        </div>
        {onAddChild && (
          <Button onClick={onAddChild} className="gap-1">
            <Plus className="h-4 w-4" /> Add Child
          </Button>
        )}
      </div>
      
      {childAccounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center justify-center text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Child Accounts Yet</h3>
            <p className="mb-4 text-muted-foreground max-w-md">
              Add your children to manage their accounts, allowances, and spending.
            </p>
            {onAddChild && (
              <Button onClick={onAddChild} className="gap-1">
                <Plus className="h-4 w-4" /> Add Child Account
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="px-6">
            <CardTitle>Your Children</CardTitle>
            <CardDescription>
              Overview of all your children's accounts and balances
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4 pl-6">Child</TableHead>
                  <TableHead className="w-1/5">Spendable</TableHead>
                  <TableHead className="w-1/5">Savings</TableHead>
                  <TableHead className="w-1/5">Allowance</TableHead>
                  <TableHead className="w-1/10">Alerts</TableHead>
                  <TableHead className="w-1/10 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childAccounts.map((child) => (
                  <TableRow 
                    key={child.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onViewChildDetails(child.id)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(child.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-muted-foreground">Age {child.age}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${child.balances.spendable}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CreditCard className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        Available to spend
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${child.balances.savings}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <PiggyBank className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {child.savingsGoalsCount} 
                        {child.savingsGoalsCount === 1 ? ' goal' : ' goals'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {child.allowance ? (
                        <>
                          <div className="font-medium">${child.allowance.amount}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {formatFrequency(child.allowance.frequency)}
                          </div>
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-muted/50">Not Set</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {child.spendingRequestsCount > 0 ? (
                        <Badge className="bg-primary font-medium">
                          {child.spendingRequestsCount}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onManageAllowance(child.id);
                          }}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Manage Allowance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onManageSpendingRules(child.id);
                          }}>
                            <Settings className="h-4 w-4 mr-2" />
                            Spending Rules
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onViewChildDetails(child.id);
                          }}>
                            <ChevronRight className="h-4 w-4 mr-2" />
                            View Details
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
      )}
    </div>
  );
}