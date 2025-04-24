import React from 'react';
import { Link } from 'react-router-dom';

const MerchantServices = () => {
  return (
    <div className="bg-gray-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-500">Merchant Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Payment processing solutions for businesses of all sizes
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Accept payments online, in-store, or on the go with our comprehensive merchant services.
            Our solutions are designed to be flexible, secure, and easy to integrate with your existing systems.
          </p>
        </div>

        <div className="mt-16 flow-root sm:mt-20">
          <div className="rounded-lg bg-gray-900 p-8">
            <h3 className="text-xl font-semibold text-white">Core Features</h3>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">Card Present</h4>
                <p className="mt-2 text-gray-300">Accept in-person payments with our secure POS terminals and mobile card readers.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">Card Not Present</h4>
                <p className="mt-2 text-gray-300">Process online payments securely with our payment gateway and virtual terminal.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">Fraud Protection</h4>
                <p className="mt-2 text-gray-300">Advanced fraud detection and prevention tools to protect your business and customers.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">Recurring Billing</h4>
                <p className="mt-2 text-gray-300">Automate subscription payments and recurring invoices with our billing system.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">Reporting & Analytics</h4>
                <p className="mt-2 text-gray-300">Gain insights into your payment data with comprehensive reporting and analytics tools.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">Developer APIs</h4>
                <p className="mt-2 text-gray-300">Powerful APIs and SDKs for custom integrations with your existing systems.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gray-900 rounded-lg p-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h3 className="text-xl font-semibold text-white">Why Choose PaySurity?</h3>
            <p className="mt-4 text-gray-300">
              We offer competitive rates, transparent pricing, and industry-leading security features.
              Our merchant services are designed to grow with your business, providing the flexibility
              you need to succeed.
            </p>
          </div>
          
          <div className="mt-10 flex justify-center">
            <Link
              to="/contact"
              className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantServices;