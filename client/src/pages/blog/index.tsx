import { lazy, Suspense, useState } from "react";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Filter, 
  Loader2,
  Newspaper,
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
import BlogPostGrid from "@/components/blog-post-grid";
import { 
  blogPosts, 
  restaurantPosts, 
  healthcarePosts, 
  legalPosts, 
  retailPosts 
} from "@/data/blog-posts";

// Lazy load the IndustryBlogSection component
const IndustryBlogSection = lazy(() => import("@/components/industry-blog-section"));

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

  const renderPostCard = (post: typeof blogPosts[0], index: number) => (
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
  );

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

                  <div className="mb-12">
                    <BlogPostGrid posts={filteredPosts} columns={2} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
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
                
                <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute right-0 top-0 bg-primary/20 text-white text-xs px-2 py-1">New</div>
                  <div className="rounded-full p-2 bg-primary/10 text-primary inline-block mb-4">
                    <Newspaper className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Industry News</h3>
                  <p className="text-neutral-600 mb-4">
                    Stay updated with the latest payment industry news, trends, and regulatory changes from trusted sources.
                  </p>
                  <Link href="/blog/payment-industry-news" className="text-primary font-medium flex items-center hover:underline">
                    View news <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="restaurants">
              <div>
                <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <IndustryBlogSection 
                    industry="Restaurant"
                    description="Payment technology insights and best practices tailored for food service businesses of all sizes."
                    posts={restaurantPosts}
                  />
                </Suspense>
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
                <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <IndustryBlogSection 
                    industry="Healthcare"
                    description="Specialized payment processing solutions for medical practices, clinics, and healthcare providers."
                    posts={healthcarePosts}
                  />
                </Suspense>
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
                <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <IndustryBlogSection 
                    industry="Legal"
                    description="Compliant payment processing solutions designed for law firms and legal practices."
                    posts={legalPosts}
                  />
                </Suspense>
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
                <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <IndustryBlogSection 
                    industry="Retail"
                    description="Innovative payment processing solutions for retail businesses of all sizes."
                    posts={retailPosts}
                  />
                </Suspense>
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
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity Merchant Services<sup className="text-xs">TM</sup></a></li>
                <li><a href="/pos-systems" className="hover:text-white transition-colors">BistroBeast<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity ECom Ready<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity LegalEdge<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurityMedPay<sup className="text-xs">TM</sup></a></li>
                <li><a href="/pos-systems" className="hover:text-white transition-colors">PaySurity POS Hardware<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity WebCon<sup className="text-xs">TM</sup></a></li>
                <li><a href="/digital-wallet" className="hover:text-white transition-colors">PaySurity Wallet<sup className="text-xs">TM</sup></a></li>
                <li><a href="/industry-solutions" className="hover:text-white transition-colors">PaySurity Affiliates<sup className="text-xs">TM</sup></a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog Home</Link></li>
                <li><Link href="/blog/payment-industry-news" className="hover:text-white transition-colors">Industry News</Link></li>
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