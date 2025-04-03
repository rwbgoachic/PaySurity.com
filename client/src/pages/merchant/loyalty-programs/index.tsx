import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  Users,
  PlusCircle,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BarChart,
  Sparkles,
  Clock,
  UserPlus,
  Gift,
  Calendar,
  Tag,
} from "lucide-react";

export default function LoyaltyPrograms() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("active");
  
  // Fetch the merchant profile data
  const {
    data: merchantProfiles,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ["/api/merchant-profiles"],
  });
  
  const merchantProfile = merchantProfiles && merchantProfiles.length > 0 ? merchantProfiles[0] : null;
  
  // Fetch loyalty programs if merchant profile exists
  const {
    data: loyaltyPrograms,
    isLoading: isLoadingPrograms,
  } = useQuery({
    queryKey: ["/api/merchant-profiles", merchantProfile?.id, "loyalty-programs"],
    enabled: !!merchantProfile?.id,
  });
  
  // Sample loyalty analytics data (in a real app, this would come from the API)
  const sampleAnalytics = {
    totalMembers: 532,
    activeMembers: 316,
    averageSpend: "$58.75",
    redemptionRate: "27%",
    memberGrowth: "+12%",
    pointsIssued: 78560,
    pointsRedeemed: 42340,
  };
  
  // Show loading state if data is being fetched
  if (isLoadingProfile || (merchantProfile && isLoadingPrograms)) {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[280px]" />
            <Skeleton className="h-4 w-[340px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid gap-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  // Show merchant profile creation prompt if no profile exists
  if (!merchantProfile) {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Merchant Profile Required</CardTitle>
            <CardDescription>
              You need to create a merchant profile before you can manage loyalty programs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A merchant profile is required to set up and manage loyalty programs.
              Create your merchant profile to continue.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/merchant/onboarding")}>
              Create Merchant Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show verification required message if merchant is not verified
  if (merchantProfile.verificationStatus !== "verified") {
    return (
      <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-6">
          <Button 
            variant="ghost" 
            className="w-fit p-0 flex items-center gap-2"
            onClick={() => navigate("/merchant/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Loyalty Programs</h1>
          <p className="text-muted-foreground">
            Create and manage customer loyalty programs
          </p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto my-4 rounded-full bg-yellow-100 p-3 w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Verification Required</CardTitle>
            <CardDescription>
              Your merchant account must be verified before you can create loyalty programs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
              To ensure security and compliance with regulations, we require all merchants to complete the verification process before creating loyalty programs.
            </p>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-1">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Verification Status</p>
                    <p className="text-sm text-muted-foreground">
                      {merchantProfile.verificationStatus === "not_started" ? "Not Started" : "Pending Approval"}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {merchantProfile.verificationStatus === "not_started" ? "Not Started" : "Pending"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate("/merchant/verification")}
            >
              {merchantProfile.verificationStatus === "not_started" ? "Start Verification" : "Check Verification Status"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Filter loyalty programs based on active tab
  const filteredPrograms = loyaltyPrograms?.filter(program => {
    if (activeTab === "active") return program.isActive;
    if (activeTab === "inactive") return !program.isActive;
    return true; // 'all' tab
  });
  
  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col gap-2 mb-6">
        <Button 
          variant="ghost" 
          className="w-fit p-0 flex items-center gap-2"
          onClick={() => navigate("/merchant/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Programs</h1>
        <p className="text-muted-foreground">
          Create and manage customer loyalty programs
        </p>
      </div>
      
      {/* Loyalty Program Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAnalytics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{sampleAnalytics.memberGrowth}</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAnalytics.redemptionRate}</div>
            <p className="text-xs text-muted-foreground">
              {sampleAnalytics.pointsRedeemed} points redeemed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Member Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAnalytics.averageSpend}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Loyalty Programs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Loyalty Programs</h2>
          <Button 
            size="sm" 
            onClick={() => navigate("/merchant/loyalty-programs/new")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Program
          </Button>
        </div>
        
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {loyaltyPrograms?.length ? (
              filteredPrograms?.length ? (
                filteredPrograms.map((program) => (
                  <Card key={program.id} className="overflow-hidden">
                    <div className="md:grid md:grid-cols-[1fr_200px]">
                      <div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>{program.name}</CardTitle>
                              <CardDescription>
                                {program.type.charAt(0).toUpperCase() + program.type.slice(1).replace('_', ' ')} Program
                              </CardDescription>
                            </div>
                            <Badge 
                              variant={program.isActive ? "default" : "outline"}
                              className={program.isActive ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-200" : ""}
                            >
                              {program.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground">
                            {program.description}
                          </p>
                          
                          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Earn Rate:</span>{" "}
                              {program.earnRateAmount} {program.earnRateUnit}
                            </div>
                            <div>
                              <span className="font-medium">Redemption:</span>{" "}
                              {program.redemptionAmount} {program.redemptionUnit}
                            </div>
                            
                            <div>
                              <span className="font-medium">Members:</span>{" "}
                              {program.memberCount || "0"}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>{" "}
                              {new Date(program.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                      <div className="flex flex-col justify-center items-center p-6 bg-muted/10">
                        <Button
                          className="w-full mb-2"
                          onClick={() => navigate(`/merchant/loyalty-programs/${program.id}`)}
                        >
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/merchant/loyalty-programs/${program.id}/members`)}
                        >
                          View Members
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto my-4 rounded-full bg-muted p-3 w-16 h-16 flex items-center justify-center">
                      <Award className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <CardTitle>No {activeTab !== "all" ? activeTab : ""} Loyalty Programs</CardTitle>
                    <CardDescription>
                      {activeTab === "active" 
                        ? "You don't have any active loyalty programs"
                        : activeTab === "inactive"
                          ? "You don't have any inactive loyalty programs"
                          : "You haven't created any loyalty programs yet"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "active" && loyaltyPrograms.some(p => !p.isActive)
                        ? "You have inactive programs. Switch tabs to view them or create a new program."
                        : "Create a loyalty program to reward your customers and increase retention."
                      }
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button onClick={() => navigate("/merchant/loyalty-programs/new")}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Loyalty Program
                    </Button>
                  </CardFooter>
                </Card>
              )
            ) : (
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto my-4 rounded-full bg-muted p-3 w-16 h-16 flex items-center justify-center">
                    <Award className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle>No Loyalty Programs</CardTitle>
                  <CardDescription>
                    You haven't created any loyalty programs yet
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Create a loyalty program to reward your customers and increase retention.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => navigate("/merchant/loyalty-programs/new")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Loyalty Program
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Loyalty Program Types */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold">Loyalty Program Types</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Points Program</CardTitle>
              <CardDescription>
                Customers earn points based on purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reward customers with points for every purchase, which can be redeemed for discounts, free products, or special offers.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/merchant/loyalty-programs/new?type=points")}
              >
                Create Points Program
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Visit Program</CardTitle>
              <CardDescription>
                Reward frequent visitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reward customers based on the number of visits, regardless of purchase amount. Perfect for cafes and service businesses.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/merchant/loyalty-programs/new?type=visits")}
              >
                Create Visit Program
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Tiered Program</CardTitle>
              <CardDescription>
                Multi-level loyalty benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create different membership tiers with increasing benefits. Customers move up tiers as they engage more with your business.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/merchant/loyalty-programs/new?type=tiered")}
              >
                Create Tiered Program
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Member Management & Insights */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold">Member Management & Insights</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Customer Membership</CardTitle>
              <CardDescription>
                Manage all your loyalty program members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Members</span>
                  <span className="text-sm font-medium">{sampleAnalytics.activeMembers}/{sampleAnalytics.totalMembers}</span>
                </div>
                <Progress value={(sampleAnalytics.activeMembers / sampleAnalytics.totalMembers) * 100} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">New This Month</p>
                  <p className="font-medium">+48 members</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Retention Rate</p>
                  <p className="font-medium">78%</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate("/merchant/members")}
              >
                Manage Members
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="rounded-full bg-primary/10 p-2 w-fit">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Program Analytics</CardTitle>
              <CardDescription>
                Track the performance of your loyalty programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Points Issued</p>
                  <p className="font-medium">{sampleAnalytics.pointsIssued.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Points Redeemed</p>
                  <p className="font-medium">{sampleAnalytics.pointsRedeemed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg. Member Value</p>
                  <p className="font-medium">$327.50</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Repeat Purchase</p>
                  <p className="font-medium">+42%</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate("/merchant/loyalty-analytics")}
              >
                View Analytics
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Resources */}
      <div className="mt-12 space-y-4 bg-muted/20 p-6 rounded-lg">
        <h3 className="text-lg font-medium">Loyalty Program Resources</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Loyalty Best Practices</p>
              <p className="text-sm text-muted-foreground">
                Learn how to create effective loyalty programs that drive customer retention.
              </p>
              <a href="#" className="text-sm font-medium text-primary mt-1 inline-block">
                Read Guide
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Member Acquisition</p>
              <p className="text-sm text-muted-foreground">
                Tips and strategies to grow your loyalty program membership.
              </p>
              <a href="#" className="text-sm font-medium text-primary mt-1 inline-block">
                Learn More
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Seasonal Promotions</p>
              <p className="text-sm text-muted-foreground">
                Ideas for seasonal loyalty campaigns to boost engagement.
              </p>
              <a href="#" className="text-sm font-medium text-primary mt-1 inline-block">
                View Calendar
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <BarChart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">ROI Calculator</p>
              <p className="text-sm text-muted-foreground">
                Calculate the return on investment for your loyalty program.
              </p>
              <a href="#" className="text-sm font-medium text-primary mt-1 inline-block">
                Use Calculator
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}