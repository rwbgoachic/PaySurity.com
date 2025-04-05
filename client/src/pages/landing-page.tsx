import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowRight, BarChart3, BrainCircuit, Building2, Check, Code, CreditCard, DollarSign, 
         FileSearch, GalleryVerticalEnd, Gift, Heart, LineChart, PackageCheck, Percent, 
         ReceiptText, Scale, ShieldCheck, ShoppingCart, Smartphone, Users, Users2, 
         LockKeyhole, Star, Phone, AppWindow, FileEdit, FileText, Menu } from "lucide-react";
import LandingBlogSection from "@/components/landing-blog-section";
import { Badge } from "@/components/ui/badge";
import { OrganizationSchema, WebsiteSchema } from "@/components/seo/json-ld";

// Component optimized for performance

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // SEO Optimizations - using a more performant approach
  useEffect(() => {
    document.title = "Paysurity - Secure Payment Solutions";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Optimized SEO Schema approach */}
      <OrganizationSchema />
      <WebsiteSchema
        name="Paysurity - Payment Solutions"
        url={window.location.origin}
        description="Secure payment processing with digital wallets and POS solutions"
      />
      
      {/* Navbar */}
      <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary">Paysurity</h1>
            <div className="flex items-center">
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 hidden sm:flex">
                <LockKeyhole className="h-3 w-3 mr-1" /> PCI Compliant
              </Badge>
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 hidden sm:flex">
                <ShieldCheck className="h-3 w-3 mr-1" /> SSL Secured
              </Badge>
            </div>
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#solutions" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Solutions</a>
              <a href="#industries" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Industries</a>
              <a href="#pos" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">POS Systems</a>
              <a href="#digital-wallet" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Digital Wallet</a>
              <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Pricing</a>
              <a href="/blog" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Blog</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Button variant="outline" onClick={() => navigate("/auth?tab=login")}>Login</Button>
              <Button onClick={() => navigate("/auth?tab=register")} className="ml-2">Sign Up</Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 px-4 border-t bg-white absolute w-full z-50">
            <nav className="flex flex-col space-y-4">
              <a 
                href="#solutions" 
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </a>
              <a 
                href="#industries" 
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Industries
              </a>
              <a 
                href="#pos" 
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                POS Systems
              </a>
              <a 
                href="#digital-wallet" 
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Digital Wallet
              </a>
              <a 
                href="#pricing" 
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="/blog" 
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </a>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => navigate("/auth?tab=login")} className="flex-1">Login</Button>
                <Button onClick={() => navigate("/auth?tab=register")} className="flex-1">Sign Up</Button>
              </div>
              <div className="flex items-center gap-2 justify-center pt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <LockKeyhole className="h-3 w-3 mr-1" /> PCI Compliant
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <ShieldCheck className="h-3 w-3 mr-1" /> SSL Secured
                </Badge>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
                  Choose <span className="text-primary">PaySurity's Payment Solutions</span> to make your CFO smile
                </h1>
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                  {/* CFO smiling at downward trending expense graph image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">CFO smiling at downward trending expense graph</p>
                  </div>
                </div>
                <p className="text-lg text-neutral-600 mb-8">
                  Paysurity delivers transparent pricing, industry-focussed solutions, and advanced POS systems for businesses of all sizes, that make your life easy and save you $.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => {
                      if (email) navigate("/auth?tab=register");
                    }}
                  >
                    Schedule a Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-8 flex items-center gap-4 text-sm">
                  <div className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-1" />
                    <span>Transparent Pricing</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-1" />
                    <span>No Hidden Fees</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-1" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-white p-8 shadow-xl border">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Why Merchants Choose Us</h2>
                  <p className="text-neutral-600">Businesses that use PaySurity $ave an average of over 20% on Processing Fees</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Competitive Pricing</h3>
                      <p className="text-sm text-neutral-600">Save on payment processing with our transparent pricing model</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Advanced Fraud Protection</h3>
                      <p className="text-sm text-neutral-600">AI-driven fraud detection systems</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Multiple Payment Methods</h3>
                      <p className="text-sm text-neutral-600">Credit, debit, ACH, digital wallets & more</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <LineChart className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Business Intelligence</h3>
                      <p className="text-sm text-neutral-600">Comprehensive analytics and reporting</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white py-12 border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <p className="text-neutral-600 font-medium">Trusted by businesses across the United States</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {/* Logos would be displayed here */}
            <div className="text-neutral-400 font-bold text-xl">Company A</div>
            <div className="text-neutral-400 font-bold text-xl">Company B</div>
            <div className="text-neutral-400 font-bold text-xl">Company C</div>
            <div className="text-neutral-400 font-bold text-xl">Company D</div>
            <div className="text-neutral-400 font-bold text-xl">Company E</div>
          </div>
          
          {/* Security and Compliance Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 border-t pt-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <LockKeyhole className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">SSL Encrypted</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">PCI DSS Compliant</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Check className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">NACHA Certified</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Users className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">HIPAA Compliant</p>
            </div>
          </div>
          
          {/* Client Testimonials */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-50 p-6 rounded-lg border">
              <div className="flex items-center mb-4">
                <div className="mr-4 w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                  <span className="text-lg font-bold">JD</span>
                </div>
                <div>
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-sm text-neutral-500">CFO, Restaurant Chain</p>
                </div>
              </div>
              <p className="italic text-neutral-600">"Paysurity's BistroBeast POS system has streamlined our operations and reduced our payment processing costs by 22%. The staff management features are outstanding."</p>
              <div className="mt-4 flex">
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg border">
              <div className="flex items-center mb-4">
                <div className="mr-4 w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                  <span className="text-lg font-bold">JS</span>
                </div>
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-neutral-500">Owner, Legal Practice</p>
                </div>
              </div>
              <p className="italic text-neutral-600">"The secure payment processing and HIPAA compliance features have made Paysurity the perfect solution for our healthcare billing needs. Highly recommended!"</p>
              <div className="mt-4 flex">
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg border md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="mr-4 w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                  <span className="text-lg font-bold">AR</span>
                </div>
                <div>
                  <p className="font-medium">Amanda Rodriguez</p>
                  <p className="text-sm text-neutral-500">CEO, Retail Chain</p>
                </div>
              </div>
              <p className="italic text-neutral-600">"The digital wallet features have helped us create a seamless omnichannel experience for our customers. Integration was simple and the support team is always available."</p>
              <div className="mt-4 flex">
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
                <Star className="h-4 w-4 text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions section */}
      <section id="solutions" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Payment, PayRoll, Expense Management and Digital Payment Solutions for Merchants</h2>
            <p className="text-neutral-600">
              Beyond processing payments, Paysurity offers a complete suite of tools designed to support your business growth, operational efficiency, and financial management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <CreditCard className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Payment Processing</h3>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive card-present and card-not-present transaction processing with transparent interchange-plus pricing.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Multiple payment methods support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Competitive discounted rates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Next-day funding availability</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Merchant Services</h3>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive merchant account services with quick approvals and dedicated support for high-volume businesses.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Fast merchant account approval</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Dedicated account management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Chargeback management tools</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Specialized POS Systems</h3>
                  <p className="text-neutral-600 mb-4">
                    Industry-specific point-of-sale solutions with features tailored to your business needs.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Restaurant, retail & service solutions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Inventory & employee management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Customer loyalty programs</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <ReceiptText className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PayRoll Solutions</h3>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive payroll management with automated tax calculations, direct deposits, and compliance monitoring.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Automated tax calculations & filings</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Employee self-service portal</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Time & attendance integration</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Building2 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Organizational Expense Management</h3>
                  <p className="text-neutral-600 mb-4">
                    Complete expense tracking and management through Digital Wallets for businesses of all sizes.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Expense categorization & reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Department & project allocation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Receipt capture & management</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Users2 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Family Expense Management</h3>
                  <p className="text-neutral-600 mb-4">
                    Simplified family finances with parent-child Digital Wallets for budgeting, saving, and expense tracking.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Parent-controlled child accounts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Spending limits & notifications</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Financial education tools</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <GalleryVerticalEnd className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">BistroBeast: Restaurant Management System</h3>
                  <p className="text-neutral-600 mb-4">
                    Complete restaurant management solution with POS, staff scheduling, inventory, and delivery management.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Table management & ordering system</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Staff scheduling & tip calculations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Kitchen display & delivery integration</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <ShoppingCart className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurityRetailer: Retail/Grocery</h3>
                  <p className="text-neutral-600 mb-4">
                    Specialized POS and management system for retail stores and grocery markets with inventory and customer management.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Barcode scanning & inventory control</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Multi-register & shift management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Customer loyalty & promotional tools</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Scale className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurityLegalPay</h3>
                  <p className="text-neutral-600 mb-4">
                    Secure payment processing and practice management solution designed specifically for legal professionals.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Trust account management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Client billing & installment plans</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Compliance & reporting tools</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Gift className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Gift Cards</h3>
                  <p className="text-neutral-600 mb-4">
                    Customizable gift card program that integrates with your POS system to increase sales and customer loyalty.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Digital & physical gift card options</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Multi-location balance tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Custom branding & design services</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Heart className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Loyalty Program</h3>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive customer loyalty solution with points, rewards, and engagement tools to drive repeat business.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Custom rewards & tier programs</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Mobile app & digital rewards cards</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Customer analytics & segmentation</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <PackageCheck className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Inventory Management</h3>
                  <p className="text-neutral-600 mb-4">
                    Advanced inventory control system with real-time tracking, forecasting, and automated reordering capabilities.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Real-time inventory tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Supplier management & ordering</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Sales forecasting & analytics</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Activity className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Healthcare Payment Solutions</h3>
                  <p className="text-neutral-600 mb-4">
                    HIPAA-compliant payment processing and management solutions designed specifically for healthcare providers.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">HIPAA-compliant processing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Patient payment plans</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Insurance verification tools</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <BarChart3 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Analytics Dashboard</h3>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive business intelligence and reporting tools to help you make data-driven decisions.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Real-time sales reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Customer behavior analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Custom dashboard creation</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Smartphone className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Mobile POS</h3>
                  <p className="text-neutral-600 mb-4">
                    Turn your mobile device into a powerful point-of-sale system for transactions anywhere, anytime.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">iOS and Android compatibility</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Card reader accessories</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Offline transaction mode</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <FileSearch className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity ACH Processing</h3>
                  <p className="text-neutral-600 mb-4">
                    Secure and cost-effective direct bank transfer payment solutions for recurring and one-time transactions.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Lower transaction fees</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Recurring payment scheduling</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Next-day funding available</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Percent className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Subscription Billing</h3>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive recurring payment management solution for subscription-based businesses.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Flexible billing cycles</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Automated retry logic</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Customer subscription portal</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <FileText className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Tax Management</h3>
                  <p className="text-neutral-600 mb-4">
                    Automated sales tax calculation, reporting, and filing solutions for businesses of all sizes.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Real-time tax rate calculation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Multi-jurisdiction support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Automated filing & remittance</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Fraud Prevention</h3>
                  <p className="text-neutral-600 mb-4">
                    Advanced fraud detection and prevention tools to protect your business and customers.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">AI-powered risk scoring</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Real-time transaction monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Customizable fraud rules</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity Affiliate Marketing Platform</h3>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive tools for managing and growing your affiliate marketing programs.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Affiliate recruitment & onboarding</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Commission tracking & payment</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Performance analytics</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden border">
              <CardContent className="p-0">
                <div className="h-3 bg-primary"></div>
                <div className="p-6">
                  <Code className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">PaySurity API & Developer Tools</h3>
                  <p className="text-neutral-600 mb-4">
                    Powerful integration solutions for developers to build custom payment experiences.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">RESTful API access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">SDK for major platforms</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Sandbox testing environment</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Industry solutions section */}
      <section id="industries" className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Boost ROI & Delight Shareholders</h2>
            <p className="text-neutral-600">
              PaySurity's Payment and ancillary Solutions groove to Your Business-needs with fraud shields, Payroll, Analytics & much more....... PaySurity. Built for SMB growth
            </p>
          </div>

          <Tabs defaultValue="restaurant" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurant">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">BistroBeast: Restaurant Management System</h3>
                  <p className="text-neutral-600 mb-4">
                    A comprehensive restaurant management system designed specifically for food service establishments of all sizes.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Table management & reservation systems</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Kitchen display systems & order routing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Employee scheduling & tip management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Online ordering & delivery integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Inventory tracking & menu engineering</span>
                    </li>
                  </ul>
                  <Button>Learn More</Button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for restaurant POS image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">BistroBeast Management System</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="retail">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">RetailReady: Complete Store Management</h3>
                  <p className="text-neutral-600 mb-4">
                    An all-in-one retail management solution for both brick-and-mortar and online stores.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Inventory management with real-time tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Customer profiles & purchase history</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>E-commerce integration & omnichannel sales</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Employee performance tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Gift card & loyalty program management</span>
                    </li>
                  </ul>
                  <Button>Learn More</Button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for retail POS image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">RetailReady POS Interface</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="legal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">PaySurity LegalEdge: Law Practice Management</h3>
                  <p className="text-neutral-600 mb-4">
                    A specialized payment and practice management solution for legal professionals.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>IOLTA-compliant trust accounting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Client retainer management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Secure client payment portal</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Time tracking & billing integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Compliant with ABA & state bar requirements</span>
                    </li>
                  </ul>
                  <Button>Learn More</Button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for legal practice management image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">PaySurity LegalEdge Interface</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="healthcare">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">MedPay: Healthcare Payment Solutions</h3>
                  <p className="text-neutral-600 mb-4">
                    HIPAA-compliant payment processing and practice management for healthcare providers.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>HIPAA-compliant payment collection</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Patient intake & appointment management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Insurance verification & claims processing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Patient payment plans & recurring billing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Secure electronic health records integration</span>
                    </li>
                  </ul>
                  <Button>Learn More</Button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for healthcare management image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">MedPay Interface</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* POS Systems Section */}
      <section id="pos" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful POS Systems</h2>
            <p className="text-neutral-600">
              Our industry-leading point-of-sale systems combine payment processing with comprehensive business management tools.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-4">Advanced Business Management</h3>
              <p className="text-neutral-600 mb-6">
                More than just payment processing, our POS systems are complete business management solutions with features tailored to your industry.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="rounded-full p-1 bg-green-100 text-green-600 mr-3 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Employee Management</h4>
                    <p className="text-sm text-neutral-600">Scheduling, time tracking, and performance analysis</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full p-1 bg-green-100 text-green-600 mr-3 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Inventory Control</h4>
                    <p className="text-sm text-neutral-600">Real-time tracking, automatic ordering, and vendor management</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full p-1 bg-green-100 text-green-600 mr-3 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Customer Engagement</h4>
                    <p className="text-sm text-neutral-600">Loyalty programs, gift cards, and customer profiles</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full p-1 bg-green-100 text-green-600 mr-3 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Reporting & Analytics</h4>
                    <p className="text-sm text-neutral-600">Comprehensive business insights and performance metrics</p>
                  </div>
                </li>
              </ul>
              <Button className="mt-6">
                Explore POS Features
              </Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              {/* Placeholder for POS system image */}
              <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                <p className="text-neutral-400">POS System Interface</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-lg p-8 border">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Coming Soon: Paysurity POS Hardware</h3>
              <p className="text-neutral-600">Premium Paysurity-branded hardware with seamless software integration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="aspect-square bg-neutral-100 rounded mb-4 flex items-center justify-center">
                  <p className="text-neutral-400">Terminal</p>
                </div>
                <h4 className="font-bold mb-1">All-in-One Terminals</h4>
                <p className="text-sm text-neutral-600">Touch-screen terminals with integrated payment processing</p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <div className="aspect-square bg-neutral-100 rounded mb-4 flex items-center justify-center">
                  <p className="text-neutral-400">Card Reader</p>
                </div>
                <h4 className="font-bold mb-1">Countertop & Mobile Readers</h4>
                <p className="text-sm text-neutral-600">Secure chip, tap & swipe readers for all payment types</p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <div className="aspect-square bg-neutral-100 rounded mb-4 flex items-center justify-center">
                  <p className="text-neutral-400">Accessories</p>
                </div>
                <h4 className="font-bold mb-1">Peripheral Devices</h4>
                <p className="text-sm text-neutral-600">Receipt printers, cash drawers, barcode scanners & more</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Transparent, Competitive Pricing</h2>
            <p className="text-neutral-600">
              Save 20% or more on your payment processing fees. No hidden charges, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border shadow-lg relative overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">Standard</h3>
                  <p className="text-neutral-600 text-sm mb-4">For businesses processing up to $50K monthly</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">2.9% + 30¢</span>
                    <span className="text-neutral-600 text-sm"> / transaction</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">All payment types accepted</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Next-day deposits</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Basic reporting & analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Standard support</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Get Started</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-lg relative overflow-hidden">
              <CardContent className="p-0">
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold uppercase">
                  Popular
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">High Volume</h3>
                  <p className="text-neutral-600 text-sm mb-4">For businesses processing $50K-$100K monthly</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">2.5% + 25¢</span>
                    <span className="text-neutral-600 text-sm"> / transaction</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">All Standard features</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Interchange-plus pricing available</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Advanced reporting tools</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Customizable POS options</span>
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-lg relative overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">Enterprise</h3>
                  <p className="text-neutral-600 text-sm mb-4">For businesses processing $100K+ monthly</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">Custom</span>
                    <span className="text-neutral-600 text-sm"> pricing</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">All High Volume features</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Custom rates with maximum savings</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">24/7 premium support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">API access & custom integrations</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Digital Wallet Section */}
      <section id="digital-wallet" className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">
              Available on Web & Mobile App
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Secure Digital Wallet Solutions</h2>
            <p className="text-neutral-600">
              Our digital wallet technology offers secure, convenient, and flexible payment management for both businesses and consumers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Key Features</h3>
                  
                  <div className="space-y-6">
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <AppWindow className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium">Multi-Device Access</h4>
                        <p className="text-neutral-600 mt-1">Seamlessly access your wallet across all your devices with real-time synchronization.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <LockKeyhole className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium">Enhanced Security</h4>
                        <p className="text-neutral-600 mt-1">Advanced encryption, biometric authentication, and transaction monitoring for maximum protection.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium">Family Accounts</h4>
                        <p className="text-neutral-600 mt-1">Create parent-child relationships with spending controls and expense tracking for family members.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileEdit className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium">Business Expense Management</h4>
                        <p className="text-neutral-600 mt-1">Integrated expense tracking, receipt capture, and reporting for business purchases.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Button className="mr-4">Learn More</Button>
                    <Button variant="outline">Download App</Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="bg-white p-4 rounded-lg shadow-lg border">
                <div className="aspect-[4/3] bg-neutral-100 rounded flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-neutral-400 text-center">Digital Wallet Mobile App Interface</p>
                  </div>
                  <div className="absolute top-0 right-0 bottom-0 w-[40%] bg-gradient-to-l from-white/80 to-transparent"></div>
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 w-32">
                    <div className="h-2 w-16 bg-primary rounded-full mb-2"></div>
                    <div className="h-2 w-12 bg-neutral-200 rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-neutral-200 rounded-full"></div>
                    <div className="mt-4 flex justify-between">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Mobile & Web Compatible</h4>
                    <p className="text-sm text-neutral-600">Our digital wallet is available as both a mobile app and web application for cross-platform flexibility.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <LandingBlogSection />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Payment Processing?</h2>
            <p className="text-primary-50 mb-8 text-lg">
              Join thousands of merchants who trust Paysurity for their payment processing needs and save on fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/auth?tab=register")}
              >
                Schedule a Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white hover:bg-white hover:text-primary"
                onClick={() => navigate("/auth?tab=register")}
              >
                Create an Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Paysurity</h3>
              <p className="text-sm mb-4">
                Comprehensive payment processing and business management solutions for businesses of all sizes.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Payment Processing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Merchant Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">POS Systems</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Industries</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Restaurants</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Retail</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Healthcare</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2023 Paysurity. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}