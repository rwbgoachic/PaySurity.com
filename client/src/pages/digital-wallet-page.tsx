import { useState } from "react";
import { useLocation, Link } from "wouter";
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
import { useAuth } from "@/hooks/use-auth";

export default function DigitalWalletPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Function to handle creating a web account or logging in
  const handleSignUp = () => {
    if (user) {
      navigate("/wallet");
    } else {
      navigate("/auth");
    }
  };

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
                <span className="text-sm text-gray-900 font-medium transition-colors">Digital Wallet</span>
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
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleSignUp}
                  >
                    {user ? "Access Your Wallet" : "Create Web Account"}
                  </Button>
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
                      
                      <Button className="mt-6" onClick={handleSignUp}>
                        {user ? "Access Business Wallet" : "Create Business Account"}
                      </Button>
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
                          <span>Real-time location-based spending alerts</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Merchant & category spending restrictions</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Shared family expenses management</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Educational content for financial literacy</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-lg mb-4">Family Benefits</h4>
                      <div className="space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-lg border">
                          <h5 className="font-medium mb-2">Teach Financial Responsibility</h5>
                          <p className="text-sm text-neutral-600">
                            Help children learn money management with guided, supervised spending experiences.
                          </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg border">
                          <h5 className="font-medium mb-2">Family Coordination</h5>
                          <p className="text-sm text-neutral-600">
                            Easily track and manage shared household expenses and allowances.
                          </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg border">
                          <h5 className="font-medium mb-2">Safety & Convenience</h5>
                          <p className="text-sm text-neutral-600">
                            Provide children with secure payment methods without the risks of cash or credit cards.
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        className="mt-6"
                        onClick={handleSignUp}
                      >
                        {user ? "Access Family Account" : "Create Family Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Financial Management?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of individuals and businesses who trust PaySurity's digital wallet solutions for secure, convenient, and powerful financial management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleSignUp}
              >
                {user ? "Access Your Wallet" : "Create Web Account"}  
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-6">
              *Free family plans are included with business accounts or available with qualifying transactions.
            </p>
          </div>
        </div>
      </section>
      
    </div>
  );
}