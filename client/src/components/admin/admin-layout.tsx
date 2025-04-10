import { ReactNode } from "react";
import { AdminNavigation } from "./admin-navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    // This shouldn't normally be reached if ProtectedRoute is being used
    window.location.href = "/auth";
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Admin Sidebar */}
      <AdminNavigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {user?.username}
              </span>
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}