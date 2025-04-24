import React from 'react';
import { Link } from 'react-router-dom';

const Verify = () => {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-950 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-blue-500">PaySurity</h2>
        </Link>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-gray-900 px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Email Verification Required
            </h2>
            <p className="mt-4 text-sm text-gray-300">
              We've sent a verification email to your inbox. Please check your email and click on the
              verification link to activate your account.
            </p>
            
            <div className="mt-8 space-y-6">
              <div className="bg-gray-800 p-4 rounded-md text-left">
                <h3 className="text-sm font-medium text-white">Didn't receive an email?</h3>
                <p className="mt-2 text-xs text-gray-400">
                  Make sure to check your spam or junk folder. If you still don't see it, you can request a new
                  verification email.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Resend verification email
                </button>
              </div>
              
              <div className="text-center">
                <Link
                  to="/login"
                  className="font-semibold leading-6 text-blue-500 hover:text-blue-400 text-sm"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;