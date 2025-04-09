import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Check, CreditCard, Shield, BriefcaseBusiness, Globe, ShieldCheck, Zap } from "lucide-react";
import { MetaTags } from "@/components/seo";

export default function PaymentsPage() {
  return (
    <>
      <MetaTags
        title="Payments Solutions | PaySurity"
        description="Secure, flexible payment processing solutions for businesses of all sizes. Accept payments anywhere with PaySurity's comprehensive payment platform."
        canonicalUrl="/payments"
        keywords="payment processing, credit card processing, online payments, in-person payments, payment gateway, merchant services"
      />
      
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Modern Payment Processing <span className="text-blue-600">For Every Business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Accept payments online, in-person, or on the go with our comprehensive payment platform designed for businesses of all sizes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              <Button size="lg" variant="outline">Contact Sales</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <div className="p-3 w-12 h-12 bg-blue-100 rounded-lg text-blue-600 mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <CardTitle>Online Payments</CardTitle>
                <CardDescription>Accept payments on your website or app.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Secure checkout experience</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multiple payment methods</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Easy integration options</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <div className="p-3 w-12 h-12 bg-blue-100 rounded-lg text-blue-600 mb-4">
                  <BriefcaseBusiness className="w-6 h-6" />
                </div>
                <CardTitle>In-Person Payments</CardTitle>
                <CardDescription>Accept payments face-to-face.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Smart POS terminals</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Mobile card readers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Contactless payments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <div className="p-3 w-12 h-12 bg-blue-100 rounded-lg text-blue-600 mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <CardTitle>Global Payments</CardTitle>
                <CardDescription>Accept payments worldwide.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multi-currency support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Local payment methods</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>International compliance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Payment Solutions for Your Business</h2>
            <p className="text-gray-600">
              Choose the right solution for your business needs with transparent pricing and no hidden fees.
            </p>
          </div>
          
          <Tabs defaultValue="online" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="online">Online Payments</TabsTrigger>
              <TabsTrigger value="inperson">In-Person Payments</TabsTrigger>
              <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="online" className="p-6 border rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Payment Gateway</h3>
                  <p className="text-gray-600 mb-4">
                    Our payment gateway provides a secure way to accept payments on your website or mobile app.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>PCI-compliant security</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Customizable checkout</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Recurring billing options</span>
                    </li>
                  </ul>
                  <div className="font-bold text-lg mb-4">Starting at 2.9% + $0.30 per transaction</div>
                  <Button>Learn More</Button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">INCLUDES</div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Fraud protection</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Same-day deposits</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Dispute management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>24/7 customer support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Developer-friendly APIs</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Detailed analytics dashboard</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inperson" className="p-6 border rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">POS System</h3>
                  <p className="text-gray-600 mb-4">
                    Our point-of-sale systems make in-person payments easy and efficient for any business.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Smart terminals and card readers</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Mobile payment options</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Inventory management</span>
                    </li>
                  </ul>
                  <div className="font-bold text-lg mb-4">Starting at 2.5% + $0.10 per transaction</div>
                  <Button>Learn More</Button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">INCLUDES</div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Contactless payments</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Offline mode capability</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>End-to-end encryption</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Customer management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Reporting and analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Tip management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="invoicing" className="p-6 border rounded-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Invoicing Solutions</h3>
                  <p className="text-gray-600 mb-4">
                    Send professional invoices and get paid faster with our easy-to-use invoicing solution.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Customizable invoice templates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Automatic payment reminders</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Recurring invoices</span>
                    </li>
                  </ul>
                  <div className="font-bold text-lg mb-4">Starting at 2.7% + $0.25 per paid invoice</div>
                  <Button>Learn More</Button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">INCLUDES</div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Multiple payment options</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Invoice tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Tax calculation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Client management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Financial reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Expense tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust PaySurity for their payment processing needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">Create Account</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">Contact Sales</Button>
          </div>
        </div>
      </div>
      
      {/* Footer will be handled by the site layout */}
    </>
  );
}