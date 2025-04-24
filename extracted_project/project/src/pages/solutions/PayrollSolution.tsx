import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../../components/ui/Section';
import { 
  DollarSign, Clock, Shield, Users, 
  FileText, Calculator, BellRing, BarChart3 
} from 'lucide-react';

export default function PayrollSolution() {
  const navigate = useNavigate();
  
  const handleViewPricing = () => {
    navigate('/solutions/payroll/pricing');
  };
  
  const handleScheduleDemo = () => {
    navigate('/contact');
  };
  
  return (
    <>
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white pt-16 pb-16">
        <Section>
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-cyan-400">PayrollPro</h2>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">
                Simplified Payroll Management Solution
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              Automate your payroll process with our comprehensive solution. Handle payments, taxes, and compliance with ease.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleViewPricing}
                className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50 rounded-md"
              >
                View Pricing
              </button>
              <button 
                onClick={handleScheduleDemo}
                className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-600 hover:border-blue-600 rounded-md"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <Calculator className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Automatic Calculations</h3>
            <p className="text-gray-600">
              Accurate payroll calculations including taxes, benefits, and deductions.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg">
            <DollarSign className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Direct Deposits</h3>
            <p className="text-gray-600">
              Fast and secure direct deposit payments to employees.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg">
            <Shield className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tax Compliance</h3>
            <p className="text-gray-600">
              Automated tax calculations and filings to ensure compliance.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg">
            <FileText className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Employee Self-Service</h3>
            <p className="text-gray-600">
              Employee portal for accessing pay stubs and tax documents.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg">
            <BellRing className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Automated Reminders</h3>
            <p className="text-gray-600">
              Never miss important deadlines with automated notifications.
            </p>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg">
            <BarChart3 className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Reporting & Analytics</h3>
            <p className="text-gray-600">
              Comprehensive reporting for payroll, taxes, and labor costs.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose PayrollPro?</h2>
          <p className="text-xl text-gray-600 mb-12">
            Our payroll solution is designed to save you time and money while ensuring accuracy and compliance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-left">
              <h3 className="text-xl font-semibold mb-3">Time Savings</h3>
              <p className="text-gray-600">
                Reduce payroll processing time by up to 80% with our automated system. What used to take days now takes minutes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-left">
              <h3 className="text-xl font-semibold mb-3">Cost Effective</h3>
              <p className="text-gray-600">
                Simple per-employee pricing with no hidden fees. Pay only for what you use with transparent pricing.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-left">
              <h3 className="text-xl font-semibold mb-3">Accuracy Guaranteed</h3>
              <p className="text-gray-600">
                Our system ensures accurate calculations and tax filings, reducing errors and potential penalties.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-left">
              <h3 className="text-xl font-semibold mb-3">Compliance Built-in</h3>
              <p className="text-gray-600">
                Stay compliant with changing regulations. We automatically update tax tables and compliance requirements.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="bg-blue-900 text-white p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Payroll?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust PayrollPro for their payroll needs. Get started today with our simple pricing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleViewPricing}
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-white text-blue-700 border-2 border-white hover:bg-blue-50 rounded-md"
            >
              View Pricing
            </button>
            <button 
              onClick={handleScheduleDemo}
              className="h-11 px-6 text-base inline-flex items-center justify-center font-medium bg-transparent text-white border-2 border-white hover:bg-blue-600 hover:border-blue-600 rounded-md"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </Section>
    </>
  );
}