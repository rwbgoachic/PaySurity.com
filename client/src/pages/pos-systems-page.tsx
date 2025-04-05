import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Clock,
  Calendar,
  Receipt,
  Store,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PosSystemsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation header would be inserted here */}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Powerful POS Systems</h1>
            <p className="text-lg text-neutral-600 mb-6">
              Our industry-leading point-of-sale systems combine payment processing with comprehensive business management tools.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-2">
                <ShieldCheck className="h-4 w-4 mr-2" /> PCI Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-2">
                <CreditCard className="h-4 w-4 mr-2" /> EMV Certified
              </Badge>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Features */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-4">Advanced Business Management</h2>
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
              <Button className="mt-6">Explore POS Features</Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              {/* Placeholder for POS system image */}
              <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                <p className="text-neutral-400">POS System Interface</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Industry-Specific POS Solutions */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Industry-Specific POS Solutions</h2>
            
            <Tabs defaultValue="restaurant" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                <TabsTrigger value="retail">Retail</TabsTrigger>
                <TabsTrigger value="service">Professional Services</TabsTrigger>
                <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
              </TabsList>
              
              <TabsContent value="restaurant" className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">BistroBeast<sup className="text-xs">TM</sup></h3>
                        <p className="text-neutral-600">Restaurant Management System</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        PCI Compliant
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold mb-4">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Table management & floor planning</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Order management with modifiers</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Kitchen display system integration</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Menu & recipe management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Employee scheduling</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Tip management & distribution</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Delivery management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Loyalty programs & gift cards</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <div className="aspect-video bg-neutral-100 rounded mb-4 flex items-center justify-center">
                          <p className="text-neutral-400">BistroBeast™ Interface</p>
                        </div>
                        <p className="text-sm text-neutral-600 mb-4">
                          BistroBeast™ is our comprehensive restaurant management system designed specifically for foodservice operations of all sizes, from quick-service to fine dining.
                        </p>
                        <Button>Learn More About BistroBeast™</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="retail" className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">PaySurity ECom Ready<sup className="text-xs">TM</sup></h3>
                        <p className="text-neutral-600">Complete Store Management</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        E-Commerce Ready
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold mb-4">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Inventory management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Barcode scanning & label printing</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Customer profiles & history</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">E-commerce integration</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Purchase order management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Product variants & pricing tiers</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Returns & exchanges processing</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Gift cards & loyalty programs</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <div className="aspect-video bg-neutral-100 rounded mb-4 flex items-center justify-center">
                          <p className="text-neutral-400">PaySurity ECom Ready™ Interface</p>
                        </div>
                        <p className="text-sm text-neutral-600 mb-4">
                          PaySurity ECom Ready™ bridges the gap between in-store and online sales with a unified inventory and customer experience across all channels.
                        </p>
                        <Button>Learn More About PaySurity ECom Ready™</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="service" className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">PaySurity LegalEdge<sup className="text-xs">TM</sup></h3>
                        <p className="text-neutral-600">Law Practice Management</p>
                      </div>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        ABA Compliant
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold mb-4">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Client management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Case tracking</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Time tracking & billing</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Document management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Trust accounting</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Calendar & scheduling</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Client portal</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Conflict checking</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <div className="aspect-video bg-neutral-100 rounded mb-4 flex items-center justify-center">
                          <p className="text-neutral-400">PaySurity LegalEdge™ Interface</p>
                        </div>
                        <p className="text-sm text-neutral-600 mb-4">
                          PaySurity LegalEdge™ is designed specifically for law firms with features that help manage cases, track billable hours, and maintain client trust accounts.
                        </p>
                        <Button>Learn More About PaySurity LegalEdge™</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="healthcare" className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">PaySurityMedPay<sup className="text-xs">TM</sup></h3>
                        <p className="text-neutral-600">Healthcare Payment Solutions</p>
                      </div>
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                        HIPAA Compliant
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold mb-4">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Patient management</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Appointment scheduling</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Insurance verification</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Payment plans</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Claims processing</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Electronic health records integration</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">Patient portal</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span className="text-sm">HIPAA compliance features</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <div className="aspect-video bg-neutral-100 rounded mb-4 flex items-center justify-center">
                          <p className="text-neutral-400">PaySurityMedPay™ Interface</p>
                        </div>
                        <p className="text-sm text-neutral-600 mb-4">
                          PaySurityMedPay™ provides HIPAA-compliant payment processing and practice management tools specifically designed for healthcare providers.
                        </p>
                        <Button>Learn More About PaySurityMedPay™</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Hardware Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-neutral-50 rounded-lg p-8 border">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">PaySurity POS Hardware<sup className="text-xs">TM</sup> <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">Enterprise Grade</Badge></h3>
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
              
              <div className="mt-8 text-center">
                <Button>View Hardware Options</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Benefits of PaySurity POS Systems</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Integrated Payments</h3>
                <p className="text-neutral-600">
                  Seamlessly process all payment types with competitive rates and fast deposits directly through your POS system.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Data-Driven Insights</h3>
                <p className="text-neutral-600">
                  Powerful reporting and analytics tools to understand your business performance and make informed decisions.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Customer Retention</h3>
                <p className="text-neutral-600">
                  Build customer loyalty with built-in tools for marketing, gift cards, and personalized customer experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Client Testimonials */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">What Our Clients Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="italic text-neutral-600 mb-4">
                  "Paysurity's BistroBeast™ POS system has streamlined our operations and reduced our payment processing costs by 22%. The staff management features are outstanding."
                </p>
                <div className="flex items-center">
                  <div className="mr-4 w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                    <span className="text-lg font-bold">JM</span>
                  </div>
                  <div>
                    <p className="font-medium">Jennifer Malone</p>
                    <p className="text-sm text-neutral-500">CFO, FreshChoice Restaurants</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="italic text-neutral-600 mb-4">
                  "PaySurityLegalEdge has made PaySurity a perfect Solution to our seemless Business flow. Highly recommeded!"
                </p>
                <div className="flex items-center">
                  <div className="mr-4 w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                    <span className="text-lg font-bold">SJ</span>
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-neutral-500">Partner, Meridian Law Partners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="text-lg mb-8">
              Discover how our industry-specific POS solutions can streamline your operations and boost your bottom line.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
              >
                Schedule a Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white hover:bg-white hover:text-primary"
              >
                View Pricing
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
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity Merchant Services<sup className="text-xs">TM</sup></a></li>
                <li><a href="/pos-systems" className="hover:text-white transition-colors">BistroBeast<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity ECom Ready<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity LegalEdge<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurityMedPay<sup className="text-xs">TM</sup></a></li>
                <li><a href="/pos-systems" className="hover:text-white transition-colors">PaySurity POS Hardware<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity WebCon<sup className="text-xs">TM</sup></a></li>
                <li><a href="/digital-wallet" className="hover:text-white transition-colors">PaySurity Wallet<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity Affiliates<sup className="text-xs">TM</sup></a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Industries</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">Restaurants</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">Retail</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">Legal</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">Healthcare</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-sm mb-2 md:mb-0">© 2023 Paysurity. All rights reserved.</p>
            </div>
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