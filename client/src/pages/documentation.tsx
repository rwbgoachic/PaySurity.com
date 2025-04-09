import { MetaTags } from "@/components/seo";

export default function Documentation() {
  return (
    <>
      <MetaTags
        title="Documentation | PaySurity"
        description="Learn how to integrate and use PaySurity's payment solutions with our comprehensive documentation, guides, and API references."
        canonicalUrl="/documentation"
      />
      
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              PaySurity Documentation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to know about integrating and using PaySurity's payment solutions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
                <p className="text-gray-600 mb-4">Basic information to help you get started with PaySurity.</p>
                <ul className="space-y-2 text-blue-600">
                  <li><a href="#" className="hover:underline">Account Setup</a></li>
                  <li><a href="#" className="hover:underline">Dashboard Overview</a></li>
                  <li><a href="#" className="hover:underline">Security Best Practices</a></li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-3">API Reference</h3>
                <p className="text-gray-600 mb-4">Complete API documentation for developers.</p>
                <ul className="space-y-2 text-blue-600">
                  <li><a href="#" className="hover:underline">REST API</a></li>
                  <li><a href="#" className="hover:underline">Webhooks</a></li>
                  <li><a href="#" className="hover:underline">Authentication</a></li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Guides & Tutorials</h3>
                <p className="text-gray-600 mb-4">Step-by-step instructions for common tasks.</p>
                <ul className="space-y-2 text-blue-600">
                  <li><a href="#" className="hover:underline">Integration Guide</a></li>
                  <li><a href="#" className="hover:underline">Payment Forms</a></li>
                  <li><a href="#" className="hover:underline">Subscription Billing</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Popular Documentation Topics</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Setting Up Your Account</h3>
                  <p className="text-gray-600 mb-4">
                    Learn how to set up your PaySurity account, configure payment methods, and prepare your account for receiving payments.
                  </p>
                  <a href="#" className="text-blue-600 hover:underline">Read More →</a>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Integrating PaySurity with Your Website</h3>
                  <p className="text-gray-600 mb-4">
                    Step-by-step guide to integrate PaySurity payment processing into your website or application.
                  </p>
                  <a href="#" className="text-blue-600 hover:underline">Read More →</a>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Managing Transactions</h3>
                  <p className="text-gray-600 mb-4">
                    Learn how to view, search, refund, and manage all your payment transactions through the PaySurity dashboard.
                  </p>
                  <a href="#" className="text-blue-600 hover:underline">Read More →</a>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Handling Payment Disputes</h3>
                  <p className="text-gray-600 mb-4">
                    Understand how to effectively handle chargebacks and payment disputes to protect your business.
                  </p>
                  <a href="#" className="text-blue-600 hover:underline">Read More →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}