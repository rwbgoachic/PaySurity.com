import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import BusinessLines from '../components/home/BusinessLines';
import Testimonials from '../components/home/Testimonials';
import LatestBlogs from '../components/home/LatestBlogs';
import CTA from '../components/home/CTA';

const Home = () => {
  return (
    <>
      <Hero />
      <BusinessLines />
      <Features />
      <Testimonials />
      <LatestBlogs />
      <CTA />
    </>
  );
};

export default Home;