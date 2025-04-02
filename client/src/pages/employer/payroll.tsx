import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, DollarSign, ArrowRightLeft, Calendar } from "lucide-react";

export default function EmployerPayroll() {
  const { toast } = useToast();
  const [runPayrollModalOpen, setRunPayrollModalOpen] = useState(false);
  const [editSalaryModalOpen, setEditSalaryModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  
  // Sample employees data
  const employees = [
    {
      id: "1",
      name: "Sarah Johnson",
      department: "Marketing",
      salary: "$5,000.00",
      status: "Active",
    },
    {
      id: "2",
      name: "Michael Chen",
      department: "Engineering",
      salary: "$6,500.00",
      status: "Active",
    },
    {
      id: "3",
      name: "James Wilson",
      department: "Sales",
      salary: "$4,800.00",
      status: "Active",
    },
    {
      id: "4",
      name: "Emma Lopez",
      department: "Customer Support",
      salary: "$3,800.00",
      status: "Active",
    },
    {
      id: "5",
      name: "Robert Brown",
      department: "HR",
      salary: "$4,200.00",
      status: "Inactive",
    },
  ];
  
  // Sample payroll history
  const payrollHistory = [
    {
      id: "1",
      date: "Sep 30, 2023",
      employeeCount: 4,
      totalGross: "$20,100.00",
      totalTaxes: "$4,623.00",
      totalNet: "$15,477.00",
    },
    {
      id: "2",
      date: "Aug 31, 2023",
      employeeCount: 4,
      totalGross: "$20,100.00",
      totalTaxes: "$4,623.00",
      totalNet: "$15,477.00",
    },
    {
      id: "3",
      date: "Jul 31, 2023",
      employeeCount: 4,
      totalGross: "$20,100.00",
      totalTaxes: "$4,623.00",
      totalNet: "$15,477.00",
    },
    {
      id: "4",
      date: "Jun 30, 2023",
      employeeCount: 4,
      totalGross: "$20,100.00",
      totalTaxes: "$4,623.00",
      totalNet: "$15,477.00",
    },
  ];
  
  // Tax liabilities
  const taxLiabilities = [
    {
      id: "1",
      type: "Federal Income Tax",
      total: "$2,412.00",
      due: "Oct 15, 2023",
      status: "Pending",
    },
    {
      id: "2",
      type: "Social Security Tax",
      total: "$1,246.20",
      due: "Oct 15, 2023",
      status: "Pending",
    },
    {
      id: "3",
      type: "Medicare Tax",
      total: "$291.45",
      due: "Oct 15, 2023",
      status: "Pending",
    },
    {
      id: "4",
      type: "State Income Tax",
      total: "$673.35",
      due: "Oct 15, 2023",
      status: "Pending",
    },
  ];

  // Event handlers
  const handleOpenRunPayroll = () => {
    setRunPayrollModalOpen(true);
  };

  const handleRunPayroll = (formData: FormData) => {
    toast({
      title: "Payroll Processed",
      description: "Payroll has been successfully processed for all active employees.",
    });
    setRunPayrollModalOpen(false);
  };

  const handleEditSalary = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setEditSalaryModalOpen(true);
  };

  const handleUpdateSalary = (formData: FormData) => {
    const salary = formData.get("salary") as string;
    const employeeId = formData.get("employeeId") as string;
    const employee = employees.find(emp => emp.id === employeeId);
    
    toast({
      title: "Salary Updated",
      description: `${employee?.name}'s salary has been updated to $${salary}.`,
    });
    setEditSalaryModalOpen(false);
  };

  const handleExportPayroll = (payrollId: string) => {
    toast({
      title: "Payroll Exported",
      description: "Payroll data has been exported to Excel.",
    });
  };

  const handleExportTaxes = () => {
    toast({
      title: "Tax Report Exported",
      description: "Tax liabilities report has been exported to Excel.",
    });
  };

  return (
    <Layout>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Payroll</h1>
            <p className="text-sm text-neutral-500">Manage employee salaries and process payroll</p>
          </div>
          
          <Button onClick={handleOpenRunPayroll}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Run Payroll
          </Button>
        </div>
        
        <Tabs defaultValue="employees">
          <TabsList className="mb-6">
            <TabsTrigger value="employees">Employees & Salaries</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
            <TabsTrigger value="taxes">Tax Liabilities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Salary Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Department</th>
                        <th scope="col" className="px-6 py-3">Salary (Monthly)</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">{employee.name}</td>
                          <td className="px-6 py-4">{employee.department}</td>
                          <td className="px-6 py-4 font-medium">{employee.salary}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              employee.status === "Active" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-neutral-100 text-neutral-800"
                            }`}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="link" 
                              className="text-primary"
                              onClick={() => handleEditSalary(employee.id)}
                            >
                              Edit Salary
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payroll History</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Employees</th>
                        <th scope="col" className="px-6 py-3">Gross Total</th>
                        <th scope="col" className="px-6 py-3">Taxes & Deductions</th>
                        <th scope="col" className="px-6 py-3">Net Total</th>
                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollHistory.map((payroll) => (
                        <tr key={payroll.id} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">{payroll.date}</td>
                          <td className="px-6 py-4">{payroll.employeeCount}</td>
                          <td className="px-6 py-4 font-medium">{payroll.totalGross}</td>
                          <td className="px-6 py-4 text-red-600">{payroll.totalTaxes}</td>
                          <td className="px-6 py-4 font-medium">{payroll.totalNet}</td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="link" 
                              className="text-primary"
                              onClick={() => handleExportPayroll(payroll.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="taxes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tax Liabilities</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportTaxes}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Tax Type</th>
                        <th scope="col" className="px-6 py-3">Total Amount</th>
                        <th scope="col" className="px-6 py-3">Due Date</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxLiabilities.map((tax) => (
                        <tr key={tax.id} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">{tax.type}</td>
                          <td className="px-6 py-4 font-medium">{tax.total}</td>
                          <td className="px-6 py-4">{tax.due}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              tax.status === "Paid" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {tax.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={runPayrollModalOpen} onOpenChange={setRunPayrollModalOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Run Payroll</DialogTitle>
              <DialogDescription>
                Process payroll for all active employees. This will transfer funds to employee wallets.
              </DialogDescription>
            </DialogHeader>
            
            <form action={handleRunPayroll}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="payDate">Pay Date</Label>
                  <Input id="payDate" name="payDate" type="date" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payPeriodStart">Pay Period Start</Label>
                  <Input id="payPeriodStart" name="payPeriodStart" type="date" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payPeriodEnd">Pay Period End</Label>
                  <Input id="payPeriodEnd" name="payPeriodEnd" type="date" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" name="notes" placeholder="e.g., Regular monthly payroll" />
                </div>
              </div>
              
              <div className="py-4 border-t border-neutral-200">
                <h3 className="text-sm font-semibold mb-3">Payroll Summary</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Total Active Employees:</span>
                    <span className="text-sm font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Gross Total:</span>
                    <span className="text-sm font-medium">$20,100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Estimated Taxes:</span>
                    <span className="text-sm font-medium">$4,623.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Net Total:</span>
                    <span className="text-sm font-medium">$15,477.00</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRunPayrollModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Process Payroll</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={editSalaryModalOpen} onOpenChange={setEditSalaryModalOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Edit Employee Salary</DialogTitle>
              <DialogDescription>
                Update the monthly salary for this employee.
              </DialogDescription>
            </DialogHeader>
            
            <form action={handleUpdateSalary}>
              <div className="grid gap-4 py-4">
                <input 
                  type="hidden" 
                  name="employeeId" 
                  value={selectedEmployeeId || ""} 
                />
                
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee</Label>
                  <Input 
                    id="employeeName" 
                    value={employees.find(emp => emp.id === selectedEmployeeId)?.name || ""} 
                    disabled 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentSalary">Current Salary (Monthly)</Label>
                  <Input 
                    id="currentSalary" 
                    value={employees.find(emp => emp.id === selectedEmployeeId)?.salary || ""} 
                    disabled 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">New Salary (Monthly)</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">$</span>
                    </div>
                    <Input 
                      id="salary" 
                      name="salary" 
                      className="pl-7" 
                      placeholder="5000.00" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input id="effectiveDate" name="effectiveDate" type="date" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" name="notes" placeholder="e.g., Annual raise" />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditSalaryModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Salary</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
