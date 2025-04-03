import { useState, useEffect, useRef, memo, lazy, Suspense } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { fetchPaymentNews, type NewsItem } from "@/lib/newsapi";
import { OrganizationSchema } from "@/components/seo/json-ld";
import { usePageMeta } from "@/hooks/use-page-meta";

// Memoized news card component for better performance
const NewsCard = memo(({ item }: { item: NewsItem }) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
    <CardContent className="p-0">
      <div className={`h-2 ${
        item.category === "Innovation" ? "bg-blue-500" :
        item.category === "Regulation" ? "bg-amber-500" :
        item.category === "Market Trends" ? "bg-green-500" :
        "bg-red-500"
      }`}></div>
      {item.urlToImage && (
        <div className="relative h-40 w-full overflow-hidden">
          <img 
            src={item.urlToImage} 
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Hide image on error
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-6 flex flex-col h-full">
        <div className="mb-3">
          <Badge variant="outline" className={`
            ${item.category === "Innovation" ? "text-blue-500 border-blue-200" :
              item.category === "Regulation" ? "text-amber-500 border-amber-200" :
              item.category === "Market Trends" ? "text-green-500 border-green-200" :
              "text-red-500 border-red-200"}
          `}>
            {item.category}
          </Badge>
        </div>
        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
        <p className="text-neutral-600 mb-4 flex-grow">{item.summary}</p>
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{item.date}</span>
          </div>
          <div>{item.source}</div>
        </div>
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary font-medium flex items-center hover:underline"
        >
          Read full article <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
    </CardContent>
  </Card>
));

export default function PaymentIndustryNewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [hasNewsApiKey, setHasNewsApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample news data to use when NewsAPI isn't available or fails
  const sampleNewsItems: NewsItem[] = [
    {
      title: "Visa Enhances Digital Payment Security with New AI Tools",
      source: "PYMNTS.com",
      url: "https://www.pymnts.com/",
      date: "April 2, 2025",
      summary: "Visa has introduced a new suite of AI-powered security tools aimed at reducing digital payment fraud. The technology can detect unusual patterns in real-time and adapt to evolving threats.",
      category: "Security",
      urlToImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1470&auto=format&fit=crop"
    },
    {
      title: "Stripe Expands Merchant Services in Asian Markets",
      source: "TechCrunch",
      url: "https://techcrunch.com/",
      date: "April 1, 2025",
      summary: "Stripe announced a significant expansion in Southeast Asian markets, introducing localized payment options and currency support for merchants in Indonesia, Thailand, and Vietnam.",
      category: "Market Trends",
      urlToImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "New EU Regulations Target Payment Processing Fees",
      source: "Financial Times",
      url: "https://www.ft.com/",
      date: "March 30, 2025",
      summary: "European regulators have approved new rules aiming to reduce interchange fees for cross-border payments within the EU, potentially saving merchants billions annually.",
      category: "Regulation",
      urlToImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Apple Pay Later Rolls Out Globally After Successful US Launch",
      source: "Bloomberg",
      url: "https://www.bloomberg.com/",
      date: "March 29, 2025",
      summary: "Apple's buy-now-pay-later service is expanding to international markets following strong adoption in the US, challenging established BNPL providers.",
      category: "Innovation"
    },
    {
      title: "Central Banks Accelerate Digital Currency Development",
      source: "Wall Street Journal",
      url: "https://www.wsj.com/",
      date: "March 28, 2025",
      summary: "A consortium of central banks has announced a collaborative framework for developing and testing central bank digital currencies (CBDCs), with pilot programs scheduled for Q3.",
      category: "Innovation"
    },
    {
      title: "Mastercard Acquires Fraud Prevention Startup",
      source: "CNBC",
      url: "https://www.cnbc.com/",
      date: "March 27, 2025",
      summary: "Mastercard has acquired a leading fraud prevention startup for $800 million, integrating its AI-based risk assessment technology into Mastercard's security infrastructure.",
      category: "Security"
    },
    {
      title: "Global Payment Transaction Volume Surges by 24%",
      source: "McKinsey Payments Report",
      url: "https://www.mckinsey.com/",
      date: "March 26, 2025",
      summary: "According to the latest payments industry report, global digital payment transaction volume increased by 24% year-over-year, with mobile payments showing the strongest growth.",
      category: "Market Trends"
    },
    {
      title: "UK Financial Conduct Authority Proposes New Payment Protection Rules",
      source: "Reuters",
      url: "https://www.reuters.com/",
      date: "March 25, 2025",
      summary: "The UK's FCA has published draft regulations focused on enhancing consumer protection in digital payments and increasing transparency in transaction fee structures.",
      category: "Regulation"
    }
  ];

  const getPaymentIndustryNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check for NewsAPI key in environment variables
      const hasKey = import.meta.env.NEWS_API_KEY ? true : false;
      setHasNewsApiKey(hasKey);
      
      if (hasKey) {
        // Fetch news from NewsAPI
        const news = await fetchPaymentNews();
        
        if (news && news.length > 0) {
          setNewsItems(news);
        } else {
          // Fallback to sample data if no news returned
          console.warn("No news items returned from API, using sample data");
          setNewsItems(sampleNewsItems);
        }
      } else {
        // Use sample data if no API key
        console.warn("No NewsAPI key found, using sample data");
        setNewsItems(sampleNewsItems);
      }
    } catch (error) {
      console.error("Error fetching payment industry news:", error);
      setError("Unable to load news data. Please try again later.");
      setNewsItems(sampleNewsItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Using Intersection Observer for lazy loading
  const [shouldLoadNews, setShouldLoadNews] = useState(false);
  
  // Set up the intersection observer for lazy loading
  const newsObserverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create intersection observer to detect when news section is about to be visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the news section comes into view
        if (entry.isIntersecting) {
          setShouldLoadNews(true);
          // Disconnect observer after triggering load
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Start loading when 10% of element is visible
    );
    
    // Start observing the reference element
    if (newsObserverRef.current) {
      observer.observe(newsObserverRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Load news when needed
  useEffect(() => {
    if (shouldLoadNews) {
      getPaymentIndustryNews();
    }
  }, [shouldLoadNews]);

  const filteredNews = selectedTab === "all" 
    ? newsItems 
    : newsItems.filter(item => item.category.toLowerCase() === selectedTab);

  return (
    <div className="min-h-screen bg-white">
      {/* SEO with enhanced metadata */}
      {usePageMeta({
        title: "Payment Industry News | Paysurity",
        description: "Stay informed with the latest developments, innovations, and regulatory changes in the payment processing industry from Paysurity.",
        path: "/blog/payment-industry-news",
        keywords: "payment industry news, payment processing, payment innovations, payment regulations, payment security, market trends, Paysurity",
        ogImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        ogType: "website",
        twitterCard: "summary_large_image",
        breadcrumbs: [
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: "Payment Industry News", url: "/blog/payment-industry-news" },
        ]
      })}
      <OrganizationSchema />
      
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
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div>
              <Link href="/blog" className="text-primary inline-flex items-center mb-4 hover:underline">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Payment Industry News</h1>
              <p className="text-neutral-600 max-w-2xl">
                Stay informed with the latest developments, innovations, and regulatory changes in the payment processing industry.
              </p>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Payment industry news" 
                className="w-48 h-32 object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 max-w-3xl mx-auto">
                <TabsTrigger value="all">All News</TabsTrigger>
                <TabsTrigger value="innovation">Innovation</TabsTrigger>
                <TabsTrigger value="regulation">Regulation</TabsTrigger>
                <TabsTrigger value="market trends">Market Trends</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Intersection Observer reference point */}
          <div ref={newsObserverRef} className="h-4 w-full"></div>

          {/* News content */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-neutral-600">Loading latest payment industry news...</span>
            </div>
          ) : (
            <>
              {!hasNewsApiKey && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 text-amber-800">
                  <p className="flex items-start gap-2">
                    <span className="font-semibold">Note:</span> 
                    <span>
                      This page is showing sample news data. To display real-time industry news, set up the NewsAPI integration.
                    </span>
                  </p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 text-red-800">
                  <p className="flex items-start gap-2">
                    <span className="font-semibold">Error:</span> 
                    <span>{error}</span>
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item, index) => (
                  <NewsCard key={index} item={item} />
                ))}
              </div>

              {filteredNews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-neutral-600">No news items found in this category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-neutral-600 mb-8">
              Subscribe to our newsletter to receive the latest payment industry news and insights directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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