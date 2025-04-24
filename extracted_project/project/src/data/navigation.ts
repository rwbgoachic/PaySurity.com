import { NavItem, FooterLink } from '../types';

export const mainNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Solutions',
    href: '#',
    children: [
      {
        label: 'Merchant Services',
        href: '/solutions/merchants',
      },
      {
        label: 'Restaurant POS',
        href: '/solutions/restaurant',
      },
      {
        label: 'Grocery Store POS',
        href: '/solutions/grocery',
      },
      {
        label: 'Payroll Services',
        href: '/solutions/payroll',
      },
    ],
  },
  {
    label: 'Pricing',
    href: '/pricing',
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export const footerLinks: FooterLink[] = [
  {
    title: 'Solutions',
    links: [
      { label: 'Merchant Services', href: '/solutions/merchants' },
      { label: 'Restaurant POS', href: '/solutions/restaurant' },
      { label: 'Grocery Store POS', href: '/solutions/grocery' },
      { label: 'Payroll Services', href: '/solutions/payroll' },
      { label: 'Payroll Pricing', href: '/solutions/payroll/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/support' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];