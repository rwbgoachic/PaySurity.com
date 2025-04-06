import { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { SiteFooter } from "./site-footer";
import {
  Building,
  BarChart3,
  FileText,
  Settings,
  Users,
  CreditCard,
  ChevronRight,
  Home,
  ShieldCheck,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MerchantLayoutProps {
  children: ReactNode;
}

export function MerchantLayout({ children }: MerchantLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Navigation items for the sidebar
  const navigationItems = [
    { name: "Dashboard", href: "/merchant", icon: BarChart3 },
    { name: "Applications", href: "/merchant/applications", icon: FileText },
    { name: "Payment Gateways", href: "/merchant/payment-gateways", icon: CreditCard },
    { name: "Verification", href: "/merchant/verification", icon: ShieldCheck },
    { name: "Affiliates", href: "/merchant/affiliates", icon: Users },
    { name: "Settings", href: "/merchant/settings", icon: Settings },
  ];
  
  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    return user.username.substring(0, 2).toUpperCase();
  };
  
  // Function to determine if a nav link is active
  const isActive = (href: string) => {
    if (href === "/merchant" && location === "/merchant") return true;
    if (href !== "/merchant" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="flex items-center">
                <Building className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-lg">PaySurity Merchant</span>
              </a>
            </Link>
            <Badge variant="outline" className="ml-4 hidden sm:inline-flex">
              <span className="text-xs font-normal">merchant.paysurity.com</span>
            </Badge>
          </div>
          
          {/* Domain switcher and user menu */}
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 hidden md:flex">
                  <span>Product Suite</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <a className="flex w-full cursor-pointer items-center">
                      <Home className="mr-2 h-4 w-4" />
                      Main Site
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet">
                    <a className="flex w-full cursor-pointer items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Digital Wallet
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pos">
                    <a className="flex w-full cursor-pointer items-center">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      POS System
                    </a>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5 leading-none">
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-muted-foreground text-xs">
                        {user.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/merchant/settings">
                      <a className="cursor-pointer">My Settings</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth">
                  <a>Sign In</a>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar navigation */}
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <nav className="px-2 py-6">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href) ? "bg-accent text-accent-foreground" : "transparent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex w-full flex-col overflow-hidden py-6">
          {children}
        </main>
      </div>
      
      <SiteFooter />
    </div>
  );
}