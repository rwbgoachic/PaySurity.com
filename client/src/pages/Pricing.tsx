import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  
  const toggleBillingPeriod = () => {
    setBillingPeriod(prev => prev === 'monthly' ? 'annually' : 'monthly');
  };

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses just getting started.',
      priceMonthly: '$49',
      priceAnnually: '$39',
      features: [
        '2.9% + $0.30 per transaction',
        'Accept credit & debit cards',
        'Basic analytics dashboard',
        'Email support',
        'Up to 1,000 transactions per month',
      ],
      cta: 'Start with Starter',
      highlight: false,
    },
    {
      name: 'Professional',
      description: 'Ideal for growing businesses with higher volume.',
      priceMonthly: '$99',
      priceAnnually: '$79',
      features: [
        '2.5% + $0.25 per transaction',
        'All Starter features',
        'Recurring billing',
        'Advanced analytics',
        'Priority email & chat support',
        'Up to 5,000 transactions per month',
      ],
      cta: 'Choose Professional',
      highlight: true,
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for high-volume businesses.',
      priceMonthly: 'Custom',
      priceAnnually: 'Custom',
      features: [
        'Volume-based pricing',
        'All Professional features',
        'Dedicated account manager',
        'Premium 24/7 support',
        'Custom integrations',
        'Unlimited transactions',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div className="bg-gray-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-500">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Choose the plan that's right for your business. All plans include our core payment processing features.
          </p>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="flex items-center rounded-full p-1 bg-gray-800">
            <button
              type="button"
              className={`relative rounded-full py-2 px-6 text-sm font-semibold transition-all ${
                billingPeriod === 'monthly' ? 'text-white bg-blue-600' : 'text-gray-300'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`relative rounded-full py-2 px-6 text-sm font-semibold transition-all ${
                billingPeriod === 'annually' ? 'text-white bg-blue-600' : 'text-gray-300'
              }`}
              onClick={() => setBillingPeriod('annually')}
            >
              Annually
              <span className="absolute -right-1 -top-3 text-xs font-semibold bg-green-500 text-white py-0.5 px-2 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-3xl p-8 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-blue-600 to-blue-800 ring-1 ring-blue-500'
                  : 'bg-gray-900 ring-1 ring-gray-800'
              }`}
            >
              <div className="mb-6">
                <h3 className={`text-lg font-semibold leading-8 ${plan.highlight ? 'text-white' : 'text-white'}`}>{plan.name}</h3>
                <p className={`mt-2 text-sm leading-6 ${plan.highlight ? 'text-blue-100' : 'text-gray-300'}`}>{plan.description}</p>
                <p className="mt-6">
                  <span className={`text-4xl font-bold tracking-tight ${plan.highlight ? 'text-white' : 'text-white'}`}>
                    {billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnually}
                  </span>
                  {plan.name !== 'Enterprise' && (
                    <span className={`text-sm font-semibold leading-6 ${plan.highlight ? 'text-blue-100' : 'text-gray-300'}`}>
                      /month
                    </span>
                  )}
                </p>
              </div>
              <div className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex gap-x-3">
                      <svg
                        className={`h-6 w-5 flex-none ${plan.highlight ? 'text-blue-200' : 'text-blue-500'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={`text-sm leading-6 ${plan.highlight ? 'text-blue-100' : 'text-gray-300'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`mt-8 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2 ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50 focus-visible:outline-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;