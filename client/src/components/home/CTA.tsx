import React from 'react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-600 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your payment experience?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
            Join thousands of businesses that trust PaySurity for their payment processing needs.
            Get started today and see the difference.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold leading-6 text-white hover:text-blue-200"
            >
              Contact sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;