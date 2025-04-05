import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from 'react-helmet-async';
import { setupCSRFInterceptor } from "./lib/csrf";
import { initAnalytics } from "./lib/analytics";

// Setup CSRF protection by intercepting fetch requests
setupCSRFInterceptor();

// Initialize analytics tracking system
initAnalytics();

// Prefetch CSRF token on app load
queryClient.prefetchQuery({
  queryKey: ['csrfToken'],
  queryFn: async () => {
    try {
      const response = await fetch('/api/csrf-token');
      if (!response.ok) return undefined;
      const data = await response.json();
      return data.csrfToken;
    } catch (e) {
      console.error("Failed to prefetch CSRF token:", e);
      return undefined;
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </QueryClientProvider>
);
