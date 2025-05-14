import { FeatureCard as PaysurityFeatureCard } from '@paysurity/ui';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  productUrl: string;
}

export default function FeatureCard(props: FeatureCardProps) {
  return <PaysurityFeatureCard {...props} />;
}