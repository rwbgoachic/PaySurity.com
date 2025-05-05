export interface FAQItem {
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  lastUpdated?: string;
}

export interface FAQCategory {
  name: string;
  description: string;
  items: FAQItem[];
}

export interface FAQSchema {
  categories: FAQCategory[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}