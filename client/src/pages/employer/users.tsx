import { useState } from "react";
import Layout from "@/components/layout/layout";
import SubWalletOverview from "@/components/wallets/sub-wallet-overview";
import AllocateFundsModal from "@/components/modals/allocate-funds-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, UserPlus } from "lucide-react";

export default function EmployerUsers() {
  const { toast } = useToast();
  const [allocateFundsModalOpen, setAllocateFundsModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  
  // Sample data for users and sub-wallets
  const subWalletUsers = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      initials: "SJ",
      department: "Marketing",
      balance: "$1,250.50",
      monthlyLimit: "$2,000.00",
      lastActivity: "Oct 12, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@company.com",
      initials: "MC",
      department: "Engineering",
      balance: "$725.80",
      monthlyLimit: "$1,500.00",
      lastActivity: "Oct 12, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "3",
      name: "James Wilson",
      email: "james.wilson@company.com",
      initials: "JW",
      department: "Sales",
      balance: "$2,154.25",
      monthlyLimit: "$3,000.00",
      lastActivity: "Oct 11, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "4",
      name: "Emma Lopez",
      email: "emma.lopez@company.com",
      initials: "EL",
      department: "Customer Support",
      balance: "$540.15",
      monthlyLimit: "$1,000.00",
      lastActivity: "Oct 9, 2023",
      status: "Active" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
    {
      id: "5",
      name: "Robert Brown",
      email: "robert.brown@company.com",
      initials: "RB",
      department: "HR",
      balance: "$875.60",
      monthlyLimit: "$1,200.00",
      lastActivity: "Oct 8, 2023",
      status: "Inactive" as const,
      onAllocate: (id: string) => handleAllocateFundsClick(id),
    },
  ];

  // Event handlers
  const handleAllocateFundsClick = (userId: string) => {
    setSelectedUserId(userId);
    setAllocateFundsModalOpen(true);
  };

  const handleAllocateFunds = (userId: string, amount: string, note: string, isRecurring: boolean) => {
    const user = subWalletUsers.find(user => user.id === userId);
    toast({
      title: "Funds Allocated",
      description: `Successfully allocated ${amount} to ${user?.name}.`,
    });
  };

  const handleAddUser = (formData: FormData) => {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    
    toast({
      title: "User Added",
      description: `${firstName} ${lastName} has been added as an employee.`,
    });
    
    setAddUserModalOpen(false);
  };

  return (
    <Layout>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Users & Wallets</h1>
            <p className="text-sm text-neutral-500">Manage your employee accounts and sub-wallets</p>
          </div>
          
          <Button onClick={() => setAddUserModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Total Users</h3>
                <p className="text-2xl font-bold">{subWalletUsers.length}</p>
                <p className="text-sm text-neutral-500">Active users: {subWalletUsers.filter(u => u.status === "Active").length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Departments</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">Marketing (1)</span>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">Engineering (1)</span>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">Sales (1)</span>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">Customer Support (1)</span>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">HR (1)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <SubWalletOverview users={subWalletUsers} />

        <AllocateFundsModal 
          isOpen={allocateFundsModalOpen}
          onClose={() => {
            setAllocateFundsModalOpen(false);
            setSelectedUserId(undefined);
          }}
          users={subWalletUsers.map(user => ({
            id: user.id,
            name: user.name,
            department: user.department
          }))}
          onAllocate={handleAllocateFunds}
          selectedUserId={selectedUserId}
        />

        <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new employee account and sub-wallet.
              </DialogDescription>
            </DialogHeader>
            
            <form action={handleAddUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" name="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="john.doe@company.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" placeholder="Marketing, Sales, Engineering, etc." required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit">Monthly Spending Limit</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">$</span>
                    </div>
                    <Input id="monthlyLimit" name="monthlyLimit" className="pl-7" placeholder="1000.00" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initialFunds">Initial Funds</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">$</span>
                    </div>
                    <Input id="initialFunds" name="initialFunds" className="pl-7" placeholder="500.00" required />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddUserModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
