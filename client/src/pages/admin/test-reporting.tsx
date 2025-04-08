import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertCircle, 
  BarChart4, 
  Check, 
  Clock, 
  Download, 
  File, 
  FileDown, 
  FileJson, 
  FileText, 
  FileType, 
  Filter, 
  Layers, 
  ListFilter, 
  Mail, 
  MoreHorizontal, 
  Pencil, 
  PieChart, 
  Plus, 
  Printer, 
  RefreshCw, 
  Search, 
  Send, 
  Share, 
  Slice, 
  Table as TableIcon, 
  Target, 
  TrendingUp, 
  Users, 
  XCircle 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { useToast } from "@/hooks/use-toast";
import { TestSuite, TestReport, testRecommendationService } from "@/lib/test-recommendation-service";

export default function TestReporting() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailRecipients, setEmailRecipients] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  
  // For the weekly trend chart
  const [trendData, setTrendData] = useState([
    {
      id: "Pass Rate",
      data: [
        { x: '2 Weeks Ago', y: 87 },
        { x: 'Last Week', y: 91 },
        { x: 'This Week', y: 94 }
      ]
    }
  ]);
  
  // For the test distribution pie chart
  const [distributionData, setDistributionData] = useState([
    { id: 'API Tests', value: 220, color: '#0ea5e9' },
    { id: 'UI Tests', value: 135, color: '#8b5cf6' },
    { id: 'Integration Tests', value: 98, color: '#10b981' },
    { id: 'Performance Tests', value: 45, color: '#f59e0b' },
    { id: 'Security Tests', value: 32, color: '#ef4444' }
  ]);
  
  // For the test results summary chart 
  const [resultsData, setResultsData] = useState([
    { status: 'Passed', count: 415, color: '#10b981' },
    { status: 'Failed', count: 35, color: '#ef4444' },
    { status: 'Skipped', count: 22, color: '#f59e0b' },
    { status: 'Blocked', count: 8, color: '#6b7280' }
  ]);

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
            dependencies: ["api-test"]
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
            dependencies: []
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
            lastErrors: [
              {
                message: "Connection timeout after 30s",
                location: "system/network/connection.ts:45",
                timestamp: "2023-03-29T14:22:10Z",
                stackTrace: "Error: Connection timeout\n  at Connection.connect (system/network/connection.ts:45)\n  at SystemTest.setUp (system/test/setup.ts:23)",
                frequency: 3
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
            failureReason: "Database connection pool exhausted"
          }
        ];
        
        setTestSuites(mockTestSuites);
        
        // Generate mock reports using our service
        const mockReports: TestReport[] = mockTestSuites.map(suite => {
          return testRecommendationService.generateReport(suite);
        });
        
        // Add a few more historical reports for each suite
        const historicalReports: TestReport[] = [];
        
        mockTestSuites.forEach(suite => {
          // Add a report from yesterday
          const yesterdayReport = {
            ...testRecommendationService.generateReport(suite),
            id: `report-${suite.id}-${Date.now() - 86400000}`,
            date: new Date(Date.now() - 86400000).toISOString(),
            passRate: Math.max(0, suite.passRate - 2) // Slightly worse performance yesterday
          };
          
          // Add a report from last week
          const lastWeekReport = {
            ...testRecommendationService.generateReport(suite),
            id: `report-${suite.id}-${Date.now() - 604800000}`,
            date: new Date(Date.now() - 604800000).toISOString(),
            passRate: Math.max(0, suite.passRate - 5) // Even worse performance last week
          };
          
          historicalReports.push(yesterdayReport, lastWeekReport);
        });
        
        setTestReports([...mockReports, ...historicalReports].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredReports = testReports.filter(report => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === '' || 
      testSuites.find(s => s.id === report.testSuiteId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply date filter
    let matchesDate = true;
    const reportDate = new Date(report.date);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    switch (dateFilter) {
      case 'today':
        matchesDate = reportDate >= oneDayAgo;
        break;
      case 'week':
        matchesDate = reportDate >= sevenDaysAgo;
        break;
      case 'month':
        matchesDate = reportDate >= thirtyDaysAgo;
        break;
      default:
        matchesDate = true;
    }
    
    // Apply status filter
    let matchesStatus = true;
    switch (statusFilter) {
      case 'passing':
        matchesStatus = report.passRate === 100;
        break;
      case 'failing':
        matchesStatus = report.passRate < 100;
        break;
      default:
        matchesStatus = true;
    }
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const getTestSuiteName = (testSuiteId: string): string => {
    return testSuites.find(s => s.id === testSuiteId)?.name || 'Unknown Test';
  };

  const exportReport = (reportId: string, format: 'pdf' | 'csv' | 'json') => {
    const report = testReports.find(r => r.id === reportId);
    if (!report) return;
    
    // In a real app, this would trigger a download from an API endpoint
    toast({
      title: "Report Export",
      description: `Exported ${getTestSuiteName(report.testSuiteId)} report as ${format.toUpperCase()}`,
    });
  };

  const sendReportEmail = (reportId: string) => {
    const report = testReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Validate email recipients
    if (!emailRecipients.trim()) {
      toast({
        title: "Email Error",
        description: "Please enter at least one email recipient",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send an email via an API
    toast({
      title: "Report Shared",
      description: `${getTestSuiteName(report.testSuiteId)} report sent to ${emailRecipients}`,
    });
    
    // Reset form
    setEmailRecipients('');
    setEmailSubject('');
    setEmailBody('');
    setSelectedReport(null);
  };

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
            <FileText className="mr-2 h-8 w-8 text-primary" /> Test Reporting
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive test reporting, analysis and export functionality
          </p>
        </div>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Test Reports
            </TabsTrigger>
            <TabsTrigger value="trend" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Trend Analysis
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">94.2%</div>
                    <p className="text-sm text-muted-foreground">Overall Pass Rate</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">480</div>
                    <p className="text-sm text-muted-foreground">Total Tests Run</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">35</div>
                    <p className="text-sm text-muted-foreground">Failed Tests</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">82.6%</div>
                    <p className="text-sm text-muted-foreground">Code Coverage</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Result Trend</CardTitle>
                  <CardDescription>
                    Pass rate trend over the last 3 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveLine
                    data={trendData}
                    margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                      type: 'linear',
                      min: 'auto',
                      max: 'auto',
                    }}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Period',
                      legendOffset: 36,
                      legendPosition: 'middle'
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Pass Rate (%)',
                      legendOffset: -40,
                      legendPosition: 'middle'
                    }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    enableSlices="x"
                    colors={["#10b981"]}
                    lineWidth={3}
                    enableArea={true}
                    areaOpacity={0.15}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Test Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of test types
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsivePie
                    data={distributionData}
                    margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#888888"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor="#ffffff"
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 0,
                        translateY: 40,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: '#999',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 12,
                        symbolShape: 'circle',
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Test Results Summary</CardTitle>
                <CardDescription>
                  Breakdown of tests by status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveBar
                  data={resultsData}
                  keys={['count']}
                  indexBy="status"
                  margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ datum: 'data.color' }}
                  borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Status',
                    legendPosition: 'middle',
                    legendOffset: 32
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Count',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
                  animate={true}
                />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Test Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {testSuites
                      .filter(suite => suite.passRate < 100)
                      .map(suite => (
                        <div key={suite.id} className="flex justify-between items-start pb-3 border-b border-border">
                          <div>
                            <div className="font-medium">{suite.name}</div>
                            <div className="text-xs text-muted-foreground">{suite.lastRun}</div>
                            {suite.failureReason && (
                              <div className="text-red-500 text-sm mt-1">{suite.failureReason}</div>
                            )}
                          </div>
                          <Badge className="bg-red-500">{suite.passRate}%</Badge>
                        </div>
                      ))}
                    
                    {testSuites.filter(suite => suite.passRate < 100).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <p>No recent test failures</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testSuites.map(suite => (
                      <div key={suite.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{suite.name}</span>
                          <span className={`font-medium ${suite.coverage >= 80 ? 'text-green-500' : suite.coverage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {suite.coverage}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${suite.coverage >= 80 ? 'bg-green-500' : suite.coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${suite.coverage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Execution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testSuites
                      .sort((a, b) => b.executionTime - a.executionTime)
                      .slice(0, 5)
                      .map(suite => (
                        <div key={suite.id} className="flex justify-between items-center">
                          <div className="text-sm">{suite.name}</div>
                          <Badge variant="outline" className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {suite.executionTime}s
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 py-2">
                  <div className="text-xs text-muted-foreground w-full text-center">
                    Showing 5 slowest test suites
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="relative w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search reports..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="passing">Passing Only</SelectItem>
                    <SelectItem value="failing">Failing Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Reports
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Suite</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="font-medium">{getTestSuiteName(report.testSuiteId)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{format(new Date(report.date), 'MMM dd, yyyy')}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(report.date), 'HH:mm')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span 
                              className={`font-medium ${report.passRate === 100 ? 'text-green-500' : report.passRate >= 90 ? 'text-yellow-500' : 'text-red-500'}`}
                            >
                              {report.passRate}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({report.passedTests}/{report.passedTests + report.failedTests})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{report.duration}s</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.errors.length > 0 ? (
                            <Badge variant="destructive">{report.errors.length} {report.errors.length === 1 ? 'error' : 'errors'}</Badge>
                          ) : (
                            <Badge className="bg-green-500">No errors</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileDown className="h-3 w-3 mr-1" /> Export
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Export As</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => exportReport(report.id, 'pdf')}>
                                  <FileText className="h-4 w-4 mr-2" /> PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportReport(report.id, 'csv')}>
                                  <TableIcon className="h-4 w-4 mr-2" /> CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportReport(report.id, 'json')}>
                                  <FileJson className="h-4 w-4 mr-2" /> JSON
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedReport(report.id)}>
                                  <Share className="h-4 w-4 mr-2" /> Share Report
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 mr-2" /> Print
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">
                                  <XCircle className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredReports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="h-8 w-8 mb-2" />
                            <span>No matching reports found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Suite Trends</CardTitle>
                <CardDescription>
                  Track test health and performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Test Suite</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a test suite" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Suites Combined</SelectItem>
                          {testSuites.map(suite => (
                            <SelectItem key={suite.id} value={suite.id}>
                              {suite.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Time Period</Label>
                      <Select defaultValue="month">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Last Week</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                          <SelectItem value="quarter">Last Quarter</SelectItem>
                          <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Metrics</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="cursor-pointer bg-primary">Pass Rate</Badge>
                        <Badge className="cursor-pointer" variant="outline">Execution Time</Badge>
                        <Badge className="cursor-pointer" variant="outline">Error Count</Badge>
                        <Badge className="cursor-pointer" variant="outline">Coverage</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="text-base font-medium mb-2">Trend Summary</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Overall Trend:</span>
                          <span className="font-medium text-green-500">Improving</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pass Rate Change:</span>
                          <span className="font-medium text-green-500">+4.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Execution Time Change:</span>
                          <span className="font-medium text-red-500">+12.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coverage Change:</span>
                          <span className="font-medium text-green-500">+3.1%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[400px]">
                    <ResponsiveLine
                      data={[
                        {
                          id: "Pass Rate",
                          data: [
                            { x: "Week 1", y: 87 },
                            { x: "Week 2", y: 85 },
                            { x: "Week 3", y: 89 },
                            { x: "Week 4", y: 91 },
                            { x: "Week 5", y: 92 },
                            { x: "Week 6", y: 90 },
                            { x: "Week 7", y: 94 },
                            { x: "Week 8", y: 95 }
                          ]
                        }
                      ]}
                      margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                      xScale={{ type: 'point' }}
                      yScale={{
                        type: 'linear',
                        min: 80,
                        max: 100,
                      }}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Week',
                        legendOffset: 36,
                        legendPosition: 'middle'
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Pass Rate (%)',
                        legendOffset: -40,
                        legendPosition: 'middle'
                      }}
                      pointSize={8}
                      pointColor={{ theme: 'background' }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: 'serieColor' }}
                      enableSlices="x"
                      colors={["#10b981"]}
                      useMesh={true}
                      curve="monotoneX"
                      enableArea={true}
                      areaOpacity={0.1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Failure Analysis</CardTitle>
                  <CardDescription>
                    Common failure patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-red-600 dark:text-red-400">Connection Timeout Issues</span>
                        <Badge variant="outline" className="text-red-600 border-red-200 dark:border-red-800">43% of Failures</Badge>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Network connection timeouts are consistently occurring in system integration tests
                      </p>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">Database Deadlocks</span>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200 dark:border-yellow-800">27% of Failures</Badge>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Performance tests consistently encounter database deadlocks under high load
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-blue-600 dark:text-blue-400">Authentication Errors</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-800">15% of Failures</Badge>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        API tests occasionally encounter authentication token expiration issues
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Other Issues</span>
                        <Badge variant="outline">15% of Failures</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Miscellaneous errors without clear patterns
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>
                    Test execution time trend analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveLine
                    data={[
                      {
                        id: "API Tests",
                        data: [
                          { x: "Week 1", y: 28 },
                          { x: "Week 2", y: 30 },
                          { x: "Week 3", y: 29 },
                          { x: "Week 4", y: 32 },
                          { x: "Week 5", y: 32 },
                          { x: "Week 6", y: 31 },
                          { x: "Week 7", y: 33 },
                          { x: "Week 8", y: 32 }
                        ]
                      },
                      {
                        id: "Integration Tests",
                        data: [
                          { x: "Week 1", y: 82 },
                          { x: "Week 2", y: 85 },
                          { x: "Week 3", y: 87 },
                          { x: "Week 4", y: 84 },
                          { x: "Week 5", y: 88 },
                          { x: "Week 6", y: 87 },
                          { x: "Week 7", y: 85 },
                          { x: "Week 8", y: 87 }
                        ]
                      },
                      {
                        id: "Performance Tests",
                        data: [
                          { x: "Week 1", y: 122 },
                          { x: "Week 2", y: 125 },
                          { x: "Week 3", y: 130 },
                          { x: "Week 4", y: 128 },
                          { x: "Week 5", y: 124 },
                          { x: "Week 6", y: 126 },
                          { x: "Week 7", y: 124 },
                          { x: "Week 8", y: 124 }
                        ]
                      }
                    ]}
                    margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                      type: 'linear',
                      min: 'auto',
                      max: 'auto',
                    }}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Week',
                      legendOffset: 36,
                      legendPosition: 'middle'
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Execution Time (s)',
                      legendOffset: -40,
                      legendPosition: 'middle'
                    }}
                    colors={{ scheme: 'category10' }}
                    pointSize={6}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    enableSlices="x"
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 70,
                        translateY: 0,
                        itemsSpacing: 5,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 20,
                        symbolSize: 12,
                        symbolShape: 'circle',
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Test Reports</CardTitle>
                <CardDescription>
                  Generate and download test reports in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select defaultValue="test">
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="test">Test Results</SelectItem>
                            <SelectItem value="coverage">Coverage Report</SelectItem>
                            <SelectItem value="trend">Trend Analysis</SelectItem>
                            <SelectItem value="summary">Executive Summary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Test Suite</Label>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a test suite" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Test Suites</SelectItem>
                            {testSuites.map(suite => (
                              <SelectItem key={suite.id} value={suite.id}>
                                {suite.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Select defaultValue="week">
                          <SelectTrigger>
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Last 24 Hours</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Include Details</Label>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="charts" defaultChecked />
                            <label
                              htmlFor="charts"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Charts & Graphs
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="errors" defaultChecked />
                            <label
                              htmlFor="errors"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Error Details
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="trends" defaultChecked />
                            <label
                              htmlFor="trends"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Trend Analysis
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="recommendations" defaultChecked />
                            <label
                              htmlFor="recommendations"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Recommendations
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <Card className="border-2 border-primary bg-primary/5">
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <FileText className="h-12 w-12 text-primary" />
                        <div>
                          <h3 className="text-lg font-medium">PDF Report</h3>
                          <p className="text-sm text-muted-foreground">
                            Comprehensive report with charts and tables
                          </p>
                        </div>
                        <Button className="w-full">Download PDF</Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <TableIcon className="h-12 w-12 text-primary/70" />
                        <div>
                          <h3 className="text-lg font-medium">CSV Export</h3>
                          <p className="text-sm text-muted-foreground">
                            Tabular data for spreadsheet analysis
                          </p>
                        </div>
                        <Button variant="outline" className="w-full">Download CSV</Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <FileJson className="h-12 w-12 text-primary/70" />
                        <div>
                          <h3 className="text-lg font-medium">JSON Export</h3>
                          <p className="text-sm text-muted-foreground">
                            Raw data for technical integration
                          </p>
                        </div>
                        <Button variant="outline" className="w-full">Download JSON</Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Scheduled Reports</h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">Weekly Test Summary</div>
                          <div className="text-sm text-muted-foreground">PDF report, every Monday at 9:00 AM</div>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">All Suites</Badge>
                            <Badge variant="outline" className="text-xs">PDF</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <XCircle className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">Monthly Coverage Report</div>
                          <div className="text-sm text-muted-foreground">PDF report, 1st of every month</div>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">All Suites</Badge>
                            <Badge variant="outline" className="text-xs">PDF</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <XCircle className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" /> Add Scheduled Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Email sharing dialog */}
      <Dialog open={selectedReport !== null} onOpenChange={open => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Test Report</DialogTitle>
            <DialogDescription>
              Send the test report to team members via email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Recipients (comma-separated)</Label>
              <Input 
                placeholder="email@example.com, another@example.com" 
                value={emailRecipients} 
                onChange={e => setEmailRecipients(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                placeholder="Test Report" 
                value={emailSubject || `Test Report: ${selectedReport ? getTestSuiteName(testReports.find(r => r.id === selectedReport)?.testSuiteId || '') : ''}`}
                onChange={e => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea
                placeholder="Additional information..." 
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="include-pdf" defaultChecked />
              <label
                htmlFor="include-pdf"
                className="text-sm font-medium leading-none"
              >
                Attach PDF report
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Cancel</Button>
            <Button onClick={() => selectedReport && sendReportEmail(selectedReport)}>
              <Mail className="h-4 w-4 mr-2" /> Send Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}