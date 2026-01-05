import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Target, ArrowLeft, AlertCircle } from "lucide-react";
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
import { useLinkedInAds, useGA4Traffic } from "@/hooks/useMarketingData";

interface LinkedInAdsDashboardProps {
  onBack?: () => void;
}

const fallbackDailyPerformanceData = [
  { day: "Mon", conversions: 22, spend: 180 },
  { day: "Tue", conversions: 28, spend: 210 },
  { day: "Wed", conversions: 32, spend: 240 },
  { day: "Thu", conversions: 25, spend: 200 },
  { day: "Fri", conversions: 16, spend: 190 },
];

const fallbackCampaignPerformanceData = [
  { campaign: "Lead Generation", ctr: 4.2, conversions: 58 },
  { campaign: "Content Download", ctr: 2.8, conversions: 45 },
  { campaign: "Brand Awareness", ctr: 1.5, conversions: 20 },
];

export function LinkedInAdsDashboard({ onBack }: LinkedInAdsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { data: adsData, isLoading, error } = useLinkedInAds();
  const { data: trafficData } = useGA4Traffic();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Use real data or fallbacks
  const impressions = adsData?.impressions ?? 98500;
  const clicks = adsData?.clicks ?? 3152;
  const conversions = adsData?.conversions ?? 123;
  const spend = adsData?.spend ?? 1020;
  const leads = adsData?.leads ?? 45;
  const ctr = adsData?.ctr ?? "3.2";
  const cpc = adsData?.cpc ?? "0.79";
  const costPerConversion = adsData?.costPerConversion ?? "8.29";

  // GA4 traffic data
  const sessions = trafficData?.sessions ? Math.round(trafficData.sessions * 0.02) : 1820; // Approximate LinkedIn portion
  const users = trafficData?.users ? Math.round(trafficData.users * 0.02) : 1620;
  const bounceRate = trafficData?.bounceRate ?? "45.2";
  const avgSessionDuration = trafficData?.avgSessionDuration ?? 138;
  const newUserPercent = trafficData?.newUserPercent ?? "85.3";

  // Calculate revenue and ROI
  const revenue = conversions * 100; // Estimated $100 per conversion
  const roi = spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 1210;

  const hasLiveData = adsData || trafficData;

  // Transform campaign data for chart
  const campaignPerformanceData = adsData?.campaigns
    ? Object.entries(adsData.campaigns).slice(0, 3).map(([name, data]) => ({
        campaign: name.length > 15 ? name.substring(0, 15) + "..." : name,
        ctr: data.impressions > 0 ? parseFloat(((data.clicks / data.impressions) * 100).toFixed(1)) : 0,
        conversions: data.conversions,
      }))
    : fallbackCampaignPerformanceData;

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
        <KPICard title="Sessions / Visits" value={formatNumber(sessions)} change="+9.5%" icon={Eye} />
        <KPICard title="Users" value={formatNumber(users)} change="+8.8%" icon={Users} />
        <KPICard title="New Users %" value={`${newUserPercent}%`} change="+3.2%" icon={Percent} />
        <KPICard title="Conversion Rate" value={`${clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : 6.7}%`} change="+0.8%" icon={MousePointer} />
        <KPICard title="Total Conversions" value={formatNumber(conversions)} change="+11.8%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value={`$${formatNumber(revenue)}`} change="+11.8%" icon={DollarSign} />
        <KPICard title="Cost per Conversion" value={`$${costPerConversion}`} change="-$0.65" isPositive />
        <KPICard title="ROI" value={`${roi}%`} change="+85%" icon={TrendingUp} />
        <KPICard title="Bounce Rate" value={`${bounceRate}%`} change="-1.8%" isPositive icon={Percent} />
        <KPICard title="Avg Session Duration" value={`${Math.floor(avgSessionDuration / 60)}:${(avgSessionDuration % 60).toString().padStart(2, '0')}`} change="+0:15" icon={Clock} />
      </div>

      {/* Ads Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value={formatNumber(impressions)} change="+15.2%" icon={Eye} />
        <KPICard title="CTR" value={`${ctr}%`} change="+0.4%" icon={MousePointer} />
        <KPICard title="Ad Spend" value={`$${formatNumber(spend)}`} change="+5.0%" icon={DollarSign} />
        <KPICard title="CPC" value={`$${cpc}`} change="-$0.05" isPositive icon={Target} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Performance">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fallbackDailyPerformanceData}>
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
