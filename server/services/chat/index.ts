import { Router } from 'express';
import { z } from 'zod';

const chatRouter = Router();

// Schema for chat requests
const chatRequestSchema = z.object({
  question: z.string().min(1).max(500),
});

// Schema for feedback
const feedbackSchema = z.object({
  messageId: z.string().uuid(),
  feedback: z.enum(['positive', 'negative']),
});

// Temporary responses for demo purposes - in production, would use a real AI service
const knowledgeBase = [
  { keyword: 'payment', response: 'PaySurity offers secure payment processing solutions with competitive rates, real-time fraud protection, and seamless integration with your existing systems.' },
  { keyword: 'digital wallet', response: 'Our digital wallet solution allows customers to securely store payment information, make quick payments, and manage funds across multiple currencies.' },
  { keyword: 'pos', response: 'BistroBeast and GrocerEase are our specialized POS systems designed for restaurants and grocery stores, with features like inventory management, order tracking, and sales analytics.' },
  { keyword: 'legal', response: 'PaySurity\'s legal billing solution helps law firms manage client billing, trust accounts (IOLTA), and practice management in a single integrated platform.' },
  { keyword: 'pricing', response: 'Our pricing is transparent with no hidden fees. We offer various plans for businesses of all sizes, from startups to enterprise solutions.' },
  { keyword: 'security', response: 'Security is our top priority. We use industry-leading encryption, tokenization, and fraud detection to keep your financial data safe.' },
];

// Simple AI response generator
function generateResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  // Check if the question contains any of our keywords
  for (const entry of knowledgeBase) {
    if (lowerQuestion.includes(entry.keyword)) {
      return entry.response;
    }
  }
  
  // Default response
  return 'Thank you for your question. Our team is constantly improving our support system. For specific information about PaySurity services, please ask about our payment processing, digital wallet, POS systems, legal billing solutions, or security measures.';
}

// Chat endpoint
chatRouter.post('/', (req, res) => {
  try {
    const validatedData = chatRequestSchema.parse(req.body);
    
    // Generate a response based on the question
    const answer = generateResponse(validatedData.question);
    
    // In a real implementation, we'd use a service like OpenAI, Anthropic, etc.
    // For now we're using a simple rule-based approach
    
    res.json({ answer });
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Feedback endpoint
chatRouter.post('/feedback', (req, res) => {
  try {
    const validatedData = feedbackSchema.parse(req.body);
    
    // Here we would store the feedback in a database
    console.log('Received feedback:', validatedData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid feedback data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to process feedback' });
  }
});

export default chatRouter;