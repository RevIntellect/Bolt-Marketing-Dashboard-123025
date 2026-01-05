# Google Sheets Data Integration Setup Guide

This guide will help you set up a **free, reliable** data pipeline from your Google services to your marketing dashboard using Google Sheets as the central data hub.

## Overview

```
┌─────────────────┐     ┌──────────────┐     ┌──────────┐     ┌───────────┐
│ Google APIs     │ ──▶ │ Google Sheet │ ──▶ │ Supabase │ ──▶ │ Dashboard │
│ (GA4, GSC)      │     │ (Apps Script │     │ (Edge    │     │           │
│                 │     │  automation) │     │  Function)│    │           │
└─────────────────┘     └──────────────┘     └──────────┘     └───────────┘
```

**Cost: $0/month** - All components are free tier.

---

## Part 1: Create Your Google Sheet

### Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: `Marketing Dashboard Data`
4. **Copy the Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
   Save this ID - you'll need it later.

---

## Part 2: Set Up Google Apps Script

### Step 1: Open Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `scripts/GoogleAppsScript.js` from this repository
4. Paste it into the Apps Script editor

### Step 2: Configure Your Property IDs

Edit the `CONFIG` section at the top of the script:

```javascript
const CONFIG = {
  // Your GA4 Property ID (find in Admin > Property Settings)
  GA4_PROPERTY_ID: "properties/YOUR_GA4_PROPERTY_ID",

  // Your website URL for Search Console
  SEARCH_CONSOLE_SITE_URL: "https://www.yoursite.com",

  // ... rest of config
};
```

