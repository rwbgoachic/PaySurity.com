import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackedAccordion, TrackedAccordionTrigger } from "@/lib/analytics";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { ScheduleDemoForm } from "@/components/schedule-demo-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { 
  CreditCard, 
  BarChart, 
  ShieldCheck, 
  Building2, 
  CheckCircle2,
  Clock,
  Store,
  DollarSign,
  Users,
  Play,
  ShoppingBag,
  Headphones,
  HeartHandshake,
  ChevronRight,
  ArrowRight,
  Globe,
  Smartphone,
  PiggyBank,
  ArrowUpRight
} from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress, SiDiscover, SiApple, SiGoogle } from "react-icons/si";
import { useState } from "react";

export default function LandingPage() {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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
                <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Products</span>
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
          
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign in</span>
            </Link>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
              <Link to="/auth">
                <span>Get started</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 bg-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white opacity-50 z-0"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-sm font-medium text-purple-800 mb-8">
              <span>New: Introducing Family Wallets</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Financial infrastructure for businesses
            </h1>
            <p className="text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
              Millions of companies of all sizes use PaySurity to modernize their payment stack, saving on fees while boosting shareholder confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="font-medium bg-purple-600 hover:bg-purple-700">Start now</Button>
                </DialogTrigger>
                <ScheduleDemoForm onSuccess={() => setIsScheduleModalOpen(false)} />
              </Dialog>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Link to="/pricing">
                  <span>Contact sales</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Animated cards */}
          <div className="relative w-full h-[550px] md:h-96 overflow-hidden mb-20">
            <div className="absolute left-1/2 transform -translate-x-1/2 grid grid-cols-1 md:grid-cols-3 gap-6 w-[85%] md:w-[90%] lg:w-[85%] xl:w-[80%] opacity-90">
              {/* Row 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="rounded-full bg-purple-100 w-10 h-10 flex items-center justify-center mb-4">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Unified Payments</h3>
                <p className="text-sm text-gray-600">Accept payments online, in-person, or via mobile with a single integration.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Global Scale</h3>
                <p className="text-sm text-gray-600">Process payments in 135+ currencies with local acquiring in 40+ countries.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="rounded-full bg-green-100 w-10 h-10 flex items-center justify-center mb-4">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Revenue Optimization</h3>
                <p className="text-sm text-gray-600">Reduce costs and increase revenue with our intelligent routing.</p>
              </div>
              
              {/* Row 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 md:translate-y-4">
                <div className="rounded-full bg-orange-100 w-10 h-10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Fraud Prevention</h3>
                <p className="text-sm text-gray-600">AI-powered fraud detection that adapts to your business needs.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 md:translate-y-4">
                <div className="rounded-full bg-indigo-100 w-10 h-10 flex items-center justify-center mb-4">
                  <BarChart className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-sm text-gray-600">Get instant insights into your payment performance and customer behavior.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 md:translate-y-4">
                <div className="rounded-full bg-red-100 w-10 h-10 flex items-center justify-center mb-4">
                  <Smartphone className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Mobile Wallets</h3>
                <p className="text-sm text-gray-600">Enable Apple Pay, Google Pay, and other mobile payment methods seamlessly.</p>
              </div>
            </div>
          </div>
          
          {/* Social proof */}
          <div className="text-center mb-12">
            <p className="text-sm text-gray-500 mb-6">TRUSTED BY LEADING COMPANIES WORLDWIDE</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <SiVisa className="h-6 w-auto text-blue-600 opacity-70" />
              <SiMastercard className="h-6 w-auto text-orange-500 opacity-70" />
              <SiAmericanexpress className="h-6 w-auto text-blue-500 opacity-70" />
              <SiDiscover className="h-6 w-auto text-orange-600 opacity-70" />
              <SiApple className="h-6 w-auto text-gray-800 opacity-70" />
              <SiGoogle className="h-6 w-auto text-gray-600 opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Overview Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">A complete payment infrastructure</h2>
            <p className="text-lg text-gray-600 mb-16 text-center">
              PaySurity provides a suite of products that power commerce for businesses of all sizes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            {/* Card 1 */}
            <div className="bg-white p-6">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-5">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Payments</h3>
              <p className="text-gray-600 mb-4">
                A complete payments platform engineered for growth and scale. Accept payments online or in-person.
              </p>
              <a href="/payments" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                Explore Payments <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white p-6">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-5">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Merchant Solutions</h3>
              <p className="text-gray-600 mb-4">
                Industry-specific solutions designed for your business needs, from restaurants to healthcare.
              </p>
              <a href="/industry-solutions" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                View Solutions <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white p-6">
              <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mb-5">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Digital Wallet</h3>
              <p className="text-gray-600 mb-4">
                Secure and flexible digital wallets for families and businesses with expense management tools.
              </p>
              <a href="/digital-wallet" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                Explore Wallets <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Card 4 */}
            <div className="bg-white p-6">
              <div className="rounded-full bg-orange-100 w-12 h-12 flex items-center justify-center mb-5">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enterprise</h3>
              <p className="text-gray-600 mb-4">
                Custom solutions for complex organizations with advanced security and compliance needs.
              </p>
              <a href="/enterprise" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Card 5 */}
            <div className="bg-white p-6">
              <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-5">
                <BarChart className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics</h3>
              <p className="text-gray-600 mb-4">
                Real-time insights and reporting to optimize your business operations and growth.
              </p>
              <a href="/analytics" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                Explore Analytics <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            {/* Card 6 */}
            <div className="bg-white p-6">
              <div className="rounded-full bg-pink-100 w-12 h-12 flex items-center justify-center mb-5">
                <Headphones className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Support</h3>
              <p className="text-gray-600 mb-4">
                24/7 dedicated support for all your payment and business operation needs.
              </p>
              <a href="/support" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                Get Support <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Compliance badges in a simple strip */}
          <div className="grid grid-cols-4 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center flex-col">
              <ShieldCheck className="h-10 w-10 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">PCI Compliant</span>
            </div>
            <div className="flex items-center justify-center flex-col">
              <ShieldCheck className="h-10 w-10 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">GDPR Compliant</span>
            </div>
            <div className="flex items-center justify-center flex-col">
              <ShieldCheck className="h-10 w-10 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">ABA Compliant</span>
            </div>
            <div className="flex items-center justify-center flex-col">
              <ShieldCheck className="h-10 w-10 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions Section */}
      <section id="solutions" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Solutions for every industry</h2>
            <p className="text-lg text-gray-600 text-center">
              Specialized payment solutions tailored for your business needs. We've built industry-specific tools to help merchants succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Restaurant Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-full bg-orange-100 w-12 h-12 flex items-center justify-center">
                    <Store className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="w-24 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-md flex items-center justify-center">
                    <div className="w-16 h-10 border border-orange-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-orange-400">UI Preview</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Restaurant Management</h3>
                <p className="text-gray-600 mb-4">Complete restaurant solution with POS, inventory, scheduling, and table management.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Integrated tip calculations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Table management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Employee scheduling</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link to="/pos-systems" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                  <span>Learn more <ArrowRight className="ml-2 h-4 w-4 inline" /></span>
                </Link>
              </div>
            </div>
            
            {/* E-commerce Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="w-24 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-md flex items-center justify-center">
                    <div className="w-16 h-10 border border-blue-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-blue-400">UI Preview</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">E-commerce</h3>
                <p className="text-gray-600 mb-4">Complete online store solution with cart integration, payment gateways, and fraud prevention.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">One-click checkout</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Multi-currency support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Inventory synchronization</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link href="/industry-solutions" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Legal Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="w-24 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-md flex items-center justify-center">
                    <div className="w-16 h-10 border border-indigo-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-indigo-400">UI Preview</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Legal Practice</h3>
                <p className="text-gray-600 mb-4">Practice management solution for law firms with trust accounting and client payment portals.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">IOLTA compliant trust accounting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Automated invoice generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Client payment portals</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link href="/industry-solutions" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Healthcare Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-full bg-red-100 w-12 h-12 flex items-center justify-center">
                    <HeartHandshake className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="w-24 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-md flex items-center justify-center">
                    <div className="w-16 h-10 border border-red-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-red-400">UI Preview</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Healthcare</h3>
                <p className="text-gray-600 mb-4">Healthcare payment solution with insurance verification and patient billing.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">HIPAA compliant</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Insurance eligibility verification</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Patient payment plans</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link href="/industry-solutions" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/industry-solutions">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                See all industry solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    
      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12 text-gray-600">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">PaySurity</h3>
              <p className="mb-4 text-sm">Financial infrastructure for businesses</p>
              <p className="text-sm text-gray-500">
                Comprehensive payment solutions for businesses of all sizes. Secure, scalable, and built for growth.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/payments" className="text-gray-600 hover:text-gray-900 transition-colors">Payments</Link></li>
                <li><Link href="/pos-systems" className="text-gray-600 hover:text-gray-900 transition-colors">POS Systems</Link></li>
                <li><Link href="/digital-wallet" className="text-gray-600 hover:text-gray-900 transition-colors">Digital Wallet</Link></li>
                <li><Link href="/industry-solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Industry Solutions</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link></li>
                <li><Link href="/documentation" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link></li>
                <li><Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">Support</Link></li>
                <li><Link href="/partners" className="text-gray-600 hover:text-gray-900 transition-colors">Partners</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-gray-900 transition-colors">Careers</Link></li>
                <li><Link href="/customers" className="text-gray-600 hover:text-gray-900 transition-colors">Customers</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/compliance" className="text-gray-600 hover:text-gray-900 transition-colors">Compliance</Link></li>
                <li><Link href="/security" className="text-gray-600 hover:text-gray-900 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <select className="text-sm border border-gray-300 rounded-md py-1 px-2 bg-white">
                <option>English (US)</option>
                <option>Español</option>
                <option>Français</option>
              </select>
              <p className="text-sm text-gray-500">© 2025 PaySurity, Inc. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
