# Dataslayer Integration Guide

## Overview
This document outlines the Dataslayer API integration that allows your marketing analytics dashboard to receive real-time marketing data from external sources via webhooks.

---

## Features

### 1. Secure Webhook Endpoint
- **URL**: `https://[your-supabase-url]/functions/v1/dataslayer-webhook`
- **Method**: POST
- **Authentication**: API Key validation
- **CORS**: Fully configured for cross-origin requests

### 2. Credential Management
- Store and manage API credentials securely in the database
- Encrypted storage for API keys
- Toggle active/inactive status for credentials
- Track last sync timestamps

### 3. Connection Status Monitoring
- Real-time connection status indicator in the dashboard header
- Status types: Connected, Disconnected, Error
- Error message tracking and display
- Automatic status polling every 30 seconds

### 4. Data Transformation
- Normalize incoming data from multiple sources
- Support for:
  - Google Ads
  - LinkedIn Ads
  - Marketing Cloud (Salesforce)
  - SEO / Google Search Console
  - Website Traffic / Google Analytics
- Calculate derived metrics (CTR, CPC, conversion rates)

---

## Database Schema

### `api_credentials` Table
Stores API credentials for external services.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| service_name | TEXT | Service identifier (e.g., 'dataslayer') |
| api_key | TEXT | API authentication key |
| api_secret | TEXT | Optional secret key |
| additional_config | JSONB | Extra configuration options |
| is_active | BOOLEAN | Whether the credential is active |
| last_sync_at | TIMESTAMPTZ | Last successful sync timestamp |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### `connection_status` Table
Tracks connection status for each service.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| service_name | TEXT | Service identifier |
| status | TEXT | Connection status (connected/disconnected/error) |
| last_check_at | TIMESTAMPTZ | Last status check timestamp |
| error_message | TEXT | Error details if status is 'error' |
| metadata | JSONB | Additional metadata (sync counts, etc.) |
| created_at | TIMESTAMPTZ | Record creation timestamp |

---

## Webhook Payload Format

### Required Fields
```json
{
  "source": "google_ads",
  "metric_type": "campaign_performance",
  "data": {
    "campaign_name": "Summer Campaign",
    "impressions": 15000,
    "clicks": 450,
    "conversions": 23,
    "cost": 1250.50
  },
  "api_key": "your-api-key-here"
}
```

### Optional Fields
```json
{
  "date_range_start": "2024-01-01",
  "date_range_end": "2024-01-31"
}
```

---

## Setup Instructions

### 1. Configure API Credentials

1. Navigate to **Settings** page (click "Dataslayer" in the header)
2. Enter your Dataslayer API key
3. Click **Save Configuration**
4. Copy the webhook URL provided

### 2. Configure Dataslayer

1. In your Dataslayer dashboard, add a new webhook destination
2. Paste the webhook URL from the settings page
3. Ensure the payload includes the `api_key` field
4. Test the connection using the **Test Connection** button

### 3. Verify Connection

1. Check the connection status indicator in the dashboard header
2. View detailed status information by clicking the status badge
3. Monitor the `sync_log` table for incoming data records

---

## Data Sources Supported

### Google Ads
- Campaign performance metrics
- Impressions, clicks, conversions
- Cost and CPC calculations
- CTR and conversion rate analytics

### LinkedIn Ads
- Campaign engagement metrics
- Impressions, clicks, conversions
- Spend tracking
- Lead generation data

### Marketing Cloud (Salesforce)
- Email campaign performance
- Send, open, and click metrics
- Bounce and unsubscribe rates
- Journey analytics

### SEO / Google Search Console
- Organic search performance
- Page impressions and clicks
- Average position tracking
- CTR for organic results

### Website Traffic / Google Analytics
- Session and user metrics
- Page views
- Bounce rate
- Average session duration
- Pages per session

---

## Data Transformation

All incoming data is automatically transformed to include calculated metrics:

### Google Ads
- **CTR**: (clicks / impressions) × 100
- **CPC**: cost / clicks
- **Conversion Rate**: (conversions / clicks) × 100

### LinkedIn Ads
- **CTR**: (clicks / impressions) × 100

### Marketing Cloud
- **Open Rate**: (opens / sends) × 100
- **Click Rate**: (clicks / opens) × 100
- **Bounce Rate**: (bounces / sends) × 100

