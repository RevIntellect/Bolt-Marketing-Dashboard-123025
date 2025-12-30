import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Globe, Users, Clock, FileText, MousePointer, Eye, ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WebsiteTrafficDashboardProps {
  onBack: () => void;
}

const trafficData = [
  { month: "Jan", sessions: 45000, users: 32000, pageviews: 125000 },
  { month: "Feb", sessions: 52000, users: 38000, pageviews: 145000 },
  { month: "Mar", sessions: 58000, users: 42000, pageviews: 168000 },
  { month: "Apr", sessions: 55000, users: 40000, pageviews: 155000 },
  { month: "May", sessions: 62000, users: 45000, pageviews: 180000 },
  { month: "Jun", sessions: 68000, users: 50000, pageviews: 195000 },
];

const deviceData = [
  { month: "Jan", desktop: 55, mobile: 35, tablet: 10 },
  { month: "Feb", desktop: 52, mobile: 38, tablet: 10 },
  { month: "Mar", desktop: 50, mobile: 40, tablet: 10 },
  { month: "Apr", desktop: 48, mobile: 42, tablet: 10 },
  { month: "May", desktop: 46, mobile: 44, tablet: 10 },
  { month: "Jun", desktop: 45, mobile: 45, tablet: 10 },
];

export function WebsiteTrafficDashboard({ onBack }: WebsiteTrafficDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Website Traffic</h1>
            <p className="text-muted-foreground mt-1">Google Analytics data overview</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Sessions" value="340K" change="+18.2%" icon={Globe} />
        <KPICard title="Unique Users" value="247K" change="+15.8%" icon={Users} />
        <KPICard title="Avg. Session Duration" value="4:32" change="+0:24" icon={Clock} />
        <KPICard title="Pages per Session" value="3.8" change="+0.4" icon={FileText} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Bounce Rate" value="42.5%" change="-3.2%" icon={MousePointer} />
        <KPICard title="New Users" value="68.4%" change="+2.1%" icon={Users} />
        <KPICard title="Pageviews" value="968K" change="+22.5%" icon={Eye} />
        <KPICard title="Exit Rate" value="38.2%" change="-1.8%" icon={Globe} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Traffic Trends">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="sessions" stackId="1" stroke="hsl(155, 70%, 45%)" fill="hsl(155, 70%, 45%)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="users" stackId="2" stroke="hsl(220, 70%, 55%)" fill="hsl(220, 70%, 55%)" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Device Distribution (%)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deviceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="desktop" stroke="hsl(220, 70%, 55%)" strokeWidth={2} />
              <Line type="monotone" dataKey="mobile" stroke="hsl(155, 70%, 45%)" strokeWidth={2} />
              <Line type="monotone" dataKey="tablet" stroke="hsl(38, 90%, 55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
