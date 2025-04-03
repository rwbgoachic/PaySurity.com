import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import LandingPage from "@/pages/landing-page";
import { ProtectedRoute } from "./lib/protected-route";
import EmployerDashboard from "./pages/employer/dashboard";
import EmployerTransactions from "./pages/employer/transactions";
import EmployerUsers from "./pages/employer/users";
import EmployerBanking from "./pages/employer/banking";
import EmployerPayroll from "./pages/employer/payroll";
import EmployerSettings from "./pages/employer/settings";
import EmployeeDashboard from "./pages/employee/dashboard";
import EmployeeTransactions from "./pages/employee/transactions";
import EmployeeBanking from "./pages/employee/banking";
import EmployeeFundRequests from "./pages/employee/fund-requests";
import EmployeeSettings from "./pages/employee/settings";
import MerchantDashboard from "./pages/merchant/dashboard";
import MerchantOnboarding from "./pages/merchant/onboarding";
import MerchantVerification from "./pages/merchant/verification";
import PaymentGateways from "./pages/merchant/payment-gateways/index";
import NewPaymentGateway from "./pages/merchant/payment-gateways/new";
import LoyaltyPrograms from "./pages/merchant/loyalty-programs/index";
import BistroBeastPOS from "./pages/merchant/pos/bistro/index";
import BistroBeastInventory from "./pages/merchant/pos/bistro/inventory";
import BistroBeastStaff from "./pages/merchant/pos/bistro/staff";
import BistroBeastTransactions from "./pages/merchant/pos/bistro/transactions";
import BlogPage from "./pages/blog";
import BlogPostPage from "./pages/blog/[slug]";
import RestaurantBlogPage from "./pages/blog/industry/restaurant";
import HealthcareBlogPage from "./pages/blog/industry/healthcare";
import LegalBlogPage from "./pages/blog/industry/legal";
import RetailBlogPage from "./pages/blog/industry/retail";
import PaymentIndustryNewsPage from "./pages/blog/payment-industry-news";
import { AuthProvider } from "./hooks/use-auth";
import { MetaTags, OrganizationSchema } from "./components/seo";
import { setupCSRFInterceptor, getCSRFToken } from "./lib/csrf";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/employer/dashboard" component={EmployerDashboard} />
      <ProtectedRoute path="/employer/transactions" component={EmployerTransactions} />
      <ProtectedRoute path="/employer/users" component={EmployerUsers} />
      <ProtectedRoute path="/employer/banking" component={EmployerBanking} />
      <ProtectedRoute path="/employer/payroll" component={EmployerPayroll} />
      <ProtectedRoute path="/employer/settings" component={EmployerSettings} />
      <ProtectedRoute path="/employee/dashboard" component={EmployeeDashboard} />
      <ProtectedRoute path="/employee/transactions" component={EmployeeTransactions} />
      <ProtectedRoute path="/employee/banking" component={EmployeeBanking} />
      <ProtectedRoute path="/employee/fund-requests" component={EmployeeFundRequests} />
      <ProtectedRoute path="/employee/settings" component={EmployeeSettings} />
      <ProtectedRoute path="/merchant/dashboard" component={MerchantDashboard} />
      <ProtectedRoute path="/merchant/onboarding" component={MerchantOnboarding} />
      <ProtectedRoute path="/merchant/verification" component={MerchantVerification} />
      <ProtectedRoute path="/merchant/payment-gateways" component={PaymentGateways} />
      <ProtectedRoute path="/merchant/payment-gateways/new" component={NewPaymentGateway} />
      <ProtectedRoute path="/merchant/loyalty-programs" component={LoyaltyPrograms} />
      <ProtectedRoute path="/merchant/pos/bistro" component={BistroBeastPOS} />
      <ProtectedRoute path="/merchant/pos/bistro/inventory" component={BistroBeastInventory} />
      <ProtectedRoute path="/merchant/pos/bistro/staff" component={BistroBeastStaff} />
      <ProtectedRoute path="/merchant/pos/bistro/transactions" component={BistroBeastTransactions} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/industry/restaurant" component={RestaurantBlogPage} />
      <Route path="/blog/industry/healthcare" component={HealthcareBlogPage} />
      <Route path="/blog/industry/legal" component={LegalBlogPage} />
      <Route path="/blog/industry/retail" component={RetailBlogPage} />
      <Route path="/blog/payment-industry-news" component={PaymentIndustryNewsPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize CSRF protection and fetch token on app load
  useEffect(() => {
    // Setup fetch interceptor for CSRF token
    setupCSRFInterceptor();
    
    // Pre-fetch CSRF token to have it ready for use
    const prefetchCSRFToken = async () => {
      try {
        await getCSRFToken();
        console.log("CSRF protection initialized");
      } catch (error) {
        console.error("Failed to initialize CSRF protection:", error);
      }
    };
    
    prefetchCSRFToken();
  }, []);
  
  return (
    <AuthProvider>
      {/* Default SEO tags that will be overridden by page-specific ones */}
      <MetaTags 
        title="Paysurity | Comprehensive Digital Payment Solutions"
        description="Paysurity offers a comprehensive digital payment ecosystem with merchant services, POS solutions, and specialized payment processing for businesses of all sizes."
        canonicalUrl="/"
        keywords="payment processing, merchant services, POS systems, digital wallet, payment gateway, BistroBeast, restaurant POS, retail payment solutions, legal payment solutions, healthcare payment solutions"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1470&auto=format&fit=crop"
        twitterCard="summary_large_image"
      />
      <OrganizationSchema />
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
