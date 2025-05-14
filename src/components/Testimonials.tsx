import { Testimonials as PaysurityTestimonials } from '@paysurity/ui';

interface TestimonialsProps {
  testimonials: {
    content: string;
    author: string;
    role: string;
    company: string;
  }[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return <PaysurityTestimonials testimonials={testimonials} />;
}