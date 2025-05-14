import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  Store,
  ShoppingBag,
} from 'lucide-react';

const stats = [
  { name: 'Total Merchants', value: '521', icon: Users, change: '+12%', changeType: 'positive' },
  { name: 'Monthly Revenue', value: '$2.4M', icon: DollarSign, change: '+15%', changeType: 'positive' },
  { name: 'Active Terminals', value: '1,429', icon: CreditCard, change: '+8%', changeType: 'positive' },
  { name: 'Total Transactions', value: '89,887', icon: ShoppingBag, change: '+24%', changeType: 'positive' },
];

export default function Dashboard() {
  const [selectedPeriod] = useState('month');

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          
          <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-black/30 px-4 pb-12 pt-5 border border-primary-700/50 backdrop-blur-sm transition-all hover:border-primary-600 hover:bg-black/40"
              >
                <dt>
                  <div className="absolute rounded-md bg-primary-500/10 p-3">
                    <stat.icon className="h-6 w-6 text-primary-400" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-300">{stat.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.change}
                    <ArrowUpRight className="h-4 w-4" />
                  </p>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="rounded-lg border border-primary-700/50 bg-black/30 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <div className="mt-6 flow-root">
                <ul className="-mb-8">
                  {[
                    {
                      title: 'New Merchant Onboarded',
                      time: '3 mins ago',
                      icon: Store,
                      iconBackground: 'bg-primary-500/10',
                    },
                    {
                      title: 'Large Transaction Alert',
                      time: '12 mins ago',
                      icon: CreditCard,
                      iconBackground: 'bg-yellow-500/10',
                    },
                    {
                      title: 'System Update Completed',
                      time: '1 hour ago',
                      icon: ShoppingBag,
                      iconBackground: 'bg-green-500/10',
                    },
                  ].map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <div className="relative pb-8">
                        {itemIdx !== 2 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`${item.iconBackground} flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/10`}>
                              <item.icon className="h-4 w-4 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            <div>
                              <p className="text-sm text-white">{item.title}</p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-400">
                              {item.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-primary-700/50 bg-black/30 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              <div className="mt-6 grid grid-cols-1 gap-4">
                {[
                  { name: 'Add New Merchant', icon: Store },
                  { name: 'View Transactions', icon: CreditCard },
                  { name: 'Generate Reports', icon: ShoppingBag },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    className="flex items-center rounded-lg border border-primary-700/50 bg-black/20 p-4 text-white hover:bg-black/30 transition-all"
                  >
                    <action.icon className="h-5 w-5 text-primary-400 mr-3" />
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}