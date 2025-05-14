import { motion } from 'framer-motion';

const blogPosts = [
  {
    title: 'The Future of Restaurant POS Systems',
    description: 'Explore how AI and cloud technology are transforming restaurant management',
    category: 'Blog',
    date: 'Mar 16, 2024',
    readTime: '5 min read',
  },
  {
    title: 'Maximizing Grocery Store Efficiency',
    description: 'Tips for implementing effective inventory management systems',
    category: 'Blog',
    date: 'Mar 14, 2024',
    readTime: '4 min read',
  },
  {
    title: 'Payment Processing Trends 2024',
    description: 'Latest developments in payment technology and security',
    category: 'Merchant Industry News',
    date: 'Mar 12, 2024',
    readTime: '6 min read',
  },
  {
    title: 'Regulatory Changes in Payroll Processing',
    description: 'Updates on compliance requirements and best practices',
    category: 'Merchant Industry News',
    date: 'Mar 10, 2024',
    readTime: '7 min read',
  },
];

export default function Blog() {
  return (
    <div className="relative isolate pt-24">
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Blog & Industry News
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Stay updated with the latest insights, trends, and news in payment processing and merchant services.
            </p>
          </motion.div>

          <motion.div 
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {blogPosts.map((post, index) => (
              <article key={index} className="flex flex-col items-start rounded-lg border border-primary-700/50 bg-black/30 p-6 backdrop-blur-sm transition-all hover:border-primary-600 hover:bg-black/40">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime="2024-03-16" className="text-gray-400">{post.date}</time>
                  <span className="relative z-10 rounded-full bg-primary-400/10 px-3 py-1.5 font-medium text-primary-400">
                    {post.category}
                  </span>
                  <span className="text-gray-400">{post.readTime}</span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                    <a href="#">
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-300">{post.description}</p>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}