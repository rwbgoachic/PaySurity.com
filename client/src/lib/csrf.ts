// Simple CSRF token handling
export const setupCSRFInterceptor = async () => {
  try {
    // Fetch CSRF token from the server
    const response = await fetch('/api/csrf-token');
    if (response.ok) {
      const { csrfToken } = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem('csrfToken', csrfToken);
      
      console.log('CSRF token set up successfully');
    }
  } catch (error) {
    console.error('Failed to setup CSRF token:', error);
  }
};