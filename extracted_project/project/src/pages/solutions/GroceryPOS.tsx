import React from 'react';
import Section from '../../components/ui/Section';
import { 
  ShoppingCart, CreditCard, BarChart3, Users, 
  ShoppingBag, Clock, Smartphone, Receipt, Truck, Tag 
} from 'lucide-react';

export default function GroceryPOS() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white pt-16 pb-16">
        <Section>
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-cyan-400">GrocerEase</h2>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">
                Modern Grocery Store Management Solution
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              Streamline your grocery store operations with our comprehensive POS system, inventory management, and integrated payment solutions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50"
              >
                Get Started
              </button>
              <button 
                className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-600 hover:border-blue-600"
              >
                View Demo
              </button>
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 shadow-md">
            <ShoppingCart className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart POS System</h3>
            <p className="text-gray-600">
              Fast and intuitive checkout process with support for multiple payment methods.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md">
            <ShoppingBag className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
            <p className="text-gray-600">
              Real-time inventory tracking with automated reordering and waste management.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md">
            <Tag className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Price Management</h3>
            <p className="text-gray-600">
              Dynamic pricing, promotions, and automated price updates across all channels.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md">
            <Users className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Customer Loyalty</h3>
            <p className="text-gray-600">
              Robust loyalty program with personalized offers and rewards.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md">
            <Truck className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Supplier Management</h3>
            <p className="text-gray-600">
              Streamlined ordering and receiving with automated purchase orders.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md">
            <BarChart3 className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics & Reporting</h3>
            <p className="text-gray-600">
              Comprehensive reporting on sales, inventory, and customer behavior.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">All-Inclusive Pricing</h2>
          <p className="text-xl text-gray-600">
            Everything you need to run your grocery store efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white shadow-md p-8">
            <h3 className="text-xl font-semibold mb-2">Essential</h3>
            <div className="text-3xl font-bold mb-4">
              $199/mo
              <span className="text-sm font-normal text-gray-500 block">+ 2.9% + 30¢ per transaction</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <ShoppingCart className="h-5 w-5 mr-2 text-green-500" />
                Basic POS features
              </li>
              <li className="flex items-center text-gray-600">
                <ShoppingBag className="h-5 w-5 mr-2 text-green-500" />
                Basic inventory management
              </li>
              <li className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Up to 5 users
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700">
              Get Started
            </button>
          </div>

          <div className="bg-blue-50 shadow-md p-8 relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional</h3>
            <div className="text-3xl font-bold mb-4">
              $399/mo
              <span className="text-sm font-normal text-gray-500 block">+ 2.5% + 25¢ per transaction</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <ShoppingCart className="h-5 w-5 mr-2 text-green-500" />
                Advanced POS features
              </li>
              <li className="flex items-center text-gray-600">
                <ShoppingBag className="h-5 w-5 mr-2 text-green-500" />
                Full inventory management
              </li>
              <li className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Unlimited users
              </li>
              <li className="flex items-center text-gray-600">
                <Tag className="h-5 w-5 mr-2 text-green-500" />
                Advanced pricing tools
              </li>
              <li className="flex items-center text-gray-600">
                <Truck className="h-5 w-5 mr-2 text-green-500" />
                Supplier management
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700">
              Get Started
            </button>
          </div>

          <div className="bg-white shadow-md p-8">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <div className="text-3xl font-bold mb-4">
              Custom
              <span className="text-sm font-normal text-gray-500 block">volume-based pricing</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <ShoppingCart className="h-5 w-5 mr-2 text-green-500" />
                Custom POS setup
              </li>
              <li className="flex items-center text-gray-600">
                <ShoppingBag className="h-5 w-5 mr-2 text-green-500" />
                Advanced inventory features
              </li>
              <li className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Multi-store support
              </li>
              <li className="flex items-center text-gray-600">
                <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                Custom reporting
              </li>
              <li className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                Dedicated support
              </li>
            </ul>
            <button className="w-full h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50">
              Contact Sales
            </button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="bg-blue-900 text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Grocery Store?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of grocery stores that trust GrocerEase for their POS and payment needs. Get started today with a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50"
            >
              Get Started
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