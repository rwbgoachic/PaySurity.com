import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  Users,
  Smartphone,
  Globe,
  FileEdit,
  BarChart3,
  DollarSign,
  ArrowRight,
  ChevronDown,
  Phone,
  AppWindow,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DigitalWalletPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation header would be inserted here */}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">
                  Available on Web & Mobile App
                </Badge>
                <h1 className="text-4xl font-bold mb-4">Secure Digital Wallet Solutions for Organizational Expense Management, with Free Family Plans*</h1>
                <p className="text-lg text-neutral-600 mb-6">
                  PaySurity's digital wallet technology offers secure, convenient, and flexible payment management for both businesses and consumers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg">Download Mobile App</Button>
                  <Button variant="outline" size="lg">Create Web Account</Button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border">
                <div className="aspect-video bg-neutral-100 rounded flex items-center justify-center relative overflow-hidden">
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
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Comprehensive Wallet Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <AppWindow className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Multi-Device Access</h3>
                  <p className="text-neutral-600 mb-4">
                    Seamlessly access your wallet across all your devices with real-time synchronization.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Real-time account updates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Cross-platform compatibility</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Synchronized transactions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <LockKeyhole className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Enhanced Security</h3>
                  <p className="text-neutral-600 mb-4">
                    Advanced encryption, biometric authentication, and transaction monitoring for maximum protection.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Biometric authentication</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Two-factor authentication</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Suspicious activity alerts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Family Accounts</h3>
                  <p className="text-neutral-600 mb-4">
                    Create parent-child relationships with spending controls and expense tracking for family members.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Spending limits & controls</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Real-time transaction notifications</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Financial education resources</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <FileEdit className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Business Expense Management</h3>
                  <p className="text-neutral-600 mb-4">
                    Integrated expense tracking, receipt capture, and reporting for business purchases.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Digital receipt capture</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Expense categorization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Export to accounting software</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Business vs Personal Tabs */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Solutions for Every Need</h2>
            
            <Tabs defaultValue="business" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="business">Business Solutions</TabsTrigger>
                <TabsTrigger value="personal">Personal & Family</TabsTrigger>
              </TabsList>
              
              <TabsContent value="business" className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  <h3 className="text-xl font-bold mb-4">Organizational Expense Management</h3>
                  <p className="text-neutral-600 mb-6">
                    Transform how your organization handles expenses with our comprehensive business wallet solutions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-lg mb-4">Key Features</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Multi-user account access with permission levels</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Department and project expense tracking</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Corporate card issuance and management</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Approval workflows for expenses</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Vendor payment management</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Accounting system integration</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Custom financial reporting</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-lg mb-4">Business Benefits</h4>
                      <div className="space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-lg border">
                          <h5 className="font-medium mb-2">Eliminate Expense Reports</h5>
                          <p className="text-sm text-neutral-600">
                            Save 5+ hours per employee monthly with automated expense capture and categorization.
                          </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg border">
                          <h5 className="font-medium mb-2">Streamline Reimbursements</h5>
                          <p className="text-sm text-neutral-600">
                            Process employee reimbursements in 24 hours instead of weeks.
                          </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg border">
                          <h5 className="font-medium mb-2">Real-time Expense Visibility</h5>
                          <p className="text-sm text-neutral-600">
                            Get up-to-the-minute reporting on company spending across all departments.
                          </p>
                        </div>
                      </div>
                      
                      <Button className="mt-6">Learn More About Business Solutions</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="personal" className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  <h3 className="text-xl font-bold mb-4">Family Financial Management</h3>
                  <p className="text-neutral-600 mb-6">
                    Manage your family's finances with secure, flexible digital wallet solutions that grow with your needs.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-lg mb-4">Key Features</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Parent-child accounts with spending controls</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Customizable allowance automation</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Savings goals & financial education tools</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Purchase notifications & approvals</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Merchant category restrictions</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Family expense tracking & budgeting</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Gift giving & special occasion funds</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="bg-primary/5 p-5 rounded-lg border border-primary/20 mb-6">
                        <h5 className="font-bold text-primary mb-2">Free Family Plans*</h5>
                        <p className="text-sm text-neutral-600 mb-4">
                          Qualifying business accounts receive free family plans for up to 5 family members. Perfect for teaching kids financial responsibility while maintaining parental oversight.
                        </p>
                        <p className="text-xs text-neutral-500">
                          *Free family plans available with qualifying business accounts. Some limitations apply.
                        </p>
                      </div>
                      
                      <h4 className="font-bold text-lg mb-4">Client Testimonial</h4>
                      <div className="bg-neutral-50 p-4 rounded-lg border">
                        <p className="italic text-neutral-600 text-sm mb-2">
                          "The family accounts feature has been a game-changer for teaching my kids about money. I can easily send allowances, monitor spending, and help them save for goals."
                        </p>
                        <p className="text-sm font-medium">- Jennifer K., Business Owner & Parent</p>
                      </div>
                      
                      <Button className="mt-6">Create Family Account</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Mobile App Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl font-bold mb-4">Mobile App Features</h2>
                <p className="text-neutral-600 mb-6">
                  Access your digital wallet on the go with our feature-rich mobile application.
                </p>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">Tap-to-Pay Functionality</h4>
                      <p className="text-neutral-600 mt-1">Make contactless payments directly from your phone at compatible terminals.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">Real-Time Notifications</h4>
                      <p className="text-neutral-600 mt-1">Receive instant alerts for account activity, including purchases and deposits.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileEdit className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">Receipt Capture</h4>
                      <p className="text-neutral-600 mt-1">Snap photos of receipts to automatically organize and categorize your purchases.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button>Download iOS App</Button>
                  <Button variant="outline" className="ml-4">Download Android App</Button>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                  {/* Placeholder for mobile app screenshot */}
                  <div className="aspect-[9/16] bg-neutral-100 rounded flex items-center justify-center">
                    <p className="text-neutral-400">Mobile App Interface</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Plans & Pricing */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Wallet Plans & Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border shadow-lg relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">Personal</h3>
                    <p className="text-neutral-600 text-sm mb-4">For individual users</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold">Free</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Basic digital wallet features</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Mobile app access</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Standard security features</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Limited transaction history</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full">Sign Up Free</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-lg relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold uppercase">
                    Popular
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">Family</h3>
                    <p className="text-neutral-600 text-sm mb-4">For families and households</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold">$9.99</span>
                      <span className="text-neutral-600 text-sm"> / month</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">All Personal features</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Up to 5 connected accounts</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Parental controls & limits</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Savings goals & allowances</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Family expense tracking</span>
                      </li>
                    </ul>
                    <Button className="w-full">Start Free Trial</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-lg relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">Business</h3>
                    <p className="text-neutral-600 text-sm mb-4">For organizations of all sizes</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold">$29.99</span>
                      <span className="text-neutral-600 text-sm"> / month</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">All Family features</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Unlimited business accounts</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Employee expense management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Advanced reporting & analytics</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Accounting software integration</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Free family accounts*</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full">Contact Sales</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <p className="text-center text-neutral-500 text-sm mt-6">
              *Free family plans available with qualifying business accounts. Some limitations apply.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Financial Life?</h2>
            <p className="text-lg mb-8">
              Join thousands of users who trust PaySurity for secure, flexible digital wallet solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
              >
                Create Your Wallet <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white hover:bg-white hover:text-primary"
              >
                Learn More
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
              <p className="text-xs text-neutral-500 mb-4 md:mb-0">*Free family plans available with qualifying business accounts. Some limitations apply.</p>
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