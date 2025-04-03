import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingBlogSection() {
  // Featured blog posts to showcase on landing page
  const featuredPosts = [
    {
      title: "How Small Businesses Can Reduce Payment Processing Fees by 20%",
      excerpt: "Discover strategies for reducing your payment processing costs without sacrificing service quality or security.",
      slug: "reduce-payment-processing-fees",
      category: "Payment Processing"
    },
    {
      title: "PCI-Compliant Payment Processing: A Complete Guide",
      excerpt: "Understanding PCI DSS compliance is essential for any business accepting credit card payments.",
      slug: "pci-compliant-payment-processing",
      category: "Security"
    },
    {
      title: "Digital Wallets: The Future of Expense Tracking for Business",
      excerpt: "Digital wallets are revolutionizing how businesses manage expenses and provide real-time insights.",
      slug: "digital-wallets-expense-tracking",
      category: "Digital Wallets"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Payment Processing Insights</h2>
          <p className="text-neutral-600">
            Discover expert tips, industry trends, and practical advice on secure payment processing, digital wallets, 
            and specialized POS solutions for your business needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-10">
          {featuredPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow h-full flex flex-col">
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="text-sm text-primary font-medium mb-2">
                  {post.category}
                </div>
                <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                <p className="text-neutral-600 mb-4 flex-grow">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="text-primary font-medium flex items-center hover:underline mt-auto">
                  Read article <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/blog">
            <Button variant="outline" size="lg">
              View All Resources
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}