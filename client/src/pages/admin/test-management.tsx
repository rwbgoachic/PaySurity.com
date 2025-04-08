import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Archive, 
  BarChart4, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  Code, 
  Cog, 
  Download, 
  ExternalLink, 
  EyeOff, 
  FileDown, 
  Filter, 
  FolderTree, 
  GitBranch, 
  GitPullRequest, 
  Laptop, 
  Layers, 
  ListChecks, 
  Loader2, 
  Menu, 
  PlusCircle, 
  Repeat, 
  Search, 
  Settings, 
  Tag, 
  TimerReset, 
  Trash2, 
  UploadCloud
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TestSuite, TestSchedule, TestGroup, TestReport, testRecommendationService } from "@/lib/test-recommendation-service";

export default function TestManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [schedulingTestId, setSchedulingTestId] = useState<string | null>(null);
  const [scheduleOptions, setScheduleOptions] = useState({
    pattern: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    time: '00:00',
    days: ['monday'],
    onCodeChange: false,
    onDeploy: false
  });

  // Mock data loading
  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // Mock test suite data
        const mockTestSuites: TestSuite[] = [
          {
            id: "delivery-test",
            name: "Delivery Service Test Suite",
            lastRun: "2 hours ago",
            testCount: 87,
            passRate: 100,
            executionTime: 45,
            complexity: 'medium',
            priority: 5,
            failureImpact: 'high',
            coverage: 92,
            trend: [
              { x: "Mar 01", y: 97 },
              { x: "Mar 08", y: 98 },
              { x: "Mar 15", y: 100 },
              { x: "Mar 22", y: 99 },
              { x: "Mar 29", y: 100 }
            ],
            tags: ["delivery", "api", "integration"],
            dependencies: ["api-test"],
            group: "Core Services",
            enabled: true,
            criticalPath: true,
            parallelizable: true
          },
          {
            id: "api-test",
            name: "API Test Suite",
            lastRun: "1 day ago",
            testCount: 128,
            passRate: 96,
            executionTime: 32,
            complexity: 'medium',
            priority: 4,
            failureImpact: 'high',
            coverage: 89,
            trend: [
              { x: "Mar 01", y: 90 },
              { x: "Mar 08", y: 92 },
              { x: "Mar 15", y: 95 },
              { x: "Mar 22", y: 93 },
              { x: "Mar 29", y: 96 }
            ],
            tags: ["api", "endpoints", "core"],
            dependencies: [],
            group: "Core Services",
            enabled: true,
            schedule: {
              enabled: true,
              pattern: 'daily',
              time: '01:00',
              onCodeChange: true,
              lastScheduledRun: '2023-04-01T01:00:00Z',
              nextScheduledRun: '2023-04-02T01:00:00Z'
            }
          },
          {
            id: "system-test",
            name: "System Integration Test Suite",
            lastRun: "3 days ago",
            testCount: 94,
            passRate: 88,
            executionTime: 87,
            complexity: 'high',
            priority: 3,
            failureImpact: 'high',
            coverage: 76,
            trend: [
              { x: "Mar 01", y: 82 },
              { x: "Mar 08", y: 85 },
              { x: "Mar 15", y: 90 },
              { x: "Mar 22", y: 87 },
              { x: "Mar 29", y: 88 }
            ],
            tags: ["system", "integration", "core"],
            dependencies: ["api-test"],
            failureReason: "ConnectionTimeoutError in 3 test cases",
            group: "Integration Tests",
            enabled: true,
            lastErrors: [
              {
                message: "Connection timeout after 30s",
                location: "system/network/connection.ts:45",
                timestamp: "2023-03-29T14:22:10Z",
                stackTrace: "Error: Connection timeout\n  at Connection.connect (system/network/connection.ts:45)\n  at SystemTest.setUp (system/test/setup.ts:23)",
                frequency: 3
              },
              {
                message: "Database pool exhausted",
                location: "system/database/pool.ts:78",
                timestamp: "2023-03-29T14:25:32Z",
                frequency: 1
              }
            ]
          },
          {
            id: "performance-test",
            name: "Performance Test Suite",
            lastRun: "1 week ago",
            testCount: 112,
            passRate: 72,
            executionTime: 124,
            complexity: 'high',
            priority: 2,
            failureImpact: 'medium',
            coverage: 65,
            trend: [
              { x: "Mar 01", y: 65 },
              { x: "Mar 08", y: 70 },
              { x: "Mar 15", y: 68 },
              { x: "Mar 22", y: 71 },
              { x: "Mar 29", y: 72 }
            ],
            tags: ["performance", "load", "stress"],
            dependencies: ["system-test", "api-test"],
            failureReason: "Database connection pool exhausted",
            group: "Performance Tests",
            enabled: false
          },
          {
            id: "merchant-test",
            name: "Merchant Onboarding Tests",
            lastRun: "5 days ago",
            testCount: 56,
            passRate: 94,
            executionTime: 35,
            complexity: 'medium',
            priority: 4,
            failureImpact: 'high',
            coverage: 82,
            trend: [
              { x: "Mar 01", y: 88 },
              { x: "Mar 08", y: 91 },
              { x: "Mar 15", y: 94 },
              { x: "Mar 22", y: 93 },
              { x: "Mar 29", y: 94 }
            ],
            tags: ["merchant", "onboarding", "registration"],
            dependencies: ["api-test"],
            group: "Business Logic",
            enabled: true,
            schedule: {
              enabled: true,
              pattern: 'weekly',
              days: ['monday', 'thursday'],
              time: '04:00',
              onDeploy: true,
              lastScheduledRun: '2023-03-28T04:00:00Z',
              nextScheduledRun: '2023-04-04T04:00:00Z'
            }
          },
          {
            id: "bistrobeast-test",
            name: "BistroBeast POS Tests",
            lastRun: "2 days ago",
            testCount: 78,
            passRate: 91,
            executionTime: 55,
            complexity: 'high',
            priority: 5,
            failureImpact: 'high',
            coverage: 80,
            trend: [
              { x: "Mar 01", y: 85 },
              { x: "Mar 08", y: 87 },
              { x: "Mar 15", y: 88 },
              { x: "Mar 22", y: 89 },
              { x: "Mar 29", y: 91 }
            ],
            tags: ["pos", "restaurant", "bistrobeast"],
            dependencies: ["api-test", "system-test"],
            group: "Business Logic",
            enabled: true
          }
        ];
        
        setTestSuites(mockTestSuites);
        
        // Generate groups using our service
        const groups = testRecommendationService.organizeTestGroups(mockTestSuites);
        setTestGroups(groups);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const createSchedule = (testId: string) => {
    const suite = testSuites.find(s => s.id === testId);
    if (!suite) return;

    // Parse time
    const [hours, minutes] = scheduleOptions.time.split(':').map(Number);
    
    const options = {
      hour: hours,
      minute: minutes,
      days: scheduleOptions.days,
      onCodeChange: scheduleOptions.onCodeChange,
      onDeploy: scheduleOptions.onDeploy
    };
    
    const schedule = testRecommendationService.generateSchedule(
      suite, 
      scheduleOptions.pattern,
      options
    );
    
    // Update test suite with schedule
    const updatedSuites = testSuites.map(s => {
      if (s.id === testId) {
        return { ...s, schedule };
      }
      return s;
    });
    
    setTestSuites(updatedSuites);
    setSchedulingTestId(null);
    
    toast({
      title: "Schedule Created",
      description: `Test schedule created for ${suite.name}`,
    });
  };

  const toggleTestEnabled = (testId: string) => {
    const updatedSuites = testSuites.map(suite => {
      if (suite.id === testId) {
        return { 
          ...suite, 
          enabled: !suite.enabled 
        };
      }
      return suite;
    });
    
    setTestSuites(updatedSuites);
    
    const suite = testSuites.find(s => s.id === testId);
    const status = suite?.enabled ? 'disabled' : 'enabled';
    
    toast({
      title: `Test ${status}`,
      description: `${suite?.name} has been ${status}`,
    });
  };

  const exportReport = (testId: string, format: 'pdf' | 'csv' | 'json') => {
    const suite = testSuites.find(s => s.id === testId);
    if (!suite) return;
    
    // In a real app, this would trigger a download
    toast({
      title: "Report Export",
      description: `Exported ${suite.name} report as ${format.toUpperCase()}`,
    });
  };

  const getGroupById = (id: string | null): TestGroup | undefined => {
    if (!id) return undefined;
    return testGroups.find(g => g.id === id);
  };

  const getScheduleText = (schedule?: TestSchedule): string => {
    if (!schedule || !schedule.enabled) return 'Not scheduled';
    
    switch (schedule.pattern) {
      case 'daily':
        return `Daily at ${schedule.time}`;
      
      case 'weekly':
        const days = schedule.days?.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
        return `Weekly on ${days} at ${schedule.time}`;
      
      case 'monthly':
        return `Monthly at ${schedule.time}`;
      
      case 'custom':
        return 'Custom schedule';
      
      default:
        return 'Scheduled';
    }
  };

  const filteredTestSuites = selectedGroup
    ? testSuites.filter(suite => suite.group === getGroupById(selectedGroup)?.name)
    : testSuites;

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FolderTree className="mr-2 h-8 w-8 text-primary" /> Test Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize, schedule, and manage all test suites in one place
          </p>
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Calendar View
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Test Groups
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> All Tests
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex gap-6">
              <Card className="w-[350px]">
                <CardHeader>
                  <CardTitle>Test Schedule</CardTitle>
                  <CardDescription>
                    View and manage scheduled test runs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                  
                  <div className="mt-6 space-y-2">
                    <h3 className="text-sm font-medium">Tests for {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'today'}</h3>
                    <ul className="space-y-2">
                      {testSuites
                        .filter(suite => suite.schedule?.enabled)
                        .map(suite => (
                          <li key={suite.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-2" />
                              {suite.name}
                            </span>
                            <Badge variant="outline">{suite.schedule?.time}</Badge>
                          </li>
                        ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Scheduled Test Management</CardTitle>
                  <CardDescription>
                    Configure when tests should run automatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Suite</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Triggers</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testSuites.map((suite) => (
                        <TableRow key={suite.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {suite.enabled ? 
                                <Check className="h-4 w-4 text-green-500" /> : 
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              }
                              <span>{suite.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getScheduleText(suite.schedule)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {suite.schedule?.onCodeChange && (
                                <Badge variant="outline" className="text-xs">
                                  <GitPullRequest className="h-3 w-3 mr-1" /> Code Change
                                </Badge>
                              )}
                              {suite.schedule?.onDeploy && (
                                <Badge variant="outline" className="text-xs">
                                  <UploadCloud className="h-3 w-3 mr-1" /> Deploy
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {suite.schedule?.nextScheduledRun ? 
                              format(new Date(suite.schedule.nextScheduledRun), 'MMM dd, HH:mm') : 
                              'Not scheduled'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSchedulingTestId(suite.id)}>
                                {suite.schedule ? "Edit" : "Schedule"}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleTestEnabled(suite.id)}
                              >
                                {suite.enabled ? "Disable" : "Enable"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {testGroups.map(group => (
                <Card 
                  key={group.id} 
                  className={`cursor-pointer ${selectedGroup === group.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.name}</span>
                      <Badge>{group.testSuiteIds.length} Tests</Badge>
                    </CardTitle>
                    <CardDescription>
                      {group.description || `Group of tests related to ${group.name.toLowerCase()}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {group.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <ul className="space-y-1 max-h-[150px] overflow-y-auto">
                        {group.testSuiteIds.map(id => {
                          const suite = testSuites.find(s => s.id === id);
                          return (
                            <li key={id} className="flex items-center justify-between">
                              <span>{suite?.name}</span>
                              <Badge 
                                className={`${suite?.passRate === 100 ? 'bg-green-500' : suite?.passRate || 0 >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              >
                                {suite?.passRate}%
                              </Badge>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 border-gray-300 bg-gray-50 dark:bg-gray-900 flex items-center justify-center cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <PlusCircle className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Create New Test Group</p>
                </CardContent>
              </Card>
            </div>
            
            {selectedGroup && (
              <Card>
                <CardHeader>
                  <CardTitle>Tests in {getGroupById(selectedGroup)?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Suite</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Run</TableHead>
                        <TableHead>Pass Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTestSuites.map((suite) => (
                        <TableRow key={suite.id}>
                          <TableCell>
                            <div className="font-medium">{suite.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {suite.testCount} tests · {suite.executionTime}s
                            </div>
                          </TableCell>
                          <TableCell>
                            {suite.enabled ? (
                              <Badge className="bg-green-500">Enabled</Badge>
                            ) : (
                              <Badge variant="outline">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell>{suite.lastRun}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span 
                                className={`${suite.passRate === 100 ? 'text-green-500' : suite.passRate >= 90 ? 'text-yellow-500' : 'text-red-500'}`}
                              >
                                {suite.passRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Run</Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleTestEnabled(suite.id)}
                              >
                                {suite.enabled ? "Disable" : "Enable"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Search tests..." 
                  className="w-[300px]"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tests</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" /> More Filters
                </Button>
              </div>
              <div>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" /> New Test Suite
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Suite</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Execution Time</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testSuites.map((suite) => (
                      <TableRow key={suite.id} className={`${!suite.enabled ? 'opacity-60' : ''}`}>
                        <TableCell>
                          <div 
                            className="font-medium hover:text-primary cursor-pointer"
                            onClick={() => setSelectedSuite(suite.id === selectedSuite ? null : suite.id)}
                          >
                            {suite.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-1 mt-1">
                            {suite.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px] px-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{suite.group}</Badge>
                        </TableCell>
                        <TableCell>
                          {suite.enabled ? (
                            <Badge className="bg-green-500">Enabled</Badge>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>{suite.lastRun}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span 
                              className={`font-medium ${suite.passRate === 100 ? 'text-green-500' : suite.passRate >= 90 ? 'text-yellow-500' : 'text-red-500'}`}
                            >
                              {suite.passRate}%
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({Math.round(suite.testCount * suite.passRate / 100)}/{suite.testCount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{suite.executionTime}s</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getScheduleText(suite.schedule)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileDown className="h-3 w-3 mr-1" /> Export
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Export Test Report</DialogTitle>
                                  <DialogDescription>
                                    Choose a format to export {suite.name} test results
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-3 gap-4 py-4">
                                  <Button 
                                    variant="outline" 
                                    className="flex-col h-auto py-4"
                                    onClick={() => exportReport(suite.id, 'pdf')}
                                  >
                                    <FileDown className="h-8 w-8 mb-2" />
                                    <span>PDF</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-col h-auto py-4"
                                    onClick={() => exportReport(suite.id, 'csv')}
                                  >
                                    <FileDown className="h-8 w-8 mb-2" />
                                    <span>CSV</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-col h-auto py-4"
                                    onClick={() => exportReport(suite.id, 'json')}
                                  >
                                    <FileDown className="h-8 w-8 mb-2" />
                                    <span>JSON</span>
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleTestEnabled(suite.id)}
                            >
                              {suite.enabled ? 
                                <EyeOff className="h-3 w-3 mr-1" /> : 
                                <Check className="h-3 w-3 mr-1" />
                              }
                              {suite.enabled ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {selectedSuite && (
              <Accordion type="single" collapsible defaultValue="details" className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger>
                    <h3 className="text-lg font-medium">Test Suite Details</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Test Information</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Name:</span>
                                  <span className="font-medium">{testSuites.find(s => s.id === selectedSuite)?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Group:</span>
                                  <span>{testSuites.find(s => s.id === selectedSuite)?.group}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Priority:</span>
                                  <span>{testSuites.find(s => s.id === selectedSuite)?.priority}/5</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Complexity:</span>
                                  <span className="capitalize">{testSuites.find(s => s.id === selectedSuite)?.complexity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Test Count:</span>
                                  <span>{testSuites.find(s => s.id === selectedSuite)?.testCount} tests</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Coverage:</span>
                                  <span>{testSuites.find(s => s.id === selectedSuite)?.coverage}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Last Run:</span>
                                  <span>{testSuites.find(s => s.id === selectedSuite)?.lastRun}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Pass Rate:</span>
                                  <span className="font-medium">{testSuites.find(s => s.id === selectedSuite)?.passRate}%</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Dependencies</h4>
                              <div className="space-y-1">
                                {testSuites.find(s => s.id === selectedSuite)?.dependencies?.map(dep => {
                                  const depSuite = testSuites.find(s => s.id === dep);
                                  return (
                                    <div key={dep} className="flex items-center gap-2 text-sm">
                                      <GitBranch className="h-4 w-4 text-primary" />
                                      <span>{depSuite?.name}</span>
                                    </div>
                                  );
                                })}
                                {(!testSuites.find(s => s.id === selectedSuite)?.dependencies?.length) && (
                                  <span className="text-sm text-muted-foreground">No dependencies</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Failure Information</h4>
                              {testSuites.find(s => s.id === selectedSuite)?.failureReason ? (
                                <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950 rounded">
                                  {testSuites.find(s => s.id === selectedSuite)?.failureReason}
                                </div>
                              ) : (
                                <div className="text-sm text-green-500 p-2 bg-green-50 dark:bg-green-950 rounded">
                                  No failures detected in the last run
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {testSuites.find(s => s.id === selectedSuite)?.lastErrors?.length ? (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Error Analysis</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                  {testSuites.find(s => s.id === selectedSuite)?.lastErrors?.map((error, i) => (
                                    <div key={i} className="p-2 bg-red-50 dark:bg-red-950 rounded text-sm">
                                      <div className="font-medium text-red-600 dark:text-red-400">{error.message}</div>
                                      <div className="text-xs text-muted-foreground flex justify-between mt-1">
                                        <span>Location: {error.location}</span>
                                        <span>Occurrences: {error.frequency || 1}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-green-50 dark:bg-green-950 p-3 rounded text-sm text-green-600 dark:text-green-400">
                                No errors recorded in the last test run
                              </div>
                            )}
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Optimization Suggestions</h4>
                              {(() => {
                                const suite = testSuites.find(s => s.id === selectedSuite);
                                if (!suite) return null;
                                
                                const analysis = testRecommendationService.analyzePerformance(suite);
                                
                                return (
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Efficiency Rating:</span>
                                      <Badge 
                                        className={`
                                          ${analysis.efficiencyRating === 'excellent' ? 'bg-green-500' : 
                                            analysis.efficiencyRating === 'good' ? 'bg-blue-500' : 
                                            analysis.efficiencyRating === 'fair' ? 'bg-yellow-500' : 
                                            'bg-red-500'
                                          }
                                        `}
                                      >
                                        {analysis.efficiencyRating.toUpperCase()}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Tests per Second:</span>
                                      <span className="font-medium">{analysis.testsPerSecond.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Parallelization Potential:</span>
                                      <Badge variant="outline">
                                        {analysis.parallelizationPotential.toUpperCase()}
                                      </Badge>
                                    </div>
                                    
                                    <div>
                                      <span className="text-sm font-medium">Optimization Suggestions:</span>
                                      <ul className="mt-1 space-y-1 text-sm">
                                        {analysis.optimizations.map((opt: string, i: number) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>{opt}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    {analysis.potentialTimeSavings > 0 && (
                                      <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
                                        <span className="text-sm text-blue-600 dark:text-blue-400">
                                          Potential time savings: <span className="font-medium">{analysis.potentialTimeSavings}s</span> ({Math.round(analysis.potentialTimeSavings / suite.executionTime * 100)}% improvement)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Environment Settings</CardTitle>
                <CardDescription>
                  Configure global settings for all test suites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between space-x-4">
                      <div>
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email alerts when tests fail or succeed
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-start justify-between space-x-4">
                      <div>
                        <Label className="text-base">Slack Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Post test results to a Slack channel
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-start justify-between space-x-4">
                      <div>
                        <Label className="text-base">Dashboard Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Show alerts on the dashboard for critical test failures
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Global Schedule Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between space-x-4">
                      <div>
                        <Label className="text-base">Auto-Run on Code Changes</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically run related tests when code is changed
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-start justify-between space-x-4">
                      <div>
                        <Label className="text-base">Auto-Run on Deployment</Label>
                        <p className="text-sm text-muted-foreground">
                          Run tests before each deployment
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-start justify-between space-x-4">
                      <div>
                        <Label className="text-base">Daily Health Check</Label>
                        <p className="text-sm text-muted-foreground">
                          Run critical tests every day to monitor system health
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Retention</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Keep Test Results For</Label>
                      <Select defaultValue="90">
                        <SelectTrigger>
                          <SelectValue placeholder="Select retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="forever">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Error Log Retention</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Select retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Performance Settings</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Timeout</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="30" className="w-24" />
                        <span className="text-sm text-muted-foreground">seconds</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Concurrency Limit</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="4" className="w-24" />
                        <span className="text-sm text-muted-foreground">concurrent tests</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Retry Failed Tests</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="3" className="w-24" />
                        <span className="text-sm text-muted-foreground">attempts</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Abort on Critical Failure</Label>
                        <Switch defaultChecked />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Stop test execution when a critical test fails
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Test scheduling dialog */}
      <Dialog open={schedulingTestId !== null} onOpenChange={open => !open && setSchedulingTestId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Test Run</DialogTitle>
            <DialogDescription>
              Configure when this test suite should run automatically
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Schedule Pattern</Label>
              <Select 
                value={scheduleOptions.pattern} 
                onValueChange={(value: any) => setScheduleOptions({ ...scheduleOptions, pattern: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Run Time</Label>
              <Input 
                type="time" 
                value={scheduleOptions.time}
                onChange={e => setScheduleOptions({ ...scheduleOptions, time: e.target.value })}
              />
            </div>
            
            {scheduleOptions.pattern === 'weekly' && (
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox 
                        id={day} 
                        checked={scheduleOptions.days.includes(day)}
                        onCheckedChange={checked => {
                          const newDays = checked 
                            ? [...scheduleOptions.days, day]
                            : scheduleOptions.days.filter(d => d !== day);
                          setScheduleOptions({ ...scheduleOptions, days: newDays });
                        }}
                      />
                      <label
                        htmlFor={day}
                        className="text-sm font-medium leading-none capitalize"
                      >
                        {day.slice(0, 3)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Additional Triggers</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="on-code-change" 
                    checked={scheduleOptions.onCodeChange}
                    onCheckedChange={checked => setScheduleOptions({ ...scheduleOptions, onCodeChange: !!checked })}
                  />
                  <label
                    htmlFor="on-code-change"
                    className="text-sm font-medium leading-none"
                  >
                    Run on code changes
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="on-deploy" 
                    checked={scheduleOptions.onDeploy}
                    onCheckedChange={checked => setScheduleOptions({ ...scheduleOptions, onDeploy: !!checked })}
                  />
                  <label
                    htmlFor="on-deploy"
                    className="text-sm font-medium leading-none"
                  >
                    Run on deployment
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedulingTestId(null)}>Cancel</Button>
            <Button onClick={() => schedulingTestId && createSchedule(schedulingTestId)}>Create Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}