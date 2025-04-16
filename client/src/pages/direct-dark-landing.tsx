import React from "react";
import { Link } from "wouter";

export default function DirectDarkLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Simplified Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/70 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/">
              <a className="text-2xl font-bold text-blue-500">PaySurity</a>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/products">
              <a className="text-sm font-medium text-gray-300 hover:text-blue-500 transition-colors">Products</a>
            </Link>
            <Link href="/pricing">
              <a className="text-sm font-medium text-gray-300 hover:text-blue-500 transition-colors">Pricing</a>
            </Link>
            <Link href="/industry-solutions">
              <a className="text-sm font-medium text-gray-300 hover:text-blue-500 transition-colors">Industries</a>
            </Link>
            <Link href="/digital-wallet">
              <a className="text-sm font-medium text-gray-300 hover:text-blue-500 transition-colors">Digital Wallet</a>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/auth?mode=login">
              <a className="rounded-md px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors">
                Log in
              </a>
            </Link>
            <Link href="/auth?mode=register">
              <a className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
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
              <a href="/auth?mode=register" className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                Get started
              </a>
              <a href="/products" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
                Explore products <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
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
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Products</h4>
                <ul className="space-y-2">
                  <li><a href="/products" className="text-sm text-gray-400 hover:text-blue-500">Payment Processing</a></li>
                  <li><a href="/digital-wallet" className="text-sm text-gray-400 hover:text-blue-500">Digital Wallet</a></li>
                  <li><a href="/pos-systems" className="text-sm text-gray-400 hover:text-blue-500">POS Systems</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-sm text-gray-400 hover:text-blue-500">About</a></li>
                  <li><a href="/contact" className="text-sm text-gray-400 hover:text-blue-500">Contact</a></li>
                  <li><a href="/careers" className="text-sm text-gray-400 hover:text-blue-500">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="/documentation" className="text-sm text-gray-400 hover:text-blue-500">Documentation</a></li>
                  <li><a href="/support" className="text-sm text-gray-400 hover:text-blue-500">Support</a></li>
                  <li><a href="/faq" className="text-sm text-gray-400 hover:text-blue-500">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-200 mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="/legal/terms" className="text-sm text-gray-400 hover:text-blue-500">Terms</a></li>
                  <li><a href="/legal/privacy" className="text-sm text-gray-400 hover:text-blue-500">Privacy</a></li>
                  <li><a href="/legal/security" className="text-sm text-gray-400 hover:text-blue-500">Security</a></li>
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
}