import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { BarChart, LineChart, PieChart, Activity, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TestResultSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRatePercentage: number;
  testsByType: { id: string; value: number }[];
  testTrend: { x: string; y: number }[];
  performanceMetrics: { category: string; avg: number; max: number }[];
}

export default function AnalyticsDashboard() {
  const [summaryData, setSummaryData] = useState<TestResultSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, this would fetch from a real API endpoint
    // But for demonstration, we'll use sample data
    
    // Simulate API fetch delay
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Demo data for visualization - this would be fetched from the API
        const demoData = {
          totalTests: 432,
          passedTests: 398,
          failedTests: 34,
          passRatePercentage: 92.13,
          testsByType: [
            { id: "API", value: 128 },
            { id: "System", value: 94 },
            { id: "Performance", value: 112 },
            { id: "Delivery", value: 98 }
          ],
          testTrend: [
            { x: "Jan", y: 87 },
            { x: "Feb", y: 88 },
            { x: "Mar", y: 91 },
            { x: "Apr", y: 89 },
            { x: "May", y: 92 },
            { x: "Jun", y: 93 },
            { x: "Jul", y: 92 }
          ],
          performanceMetrics: [
            { category: "Database", avg: 240, max: 780 },
            { category: "API Response", avg: 180, max: 620 },
            { category: "Page Load", avg: 380, max: 980 },
            { category: "Auth", avg: 110, max: 420 }
          ]
        };
        
        setSummaryData(demoData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading || !summaryData) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const testPassRateData = [
    { id: "Passed", label: "Passed", value: summaryData.passedTests },
    { id: "Failed", label: "Failed", value: summaryData.failedTests }
  ];
  
  const lineChartData = [
    {
      id: "Pass Rate",
      data: summaryData.testTrend.map(point => ({ x: point.x, y: point.y }))
    }
  ];
  
  const performanceChartData = summaryData.performanceMetrics.map(metric => ({
    category: metric.category,
    avg: metric.avg,
    max: metric.max
  }));

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            View test statistics, performance metrics, and system health indicators
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Refresh Data</Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tests Run</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Across all test suites
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.passedTests}</div>
            <p className="text-xs text-muted-foreground">
              {summaryData.passRatePercentage.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tests Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.failedTests}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - summaryData.passRatePercentage).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Good</div>
            <p className="text-xs text-muted-foreground">
              Based on test metrics & performance
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" /> Performance
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" /> Distribution
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Test Pass Rate Trend</CardTitle>
                <CardDescription>
                  Monthly trend of test pass rate percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveLine
                  data={lineChartData}
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
                    legend: 'Month',
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
                  colors={{ scheme: 'category10' }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Test Pass Rate</CardTitle>
                <CardDescription>
                  Current pass/fail test distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsivePie
                  data={testPassRateData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  colors={['#22c55e', '#ef4444']}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 30,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 10,
                      symbolShape: 'circle'
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Tests by Type</CardTitle>
              <CardDescription>
                Distribution of test cases across test categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveBar
                data={summaryData.testsByType}
                keys={['value']}
                indexBy="id"
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                padding={0.3}
                colors={{ scheme: 'category10' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Test Type',
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
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                animate={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Average and maximum response time in milliseconds by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveBar
                data={performanceChartData}
                keys={['avg', 'max']}
                indexBy="category"
                margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
                padding={0.3}
                groupMode="grouped"
                colors={{ scheme: 'paired' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Category',
                  legendPosition: 'middle',
                  legendOffset: 32
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Time (ms)',
                  legendPosition: 'middle',
                  legendOffset: -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 40,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemOpacity: 1
                        }
                      }
                    ]
                  }
                ]}
                animate={true}
              />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {performanceChartData.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-md font-medium">{metric.category} Response Time</CardTitle>
                  <CardDescription>
                    Average: {metric.avg}ms / Maximum: {metric.max}ms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average</span>
                      <span className="text-sm font-medium">{metric.avg}ms</span>
                    </div>
                    <Progress value={(metric.avg / 1000) * 100} className="h-2" />
                    
                    <div className="flex justify-between pt-2">
                      <span className="text-sm">Maximum</span>
                      <span className="text-sm font-medium">{metric.max}ms</span>
                    </div>
                    <Progress value={(metric.max / 1000) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Type Distribution</CardTitle>
                <CardDescription>
                  Distribution of tests by test type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsivePie
                  data={summaryData.testsByType}
                  margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#ffffff"
                  colors={{ scheme: 'nivo' }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 30,
                      itemsSpacing: 0,
                      itemWidth: 80,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 10,
                      symbolShape: 'circle'
                    }
                  ]}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pass/Fail Distribution</CardTitle>
                <CardDescription>
                  Distribution of test results by pass/fail status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsivePie
                  data={testPassRateData}
                  margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#ffffff"
                  colors={['#22c55e', '#ef4444']}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 30,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 10,
                      symbolShape: 'circle'
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}