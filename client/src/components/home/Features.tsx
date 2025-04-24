import React from 'react';
import Section from '../ui/Section';
import { CheckCircle as CircleCheck, ShieldCheck, Zap, Users, CreditCard, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-cyan-500" />,
    title: 'Secure Payments',
    description: 'State-of-the-art encryption and fraud protection for all transactions across our entire platform.',
  },
  {
    icon: <Zap className="h-8 w-8 text-cyan-500" />,
    title: 'Fast Implementation',
    description: 'Get up and running quickly with our easy-to-use solutions and dedicated support team.',
  },
  {
    icon: <Users className="h-8 w-8 text-cyan-500" />,
    title: 'User Management',
    description: 'Comprehensive user permission system with role-based access control for all platforms.',
  },
  {
    icon: <CreditCard className="h-8 w-8 text-cyan-500" />,
    title: 'Multiple Payment Options',
    description: 'Accept credit cards, digital wallets, ACH transfers, and more through a single platform.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-cyan-500" />,
    title: 'Detailed Analytics',
    description: 'Powerful reporting tools give you insights into your business performance across all systems.',
  },
  {
    icon: <CircleCheck className="h-8 w-8 text-cyan-500" />,
    title: 'Compliance Ready',
    description: 'Built-in compliance features for PCI, HIPAA, and other industry standards depending on your solution.',
  },
];

const Features = () => {
  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Platform Features</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          All PaySurity solutions come with these powerful capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {features.map((feature, index) => (
          <div key={index} className="flex">
            <div className="flex-shrink-0 mr-4">{feature.icon}</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Features;