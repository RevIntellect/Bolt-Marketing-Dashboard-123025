import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData } from "@/hooks/useMarketingData";
import { TrendingUp, Users, Target, Percent, ArrowLeft, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AcquisitionDashboardProps {
  onBack: () => void;
}

// Fallback mock data when no live data available
const mockChannelData = [
  { channel: "Organic Search", users: 85000, sessions: 125000 },
  { channel: "Paid Search", users: 42000, sessions: 68000 },
  { channel: "Social", users: 28000, sessions: 45000 },
  { channel: "Email", users: 35000, sessions: 52000 },
  { channel: "Direct", users: 22000, sessions: 35000 },
  { channel: "Referral", users: 15000, sessions: 25000 },
];

const mockSourceData = [
  { name: "Google", value: 45, color: "hsl(155, 70%, 45%)" },
  { name: "LinkedIn", value: 20, color: "hsl(220, 70%, 55%)" },
  { name: "Email", value: 18, color: "hsl(38, 90%, 55%)" },
  { name: "Direct", value: 12, color: "hsl(280, 65%, 55%)" },
  { name: "Other", value: 5, color: "hsl(0, 72%, 55%)" },
];

export function AcquisitionDashboard({ onBack }: AcquisitionDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: channelMetrics, loading: channelLoading } = useMarketingData({
    source: "acquisition",
    metricType: "channel_performance",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: sourceMetrics, loading: sourceLoading } = useMarketingData({
    source: "acquisition",
    metricType: "source_distribution",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "acquisition",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = channelLoading || sourceLoading || kpiLoading;
  const hasLiveData = channelMetrics.length > 0 || sourceMetrics.length > 0 || kpiData.length > 0;

  // Compute KPIs from live data or use defaults
  const kpis = useMemo(() => {
    if (kpiData.length > 0) {
      const latest = kpiData[0].data;
      return {
        totalAcquisitions: latest.total_acquisitions || 0,
        newUsers: latest.new_users || 0,
        conversionRate: latest.conversion_rate || 0,
        goalCompletions: latest.goal_completions || 0,
        // Changes
        totalAcquisitionsChange: latest.total_acquisitions_change || "+0%",
        newUsersChange: latest.new_users_change || "+0%",
        conversionRateChange: latest.conversion_rate_change || "+0%",
        goalCompletionsChange: latest.goal_completions_change || "+0%",
      };
    }
    // Default mock values
    return {
      totalAcquisitions: 227000,
      newUsers: 168000,
      conversionRate: 4.2,
      goalCompletions: 9500,
      totalAcquisitionsChange: "+14.2%",
      newUsersChange: "+16.8%",
      conversionRateChange: "+0.6%",
      goalCompletionsChange: "+21.3%",
    };
  }, [kpiData]);

  // Transform channel data
  const channelData = useMemo(() => {
    if (channelMetrics.length > 0) {
      return channelMetrics.slice(0, 10).map((record) => ({
        channel: record.data.channel || "Unknown",
        users: record.data.users || 0,
        sessions: record.data.sessions || 0,
      }));
    }
    return mockChannelData;
  }, [channelMetrics]);

  // Transform source data
  const sourceData = useMemo(() => {
    if (sourceMetrics.length > 0) {
      const colors = [
        "hsl(155, 70%, 45%)",
        "hsl(220, 70%, 55%)",
        "hsl(38, 90%, 55%)",
        "hsl(280, 65%, 55%)",
        "hsl(0, 72%, 55%)",
      ];
      return sourceMetrics.slice(0, 5).map((record, index) => ({
        name: record.data.source || record.data.name || "Unknown",
        value: record.data.percentage || record.data.value || 0,
        color: colors[index % colors.length],
      }));
    }
    return mockSourceData;
  }, [sourceMetrics]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
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
            <h1 className="text-2xl font-bold text-foreground">Acquisition Overview</h1>
            <p className="text-muted-foreground mt-1">
              How users find and reach your site
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
        <KPICard title="Total Acquisitions" value={formatNumber(kpis.totalAcquisitions)} change={kpis.totalAcquisitionsChange} icon={TrendingUp} />
        <KPICard title="New Users" value={formatNumber(kpis.newUsers)} change={kpis.newUsersChange} icon={Users} />
        <KPICard title="Conversion Rate" value={`${kpis.conversionRate}%`} change={kpis.conversionRateChange} icon={Target} />
        <KPICard title="Goal Completions" value={formatNumber(kpis.goalCompletions)} change={kpis.goalCompletionsChange} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Users & Sessions by Channel">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="channel" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="users" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="sessions" fill="hsl(220, 70%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Traffic Source Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
