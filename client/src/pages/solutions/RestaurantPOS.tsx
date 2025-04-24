import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantPOS = () => {
  return (
    <div className="bg-gray-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-500">Restaurant POS</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            BistroBeast: The Ultimate Restaurant Management System
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            BistroBeast is a complete restaurant management solution that combines powerful POS 
            capabilities with inventory management, staff scheduling, and integrated payments.
          </p>
        </div>

        <div className="mt-16 bg-gray-900 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-white mb-8">Key Features</h3>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Order Management</h4>
              <p className="mt-2 text-gray-300">Easily manage orders with a user-friendly interface. Split checks, modify items, and process orders quickly.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Table Management</h4>
              <p className="mt-2 text-gray-300">Visualize your restaurant layout, manage reservations, and track table status in real-time.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Inventory Management</h4>
              <p className="mt-2 text-gray-300">Track ingredient usage, manage stock levels, and generate purchase orders automatically.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Reporting & Analytics</h4>
              <p className="mt-2 text-gray-300">Get insights into sales, popular menu items, busy hours, and staff performance.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Staff Management</h4>
              <p className="mt-2 text-gray-300">Schedule shifts, track employee hours, and manage permissions with role-based access control.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">Integrated Payments</h4>
              <p className="mt-2 text-gray-300">Process all types of payments with our secure, integrated payment processing system.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-blue-900 rounded-lg p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-xl font-semibold text-white">Ready to transform your restaurant operations?</h3>
            <p className="mt-4 text-blue-100">
              BistroBeast POS is designed specifically for restaurants of all sizes, from small cafes to large chains.
              Our solution helps you streamline operations, reduce costs, and enhance customer experience.
            </p>
            
            <div className="mt-8 flex justify-center gap-x-6">
              <Link
                to="/contact"
                className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
              >
                Request a Demo
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

export default RestaurantPOS;