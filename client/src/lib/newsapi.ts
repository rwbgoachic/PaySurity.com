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
 * Fetches payment industry news from the News API
 * @returns Promise<NewsItem[]> - Array of news items for payment industry
 */
export async function fetchPaymentNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch('/api/news?category=payment');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news. Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching payment news:', error);
    throw error;
  }
}