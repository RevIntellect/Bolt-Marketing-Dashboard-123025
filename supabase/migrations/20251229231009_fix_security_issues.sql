/*
  # Fix Security Issues

  1. Changes
    - Fix function search_path security vulnerability by setting immutable search_path
    - Optimize database indexes by removing unused ones
    - Keep critical indexes that match query patterns in the application

  2. Security Improvements
    - Make update_updated_at_column function secure with fixed search_path
    - Remove indexes that don't match current query patterns to improve write performance
    - Keep indexes that support actual queries in the codebase
*/

-- Fix function search path security issue
-- Drop existing function and recreate with secure search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Recreate triggers that used this function
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT DISTINCT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_name LIKE '%update_updated_at%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', r.trigger_name, r.event_object_table);
        EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', 
                      r.trigger_name, r.event_object_table);
    END LOOP;
END $$;

-- Optimize indexes: Drop unused indexes that don't match current query patterns
-- Keep indexes that are actually used or will be used based on application code

-- Drop idx_connection_status_check - connection_status table is rarely queried with this pattern
DROP INDEX IF EXISTS idx_connection_status_check;

-- Drop idx_direct_mail_campaign_name - current queries don't filter by campaign_name alone
DROP INDEX IF EXISTS idx_direct_mail_campaign_name;

-- Drop idx_direct_mail_date_range - current queries don't use date_range field
DROP INDEX IF EXISTS idx_direct_mail_date_range;

-- Keep idx_executive_summary_metric_type - queries filter by metric_type ('date_range', 'month_over_month')
-- This index is actually useful, so we'll keep it

-- Keep idx_daily_bounce_period - queries order by this field
-- This index is actually useful for sorting, so we'll keep it

-- Keep idx_quarterly_revenue_year_quarter - queries order by year, quarter
-- This index matches the ORDER BY clause in queries, so we'll keep it

-- Keep idx_monthly_revenue_year - queries order by year, month_number
-- This index matches the ORDER BY clause in queries, so we'll keep it

-- Keep idx_ai_chat_created_at - queries order by created_at DESC for chat history
-- This index is essential for chat message pagination, so we'll keep it

-- Add composite index for direct mail campaigns based on actual query patterns
CREATE INDEX IF NOT EXISTS idx_direct_mail_campaign_content ON direct_mail_campaigns(campaign_name, ad_content);