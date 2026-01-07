import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData } from "@/hooks/useMarketingData";
import { Globe, Users, Clock, FileText, MousePointer, Eye, ArrowLeft, Loader2 } from "lucide-react";
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

// Fallback mock data when no live data available
const mockTrafficData = [
  { month: "Jan", sessions: 45000, users: 32000, pageviews: 125000 },
  { month: "Feb", sessions: 52000, users: 38000, pageviews: 145000 },
  { month: "Mar", sessions: 58000, users: 42000, pageviews: 168000 },
  { month: "Apr", sessions: 55000, users: 40000, pageviews: 155000 },
  { month: "May", sessions: 62000, users: 45000, pageviews: 180000 },
  { month: "Jun", sessions: 68000, users: 50000, pageviews: 195000 },
];

const mockDeviceData = [
  { month: "Jan", desktop: 55, mobile: 35, tablet: 10 },
  { month: "Feb", desktop: 52, mobile: 38, tablet: 10 },
  { month: "Mar", desktop: 50, mobile: 40, tablet: 10 },
  { month: "Apr", desktop: 48, mobile: 42, tablet: 10 },
  { month: "May", desktop: 46, mobile: 44, tablet: 10 },
  { month: "Jun", desktop: 45, mobile: 45, tablet: 10 },
];

export function WebsiteTrafficDashboard({ onBack }: WebsiteTrafficDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: trafficTrendData, loading: trafficLoading } = useMarketingData({
    source: "website_traffic",
    metricType: "traffic_trend",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: deviceTrendData, loading: deviceLoading } = useMarketingData({
    source: "website_traffic",
    metricType: "device_distribution",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "website_traffic",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = trafficLoading || deviceLoading || kpiLoading;
  const hasLiveData = trafficTrendData.length > 0 || deviceTrendData.length > 0 || kpiData.length > 0;

  // Compute KPIs from live data or use defaults
  const kpis = useMemo(() => {
    if (kpiData.length > 0) {
      const latest = kpiData[0].data;
      return {
        totalSessions: latest.total_sessions || latest.sessions || 0,
        uniqueUsers: latest.unique_users || latest.users || 0,
        avgSessionDuration: latest.avg_session_duration || "0:00",
        pagesPerSession: latest.pages_per_session || 0,
        bounceRate: latest.bounce_rate || 0,
        newUsers: latest.new_users_percent || 0,
        pageviews: latest.pageviews || latest.page_views || 0,
        exitRate: latest.exit_rate || 0,
        // Changes
        totalSessionsChange: latest.total_sessions_change || "+0%",
        uniqueUsersChange: latest.unique_users_change || "+0%",
        avgSessionDurationChange: latest.avg_session_duration_change || "+0:00",
        pagesPerSessionChange: latest.pages_per_session_change || "+0",
        bounceRateChange: latest.bounce_rate_change || "+0%",
        newUsersChange: latest.new_users_change || "+0%",
        pageviewsChange: latest.pageviews_change || "+0%",
        exitRateChange: latest.exit_rate_change || "+0%",
      };
    }
    // Default mock values
    return {
      totalSessions: 340000,
      uniqueUsers: 247000,
      avgSessionDuration: "4:32",
      pagesPerSession: 3.8,
      bounceRate: 42.5,
      newUsers: 68.4,
      pageviews: 968000,
      exitRate: 38.2,
      totalSessionsChange: "+18.2%",
      uniqueUsersChange: "+15.8%",
      avgSessionDurationChange: "+0:24",
      pagesPerSessionChange: "+0.4",
      bounceRateChange: "-3.2%",
      newUsersChange: "+2.1%",
      pageviewsChange: "+22.5%",
      exitRateChange: "-1.8%",
    };
  }, [kpiData]);

  // Transform traffic data
  const trafficData = useMemo(() => {
    if (trafficTrendData.length > 0) {
      return trafficTrendData.slice(0, 12).map((record) => ({
        month: record.data.month || "Unknown",
        sessions: record.data.sessions || 0,
        users: record.data.users || 0,
        pageviews: record.data.pageviews || record.data.page_views || 0,
      }));
    }
    return mockTrafficData;
  }, [trafficTrendData]);

  // Transform device data
  const deviceData = useMemo(() => {
    if (deviceTrendData.length > 0) {
      return deviceTrendData.slice(0, 12).map((record) => ({
        month: record.data.month || "Unknown",
        desktop: record.data.desktop || 0,
        mobile: record.data.mobile || 0,
        tablet: record.data.tablet || 0,
      }));
    }
    return mockDeviceData;
  }, [deviceTrendData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

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
            <p className="text-muted-foreground mt-1">
              Google Analytics data overview
              {!hasLiveData && !loading && (
                <span className="ml-2 text-xs text-amber-500">(showing sample data)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Sessions" value={formatNumber(kpis.totalSessions)} change={kpis.totalSessionsChange} icon={Globe} />
        <KPICard title="Unique Users" value={formatNumber(kpis.uniqueUsers)} change={kpis.uniqueUsersChange} icon={Users} />
        <KPICard title="Avg. Session Duration" value={kpis.avgSessionDuration} change={kpis.avgSessionDurationChange} icon={Clock} />
        <KPICard title="Pages per Session" value={kpis.pagesPerSession.toFixed(1)} change={kpis.pagesPerSessionChange} icon={FileText} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Bounce Rate" value={`${kpis.bounceRate}%`} change={kpis.bounceRateChange} isPositive={kpis.bounceRateChange.startsWith("-")} icon={MousePointer} />
        <KPICard title="New Users" value={`${kpis.newUsers}%`} change={kpis.newUsersChange} icon={Users} />
        <KPICard title="Pageviews" value={formatNumber(kpis.pageviews)} change={kpis.pageviewsChange} icon={Eye} />
        <KPICard title="Exit Rate" value={`${kpis.exitRate}%`} change={kpis.exitRateChange} isPositive={kpis.exitRateChange.startsWith("-")} icon={Globe} />
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
