import { queryClient } from "./queryClient";

// Function to fetch the CSRF token
export async function fetchCSRFToken(): Promise<string | undefined> {
  try {
    const response = await fetch('/api/csrf-token');
    if (!response.ok) {
      console.error("Failed to fetch CSRF token:", response.statusText);
      return undefined;
    }
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return undefined;
  }
}

// Cache the CSRF token for reuse
export async function getCSRFToken(): Promise<string | undefined> {
  // Try to get token from cache first
  let token = queryClient.getQueryData<string>(['csrfToken']);
  
  // If token is not in cache, fetch it
  if (!token) {
    token = await fetchCSRFToken();
    if (token) {
      // Store token in cache
      queryClient.setQueryData(['csrfToken'], token);
    }
  }
  
  return token;
}

// Function to include CSRF token in all API requests
export function setupCSRFInterceptor() {
  // Save original fetch function
  const originalFetch = window.fetch;
  
  // Override fetch to include CSRF token in non-GET requests
  window.fetch = async (input, init) => {
    const method = init?.method?.toUpperCase() || 'GET';
    
    // Only add CSRF token for non-GET requests to our API
    if (method !== 'GET' && typeof input === 'string' && input.startsWith('/api/')) {
      // Get CSRF token
      const token = await getCSRFToken();
      
      // If token exists, add it to headers
      if (token) {
        // Initialize headers if not provided
        init = init || {};
        init.headers = init.headers || {};
        
        // Add CSRF token to headers
        init.headers = {
          ...init.headers,
          'CSRF-Token': token,
          'X-CSRF-Token': token // Include both formats for compatibility
        };
      }
    }
    
    // Call original fetch with possibly modified init
    return originalFetch(input, init);
  };
}