import { MetaTags } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <MetaTags
        title="Contact Us | PaySurity"
        description="Get in touch with PaySurity for questions about our payment processing solutions, merchant services, or technical support."
        canonicalUrl="/contact"
      />
      
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-600">
              Our team is here to help with any questions you may have.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-blue-100">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Our sales and support teams are available Monday-Friday, 9am-5pm ET</p>
                <a href="tel:+18005551234" className="text-blue-600 font-semibold hover:underline">1-800-555-1234</a>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Email Us</h3>
                <p className="text-gray-600 mb-4">Send us an email and we'll respond within 24 hours during business days</p>
                <a href="mailto:info@paysurity.com" className="text-blue-600 font-semibold hover:underline">info@paysurity.com</a>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Visit Us</h3>
                <p className="text-gray-600 mb-4">Our headquarters is located in downtown Chicago</p>
                <address className="text-blue-600 font-semibold not-italic">
                  123 Fintech Plaza, Suite 400<br />
                  Chicago, IL 60601
                </address>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="(123) 456-7890" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Your Business Name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">What can we help you with?</Label>
                  <Select>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Inquiry</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Please provide details about your inquiry..." rows={5} />
                </div>
                
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Our Departments</h2>
              
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Sales</h3>
                    <p className="text-gray-600 mb-2">
                      For questions about our services and pricing, or to schedule a demo.
                    </p>
                    <a href="mailto:sales@paysurity.com" className="text-blue-600 font-medium hover:underline">sales@paysurity.com</a>
                    <div className="text-gray-600 mt-1">1-800-555-1235</div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Technical Support</h3>
                    <p className="text-gray-600 mb-2">
                      For assistance with your account, integration issues, or technical questions.
                    </p>
                    <a href="mailto:support@paysurity.com" className="text-blue-600 font-medium hover:underline">support@paysurity.com</a>
                    <div className="text-gray-600 mt-1">1-800-555-1236</div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Partnerships</h3>
                    <p className="text-gray-600 mb-2">
                      For ISOs, referral partners, and technology integration partners.
                    </p>
                    <a href="mailto:partners@paysurity.com" className="text-blue-600 font-medium hover:underline">partners@paysurity.com</a>
                    <div className="text-gray-600 mt-1">1-800-555-1237</div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Media Inquiries</h3>
                    <p className="text-gray-600 mb-2">
                      For press and media related inquiries.
                    </p>
                    <a href="mailto:media@paysurity.com" className="text-blue-600 font-medium hover:underline">media@paysurity.com</a>
                    <div className="text-gray-600 mt-1">1-800-555-1238</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Need Immediate Assistance?</h3>
                <p className="text-gray-600 mb-4">
                  Our support team is available 24/7 for urgent issues related to payment processing.
                </p>
                <Button>Call Support Now</Button>
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2">How quickly can I get set up with PaySurity?</h3>
                <p className="text-gray-600">
                  Most merchants can be approved and set up within 1-2 business days. For more complex businesses, it may take 3-5 business days to complete the onboarding process.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Do you offer integration support?</h3>
                <p className="text-gray-600">
                  Yes, our technical team provides integration support for all our payment solutions. We offer documentation, SDKs, and direct assistance to ensure a smooth integration process.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">How do I change my payment processing settings?</h3>
                <p className="text-gray-600">
                  You can manage most settings through your PaySurity dashboard. For specialized changes, please contact our support team for assistance.
                </p>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">Still have questions? Check our comprehensive FAQ section.</p>
                <Button variant="outline">View All FAQs</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}