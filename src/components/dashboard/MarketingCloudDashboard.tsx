import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData } from "@/hooks/useMarketingData";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, FileText, Mail, ArrowLeft, Loader2 } from "lucide-react";
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

// Fallback mock data when no live data available
const mockEmailTrendsData = [
  { month: "Jan", ctor: 22, ctr: 6.5, openRate: 28, uniqueClicks: 820 },
  { month: "Feb", ctor: 23, ctr: 6.8, openRate: 29, uniqueClicks: 860 },
  { month: "Mar", ctor: 23.5, ctr: 7.0, openRate: 29.5, uniqueClicks: 900 },
  { month: "Apr", ctor: 24, ctr: 7.2, openRate: 30, uniqueClicks: 940 },
  { month: "May", ctor: 24, ctr: 7.1, openRate: 30, uniqueClicks: 960 },
  { month: "Jun", ctor: 24, ctr: 7.2, openRate: 30, uniqueClicks: 985 },
];

const mockGa4AttributionData = [
  { month: "Jan", conversions: 95, revenue: 4200, sessions: 2800 },
  { month: "Feb", conversions: 105, revenue: 4800, sessions: 3000 },
  { month: "Mar", conversions: 115, revenue: 5400, sessions: 3100 },
  { month: "Apr", conversions: 120, revenue: 5800, sessions: 3200 },
  { month: "May", conversions: 128, revenue: 6200, sessions: 3280 },
  { month: "Jun", conversions: 134, revenue: 6700, sessions: 3350 },
];

export function MarketingCloudDashboard({ onBack }: MarketingCloudDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: emailTrends, loading: emailLoading } = useMarketingData({
    source: "marketing_cloud",
    metricType: "email_trends",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: attributionData, loading: attributionLoading } = useMarketingData({
    source: "marketing_cloud",
    metricType: "ga4_attribution",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "marketing_cloud",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = emailLoading || attributionLoading || kpiLoading;
  const hasLiveData = emailTrends.length > 0 || attributionData.length > 0 || kpiData.length > 0;

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
        openRate: latest.open_rate || 0,
        ctr: latest.ctr || 0,
        uniqueClicks: latest.unique_clicks || 0,
        ctor: latest.ctor || latest.click_to_open || 0,
        deliveryBounceRate: latest.delivery_bounce_rate || 0,
        unsubscribeRate: latest.unsubscribe_rate || 0,
        emailsSent: latest.emails_sent || 0,
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
        openRateChange: latest.open_rate_change || "+0%",
        ctrChange: latest.ctr_change || "+0%",
        uniqueClicksChange: latest.unique_clicks_change || "+0",
        ctorChange: latest.ctor_change || "+0%",
        deliveryBounceRateChange: latest.delivery_bounce_rate_change || "+0%",
        unsubscribeRateChange: latest.unsubscribe_rate_change || "+0%",
        emailsSentChange: latest.emails_sent_change || "+0",
      };
    }
    // Default mock values
    return {
      sessions: 3350,
      users: 2840,
      newUsersPercent: 65.2,
      conversionRate: 4.0,
      totalConversions: 134,
      revenue: 6700,
      costPerConversion: 18.50,
      roi: 270,
      bounceRate: 38.5,
      avgSessionDuration: "2:45",
      openRate: 30.0,
      ctr: 7.2,
      uniqueClicks: 985,
      ctor: 24.0,
      deliveryBounceRate: 1.2,
      unsubscribeRate: 0.18,
      emailsSent: 13680,
      sessionsChange: "+8.1%",
      usersChange: "+7.5%",
      newUsersPercentChange: "+1.8%",
      conversionRateChange: "+0.3%",
      totalConversionsChange: "+8.1%",
      revenueChange: "+8.1%",
      costPerConversionChange: "-$1.20",
      roiChange: "+15%",
      bounceRateChange: "-2.1%",
      avgSessionDurationChange: "+0:12",
      openRateChange: "+2.0%",
      ctrChange: "+0.4%",
      uniqueClicksChange: "+65",
      ctorChange: "+0.9%",
      deliveryBounceRateChange: "-0.3%",
      unsubscribeRateChange: "-0.02%",
      emailsSentChange: "+840",
    };
  }, [kpiData]);

  // Transform email trends data
  const emailTrendsData = useMemo(() => {
    if (emailTrends.length > 0) {
      return emailTrends.slice(0, 12).map((record) => ({
        month: record.data.month || "Unknown",
        ctor: record.data.ctor || record.data.click_to_open || 0,
        ctr: record.data.ctr || 0,
        openRate: record.data.open_rate || record.data.openRate || 0,
        uniqueClicks: record.data.unique_clicks || record.data.uniqueClicks || 0,
      }));
    }
    return mockEmailTrendsData;
  }, [emailTrends]);

  // Transform GA4 attribution data
  const ga4AttributionData = useMemo(() => {
    if (attributionData.length > 0) {
      return attributionData.slice(0, 12).map((record) => ({
        month: record.data.month || "Unknown",
        conversions: record.data.conversions || 0,
        revenue: record.data.revenue || 0,
        sessions: record.data.sessions || 0,
      }));
    }
    return mockGa4AttributionData;
  }, [attributionData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
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
            <h1 className="text-2xl font-bold text-foreground">Marketing Cloud Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Salesforce Marketing Cloud metrics
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

      {/* Core Email Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Open Rate" value={`${kpis.openRate}%`} change={kpis.openRateChange} icon={Mail} />
        <KPICard title="Click-Through Rate" value={`${kpis.ctr}%`} change={kpis.ctrChange} icon={MousePointer} />
        <KPICard title="Unique Clicks" value={formatNumber(kpis.uniqueClicks)} change={kpis.uniqueClicksChange} icon={TrendingUp} />
        <KPICard title="Click to Open" value={`${kpis.ctor}%`} change={kpis.ctorChange} icon={Percent} />
      </div>

      {/* Email Delivery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Bounce Rate (Delivery)" value={`${kpis.deliveryBounceRate}%`} change={kpis.deliveryBounceRateChange} isPositive={kpis.deliveryBounceRateChange.startsWith("-")} />
        <KPICard title="Unsubscribe Rate" value={`${kpis.unsubscribeRate}%`} change={kpis.unsubscribeRateChange} isPositive={kpis.unsubscribeRateChange.startsWith("-")} />
        <KPICard title="Total Emails Sent" value={formatNumber(kpis.emailsSent)} change={kpis.emailsSentChange} icon={Mail} />
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
