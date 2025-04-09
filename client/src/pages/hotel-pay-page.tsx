import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HotelPayPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation header would be inserted here */}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">HotelPay</h1>
            <p className="text-lg text-neutral-600 mb-6">
              Complete hospitality management solution with specialized PMS integration, room charge posting, and enhanced guest experience features.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 p-2">
                PCI Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-2">
                Hospitality Solution
              </Badge>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
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
                    "HotelPay has streamlined our guest payment processes and improved our staff efficiency by 30%. The PMS integration is seamless and the mobile features have received positive feedback from our guests."
                  </p>
                  <p className="text-sm font-medium">- Robert Chen, Lakeside Resort & Spa</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 bg-neutral-50 p-6 rounded-lg border max-w-5xl mx-auto">
            <h4 className="text-xl font-bold mb-4">Key Benefits for Hotels</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border">
                <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h5 className="font-bold mb-2">Enhanced Guest Experience</h5>
                <p className="text-sm text-neutral-600">
                  Streamline check-in/out, enable mobile room keys, and provide personalized service.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h5 className="font-bold mb-2">Centralized Payment Management</h5>
                <p className="text-sm text-neutral-600">
                  Consolidate charges from all hotel services into a single guest folio.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h5 className="font-bold mb-2">Multi-Property Support</h5>
                <p className="text-sm text-neutral-600">
                  Manage multiple locations with centralized reporting and guest profiles.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 max-w-5xl mx-auto">
            <h4 className="text-xl font-bold mb-4">Technical Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <h5 className="font-bold mb-4">Integrations</h5>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Opera PMS</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Oracle Hospitality</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Mews Systems</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Clock PMS</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Cloudbeds</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Customizable API connections</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h5 className="font-bold mb-4">Security & Compliance</h5>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>PCI DSS Level 1 compliance</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Tokenization for recurring charges</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Guest data protection</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Role-based access controls</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Audit trails & logging</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}