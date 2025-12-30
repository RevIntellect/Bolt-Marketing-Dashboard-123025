import { useState } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { TrendingUp, Users, Target, Percent, ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AcquisitionDashboardProps {
  onBack: () => void;
}

const channelData = [
  { channel: "Organic Search", users: 85000, sessions: 125000 },
  { channel: "Paid Search", users: 42000, sessions: 68000 },
  { channel: "Social", users: 28000, sessions: 45000 },
  { channel: "Email", users: 35000, sessions: 52000 },
  { channel: "Direct", users: 22000, sessions: 35000 },
  { channel: "Referral", users: 15000, sessions: 25000 },
];

const sourceData = [
  { name: "Google", value: 45, color: "hsl(155, 70%, 45%)" },
  { name: "LinkedIn", value: 20, color: "hsl(220, 70%, 55%)" },
  { name: "Email", value: 18, color: "hsl(38, 90%, 55%)" },
  { name: "Direct", value: 12, color: "hsl(280, 65%, 55%)" },
  { name: "Other", value: 5, color: "hsl(0, 72%, 55%)" },
];

export function AcquisitionDashboard({ onBack }: AcquisitionDashboardProps) {
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
            <h1 className="text-2xl font-bold text-foreground">Acquisition Overview</h1>
            <p className="text-muted-foreground mt-1">How users find and reach your site</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Acquisitions" value="227K" change="+14.2%" icon={TrendingUp} />
        <KPICard title="New Users" value="168K" change="+16.8%" icon={Users} />
        <KPICard title="Conversion Rate" value="4.2%" change="+0.6%" icon={Target} />
        <KPICard title="Goal Completions" value="9.5K" change="+21.3%" icon={Percent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Users & Sessions by Channel">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelData} layout="vertical">
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
              />
              <Legend />
              <Bar dataKey="users" fill="hsl(155, 70%, 45%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="sessions" fill="hsl(220, 70%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Traffic Source Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
