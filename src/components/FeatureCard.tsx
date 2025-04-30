import { DivideIcon as LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  productUrl: string;
}

export default function FeatureCard({ title, description, icon: Icon, productUrl }: FeatureCardProps) {
  return (
    <motion.div 
      className="flex flex-col rounded-lg border border-primary-700/50 bg-black/30 p-6 backdrop-blur-sm transition-all hover:border-primary-600 hover:bg-black/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <Icon className="h-8 w-8 text-primary-400" />
      </div>
      <dt className="text-xl font-semibold leading-7 text-white">
        {title}
      </dt>
      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
        <p className="flex-auto">{description}</p>
        <div className="mt-6">
          <a
            href={productUrl}
            className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
          >
            Free Trial* <span aria-hidden="true">→</span>
          </a>
        </div>
      </dd>
    </motion.div>
  );
}