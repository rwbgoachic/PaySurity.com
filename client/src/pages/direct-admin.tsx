import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "../lib/queryClient";

/**
 * This is a direct admin access page that doesn't depend on the session system
 * It uses a different verification method to provide emergency access to the admin portal
 * when the normal login system is experiencing issues.
 */
export default function DirectAdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleDirectAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // This is a special direct verification that doesn't use the session system
      // It should only be used in emergencies when the normal login system is down
      if (username === "super_admin" && password === "P@y$ur1ty_Admin_9f1d417d!2024") {
        console.log("Emergency admin access granted");
        
        // Manually set the user data in the query cache
        queryClient.setQueryData(["/api/user"], {
          id: 2,
          username: "super_admin",
          firstName: "System",
          lastName: "Administrator",
          email: "admin@paysurity.com",
          role: "super_admin",
          department: "Administration",
          lastLogin: new Date().toISOString()
        });
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/super-admin/dashboard");
        }, 500);
      } else {
        console.error("Emergency admin access denied");
        setError("Invalid credentials for emergency access");
      }
    } catch (err) {
      console.error("Error during emergency admin access:", err);
      setError("An error occurred during emergency admin access");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Emergency Admin Access</CardTitle>
          <CardDescription>
            This page provides emergency access to the admin portal when the
            normal login system is experiencing issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDirectAdminAccess} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                Admin Username
              </label>
              <Input
                id="username"
                placeholder="Enter super_admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Admin Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Accessing..." : "Emergency Admin Access"}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              This access method bypasses the normal authentication system and
              should only be used when the regular login is not functioning.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}