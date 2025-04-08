import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveLine } from "@nivo/line";
import { Check, AlertTriangle, Clock, TrendingUp, Brain, Target, Search, LineChart, Zap, Gauge, Filter, RefreshCw } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Import our new test recommendation service
import { TestSuite, TestRecommendation, testRecommendationService } from "@/lib/test-recommendation-service";

export default function TestRecommendationEngine() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [recommendations, setRecommendations] = useState<TestRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = () => {
      try {
        setLoading(true);
        
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
            failureReason: "ConnectionTimeoutError in 3 test cases"
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
            dependencies: ["api-test"]
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
            dependencies: ["api-test", "system-test"]
          }
        ];
        
        // Mock recommendations
        const mockRecommendations: TestRecommendation[] = [
          {
            testSuiteId: "performance-test",
            score: 92,
            reason: "28% failure rate detected with consistent failure pattern. Critical performance bottlenecks identified.",
            priority: 'critical',
            predictedSuccessRate: 76,
            estimatedDuration: 124
          },
          {
            testSuiteId: "system-test",
            score: 85,
            reason: "Recent failures in critical integration points. Connection timeouts suggest network issues.",
            priority: 'high',
            predictedSuccessRate: 91,
            estimatedDuration: 87
          },
          {
            testSuiteId: "bistrobeast-test",
            score: 78,
            reason: "New features added recently. High business impact area with moderate failure trend.",
            priority: 'high',
            predictedSuccessRate: 94,
            estimatedDuration: 55
          },
          {
            testSuiteId: "api-test",
            score: 65,
            reason: "Core dependency for other test suites. High coverage impact.",
            priority: 'medium',
            predictedSuccessRate: 98,
            estimatedDuration: 32
          },
          {
            testSuiteId: "merchant-test",
            score: 58,
            reason: "Stable test suite with high pass rate. Recommended for regression.",
            priority: 'medium',
            predictedSuccessRate: 95,
            estimatedDuration: 35
          },
          {
            testSuiteId: "delivery-test",
            score: 42,
            reason: "Consistent 100% pass rate. Low probability of regressions.",
            priority: 'low',
            predictedSuccessRate: 99,
            estimatedDuration: 45
          }
        ];
        
        setTestSuites(mockTestSuites);
        setRecommendations(mockRecommendations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching test data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter test suites based on search query and filter type
  const filteredTestSuites = testSuites.filter(suite => {
    const matchesSearch = suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           suite.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === "all") return matchesSearch;
    if (filter === "failing") return matchesSearch && suite.passRate < 100;
    if (filter === "passing") return matchesSearch && suite.passRate === 100;
    if (filter === "critical") return matchesSearch && suite.failureImpact === 'high' && suite.priority >= 4;
    
    return matchesSearch;
  });
  
  // Get suite by ID
  const getSuiteById = (id: string) => {
    return testSuites.find(suite => suite.id === id);
  };
  
  // Get recommendation by suite ID
  const getRecommendationForSuite = (id: string) => {
    return recommendations.find(rec => rec.testSuiteId === id);
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: 'critical' | 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Format pass rate with color
  const formatPassRate = (rate: number) => {
    let color = "text-green-500";
    if (rate < 80) color = "text-red-500";
    else if (rate < 90) color = "text-orange-500";
    else if (rate < 100) color = "text-yellow-500";
    
    return <span className={color}>{rate}%</span>;
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
            <Brain className="mr-2 h-8 w-8 text-primary" /> Intelligent Test Recommendation Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered test analysis and recommendations prioritized for maximum efficiency and defect detection
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search test suites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter tests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="failing">Failing Tests</SelectItem>
                <SelectItem value="passing">Passing Tests</SelectItem>
                <SelectItem value="critical">Critical Tests</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="default" 
            onClick={() => {
              setGenerating(true);
              
              // Use our local recommendation engine
              try {
                const newRecommendations = testRecommendationService.generateRecommendations(testSuites);
                setRecommendations(newRecommendations);
                
                // Also get anomalies and insights
                const anomalies = testRecommendationService.detectAnomalies(testSuites);
                const correlations = testRecommendationService.analyzeCorrelations(testSuites);
                
                // Show success toast
                toast({
                  title: "Recommendations Generated",
                  description: `Generated ${newRecommendations.length} test recommendations with AI-powered analysis`,
                  variant: "default"
                });
              } catch (error) {
                console.error("Error generating recommendations:", error);
                toast({
                  title: "Error Generating Recommendations",
                  description: "An error occurred while analyzing test data",
                  variant: "destructive"
                });
              } finally {
                setGenerating(false);
              }
            }}
            disabled={generating}
          >
            {generating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" /> Generate Recommendations
              </>
            )}
          </Button>
        </div>
        
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Recommendations
            </TabsTrigger>
            <TabsTrigger value="testSuites" className="flex items-center gap-2">
              <Search className="h-4 w-4" /> Test Suites
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Insights
            </TabsTrigger>
            <TabsTrigger value="prediction" className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Failure Prediction
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations">
            <div className="grid gap-4 grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Top Test Recommendations</CardTitle>
                  <CardDescription>
                    Ranked by our ML algorithm based on failure risk, coverage, and business impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Test Suite</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Est. Success</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recommendations.map((rec) => {
                        const suite = getSuiteById(rec.testSuiteId);
                        if (!suite) return null;
                        
                        return (
                          <TableRow key={rec.testSuiteId}>
                            <TableCell>
                              <Badge className={`${getPriorityColor(rec.priority)}`}>
                                {rec.priority.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{suite.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Last run: {suite.lastRun}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={rec.score} className="w-[60px]" />
                                <span>{rec.score}/100</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <span className="text-sm">{rec.reason}</span>
                            </TableCell>
                            <TableCell>
                              {rec.predictedSuccessRate}%
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> 
                                {rec.estimatedDuration}s
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">Run Test</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid gap-4 grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Test Success Prediction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      {recommendations.slice(0, 3).map(rec => {
                        const suite = getSuiteById(rec.testSuiteId);
                        return (
                          <div key={rec.testSuiteId} className="flex justify-between items-center">
                            <span className="text-sm truncate max-w-[150px]">{suite?.name}</span>
                            <div className="flex items-center">
                              <Progress value={rec.predictedSuccessRate} className="w-[80px] mr-2" />
                              <span className="text-sm">{rec.predictedSuccessRate}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Coverage Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      {recommendations.slice(0, 3).map(rec => {
                        const suite = getSuiteById(rec.testSuiteId);
                        return (
                          <div key={rec.testSuiteId} className="flex justify-between items-center">
                            <span className="text-sm truncate max-w-[150px]">{suite?.name}</span>
                            <div className="flex items-center">
                              <Progress value={suite?.coverage} className="w-[80px] mr-2" />
                              <span className="text-sm">{suite?.coverage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Execution Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      {recommendations.slice(0, 3).map(rec => {
                        const suite = getSuiteById(rec.testSuiteId);
                        const efficiency = suite ? (suite.testCount / suite.executionTime * 10).toFixed(1) : "0";
                        return (
                          <div key={rec.testSuiteId} className="flex justify-between items-center">
                            <span className="text-sm truncate max-w-[150px]">{suite?.name}</span>
                            <div className="flex items-center gap-1">
                              <Gauge className="h-4 w-4 text-primary" />
                              <span className="text-sm">{efficiency} tests/sec</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="testSuites">
            <Card>
              <CardHeader>
                <CardTitle>Test Suite Analysis</CardTitle>
                <CardDescription>
                  Detailed overview of all test suites with performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Suite</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Tests</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestSuites.map((suite) => (
                      <TableRow key={suite.id}>
                        <TableCell>
                          <div className="font-medium">{suite.name}</div>
                        </TableCell>
                        <TableCell>
                          {suite.passRate === 100 ? (
                            <Badge className="bg-green-500 flex gap-1 items-center">
                              <Check className="h-3 w-3" /> PASSING
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex gap-1 items-center">
                              <AlertTriangle className="h-3 w-3" /> FAILING
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{suite.lastRun}</TableCell>
                        <TableCell>{suite.testCount}</TableCell>
                        <TableCell>{formatPassRate(suite.passRate)}</TableCell>
                        <TableCell>{suite.executionTime}s</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={suite.coverage} className="w-[60px]" />
                            <span>{suite.coverage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {suite.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSuite(suite.id === selectedSuite ? null : suite.id)}
                          >
                            {suite.id === selectedSuite ? "Hide Details" : "View Details"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {selectedSuite && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Test Suite Details: {getSuiteById(selectedSuite)?.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-md">Pass Rate Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                          <ResponsiveLine
                            data={[{
                              id: "Pass Rate",
                              data: getSuiteById(selectedSuite)?.trend || []
                            }]}
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
                              legend: 'Date',
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
                            colors={["#10b981"]}
                            pointSize={10}
                            pointColor={{ theme: 'background' }}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            pointLabelYOffset={-12}
                            useMesh={true}
                          />
                        </CardContent>
                      </Card>
                      
                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md">Intelligent Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">AI Recommendation Score:</span>
                                <div className="flex items-center">
                                  <Progress value={getRecommendationForSuite(selectedSuite)?.score || 0} className="w-[80px] mr-2" />
                                  <span className="text-sm font-medium">{getRecommendationForSuite(selectedSuite)?.score || 0}/100</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Predicted Success:</span>
                                <span className="text-sm font-medium">{getRecommendationForSuite(selectedSuite)?.predictedSuccessRate || 0}%</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Test Complexity:</span>
                                <span className="text-sm font-medium capitalize">{getSuiteById(selectedSuite)?.complexity}</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Failure Impact:</span>
                                <span className="text-sm font-medium capitalize">{getSuiteById(selectedSuite)?.failureImpact}</span>
                              </div>
                              
                              {getSuiteById(selectedSuite)?.failureReason && (
                                <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                  <p className="text-sm text-amber-700">
                                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                                    Failure reason: {getSuiteById(selectedSuite)?.failureReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md">Dependencies</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {getSuiteById(selectedSuite)?.dependencies.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No dependencies</p>
                            ) : (
                              <ul className="space-y-1">
                                {getSuiteById(selectedSuite)?.dependencies.map(depId => (
                                  <li key={depId} className="text-sm">
                                    • {getSuiteById(depId)?.name} 
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      ({getSuiteById(depId)?.passRate}% pass rate)
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Test Failure Correlation Analysis</CardTitle>
                  <CardDescription>AI-detected patterns in test failures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Performance Test Suite Failures</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The system has detected a strong correlation (87%) between database connection failures and high traffic conditions. Tests consistently fail when database connection pool is exhausted.
                    </p>
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>Confidence: 92%</span>
                      <span>Data points: 78</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">System Integration Test Failures</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connection timeouts in system tests show a 73% correlation with network latency issues. The pattern suggests intermittent infrastructure problems rather than code issues.
                    </p>
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>Confidence: 86%</span>
                      <span>Data points: 42</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">BistroBeast POS Test Pattern</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Order processing failures in BistroBeast tests occur most frequently during high-concurrency scenarios. Tests that simulate multiple simultaneous users exhibit a 65% higher failure rate.
                    </p>
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>Confidence: 79%</span>
                      <span>Data points: 35</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Test Coverage Optimization</CardTitle>
                  <CardDescription>Areas with insufficient test coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Area</TableHead>
                        <TableHead>Current Coverage</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Recommendation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Payment Processing</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={65} className="w-[60px]" />
                            <span>65%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-500">High</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          Add tests for error handling during payment failures and timeout scenarios
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Merchant Onboarding</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={82} className="w-[60px]" />
                            <span>82%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-500">Medium</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          Enhance tests for validation edge cases and document upload failures
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Order Management</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={78} className="w-[60px]" />
                            <span>78%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-500">Medium</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          Add tests for order modification workflows and partial refunds
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Concurrent API Calls</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={58} className="w-[60px]" />
                            <span>58%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-500">High</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          Implement multi-threaded tests to validate API behavior under load
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Error Handling</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={62} className="w-[60px]" />
                            <span>62%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-500">High</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          Add comprehensive tests for system recovery from critical failures
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="prediction">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Test Failure Prediction</CardTitle>
                  <CardDescription>
                    ML-based predictions for test failures in upcoming runs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Suite</TableHead>
                        <TableHead>Failure Probability</TableHead>
                        <TableHead>Likely Cause</TableHead>
                        <TableHead>Mitigation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Performance Test Suite</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress value={82} className="w-[60px] mr-2" />
                            <span className="text-red-500 font-medium">82%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          Database connection pool exhaustion during high load tests
                        </TableCell>
                        <TableCell className="text-sm">
                          Increase connection pool size and implement connection recycling
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">System Integration Test Suite</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress value={68} className="w-[60px] mr-2" />
                            <span className="text-orange-500 font-medium">68%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          Network timeouts during service communication
                        </TableCell>
                        <TableCell className="text-sm">
                          Implement retry logic with exponential backoff
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">BistroBeast POS Tests</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress value={45} className="w-[60px] mr-2" />
                            <span className="text-yellow-500 font-medium">45%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          Race conditions in order processing during high concurrency
                        </TableCell>
                        <TableCell className="text-sm">
                          Implement proper locking mechanisms for shared resources
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">API Test Suite</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress value={23} className="w-[60px] mr-2" />
                            <span className="text-green-500 font-medium">23%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          Input validation errors for new payment endpoints
                        </TableCell>
                        <TableCell className="text-sm">
                          Add more comprehensive schema validation before processing
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Merchant Onboarding Tests</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress value={18} className="w-[60px] mr-2" />
                            <span className="text-green-500 font-medium">18%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          Document validation errors during high-volume registration
                        </TableCell>
                        <TableCell className="text-sm">
                          Add document validation queue to prevent system overload
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                  <CardDescription>
                    Unusual patterns detected in recent test runs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                      <h3 className="font-medium text-amber-800">Performance Degradation Detected</h3>
                    </div>
                    <p className="text-sm text-amber-700 mt-2">
                      The system has detected a 27% increase in average response time for API endpoints over the past week. This pattern is unusual compared to historical data.
                    </p>
                    <div className="mt-3 text-xs text-amber-600 flex justify-between">
                      <span>Confidence: 92%</span>
                      <span>First detected: 3 days ago</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <h3 className="font-medium text-red-800">Critical Service Failure Spike</h3>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      Unusual pattern of database connection failures occurring specifically between 2:00-3:00 AM UTC. This suggests a potential scheduled job or maintenance issue.
                    </p>
                    <div className="mt-3 text-xs text-red-600 flex justify-between">
                      <span>Confidence: 96%</span>
                      <span>First detected: 5 days ago</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-blue-800">Test Coverage Fluctuation</h3>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      The system detected unusual fluctuations in test coverage for payment processing modules. Coverage decreases significantly after deployments and gradually increases.
                    </p>
                    <div className="mt-3 text-xs text-blue-600 flex justify-between">
                      <span>Confidence: 88%</span>
                      <span>Pattern duration: 2 weeks</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Filter className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-medium text-green-800">Test Efficiency Improvement</h3>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Positive anomaly detected: BistroBeast POS test execution time improved by 32% after recent infrastructure changes. This is significantly better than expected.
                    </p>
                    <div className="mt-3 text-xs text-green-600 flex justify-between">
                      <span>Confidence: 94%</span>
                      <span>First detected: 1 week ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}