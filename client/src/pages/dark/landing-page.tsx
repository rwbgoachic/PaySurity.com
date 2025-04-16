import React from "react";
import { Link } from "wouter";
import { DarkThemeLayout } from "@/components/layout/dark-theme-layout";
import { cn } from "@/lib/utils";

export default function MainLandingPage() {
  return (
    <DarkThemeLayout>
      <HeroSection />
      <LogoCloudSection />
      <FeaturesSection />
      <ProductsSection />
      <TestimonialsSection />
      <StatisticsSection />
      <CtaSection />
    </DarkThemeLayout>
  );
}

function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-black to-gray-900 px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            <span className="block">Modern Payment</span>
            <span className="block text-blue-500">Infrastructure</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Comprehensive payment solutions empowering businesses with seamless 
            processing, digital wallets, and integrated POS systems.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth?mode=register">
              <a className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                Get started
              </a>
            </Link>
            <Link href="/products">
              <a className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
                Explore products <span aria-hidden="true">→</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Payment cards floating effect */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 transform">
        <div className="relative">
          <div className="absolute -left-32 -top-16 h-64 w-96 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-xl transform rotate-6 opacity-30 blur-sm"></div>
          <div className="absolute -right-32 top-8 h-64 w-96 rounded-xl bg-gradient-to-r from-purple-600 to-blue-700 p-4 shadow-xl transform -rotate-6 opacity-30 blur-sm"></div>
          <div className="h-64 w-96 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 p-4 shadow-xl transform opacity-75"></div>
        </div>
      </div>
    </div>
  );
}

function LogoCloudSection() {
  return (
    <div className="bg-black py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-gray-300">
          Trusted by thousands of businesses worldwide
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-gradient-to-r from-gray-700 to-gray-600 opacity-30 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Secure Payment Processing",
      description: "Advanced encryption and fraud detection systems ensure your transactions are always protected and compliant.",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: "Omni-Channel Experience",
      description: "Deliver consistent payment experiences across in-store, online, and mobile touchpoints for your customers.",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      ),
    },
    {
      title: "Real-time Analytics",
      description: "Gain valuable insights into your business performance with comprehensive reporting and analytics tools.",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      title: "Global Reach",
      description: "Accept payments in multiple currencies and expand your business globally with our international payment solutions.",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
    },
    {
      title: "Developer-Friendly APIs",
      description: "Easily integrate our payment solutions into your existing systems with our comprehensive API documentation.",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to help you with any issues or questions you may have.",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-500">Comprehensive Solutions</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need for payment processing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            From secure transactions to detailed analytics, our platform provides everything 
            you need to accept payments and grow your business.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-800">
                    {feature.icon}
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function ProductsSection() {
  const products = [
    {
      name: "Payment Processing",
      description: "Secure, reliable payment processing for businesses of all sizes.",
      href: "/payments",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      ),
      bgClass: "bg-gradient-to-r from-blue-600 to-blue-800",
    },
    {
      name: "Digital Wallet",
      description: "Store, send, and receive money with our secure digital wallet.",
      href: "/digital-wallet",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      ),
      bgClass: "bg-gradient-to-r from-indigo-600 to-indigo-800",
    },
    {
      name: "POS Systems",
      description: "Modern point-of-sale systems for retail and restaurant businesses.",
      href: "/pos-systems",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      ),
      bgClass: "bg-gradient-to-r from-purple-600 to-purple-800",
    },
  ];
  
  return (
    <div className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Products
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Comprehensive payment solutions for modern businesses
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:max-w-none lg:grid-cols-3">
            {products.map((product, index) => (
              <Link key={index} href={product.href}>
                <a className={cn(
                  "group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl px-8 pb-8 pt-16 transition-transform duration-300 hover:scale-105",
                  product.bgClass
                )}>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/50 via-black/0"></div>
                  <div className="absolute left-4 top-4 h-10 w-10 flex items-center justify-center rounded-lg bg-white/10">
                    {product.icon}
                  </div>
                  
                  <div>
                    <h3 className="mt-10 text-xl font-bold leading-7 text-white">{product.name}</h3>
                    <p className="mt-2 leading-7 text-gray-200">{product.description}</p>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-x-2 text-white">
                    <span className="text-sm font-medium">Learn more</span>
                    <span className="group-hover:translate-x-1 transition duration-300" aria-hidden="true">→</span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      content: "PaySurity's payment processing solution has been a game-changer for our business. The integration was seamless, and we've seen a significant increase in our conversion rates.",
      author: "Sarah Johnson",
      role: "CEO, TechRetail Inc."
    },
    {
      content: "The digital wallet has transformed how we handle payments. Our customers love the convenience, and we love the reduced processing times and fees.",
      author: "Michael Chen",
      role: "Founder, Fusion Eats"
    },
    {
      content: "Implementing PaySurity's POS system in our restaurant chain has streamlined our operations and improved customer satisfaction. The support team is always there when we need them.",
      author: "Laura Rodriguez",
      role: "Operations Director, Urban Dining Group"
    }
  ];
  
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 text-blue-500">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by thousands of businesses
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col justify-between rounded-2xl bg-gray-800 p-8 shadow-sm ring-1 ring-gray-700">
              <blockquote className="text-lg leading-8 text-gray-200">
                <p>"{testimonial.content}"</p>
              </blockquote>
              <div className="mt-6 flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-600"></div>
                <div className="ml-4">
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatisticsSection() {
  const stats = [
    { id: 1, name: "Merchants", value: "10,000+" },
    { id: 2, name: "Transactions", value: "$2B+" },
    { id: 3, name: "Countries", value: "50+" },
    { id: 4, name: "Uptime", value: "99.99%" },
  ];
  
  return (
    <div className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by businesses worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Our platform processes billions in transactions annually
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-gray-800 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-blue-500">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function CtaSection() {
  return (
    <div className="bg-blue-600">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to transform your payment experience?
        </h2>
        <div className="mt-10 flex items-center gap-x-6">
          <Link href="/auth?mode=register">
            <a className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Get started
            </a>
          </Link>
          <Link href="/contact">
            <a className="text-sm font-semibold leading-6 text-white">
              Contact sales <span aria-hidden="true">→</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}