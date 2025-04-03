import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Filter, 
  Search, 
  ShieldCheck, 
  Tag, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndustryBlogSection from "@/components/industry-blog-section";

// Sample data - in a real application, this would come from an API
const blogPosts = [
  {
    title: "How Small Businesses Can Reduce Payment Processing Fees by 20%",
    excerpt: "Discover strategies for reducing your payment processing costs without sacrificing service quality or security.",
    date: "March 15, 2023",
    readTime: "5 min read",
    slug: "reduce-payment-processing-fees",
    category: "Payment Processing",
    tags: ["Small Business", "Cost Saving", "Credit Card Processing"]
  },
  {
    title: "PCI-Compliant Payment Processing: A Complete Guide",
    excerpt: "Understanding PCI DSS compliance is essential for any business accepting credit card payments.",
    date: "April 2, 2023",
    readTime: "7 min read",
    slug: "pci-compliant-payment-processing",
    category: "Security",
    tags: ["PCI DSS", "Compliance", "Data Security"]
  },
  {
    title: "Digital Wallets: The Future of Expense Tracking for Business",
    excerpt: "Digital wallets are revolutionizing how businesses manage expenses and provide real-time insights.",
    date: "April 28, 2023",
    readTime: "6 min read",
    slug: "digital-wallets-expense-tracking",
    category: "Digital Wallets",
    tags: ["Expense Management", "Mobile Payments", "Business Operations"]
  },
  {
    title: "ACH vs Wire Transfers: Which is Right for Your Business?",
    excerpt: "Comparing two popular methods of electronic funds transfer to help businesses make informed decisions.",
    date: "May 12, 2023",
    readTime: "4 min read",
    slug: "ach-vs-wire-transfers",
    category: "Payment Processing",
    tags: ["ACH", "Wire Transfers", "B2B Payments"]
  },
  {
    title: "Implementing Contactless Payments in Your Restaurant",
    excerpt: "A step-by-step guide to offering contactless payment options in food service establishments.",
    date: "June 3, 2023",
    readTime: "8 min read",
    slug: "contactless-payments-restaurants",
    category: "Restaurants",
    tags: ["Contactless", "NFC", "Restaurant Technology"]
  },
  {
    title: "How Integrated POS Systems Transform Healthcare Payments",
    excerpt: "Specialized POS solutions are changing how healthcare providers handle patient payments and insurance.",
    date: "June 27, 2023",
    readTime: "6 min read",
    slug: "healthcare-pos-systems",
    category: "Healthcare",
    tags: ["Healthcare", "Patient Payments", "Insurance Processing"]
  }
];

// Restaurant-specific posts
const restaurantPosts = [
  {
    title: "Implementing Contactless Payments in Your Restaurant",
    excerpt: "A step-by-step guide to offering contactless payment options in food service establishments.",
    date: "June 3, 2023",
    readTime: "8 min read",
    slug: "contactless-payments-restaurants",
    category: "Restaurants",
    tags: ["Contactless", "NFC", "Restaurant Technology"]
  },
  {
    title: "Optimizing Table Turnover with Integrated Payment Systems",
    excerpt: "How modern payment technology can help restaurants serve more customers without sacrificing quality.",
    date: "July 14, 2023",
    readTime: "5 min read",
    slug: "optimizing-table-turnover",
    category: "Restaurants",
    tags: ["Table Management", "Efficiency", "Customer Experience"]
  },
  {
    title: "Managing Tips and Gratuities: Best Practices for Restaurants",
    excerpt: "Legal and practical considerations for handling tips in the digital payment era.",
    date: "August 8, 2023",
    readTime: "7 min read",
    slug: "tips-gratuities-restaurants",
    category: "Restaurants",
    tags: ["Tips", "Staff Management", "Compliance"]
  }
];

