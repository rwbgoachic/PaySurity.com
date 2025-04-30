import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CreditCard, Store, ShoppingCart, Calculator } from 'lucide-react';
import Testimonials from '../components/Testimonials';

const testimonials = [
  {
    content: "Switching to Paysurity has transformed our business operations. The integrated payment solutions have streamlined our processes and improved our efficiency significantly.",
    author: "Robert Chen",
    role: "CEO",
    company: "Global Retail Solutions"
  },
  {
    content: "The all-in-one platform has everything we need. From payment processing to inventory management, it's made running our business so much easier.",
    author: "Maria Garcia",
    role: "Operations Director",
    company: "Fresh Market Chain"
  },
  {
    content: "Outstanding customer support and reliable service. The platform's flexibility has helped us adapt to changing market needs while maintaining security.",
    author: "John Smith",
    role: "Owner",
    company: "Metropolitan Dining Group"
  }
];

export default function Home() {
  const [currentText, setCurrentText] = useState('Restaurants');
  const texts = ['Restaurants', 'Grocery Stores', 'Payroll'];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setCurrentText(texts[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative isolate">
      <div className="relative">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.pexels.com/photos/7621138/pexels-photo-7621138.jpeg"
          >
            <source
              src="https://player.vimeo.com/progressive_redirect/playback/735428931/rendition/720p/file.mp4?loc=external"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <motion.h1 
                className="text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="block sm:inline">Unified Business Centric Payment Solutions for </span>
                <motion.span
                  key={currentText}
                  className="inline-block text-primary-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentText}
                </motion.span>
              </motion.h1>
              <motion.p 
                className="mt-6 text-base leading-8 text-gray-300 sm:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Streamline operations and payments with our integrated solutions for merchants, restaurants, grocery stores, and payroll services.
              </motion.p>
              <motion.div 
                className="mt-10 flex items-center justify-center gap-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <a
                  href="/contact"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Get started
                </a>
                <a href="/merchant-services" className="text-sm font-semibold leading-6 text-white hover:text-primary-300 transition-colors">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: 'Merchant Services',
                  description: 'Streamline your payment processing with our comprehensive merchant services. Accept all major credit cards, mobile payments, and digital wallets with competitive rates.',
                  href: '/merchant-services',
                  icon: CreditCard,
                  video: 'https://player.vimeo.com/progressive_redirect/playback/735428931/rendition/720p/file.mp4?loc=external',
                  poster: 'https://images.pexels.com/photos/7621138/pexels-photo-7621138.jpeg',
                },
                {
                  title: 'Restaurant POS',
                  description: 'All-in-one restaurant management solution with point of sale, online ordering, inventory management, and staff scheduling capabilities.',
                  href: '/restaurant-pos',
                  icon: Store,
                  video: 'https://player.vimeo.com/progressive_redirect/playback/735428931/rendition/720p/file.mp4?loc=external',
                  poster: 'https://images.pexels.com/photos/7621138/pexels-photo-7621138.jpeg',
                },
                {
                  title: 'Grocery POS',
                  description: 'Streamline your grocery store operations with our comprehensive POS solution featuring inventory tracking, customer loyalty programs, and online ordering.',
                  href: '/grocery-pos',
                  icon: ShoppingCart,
                  video: 'https://player.vimeo.com/progressive_redirect/playback/735428931/rendition/720p/file.mp4?loc=external',
                  poster: 'https://images.pexels.com/photos/7621138/pexels-photo-7621138.jpeg',
                },
                {
                  title: 'Payroll Services',
                  description: 'Simplify payroll processing with our comprehensive solution that handles tax calculations, direct deposits, and compliance requirements automatically.',
                  href: '/payroll-services',
                  icon: Calculator,
                  video: 'https://player.vimeo.com/progressive_redirect/playback/735428931/rendition/720p/file.mp4?loc=external',
                  poster: 'https://images.pexels.com/photos/7621138/pexels-photo-7621138.jpeg',
                },
              ].map((card) => (
                <div key={card.title} className="flex flex-col rounded-lg border border-primary-700/50 bg-black/30 p-6 backdrop-blur-sm transition-all hover:border-primary-600 hover:bg-black/40">
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                      poster={card.poster}
                    >
                      <source src={card.video} type="video/mp4" />
                    </video>
                  </div>
                  <div className="mb-4">
                    <card.icon className="h-8 w-8 text-primary-400" />
                  </div>
                  <dt className="text-xl font-semibold leading-7 text-white">
                    {card.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{card.description}</p>
                    <p className="mt-6">
                      <a href={card.href} className="text-sm font-semibold leading-6 text-primary-400 hover:text-primary-300 transition-colors">
                        Learn more <span aria-hidden="true">→</span>
                      </a>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <Testimonials testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}