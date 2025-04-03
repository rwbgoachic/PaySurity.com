/**
 * Utility function to call NewsAPI.org for payment industry news
 * 
 * This file is responsible for handling interaction with the NewsAPI.org API
 */

// Categories we're interested in for payment industry news
const PAYMENT_KEYWORDS = [
  'payment processing',
  'digital payments',
  'fintech',
  'payment industry',
  'credit card processing',
  'payment gateway',
  'merchant services',
  'POS systems',
  'mobile payments',
  'contactless payments',
  'stripe',
  'square',
  'paypal',
  'apple pay',
  'google pay',
  'visa',
  'mastercard',
  'payment regulations'
];

// Classify news into our custom categories
export type NewsCategory = 'Innovation' | 'Regulation' | 'Market Trends' | 'Security';

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
  summary: string;
  category: NewsCategory;
  urlToImage?: string;
}

interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

/**
 * Determine the category of a news article based on its content
 */
function categorizeNews(article: NewsApiArticle): NewsCategory {
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  
  // Define keywords for each category
  const innovationKeywords = ['launch', 'new', 'introduce', 'innovation', 'technology', 'digital', 'platform', 'app', 'solution', 'modern', 'api', 'tech', 'introduce', 'release'];
  
  const regulationKeywords = ['regulation', 'compliance', 'law', 'legal', 'govern', 'authority', 'rule', 'policy', 'standard', 'legislation', 'guideline', 'restrict', 'enforce', 'court', 'federal', 'tax'];
  
  const marketTrendsKeywords = ['market', 'growth', 'expand', 'trend', 'report', 'increase', 'decrease', 'statistic', 'adoption', 'consumer', 'user', 'customer', 'volume', 'transaction', 'study', 'forecast', 'research', 'analyst', 'industry'];
  
  const securityKeywords = ['security', 'fraud', 'hack', 'breach', 'risk', 'threat', 'protect', 'safety', 'attack', 'vulnerability', 'secure', 'authentication', 'encrypt', 'cybersecurity', 'theft', 'scam'];
  
  // Count keyword matches for each category
  const innovationMatches = innovationKeywords.filter(keyword => text.includes(keyword)).length;
  const regulationMatches = regulationKeywords.filter(keyword => text.includes(keyword)).length;
  const marketMatches = marketTrendsKeywords.filter(keyword => text.includes(keyword)).length;
  const securityMatches = securityKeywords.filter(keyword => text.includes(keyword)).length;
  
  // Find the category with the most matches
  const maxMatches = Math.max(innovationMatches, regulationMatches, marketMatches, securityMatches);
  
  if (maxMatches === 0) {
    // Default category if no matches
    return 'Market Trends';
  }
  
  if (maxMatches === innovationMatches) return 'Innovation';
  if (maxMatches === regulationMatches) return 'Regulation';
  if (maxMatches === securityMatches) return 'Security';
  return 'Market Trends';
}

/**
 * Format date from ISO to Month Day, Year
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Fetch payment industry news from NewsAPI.org
 */
export async function fetchPaymentNews(): Promise<NewsItem[]> {
  try {    
    // Use our own server endpoint which handles the API key securely
    const response = await fetch('/api/news/payment-industry');
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: NewsApiResponse = await response.json();
    
    if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
      console.warn("No articles found or invalid response format");
      return [];
    }
    
    // Transform NewsAPI articles to our format
    const newsItems: NewsItem[] = data.articles
      .filter(article => article.description && article.title)
      .slice(0, 8) // Limit to 8 articles
      .map(article => ({
        title: article.title,
        source: article.source.name,
        url: article.url,
        date: formatDate(article.publishedAt),
        summary: article.description,
        category: categorizeNews(article),
        urlToImage: article.urlToImage || undefined
      }));
    
    return newsItems;
    
  } catch (error) {
    console.error("Error fetching news from NewsAPI:", error);
    return [];
  }
}