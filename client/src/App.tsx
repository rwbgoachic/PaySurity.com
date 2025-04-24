import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ThemePreviewProvider from './components/theme/ThemePreviewProvider';
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
import ChatWidget from './components/chat/ChatWidget';

function App() {
  // Log to console for debugging
  useEffect(() => {
    console.log('PaySurity website initialized');
  }, []);

  return (
    <ThemePreviewProvider>
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
            </Route>
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <ChatWidget />
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemePreviewProvider>
  );
}

export default App;