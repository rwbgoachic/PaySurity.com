import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  CreditCard, 
  BarChart3, 
  Zap,
  Workflow,
  Globe,
  Building,
  Briefcase,
  PieChart,
  Landmark,
  Coins,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header/Navigation */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 w-full">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link to="/">
              <div className="font-bold text-2xl tracking-tight">
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">PaySurity</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/products">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</span>
              </Link>
              <Link to="/solutions">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</span>
              </Link>
              <Link to="/pricing">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</span>
              </Link>
              <Link to="/about">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</span>
              </Link>
              <Link to="/contact">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                Log In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/95">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="relative container py-20 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Advanced Payment Solutions for<br />Modern Businesses
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl text-muted-foreground">
            PaySurity provides integrated payment processing, financial management, and 
            workflow optimization tools to streamline your business operations.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90" size="lg">
              Explore Solutions
            </Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
          
          {/* Floating Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <Card className="relative bg-background/95 border-muted backdrop-blur-sm h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Secure Payment Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Process payments securely with multiple gateway options, fraud protection, and PCI compliance.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500/50 to-primary/50 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <Card className="relative bg-background/95 border-muted backdrop-blur-sm h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <PieChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Financial Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive tools for handling accounting and financial reporting to keep your business on track.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <Card className="relative bg-background/95 border-muted backdrop-blur-sm h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Workflow className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Workflow Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Automate routine tasks, streamline approvals, and optimize business processes for maximum efficiency.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-background/70">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Core Features</h2>
            <p className="text-lg text-muted-foreground">
              Discover how our comprehensive platform can help you manage payments, optimize workflows, and grow your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-background/30 border-border/50 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
              <CardHeader className="pb-2">
                <div className="p-2 w-10 h-10 rounded-md bg-primary/10 mb-3">
                  <CreditCard className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Payment Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Multiple payment gateways</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Fraud detection & prevention</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>PCI DSS compliant infrastructure</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background/30 border-border/50 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
              <CardHeader className="pb-2">
                <div className="p-2 w-10 h-10 rounded-md bg-primary/10 mb-3">
                  <Landmark className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Financial Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Real-time financial reporting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Cash flow management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Automated reconciliation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background/30 border-border/50 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
              <CardHeader className="pb-2">
                <div className="p-2 w-10 h-10 rounded-md bg-primary/10 mb-3">
                  <BarChart3 className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Business Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Advanced reporting & insights</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Customer behavior analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Predictive trend analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background/30 border-border/50 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
              <CardHeader className="pb-2">
                <div className="p-2 w-10 h-10 rounded-md bg-primary/10 mb-3">
                  <Coins className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Multi-Currency Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Global payment acceptance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Automatic currency conversion</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Competitive exchange rates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background/30 border-border/50 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
              <CardHeader className="pb-2">
                <div className="p-2 w-10 h-10 rounded-md bg-primary/10 mb-3">
                  <Zap className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Automation Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Recurring billing automation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Scheduled reports & notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Workflow automation rules</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background/30 border-border/50 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
              <CardHeader className="pb-2">
                <div className="p-2 w-10 h-10 rounded-md bg-primary/10 mb-3">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Fraud monitoring & prevention</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span>Industry-standard certifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Industry Solutions Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Solutions for Every Industry</h2>
            <p className="text-lg text-muted-foreground">
              Tailored payment solutions designed to meet the unique needs of different industries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-background/80 to-background border border-border/50 hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500"></div>
              <div className="p-6 relative z-10">
                <div className="mb-4 p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Business</h3>
                <p className="text-muted-foreground mb-4">End-to-end payment solutions for businesses of all sizes.</p>
                <Link to="/solutions/business">
                  <Button variant="ghost" size="sm" className="group/btn">
                    <span>Learn more</span>
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-background/80 to-background border border-border/50 hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500"></div>
              <div className="p-6 relative z-10">
                <div className="mb-4 p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <p className="text-muted-foreground mb-4">Scalable solutions for large organizations with complex needs.</p>
                <Link to="/solutions/enterprise">
                  <Button variant="ghost" size="sm" className="group/btn">
                    <span>Learn more</span>
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-background/80 to-background border border-border/50 hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500"></div>
              <div className="p-6 relative z-10">
                <div className="mb-4 p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">E-Commerce</h3>
                <p className="text-muted-foreground mb-4">Secure online payment processing for digital businesses.</p>
                <Link to="/solutions/ecommerce">
                  <Button variant="ghost" size="sm" className="group/btn">
                    <span>Learn more</span>
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-background/80 to-background border border-border/50 hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500"></div>
              <div className="p-6 relative z-10">
                <div className="mb-4 p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Services</h3>
                <p className="text-muted-foreground mb-4">Flexible payment options for service-based businesses.</p>
                <Link to="/solutions/services">
                  <Button variant="ghost" size="sm" className="group/btn">
                    <span>Learn more</span>
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto bg-background/90 backdrop-blur-sm rounded-xl p-8 border border-border/50 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to transform your payment experience?</h2>
              <p className="text-muted-foreground">Get started with PaySurity today and experience the difference.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Create Account
              </Button>
              <Button variant="outline" size="lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-10 mt-auto">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-3">
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">PaySurity</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced payment solutions for modern businesses.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products/payment-processing" className="text-muted-foreground hover:text-foreground transition-colors">Payment Processing</Link></li>
                <li><Link to="/products/financial-management" className="text-muted-foreground hover:text-foreground transition-colors">Financial Management</Link></li>
                <li><Link to="/products/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Business Analytics</Link></li>
                <li><Link to="/products/security" className="text-muted-foreground hover:text-foreground transition-colors">Security & Compliance</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/solutions/business" className="text-muted-foreground hover:text-foreground transition-colors">For Business</Link></li>
                <li><Link to="/solutions/enterprise" className="text-muted-foreground hover:text-foreground transition-colors">For Enterprise</Link></li>
                <li><Link to="/solutions/ecommerce" className="text-muted-foreground hover:text-foreground transition-colors">For E-Commerce</Link></li>
                <li><Link to="/solutions/services" className="text-muted-foreground hover:text-foreground transition-colors">For Services</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2023 PaySurity. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}