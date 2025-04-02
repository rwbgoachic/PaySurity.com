import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface SubWalletUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  department: string;
  balance: string;
  monthlyLimit: string;
  lastActivity: string;
  status: "Active" | "Inactive";
  onAllocate: (id: string) => void;
}

interface SubWalletOverviewProps {
  users: SubWalletUser[];
}

export default function SubWalletOverview({ users }: SubWalletOverviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-900">Sub-Wallet Overview</CardTitle>
        <p className="text-sm text-neutral-500">Monitor your employee wallets and allocation</p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Balance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Monthly Limit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-sm text-neutral-500 text-center">
                    No sub-wallets found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                          <span>{user.initials}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                          <div className="text-xs text-neutral-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-900">
                      {user.balance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {user.monthlyLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {user.lastActivity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${
                        user.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-neutral-100 text-neutral-800"
                        } rounded-full`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button 
                        variant="link" 
                        className="text-primary font-medium"
                        onClick={() => user.onAllocate(user.id)}
                      >
                        Allocate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
