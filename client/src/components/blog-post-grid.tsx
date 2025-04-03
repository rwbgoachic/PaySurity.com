import { Link } from "wouter";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type BlogPost } from "@/data/blog-posts";

type BlogPostGridProps = {
  posts: BlogPost[];
  columns?: 1 | 2 | 3;
};

export default function BlogPostGrid({ posts, columns = 2 }: BlogPostGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3"
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
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
  );
}