// Healthcare-specific posts
const healthcarePosts = [
  {
    title: "How Integrated POS Systems Transform Healthcare Payments",
    excerpt: "Specialized POS solutions are changing how healthcare providers handle patient payments and insurance.",
    date: "June 27, 2023",
    readTime: "6 min read",
    slug: "healthcare-pos-systems",
    category: "Healthcare",
    tags: ["Healthcare", "Patient Payments", "Insurance Processing"]
  },
  {
    title: "HIPAA Compliance in Healthcare Payment Processing",
    excerpt: "Ensuring your payment systems maintain patient privacy and meet regulatory requirements.",
    date: "July 19, 2023",
    readTime: "9 min read",
    slug: "hipaa-payment-compliance",
    category: "Healthcare",
    tags: ["HIPAA", "Compliance", "Patient Privacy"]
  },
  {
    title: "Streamlining Patient Billing and Payment Collections",
    excerpt: "Modern approaches to reducing administrative overhead and improving patient financial experience.",
    date: "August 22, 2023",
    readTime: "6 min read",
    slug: "streamlining-patient-billing",
    category: "Healthcare",
    tags: ["Medical Billing", "Patient Experience", "Revenue Cycle"]
  }
];

// Legal-specific posts
const legalPosts = [
  {
    title: "Trust Account Management for Law Firms",
    excerpt: "Best practices for maintaining compliant client trust accounts and handling payments properly.",
    date: "May 25, 2023",
    readTime: "7 min read",
    slug: "trust-account-management",
    category: "Legal",
    tags: ["Trust Accounts", "Compliance", "Law Firm Management"]
  },
  {
    title: "Accepting Credit Cards: Ethical Considerations for Attorneys",
    excerpt: "Navigating the ethical rules around credit card payments for legal services.",
    date: "June 19, 2023",
    readTime: "5 min read",
    slug: "credit-cards-legal-ethics",
    category: "Legal",
    tags: ["Legal Ethics", "Credit Cards", "Bar Compliance"]
  },
  {
    title: "Online Payment Portals for Legal Clients",
    excerpt: "How client payment portals can improve cash flow and client satisfaction for law practices.",
    date: "July 31, 2023",
    readTime: "6 min read",
    slug: "legal-payment-portals",
    category: "Legal",
    tags: ["Client Experience", "Online Payments", "Practice Management"]
  }
];

