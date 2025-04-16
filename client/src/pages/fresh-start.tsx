import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function FreshStartLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">PaySurity</span>
              </div>
            </Link>
            
            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-6">
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
              <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">Complete Payment Infrastructure for Modern Business</h1>
            <p className="text-xl text-gray-300 mb-8">
              Streamline payments, reduce costs, and boost your business growth with secure, flexible payment solutions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="px-8 bg-indigo-600 hover:bg-indigo-700">
                Start Now
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Payment Solutions for Every Need</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              From processing credit cards to managing complex financial workflows, PaySurity offers everything you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-indigo-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Payment Processing</h3>
              <p className="text-gray-300 mb-4">Secure, reliable payment acceptance across all channels</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Credit & debit cards</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">ACH & bank transfers</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Digital wallets</span>
                </li>
              </ul>
              <Link to="/products">
                <Button variant="link" className="p-0 h-auto text-indigo-400 hover:text-indigo-300">
                  Learn more →
                </Button>
              </Link>
            </div>
            
            {/* Card 2 */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-indigo-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">POS Systems</h3>
              <p className="text-gray-300 mb-4">Modern point-of-sale solutions for every industry</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Restaurant POS (BistroBeast)</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Retail & e-commerce</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Mobile & contactless</span>
                </li>
              </ul>
              <Link to="/pos-systems">
                <Button variant="link" className="p-0 h-auto text-indigo-400 hover:text-indigo-300">
                  Learn more →
                </Button>
              </Link>
            </div>
            
            {/* Card 3 */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-indigo-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Digital Wallet</h3>
              <p className="text-gray-300 mb-4">Integrated financial management for businesses and consumers</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Multi-currency support</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Expense management</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Family accounts</span>
                </li>
              </ul>
              <Link to="/digital-wallet">
                <Button variant="link" className="p-0 h-auto text-indigo-400 hover:text-indigo-300">
                  Learn more →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">PaySurity</h3>
              <p className="text-gray-400 mb-4 max-w-xs">
                Comprehensive payment infrastructure for modern businesses of all sizes.
              </p>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} PaySurity. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Products</h4>
              <ul className="space-y-2">
                <li><Link to="/products"><span className="text-gray-400 hover:text-white text-sm">Overview</span></Link></li>
                <li><Link to="/digital-wallet"><span className="text-gray-400 hover:text-white text-sm">Digital Wallet</span></Link></li>
                <li><Link to="/pos-systems"><span className="text-gray-400 hover:text-white text-sm">POS Systems</span></Link></li>
                <li><Link to="/payments"><span className="text-gray-400 hover:text-white text-sm">Payment Processing</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about"><span className="text-gray-400 hover:text-white text-sm">About</span></Link></li>
                <li><Link to="/careers"><span className="text-gray-400 hover:text-white text-sm">Careers</span></Link></li>
                <li><Link to="/contact"><span className="text-gray-400 hover:text-white text-sm">Contact</span></Link></li>
                <li><Link to="/blog"><span className="text-gray-400 hover:text-white text-sm">Blog</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/documentation"><span className="text-gray-400 hover:text-white text-sm">Documentation</span></Link></li>
                <li><Link to="/faq"><span className="text-gray-400 hover:text-white text-sm">FAQ</span></Link></li>
                <li><Link to="/support"><span className="text-gray-400 hover:text-white text-sm">Support</span></Link></li>
                <li><Link to="/legal"><span className="text-gray-400 hover:text-white text-sm">Legal</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-400 text-xs">
            Generated on: {new Date().toISOString()} | Build: 2025-04-16-1
          </div>
        </div>
      </footer>
    </div>
  );
}