import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import LoginForm from './components/auth/LoginForm';
import Signup from './pages/auth/Signup';
import Verify from './pages/auth/Verify';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import MerchantServices from './pages/solutions/MerchantServices';
import RestaurantPOS from './pages/solutions/RestaurantPOS';
import GroceryPOS from './pages/solutions/GroceryPOS';
import PayrollSolution from './pages/solutions/PayrollSolution';
import PayrollPricing from './pages/solutions/PayrollPricing';
import AddClient from './pages/dashboard/admin/AddClient';
import ClientList from './pages/dashboard/admin/ClientList';
import AuditLogList from './pages/dashboard/admin/AuditLogList';
import ChatWidget from './components/chat/ChatWidget';
import Transactions from './pages/dashboard/Transactions';

function App() {
  // Log to console for debugging
  useEffect(() => {
    console.log('PaySurity website initialized');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/solutions/merchants" element={<MerchantServices />} />
            <Route path="/solutions/restaurant" element={<RestaurantPOS />} />
            <Route path="/solutions/grocery" element={<GroceryPOS />} />
            <Route path="/solutions/payroll" element={<PayrollSolution />} />
            <Route path="/solutions/payroll/pricing" element={<PayrollPricing />} />
          </Route>
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="admin/clients" element={<ClientList />} />
            <Route path="admin/clients/add" element={<AddClient />} />
            <Route path="admin/audit-logs" element={<AuditLogList />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>
        </Routes>
      </Router>
      <ChatWidget />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;