// Retail-specific posts
const retailPosts = [
  {
    title: "Omnichannel Payment Solutions for Modern Retail",
    excerpt: "Integrating in-store, online, and mobile payment systems for a seamless customer experience.",
    date: "May 18, 2023",
    readTime: "6 min read",
    slug: "omnichannel-retail-payments",
    category: "Retail",
    tags: ["Omnichannel", "Customer Experience", "Integration"]
  },
  {
    title: "Implementing Contactless Payments in Retail Stores",
    excerpt: "A comprehensive guide to rolling out contactless payment options in your retail business.",
    date: "June 14, 2023",
    readTime: "5 min read",
    slug: "contactless-retail-payments",
    category: "Retail",
    tags: ["Contactless", "NFC", "Customer Convenience"]
  },
  {
    title: "Retail Loyalty Programs: Integration with Payment Systems",
    excerpt: "How to leverage your payment infrastructure to drive customer retention through loyalty programs.",
    date: "July 24, 2023",
    readTime: "7 min read",
    slug: "retail-loyalty-programs",
    category: "Retail",
    tags: ["Loyalty", "Customer Retention", "Marketing"]
  }
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [visibleFilters, setVisibleFilters] = useState(false);

  const categories = ["Payment Processing", "Security", "Digital Wallets", "Restaurants", "Retail", "Legal", "Healthcare"];

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm("");
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(post.category);
    
    return matchesSearch && matchesCategory;
  });

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

      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Payment Technology Insights</h1>
            <p className="text-lg text-neutral-600 mb-8">
              Expert insights, industry trends, and practical advice for merchants and payment professionals.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Input
                type="text"
                placeholder="Search for topics, articles or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar / Filters - visible on larger screens or when toggled */}
            <div className={`lg:block ${visibleFilters ? 'block' : 'hidden'}`}>
              <div className="bg-white p-6 rounded-lg border sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Filter by Category</h3>
                  {selectedCategories.length > 0 && (
                    <button 
                      className="text-sm text-primary"
                      onClick={clearFilters}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-2"
                      />
                      <label htmlFor={category} className="text-sm">{category}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Blog content */}
            <div className="lg:col-span-3">
              {/* Mobile filter toggle */}
              <div className="lg:hidden mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setVisibleFilters(!visibleFilters)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {visibleFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>

              {/* Active filters */}
              {selectedCategories.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="outline" className="flex items-center gap-1">
                      {category}
                      <button onClick={() => handleCategoryToggle(category)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Results */}
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-neutral-600 mb-4">No posts found matching your criteria</p>
                  <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">
                      {searchTerm || selectedCategories.length > 0 
                        ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'result' : 'results'} found` 
                        : 'Latest Articles'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
                    {filteredPosts.map((post, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        <CardContent className="p-0">
                          <div className="h-3 bg-primary"></div>
                          <div className="p-6 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-primary border-primary">
                                {post.category}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                            <p className="text-neutral-600 mb-4 flex-grow">{post.excerpt}</p>
                            <div className="flex items-center text-sm text-neutral-500 mb-4">
                              <div className="flex items-center mr-4">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{post.readTime}</span>
                              </div>
                              <div>{post.date}</div>
                            </div>
                            {post.tags && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag, tagIndex) => (
                                  <div key={tagIndex} className="flex items-center text-xs text-neutral-500">
                                    <Tag className="h-3 w-3 mr-1" />
                                    <span>{tag}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <Link href={`/blog/${post.slug}`} className="text-primary font-medium flex items-center hover:underline">
                              Read article <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="all" className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Industry-Specific Resources</h2>
              <p className="text-neutral-600 max-w-3xl mx-auto">
                Specialized insights for different industries and business types.
              </p>
            </div>

            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 max-w-3xl mx-auto">
              <TabsTrigger value="all">All Industries</TabsTrigger>
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="rounded-full p-2 bg-primary/10 text-primary inline-block mb-4">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Payment Processing</h3>
                  <p className="text-neutral-600 mb-4">
                    Optimize your payment operations with insights on reducing fees, improving security, and modernizing workflows.
                  </p>
                  <Link href="/blog?category=Payment%20Processing" className="text-primary font-medium flex items-center hover:underline">
                    View resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="rounded-full p-2 bg-primary/10 text-primary inline-block mb-4">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Digital Wallets</h3>
                  <p className="text-neutral-600 mb-4">
                    Learn how digital wallet technology is transforming business payments, expense tracking, and customer experiences.
                  </p>
                  <Link href="/blog?category=Digital%20Wallets" className="text-primary font-medium flex items-center hover:underline">
                    View resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="rounded-full p-2 bg-primary/10 text-primary inline-block mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Security & Compliance</h3>
                  <p className="text-neutral-600 mb-4">
                    Stay protected with the latest information on PCI compliance, fraud prevention, and data security best practices.
                  </p>
                  <Link href="/blog?category=Security" className="text-primary font-medium flex items-center hover:underline">
                    View resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="restaurants">
              <div>
                <IndustryBlogSection 
                  industry="Restaurant"
                  description="Payment technology insights and best practices tailored for food service businesses of all sizes."
                  posts={restaurantPosts}
                />
                <div className="text-center mt-6">
                  <Link href="/blog/industry/restaurant">
                    <Button variant="outline" size="lg">
                      View All Restaurant Articles <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="healthcare">
              <div>
                <IndustryBlogSection 
                  industry="Healthcare"
                  description="Specialized payment processing solutions for medical practices, clinics, and healthcare providers."
                  posts={healthcarePosts}
                />
                <div className="text-center mt-6">
                  <Link href="/blog/industry/healthcare">
                    <Button variant="outline" size="lg">
                      View All Healthcare Articles <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="legal">
              <div>
                <IndustryBlogSection 
                  industry="Legal"
                  description="Compliant payment processing solutions designed for law firms and legal practices."
                  posts={legalPosts}
                />
                <div className="text-center mt-6">
                  <Link href="/blog/industry/legal">
                    <Button variant="outline" size="lg">
                      View All Legal Articles <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="retail">
              <div>
                <IndustryBlogSection 
                  industry="Retail"
                  description="Innovative payment processing solutions for retail businesses of all sizes."
                  posts={retailPosts}
                />
                <div className="text-center mt-6">
                  <Link href="/blog/industry/retail">
                    <Button variant="outline" size="lg">
                      View All Retail Articles <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-neutral-600 mb-8">
              Subscribe to our newsletter to receive the latest insights on payment processing technologies and industry trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow"
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
                <li><Link href="/blog/industry/restaurant" className="hover:text-white transition-colors">Restaurants</Link></li>
                <li><Link href="/blog/industry/retail" className="hover:text-white transition-colors">Retail</Link></li>
                <li><Link href="/blog/industry/legal" className="hover:text-white transition-colors">Legal</Link></li>
                <li><Link href="/blog/industry/healthcare" className="hover:text-white transition-colors">Healthcare</Link></li>
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