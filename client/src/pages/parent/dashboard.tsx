import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChildAccountsOverview, { ChildAccount } from "@/components/parent/child-accounts-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllowanceSettings, AllowanceModal } from "@/components/modals/allowance-modal";
import { SpendingRules, SpendingRulesModal } from "@/components/modals/spending-rules-modal";
import { SavingsGoal } from "@/components/child/savings-goals-display";
import { Button } from "@/components/ui/button";
import { PiggyBank, DollarSign, CreditCard, Bell, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockChildAccounts: ChildAccount[] = [
  {
    id: "child1",
    name: "Emily Smith",
    age: 12,
    balances: {
      spendable: "45.50",
      savings: "125.75",
      total: "171.25"
    },
    allowance: {
      amount: "10.00",
      frequency: "weekly",
      autoDeposit: true
    },
    savingsGoalsCount: 2,
    spendingRequestsCount: 1
  },
  {
    id: "child2",
    name: "Michael Johnson",
    age: 9,
    balances: {
      spendable: "28.25",
      savings: "85.00",
      total: "113.25"
    },
    allowance: {
      amount: "7.50",
      frequency: "weekly",
      autoDeposit: true
    },
    savingsGoalsCount: 1,
    spendingRequestsCount: 0
  }
];

const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "goal1",
    name: "New Bicycle",
    targetAmount: "150.00",
    currentAmount: "75.00",
    dueDate: "2023-12-25",
    category: "toys",
    parentContribution: 20,
    isCompleted: false
  },
  {
    id: "goal2",
    name: "Video Game",
    targetAmount: "60.00",
    currentAmount: "45.00",
    dueDate: "2023-10-30",
    category: "games",
    parentContribution: 0,
    isCompleted: false
  },
  {
    id: "goal3",
    name: "School Supplies",
    targetAmount: "45.00",
    currentAmount: "45.00",
    dueDate: "2023-09-01",
    category: "education",
    parentContribution: 50,
    isCompleted: true
  }
];

const mockPendingRequests = [
  {
    id: "req1",
    childName: "Emily Smith",
    merchantName: "Game Stop",
    amount: "24.99",
    reason: "I want to buy a new game that just came out. I've been saving for it and have good grades.",
    category: "gaming",
    date: "2023-09-25"
  }
];

export default function ParentDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
  const [spendingRulesModalOpen, setSpendingRulesModalOpen] = useState(false);

  const selectedChild = selectedChildId 
    ? mockChildAccounts.find(child => child.id === selectedChildId)
    : null;

  const handleManageAllowance = (childId: string) => {
    setSelectedChildId(childId);
    setAllowanceModalOpen(true);
  };

  const handleManageSpendingRules = (childId: string) => {
    setSelectedChildId(childId);
    setSpendingRulesModalOpen(true);
  };

  const handleSaveAllowance = (childId: string, settings: AllowanceSettings) => {
    console.log("Saving allowance settings:", childId, settings);
    toast({
      title: "Allowance Updated",
      description: `Allowance settings updated for ${selectedChild?.name}`,
    });
  };

  const handleSaveSpendingRules = (childId: string, rules: SpendingRules) => {
    console.log("Saving spending rules:", childId, rules);
    toast({
      title: "Spending Rules Updated",
      description: `Spending rules updated for ${selectedChild?.name}`,
    });
  };

  const handleContributeToGoal = (goalId: string) => {
    console.log("Contributing to goal:", goalId);
    toast({
      title: "Contribution Added",
      description: "Your contribution has been added to the savings goal.",
    });
  };

  const handleViewGoalDetails = (goalId: string) => {
    console.log("Viewing goal details:", goalId);
  };

  const handleApproveRequest = (requestId: string) => {
    console.log("Approving request:", requestId);
    toast({
      title: "Request Approved",
      description: "The spending request has been approved.",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    console.log("Rejecting request:", requestId);
    toast({
      title: "Request Rejected",
      description: "The spending request has been rejected.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Parent Dashboard - Family Wallet</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="savings">Savings Goals</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    Total Family Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$284.50</div>
                  <p className="text-xs text-muted-foreground">All accounts combined</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <PiggyBank className="h-4 w-4 mr-2 text-muted-foreground" />
                    Active Savings Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Across all children</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Pending Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Require your attention</p>
                </CardContent>
              </Card>
            </div>
            
            <ChildAccountsOverview 
              childAccounts={mockChildAccounts}
              onManageAllowance={handleManageAllowance}
              onManageSpendingRules={handleManageSpendingRules}
              onViewChildDetails={(childId) => console.log("View child details:", childId)}
            />
          </TabsContent>
          
          {/* Savings Goals Tab */}
          <TabsContent value="savings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Children's Savings Goals</h2>
            </div>
            
            {mockSavingsGoals.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                  <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Savings Goals Yet</h3>
                  <p className="mb-4 text-muted-foreground max-w-md">
                    Your children haven't created any savings goals yet. Encourage them to set goals for things they want.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockSavingsGoals.map((goal) => (
                  <Card key={goal.id} className={goal.isCompleted ? "bg-muted/50" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {goal.isCompleted && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            Completed
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Progress: ${goal.currentAmount} of ${goal.targetAmount}</span>
                            <span>{Math.round((parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100)}%</span>
                          </div>
                          <div className="mt-1 h-2 w-full bg-muted overflow-hidden rounded-full">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(100, (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Due Date</p>
                            <p>{typeof goal.dueDate === 'string' ? goal.dueDate : goal.dueDate ? format(goal.dueDate, 'PP') : 'None'}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-muted-foreground">Your Contribution</p>
                            <p>{goal.parentContribution}%</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button 
                            size="sm" 
                            onClick={() => handleContributeToGoal(goal.id)}
                            disabled={goal.isCompleted}
                          >
                            <DollarSign className="h-4 w-4 mr-1" /> Contribute
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary"
                            onClick={() => handleViewGoalDetails(goal.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Pending Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Pending Approval Requests</h2>
            </div>
            
            {mockPendingRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                  <p className="mb-4 text-muted-foreground max-w-md">
                    You have no pending spending requests from your children at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {mockPendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{request.childName} wants to spend ${request.amount}</h3>
                            <p className="text-sm text-muted-foreground">at {request.merchantName} • {request.date}</p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary capitalize">
                            {request.category}
                          </span>
                        </div>
                        
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm italic">"{request.reason}"</p>
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                          <Button 
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Decline
                          </Button>
                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modals */}
      {selectedChild && (
        <>
          <AllowanceModal 
            isOpen={allowanceModalOpen}
            onClose={() => setAllowanceModalOpen(false)}
            onSave={handleSaveAllowance}
            childAccount={{
              id: selectedChild.id,
              name: selectedChild.name
            }}
            currentSettings={selectedChild.allowance ? {
              amount: selectedChild.allowance.amount,
              frequency: selectedChild.allowance.frequency,
              startDate: new Date(),
              splitAllocation: {
                spendable: 70,
                savings: 30
              },
              autoTransfer: selectedChild.allowance.autoDeposit
            } : undefined}
          />
          
          <SpendingRulesModal
            isOpen={spendingRulesModalOpen}
            onClose={() => setSpendingRulesModalOpen(false)}
            onSave={handleSaveSpendingRules}
            childAccount={{
              id: selectedChild.id,
              name: selectedChild.name
            }}
          />
        </>
      )}
    </>
  );
}