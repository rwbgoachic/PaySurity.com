import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FundRequestItem {
  id: string;
  name: string;
  department: string;
  amount: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

interface FundRequestsProps {
  requests: FundRequestItem[];
}

export default function FundRequests({ requests }: FundRequestsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-base font-medium text-neutral-700 mb-4">Fund Requests</h2>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">No pending fund requests</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                <div>
                  <p className="font-medium text-sm">{request.name}</p>
                  <p className="text-xs text-neutral-500">{request.department} • {request.amount}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="icon" 
                    className="h-8 w-8 bg-green-600 hover:bg-green-700"
                    onClick={() => request.onApprove(request.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8"
                    onClick={() => request.onReject(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
