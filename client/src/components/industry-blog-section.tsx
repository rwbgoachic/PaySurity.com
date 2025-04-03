import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import BlogPostGrid from "@/components/blog-post-grid";
import { type BlogPost } from "@/data/blog-posts";

type IndustryBlogSectionProps = {
  industry: string;
  description: string;
  posts: BlogPost[];
};

export default function IndustryBlogSection({ industry, description, posts }: IndustryBlogSectionProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full p-2 bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold">{industry} Resources</h2>
        </div>
        <p className="text-neutral-600 mb-6 max-w-3xl">{description}</p>
        
        {posts.length > 0 ? (
          <Card className="p-6 bg-white">
            <BlogPostGrid posts={posts.slice(0, 3)} columns={3} />
          </Card>
        ) : (
          <Card className="p-6 bg-white text-center">
            <p className="text-neutral-600">No resources found for this industry.</p>
          </Card>
        )}
      </div>
    </div>
  );
}