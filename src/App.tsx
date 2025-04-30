import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MerchantServices from './pages/MerchantServices';
import RestaurantPOS from './pages/RestaurantPOS';
import GroceryPOS from './pages/GroceryPOS';
import PayrollServices from './pages/PayrollServices';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Dashboard from './pages/admin/Dashboard';
import MerchantOnboarding from './pages/merchant/Onboarding';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black">
          <header className="bg-black text-white p-4">
            <nav className="container mx-auto">
              {/* Basic header content */}
              <h1 className="text-xl font-bold">Paysurity</h1>
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/merchant-services" element={<MerchantServices />} />
              <Route path="/restaurant-pos" element={<RestaurantPOS />} />
              <Route path="/grocery-pos" element={<GroceryPOS />} />
              <Route path="/payroll-services" element={<PayrollServices />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole={['admin', 'super_admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/onboarding"
                element={
                  <ProtectedRoute requiredRole="merchant">
                    <MerchantOnboarding />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="bg-black text-white p-4 mt-auto">
            <div className="container mx-auto">
              {/* Basic footer content */}
              <p className="text-center">&copy; 2025 Paysurity. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;