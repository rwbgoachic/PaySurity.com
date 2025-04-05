import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { Redirect, Link } from 'wouter';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  BarChart2, 
  PieChart as PieChartIcon, 
  ListFilter, 
  Download, 
  RefreshCw 
} from 'lucide-react';

// Analytics dashboard page
export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('7days');

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  // Get start and end dates based on selected range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '24hours':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return { startDate, endDate };
  };

  // Query for page metrics
  const { data: pageMetrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/analytics/metrics/by-page'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/metrics/by-page');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for click events
  const { startDate, endDate } = getDateRange();
  const { 
    data: clickEvents, 
    isLoading: isLoadingEvents, 
    refetch: refetchEvents 
  } = useQuery({
    queryKey: ['/api/analytics/events', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const res = await fetch(
        `/api/analytics/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get element type distribution for pie chart
  const getElementTypeDistribution = () => {
    if (!clickEvents || clickEvents.length === 0) return [];
    
    const typeCounts: Record<string, number> = {};
    clickEvents.forEach((event: any) => {
      typeCounts[event.elementType] = (typeCounts[event.elementType] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchMetrics();
    refetchEvents();
    toast({
      title: "Refreshed data",
      description: "The analytics data has been refreshed",
    });
  };

  // Export data as CSV
  const exportToCsv = () => {
    if (!clickEvents || clickEvents.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export",
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV content
    const headers = ["timestamp", "elementType", "elementId", "elementText", "pagePath", "sessionId"];
    const csvRows = [headers.join(",")];
    
    clickEvents.forEach((event: any) => {
      const row = headers.map(header => {
        let value = event[header];
        
        // Format timestamp
        if (header === 'timestamp') {
          value = new Date(value).toISOString();
        }
        
        // Handle strings with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        
        return value || '';
      });
      
      csvRows.push(row.join(","));
    });
    
    // Create and download the file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Analytics data has been exported to CSV",
    });
  };

  // Random colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor user interactions and engagement across the platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={exportToCsv} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Events</CardTitle>
            <CardDescription>Total click events tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingEvents ? '...' : clickEvents?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Unique Pages</CardTitle>
            <CardDescription>Distinct pages with events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingMetrics ? '...' : pageMetrics?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Unique Sessions</CardTitle>
            <CardDescription>Distinct user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingEvents ? '...' : new Set(clickEvents?.map((e: any) => e.sessionId)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pageViews">
        <TabsList>
          <TabsTrigger value="pageViews">
            <BarChart2 className="h-4 w-4 mr-2" />
            Page Views
          </TabsTrigger>
          <TabsTrigger value="elementTypes">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Interaction Types
          </TabsTrigger>
          <TabsTrigger value="rawData">
            <ListFilter className="h-4 w-4 mr-2" />
            Raw Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pageViews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Page View Distribution</CardTitle>
              <CardDescription>
                Number of interactions per page
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : pageMetrics && pageMetrics.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pageMetrics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="pagePath" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Click Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No page view data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="elementTypes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Element Type Distribution</CardTitle>
              <CardDescription>
                Types of elements users interact with
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : clickEvents && clickEvents.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getElementTypeDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getElementTypeDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} clicks`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No element type data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rawData" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Raw Click Event Data</CardTitle>
              <CardDescription>
                Detailed view of all recorded click events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : clickEvents && clickEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>
                      Click events from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Element Type</TableHead>
                        <TableHead>Element Text</TableHead>
                        <TableHead>Session ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clickEvents.slice(0, 100).map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            {formatDistance(new Date(event.timestamp), new Date(), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {event.pagePath}
                          </TableCell>
                          <TableCell>{event.elementType}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {event.elementText || '-'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {event.sessionId?.substring(0, 8)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {clickEvents.length > 100 && (
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      Showing 100 of {clickEvents.length} events. Export to CSV to access all data.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No click event data available for the selected date range
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}