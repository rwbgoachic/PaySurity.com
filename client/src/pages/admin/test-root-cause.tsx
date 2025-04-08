import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle,
  BarChart4,
  Bug,
  Check,
  CheckCircle,
  Code,
  FileSearch,
  GitBranch,
  GitCommit,
  Github,
  History,
  Link2,
  Loader2,
  Network,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  ThumbsUp,
  Wifi,
  XCircle,
  Zap,
  Clock,
  Database,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveSankey } from "@nivo/sankey";
import { useToast } from "@/hooks/use-toast";
import { TestSuite, TestError, RootCauseAnalysis, testRecommendationService } from "@/lib/test-recommendation-service";

export default function TestRootCause() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorsByType, setErrorsByType] = useState<{[key: string]: number}>({});
  
  // Mock data for the Sankey diagram (error flows)
  const [sankeyData, setSankeyData] = useState({
    nodes: [
      { id: 'HTTP Requests', color: '#4f46e5' },
      { id: 'API Layer', color: '#8b5cf6' },
      { id: 'Database', color: '#06b6d4' },
      { id: 'Authentication', color: '#f43f5e' },
      { id: 'Network', color: '#10b981' },
      { id: 'Connection Timeout', color: '#f97316' },
      { id: 'Pool Exhausted', color: '#6366f1' },
      { id: 'Auth Failure', color: '#ef4444' },
      { id: 'DNS Error', color: '#9333ea' },
      { id: 'Rate Limiting', color: '#f59e0b' }
    ],
    links: [
      { source: 'HTTP Requests', target: 'API Layer', value: 25 },
      { source: 'API Layer', target: 'Database', value: 15 },
      { source: 'API Layer', target: 'Authentication', value: 10 },
      { source: 'HTTP Requests', target: 'Network', value: 20 },
      { source: 'Database', target: 'Connection Timeout', value: 8 },
      { source: 'Database', target: 'Pool Exhausted', value: 7 },
      { source: 'Authentication', target: 'Auth Failure', value: 10 },
      { source: 'Network', target: 'DNS Error', value: 12 },
      { source: 'Network', target: 'Connection Timeout', value: 5 },
      { source: 'API Layer', target: 'Rate Limiting', value: 5 }
    ]
  });

  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // Mock test suite data with error details
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
            dependencies: [],
            lastErrors: [
              {
                message: "API rate limit exceeded",
                location: "api/client.ts:52",
                timestamp: "2023-03-29T15:45:22Z",
                frequency: 3
              },
              {
                message: "Invalid authentication token",
                location: "api/auth/token.ts:28",
                timestamp: "2023-03-29T15:46:10Z",
                frequency: 1
              }
            ]
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
              },
              {
                message: "DNS resolution failed for service-b.internal",
                location: "system/network/dns.ts:32",
                timestamp: "2023-03-29T14:24:05Z",
                frequency: 2
              },
              {
                message: "Failed to parse response JSON",
                location: "system/api/response.ts:78",
                timestamp: "2023-03-29T14:27:11Z",
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
            lastErrors: [
              {
                message: "Database connection pool exhausted",
                location: "database/pool.ts:104",
                timestamp: "2023-03-29T10:05:18Z",
                stackTrace: "Error: Database connection pool exhausted\n  at Pool.getConnection (database/pool.ts:104)\n  at PerformanceTest.setUp (performance/db-test.ts:35)",
                frequency: 12
              },
              {
                message: "Request timeout during high load test",
                location: "performance/http-client.ts:87",
                timestamp: "2023-03-29T10:12:33Z",
                frequency: 8
              },
              {
                message: "Memory limit exceeded during load test",
                location: "performance/memory-monitor.ts:52",
                timestamp: "2023-03-29T10:18:45Z",
                frequency: 4
              },
              {
                message: "CPU usage threshold exceeded",
                location: "performance/cpu-monitor.ts:38",
                timestamp: "2023-03-29T10:24:12Z",
                frequency: 2
              },
              {
                message: "Deadlock detected in transaction",
                location: "database/transaction.ts:156",
                timestamp: "2023-03-29T10:30:27Z",
                frequency: 5
              }
            ],
            errorPatterns: [
              {
                pattern: "connection pool exhausted",
                occurrences: 12,
                firstSeen: "2023-03-15T08:12:45Z",
                lastSeen: "2023-03-29T10:05:18Z"
              },
              {
                pattern: "timeout during high load",
                occurrences: 8,
                firstSeen: "2023-03-22T14:32:18Z",
                lastSeen: "2023-03-29T10:12:33Z"
              }
            ],
            bottlenecks: [
              {
                area: "Database Connections",
                impact: 8,
                suggestion: "Increase connection pool size or implement connection reuse"
              },
              {
                area: "Memory Usage",
                impact: 6,
                suggestion: "Optimize memory-intensive operations or increase memory allocation"
              }
            ]
          }
        ];
        
        setTestSuites(mockTestSuites);
        
        // Analyze error types
        const errorTypes: {[key: string]: number} = {};
        mockTestSuites.forEach(suite => {
          if (suite.lastErrors) {
            suite.lastErrors.forEach(error => {
              // Simple categorization based on error message keywords
              let type = 'Other';
              
              if (error.message.toLowerCase().includes('timeout') || error.message.toLowerCase().includes('timed out')) {
                type = 'Timeout';
              } else if (error.message.toLowerCase().includes('connection') || error.message.toLowerCase().includes('dns')) {
                type = 'Network';
              } else if (error.message.toLowerCase().includes('database') || error.message.toLowerCase().includes('sql') || error.message.toLowerCase().includes('deadlock')) {
                type = 'Database';
              } else if (error.message.toLowerCase().includes('auth') || error.message.toLowerCase().includes('token')) {
                type = 'Authentication';
              } else if (error.message.toLowerCase().includes('memory') || error.message.toLowerCase().includes('cpu')) {
                type = 'Resources';
              } else if (error.message.toLowerCase().includes('parse') || error.message.toLowerCase().includes('syntax')) {
                type = 'Parsing';
              }
              
              errorTypes[type] = (errorTypes[type] || 0) + (error.frequency || 1);
            });
          }
        });
        
        setErrorsByType(errorTypes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const analyzeSuite = (suiteId: string) => {
    setAnalyzing(true);
    setSelectedSuite(suiteId);
    
    // Simulate API call with a slight delay
    setTimeout(() => {
      const suite = testSuites.find(s => s.id === suiteId);
      if (suite) {
        const analysis = testRecommendationService.analyzeRootCause(suite);
        setRootCauseAnalysis(analysis);
      }
      setAnalyzing(false);
    }, 1200);
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'Timeout':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'Network':
        return <Wifi className="h-4 w-4 text-blue-500" />;
      case 'Database':
        return <Database className="h-4 w-4 text-indigo-500" />;
      case 'Authentication':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'Resources':
        return <Server className="h-4 w-4 text-purple-500" />;
      case 'Parsing':
        return <Code className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
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

  // Get count of all test errors
  const totalErrorsCount = testSuites.reduce((count, suite) => {
    return count + (suite.lastErrors?.reduce((c, e) => c + (e.frequency || 1), 0) || 0);
  }, 0);

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bug className="mr-2 h-8 w-8 text-primary" /> Root Cause Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Deep diagnostic analysis of test failures to identify and fix underlying issues
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" /> Error Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" /> Error Analysis
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" /> Error Flow
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Analysis Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalErrorsCount}</div>
                    <p className="text-sm text-muted-foreground">Total Errors</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {testSuites.filter(s => s.lastErrors && s.lastErrors.length > 0).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Failing Test Suites</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {Object.keys(errorsByType).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Error Categories</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">94%</div>
                    <p className="text-sm text-muted-foreground">Diagnosis Accuracy</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Errors by Type</CardTitle>
                  <CardDescription>
                    Distribution of errors across different categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsivePie
                    data={Object.entries(errorsByType).map(([key, value]) => {
                      let color;
                      switch (key) {
                        case 'Timeout': color = '#f97316'; break;
                        case 'Network': color = '#3b82f6'; break;
                        case 'Database': color = '#8b5cf6'; break;
                        case 'Authentication': color = '#ef4444'; break;
                        case 'Resources': color = '#9333ea'; break;
                        case 'Parsing': color = '#10b981'; break;
                        default: color = '#6b7280';
                      }
                      return {
                        id: key,
                        label: key,
                        value,
                        color
                      };
                    })}
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
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 70,
                        translateY: 0,
                        itemsSpacing: 5,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 18,
                        itemTextColor: '#999',
                        symbolSize: 12,
                        symbolShape: 'circle',
                      }
                    ]}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Error Frequency</CardTitle>
                  <CardDescription>
                    Frequency of errors over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveLine
                    data={[
                      {
                        id: "Network Errors",
                        data: [
                          { x: "Week 1", y: 15 },
                          { x: "Week 2", y: 12 },
                          { x: "Week 3", y: 17 },
                          { x: "Week 4", y: 8 },
                          { x: "Week 5", y: 10 }
                        ]
                      },
                      {
                        id: "Database Errors",
                        data: [
                          { x: "Week 1", y: 8 },
                          { x: "Week 2", y: 12 },
                          { x: "Week 3", y: 18 },
                          { x: "Week 4", y: 14 },
                          { x: "Week 5", y: 8 }
                        ]
                      },
                      {
                        id: "Timeout Errors",
                        data: [
                          { x: "Week 1", y: 10 },
                          { x: "Week 2", y: 8 },
                          { x: "Week 3", y: 5 },
                          { x: "Week 4", y: 12 },
                          { x: "Week 5", y: 15 }
                        ]
                      }
                    ]}
                    margin={{ top: 20, right: 100, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                      type: 'linear',
                      min: 'auto',
                      max: 'auto',
                    }}
                    axisTop={null}
                    axisRight={null}
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
                      legend: 'Error Count',
                      legendOffset: -40,
                      legendPosition: 'middle'
                    }}
                    colors={{ scheme: 'category10' }}
                    pointSize={6}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 90,
                        translateY: 0,
                        itemsSpacing: 5,
                        itemDirection: 'left-to-right',
                        itemWidth: 90,
                        itemHeight: 20,
                        symbolSize: 12,
                        symbolShape: 'circle'
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Error Summary by Test Suite</CardTitle>
                  <CardDescription>
                    Detailed breakdown of errors in each test suite
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Search errors..." 
                    className="w-[300px]" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Suite</TableHead>
                      <TableHead>Error Count</TableHead>
                      <TableHead>Top Error Types</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testSuites
                      .filter(suite => 
                        // Filter by search query if present
                        !searchQuery || 
                        suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        suite.lastErrors?.some(e => e.message.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((suite) => {
                        const errorCount = suite.lastErrors?.reduce((sum, err) => sum + (err.frequency || 1), 0) || 0;
                        return (
                          <TableRow key={suite.id} className={selectedSuite === suite.id ? 'bg-muted/50' : ''}>
                            <TableCell>
                              <div className="font-medium">{suite.name}</div>
                              <div className="text-xs text-muted-foreground">{suite.lastRun}</div>
                            </TableCell>
                            <TableCell>
                              {errorCount ? (
                                <Badge className="bg-red-500">{errorCount}</Badge>
                              ) : (
                                <Badge className="bg-green-500">None</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {suite.lastErrors ? (
                                  (() => {
                                    // Create a map of error types
                                    const errorTypeMap: {[key: string]: number} = {};
                                    suite.lastErrors!.forEach(error => {
                                      // Simple categorization based on error message keywords
                                      let type = 'Other';
                                      
                                      if (error.message.toLowerCase().includes('timeout') || error.message.toLowerCase().includes('timed out')) {
                                        type = 'Timeout';
                                      } else if (error.message.toLowerCase().includes('connection') || error.message.toLowerCase().includes('dns')) {
                                        type = 'Network';
                                      } else if (error.message.toLowerCase().includes('database') || error.message.toLowerCase().includes('sql') || error.message.toLowerCase().includes('deadlock')) {
                                        type = 'Database';
                                      } else if (error.message.toLowerCase().includes('auth') || error.message.toLowerCase().includes('token')) {
                                        type = 'Authentication';
                                      } else if (error.message.toLowerCase().includes('memory') || error.message.toLowerCase().includes('cpu')) {
                                        type = 'Resources';
                                      } else if (error.message.toLowerCase().includes('parse') || error.message.toLowerCase().includes('syntax')) {
                                        type = 'Parsing';
                                      }
                                      
                                      errorTypeMap[type] = (errorTypeMap[type] || 0) + (error.frequency || 1);
                                    });
                                    
                                    // Get the top 3 error types
                                    return Object.entries(errorTypeMap)
                                      .sort((a, b) => b[1] - a[1])
                                      .slice(0, 3)
                                      .map(([type, count]) => (
                                        <Badge key={type} variant="outline" className="flex items-center gap-1">
                                          {getErrorIcon(type)} {type} ({count})
                                        </Badge>
                                      ));
                                  })()
                                ) : (
                                  <span className="text-sm text-muted-foreground">No errors</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-20 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                                >
                                  <div 
                                    className={`h-full rounded-full ${
                                      suite.passRate === 100 ? 'bg-green-500' : 
                                      suite.passRate >= 90 ? 'bg-yellow-500' : 
                                      'bg-red-500'
                                    }`} 
                                    style={{ width: `${suite.passRate}%` }}
                                  ></div>
                                </div>
                                <span 
                                  className={`${
                                    suite.passRate === 100 ? 'text-green-500' : 
                                    suite.passRate >= 90 ? 'text-yellow-500' : 
                                    'text-red-500'
                                  }`}
                                >
                                  {suite.passRate}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant={selectedSuite === suite.id ? "default" : "outline"} 
                                size="sm"
                                disabled={analyzing}
                                onClick={() => analyzeSuite(suite.id)}
                              >
                                {analyzing && selectedSuite === suite.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <FileSearch className="mr-2 h-4 w-4" /> Analyze
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Select Test Suite</CardTitle>
                    <CardDescription>
                      Choose a test suite to analyze
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search test suites..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {testSuites
                        .filter(suite => 
                          // Filter by search query if present
                          !searchQuery || 
                          suite.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(suite => {
                          const errorCount = suite.lastErrors?.reduce((sum, err) => sum + (err.frequency || 1), 0) || 0;
                          return (
                            <div 
                              key={suite.id} 
                              className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                                selectedSuite === suite.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                              }`}
                              onClick={() => analyzeSuite(suite.id)}
                            >
                              <div className="flex items-center gap-2">
                                {errorCount ? (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                <span className="font-medium">{suite.name}</span>
                              </div>
                              {errorCount > 0 && (
                                <Badge variant={selectedSuite === suite.id ? "outline" : "default"}>
                                  {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={analyzing}
                      onClick={() => {
                        const failingSuites = testSuites.filter(s => (s.lastErrors?.length || 0) > 0);
                        if (failingSuites.length > 0) {
                          analyzeSuite(failingSuites[0].id);
                        }
                      }}
                    >
                      <FileSearch className="mr-2 h-4 w-4" /> Analyze First Failing Suite
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-span-2 space-y-6">
                {analyzing ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                      <p className="text-lg font-medium">Analyzing Test Suite</p>
                      <p className="text-muted-foreground">Identifying error patterns and root causes...</p>
                    </CardContent>
                  </Card>
                ) : selectedSuite ? (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle>{testSuites.find(s => s.id === selectedSuite)?.name}</CardTitle>
                          <CardDescription>
                            Last Run: {testSuites.find(s => s.id === selectedSuite)?.lastRun} | 
                            Pass Rate: {testSuites.find(s => s.id === selectedSuite)?.passRate}%
                          </CardDescription>
                        </div>
                        {rootCauseAnalysis && (
                          <Badge className="flex items-center gap-2">
                            <Target className="h-4 w-4" /> {rootCauseAnalysis.confidence}% Confidence
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {rootCauseAnalysis && (
                          <>
                            {rootCauseAnalysis.commonPatterns.length > 0 ? (
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-lg font-medium mb-2">Common Error Patterns</h3>
                                  <div className="space-y-2">
                                    {rootCauseAnalysis.commonPatterns.map((pattern, index) => (
                                      <div key={index} className="p-3 bg-muted rounded-md">
                                        <div className="flex items-center gap-2 font-medium">
                                          <AlertCircle className="h-4 w-4 text-red-500" />
                                          <span>{pattern}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-lg font-medium mb-2">Suggested Fixes</h3>
                                  <div className="space-y-2">
                                    {rootCauseAnalysis.suggestedFixes.map((fix, index) => (
                                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                                        <div className="flex items-start gap-2">
                                          <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                                          <span>{fix}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {rootCauseAnalysis.relatedIssues.length > 0 && (
                                  <div>
                                    <h3 className="text-lg font-medium mb-2">Related Issues</h3>
                                    <div className="space-y-2">
                                      {rootCauseAnalysis.relatedIssues.map((issue, index) => (
                                        <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
                                          <div className="flex items-start gap-2">
                                            <Link2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                            <span className="text-yellow-600 dark:text-yellow-400">{issue}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <p className="text-lg font-medium">No Error Patterns Detected</p>
                                <p className="text-muted-foreground">This test suite is passing without any issues.</p>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Error Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {testSuites.find(s => s.id === selectedSuite)?.lastErrors?.length ? (
                          <Accordion type="single" collapsible className="w-full">
                            {testSuites.find(s => s.id === selectedSuite)?.lastErrors?.map((error, index) => (
                              <AccordionItem key={index} value={`error-${index}`}>
                                <AccordionTrigger className="py-4">
                                  <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                      {error.frequency || 1}×
                                    </Badge>
                                    <span className="font-medium text-left">{error.message}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Location</div>
                                      <div className="p-2 bg-muted rounded-md font-mono text-xs">
                                        {error.location}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Timestamp</div>
                                      <div className="p-2 bg-muted rounded-md text-xs">
                                        {format(new Date(error.timestamp), 'PPpp')}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {error.stackTrace && (
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Stack Trace</div>
                                      <pre className="p-2 bg-muted rounded-md overflow-x-auto whitespace-pre-wrap text-xs">
                                        {error.stackTrace}
                                      </pre>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="sm">
                                      <Github className="h-4 w-4 mr-1" /> View Code
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <History className="h-4 w-4 mr-1" /> View History
                                    </Button>
                                    <Button variant="default" size="sm">
                                      <ThumbsUp className="h-4 w-4 mr-1" /> Apply Fix
                                    </Button>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <p className="text-lg font-medium">No Errors Found</p>
                            <p className="text-muted-foreground">This test suite is currently passing without any issues.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {testSuites.find(s => s.id === selectedSuite)?.errorPatterns?.length ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Historical Error Patterns</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Pattern</TableHead>
                                <TableHead>Occurrences</TableHead>
                                <TableHead>First Seen</TableHead>
                                <TableHead>Last Seen</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testSuites.find(s => s.id === selectedSuite)?.errorPatterns?.map((pattern, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div className="font-medium">{pattern.pattern}</div>
                                  </TableCell>
                                  <TableCell>{pattern.occurrences}</TableCell>
                                  <TableCell>{format(new Date(pattern.firstSeen), 'MMM d, yyyy')}</TableCell>
                                  <TableCell>{format(new Date(pattern.lastSeen), 'MMM d, yyyy')}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ) : null}
                    
                    {testSuites.find(s => s.id === selectedSuite)?.bottlenecks?.length ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Bottlenecks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Area</TableHead>
                                <TableHead>Impact</TableHead>
                                <TableHead>Suggestion</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testSuites.find(s => s.id === selectedSuite)?.bottlenecks?.map((bottleneck, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div className="font-medium">{bottleneck.area}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div 
                                          className="h-full rounded-full bg-red-500" 
                                          style={{ width: `${bottleneck.impact * 10}%` }}
                                        ></div>
                                      </div>
                                      <span>{bottleneck.impact}/10</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{bottleneck.suggestion}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ) : null}
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <FileSearch className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Select a Test Suite</p>
                      <p className="text-muted-foreground">Choose a test suite from the left panel to analyze errors</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="flow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Flow Analysis</CardTitle>
                <CardDescription>
                  Visualize how errors propagate through the system
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <ResponsiveSankey
                  data={sankeyData}
                  margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
                  align="justify"
                  colors={{ scheme: 'category10' }}
                  nodeOpacity={1}
                  nodeHoverOthersOpacity={0.35}
                  nodeThickness={18}
                  nodeSpacing={24}
                  nodeBorderWidth={0}
                  nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
                  linkOpacity={0.5}
                  linkHoverOthersOpacity={0.1}
                  linkContract={3}
                  enableLinkGradient={true}
                  labelPosition="outside"
                  labelOrientation="vertical"
                  labelPadding={16}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      translateX: 130,
                      itemWidth: 100,
                      itemHeight: 14,
                      itemDirection: 'right-to-left',
                      itemsSpacing: 2,
                      itemTextColor: '#999',
                      symbolSize: 14,
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemTextColor: '#000'
                          }
                        }
                      ]
                    }
                  ]}
                />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Component Reliability</CardTitle>
                  <CardDescription>
                    Error frequency by system component
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Error Count</TableHead>
                        <TableHead>Reliability Score</TableHead>
                        <TableHead>Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Database Layer</div>
                        </TableCell>
                        <TableCell>24</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-yellow-500" 
                                style={{ width: '78%' }}
                              ></div>
                            </div>
                            <span>78%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-500">-3%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">API Endpoints</div>
                        </TableCell>
                        <TableCell>15</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-green-500" 
                                style={{ width: '92%' }}
                              ></div>
                            </div>
                            <span>92%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-green-500">+2%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Authentication</div>
                        </TableCell>
                        <TableCell>11</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-green-500" 
                                style={{ width: '94%' }}
                              ></div>
                            </div>
                            <span>94%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-green-500">+5%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Network Layer</div>
                        </TableCell>
                        <TableCell>32</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-red-500" 
                                style={{ width: '68%' }}
                              ></div>
                            </div>
                            <span>68%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-500">-7%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">Payment Processing</div>
                        </TableCell>
                        <TableCell>8</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-green-500" 
                                style={{ width: '96%' }}
                              ></div>
                            </div>
                            <span>96%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">0%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Error Propagation Paths</CardTitle>
                  <CardDescription>
                    Common paths where errors propagate through the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="font-medium mb-1 text-red-600 dark:text-red-400">
                        Database → API → Client
                      </div>
                      <div className="text-sm mb-1 text-red-600 dark:text-red-400">
                        Database connection issues propagate to API endpoints, resulting in client-side errors
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Affects: Payment Processing, Order Management
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="font-medium mb-1 text-yellow-600 dark:text-yellow-400">
                        Authentication → API Authorization
                      </div>
                      <div className="text-sm mb-1 text-yellow-600 dark:text-yellow-400">
                        Auth token validation failures cascade to authorization checks in API calls
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Affects: User Management, Settings
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="font-medium mb-1 text-blue-600 dark:text-blue-400">
                        Network → External API → Data Processing
                      </div>
                      <div className="text-sm mb-1 text-blue-600 dark:text-blue-400">
                        Network timeouts cause external API failures that impact data processing
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Affects: Reporting, Analytics
                      </div>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="font-medium mb-1 text-purple-600 dark:text-purple-400">
                        Memory Usage → Background Jobs → Queue Processing
                      </div>
                      <div className="text-sm mb-1 text-purple-600 dark:text-purple-400">
                        Memory issues in background jobs impact queue processing reliability
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Affects: Notifications, Export Jobs
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis Settings</CardTitle>
                <CardDescription>
                  Configure analysis parameters and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Analysis Parameters</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Similarity Threshold</Label>
                      <Select defaultValue="75">
                        <SelectTrigger>
                          <SelectValue placeholder="Select threshold" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60% - More inclusive</SelectItem>
                          <SelectItem value="75">75% - Balanced</SelectItem>
                          <SelectItem value="90">90% - High precision</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Determines how similar errors need to be to be grouped together
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Analysis Depth</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select analysis depth" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shallow">Shallow - Faster analysis</SelectItem>
                          <SelectItem value="medium">Medium - Balanced</SelectItem>
                          <SelectItem value="deep">Deep - Most thorough</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Controls how deeply the analyzer examines error patterns
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Historical Data Range</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Select data range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                          <SelectItem value="90">Last 90 days</SelectItem>
                          <SelectItem value="all">All history</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Time range of historical test data to include in analysis
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Confidence Threshold</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select confidence threshold" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Show more tentative results</SelectItem>
                          <SelectItem value="medium">Medium - Balanced</SelectItem>
                          <SelectItem value="high">High - Only show high confidence results</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Minimum confidence required to include results in analysis
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Analysis Behavior</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Auto-analyze on Test Failure</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically run root cause analysis when tests fail
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Track Error Patterns</Label>
                        <p className="text-sm text-muted-foreground">
                          Store and analyze error patterns over time
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Include Stack Traces</Label>
                        <p className="text-sm text-muted-foreground">
                          Parse stack traces to find common error sources
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Smart Fix Suggestions</Label>
                        <p className="text-sm text-muted-foreground">
                          Generate suggested fixes based on error analysis
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send email alerts for critical error patterns
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Slack Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send alerts to Slack when critical errors are detected
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Add to Test Report</Label>
                        <p className="text-sm text-muted-foreground">
                          Include root cause analysis in test reports
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Settings</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Error Categorization Method</Label>
                      <Select defaultValue="hybrid">
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keyword">Keyword-based</SelectItem>
                          <SelectItem value="pattern">Pattern matching</SelectItem>
                          <SelectItem value="hybrid">Hybrid approach</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Analysis Concurrency</Label>
                      <Select defaultValue="2">
                        <SelectTrigger>
                          <SelectValue placeholder="Select concurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Low resource usage</SelectItem>
                          <SelectItem value="2">2 - Balanced</SelectItem>
                          <SelectItem value="4">4 - Faster analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label>Ignored Error Patterns (one per line)</Label>
                      <Textarea 
                        placeholder="Enter patterns to ignore, e.g. 'DEBUG:*'" 
                        className="h-20"
                        defaultValue="DEBUG:*\nINFO:*\n*test_helper.py*"
                      />
                      <p className="text-xs text-muted-foreground">
                        Patterns or prefixes to exclude from error analysis
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
    </div>
  );
}