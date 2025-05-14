import { motion } from 'framer-motion';
import { LayoutGrid, CreditCard, LineChart, Users, Package, Globe, Clock, Receipt, Utensils, Bell, Wallet, Smartphone } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import Testimonials from '../components/Testimonials';

const features = [
  {
    title: 'Table Management',
    description: 'Efficiently manage tables, orders, and reservations with real-time status updates.',
    icon: LayoutGrid,
  },
  {
    title: 'Order Processing',
    description: 'Quick and accurate order taking with customizable modifiers and special instructions.',
    icon: Receipt,
  },
  {
    title: 'Kitchen Display System',
    description: 'Streamlined kitchen operations with digital ticket management and order timing.',
    icon: Utensils,
  },
  {
    title: 'Server Notifications',
    description: 'Instant alerts for order ready, table requests, and kitchen updates.',
    icon: Bell,
  },
  {
    title: 'Payment Processing',
    description: 'Integrated payment system supporting all major cards and digital wallets.',
    icon: Wallet,
  },
  {
    title: 'Mobile Ordering',
    description: 'Tableside ordering and payment processing with mobile devices.',
    icon: Smartphone,
  },
  {
    title: 'Staff Management',
    description: 'Complete employee scheduling, time tracking, and performance monitoring.',
    icon: Users,
  },
  {
    title: 'Inventory Control',
    description: 'Real-time inventory tracking with automatic reorder notifications.',
    icon: Package,
  },
  {
    title: 'Online Ordering',
    description: 'Integrated online ordering system with delivery service partnerships.',
    icon: Globe,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Comprehensive reporting for sales, inventory, and staff performance.',
    icon: LineChart,
  },
  {
    title: 'Split Payments',
    description: 'Easy bill splitting and multiple payment method support.',
    icon: CreditCard,
  },
  {
    title: 'Happy Hour Management',
    description: 'Automated price adjustments for special promotions and happy hours.',
    icon: Clock,
  },
];

const testimonials = [
  {
    content: "The table management system has streamlined our operations significantly. We can serve more customers efficiently.",
    author: "David Martinez",
    role: "Restaurant Manager",
    company: "Bistro Central"
  },
  {
    content: "The integrated payment system works flawlessly. Our staff loves how easy it is to use.",
    author: "Lisa Wong",
    role: "Owner",
    company: "Asian Fusion Kitchen"
  },
  {
    content: "The analytics have helped us optimize our menu and staffing. Great ROI!",
    author: "James Peterson",
    role: "Operations Director",
    company: "The Steakhouse"
  }
];

export default function RestaurantPOS() {
  return (
    <div className="relative isolate pt-24">
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Restaurant POS
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              A complete point-of-sale solution designed specifically for restaurants.
            </p>
          </motion.div>

          <motion.div 
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  productUrl="https://restaurantpos.paysurity.com"
                />
              ))}
            </dl>
          </motion.div>

          <Testimonials testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}