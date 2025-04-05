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
  HeartHandshake 
} from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress, SiDiscover, SiStripe, SiPaypal } from "react-icons/si";
import { useState } from "react";

export default function LandingPage() {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Choose PaySurity's Solutions to boost Shareholder Confidence
              </h1>
              <p className="text-xl mb-8 text-slate-300">
                PaySurity's end to end solutions approach enables Businesses to save an average of over 20%, just on Processing Fees
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="font-medium">Schedule a Demo</Button>
                  </DialogTrigger>
                  <ScheduleDemoForm onSuccess={() => setIsScheduleModalOpen(false)} />
                </Dialog>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-slate-900">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
              {/* Happy CFO Video Placeholder */}
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-6 overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                  <div className="bg-black/30 p-8 rounded-full mb-4 cursor-pointer hover:bg-black/40 transition-colors">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Happy CFO</h3>
                  <p className="text-white">See how businesses reduce costs and increase revenue</p>
                </div>
              </div>
              
              {/* Payment Logos Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center">
                  <SiVisa className="h-12 w-12 text-blue-500" />
                </div>
                <div className="flex items-center justify-center">
                  <SiMastercard className="h-12 w-12 text-orange-500" />
                </div>
                <div className="flex items-center justify-center">
                  <SiAmericanexpress className="h-12 w-12 text-blue-400" />
                </div>
                <div className="flex items-center justify-center">
                  <SiDiscover className="h-12 w-12 text-orange-600" />
                </div>
                <div className="flex items-center justify-center">
                  <SiStripe className="h-12 w-12 text-purple-500" />
                </div>
                <div className="flex items-center justify-center">
                  <SiPaypal className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <div className="text-center mt-6">
                <p className="text-slate-400 text-sm">
                  Trusted by merchants worldwide with 99.99% uptime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Trusted by Business Leaders</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              PaySurity delivers enterprise-grade security and compliance for businesses of all sizes
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-bold mb-2">PCI Compliant</h3>
              <p className="text-sm text-slate-600">BistroBeast™</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold mb-2">E-Commerce Ready</h3>
              <p className="text-sm text-slate-600">PaySurity ECom Ready™</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-700" />
              <h3 className="font-bold mb-2">ABA Compliant</h3>
              <p className="text-sm text-slate-600">PaySurity LegalEdge™</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <HeartHandshake className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h3 className="font-bold mb-2">HIPAA Compliant</h3>
              <p className="text-sm text-slate-600">PaySurityMedPay™</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-bold mb-2">Enterprise Grade</h3>
              <p className="text-sm text-slate-600">PaySurity POS Hardware™</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Payment, PayRoll, Expense Management and Digital Payment Solutions for Merchants</h2>
            <p className="text-slate-600">
              Discover our complete suite of payment solutions designed to boost your business efficiency
            </p>
          </div>

          <TrackedAccordion type="single" collapsible className="w-full max-w-4xl mx-auto">
            <AccordionItem value="item-1">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="bistrobeast">
                <h3 className="text-xl font-semibold mr-auto">BistroBeast™</h3>
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
                        <Link href="/pos-systems-page">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="ecom-ready">
                <h3 className="text-xl font-semibold mr-auto">PaySurity ECom Ready™</h3>
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
                        <Link href="/industry-solutions-page">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="legaledge">
                <h3 className="text-xl font-semibold mr-auto">PaySurity LegalEdge™</h3>
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
                        <Link href="/industry-solutions-page">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="medpay">
                <h3 className="text-xl font-semibold mr-auto">PaySurityMedPay™</h3>
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
                        <Link href="/industry-solutions-page">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="pos-hardware">
                <h3 className="text-xl font-semibold mr-auto">PaySurity POS Hardware™</h3>
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
                        <Link href="/pos-systems-page">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="webcon">
                <h3 className="text-xl font-semibold mr-auto">PaySurity WebCon™</h3>
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
                        <Link href="/industry-solutions-page">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <TrackedAccordionTrigger className="flex items-center" eventCategory="product" eventName="merchant-services">
                <h3 className="text-xl font-semibold mr-auto">PaySurity Merchant Services™</h3>
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
                <h3 className="text-xl font-semibold mr-auto">PaySurity Appointment Scheduler™</h3>
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
                        <Link href="/industry-solutions-page">Learn More</Link>
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
                  <Link href="/industry-solutions-page">Learn More</Link>
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
                  <Link href="/industry-solutions-page">Learn More</Link>
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
                  <Link href="/industry-solutions-page">Learn More</Link>
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
                  <Link href="/industry-solutions-page">Learn More</Link>
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
              <Button>
                <Link href="/digital-wallet-page">Explore Digital Wallet</Link>
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
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-slate-600">
              Trusted by businesses across industries to power their payment solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-700 font-bold text-xl">SM</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sean Murphy</h4>
                    <p className="text-sm text-slate-500">Restaurant Owner</p>
                  </div>
                </div>
                <p className="text-slate-600 mb-4">
                  "BistroBeast™ completely transformed our operations. The integrated payment solution and inventory management saved us countless hours and improved our bottom line."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <span className="text-purple-700 font-bold text-xl">EO</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Erin O'Connor</h4>
                    <p className="text-sm text-slate-500">Healthcare Administrator</p>
                  </div>
                </div>
                <p className="text-slate-600 mb-4">
                  "PaySurityMedPay™ has streamlined our patient billing process while ensuring HIPAA compliance. The payment plans feature has significantly improved our collection rates."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <span className="text-green-700 font-bold text-xl">DR</span>
                  </div>
                  <div>
                    <h4 className="font-bold">David Rosenberg</h4>
                    <p className="text-sm text-slate-500">Attorney</p>
                  </div>
                </div>
                <p className="text-slate-600 mb-4">
                  "PaySurity LegalEdge™ has been a game-changer for our firm. The trust accounting features ensure compliance, and the client payment portal has improved cash flow tremendously."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Payment Experience?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using PaySurity to streamline payments and boost their bottom line.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="default" className="bg-white text-blue-700 hover:bg-blue-50">Schedule a Demo</Button>
              </DialogTrigger>
              <ScheduleDemoForm onSuccess={() => setIsScheduleModalOpen(false)} />
            </Dialog>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white text-lg mb-4">PaySurity</h3>
              <p className="mb-4">Payments & Beyond</p>
              <p className="text-sm">
                Comprehensive payment solutions for businesses of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Products</h4>
              <ul className="space-y-2">
                <li><Link href="/pos-systems-page" className="hover:text-white transition-colors">POS Systems</Link></li>
                <li><Link href="/digital-wallet-page" className="hover:text-white transition-colors">Digital Wallet</Link></li>
                <li><Link href="/industry-solutions-page" className="hover:text-white transition-colors">Industry Solutions</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2025 PaySurity, Inc. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}