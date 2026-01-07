# Marketing Dashboard Data Schema

This document outlines the data columns, metrics, dimensions, and recommended integration methods for each marketing tool/dashboard.

---

## Table of Contents
1. [Data Storage Overview](#data-storage-overview)
2. [Google Ads](#google-ads)
3. [LinkedIn Ads](#linkedin-ads)
4. [LinkedIn Organic](#linkedin-organic)
5. [Google Search Console (SEO)](#google-search-console-seo)
6. [Website Traffic (GA4)](#website-traffic-ga4)
7. [Marketing Cloud (Salesforce)](#marketing-cloud-salesforce)
8. [Acquisition](#acquisition)
9. [Financial](#financial)
10. [Integration Recommendations](#integration-recommendations)

---

## Data Storage Overview

All marketing data is stored in the `marketing_data` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `source` | VARCHAR | Data source identifier (e.g., "google_ads", "linkedin_ads") |
| `metric_type` | VARCHAR | Type of metric (e.g., "kpi_summary", "campaign_performance") |
| `data` | JSONB | Flexible JSON object containing the actual metrics |
| `date_range_start` | DATE | Start of the reporting period |
| `date_range_end` | DATE | End of the reporting period |
| `synced_at` | TIMESTAMP | When the data was synced |
| `created_at` | TIMESTAMP | Record creation time |

---

## Google Ads

**Source:** `google_ads`
**Best Integration:** API (via Dataslayer or Google Ads API)

### Metric Types

#### 1. KPI Summary (`kpi_summary`)
Universal KPIs combined with Google Ads-specific metrics.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessions` | INTEGER | Total sessions from ads | 9420 |
| `users` | INTEGER | Total users | 7850 |
| `new_users_percent` | DECIMAL | % of new users | 78.5 |
| `conversion_rate` | DECIMAL | Conversion rate % | 4.2 |
| `conversions` | INTEGER | Total conversions | 396 |
| `revenue` | DECIMAL | Revenue generated | 70000.00 |
| `cost_per_conversion` | DECIMAL | Cost per conversion | 51.19 |
| `roi` | DECIMAL | Return on investment % | 345 |
| `bounce_rate` | DECIMAL | Bounce rate % | 48.3 |
| `avg_session_duration` | VARCHAR | Average session time | "2:05" |
| `impressions` | INTEGER | Total impressions | 248000 |
| `ctr` | DECIMAL | Click-through rate % | 3.8 |
| `cpc` | DECIMAL | Cost per click | 2.15 |
| `quality_score` | DECIMAL | Quality score (0-10) | 7.8 |
| `sessions_change` | VARCHAR | Period change | "+6.8%" |
| `users_change` | VARCHAR | Period change | "+6.2%" |
| `impressions_change` | VARCHAR | Period change | "+14.2%" |
| `ctr_change` | VARCHAR | Period change | "+0.3%" |
| `cpc_change` | VARCHAR | Period change | "-$0.12" |
| `quality_score_change` | VARCHAR | Period change | "+0.4" |

#### 2. Campaign Performance (`campaign_performance`)
Per-campaign metrics.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `campaign_name` | VARCHAR | Campaign name | "Brand Search" |
| `roi` | DECIMAL | Campaign ROI % | 520 |
| `revenue` | DECIMAL | Campaign revenue | 25000.00 |
| `cost` | DECIMAL | Campaign spend | 4800.00 |
| `impressions` | INTEGER | Campaign impressions | 85000 |
| `clicks` | INTEGER | Campaign clicks | 2500 |
| `conversions` | INTEGER | Campaign conversions | 125 |

#### 3. Search Terms (`search_terms`)
Top performing search terms.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `term` | VARCHAR | Search term | "enterprise software" |
| `search_term` | VARCHAR | Alternative field name | "enterprise software" |
| `clicks` | INTEGER | Clicks for term | 850 |
| `conversions` | INTEGER | Conversions | 68 |
| `impressions` | INTEGER | Impressions | 15000 |
| `ctr` | DECIMAL | CTR % | 5.67 |

### Dimensions
- Campaign Name
- Ad Group
- Date
- Device Type
- Network (Search, Display, Shopping)
- Geographic Location

---

## LinkedIn Ads

**Source:** `linkedin_ads`
**Best Integration:** API (via Dataslayer or LinkedIn Marketing API)

### Metric Types

#### 1. KPI Summary (`kpi_summary`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessions` | INTEGER | Sessions from LinkedIn Ads | 1820 |
| `users` | INTEGER | Total users | 1620 |
| `new_users_percent` | DECIMAL | % new users | 85.3 |
| `conversion_rate` | DECIMAL | Conversion rate % | 6.7 |
| `conversions` | INTEGER | Total conversions | 123 |
| `revenue` | DECIMAL | Revenue generated | 12300.00 |
| `cost_per_conversion` | DECIMAL | Cost per conversion | 8.29 |
| `roi` | DECIMAL | ROI % | 1210 |
| `bounce_rate` | DECIMAL | Bounce rate % | 45.2 |
| `avg_session_duration` | VARCHAR | Avg session duration | "2:18" |
| `impressions` | INTEGER | Total impressions | 98500 |
| `ctr` | DECIMAL | CTR % | 3.2 |
| `ad_spend` | DECIMAL | Total ad spend | 1020.00 |
| `spend` | DECIMAL | Alternative field | 1020.00 |
| `cpc` | DECIMAL | Cost per click | 0.79 |

#### 2. Campaign Performance (`campaign_performance`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `campaign_name` | VARCHAR | Campaign name | "Lead Generation" |
| `ctr` | DECIMAL | CTR % | 4.2 |
| `conversions` | INTEGER | Conversions | 58 |
| `impressions` | INTEGER | Impressions | 25000 |
| `clicks` | INTEGER | Clicks | 1050 |
| `spend` | DECIMAL | Campaign spend | 450.00 |

#### 3. Daily Performance (`daily_performance`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `day` | VARCHAR | Day of week | "Mon" |
| `day_of_week` | VARCHAR | Alternative field | "Monday" |
| `conversions` | INTEGER | Daily conversions | 22 |
| `spend` | DECIMAL | Daily spend | 180.00 |
| `impressions` | INTEGER | Daily impressions | 12000 |
| `clicks` | INTEGER | Daily clicks | 380 |

### Dimensions
- Campaign Name
- Campaign Type (Lead Gen, Brand Awareness, etc.)
- Date
- Company Size
- Industry
- Job Function
- Seniority

---

## LinkedIn Organic

**Source:** `linkedin_organic`
**Best Integration:** API (LinkedIn Pages API) or Manual CSV Export

### Metric Types

#### 1. KPI Summary (`kpi_summary`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessions` | INTEGER | Sessions from organic | 2840 |
| `users` | INTEGER | Total users | 2450 |
| `new_users_percent` | DECIMAL | % new users | 72.5 |
| `conversion_rate` | DECIMAL | Conversion rate % | 2.8 |
| `conversions` | INTEGER | Total conversions | 80 |
| `revenue` | DECIMAL | Attributed revenue | 4000.00 |
| `engagement_rate` | DECIMAL | Engagement rate % | 4.6 |
| `avg_session_duration` | VARCHAR | Avg session | "1:52" |
| `impressions` | INTEGER | Total impressions | 49100 |
| `engagement` | INTEGER | Total engagements | 2275 |
| `followers` | INTEGER | Follower count | 12800 |
| `shares` | INTEGER | Total shares | 342 |
| `followers_change` | VARCHAR | Follower change | "+156" |
| `shares_change` | VARCHAR | Share change | "+12" |

#### 2. Weekly Engagement (`weekly_engagement`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `day` | VARCHAR | Day | "Mon" |
| `day_of_week` | VARCHAR | Day name | "Monday" |
| `engagement` | INTEGER | Daily engagement | 8500 |
| `impressions` | INTEGER | Daily impressions | 7200 |
| `reactions` | INTEGER | Daily reactions | 450 |
| `comments` | INTEGER | Daily comments | 85 |
| `shares` | INTEGER | Daily shares | 42 |

#### 3. Post Performance (`post_performance`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `post_type` | VARCHAR | Type of post | "Video" |
| `type` | VARCHAR | Alternative field | "Video" |
| `engagement` | INTEGER | Post engagement | 920 |
| `impressions` | INTEGER | Post impressions | 15000 |
| `reactions` | INTEGER | Post reactions | 680 |
| `comments` | INTEGER | Post comments | 145 |
| `shares` | INTEGER | Post shares | 95 |

### Dimensions
- Post Type (Video, Carousel, Image, Article, Text)
- Date
- Content Topic

---

## Google Search Console (SEO)

**Source:** `seo`
**Best Integration:** API (via Dataslayer or Search Console API)

### Metric Types

#### 1. KPI Summary (`kpi_summary`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessions` | INTEGER | Organic sessions | 11200 |
| `users` | INTEGER | Organic users | 9450 |
| `new_users_percent` | DECIMAL | % new users | 62.8 |
| `conversion_rate` | DECIMAL | Conversion rate % | 4.4 |
| `conversions` | INTEGER | Organic conversions | 494 |
| `revenue` | DECIMAL | Organic revenue | 24700.00 |
| `bounce_rate` | DECIMAL | Bounce rate % | 40.5 |
| `avg_session_duration` | VARCHAR | Avg session | "3:15" |
| `organic_clicks` | INTEGER | Search clicks | 12300 |
| `impressions` | INTEGER | Search impressions | 168000 |
| `avg_ctr` | DECIMAL | Average CTR % | 7.3 |
| `avg_position` | DECIMAL | Avg ranking position | 5.6 |
| `avg_position_change` | VARCHAR | Position change | "-0.8" |

#### 2. Organic Trend (`organic_trend`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | VARCHAR | Month | "Jan" |
| `clicks` | INTEGER | Monthly clicks | 10200 |
| `impressions` | INTEGER | Monthly impressions | 145000 |
| `sessions` | INTEGER | Monthly sessions | 9800 |
| `ctr` | DECIMAL | Monthly CTR | 7.0 |

#### 3. Top Pages (`top_pages`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `page` | VARCHAR | Page path | "/product" |
| `page_url` | VARCHAR | Alternative field | "/product" |
| `traffic` | INTEGER | Page traffic | 2800 |
| `clicks` | INTEGER | Page clicks | 2800 |
| `conversions` | INTEGER | Page conversions | 145 |
| `impressions` | INTEGER | Page impressions | 45000 |

#### 4. Keyword Rankings (`keyword_rankings`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `keyword` | VARCHAR | Search keyword | "enterprise software" |
| `position` | DECIMAL | Current position | 3 |
| `average_position` | DECIMAL | Alternative field | 3 |
| `volume` | INTEGER | Search volume | 8500 |
| `search_volume` | INTEGER | Alternative field | 8500 |
| `clicks` | INTEGER | Keyword clicks | 1200 |
| `impressions` | INTEGER | Keyword impressions | 18000 |

### Dimensions
- Page URL
- Query/Keyword
- Country
- Device Type
- Date

---

## Website Traffic (GA4)

**Source:** `website_traffic`
**Best Integration:** API (via Dataslayer or GA4 API)

### Metric Types

#### 1. KPI Summary (`kpi_summary`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `total_sessions` | INTEGER | Total sessions | 340000 |
| `sessions` | INTEGER | Alternative field | 340000 |
| `unique_users` | INTEGER | Unique users | 247000 |
| `users` | INTEGER | Alternative field | 247000 |
| `avg_session_duration` | VARCHAR | Avg duration | "4:32" |
| `pages_per_session` | DECIMAL | Pages/session | 3.8 |
| `bounce_rate` | DECIMAL | Bounce rate % | 42.5 |
| `new_users_percent` | DECIMAL | % new users | 68.4 |
| `pageviews` | INTEGER | Total pageviews | 968000 |
| `page_views` | INTEGER | Alternative field | 968000 |
| `exit_rate` | DECIMAL | Exit rate % | 38.2 |
| `total_sessions_change` | VARCHAR | Session change | "+18.2%" |
| `unique_users_change` | VARCHAR | User change | "+15.8%" |

#### 2. Traffic Trend (`traffic_trend`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | VARCHAR | Month | "Jan" |
| `sessions` | INTEGER | Monthly sessions | 45000 |
| `users` | INTEGER | Monthly users | 32000 |
| `pageviews` | INTEGER | Monthly pageviews | 125000 |
| `page_views` | INTEGER | Alternative field | 125000 |

#### 3. Device Distribution (`device_distribution`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | VARCHAR | Month | "Jan" |
| `desktop` | DECIMAL | Desktop % | 55 |
| `mobile` | DECIMAL | Mobile % | 35 |
| `tablet` | DECIMAL | Tablet % | 10 |

### Dimensions
- Date
- Device Category
- Browser
- Operating System
- Traffic Source/Medium
- Landing Page

---

## Marketing Cloud (Salesforce)

**Source:** `marketing_cloud`
**Best Integration:** CSV Import (via Google Drive) or API

### Metric Types

#### 1. KPI Summary (`kpi_summary`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessions` | INTEGER | Email sessions | 3350 |
| `users` | INTEGER | Email users | 2840 |
| `new_users_percent` | DECIMAL | % new users | 65.2 |
| `conversion_rate` | DECIMAL | Conversion rate % | 4.0 |
| `conversions` | INTEGER | Email conversions | 134 |
| `revenue` | DECIMAL | Email revenue | 6700.00 |
| `cost_per_conversion` | DECIMAL | Cost per conv | 18.50 |
| `roi` | DECIMAL | ROI % | 270 |
| `bounce_rate` | DECIMAL | Site bounce % | 38.5 |
| `avg_session_duration` | VARCHAR | Avg session | "2:45" |
| `open_rate` | DECIMAL | Email open rate % | 30.0 |
| `ctr` | DECIMAL | Email CTR % | 7.2 |
| `unique_clicks` | INTEGER | Unique clicks | 985 |
| `ctor` | DECIMAL | Click-to-open % | 24.0 |
| `click_to_open` | DECIMAL | Alternative field | 24.0 |
| `delivery_bounce_rate` | DECIMAL | Delivery bounce % | 1.2 |
| `unsubscribe_rate` | DECIMAL | Unsub rate % | 0.18 |
| `emails_sent` | INTEGER | Emails sent | 13680 |

#### 2. Email Trends (`email_trends`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | VARCHAR | Month | "Jan" |
| `ctor` | DECIMAL | CTOR % | 22 |
| `click_to_open` | DECIMAL | Alternative | 22 |
| `ctr` | DECIMAL | CTR % | 6.5 |
| `open_rate` | DECIMAL | Open rate % | 28 |
| `openRate` | DECIMAL | Alternative | 28 |
| `unique_clicks` | INTEGER | Unique clicks | 820 |
| `uniqueClicks` | INTEGER | Alternative | 820 |

#### 3. GA4 Attribution (`ga4_attribution`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | VARCHAR | Month | "Jan" |
| `conversions` | INTEGER | Attributed conversions | 95 |
| `revenue` | DECIMAL | Attributed revenue | 4200.00 |
| `sessions` | INTEGER | Email sessions | 2800 |

### Dimensions
- Email Campaign Name
- Subject Line
- Send Date
- Audience Segment
- Journey Name

---

## Acquisition

**Source:** `acquisition`
**Best Integration:** API (via Dataslayer - aggregated from GA4)

### Metric Types

#### 1. KPI Summary (`kpi_summary`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `total_acquisitions` | INTEGER | Total acquisitions | 227000 |
| `new_users` | INTEGER | New users | 168000 |
| `conversion_rate` | DECIMAL | Conversion rate % | 4.2 |
| `goal_completions` | INTEGER | Goal completions | 9500 |

#### 2. Channel Performance (`channel_performance`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `channel` | VARCHAR | Marketing channel | "Organic Search" |
| `users` | INTEGER | Channel users | 85000 |
| `sessions` | INTEGER | Channel sessions | 125000 |
| `conversions` | INTEGER | Channel conversions | 3500 |

#### 3. Source Distribution (`source_distribution`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `source` | VARCHAR | Traffic source | "Google" |
| `name` | VARCHAR | Alternative field | "Google" |
| `percentage` | DECIMAL | Source % | 45 |
| `value` | DECIMAL | Alternative field | 45 |

### Dimensions
- Channel (Organic, Paid, Social, Email, Direct, Referral)
- Source
- Medium
- Campaign

---

## Financial

**Source:** `financial`
**Best Integration:** API (aggregated data) or CSV Import

### Metric Types

#### 1. KPI Summary (`kpi_summary`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `total_revenue` | DECIMAL | Total revenue | 633000.00 |
| `marketing_spend` | DECIMAL | Total spend | 132000.00 |
| `net_profit` | DECIMAL | Net profit | 402000.00 |
| `overall_roi` | DECIMAL | Overall ROI % | 379 |

#### 2. Revenue Trend (`revenue_trend`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | VARCHAR | Month | "Jan" |
| `revenue` | DECIMAL | Monthly revenue | 85000.00 |
| `cost` | DECIMAL | Monthly cost | 32000.00 |
| `marketing_spend` | DECIMAL | Alternative | 32000.00 |
| `profit` | DECIMAL | Monthly profit | 53000.00 |

#### 3. Channel ROI (`channel_roi`)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `channel` | VARCHAR | Marketing channel | "Email" |
| `roi` | DECIMAL | Channel ROI % | 4200 |
| `spend` | DECIMAL | Channel spend | 15000.00 |
| `revenue` | DECIMAL | Channel revenue | 645000.00 |

### Dimensions
- Month/Quarter
- Marketing Channel
- Campaign

---

## Integration Recommendations

### Best for API Integration (Dataslayer)

| Tool | Reason |
|------|--------|
| **Google Ads** | Real-time data, granular metrics, official API support |
| **LinkedIn Ads** | Real-time campaign data, lead gen metrics |
| **Google Search Console** | Daily keyword rankings, real-time clicks |
| **GA4 (Website Traffic)** | Real-time traffic, detailed user behavior |
| **Acquisition** | Aggregated from GA4, automated |

### Best for CSV Import (Google Drive)

| Tool | Reason |
|------|--------|
| **Marketing Cloud** | Complex email metrics, export-friendly format |
| **Financial** | Aggregated/calculated data, often manual |
| **LinkedIn Organic** | Limited API access, manual export common |

### Hybrid Approach

| Tool | Primary | Secondary |
|------|---------|-----------|
| **Marketing Cloud** | CSV for bulk historical | API for recent data |
| **Financial** | CSV for accounting data | API for real-time spend |

---

## Dataslayer Webhook Payload Format

```json
{
  "source": "google_ads",
  "metric_type": "kpi_summary",
  "data": {
    "sessions": 9420,
    "users": 7850,
    "impressions": 248000,
    "ctr": 3.8,
    "cpc": 2.15,
    "conversions": 396,
    "revenue": 70000.00,
    "sessions_change": "+6.8%",
    "users_change": "+6.2%"
  },
  "date_range_start": "2024-01-01",
  "date_range_end": "2024-01-31",
  "api_key": "your-api-key"
}
```

---

## CSV File Format for Google Drive Import

### Naming Convention
Files should be named to indicate their metric type:
- `marketing_cloud_email_trends_jan2024.csv`
- `marketing_cloud_kpi_summary.csv`
- `email_attribution_data.csv`

### Example CSV Structure (Email Trends)
```csv
month,open_rate,ctr,ctor,unique_clicks
Jan,28,6.5,22,820
Feb,29,6.8,23,860
Mar,29.5,7.0,23.5,900
```

### Example CSV Structure (KPI Summary)
```csv
sessions,users,new_users_percent,conversion_rate,conversions,revenue,open_rate,ctr,ctor,emails_sent
3350,2840,65.2,4.0,134,6700,30.0,7.2,24.0,13680
```

---

## Notes

1. **Field Alternatives**: Many fields have alternative names (e.g., `pageviews` vs `page_views`). The dashboard handles both.

2. **Change Fields**: Include `_change` suffix fields for period-over-period comparisons (e.g., `sessions_change: "+6.8%"`).

3. **Date Ranges**: Always include `date_range_start` and `date_range_end` for proper filtering.

4. **Data Types**: Numbers should be sent as numbers, not strings (except for formatted change values).

5. **Currency**: Revenue and cost fields should be in decimal format without currency symbols.
