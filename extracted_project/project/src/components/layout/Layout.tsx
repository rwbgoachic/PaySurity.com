import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/solutions/');

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      <main className={`flex-grow ${!isHomePage && !isProductPage ? 'mt-16' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;