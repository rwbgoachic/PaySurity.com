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
          <Tabs defaultValue="restaurant" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
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