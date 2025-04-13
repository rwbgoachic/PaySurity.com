import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, User, ShieldCheck } from "lucide-react";

interface AdminLoginData {
  username: string;
  password: string;
  twoFactorCode?: string;
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare login data
      const loginData: AdminLoginData = {
        username,
        password
      };

      // Add 2FA code if we're in the 2FA verification stage
      if (requiresTwoFactor && twoFactorCode) {
        loginData.twoFactorCode = twoFactorCode;
      }

      // Make the API request
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setUserId(data.userId);
        toast({
          title: "Two-factor authentication required",
          description: "Please enter the verification code from your authenticator app",
        });
        setIsLoading(false);
        return;
      }

      // If we get here, either 2FA is not required or it was successful
      // Store the admin token in localStorage for future API requests
      localStorage.setItem("adminAuthToken", data.token);
      
      // Store the user data in React Query cache
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName || data.user.username}!`,
      });
      
      // Check if the user needs to set up 2FA (for the first time)
      if (data.user.role === 'sub_super_admin' && !data.user.twoFactorEnabled) {
        // Redirect to 2FA setup page
        navigate("/admin/two-factor-setup");
        return;
      }
      
      // Redirect to the admin dashboard
      setTimeout(() => {
        // Redirect based on user role
        if (data.user.role === "super_admin") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "sub_super_admin") {
          navigate("/admin/dashboard");
        } else {
          // Fallback for other admin roles
          navigate("/admin/dashboard");
        }
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription>
              Secure access for PaySurity administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {!requiresTwoFactor ? (
                // Step 1: Username and password
                <>
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <Input
                        className="pl-10"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <Input
                        className="pl-10"
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Step 2: Two-factor authentication
                <div className="space-y-2">
                  <div className="text-center mb-4">
                    <ShieldCheck className="mx-auto h-12 w-12 text-green-500 mb-2" />
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">
                      Enter the verification code from your authenticator app
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      className="text-center text-lg tracking-widest"
                      id="twoFactorCode"
                      placeholder="000000"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {requiresTwoFactor ? "Verifying..." : "Authenticating..."}
                  </>
                ) : (
                  requiresTwoFactor ? "Verify Code" : "Sign In to Admin"
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                This is a secure area. Unauthorized access attempts are logged and monitored.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}