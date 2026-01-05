import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketingDataRow {
  id: string;
  source: string;
  metric_type: string;
  data: Record<string, any>;
  date_range_start: string | null;
  date_range_end: string | null;
  synced_at: string;
}

export interface GA4TrafficData {
  sessions: number;
  users: number;
  newUsers: number;
  newUserPercent: string;
  pageViews: number;
  bounceRate: string;
  avgSessionDuration: number;
  pagesPerSession: string;
  deviceBreakdown: Record<string, number>;
}

export interface GA4ConversionsData {
  conversions: number;
  revenue: number;
  purchases: number;
  channelBreakdown: Record<string, { sessions: number; conversions: number; revenue: number }>;
}

export interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: string;
  avgPosition: string;
  topQueries: { query: string; clicks: number; impressions: number; position: string }[];
  topPages: { page: string; clicks: number; impressions: number }[];
}

export interface GoogleAdsData {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: string;
  cpc: string;
  conversionRate: string;
  costPerConversion: string;
  campaigns: Record<string, { impressions: number; clicks: number; conversions: number; cost: number }>;
}

export interface LinkedInAdsData {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  leads: number;
  ctr: string;
  cpc: string;
  costPerConversion: string;
  campaigns: Record<string, { impressions: number; clicks: number; conversions: number; spend: number; leads: number }>;
}

async function fetchMarketingData(source: string): Promise<MarketingDataRow | null> {
  const { data, error } = await supabase
    .from("marketing_data")
    .select("*")
    .eq("source", source)
    .eq("metric_type", "aggregated")
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching ${source} data:`, error);
    return null;
  }

  return data;
}

export function useGA4Traffic() {
  return useQuery({
    queryKey: ["marketing-data", "ga4_traffic"],
    queryFn: async () => {
      const row = await fetchMarketingData("ga4_traffic");
      if (!row) return null;
      return row.data as GA4TrafficData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useGA4Conversions() {
  return useQuery({
    queryKey: ["marketing-data", "ga4_conversions"],
    queryFn: async () => {
      const row = await fetchMarketingData("ga4_conversions");
      if (!row) return null;
      return row.data as GA4ConversionsData;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useSearchConsole() {
  return useQuery({
    queryKey: ["marketing-data", "search_console"],
    queryFn: async () => {
      const row = await fetchMarketingData("search_console");
      if (!row) return null;
      return row.data as SearchConsoleData;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useGoogleAds() {
  return useQuery({
    queryKey: ["marketing-data", "google_ads"],
    queryFn: async () => {
      const row = await fetchMarketingData("google_ads");
      if (!row) return null;
      return row.data as GoogleAdsData;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useLinkedInAds() {
  return useQuery({
    queryKey: ["marketing-data", "linkedin_ads"],
    queryFn: async () => {
      const row = await fetchMarketingData("linkedin_ads");
      if (!row) return null;
      return row.data as LinkedInAdsData;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Combined hook for all marketing data
export function useAllMarketingData() {
  const ga4Traffic = useGA4Traffic();
  const ga4Conversions = useGA4Conversions();
  const searchConsole = useSearchConsole();
  const googleAds = useGoogleAds();
  const linkedInAds = useLinkedInAds();

  return {
    ga4Traffic,
    ga4Conversions,
    searchConsole,
    googleAds,
    linkedInAds,
    isLoading:
      ga4Traffic.isLoading ||
      ga4Conversions.isLoading ||
      searchConsole.isLoading ||
      googleAds.isLoading ||
      linkedInAds.isLoading,
    hasData:
      ga4Traffic.data ||
      ga4Conversions.data ||
      searchConsole.data ||
      googleAds.data ||
      linkedInAds.data,
  };
}
