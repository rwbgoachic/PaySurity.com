import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FundRequestModal from "@/components/modals/fund-request-modal";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, CheckCircle2, XCircle, SendHorizontal } from "lucide-react";

export default function EmployeeFundRequests() {
  const { toast } = useToast();
  const [fundRequestModalOpen, setFundRequestModalOpen] = useState(false);
  
  // Sample fund requests data
  const fundRequests = [
    {
      id: "1",
      date: "Oct 12, 2023",
      amount: "$250.00",
      reason: "Marketing materials for client presentation",
      urgency: "Standard (1-2 days)",
      status: "Pending",
    },
    {
      id: "2",
      date: "Oct 5, 2023",
      amount: "$125.00",
      reason: "Office supplies and stationery",
      urgency: "Standard (1-2 days)",
      status: "Approved",
    },
    {
      id: "3",
      date: "Sep 28, 2023",
      amount: "$75.50",
      reason: "Team lunch expense",
      urgency: "Urgent (within 24 hours)",
      status: "Approved",
    },
    {
      id: "4",
      date: "Sep 20, 2023",
      amount: "$180.00",
      reason: "Software subscription renewal",
      urgency: "Standard (1-2 days)",
      status: "Rejected",
      rejectionReason: "Please use the company account for software subscriptions."
    },
    {
      id: "5",
      date: "Sep 15, 2023",
      amount: "$350.00",
      reason: "Conference registration fee",
      urgency: "Standard (1-2 days)",
      status: "Approved",
    },
  ];

  // Event handlers
  const handleCreateFundRequest = (amount: string, reason: string, urgency: string) => {
    toast({
      title: "Fund Request Submitted",
      description: `Your request for $${amount} has been sent to your employer.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
            <ClockIcon className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Fund Requests</h1>
            <p className="text-sm text-neutral-500">Request additional funds for your wallet</p>
          </div>
          
          <Button onClick={() => setFundRequestModalOpen(true)}>
            <SendHorizontal className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>View all your fund requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {fundRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">You haven't made any fund requests yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFundRequestModalOpen(true)}
                >
                  Create Your First Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {fundRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-neutral-900">{request.amount}</h3>
                        <p className="text-sm text-neutral-500">{request.date}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500 mb-1">Reason</p>
                        <p className="text-neutral-900">{request.reason}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500 mb-1">Urgency</p>
                        <p className="text-neutral-900">{request.urgency}</p>
                      </div>
                    </div>
                    
                    {request.status === "Rejected" && request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 text-red-800 text-sm rounded">
                        <p className="font-medium mb-1">Rejection Reason:</p>
                        <p>{request.rejectionReason}</p>
                      </div>
                    )}
                    
                    {request.status === "Approved" && (
                      <div className="mt-3 p-3 bg-green-50 text-green-800 text-sm rounded">
                        <p>Funds have been added to your wallet.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Request Guidelines</CardTitle>
            <CardDescription>Tips for submitting fund requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium mb-1">Be specific with your reason</h3>
                  <p className="text-sm text-neutral-600">Clearly explain why you need the funds and how they will be used for business purposes.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium mb-1">Only request what you need</h3>
                  <p className="text-sm text-neutral-600">Request the accurate amount needed for your expenses.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium mb-1">Select the appropriate urgency</h3>
                  <p className="text-sm text-neutral-600">Only mark requests as urgent if you genuinely need the funds quickly.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-medium mb-1">Follow up appropriately</h3>
                  <p className="text-sm text-neutral-600">If your request is pending for more than the expected time, contact your manager.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <FundRequestModal 
          isOpen={fundRequestModalOpen}
          onClose={() => setFundRequestModalOpen(false)}
          onSubmit={handleCreateFundRequest}
        />
      </div>
    </Layout>
  );
}
