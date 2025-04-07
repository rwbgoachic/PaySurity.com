import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import LandingPage from "@/pages/landing-page";
import ProjectDependenciesPage from "@/pages/project-dependencies-page";
import PricingPage from "@/pages/pricing-page";
import IndustrySolutionsPage from "@/pages/industry-solutions-page";
import DigitalWalletPage from "@/pages/digital-wallet-page";
import PosSystemsPage from "@/pages/pos-systems-page";
import WalletPage from "@/pages/wallet";
import PosPage from "@/pages/pos";
import MerchantPage from "@/pages/merchant";
import { ProtectedRoute } from "./lib/protected-route";
import EmployerDashboard from "./pages/employer/dashboard";
import EmployerTransactions from "./pages/employer/transactions";
import EmployerUsers from "./pages/employer/users";
import EmployerBanking from "./pages/employer/banking";
import EmployerPayroll from "./pages/employer/payroll";
import EmployerSettings from "./pages/employer/settings";
import EmployerExpenseReports from "./pages/employer/expense-reports";
import EmployerExpenseReportDetail from "./pages/employer/expense-report-detail";
import HubSpotSettings from "./pages/admin/hubspot-settings";
import AnalyticsDashboard from "./pages/admin/analytics-dashboard";
import EmployeeDashboard from "./pages/employee/dashboard";
import EmployeeTransactions from "./pages/employee/transactions";
import EmployeeBanking from "./pages/employee/banking";
import EmployeeFundRequests from "./pages/employee/fund-requests";
import EmployeeSettings from "./pages/employee/settings";
import EmployeeExpenseReports from "./pages/employee/expense-reports";
import EmployeeExpenseReportDetail from "./pages/employee/expense-report-detail";
import MerchantDashboard from "./pages/merchant/dashboard";
import MerchantOnboarding from "./pages/merchant/onboarding";
import MerchantVerification from "./pages/merchant/verification";
import PaymentGateways from "./pages/merchant/payment-gateways/index";
import NewPaymentGateway from "./pages/merchant/payment-gateways/new";
import ProcessPaymentPage from "./pages/merchant/payment-gateways/process-payment";
import LoyaltyPrograms from "./pages/merchant/loyalty-programs/index";
import BistroBeastPOS from "./pages/merchant/pos/bistro/index";
import BistroBeastInventory from "./pages/merchant/pos/bistro/inventory";
import BistroBeastStaff from "./pages/merchant/pos/bistro/staff";
import BistroBeastTransactions from "./pages/merchant/pos/bistro/transactions";
import ApplicationsManagement from "./pages/merchant/applications-management";
import ApplicationDetail from "./pages/merchant/application-detail";
import AffiliateDashboard from "./pages/merchant/affiliate-dashboard";
import PaymentSettings from "./pages/merchant/payment-settings";
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
import { WebSocketHandler } from "./components/merchant/notifications/websocket-handler";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      {/* Main marketing site routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/industry-solutions" component={IndustrySolutionsPage} />
      <Route path="/digital-wallet" component={DigitalWalletPage} />
      <Route path="/pos-systems" component={PosSystemsPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Blog routes */}
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/industry/restaurant" component={RestaurantBlogPage} />
      <Route path="/blog/industry/healthcare" component={HealthcareBlogPage} />
      <Route path="/blog/industry/legal" component={LegalBlogPage} />
      <Route path="/blog/industry/retail" component={RetailBlogPage} />
      <Route path="/blog/payment-industry-news" component={PaymentIndustryNewsPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      
      {/* Legacy dashboard (to be migrated) */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      
      {/* Domain-separated routes */}
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/wallet/wallets" component={WalletPage} />
      <ProtectedRoute path="/wallet/transactions" component={WalletPage} />
      <ProtectedRoute path="/wallet/savings" component={WalletPage} />
      <ProtectedRoute path="/wallet/family" component={WalletPage} />
      <ProtectedRoute path="/wallet/settings" component={WalletPage} />
      
      <ProtectedRoute path="/pos" component={PosPage} />
      <ProtectedRoute path="/pos/register" component={PosPage} />
      <ProtectedRoute path="/pos/orders" component={PosPage} />
      <ProtectedRoute path="/pos/inventory" component={PosPage} />
      <ProtectedRoute path="/pos/staff" component={PosPage} />
      <ProtectedRoute path="/pos/settings" component={PosPage} />
      
      <ProtectedRoute path="/merchant" component={MerchantPage} />
      <ProtectedRoute path="/merchant/applications" component={MerchantPage} />
      <ProtectedRoute path="/merchant/payment-gateways" component={MerchantPage} />
      <ProtectedRoute path="/merchant/verification" component={MerchantPage} />
      <ProtectedRoute path="/merchant/affiliates" component={MerchantPage} />
      <ProtectedRoute path="/merchant/settings" component={MerchantPage} />
      
      {/* Legacy routes (to be migrated to new domain structure) */}
      <ProtectedRoute path="/employer/dashboard" component={EmployerDashboard} />
      <ProtectedRoute path="/employer/transactions" component={EmployerTransactions} />
      <ProtectedRoute path="/employer/users" component={EmployerUsers} />
      <ProtectedRoute path="/employer/banking" component={EmployerBanking} />
      <ProtectedRoute path="/employer/payroll" component={EmployerPayroll} />
      <ProtectedRoute path="/employer/settings" component={EmployerSettings} />
      <ProtectedRoute path="/employer/expense-reports" component={EmployerExpenseReports} />
      <ProtectedRoute path="/employer/expense-reports/:id" component={EmployerExpenseReportDetail} />
      <ProtectedRoute path="/employee/dashboard" component={EmployeeDashboard} />
      <ProtectedRoute path="/employee/transactions" component={EmployeeTransactions} />
      <ProtectedRoute path="/employee/banking" component={EmployeeBanking} />
      <ProtectedRoute path="/employee/fund-requests" component={EmployeeFundRequests} />
      <ProtectedRoute path="/employee/settings" component={EmployeeSettings} />
      <ProtectedRoute path="/employee/expense-reports" component={EmployeeExpenseReports} />
      <ProtectedRoute path="/employee/expense-reports/:id" component={EmployeeExpenseReportDetail} />
      <ProtectedRoute path="/merchant/dashboard" component={MerchantDashboard} />
      <ProtectedRoute path="/merchant/onboarding" component={MerchantOnboarding} />
      <ProtectedRoute path="/merchant/verification" component={MerchantVerification} />
      <ProtectedRoute path="/merchant/payment-gateways" component={PaymentGateways} />
      <ProtectedRoute path="/merchant/payment-gateways/new" component={NewPaymentGateway} />
      <ProtectedRoute path="/merchant/payment-gateways/:id/process-payment" component={ProcessPaymentPage} />
      <ProtectedRoute path="/merchant/payment-settings" component={PaymentSettings} />
      <ProtectedRoute path="/merchant/loyalty-programs" component={LoyaltyPrograms} />
      <ProtectedRoute path="/merchant/affiliate-dashboard" component={AffiliateDashboard} />
      <ProtectedRoute path="/merchant/pos/bistro" component={BistroBeastPOS} />
      <ProtectedRoute path="/merchant/pos/bistro/inventory" component={BistroBeastInventory} />
      <ProtectedRoute path="/merchant/pos/bistro/staff" component={BistroBeastStaff} />
      <ProtectedRoute path="/merchant/pos/bistro/transactions" component={BistroBeastTransactions} />
      <ProtectedRoute path="/merchant/applications-management" component={ApplicationsManagement} />
      <ProtectedRoute path="/merchant/applications/:id" component={ApplicationDetail} />
      <ProtectedRoute path="/admin/hubspot-settings" component={HubSpotSettings} />
      <ProtectedRoute path="/admin/analytics" component={AnalyticsDashboard} />
      <ProtectedRoute path="/admin/project-dependencies" component={ProjectDependenciesPage} />
      
      {/* Catch-all route */}
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
        title="PaySurity | Comprehensive Digital Payment Solutions"
        description="PaySurity offers a comprehensive digital payment ecosystem with merchant services, POS solutions, and specialized payment processing for businesses of all sizes."
        canonicalUrl="/"
        keywords="payment processing, merchant services, POS systems, digital wallet, payment gateway, BistroBeast, restaurant POS, retail payment solutions, legal payment solutions, healthcare payment solutions"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1470&auto=format&fit=crop"
        twitterCard="summary_large_image"
      />
      <OrganizationSchema />
      <Router />
      {/* WebSocketHandler for real-time notifications */}
      <WebSocketHandler />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
