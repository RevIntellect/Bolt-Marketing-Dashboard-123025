import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SheetData {
  range: string;
  values: string[][];
}

interface GA4TrafficRow {
  date: string;
  device_category: string;
  sessions: number;
  total_users: number;
  new_users: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  pages_per_session: number;
}

interface GA4ConversionsRow {
  date: string;
  channel: string;
  sessions: number;
  conversions: number;
  revenue: number;
  purchases: number;
}

interface SearchConsoleRow {
  date: string;
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GoogleAdsRow {
  date: string;
  campaign: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  conversion_rate: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
    const spreadsheetId = Deno.env.get("GOOGLE_SPREADSHEET_ID");

    if (!googleApiKey || !spreadsheetId) {
      return new Response(
        JSON.stringify({
          error: "Missing configuration",
          details: "GOOGLE_API_KEY and GOOGLE_SPREADSHEET_ID must be set"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch data from all sheets
    const sheetRanges = [
      "GA4_Traffic!A2:J",
      "GA4_Conversions!A2:G",
      "Search_Console!A2:H",
      "Google_Ads!A2:J",
      "LinkedIn_Ads!A2:I"
    ];

    const results: Record<string, any> = {};

    for (const range of sheetRanges) {
      const sheetName = range.split("!")[0];
      try {
        const data = await fetchSheetData(spreadsheetId, range, googleApiKey);
        results[sheetName] = await processSheetData(supabase, sheetName, data);
      } catch (error) {
        console.error(`Error processing ${sheetName}:`, error);
        results[sheetName] = { error: error.message };
      }
    }

    // Update connection status
    await supabase
      .from("connection_status")
      .upsert({
        service_name: "google_sheets",
        status: "connected",
        last_check_at: new Date().toISOString(),
        error_message: null,
        metadata: { last_sync: new Date().toISOString(), results }
      }, { onConflict: "service_name" });

    // Log sync
    await supabase.from("sync_log").insert({
      source: "google_sheets",
      status: "success",
      records_count: Object.values(results).reduce((sum: number, r: any) =>
        sum + (r.rowsProcessed || 0), 0
      )
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: "Sync failed", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function fetchSheetData(
  spreadsheetId: string,
  range: string,
  apiKey: string
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Sheets API error: ${error}`);
  }

  const data = await response.json();
  return data.values || [];
}

async function processSheetData(
  supabase: any,
  sheetName: string,
  rows: string[][]
): Promise<{ rowsProcessed: number; error?: string }> {
  if (!rows || rows.length === 0) {
    return { rowsProcessed: 0 };
  }

  // Skip instruction/comment rows
  const dataRows = rows.filter(row => row[0] && !row[0].startsWith("//"));

  switch (sheetName) {
    case "GA4_Traffic":
      return await processGA4Traffic(supabase, dataRows);
    case "GA4_Conversions":
      return await processGA4Conversions(supabase, dataRows);
    case "Search_Console":
      return await processSearchConsole(supabase, dataRows);
    case "Google_Ads":
      return await processGoogleAds(supabase, dataRows);
    case "LinkedIn_Ads":
      return await processLinkedInAds(supabase, dataRows);
    default:
      return { rowsProcessed: 0, error: "Unknown sheet" };
  }
}

async function processGA4Traffic(supabase: any, rows: string[][]): Promise<{ rowsProcessed: number }> {
  // Aggregate data for dashboard
  let totalSessions = 0;
  let totalUsers = 0;
  let totalNewUsers = 0;
  let totalPageViews = 0;
  let bounceRateSum = 0;
  let sessionDurationSum = 0;
  let dataPoints = 0;

  const deviceBreakdown: Record<string, number> = {};

  for (const row of rows) {
    const sessions = parseInt(row[2]) || 0;
    totalSessions += sessions;
    totalUsers += parseInt(row[3]) || 0;
    totalNewUsers += parseInt(row[4]) || 0;
    totalPageViews += parseInt(row[5]) || 0;
    bounceRateSum += parseFloat(row[6]) || 0;
    sessionDurationSum += parseFloat(row[7]) || 0;
    dataPoints++;

    // Track device breakdown
    const device = row[1] || "unknown";
    deviceBreakdown[device] = (deviceBreakdown[device] || 0) + sessions;
  }

  // Calculate totals for device percentages
  const totalDeviceSessions = Object.values(deviceBreakdown).reduce((a, b) => a + b, 0);
  const devicePercentages: Record<string, number> = {};
  for (const [device, sessions] of Object.entries(deviceBreakdown)) {
    devicePercentages[device] = totalDeviceSessions > 0
      ? Math.round((sessions / totalDeviceSessions) * 100)
      : 0;
  }

  // Update marketing_data table with aggregated GA4 traffic data
  const { error } = await supabase
    .from("marketing_data")
    .upsert({
      source: "ga4_traffic",
      metric_type: "aggregated",
      data: {
        sessions: totalSessions,
        users: totalUsers,
        newUsers: totalNewUsers,
        newUserPercent: totalUsers > 0 ? ((totalNewUsers / totalUsers) * 100).toFixed(1) : "0",
        pageViews: totalPageViews,
        bounceRate: dataPoints > 0 ? (bounceRateSum / dataPoints).toFixed(1) : "0",
        avgSessionDuration: dataPoints > 0 ? Math.round(sessionDurationSum / dataPoints) : 0,
        pagesPerSession: totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(2) : "0",
        deviceBreakdown: devicePercentages
      },
      date_range_start: rows[0]?.[0] || null,
      date_range_end: rows[rows.length - 1]?.[0] || null
    }, { onConflict: "source,metric_type" });

  if (error) console.error("GA4 Traffic upsert error:", error);

  return { rowsProcessed: rows.length };
}

async function processGA4Conversions(supabase: any, rows: string[][]): Promise<{ rowsProcessed: number }> {
  let totalConversions = 0;
  let totalRevenue = 0;
  let totalPurchases = 0;
  const channelBreakdown: Record<string, { sessions: number; conversions: number; revenue: number }> = {};

  for (const row of rows) {
    const channel = row[1] || "Direct";
    const sessions = parseInt(row[2]) || 0;
    const conversions = parseInt(row[3]) || 0;
    const revenue = parseFloat(row[4]) || 0;
    const purchases = parseInt(row[5]) || 0;

    totalConversions += conversions;
    totalRevenue += revenue;
    totalPurchases += purchases;

    if (!channelBreakdown[channel]) {
      channelBreakdown[channel] = { sessions: 0, conversions: 0, revenue: 0 };
    }
    channelBreakdown[channel].sessions += sessions;
    channelBreakdown[channel].conversions += conversions;
    channelBreakdown[channel].revenue += revenue;
  }

  const { error } = await supabase
    .from("marketing_data")
    .upsert({
      source: "ga4_conversions",
      metric_type: "aggregated",
      data: {
        conversions: totalConversions,
        revenue: totalRevenue,
        purchases: totalPurchases,
        channelBreakdown
      },
      date_range_start: rows[0]?.[0] || null,
      date_range_end: rows[rows.length - 1]?.[0] || null
    }, { onConflict: "source,metric_type" });

  if (error) console.error("GA4 Conversions upsert error:", error);

  return { rowsProcessed: rows.length };
}

async function processSearchConsole(supabase: any, rows: string[][]): Promise<{ rowsProcessed: number }> {
  let totalClicks = 0;
  let totalImpressions = 0;
  let positionSum = 0;
  const topQueries: { query: string; clicks: number; impressions: number; position: number }[] = [];
  const topPages: { page: string; clicks: number; impressions: number }[] = [];

  const queryMap: Record<string, { clicks: number; impressions: number; positionSum: number; count: number }> = {};
  const pageMap: Record<string, { clicks: number; impressions: number }> = {};

  for (const row of rows) {
    const clicks = parseInt(row[3]) || 0;
    const impressions = parseInt(row[4]) || 0;
    const position = parseFloat(row[6]) || 0;
    const query = row[1] || "";
    const page = row[2] || "";

    totalClicks += clicks;
    totalImpressions += impressions;
    positionSum += position;

    // Aggregate by query
    if (query) {
      if (!queryMap[query]) {
        queryMap[query] = { clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      }
      queryMap[query].clicks += clicks;
      queryMap[query].impressions += impressions;
      queryMap[query].positionSum += position;
      queryMap[query].count++;
    }

    // Aggregate by page
    if (page) {
      if (!pageMap[page]) {
        pageMap[page] = { clicks: 0, impressions: 0 };
      }
      pageMap[page].clicks += clicks;
      pageMap[page].impressions += impressions;
    }
  }

  // Get top 10 queries
  const sortedQueries = Object.entries(queryMap)
    .map(([query, data]) => ({
      query,
      clicks: data.clicks,
      impressions: data.impressions,
      position: data.count > 0 ? (data.positionSum / data.count).toFixed(1) : "0"
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Get top 10 pages
  const sortedPages = Object.entries(pageMap)
    .map(([page, data]) => ({
      page,
      clicks: data.clicks,
      impressions: data.impressions
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const { error } = await supabase
    .from("marketing_data")
    .upsert({
      source: "search_console",
      metric_type: "aggregated",
      data: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0",
        avgPosition: rows.length > 0 ? (positionSum / rows.length).toFixed(1) : "0",
        topQueries: sortedQueries,
        topPages: sortedPages
      },
      date_range_start: rows[0]?.[0] || null,
      date_range_end: rows[rows.length - 1]?.[0] || null
    }, { onConflict: "source,metric_type" });

  if (error) console.error("Search Console upsert error:", error);

  return { rowsProcessed: rows.length };
}

async function processGoogleAds(supabase: any, rows: string[][]): Promise<{ rowsProcessed: number }> {
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;
  let totalCost = 0;
  const campaignData: Record<string, { impressions: number; clicks: number; conversions: number; cost: number; revenue: number }> = {};

  for (const row of rows) {
    const campaign = row[1] || "Unknown";
    const impressions = parseInt(row[2]) || 0;
    const clicks = parseInt(row[3]) || 0;
    const conversions = parseInt(row[4]) || 0;
    const cost = parseFloat(row[5]) || 0;

    totalImpressions += impressions;
    totalClicks += clicks;
    totalConversions += conversions;
    totalCost += cost;

    if (!campaignData[campaign]) {
      campaignData[campaign] = { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 };
    }
    campaignData[campaign].impressions += impressions;
    campaignData[campaign].clicks += clicks;
    campaignData[campaign].conversions += conversions;
    campaignData[campaign].cost += cost;
  }

  const { error } = await supabase
    .from("marketing_data")
    .upsert({
      source: "google_ads",
      metric_type: "aggregated",
      data: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        cost: totalCost,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0",
        cpc: totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : "0",
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : "0",
        costPerConversion: totalConversions > 0 ? (totalCost / totalConversions).toFixed(2) : "0",
        campaigns: campaignData
      },
      date_range_start: rows[0]?.[0] || null,
      date_range_end: rows[rows.length - 1]?.[0] || null
    }, { onConflict: "source,metric_type" });

  if (error) console.error("Google Ads upsert error:", error);

  return { rowsProcessed: rows.length };
}

async function processLinkedInAds(supabase: any, rows: string[][]): Promise<{ rowsProcessed: number }> {
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;
  let totalSpend = 0;
  let totalLeads = 0;
  const campaignData: Record<string, { impressions: number; clicks: number; conversions: number; spend: number; leads: number }> = {};

  for (const row of rows) {
    const campaign = row[1] || "Unknown";
    const impressions = parseInt(row[2]) || 0;
    const clicks = parseInt(row[3]) || 0;
    const conversions = parseInt(row[4]) || 0;
    const spend = parseFloat(row[5]) || 0;
    const leads = parseInt(row[7]) || 0;

    totalImpressions += impressions;
    totalClicks += clicks;
    totalConversions += conversions;
    totalSpend += spend;
    totalLeads += leads;

    if (!campaignData[campaign]) {
      campaignData[campaign] = { impressions: 0, clicks: 0, conversions: 0, spend: 0, leads: 0 };
    }
    campaignData[campaign].impressions += impressions;
    campaignData[campaign].clicks += clicks;
    campaignData[campaign].conversions += conversions;
    campaignData[campaign].spend += spend;
    campaignData[campaign].leads += leads;
  }

  const { error } = await supabase
    .from("marketing_data")
    .upsert({
      source: "linkedin_ads",
      metric_type: "aggregated",
      data: {
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        spend: totalSpend,
        leads: totalLeads,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0",
        cpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0",
        costPerConversion: totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0",
        campaigns: campaignData
      },
      date_range_start: rows[0]?.[0] || null,
      date_range_end: rows[rows.length - 1]?.[0] || null
    }, { onConflict: "source,metric_type" });

  if (error) console.error("LinkedIn Ads upsert error:", error);

  return { rowsProcessed: rows.length };
}
