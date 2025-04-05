import React, { useState } from 'react';

// Project dependencies tracking component
export const ProjectDependencies: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dependencies');
  
  const dependencies = [
    {
      id: 1,
      item: "CFO Video Asset",
      description: "Stock video showing CFO smiling at downward trending expense graph",
      dependencyType: "Asset",
      riskLevel: "Low",
      responsible: "Marketing Team",
      status: "Pending",
      dueDate: "TBD",
      notes: "For landing page hero section"
    },
    {
      id: 2,
      item: "Company Logos",
      description: "Client logos for social proof section",
      dependencyType: "Asset",
      riskLevel: "Medium",
      responsible: "Marketing Team",
      status: "Pending",
      dueDate: "TBD",
      notes: "Need 5+ real client logos"
    },
    {
      id: 3,
      item: "POS Hardware Images",
      description: "Professional images of upcoming POS hardware",
      dependencyType: "Asset",
      riskLevel: "Medium",
      responsible: "Product Team",
      status: "Pending",
      dueDate: "TBD",
      notes: "For POS hardware section"
    },
    {
      id: 4,
      item: "HIPAA Compliance Certification",
      description: "Official HIPAA compliance certification for healthcare solutions",
      dependencyType: "Legal",
      riskLevel: "High",
      responsible: "Legal Team",
      status: "Pending",
      dueDate: "Q3 2025",
      notes: "Required for healthcare payment solutions"
    },
    {
      id: 5,
      item: "PCI DSS Certification",
      description: "PCI compliance certification",
      dependencyType: "Legal",
      riskLevel: "High",
      responsible: "Security Team",
      status: "In Progress",
      dueDate: "Q2 2025",
      notes: "Required for all payment processing"
    },
    {
      id: 6,
      item: "Helcim Backend Integration",
      description: "API integration with Helcim for payment processing",
      dependencyType: "Technical",
      riskLevel: "High",
      responsible: "Development Team",
      status: "In Progress",
      dueDate: "Q2 2025",
      notes: "Core payment processing functionality"
    },
    {
      id: 7,
      item: "BistroBeast POS System",
      description: "Restaurant management system development",
      dependencyType: "Product",
      riskLevel: "High",
      responsible: "Development Team",
      status: "In Progress",
      dueDate: "Q3 2025",
      notes: "Key industry-specific solution with inventory, staff, and transaction management"
    },
    {
      id: 8,
      item: "Mobile App Development",
      description: "iOS and Android apps for digital wallet",
      dependencyType: "Technical",
      riskLevel: "High",
      responsible: "Mobile Dev Team",
      status: "In Progress",
      dueDate: "Q2 2025",
      notes: "Core mobile functionality for wallet and POS systems"
    },
    {
      id: 9,
      item: "Affiliate Marketing System",
      description: "Affiliate tracking and management system",
      dependencyType: "Product",
      riskLevel: "Medium",
      responsible: "Development Team",
      status: "In Progress",
      dueDate: "Q2 2025",
      notes: "Revenue generation feature with tiered payout structure"
    },
    {
      id: 10,
      item: "Digital Wallet Parent-Child Features",
      description: "Family-oriented digital wallet functionality",
      dependencyType: "Product",
      riskLevel: "Medium",
      responsible: "Development Team",
      status: "In Progress",
      dueDate: "Q3 2025",
      notes: "Includes spending controls, limits, and educational tools"
    },
    {
      id: 11,
      item: "Employer-Employee Expense Management",
      description: "Business expense tracking and management",
      dependencyType: "Product",
      riskLevel: "Medium",
      responsible: "Development Team",
      status: "In Progress",
      dueDate: "Q3 2025",
      notes: "Locked expense funds for business expenditures"
    },
    {
      id: 12,
      item: "Health Savings Account (HSA) Module",
      description: "HSA management and integration",
      dependencyType: "Product",
      riskLevel: "High",
      responsible: "Development Team",
      status: "Pending",
      dueDate: "Q4 2025",
      notes: "Tax-advantaged health savings functionality"
    },
    {
      id: 13,
      item: "Retirement Savings (RS) Account Module",
      description: "Retirement savings integration",
      dependencyType: "Product",
      riskLevel: "High",
      responsible: "Development Team",
      status: "Pending",
      dueDate: "Q4 2025",
      notes: "Tax-deferred retirement savings"
    },
    {
      id: 14,
      item: "Automated Payroll Tax Filing System",
      description: "Automated tax calculations and reporting",
      dependencyType: "Technical",
      riskLevel: "High",
      responsible: "Development Team",
      status: "Pending",
      dueDate: "Q3 2025",
      notes: "State-specific tax code compliance"
    },
    {
      id: 15,
      item: "QuickBooks Integration",
      description: "Single sign-on integration with QuickBooks",
      dependencyType: "Technical",
      riskLevel: "Medium",
      responsible: "Development Team",
      status: "Pending",
      dueDate: "Q3 2025",
      notes: "For seamless accounting sync"
    }
  ];

  const affiliateInfo = [
    { title: "First Payout", value: "$25", trigger: "Customer doesn't cancel within 7 days", clawback: "If customer cancels before Day 30 and transactions < $2,500" },
    { title: "Second Payout", value: "$25", trigger: "Customer active for 30 days and processes ≥ $2,500", clawback: "None" },
    { title: "Third Payout", value: "$25 + 5% of commission", trigger: "Customer active for 90 days and processes ≥ $7,500 total", clawback: "None" },
    { title: "Fourth Payout", value: "$25 + 6.25% of commission", trigger: "Customer processes ≥ $15,000 between Days 91–180", clawback: "None" },
    { title: "Recurring Payout", value: "$28.75/month", trigger: "Customer processes ≥ $5,000/month after Day 180", clawback: "None" },
    { title: "Loyalty Bonus", value: "$30/month", trigger: "Customer active 365+ days and processes ≥ $5,000/month", clawback: "None" },
    { title: "High-Volume Bonus", value: "+$25/month per customer", trigger: "Customer processing ≥ $100,000/month", clawback: "None" },
    { title: "Bulk Referral Bonus", value: "+$300/month", trigger: "≥ 10 customers each processing ≥ $3,000/month", clawback: "None" }
  ];

  const solutionOfferings = [
    { name: "BistroBeast", description: "Restaurant Management System with table management, ordering, inventory, and staff scheduling" },
    { name: "PaySurityRetailer", description: "Retail POS system with inventory management, customer loyalty, and sales analytics" },
    { name: "PaySurityLegalPay", description: "Legal practice payment solution with trust account management and case billing" },
    { name: "Healthcare Payment Solutions", description: "HIPAA-compliant healthcare payment processing and patient billing" },
    { name: "PaySurity Mobile POS", description: "Mobile point-of-sale solution for businesses on the go" },
    { name: "PaySurity Analytics", description: "Advanced analytics and reporting for merchant transactions and trends" },
    { name: "PaySurity ACH Processing", description: "Automated Clearing House payment processing for recurring payments" },
    { name: "Gift Card Management System", description: "Customizable gift card program for merchants with tracking and reporting" },
    { name: "Loyalty Program Platform", description: "Configurable customer loyalty and rewards system" },
    { name: "Employee Scheduling Module", description: "Staff scheduling and time tracking for businesses" },
    { name: "Digital Wallet - Parent/Child", description: "Family-oriented digital wallet with parental controls and educational tools" },
    { name: "Digital Wallet - Employer/Employee", description: "Business expense management with locked funds for approved expenses" },
    { name: "QuickBooks Integration", description: "Seamless accounting integration with single sign-on capability" },
    { name: "Payroll Tax Automation", description: "Automated payroll tax calculation and filing based on state regulations" },
    { name: "HSA/RS Account Management", description: "Health Savings and Retirement Savings account integration" }
  ];

  const KeyRisks = [
    { 
      area: "Technical Integration", 
      description: "Helcim API integration may face challenges with custom requirements", 
      mitigation: "Early prototyping and API exploration, establish direct contact with Helcim support" 
    },
    { 
      area: "Compliance", 
      description: "HIPAA and PCI compliance certification timelines may impact healthcare solutions launch", 
      mitigation: "Begin certification process early, implement all required security measures in advance" 
    },
    { 
      area: "Market Differentiation", 
      description: "Competitive landscape with established players like Square, Stripe, and PayPal", 
      mitigation: "Focus on industry-specific solutions and value-added services that competitors lack" 
    },
    { 
      area: "Mobile App Development", 
      description: "Cross-platform consistency challenges between iOS and Android", 
      mitigation: "Use React Native for code sharing, extensive testing on both platforms" 
    },
    { 
      area: "Merchant Acquisition", 
      description: "Conversion rates for merchant sign-ups may be lower pre-launch", 
      mitigation: "Develop targeted content for both pre-launch and post-launch merchants" 
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Paysurity Project Dashboard</h1>
      <p className="mb-6">Comprehensive tracking of dependencies, requirements, offerings, and risks for the Paysurity platform development.</p>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'dependencies' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('dependencies')}
          >
            Dependencies
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'affiliate' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('affiliate')}
          >
            Affiliate Program
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'solutions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('solutions')}
          >
            Solution Offerings
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'risks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('risks')}
          >
            Key Risks
          </button>
        </div>
      </div>
      
      {activeTab === 'dependencies' && (
        <div className="overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Project Dependencies Tracking</h2>
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 border-b text-left">Item</th>
                <th className="py-2 px-3 border-b text-left">Description</th>
                <th className="py-2 px-3 border-b text-left">Type</th>
                <th className="py-2 px-3 border-b text-left">Risk</th>
                <th className="py-2 px-3 border-b text-left">Responsible</th>
                <th className="py-2 px-3 border-b text-left">Status</th>
                <th className="py-2 px-3 border-b text-left">Due Date</th>
                <th className="py-2 px-3 border-b text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep) => (
                <tr key={dep.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-b">{dep.item}</td>
                  <td className="py-2 px-3 border-b">{dep.description}</td>
                  <td className="py-2 px-3 border-b">{dep.dependencyType}</td>
                  <td className="py-2 px-3 border-b">
                    <span className={`px-2 py-1 rounded text-sm ${
                      dep.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 
                      dep.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {dep.riskLevel}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-b">{dep.responsible}</td>
                  <td className="py-2 px-3 border-b">
                    <span className={`px-2 py-1 rounded text-sm ${
                      dep.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      dep.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                      dep.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-b">{dep.dueDate}</td>
                  <td className="py-2 px-3 border-b">{dep.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'affiliate' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Affiliate Marketing Program Structure</h2>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium mb-3">Payout Structure</h3>
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 border-b text-left">Payout</th>
                  <th className="py-2 px-3 border-b text-left">Amount</th>
                  <th className="py-2 px-3 border-b text-left">Trigger</th>
                  <th className="py-2 px-3 border-b text-left">Clawback Condition</th>
                </tr>
              </thead>
              <tbody>
                {affiliateInfo.map((info, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-3 border-b font-medium">{info.title}</td>
                    <td className="py-2 px-3 border-b">{info.value}</td>
                    <td className="py-2 px-3 border-b">{info.trigger}</td>
                    <td className="py-2 px-3 border-b">{info.clawback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-3">Implementation Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Automation</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email alerts for payout milestones</li>
                  <li>Dashboard with real-time earnings stats</li>
                  <li>Automated tracking of customer activity</li>
                  <li>Payment processing threshold monitoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Legal & Safety</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Terms modification clause</li>
                  <li>Next-of-kin details collection</li>
                  <li>Profit protection through transaction thresholds</li>
                  <li>Regular margin monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'solutions' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Solution Offerings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionOfferings.map((solution, index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{solution.name}</h3>
                <p className="text-gray-600">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'risks' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Key Project Risks</h2>
          <div className="space-y-4">
            {KeyRisks.map((risk, index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">{risk.area}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-red-600 mb-1">Risk:</h4>
                    <p className="text-gray-700">{risk.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-600 mb-1">Mitigation Strategy:</h4>
                    <p className="text-gray-700">{risk.mitigation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDependencies;