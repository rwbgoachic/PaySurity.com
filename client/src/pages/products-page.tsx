import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Building2,
  Globe,
  Smartphone,
  Wallet,
  ChevronRight
} from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">PaySurity</span>
              </div>
            </Link>
            
            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/products">
                <span className="text-sm text-gray-900 font-medium transition-colors">Products</span>
              </Link>
              <Link to="/digital-wallet">
                <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Digital Wallet</span>
              </Link>
              <Link to="/industry-solutions">
                <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Solutions</span>
              </Link>
              <Link to="/pos-systems">
                <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors">POS Systems</span>
              </Link>
              <Link to="/pricing">
                <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</span>
              </Link>
            </nav>
          </div>
          
          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">PaySurity Product Suite</h1>
            <p className="text-lg text-neutral-600 mb-6">
              A comprehensive suite of payment processing and financial management products to power your business
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-2">
                <ShieldCheck className="h-4 w-4 mr-2" /> PCI Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-2">
                <ShieldCheck className="h-4 w-4 mr-2" /> HIPAA Compliant
              </Badge>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Core Payment Processing */}
            <div className="mb-20">
              <div className="flex items-start gap-2 mb-3">
                <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center flex-shrink-0 mt-1">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Core Payment Processing</h2>
                  <p className="text-lg text-gray-600 mb-8">Secure, flexible payment solutions for businesses of all sizes</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Payment Gateway</h3>
                      <p className="text-gray-600 mb-4">Process online payments securely with our robust payment gateway.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Multiple payment methods (credit cards, ACH, digital wallets)</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Tokenization for secure recurring payments</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Fraud detection and prevention tools</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">In-Person Payments</h3>
                      <p className="text-gray-600 mb-4">Accept payments in-store with our advanced POS solutions.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Multiple terminal options for different needs</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Contactless payments and mobile terminals</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Integrated inventory and sales reporting</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Recurring Billing</h3>
                      <p className="text-gray-600 mb-4">Streamline subscription and membership billing with automated tools.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Flexible billing schedules and pricing tiers</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Automated retry logic for failed payments</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Customer management portal for self-service</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Virtual Terminal</h3>
                      <p className="text-gray-600 mb-4">Process payments remotely over the phone or via mail order.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Web-based interface accessible from anywhere</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Secure card storage for repeat customers</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Detailed transaction reporting and history</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Digital Wallet & Financial Tools */}
            <div className="mb-20">
              <div className="flex items-start gap-2 mb-3">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center flex-shrink-0 mt-1">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Digital Wallet & Financial Tools</h2>
                  <p className="text-lg text-gray-600 mb-8">Modern wallet solutions for individuals, families, and businesses</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Personal Wallet</h3>
                      <p className="text-gray-600 mb-4">Digital wallet with card-present and online payment capabilities.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Virtual cards for online purchases</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Real-time transaction notifications</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Spending analytics and insights</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Family Wallets</h3>
                      <p className="text-gray-600 mb-4">Multi-user wallet solution for family financial management.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Parent-controlled allowances and spending limits</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Financial education tools for children</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Shared savings goals and joint accounts</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Business Expense Management</h3>
                      <p className="text-gray-600 mb-4">Comprehensive expense tracking and management for businesses.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Multi-employee expense cards with controls</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Receipt capturing and expense categorization</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Approval workflows and policy enforcement</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">ACH & Bank Transfer Services</h3>
                      <p className="text-gray-600 mb-4">Secure bank transfer capabilities for wallets and businesses.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Direct deposit and payroll processing</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Automated clearing house (ACH) payments</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>International wire transfers and FX services</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enterprise Solutions */}
            <div className="mb-20">
              <div className="flex items-start gap-2 mb-3">
                <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center flex-shrink-0 mt-1">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Enterprise Solutions</h2>
                  <p className="text-lg text-gray-600 mb-8">Advanced solutions for large organizations and complex requirements</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Enterprise Payment Gateway</h3>
                      <p className="text-gray-600 mb-4">High-volume payment processing with enhanced security and analytics.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Dedicated infrastructure and custom SLAs</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Advanced fraud prevention and risk scoring</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Multi-currency and cross-border capabilities</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Custom Payment Solutions</h3>
                      <p className="text-gray-600 mb-4">Tailored payment infrastructure for unique business requirements.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Custom API development and integration</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Specialized industry compliance solutions</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>White-labeled and co-branded offerings</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Services */}
            <div>
              <div className="flex items-start gap-2 mb-3">
                <div className="rounded-full bg-orange-100 w-12 h-12 flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Additional Services</h2>
                  <p className="text-lg text-gray-600 mb-8">Complementary services to enhance your payment ecosystem</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Fraud Protection</h3>
                      <p className="text-gray-600 mb-4">Advanced fraud detection and prevention services.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>AI-powered risk scoring</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Custom rule configuration</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Real-time monitoring</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Reporting & Analytics</h3>
                      <p className="text-gray-600 mb-4">Comprehensive reporting tools for business insights.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Customizable dashboards</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Scheduled report delivery</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Data export capabilities</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-3">Developer APIs</h3>
                      <p className="text-gray-600 mb-4">Flexible APIs to integrate PaySurity into your platform.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Comprehensive documentation</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Testing sandbox environment</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>SDK support for major platforms</span>
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Developer Portal <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your payment experience?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of businesses that trust PaySurity for their payment processing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">&copy; 2025 PaySurity, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}