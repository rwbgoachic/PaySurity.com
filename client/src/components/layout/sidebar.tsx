import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  CreditCard, 
  Users, 
  DollarSign, 
  Building, 
  Settings,
  SendHorizonal
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleUserRole: () => void;
}

export default function Sidebar({ sidebarOpen, toggleUserRole }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const isEmployer = user?.role === "employer";

  const isActive = (path: string) => {
    return location === path;
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-neutral-200 h-[calc(100vh-60px)]">
      <div className="h-full flex flex-col">
        <div className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          <nav className="space-y-1">
            {isEmployer ? (
              <div className="space-y-1">
                <Link href="/employer/dashboard">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employer/dashboard") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <Home className="h-5 w-5 mr-3" />
                    Dashboard
                  </a>
                </Link>
                
                <Link href="/employer/transactions">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employer/transactions") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <CreditCard className="h-5 w-5 mr-3" />
                    Transactions
                  </a>
                </Link>
                
                <Link href="/employer/users">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employer/users") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <Users className="h-5 w-5 mr-3" />
                    Users & Wallets
                  </a>
                </Link>
                
                <Link href="/employer/payroll">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employer/payroll") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <DollarSign className="h-5 w-5 mr-3" />
                    Payroll
                  </a>
                </Link>
                
                <Link href="/employer/banking">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employer/banking") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <Building className="h-5 w-5 mr-3" />
                    Banking
                  </a>
                </Link>
                
                <Link href="/employer/settings">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employer/settings") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </a>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <Link href="/employee/dashboard">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employee/dashboard") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <Home className="h-5 w-5 mr-3" />
                    Dashboard
                  </a>
                </Link>
                
                <Link href="/employee/transactions">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employee/transactions") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <CreditCard className="h-5 w-5 mr-3" />
                    Transactions
                  </a>
                </Link>
                
                <Link href="/employee/banking">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employee/banking") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <Building className="h-5 w-5 mr-3" />
                    Banking
                  </a>
                </Link>
                
                <Link href="/employee/fund-requests">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employee/fund-requests") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
                    <SendHorizonal className="h-5 w-5 mr-3" />
                    Request Funds
                  </a>
                </Link>
                
                <Link href="/employee/settings">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/employee/settings") 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}>
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
            onClick={toggleUserRole}
            className="w-full"
          >
            Switch to {isEmployer ? "Employee" : "Employer"} View
          </Button>
        </div>
      </div>
    </aside>
  );
}
