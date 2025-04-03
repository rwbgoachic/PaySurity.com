import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  ArrowLeftRight,
  UserPlus,
  Calendar,
  Clock,
  Edit,
  Trash2,
  FileText,
  MessageSquare,
  Mail,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
} from "lucide-react";

export default function BistroBeastStaff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);

  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "server",
    payRate: "",
    isFullTime: true,
  });

  // Mock staff data
  const staffMembers = [
    { id: 1, firstName: "John", lastName: "Doe", role: "Manager", email: "john.doe@example.com", phone: "555-123-4567", status: "active", payRate: 25.00, hoursThisWeek: 38.5, isFullTime: true, avatar: null },
    { id: 2, firstName: "Jane", lastName: "Smith", role: "Server", email: "jane.smith@example.com", phone: "555-234-5678", status: "active", payRate: 15.00, hoursThisWeek: 32.0, isFullTime: true, avatar: null },
    { id: 3, firstName: "Robert", lastName: "Johnson", role: "Chef", email: "robert.j@example.com", phone: "555-345-6789", status: "active", payRate: 22.00, hoursThisWeek: 40.0, isFullTime: true, avatar: null },
    { id: 4, firstName: "Emily", lastName: "Williams", role: "Server", email: "emily.w@example.com", phone: "555-456-7890", status: "active", payRate: 14.50, hoursThisWeek: 25.5, isFullTime: false, avatar: null },
    { id: 5, firstName: "Michael", lastName: "Brown", role: "Bartender", email: "michael.b@example.com", phone: "555-567-8901", status: "active", payRate: 18.00, hoursThisWeek: 35.0, isFullTime: true, avatar: null },
    { id: 6, firstName: "Sarah", lastName: "Davis", role: "Host", email: "sarah.d@example.com", phone: "555-678-9012", status: "inactive", payRate: 14.00, hoursThisWeek: 0, isFullTime: false, avatar: null },
    { id: 7, firstName: "David", lastName: "Miller", role: "Dishwasher", email: "david.m@example.com", phone: "555-789-0123", status: "active", payRate: 13.50, hoursThisWeek: 28.0, isFullTime: false, avatar: null },
    { id: 8, firstName: "Lisa", lastName: "Wilson", role: "Server", email: "lisa.w@example.com", phone: "555-890-1234", status: "active", payRate: 15.00, hoursThisWeek: 30.5, isFullTime: true, avatar: null },
  ];

  // Mock schedule data for the week
  const weeklySchedule = [
    {
      day: "Monday",
      shifts: [
        { id: 1, staffId: 1, name: "John Doe", role: "Manager", start: "8:00 AM", end: "4:00 PM" },
        { id: 2, staffId: 3, name: "Robert Johnson", role: "Chef", start: "7:00 AM", end: "3:00 PM" },
        { id: 3, staffId: 2, name: "Jane Smith", role: "Server", start: "11:00 AM", end: "7:00 PM" },
        { id: 4, staffId: 5, name: "Michael Brown", role: "Bartender", start: "4:00 PM", end: "12:00 AM" },
      ]
    },
    {
      day: "Tuesday",
      shifts: [
        { id: 5, staffId: 1, name: "John Doe", role: "Manager", start: "8:00 AM", end: "4:00 PM" },
        { id: 6, staffId: 3, name: "Robert Johnson", role: "Chef", start: "7:00 AM", end: "3:00 PM" },
        { id: 7, staffId: 4, name: "Emily Williams", role: "Server", start: "11:00 AM", end: "7:00 PM" },
        { id: 8, staffId: 5, name: "Michael Brown", role: "Bartender", start: "4:00 PM", end: "12:00 AM" },
      ]
    },
    {
      day: "Wednesday",
      shifts: [
        { id: 9, staffId: 1, name: "John Doe", role: "Manager", start: "8:00 AM", end: "4:00 PM" },
        { id: 10, staffId: 3, name: "Robert Johnson", role: "Chef", start: "7:00 AM", end: "3:00 PM" },
        { id: 11, staffId: 8, name: "Lisa Wilson", role: "Server", start: "11:00 AM", end: "7:00 PM" },
        { id: 12, staffId: 5, name: "Michael Brown", role: "Bartender", start: "4:00 PM", end: "12:00 AM" },
      ]
    },
    {
      day: "Thursday",
      shifts: [
        { id: 13, staffId: 1, name: "John Doe", role: "Manager", start: "8:00 AM", end: "4:00 PM" },
        { id: 14, staffId: 3, name: "Robert Johnson", role: "Chef", start: "7:00 AM", end: "3:00 PM" },
        { id: 15, staffId: 2, name: "Jane Smith", role: "Server", start: "11:00 AM", end: "7:00 PM" },
        { id: 16, staffId: 7, name: "David Miller", role: "Dishwasher", start: "5:00 PM", end: "10:00 PM" },
      ]
    },
    {
      day: "Friday",
      shifts: [
        { id: 17, staffId: 1, name: "John Doe", role: "Manager", start: "8:00 AM", end: "4:00 PM" },
        { id: 18, staffId: 3, name: "Robert Johnson", role: "Chef", start: "7:00 AM", end: "3:00 PM" },
        { id: 19, staffId: 2, name: "Jane Smith", role: "Server", start: "11:00 AM", end: "7:00 PM" },
        { id: 20, staffId: 4, name: "Emily Williams", role: "Server", start: "4:00 PM", end: "10:00 PM" },
        { id: 21, staffId: 5, name: "Michael Brown", role: "Bartender", start: "4:00 PM", end: "12:00 AM" },
        { id: 22, staffId: 7, name: "David Miller", role: "Dishwasher", start: "5:00 PM", end: "11:00 PM" },
      ]
    },
    {
      day: "Saturday",
      shifts: [
        { id: 23, staffId: 1, name: "John Doe", role: "Manager", start: "10:00 AM", end: "6:00 PM" },
        { id: 24, staffId: 3, name: "Robert Johnson", role: "Chef", start: "9:00 AM", end: "5:00 PM" },
        { id: 25, staffId: 8, name: "Lisa Wilson", role: "Server", start: "10:00 AM", end: "6:00 PM" },
        { id: 26, staffId: 4, name: "Emily Williams", role: "Server", start: "4:00 PM", end: "10:00 PM" },
        { id: 27, staffId: 5, name: "Michael Brown", role: "Bartender", start: "4:00 PM", end: "12:00 AM" },
        { id: 28, staffId: 7, name: "David Miller", role: "Dishwasher", start: "12:00 PM", end: "8:00 PM" },
      ]
    },
    {
      day: "Sunday",
      shifts: [
        { id: 29, staffId: 1, name: "John Doe", role: "Manager", start: "10:00 AM", end: "6:00 PM" },
        { id: 30, staffId: 3, name: "Robert Johnson", role: "Chef", start: "9:00 AM", end: "5:00 PM" },
        { id: 31, staffId: 2, name: "Jane Smith", role: "Server", start: "10:00 AM", end: "6:00 PM" },
        { id: 32, staffId: 8, name: "Lisa Wilson", role: "Server", start: "4:00 PM", end: "10:00 PM" },
        { id: 33, staffId: 5, name: "Michael Brown", role: "Bartender", start: "4:00 PM", end: "12:00 AM" },
      ]
    },
  ];

  // Filter staff members based on search term
  const filteredStaff = staffMembers.filter(staff => 
    staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = () => {
    // This would typically make an API call to add the staff member
    console.log("Adding new staff member:", newStaff);
    setShowAddStaffDialog(false);
    // Reset form
    setNewStaff({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "server",
      payRate: "",
      isFullTime: true,
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-neutral-100 text-neutral-800">Inactive</Badge>;
      default:
        return <Badge className="bg-neutral-100 text-neutral-800">Unknown</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Top navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">BistroBeast Staff Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Back to POS
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Staff Management</h2>
            <div className="flex items-center gap-4">
              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Weekly Staff Schedule</DialogTitle>
                    <DialogDescription>
                      View and manage the staff schedule for the current week.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Tabs defaultValue="Monday">
                      <TabsList className="mb-4 grid grid-cols-7">
                        {weeklySchedule.map(day => (
                          <TabsTrigger key={day.day} value={day.day}>{day.day.substring(0, 3)}</TabsTrigger>
                        ))}
                      </TabsList>

                      {weeklySchedule.map(day => (
                        <TabsContent key={day.day} value={day.day}>
                          <Card>
                            <CardHeader>
                              <CardTitle>{day.day} Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {day.shifts.map(shift => (
                                    <TableRow key={shift.id}>
                                      <TableCell className="font-medium">{shift.name}</TableCell>
                                      <TableCell>{shift.role}</TableCell>
                                      <TableCell>{shift.start}</TableCell>
                                      <TableCell>{shift.end}</TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <Button className="mt-4" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Shift
                              </Button>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Close</Button>
                    <Button>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                      Add a new employee to your restaurant staff.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John" 
                          value={newStaff.firstName}
                          onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          value={newStaff.lastName}
                          onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john.doe@example.com" 
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          placeholder="555-123-4567" 
                          value={newStaff.phone}
                          onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newStaff.role}
                          onValueChange={(value) => setNewStaff({...newStaff, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="chef">Chef</SelectItem>
                            <SelectItem value="server">Server</SelectItem>
                            <SelectItem value="bartender">Bartender</SelectItem>
                            <SelectItem value="host">Host/Hostess</SelectItem>
                            <SelectItem value="dishwasher">Dishwasher</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payRate">Pay Rate ($/hr)</Label>
                        <Input 
                          id="payRate" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="15.00" 
                          value={newStaff.payRate}
                          onChange={(e) => setNewStaff({...newStaff, payRate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="isFullTime" 
                        checked={newStaff.isFullTime}
                        onCheckedChange={(checked) => setNewStaff({...newStaff, isFullTime: checked})}
                      />
                      <Label htmlFor="isFullTime">Full-time employee</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddStaffDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddStaff}>Add Staff</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-4 w-1/2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search staff..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500">
                Total Staff: {staffMembers.filter(s => s.status === 'active').length} active
              </span>
              <span className="text-sm text-neutral-500">|</span>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Time Clock
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export Timesheet
              </Button>
            </div>
          </div>

          <Tabs defaultValue="employees" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Pay Rate</TableHead>
                        <TableHead className="text-right">Hours This Week</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map(staff => (
                        <TableRow key={staff.id} className={staff.status === 'inactive' ? 'opacity-60' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                {staff.avatar ? (
                                  <AvatarImage src={staff.avatar} alt={`${staff.firstName} ${staff.lastName}`} />
                                ) : null}
                                <AvatarFallback>{getInitials(staff.firstName, staff.lastName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{staff.firstName} {staff.lastName}</div>
                                <div className="text-sm text-neutral-500">{staff.isFullTime ? 'Full-time' : 'Part-time'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{staff.email}</div>
                              <div>{staff.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(staff.status)}</TableCell>
                          <TableCell className="text-right">${staff.payRate.toFixed(2)}/hr</TableCell>
                          <TableCell className="text-right">{staff.hoursThisWeek.toFixed(1)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Current Week Schedule</CardTitle>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Edit Schedule
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-4">
                      {weeklySchedule.map((day, index) => (
                        <div key={index} className="border rounded-lg">
                          <div className="p-3 font-medium border-b bg-neutral-50">
                            {day.day}
                          </div>
                          <div className="p-3 space-y-3">
                            {day.shifts.map((shift, shiftIndex) => (
                              <div key={shiftIndex} className="text-sm p-2 border rounded-md hover:bg-neutral-50">
                                <div className="font-medium">{shift.name}</div>
                                <div className="text-neutral-500">{shift.role}</div>
                                <div className="text-neutral-500">{shift.start} - {shift.end}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shift Coverage Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-green-50">
                        <h3 className="font-medium text-green-800 mb-2">Fully Staffed Shifts</h3>
                        <div className="flex justify-between items-center">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">15</span>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-yellow-50">
                        <h3 className="font-medium text-yellow-800 mb-2">Understaffed Shifts</h3>
                        <div className="flex justify-between items-center">
                          <AlertTriangle className="h-8 w-8 text-yellow-600" />
                          <span className="text-2xl font-bold text-yellow-600">3</span>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-red-50">
                        <h3 className="font-medium text-red-800 mb-2">Uncovered Shifts</h3>
                        <div className="flex justify-between items-center">
                          <XCircle className="h-8 w-8 text-red-600" />
                          <span className="text-2xl font-bold text-red-600">0</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timesheets">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Time & Attendance</CardTitle>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Mass Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead className="text-right">Hours Today</TableHead>
                        <TableHead className="text-right">Hours This Week</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffMembers.filter(s => s.status === 'active').map(staff => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                {staff.avatar ? (
                                  <AvatarImage src={staff.avatar} alt={`${staff.firstName} ${staff.lastName}`} />
                                ) : null}
                                <AvatarFallback>{getInitials(staff.firstName, staff.lastName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{staff.firstName} {staff.lastName}</div>
                                <div className="text-sm text-neutral-500">{staff.role}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {staff.id % 3 === 0 ? (
                              <Badge className="bg-green-100 text-green-800">On Shift</Badge>
                            ) : (
                              <Badge className="bg-neutral-100 text-neutral-800">Off Duty</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {staff.id % 3 === 0 ? "8:05 AM" : "—"}
                          </TableCell>
                          <TableCell>
                            {staff.id % 3 === 0 ? "—" : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {staff.id % 3 === 0 ? "5h 20m" : "0h 0m"}
                          </TableCell>
                          <TableCell className="text-right">{staff.hoursThisWeek.toFixed(1)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Time
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}