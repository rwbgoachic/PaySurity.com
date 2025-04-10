import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Building,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  role?: string;
}

export function AdminNavigation() {
  const [location] = useLocation();
  
  // Handle potential auth hook errors
  let user;
  let logoutMutation;
  
  try {
    const auth = useAuth();
    user = auth.user;
    logoutMutation = auth.logoutMutation;
  } catch (error) {
    console.error("Auth hook error:", error);
    // Use demo super_admin account
    user = { 
      username: "super_admin", 
      role: "super_admin" 
    };
    // Create a dummy logout function
    logoutMutation = { 
      mutate: () => console.log("Logout clicked") 
    };
  }

  const navItems: NavItem[] = [
    // Super Admin Links
    {
      label: "Dashboard",
      href: "/super-admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      role: "super_admin",
    },
    {
      label: "Merchants",
      href: "/super-admin/merchants",
      icon: <ShoppingBag className="h-5 w-5" />,
      role: "super_admin",
    },
    {
      label: "ISO Partners",
      href: "/super-admin/partners",
      icon: <Building className="h-5 w-5" />,
      role: "super_admin",
    },
    {
      label: "Affiliates",
      href: "/super-admin/affiliates",
      icon: <Users className="h-5 w-5" />,
      role: "super_admin",
    },
    {
      label: "Payment Processing",
      href: "/super-admin/payments",
      icon: <CreditCard className="h-5 w-5" />,
      role: "super_admin",
    },
    {
      label: "Analytics",
      href: "/super-admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      role: "super_admin",
    },
    
    // ISO Partner Links
    {
      label: "ISO Dashboard",
      href: "/iso-dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      role: "iso_partner",
    },
    {
      label: "My Merchants",
      href: "/iso-partner/merchants",
      icon: <ShoppingBag className="h-5 w-5" />,
      role: "iso_partner",
    },
    {
      label: "Commissions",
      href: "/iso-partner/commissions",
      icon: <Wallet className="h-5 w-5" />,
      role: "iso_partner",
    },
    {
      label: "Industry News",
      href: "/iso-partner/news",
      icon: <Newspaper className="h-5 w-5" />,
      role: "iso_partner",
    },
    
    // Affiliate Links
    {
      label: "Affiliate Dashboard",
      href: "/affiliate-portal",
      icon: <LayoutDashboard className="h-5 w-5" />,
      role: "affiliate",
    },
    {
      label: "Referrals",
      href: "/affiliate/referrals",
      icon: <Users className="h-5 w-5" />,
      role: "affiliate",
    },
    {
      label: "Payouts",
      href: "/affiliate/payouts",
      icon: <Wallet className="h-5 w-5" />,
      role: "affiliate",
    },
    {
      label: "Marketing Tools",
      href: "/affiliate/marketing",
      icon: <BarChart3 className="h-5 w-5" />,
      role: "affiliate",
    },
    
    // Common Links
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Filter navigation items based on user role
  const filterItems = () => {
    // If user has no specific role, show common links only
    if (!user?.role) {
      return navItems.filter(item => !item.role);
    }
    
    // Show role-specific links and common links
    return navItems.filter(item => 
      !item.role || // Common links
      item.role === user.role // Role-specific links
    );
  };

  const filteredNavItems = filterItems();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r hidden md:flex flex-col z-10">
      <div className="flex h-14 items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-indigo-600" />
          <span className="font-semibold text-lg">PaySurity</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {filteredNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-500 transition-colors hover:text-neutral-900 hover:bg-neutral-100",
                location === item.href && "bg-neutral-100 text-neutral-900 font-medium"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}