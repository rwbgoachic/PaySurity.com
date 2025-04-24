import React from 'react';

const Features = () => {
  const features = [
    {
      title: 'Secure Transactions',
      description: 'End-to-end encryption and fraud detection systems keep your payments safe and compliant.',
      icon: '🔒'
    },
    {
      title: 'Seamless Integration',
      description: 'Easily connect with your existing business systems through our powerful APIs.',
      icon: '🔄'
    },
    {
      title: 'Real-time Analytics',
      description: 'Gain valuable insights with comprehensive reporting and analytics dashboards.',
      icon: '📊'
    },
    {
      title: 'Multi-currency Support',
      description: 'Accept payments in multiple currencies and expand your global reach.',
      icon: '🌐'
    },
    {
      title: 'Mobile Payments',
      description: 'Accept payments anywhere with our mobile payment solutions and digital wallets.',
      icon: '📱'
    },
    {
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you.',
      icon: '🛟'
    }
  ];

  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Powerful Features</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our platform offers a comprehensive set of features designed to streamline your payment operations.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col bg-gray-800 p-8 shadow-lg rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold leading-8 text-white">{feature.title}</h3>
              <p className="mt-2 text-base leading-7 text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;