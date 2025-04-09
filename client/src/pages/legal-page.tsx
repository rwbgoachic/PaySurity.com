import { MetaTags } from "@/components/seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LegalPage() {
  return (
    <>
      <MetaTags
        title="Legal Information | PaySurity"
        description="Legal information including terms of service, privacy policy, compliance information, and security practices for PaySurity payment solutions."
        canonicalUrl="/legal"
      />
      
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Legal Information
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              View our terms, policies, and compliance information.
            </p>
            
            <Tabs defaultValue="terms" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="terms" className="prose prose-blue max-w-none">
                <h2>Terms of Service</h2>
                <p>Last updated: April 1, 2025</p>
                
                <div className="bg-gray-50 p-6 rounded-lg my-6">
                  <p className="text-sm text-gray-600">
                    Please read these Terms of Service carefully before using PaySurity's payment processing services. 
                    By using our services, you agree to be bound by these terms.
                  </p>
                </div>
                
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By accessing or using PaySurity's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
                </p>
                
                <h3>2. Use of Services</h3>
                <p>
                  PaySurity provides payment processing services that allow merchants to accept payments from their customers. By using our services, you agree to:
                </p>
                <ul>
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Use our services only for lawful purposes and in accordance with these Terms</li>
                </ul>
                
                <h3>3. Service Fees</h3>
                <p>
                  You agree to pay all applicable fees for the use of PaySurity services as outlined in our current pricing structure. We reserve the right to change our fees with 30 days' notice.
                </p>
                
                <h3>4. Account Termination</h3>
                <p>
                  We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms of Service.
                </p>
                
                <h3>5. Limitation of Liability</h3>
                <p>
                  In no event shall PaySurity, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.
                </p>
                
                <h3>6. Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                </p>
                
                <h3>7. Changes to Terms</h3>
                <p>
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                </p>
                
                <p className="text-sm text-gray-600 mt-12">
                  By using PaySurity services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </TabsContent>
              
              <TabsContent value="privacy" className="prose prose-blue max-w-none">
                <h2>Privacy Policy</h2>
                <p>Last updated: April 1, 2025</p>
                
                <div className="bg-gray-50 p-6 rounded-lg my-6">
                  <p className="text-sm text-gray-600">
                    This Privacy Policy describes how PaySurity collects, uses, and discloses your personal information 
                    when you use our services. We take your privacy seriously and are committed to protecting your personal information.
                  </p>
                </div>
                
                <h3>1. Information We Collect</h3>
                <p>
                  We collect several types of information from and about users of our services, including:
                </p>
                <ul>
                  <li>Personal identifiers (name, email address, phone number, etc.)</li>
                  <li>Business information (business name, tax ID, business address, etc.)</li>
                  <li>Financial information (bank account details, payment transaction history, etc.)</li>
                  <li>Device and usage information (IP address, browser type, operating system, etc.)</li>
                </ul>
                
                <h3>2. How We Use Your Information</h3>
                <p>
                  We use the information we collect about you for various purposes, including:
                </p>
                <ul>
                  <li>Providing and maintaining our services</li>
                  <li>Processing transactions and sending transaction receipts</li>
                  <li>Preventing fraud and enhancing security</li>
                  <li>Communicating with you about account updates, new features, etc.</li>
                  <li>Complying with legal obligations</li>
                </ul>
                
                <h3>3. Information Sharing and Disclosure</h3>
                <p>
                  We may share your information with:
                </p>
                <ul>
                  <li>Payment processors and financial institutions to complete transactions</li>
                  <li>Service providers who help us operate our business</li>
                  <li>Legal authorities when required by law</li>
                  <li>Other parties with your consent</li>
                </ul>
                
                <h3>4. Data Security</h3>
                <p>
                  We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
                
                <h3>5. Your Rights</h3>
                <p>
                  Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. To exercise these rights, please contact us.
                </p>
                
                <h3>6. Changes to this Privacy Policy</h3>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                
                <p className="text-sm text-gray-600 mt-12">
                  By using PaySurity services, you consent to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </TabsContent>
              
              <TabsContent value="compliance" className="prose prose-blue max-w-none">
                <h2>Compliance</h2>
                <p>Last updated: April 1, 2025</p>
                
                <div className="bg-gray-50 p-6 rounded-lg my-6">
                  <p className="text-sm text-gray-600">
                    PaySurity is committed to maintaining compliance with all applicable laws, regulations, and industry standards 
                    related to payment processing and data security.
                  </p>
                </div>
                
                <h3>PCI DSS Compliance</h3>
                <p>
                  PaySurity is PCI DSS Level 1 compliant, the highest level of certification available in the payments industry. This means we adhere to strict security standards that include:
                </p>
                <ul>
                  <li>Maintaining a secure network</li>
                  <li>Protecting cardholder data</li>
                  <li>Maintaining a vulnerability management program</li>
                  <li>Implementing strong access control measures</li>
                  <li>Regularly monitoring and testing networks</li>
                  <li>Maintaining an information security policy</li>
                </ul>
                
                <h3>GDPR Compliance</h3>
                <p>
                  For our users in the European Economic Area (EEA), PaySurity complies with the General Data Protection Regulation (GDPR). We process personal data lawfully, transparently, and only for specific purposes. We also provide mechanisms for data subjects to exercise their rights under the GDPR.
                </p>
                
                <h3>CCPA Compliance</h3>
                <p>
                  For our users in California, PaySurity complies with the California Consumer Privacy Act (CCPA). We provide California residents with specific rights regarding their personal information, including the right to know, the right to delete, and the right to opt-out of the sale of personal information.
                </p>
                
                <h3>AML and KYC Compliance</h3>
                <p>
                  PaySurity implements Anti-Money Laundering (AML) and Know Your Customer (KYC) procedures to prevent financial crimes. We verify the identity of our merchants and monitor transactions for suspicious activities in accordance with regulatory requirements.
                </p>
                
                <h3>Accessibility Compliance</h3>
                <p>
                  PaySurity strives to ensure our services are accessible to all users, including those with disabilities. We work to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.
                </p>
                
                <p className="text-sm text-gray-600 mt-12">
                  If you have any questions about our compliance practices, please contact our compliance team at compliance@paysurity.com.
                </p>
              </TabsContent>
              
              <TabsContent value="security" className="prose prose-blue max-w-none">
                <h2>Security Practices</h2>
                <p>Last updated: April 1, 2025</p>
                
                <div className="bg-gray-50 p-6 rounded-lg my-6">
                  <p className="text-sm text-gray-600">
                    At PaySurity, security is at the core of everything we do. We employ multiple layers of security 
                    measures to protect your data and transactions.
                  </p>
                </div>
                
                <h3>Data Encryption</h3>
                <p>
                  We use industry-standard encryption technologies to protect your data:
                </p>
                <ul>
                  <li>All data is encrypted in transit using TLS 1.3</li>
                  <li>Sensitive data is encrypted at rest using AES-256 encryption</li>
                  <li>Payment card data is tokenized to minimize exposure</li>
                </ul>
                
                <h3>Fraud Prevention</h3>
                <p>
                  Our comprehensive fraud detection system includes:
                </p>
                <ul>
                  <li>Machine learning algorithms to identify suspicious transactions</li>
                  <li>Real-time monitoring and automated alerts</li>
                  <li>Address Verification Service (AVS) and CVV verification</li>
                  <li>3D Secure authentication for online transactions</li>
                </ul>
                
                <h3>Physical Security</h3>
                <p>
                  Our infrastructure is hosted in secure data centers that feature:
                </p>
                <ul>
                  <li>24/7 monitoring and surveillance</li>
                  <li>Biometric access controls</li>
                  <li>Redundant power and network connections</li>
                  <li>Fire detection and suppression systems</li>
                </ul>
                
                <h3>Security Audits and Testing</h3>
                <p>
                  We regularly evaluate the effectiveness of our security measures through:
                </p>
                <ul>
                  <li>Penetration testing by third-party security experts</li>
                  <li>Vulnerability scanning and patching</li>
                  <li>Security code reviews</li>
                  <li>Annual compliance audits</li>
                </ul>
                
                <h3>Incident Response</h3>
                <p>
                  We have established procedures to respond to security incidents, including:
                </p>
                <ul>
                  <li>A dedicated security incident response team</li>
                  <li>Clearly defined incident classification and escalation protocols</li>
                  <li>Regular drills and simulations to test response effectiveness</li>
                  <li>Transparent communication with affected parties when incidents occur</li>
                </ul>
                
                <h3>Employee Security</h3>
                <p>
                  Our employee security measures include:
                </p>
                <ul>
                  <li>Background checks for all employees</li>
                  <li>Regular security awareness training</li>
                  <li>Role-based access controls</li>
                  <li>Multi-factor authentication for all internal systems</li>
                </ul>
                
                <p className="text-sm text-gray-600 mt-12">
                  We continuously update our security practices to address emerging threats. If you have questions or concerns about our security practices, please contact security@paysurity.com.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}