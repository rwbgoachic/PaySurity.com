import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import BusinessLines from '../components/home/BusinessLines';
import CTA from '../components/home/CTA';

const Home = () => {
  return (
    <>
      <Hero />
      <BusinessLines />
      <Features />
      <CTA />
    </>
  );
};

export default Home;