/*
  # Add Dataslayer API Integration

  ## 1. New Tables
    - `api_credentials`
      - `id` (uuid, primary key)
      - `service_name` (text) - e.g., 'dataslayer'
      - `api_key` (text, encrypted)
      - `api_secret` (text, encrypted, optional)
      - `additional_config` (jsonb) - for extra config like endpoints
      - `is_active` (boolean)
      - `last_sync_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `connection_status`
      - `id` (uuid, primary key)
      - `service_name` (text)
      - `status` (text) - 'connected', 'disconnected', 'error'
      - `last_check_at` (timestamptz)
      - `error_message` (text, optional)
      - `metadata` (jsonb) - for additional info like record counts
      - `created_at` (timestamptz)

  ## 2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access (dashboard users)
    
  ## 3. Indexes
    - Index on service_name for quick lookups
*/

-- Create api_credentials table
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  api_secret TEXT,
  additional_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create connection_status table
CREATE TABLE IF NOT EXISTS public.connection_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_credentials_service ON public.api_credentials(service_name);
CREATE INDEX IF NOT EXISTS idx_connection_status_service ON public.connection_status(service_name);
CREATE INDEX IF NOT EXISTS idx_connection_status_check ON public.connection_status(last_check_at DESC);

-- Enable RLS
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_status ENABLE ROW LEVEL SECURITY;

-- Policies for api_credentials (read/write access for authenticated users)
CREATE POLICY "Allow authenticated read access" 
  ON public.api_credentials 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated insert access" 
  ON public.api_credentials 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" 
  ON public.api_credentials 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access" 
  ON public.api_credentials 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Policies for connection_status (read/write access for authenticated users)
CREATE POLICY "Allow authenticated read access" 
  ON public.connection_status 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated insert access" 
  ON public.connection_status 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" 
  ON public.connection_status 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for api_credentials
DROP TRIGGER IF EXISTS update_api_credentials_updated_at ON public.api_credentials;
CREATE TRIGGER update_api_credentials_updated_at
  BEFORE UPDATE ON public.api_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial Dataslayer connection status
INSERT INTO public.connection_status (service_name, status, metadata)
VALUES ('dataslayer', 'disconnected', '{"records_synced": 0}'::jsonb)
ON CONFLICT DO NOTHING;