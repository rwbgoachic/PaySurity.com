import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FileText, 
  ListChecks, 
  ScrollText, 
  Code, 
  HelpCircle, 
  Download, 
  Upload, 
  ClipboardList, 
  Calendar, 
  FileCode2, 
  FileCheck,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data structure for our documentation system
interface DocumentVersion {
  id: string;
  version: string;
  updatedAt: string;
  updatedBy: string;
  changeDescription: string;
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

interface PendingTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'needs-decision';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  reason?: string;
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  sourceTable: string;
  targetTable: string;
  metadata: string;
  category: string;
}

interface CommissionStructure {
  id: string;
  type: 'affiliate' | 'iso';
  name: string;
  milestones: {
    name: string;
    days: number;
    amount: string;
    percentage?: string;
    recurring?: boolean;
  }[];
}

const ProjectDocumentation = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("brd");
  const [loading, setLoading] = useState(true);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [commissionStructures, setCommissionStructures] = useState<CommissionStructure[]>([]);
  
  // Mock Excel export function
  const handleExportToExcel = () => {
    toast({
      title: "Export initiated",
      description: "Your documentation is being exported to Excel format.",
    });
    
    // In a real implementation, this would trigger a backend process
    setTimeout(() => {
      toast({
        title: "Export completed",
        description: "Your documentation has been exported to Excel. Check your downloads folder.",
      });
    }, 2000);
  };
  
  useEffect(() => {
    const fetchDocumentationData = async () => {
      setLoading(true);
      try {
        // In a real implementation, these would be separate API calls
        // For this prototype, we'll simulate with static data
        
        // Sample version history
        setDocumentVersions([
          {
            id: "1",
            version: "1.0.0",
            updatedAt: "2025-04-08T14:30:00Z",
            updatedBy: "System Admin",
            changeDescription: "Initial documentation structure established"
          },
          {
            id: "2",
            version: "1.0.1",
            updatedAt: "2025-04-09T09:15:00Z",
            updatedBy: "System Admin",
            changeDescription: "Added affiliate commission structure documentation"
          }
        ]);
        
        // Sample pending tasks
        setPendingTasks([
          {
            id: "1",
            title: "Complete ISO commission calculation documentation",
            description: "Document the calculation formulas and business rules for ISO partner commissions.",
            status: "pending",
            priority: "high",
            assignedTo: "AI Assistant"
          },
          {
            id: "2",
            title: "Update merchant microsite documentation",
            description: "Add technical diagrams for subdomain architecture.",
            status: "in-progress",
            priority: "medium",
            assignedTo: "AI Assistant"
          },
          {
            id: "3",
            title: "Select preferred KYC provider integration",
            description: "Need to decide between Onfido, Persona, and IDology for KYC verification.",
            status: "needs-decision",
            priority: "high",
            assignedTo: "Project Owner",
            reason: "Requires business decision on preferred vendor and budget approval"
          }
        ]);
        
        // Sample report definitions
        setReports([
          {
            id: "1",
            name: "Merchant Acquisition Report",
            description: "Daily report of new merchant signups and their acquisition channels",
            sourceTable: "merchant_profiles",
            targetTable: "acquisition_reports",
            metadata: "Created daily at midnight",
            category: "Marketing"
          },
          {
            id: "2",
            name: "Affiliate Performance Report",
            description: "Monthly performance metrics for affiliate partners",
            sourceTable: "affiliate_payouts, merchant_profiles",
            targetTable: "affiliate_performance_reports",
            metadata: "Created on the 1st of each month",
            category: "Partner Management"
          }
        ]);
        
        // Sample commission structures
        setCommissionStructures([
          {
            id: "1",
            type: "affiliate",
            name: "Standard Affiliate",
            milestones: [
              { name: "seven_day", days: 7, amount: "$25", percentage: null, recurring: false },
              { name: "thirty_day", days: 30, amount: "$25", percentage: null, recurring: false },
              { name: "ninety_day", days: 90, amount: "$25", percentage: "5%", recurring: false },
              { name: "one_eighty_day", days: 180, amount: "$25", percentage: "6.25%", recurring: false },
              { name: "recurring", days: 30, amount: "$28.75", percentage: null, recurring: true }
            ]
          },
          {
            id: "2",
            type: "iso",
            name: "Gold Partner ISO",
            milestones: [
              { name: "activation", days: 1, amount: "$50", percentage: null, recurring: false },
              { name: "processing", days: 30, amount: "$0", percentage: "10%", recurring: true },
              { name: "bonus_tier", days: 90, amount: "$100", percentage: "12%", recurring: true }
            ]
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching documentation data:", error);
        setLoading(false);
        toast({
          title: "Error loading documentation",
          description: "Failed to load project documentation data. Please try again later.",
          variant: "destructive"
        });
      }
    };
    
    fetchDocumentationData();
  }, [toast]);
  
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[180px] w-full" />
      </div>
    </div>
  );

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Documentation Center</h1>
            <p className="text-muted-foreground">
              Comprehensive documentation of PaySurity's business requirements, functional specifications, and technical architecture
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportToExcel} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
        
        {loading ? (
          renderLoadingSkeleton()
        ) : (
          <Tabs defaultValue="brd" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-5 md:w-fit">
              <TabsTrigger value="brd" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Business Requirements</span>
                <span className="inline md:hidden">BRD</span>
              </TabsTrigger>
              <TabsTrigger value="frd" className="flex items-center gap-1">
                <ScrollText className="h-4 w-4" />
                <span className="hidden md:inline">Functional Requirements</span>
                <span className="inline md:hidden">FRD</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span className="hidden md:inline">Technical Documentation</span>
                <span className="inline md:hidden">Tech</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <ListChecks className="h-4 w-4" />
                <span className="hidden md:inline">Pending Tasks</span>
                <span className="inline md:hidden">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="version" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Version History</span>
                <span className="inline md:hidden">History</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              {/* Business Requirements Document Tab */}
              <TabsContent value="brd" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" /> 
                      Business Requirements Document
                    </CardTitle>
                    <CardDescription>
                      Core business requirements, competitive analysis, and unique selling propositions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Executive Summary</h3>
                      <p>
                        PaySurity is a comprehensive digital payment ecosystem targeting merchant acquisition as 
                        its core priority. The platform delivers significant value through its digital wallet system,
                        merchant onboarding, industry-specific POS solutions, and value-added services.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Core Business Components</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Digital wallet system with card-present transactions, online payments, and ACH services</li>
                        <li>Merchant acquisition and onboarding with streamlined verification</li>
                        <li>Industry-specific POS solutions (BistroBeast, ECom Ready, LegalEdge, MedPay, HotelPay)</li>
                        <li>Independent Sales Organization (ISO) partnership with Helcim.com for backend infrastructure</li>
                        <li>Affiliate and ISO partner programs with milestone-based commission structures</li>
                      </ul>
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>This document requires regular updates</AlertTitle>
                      <AlertDescription>
                        As business requirements evolve, this document should be updated to maintain alignment
                        between stakeholders, development team, and product management.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Competitive Analysis</h3>
                      <p>
                        PaySurity differentiates itself through vertical integration, custom POS solutions, 
                        and a hybrid approach to merchant websites (microsite or integration options).
                      </p>
                      
                      <Table>
                        <TableCaption>Competitive Landscape Analysis</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Competitor</TableHead>
                            <TableHead>Strengths</TableHead>
                            <TableHead>Weaknesses</TableHead>
                            <TableHead>PaySurity Advantage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Square</TableCell>
                            <TableCell>Simplified hardware, brand recognition</TableCell>
                            <TableCell>Limited customization, higher fees for specialized industries</TableCell>
                            <TableCell>Industry-specific solutions, competitive pricing</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Stripe</TableCell>
                            <TableCell>Developer-friendly, extensive API</TableCell>
                            <TableCell>Limited in-person solutions, high technical barrier</TableCell>
                            <TableCell>Simplified merchant experience, specialized POS</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">PayPal</TableCell>
                            <TableCell>Consumer trust, marketplace presence</TableCell>
                            <TableCell>Less focus on merchant services, limited POS options</TableCell>
                            <TableCell>Full-featured merchant solutions, vertical integration</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">View Full Document</Button>
                    <Button variant="outline">Edit</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Unique Selling Propositions</CardTitle>
                    <CardDescription>Key differentiators that set PaySurity apart from competitors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <div className="bg-muted rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Industry-Specific Solutions</h3>
                        <p className="text-sm">Custom POS systems tailored for restaurants, retail, legal, healthcare, and hospitality</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Flexible Microsite Architecture</h3>
                        <p className="text-sm">Merchants can use PaySurity-hosted microsites or integrate with existing websites</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Comprehensive Partner Programs</h3>
                        <p className="text-sm">Structured incentives for both online affiliates and in-person ISO partners</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Automated Testing Framework</h3>
                        <p className="text-sm">95% of testing tasks automated with daily executive reporting</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Advanced Risk Assessment</h3>
                        <p className="text-sm">5-category scoring methodology with industry-specific adjustments</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Hybrid Pricing Model</h3>
                        <p className="text-sm">Interchange-plus pricing with volume-based discounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Functional Requirements Document Tab */}
              <TabsContent value="frd" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ScrollText className="h-5 w-5" /> 
                      Functional Requirements Document
                    </CardTitle>
                    <CardDescription>
                      Detailed functional specifications and user journeys
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Key User Flows</h3>
                      <p>
                        This section documents the primary user journeys across the PaySurity platform, with 
                        annotated screenshots highlighting key interaction points.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold">Merchant Onboarding Flow</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          The process for a new merchant to sign up, verify their identity, and begin accepting payments
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge>Step 1</Badge>
                            <span>Initial registration with business details</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 2</Badge>
                            <span>Document upload and identity verification</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 3</Badge>
                            <span>Banking information and account linking</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 4</Badge>
                            <span>POS system selection and customization</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 5</Badge>
                            <span>Microsite setup or integration configuration</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold">Affiliate Registration and Dashboard</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          The process for affiliates to register, obtain marketing materials, and track commissions
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge>Step 1</Badge>
                            <span>Affiliate program application</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 2</Badge>
                            <span>Verification and approval</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 3</Badge>
                            <span>Marketing materials access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 4</Badge>
                            <span>Referral tracking and commission management</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Step 5</Badge>
                            <span>Payout processing and history</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Integration Requirements</h3>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <div className="border p-4 rounded-lg">
                          <h4 className="font-medium">Payment Gateway Integration</h4>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• Support for major card processors</li>
                            <li>• ACH payment processing</li>
                            <li>• Tokenization for recurring billing</li>
                          </ul>
                        </div>
                        <div className="border p-4 rounded-lg">
                          <h4 className="font-medium">Microsite Architecture</h4>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• Subdomain management</li>
                            <li>• Customizable templates</li>
                            <li>• White-label capabilities</li>
                          </ul>
                        </div>
                        <div className="border p-4 rounded-lg">
                          <h4 className="font-medium">Merchant Website Integration</h4>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• JavaScript SDK</li>
                            <li>• Direct API access</li>
                            <li>• Webhook support</li>
                          </ul>
                        </div>
                        <div className="border p-4 rounded-lg">
                          <h4 className="font-medium">Identity Verification</h4>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• KYC/AML compliance</li>
                            <li>• Document verification</li>
                            <li>• Background checks</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">View Full Document</Button>
                    <Button variant="outline">Edit</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Technical Documentation Tab */}
              <TabsContent value="technical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" /> 
                      Technical Documentation
                    </CardTitle>
                    <CardDescription>
                      Architecture, code examples, and integration details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Technology Stack</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        <Badge variant="outline" className="justify-center py-1">React.js</Badge>
                        <Badge variant="outline" className="justify-center py-1">TypeScript</Badge>
                        <Badge variant="outline" className="justify-center py-1">Express.js</Badge>
                        <Badge variant="outline" className="justify-center py-1">PostgreSQL</Badge>
                        <Badge variant="outline" className="justify-center py-1">Drizzle ORM</Badge>
                        <Badge variant="outline" className="justify-center py-1">WebSockets</Badge>
                        <Badge variant="outline" className="justify-center py-1">TailwindCSS</Badge>
                        <Badge variant="outline" className="justify-center py-1">shadcn/ui</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Commission Structure Implementation</h3>
                      
                      <Table>
                        <TableCaption>Affiliate Commission Structure</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Milestone</TableHead>
                            <TableHead>Timeline</TableHead>
                            <TableHead>Fixed Amount</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Recurring</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {commissionStructures
                            .find(cs => cs.type === 'affiliate')?.milestones
                            .map((milestone, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {milestone.name.replaceAll('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}
                                </TableCell>
                                <TableCell>{milestone.days} days</TableCell>
                                <TableCell>{milestone.amount}</TableCell>
                                <TableCell>{milestone.percentage || '-'}</TableCell>
                                <TableCell>{milestone.recurring ? 'Yes' : 'No'}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      
                      <Table>
                        <TableCaption>ISO Partner Commission Structure</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Milestone</TableHead>
                            <TableHead>Timeline</TableHead>
                            <TableHead>Fixed Amount</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Recurring</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {commissionStructures
                            .find(cs => cs.type === 'iso')?.milestones
                            .map((milestone, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {milestone.name.replaceAll('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}
                                </TableCell>
                                <TableCell>{milestone.days} days</TableCell>
                                <TableCell>{milestone.amount}</TableCell>
                                <TableCell>{milestone.percentage || '-'}</TableCell>
                                <TableCell>{milestone.recurring ? 'Yes' : 'No'}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Report Definitions</h3>
                      <div className="space-y-4">
                        {reports.map(report => (
                          <div key={report.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{report.name}</h4>
                              <Badge>{report.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground my-2">{report.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Source Tables:</span> {report.sourceTable}
                              </div>
                              <div>
                                <span className="font-medium">Target Table:</span> {report.targetTable}
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-medium">Metadata:</span> {report.metadata}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Integration APIs</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 font-mono text-sm">
                          # Example API Endpoints
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">POST /api/merchants</div>
                            <div className="col-span-2">Create a new merchant account</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">GET /api/merchants/:id</div>
                            <div className="col-span-2">Retrieve merchant details</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">POST /api/payments</div>
                            <div className="col-span-2">Process a payment transaction</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">GET /api/affiliate/commissions</div>
                            <div className="col-span-2">Retrieve affiliate commission data</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">POST /api/webhooks/payment-notification</div>
                            <div className="col-span-2">Receive payment notifications</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">View Full Document</Button>
                    <div className="flex gap-2">
                      <Button variant="outline">Export API Docs</Button>
                      <Button variant="outline">Edit</Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Pending Tasks Tab */}
              <TabsContent value="pending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" /> 
                      Pending Tasks
                    </CardTitle>
                    <CardDescription>
                      Tasks awaiting completion or decision
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Tasks Awaiting Work</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Assigned To</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingTasks
                              .filter(task => task.status === 'pending' || task.status === 'in-progress')
                              .map(task => (
                                <TableRow key={task.id}>
                                  <TableCell className="font-medium">{task.title}</TableCell>
                                  <TableCell>{task.description}</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      task.priority === 'high' ? 'destructive' : 
                                      task.priority === 'medium' ? 'default' : 
                                      'outline'
                                    }>
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{task.assignedTo}</TableCell>
                                  <TableCell>
                                    <Badge variant={task.status === 'in-progress' ? 'secondary' : 'outline'}>
                                      {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Tasks Requiring Decisions</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Assigned To</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingTasks
                              .filter(task => task.status === 'needs-decision')
                              .map(task => (
                                <TableRow key={task.id}>
                                  <TableCell className="font-medium">{task.title}</TableCell>
                                  <TableCell>{task.description}</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      task.priority === 'high' ? 'destructive' : 
                                      task.priority === 'medium' ? 'default' : 
                                      'outline'
                                    }>
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{task.assignedTo}</TableCell>
                                  <TableCell>{task.reason}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">View All Tasks</Button>
                    <div className="flex gap-2">
                      <Button>Add New Task</Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Version History Tab */}
              <TabsContent value="version" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" /> 
                      Version History
                    </CardTitle>
                    <CardDescription>
                      Document revision history and change tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Version</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Updated By</TableHead>
                            <TableHead>Changes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documentVersions.map(version => (
                            <TableRow key={version.id}>
                              <TableCell className="font-medium">{version.version}</TableCell>
                              <TableCell>{new Date(version.updatedAt).toLocaleDateString()}</TableCell>
                              <TableCell>{version.updatedBy}</TableCell>
                              <TableCell>{version.changeDescription}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ProjectDocumentation;