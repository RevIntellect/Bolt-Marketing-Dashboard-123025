/*
  # Create Direct Mail Campaign Metrics Table

  1. New Tables
    - `direct_mail_campaigns`
      - `id` (uuid, primary key)
      - `campaign_name` (text) - The campaign identifier (e.g., refresh_your_fleet)
      - `ad_content` (text) - The postcard variant (e.g., postcardA, postcardB)
      - `date_start` (date) - Campaign start date
      - `date_end` (date) - Campaign end date
      - `active_users` (integer) - Number of active users
      - `checkouts` (integer) - Number of checkouts
      - `transactions` (integer) - Number of transactions
      - `exits` (integer) - Number of exits
      - `entrances` (integer) - Number of entrances
      - `purchase_revenue` (numeric) - Purchase revenue amount
      - `total_revenue` (numeric) - Total revenue amount
      - `event_count` (integer) - Total event count
      - `views_per_session` (numeric) - Average views per session
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `direct_mail_campaigns` table
    - Add policies for public read access (since this is analytics data)
*/

CREATE TABLE IF NOT EXISTS direct_mail_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  ad_content text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  active_users integer DEFAULT 0,
  checkouts integer DEFAULT 0,
  transactions integer DEFAULT 0,
  exits integer DEFAULT 0,
  entrances integer DEFAULT 0,
  purchase_revenue numeric(10,2) DEFAULT 0.00,
  total_revenue numeric(10,2) DEFAULT 0.00,
  event_count integer DEFAULT 0,
  views_per_session numeric(4,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE direct_mail_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view direct mail campaigns"
  ON direct_mail_campaigns FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert direct mail campaigns"
  ON direct_mail_campaigns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update direct mail campaigns"
  ON direct_mail_campaigns FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete direct mail campaigns"
  ON direct_mail_campaigns FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_direct_mail_campaign_name ON direct_mail_campaigns(campaign_name);
CREATE INDEX IF NOT EXISTS idx_direct_mail_date_range ON direct_mail_campaigns(date_start, date_end);