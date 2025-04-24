import React from 'react';
import Section from '../ui/Section';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "PaySurity's restaurant management system revolutionized how we run our business. From order taking to inventory management, everything is seamless.",
    author: "Michael Chen",
    position: "Owner, Fusion Bistro",
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    quote: "The dental practice management solution has streamlined our appointment scheduling and billing processes, saving us countless hours every week.",
    author: "Dr. Sarah Williams",
    position: "Dentist, Bright Smile Dental",
    image: "https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    quote: "Our law firm has seen a 30% increase in efficiency since implementing PaySurity's legal practice management system. The client portal is a game-changer.",
    author: "James Patterson",
    position: "Partner, Patterson & Associates",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  }
];

const Testimonials = () => {
  return (
    <Section className="bg-blue-900 text-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Thousands of businesses trust PaySurity for their payment and management needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-blue-800 rounded-lg p-6 relative">
            <Quote className="absolute top-6 right-6 h-12 w-12 text-blue-700 opacity-50" />
            <p className="text-blue-100 mb-6 relative z-10">"{testimonial.quote}"</p>
            <div className="flex items-center">
              <img 
                src={testimonial.image} 
                alt={testimonial.author} 
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-semibold">{testimonial.author}</h4>
                <p className="text-blue-300 text-sm">{testimonial.position}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Testimonials;