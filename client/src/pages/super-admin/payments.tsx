import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export default function SuperAdminPayments() {
  return (
    <AdminLayout title="Payment Processing">
      <div className="flex flex-col space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Payment Processing Overview</CardTitle>
            <CardDescription>
              Manage payment processing systems and configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Payment Processing Dashboard</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This feature is currently under development. Check back soon for updates.
                </p>
                <Button className="mt-4">Contact Support</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}