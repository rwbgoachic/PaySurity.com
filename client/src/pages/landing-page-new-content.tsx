import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Check, 
  ShieldCheck, 
  LockKeyhole,
  Building2, 
  Gavel,
  Stethoscope,
  ShoppingCart, 
  CreditCard,
  BarChart3,
  Users,
  Globe,
  WalletCards,
  Store,
  ChefHat,
  Briefcase,
  Laptop,
  Heart,
  ArrowRight,
  ExternalLink,
  ChevronsRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteFooter } from "@/components/layout/site-footer";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation - Same as Pricing Page */}
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
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Secure Payment Solutions for Every Business</h1>
            <p className="text-xl text-neutral-600 mb-8">
              Streamline your payments, reduce costs, and boost your business growth with modern payment infrastructure.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-2">
                <LockKeyhole className="h-4 w-4 mr-2" /> Enterprise Security
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-2">
                <ShieldCheck className="h-4 w-4 mr-2" /> Fraud Protection
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 p-2">
                <Check className="h-4 w-4 mr-2" /> 24/7 Support
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="px-8">
                Start Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
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
            <h2 className="text-3xl font-bold mb-4">Comprehensive Payment Solutions</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              From processing credit cards to managing complex financial workflows, PaySurity offers everything you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Payment Processing</CardTitle>
                <CardDescription>Secure, reliable payment acceptance across all channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Credit & debit cards</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">ACH & bank transfers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Digital wallets</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/products">
                  <Button variant="ghost" className="text-primary p-0 h-auto">
                    Learn more <ChevronsRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>POS Systems</CardTitle>
                <CardDescription>Modern point-of-sale solutions for every industry</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Restaurant POS (BistroBeast)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Retail & e-commerce</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Mobile & contactless</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/pos-systems">
                  <Button variant="ghost" className="text-primary p-0 h-auto">
                    Learn more <ChevronsRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <WalletCards className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Digital Wallet</CardTitle>
                <CardDescription>Integrated financial management for businesses and consumers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Multi-currency support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Expense management</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Family accounts</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/digital-wallet">
                  <Button variant="ghost" className="text-primary p-0 h-auto">
                    Learn more <ChevronsRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Industry Solutions Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industry-Specific Solutions</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Tailored payment systems designed for the unique needs of your industry.
            </p>
          </div>
          
          <Tabs defaultValue="restaurant" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="restaurant">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <ChefHat className="h-12 w-12 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold">Restaurant & Hospitality</h3>
                        <p className="text-neutral-600">Complete payment & POS solutions for food service</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>BistroBeast™ POS system with table management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Tableside ordering & payment</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Tip management & distribution</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Kitchen display system integration</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Faster table turnover</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Reduced order errors</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Streamlined operations</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Enhanced customer experience</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button>Explore Restaurant Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="retail">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <ShoppingCart className="h-12 w-12 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold">Retail & E-Commerce</h3>
                        <p className="text-neutral-600">Omnichannel payment solutions for modern retail</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Integrated online & in-store payments</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Inventory management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Customer loyalty programs</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Mobile checkout options</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Unified sales channels</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Simplified reconciliation</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Enhanced customer insights</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Reduced checkout time</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button>Explore Retail Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="legal">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <Gavel className="h-12 w-12 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold">Legal Services</h3>
                        <p className="text-neutral-600">Specialized payment solutions for law firms</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>IOLTA trust accounting</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Client billing & invoicing</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Matter-based payment tracking</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Client portal for payments</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Compliant trust accounting</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Improved cash flow</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Reduced billing disputes</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Enhanced client experience</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button>Explore Legal Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="healthcare">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <Stethoscope className="h-12 w-12 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold">Healthcare</h3>
                        <p className="text-neutral-600">HIPAA-compliant payment processing</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>HIPAA-compliant processing</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Insurance eligibility verification</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Patient payment plans</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>HSA/FSA card acceptance</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Regulatory compliance</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Reduced billing costs</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Increased collections</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                            <span>Improved patient satisfaction</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button>Explore Healthcare Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Businesses Nationwide</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              See how PaySurity's payment solutions have helped businesses grow and thrive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border shadow-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <p className="italic text-neutral-600">
                    "PaySurity's restaurant POS system has completely transformed our operations. We've reduced order errors by 60% and increased table turnover significantly."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-neutral-500">Owner, Fusion Bistro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <p className="italic text-neutral-600">
                    "The IOLTA trust accounting solution is incredible. It keeps us compliant and has drastically simplified our client billing process."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Jennifer Chen, Esq.</p>
                    <p className="text-sm text-neutral-500">Partner, Chen & Associates Law Firm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <p className="italic text-neutral-600">
                    "We've seen a 25% increase in patient payments since implementing PaySurity's healthcare payment solution. The patient portal is a game-changer."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Robert Williams</p>
                    <p className="text-sm text-neutral-500">Medical Director, Wellness Medical Group</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Payment Experience?</h2>
            <p className="text-lg text-neutral-600 mb-8">
              Join thousands of businesses that trust PaySurity for their payment processing needs.
              Get started today and experience the difference.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="px-8">
                Create Account <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <SiteFooter />
    </div>
  );
}