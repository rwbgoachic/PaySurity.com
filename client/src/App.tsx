import React from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ChatWidget from "./components/chat/ChatWidget";

// DIRECT APPROACH - Using our simplified dark landing page
import DirectDarkLanding from "./pages/direct-dark-landing";

// Fallback to existing pages for now
import ProductsPage from "@/pages/products-page";
import PricingPage from "@/pages/pricing-page";
import IndustrySolutionsPage from "@/pages/industry-solutions-page";
import DigitalWalletPage from "@/pages/digital-wallet-page";
import PosSystemsPage from "@/pages/pos-systems-page";
import Dashboard from "@/pages/dashboard";

// Protected Routes
import { ProtectedRoute } from "./lib/protected-route";

// Utility
import { setupCSRFInterceptor } from "./lib/csrf";

function Router() {
  // Set up CSRF token fetch on app load
  React.useEffect(() => {
    setupCSRFInterceptor();
  }, []);

  // Force-log to browser console for debugging
  React.useEffect(() => {
    console.log('🔵 APP LOADED: Using dark theme landing page');

    // Log any theme data
    const theme = document.documentElement.getAttribute('data-theme');
    console.log('Theme from document:', theme);
  }, []);

  return (
    <Switch>
      {/* Main public routes - using our DIRECT dark-themed landing page */}
      <Route path="/" component={DirectDarkLanding} />
      
      {/* Fall back to existing pages for now */}
      <Route path="/products" component={ProductsPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/industry-solutions" component={IndustrySolutionsPage} />
      <Route path="/digital-wallet" component={DigitalWalletPage} />
      <Route path="/pos-systems" component={PosSystemsPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected dashboard routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      
      {/* Catch-all route */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
      <ChatWidget />
    </AuthProvider>
  );
}