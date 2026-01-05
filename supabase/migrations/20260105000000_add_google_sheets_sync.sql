/*
  # Add Google Sheets Sync Support

  ## Changes
  1. Add unique constraint on marketing_data for upsert support
  2. Add google_sheets connection status entry
  3. Update connection_status to support upsert

  ## Notes
  - This migration enables the google-sheets-sync edge function
  - Data is synced from Google Sheets → marketing_data table
*/

-- Add unique constraint for upsert on source + metric_type
-- First, clean up any duplicate entries
DELETE FROM public.marketing_data a
USING public.marketing_data b
WHERE a.id > b.id
  AND a.source = b.source
  AND a.metric_type = b.metric_type;

-- Now add the unique constraint
ALTER TABLE public.marketing_data
ADD CONSTRAINT marketing_data_source_metric_unique
UNIQUE (source, metric_type);

-- Add unique constraint on connection_status.service_name for upsert
ALTER TABLE public.connection_status
ADD CONSTRAINT connection_status_service_name_unique
UNIQUE (service_name);

-- Insert initial Google Sheets connection status
INSERT INTO public.connection_status (service_name, status, metadata)
VALUES ('google_sheets', 'disconnected', '{"records_synced": 0}'::jsonb)
ON CONFLICT (service_name) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_marketing_data_source_metric
ON public.marketing_data(source, metric_type);
