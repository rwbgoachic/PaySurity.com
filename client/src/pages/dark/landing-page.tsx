import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function MainLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header - Dark Theme */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">PaySurity</span>
              </div>
            </Link>
            
            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/products">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Products</span>
              </Link>
              <Link to="/digital-wallet">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Digital Wallet</span>
              </Link>
              <Link to="/industry-solutions">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Solutions</span>
              </Link>
              <Link to="/pos-systems">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">POS Systems</span>
              </Link>
              <Link to="/pricing">
                <span className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</span>
              </Link>
            </nav>
          </div>
          
          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">Complete Payment Infrastructure for Modern Business</h1>
            <p className="text-xl text-gray-300 mb-8">
              Streamline payments, reduce costs, and boost your business growth with secure, flexible payment solutions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="px-8 bg-indigo-600 hover:bg-indigo-700">
                Start Now
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Payment Solutions for Every Need</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              From processing credit cards to managing complex financial workflows, PaySurity offers everything you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-indigo-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Payment Processing</h3>
              <p className="text-gray-300 mb-4">Secure, reliable payment acceptance across all channels</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Credit & debit cards</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">ACH & bank transfers</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Digital wallets</span>
                </li>
              </ul>
              <Link to="/products">
                <Button variant="link" className="p-0 h-auto text-indigo-400 hover:text-indigo-300">
                  Learn more →
                </Button>
              </Link>
            </div>
            
            {/* Card 2 */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-indigo-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">POS Systems</h3>
              <p className="text-gray-300 mb-4">Modern point-of-sale solutions for every industry</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Restaurant POS (BistroBeast)</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Retail & e-commerce</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Mobile & contactless</span>
                </li>
              </ul>
              <Link to="/pos-systems">
                <Button variant="link" className="p-0 h-auto text-indigo-400 hover:text-indigo-300">
                  Learn more →
                </Button>
              </Link>
            </div>
            
            {/* Card 3 */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-indigo-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Digital Wallet</h3>
              <p className="text-gray-300 mb-4">Integrated financial management for businesses and consumers</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Multi-currency support</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Expense management</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Family accounts</span>
                </li>
              </ul>
              <Link to="/digital-wallet">
                <Button variant="link" className="p-0 h-auto text-indigo-400 hover:text-indigo-300">
                  Learn more →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Industry Solutions Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industry-Specific Solutions</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Tailored payment systems designed for the unique needs of your industry.
            </p>
          </div>
          
          <Tabs defaultValue="restaurant" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-800">
              <TabsTrigger value="restaurant" className="data-[state=active]:bg-indigo-800 data-[state=active]:text-white">Restaurant</TabsTrigger>
              <TabsTrigger value="retail" className="data-[state=active]:bg-indigo-800 data-[state=active]:text-white">Retail</TabsTrigger>
              <TabsTrigger value="legal" className="data-[state=active]:bg-indigo-800 data-[state=active]:text-white">Legal</TabsTrigger>
              <TabsTrigger value="healthcare" className="data-[state=active]:bg-indigo-800 data-[state=active]:text-white">Healthcare</TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="restaurant">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <div>
                        <h3 className="text-xl font-bold">Restaurant & Hospitality</h3>
                        <p className="text-gray-300">Complete payment & POS solutions for food service</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">BistroBeast™ POS system with table management</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Tableside ordering & payment</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Tip management & distribution</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Kitchen display system integration</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Faster table turnover</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Reduced order errors</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Streamlined operations</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Enhanced customer experience</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Explore Restaurant Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="retail">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <div>
                        <h3 className="text-xl font-bold">Retail & E-Commerce</h3>
                        <p className="text-gray-300">Omnichannel payment solutions for modern retail</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Integrated online & in-store payments</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Inventory management</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Customer loyalty programs</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">E-commerce integrations</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Synchronized inventory</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Customer insights</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Unified reporting</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Seamless checkout</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Explore Retail Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="legal">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-xl font-bold">Legal Practice Management</h3>
                        <p className="text-gray-300">Specialized payment solutions for law firms</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">IOLTA trust accounting</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Secure client portal payments</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Billing and invoicing templates</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Payment plans for clients</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Regulatory compliance</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Improved cash flow</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Reduced payment delays</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Comprehensive reporting</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Explore Legal Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="healthcare">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <div>
                        <h3 className="text-xl font-bold">Healthcare Payment Solutions</h3>
                        <p className="text-gray-300">Specialized payment processing for healthcare providers</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">HIPAA-compliant payments</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Insurance eligibility verification</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Patient payment portals</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Payment plans & financing</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Reduced billing complexity</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Improved patient satisfaction</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Streamlined collections</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Regulatory compliance</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link to="/industry-solutions">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Explore Healthcare Solutions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">PaySurity</h3>
              <p className="text-gray-400 mb-4 max-w-xs">
                Comprehensive payment infrastructure for modern businesses of all sizes.
              </p>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} PaySurity. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Products</h4>
              <ul className="space-y-2">
                <li><Link to="/products"><span className="text-gray-400 hover:text-white text-sm">Overview</span></Link></li>
                <li><Link to="/digital-wallet"><span className="text-gray-400 hover:text-white text-sm">Digital Wallet</span></Link></li>
                <li><Link to="/pos-systems"><span className="text-gray-400 hover:text-white text-sm">POS Systems</span></Link></li>
                <li><Link to="/payments"><span className="text-gray-400 hover:text-white text-sm">Payment Processing</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about"><span className="text-gray-400 hover:text-white text-sm">About</span></Link></li>
                <li><Link to="/careers"><span className="text-gray-400 hover:text-white text-sm">Careers</span></Link></li>
                <li><Link to="/contact"><span className="text-gray-400 hover:text-white text-sm">Contact</span></Link></li>
                <li><Link to="/blog"><span className="text-gray-400 hover:text-white text-sm">Blog</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/documentation"><span className="text-gray-400 hover:text-white text-sm">Documentation</span></Link></li>
                <li><Link to="/faq"><span className="text-gray-400 hover:text-white text-sm">FAQ</span></Link></li>
                <li><Link to="/support"><span className="text-gray-400 hover:text-white text-sm">Support</span></Link></li>
                <li><Link to="/legal"><span className="text-gray-400 hover:text-white text-sm">Legal</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-400 text-xs">
            Generated on: {new Date().toISOString()} | Build: 2025-04-16-1
          </div>
        </div>
      </footer>
    </div>
  );
}