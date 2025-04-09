import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function PartnersPage() {
  return (
    <>
      <MetaTags
        title="Become a Partner | PaySurity"
        description="Join the PaySurity partner network and grow your business by offering comprehensive payment solutions to your clients."
        canonicalUrl="/partners"
        keywords="payment processing partners, ISO partnerships, payment processing referral program, payment solutions partner"
      />
      
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Partner With <span className="text-blue-600">PaySurity</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Grow your business by offering comprehensive payment solutions to your clients.
            Join our partner network and earn competitive commissions.
          </p>
          <div className="mt-12">
            <Button size="lg" className="px-8 h-12 mr-4 bg-blue-600 hover:bg-blue-700">
              Apply Now
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Partner Types */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Programs</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">Referral Partners</CardTitle>
                <CardDescription>Perfect for businesses with clients who need payment solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Simple referral process with minimal involvement</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>One-time and recurring commission options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>No sales or technical expertise required</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Online portal to track referrals and commissions</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Become a Referral Partner
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-blue-600 shadow-md relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-bl-md">
                MOST POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">Reseller Partners</CardTitle>
                <CardDescription>For businesses that want to offer payment solutions under their brand</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>White-label solutions with your branding</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Higher commission rates and revenue share</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Sales and technical training provided</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Dedicated partner success manager</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  Become a Reseller Partner
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">ISO Partners</CardTitle>
                <CardDescription>For Independent Sales Organizations in the payment industry</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Premium revenue sharing structure</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Full access to our product suite</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Joint marketing and promotional activities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Dedicated account management team</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Become an ISO Partner
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Why Partner With PaySurity?</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Our partners enjoy exceptional benefits and support to grow their businesses.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Competitive Commissions</h3>
              <p className="text-gray-600">
                Earn industry-leading commissions and residual income on each transaction.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Comprehensive Solutions</h3>
              <p className="text-gray-600">
                Offer your clients a full suite of payment processing and business management tools.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Marketing Support</h3>
              <p className="text-gray-600">
                Access co-branded marketing materials, campaigns, and lead generation support.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Dedicated Support</h3>
              <p className="text-gray-600">
                Get priority technical support and a dedicated partner success manager.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Partner Success Stories</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-xl">AC</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Alex Chen</h4>
                    <p className="text-sm text-gray-500">Accounting Services Firm</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Partnering with PaySurity allowed us to offer payment solutions to our accounting clients, creating a new revenue stream with minimal effort. The referral process is seamless."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-xl">SM</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Miller</h4>
                    <p className="text-sm text-gray-500">Software Development Agency</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "As a reseller partner, we've integrated PaySurity's payment solutions into our software offerings. Our clients love the seamless experience, and we've increased our revenue by 35%."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-xl">JT</span>
                  </div>
                  <div>
                    <h4 className="font-bold">James Thompson</h4>
                    <p className="text-sm text-gray-500">ISO Partner</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The partner portal provides real-time insights into our merchant portfolio. PaySurity's industry-specific solutions have helped us win clients in competitive verticals."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our partner network today and start offering comprehensive payment solutions to your clients.
          </p>
          <Button size="lg" className="px-8 h-12 bg-white text-blue-600 hover:bg-gray-100">
            Apply to Become a Partner
          </Button>
        </div>
      </section>
    </>
  );
}