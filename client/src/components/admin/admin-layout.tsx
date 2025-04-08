import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  Package,
  TestTube,
  AreaChart,
  Bug,
  MessageSquare,
  Menu,
  X
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigationItems = [
    { 
      href: "/admin/analytics", 
      label: "Analytics Dashboard", 
      icon: <AreaChart className="w-5 h-5 mr-2" /> 
    },
    { 
      href: "/admin/test-dashboard", 
      label: "Test Dashboard", 
      icon: <TestTube className="w-5 h-5 mr-2" /> 
    },
    { 
      href: "/admin/test-suite", 
      label: "Legacy Test Suite", 
      icon: <Bug className="w-5 h-5 mr-2" /> 
    },
    { 
      href: "/admin/project-dependencies", 
      label: "Project Dependencies", 
      icon: <Package className="w-5 h-5 mr-2" /> 
    },
    { 
      href: "/admin/hubspot-settings", 
      label: "HubSpot Settings", 
      icon: <MessageSquare className="w-5 h-5 mr-2" /> 
    },
    { 
      href: "/admin/sms-settings", 
      label: "SMS Settings", 
      icon: <Settings className="w-5 h-5 mr-2" /> 
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-6 border-b">
          <Link href="/admin/analytics" className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "default" : "ghost"}
                className="w-full justify-start"
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b p-4 flex items-center justify-between">
        <Link href="/admin/analytics" className="flex items-center space-x-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl">Admin Panel</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile navigation menu */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-background">
          <nav className="pt-16 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setMobileNavOpen(false)}
              >
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="pt-4 border-t mt-4">
              <Link href="/" onClick={() => setMobileNavOpen(false)}>
                <Button variant="outline" className="w-full">
                  Back to Site
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 md:mt-0 mt-16">
        {children}
      </div>
    </div>
  );
}