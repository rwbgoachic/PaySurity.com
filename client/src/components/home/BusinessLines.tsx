import React from 'react';
import { Link } from 'react-router-dom';

const BusinessLines = () => {
  const businessLines = [
    {
      title: 'Merchant Services',
      description: 'Comprehensive payment processing solutions for businesses of all sizes.',
      icon: '💳',
      link: '/solutions/merchants'
    },
    {
      title: 'BistroBeast POS',
      description: 'Powerful restaurant management system with integrated payments.',
      icon: '🍽️',
      link: '/solutions/restaurant'
    },
    {
      title: 'GrocerEase POS',
      description: 'Streamlined checkout and inventory management for grocery stores.',
      icon: '🛒',
      link: '/solutions/grocery'
    },
    {
      title: 'Digital Wallet',
      description: 'Secure digital wallet for consumers with multi-currency support.',
      icon: '💼',
      link: '/digital-wallet'
    }
  ];

  return (
    <div className="bg-gray-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Complete Payment Ecosystem</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Discover our full suite of payment solutions designed to streamline your business operations.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {businessLines.map((item, index) => (
            <div key={index} className="flex flex-col bg-gray-900 p-8 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-800">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold leading-8 text-white">{item.title}</h3>
              <p className="mt-2 text-base leading-7 text-gray-300 flex-grow">{item.description}</p>
              <Link
                to={item.link}
                className="mt-6 inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Learn more <span aria-hidden="true" className="ml-1">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessLines;