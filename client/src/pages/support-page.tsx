import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MetaTags } from "@/components/seo";
import { Phone, Mail, MessageSquare, Clock, FileText, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function SupportPage() {
  return (
    <>
      <MetaTags
        title="Customer Support | PaySurity"
        description="Get help with your PaySurity account, payment processing, or technical issues. Our support team is available 24/7 to assist you."
        canonicalUrl="/support"
      />
      
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              We're Here to Help
            </h1>
            <p className="text-xl text-gray-600">
              Get the support you need from our team of payment experts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-blue-100">
              <CardHeader className="flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Call Us</CardTitle>
                <CardDescription>Available 24/7</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a 
                  href="tel:+18005551234" 
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  1-800-555-1234
                </a>
                <p className="text-sm text-gray-500 mt-2">For fastest response on urgent issues</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100">
              <CardHeader className="flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Email Us</CardTitle>
                <CardDescription>24-hour response time</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a 
                  href="mailto:support@paysurity.com" 
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  support@paysurity.com
                </a>
                <p className="text-sm text-gray-500 mt-2">For detailed technical questions</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100">
              <CardHeader className="flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Available Mon-Fri, 9am-8pm ET</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start Chat
                </Button>
                <p className="text-sm text-gray-500 mt-2">For quick questions and account help</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input id="name" placeholder="John Smith" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input id="subject" placeholder="What is your question about?" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea id="message" placeholder="Please describe your issue in detail" rows={5} />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6">Support Hours</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold">Phone & Live Chat Support</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 8:00 PM ET</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 6:00 PM ET</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                    <p className="text-gray-600 mt-2">Emergency support available 24/7</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold">Email Response Time</h3>
                    <p className="text-gray-600">We aim to respond to all emails within 24 hours during business days.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold">Self-Service Resources</h3>
                    <p className="text-gray-600 mb-2">Access these resources anytime:</p>
                    <ul className="space-y-1">
                      <li>
                        <Link to="/documentation" className="text-blue-600 hover:underline">
                          Documentation
                        </Link>
                      </li>
                      <li>
                        <Link to="/faq" className="text-blue-600 hover:underline">
                          FAQ
                        </Link>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline">
                          Video Tutorials
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Common Support Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                <Link to="/faq#account" className="text-blue-600 hover:underline">
                  Account Setup & Management
                </Link>
              </div>
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                <Link to="/faq#payments" className="text-blue-600 hover:underline">
                  Payment Processing Issues
                </Link>
              </div>
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                <Link to="/faq#integrations" className="text-blue-600 hover:underline">
                  Integration Help
                </Link>
              </div>
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                <Link to="/faq#security" className="text-blue-600 hover:underline">
                  Security & Compliance
                </Link>
              </div>
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                <Link to="/faq#billing" className="text-blue-600 hover:underline">
                  Billing & Invoicing
                </Link>
              </div>
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                <Link to="/faq#disputes" className="text-blue-600 hover:underline">
                  Disputes & Chargebacks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}