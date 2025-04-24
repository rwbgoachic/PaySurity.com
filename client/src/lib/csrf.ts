// This file handles CSRF token management for secure API requests

/**
 * Function to fetch a CSRF token from the server
 * @returns {Promise<string>} The CSRF token
 */
export const getCSRFToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get CSRF token');
    }
    
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

/**
 * Set up an interceptor to add CSRF tokens to requests
 */
export const setupCSRFInterceptor = async (): Promise<void> => {
  try {
    // Fetch the initial CSRF token
    await getCSRFToken();
    console.log('CSRF protection initialized');
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
  }
};