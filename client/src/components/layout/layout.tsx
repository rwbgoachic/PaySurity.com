import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import AppHeader from "./app-header";
import Sidebar from "./sidebar";
import MobileMenu from "./mobile-menu";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Toggle sidebar for desktop
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Toggle user role for demo purposes
  const toggleUserRole = () => {
    const isEmployer = user?.role === "employer";
    if (isEmployer) {
      navigate("/employee/dashboard");
    } else {
      navigate("/employer/dashboard");
    }
  };

  // Adjust sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
        setMobileMenuOpen(false);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        toggleSidebar={toggleSidebar} 
        toggleMobileMenu={toggleMobileMenu} 
      />

      <MobileMenu 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        toggleUserRole={toggleUserRole}
      />

      <div className="flex-1 flex">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          toggleUserRole={toggleUserRole} 
        />

        <main className="flex-1 h-[calc(100vh-60px)] overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
