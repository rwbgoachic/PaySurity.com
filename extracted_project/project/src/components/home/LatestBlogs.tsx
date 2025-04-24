import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../ui/Section';
import { blogPosts } from '../../data/blogPosts';
import { Card, CardContent, CardHeader } from '../ui/Card';

const LatestBlogs = () => {
  const navigate = useNavigate();
  const latestPosts = blogPosts.slice(0, 3);

  const handleViewAll = () => {
    navigate('/blog');
  };

  const handleReadMore = (id: string) => {
    navigate(`/blog/${id}`);
  };

  return (
    <Section>
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Insights</h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            Industry expertise and tips to help your business thrive
          </p>
        </div>
        <button
          onClick={handleViewAll}
          className="mt-4 md:mt-0 h-10 px-4 text-sm inline-flex items-center justify-center font-medium bg-transparent border-2 border-gray-300 text-gray-800 hover:bg-gray-100"
        >
          View all posts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {latestPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
            <div className="h-48 overflow-hidden">
              <img 
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-cyan-600 font-medium">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">
                  {post.date}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
            </CardContent>
            <div className="p-6 pt-0">
              <button
                onClick={() => handleReadMore(post.id)}
                className="text-cyan-600 hover:underline"
              >
                Read more
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default LatestBlogs;