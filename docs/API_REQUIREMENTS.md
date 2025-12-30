# reLink Medical Marketing Analytics - API Requirements

## Overview
This document outlines the API credentials and access requirements needed to connect our marketing analytics dashboard to external data sources.

---

## 1. Google Ads (via Google Analytics)

### Required Credentials
- **OAuth 2.0 Client ID**
- **OAuth 2.0 Client Secret**
- **Google Ads Customer ID** (format: XXX-XXX-XXXX)

### Setup Steps
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Ads API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs for our application

### Permissions Needed
- Read access to Google Ads account data
- Access to campaigns, ad groups, and performance metrics

### Data We'll Retrieve
- Campaign performance (clicks, impressions, CTR)
- Cost and conversion data
- Search term reports
- ROI by campaign

---

## 2. LinkedIn Ads

### Required Credentials
- **OAuth 2.0 Client ID**
- **OAuth 2.0 Client Secret**
- **Ad Account ID(s)**

### Setup Steps
1. Create an app in [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Request Marketing Developer Platform access
3. Add authorized redirect URIs

### Permissions Needed
- `r_ads` - Read ads data
- `r_ads_reporting` - Read ads reporting data

### Data We'll Retrieve
- Campaign performance metrics
- Impressions, clicks, CTR
- Spend and conversions
- Audience demographics

---

## 3. Salesforce Marketing Cloud

### Required Credentials
- **Client ID**
- **Client Secret**
- **Authentication Base URI**
- **Account ID (MID)**

### Setup Steps
1. Create an Installed Package in Marketing Cloud Setup
2. Add API Integration component with Server-to-Server authentication
3. Assign appropriate permissions to the package

### Permissions Needed
- Email: Read
- Automations: Read
- Journeys: Read
- Contacts: Read

### Data We'll Retrieve
- Email campaign performance
- Open rates, click rates
- Bounce and unsubscribe rates
- Journey analytics

---

## 4. LinkedIn Organic (Company Page)

### Required Credentials
- **OAuth 2.0 Client ID**
- **OAuth 2.0 Client Secret**
- **Organization ID** (Company Page ID)

### Setup Steps
1. Use same LinkedIn Developer app as LinkedIn Ads
2. Request additional permissions for organization data

### Permissions Needed
- `r_organization_social` - Read organization posts
- `rw_organization_admin` - Admin access to organization

### Alternative: CSV Export
If API access is limited, we can set up automated CSV exports:
- Export from LinkedIn Page Analytics
- Store in OneDrive for Business
- Our system will sync from the shared folder

### Data We'll Retrieve
- Post engagement (likes, comments, shares)
- Follower growth
- Page impressions
- Content performance

---

## Security Notes

1. **All credentials will be stored encrypted** in our secure backend
2. **OAuth tokens are refreshed automatically** - no manual intervention needed
3. **We only request read-only access** where possible
4. **Data syncs occur multiple times daily** via secure server-to-server connections

---

## Next Steps

Please provide credentials for the platforms you'd like to connect first. We recommend starting with:
1. **Google Ads** - Most straightforward setup
2. **LinkedIn Ads** - Similar OAuth flow
3. **Salesforce Marketing Cloud** - Requires Marketing Cloud admin access
4. **LinkedIn Organic** - May require CSV fallback

---

## Contact

For questions about this integration, please contact the development team.

*Document generated for reLink Medical Marketing Analytics Dashboard*
