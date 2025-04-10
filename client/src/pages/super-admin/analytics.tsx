import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, BarChart3, ArrowDownRight, ArrowUpRight, DollarSign, Users } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from '@nivo/pie';

// Helper function to format currency
const formatCurrency = (amount: string | number) => {
  if (!amount) return "$0.00";
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

export default function SuperAdminAnalytics() {
  // Sample data for demonstration
  const merchantsByIndustry = [
    { industry: "Restaurant", count: 145 },
    { industry: "Retail", count: 98 },
    { industry: "Healthcare", count: 76 },
    { industry: "Legal", count: 45 },
    { industry: "Education", count: 38 },
    { industry: "Service", count: 87 },
    { industry: "Other", count: 24 },
  ];

  // Sample transaction data
  const transactionData = [
    {
      id: "transactions",
      data: [
        { x: "Jan", y: 45800 },
        { x: "Feb", y: 52300 },
        { x: "Mar", y: 48900 },
        { x: "Apr", y: 62100 },
        { x: "May", y: 68400 },
        { x: "Jun", y: 72800 },
        { x: "Jul", y: 85200 },
        { x: "Aug", y: 91600 },
        { x: "Sep", y: 89700 },
        { x: "Oct", y: 95200 },
        { x: "Nov", y: 102400 },
        { x: "Dec", y: 116800 },
      ],
    },
  ];

  // Payment method distribution data
  const paymentMethodData = [
    { id: "Credit Card", value: 68 },
    { id: "Debit Card", value: 18 },
    { id: "ACH/Bank Transfer", value: 9 },
    { id: "Digital Wallet", value: 5 },
  ];

  // Stats cards data
  const statsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(14592000),
      icon: <DollarSign className="h-4 w-4" />,
      change: "+12.3%",
      trend: "up",
    },
    {
      title: "Active Merchants",
      value: "512",
      icon: <Users className="h-4 w-4" />,
      change: "+8.7%",
      trend: "up",
    },
    {
      title: "Transaction Volume",
      value: "1.2M",
      icon: <BarChart3 className="h-4 w-4" />,
      change: "+15.4%",
      trend: "up",
    },
    {
      title: "Avg. Processing Fee",
      value: "2.4%",
      icon: <DollarSign className="h-4 w-4" />,
      change: "-0.3%",
      trend: "down",
    },
  ];

  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="flex flex-col space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-5">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-1.5 ${
                  stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center pt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-emerald-700" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3.5 w-3.5 text-rose-700" />
                  )}
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {stat.change} from previous period
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Trends */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Transaction Trends</CardTitle>
              <CardDescription>
                Monthly transaction volume over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveLine
                  data={transactionData}
                  margin={{ top: 20, right: 20, bottom: 50, left: 70 }}
                  xScale={{ type: 'point' }}
                  yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                  }}
                  curve="monotoneX"
                  axisTop={null}
                  axisRight={null}
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
                    legend: 'Volume ($)',
                    legendOffset: -60,
                    legendPosition: 'middle',
                    format: (value) => `$${value / 1000}k`
                  }}
                  colors={{ scheme: 'category10' }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  enableGridX={false}
                  enableArea={true}
                  areaOpacity={0.15}
                  useMesh={true}
                  enableSlices="x"
                />
              </div>
            </CardContent>
          </Card>

          {/* Merchant Distribution */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Merchants by Industry</CardTitle>
              <CardDescription>
                Distribution of merchants across different industries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveBar
                  data={merchantsByIndustry.map(item => ({
                    industry: item.industry,
                    count: item.count
                  }))}
                  keys={['count']}
                  indexBy="industry"
                  margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'nivo' }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Industry',
                    legendPosition: 'middle',
                    legendOffset: 40
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Merchant Count',
                    legendPosition: 'middle',
                    legendOffset: -50
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Distribution of payment methods used by customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsivePie
                  data={paymentMethodData}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'category10' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                    }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}