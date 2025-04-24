import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/solutions/');
  
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent py-4">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              PaySurity
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/solutions/merchants" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
              Merchant Services
            </Link>
            <Link to="/solutions/restaurant" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
              BistroBeast POS
            </Link>
            <Link to="/solutions/grocery" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
              GrocerEase POS
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={() => logout()}
                  className="h-10 px-4 text-sm inline-flex items-center justify-center font-medium bg-transparent border-2 border-white text-white hover:bg-white/10"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="h-10 px-4 text-sm inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-grow ${!isHomePage && !isProductPage ? 'mt-16' : ''}`}>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-gray-800 bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-lg font-bold text-white">PaySurity</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-md">
                Modern payment infrastructure for businesses of all sizes
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Solutions</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/solutions/merchants" className="text-sm text-gray-400 hover:text-blue-500">
                      Merchant Services
                    </Link>
                  </li>
                  <li>
                    <Link to="/solutions/restaurant" className="text-sm text-gray-400 hover:text-blue-500">
                      BistroBeast POS
                    </Link>
                  </li>
                  <li>
                    <Link to="/solutions/grocery" className="text-sm text-gray-400 hover:text-blue-500">
                      GrocerEase POS
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/about" className="text-sm text-gray-400 hover:text-blue-500">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-sm text-gray-400 hover:text-blue-500">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-blue-500">Documentation</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-blue-500">Support</a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-blue-500">Terms</a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-blue-500">Privacy</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-10 border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} PaySurity, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;