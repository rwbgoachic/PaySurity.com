
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import LandingBlogSection from "@/components/landing-blog-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="border-b border-gray-100 py-4 bg-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="PaySurity" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-900">PaySurity</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
            <Link to="/solutions" className="text-gray-600 hover:text-gray-900">Solutions</Link>
            <Link to="/digital-wallet" className="text-gray-600 hover:text-gray-900">Digital Wallet</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link to="/documentation" className="text-gray-600 hover:text-gray-900">Docs</Link>
            <Link to="/auth" className="text-gray-600 hover:text-gray-900">Sign in</Link>
            <Button asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Secure Payment Solutions for Modern Business
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your payment processing with our comprehensive suite of tools designed for businesses of all sizes.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link to="/contact">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/documentation">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Complete Payment Processing Solution</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Payment Processing</h3>
              <p className="text-gray-600">Accept payments securely with our PCI-compliant payment processing system.</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Digital Wallet</h3>
              <p className="text-gray-600">Manage funds and transactions with our integrated digital wallet solution.</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">POS Systems</h3>
              <p className="text-gray-600">Modern point-of-sale systems for retail and restaurant businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <LandingBlogSection />

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-gray-600 hover:text-gray-900">All Products</Link></li>
                <li><Link to="/digital-wallet" className="text-gray-600 hover:text-gray-900">Digital Wallet</Link></li>
                <li><Link to="/pos-systems" className="text-gray-600 hover:text-gray-900">POS Systems</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><Link to="/industry-solutions" className="text-gray-600 hover:text-gray-900">Industry Solutions</Link></li>
                <li><Link to="/partners" className="text-gray-600 hover:text-gray-900">Partners</Link></li>
                <li><Link to="/affiliates" className="text-gray-600 hover:text-gray-900">Affiliates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
                <li><Link to="/careers" className="text-gray-600 hover:text-gray-900">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/documentation" className="text-gray-600 hover:text-gray-900">Documentation</Link></li>
                <li><Link to="/support" className="text-gray-600 hover:text-gray-900">Help Center</Link></li>
                <li><Link to="/legal" className="text-gray-600 hover:text-gray-900">Legal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} PaySurity. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
