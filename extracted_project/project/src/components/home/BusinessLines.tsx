import React from 'react';
import { useNavigate } from 'react-router-dom';
import { businessLines } from '../../data/businessLines';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Section from '../ui/Section';
import { ArrowRight } from 'lucide-react';

const BusinessLines = () => {
  const navigate = useNavigate();

  const handleLearnMore = (url: string) => {
    navigate(url);
    window.scrollTo(0, 0);
  };

  return (
    <Section className="bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Solutions</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tailored payment and management systems for your industry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {businessLines.map((business, index) => (
          <Card key={index} className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg border-t-4 border-t-cyan-500">
            <CardHeader>
              <CardTitle>{business.name}</CardTitle>
              <CardDescription>{business.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-700">
                {business.description}
              </p>
            </CardContent>
            <CardFooter className="border-t border-gray-100 pt-4">
              <button 
                onClick={() => handleLearnMore(business.url)}
                className="text-cyan-600 flex items-center hover:underline"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default BusinessLines;