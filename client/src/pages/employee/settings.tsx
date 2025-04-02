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
import { BellIcon, ShieldIcon, UserIcon } from "lucide-react";

export default function EmployeeSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [personalForm, setPersonalForm] = useState({
    email: user?.email || "",
    phone: "555-789-1234",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    transactionAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    markPersonalTransactions: true,
    hideAmountsFromEmployer: false,
  });
  
  // Event handlers
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Updated",
      description: "Your personal settings have been saved.",
    });
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy settings have been saved.",
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
          <p className="text-sm text-neutral-500">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue="personal">
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-primary" />
                    Personal Information
                  </div>
                </CardTitle>
                <CardDescription>Manage your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePersonal} className="space-y-6">
                  <div className="space-y-4">
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
                        <Label htmlFor="department">Department</Label>
                        <Input 
                          id="department" 
                          value={user?.department || ""}
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={personalForm.email} 
                          onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={personalForm.phone}
                          onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})}
                          placeholder="555-123-4567"
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
                <CardDescription>Control how you receive notifications and updates</CardDescription>
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
                          <p className="text-sm text-neutral-500">Get notified about new transactions in your wallet</p>
                        </div>
                        <Switch 
                          id="transactionAlerts" 
                          checked={notificationSettings.transactionAlerts}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, transactionAlerts: checked})}
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
                          <Label htmlFor="weeklyReports">Weekly Spending Reports</Label>
                          <p className="text-sm text-neutral-500">Receive weekly summaries of your spending</p>
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
                          <p className="text-sm text-neutral-500">Receive monthly financial summaries</p>
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
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control how your transaction data is shared with your employer</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePrivacy} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="markPersonalTransactions">Mark Transactions as Personal</Label>
                        <p className="text-sm text-neutral-500">Allow marking specific transactions as personal to hide them from your employer</p>
                      </div>
                      <Switch 
                        id="markPersonalTransactions" 
                        checked={privacySettings.markPersonalTransactions}
                        onCheckedChange={(checked) => setPrivacySettings({...privacySettings, markPersonalTransactions: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hideAmountsFromEmployer">Hide Transaction Amounts</Label>
                        <p className="text-sm text-neutral-500">Only show transaction categories to your employer, not specific amounts</p>
                      </div>
                      <Switch 
                        id="hideAmountsFromEmployer" 
                        checked={privacySettings.hideAmountsFromEmployer}
                        onCheckedChange={(checked) => setPrivacySettings({...privacySettings, hideAmountsFromEmployer: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-md text-sm">
                    <p className="font-medium">Privacy Notice</p>
                    <p className="mt-1">Your employer will always be able to see your wallet balance and general expense categories for business reporting purposes. Personal transactions will still affect your wallet balance but won't be visible to your employer.</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Privacy Settings</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <ShieldIcon className="h-5 w-5 mr-2 text-primary" />
                    Change Password
                  </div>
                </CardTitle>
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
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>Recent login activities for your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-neutral-50 rounded flex justify-between">
                      <div>
                        <p className="font-medium text-sm">Current Session</p>
                        <p className="text-xs text-neutral-500">San Francisco, CA • Chrome on Windows</p>
                      </div>
                      <p className="text-xs text-neutral-500">Today, 10:15 AM</p>
                    </div>
                    
                    <div className="p-3 bg-neutral-50 rounded flex justify-between">
                      <div>
                        <p className="text-sm">San Francisco, CA</p>
                        <p className="text-xs text-neutral-500">Chrome on Windows</p>
                      </div>
                      <p className="text-xs text-neutral-500">Yesterday, 3:45 PM</p>
                    </div>
                    
                    <div className="p-3 bg-neutral-50 rounded flex justify-between">
                      <div>
                        <p className="text-sm">San Francisco, CA</p>
                        <p className="text-xs text-neutral-500">Mobile App on iPhone</p>
                      </div>
                      <p className="text-xs text-neutral-500">Oct 10, 9:30 AM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
