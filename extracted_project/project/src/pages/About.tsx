import React from 'react';
import Section from '../components/ui/Section';
import { Users, Globe2, Award, Target } from 'lucide-react';

export default function About() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white pt-32 pb-16">
        <Section>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About PaySurity
            </h1>
            <p className="text-xl text-blue-100">
              Transforming business operations through innovative payment and management solutions since 2020.
            </p>
          </div>
        </Section>
      </div>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              At PaySurity, we're dedicated to empowering businesses with innovative payment solutions and management tools that drive growth and efficiency. Our mission is to simplify complex business operations through technology that's both powerful and easy to use.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Vision</h3>
                  <p className="text-gray-600">To be the leading provider of integrated business solutions across all industries.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Values</h3>
                  <p className="text-gray-600">Innovation, integrity, customer success, and continuous improvement guide everything we do.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Team collaboration"
              className="w-full h-auto"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Company Overview</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Key metrics that showcase our impact in the industry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 text-center">
            <Users className="h-10 w-10 text-blue-600 mx-auto mb-4" />
            <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
            <div className="text-gray-600">Active Customers</div>
          </div>
          <div className="bg-white p-6 text-center">
            <Globe2 className="h-10 w-10 text-blue-600 mx-auto mb-4" />
            <div className="text-4xl font-bold text-gray-900 mb-2">25+</div>
            <div className="text-gray-600">Countries Served</div>
          </div>
          <div className="bg-white p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">$2B+</div>
            <div className="text-gray-600">Transactions Processed</div>
          </div>
          <div className="bg-white p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses that trust PaySurity for their payment and management needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              Get Started
            </button>
            <button 
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </Section>
    </>
  );
}