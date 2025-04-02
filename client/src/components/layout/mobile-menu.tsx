import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  CreditCard, 
  Users, 
  DollarSign, 
  Building, 
  Settings,
  SendHorizonal,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleUserRole: () => void;
}

export default function MobileMenu({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  toggleUserRole 
}: MobileMenuProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const isEmployer = user?.role === "employer";

  const isActive = (path: string) => {
    return location === path;
  };

  const handleNavigate = () => {
    setMobileMenuOpen(false);
  };

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-900 bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
      
      {/* Menu panel */}
      <div className="relative flex flex-col w-72 max-w-xs bg-white h-full">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center">
            <span className="ml-2 text-xl font-semibold text-primary">Paysurity</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-neutral-500 hover:text-neutral-900 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {isEmployer ? (
              <div className="space-y-1">
                <Link href="/employer/dashboard">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employer/dashboard") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    Dashboard
                  </a>
                </Link>
                
                <Link href="/employer/transactions">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employer/transactions") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    Transactions
                  </a>
                </Link>
                
                <Link href="/employer/users">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employer/users") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Users & Wallets
                  </a>
                </Link>
                
                <Link href="/employer/payroll">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employer/payroll") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <DollarSign className="h-5 w-5 mr-3" />
                    Payroll
                  </a>
                </Link>
                
                <Link href="/employer/banking">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employer/banking") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <Building className="h-5 w-5 mr-3" />
                    Banking
                  </a>
                </Link>
                
                <Link href="/employer/settings">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employer/settings") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </a>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <Link href="/employee/dashboard">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employee/dashboard") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    Dashboard
                  </a>
                </Link>
                
                <Link href="/employee/transactions">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employee/transactions") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    Transactions
                  </a>
                </Link>
                
                <Link href="/employee/banking">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employee/banking") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <Building className="h-5 w-5 mr-3" />
                    Banking
                  </a>
                </Link>
                
                <Link href="/employee/fund-requests">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employee/fund-requests") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <SendHorizonal className="h-5 w-5 mr-3" />
                    Request Funds
                  </a>
                </Link>
                
                <Link href="/employee/settings">
                  <a 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive("/employee/settings") 
                        ? "bg-primary text-white" 
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    onClick={handleNavigate}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </a>
                </Link>
              </div>
            )}
          </nav>
        </div>
        
        <div className="p-4 border-t border-neutral-200">
          <Button
            onClick={() => {
              toggleUserRole();
              setMobileMenuOpen(false);
            }}
            className="w-full"
          >
            Switch to {isEmployer ? "Employee" : "Employer"} View
          </Button>
        </div>
      </div>
    </div>
  );
}
