/*
  # Create Executive Summary Metrics Tables

  1. New Tables
    - `executive_summary_metrics`
      - `id` (uuid, primary key)
      - `metric_type` (text) - Either 'date_range' or 'month_over_month'
      - `period_label` (text) - Label for the period (e.g., 'Last 365 Days', 'Current Month')
      - `total_users` (bigint) - Total users
      - `new_users` (bigint) - New users
      - `new_user_percent` (numeric) - Percentage of new users
      - `sessions` (bigint) - Total sessions
      - `avg_session_duration` (integer) - Average session duration in seconds
      - `page_views_per_session` (numeric) - Average page views per session
      - `bounce_rate` (numeric) - Bounce rate percentage
      - `conversions` (bigint) - Total conversions
      - `revenue` (numeric) - Total revenue
      - `change_vs_previous` (jsonb) - Changes vs previous period (for month_over_month)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `daily_bounce_rates`
      - `id` (uuid, primary key)
      - `day_of_month` (integer) - Day number (1-31)
      - `bounce_rate` (numeric) - Bounce rate percentage
      - `period_month` (date) - The month this data belongs to
      - `created_at` (timestamp)
    
    - `quarterly_revenue`
      - `id` (uuid, primary key)
      - `quarter_label` (text) - Quarter label (e.g., '2024-Q4', '2025-Q1')
      - `revenue` (numeric) - Revenue for the quarter
      - `year` (integer) - Year
      - `quarter` (integer) - Quarter number (1-4)
      - `created_at` (timestamp)
    
    - `monthly_revenue_ytd`
      - `id` (uuid, primary key)
      - `month_number` (integer) - Month number (1-12)
      - `month_label` (text) - Month label (e.g., '01', '02', etc.)
      - `revenue` (numeric) - Revenue for the month
      - `year` (integer) - Year
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (analytics data)
*/

CREATE TABLE IF NOT EXISTS executive_summary_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL CHECK (metric_type IN ('date_range', 'month_over_month')),
  period_label text NOT NULL,
  total_users bigint DEFAULT 0,
  new_users bigint DEFAULT 0,
  new_user_percent numeric(5,2) DEFAULT 0.00,
  sessions bigint DEFAULT 0,
  avg_session_duration integer DEFAULT 0,
  page_views_per_session numeric(4,2) DEFAULT 0.00,
  bounce_rate numeric(5,2) DEFAULT 0.00,
  conversions bigint DEFAULT 0,
  revenue numeric(12,2) DEFAULT 0.00,
  change_vs_previous jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_bounce_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_month integer NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  bounce_rate numeric(5,2) NOT NULL,
  period_month date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quarterly_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter_label text NOT NULL,
  revenue numeric(12,2) NOT NULL,
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(year, quarter)
);

CREATE TABLE IF NOT EXISTS monthly_revenue_ytd (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_number integer NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  month_label text NOT NULL,
  revenue numeric(12,2) NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(year, month_number)
);

ALTER TABLE executive_summary_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bounce_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_revenue_ytd ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view executive summary metrics"
  ON executive_summary_metrics FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert executive summary metrics"
  ON executive_summary_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update executive summary metrics"
  ON executive_summary_metrics FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete executive summary metrics"
  ON executive_summary_metrics FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view daily bounce rates"
  ON daily_bounce_rates FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert daily bounce rates"
  ON daily_bounce_rates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update daily bounce rates"
  ON daily_bounce_rates FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete daily bounce rates"
  ON daily_bounce_rates FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view quarterly revenue"
  ON quarterly_revenue FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert quarterly revenue"
  ON quarterly_revenue FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update quarterly revenue"
  ON quarterly_revenue FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete quarterly revenue"
  ON quarterly_revenue FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view monthly revenue ytd"
  ON monthly_revenue_ytd FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert monthly revenue ytd"
  ON monthly_revenue_ytd FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update monthly revenue ytd"
  ON monthly_revenue_ytd FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete monthly revenue ytd"
  ON monthly_revenue_ytd FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_executive_summary_metric_type ON executive_summary_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_daily_bounce_period ON daily_bounce_rates(period_month);
CREATE INDEX IF NOT EXISTS idx_quarterly_revenue_year_quarter ON quarterly_revenue(year, quarter);
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_year ON monthly_revenue_ytd(year, month_number);