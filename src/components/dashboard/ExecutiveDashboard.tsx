import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { DollarSign, Users, TrendingUp, Percent, Clock, FileText, MousePointer, Eye, ArrowLeft } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExecutiveDashboardProps {
  onBack?: () => void;
}

interface ExecutiveSummaryMetric {
  id: string;
  metric_type: string;
  period_label: string;
  total_users: number;
  new_users: number;
  new_user_percent: number;
  sessions: number;
  avg_session_duration: number;
  page_views_per_session: number;
  bounce_rate: number;
  conversions: number;
  revenue: number;
  change_vs_previous?: {
    total_users?: number;
    new_users?: number;
    new_user_percent?: number;
    sessions?: number;
    avg_session_duration?: number;
    page_views_per_session?: number;
    bounce_rate?: number;
    conversions?: number;
    revenue?: number;
  };
}

interface DailyBounceRate {
  day_of_month: number;
  bounce_rate: number;
}

interface QuarterlyRevenue {
  quarter_label: string;
  revenue: number;
}

interface MonthlyRevenue {
  month_label: string;
  revenue: number;
}

export function ExecutiveDashboard({ onBack }: ExecutiveDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(true);
  const [dateRangeMetrics, setDateRangeMetrics] = useState<ExecutiveSummaryMetric | null>(null);
  const [monthOverMonthMetrics, setMonthOverMonthMetrics] = useState<ExecutiveSummaryMetric | null>(null);
  const [dailyBounceRates, setDailyBounceRates] = useState<DailyBounceRate[]>([]);
  const [quarterlyRevenue, setQuarterlyRevenue] = useState<QuarterlyRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);

  useEffect(() => {
    fetchExecutiveSummaryData();
  }, []);

  const fetchExecutiveSummaryData = async () => {
    try {
      const [metricsResult, bounceResult, quarterlyResult, monthlyResult] = await Promise.all([
        supabase.from('executive_summary_metrics').select('*'),
        supabase.from('daily_bounce_rates').select('*').order('day_of_month', { ascending: true }),
        supabase.from('quarterly_revenue').select('*').order('year, quarter', { ascending: true }),
        supabase.from('monthly_revenue_ytd').select('*').order('month_number', { ascending: true }),
      ]);

      if (metricsResult.data) {
        setDateRangeMetrics(metricsResult.data.find(m => m.metric_type === 'date_range') || null);
        setMonthOverMonthMetrics(metricsResult.data.find(m => m.metric_type === 'month_over_month') || null);
      }
      if (bounceResult.data) setDailyBounceRates(bounceResult.data);
      if (quarterlyResult.data) setQuarterlyRevenue(quarterlyResult.data);
      if (monthlyResult.data) setMonthlyRevenue(monthlyResult.data);
    } catch (error) {
      console.error('Error fetching executive summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatChange = (value: number | undefined): string => {
    if (!value) return '';
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };

  const bounceRateChartData = dailyBounceRates.map(d => ({
    day: d.day_of_month.toString().padStart(2, '0'),
    rate: d.bounce_rate,
  }));

  const quarterlyRevenueChartData = quarterlyRevenue.map(q => ({
    quarter: q.quarter_label,
    revenue: q.revenue,
  }));

  const monthlyRevenueChartData = monthlyRevenue.map(m => ({
    month: m.month_label,
    revenue: m.revenue,
  }));

  const ytdRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);

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
            <h1 className="text-2xl font-bold text-foreground">Executive Summary</h1>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading executive summary...</div>
      ) : (
        <>
          {dateRangeMetrics && (
            <>
              <div className="bg-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Date Range Performance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
                  <KPICard title="Total Users" value={formatNumber(dateRangeMetrics.total_users)} icon={Users} />
                  <KPICard title="New Users" value={formatNumber(dateRangeMetrics.new_users)} icon={Users} />
                  <KPICard title="New User %" value={`${dateRangeMetrics.new_user_percent}%`} icon={Percent} />
                  <KPICard title="Sessions" value={formatNumber(dateRangeMetrics.sessions)} icon={Eye} />
                  <KPICard title="Avg Session Duration" value={dateRangeMetrics.avg_session_duration.toString()} icon={Clock} />
                  <KPICard title="Page Views Per Session" value={dateRangeMetrics.page_views_per_session.toFixed(2)} icon={FileText} />
                  <div className="space-y-2">
                    <KPICard title="Bounce Rate" value={`${dateRangeMetrics.bounce_rate}%`} icon={TrendingUp} />
                    <div className="text-xs text-muted-foreground text-center">Bounce Rate: 25%</div>
                  </div>
                  <KPICard title="Conversions" value={formatNumber(dateRangeMetrics.conversions)} icon={MousePointer} />
                  <KPICard title="Revenue" value={formatCurrency(dateRangeMetrics.revenue)} icon={DollarSign} />
                </div>
              </div>
            </>
          )}

          {monthOverMonthMetrics && (
            <>
              <div className="bg-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Month over Month Performance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
                  <KPICard
                    title="Total Users"
                    value={formatNumber(monthOverMonthMetrics.total_users)}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.total_users)}
                    icon={Users}
                  />
                  <KPICard
                    title="New Users"
                    value={formatNumber(monthOverMonthMetrics.new_users)}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.new_users)}
                    icon={Users}
                  />
                  <KPICard
                    title="New User %"
                    value={`${monthOverMonthMetrics.new_user_percent}%`}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.new_user_percent)}
                    icon={Percent}
                  />
                  <KPICard
                    title="Sessions"
                    value={formatNumber(monthOverMonthMetrics.sessions)}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.sessions)}
                    icon={Eye}
                  />
                  <KPICard
                    title="Avg Session Duration"
                    value={monthOverMonthMetrics.avg_session_duration.toString()}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.avg_session_duration)}
                    icon={Clock}
                  />
                  <KPICard
                    title="Page Views Per Session"
                    value={monthOverMonthMetrics.page_views_per_session.toFixed(2)}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.page_views_per_session)}
                    icon={FileText}
                  />
                  <KPICard
                    title="Bounce Rate"
                    value={`${monthOverMonthMetrics.bounce_rate}%`}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.bounce_rate)}
                    isPositive={monthOverMonthMetrics.change_vs_previous?.bounce_rate ? monthOverMonthMetrics.change_vs_previous.bounce_rate < 0 : undefined}
                    icon={TrendingUp}
                  />
                  <KPICard
                    title="Conversions"
                    value={formatNumber(monthOverMonthMetrics.conversions)}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.conversions)}
                    icon={MousePointer}
                  />
                  <KPICard
                    title="Revenue"
                    value={formatCurrency(monthOverMonthMetrics.revenue)}
                    change={formatChange(monthOverMonthMetrics.change_vs_previous?.revenue)}
                    icon={DollarSign}
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Quarterly Revenue Growth">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={quarterlyRevenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`$${(value as number).toLocaleString()}`, "Total revenue"]}
                  />
                  <Bar dataKey="revenue" name="Total revenue" fill="hsl(155, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Key Business Metrics</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Quarter</TableHead>
                      <TableHead className="text-right">Total revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quarterlyRevenue.map((q) => (
                      <TableRow key={q.quarter_label}>
                        <TableCell className="font-medium">{q.quarter_label}</TableCell>
                        <TableCell className="text-right">${q.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ChartCard>

            <ChartCard title="Bounce rate">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bounceRateChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 150]} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value}%`, "Bounce rate"]}
                  />
                  <Bar dataKey="rate" name="Bounce rate" fill="hsl(0, 72%, 60%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Revenue">
              <div className="mb-4">
                <div className="text-sm text-muted-foreground">YTD</div>
                <div className="text-4xl font-bold text-foreground">{formatCurrency(ytdRevenue)}</div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyRevenueChartData}>
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
                    formatter={(value) => [`$${(value as number).toLocaleString()}`, "Total revenue"]}
                  />
                  <Bar dataKey="revenue" name="Total revenue" fill="hsl(280, 65%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Source</h3>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="w-48 h-24 mx-auto" viewBox="0 0 272 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="136" y="46" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'Product Sans, Arial' }}>Google</text>
                    <text x="136" y="76" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: '28px', fontFamily: 'Product Sans, Arial' }}>Analytics</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