### SEO
- **CTR**: (clicks / impressions) × 100

### Website Traffic
- **Pages per Session**: page_views / sessions

---

## Security Features

1. **API Key Validation**: All webhook requests must include a valid API key
2. **Row Level Security (RLS)**: Database tables protected with RLS policies
3. **Authenticated Access**: Settings page requires authentication
4. **Service Role Key**: Edge function uses service role for database operations
5. **CORS Protection**: Configured CORS headers for secure cross-origin requests

---

## Error Handling

### Connection Errors
- Logged to `connection_status` table
- Displayed in settings page
- Visible in status indicator

### Data Insert Errors
- Logged to `sync_log` table with error details
- Status updated to 'error'
- Error message preserved for debugging

### Authentication Errors
- Returns 401 status code
- Clear error messages for troubleshooting

---

## Testing

### Test Connection Button
The settings page includes a test button that:
1. Sends a test payload to the webhook
2. Verifies API key authentication
3. Confirms data can be inserted successfully
4. Updates connection status

### Manual Testing
```bash
curl -X POST https://[your-supabase-url]/functions/v1/dataslayer-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "source": "google_ads",
    "metric_type": "test",
    "data": {"test": true},
    "api_key": "your-api-key"
  }'
```

---

## Monitoring

### Real-time Status
- Connection status indicator in dashboard header
- Automatic polling every 30 seconds
- Click to view detailed status information

### Sync Logs
Query the `sync_log` table to view:
- Successful syncs
- Failed syncs with error messages
- Record counts per sync
- Timestamp of each sync operation

### Marketing Data
All incoming data is stored in the `marketing_data` table:
```sql
SELECT * FROM marketing_data
WHERE source = 'dataslayer'
ORDER BY synced_at DESC
LIMIT 10;
```

---

## Troubleshooting

### Connection Shows "Disconnected"
1. Verify API key is configured in settings
2. Check that webhook URL is correct in Dataslayer
3. Test the connection using the Test button
4. Review `sync_log` for error messages

### Data Not Appearing in Dashboard
1. Verify webhook payload format matches expected structure
2. Check `marketing_data` table for incoming records
3. Review `sync_log` for insert errors
4. Ensure date ranges are specified correctly

### Authentication Errors
1. Confirm API key matches the one in settings
2. Verify API key is included in webhook payload
3. Check that credential is marked as active

---

## API Reference

### Webhook Endpoint

**Endpoint**: `/functions/v1/dataslayer-webhook`
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```typescript
{
  source: string;           // Data source identifier
  metric_type: string;      // Type of metric
  data: object;             // Metric data
  date_range_start?: string; // Optional start date (YYYY-MM-DD)
  date_range_end?: string;   // Optional end date (YYYY-MM-DD)
  api_key: string;          // Authentication key
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Data received and stored",
  "record_id": "uuid"
}
```

**Error Responses**:
- `401`: Invalid API key
- `405`: Method not allowed
- `500`: Internal server error

---

## Files Modified/Created

### New Files
- `src/pages/Settings.tsx` - Settings page for API configuration
- `src/components/ConnectionStatus.tsx` - Connection status indicator
- `src/lib/dataTransformers.ts` - Data transformation utilities
- `supabase/functions/dataslayer-webhook/index.ts` - Webhook edge function
- `docs/DATASLAYER_INTEGRATION.md` - This documentation

### Database Migrations
- `add_dataslayer_credentials.sql` - Creates tables and policies

### Modified Files
- `src/App.tsx` - Added settings route
- `src/pages/Index.tsx` - Added connection status to header

---

## Future Enhancements

- [ ] Multiple API key support for different sources
- [ ] Webhook retry mechanism for failed requests
- [ ] Rate limiting for webhook endpoint
- [ ] Bulk data import endpoint
- [ ] Historical data backfill utilities
- [ ] Custom data source configurations
- [ ] Webhook signature verification
- [ ] Advanced data validation rules

---

## Support

For questions or issues with the Dataslayer integration:
1. Review this documentation
2. Check the `sync_log` table for error details
3. Test the connection from the settings page
4. Review Supabase edge function logs

---

*Last Updated: December 2024*
