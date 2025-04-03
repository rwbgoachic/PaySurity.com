import { Link } from "wouter";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type BlogPost = {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
  category: string;
  tags?: string[];
};

type IndustryBlogSectionProps = {
  industry: string;
  description: string;
  posts: BlogPost[];
};

export default function IndustryBlogSection({ industry, description, posts }: IndustryBlogSectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-4">{industry} Resources</h2>
            <p className="text-neutral-600 text-lg">{description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post, index) => (
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
                    {post.tags && post.tags.length > 0 && (
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

          <div className="text-center">
            <Button variant="outline">
              View All {industry} Resources
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}