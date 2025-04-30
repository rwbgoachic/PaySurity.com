import { motion } from 'framer-motion';

interface TestimonialsProps {
  testimonials: {
    content: string;
    author: string;
    role: string;
    company: string;
  }[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by Businesses Everywhere
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            See what our customers have to say about their experience with our solutions.
          </p>
        </motion.div>
        <motion.div 
          className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <figure 
                key={index} 
                className="rounded-lg border border-primary-700/50 bg-black/30 p-8 backdrop-blur-sm transition-all hover:border-primary-600 hover:bg-black/40"
              >
                <blockquote className="text-lg font-semibold leading-8 text-white">
                  <p>"{testimonial.content}"</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-x-4">
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}