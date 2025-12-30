import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Star, FileText, ArrowLeft } from "lucide-react";
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

const searchTermData = [
  { term: "enterprise software", clicks: 850, conversions: 68 },
  { term: "saas platform", clicks: 620, conversions: 52 },
  { term: "workflow automation", clicks: 480, conversions: 38 },
];

const campaignROIData = [
  { campaign: "Brand Search", roi: 520, revenue: 25000 },
  { campaign: "Generic Search", roi: 380, revenue: 18000 },
  { campaign: "Display Network", roi: 180, revenue: 8500 },
  { campaign: "Shopping Ads", roi: 420, revenue: 18500 },
];

export function GoogleAdsDashboard({ onBack }: GoogleAdsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
            <p className="text-muted-foreground mt-1">Google Analytics & Google Ads metrics</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Universal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Sessions / Visits" value="9,420" change="+6.8%" icon={Eye} />
        <KPICard title="Users" value="7,850" change="+6.2%" icon={Users} />
        <KPICard title="New Users %" value="78.5%" change="+2.5%" icon={Percent} />
        <KPICard title="Conversion Rate" value="4.2%" change="+0.5%" icon={MousePointer} />
        <KPICard title="Total Conversions" value="396" change="+9.2%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value="$70K" change="+12.8%" icon={DollarSign} />
        <KPICard title="Cost per Conversion" value="$51.19" change="-$4.20" isPositive />
        <KPICard title="ROI" value="345%" change="+28%" icon={TrendingUp} />
        <KPICard title="Bounce Rate" value="48.3%" change="-2.5%" isPositive icon={Percent} />
        <KPICard title="Avg Session Duration" value="2:05" change="+0:10" icon={Clock} />
      </div>

      {/* Google Ads Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value="248K" change="+14.2%" icon={Eye} />
        <KPICard title="CTR" value="3.8%" change="+0.3%" icon={MousePointer} />
        <KPICard title="CPC" value="$2.15" change="-$0.12" isPositive icon={DollarSign} />
        <KPICard title="Quality Score" value="7.8/10" change="+0.4" icon={Star} />
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
