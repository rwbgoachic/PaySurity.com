import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
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
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
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
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
