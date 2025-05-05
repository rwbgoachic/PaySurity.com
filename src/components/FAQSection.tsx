import { useState } from 'react';
import { motion } from 'framer-motion';
import type { FAQCategory, FAQItem } from '../types/faq';

interface FAQSectionProps {
  categories: FAQCategory[];
}

export default function FAQSection({ categories }: FAQSectionProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const currentCategory = categories.find(cat => cat.name === activeCategory);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Find answers to common questions about our services
          </p>
        </motion.div>

        <div className="mt-16">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  activeCategory === category.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <motion.div 
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentCategory?.items.map((item: FAQItem) => (
              <motion.div
                key={item.question}
                className="rounded-lg border border-primary-700/50 bg-black/30 backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={() => setActiveItem(activeItem === item.question ? null : item.question)}
                  className="flex w-full items-center justify-between px-4 py-5 sm:p-6"
                >
                  <span className="text-lg font-semibold text-white">{item.question}</span>
                  <span className="ml-6 flex-shrink-0">
                    <svg
                      className={`h-6 w-6 transform text-gray-400 transition-transform ${
                        activeItem === item.question ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                {activeItem === item.question && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-5 sm:px-6 sm:pb-6"
                  >
                    <p className="text-gray-300">{item.answer}</p>
                    {item.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-400/10 text-primary-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.lastUpdated && (
                      <p className="mt-4 text-sm text-gray-400">
                        Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}