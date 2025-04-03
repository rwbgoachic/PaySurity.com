export type BlogPost = {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
  category: string;
  tags?: string[];
};

// General blog posts
export const blogPosts: BlogPost[] = [
  {
    title: "How Small Businesses Can Reduce Payment Processing Fees by 20%",
    excerpt: "Discover strategies for reducing your payment processing costs without sacrificing service quality or security.",
    date: "March 15, 2023",
    readTime: "5 min read",
    slug: "reduce-payment-processing-fees",
    category: "Payment Processing",
    tags: ["Small Business", "Cost Saving", "Credit Card Processing"]
  },
  {
    title: "PCI-Compliant Payment Processing: A Complete Guide",
    excerpt: "Understanding PCI DSS compliance is essential for any business accepting credit card payments.",
    date: "April 2, 2023",
    readTime: "7 min read",
    slug: "pci-compliant-payment-processing",
    category: "Security",
    tags: ["PCI DSS", "Compliance", "Data Security"]
  },
  {
    title: "Digital Wallets: The Future of Expense Tracking for Business",
    excerpt: "Digital wallets are revolutionizing how businesses manage expenses and provide real-time insights.",
    date: "April 28, 2023",
    readTime: "6 min read",
    slug: "digital-wallets-expense-tracking",
    category: "Digital Wallets",
    tags: ["Expense Management", "Mobile Payments", "Business Operations"]
  },
  {
    title: "Choosing the Right Payment Gateway for Your Online Store",
    excerpt: "With so many payment gateway options available, find out which one best suits your e-commerce business needs.",
    date: "May 10, 2023",
    readTime: "8 min read",
    slug: "choosing-payment-gateway",
    category: "Payment Processing",
    tags: ["E-commerce", "Payment Gateways", "Online Business"]
  },
  {
    title: "Fraud Prevention Best Practices for Merchants",
    excerpt: "Implement these strategies to protect your business and customers from payment fraud and chargebacks.",
    date: "June 5, 2023", 
    readTime: "6 min read",
    slug: "fraud-prevention-best-practices",
    category: "Security",
    tags: ["Fraud Prevention", "Risk Management", "Chargebacks"]
  },
  {
    title: "The Rise of Contactless Payments: What Businesses Need to Know",
    excerpt: "Contactless payment adoption is accelerating. Learn how your business can adapt to meet changing customer expectations.",
    date: "July 12, 2023",
    readTime: "5 min read", 
    slug: "contactless-payments-rise",
    category: "Payment Processing",
    tags: ["Contactless", "NFC", "Mobile Wallets"]
  }
];

// Restaurant-specific posts
export const restaurantPosts: BlogPost[] = [
  {
    title: "Streamlining Payment Operations for Busy Restaurants",
    excerpt: "Discover how integrated POS systems can reduce wait times and improve the dining experience.",
    date: "April 15, 2023",
    readTime: "6 min read",
    slug: "restaurant-payment-operations",
    category: "Restaurants",
    tags: ["POS Systems", "Restaurant Management", "Customer Experience"]
  },
  {
    title: "Implementing Digital Tipping Solutions in Your Restaurant",
    excerpt: "Modern tipping solutions can increase staff satisfaction and simplify tip distribution.",
    date: "May 22, 2023",
    readTime: "5 min read",
    slug: "digital-tipping-restaurants",
    category: "Restaurants",
    tags: ["Tipping", "Staff Management", "Payment Technology"]
  },
  {
    title: "Managing Food Delivery Payments and Partnerships",
    excerpt: "Optimize your restaurant's delivery service payment processing and third-party integrations.",
    date: "June 30, 2023",
    readTime: "7 min read",
    slug: "food-delivery-payments",
    category: "Restaurants",
    tags: ["Food Delivery", "Third-party Integration", "Commission Management"]
  }
];

// Healthcare-specific posts
export const healthcarePosts: BlogPost[] = [
  {
    title: "HIPAA-Compliant Payment Processing for Healthcare Providers",
    excerpt: "Understanding the intersection of payment processing and protected health information.",
    date: "April 10, 2023",
    readTime: "8 min read",
    slug: "hipaa-compliant-payments",
    category: "Healthcare",
    tags: ["HIPAA", "Compliance", "Patient Data"]
  },
  {
    title: "Implementing Patient Payment Plans: Best Practices",
    excerpt: "Flexible payment options can improve collection rates and patient satisfaction.",
    date: "May 18, 2023",
    readTime: "6 min read",
    slug: "patient-payment-plans",
    category: "Healthcare",
    tags: ["Patient Experience", "Collections", "Payment Plans"]
  },
  {
    title: "Integrating Insurance Verification with Payment Processing",
    excerpt: "Streamline front-office operations by connecting insurance verification with your payment system.",
    date: "July 5, 2023",
    readTime: "7 min read",
    slug: "insurance-payment-integration",
    category: "Healthcare",
    tags: ["Medical Billing", "Patient Experience", "Revenue Cycle"]
  }
];

// Legal-specific posts
export const legalPosts: BlogPost[] = [
  {
    title: "Trust Account Management for Law Firms",
    excerpt: "Best practices for maintaining compliant client trust accounts and handling payments properly.",
    date: "May 25, 2023",
    readTime: "7 min read",
    slug: "trust-account-management",
    category: "Legal",
    tags: ["Trust Accounts", "Compliance", "Law Firm Management"]
  },
  {
    title: "Accepting Credit Cards: Ethical Considerations for Attorneys",
    excerpt: "Navigating the ethical rules around credit card payments for legal services.",
    date: "June 19, 2023",
    readTime: "5 min read",
    slug: "credit-cards-legal-ethics",
    category: "Legal",
    tags: ["Legal Ethics", "Credit Cards", "Bar Compliance"]
  },
  {
    title: "Online Payment Portals for Legal Clients",
    excerpt: "How client payment portals can improve cash flow and client satisfaction for law practices.",
    date: "July 31, 2023",
    readTime: "6 min read",
    slug: "legal-payment-portals",
    category: "Legal",
    tags: ["Client Experience", "Online Payments", "Practice Management"]
  }
];

// Retail-specific posts
export const retailPosts: BlogPost[] = [
  {
    title: "Omnichannel Payment Solutions for Modern Retail",
    excerpt: "Integrating in-store, online, and mobile payment systems for a seamless customer experience.",
    date: "May 18, 2023",
    readTime: "6 min read",
    slug: "omnichannel-retail-payments",
    category: "Retail",
    tags: ["Omnichannel", "Customer Experience", "Integration"]
  },
  {
    title: "Implementing Contactless Payments in Retail Stores",
    excerpt: "A comprehensive guide to rolling out contactless payment options in your retail business.",
    date: "June 14, 2023",
    readTime: "5 min read",
    slug: "contactless-retail-payments",
    category: "Retail",
    tags: ["Contactless", "NFC", "Customer Convenience"]
  },
  {
    title: "Retail Loyalty Programs: Integration with Payment Systems",
    excerpt: "How to leverage your payment infrastructure to drive customer retention through loyalty programs.",
    date: "July 24, 2023",
    readTime: "7 min read",
    slug: "retail-loyalty-programs",
    category: "Retail",
    tags: ["Loyalty", "Customer Retention", "Marketing"]
  }
];