import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-black to-gray-900 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          <span className="block">Modern Payment</span>
          <span className="block text-blue-500">Infrastructure</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Comprehensive payment solutions empowering businesses with seamless 
          processing, digital wallets, and integrated POS systems.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link 
            to="/signup" 
            className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get started
          </Link>
          <Link 
            to="/solutions/merchants" 
            className="text-sm font-semibold leading-6 text-white hover:text-blue-300"
          >
            Explore solutions <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;