import { MetaTags } from "@/components/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <>
      <MetaTags
        title="Frequently Asked Questions | PaySurity"
        description="Find answers to commonly asked questions about PaySurity's payment processing solutions, account management, and merchant services."
        canonicalUrl="/faq"
      />
      
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Find answers to the most common questions about PaySurity's services.
            </p>
            
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Account & Setup</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left font-medium">
                      How do I create a PaySurity account?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Setting up a PaySurity account is simple. Visit our sign-up page, enter your business information, 
                      verify your identity, and connect your bank account. The process typically takes less than 10 minutes,
                      and you can start accepting payments as soon as your account is verified.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left font-medium">
                      What documents do I need to create an account?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      You'll need basic business information (business name, address, and tax ID), personal identification
                      (driver's license or passport), and your business bank account details. For certain business types,
                      additional documentation may be required.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left font-medium">
                      How long does account verification take?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Most accounts are verified instantly. In some cases, additional verification might be required,
                      which can take 1-2 business days. We'll keep you updated throughout the process.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Payments & Processing</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left font-medium">
                      What payment methods does PaySurity accept?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      PaySurity accepts all major credit and debit cards (Visa, Mastercard, American Express, Discover),
                      digital wallets (Apple Pay, Google Pay), ACH direct debits, and international payment methods. The specific
                      methods available depend on your account type and location.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left font-medium">
                      What are the processing fees?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Our standard rate is 2.9% + $0.30 per transaction for online payments and 2.5% + $0.10 for in-person
                      payments. Volume discounts are available for businesses processing over $25,000 per month. For a detailed
                      breakdown, please visit our pricing page.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left font-medium">
                      How soon will I receive my funds?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Standard payout timing is 2 business days. Eligible businesses may qualify for instant payouts or
                      next-day deposits. Your specific payout schedule will be shown in your dashboard after account setup.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7">
                    <AccordionTrigger className="text-left font-medium">
                      How do refunds work?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      You can issue full or partial refunds through your PaySurity dashboard for up to 120 days after the
                      transaction. Refunds typically take 5-10 business days to appear on the customer's statement. Processing
                      fees are refunded for full refunds but not for partial refunds.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Security & Compliance</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-8">
                    <AccordionTrigger className="text-left font-medium">
                      Is PaySurity PCI compliant?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Yes, PaySurity is PCI DSS Level 1 compliant, the highest level of certification available. This means
                      we maintain a secure network and systems that protect cardholder data according to industry standards.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-9">
                    <AccordionTrigger className="text-left font-medium">
                      How does PaySurity protect against fraud?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      PaySurity employs advanced machine learning algorithms and real-time fraud detection to protect your
                      business. Our system automatically flags suspicious transactions and provides tools to help you manage
                      potential fraud cases. Additional security features include 3D Secure authentication, address verification,
                      and CVV confirmation.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-10">
                    <AccordionTrigger className="text-left font-medium">
                      How does PaySurity handle disputes and chargebacks?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      When a customer initiates a dispute, you'll be notified immediately through your dashboard and via email.
                      PaySurity provides a streamlined process to submit evidence and respond to disputes. Our system generates
                      dispute response templates based on the reason code to help you provide the most relevant information.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Integration & Technical</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-11">
                    <AccordionTrigger className="text-left font-medium">
                      How do I integrate PaySurity with my website?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      PaySurity offers several integration options: pre-built checkout forms, customizable embedded forms,
                      and a full API for custom implementations. We also provide plugins for popular platforms like Shopify,
                      WooCommerce, Magento, and others. Detailed integration guides are available in our documentation.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-12">
                    <AccordionTrigger className="text-left font-medium">
                      Does PaySurity support recurring payments?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Yes, PaySurity provides comprehensive subscription billing features. You can create subscription plans
                      with different billing intervals, offer free trials, set up promotional pricing, and manage the entire
                      customer lifecycle from signup to cancellation.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-13">
                    <AccordionTrigger className="text-left font-medium">
                      What developer resources are available?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      PaySurity provides comprehensive developer resources including API documentation, SDKs for various
                      programming languages, code examples, webhook documentation, and a testing environment. Our developer
                      portal has everything you need to implement and test PaySurity in your application.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            
            <div className="mt-16 bg-blue-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-gray-600 mb-6">
                If you couldn't find the answer you're looking for, our support team is ready to help.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/support" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Contact Support
                </a>
                <a href="/documentation" className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}