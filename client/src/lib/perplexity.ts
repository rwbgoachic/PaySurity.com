/**
 * Utility function to call the Perplexity API
 * 
 * This file is responsible for handling interaction with the Perplexity API
 * and should be updated when the PERPLEXITY_API_KEY is provided
 */

const MODEL = "llama-3.1-sonar-small-128k-online";

/**
 * Ask a question to the Perplexity API
 * @param prompt The prompt to send to Perplexity
 * @returns Promise<string> The response text
 */
export async function askPerplexity(prompt: string): Promise<string> {
  // Normally, we'd call the Perplexity API directly, but we'll implement
  // a placeholder function until the API key is provided
  
  // Check if PERPLEXITY_API_KEY is available as an environment variable
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn("Missing Perplexity API key. Function will return a placeholder response.");
    // Return a placeholder indicating the API key is missing
    return "No Perplexity API key available. Please configure the PERPLEXITY_API_KEY environment variable.";
  }
  
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Be precise and concise. Respond with properly formatted JSON when requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
}