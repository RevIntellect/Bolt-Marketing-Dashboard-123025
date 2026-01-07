import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData, computeTotals } from "@/hooks/useMarketingData";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Star, FileText, ArrowLeft, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GoogleAdsDashboardProps {
  onBack?: () => void;
}

// Fallback mock data when no live data available
const mockSearchTermData = [
  { term: "enterprise software", clicks: 850, conversions: 68 },
  { term: "saas platform", clicks: 620, conversions: 52 },
  { term: "workflow automation", clicks: 480, conversions: 38 },
];

const mockCampaignROIData = [
  { campaign: "Brand Search", roi: 520, revenue: 25000 },
  { campaign: "Generic Search", roi: 380, revenue: 18000 },
  { campaign: "Display Network", roi: 180, revenue: 8500 },
  { campaign: "Shopping Ads", roi: 420, revenue: 18500 },
];

export function GoogleAdsDashboard({ onBack }: GoogleAdsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: campaignData, loading: campaignLoading } = useMarketingData({
    source: "google_ads",
    metricType: "campaign_performance",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: searchTerms, loading: searchLoading } = useMarketingData({
    source: "google_ads",
    metricType: "search_terms",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "google_ads",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = campaignLoading || searchLoading || kpiLoading;
  const hasLiveData = campaignData.length > 0 || searchTerms.length > 0 || kpiData.length > 0;

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
        cpc: latest.cpc || 0,
        qualityScore: latest.quality_score || 0,
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
        cpcChange: latest.cpc_change || "$0",
        qualityScoreChange: latest.quality_score_change || "+0",
      };
    }
    // Default mock values
    return {
      sessions: 9420,
      users: 7850,
      newUsersPercent: 78.5,
      conversionRate: 4.2,
      totalConversions: 396,
      revenue: 70000,
      costPerConversion: 51.19,
      roi: 345,
      bounceRate: 48.3,
      avgSessionDuration: "2:05",
      impressions: 248000,
      ctr: 3.8,
      cpc: 2.15,
      qualityScore: 7.8,
      sessionsChange: "+6.8%",
      usersChange: "+6.2%",
      newUsersPercentChange: "+2.5%",
      conversionRateChange: "+0.5%",
      totalConversionsChange: "+9.2%",
      revenueChange: "+12.8%",
      costPerConversionChange: "-$4.20",
      roiChange: "+28%",
      bounceRateChange: "-2.5%",
      avgSessionDurationChange: "+0:10",
      impressionsChange: "+14.2%",
      ctrChange: "+0.3%",
      cpcChange: "-$0.12",
      qualityScoreChange: "+0.4",
    };
  }, [kpiData]);

  // Transform search term data
  const searchTermData = useMemo(() => {
    if (searchTerms.length > 0) {
      return searchTerms.slice(0, 10).map((record) => ({
        term: record.data.term || record.data.search_term || "Unknown",
        clicks: record.data.clicks || 0,
        conversions: record.data.conversions || 0,
      }));
    }
    return mockSearchTermData;
  }, [searchTerms]);

  // Transform campaign ROI data
  const campaignROIData = useMemo(() => {
    if (campaignData.length > 0) {
      return campaignData.slice(0, 10).map((record) => ({
        campaign: record.data.campaign_name || "Unknown Campaign",
        roi: record.data.roi || (record.data.revenue && record.data.cost ? Math.round((record.data.revenue / record.data.cost) * 100) : 0),
        revenue: record.data.revenue || 0,
      }));
    }
    return mockCampaignROIData;
  }, [campaignData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(2)}`;
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
            <h1 className="text-2xl font-bold text-foreground">Google Ads</h1>
            <p className="text-muted-foreground mt-1">
              Google Analytics & Google Ads metrics
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
        <KPICard title="ROI" value={`${kpis.roi}%`} change={kpis.roiChange} icon={TrendingUp} />
        <KPICard title="Bounce Rate" value={`${kpis.bounceRate}%`} change={kpis.bounceRateChange} isPositive={kpis.bounceRateChange.startsWith("-")} icon={Percent} />
        <KPICard title="Avg Session Duration" value={kpis.avgSessionDuration} change={kpis.avgSessionDurationChange} icon={Clock} />
      </div>

      {/* Google Ads Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value={formatNumber(kpis.impressions)} change={kpis.impressionsChange} icon={Eye} />
        <KPICard title="CTR" value={`${kpis.ctr}%`} change={kpis.ctrChange} icon={MousePointer} />
        <KPICard title="CPC" value={`$${kpis.cpc.toFixed(2)}`} change={kpis.cpcChange} isPositive={kpis.cpcChange.startsWith("-")} icon={DollarSign} />
        <KPICard title="Quality Score" value={`${kpis.qualityScore}/10`} change={kpis.qualityScoreChange} icon={Star} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Search Term Performance (Top Converting)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={searchTermData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="term" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="clicks" name="Clicks" fill="hsl(220, 70%, 55%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="conversions" name="Conversions" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Campaign / Ad Group ROI">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={campaignROIData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="campaign" stroke="hsl(var(--muted-foreground))" fontSize={10} />
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
              <Bar yAxisId="left" dataKey="roi" name="ROI (%)" fill="hsl(155, 70%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
