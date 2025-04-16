/**
 * News API integration for blog content
 */
import fetch from 'node-fetch';

// NewsAPI response interfaces
interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

// Transformed article format for our application
export interface NewsItem {
  title: string;
  source: string;
  author: string;
  url: string;
  urlToImage?: string;
  date: string;
  summary: string;
  category: string;
}

/**
 * Categorize an article based on its title and description
 */
function categorizeArticle(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('fraud') || text.includes('security') || text.includes('hack') || text.includes('breach')) {
    return 'Security';
  } else if (text.includes('regulation') || text.includes('compliance') || text.includes('law') || text.includes('policy')) {
    return 'Regulation';
  } else if (text.includes('crypto') || text.includes('bitcoin') || text.includes('blockchain') || text.includes('nft')) {
    return 'Cryptocurrency';
  } else if (text.includes('pos') || text.includes('point of sale') || text.includes('terminal')) {
    return 'POS Systems';
  } else if (text.includes('trend') || text.includes('growth') || text.includes('market') || text.includes('industry')) {
    return 'Market Trends';
  } else {
    return 'General';
  }
}

/**
 * Format a date string into a more readable format
 */
function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Transform NewsAPI article into our NewsItem format
 */
function transformArticle(article: NewsAPIArticle): NewsItem {
  return {
    title: article.title,
    source: article.source.name,
    author: article.author || article.source.name,
    url: article.url,
    urlToImage: article.urlToImage,
    date: formatDate(article.publishedAt),
    summary: article.description,
    category: categorizeArticle(article.title, article.description)
  };
}

/**
 * Fetch payment industry news from NewsAPI
 */
export async function fetchPaymentNews(): Promise<NewsItem[]> {
  // Sample articles for fallback if News API key is not available
  const sampleArticles: NewsItem[] = [
    {
      title: "Visa Enhances Digital Payment Security with New AI Tools",
      source: "PYMNTS.com",
      author: "PYMNTS",
      url: "/blog/visa-security-tools",
      date: "April 16, 2025",
      summary: "Visa has introduced a new suite of AI-powered security tools aimed at reducing digital payment fraud. The technology can detect unusual patterns in real-time and adapt to evolving threats.",
      category: "Security"
    },
    {
      title: "The Future of Contactless Payments in a Post-Pandemic World",
      source: "PaymentSource",
      author: "PaymentSource Staff",
      url: "/blog/contactless-payments-future",
      date: "April 15, 2025",
      summary: "The COVID-19 pandemic accelerated the adoption of contactless payment methods. Now, as we move forward, these technologies are becoming the new standard for transactions across all industries.",
      category: "Market Trends"
    },
    {
      title: "How to Choose the Right POS System for Your Restaurant",
      source: "Restaurant Business",
      author: "Tech Editor",
      url: "/blog/choosing-restaurant-pos",
      date: "April 14, 2025",
      summary: "With so many options available, finding the perfect POS system for your restaurant can be overwhelming. This guide breaks down the essential features to look for and questions to ask before making your decision.",
      category: "POS Systems"
    },
    {
      title: "Reducing Fraud in E-commerce: Best Practices for Merchants",
      source: "Digital Transactions",
      author: "Security Expert",
      url: "/blog/ecommerce-fraud-prevention",
      date: "April 10, 2025",
      summary: "Online fraud costs businesses billions each year. Learn the latest strategies and tools to protect your e-commerce business from fraudulent transactions and chargebacks.",
      category: "Security"
    },
    {
      title: "The Rise of Buy Now, Pay Later: What Merchants Need to Know",
      source: "CNBC",
      author: "Finance Reporter",
      url: "/blog/buy-now-pay-later-guide",
      date: "April 5, 2025",
      summary: "Buy Now, Pay Later (BNPL) solutions are rapidly transforming the payment landscape. Discover how offering BNPL options can increase your average order value and conversion rates.",
      category: "Market Trends"
    }
  ];
  
  // Check if News API key is available
  const newsApiKey = process.env.NEWS_API_KEY;
  
  if (!newsApiKey) {
    console.log('NEWS_API_KEY not found in environment. Using sample data.');
    return sampleArticles;
  }
  
  try {
    // Make request to News API
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=payment+processing&apiKey=${newsApiKey}&pageSize=10&language=en&sortBy=publishedAt`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (!response.ok) {
      throw new Error(`News API responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as NewsAPIResponse;
    
    if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
      console.warn('News API returned no articles or error status:', data.status);
      return sampleArticles;
    }
    
    // Transform articles to our format
    return data.articles.map(transformArticle);
  } catch (error) {
    console.error('Error fetching from News API:', error);
    return sampleArticles;
  }
}