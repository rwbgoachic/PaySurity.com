import React from 'react';
import Section from '../../components/ui/Section';
import { Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PayrollPricing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleContactSales = () => {
    navigate('/contact');
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white pt-16 pb-16">
        <Section>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Payroll Pricing
            </h1>
            <p className="text-xl text-blue-100">
              Affordable payroll processing for businesses of all sizes
            </p>
          </div>
        </Section>
      </div>

      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pay only for what you use with our per-employee pricing model
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Plan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
              <div className="p-8 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Standard</h3>
                    <p className="mt-1 text-gray-500">For small to medium businesses</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Most Popular
                  </span>
                </div>
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900">$10</span>
                    <span className="ml-1 text-xl text-gray-500">/employee</span>
                  </div>
                  <p className="mt-1 text-gray-500">per payroll run</p>
                </div>
              </div>

              <div className="p-8 flex-grow">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Unlimited payroll runs</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Direct deposit</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Tax filing and payments</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Employee self-service portal</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Year-end W-2s and 1099s</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Standard reports</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Email and chat support</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 border-t border-gray-200">
                <button
                  onClick={handleGetStarted}
                  className="w-full h-12 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700 rounded-md"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
              <div className="p-8 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                  <p className="mt-1 text-gray-500">For businesses with 100+ employees</p>
                </div>
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900">$5</span>
                    <span className="ml-1 text-xl text-gray-500">/employee</span>
                  </div>
                  <p className="mt-1 text-gray-500">per payroll run</p>
                </div>
              </div>

              <div className="p-8 flex-grow">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>All Standard features</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Priority processing</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Advanced compliance tools</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Custom reporting</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Multi-state tax filing</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Phone, email, and priority support</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 border-t border-gray-200">
                <button
                  onClick={handleContactSales}
                  className="w-full h-12 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our payroll pricing
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">How does per-employee pricing work?</h3>
              <p className="text-gray-600">
                You only pay for active employees who are processed in each payroll run. If an employee doesn't receive a paycheck in a particular pay period, you won't be charged for them.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Are there any setup fees?</h3>
              <p className="text-gray-600">
                No, there are no setup fees. You only pay the per-employee fee for each payroll run.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">What's included in tax filing?</h3>
              <p className="text-gray-600">
                Our tax filing service includes calculation, payment, and filing of all federal, state, and local payroll taxes. We also handle year-end tax forms like W-2s and 1099s.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">How do I qualify for the Enterprise rate?</h3>
              <p className="text-gray-600">
                The Enterprise rate of $5 per employee per payroll run is available for businesses with 100 or more employees. Contact our sales team to discuss your specific needs and confirm eligibility.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade to the Enterprise plan once you reach 100 employees. Our team will work with you to ensure a smooth transition.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="bg-blue-900 text-white p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Payroll?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust PaySurity for their payroll needs. Get started today with a free trial.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="h-12 px-8 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50 rounded-md"
            >
              Start Free Trial
            </button>
            <button 
              onClick={handleContactSales}
              className="h-12 px-8 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-800 hover:border-blue-800 rounded-md"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </Section>
    </>
  );
}