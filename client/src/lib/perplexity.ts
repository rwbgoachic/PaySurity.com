/**
 * Perplexity API service for getting AI-powered responses
 */

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityRequestOptions {
  model?: string;
  messages: PerplexityMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: 'day' | 'week' | 'month' | 'year' | 'none';
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface PerplexityCitation {
  url: string;
  text?: string;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: PerplexityCitation[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Fetch AI-powered response from Perplexity API
 */
export async function fetchAIResponse(options: PerplexityRequestOptions): Promise<PerplexityResponse> {
  // For server-side use
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!perplexityApiKey) {
    throw new Error('PERPLEXITY_API_KEY is not defined in the environment variables');
  }
  
  // Set defaults if not provided
  const defaultOptions: Partial<PerplexityRequestOptions> = {
    model: 'llama-3.1-sonar-small-128k-online',
    temperature: 0.2,
    top_p: 0.9,
    return_images: false,
    return_related_questions: false,
    search_recency_filter: 'month',
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1
  };
  
  const requestOptions: PerplexityRequestOptions = {
    ...defaultOptions,
    ...options
  };
  
  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestOptions),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw error;
  }
}

/**
 * Helper function to create a complete conversation with proper message order
 */
export function createPerplexityConversation(
  userQuery: string, 
  systemPrompt: string = 'Be precise and concise.',
  previousMessages: PerplexityMessage[] = []
): PerplexityMessage[] {
  // Start with system message
  const conversation: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add previous messages, ensuring alternating user/assistant pattern
  // and there are no consecutive user messages
  if (previousMessages.length > 0) {
    let lastRole: string | null = 'system';
    previousMessages.forEach(msg => {
      if (!(lastRole === 'user' && msg.role === 'user')) {
        conversation.push(msg);
        lastRole = msg.role;
      }
    });
    
    // If the last message was from the assistant, we can add the user query
    if (lastRole === 'assistant') {
      conversation.push({ role: 'user', content: userQuery });
    } 
    // If the last message was from the user, we can't add another user message
    // so we replace it with the current query
    else if (lastRole === 'user') {
      conversation[conversation.length - 1] = { role: 'user', content: userQuery };
    }
  } else {
    // If no previous messages, just add the user query
    conversation.push({ role: 'user', content: userQuery });
  }
  
  return conversation;
}