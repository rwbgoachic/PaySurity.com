import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
  BarChart4, 
  Clock, 
  Cog, 
  Cpu, 
  Database, 
  Gauge, 
  Layers, 
  Loader2,
  Maximize2, 
  PanelRight, 
  Puzzle, 
  RefreshCw, 
  Rocket, 
  Save, 
  Search,
  Settings, 
  Share2, 
  Shuffle, 
  Sliders, 
  SplitSquareVertical, 
  TimerReset, 
  Zap 
} from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveTimeRange } from "@nivo/calendar";
import { useToast } from "@/hooks/use-toast";
import { TestSuite, testRecommendationService } from "@/lib/test-recommendation-service";

export default function TestOptimization() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<any | null>(null);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [parallelizationFactor, setParallelizationFactor] = useState(4);
  
  // Mock execution time data
  const [timelineData, setTimelineData] = useState([
    {
      id: "Current Execution",
      data: [
        { x: "Setup", y: 12 },
        { x: "API Tests", y: 30 },
        { x: "DB Tests", y: 50 },
        { x: "UI Tests", y: 93 },
        { x: "Teardown", y: 25 }
      ]
    },
    {
      id: "Optimized Execution",
      data: [
        { x: "Setup", y: 8 },
        { x: "API Tests", y: 20 },
        { x: "DB Tests", y: 30 },
        { x: "UI Tests", y: 36 },
        { x: "Teardown", y: 11 }
      ]
    }
  ]);
  
  // Mock parallel execution data
  const [parallelExecutionData, setParallelExecutionData] = useState({
    nodes: [
      { id: "Setup", height: 1 },
      { id: "API Tests", height: 3 },
      { id: "DB Tests", height: 4 },
      { id: "UI Tests", height: 6 },
      { id: "Teardown", height: 1 }
    ]
  });
  
  // Mock optimization history data - for calendar view
  const [optimizationHistory, setOptimizationHistory] = useState([
    { day: "2023-03-01", value: 5 },
    { day: "2023-03-03", value: 8 },
    { day: "2023-03-05", value: 12 },
    { day: "2023-03-08", value: 4 },
    { day: "2023-03-10", value: 7 },
    { day: "2023-03-15", value: 15 },
    { day: "2023-03-18", value: 6 },
    { day: "2023-03-22", value: 9 },
    { day: "2023-03-25", value: 11 },
    { day: "2023-03-29", value: 14 }
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
            dependencies: ["api-test"],
            parallelizable: true,
            avgExecutionTime: 52 // Historical average execution time in seconds
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
            parallelizable: true,
            avgExecutionTime: 35
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
            parallelizable: false,
            avgExecutionTime: 92
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
            parallelizable: true,
            avgExecutionTime: 132,
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
        
        // Calculate a random optimization score from 0-100
        setOptimizationScore(Math.floor(Math.random() * 50) + 40);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const analyzePerformance = (suiteId: string) => {
    setAnalyzing(true);
    setSelectedSuite(suiteId);
    
    // Simulate API call with a slight delay
    setTimeout(() => {
      const suite = testSuites.find(s => s.id === suiteId);
      if (suite) {
        const analysis = testRecommendationService.analyzePerformance(suite);
        setOptimizationResults(analysis);
      }
      setAnalyzing(false);
    }, 1500);
  };

  const optimizeTestSuite = () => {
    if (!selectedSuite) return;
    
    setAnalyzing(true);
    
    // Simulate optimization process
    setTimeout(() => {
      const suite = testSuites.find(s => s.id === selectedSuite);
      if (suite) {
        // Apply optimizations to the selected suite (simulated)
        const optimizedSuites = testSuites.map(s => {
          if (s.id === selectedSuite) {
            const speedImprovement = Math.floor(Math.random() * 20) + 10; // 10-30% improvement
            const newExecutionTime = Math.floor(s.executionTime * (1 - speedImprovement / 100));
            
            return {
              ...s,
              executionTime: newExecutionTime,
              parallelizable: true
            };
          }
          return s;
        });
        
        setTestSuites(optimizedSuites);
        
        toast({
          title: "Test Suite Optimized",
          description: `${suite.name} has been optimized successfully`,
        });
      }
      setAnalyzing(false);
    }, 2000);
  };

  const calculateEfficiencyMetrics = (suite: TestSuite) => {
    // Tests per second (higher is better)
    const testsPerSecond = suite.testCount / suite.executionTime;
    
    // Coverage efficiency (coverage percentage / execution time)
    const coverageEfficiency = suite.coverage / suite.executionTime;
    
    // Execution time stability (compare current vs average historical time)
    // Lower values mean more stable execution time
    const timeStability = Math.abs(suite.executionTime - (suite.avgExecutionTime || suite.executionTime)) / (suite.avgExecutionTime || suite.executionTime) * 100;
    
    return {
      testsPerSecond: testsPerSecond.toFixed(2),
      coverageEfficiency: coverageEfficiency.toFixed(2),
      timeStability: timeStability.toFixed(1)
    };
  };

  const getPerformanceRating = (suite: TestSuite): string => {
    // Calculate a performance rating based on tests per second and complexity
    const testsPerSecond = suite.testCount / suite.executionTime;
    let rating = '';
    
    switch (suite.complexity) {
      case 'low':
        rating = testsPerSecond >= 2.5 ? 'Excellent' : 
                 testsPerSecond >= 1.5 ? 'Good' : 
                 testsPerSecond >= 0.8 ? 'Fair' : 'Poor';
        break;
      case 'medium':
        rating = testsPerSecond >= 2.0 ? 'Excellent' : 
                 testsPerSecond >= 1.0 ? 'Good' : 
                 testsPerSecond >= 0.5 ? 'Fair' : 'Poor';
        break;
      case 'high':
        rating = testsPerSecond >= 1.5 ? 'Excellent' : 
                 testsPerSecond >= 0.8 ? 'Good' : 
                 testsPerSecond >= 0.3 ? 'Fair' : 'Poor';
        break;
      default:
        rating = 'Unknown';
    }
    
    return rating;
  };

  const getPerformanceRatingColor = (rating: string): string => {
    switch (rating) {
      case 'Excellent': return 'text-green-500';
      case 'Good': return 'text-blue-500';
      case 'Fair': return 'text-yellow-500';
      case 'Poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getOptimizationPotential = (suite: TestSuite): number => {
    // Calculate a value between 0-100 indicating optimization potential
    const perfRating = getPerformanceRating(suite);
    
    const baseScore = suite.parallelizable ? 40 : 20;
    const complexityFactor = suite.complexity === 'high' ? 30 : suite.complexity === 'medium' ? 20 : 10;
    const bottleneckFactor = (suite.bottlenecks?.length || 0) * 15;
    
    // Higher performance rating = lower optimization potential
    const perfFactor = perfRating === 'Excellent' ? -30 : 
                      perfRating === 'Good' ? -15 : 
                      perfRating === 'Fair' ? 0 : 20;
    
    return Math.min(100, Math.max(0, baseScore + complexityFactor + bottleneckFactor + perfFactor));
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
            <Gauge className="mr-2 h-8 w-8 text-primary" /> Test Performance Optimization
          </h1>
          <p className="text-muted-foreground mt-2">
            Optimize test execution speed, efficiency, and resource usage
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" /> Performance Overview
            </TabsTrigger>
            <TabsTrigger value="suite" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Test Suites
            </TabsTrigger>
            <TabsTrigger value="parallel" className="flex items-center gap-2">
              <SplitSquareVertical className="h-4 w-4" /> Parallelization
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{optimizationScore}</div>
                    <p className="text-sm text-muted-foreground">Optimization Score</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {testSuites.reduce((sum, suite) => sum + suite.executionTime, 0)}s
                    </div>
                    <p className="text-sm text-muted-foreground">Total Execution Time</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {testSuites.filter(s => s.parallelizable).length}/{testSuites.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Parallelizable Suites</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">36%</div>
                    <p className="text-sm text-muted-foreground">Potential Time Savings</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Execution Time by Test Suite</CardTitle>
                  <CardDescription>
                    Current execution time of each test suite
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveBar
                    data={testSuites.map(suite => ({
                      suite: suite.name.replace(' Test Suite', '').replace(' Tests', ''),
                      time: suite.executionTime,
                      timeColor: suite.executionTime > 100 ? '#ef4444' : suite.executionTime > 60 ? '#f59e0b' : '#10b981'
                    }))}
                    keys={['time']}
                    indexBy="suite"
                    margin={{ top: 20, right: 20, bottom: 70, left: 80 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ datum: 'data.timeColor' }}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Test Suite',
                      legendPosition: 'middle',
                      legendOffset: 55
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Execution Time (seconds)',
                      legendPosition: 'middle',
                      legendOffset: -65
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                    animate={true}
                    role="application"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Optimization History</CardTitle>
                  <CardDescription>
                    Test optimization activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveTimeRange
                    data={optimizationHistory}
                    from="2023-03-01"
                    to="2023-03-31"
                    emptyColor="#eeeeee"
                    colors={[
                      "#d1e5f0",
                      "#92c6db",
                      "#4393c3",
                      "#2166ac"
                    ]}
                    margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
                    dayBorderWidth={2}
                    dayBorderColor="#ffffff"
                    legends={[
                      {
                        anchor: 'bottom-right',
                        direction: 'row',
                        translateY: 36,
                        itemCount: 4,
                        itemWidth: 42,
                        itemHeight: 36,
                        itemsSpacing: 14,
                        itemDirection: 'right-to-left'
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Test Suite Performance Metrics</CardTitle>
                <CardDescription>
                  Detailed performance metrics for all test suites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Suite</TableHead>
                      <TableHead>Execution Time</TableHead>
                      <TableHead>Test Count</TableHead>
                      <TableHead>Tests/Second</TableHead>
                      <TableHead>Coverage Efficiency</TableHead>
                      <TableHead>Performance Rating</TableHead>
                      <TableHead>Optimization Potential</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testSuites.map((suite) => {
                      const metrics = calculateEfficiencyMetrics(suite);
                      const perfRating = getPerformanceRating(suite);
                      const perfRatingColor = getPerformanceRatingColor(perfRating);
                      const optimizationPotential = getOptimizationPotential(suite);
                      
                      return (
                        <TableRow key={suite.id} className={selectedSuite === suite.id ? 'bg-muted/50' : ''}>
                          <TableCell>
                            <div className="font-medium">{suite.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Complexity: {suite.complexity}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{suite.executionTime}s</span>
                            </div>
                          </TableCell>
                          <TableCell>{suite.testCount} tests</TableCell>
                          <TableCell>
                            <Badge variant="outline">{metrics.testsPerSecond}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{metrics.coverageEfficiency}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={perfRatingColor}>{perfRating}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={optimizationPotential} className="w-[80px]" />
                              <span>{optimizationPotential}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant={selectedSuite === suite.id ? "default" : "outline"} 
                              size="sm"
                              disabled={analyzing}
                              onClick={() => analyzePerformance(suite.id)}
                            >
                              {analyzing && selectedSuite === suite.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                                </>
                              ) : (
                                <>
                                  <Gauge className="mr-2 h-4 w-4" /> Analyze
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
          
          <TabsContent value="suite" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Test Suite Selection</CardTitle>
                    <CardDescription>
                      Select a test suite to optimize
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Search test suites..."
                        className="pl-8"
                      />
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {testSuites.map(suite => {
                        const optimizationPotential = getOptimizationPotential(suite);
                        let potentialColor = 'bg-green-500';
                        if (optimizationPotential < 30) potentialColor = 'bg-blue-500';
                        else if (optimizationPotential < 60) potentialColor = 'bg-yellow-500';
                        else potentialColor = 'bg-red-500';
                        
                        return (
                          <div 
                            key={suite.id} 
                            className={`p-3 rounded-md cursor-pointer ${
                              selectedSuite === suite.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            }`}
                            onClick={() => analyzePerformance(suite.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium">{suite.name}</div>
                              <Badge 
                                className={`${selectedSuite === suite.id ? 'bg-primary-foreground text-primary' : potentialColor}`}
                              >
                                {optimizationPotential}%
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{suite.executionTime}s</span>
                              </div>
                              <div>
                                {suite.testCount} tests
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-span-2 space-y-6">
                {analyzing ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                      <p className="text-lg font-medium">Analyzing Test Performance</p>
                      <p className="text-muted-foreground">Identifying bottlenecks and optimization opportunities...</p>
                    </CardContent>
                  </Card>
                ) : selectedSuite ? (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle>{testSuites.find(s => s.id === selectedSuite)?.name}</CardTitle>
                          <CardDescription>
                            {testSuites.find(s => s.id === selectedSuite)?.testCount} tests · 
                            {testSuites.find(s => s.id === selectedSuite)?.executionTime}s execution time
                          </CardDescription>
                        </div>
                        {testSuites.find(s => s.id === selectedSuite)?.parallelizable && (
                          <Badge className="bg-green-500">Parallelizable</Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {optimizationResults && (
                          <>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                                <span className="text-sm text-muted-foreground">Tests/Second</span>
                                <span className="text-2xl font-bold">{optimizationResults.testsPerSecond.toFixed(2)}</span>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                                <span className="text-sm text-muted-foreground">Efficiency Rating</span>
                                <span className={`text-2xl font-bold ${
                                  optimizationResults.efficiencyRating === 'excellent' ? 'text-green-500' : 
                                  optimizationResults.efficiencyRating === 'good' ? 'text-blue-500' :
                                  optimizationResults.efficiencyRating === 'fair' ? 'text-yellow-500' :
                                  'text-red-500'
                                }`}>
                                  {optimizationResults.efficiencyRating.charAt(0).toUpperCase() + optimizationResults.efficiencyRating.slice(1)}
                                </span>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                                <span className="text-sm text-muted-foreground">Parallelization</span>
                                <span className="text-2xl font-bold">{optimizationResults.parallelizationPotential}</span>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                                <span className="text-sm text-muted-foreground">Time Savings</span>
                                <span className="text-2xl font-bold text-green-500">{optimizationResults.potentialTimeSavings}s</span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium mb-2">Optimization Suggestions</h3>
                              <div className="space-y-2">
                                {optimizationResults.optimizations.map((suggestion: string, index: number) => (
                                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                                      <span className="text-blue-700 dark:text-blue-300">{suggestion}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t flex justify-between items-center">
                              <div className="text-lg font-medium">Apply Optimizations</div>
                              <Button 
                                onClick={optimizeTestSuite}
                                disabled={analyzing}
                              >
                                {analyzing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...
                                  </>
                                ) : (
                                  <>
                                    <Rocket className="mr-2 h-4 w-4" /> Optimize Test Suite
                                  </>
                                )}
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Execution Timeline</CardTitle>
                        <CardDescription>
                          Current vs. optimized execution timeline
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveLine
                          data={timelineData}
                          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                          xScale={{ type: 'point' }}
                          yScale={{ 
                            type: 'linear', 
                            min: 0, 
                            max: 'auto' 
                          }}
                          curve="monotoneX"
                          axisTop={null}
                          axisRight={null}
                          axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Test Phase',
                            legendOffset: 36,
                            legendPosition: 'middle'
                          }}
                          axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Execution Time (seconds)',
                            legendOffset: -40,
                            legendPosition: 'middle'
                          }}
                          enableGridX={false}
                          colors={["#ef4444", "#10b981"]}
                          lineWidth={3}
                          pointSize={10}
                          pointColor={{ theme: 'background' }}
                          pointBorderWidth={2}
                          pointBorderColor={{ from: 'serieColor' }}
                          pointLabelYOffset={-12}
                          enableSlices={false}
                          useMesh={true}
                          legends={[
                            {
                              anchor: 'bottom-right',
                              direction: 'column',
                              justify: false,
                              translateX: 100,
                              translateY: 0,
                              itemsSpacing: 0,
                              itemDirection: 'left-to-right',
                              itemWidth: 80,
                              itemHeight: 20,
                              itemOpacity: 0.75,
                              symbolSize: 12,
                              symbolShape: 'circle',
                              symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            }
                          ]}
                        />
                      </CardContent>
                    </Card>
                    
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
                      <Gauge className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Select a Test Suite</p>
                      <p className="text-muted-foreground">Choose a test suite from the left panel to analyze performance</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="parallel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Parallelization</CardTitle>
                <CardDescription>
                  Configure and optimize parallel test execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Parallelization Factor</Label>
                        <span className="text-primary font-medium">{parallelizationFactor}x</span>
                      </div>
                      <Slider 
                        defaultValue={[4]} 
                        min={1} 
                        max={8} 
                        step={1} 
                        onValueChange={(value) => setParallelizationFactor(value[0])}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of tests to run in parallel
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-base font-medium">Test Suite Parallelization</h3>
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Allow Cross-Suite Parallelization</Label>
                          <p className="text-sm text-muted-foreground">
                            Run tests from different test suites in parallel
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-Detect Parallelizable Tests</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically identify tests that can run in parallel
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Respect Dependencies</Label>
                          <p className="text-sm text-muted-foreground">
                            Don't parallelize tests with dependencies
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-base font-medium">Resource Allocation</h3>
                      
                      <div className="space-y-2">
                        <Label>CPU Usage Limit</Label>
                        <Select defaultValue="80">
                          <SelectTrigger>
                            <SelectValue placeholder="Select CPU limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50% - Conservative</SelectItem>
                            <SelectItem value="80">80% - Balanced</SelectItem>
                            <SelectItem value="95">95% - Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Memory Usage Limit</Label>
                        <Select defaultValue="75">
                          <SelectTrigger>
                            <SelectValue placeholder="Select memory limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50% - Conservative</SelectItem>
                            <SelectItem value="75">75% - Balanced</SelectItem>
                            <SelectItem value="90">90% - Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Card className="h-auto">
                    <CardHeader>
                      <CardTitle>Parallelization Impact</CardTitle>
                      <CardDescription>
                        Estimated execution time with current settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Current Total Execution Time</div>
                        <div className="text-3xl font-bold">
                          {testSuites.reduce((sum, suite) => sum + suite.executionTime, 0)}s
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Estimated Execution Time with Parallelization</div>
                        <div className="text-3xl font-bold text-green-500">
                          {Math.round(testSuites.reduce((sum, suite) => sum + suite.executionTime, 0) / parallelizationFactor)}s
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Time Savings</div>
                        <div className="text-xl font-medium text-green-500">
                          {Math.round(testSuites.reduce((sum, suite) => sum + suite.executionTime, 0) * (1 - 1/parallelizationFactor))}s ({Math.round((1 - 1/parallelizationFactor) * 100)}%)
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium mb-2">Estimated Resource Usage</div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>CPU Usage</span>
                              <span className="font-medium">{Math.min(95, 25 * parallelizationFactor)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${Math.min(95, 25 * parallelizationFactor) > 80 ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${Math.min(95, 25 * parallelizationFactor)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Memory Usage</span>
                              <span className="font-medium">{Math.min(90, 15 * parallelizationFactor)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${Math.min(90, 15 * parallelizationFactor) > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                style={{ width: `${Math.min(90, 15 * parallelizationFactor)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Disk I/O</span>
                              <span className="font-medium">{Math.min(85, 12 * parallelizationFactor)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${Math.min(85, 12 * parallelizationFactor) > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                style={{ width: `${Math.min(85, 12 * parallelizationFactor)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Parallelization Status</CardTitle>
                    <CardDescription>
                      Current parallelization status for each test suite
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test Suite</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Dependencies</TableHead>
                          <TableHead>Parallelizable Tests</TableHead>
                          <TableHead>Sequential Tests</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testSuites.map((suite) => (
                          <TableRow key={suite.id}>
                            <TableCell>
                              <div className="font-medium">{suite.name}</div>
                            </TableCell>
                            <TableCell>
                              {suite.parallelizable ? (
                                <Badge className="bg-green-500">Parallelizable</Badge>
                              ) : (
                                <Badge variant="outline">Sequential</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {suite.dependencies?.length ? (
                                <Badge variant="outline">{suite.dependencies.length} dependencies</Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {suite.parallelizable ? (
                                <div className="text-sm">
                                  {Math.round(suite.testCount * 0.8)} tests ({Math.round(suite.testCount * 0.8 / suite.testCount * 100)}%)
                                </div>
                              ) : (
                                <div className="text-sm">0 tests (0%)</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {suite.parallelizable ? (
                                <div className="text-sm">
                                  {Math.round(suite.testCount * 0.2)} tests ({Math.round(suite.testCount * 0.2 / suite.testCount * 100)}%)
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {suite.testCount} tests (100%)
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Toggle parallelizable flag
                                  const updatedSuites = testSuites.map(s => {
                                    if (s.id === suite.id) {
                                      return { ...s, parallelizable: !s.parallelizable };
                                    }
                                    return s;
                                  });
                                  
                                  setTestSuites(updatedSuites);
                                  
                                  toast({
                                    title: suite.parallelizable ? "Parallelization Disabled" : "Parallelization Enabled",
                                    description: `${suite.name} is now ${suite.parallelizable ? 'sequential' : 'parallelizable'}`,
                                  });
                                }}
                              >
                                {suite.parallelizable ? "Disable Parallel" : "Enable Parallel"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Reset Settings</Button>
                  <Button>Apply Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Execution Configuration</CardTitle>
                <CardDescription>
                  Configure global test execution settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Testing Environment</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Environment Type</Label>
                      <Select defaultValue="ephemeral">
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ephemeral">Ephemeral (Clean Each Run)</SelectItem>
                          <SelectItem value="persistent">Persistent (Reuse Environment)</SelectItem>
                          <SelectItem value="hybrid">Hybrid (Selective Reset)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Determines how test environments are created and managed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Isolation Level</Label>
                      <Select defaultValue="suite">
                        <SelectTrigger>
                          <SelectValue placeholder="Select isolation level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test">Test-level (High Isolation)</SelectItem>
                          <SelectItem value="suite">Suite-level (Medium Isolation)</SelectItem>
                          <SelectItem value="group">Group-level (Low Isolation)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Level of isolation between test executions
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Database Strategy</Label>
                      <Select defaultValue="transaction">
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transaction">Transaction Rollback</SelectItem>
                          <SelectItem value="migrate">Fresh Migration</SelectItem>
                          <SelectItem value="snapshot">Database Snapshots</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cache Settings</Label>
                      <Select defaultValue="selective">
                        <SelectTrigger>
                          <SelectValue placeholder="Select cache setting" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled (No Caching)</SelectItem>
                          <SelectItem value="selective">Selective (Smart Caching)</SelectItem>
                          <SelectItem value="aggressive">Aggressive (Max Caching)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Performance Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Test Sharding</Label>
                        <p className="text-sm text-muted-foreground">
                          Split large test suites into smaller shards
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Smart Test Ordering</Label>
                        <p className="text-sm text-muted-foreground">
                          Run likely-to-fail tests first
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Resource Pooling</Label>
                        <p className="text-sm text-muted-foreground">
                          Reuse expensive resources between tests
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Early Termination</Label>
                        <p className="text-sm text-muted-foreground">
                          Stop test execution early on critical failures
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test Timeouts</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Test Timeout</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="30" className="w-20" />
                        <span className="text-sm text-muted-foreground">seconds</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>API Test Timeout</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="10" className="w-20" />
                        <span className="text-sm text-muted-foreground">seconds</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Database Test Timeout</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="15" className="w-20" />
                        <span className="text-sm text-muted-foreground">seconds</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>UI Test Timeout</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="60" className="w-20" />
                        <span className="text-sm text-muted-foreground">seconds</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Resource Limits</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum Memory Usage</Label>
                        <span className="text-primary font-medium">4.0 GB</span>
                      </div>
                      <Slider 
                        defaultValue={[4.0]} 
                        min={1.0} 
                        max={8.0} 
                        step={0.5} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum CPU Usage</Label>
                        <span className="text-primary font-medium">80%</span>
                      </div>
                      <Slider 
                        defaultValue={[80]} 
                        min={30} 
                        max={100} 
                        step={5} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum Database Connections</Label>
                        <span className="text-primary font-medium">20</span>
                      </div>
                      <Slider 
                        defaultValue={[20]} 
                        min={5} 
                        max={50} 
                        step={5} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum Network Bandwidth</Label>
                        <span className="text-primary font-medium">50 MB/s</span>
                      </div>
                      <Slider 
                        defaultValue={[50]} 
                        min={10} 
                        max={100} 
                        step={10} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button onClick={() => {
                    toast({
                      title: "Configuration Saved",
                      description: "Test execution configuration has been updated",
                    });
                  }}>
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}