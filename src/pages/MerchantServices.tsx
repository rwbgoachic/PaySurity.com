import { motion } from 'framer-motion';
import { Shield, CreditCard, Zap, LineChart, Coins, HeadphonesIcon, Wallet, Globe, Lock, Clock, BarChart as ChartBar, Users } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import Testimonials from '../components/Testimonials';

const features = [
  {
    title: 'Secure Payment Processing',
    description: 'PCI-compliant payment processing with end-to-end encryption and fraud protection.',
    icon: Shield,
  },
  {
    title: 'Multiple Payment Methods',
    description: 'Accept credit cards, debit cards, digital wallets, contactless payments, and ACH transfers.',
    icon: CreditCard,
  },
  {
    title: 'Instant Processing',
    description: 'Real-time transaction processing with immediate payment confirmation and settlement.',
    icon: Zap,
  },
  {
    title: 'Digital Wallet Integration',
    description: 'Seamless integration with Apple Pay, Google Pay, and other popular digital wallets.',
    icon: Wallet,
  },
  {
    title: 'Global Payment Support',
    description: 'Accept payments in multiple currencies with automatic conversion and settlement.',
    icon: Globe,
  },
  {
    title: 'Advanced Security',
    description: 'Tokenization, encryption, and fraud detection to protect your business and customers.',
    icon: Lock,
  },
  {
    title: 'Real-time Analytics',
    description: 'Comprehensive reporting dashboard with transaction history and business insights.',
    icon: ChartBar,
  },
  {
    title: 'Competitive Rates',
    description: 'Transparent pricing with no hidden fees and volume-based discounts.',
    icon: Coins,
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer support via phone, email, and live chat.',
    icon: HeadphonesIcon,
  },
];

const testimonials = [
  {
    content: "Paysurity's merchant services have transformed how we handle payments. The security features give us peace of mind.",
    author: "Sarah Johnson",
    role: "Owner",
    company: "The Fashion Boutique"
  },
  {
    content: "The analytics tools have helped us make better business decisions. The support team is always there when we need them.",
    author: "Michael Chen",
    role: "CFO",
    company: "Tech Solutions Inc."
  },
  {
    content: "Switching to Paysurity was the best decision we made. The rates are competitive and the service is exceptional.",
    author: "Emily Rodriguez",
    role: "Director",
    company: "Retail Plus"
  }
];

export default function MerchantServices() {
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
              Merchant Services
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Accept payments anywhere, anytime with our secure and reliable merchant services.
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
                  productUrl="https://merchantservices.paysurity.com"
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