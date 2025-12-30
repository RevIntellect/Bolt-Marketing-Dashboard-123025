import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { DateRangePicker } from "./DateRangePicker";
import { Eye, Users, Percent, MousePointer, DollarSign, TrendingUp, Clock, Mail, Target, ArrowLeft, FileText, Heart } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DirectMailDashboardProps {
  onBack?: () => void;
}

interface DirectMailCampaign {
  id: string;
  campaign_name: string;
  ad_content: string;
  date_start: string;
  date_end: string;
  active_users: number;
  checkouts: number;
  transactions: number;
  exits: number;
  entrances: number;
  purchase_revenue: number;
  total_revenue: number;
  event_count: number;
  views_per_session: number;
}

export function DirectMailDashboard({ onBack }: DirectMailDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [campaigns, setCampaigns] = useState<DirectMailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('direct_mail_campaigns')
        .select('*')
        .order('ad_content', { ascending: true });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = campaigns.reduce(
    (acc, campaign) => ({
      active_users: acc.active_users + campaign.active_users,
      checkouts: acc.checkouts + campaign.checkouts,
      transactions: acc.transactions + campaign.transactions,
      exits: acc.exits + campaign.exits,
      entrances: acc.entrances + campaign.entrances,
      purchase_revenue: acc.purchase_revenue + campaign.purchase_revenue,
      total_revenue: acc.total_revenue + campaign.total_revenue,
      event_count: acc.event_count + campaign.event_count,
      views_per_session: campaigns.length > 0
        ? (acc.event_count + campaign.event_count) / (acc.active_users + campaign.active_users)
        : 0,
    }),
    {
      active_users: 0,
      checkouts: 0,
      transactions: 0,
      exits: 0,
      entrances: 0,
      purchase_revenue: 0,
      total_revenue: 0,
      event_count: 0,
      views_per_session: 0,
    }
  );

  const chartData = campaigns.map((c) => ({
    variant: c.ad_content,
    activeUsers: c.active_users,
    sessions: c.entrances,
    eventCount: c.event_count,
  }));

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
            <h1 className="text-2xl font-bold text-foreground">Direct Mail Campaign Performance</h1>
            <p className="text-muted-foreground mt-1">Refresh Your Fleet Postcard</p>
          </div>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Campaign Info */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Campaign Tracking</h3>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="bg-card px-2 py-1 rounded border border-border">
            Date Filter: <span className="text-foreground font-medium">Last 365 Days</span>
          </span>
          <span className="bg-card px-2 py-1 rounded border border-border">
            Session campaign: <span className="text-foreground font-medium">refresh_your_fleet</span>
          </span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard title="Active Users" value={totals.active_users.toString()} icon={Users} />
        <KPICard title="Sessions" value={totals.entrances.toString()} icon={Eye} />
        <KPICard title="Event Count" value={totals.event_count.toString()} icon={Target} />
        <KPICard title="Avg Views/Session" value={totals.views_per_session.toFixed(2)} icon={FileText} />
      </div>

      {/* Campaign Performance Section */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Refresh Your Fleet Postcard Campaign Performance</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading campaign data...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Session Campaign</TableHead>
                  <TableHead>Session Manual Ad Content</TableHead>
                  <TableHead className="text-right">Active Users</TableHead>
                  <TableHead className="text-right">Checkouts</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Exits</TableHead>
                  <TableHead className="text-right">Entrances</TableHead>
                  <TableHead className="text-right">Purchase Revenue</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Event Count</TableHead>
                  <TableHead className="text-right">Views per Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="font-semibold bg-muted/50">
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell className="text-right">{totals.active_users}</TableCell>
                  <TableCell className="text-right">{totals.checkouts}</TableCell>
                  <TableCell className="text-right">{totals.transactions}</TableCell>
                  <TableCell className="text-right">{totals.exits}</TableCell>
                  <TableCell className="text-right">{totals.entrances}</TableCell>
                  <TableCell className="text-right">${totals.purchase_revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${totals.total_revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{totals.event_count}</TableCell>
                  <TableCell className="text-right">{totals.views_per_session.toFixed(2)}</TableCell>
                </TableRow>
                {campaigns.map((campaign, index) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                    <TableCell>{campaign.ad_content}</TableCell>
                    <TableCell className="text-right">{campaign.active_users}</TableCell>
                    <TableCell className="text-right">{campaign.checkouts}</TableCell>
                    <TableCell className="text-right">{campaign.transactions}</TableCell>
                    <TableCell className="text-right">{campaign.exits}</TableCell>
                    <TableCell className="text-right">{campaign.entrances}</TableCell>
                    <TableCell className="text-right">${campaign.purchase_revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${campaign.total_revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{campaign.event_count}</TableCell>
                    <TableCell className="text-right">{campaign.views_per_session.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Active Users by Postcard</h4>
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{campaign.ad_content}</span>
                  <span className="text-sm font-medium text-foreground">
                    {campaign.active_users} ({((campaign.active_users / totals.active_users) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ChartCard title="Sessions by Postcard">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="variant" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="sessions" name="Sessions" fill="hsl(280, 65%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activeUsers" name="Active users" fill="hsl(200, 70%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="eventCount" name="Event count" fill="hsl(155, 70%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
