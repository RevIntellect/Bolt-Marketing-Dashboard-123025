import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData } from "@/hooks/useMarketingData";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Target, ArrowLeft, Loader2 } from "lucide-react";
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

interface LinkedInAdsDashboardProps {
  onBack?: () => void;
}

// Fallback mock data when no live data available
const mockDailyPerformanceData = [
  { day: "Mon", conversions: 22, spend: 180 },
  { day: "Tue", conversions: 28, spend: 210 },
  { day: "Wed", conversions: 32, spend: 240 },
  { day: "Thu", conversions: 25, spend: 200 },
  { day: "Fri", conversions: 16, spend: 190 },
];

const mockCampaignPerformanceData = [
  { campaign: "Lead Generation", ctr: 4.2, conversions: 58 },
  { campaign: "Content Download", ctr: 2.8, conversions: 45 },
  { campaign: "Brand Awareness", ctr: 1.5, conversions: 20 },
];

export function LinkedInAdsDashboard({ onBack }: LinkedInAdsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: campaignData, loading: campaignLoading } = useMarketingData({
    source: "linkedin_ads",
    metricType: "campaign_performance",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: dailyData, loading: dailyLoading } = useMarketingData({
    source: "linkedin_ads",
    metricType: "daily_performance",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "linkedin_ads",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = campaignLoading || dailyLoading || kpiLoading;
  const hasLiveData = campaignData.length > 0 || dailyData.length > 0 || kpiData.length > 0;

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
        costPerConversion: latest.cost_per_conversion || 0,
        roi: latest.roi || 0,
        bounceRate: latest.bounce_rate || 0,
        avgSessionDuration: latest.avg_session_duration || "0:00",
        impressions: latest.impressions || 0,
        ctr: latest.ctr || 0,
        adSpend: latest.ad_spend || latest.spend || 0,
        cpc: latest.cpc || 0,
        // Changes
        sessionsChange: latest.sessions_change || "+0%",
        usersChange: latest.users_change || "+0%",
        newUsersPercentChange: latest.new_users_percent_change || "+0%",
        conversionRateChange: latest.conversion_rate_change || "+0%",
        totalConversionsChange: latest.conversions_change || "+0%",
        revenueChange: latest.revenue_change || "+0%",
        costPerConversionChange: latest.cost_per_conversion_change || "$0",
        roiChange: latest.roi_change || "+0%",
        bounceRateChange: latest.bounce_rate_change || "+0%",
        avgSessionDurationChange: latest.avg_session_duration_change || "+0:00",
        impressionsChange: latest.impressions_change || "+0%",
        ctrChange: latest.ctr_change || "+0%",
        adSpendChange: latest.ad_spend_change || "+0%",
        cpcChange: latest.cpc_change || "$0",
      };
    }
    // Default mock values
    return {
      sessions: 1820,
      users: 1620,
      newUsersPercent: 85.3,
      conversionRate: 6.7,
      totalConversions: 123,
      revenue: 12300,
      costPerConversion: 8.29,
      roi: 1210,
      bounceRate: 45.2,
      avgSessionDuration: "2:18",
      impressions: 98500,
      ctr: 3.2,
      adSpend: 1020,
      cpc: 0.79,
      sessionsChange: "+9.5%",
      usersChange: "+8.8%",
      newUsersPercentChange: "+3.2%",
      conversionRateChange: "+0.8%",
      totalConversionsChange: "+11.8%",
      revenueChange: "+11.8%",
      costPerConversionChange: "-$0.65",
      roiChange: "+85%",
      bounceRateChange: "-1.8%",
      avgSessionDurationChange: "+0:15",
      impressionsChange: "+15.2%",
      ctrChange: "+0.4%",
      adSpendChange: "+5.0%",
      cpcChange: "-$0.05",
    };
  }, [kpiData]);

  // Transform daily performance data
  const dailyPerformanceData = useMemo(() => {
    if (dailyData.length > 0) {
      return dailyData.slice(0, 7).map((record) => ({
        day: record.data.day || record.data.day_of_week || "Unknown",
        conversions: record.data.conversions || 0,
        spend: record.data.spend || 0,
      }));
    }
    return mockDailyPerformanceData;
  }, [dailyData]);

  // Transform campaign performance data
  const campaignPerformanceData = useMemo(() => {
    if (campaignData.length > 0) {
      return campaignData.slice(0, 10).map((record) => ({
        campaign: record.data.campaign_name || "Unknown Campaign",
        ctr: record.data.ctr || 0,
        conversions: record.data.conversions || 0,
      }));
    }
    return mockCampaignPerformanceData;
  }, [campaignData]);

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
            <h1 className="text-2xl font-bold text-foreground">LinkedIn Ads</h1>
            <p className="text-muted-foreground mt-1">
              Paid LinkedIn advertising metrics
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
        <KPICard title="Cost per Conversion" value={`$${kpis.costPerConversion.toFixed(2)}`} change={kpis.costPerConversionChange} isPositive={kpis.costPerConversionChange.startsWith("-")} />
        <KPICard title="ROI" value={`${formatNumber(kpis.roi)}%`} change={kpis.roiChange} icon={TrendingUp} />
        <KPICard title="Bounce Rate" value={`${kpis.bounceRate}%`} change={kpis.bounceRateChange} isPositive={kpis.bounceRateChange.startsWith("-")} icon={Percent} />
        <KPICard title="Avg Session Duration" value={kpis.avgSessionDuration} change={kpis.avgSessionDurationChange} icon={Clock} />
      </div>

      {/* Ads Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value={formatNumber(kpis.impressions)} change={kpis.impressionsChange} icon={Eye} />
        <KPICard title="CTR" value={`${kpis.ctr}%`} change={kpis.ctrChange} icon={MousePointer} />
        <KPICard title="Ad Spend" value={formatCurrency(kpis.adSpend)} change={kpis.adSpendChange} icon={DollarSign} />
        <KPICard title="CPC" value={`$${kpis.cpc.toFixed(2)}`} change={kpis.cpcChange} isPositive={kpis.cpcChange.startsWith("-")} icon={Target} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Performance">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
              <Line yAxisId="left" type="monotone" dataKey="conversions" name="Conversions" stroke="hsl(155, 70%, 45%)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="spend" name="Spend ($)" stroke="hsl(220, 70%, 55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Campaign Performance">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={campaignPerformanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="campaign" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="ctr" name="CTR (%)" fill="hsl(220, 70%, 55%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="conversions" name="Conversions" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
