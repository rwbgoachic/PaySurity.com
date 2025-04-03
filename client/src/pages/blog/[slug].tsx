import { useRoute, Link } from "wouter";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Tag,
  CreditCard,
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Sample blog posts data (would come from an API in a real application)
const blogPosts = [
  {
    title: "How Small Businesses Can Reduce Payment Processing Fees by 20%",
    excerpt: "Discover strategies for reducing your payment processing costs without sacrificing service quality or security.",
    date: "March 15, 2023",
    readTime: "5 min read",
    slug: "reduce-payment-processing-fees",
    category: "Payment Processing",
    tags: ["Small Business", "Cost Saving", "Credit Card Processing"],
    author: {
      name: "David Miller",
      title: "Payment Processing Specialist",
      avatar: "/assets/author-placeholder.jpg"
    },
    content: `
      <h2>The Hidden Costs of Payment Processing</h2>
      <p>Small businesses often overpay for payment processing, with fees accounting for 2-4% of total revenue. This guide breaks down the components of processing fees and offers actionable strategies to lower these costs without compromising security or customer experience.</p>
      
      <h3>Understanding Your Processing Statement</h3>
      <p>Before you can reduce fees, you need to understand exactly what you're paying for. Most processing statements include:</p>
      <ul>
        <li><strong>Interchange Fees:</strong> Non-negotiable fees set by card networks (Visa, Mastercard, etc.)</li>
        <li><strong>Assessment Fees:</strong> Additional fees charged by card networks</li>
        <li><strong>Processor Markup:</strong> The fees added by your payment processor (the most negotiable part)</li>
      </ul>
      
      <p>Request a detailed breakdown of your processing statement if you don't already have one. Many processors intentionally make statements confusing to hide their markup.</p>
      
      <h3>Strategy 1: Negotiate a Better Pricing Model</h3>
      <p>The pricing model you're on significantly impacts your overall costs. The three main models are:</p>
      <ul>
        <li><strong>Flat-Rate:</strong> Simplest but often most expensive for established businesses</li>
        <li><strong>Tiered Pricing:</strong> Appears simple but often hides higher costs</li>
        <li><strong>Interchange-Plus:</strong> Most transparent and typically lowest cost overall</li>
      </ul>
      
      <p>For most small businesses processing over $10,000 monthly, switching to interchange-plus pricing can immediately save 20-30% on processing fees.</p>
      
      <h3>Strategy 2: Minimize Card-Not-Present Transactions</h3>
      <p>Card-present transactions (where the physical card is used) have lower interchange rates than online or keyed-in transactions. When possible:</p>
      <ul>
        <li>Encourage customers to pay in person</li>
        <li>Use a card-present terminal for phone orders if the customer is physically present</li>
        <li>Implement proper Address Verification Service (AVS) for all card-not-present transactions</li>
      </ul>
      
      <h3>Strategy 3: Optimize Your Transaction Process</h3>
      <p>Small adjustments to how you process payments can lead to significant savings:</p>
      <ul>
        <li>Batch process transactions daily (not weekly)</li>
        <li>Set minimum purchase amounts for credit card transactions</li>
        <li>Use Address Verification and require CVV codes to qualify for better rates</li>
        <li>Process refunds as true returns, not as new transactions</li>
      </ul>
      
      <h3>Strategy 4: Leverage Technology</h3>
      <p>Modern payment technology can help reduce costs through:</p>
      <ul>
        <li>Implementing EMV chip readers to reduce fraud liability and potentially lower fees</li>
        <li>Using payment gateways with automatic card updater features to reduce declined transactions</li>
        <li>Integrating your payment system with accounting software to reduce manual errors</li>
      </ul>
      
      <h3>Strategy 5: Regularly Shop Around</h3>
      <p>Payment processing is a competitive industry. Every 12-18 months:</p>
      <ul>
        <li>Request quotes from 3-4 different processors</li>
        <li>Ask your current processor to match competitive offers</li>
        <li>Evaluate the total cost, not just the advertised rates</li>
      </ul>
      
      <h2>Case Study: Thompson Retail</h2>
      <p>A small retail chain implemented these strategies and reduced their payment processing costs from 3.2% to 2.5% of revenue—a 22% reduction that added $14,000 annually to their bottom line without requiring any additional sales.</p>
      
      <h2>Next Steps</h2>
      <p>Start by requesting a detailed breakdown of your current processing statement. Once you understand your current costs, prioritize the strategies that will have the biggest impact for your specific business model.</p>
      
      <p>Remember that the best payment processor isn't necessarily the cheapest—reliability, customer service, and security are equally important considerations for your business.</p>
    `
  },
  {
    title: "Digital Wallets: The Future of Expense Tracking for Business",
    excerpt: "Digital wallets are revolutionizing how businesses manage expenses and provide real-time insights.",
    date: "April 28, 2023",
    readTime: "6 min read",
    slug: "digital-wallets-expense-tracking",
    category: "Digital Wallets",
    tags: ["Expense Management", "Mobile Payments", "Business Operations"],
    author: {
      name: "Sarah Johnson",
      title: "Digital Payments Analyst",
      avatar: "/assets/author-placeholder.jpg"
    },
    content: `
      <h2>Beyond Consumer Convenience: Digital Wallets for Business</h2>
      <p>While most people think of digital wallets as consumer tools for contactless payments, they're rapidly evolving into sophisticated expense management systems for businesses of all sizes. This article explores how digital wallet technology is transforming business expense tracking and financial operations.</p>
      
      <h3>The Evolution of Business Digital Wallets</h3>
      <p>Business digital wallets have evolved from simple payment mechanisms to comprehensive financial management tools that integrate with accounting systems, provide real-time spending insights, and help enforce expense policies automatically.</p>
      
      <p>Modern business wallet platforms now include:</p>
      <ul>
        <li>Multi-user access with role-based permissions</li>
        <li>Automated expense categorization using AI</li>
        <li>Digital receipt capture and storage</li>
        <li>Real-time spending notifications and controls</li>
        <li>Integration with accounting and ERP systems</li>
      </ul>
      
      <h3>Key Benefits for Business Operations</h3>
      
      <h4>1. Enhanced Visibility and Control</h4>
      <p>Traditional corporate card programs often provide delayed visibility into employee spending. Business digital wallets deliver real-time notifications whenever a transaction occurs, allowing managers to monitor expenses as they happen rather than reviewing them weeks later.</p>
      
      <h4>2. Simplified Expense Management</h4>
      <p>Digital wallets can automatically categorize expenses, capture and store receipts, and even match transactions to specific projects or clients. This automation reduces the administrative burden on employees and finance teams while improving accuracy.</p>
      
      <h4>3. Customizable Spending Controls</h4>
      <p>Advanced business wallet solutions allow companies to set precise spending parameters:</p>
      <ul>
        <li>Transaction amount limits</li>
        <li>Merchant category restrictions</li>
        <li>Time-based controls (e.g., only active during business hours)</li>
        <li>Geographic spending limitations</li>
      </ul>
      <p>These controls help prevent policy violations before they occur, rather than addressing them after the fact.</p>
      
      <h4>4. Improved Cash Flow Management</h4>
      <p>With real-time expense tracking, finance teams gain better visibility into cash flow. This visibility enables more accurate forecasting and helps businesses optimize their working capital.</p>
      
      <h3>Implementation Considerations</h3>
      
      <h4>Integration Requirements</h4>
      <p>For maximum benefit, business digital wallets should integrate with:</p>
      <ul>
        <li>Accounting software (QuickBooks, Xero, etc.)</li>
        <li>ERP systems</li>
        <li>HR platforms (for employee onboarding/offboarding)</li>
        <li>Travel booking systems</li>
      </ul>
      
      <h4>Security Features</h4>
      <p>When evaluating business wallet solutions, prioritize those with:</p>
      <ul>
        <li>Multi-factor authentication</li>
        <li>End-to-end encryption</li>
        <li>Tokenization for transaction security</li>
        <li>Role-based access controls</li>
        <li>Remote wipe capabilities for lost devices</li>
      </ul>
      
      <h3>Case Study: Fieldwork Construction</h3>
      <p>Fieldwork Construction, a mid-sized construction company, implemented a business digital wallet solution for their project managers and site supervisors. The results after six months included:</p>
      <ul>
        <li>75% reduction in time spent processing expense reports</li>
        <li>22% decrease in unapproved or out-of-policy spending</li>
        <li>15-day improvement in monthly financial close process</li>
        <li>Better allocation of expenses to specific projects, improving job costing accuracy</li>
      </ul>
      
      <h3>The Future of Business Digital Wallets</h3>
      <p>Looking ahead, business digital wallets are poised to incorporate more advanced features:</p>
      <ul>
        <li>AI-powered spending recommendations to optimize costs</li>
        <li>Automated vendor payment optimization (selecting the most advantageous payment method)</li>
        <li>Predictive analytics for cash flow forecasting</li>
        <li>Carbon footprint tracking for sustainability reporting</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>For businesses considering the implementation of digital wallet expense tracking:</p>
      <ol>
        <li>Audit your current expense management processes to identify pain points</li>
        <li>Define your key requirements (integrations, controls, reporting needs)</li>
        <li>Start with a pilot program in one department before company-wide deployment</li>
        <li>Develop clear policies for digital wallet usage before implementation</li>
        <li>Provide adequate training to ensure employee adoption</li>
      </ol>
      
      <p>Digital wallet expense tracking represents a significant advancement over traditional expense management approaches, offering real-time visibility, enhanced control, and substantial time savings for businesses ready to embrace the technology.</p>
    `
  }
];

