import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Clock, Tag, User, Scale } from "lucide-react";

export default function LegalBlogPage() {
  // Mock blog posts for legal industry
  const blogPosts = [
    {
      id: 1,
      title: "Optimizing Payment Processing for Law Firms",
      summary: "Discover how modern payment technologies can help law firms improve cash flow and client satisfaction.",
      author: "Jennifer Moore, Esq.",
      date: "March 29, 2025",
      tags: ["Cash Flow", "Client Experience", "Efficiency"],
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Trust Account Compliance in Legal Payment Processing",
      summary: "How to ensure your payment processing systems maintain compliance with trust account regulations.",
      author: "Robert Thompson, CPA",
      date: "March 24, 2025",
      tags: ["Trust Accounts", "Compliance", "Regulations"],
      imageUrl: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Alternative Fee Arrangements and Payment Systems",
      summary: "Implementing payment systems that support modern fee structures beyond the billable hour.",
      author: "Sarah Williams, Esq.",
      date: "March 19, 2025",
      tags: ["Fee Structures", "Billing", "Innovation"],
      imageUrl: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Simplifying Client Payments for Legal Services",
      summary: "Strategies for making it easier for clients to pay, improving collections and satisfaction.",
      author: "Michael Davis, JD",
      date: "March 14, 2025",
      tags: ["Client Payments", "Collections", "Satisfaction"],
      imageUrl: "https://images.unsplash.com/photo-1542993995-83c5ddd0ccf1?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Security and Confidentiality in Legal Payment Processing",
      summary: "Best practices for maintaining client confidentiality while processing payments securely.",
      author: "Amanda Johnson, CIPP",
      date: "March 9, 2025",
      tags: ["Security", "Confidentiality", "Ethics"],
      imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Payment Technologies for Modern Law Practices",
      summary: "A comprehensive guide to payment technologies that help law firms operate more efficiently.",
      author: "Christopher Lee, Esq.",
      date: "March 4, 2025",
      tags: ["Technology", "Modernization", "Efficiency"],
      imageUrl: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?q=80&w=1000&auto=format&fit=crop"
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
          <h1 className="text-4xl font-bold mb-4">Legal Practice Payment Solutions</h1>
          <p className="text-xl text-neutral-600 max-w-3xl">
            Expert advice, trends, and strategies for law firms looking to optimize payment processing while maintaining trust account compliance and improving client experience.
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
            <h2 className="text-2xl font-bold mb-4">Payment Solutions for Legal Professionals</h2>
            <div className="flex justify-center mb-6">
              <Scale className="h-12 w-12 text-primary opacity-80" />
            </div>
            <p className="text-neutral-600 mb-6">
              PaySurity offers specialized payment solutions for law firms that ensure trust account compliance 
              while streamlining billing processes and improving client satisfaction.
            </p>
            <Button size="lg" className="font-medium">
              Explore Legal Payment Solutions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}