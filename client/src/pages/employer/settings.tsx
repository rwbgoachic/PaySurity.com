import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { MailIcon, BellIcon, ShieldIcon, UserIcon } from "lucide-react";

export default function EmployerSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [generalForm, setGeneralForm] = useState({
    companyName: "Acme Inc.",
    email: user?.email || "",
    phone: "555-123-4567",
    address: "123 Business Ave, San Francisco, CA 94103",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    transactionAlerts: true,
    fundRequestAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    requireApprovalAbove: "$1000.00",
  });
  
  // Event handlers
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Updated",
      description: "Your general settings have been saved.",
    });
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been saved.",
    });
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
  };

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="text-sm text-neutral-500">Manage your account and organization settings</p>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-primary" />
                    General Settings
                  </div>
                </CardTitle>
                <CardDescription>Manage your organization and account information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Organization Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          value={generalForm.companyName}
                          onChange={(e) => setGeneralForm({...generalForm, companyName: e.target.value})}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={generalForm.email} 
                          onChange={(e) => setGeneralForm({...generalForm, email: e.target.value})}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Contact Phone</Label>
                        <Input 
                          id="phone" 
                          value={generalForm.phone}
                          onChange={(e) => setGeneralForm({...generalForm, phone: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Input 
                          id="address" 
                          value={generalForm.address}
                          onChange={(e) => setGeneralForm({...generalForm, address: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={user?.firstName || ""}
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={user?.lastName || ""}
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={user?.username || ""}
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="userEmail">Email</Label>
                        <Input 
                          id="userEmail" 
                          type="email"
                          value={user?.email || ""}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-primary" />
                    Notification Preferences
                  </div>
                </CardTitle>
                <CardDescription>Control what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-neutral-500">Receive notifications via email</p>
                        </div>
                        <Switch 
                          id="emailNotifications" 
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="transactionAlerts">Transaction Alerts</Label>
                          <p className="text-sm text-neutral-500">Receive alerts for new transactions</p>
                        </div>
                        <Switch 
                          id="transactionAlerts" 
                          checked={notificationSettings.transactionAlerts}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, transactionAlerts: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="fundRequestAlerts">Fund Request Alerts</Label>
                          <p className="text-sm text-neutral-500">Get notified when employees request funds</p>
                        </div>
                        <Switch 
                          id="fundRequestAlerts" 
                          checked={notificationSettings.fundRequestAlerts}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, fundRequestAlerts: checked})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Reports</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weeklyReports">Weekly Reports</Label>
                          <p className="text-sm text-neutral-500">Receive weekly expense summaries</p>
                        </div>
                        <Switch 
                          id="weeklyReports" 
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="monthlyReports">Monthly Reports</Label>
                          <p className="text-sm text-neutral-500">Receive monthly financial reports</p>
                        </div>
                        <Switch 
                          id="monthlyReports" 
                          checked={notificationSettings.monthlyReports}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, monthlyReports: checked})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Preferences</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center">
                      <ShieldIcon className="h-5 w-5 mr-2 text-primary" />
                      Security Settings
                    </div>
                  </CardTitle>
                  <CardDescription>Manage your account security preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSecurity} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                          <p className="text-sm text-neutral-500">Add an extra layer of security to your account</p>
                        </div>
                        <Switch 
                          id="twoFactorAuth" 
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="requireApprovalAbove">Require Approval for Transactions Above</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-neutral-500 sm:text-sm">$</span>
                          </div>
                          <Input 
                            id="requireApprovalAbove" 
                            className="pl-7"
                            value={securitySettings.requireApprovalAbove.replace('$', '')}
                            onChange={(e) => setSecuritySettings({...securitySettings, requireApprovalAbove: `$${e.target.value}`})}
                          />
                        </div>
                        <p className="text-sm text-neutral-500">Transactions above this amount will require your approval</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">Save Security Settings</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" required />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">Change Password</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
