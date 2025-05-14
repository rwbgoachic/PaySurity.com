import { motion } from 'framer-motion';
import { ShoppingCart, Barcode, Package, Users, CreditCard, Smartphone, Scale, Tag, Truck, Bell, BarChart as ChartBar, Clock } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import Testimonials from '../components/Testimonials';

const features = [
  {
    title: 'Inventory Management',
    description: 'Real-time tracking of stock levels with automated reordering and waste management.',
    icon: Package,
  },
  {
    title: 'Barcode Scanning',
    description: 'Fast and accurate product identification with support for multiple barcode formats.',
    icon: Barcode,
  },
  {
    title: 'Scale Integration',
    description: 'Seamless integration with weighing scales for precise pricing of weighted items.',
    icon: Scale,
  },
  {
    title: 'Price Management',
    description: 'Flexible pricing with support for discounts, promotions, and special offers.',
    icon: Tag,
  },
  {
    title: 'Supplier Management',
    description: 'Track suppliers, manage orders, and automate purchase orders.',
    icon: Truck,
  },
  {
    title: 'Customer Loyalty',
    description: 'Comprehensive loyalty program with points, rewards, and personalized offers.',
    icon: Users,
  },
  {
    title: 'Mobile Checkout',
    description: 'Reduce wait times with mobile checkout capabilities for busy periods.',
    icon: Smartphone,
  },
  {
    title: 'Payment Processing',
    description: 'Accept all payment types including contactless and digital wallets.',
    icon: CreditCard,
  },
  {
    title: 'Stock Alerts',
    description: 'Automated notifications for low stock, expiring items, and reorder points.',
    icon: Bell,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Detailed reporting on sales, inventory, and customer behavior.',
    icon: ChartBar,
  },
  {
    title: 'Express Checkout',
    description: 'Streamlined checkout process for faster customer service.',
    icon: ShoppingCart,
  },
  {
    title: 'Time Management',
    description: 'Staff scheduling and time tracking integrated with payroll.',
    icon: Clock,
  },
];

const testimonials = [
  {
    content: "The inventory management system has revolutionized how we handle stock. No more overordering or stockouts.",
    author: "Mark Thompson",
    role: "Store Manager",
    company: "Fresh Market"
  },
  {
    content: "The scale integration works perfectly, and the loyalty program has significantly increased customer retention.",
    author: "Patricia Lee",
    role: "Owner",
    company: "Neighborhood Grocery"
  },
  {
    content: "Real-time analytics have helped us optimize our inventory and improve profit margins.",
    author: "Robert Wilson",
    role: "Operations Manager",
    company: "City Supermarket"
  }
];

function GroceryPOS() {
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
              Grocery POS
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Streamline your grocery store operations with our specialized POS system.
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
                  productUrl="https://grocerypos.paysurity.com"
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

export default GroceryPOS;