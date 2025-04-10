import React from "react";
import RouteDebugComponent from "./lib/RouteDebugComponent";
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
import ProductsPage from "@/pages/products-page";
import PaymentPage from "@/pages/payment-page";
import PaymentSuccessPage from "@/pages/payment-success-page";
import PaymentsPage from "@/pages/payments-page";
import DocumentationPage from "@/pages/documentation";
import FAQPage from "@/pages/faq";
import SupportPage from "@/pages/support-page";
import AboutPage from "@/pages/about-page";
import CareersPage from "@/pages/careers-page";
import ContactPage from "@/pages/contact-page";
import LegalPage from "@/pages/legal-page";
import Partners from "@/pages/partners";
import Affiliates from "@/pages/affiliates";
import PartnerPortal from "@/pages/partner-portal";
import AffiliatePortal from "@/pages/affiliate-portal";
import IsoDashboard from "@/pages/iso-dashboard";
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
import TestRecommendationEngine from "./pages/admin/test-recommendation-engine";
import ProjectDocumentation from "./pages/admin/project-documentation";
import EmployeeDashboard from "./pages/employee/dashboard";
import EmployeeTransactions from "./pages/employee/transactions";
import EmployeeBanking from "./pages/employee/banking";
import EmployeeFundRequests from "./pages/employee/fund-requests";
import EmployeeSettings from "./pages/employee/settings";
import EmployeeExpenseReports from "./pages/employee/expense-reports";
import EmployeeExpenseReportDetail from "./pages/employee/expense-report-detail";
import ParentDashboard from "./pages/parent/dashboard";
import ChildDashboard from "./pages/child/dashboard";
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
import BistroBeastKitchen from "./pages/merchant/pos/bistro/kitchen";
import RetailPOSSystem from "./pages/merchant/pos/retail/index";
import RetailInventoryPage from "./pages/merchant/pos/retail/inventory";
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
import SuperAdminDashboard from "./pages/super-admin/dashboard";
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
      <Route path="/products" component={ProductsPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/industry-solutions" component={IndustrySolutionsPage} />
      <Route path="/digital-wallet" component={DigitalWalletPage} />
      <Route path="/pos-systems" component={PosSystemsPage} />
      <Route path="/payments" component={PaymentsPage} />
      <Route path="/documentation" component={DocumentationPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/partners" component={Partners} />
      <Route path="/affiliates" component={Affiliates} />
      <Route path="/partner-portal" component={PartnerPortal} />
      <Route path="/affiliate-portal" component={AffiliatePortal} />
      <Route path="/iso-dashboard" component={IsoDashboard} />
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
      
      {/* Parent-Child Wallet System */}
      <ProtectedRoute path="/parent/dashboard" component={ParentDashboard} />
      <ProtectedRoute path="/child/dashboard" component={ChildDashboard} />
      
      {/* Admin Routes */}
      <Route path="/admin/analytics" component={AnalyticsDashboard} />
      <Route path="/admin/test-recommendation" component={TestRecommendationEngine} />
      <Route path="/admin/project-documentation" component={ProjectDocumentation} />
      <Route path="/admin/test-management" component={() => {
        const TestManagement = React.lazy(() => import("./pages/admin/test-management"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <TestManagement />
          </React.Suspense>
        );
      }} />
      <Route path="/admin/test-reporting" component={() => {
        const TestReporting = React.lazy(() => import("./pages/admin/test-reporting"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <TestReporting />
          </React.Suspense>
        );
      }} />
      <Route path="/admin/test-root-cause" component={() => {
        const TestRootCause = React.lazy(() => import("./pages/admin/test-root-cause"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <TestRootCause />
          </React.Suspense>
        );
      }} />
      <Route path="/admin/test-optimization" component={() => {
        const TestOptimization = React.lazy(() => import("./pages/admin/test-optimization"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <TestOptimization />
          </React.Suspense>
        );
      }} />
      
      <ProtectedRoute path="/merchant/dashboard" component={MerchantDashboard} />
      <ProtectedRoute path="/merchant/onboarding" component={MerchantOnboarding} />
      <ProtectedRoute path="/merchant/verification" component={MerchantVerification} />
      <ProtectedRoute path="/merchant/payment-gateways" component={PaymentGateways} />
      <ProtectedRoute path="/merchant/payment-gateways/new" component={NewPaymentGateway} />
      <ProtectedRoute path="/merchant/payment-gateways/:id/process-payment" component={ProcessPaymentPage} />
      <ProtectedRoute path="/merchant/payment-settings" component={PaymentSettings} />
      <ProtectedRoute path="/merchant/loyalty-programs" component={LoyaltyPrograms} />
      <ProtectedRoute path="/merchant/affiliate-dashboard" component={AffiliateDashboard} />
      {/* BistroBeast Restaurant POS */}
      <ProtectedRoute path="/merchant/pos/bistro" component={BistroBeastPOS} />
      <ProtectedRoute path="/merchant/pos/bistro/inventory" component={BistroBeastInventory} />
      <ProtectedRoute path="/merchant/pos/bistro/staff" component={BistroBeastStaff} />
      <ProtectedRoute path="/merchant/pos/bistro/transactions" component={BistroBeastTransactions} />
      <ProtectedRoute path="/merchant/pos/bistro/kitchen" component={BistroBeastKitchen} />
      <Route path="/merchant/pos/bistro/order-modify" component={React.lazy(() => import("./pages/merchant/pos/bistro/order-modify"))} />
      <Route path="/merchant/pos/bistro/order-modify-success" component={React.lazy(() => import("./pages/merchant/pos/bistro/order-modify-success"))} />
      <Route path="/merchant/pos/bistro/order-modify-cancelled" component={React.lazy(() => import("./pages/merchant/pos/bistro/order-modify-cancelled"))} />
      
      {/* PaySurity ECom Ready Retail POS */}
      <ProtectedRoute path="/merchant/pos/retail" component={RetailPOSSystem} />
      <ProtectedRoute path="/merchant/pos/retail/inventory" component={RetailInventoryPage} />
      <ProtectedRoute path="/merchant/applications-management" component={ApplicationsManagement} />
      <ProtectedRoute path="/merchant/applications/:id" component={ApplicationDetail} />
      <ProtectedRoute path="/admin/hubspot-settings" component={HubSpotSettings} />
      <ProtectedRoute path="/admin/analytics" component={AnalyticsDashboard} />
      <ProtectedRoute path="/admin/project-dependencies" component={ProjectDependenciesPage} />
      <Route path="/admin/test-suite" component={() => {
        const TestSuite = React.lazy(() => import("./pages/admin/test-suite"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <TestSuite />
          </React.Suspense>
        );
      }} />
      <Route path="/admin/test-dashboard" component={() => {
        const TestDashboard = React.lazy(() => import("./pages/admin/test-dashboard"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <TestDashboard />
          </React.Suspense>
        );
      }} />
      
      {/* Customer-facing routes */}
      <Route path="/order-modify/:token" component={(params) => {
        const OrderModify = React.lazy(() => import("./pages/customer/order-modify"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <OrderModify />
          </React.Suspense>
        );
      }} />

      {/* Payment routes */}
      <Route path="/payment" component={PaymentPage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      
      {/* Admin routes */}
      <Route path="/admin/sms-settings">
        {() => {
          const SmsSettings = React.lazy(() => import("./pages/admin/sms-settings"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <SmsSettings />
            </React.Suspense>
          );
        }}
      </Route>
      
      {/* Super Admin routes */}
      <Route path="/super-admin/dashboard" component={SuperAdminDashboard} />
      <Route path="/super-admin/merchants" component={React.lazy(() => import("./pages/super-admin/merchants"))} />
      <Route path="/super-admin/partners" component={React.lazy(() => import("./pages/super-admin/partners"))} />
      <Route path="/super-admin/affiliates" component={React.lazy(() => import("./pages/super-admin/affiliates"))} />
      <Route path="/super-admin/payments" component={React.lazy(() => import("./pages/super-admin/payments"))} />
      <Route path="/super-admin/analytics" component={React.lazy(() => import("./pages/super-admin/analytics"))} />
      
      {/* Admin routes should be protected */}
      <ProtectedRoute path="/admin/analytics" component={AnalyticsDashboard} />
      <ProtectedRoute path="/admin/test-recommendation" component={TestRecommendationEngine} />
      <ProtectedRoute path="/admin/project-documentation" component={ProjectDocumentation} />
      <ProtectedRoute path="/admin/hubspot-settings" component={HubSpotSettings} />
      
      {/* Catch-all route - must be last */}
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
      <RouteDebugComponent />
    </AuthProvider>
  );
}

export default App;
