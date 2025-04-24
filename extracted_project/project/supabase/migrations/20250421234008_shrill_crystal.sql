/*
  # Add initial FAQ data

  1. Insert FAQ entries
    - Common questions about services
    - Onboarding process
    - Billing and support
*/

-- Delete any existing FAQ data first to avoid conflicts
DELETE FROM faqs;

-- Insert initial FAQs with ON CONFLICT handling
INSERT INTO faqs (category, question, answer) VALUES
('General', 'What is PaySurity?', 'PaySurity is a comprehensive business management platform offering payment processing, POS systems, and payroll solutions tailored for different industries.'),
('Onboarding', 'How do I get started with PaySurity?', 'Sign up on our website, verify your business details, and our team will guide you through the setup process. Most businesses are up and running within 24-48 hours.'),
('Billing', 'What are your pricing plans?', 'We offer flexible pricing based on your business needs. Our standard plan starts at $99/month plus transaction fees. Contact sales for custom enterprise pricing.'),
('Security', 'Is PaySurity secure?', 'Yes, PaySurity uses bank-level encryption and is PCI compliant. We employ multiple security measures to protect your data and transactions.'),
('Support', 'How can I contact support?', 'You can reach our support team 24/7 via email at support@paysurity.com, phone at 1-800-123-4567, or through the chat widget on our website.'),
('Restaurant POS', 'What features does the restaurant POS include?', 'Our restaurant POS includes table management, order tracking, inventory control, staff scheduling, and integrated payment processing.'),
('Grocery POS', 'Can I manage multiple store locations?', 'Yes, our grocery store solution supports multi-location management with centralized inventory, pricing, and reporting.'),
('Payroll', 'How often are payroll taxes filed?', 'We handle all payroll tax filings according to your local requirements. This typically includes quarterly and annual filings, all managed automatically.'),
('Integration', 'Can I integrate PaySurity with my accounting software?', 'Yes, PaySurity integrates with popular accounting software like QuickBooks and Xero, ensuring seamless financial management.'),
('Data', 'How can I export my business data?', 'You can export data in various formats (CSV, Excel) from your dashboard. Reports can be automated and scheduled for regular delivery.')
ON CONFLICT (id) DO UPDATE 
SET 
  category = EXCLUDED.category,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  updated_at = now();