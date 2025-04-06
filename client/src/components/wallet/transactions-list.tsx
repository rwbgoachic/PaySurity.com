import { formatCurrency, getTransactionStatusColor, getExpenseTypeIcon } from "@/hooks/use-wallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: number;
  walletId: number;
  userId: number;
  amount: string;
  type: string;
  method: string;
  merchantName?: string;
  expenseType?: string;
  approvalStatus: string;
  date: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionsList({ transactions, isLoading }: TransactionsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Track your recent financial activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'incoming' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={`text-lg ${
                    transaction.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'incoming' ? '+' : '-'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.merchantName || 
                      (transaction.type === 'incoming' ? 'Deposit' : 'Payment')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'incoming' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  {transaction.expenseType && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                      {transaction.expenseType.replace('_', ' ')}
                    </span>
                  )}
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                    getTransactionStatusColor(transaction.approvalStatus)
                  }`}>
                    {transaction.approvalStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}