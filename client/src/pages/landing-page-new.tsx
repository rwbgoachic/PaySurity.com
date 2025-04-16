import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPageNew() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Extremely obvious banner */}
      <div style={{
        background: "red",
        color: "white",
        fontSize: "32px",
        padding: "30px",
        textAlign: "center",
        fontWeight: "bold"
      }}>
        THIS IS THE NEW REPLACEMENT LANDING PAGE - APRIL 16TH
      </div>
      
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PaySurity</h1>
          <nav className="hidden md:flex space-x-6">
            <Link to="/products">Products</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline">Log In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Advanced Payment Solutions for Modern Businesses
            </h2>
            <p className="text-lg md:text-xl mb-10 text-gray-600 max-w-3xl mx-auto">
              PaySurity provides integrated payment processing, financial management, and workflow optimization tools to streamline your business operations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Explore Solutions</Button>
              <Button size="lg" variant="outline">Contact Sales</Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
            <p className="text-center mb-12 text-gray-600 max-w-3xl mx-auto">
              Discover how our comprehensive platform can help you manage payments, optimize workflows, and grow your business.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Payment Processing</h3>
                <p className="text-gray-600">Process payments securely with multiple gateway options, fraud protection, and PCI compliance.</p>
              </div>
              
              <div className="p-6 border rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Financial Management</h3>
                <p className="text-gray-600">Comprehensive tools for invoicing, accounting, and financial reporting to keep your business on track.</p>
              </div>
              
              <div className="p-6 border rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Workflow Optimization</h3>
                <p className="text-gray-600">Automate routine tasks, streamline approvals, and optimize business processes for maximum efficiency.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Industry Solutions</h2>
            <p className="text-center mb-12 text-gray-600 max-w-3xl mx-auto">
              Tailored solutions for various industries to address specific payment and workflow challenges.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Retail</h3>
                <p className="text-gray-600 text-sm">Streamline checkout processes, inventory management, and customer loyalty programs.</p>
              </div>
              
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Restaurants</h3>
                <p className="text-gray-600 text-sm">Integrated solutions for table management, ordering, and staff coordination.</p>
              </div>
              
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Healthcare</h3>
                <p className="text-gray-600 text-sm">HIPAA-compliant payment processing and patient billing management.</p>
              </div>
              
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Professional Services</h3>
                <p className="text-gray-600 text-sm">Time tracking, client management, and automated invoicing solutions.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PaySurity</h3>
              <p className="text-gray-400">Streamlining payments and financial workflows for modern businesses.</p>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/payments" className="hover:text-white">Payment Processing</a></li>
                <li><a href="/finances" className="hover:text-white">Financial Tools</a></li>
                <li><a href="/workflows" className="hover:text-white">Workflow Automation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/support" className="hover:text-white">Support Center</a></li>
                <li><a href="/documentation" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 PaySurity. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}