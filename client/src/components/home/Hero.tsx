import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../ui/Container';

const Hero = () => {
  const navigate = useNavigate();
  const [industryIndex, setIndustryIndex] = useState(0);
  const industries = ['Food', 'Restaurants', 'Grocery Stores', 'Payroll'];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndustryIndex((current) => (current + 1) % industries.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleExplore = () => {
    navigate('/solutions/merchants');
  };

  const handleDemo = () => {
    navigate('/contact');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 to-blue-900 text-white pt-16 pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FFF" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '24px' }}></div>
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Unified Business-Centric Payment Solutions for Merchants in{' '}
            <span className="text-cyan-400 inline-block min-w-[200px] transition-all duration-500">
              {industries[industryIndex]}
            </span>{' '}
            Industry
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Streamline operations and payments with our integrated solutions for merchants, restaurants, grocery stores, and payroll services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50"
              onClick={handleExplore}
            >
              Get Started with Merchant Services
            </button>
            <button 
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-600 hover:border-blue-600"
              onClick={handleDemo}
            >
              Schedule a Demo
            </button>
          </div>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent z-10 h-20 bottom-0 top-auto"></div>
          <div className="mx-auto max-w-4xl bg-white/10 backdrop-blur-sm p-6 border border-white/20 transform transition-all duration-500 hover:scale-[1.02]">
            <img 
              src="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="PaySurity Dashboard Preview" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </Container>

      {/* Wave Shape Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;