import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData } from "@/hooks/useMarketingData";
import { Eye, Users, Percent, MousePointer, TrendingUp, Clock, Search, FileText, Target, ArrowLeft, Loader2 } from "lucide-react";
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

interface SEODashboardProps {
  onBack?: () => void;
}

// Fallback mock data when no live data available
const mockOrganicTrendData = [
  { month: "Jan", clicks: 10200, impressions: 145000, sessions: 9800 },
  { month: "Feb", clicks: 10800, impressions: 152000, sessions: 10200 },
  { month: "Mar", clicks: 11200, impressions: 158000, sessions: 10600 },
  { month: "Apr", clicks: 11600, impressions: 162000, sessions: 10900 },
  { month: "May", clicks: 12000, impressions: 165000, sessions: 11000 },
  { month: "Jun", clicks: 12300, impressions: 168000, sessions: 11200 },
];

const mockTopPagesData = [
  { page: "/product", traffic: 2800, conversions: 145 },
  { page: "/enterprise", traffic: 2200, conversions: 120 },
  { page: "/pricing", traffic: 1800, conversions: 95 },
  { page: "/features", traffic: 1500, conversions: 75 },
  { page: "/integration", traffic: 1200, conversions: 59 },
];

const mockKeywordRankingsData = [
  { keyword: "enterprise software", position: 3, volume: 8500 },
  { keyword: "business solutions", position: 5, volume: 6200 },
  { keyword: "cloud integration", position: 7, volume: 4800 },
];

export function SEODashboard({ onBack }: SEODashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: trendData, loading: trendLoading } = useMarketingData({
    source: "seo",
    metricType: "organic_trend",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: pagesData, loading: pagesLoading } = useMarketingData({
    source: "seo",
    metricType: "top_pages",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: keywordData, loading: keywordLoading } = useMarketingData({
    source: "seo",
    metricType: "keyword_rankings",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "seo",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = trendLoading || pagesLoading || keywordLoading || kpiLoading;
  const hasLiveData = trendData.length > 0 || pagesData.length > 0 || keywordData.length > 0 || kpiData.length > 0;

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
        bounceRate: latest.bounce_rate || 0,
        avgSessionDuration: latest.avg_session_duration || "0:00",
        organicClicks: latest.organic_clicks || 0,
        impressions: latest.impressions || 0,
        avgCtr: latest.avg_ctr || 0,
        avgPosition: latest.avg_position || 0,
        // Changes
        sessionsChange: latest.sessions_change || "+0%",
        usersChange: latest.users_change || "+0%",
        newUsersPercentChange: latest.new_users_percent_change || "+0%",
        conversionRateChange: latest.conversion_rate_change || "+0%",
        totalConversionsChange: latest.conversions_change || "+0%",
        revenueChange: latest.revenue_change || "+0%",
        bounceRateChange: latest.bounce_rate_change || "+0%",
        avgSessionDurationChange: latest.avg_session_duration_change || "+0:00",
        organicClicksChange: latest.organic_clicks_change || "+0%",
        impressionsChange: latest.impressions_change || "+0%",
        avgCtrChange: latest.avg_ctr_change || "+0%",
        avgPositionChange: latest.avg_position_change || "+0",
      };
    }
    // Default mock values
    return {
      sessions: 11200,
      users: 9450,
      newUsersPercent: 62.8,
      conversionRate: 4.4,
      totalConversions: 494,
      revenue: 24700,
      bounceRate: 40.5,
      avgSessionDuration: "3:15",
      organicClicks: 12300,
      impressions: 168000,
      avgCtr: 7.3,
      avgPosition: 5.6,
      sessionsChange: "+6.7%",
      usersChange: "+6.3%",
      newUsersPercentChange: "+1.2%",
      conversionRateChange: "+0.4%",
      totalConversionsChange: "+7.8%",
      revenueChange: "+7.8%",
      bounceRateChange: "-2.8%",
      avgSessionDurationChange: "+0:18",
      organicClicksChange: "+6.6%",
      impressionsChange: "+6.3%",
      avgCtrChange: "+0.2%",
      avgPositionChange: "-0.8",
    };
  }, [kpiData]);

  // Transform organic trend data
  const organicTrendData = useMemo(() => {
    if (trendData.length > 0) {
      return trendData.slice(0, 12).map((record) => ({
        month: record.data.month || "Unknown",
        clicks: record.data.clicks || 0,
        impressions: record.data.impressions || 0,
        sessions: record.data.sessions || 0,
      }));
    }
    return mockOrganicTrendData;
  }, [trendData]);

  // Transform top pages data
  const topPagesData = useMemo(() => {
    if (pagesData.length > 0) {
      return pagesData.slice(0, 10).map((record) => ({
        page: record.data.page || record.data.page_url || "Unknown",
        traffic: record.data.traffic || record.data.clicks || 0,
        conversions: record.data.conversions || 0,
      }));
    }
    return mockTopPagesData;
  }, [pagesData]);

  // Transform keyword rankings data
  const keywordRankingsData = useMemo(() => {
    if (keywordData.length > 0) {
      return keywordData.slice(0, 10).map((record) => ({
        keyword: record.data.keyword || "Unknown",
        position: record.data.position || record.data.average_position || 0,
        volume: record.data.volume || record.data.search_volume || 0,
      }));
    }
    return mockKeywordRankingsData;
  }, [keywordData]);

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
            <h1 className="text-2xl font-bold text-foreground">Google Search Console</h1>
            <p className="text-muted-foreground mt-1">
              Organic search performance metrics
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
        <KPICard title="Revenue Generated" value={formatCurrency(kpis.revenue)} change={kpis.revenueChange} icon={TrendingUp} />
        <KPICard title="Cost per Conversion" value="$0.00" change="Organic" />
        <KPICard title="ROI" value="∞" change="Organic" icon={TrendingUp} />
        <KPICard title="Bounce Rate" value={`${kpis.bounceRate}%`} change={kpis.bounceRateChange} isPositive={kpis.bounceRateChange.startsWith("-")} icon={Percent} />
        <KPICard title="Avg Session Duration" value={kpis.avgSessionDuration} change={kpis.avgSessionDurationChange} icon={Clock} />
      </div>

      {/* SEO Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Organic Clicks" value={formatNumber(kpis.organicClicks)} change={kpis.organicClicksChange} icon={MousePointer} />
        <KPICard title="Impressions" value={formatNumber(kpis.impressions)} change={kpis.impressionsChange} icon={Eye} />
        <KPICard title="Avg. CTR" value={`${kpis.avgCtr}%`} change={kpis.avgCtrChange} icon={Percent} />
        <KPICard title="Avg. Position" value={kpis.avgPosition.toFixed(1)} change={kpis.avgPositionChange} isPositive={kpis.avgPositionChange.startsWith("-")} icon={Target} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Organic Traffic Trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={organicTrendData}>
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
              <Line yAxisId="left" type="monotone" dataKey="clicks" name="Clicks" stroke="hsl(155, 70%, 45%)" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="sessions" name="Sessions" stroke="hsl(220, 70%, 55%)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="impressions" name="Impressions" stroke="hsl(280, 65%, 55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Performing Pages (Organic Traffic)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topPagesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="page" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="traffic" name="Traffic" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="conversions" name="Conversions" fill="hsl(220, 70%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Keyword Rankings */}
      <ChartCard title="Top Keyword Rankings">
        <div className="space-y-4">
          {keywordRankingsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
                  #{item.position}
                </span>
                <span className="font-medium text-foreground">{item.keyword}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Search Volume: </span>
                <span className="font-semibold text-foreground">{item.volume.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
