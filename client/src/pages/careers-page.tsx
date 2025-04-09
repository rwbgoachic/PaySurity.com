import { MetaTags } from "@/components/seo";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheck, Building2, Clock, MapPin, Users } from "lucide-react";

export default function CareersPage() {
  return (
    <>
      <MetaTags
        title="Careers at PaySurity | Join Our Team"
        description="Explore career opportunities at PaySurity. Join our team of innovators transforming the payment processing industry with cutting-edge solutions."
        canonicalUrl="/careers"
      />
      
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Mission to Transform Payments
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're building the future of payment technology, and we need talented people like you.
            </p>
            <Link to="#openings">
              <Button size="lg">View Open Positions</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg border shadow-sm">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BadgeCheck className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Meaningful Work</h3>
              <p className="text-gray-600">
                At PaySurity, your work directly impacts thousands of businesses, helping them grow and succeed.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border shadow-sm">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Collaborative Culture</h3>
              <p className="text-gray-600">
                Work with a diverse team of experts who value collaboration, innovation, and continuous learning.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border shadow-sm">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Growth Opportunities</h3>
              <p className="text-gray-600">
                Build your career at a fast-growing company with plenty of room for advancement and development.
              </p>
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Life at PaySurity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-video bg-gray-200 rounded-lg"></div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">A Culture of Innovation</h3>
                <p className="text-gray-600 mb-6">
                  We're a team of problem-solvers passionate about creating solutions that help businesses thrive in the digital economy. Our culture emphasizes collaboration, creativity, and constant improvement.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="text-blue-600 mr-3 mt-1">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <span className="text-gray-600">Flexible work arrangements for work-life balance</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-blue-600 mr-3 mt-1">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <span className="text-gray-600">Continuous learning and professional development</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-blue-600 mr-3 mt-1">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <span className="text-gray-600">Inclusive environment where diverse perspectives are valued</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div id="openings" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
            
            <Tabs defaultValue="all" className="max-w-3xl mx-auto">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="all">All Departments</TabsTrigger>
                <TabsTrigger value="engineering">Engineering</TabsTrigger>
                <TabsTrigger value="sales">Sales & Marketing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Senior Software Engineer</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Engineering</span>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            Remote
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Full-time
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We're looking for a Senior Software Engineer to help build our next-generation payment processing platform and developer tools.
                      </p>
                      <Button variant="outline">View Job Description</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Sales Development Representative</h3>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Sales</span>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            Chicago, IL
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Full-time
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Join our sales team to help merchants discover PaySurity's payment solutions and drive business growth.
                      </p>
                      <Button variant="outline">View Job Description</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Product Manager</h3>
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Product</span>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            Austin, TX
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Full-time
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We're seeking a Product Manager to lead our digital wallet and merchant solutions product development.
                      </p>
                      <Button variant="outline">View Job Description</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="engineering">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Senior Software Engineer</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Engineering</span>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            Remote
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Full-time
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We're looking for a Senior Software Engineer to help build our next-generation payment processing platform and developer tools.
                      </p>
                      <Button variant="outline">View Job Description</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">DevOps Engineer</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Engineering</span>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            Remote
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Full-time
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Join our infrastructure team to build and maintain secure, scalable systems that process billions in payment volume.
                      </p>
                      <Button variant="outline">View Job Description</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="sales">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Sales Development Representative</h3>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Sales</span>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            Chicago, IL
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Full-time
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Join our sales team to help merchants discover PaySurity's payment solutions and drive business growth.
                      </p>
                      <Button variant="outline">View Job Description</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">Marketing Specialist</h3>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Marketing</span>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            Remote
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Full-time
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We're looking for a creative marketing specialist to develop campaigns that highlight our innovative payment solutions.
                      </p>
                      <Button variant="outline">View Job Description</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Don't see the right position? We're always looking for talented individuals.</p>
              <Button variant="outline">Submit General Application</Button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-8 rounded-lg">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Benefits & Perks</h2>
              <p className="text-gray-600 mb-8">
                We believe in taking care of our team so they can focus on building amazing products for our customers.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold mb-3">Health & Wellness</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Comprehensive health insurance</li>
                    <li>Dental and vision coverage</li>
                    <li>Mental health benefits</li>
                    <li>Wellness program</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold mb-3">Work-Life Balance</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Flexible working hours</li>
                    <li>Remote work options</li>
                    <li>Generous PTO policy</li>
                    <li>Paid parental leave</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold mb-3">Growth & Development</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Learning stipend</li>
                    <li>Conference budget</li>
                    <li>Career advancement</li>
                    <li>Mentorship program</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}