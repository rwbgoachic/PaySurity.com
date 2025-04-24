import React, { useState } from 'react';
import { useOrganization } from '../../hooks/useOrganization';
import { useTransactions } from '../../hooks/useTransactions';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Plus, Filter, Download, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import TransactionForm from '../../components/dashboard/transactions/TransactionForm';
import TransactionStats from '../../components/dashboard/transactions/TransactionStats';
import RiskAlertsList from '../../components/dashboard/alerts/RiskAlertsList';
import Decimal from 'decimal.js';

export default function TransactionsPage() {
  const { organization } = useOrganization();
  const { transactions, loading } = useTransactions(organization?.id);
  const [showForm, setShowForm] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(parseFloat(amount));
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pos: 'Point of Sale',
      payroll: 'Payroll',
      subscription: 'Subscription',
      invoice: 'Invoice',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (amount: string) => {
    const value = parseFloat(amount);
    if (value > 1000) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">High</span>;
    } else if (value > 100) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Medium</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Low</span>;
    }
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Amount', 'ID'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        new Date(tx.created_at).toISOString(),
        getServiceTypeLabel(tx.service_type),
        tx.amount,
        tx.id
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!organization) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-gray-500">
            Manage and monitor your financial transactions with 4-decimal precision
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={exportTransactions}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Transaction Stats */}
      <TransactionStats organizationId={organization.id} />

      {/* Transaction Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Record New Transaction</h2>
          <TransactionForm 
            organizationId={organization.id} 
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Risk Alerts Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Risk Monitoring</h2>
        <Button 
          variant={showAlerts ? "primary" : "outline"}
          onClick={() => setShowAlerts(!showAlerts)}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          {showAlerts ? "Hide Alerts" : "Show Alerts"}
        </Button>
      </div>

      {/* Risk Alerts */}
      {showAlerts && (
        <RiskAlertsList organizationId={organization.id} />
      )}

      {/* Transactions List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400 mt-1">Record a transaction to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getServiceTypeLabel(transaction.service_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}