import { Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}

export default function AppHeader({ toggleSidebar, toggleMobileMenu }: AppHeaderProps) {
  const { user, logoutMutation } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <header className="bg-white shadow-sm py-3 px-4 sm:px-6 flex items-center justify-between z-10">
      <div className="flex items-center">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden mr-4 text-neutral-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:block mr-4 text-neutral-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center">
          <span className="ml-2 text-xl font-semibold text-primary">Paysurity</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {isSuperAdmin && (
          <Link href="/admin/dashboard">
            <a className="text-neutral-700 hover:text-neutral-900">Admin Dashboard</a>
          </Link>
        )}
        <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-900">
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span>{getUserInitials()}</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-neutral-700">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDown className="hidden md:block h-4 w-4 text-neutral-500" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
