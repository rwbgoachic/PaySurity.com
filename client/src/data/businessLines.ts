import { BusinessLine } from '../types';

export const businessLines: BusinessLine[] = [
  {
    name: 'Merchant Services',
    description: 'Comprehensive payment processing solutions for businesses of all sizes. Accept payments anywhere, anytime with our secure and reliable merchant services.',
    url: '/solutions/merchants',
    logo: 'Merchants',
    shortDescription: 'Accept payments anywhere, anytime'
  },
  {
    name: 'Restaurant Management POS',
    description: 'All-in-one restaurant management solution with point of sale, online ordering, inventory management, and staff scheduling capabilities.',
    url: '/solutions/restaurant',
    logo: 'Restaurant Management POS',
    shortDescription: 'Complete restaurant management system'
  },
  {
    name: 'Grocery Store Management POS',
    description: 'Streamline your grocery store operations with our comprehensive POS solution featuring inventory tracking, customer loyalty programs, and online ordering.',
    url: '/solutions/grocery',
    logo: 'Grocery Store Management POS',
    shortDescription: 'Streamline grocery store operations'
  },
  {
    name: 'Payroll Solution',
    description: 'Simplify payroll processing with our comprehensive solution that handles tax calculations, direct deposits, and compliance requirements automatically.',
    url: '/solutions/payroll',
    logo: 'Payroll Solution',
    shortDescription: 'Simplify payroll processing'
  }
];