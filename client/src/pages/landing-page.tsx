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
                <Link href="/pricing">Contact sales</Link>
              </Button>
            </div>
          </div>
          
          {/* Animated cards */}
          <div className="relative w-full h-80 md:h-96 overflow-hidden mb-20">
            <div className="absolute left-1/2 transform -translate-x-1/2 grid grid-cols-3 gap-6 w-[140%] opacity-90">
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
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 translate-y-4">
                <div className="rounded-full bg-orange-100 w-10 h-10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Fraud Prevention</h3>
                <p className="text-sm text-gray-600">AI-powered fraud detection that adapts to your business needs.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 translate-y-4">
                <div className="rounded-full bg-indigo-100 w-10 h-10 flex items-center justify-center mb-4">
                  <BarChart className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-sm text-gray-600">Get instant insights into your payment performance and customer behavior.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 translate-y-4">
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
                <div className="rounded-full bg-orange-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-orange-600" />
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
                <Link href="/pos-systems" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* E-commerce Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col">
              <div className="mb-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
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
                <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-indigo-600" />
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
                <div className="rounded-full bg-red-100 w-12 h-12 flex items-center justify-center mb-4">
                  <HeartHandshake className="h-6 w-6 text-red-600" />
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
    
      {/* No hidden content */}
            <AccordionItem value="item-1">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="bistrobeast">
                <h3 className="text-xl font-semibold mr-auto">BistroBeast Restaurant Management System</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">Complete restaurant management solution with POS, inventory, scheduling, and payment processing.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Integrated tip calculations</li>
                      <li>Table management</li>
                      <li>Employee scheduling</li>
                      <li>Delivery management</li>
                      <li>Customizable menus</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">$129<span className="text-sm font-normal">/month</span></p>
                      <p className="text-sm text-slate-500 mb-4">Plus transaction fees</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Add to Cart</Button>
                      <Button variant="outline">
                        <Link href="/pos-systems">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="ecom-ready">
                <h3 className="text-xl font-semibold mr-auto">PaySurity ECom Ready</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">E-commerce integration package with shopping cart plugins, payment gateways, and fraud prevention.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>One-click checkout</li>
                      <li>Multi-currency support</li>
                      <li>Inventory synchronization</li>
                      <li>Abandoned cart recovery</li>
                      <li>Subscription billing</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">$89<span className="text-sm font-normal">/month</span></p>
                      <p className="text-sm text-slate-500 mb-4">Plus transaction fees</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Add to Cart</Button>
                      <Button variant="outline">
                        <Link href="/industry-solutions">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="legaledge">
                <h3 className="text-xl font-semibold mr-auto">PaySurity LegalEdge</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">Practice management solution for law firms with trust accounting, billing, and client payment portals.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>IOLTA compliant trust accounting</li>
                      <li>Automated invoice generation</li>
                      <li>Client payment portals</li>
                      <li>Retainer management</li>
                      <li>Time tracking integration</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">$149<span className="text-sm font-normal">/month</span></p>
                      <p className="text-sm text-slate-500 mb-4">Plus transaction fees</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Add to Cart</Button>
                      <Button variant="outline">
                        <Link href="/industry-solutions">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="medpay">
                <h3 className="text-xl font-semibold mr-auto">PaySurityMedPay</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">Healthcare payment solution with insurance verification, patient billing, and payment plans.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>HIPAA compliant</li>
                      <li>Insurance eligibility verification</li>
                      <li>Patient payment plans</li>
                      <li>Automated claims processing</li>
                      <li>Patient billing portal</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">$199<span className="text-sm font-normal">/month</span></p>
                      <p className="text-sm text-slate-500 mb-4">Plus transaction fees</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Add to Cart</Button>
                      <Button variant="outline">
                        <Link href="/industry-solutions">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="pos-hardware">
                <h3 className="text-xl font-semibold mr-auto">PaySurity POS Hardware</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">Enterprise-grade POS hardware solutions with seamless software integration and support.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>NFC-enabled terminals</li>
                      <li>Mobile card readers</li>
                      <li>Receipt printers</li>
                      <li>Cash drawers</li>
                      <li>Customer displays</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">Custom Pricing</p>
                      <p className="text-sm text-slate-500 mb-4">Contact for quote</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Request Quote</Button>
                      <Button variant="outline">
                        <Link href="/pos-systems">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="webcon">
                <h3 className="text-xl font-semibold mr-auto">PaySurity WebCon</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">Website payment integration for businesses needing simple online payment solutions.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Payment buttons/links</li>
                      <li>Hosted checkout pages</li>
                      <li>Recurring billing options</li>
                      <li>Multi-currency support</li>
                      <li>Developer API access</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">$69<span className="text-sm font-normal">/month</span></p>
                      <p className="text-sm text-slate-500 mb-4">Plus transaction fees</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Add to Cart</Button>
                      <Button variant="outline">
                        <Link href="/industry-solutions">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="merchant-services">
                <h3 className="text-xl font-semibold mr-auto">PaySurity Merchant Services</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">Comprehensive merchant account services with competitive rates and premium support.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Next-day funding</li>
                      <li>Chargeback protection</li>
                      <li>Fraud monitoring</li>
                      <li>Virtual terminal</li>
                      <li>24/7 merchant support</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">2.5% + 30¢</p>
                      <p className="text-sm text-slate-500 mb-4">Per transaction</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Apply Now</Button>
                      <Button variant="outline">
                        <Link href="/pricing">View Pricing</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="appointment-scheduler">
                <h3 className="text-xl font-semibold mr-auto">PaySurity Appointment Scheduler</h3>
              </TrackedAccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="col-span-2">
                    <p className="mb-4">Complete scheduling solution with payment integration for service-based businesses.</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Online booking system</li>
                      <li>Automatic reminders</li>
                      <li>Payment collection</li>
                      <li>Staff scheduling</li>
                      <li>Calendar integrations</li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-2xl font-bold mb-2">$59<span className="text-sm font-normal">/month</span></p>
                      <p className="text-sm text-slate-500 mb-4">Plus transaction fees</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Add to Cart</Button>
                      <Button variant="outline">
                        <Link href="/industry-solutions">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </TrackedAccordion>
        </div>
      </section>

      {/* Industry solutions section */}
      <section id="industries" className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Boost ROI & Delight Shareholders</h2>
            <p className="text-slate-600">
              Tailored payment solutions for diverse industries with specific compliance needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="rounded-full bg-green-100 p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <Store className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Retail</h3>
                <p className="text-slate-600 mb-4">
                  Seamless in-store and online payment solutions with inventory management.
                </p>
                <Button variant="outline" className="w-full">
                  <Link href="/industry-solutions">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="rounded-full bg-blue-100 p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Healthcare</h3>
                <p className="text-slate-600 mb-4">
                  HIPAA-compliant payment processing with patient billing capabilities.
                </p>
                <Button variant="outline" className="w-full">
                  <Link href="/industry-solutions">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="rounded-full bg-purple-100 p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Legal</h3>
                <p className="text-slate-600 mb-4">
                  Trust account compliant payment solutions for law firms and practices.
                </p>
                <Button variant="outline" className="w-full">
                  <Link href="/industry-solutions">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="rounded-full bg-amber-100 p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Restaurants</h3>
                <p className="text-slate-600 mb-4">
                  Table service, delivery, and takeout payment solutions with tip management.
                </p>
                <Button variant="outline" className="w-full">
                  <Link href="/industry-solutions">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Digital Wallet Section */}
      <section id="digital-wallet" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Secure Digital Wallet Solutions for Organizational Expense Management, with Free Family Plans*</h2>
              <p className="text-slate-600 mb-6">
                Simplify expense tracking, manage multiple cards, and keep your finances secure with PaySurity's digital wallet technology.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Secure card tokenization technology</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Parent-child account relationships with spending controls</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Expense categorization and reporting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Contactless payment capabilities</span>
                </li>
              </ul>
              <p className="text-xs text-slate-500 mb-6">
                * Family plans are free with any business subscription. See pricing for details.
              </p>
              <Button asChild>
                <Link href="/digital-wallet">Explore Digital Wallet</Link>
              </Button>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg">
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h3 className="font-bold text-lg mb-2">Expense Management Made Simple</h3>
                <p className="text-slate-600 mb-4">
                  Track expenses, set budgets, and generate reports with our intuitive dashboard.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Corporate Plan</span>
                  <span className="text-sm font-bold">$99/mo</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2">Family Wallet (Free*)</h3>
                <p className="text-slate-600 mb-4">
                  Create sub-accounts for family members with customizable spending limits.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">With Business Subscription</span>
                  <span className="text-sm font-bold text-green-600">Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Trusted by businesses of every size</h2>
            <p className="text-lg text-gray-600 text-center">
              From startups to Fortune 500 companies, businesses trust PaySurity to power their payments infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16">
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm relative">
              <div className="absolute top-6 right-6 text-purple-600">
                <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7 0C8.7 0 6.5 1.4 5 4.2C3.6 7 2.9 10.4 3 14.5H5.2C5 10.9 5.4 8.1 6.3 6C7.3 3.9 8.8 2.9 10.7 2.9C11.5 2.9 12.1 3.2 12.7 3.7C13.2 4.3 13.5 5 13.5 5.9C13.5 6.9 13.3 7.7 12.8 8.4C12.3 9.1 11.6 9.7 10.6 10.3C9.2 11.1 8.1 12.1 7.3 13.2C6.5 14.3 6.1 15.7 6.1 17.3C6.1 18 6.2 18.6 6.3 19.1C6.4 19.6 6.6 20.1 6.9 20.5H9.6C9.2 19.8 9 18.9 9 17.9C9 16.9 9.2 16.1 9.7 15.4C10.2 14.7 10.9 14.1 11.9 13.5C13.3 12.7 14.4 11.8 15.1 10.6C15.9 9.4 16.3 8 16.3 6.3C16.3 4.4 15.7 2.9 14.4 1.7C13.1 0.6 11.7 0 11.7 0ZM25.4 0C22.4 0 20.2 1.4 18.8 4.2C17.3 7 16.6 10.4 16.7 14.5H18.9C18.7 10.9 19.1 8.1 20 6C21 3.9 22.5 2.9 24.4 2.9C25.2 2.9 25.8 3.2 26.4 3.7C26.9 4.3 27.2 5 27.2 5.9C27.2 6.9 27 7.7 26.5 8.4C26 9.1 25.3 9.7 24.3 10.3C22.9 11.1 21.8 12.1 21 13.2C20.2 14.3 19.8 15.7 19.8 17.3C19.8 18 19.9 18.6 20 19.1C20.1 19.6 20.3 20.1 20.6 20.5H23.3C22.9 19.8 22.7 18.9 22.7 17.9C22.7 16.9 22.9 16.1 23.4 15.4C23.9 14.7 24.6 14.1 25.6 13.5C27 12.7 28.1 11.8 28.8 10.6C29.6 9.4 30 8 30 6.3C30 4.4 29.4 2.9 28.1 1.7C26.8 0.6 25.4 0 25.4 0Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="mb-8">
                <p className="text-gray-700 text-lg">
                  BistroBeast Restaurant Management System completely transformed our operations. The integrated payment solution and inventory management saved us countless hours and improved our bottom line.
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 overflow-hidden">
                  <span className="text-blue-700 font-bold text-xl">SM</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sean Murphy</h4>
                  <p className="text-sm text-gray-500">CFO, Café Milano</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm relative">
              <div className="absolute top-6 right-6 text-purple-600">
                <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7 0C8.7 0 6.5 1.4 5 4.2C3.6 7 2.9 10.4 3 14.5H5.2C5 10.9 5.4 8.1 6.3 6C7.3 3.9 8.8 2.9 10.7 2.9C11.5 2.9 12.1 3.2 12.7 3.7C13.2 4.3 13.5 5 13.5 5.9C13.5 6.9 13.3 7.7 12.8 8.4C12.3 9.1 11.6 9.7 10.6 10.3C9.2 11.1 8.1 12.1 7.3 13.2C6.5 14.3 6.1 15.7 6.1 17.3C6.1 18 6.2 18.6 6.3 19.1C6.4 19.6 6.6 20.1 6.9 20.5H9.6C9.2 19.8 9 18.9 9 17.9C9 16.9 9.2 16.1 9.7 15.4C10.2 14.7 10.9 14.1 11.9 13.5C13.3 12.7 14.4 11.8 15.1 10.6C15.9 9.4 16.3 8 16.3 6.3C16.3 4.4 15.7 2.9 14.4 1.7C13.1 0.6 11.7 0 11.7 0ZM25.4 0C22.4 0 20.2 1.4 18.8 4.2C17.3 7 16.6 10.4 16.7 14.5H18.9C18.7 10.9 19.1 8.1 20 6C21 3.9 22.5 2.9 24.4 2.9C25.2 2.9 25.8 3.2 26.4 3.7C26.9 4.3 27.2 5 27.2 5.9C27.2 6.9 27 7.7 26.5 8.4C26 9.1 25.3 9.7 24.3 10.3C22.9 11.1 21.8 12.1 21 13.2C20.2 14.3 19.8 15.7 19.8 17.3C19.8 18 19.9 18.6 20 19.1C20.1 19.6 20.3 20.1 20.6 20.5H23.3C22.9 19.8 22.7 18.9 22.7 17.9C22.7 16.9 22.9 16.1 23.4 15.4C23.9 14.7 24.6 14.1 25.6 13.5C27 12.7 28.1 11.8 28.8 10.6C29.6 9.4 30 8 30 6.3C30 4.4 29.4 2.9 28.1 1.7C26.8 0.6 25.4 0 25.4 0Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="mb-8">
                <p className="text-gray-700 text-lg">
                  PaySurity's healthcare solution has streamlined our patient billing process while ensuring HIPAA compliance. The payment plans feature has significantly improved our collection rates.
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4 overflow-hidden">
                  <span className="text-purple-700 font-bold text-xl">EO</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Erin O'Connor</h4>
                  <p className="text-sm text-gray-500">Payroll Manager, Horizon Health</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm relative">
              <div className="absolute top-6 right-6 text-purple-600">
                <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7 0C8.7 0 6.5 1.4 5 4.2C3.6 7 2.9 10.4 3 14.5H5.2C5 10.9 5.4 8.1 6.3 6C7.3 3.9 8.8 2.9 10.7 2.9C11.5 2.9 12.1 3.2 12.7 3.7C13.2 4.3 13.5 5 13.5 5.9C13.5 6.9 13.3 7.7 12.8 8.4C12.3 9.1 11.6 9.7 10.6 10.3C9.2 11.1 8.1 12.1 7.3 13.2C6.5 14.3 6.1 15.7 6.1 17.3C6.1 18 6.2 18.6 6.3 19.1C6.4 19.6 6.6 20.1 6.9 20.5H9.6C9.2 19.8 9 18.9 9 17.9C9 16.9 9.2 16.1 9.7 15.4C10.2 14.7 10.9 14.1 11.9 13.5C13.3 12.7 14.4 11.8 15.1 10.6C15.9 9.4 16.3 8 16.3 6.3C16.3 4.4 15.7 2.9 14.4 1.7C13.1 0.6 11.7 0 11.7 0ZM25.4 0C22.4 0 20.2 1.4 18.8 4.2C17.3 7 16.6 10.4 16.7 14.5H18.9C18.7 10.9 19.1 8.1 20 6C21 3.9 22.5 2.9 24.4 2.9C25.2 2.9 25.8 3.2 26.4 3.7C26.9 4.3 27.2 5 27.2 5.9C27.2 6.9 27 7.7 26.5 8.4C26 9.1 25.3 9.7 24.3 10.3C22.9 11.1 21.8 12.1 21 13.2C20.2 14.3 19.8 15.7 19.8 17.3C19.8 18 19.9 18.6 20 19.1C20.1 19.6 20.3 20.1 20.6 20.5H23.3C22.9 19.8 22.7 18.9 22.7 17.9C22.7 16.9 22.9 16.1 23.4 15.4C23.9 14.7 24.6 14.1 25.6 13.5C27 12.7 28.1 11.8 28.8 10.6C29.6 9.4 30 8 30 6.3C30 4.4 29.4 2.9 28.1 1.7C26.8 0.6 25.4 0 25.4 0Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="mb-8">
                <p className="text-gray-700 text-lg">
                  PaySurity's legal practice solution has been a game-changer for our firm. The trust accounting features ensure compliance, and the client payment portal has improved cash flow tremendously.
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 overflow-hidden">
                  <span className="text-green-700 font-bold text-xl">DR</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">David Rosenberg</h4>
                  <p className="text-sm text-gray-500">Partner, Rosenberg & Associates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to modernize your payments?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses using PaySurity to process payments and drive growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="font-medium bg-purple-600 hover:bg-purple-700 px-8">Start now</Button>
                </DialogTrigger>
                <ScheduleDemoForm onSuccess={() => setIsScheduleModalOpen(false)} />
              </Dialog>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8">
                  Contact sales
                </Button>
              </Link>
            </div>
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