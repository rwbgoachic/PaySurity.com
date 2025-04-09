import { MetaTags } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <>
      <MetaTags
        title="About PaySurity | Modern Payment Solutions"
        description="Learn about PaySurity, our mission to transform payment processing, and how we help businesses grow with innovative payment solutions."
        canonicalUrl="/about"
      />
      
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About PaySurity
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transforming the way businesses accept and manage payments.
            </p>
            
            <div className="prose prose-lg max-w-none mb-16">
              <h2>Our Mission</h2>
              <p>
                At PaySurity, our mission is to empower businesses of all sizes with payment solutions that are secure, 
                efficient, and easy to use. We believe that payment processing should be a seamless experience for both 
                businesses and their customers, not a technological hurdle or financial burden.
              </p>
              
              <h2>Our Story</h2>
              <p>
                Founded in 2021, PaySurity emerged from a recognition that traditional payment processors weren't 
                keeping pace with the evolving needs of modern businesses. Our founders, who had extensive experience 
                in fintech and merchant services, saw an opportunity to create a more integrated, flexible payment platform 
                that could adapt to businesses as they grow and change.
              </p>
              <p>
                What started as a small team with a big vision has grown into a company serving thousands of merchants 
                across multiple industries. While we've expanded our product offerings and team size, our commitment to 
                providing innovative payment solutions with exceptional support remains unchanged.
              </p>
              
              <h2>Our Values</h2>
              <ul>
                <li><strong>Security First:</strong> We prioritize the security of payment data above all else, implementing the most advanced security measures to protect both businesses and their customers.</li>
                <li><strong>Innovation:</strong> We continuously evolve our technology to stay ahead of market trends and provide cutting-edge payment solutions.</li>
                <li><strong>Customer Focus:</strong> We believe in building lasting relationships with our merchants by providing exceptional service and support.</li>
                <li><strong>Transparency:</strong> We maintain clear, upfront pricing and honest communication with all stakeholders.</li>
                <li><strong>Inclusion:</strong> We design our products to be accessible to businesses of all sizes and industries, ensuring that advanced payment technology is available to everyone.</li>
              </ul>
              
              <h2>Our Approach</h2>
              <p>
                PaySurity takes a holistic approach to payment processing. We don't just provide the technical infrastructure 
                to process transactions—we offer a comprehensive suite of tools that help businesses optimize their entire 
                payment ecosystem, from checkout experience to financial reporting.
              </p>
              <p>
                We understand that every business has unique needs, which is why we've designed our platform to be 
                highly customizable. Whether you're a small retail shop, a growing e-commerce business, or a large 
                enterprise with complex requirements, our solutions can be tailored to fit your specific situation.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg mb-16">
              <h2 className="text-2xl font-bold mb-4">Leadership Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
                  <h3 className="font-bold text-lg">Sarah Johnson</h3>
                  <p className="text-blue-600">CEO & Co-Founder</p>
                  <p className="text-gray-600 mt-2">
                    Former Head of Product at a leading fintech company, Sarah brings over 15 years of experience in payment technology.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
                  <h3 className="font-bold text-lg">Michael Chen</h3>
                  <p className="text-blue-600">CTO & Co-Founder</p>
                  <p className="text-gray-600 mt-2">
                    With a background in cybersecurity and payment systems, Michael leads our technology and security initiatives.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Join Us on Our Mission</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                We're always looking for talented individuals who share our passion for transforming payment processing. Explore our open positions and become part of our team.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/careers">
                  <Button size="lg">View Careers</Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">Contact Us</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}