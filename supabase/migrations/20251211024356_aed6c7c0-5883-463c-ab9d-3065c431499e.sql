-- Create table for marketing data from external sources
CREATE TABLE public.marketing_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- 'google_ads', 'linkedin_ads', 'linkedin_organic', 'marketing_cloud'
  metric_type TEXT NOT NULL, -- 'campaign', 'daily_summary', 'engagement', etc.
  data JSONB NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_marketing_data_source ON public.marketing_data(source);
CREATE INDEX idx_marketing_data_date ON public.marketing_data(date_range_start, date_range_end);
CREATE INDEX idx_marketing_data_synced ON public.marketing_data(synced_at DESC);

-- Enable RLS but allow public inserts via webhook (secured by API key)
ALTER TABLE public.marketing_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (dashboard is internal)
CREATE POLICY "Allow public read access" ON public.marketing_data FOR SELECT USING (true);

-- Create table to track sync history
CREATE TABLE public.sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error'
  records_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.sync_log FOR SELECT USING (true);