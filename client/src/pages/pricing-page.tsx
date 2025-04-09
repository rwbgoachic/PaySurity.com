import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PricingPage() {
  const [, navigate] = useLocation();

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
                <span className="text-sm text-gray-900 font-medium transition-colors">Pricing</span>
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
            <h1 className="text-4xl font-bold mb-4">Transparent, Competitive Pricing</h1>
            <p className="text-lg text-neutral-600 mb-6">
              Save 20% or more on your payment processing fees. No hidden charges, no surprises.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-2">
                <LockKeyhole className="h-4 w-4 mr-2" /> PCI Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-2">
                <ShieldCheck className="h-4 w-4 mr-2" /> Secure Transactions
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 p-2">
                <Check className="h-4 w-4 mr-2" /> No Hidden Fees
              </Badge>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Pricing Plans */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Payment Processing Plan</h2>
          
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
      
      {/* Solution Categories with Accordion */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Industry-Specific Solution Pricing</h2>
            
            <Tabs defaultValue="restaurant">
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
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">BistroBeast<sup className="text-xs">TM</sup></h3>
                          <p className="text-neutral-600">Restaurant Management Solution</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          PCI Compliant
                        </Badge>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="core-pos">
                          <AccordionTrigger className="text-left font-medium">
                            Core POS System
                            <Badge className="ml-2">Included</Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
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
                                <span className="text-sm">Tab management & splitting</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Kitchen display system integration</span>
                              </li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="employee-management">
                          <AccordionTrigger className="text-left font-medium">
                            Employee Management
                            <Badge className="ml-2">$49/mo</Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Employee scheduling</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Biometric clock-in/out</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Tip management & distribution</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Labor cost reporting</span>
                              </li>
                            </ul>
                            <Button size="sm" className="mt-4">Add to Solution</Button>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="inventory">
                          <AccordionTrigger className="text-left font-medium">
                            Inventory Management
                            <Badge className="ml-2">$39/mo</Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Ingredient-level tracking</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Recipe costing</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Automated purchase orders</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Waste tracking & reporting</span>
                              </li>
                            </ul>
                            <Button size="sm" className="mt-4">Add to Solution</Button>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="delivery">
                          <AccordionTrigger className="text-left font-medium">
                            Delivery Management
                            <Badge className="ml-2">$29/mo</Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Delivery zone management</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Driver assignment & tracking</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Third-party delivery integration</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Customer notifications</span>
                              </li>
                            </ul>
                            <Button size="sm" className="mt-4">Add to Solution</Button>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="loyalty">
                          <AccordionTrigger className="text-left font-medium">
                            Loyalty & Gift Cards
                            <Badge className="ml-2">$19/mo</Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Points-based loyalty program</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Digital & physical gift cards</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Special offers & promotions</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Customer profile management</span>
                              </li>
                            </ul>
                            <Button size="sm" className="mt-4">Add to Solution</Button>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      
                      <div className="mt-6 border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold">Additional Services</h4>
                          <Badge>Optional</Badge>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="online-ordering">
                            <AccordionTrigger className="text-left font-medium">
                              Online Ordering Website
                              <Badge className="ml-2">$69/mo</Badge>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 mt-2">
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Branded online ordering</span>
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Menu management</span>
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Order ahead functionality</span>
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Integration with POS</span>
                                </li>
                              </ul>
                              <Button size="sm" className="mt-4">Add to Solution</Button>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="advanced-analytics">
                            <AccordionTrigger className="text-left font-medium">
                              Advanced Analytics
                              <Badge className="ml-2">$59/mo</Badge>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 mt-2">
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Sales forecasting</span>
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Menu performance analysis</span>
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Customer behavior insights</span>
                                </li>
                                <li className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                  <span className="text-sm">Custom reports & dashboards</span>
                                </li>
                              </ul>
                              <Button size="sm" className="mt-4">Add to Solution</Button>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      
                      <div className="bg-neutral-50 mt-8 p-6 rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">Configure Your Solution</h4>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Best Value
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Base POS System</span>
                            <span>$99/mo</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>+ Selected Add-ons</span>
                            <span>$0/mo</span>
                          </div>
                          <div className="border-t pt-4 flex justify-between items-center font-bold">
                            <span>Estimated Total</span>
                            <span>$99/mo</span>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-4">Request Custom Quote</Button>
                        <p className="text-xs text-center text-neutral-500 mt-2">
                          + Payment processing fees based on selected plan
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="retail">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">PaySurity ECom Ready<sup className="text-xs">TM</sup></h3>
                          <p className="text-neutral-600">Complete Store Management</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          E-Commerce Ready
                        </Badge>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="core-pos">
                          <AccordionTrigger className="text-left font-medium">
                            Core POS System
                            <Badge className="ml-2">Included</Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Product catalog management</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Barcode scanning & lookup</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Multi-tender payment processing</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span className="text-sm">Returns & exchanges management</span>
                              </li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        {/* Add more accordion items for retail */}
                      </Accordion>
                      
                      <div className="bg-neutral-50 mt-8 p-6 rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">Configure Your Solution</h4>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Best Value
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Base POS System</span>
                            <span>$89/mo</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>+ Selected Add-ons</span>
                            <span>$0/mo</span>
                          </div>
                          <div className="border-t pt-4 flex justify-between items-center font-bold">
                            <span>Estimated Total</span>
                            <span>$89/mo</span>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-4">Request Custom Quote</Button>
                        <p className="text-xs text-center text-neutral-500 mt-2">
                          + Payment processing fees based on selected plan
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="legal">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">PaySurity LegalEdge<sup className="text-xs">TM</sup></h3>
                          <p className="text-neutral-600">Law Practice Management</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          ABA Compliant
                        </Badge>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        {/* Add accordion items for legal */}
                      </Accordion>
                      
                      <div className="bg-neutral-50 mt-8 p-6 rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">Configure Your Solution</h4>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Best Value
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Base Management System</span>
                            <span>$129/mo</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>+ Selected Add-ons</span>
                            <span>$0/mo</span>
                          </div>
                          <div className="border-t pt-4 flex justify-between items-center font-bold">
                            <span>Estimated Total</span>
                            <span>$129/mo</span>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-4">Request Custom Quote</Button>
                        <p className="text-xs text-center text-neutral-500 mt-2">
                          + Payment processing fees based on selected plan
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="healthcare">
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
                      
                      <Accordion type="single" collapsible className="w-full">
                        {/* Add accordion items for healthcare */}
                      </Accordion>
                      
                      <div className="bg-neutral-50 mt-8 p-6 rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">Configure Your Solution</h4>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Best Value
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Base Healthcare System</span>
                            <span>$149/mo</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>+ Selected Add-ons</span>
                            <span>$0/mo</span>
                          </div>
                          <div className="border-t pt-4 flex justify-between items-center font-bold">
                            <span>Estimated Total</span>
                            <span>$149/mo</span>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-4">Request Custom Quote</Button>
                        <p className="text-xs text-center text-neutral-500 mt-2">
                          + Payment processing fees based on selected plan
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Cross-Category Solutions */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Cross-Industry Add-On Solutions</h2>
            <p className="text-center mb-8 text-neutral-600">
              These solutions can be added to any industry-specific package
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Payroll Services</h3>
                  <Badge className="mb-4">From $49/mo</Badge>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Direct deposit payroll</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Tax filing & reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Employee self-service portal</span>
                    </li>
                  </ul>
                  <Button size="sm" className="mt-4">Add to Any Solution</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Advanced Fraud Protection</h3>
                  <Badge className="mb-4">From $39/mo</Badge>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">AI-powered fraud detection</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Real-time transaction monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Custom security rules & alerts</span>
                    </li>
                  </ul>
                  <Button size="sm" className="mt-4">Add to Any Solution</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">PaySurity WebCon<sup className="text-xs">TM</sup></h3>
                  <Badge className="mb-4">From $79/mo</Badge>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Custom website creation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Full POS integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Online payment capabilities</span>
                    </li>
                  </ul>
                  <Button size="sm" className="mt-4">Add to Any Solution</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Digital Wallet Integration</h3>
                  <Badge className="mb-4">From $29/mo</Badge>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Business expense tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Multi-user account access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Enhanced security features</span>
                    </li>
                  </ul>
                  <Button size="sm" className="mt-4">Add to Any Solution</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Custom Pricing CTA */}
      <section className="py-12 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
            <p className="text-lg mb-8">
              Our team can create a tailored payment processing and business management solution to fit your unique needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
              >
                Schedule a Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white hover:bg-white hover:text-primary"
              >
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