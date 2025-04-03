import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, ShoppingBag, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BlogPostGrid from "@/components/blog-post-grid";
import { retailPosts } from "@/data/blog-posts";

export default function RetailBlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleFilters, setVisibleFilters] = useState(false);

  // Extract all unique tags from retail posts
  const allTags = Array.from(
    new Set(
      retailPosts
        .flatMap(post => post.tags || [])
        .filter(Boolean)
    )
  );

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchTerm("");
  };

  const filteredPosts = retailPosts.filter(post => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      post.tags?.some(tag => selectedTags.includes(tag));
    
    return matchesSearch && matchesTags;
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
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Link href="/blog" className="text-primary hover:underline inline-flex items-center mb-2">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Resources
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full p-2 bg-primary/10 text-primary">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Retail Resources</h1>
              </div>
            </div>
            <p className="text-lg text-neutral-600 mb-8">
              Innovative payment processing solutions for retail businesses of all sizes.
              Boost efficiency, reduce costs, and enhance customer experience at checkout.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Input
                type="text"
                placeholder="Search for retail-specific articles..."
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
                  <h3 className="font-bold">Filter by Topic</h3>
                  {selectedTags.length > 0 && (
                    <button 
                      className="text-sm text-primary"
                      onClick={clearFilters}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="mr-2"
                      />
                      <label htmlFor={tag} className="text-sm">{tag}</label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-bold mb-2">Schedule a Demo</h4>
                  <p className="text-sm mb-4">See how our retail payment solutions can transform your checkout experience.</p>
                  <Link href="/contact">
                    <Button size="sm" className="w-full">Schedule Demo</Button>
                  </Link>
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
              {selectedTags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleTagToggle(tag)}>
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
                      {searchTerm || selectedTags.length > 0 
                        ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'result' : 'results'} found` 
                        : 'All Retail Articles'}
                    </h2>
                  </div>

                  <div className="mb-12">
                    <BlogPostGrid posts={filteredPosts} columns={2} />
                  </div>
                </>
              )}

              {/* Post-Launch Messaging CTA (based on your attached document) */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0 md:mr-6">
                    <h3 className="text-xl font-bold mb-2">Cut payment processing fees by 30%</h3>
                    <p className="text-neutral-600">Switch to Paysurity and save on every transaction. Quick 24-hour transition with zero downtime.</p>
                  </div>
                  <Link href="/auth">
                    <Button size="lg">Switch Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section - Animated Benefits */}
      <section className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Transform Your Retail Checkout</h2>
            <p className="text-neutral-600 max-w-3xl mx-auto">
              Our integrated retail solutions combine seamless payments with inventory management 
              and customer loyalty programs to boost your bottom line.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0"></div>
              <div className="relative z-10">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Competitive Pricing</h3>
                <p className="text-neutral-600">Save up to 30% on processing fees with our transparent, volume-based pricing model.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0"></div>
              <div className="relative z-10">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Inventory Integration</h3>
                <p className="text-neutral-600">Synchronize sales and inventory in real-time with our integrated POS systems.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0"></div>
              <div className="relative z-10">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Customer Loyalty</h3>
                <p className="text-neutral-600">Build customer retention with integrated loyalty programs and personalized marketing.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/solutions/retail">
              <Button size="lg">
                Explore Retail Solutions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-neutral-600 mb-8">
              Subscribe to our retail industry newsletter to receive the latest insights on payment processing 
              technologies, omnichannel strategies, and retail technology trends.
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