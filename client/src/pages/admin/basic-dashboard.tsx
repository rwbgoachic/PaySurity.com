// Simple version for connectivity testing
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function BasicAdminDashboard() {
  const [, navigate] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminAuthToken");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">PaySurity Admin Dashboard</h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <div className="bg-green-100 p-4 mb-6 rounded-md text-green-800 border border-green-200">
          <p className="font-medium">Connectivity Test Successful</p>
          <p className="text-sm">The admin dashboard is now loading correctly. We can continue implementing the authentication features.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-1">Total Users</h3>
            <p className="text-lg font-bold">1,342</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-1">Total Revenue</h3>
            <p className="text-lg font-bold">$124,532.12</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-1">Active Merchants</h3>
            <p className="text-lg font-bold">328</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-1">System Status</h3>
            <p className="text-lg font-bold text-green-600">Operational</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="text-lg font-medium mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/customers">
              <a className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-md">
                <h3 className="font-medium">Manage Customers</h3>
                <p className="text-sm text-gray-600">View and edit customer accounts</p>
              </a>
            </Link>
            <Link href="/admin/sub-admins">
              <a className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-md">
                <h3 className="font-medium">Admin Users</h3>
                <p className="text-sm text-gray-600">Manage administrative access</p>
              </a>
            </Link>
            <Link href="/admin/two-factor-setup">
              <a className="block p-4 bg-green-50 hover:bg-green-100 rounded-md">
                <h3 className="font-medium">Two-Factor Setup</h3>
                <p className="text-sm text-gray-600">Configure 2FA authentication</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}