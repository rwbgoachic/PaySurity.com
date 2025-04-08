import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, CheckCircle2, XCircle, Play, FileText } from 'lucide-react';

interface TestSuite {
  name: string;
}

interface TestGroupSummary {
  name: string;
  passed: boolean;
  testCount: number;
  failedTests: number;
}

interface TestRunResult {
  passed: boolean;
  timestamp: string;
  testGroups: TestGroupSummary[];
  reportPaths: string[];
}

export default function TestSuitePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('available');
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string[]>(['json', 'html']);
  const [lastResult, setLastResult] = useState<TestRunResult | null>(null);

  // Get available test suites
  const {
    data: testSuites,
    isLoading: suitesLoading,
    error: suitesError
  } = useQuery<{ suites: string[] }>({
    queryKey: ['/api/tests/suites'],
    refetchOnWindowFocus: false
  });

  // Mutation to run tests
  const runTestMutation = useMutation({
    mutationFn: async ({
      suite,
      format
    }: {
      suite?: string;
      format: string[];
    }) => {
      const res = await apiRequest('POST', '/api/tests/run', { suite, format });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to run tests');
      }
      return await res.json();
    },
    onSuccess: (data: TestRunResult) => {
      setLastResult(data);
      setActiveTab('results');
      
      toast({
        title: data.passed ? 'Tests passed!' : 'Tests failed',
        description: `Run completed at ${new Date(data.timestamp).toLocaleString()}`,
        variant: data.passed ? 'default' : 'destructive'
      });

      // Invalidate test suites query to refresh list
      queryClient.invalidateQueries({ queryKey: ['/api/tests/suites'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error running tests',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handler for running tests
  const handleRunTests = (suite?: string) => {
    runTestMutation.mutate({
      suite,
      format: selectedFormat
    });
  };

  // Handler for viewing report
  const handleViewReport = (reportPath: string) => {
    const reportName = reportPath.split('/').pop();
    if (reportName) {
      window.open(`/api/tests/reports/${reportName}`, '_blank');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">System Test Suite</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="available">Available Tests</TabsTrigger>
          <TabsTrigger value="running" disabled={!runTestMutation.isPending}>Running Tests</TabsTrigger>
          <TabsTrigger value="results" disabled={!lastResult}>Test Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Test Suites</CardTitle>
              <CardDescription>
                Select a test suite to run or run all tests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suitesLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : suitesError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load test suites. Please try again.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Output Format</h3>
                    <div className="flex flex-wrap gap-2">
                      {['json', 'html', 'console'].map(format => (
                        <Badge 
                          key={format}
                          variant={selectedFormat.includes(format) ? 'default' : 'outline'} 
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedFormat.includes(format)) {
                              if (selectedFormat.length > 1) {
                                setSelectedFormat(selectedFormat.filter(f => f !== format));
                              }
                            } else {
                              setSelectedFormat([...selectedFormat, format]);
                            }
                          }}
                        >
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-xl">Run All Tests</CardTitle>
                        <CardDescription>
                          Run a comprehensive test of all system components
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          onClick={() => handleRunTests()} 
                          disabled={runTestMutation.isPending}
                          className="w-full"
                        >
                          {runTestMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Run All Tests
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {testSuites?.suites.map(suite => (
                      <Card key={suite} className={selectedSuite === suite ? 'border-primary' : ''}>
                        <CardHeader className="p-4">
                          <CardTitle className="text-xl capitalize">{suite} Tests</CardTitle>
                          <CardDescription>
                            Run tests for the {suite} module
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0">
                          <Button 
                            onClick={() => {
                              setSelectedSuite(suite);
                              handleRunTests(suite);
                            }} 
                            disabled={runTestMutation.isPending}
                            className="w-full"
                            variant={selectedSuite === suite ? 'default' : 'outline'}
                          >
                            {runTestMutation.isPending && selectedSuite === suite ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Run {suite} Tests
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="running">
          <Card>
            <CardHeader>
              <CardTitle>Running Tests</CardTitle>
              <CardDescription>
                {selectedSuite ? `Running ${selectedSuite} tests...` : 'Running all tests...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  Tests are running. Please wait...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          {lastResult && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Test Results</CardTitle>
                  <Badge variant={lastResult.passed ? 'default' : 'destructive'}>
                    {lastResult.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
                <CardDescription>
                  Run completed at {new Date(lastResult.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Reports</h3>
                    <div className="flex flex-wrap gap-2">
                      {lastResult.reportPaths.map(path => {
                        const format = path.split('.').pop() || '';
                        const isHtml = format === 'html';
                        return (
                          <Button 
                            key={path} 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewReport(path)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View {isHtml ? 'HTML' : format.toUpperCase()} Report
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {lastResult.testGroups.map((group, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center">
                            {group.passed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span>{group.name}</span>
                            <Badge variant={group.passed ? 'outline' : 'destructive'} className="ml-3">
                              {group.passed ? 'PASSED' : `${group.failedTests} FAILED`}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 bg-muted/50 rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground text-sm">Total Tests</span>
                                <span className="text-lg font-medium">{group.testCount}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-muted-foreground text-sm">Failed Tests</span>
                                <span className="text-lg font-medium">{group.failedTests}</span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRunTests(group.name.split(' ')[0].toLowerCase())}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Run Again
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => {
                    setActiveTab('available');
                    setSelectedSuite(null);
                  }}
                >
                  Back to Test Suites
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}