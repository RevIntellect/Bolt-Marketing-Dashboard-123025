import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MarketingDataRecord {
  id: string;
  source: string;
  metric_type: string;
  data: Record<string, any>;
  date_range_start: string | null;
  date_range_end: string | null;
  synced_at: string;
  created_at: string;
}

interface UseMarketingDataOptions {
  source: string;
  metricType?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

interface UseMarketingDataResult {
  data: MarketingDataRecord[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMarketingData({
  source,
  metricType,
  dateRangeStart,
  dateRangeEnd,
}: UseMarketingDataOptions): UseMarketingDataResult {
  const [data, setData] = useState<MarketingDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("marketing_data")
        .select("*")
        .eq("source", source)
        .order("synced_at", { ascending: false });

      if (metricType) {
        query = query.eq("metric_type", metricType);
      }

      if (dateRangeStart) {
        query = query.gte("date_range_start", dateRangeStart);
      }

      if (dateRangeEnd) {
        query = query.lte("date_range_end", dateRangeEnd);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Type assertion since we know the structure
      setData((result || []) as MarketingDataRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch marketing data"));
      console.error(`Error fetching ${source} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [source, metricType, dateRangeStart, dateRangeEnd]);

  return { data, loading, error, refetch: fetchData };
}

// Helper function to aggregate data by a field
export function aggregateByField<T extends Record<string, any>>(
  records: MarketingDataRecord[],
  field: string,
  aggregations: { [key: string]: "sum" | "avg" | "count" | "last" }
): T[] {
  const grouped: { [key: string]: any[] } = {};

  records.forEach((record) => {
    const key = record.data[field];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(record.data);
  });

  return Object.entries(grouped).map(([key, items]) => {
    const result: any = { [field]: key };

    Object.entries(aggregations).forEach(([aggField, aggType]) => {
      if (aggType === "sum") {
        result[aggField] = items.reduce((sum, item) => sum + (item[aggField] || 0), 0);
      } else if (aggType === "avg") {
        const sum = items.reduce((sum, item) => sum + (item[aggField] || 0), 0);
        result[aggField] = items.length > 0 ? sum / items.length : 0;
      } else if (aggType === "count") {
        result[aggField] = items.length;
      } else if (aggType === "last") {
        result[aggField] = items[items.length - 1]?.[aggField] || 0;
      }
    });

    return result as T;
  });
}

// Helper to compute totals from records
export function computeTotals(
  records: MarketingDataRecord[],
  fields: string[]
): Record<string, number> {
  const totals: Record<string, number> = {};

  fields.forEach((field) => {
    totals[field] = records.reduce((sum, record) => sum + (record.data[field] || 0), 0);
  });

  return totals;
}

// Helper to get the latest record for each unique value of a field
export function getLatestByField(
  records: MarketingDataRecord[],
  field: string
): MarketingDataRecord[] {
  const latest: { [key: string]: MarketingDataRecord } = {};

  records.forEach((record) => {
    const key = record.data[field];
    if (!latest[key] || new Date(record.synced_at) > new Date(latest[key].synced_at)) {
      latest[key] = record;
    }
  });

  return Object.values(latest);
}
