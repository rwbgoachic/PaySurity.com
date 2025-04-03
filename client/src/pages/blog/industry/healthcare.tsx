import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Clock, Tag, User, Shield } from "lucide-react";

export default function HealthcareBlogPage() {
  // Mock blog posts for healthcare industry
  const blogPosts = [
    {
      id: 1,
      title: "HIPAA-Compliant Payment Processing for Healthcare Providers",
      summary: "Discover how modern payment technologies can ensure regulatory compliance while improving patient experience.",
      author: "Dr. Emily Richards",
      date: "March 30, 2025",
      tags: ["HIPAA", "Compliance", "Security"],
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Streamlining Medical Billing and Payments",
      summary: "How healthcare providers can reduce administrative overhead and improve cash flow with integrated payment solutions.",
      author: "James Wilson",
      date: "March 26, 2025",
      tags: ["Medical Billing", "Efficiency", "Integration"],
      imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "The Future of Patient Payments in Healthcare",
      summary: "Emerging technologies and trends that are reshaping how patients pay for healthcare services.",
      author: "Dr. Sarah Martinez",
      date: "March 21, 2025",
      tags: ["Trends", "Patient Experience", "Digital Payments"],
      imageUrl: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Improving Patient Satisfaction Through Modern Payment Options",
      summary: "How offering flexible payment methods and clear billing can significantly enhance the patient experience.",
      author: "Michael Thompson",
      date: "March 16, 2025",
      tags: ["Patient Satisfaction", "Payment Options", "Experience"],
      imageUrl: "https://images.unsplash.com/photo-1560582861-45078880e48e?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Securing Patient Financial Data in Healthcare Payments",
      summary: "Best practices for protecting sensitive patient financial information during payment processing.",
      author: "Jennifer Chen",
      date: "March 12, 2025",
      tags: ["Data Security", "PCI Compliance", "Protection"],
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Implementing Healthcare Payment Systems: A Practical Guide",
      summary: "Step-by-step guidance for selecting and deploying payment processing solutions in healthcare settings.",
      author: "Dr. Robert Adams",
      date: "March 7, 2025",
      tags: ["Implementation", "Guide", "Best Practices"],
      imageUrl: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=1000&auto=format&fit=crop"
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
          <h1 className="text-4xl font-bold mb-4">Healthcare Payment Solutions</h1>
          <p className="text-xl text-neutral-600 max-w-3xl">
            Insights and strategies for healthcare providers looking to optimize payment processing while maintaining HIPAA compliance and enhancing patient experience.
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
            <h2 className="text-2xl font-bold mb-4">Secure, HIPAA-Compliant Payment Processing</h2>
            <div className="flex justify-center mb-6">
              <Shield className="h-12 w-12 text-primary opacity-80" />
            </div>
            <p className="text-neutral-600 mb-6">
              PaySurity offers specialized payment solutions for healthcare providers that ensure full HIPAA compliance 
              while streamlining billing processes and improving patient satisfaction.
            </p>
            <Button size="lg" className="font-medium">
              Learn About Healthcare Solutions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}