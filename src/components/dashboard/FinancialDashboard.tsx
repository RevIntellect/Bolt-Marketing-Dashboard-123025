import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { DollarSign, TrendingUp, Percent, Target, ArrowLeft } from "lucide-react";
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
  Area,
} from "recharts";

interface FinancialDashboardProps {
  onBack: () => void;
}

const revenueData = [
  { month: "Jan", revenue: 85000, cost: 32000, profit: 53000 },
  { month: "Feb", revenue: 92000, cost: 35000, profit: 57000 },
  { month: "Mar", revenue: 105000, cost: 38000, profit: 67000 },
  { month: "Apr", revenue: 98000, cost: 36000, profit: 62000 },
  { month: "May", revenue: 118000, cost: 42000, profit: 76000 },
  { month: "Jun", revenue: 135000, cost: 48000, profit: 87000 },
];

const roiData = [
  { channel: "Email", roi: 4200, spend: 15000 },
  { channel: "Google Ads", roi: 320, spend: 45000 },
  { channel: "LinkedIn Ads", roi: 280, spend: 35000 },
  { channel: "Direct Mail", roi: 150, spend: 25000 },
  { channel: "SEO", roi: 850, spend: 12000 },
];

export function FinancialDashboard({ onBack }: FinancialDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
            <p className="text-muted-foreground mt-1">Revenue, costs, and ROI metrics</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value="$633K" change="+18.5%" icon={DollarSign} />
        <KPICard title="Marketing Spend" value="$132K" change="+8.2%" icon={TrendingUp} />
        <KPICard title="Net Profit" value="$402K" change="+22.1%" icon={Percent} />
        <KPICard title="Overall ROI" value="379%" change="+45pp" icon={Target} />
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
