import React from 'react';
import { Link } from 'react-router-dom';

const GroceryPOS = () => {
  return (
    <div className="bg-gray-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-500">Grocery POS</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            GrocerEase: Modernize Your Grocery Store
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            GrocerEase is a comprehensive grocery store management system that streamlines checkout,
            inventory management, and customer loyalty programs for modern grocery retailers.
          </p>
        </div>

        <div className="mt-16 bg-gray-900 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-white mb-8">Essential Features</h3>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Fast Checkout</h4>
              <p className="mt-2 text-gray-300">Speed up the checkout process with barcode scanning, easy product lookup, and quick payment processing.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Inventory Management</h4>
              <p className="mt-2 text-gray-300">Track stock levels, manage product data, and automate reordering with advanced inventory tools.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Promotions & Pricing</h4>
              <p className="mt-2 text-gray-300">Create and manage discounts, sales, and special offers. Support for BOGO, bundle pricing, and more.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Customer Loyalty</h4>
              <p className="mt-2 text-gray-300">Build customer relationships with loyalty programs, digital receipts, and personalized offers.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Advanced Reporting</h4>
              <p className="mt-2 text-gray-300">Gain insights into sales trends, inventory movement, and customer purchasing patterns.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Secure Payments</h4>
              <p className="mt-2 text-gray-300">Accept all payment types with our secure, integrated payment processing system.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-gray-900 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-white mb-4">For Small to Medium Grocery Stores</h3>
            <p className="text-gray-300 mb-6">
              GrocerEase scales to fit your business needs, whether you're a single-location 
              specialty grocer or a regional chain with multiple stores.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Affordable monthly pricing
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Easy setup and onboarding
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Works with existing hardware
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cloud-based with local backup
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-white mb-4">For Large Grocery Chains</h3>
            <p className="text-gray-300 mb-6">
              Our enterprise solutions provide the power and flexibility needed to manage
              complex operations across multiple locations.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Centralized management console
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Advanced inventory distribution
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Custom API integrations
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Dedicated account management
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 bg-blue-900 rounded-lg p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-xl font-semibold text-white">Ready to modernize your grocery store?</h3>
            <p className="mt-4 text-blue-100">
              GrocerEase POS helps you streamline operations, improve inventory management,
              and enhance the customer shopping experience.
            </p>
            
            <div className="mt-8 flex justify-center gap-x-6">
              <Link
                to="/contact"
                className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
              >
                Schedule a Demo
              </Link>
              <Link
                to="/pricing"
                className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryPOS;