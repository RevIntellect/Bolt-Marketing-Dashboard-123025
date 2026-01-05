import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Star, ArrowLeft, AlertCircle } from "lucide-react";
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
import { useGoogleAds, useGA4Traffic, useGA4Conversions } from "@/hooks/useMarketingData";

interface GoogleAdsDashboardProps {
  onBack?: () => void;
}

const fallbackSearchTermData = [
  { term: "enterprise software", clicks: 850, conversions: 68 },
  { term: "saas platform", clicks: 620, conversions: 52 },
  { term: "workflow automation", clicks: 480, conversions: 38 },
];

const fallbackCampaignROIData = [
  { campaign: "Brand Search", roi: 520, revenue: 25000 },
  { campaign: "Generic Search", roi: 380, revenue: 18000 },
  { campaign: "Display Network", roi: 180, revenue: 8500 },
  { campaign: "Shopping Ads", roi: 420, revenue: 18500 },
];

export function GoogleAdsDashboard({ onBack }: GoogleAdsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { data: adsData, isLoading, error } = useGoogleAds();
  const { data: trafficData } = useGA4Traffic();
  const { data: conversionsData } = useGA4Conversions();

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

  // Use real data or fallbacks
  const impressions = adsData?.impressions ?? 248000;
  const clicks = adsData?.clicks ?? 9420;
  const conversions = adsData?.conversions ?? 396;
  const cost = adsData?.cost ?? 20249;
  const ctr = adsData?.ctr ?? "3.8";
  const cpc = adsData?.cpc ?? "2.15";
  const conversionRate = adsData?.conversionRate ?? "4.2";
  const costPerConversion = adsData?.costPerConversion ?? "51.19";

  // GA4 traffic data
  const sessions = trafficData?.sessions ?? 9420;
  const users = trafficData?.users ?? 7850;
  const bounceRate = trafficData?.bounceRate ?? "48.3";
  const avgSessionDuration = trafficData?.avgSessionDuration ?? 125;
  const newUserPercent = trafficData?.newUserPercent ?? "78.5";

  // Revenue from conversions
  const revenue = conversionsData?.revenue ?? 70000;

  // Calculate ROI
  const roi = cost > 0 ? Math.round(((revenue - cost) / cost) * 100) : 345;

  const hasLiveData = adsData || trafficData;

  // Transform campaign data for chart
  const campaignROIData = adsData?.campaigns
    ? Object.entries(adsData.campaigns).slice(0, 4).map(([name, data]) => ({
        campaign: name.length > 15 ? name.substring(0, 15) + "..." : name,
        roi: data.cost > 0 ? Math.round(((data.conversions * 100) / data.cost) * 100) : 0,
        revenue: data.conversions * 100, // Estimated revenue
      }))
    : fallbackCampaignROIData;

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
              {hasLiveData && <span className="text-green-500 ml-2">● Live</span>}
              {!hasLiveData && !isLoading && <span className="text-yellow-500 ml-2">● Sample Data</span>}
            </p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive">Failed to load data. Showing sample data.</span>
        </div>
      )}

      {/* Universal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Sessions / Visits" value={formatNumber(sessions)} change="+6.8%" icon={Eye} />
        <KPICard title="Users" value={formatNumber(users)} change="+6.2%" icon={Users} />
        <KPICard title="New Users %" value={`${newUserPercent}%`} change="+2.5%" icon={Percent} />
        <KPICard title="Conversion Rate" value={`${conversionRate}%`} change="+0.5%" icon={MousePointer} />
        <KPICard title="Total Conversions" value={formatNumber(conversions)} change="+9.2%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value={formatCurrency(revenue)} change="+12.8%" icon={DollarSign} />
        <KPICard title="Cost per Conversion" value={`$${costPerConversion}`} change="-$4.20" isPositive />
        <KPICard title="ROI" value={`${roi}%`} change="+28%" icon={TrendingUp} />
        <KPICard title="Bounce Rate" value={`${bounceRate}%`} change="-2.5%" isPositive icon={Percent} />
        <KPICard title="Avg Session Duration" value={`${Math.floor(avgSessionDuration / 60)}:${(avgSessionDuration % 60).toString().padStart(2, '0')}`} change="+0:10" icon={Clock} />
      </div>

      {/* Google Ads Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value={formatNumber(impressions)} change="+14.2%" icon={Eye} />
        <KPICard title="CTR" value={`${ctr}%`} change="+0.3%" icon={MousePointer} />
        <KPICard title="CPC" value={`$${cpc}`} change="-$0.12" isPositive icon={DollarSign} />
        <KPICard title="Quality Score" value="7.8/10" change="+0.4" icon={Star} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Search Term Performance (Top Converting)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fallbackSearchTermData} layout="vertical">
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
