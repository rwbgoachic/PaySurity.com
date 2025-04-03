import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Clock, Tag, User, ShoppingBag } from "lucide-react";

export default function RetailBlogPage() {
  // Mock blog posts for retail industry
  const blogPosts = [
    {
      id: 1,
      title: "Omnichannel Payment Strategies for Modern Retailers",
      summary: "How to seamlessly integrate in-store and online payment systems for a unified customer experience.",
      author: "Michael Peterson",
      date: "March 31, 2025",
      tags: ["Omnichannel", "Integration", "Customer Experience"],
      imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Reducing Payment Processing Costs in Retail",
      summary: "Practical strategies for minimizing payment processing fees while maximizing transaction value.",
      author: "Sarah Jenkins",
      date: "March 27, 2025",
      tags: ["Cost Reduction", "Fees", "Optimization"],
      imageUrl: "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Mobile Payment Trends Transforming Retail",
      summary: "Stay ahead of the curve with these emerging mobile payment technologies reshaping the retail landscape.",
      author: "David Wilson",
      date: "March 22, 2025",
      tags: ["Mobile Payments", "Trends", "Innovation"],
      imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Implementing Effective Loyalty Programs Through Payment Systems",
      summary: "How to leverage your payment infrastructure to create compelling loyalty programs that drive repeat business.",
      author: "Jennifer Lee",
      date: "March 17, 2025",
      tags: ["Loyalty", "Customer Retention", "Programs"],
      imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Fraud Prevention Strategies for Retailers",
      summary: "Protect your business and customers with these proven strategies for reducing payment fraud.",
      author: "Robert Martinez",
      date: "March 11, 2025",
      tags: ["Security", "Fraud Prevention", "Protection"],
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Optimizing Checkout Experiences in Physical Retail",
      summary: "Design strategies to reduce friction and increase conversions at the point of sale.",
      author: "Emily Thompson",
      date: "March 6, 2025",
      tags: ["Checkout", "Conversion", "Experience"],
      imageUrl: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="mr-4 p-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-1">Back to Blog</span>
            </Button>
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Retail Payment Solutions</h1>
          <p className="text-xl text-neutral-600 max-w-3xl">
            Expert advice, trends, and strategies for retailers looking to optimize payment processing, enhance customer experience, and drive growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video w-full overflow-hidden bg-neutral-200">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.date}</span>
                  <span className="mx-1">•</span>
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <CardTitle className="text-xl mb-1 line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <div key={index} className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Read more
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 p-8 rounded-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Streamline Your Retail Payment Experience</h2>
            <div className="flex justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-primary opacity-80" />
            </div>
            <p className="text-neutral-600 mb-6">
              PaySurity offers specialized payment solutions for retailers that integrate seamlessly with your existing systems,
              reduce costs, and enhance the customer checkout experience both in-store and online.
            </p>
            <Button size="lg" className="font-medium">
              Explore Retail Solutions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}