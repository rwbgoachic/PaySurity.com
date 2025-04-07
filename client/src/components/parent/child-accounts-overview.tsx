import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  UserRound,
  PiggyBank,
  CreditCard,
  MoreVertical,
  Plus,
  Clock,
  ChevronRight,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Settings,
  AlertCircle,
  Wallet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export interface ChildAccount {
  id: string;
  name: string;
  balance: string;
  avatarUrl?: string;
  age?: number;
  allowance?: {
    amount: string;
    frequency: string;
    nextPayment?: string;
  };
  pendingRequests: number;
  savingsGoals: number;
  recentTransactions: Transaction[];
  spendingLimits?: {
    daily?: string;
    weekly?: string;
    monthly?: string;
  };
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'allowance';
  status?: 'pending' | 'completed' | 'failed';
}

interface ChildAccountsOverviewProps {
  accounts: ChildAccount[];
  onViewAccount: (accountId: string) => void;
  onSetupAllowance: (accountId: string) => void;
  onConfigureSpendingRules: (accountId: string) => void;
  onViewRequests: (accountId: string) => void;
  onViewSavingsGoals: (accountId: string) => void;
  onViewTransactions: (accountId: string) => void;
  onAddFunds: (accountId: string) => void;
}

export default function ChildAccountsOverview({
  accounts,
  onViewAccount,
  onSetupAllowance,
  onConfigureSpendingRules,
  onViewRequests,
  onViewSavingsGoals,
  onViewTransactions,
  onAddFunds,
}: ChildAccountsOverviewProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const formatCurrency = (amount: string) => {
    const value = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'allowance':
        return <DollarSign className="h-4 w-4 text-indigo-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTransactionStatusBadge = (status: string | undefined) => {
    if (!status || status === 'completed') return null;
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return null;
    }
  };
  
  const renderTransactionsList = (transactions: Transaction[]) => {
    if (!transactions.length) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No recent transactions
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="rounded-full p-2 bg-muted">
                {getTransactionTypeIcon(tx.type)}
              </div>
              <div>
                <div className="font-medium text-sm flex items-center">
                  {tx.description}
                  {getTransactionStatusBadge(tx.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(tx.date)}
                </div>
              </div>
            </div>
            <div className={`font-medium ${tx.type === 'deposit' || tx.type === 'allowance' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'deposit' || tx.type === 'allowance' ? '+' : '-'}{formatCurrency(tx.amount)}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderChildCard = (account: ChildAccount) => {
    return (
      <Card key={account.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border">
                {account.avatarUrl ? (
                  <AvatarImage src={account.avatarUrl} alt={account.name} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(account.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {account.name}
                </CardTitle>
                <CardDescription>
                  {account.age ? `${account.age} years old` : 'Child Account'}
                </CardDescription>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewAccount(account.id)}>
                  <UserRound className="mr-2 h-4 w-4" />
                  View Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewTransactions(account.id)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Transactions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSetupAllowance(account.id)}>
                  <Clock className="mr-2 h-4 w-4" />
                  {account.allowance ? 'Edit' : 'Setup'} Allowance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfigureSpendingRules(account.id)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Spending Rules
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-0">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(account.balance)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center space-x-2">
                      <PiggyBank className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Savings Goals</span>
                    </div>
                    <div className="mt-2 text-2xl font-semibold">
                      {account.savingsGoals}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 h-7 w-full text-xs justify-between"
                      onClick={() => onViewSavingsGoals(account.id)}
                    >
                      <span>View Goals</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className={`h-5 w-5 ${account.pendingRequests > 0 ? 'text-amber-500' : 'text-primary'}`} />
                      <span className="text-sm font-medium">Pending Requests</span>
                    </div>
                    <div className="mt-2 text-2xl font-semibold">
                      {account.pendingRequests}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`mt-2 h-7 w-full text-xs justify-between ${account.pendingRequests > 0 ? 'text-amber-600' : ''}`}
                      onClick={() => onViewRequests(account.id)}
                    >
                      <span>{account.pendingRequests > 0 ? 'Review Requests' : 'View Requests'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {account.allowance ? (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          Allowance
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(account.allowance.amount)}
                          <span className="text-xs text-muted-foreground ml-1">
                            / {account.allowance.frequency}
                          </span>
                        </div>
                        {account.allowance.nextPayment && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Next payment: {formatDate(account.allowance.nextPayment)}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSetupAllowance(account.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onSetupAllowance(account.id)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Set Up Recurring Allowance
                  </Button>
                )}
                
                {account.spendingLimits ? (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="text-sm font-medium flex items-center">
                          <Settings className="mr-2 h-4 w-4 text-primary" />
                          Spending Limits
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {account.spendingLimits.daily && (
                            <div>
                              <div className="text-xs text-muted-foreground">Daily</div>
                              <div className="font-medium">{formatCurrency(account.spendingLimits.daily)}</div>
                            </div>
                          )}
                          {account.spendingLimits.weekly && (
                            <div>
                              <div className="text-xs text-muted-foreground">Weekly</div>
                              <div className="font-medium">{formatCurrency(account.spendingLimits.weekly)}</div>
                            </div>
                          )}
                          {account.spendingLimits.monthly && (
                            <div>
                              <div className="text-xs text-muted-foreground">Monthly</div>
                              <div className="font-medium">{formatCurrency(account.spendingLimits.monthly)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onConfigureSpendingRules(account.id)}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onConfigureSpendingRules(account.id)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Spending Rules
                  </Button>
                )}
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-0">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium">Recent Transactions</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewTransactions(account.id)}
                >
                  View All
                </Button>
              </div>
              {renderTransactionsList(account.recentTransactions)}
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            className="flex-1 mr-2"
            onClick={() => onAddFunds(account.id)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Funds
          </Button>
          <Button 
            className="flex-1"
            onClick={() => onViewAccount(account.id)}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Manage Account
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <UserRound className="mr-2 h-5 w-5" /> 
          Child Accounts
        </h2>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Child
        </Button>
      </div>
      
      {accounts.length === 0 ? (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="py-8 flex flex-col items-center justify-center text-center">
            <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No Child Accounts Yet</CardTitle>
            <CardDescription className="max-w-md mb-6">
              Add your first child account to start managing their finances and teaching them about money.
            </CardDescription>
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => renderChildCard(account))}
        </div>
      )}
    </div>
  );
}