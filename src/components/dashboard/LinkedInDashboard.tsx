import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Heart, Share2, UserPlus, ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LinkedInDashboardProps {
  onBack?: () => void;
}

const weeklyEngagementData = [
  { day: "Mon", engagement: 8500 },
  { day: "Tue", engagement: 9200 },
  { day: "Wed", engagement: 10800 },
  { day: "Thu", engagement: 9500 },
  { day: "Fri", engagement: 7200 },
];

const postTypeData = [
  { type: "Video", engagement: 920 },
  { type: "Carousel", engagement: 680 },
  { type: "Image", engagement: 450 },
  { type: "Article", engagement: 225 },
];

export function LinkedInDashboard({ onBack }: LinkedInDashboardProps) {
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
            <h1 className="text-2xl font-bold text-foreground">LinkedIn Organic</h1>
            <p className="text-muted-foreground mt-1">Organic social performance metrics</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Universal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Sessions / Visits" value="2,840" change="+12.3%" icon={Eye} />
        <KPICard title="Users" value="2,450" change="+11.8%" icon={Users} />
        <KPICard title="New Users %" value="72.5%" change="+2.3%" icon={Percent} />
        <KPICard title="Conversion Rate" value="2.8%" change="+0.3%" icon={MousePointer} />
        <KPICard title="Total Conversions" value="80" change="+14.3%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KPICard title="Revenue Generated" value="$4,000" change="+14.3%" icon={DollarSign} />
        <KPICard title="Cost per Conversion" value="$0.00" change="Organic" />
        <KPICard title="ROI" value="∞" change="Organic" icon={TrendingUp} />
        <KPICard title="Engagement Rate" value="4.6%" change="+0.8%" icon={Heart} />
        <KPICard title="Avg Session Duration" value="1:52" change="+0:08" icon={Clock} />
      </div>

      {/* LinkedIn-Specific Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Impressions" value="49.1K" change="+18.3%" icon={Eye} />
        <KPICard title="Engagement" value="2,275" change="+24.1%" icon={Heart} />
        <KPICard title="Followers" value="12.8K" change="+156" icon={UserPlus} />
        <KPICard title="Shares" value="342" change="+12" icon={Share2} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Engagement">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="engagement" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Post Type Performance">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={postTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="type" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="engagement" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
