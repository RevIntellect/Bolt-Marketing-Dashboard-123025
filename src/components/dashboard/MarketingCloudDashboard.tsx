import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, FileText, Mail, ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MarketingCloudDashboardProps {
  onBack?: () => void;
}

const emailTrendsData = [
  { month: "Jan", ctor: 22, ctr: 6.5, openRate: 28, uniqueClicks: 820 },
  { month: "Feb", ctor: 23, ctr: 6.8, openRate: 29, uniqueClicks: 860 },
  { month: "Mar", ctor: 23.5, ctr: 7.0, openRate: 29.5, uniqueClicks: 900 },
  { month: "Apr", ctor: 24, ctr: 7.2, openRate: 30, uniqueClicks: 940 },
  { month: "May", ctor: 24, ctr: 7.1, openRate: 30, uniqueClicks: 960 },
  { month: "Jun", ctor: 24, ctr: 7.2, openRate: 30, uniqueClicks: 985 },
];

const ga4AttributionData = [
  { month: "Jan", conversions: 95, revenue: 4200, sessions: 2800 },
  { month: "Feb", conversions: 105, revenue: 4800, sessions: 3000 },
  { month: "Mar", conversions: 115, revenue: 5400, sessions: 3100 },
  { month: "Apr", conversions: 120, revenue: 5800, sessions: 3200 },
  { month: "May", conversions: 128, revenue: 6200, sessions: 3280 },
  { month: "Jun", conversions: 134, revenue: 6700, sessions: 3350 },
];

export function MarketingCloudDashboard({ onBack }: MarketingCloudDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Marketing Cloud Dashboard</h1>
            <p className="text-muted-foreground mt-1">Salesforce Marketing Cloud metrics</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Universal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Sessions / Visits" value="3,350" change="+8.1%" icon={Eye} />
        <KPICard title="Users" value="2,840" change="+7.5%" icon={Users} />
        <KPICard title="New Users %" value="65.2%" change="+1.8%" icon={Percent} />
        <KPICard title="Conversion Rate" value="4.0%" change="+0.3%" icon={MousePointer} />
        <KPICard title="Total Conversions" value="134" change="+8.1%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value="$6,700" change="+8.1%" icon={DollarSign} />
        <KPICard title="Cost per Conversion" value="$18.50" change="-$1.20" isPositive />
        <KPICard title="ROI" value="270%" change="+15%" icon={TrendingUp} />
        <KPICard title="Bounce Rate" value="38.5%" change="-2.1%" isPositive icon={Percent} />
        <KPICard title="Avg Session Duration" value="2:45" change="+0:12" icon={Clock} />
      </div>

      {/* Core Email Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Open Rate" value="30.0%" change="+2.0%" icon={Mail} />
        <KPICard title="Click-Through Rate" value="7.2%" change="+0.4%" icon={MousePointer} />
        <KPICard title="Unique Clicks" value="985" change="+65" icon={TrendingUp} />
        <KPICard title="Click to Open" value="24.0%" change="+0.9%" icon={Percent} />
      </div>

      {/* Email Delivery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Bounce Rate (Delivery)" value="1.2%" change="-0.3%" isPositive />
        <KPICard title="Unsubscribe Rate" value="0.18%" change="-0.02%" isPositive />
        <KPICard title="Total Emails Sent" value="13,680" change="+840" icon={Mail} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Email Performance Trends">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={emailTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="openRate" name="Open Rate (%)" stroke="hsl(155, 70%, 45%)" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="ctr" name="CTR (%)" stroke="hsl(220, 70%, 55%)" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="ctor" name="CTOR (%)" stroke="hsl(280, 65%, 55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="GA4 Email Attribution (via UTM)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ga4AttributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="conversions" name="Conversions" fill="hsl(155, 70%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
