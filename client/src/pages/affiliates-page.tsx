import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/seo";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, DollarSign, LineChart, Users, Zap } from "lucide-react";

export default function Affiliates() {
  return (
    <>
      <MetaTags
        title="Affiliate Program | PaySurity"
        description="Join the PaySurity Affiliate Program and earn competitive commissions by referring merchants to our payment processing solutions."
        canonicalUrl="/affiliates"
        keywords="payment processing affiliate program, merchant services affiliate, payment affiliate marketing, recurring commissions"
      />
      
      <div className="bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 pt-20 pb-16 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
            EARN UP TO 80% COMMISSION
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our <span className="text-purple-600">Affiliate Program</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Earn generous commissions by referring merchants to PaySurity's payment processing solutions.
            Get paid for every merchant that signs up through your unique link.
          </p>
          <div className="mt-8">
            <Button size="lg" className="px-8 h-12 mr-4 bg-purple-600 hover:bg-purple-700">
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Our affiliate program is designed to be simple and rewarding.
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Complete our simple application form to join the affiliate program.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Get Your Link</h3>
              <p className="text-gray-600">
                Receive your unique referral link and promotional materials.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Promote</h3>
              <p className="text-gray-600">
                Share your link on your website, social media, or with your network.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Earn</h3>
              <p className="text-gray-600">
                Get paid commissions monthly for each qualified merchant referral.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Commission Structure */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Commission Structure</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Earn competitive commissions with our tiered reward system.
          </p>
          
          <Tabs defaultValue="standard" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="standard">Standard Program</TabsTrigger>
              <TabsTrigger value="premium">Premium Program</TabsTrigger>
            </TabsList>
            <TabsContent value="standard">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Standard Affiliate Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold flex items-center mb-4">
                        <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                        One-Time Commission
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">$150</span> for each new merchant account</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">$50</span> bonus for high-volume merchants</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>Paid within 30 days of merchant activation</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold flex items-center mb-4">
                        <LineChart className="h-5 w-5 text-blue-500 mr-2" />
                        Residual Commission
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">20%</span> of processing fees for the first year</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">10%</span> of processing fees afterward</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>Monthly payments with detailed reporting</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <Button className="px-8 h-10 bg-purple-600 hover:bg-purple-700">
                    Join Standard Program
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="premium">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Premium Affiliate Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold flex items-center mb-4">
                        <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                        One-Time Commission
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">$300</span> for each new merchant account</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">$100</span> bonus for high-volume merchants</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>Paid within 15 days of merchant activation</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold flex items-center mb-4">
                        <LineChart className="h-5 w-5 text-blue-500 mr-2" />
                        Residual Commission
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">40%</span> of processing fees for the first year</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span><span className="font-semibold">20%</span> of processing fees afterward</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>Bi-weekly payments with detailed reporting</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Premium Exclusive Benefits</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Early access to new products and features</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Co-marketing opportunities and additional promotional support</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Dedicated affiliate success manager</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <Button className="px-8 h-10 bg-purple-600 hover:bg-purple-700">
                    Apply for Premium Program
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Affiliate Benefits</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Why choose the PaySurity Affiliate Program?
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Competitive Commissions</h3>
                <p className="text-gray-600">
                  Earn some of the highest commission rates in the industry with our generous payout structure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <LineChart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Recurring Revenue</h3>
                <p className="text-gray-600">
                  Generate passive income with our residual commission structure on every transaction.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Easy Promotion</h3>
                <p className="text-gray-600">
                  Access ready-to-use marketing materials, banners, and landing pages for easier promotion.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Dedicated Support</h3>
                <p className="text-gray-600">
                  Get personalized support from our affiliate team to maximize your earnings.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Quality Products</h3>
                <p className="text-gray-600">
                  Promote industry-leading payment solutions with high conversion rates and low churn.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
                <p className="text-gray-600">
                  Monitor your referrals, conversions, and earnings in real-time through our affiliate dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Affiliates Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold text-xl">RB</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Rebecca Brown</h4>
                    <p className="text-sm text-gray-500">Financial Blogger</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I've been with PaySurity's affiliate program for over a year and the residual commissions have become a significant part of my monthly income. Their marketing materials convert extremely well!"
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold text-xl">MT</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Michael Torres</h4>
                    <p className="text-sm text-gray-500">E-commerce Consultant</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The premium affiliate program has been a game-changer for my business. The higher commission rates and dedicated support team make it easy to recommend PaySurity to my e-commerce clients."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold text-xl">KL</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Karen Lin</h4>
                    <p className="text-sm text-gray-500">Small Business Advisor</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "PaySurity's affiliate dashboard provides the most comprehensive tracking I've seen. I can see exactly which products are converting best and optimize my promotional strategy accordingly."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How do I join the affiliate program?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simply fill out our online application form. Once approved, you'll receive your unique referral link and access to our affiliate portal with marketing materials and tracking tools.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">When and how do I get paid?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Standard affiliates are paid monthly, while Premium affiliates receive bi-weekly payments. We offer payment via direct deposit, PayPal, or bank wire transfer once you reach the minimum payout threshold of $50.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What's the difference between Standard and Premium programs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The Premium program offers higher commission rates, faster payouts, and additional benefits like co-marketing opportunities and a dedicated affiliate manager. Premium status is granted based on performance and application review.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Do you provide marketing materials?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, we provide a variety of banners, email templates, landing pages, and promotional content that you can use to promote PaySurity's solutions. All materials are available in your affiliate dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our affiliate program today and turn your audience into a sustainable revenue stream.
          </p>
          <Button size="lg" className="px-8 h-12 bg-white text-purple-600 hover:bg-gray-100">
            Become an Affiliate
          </Button>
        </div>
      </section>
    </>
  );
}