import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData } from "@/hooks/useMarketingData";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Heart, Share2, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LinkedInDashboardProps {
  onBack?: () => void;
}

// Fallback mock data when no live data available
const mockWeeklyEngagementData = [
  { day: "Mon", engagement: 8500 },
  { day: "Tue", engagement: 9200 },
  { day: "Wed", engagement: 10800 },
  { day: "Thu", engagement: 9500 },
  { day: "Fri", engagement: 7200 },
];

const mockPostTypeData = [
  { type: "Video", engagement: 920 },
  { type: "Carousel", engagement: 680 },
  { type: "Image", engagement: 450 },
  { type: "Article", engagement: 225 },
];

export function LinkedInDashboard({ onBack }: LinkedInDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: engagementData, loading: engagementLoading } = useMarketingData({
    source: "linkedin_organic",
    metricType: "weekly_engagement",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: postData, loading: postLoading } = useMarketingData({
    source: "linkedin_organic",
    metricType: "post_performance",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "linkedin_organic",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = engagementLoading || postLoading || kpiLoading;
  const hasLiveData = engagementData.length > 0 || postData.length > 0 || kpiData.length > 0;

  // Compute KPIs from live data or use defaults
  const kpis = useMemo(() => {
    if (kpiData.length > 0) {
      const latest = kpiData[0].data;
      return {
        sessions: latest.sessions || 0,
        users: latest.users || 0,
        newUsersPercent: latest.new_users_percent || 0,
        conversionRate: latest.conversion_rate || 0,
        totalConversions: latest.conversions || 0,
        revenue: latest.revenue || 0,
        engagementRate: latest.engagement_rate || 0,
        avgSessionDuration: latest.avg_session_duration || "0:00",
        impressions: latest.impressions || 0,
        engagement: latest.engagement || 0,
        followers: latest.followers || 0,
        shares: latest.shares || 0,
        // Changes
        sessionsChange: latest.sessions_change || "+0%",
        usersChange: latest.users_change || "+0%",
        newUsersPercentChange: latest.new_users_percent_change || "+0%",
        conversionRateChange: latest.conversion_rate_change || "+0%",
        totalConversionsChange: latest.conversions_change || "+0%",
        revenueChange: latest.revenue_change || "+0%",
        engagementRateChange: latest.engagement_rate_change || "+0%",
        avgSessionDurationChange: latest.avg_session_duration_change || "+0:00",
        impressionsChange: latest.impressions_change || "+0%",
        engagementChange: latest.engagement_change || "+0%",
        followersChange: latest.followers_change || "+0",
        sharesChange: latest.shares_change || "+0",
      };
    }
    // Default mock values
    return {
      sessions: 2840,
      users: 2450,
      newUsersPercent: 72.5,
      conversionRate: 2.8,
      totalConversions: 80,
      revenue: 4000,
      engagementRate: 4.6,
      avgSessionDuration: "1:52",
      impressions: 49100,
      engagement: 2275,
      followers: 12800,
      shares: 342,
      sessionsChange: "+12.3%",
      usersChange: "+11.8%",
      newUsersPercentChange: "+2.3%",
      conversionRateChange: "+0.3%",
      totalConversionsChange: "+14.3%",
      revenueChange: "+14.3%",
      engagementRateChange: "+0.8%",
      avgSessionDurationChange: "+0:08",
      impressionsChange: "+18.3%",
      engagementChange: "+24.1%",
      followersChange: "+156",
      sharesChange: "+12",
    };
  }, [kpiData]);

  // Transform weekly engagement data
  const weeklyEngagementData = useMemo(() => {
    if (engagementData.length > 0) {
      return engagementData.slice(0, 7).map((record) => ({
        day: record.data.day || record.data.day_of_week || "Unknown",
        engagement: record.data.engagement || 0,
      }));
    }
    return mockWeeklyEngagementData;
  }, [engagementData]);

  // Transform post type data
  const postTypeData = useMemo(() => {
    if (postData.length > 0) {
      return postData.slice(0, 10).map((record) => ({
        type: record.data.post_type || record.data.type || "Unknown",
        engagement: record.data.engagement || 0,
      }));
    }
    return mockPostTypeData;
  }, [postData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

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
            <h1 className="text-2xl font-bold text-foreground">LinkedIn Organic</h1>
            <p className="text-muted-foreground mt-1">
              Organic social performance metrics
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

      {/* Universal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Sessions / Visits" value={formatNumber(kpis.sessions)} change={kpis.sessionsChange} icon={Eye} />
        <KPICard title="Users" value={formatNumber(kpis.users)} change={kpis.usersChange} icon={Users} />
        <KPICard title="New Users %" value={`${kpis.newUsersPercent}%`} change={kpis.newUsersPercentChange} icon={Percent} />
        <KPICard title="Conversion Rate" value={`${kpis.conversionRate}%`} change={kpis.conversionRateChange} icon={MousePointer} />
        <KPICard title="Total Conversions" value={formatNumber(kpis.totalConversions)} change={kpis.totalConversionsChange} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value={formatCurrency(kpis.revenue)} change={kpis.revenueChange} icon={DollarSign} />
        <KPICard title="Cost per Conversion" value="$0.00" change="Organic" />
        <KPICard title="ROI" value="∞" change="Organic" icon={TrendingUp} />
        <KPICard title="Engagement Rate" value={`${kpis.engagementRate}%`} change={kpis.engagementRateChange} icon={Heart} />
        <KPICard title="Avg Session Duration" value={kpis.avgSessionDuration} change={kpis.avgSessionDurationChange} icon={Clock} />
      </div>

      {/* LinkedIn-Specific Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value={formatNumber(kpis.impressions)} change={kpis.impressionsChange} icon={Eye} />
        <KPICard title="Engagement" value={formatNumber(kpis.engagement)} change={kpis.engagementChange} icon={Heart} />
        <KPICard title="Followers" value={formatNumber(kpis.followers)} change={kpis.followersChange} icon={UserPlus} />
        <KPICard title="Shares" value={formatNumber(kpis.shares)} change={kpis.sharesChange} icon={Share2} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Engagement">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="engagement" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Post Type Performance">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={postTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="type" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="engagement" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
