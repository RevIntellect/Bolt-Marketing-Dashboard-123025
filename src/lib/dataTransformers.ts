export interface DataslayerMetric {
  source: string;
  metric_type: string;
  data: any;
  date_range_start?: string;
  date_range_end?: string;
}

export interface NormalizedMetric {
  source: string;
  metric_type: string;
  data: any;
  date_range_start: string | null;
  date_range_end: string | null;
}

export const transformGoogleAdsData = (rawData: any): NormalizedMetric => {
  return {
    source: 'google_ads',
    metric_type: rawData.metric_type || 'campaign_performance',
    data: {
      campaign_name: rawData.campaign_name,
      impressions: rawData.impressions || 0,
      clicks: rawData.clicks || 0,
      conversions: rawData.conversions || 0,
      cost: rawData.cost || 0,
      ctr: rawData.clicks && rawData.impressions
        ? (rawData.clicks / rawData.impressions * 100).toFixed(2)
        : 0,
      cpc: rawData.clicks && rawData.cost
        ? (rawData.cost / rawData.clicks).toFixed(2)
        : 0,
      conversion_rate: rawData.conversions && rawData.clicks
        ? (rawData.conversions / rawData.clicks * 100).toFixed(2)
        : 0,
    },
    date_range_start: rawData.date_range_start || null,
    date_range_end: rawData.date_range_end || null,
  };
};

export const transformLinkedInAdsData = (rawData: any): NormalizedMetric => {
  return {
    source: 'linkedin_ads',
    metric_type: rawData.metric_type || 'campaign_performance',
    data: {
      campaign_name: rawData.campaign_name,
      impressions: rawData.impressions || 0,
      clicks: rawData.clicks || 0,
      conversions: rawData.conversions || 0,
      spend: rawData.spend || 0,
      engagement_rate: rawData.engagement_rate || 0,
      leads: rawData.leads || 0,
      ctr: rawData.clicks && rawData.impressions
        ? (rawData.clicks / rawData.impressions * 100).toFixed(2)
        : 0,
    },
    date_range_start: rawData.date_range_start || null,
    date_range_end: rawData.date_range_end || null,
  };
};

export const transformMarketingCloudData = (rawData: any): NormalizedMetric => {
  return {
    source: 'marketing_cloud',
    metric_type: rawData.metric_type || 'email_performance',
    data: {
      email_name: rawData.email_name,
      sends: rawData.sends || 0,
      opens: rawData.opens || 0,
      clicks: rawData.clicks || 0,
      bounces: rawData.bounces || 0,
      unsubscribes: rawData.unsubscribes || 0,
      open_rate: rawData.opens && rawData.sends
        ? (rawData.opens / rawData.sends * 100).toFixed(2)
        : 0,
      click_rate: rawData.clicks && rawData.opens
        ? (rawData.clicks / rawData.opens * 100).toFixed(2)
        : 0,
      bounce_rate: rawData.bounces && rawData.sends
        ? (rawData.bounces / rawData.sends * 100).toFixed(2)
        : 0,
    },
    date_range_start: rawData.date_range_start || null,
    date_range_end: rawData.date_range_end || null,
  };
};

export const transformSEOData = (rawData: any): NormalizedMetric => {
  return {
    source: 'seo',
    metric_type: rawData.metric_type || 'organic_performance',
    data: {
      page_url: rawData.page_url,
      impressions: rawData.impressions || 0,
      clicks: rawData.clicks || 0,
      average_position: rawData.average_position || 0,
      ctr: rawData.clicks && rawData.impressions
        ? (rawData.clicks / rawData.impressions * 100).toFixed(2)
        : 0,
    },
    date_range_start: rawData.date_range_start || null,
    date_range_end: rawData.date_range_end || null,
  };
};

export const transformWebsiteTrafficData = (rawData: any): NormalizedMetric => {
  return {
    source: 'website_traffic',
    metric_type: rawData.metric_type || 'page_views',
    data: {
      sessions: rawData.sessions || 0,
      users: rawData.users || 0,
      page_views: rawData.page_views || 0,
      bounce_rate: rawData.bounce_rate || 0,
      avg_session_duration: rawData.avg_session_duration || 0,
      pages_per_session: rawData.page_views && rawData.sessions
        ? (rawData.page_views / rawData.sessions).toFixed(2)
        : 0,
    },
    date_range_start: rawData.date_range_start || null,
    date_range_end: rawData.date_range_end || null,
  };
};

export const transformDataslayerPayload = (payload: DataslayerMetric): NormalizedMetric => {
  const source = payload.source.toLowerCase();

  switch (source) {
    case 'google_ads':
      return transformGoogleAdsData(payload.data);
    case 'linkedin_ads':
      return transformLinkedInAdsData(payload.data);
    case 'marketing_cloud':
    case 'salesforce_marketing_cloud':
      return transformMarketingCloudData(payload.data);
    case 'seo':
    case 'google_search_console':
      return transformSEOData(payload.data);
    case 'website_traffic':
    case 'google_analytics':
      return transformWebsiteTrafficData(payload.data);
    default:
      return {
        source: payload.source,
        metric_type: payload.metric_type,
        data: payload.data,
        date_range_start: payload.date_range_start || null,
        date_range_end: payload.date_range_end || null,
      };
  }
};

export const validateDataslayerPayload = (payload: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!payload.source) {
    errors.push("Missing required field: source");
  }

  if (!payload.metric_type) {
    errors.push("Missing required field: metric_type");
  }

  if (!payload.data) {
    errors.push("Missing required field: data");
  }

  if (!payload.api_key) {
    errors.push("Missing required field: api_key");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
