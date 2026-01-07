import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useMarketingData } from "@/hooks/useMarketingData";
import { DollarSign, TrendingUp, Percent, Target, ArrowLeft, Loader2 } from "lucide-react";
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
  ComposedChart,
} from "recharts";

interface FinancialDashboardProps {
  onBack: () => void;
}

// Fallback mock data when no live data available
const mockRevenueData = [
  { month: "Jan", revenue: 85000, cost: 32000, profit: 53000 },
  { month: "Feb", revenue: 92000, cost: 35000, profit: 57000 },
  { month: "Mar", revenue: 105000, cost: 38000, profit: 67000 },
  { month: "Apr", revenue: 98000, cost: 36000, profit: 62000 },
  { month: "May", revenue: 118000, cost: 42000, profit: 76000 },
  { month: "Jun", revenue: 135000, cost: 48000, profit: 87000 },
];

const mockRoiData = [
  { channel: "Email", roi: 4200, spend: 15000 },
  { channel: "Google Ads", roi: 320, spend: 45000 },
  { channel: "LinkedIn Ads", roi: 280, spend: 35000 },
  { channel: "Direct Mail", roi: 150, spend: 25000 },
  { channel: "SEO", roi: 850, spend: 12000 },
];

export function FinancialDashboard({ onBack }: FinancialDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: revenueMetrics, loading: revenueLoading } = useMarketingData({
    source: "financial",
    metricType: "revenue_trend",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: roiMetrics, loading: roiLoading } = useMarketingData({
    source: "financial",
    metricType: "channel_roi",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const { data: kpiData, loading: kpiLoading } = useMarketingData({
    source: "financial",
    metricType: "kpi_summary",
    dateRangeStart: dateRange?.from?.toISOString().split("T")[0],
    dateRangeEnd: dateRange?.to?.toISOString().split("T")[0],
  });

  const loading = revenueLoading || roiLoading || kpiLoading;
  const hasLiveData = revenueMetrics.length > 0 || roiMetrics.length > 0 || kpiData.length > 0;

  // Compute KPIs from live data or use defaults
  const kpis = useMemo(() => {
    if (kpiData.length > 0) {
      const latest = kpiData[0].data;
      return {
        totalRevenue: latest.total_revenue || 0,
        marketingSpend: latest.marketing_spend || 0,
        netProfit: latest.net_profit || 0,
        overallRoi: latest.overall_roi || 0,
        // Changes
        totalRevenueChange: latest.total_revenue_change || "+0%",
        marketingSpendChange: latest.marketing_spend_change || "+0%",
        netProfitChange: latest.net_profit_change || "+0%",
        overallRoiChange: latest.overall_roi_change || "+0pp",
      };
    }
    // Default mock values
    return {
      totalRevenue: 633000,
      marketingSpend: 132000,
      netProfit: 402000,
      overallRoi: 379,
      totalRevenueChange: "+18.5%",
      marketingSpendChange: "+8.2%",
      netProfitChange: "+22.1%",
      overallRoiChange: "+45pp",
    };
  }, [kpiData]);

  // Transform revenue data
  const revenueData = useMemo(() => {
    if (revenueMetrics.length > 0) {
      return revenueMetrics.slice(0, 12).map((record) => ({
        month: record.data.month || "Unknown",
        revenue: record.data.revenue || 0,
        cost: record.data.cost || record.data.marketing_spend || 0,
        profit: record.data.profit || (record.data.revenue - (record.data.cost || record.data.marketing_spend || 0)) || 0,
      }));
    }
    return mockRevenueData;
  }, [revenueMetrics]);

  // Transform ROI data
  const roiData = useMemo(() => {
    if (roiMetrics.length > 0) {
      return roiMetrics.slice(0, 10).map((record) => ({
        channel: record.data.channel || "Unknown",
        roi: record.data.roi || 0,
        spend: record.data.spend || 0,
      }));
    }
    return mockRoiData;
  }, [roiMetrics]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
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
            <h1 className="text-2xl font-bold text-foreground">Financial Performance</h1>
            <p className="text-muted-foreground mt-1">
              Revenue, costs, and ROI metrics
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
        <KPICard title="Total Revenue" value={formatCurrency(kpis.totalRevenue)} change={kpis.totalRevenueChange} icon={DollarSign} />
        <KPICard title="Marketing Spend" value={formatCurrency(kpis.marketingSpend)} change={kpis.marketingSpendChange} icon={TrendingUp} />
        <KPICard title="Net Profit" value={formatCurrency(kpis.netProfit)} change={kpis.netProfitChange} icon={Percent} />
        <KPICard title="Overall ROI" value={`${kpis.overallRoi}%`} change={kpis.overallRoiChange} icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue vs Cost vs Profit">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueData}>
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
                formatter={(value) => [`$${(value as number).toLocaleString()}`, ""]}
              />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(155, 70%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="profit" stroke="hsl(220, 70%, 55%)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ROI by Channel (%)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData} layout="vertical">
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
                formatter={(value, name) => [name === 'roi' ? `${value}%` : `$${(value as number).toLocaleString()}`, name === 'roi' ? 'ROI' : 'Spend']}
              />
              <Legend />
              <Bar dataKey="roi" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
