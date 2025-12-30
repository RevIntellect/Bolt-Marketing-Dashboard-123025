import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Target, ArrowLeft } from "lucide-react";
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

const dailyPerformanceData = [
  { day: "Mon", conversions: 22, spend: 180 },
  { day: "Tue", conversions: 28, spend: 210 },
  { day: "Wed", conversions: 32, spend: 240 },
  { day: "Thu", conversions: 25, spend: 200 },
  { day: "Fri", conversions: 16, spend: 190 },
];

const campaignPerformanceData = [
  { campaign: "Lead Generation", ctr: 4.2, conversions: 58 },
  { campaign: "Content Download", ctr: 2.8, conversions: 45 },
  { campaign: "Brand Awareness", ctr: 1.5, conversions: 20 },
];

export function LinkedInAdsDashboard({ onBack }: LinkedInAdsDashboardProps) {
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
            <h1 className="text-2xl font-bold text-foreground">LinkedIn Ads</h1>
            <p className="text-muted-foreground mt-1">Paid LinkedIn advertising metrics</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Universal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Sessions / Visits" value="1,820" change="+9.5%" icon={Eye} />
        <KPICard title="Users" value="1,620" change="+8.8%" icon={Users} />
        <KPICard title="New Users %" value="85.3%" change="+3.2%" icon={Percent} />
        <KPICard title="Conversion Rate" value="6.7%" change="+0.8%" icon={MousePointer} />
        <KPICard title="Total Conversions" value="123" change="+11.8%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value="$12,300" change="+11.8%" icon={DollarSign} />
        <KPICard title="Cost per Conversion" value="$8.29" change="-$0.65" isPositive />
        <KPICard title="ROI" value="1,210%" change="+85%" icon={TrendingUp} />
        <KPICard title="Bounce Rate" value="45.2%" change="-1.8%" isPositive icon={Percent} />
        <KPICard title="Avg Session Duration" value="2:18" change="+0:15" icon={Clock} />
      </div>

      {/* Ads Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value="98.5K" change="+15.2%" icon={Eye} />
        <KPICard title="CTR" value="3.2%" change="+0.4%" icon={MousePointer} />
        <KPICard title="Ad Spend" value="$1,020" change="+5.0%" icon={DollarSign} />
        <KPICard title="CPC" value="$0.79" change="-$0.05" isPositive icon={Target} />
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
