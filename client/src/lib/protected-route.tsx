import React from "react";
import { Route, useLocation, useRoute } from "wouter";
import { useAuth } from "@/providers/auth-provider";

// Generic protected route component that redirects to login if not authenticated
export function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Use matchRoute to check if current route matches the protected path
  const [matches] = useRoute(rest.path);

  React.useEffect(() => {
    // Only redirect when finished loading and on a matching route
    if (!loading && !isAuthenticated && matches) {
      navigate("/auth?mode=login&redirect=" + encodeURIComponent(rest.path));
    }
  }, [isAuthenticated, loading, matches, navigate, rest.path]);

  // Show nothing while checking auth status
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Return the normal route, the redirect happens via the effect
  return <Route {...rest} component={Component} />;
}