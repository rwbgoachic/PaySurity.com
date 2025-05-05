import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-primary-700/50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-6">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              PaySurity
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              <Link to="/merchant-services" className="text-base font-medium text-white hover:text-primary-400">
                Merchant Services
              </Link>
              <Link to="/restaurant-pos" className="text-base font-medium text-white hover:text-primary-400">
                Restaurant POS
              </Link>
              <Link to="/grocery-pos" className="text-base font-medium text-white hover:text-primary-400">
                Grocery POS
              </Link>
              <Link to="/payroll-services" className="text-base font-medium text-white hover:text-primary-400">
                Payroll Services
              </Link>
              <Link to="/blog" className="text-base font-medium text-white hover:text-primary-400">
                Blog
              </Link>
              <Link to="/contact" className="text-base font-medium text-white hover:text-primary-400">
                Contact
              </Link>
            </div>
          </div>
          <div className="ml-10 space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                  <Link
                    to="/admin/dashboard"
                    className="inline-block rounded-md border border-transparent bg-primary-500 py-2 px-4 text-base font-medium text-white hover:bg-primary-600"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/merchant/dashboard"
                    className="inline-block rounded-md border border-transparent bg-primary-500 py-2 px-4 text-base font-medium text-white hover:bg-primary-600"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="inline-block rounded-md border border-transparent bg-white/10 py-2 px-4 text-base font-medium text-white hover:bg-white/20"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-block rounded-md border border-transparent bg-white/10 py-2 px-4 text-base font-medium text-white hover:bg-white/20"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-block rounded-md border border-transparent bg-primary-500 py-2 px-4 text-base font-medium text-white hover:bg-primary-600"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}