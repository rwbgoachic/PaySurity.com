import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DarkThemeLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNav?: boolean;
  showFooter?: boolean;
}

export function DarkThemeLayout({
  children,
  className,
  showNav = true,
  showFooter = true,
}: DarkThemeLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {showNav && <DarkNavbar />}
      <main className={cn("", className)}>{children}</main>
      {showFooter && <DarkFooter />}
    </div>
  );
}

export function DarkNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg border-b border-gray-800/30 bg-black/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">PaySurity</span>
              </div>
            </Link>
            
            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/products">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Products</span>
              </Link>
              <Link to="/digital-wallet">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Digital Wallet</span>
              </Link>
              <Link to="/industry-solutions">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Solutions</span>
              </Link>
              <Link to="/pos-systems">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">POS Systems</span>
              </Link>
              <Link to="/pricing">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</span>
              </Link>
            </nav>
          </div>
          
          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex text-gray-300 hover:text-white hover:bg-gray-800">Login</Button>
            </Link>
            <Link to="/auth">
              <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DarkFooter() {
  return (
    <footer className="py-16 border-t border-gray-800/30 bg-black">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">PaySurity</h3>
            <p className="text-gray-400 mb-4 max-w-xs">
              Comprehensive payment infrastructure for modern businesses of all sizes.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © {new Date().getFullYear()} PaySurity. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-400">Products</h4>
            <ul className="space-y-4">
              <li><Link to="/products"><span className="text-gray-400 hover:text-white text-sm">Overview</span></Link></li>
              <li><Link to="/digital-wallet"><span className="text-gray-400 hover:text-white text-sm">Digital Wallet</span></Link></li>
              <li><Link to="/pos-systems"><span className="text-gray-400 hover:text-white text-sm">POS Systems</span></Link></li>
              <li><Link to="/payments"><span className="text-gray-400 hover:text-white text-sm">Payment Processing</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-400">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about"><span className="text-gray-400 hover:text-white text-sm">About</span></Link></li>
              <li><Link to="/careers"><span className="text-gray-400 hover:text-white text-sm">Careers</span></Link></li>
              <li><Link to="/contact"><span className="text-gray-400 hover:text-white text-sm">Contact</span></Link></li>
              <li><Link to="/blog"><span className="text-gray-400 hover:text-white text-sm">Blog</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-400">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/documentation"><span className="text-gray-400 hover:text-white text-sm">Documentation</span></Link></li>
              <li><Link to="/faq"><span className="text-gray-400 hover:text-white text-sm">FAQ</span></Link></li>
              <li><Link to="/support"><span className="text-gray-400 hover:text-white text-sm">Support</span></Link></li>
              <li><Link to="/legal"><span className="text-gray-400 hover:text-white text-sm">Legal</span></Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}