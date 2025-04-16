import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, CreditCard, DollarSign, LineChart, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Test Banner - ORIGINAL APRIL 3RD VERSION */}
      <div className="bg-red-500 text-white py-4 text-center font-bold text-2xl">
        THIS IS THE ORIGINAL APRIL 3RD VERSION - FULLY RESTORED
      </div>
      {/* Navbar */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary">Paysurity</h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#solutions" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Solutions</a>
              <a href="#industries" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Industries</a>
              <a href="#pos" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">POS Systems</a>
              <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/auth")}>Login</Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
                  <span className="text-primary">Payment Processing</span> Tailored for High-Volume Merchants
                </h1>
                <p className="text-lg text-neutral-600 mb-8">
                  Paysurity delivers transparent pricing, industry-specific solutions, and advanced POS systems for businesses processing over $100K monthly.
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
                      if (email) navigate("/auth");
                    }}
                  >
                    Schedule Demo <ArrowRight className="ml-2 h-4 w-4" />
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
                  <h2 className="text-2xl font-bold">Why High-Volume Merchants Choose Us</h2>
                  <p className="text-neutral-600">Businesses processing $100K+ monthly save an average of 22% on payment fees</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Volume-Based Pricing</h3>
                      <p className="text-sm text-neutral-600">Lower rates as your transaction volume increases</p>
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
            {/* Here you would normally include actual logos - using text placeholders */}
            <div className="text-neutral-400 font-bold text-xl">Company A</div>
            <div className="text-neutral-400 font-bold text-xl">Company B</div>
            <div className="text-neutral-400 font-bold text-xl">Company C</div>
            <div className="text-neutral-400 font-bold text-xl">Company D</div>
            <div className="text-neutral-400 font-bold text-xl">Company E</div>
          </div>
        </div>
      </section>

      {/* Solutions section */}
      <section id="solutions" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Payment Solutions</h2>
            <p className="text-neutral-600">
              Beyond processing payments, Paysurity offers a suite of tools designed to support your business growth and operational efficiency.
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
                      <span className="text-sm">Volume-based discounted rates</span>
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
          </div>
        </div>
      </section>

      {/* Industry solutions section */}
      <section id="industries" className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Industry-Specific Solutions</h2>
            <p className="text-neutral-600">
              We understand that different industries have unique payment processing needs. Our specialized solutions address your specific challenges.
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
                  <h3 className="text-2xl font-bold mb-4">BistroBeast: Restaurant POS</h3>
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
                    <p className="text-neutral-400">BistroBeast POS Interface</p>
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
                  <h3 className="text-2xl font-bold mb-4">LegalEdge: Law Practice Management</h3>
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
                    <p className="text-neutral-400">LegalEdge Interface</p>
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
            <h2 className="text-3xl font-bold mb-4">Transparent, Volume-Based Pricing</h2>
            <p className="text-neutral-600">
              As your transaction volume increases, your rates decrease. No hidden fees, no surprises.
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
                      <span className="text-sm">Volume-based custom rates</span>
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

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Payment Processing?</h2>
            <p className="text-primary-50 mb-8 text-lg">
              Join thousands of high-volume merchants who trust Paysurity for their payment processing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/auth")}
              >
                Schedule a Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white hover:bg-white hover:text-primary"
                onClick={() => navigate("/auth")}
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
                Comprehensive payment processing and business management solutions for high-volume merchants.
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