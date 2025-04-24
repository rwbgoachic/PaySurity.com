import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../../components/ui/Section';
import { 
  Shield, CreditCard, Zap, BarChart3, DollarSign, Clock 
} from 'lucide-react';

export default function MerchantServices() {
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
              Accept Payments Anywhere, Anytime
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Secure, reliable payment processing for businesses of all sizes. Get started with our all-in-one merchant services solution.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleGetStarted}
                className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50"
              >
                Start Free Trial
              </button>
              <button 
                onClick={handleContactSales}
                className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-600 hover:border-blue-600"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
            <p className="text-gray-600">
              PCI-compliant payment processing with advanced fraud protection and encryption.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CreditCard className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multiple Payment Methods</h3>
            <p className="text-gray-600">
              Accept credit cards, debit cards, digital wallets, and ACH payments.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Zap className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Processing</h3>
            <p className="text-gray-600">
              Fast transaction processing with real-time payment confirmation.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BarChart3 className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
            <p className="text-gray-600">
              Track sales, monitor transactions, and gain valuable insights.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <DollarSign className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Competitive Rates</h3>
            <p className="text-gray-600">
              Transparent pricing with no hidden fees and volume-based discounts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Clock className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Round-the-clock customer support to help you with any issues.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pricing Plans</h2>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-2">Standard</h3>
            <div className="text-3xl font-bold mb-4">
              2.9% + 30¢
              <span className="text-sm font-normal text-gray-500 block">per transaction</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Basic fraud protection
              </li>
              <li className="flex items-center text-gray-600">
                <CreditCard className="h-5 w-5 mr-2 text-green-500" />
                Credit & debit cards
              </li>
              <li className="flex items-center text-gray-600">
                <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                Basic reporting
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white hover:bg-blue-700">Get Started</button>
          </div>

          <div className="bg-blue-50 rounded-lg shadow-md p-8 relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Plus</h3>
            <div className="text-3xl font-bold mb-4">
              2.5% + 25¢
              <span className="text-sm font-normal text-gray-500 block">per transaction</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Advanced fraud protection
              </li>
              <li className="flex items-center text-gray-600">
                <CreditCard className="h-5 w-5 mr-2 text-green-500" />
                All payment methods
              </li>
              <li className="flex items-center text-gray-600">
                <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                Advanced analytics
              </li>
              <li className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                Priority support
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white hover:bg-blue-700">Get Started</button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <div className="text-3xl font-bold mb-4">
              Custom
              <span className="text-sm font-normal text-gray-500 block">volume-based pricing</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Custom security features
              </li>
              <li className="flex items-center text-gray-600">
                <CreditCard className="h-5 w-5 mr-2 text-green-500" />
                All payment methods
              </li>
              <li className="flex items-center text-gray-600">
                <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                Custom reporting
              </li>
              <li className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                Dedicated account manager
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50">Contact Sales</button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="bg-blue-900 text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust PaySurity for their payment processing needs. Get started today with a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50"
            >
              Start Free Trial
            </button>
            <button 
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-600 hover:border-blue-600"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </Section>
    </>
  );
}