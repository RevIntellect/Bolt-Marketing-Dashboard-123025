import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Eye, Users, Percent, MousePointer, TrendingUp, Clock, Search, FileText, Target, ArrowLeft } from "lucide-react";
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

const organicTrendData = [
  { month: "Jan", clicks: 10200, impressions: 145000, sessions: 9800 },
  { month: "Feb", clicks: 10800, impressions: 152000, sessions: 10200 },
  { month: "Mar", clicks: 11200, impressions: 158000, sessions: 10600 },
  { month: "Apr", clicks: 11600, impressions: 162000, sessions: 10900 },
  { month: "May", clicks: 12000, impressions: 165000, sessions: 11000 },
  { month: "Jun", clicks: 12300, impressions: 168000, sessions: 11200 },
];

const topPagesData = [
  { page: "/product", traffic: 2800, conversions: 145 },
  { page: "/enterprise", traffic: 2200, conversions: 120 },
  { page: "/pricing", traffic: 1800, conversions: 95 },
  { page: "/features", traffic: 1500, conversions: 75 },
  { page: "/integration", traffic: 1200, conversions: 59 },
];

const keywordRankingsData = [
  { keyword: "enterprise software", position: 3, volume: 8500 },
  { keyword: "business solutions", position: 5, volume: 6200 },
  { keyword: "cloud integration", position: 7, volume: 4800 },
];

export function SEODashboard({ onBack }: SEODashboardProps) {
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
            <h1 className="text-2xl font-bold text-foreground">Google Search Console</h1>
            <p className="text-muted-foreground mt-1">Organic search performance metrics</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Universal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Sessions / Visits" value="11.2K" change="+6.7%" icon={Eye} />
        <KPICard title="Users" value="9,450" change="+6.3%" icon={Users} />
        <KPICard title="New Users %" value="62.8%" change="+1.2%" icon={Percent} />
        <KPICard title="Conversion Rate" value="4.4%" change="+0.4%" icon={MousePointer} />
        <KPICard title="Total Conversions" value="494" change="+7.8%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value="$24.7K" change="+7.8%" icon={TrendingUp} />
        <KPICard title="Cost per Conversion" value="$0.00" change="Organic" />
        <KPICard title="ROI" value="∞" change="Organic" icon={TrendingUp} />
        <KPICard title="Bounce Rate" value="40.5%" change="-2.8%" isPositive icon={Percent} />
        <KPICard title="Avg Session Duration" value="3:15" change="+0:18" icon={Clock} />
      </div>

      {/* SEO Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Organic Clicks" value="12.3K" change="+6.6%" icon={MousePointer} />
        <KPICard title="Impressions" value="168K" change="+6.3%" icon={Eye} />
        <KPICard title="Avg. CTR" value="7.3%" change="+0.2%" icon={Percent} />
        <KPICard title="Avg. Position" value="5.6" change="-0.8" isPositive icon={Target} />
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
