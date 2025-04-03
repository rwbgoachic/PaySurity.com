import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Clock, Tag, User } from "lucide-react";

export default function RestaurantBlogPage() {
  // Mock blog posts for restaurant industry
  const blogPosts = [
    {
      id: 1,
      title: "7 Ways Restaurants Can Streamline Payment Processing",
      summary: "Discover how modern payment technologies can help your restaurant increase efficiency and improve customer satisfaction.",
      author: "Sarah Johnson",
      date: "March 28, 2025",
      tags: ["Payments", "Efficiency", "POS"],
      imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "How Integrated POS Systems Are Transforming Restaurant Operations",
      summary: "Learn how BistroBeast and other integrated POS solutions are helping restaurants manage staff, inventory, and payments in one platform.",
      author: "Michael Chen",
      date: "March 25, 2025",
      tags: ["POS", "Operations", "Management"],
      imageUrl: "https://images.unsplash.com/photo-1516685125522-3c528b8023fb?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Restaurant Payment Trends for 2025",
      summary: "Stay ahead of the curve with these emerging payment technologies and trends that are reshaping the restaurant industry.",
      author: "Emily Rodriguez",
      date: "March 20, 2025",
      tags: ["Trends", "Innovation", "Digital Payments"],
      imageUrl: "https://images.unsplash.com/photo-1565895405140-6b9830a88c19?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Optimizing Tip Management for Restaurant Staff",
      summary: "Effective strategies for restaurants to manage and distribute tips fairly while maximizing staff satisfaction and retention.",
      author: "David Wilson",
      date: "March 15, 2025",
      tags: ["Staff", "Tips", "Management"],
      imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Reducing Payment Processing Costs for Your Restaurant",
      summary: "Practical tips to help restaurant owners reduce payment processing fees and save thousands annually.",
      author: "Jessica Kim",
      date: "March 10, 2025",
      tags: ["Cost Savings", "Fees", "Optimization"],
      imageUrl: "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "How to Choose the Right Payment Processor for Your Restaurant",
      summary: "A comprehensive guide to evaluating and selecting the perfect payment processing solution for your restaurant's specific needs.",
      author: "Robert Taylor",
      date: "March 5, 2025",
      tags: ["Selection Guide", "Comparison", "Decision Making"],
      imageUrl: "https://images.unsplash.com/photo-1577626997835-ae5e33c2a90d?q=80&w=1000&auto=format&fit=crop"
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
          <Link href="/merchant/pos/bistro">
            <Button variant="outline" className="ml-auto">
              Explore BistroBeast POS
            </Button>
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Restaurant Industry Insights</h1>
          <p className="text-xl text-neutral-600 max-w-3xl">
            Expert advice, trends, and strategies for restaurant owners looking to optimize payment processing and operations.
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
            <h2 className="text-2xl font-bold mb-4">Ready to transform your restaurant operations?</h2>
            <p className="text-neutral-600 mb-6">
              Discover how PaySurity's BistroBeast POS system can streamline your payment processing, staff management, 
              and inventory tracking while providing valuable analytics to grow your business.
            </p>
            <Link href="/merchant/pos/bistro">
              <Button size="lg" className="font-medium">
                Explore BistroBeast POS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}