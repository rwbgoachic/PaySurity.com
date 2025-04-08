import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/admin-layout";

interface TestResult {
  name: string;
  passed: boolean;
  errorDetails?: string;
  timestamp: string;
  reportPaths?: string[];
}

export default function TestSuite() {
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const tests = [
    {
      id: "delivery",
      name: "Delivery System",
      description: "Tests delivery provider integration, order fulfillment, and tracking functionality",
    },
    {
      id: "system",
      name: "System Integrity",
      description: "Verifies core system functionality including authentication, database, and server operations",
    },
    {
      id: "api",
      name: "API Endpoints",
      description: "Tests all API endpoints for proper responses, error handling, and data validation",
    },
    {
      id: "performance",
      name: "Performance",
      description: "Measures system performance under various load conditions and transaction volumes",
    },
  ];

  const runTest = async (testId: string) => {
    setCurrentTest(testId);
    setLoading(true);

    try {
      const response = await fetch(`/api/tests/run/${testId}`);
      const result = await response.json();

      // Add the result to the results array
      setResults(prev => [result, ...prev]);

      toast({
        title: result.passed ? "Test Passed" : "Test Failed",
        description: `${result.name} completed with ${result.passed ? "success" : "failures"}.`,
        variant: result.passed ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error running test:", error);
      toast({
        title: "Error",
        description: "Failed to run test. See console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setCurrentTest(null);
    }
  };

  const viewReport = (reportPath: string) => {
    window.open(`/api/tests/reports/${reportPath.split('/').pop()}`, "_blank");
  };

  return (
    <AdminLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Test Suite Runner</h1>

        <Tabs defaultValue="run" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="run">Run Tests</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
          </TabsList>

          <TabsContent value="run">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.map(test => (
                <Card key={test.id} className={currentTest === test.id ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      onClick={() => runTest(test.id)}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading && currentTest === test.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        `Run ${test.name} Tests`
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No test results yet. Run some tests to see history.
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index} className={result.passed ? "border-green-500/20" : "border-red-500/20"}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            {result.name}
                            <span
                              className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                result.passed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {result.passed ? "PASSED" : "FAILED"}
                            </span>
                          </CardTitle>
                          <CardDescription>
                            {new Date(result.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                        {result.reportPaths && (
                          <div className="flex space-x-2">
                            {result.reportPaths.map((path: string, i: number) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                onClick={() => viewReport(path)}
                              >
                                View {path.endsWith(".html") ? "HTML" : "JSON"} Report
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {result.errorDetails && (
                      <CardContent>
                        <div className="bg-red-50 p-3 rounded text-sm text-red-900 font-mono">
                          {result.errorDetails}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}