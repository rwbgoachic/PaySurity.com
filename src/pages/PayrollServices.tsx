import { motion } from 'framer-motion';
import { Calculator, Clock, FileText, Shield, Users, Wallet, BarChart as ChartBar, Calendar, Globe, Book, Bell, Lock } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import Testimonials from '../components/Testimonials';

const features = [
  {
    title: 'Automated Calculations',
    description: 'Accurate payroll calculations including regular pay, overtime, bonuses, and deductions.',
    icon: Calculator,
  },
  {
    title: 'Time Tracking',
    description: 'Integrated time and attendance tracking with mobile clock-in/out capabilities.',
    icon: Clock,
  },
  {
    title: 'Tax Management',
    description: 'Automatic tax calculations and filings for federal, state, and local taxes.',
    icon: FileText,
  },
  {
    title: 'Compliance Monitoring',
    description: 'Stay compliant with automatic updates to tax rates and labor laws.',
    icon: Shield,
  },
  {
    title: 'Employee Portal',
    description: 'Self-service access to pay stubs, W-2s, and tax documents.',
    icon: Users,
  },
  {
    title: 'Direct Deposit',
    description: 'Secure and timely direct deposit payments to employee accounts.',
    icon: Wallet,
  },
  {
    title: 'Reporting Tools',
    description: 'Comprehensive reporting for payroll, taxes, and labor costs.',
    icon: ChartBar,
  },
  {
    title: 'Leave Management',
    description: 'Track and manage PTO, sick leave, and other time-off requests.',
    icon: Calendar,
  },
  {
    title: 'Multi-State Support',
    description: 'Handle payroll across multiple states with automatic tax compliance.',
    icon: Globe,
  },
  {
    title: 'Benefits Administration',
    description: 'Manage employee benefits including health insurance and 401(k).',
    icon: Book,
  },
  {
    title: 'Alerts & Notifications',
    description: 'Automated reminders for payroll deadlines and compliance updates.',
    icon: Bell,
  },
  {
    title: 'Secure Data Storage',
    description: 'Encrypted storage of sensitive payroll and employee information.',
    icon: Lock,
  },
];

const testimonials = [
  {
    content: "The automated calculations have saved us countless hours and eliminated errors in our payroll process.",
    author: "Jennifer Adams",
    role: "HR Director",
    company: "Tech Innovations Inc."
  },
  {
    content: "The compliance monitoring feature keeps us up-to-date with changing regulations. It's like having a compliance expert on staff.",
    author: "Michael Foster",
    role: "CFO",
    company: "Global Manufacturing"
  },
  {
    content: "Employee self-service has reduced HR workload significantly. Our employees love having instant access to their information.",
    author: "Sarah Martinez",
    role: "HR Manager",
    company: "Retail Solutions"
  }
];

export default function PayrollServices() {
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
              Payroll Services
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Streamline your payroll processing with our comprehensive solutions.
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
                  productUrl="https://payroll.paysurity.com"
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