export default function BlogPostPage() {
  // Match the current route to get the slug parameter
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug;

  // Find the blog post with the matching slug
  const post = blogPosts.find(post => post.slug === slug);

  // If post not found, show a not found message
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-lg p-8">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-neutral-600 mb-6">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // List of related articles (in a real application, these would be algorithmically determined)
  const relatedPosts = blogPosts
    .filter(p => p.slug !== post.slug)
    .filter(p => p.category === post.category || p.tags?.some(tag => post.tags?.includes(tag)))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">Paysurity</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#solutions" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
              Solutions
            </Link>
            <Link href="/#industries" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
              Industries
            </Link>
            <Link href="/#pos" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
              POS Systems
            </Link>
            <Link href="/#pricing" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm font-medium text-primary transition-colors">
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Article header */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/blog" className="text-primary flex items-center hover:underline mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Articles
              </Link>
              
              <Badge variant="outline" className="text-primary border-primary mb-4">
                {post.category}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-neutral-600 mb-6">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden">
                  {/* Author avatar would go here */}
                </div>
                <div>
                  <div className="font-medium">{post.author.name}</div>
                  <div className="text-sm text-neutral-600">{post.author.title}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article content */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="max-w-3xl">
                {/* Article content */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                {/* Tags */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Share */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">Share this article</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-12" />
                
                {/* Author bio */}
                <div className="bg-neutral-50 p-6 rounded-lg border">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                      {/* Author avatar would go here */}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{post.author.name}</h3>
                      <p className="text-neutral-600 text-sm mb-2">{post.author.title}</p>
                      <p className="text-neutral-700">
                        Experienced payment industry expert with over 10 years helping businesses optimize their
                        payment operations, reduce costs, and implement innovative financial technologies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Related articles */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                        <Link href={`/blog/${related.slug}`}>
                          <div className="p-4">
                            <Badge variant="outline" className="text-xs mb-2">{related.category}</Badge>
                            <h4 className="font-medium text-base mb-1 line-clamp-2">{related.title}</h4>
                            <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{related.excerpt}</p>
                            <div className="text-xs text-neutral-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{related.readTime}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    <Link href="/blog?category=Payment%20Processing">
                      <div className="flex items-center justify-between py-2 px-3 hover:bg-neutral-50 rounded">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-2" />
                          <span>Payment Processing</span>
                        </div>
                      </div>
                    </Link>
                    <Link href="/blog?category=Digital%20Wallets">
                      <div className="flex items-center justify-between py-2 px-3 hover:bg-neutral-50 rounded">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-primary mr-2" />
                          <span>Digital Wallets</span>
                        </div>
                      </div>
                    </Link>
                    <Link href="/blog?category=Security">
                      <div className="flex items-center justify-between py-2 px-3 hover:bg-neutral-50 rounded">
                        <div className="flex items-center">
                          <ShieldCheck className="h-4 w-4 text-primary mr-2" />
                          <span>Security</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* CTA */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">Ready to optimize your payments?</h3>
                    <p className="text-neutral-600 text-sm mb-4">
                      Discover how Paysurity can help your business save on processing fees and streamline operations.
                    </p>
                    <Link href="/auth">
                      <Button className="w-full">Schedule a Demo</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-neutral-600 mb-8">
              Subscribe to our newsletter to receive the latest insights on payment processing technologies and industry trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow py-2 px-4 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-neutral-500 mt-4">
              By subscribing, you agree to receive marketing communications from Paysurity. 
              You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Paysurity</h3>
              <p className="text-sm mb-4">
                Comprehensive payment processing and business management solutions for businesses of all sizes.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#" className="hover:text-white transition-colors">Payment Processing</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">Merchant Services</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">POS Systems</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">Business Management</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Industries</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#" className="hover:text-white transition-colors">Restaurants</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">Retail</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">Legal</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">Healthcare</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2023 Paysurity. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}