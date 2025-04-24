import React from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Decimal from 'decimal.js';

interface TransactionStatsProps {
  organizationId: string;
}

export default function TransactionStatsDisplay({ organizationId }: TransactionStatsProps) {
  const { stats, loading } = useTransactions(organizationId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Find stats for different time windows
  const dailyStats = stats.find(s => s.time_window === '24h');
  const monthlyStats = stats.find(s => s.time_window === '30d');

  // Calculate total volume
  const totalVolume = stats.reduce((sum, stat) => {
    if (stat.time_window === '30d') {
      return sum.plus(new Decimal(stat.mean_amount).times(stat.sample_size));
    }
    return sum;
  }, new Decimal(0));

  // Format currency
  const formatCurrency = (value: string | number | Decimal) => {
    const amount = new Decimal(value);
    return amount.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Daily Average */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-md">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Daily Average</h3>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold text-gray-900">
            ${formatCurrency(dailyStats?.mean_amount || 0)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Based on {dailyStats?.sample_size || 0} transactions in the last 24 hours
          </p>
        </div>
      </div>

      {/* Monthly Average */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-md">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Monthly Average</h3>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold text-gray-900">
            ${formatCurrency(monthlyStats?.mean_amount || 0)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Based on {monthlyStats?.sample_size || 0} transactions in the last 30 days
          </p>
        </div>
      </div>

      {/* Total Volume */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-md">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Monthly Volume</h3>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold text-gray-900">
            ${formatCurrency(totalVolume)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Total transaction volume in the last 30 days
          </p>
        </div>
      </div>
    </div>
  );
}