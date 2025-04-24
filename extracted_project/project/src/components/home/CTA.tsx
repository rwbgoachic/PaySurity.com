import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../ui/Section';

const CTA = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/solutions/merchants');
  };

  const handleScheduleDemo = () => {
    navigate('/contact');
  };

  return (
    <Section className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of businesses that trust PaySurity for their payment processing and management needs. Get started today with our all-in-one solution.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50 w-full sm:w-auto"
            onClick={handleGetStarted}
          >
            Get Started with Merchant Services
          </button>
          <button 
            className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-600 hover:border-blue-600 w-full sm:w-auto"
            onClick={handleScheduleDemo}
          >
            Schedule a Demo
          </button>
        </div>
      </div>
    </Section>
  );
};

export default CTA;