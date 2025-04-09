import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ShieldCheck, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function IndustrySolutionsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation header would be inserted here */}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Industry-Specific Solutions</h1>
            <p className="text-lg text-neutral-600 mb-6">
              Tailored payment processing and business management tools designed for your industry's unique needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-2">
                <LockKeyhole className="h-4 w-4 mr-2" /> PCI Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-2">
                <ShieldCheck className="h-4 w-4 mr-2" /> Secure Transactions
              </Badge>
            </div>
          </div>
        </div>
      </section>
      
      {/* Industry Solutions Tabs */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="hospitality" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-9 overflow-x-auto">
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
              <TabsTrigger value="hospitality">Hospitality</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="nonprofit">Nonprofit</TabsTrigger>
              <TabsTrigger value="realestate">Real Estate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="restaurant" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">BistroBeast Restaurant Management System <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">PCI Compliant</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Restaurant Management System</h4>
                  <p className="text-neutral-600 mb-4">
                    Complete restaurant management solution with specialized POS, staff scheduling, inventory, and customer loyalty features.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Table management & reservations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Menu customization & modifiers</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Kitchen display system integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Inventory management with recipe costing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Staff scheduling & tip management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Customer loyalty & gift card programs</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Delivery & online ordering integration</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for restaurant POS image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">BistroBeast Restaurant Management System Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our restaurant clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "BistroBeast Restaurant Management System has transformed our operations. We've reduced wait times by 15% and increased table turnover while providing better service to our guests."
                      </p>
                      <p className="text-sm font-medium">- Jennifer Malone, FreshChoice Restaurants</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 bg-neutral-50 p-6 rounded-lg border">
                <h4 className="text-xl font-bold mb-4">Key Benefits for Restaurants</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <h5 className="font-bold mb-2">Streamlined Operations</h5>
                    <p className="text-sm text-neutral-600">
                      Reduce wait times, improve kitchen efficiency, and optimize table management.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <h5 className="font-bold mb-2">Labor Cost Control</h5>
                    <p className="text-sm text-neutral-600">
                      Optimize staff scheduling, track labor costs, and manage tips efficiently.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <h5 className="font-bold mb-2">Inventory Management</h5>
                    <p className="text-sm text-neutral-600">
                      Reduce waste, track ingredient costs, and optimize your menu profitability.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="retail" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">PaySurity ECom Ready <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">E-Commerce Ready</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Complete Store Management</h4>
                  <p className="text-neutral-600 mb-4">
                    Unified retail management solution that bridges in-store and online sales channels with integrated inventory and customer data.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Unified inventory across channels</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Omnichannel customer profiles</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Advanced product catalog management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Barcode scanning & label printing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Purchase order management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Customer loyalty & gift card systems</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>E-commerce website integration</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for retail POS image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">PaySurity ECom Ready Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our retail clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "PaySurity has allowed us to unify our in-store and online sales channels, giving our customers a seamless shopping experience while making inventory management so much easier."
                      </p>
                      <p className="text-sm font-medium">- Michael Barnes, Urban Trend Retailers</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="legal" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">PaySurity LegalEdge <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">ABA Compliant</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Law Practice Management</h4>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive practice management solution built for legal professionals with secure payment processing and case management.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Client trust account management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>IOLTA compliance features</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Time tracking & billing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Document management & e-signatures</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Calendar & case management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Conflict checks & client intake</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Client portal for secure communications</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for legal practice management image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">PaySurity LegalEdge Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our legal clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "PaySurity LegalEdge has made PaySurity a perfect solution to our seamless business flow. Highly recommended!"
                      </p>
                      <p className="text-sm font-medium">- Sarah Johnson, Meridian Law Partners</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="realestate" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">PropertyPay <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">Property Management</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Rent Collection & Management</h4>
                  <p className="text-neutral-600 mb-4">
                    Complete rent collection and property management payment solution for landlords and property managers.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Automated rent collection</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Tenant portal & communications</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Maintenance request payments</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Security deposit management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Late fee automation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Owner distribution & reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Lease renewals & digital signatures</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for property management image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">PropertyPay Dashboard Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our property management clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "PropertyPay eliminated our rent collection headaches. On-time payments increased by 32%, and our staff spends 75% less time on payment processing."
                      </p>
                      <p className="text-sm font-medium">- David Harrison, Pinnacle Property Management</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">AgentCommission <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">Agent Focused</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Commission Tracking & Distribution</h4>
                    <p className="text-neutral-600 mb-4">
                      Specialized commission management system for real estate brokerages and agent teams.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Commission plan management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Split tracking & calculations</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Referral fee management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Transaction management integration</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Agent portal & reporting</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Team hierarchy & performance metrics</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for commission management image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">AgentCommission Interface</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">EscrowManager <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">Transaction Secure</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Secure Payment Handling</h4>
                    <p className="text-neutral-600 mb-4">
                      Comprehensive escrow management system for secure payment handling in real estate transactions.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Secure escrow payment processing</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Compliance & audit trails</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Closing cost calculator</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Multi-party payment authorizations</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Transaction milestone tracking</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Document sharing & e-signatures</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for escrow management image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">EscrowManager Interface</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="nonprofit" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">DonorConnect <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">501(c)(3) Ready</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Donation Processing System</h4>
                  <p className="text-neutral-600 mb-4">
                    Complete donation management platform with recurring giving options and donor relationship management.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>One-time & recurring donations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Donor management database</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Automated tax receipts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Campaign & fund tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Donor portal access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Pledge management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Matching gift processing</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for nonprofit donation image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">DonorConnect Dashboard Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our nonprofit clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "DonorConnect has transformed our fundraising capabilities. Our recurring donation rate increased by 45%, and donor engagement has never been higher."
                      </p>
                      <p className="text-sm font-medium">- Angela Rivera, Global Hope Foundation</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">EventFunding <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">Event Focused</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Ticketing & Fundraising Management</h4>
                    <p className="text-neutral-600 mb-4">
                      Complete event management solution with integrated ticketing and fundraising capabilities for nonprofits.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Event ticketing & registration</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Live & silent auction tools</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Mobile bidding capabilities</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Text-to-give functionality</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Event sponsorship management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Attendee check-in & management</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for event fundraising image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">EventFunding Interface</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">MembershipEase <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">Association Ready</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Association Dues & Membership Management</h4>
                    <p className="text-neutral-600 mb-4">
                      Comprehensive membership management system for associations with dues collection and member services.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Membership dues collection</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Tiered membership management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Automatic renewal processing</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Member portal & directory</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Certification & continuing education</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Committee & chapter management</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for membership management image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">MembershipEase Interface</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="professional" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">ConsultPay <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">Consulting Focus</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Hourly Billing System</h4>
                  <p className="text-neutral-600 mb-4">
                    Complete payment solution with hourly billing and retainer management for consultants and professional service providers.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Time tracking & hourly billing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Retainer management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Automated invoice generation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Expense tracking & reimbursement</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Client portal for payments</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Multi-rate billing structures</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Project milestone billing</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for consulting payment image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">ConsultPay Dashboard Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our consulting clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "ConsultPay has transformed how we handle client billing. Our invoicing is automated, retainers are properly managed, and our cash flow has improved significantly."
                      </p>
                      <p className="text-sm font-medium">- Martin Reeves, Strategic Solutions Group</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">AccountingPro <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">Finance Focused</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Client Payment Portal</h4>
                    <p className="text-neutral-600 mb-4">
                      Integrated payment portal for accounting services with deep connections to popular accounting software.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Client payment portal</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>QuickBooks & Xero integration</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Automated reconciliation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Client document sharing</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Recurring payment scheduling</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Multi-entity billing support</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for accounting payment image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">AccountingPro Interface</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">CreativeCollect <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">Design Focused</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Project-Based Billing</h4>
                    <p className="text-neutral-600 mb-4">
                      Specialized payment solution for design and creative agencies with project-based billing capabilities.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Project milestone billing</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Digital asset delivery integration</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Client approval workflows</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Integrated time tracking</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Deposit & final payment handling</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Freelancer/contractor payments</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for creative agency payment image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">CreativeCollect Interface</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="education" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">CampusPay <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">Higher Education</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Student Payment Portal</h4>
                  <p className="text-neutral-600 mb-4">
                    Comprehensive student payment portal with tuition, fees, and campus card management for colleges and universities.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Tuition payment processing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Financial aid disbursement</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Campus card management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Flexible payment plans</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Parent/guardian access controls</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Integration with SIS systems</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Digital receipts & tax documents</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for campus payment image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">CampusPay Portal Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our education clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "CampusPay simplified our entire payment process. Students and parents love the ease of use, and our staff appreciates the reduced administrative burden."
                      </p>
                      <p className="text-sm font-medium">- Dr. Lisa Washington, Westlake University</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">SchoolEase <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">K-12 Solution</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">K-12 Payment System</h4>
                    <p className="text-neutral-600 mb-4">
                      Streamlined payment solution for K-12 schools handling lunches, activities, fees and school supplies.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Lunch account management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Activity & field trip payments</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>School store & supply payments</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Fundraising campaign tools</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Parent portal with spending controls</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>District-wide payment management</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for K-12 payment image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">SchoolEase Dashboard Interface</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">EdTech Integration <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">Online Learning</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Learning Platform Payment Processing</h4>
                    <p className="text-neutral-600 mb-4">
                      Specialized payment solutions for online learning platforms with subscription and course management.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Subscription management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Course & content purchases</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>LMS integration capabilities</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Affiliate payout management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>International payment support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Revenue sharing & instructor payments</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for edtech payment image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">EdTech Integration Interface</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hospitality" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">HotelPay <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">PCI Compliant</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Property Management Integration</h4>
                  <p className="text-neutral-600 mb-4">
                    Complete property management solution with room charges, amenity billing, and enhanced guest experience features.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Seamless PMS integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Room charge posting & folio management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Amenity & ancillary service billing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Guest experience enhancements</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Mobile check-in & digital key integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Comprehensive reporting & analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Multi-property management capabilities</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for hotel management image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">HotelPay Management System Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our hospitality clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "HotelPay has transformed our guest payment experience. Check-in is faster, billing disputes are down 80%, and our staff can focus on delivering exceptional service instead of managing payment issues."
                      </p>
                      <p className="text-sm font-medium">- Robert Chen, Horizon Hotels & Resorts</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">Resort Management <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">All-Inclusive Ready</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Integrated Wristband/Keycard System</h4>
                    <p className="text-neutral-600 mb-4">
                      Comprehensive resort management solution with integrated wristband/keycard payment system and proper access control.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>RFID wristband/keycard integration</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Tiered access control management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Cashless payments throughout property</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Real-time spend tracking & controls</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Seamless POS integration</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Family account linking & controls</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for resort management image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">Resort Management System Interface</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-1">Tour & Activity Booking <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">Commission Optimized</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                  <div>
                    <h4 className="text-lg text-neutral-700 mb-3">Commission-Based Payment Processing</h4>
                    <p className="text-neutral-600 mb-4">
                      Specialized payment solution for tour operators and activity providers with optimized commission management.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Multi-tier commission management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Activity scheduling & capacity management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Vendor payment distribution</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Dynamic pricing & availability</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Mobile-friendly booking engine</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Automated commission calculations</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button>View Pricing</Button>
                      <Button variant="outline">Schedule Demo</Button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* Placeholder for tour booking image */}
                    <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                      <p className="text-neutral-400">Tour & Activity Booking Interface</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="healthcare" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">PaySurity MedPay <Badge variant="outline" className="ml-2 bg-teal-50 text-teal-700 border-teal-200">HIPAA Compliant</Badge></h3>
                  <h4 className="text-lg text-neutral-700 mb-3">Healthcare Payment Solutions</h4>
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
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Patient portal & communication tools</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Compliance reporting & audit trails</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button>View Pricing</Button>
                    <Button variant="outline">Schedule Demo</Button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for healthcare management image */}
                  <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">PaySurity MedPay Interface</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">What our healthcare clients say:</h4>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <p className="italic text-neutral-600 text-sm mb-2">
                        "The HIPAA compliance features of PaySurity MedPay give us peace of mind, while the integrated payment system has improved our collection rates and patient satisfaction."
                      </p>
                      <p className="text-sm font-medium">- Dr. Thomas Rivera, Bluewater Medical Group</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Additional Features */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Additional Features Across All Industry Solutions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <LockKeyhole className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Advanced Security</h3>
                <p className="text-neutral-600 mb-4">
                  Enterprise-grade security and fraud protection for your business and customers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">End-to-end encryption</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Fraud detection algorithms</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Tokenization for stored payments</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Business Analytics</h3>
                <p className="text-neutral-600 mb-4">
                  Data-driven insights to optimize your operations and increase revenue.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Custom reporting dashboards</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Sales trend analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Performance benchmarking</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Integration Capabilities</h3>
                <p className="text-neutral-600 mb-4">
                  Seamlessly connect with your existing business systems and tools.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">Accounting software integration</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">CRM & marketing tools</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">API access for custom solutions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Industry Solution?</h2>
            <p className="text-lg mb-8">
              Contact our team to discuss your specific needs and discover how PaySurity can help your business thrive.
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
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity Merchant Services</a></li>
                <li><a href="/pos-systems" className="hover:text-white transition-colors">BistroBeast Restaurant Management System</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity ECom Ready</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity LegalEdge</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity MedPay</a></li>
                <li><a href="/pos-systems" className="hover:text-white transition-colors">PaySurity POS Hardware</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity WebCon</a></li>
                <li><a href="/digital-wallet" className="hover:text-white transition-colors">PaySurity Wallet</a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity Affiliates</a></li>
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