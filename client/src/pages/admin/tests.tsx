import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, 
  Play, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Filter,
  RefreshCw,
  DownloadIcon,
  Search,
  LayoutList,
  CheckSquare
} from "lucide-react";

// Test types
interface TestResult {
  id: string;
  name: string;
  description: string;
  status: "passed" | "failed" | "running" | "pending";
  duration: number; // in milliseconds
  startTime: string;
  endTime?: string;
  details?: string;
  error?: string;
  category: string;
}

interface TestGroup {
  name: string;
  tests: Test[];
}

interface Test {
  id: string;
  name: string;
  description: string;
  category: string;
  lastRun?: TestResult; 
}

export default function AdminTestsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [runningTests, setRunningTests] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategory, setFilteredCategory] = useState<string>("all");
  
  // Mock test data
  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch from the API
        // const response = await apiRequest("GET", "/api/admin/tests");
        // if (!response.ok) throw new Error("Failed to fetch tests");
        // const data = await response.json();
        
        // For demo, use mock data structured by category
        const mockTestGroups: TestGroup[] = [
          {
            name: "Payment System Tests",
            tests: [
              {
                id: "test-payment-gateway",
                name: "Payment Gateway Integration",
                description: "Verify that payment gateway can process credit card payments correctly",
                category: "payment",
                lastRun: {
                  id: "run-1234",
                  name: "Payment Gateway Integration",
                  description: "Verify that payment gateway can process credit card payments correctly",
                  status: "passed",
                  duration: 1532,
                  startTime: "2023-04-12T14:30:00Z",
                  endTime: "2023-04-12T14:30:01Z",
                  category: "payment"
                }
              },
              {
                id: "test-refund-processing",
                name: "Refund Processing",
                description: "Verify that refunds are correctly processed and funds returned",
                category: "payment",
                lastRun: {
                  id: "run-2345",
                  name: "Refund Processing",
                  description: "Verify that refunds are correctly processed and funds returned",
                  status: "passed",
                  duration: 2104,
                  startTime: "2023-04-12T14:35:00Z",
                  endTime: "2023-04-12T14:35:02Z",
                  category: "payment"
                }
              },
              {
                id: "test-payment-webhooks",
                name: "Payment Webhooks",
                description: "Verify that webhook notifications for successful and failed payments are working",
                category: "payment"
              }
            ]
          },
          {
            name: "Legal System Tests",
            tests: [
              {
                id: "test-iolta-account-reconciliation",
                name: "IOLTA Account Reconciliation",
                description: "Verify that IOLTA trust accounts are correctly reconciled",
                category: "legal",
                lastRun: {
                  id: "run-3456",
                  name: "IOLTA Account Reconciliation",
                  description: "Verify that IOLTA trust accounts are correctly reconciled",
                  status: "failed",
                  duration: 3210,
                  startTime: "2023-04-12T15:00:00Z",
                  endTime: "2023-04-12T15:00:03Z",
                  error: "Balance mismatch detected in trust account #12345",
                  category: "legal"
                }
              },
              {
                id: "test-document-processing",
                name: "Legal Document Processing",
                description: "Verify that legal documents are correctly processed and stored",
                category: "legal",
                lastRun: {
                  id: "run-4567",
                  name: "Legal Document Processing",
                  description: "Verify that legal documents are correctly processed and stored",
                  status: "passed",
                  duration: 1870,
                  startTime: "2023-04-12T15:05:00Z",
                  endTime: "2023-04-12T15:05:02Z",
                  category: "legal"
                }
              }
            ]
          },
          {
            name: "Affiliate System Tests",
            tests: [
              {
                id: "test-affiliate-tracking",
                name: "Affiliate Tracking",
                description: "Verify that affiliate referrals are correctly tracked and attributed",
                category: "affiliate",
                lastRun: {
                  id: "run-5678",
                  name: "Affiliate Tracking",
                  description: "Verify that affiliate referrals are correctly tracked and attributed",
                  status: "passed",
                  duration: 1450,
                  startTime: "2023-04-12T15:15:00Z",
                  endTime: "2023-04-12T15:15:01Z",
                  category: "affiliate"
                }
              },
              {
                id: "test-commission-calculation",
                name: "Commission Calculation",
                description: "Verify that affiliate commissions are calculated correctly",
                category: "affiliate"
              }
            ]
          },
          {
            name: "Security Tests",
            tests: [
              {
                id: "test-authentication",
                name: "Authentication System",
                description: "Verify that users can log in securely and sessions are managed correctly",
                category: "security",
                lastRun: {
                  id: "run-6789",
                  name: "Authentication System",
                  description: "Verify that users can log in securely and sessions are managed correctly",
                  status: "passed",
                  duration: 980,
                  startTime: "2023-04-12T15:30:00Z",
                  endTime: "2023-04-12T15:30:01Z",
                  category: "security"
                }
              },
              {
                id: "test-permissions",
                name: "Permission System",
                description: "Verify that role-based permissions are enforced correctly",
                category: "security",
                lastRun: {
                  id: "run-7890",
                  name: "Permission System",
                  description: "Verify that role-based permissions are enforced correctly",
                  status: "failed",
                  duration: 1200,
                  startTime: "2023-04-12T15:35:00Z",
                  endTime: "2023-04-12T15:35:01Z",
                  error: "Admin user unable to access system settings page",
                  category: "security"
                }
              },
              {
                id: "test-csrf-protection",
                name: "CSRF Protection",
                description: "Verify that Cross-Site Request Forgery protection is working",
                category: "security"
              }
            ]
          },
          {
            name: "Database System Tests",
            tests: [
              {
                id: "test-database-connection",
                name: "Database Connection",
                description: "Verify that the application can connect to the database",
                category: "database",
                lastRun: {
                  id: "run-8901",
                  name: "Database Connection",
                  description: "Verify that the application can connect to the database",
                  status: "passed",
                  duration: 340,
                  startTime: "2023-04-12T16:00:00Z",
                  endTime: "2023-04-12T16:00:00Z",
                  category: "database"
                }
              },
              {
                id: "test-data-integrity",
                name: "Data Integrity Checks",
                description: "Verify that data is stored and retrieved correctly without corruption",
                category: "database",
                lastRun: {
                  id: "run-9012",
                  name: "Data Integrity Checks",
                  description: "Verify that data is stored and retrieved correctly without corruption",
                  status: "passed",
                  duration: 1530,
                  startTime: "2023-04-12T16:05:00Z",
                  endTime: "2023-04-12T16:05:02Z",
                  category: "database"
                }
              }
            ]
          }
        ];
        
        setTestGroups(mockTestGroups);
        
        // Collect all test results for the history tab
        const allResults: TestResult[] = [];
        mockTestGroups.forEach(group => {
          group.tests.forEach(test => {
            if (test.lastRun) {
              allResults.push(test.lastRun);
            }
          });
        });
        
        setTestResults(allResults);
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast({
          title: "Error",
          description: "Failed to load tests. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTests();
  }, [toast]);
  
  // Handle test selection toggle
  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(id => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  };
  
  // Handle select all tests in a group
  const toggleGroupSelection = (groupName: string) => {
    const group = testGroups.find(g => g.name === groupName);
    if (!group) return;
    
    const groupTestIds = group.tests.map(test => test.id);
    
    // Check if all tests in the group are already selected
    const allSelected = groupTestIds.every(id => selectedTests.includes(id));
    
    if (allSelected) {
      // Remove all tests in this group from selection
      setSelectedTests(prev => prev.filter(id => !groupTestIds.includes(id)));
    } else {
      // Add all tests in this group to selection
      setSelectedTests(prev => {
        const newSelection = [...prev];
        groupTestIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };
  
  // Run selected tests
  const runTests = async () => {
    if (selectedTests.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test to run",
        variant: "destructive"
      });
      return;
    }
    
    setRunningTests(selectedTests);
    
    try {
      // For each selected test, simulate a running state and then a result
      for (const testId of selectedTests) {
        // Find the test
        let foundTest: Test | undefined;
        let foundGroup: TestGroup | undefined;
        
        for (const group of testGroups) {
          const test = group.tests.find(t => t.id === testId);
          if (test) {
            foundTest = test;
            foundGroup = group;
            break;
          }
        }
        
        if (!foundTest || !foundGroup) continue;
        
        // Create a new test result
        const newResult: TestResult = {
          id: `run-${Date.now()}-${testId}`,
          name: foundTest.name,
          description: foundTest.description,
          status: "running",
          duration: 0,
          startTime: new Date().toISOString(),
          category: foundTest.category
        };
        
        // Update the test results list
        setTestResults(prev => [newResult, ...prev]);
        
        // Simulate test running (1-3 seconds)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Update with final result (80% chance of success)
        const success = Math.random() > 0.2;
        const duration = 500 + Math.floor(Math.random() * 3000);
        const endTime = new Date().toISOString();
        
        const finalResult: TestResult = {
          ...newResult,
          status: success ? "passed" : "failed",
          duration,
          endTime,
          error: success ? undefined : `Error running test: ${foundTest.name} failed validation`
        };
        
        // Update test results
        setTestResults(prev => 
          prev.map(result => 
            result.id === newResult.id ? finalResult : result
          )
        );
        
        // Update the test's lastRun in test groups
        setTestGroups(prev => 
          prev.map(group => 
            group.name === foundGroup?.name 
              ? {
                  ...group,
                  tests: group.tests.map(test => 
                    test.id === testId 
                      ? { ...test, lastRun: finalResult } 
                      : test
                  )
                }
              : group
          )
        );
        
        // Remove from running list
        setRunningTests(prev => prev.filter(id => id !== testId));
        
        // Show toast for failed tests
        if (!success) {
          toast({
            title: "Test Failed",
            description: `${foundTest.name} failed: ${finalResult.error}`,
            variant: "destructive"
          });
        }
      }
      
      // Final success toast
      toast({
        title: "Tests Completed",
        description: `${selectedTests.length} tests have been run`,
      });
      
    } catch (error) {
      console.error("Error running tests:", error);
      toast({
        title: "Error",
        description: "Failed to run tests. Please try again.",
        variant: "destructive"
      });
      setRunningTests([]);
    }
  };
  
  // Reset all test selections
  const resetSelection = () => {
    setSelectedTests([]);
  };
  
  // Filter tests based on search term and category
  const getFilteredGroups = () => {
    if (!searchTerm && filteredCategory === "all") {
      return testGroups;
    }
    
    return testGroups.map(group => {
      const filteredTests = group.tests.filter(test => {
        const matchesSearch = searchTerm === "" || 
          test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesCategory = filteredCategory === "all" || test.category === filteredCategory;
        
        return matchesSearch && matchesCategory;
      });
      
      return {
        ...group,
        tests: filteredTests
      };
    }).filter(group => group.tests.length > 0);
  };
  
  // Get test status badge
  const TestStatusBadge = ({ status }: { status: string }) => {
    const variants = {
      passed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      running: "bg-blue-100 text-blue-800 border-blue-200",
      pending: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    const icons = {
      passed: <CheckCircle2 className="h-3 w-3 mr-1" />,
      failed: <XCircle className="h-3 w-3 mr-1" />,
      running: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
      pending: <Clock className="h-3 w-3 mr-1" />
    };
    
    const style = variants[status as keyof typeof variants] || variants.pending;
    const icon = icons[status as keyof typeof icons] || icons.pending;
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };
  
  // Format duration in a human-readable format
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">Test Center</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={runTests} 
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={selectedTests.length === 0 || runningTests.length > 0}
          >
            {runningTests.length > 0 ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running ({runningTests.length})
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Selected ({selectedTests.length})
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <Tabs defaultValue="tests">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="tests">Available Tests</TabsTrigger>
              <TabsTrigger value="history">Test History</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center border rounded-md overflow-hidden bg-white w-64">
                <Input
                  type="text"
                  placeholder="Search tests..."
                  className="border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="px-3 py-2 bg-gray-50">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <select 
                className="border rounded-md px-3 py-1.5 bg-white text-sm"
                value={filteredCategory}
                onChange={(e) => setFilteredCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="payment">Payment</option>
                <option value="legal">Legal</option>
                <option value="affiliate">Affiliate</option>
                <option value="security">Security</option>
                <option value="database">Database</option>
              </select>
              
              {(selectedTests.length > 0 || searchTerm || filteredCategory !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetSelection}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
          
          <TabsContent value="tests" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : getFilteredGroups().length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <LayoutList className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No tests found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredGroups().map((group) => (
                  <Card key={group.name}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{group.name}</CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleGroupSelection(group.name)}
                        >
                          {group.tests.every(test => selectedTests.includes(test.id)) 
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <CardDescription>
                        {group.tests.length} test{group.tests.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {group.tests.map((test) => (
                          <div 
                            key={test.id}
                            className={`p-3 rounded-md border ${
                              selectedTests.includes(test.id) 
                                ? "bg-blue-50 border-blue-200" 
                                : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start flex-1">
                                <div>
                                  <input 
                                    type="checkbox" 
                                    id={test.id} 
                                    checked={selectedTests.includes(test.id)}
                                    onChange={() => toggleTestSelection(test.id)}
                                    className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    disabled={runningTests.includes(test.id)}
                                  />
                                </div>
                                <div className="flex-1">
                                  <label 
                                    htmlFor={test.id}
                                    className="font-medium cursor-pointer flex-1"
                                  >
                                    {test.name}
                                  </label>
                                  <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{test.category}</Badge>
                                {test.lastRun && (
                                  <TestStatusBadge status={
                                    runningTests.includes(test.id) ? "running" : test.lastRun.status
                                  } />
                                )}
                                {!test.lastRun && !runningTests.includes(test.id) && (
                                  <span className="text-xs text-gray-500">Never run</span>
                                )}
                                {runningTests.includes(test.id) && !test.lastRun && (
                                  <TestStatusBadge status="running" />
                                )}
                              </div>
                            </div>
                            
                            {test.lastRun && (
                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Last run: {new Date(test.lastRun.startTime).toLocaleString()} 
                                {test.lastRun.duration && ` (${formatDuration(test.lastRun.duration)})`}
                                
                                {test.lastRun.error && (
                                  <div className="mt-1 text-xs text-red-500 ml-4">
                                    <AlertCircle className="h-3 w-3 inline mr-1" />
                                    {test.lastRun.error}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Test Run History</CardTitle>
                <CardDescription>
                  Record of all test executions and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No test results available yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                      const tabEl = document.querySelector('[data-value="tests"]');
                      if (tabEl instanceof HTMLElement) {
                        tabEl.click();
                      }
                    }}
                    >
                      Go to Tests
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((result) => (
                        <Accordion type="single" collapsible key={result.id}>
                          <AccordionItem value={result.id}>
                            <AccordionTrigger>
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center">
                                  <TestStatusBadge status={result.status} />
                                  <span className="ml-2 font-medium">{result.name}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDuration(result.duration)}
                                  <span className="mx-2">•</span>
                                  {new Date(result.startTime).toLocaleString()}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="p-4 bg-gray-50 rounded-md mt-2">
                                <p className="text-sm mb-2">{result.description}</p>
                                
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Start Time</p>
                                    <p>{new Date(result.startTime).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">End Time</p>
                                    <p>{result.endTime ? new Date(result.endTime).toLocaleString() : "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Duration</p>
                                    <p>{formatDuration(result.duration)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Category</p>
                                    <p className="capitalize">{result.category}</p>
                                  </div>
                                </div>
                                
                                {result.error && (
                                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                                    <p className="font-medium mb-1">Error Details:</p>
                                    <p>{result.error}</p>
                                  </div>
                                )}
                                
                                {result.details && (
                                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                    <p className="font-medium mb-1">Test Details:</p>
                                    <p>{result.details}</p>
                                  </div>
                                )}
                                
                                {result.status === "passed" && !result.details && (
                                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                                    <p className="flex items-center">
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      All test assertions passed successfully
                                    </p>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}