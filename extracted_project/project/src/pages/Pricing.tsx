import React from 'react';
import Section from '../components/ui/Section';
import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white pt-32 pb-16">
        <Section>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-blue-100">
              Choose the perfect plan for your business needs
            </p>
          </div>
        </Section>
      </div>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-white p-8 shadow-md">
            <h3 className="text-xl font-semibold mb-2">Standard</h3>
            <div className="text-3xl font-bold mb-4">
              $99/mo
              <span className="text-sm font-normal text-gray-500 block">+ 2.9% + 30¢ per transaction</span>
            </div>
            <p className="text-gray-600 mb-6">Perfect for small businesses just getting started</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Basic payment processing</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Standard support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Up to 1,000 transactions/month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Basic analytics</span>
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700">
              Get Started
            </button>
          </div>

          <div className="bg-blue-50 p-8 shadow-md relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional</h3>
            <div className="text-3xl font-bold mb-4">
              $199/mo
              <span className="text-sm font-normal text-gray-500 block">+ 2.5% + 25¢ per transaction</span>
            </div>
            <p className="text-gray-600 mb-6">Ideal for growing businesses</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Advanced payment processing</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Up to 5,000 transactions/month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Custom integrations</span>
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700">
              Get Started
            </button>
          </div>

          <div className="bg-white p-8 shadow-md">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <div className="text-3xl font-bold mb-4">
              Custom
              <span className="text-sm font-normal text-gray-500 block">Contact us for pricing</span>
            </div>
            <p className="text-gray-600 mb-6">For large organizations with specific needs</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Custom payment solutions</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Unlimited transactions</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>Custom reporting</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-1 mr-2" />
                <span>24/7 premium support</span>
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50">
              Contact Sales
            </button>
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods are supported?</h3>
              <p className="text-gray-600">
                We support all major credit cards, debit cards, digital wallets, and ACH payments. Enterprise plans can also include custom payment methods.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Are there any setup fees?</h3>
              <p className="text-gray-600">
                No, there are no setup fees. You only pay the monthly subscription and per-transaction fees based on your plan.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What kind of support is included?</h3>
              <p className="text-gray-600">
                All plans include email support. Professional plans include priority support, while Enterprise plans include 24/7 dedicated support.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}