#### Finding Your GA4 Property ID:
1. Go to [Google Analytics](https://analytics.google.com)
2. Click **Admin** (gear icon)
3. Under **Property**, click **Property Settings**
4. Copy the **Property ID** (numbers only)
5. Format it as: `properties/XXXXXXXXX`

#### Finding Your Search Console Site URL:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Copy the exact URL as it appears (e.g., `https://www.yoursite.com` or `sc-domain:yoursite.com`)

### Step 3: Enable Required APIs

1. In Apps Script, click the **+** next to "Services" in the left sidebar
2. Add these services:
   - **Google Analytics Data API** (AnalyticsData)
   - **Search Console API** (SearchConsole)
3. Click **Add** for each

### Step 4: Run Initial Setup

1. Select the `setup` function from the dropdown menu
2. Click **Run**
3. When prompted, click **Review Permissions**
4. Sign in with **wolftoons@mac.com** (your Google account)
5. Click **Advanced** > **Go to Marketing Dashboard (unsafe)**
6. Click **Allow**

This creates all the required sheet tabs with proper headers.

### Step 5: Test the Connection

1. Select the `testConnections` function
2. Click **Run**
3. Check the **Execution log** (View > Execution log) for results
4. You should see:
   ```
   Testing GA4 connection...
   ✓ GA4 connection successful
   Testing Search Console connection...
   ✓ Search Console connection successful
   ```

### Step 6: Run Your First Sync

1. Select the `syncAllData` function
2. Click **Run**
3. Go back to your Google Sheet and verify data appears in the tabs

### Step 7: Set Up Daily Automation

1. Select the `createDailyTrigger` function
2. Click **Run**
3. This creates an automatic daily sync at 6 AM

You can verify the trigger:
1. Click the clock icon (Triggers) in the left sidebar
2. You should see a trigger for `syncAllData`

---

## Part 3: Google Ads Data (Manual or Scheduled Reports)

Google Ads requires a separate setup due to API restrictions. The easiest approach:

### Option A: Scheduled Email Reports (Recommended)

1. In Google Ads, go to **Reports**
2. Create a new report with these metrics:
   - Date
   - Campaign
   - Impressions
   - Clicks
   - Conversions
   - Cost
3. Click **Schedule** and set it to email you daily/weekly
4. Download and paste data into the `Google_Ads` sheet tab

### Option B: Use Google Ads Scripts

1. In Google Ads, go to **Tools & Settings > Bulk Actions > Scripts**
2. Create a new script that exports to your Google Sheet
3. Schedule it to run daily

The `Google_Ads` sheet tab expects this format:
| date | campaign | impressions | clicks | conversions | cost | ctr | cpc | conversion_rate | last_updated |

---

## Part 4: LinkedIn Ads Data (CSV Export)

LinkedIn doesn't offer free API access, so use CSV exports:

### Weekly Export Process (5 minutes)

1. Go to [LinkedIn Campaign Manager](https://www.linkedin.com/campaignmanager/)
2. Select your account
3. Click **Export** > **Download report**
4. Choose last 7 days
5. Open the CSV and copy the data
6. Paste into the `LinkedIn_Ads` sheet tab

The `LinkedIn_Ads` sheet tab expects this format:
| date | campaign | impressions | clicks | conversions | spend | ctr | leads | last_updated |

---

## Part 5: Connect Your Dashboard to Google Sheets

### Step 1: Get a Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > API Key**
5. Copy the API key
6. (Optional but recommended) Click **Edit** and restrict the key to:
   - **Google Sheets API** only
   - Your application's domain

### Step 2: Make Your Sheet Publicly Readable

1. In your Google Sheet, click **Share**
2. Change access to **Anyone with the link** can **view**
3. Click **Done**

**Why?** The API key approach requires public read access. Your data is read-only and the URL is not discoverable.

### Step 3: Configure Supabase Environment Variables

In your Supabase dashboard:

1. Go to **Project Settings > Edge Functions**
2. Add these secrets:
   ```
   GOOGLE_API_KEY=your_api_key_here
   GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
   ```

### Step 4: Deploy the Sync Function

```bash
# From the project root
supabase functions deploy google-sheets-sync
```

### Step 5: Test the Sync

```bash
curl -X POST https://[your-project].supabase.co/functions/v1/google-sheets-sync
```

### Step 6: Set Up Scheduled Sync (Optional)

Use Supabase's cron extension or an external scheduler to call the sync function daily:

```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'daily-sheets-sync',
  '0 7 * * *', -- 7 AM daily
  $$
  SELECT net.http_post(
    url:='https://[your-project].supabase.co/functions/v1/google-sheets-sync',
    headers:='{"Authorization": "Bearer [your-service-role-key]"}'::jsonb
  );
  $$
);
```

---

## Verification Checklist

- [ ] Google Sheet created with all tabs
- [ ] GA4 Property ID configured correctly
- [ ] Search Console site URL configured correctly
- [ ] APIs enabled in Apps Script
- [ ] `setup()` function ran successfully
- [ ] `testConnections()` shows both connections successful
- [ ] `syncAllData()` populates data in sheets
- [ ] Daily trigger created
- [ ] Google API key created
- [ ] Sheet shared as "Anyone with link can view"
- [ ] Supabase environment variables set
- [ ] Edge function deployed
- [ ] Dashboard shows "● Live" indicator

---

## Troubleshooting

### "GA4 connection failed"
- Verify your GA4 Property ID format: `properties/XXXXXXXXX`
- Ensure you're using the correct Google account
- Check that the account has access to the GA4 property

### "Search Console connection failed"
- Verify the exact site URL format
- For domain properties, use `sc-domain:yoursite.com`
- Ensure the account has access to the property

### "No data appearing in sheets"
- Check the Execution log for errors
- Verify APIs are enabled in Apps Script
- Some APIs have a 24-48 hour delay for data

### "Dashboard shows Sample Data"
- Run the Google Sheets sync function
- Check Supabase logs for errors
- Verify environment variables are set correctly

---

## Data Flow Summary

| Data Source | Collection Method | Frequency |
|-------------|-------------------|-----------|
| GA4 Traffic | Apps Script (automatic) | Daily |
| GA4 Conversions | Apps Script (automatic) | Daily |
| Search Console | Apps Script (automatic) | Daily (3-day delay) |
| Google Ads | Manual CSV or scheduled reports | Weekly |
| LinkedIn Ads | Manual CSV export | Weekly |

---

## Maintenance

### Weekly (5 minutes)
- Update Google Ads data (if using manual exports)
- Update LinkedIn Ads data

### Monthly
- Review sync logs in the `Sync_Log` sheet tab
- Check for any API errors

### If Things Break
1. Check the Apps Script execution log
2. Re-run `testConnections()` to verify API access
3. Check Supabase function logs
4. Verify sheet sharing settings haven't changed

---

## Cost Summary

| Component | Cost |
|-----------|------|
| Google Sheets | Free |
| Google Apps Script | Free |
| GA4 API | Free |
| Search Console API | Free |
| Google Sheets API | Free |
| Supabase (free tier) | Free |
| **Total** | **$0/month** |

---

*Last Updated: January 2026*
