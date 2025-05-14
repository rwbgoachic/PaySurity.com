import { FAQSection as PaysurityFAQ } from '@paysurity/ui';
import type { FAQCategory } from '../types/faq';

interface FAQSectionProps {
  categories: FAQCategory[];
}

export default function FAQSection({ categories }: FAQSectionProps) {
  return <PaysurityFAQ categories={categories} />;
}