import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AdminLayout from "@/components/admin/admin-layout";

interface TestGroup {
  name: string;
  passed: boolean;
  testCount: number;
  passedTests: number;
}

interface TestReport {
  name: string;
  passed: boolean;
  timestamp: string;
  testGroups: TestGroup[];
  reportPaths: string[];
}

function TestSuiteList() {
  const [loading, setLoading] = useState(true);
  const [suites, setSuites] = useState<string[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [runningTest, setRunningTest] = useState(false);
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch test suites
    fetch("/api/tests/suites")
      .then(res => res.json())
      .then(data => {
        setSuites(data.suites || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching test suites:", err);
        toast({
          title: "Error",
          description: "Failed to load test suites. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, [toast]);

  const runTest = (suiteName: string) => {
    setSelectedSuite(suiteName);
    setRunningTest(true);
    setTestReport(null);

    // Run the test
    fetch(`/api/tests/run/${suiteName}`)
      .then(res => res.json())
      .then(data => {
        setTestReport(data);
        setRunningTest(false);
        toast({
          title: data.passed ? "Test Passed" : "Test Failed",
          description: `${data.name} completed with ${data.passed ? "success" : "failures"}.`,
          variant: data.passed ? "default" : "destructive",
        });
      })
      .catch(err => {
        console.error(`Error running test suite ${suiteName}:`, err);
        setRunningTest(false);
        toast({
          title: "Error",
          description: "Failed to run test. Please try again.",
          variant: "destructive",
        });
      });
  };

  const viewReport = (reportPath: string) => {
    window.open(`/api/tests/reports/${reportPath.split('/').pop()}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suites.map(suite => (
          <Card key={suite} className="shadow-md">
            <CardHeader>
              <CardTitle className="capitalize">{suite} Tests</CardTitle>
              <CardDescription>Run comprehensive tests for {suite} functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tests various aspects of the {suite} system components including integration points 
                and error handling.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => runTest(suite)} 
                disabled={runningTest}
                className="w-full"
                variant={selectedSuite === suite ? "outline" : "default"}
              >
                {runningTest && selectedSuite === suite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Test Suite"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {testReport && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {testReport.name}
                  {testReport.passed ? (
                    <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="ml-2 h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Completed on {new Date(testReport.timestamp).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {testReport.reportPaths.map((path, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => viewReport(path)}
                  >
                    View {path.endsWith('.html') ? 'HTML' : 'JSON'} Report
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Test Groups</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Overall Progress
                      </span>
                      <span className="text-sm">
                        {testReport.testGroups.reduce((acc, group) => acc + group.passedTests, 0)}/
                        {testReport.testGroups.reduce((acc, group) => acc + group.testCount, 0)} tests passed
                      </span>
                    </div>
                    <Progress 
                      value={
                        (testReport.testGroups.reduce((acc, group) => acc + group.passedTests, 0) / 
                        testReport.testGroups.reduce((acc, group) => acc + group.testCount, 0)) * 100
                      } 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-medium">Test Groups</div>
                      <div className="text-2xl font-bold">
                        {testReport.testGroups.filter(g => g.passed).length}/{testReport.testGroups.length} Passed
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-medium">Individual Tests</div>
                      <div className="text-2xl font-bold">
                        {testReport.testGroups.reduce((acc, group) => acc + group.passedTests, 0)}/
                        {testReport.testGroups.reduce((acc, group) => acc + group.testCount, 0)} Passed
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-medium">Overall Result</div>
                      <div className={`text-2xl font-bold ${testReport.passed ? 'text-green-500' : 'text-red-500'}`}>
                        {testReport.passed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  {testReport.testGroups.map((group, index) => (
                    <Card key={index}>
                      <CardHeader className={`py-3 ${group.passed ? 'bg-green-50' : 'bg-red-50'} border-b`}>
                        <div className="flex items-center">
                          {group.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <CardTitle className="text-base">
                            {group.name}
                          </CardTitle>
                          <div className="ml-auto text-xs font-medium">
                            {group.passedTests}/{group.testCount} passed
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3">
                        <Progress 
                          value={(group.passedTests / group.testCount) * 100} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TestDashboard() {
  return (
    <AdminLayout>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testing Dashboard</h1>
            <p className="text-muted-foreground">
              Run, monitor, and view comprehensive test suites for system components
            </p>
          </div>
        </div>
        
        <TestSuiteList />
      </div>
    </AdminLayout>
  );
}