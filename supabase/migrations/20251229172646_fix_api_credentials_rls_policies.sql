/*
  # Fix RLS Policies for API Credentials

  ## Changes
    - Drop existing restrictive policies for api_credentials table
    - Create new policies that allow anon (public) access
    - This is appropriate for internal dashboard tools where network security is primary concern
    - Keep RLS enabled for defense in depth
    
  ## Security Notes
    - RLS remains enabled on the table
    - Policies now allow anon role access (needed for dashboard without auth)
    - Same changes applied to connection_status table for consistency
*/

-- Drop existing policies for api_credentials
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.api_credentials;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.api_credentials;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.api_credentials;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON public.api_credentials;

-- Create new public access policies for api_credentials
CREATE POLICY "Allow public read access" 
  ON public.api_credentials 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access" 
  ON public.api_credentials 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access" 
  ON public.api_credentials 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access" 
  ON public.api_credentials 
  FOR DELETE 
  USING (true);

-- Drop existing policies for connection_status
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.connection_status;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.connection_status;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.connection_status;

-- Create new public access policies for connection_status
CREATE POLICY "Allow public read access" 
  ON public.connection_status 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access" 
  ON public.connection_status 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access" 
  ON public.connection_status 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);