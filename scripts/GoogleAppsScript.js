/**
 * Marketing Dashboard - Google Apps Script
 *
 * This script pulls data from GA4 and Google Search Console APIs
 * and writes it to Google Sheets for your dashboard to consume.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this entire script and paste it
 * 4. Update the CONFIG section below with your property IDs
 * 5. Run the setup() function first to enable APIs
 * 6. Set up a daily trigger to run syncAllData()
 *
 * For Google Ads: Use the built-in scheduled reports feature
 * to export to a separate sheet tab (see documentation)
 */

// =====================================================
// CONFIGURATION - UPDATE THESE VALUES
// =====================================================

const CONFIG = {
  // Your GA4 Property ID (find in Admin > Property Settings)
  // Format: "properties/XXXXXXXXX"
  GA4_PROPERTY_ID: "properties/YOUR_GA4_PROPERTY_ID",

  // Your website URL for Search Console (exactly as it appears in GSC)
  // Format: "https://www.yoursite.com" or "sc-domain:yoursite.com"
  SEARCH_CONSOLE_SITE_URL: "https://www.yoursite.com",

  // Sheet names (tabs) - these will be created automatically
  SHEET_NAMES: {
    GA4_TRAFFIC: "GA4_Traffic",
    GA4_CONVERSIONS: "GA4_Conversions",
    SEARCH_CONSOLE: "Search_Console",
    GOOGLE_ADS: "Google_Ads", // Manual or scheduled report
    LINKEDIN_ADS: "LinkedIn_Ads", // Manual CSV upload
    SYNC_LOG: "Sync_Log"
  }
};

// =====================================================
// MAIN FUNCTIONS
// =====================================================

/**
 * Run this first to set up the spreadsheet
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create all required sheets
  Object.values(CONFIG.SHEET_NAMES).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log(`Created sheet: ${sheetName}`);
    }
  });

  // Set up headers for each sheet
  setupGA4TrafficHeaders();
  setupGA4ConversionsHeaders();
  setupSearchConsoleHeaders();
  setupGoogleAdsHeaders();
  setupLinkedInAdsHeaders();
  setupSyncLogHeaders();

  Logger.log("Setup complete! Now run syncAllData() to fetch data.");
}

/**
 * Main sync function - run this daily via trigger
 */
function syncAllData() {
  const startTime = new Date();
  let results = {
    ga4Traffic: false,
    ga4Conversions: false,
    searchConsole: false
  };

  try {
    results.ga4Traffic = syncGA4Traffic();
    results.ga4Conversions = syncGA4Conversions();
    results.searchConsole = syncSearchConsole();

    logSync("SUCCESS", results, startTime);
  } catch (error) {
    logSync("ERROR", { error: error.toString() }, startTime);
    throw error;
  }
}

// =====================================================
// GA4 DATA API FUNCTIONS
// =====================================================

function syncGA4Traffic() {
  try {
    const response = AnalyticsData.Properties.runReport({
      property: CONFIG.GA4_PROPERTY_ID,
      dateRanges: [
        { startDate: "30daysAgo", endDate: "yesterday" }
      ],
      dimensions: [
        { name: "date" },
        { name: "deviceCategory" }
      ],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "screenPageViewsPerSession" }
      ]
    });

    writeGA4TrafficData(response);
    return true;
  } catch (error) {
    Logger.log("GA4 Traffic Error: " + error);
    return false;
  }
}

function syncGA4Conversions() {
  try {
    const response = AnalyticsData.Properties.runReport({
      property: CONFIG.GA4_PROPERTY_ID,
      dateRanges: [
        { startDate: "30daysAgo", endDate: "yesterday" }
      ],
      dimensions: [
        { name: "date" },
        { name: "sessionDefaultChannelGroup" }
      ],
      metrics: [
        { name: "sessions" },
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "ecommercePurchases" }
      ]
    });

    writeGA4ConversionsData(response);
    return true;
  } catch (error) {
    Logger.log("GA4 Conversions Error: " + error);
    return false;
  }
}

function writeGA4TrafficData(response) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.GA4_TRAFFIC);

  // Clear existing data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 10).clearContent();
  }

  if (!response.rows || response.rows.length === 0) {
    Logger.log("No GA4 traffic data returned");
    return;
  }

  const data = response.rows.map(row => [
    row.dimensionValues[0].value, // date
    row.dimensionValues[1].value, // deviceCategory
    parseInt(row.metricValues[0].value) || 0, // sessions
    parseInt(row.metricValues[1].value) || 0, // totalUsers
    parseInt(row.metricValues[2].value) || 0, // newUsers
    parseInt(row.metricValues[3].value) || 0, // pageViews
    parseFloat(row.metricValues[4].value) || 0, // bounceRate
    parseFloat(row.metricValues[5].value) || 0, // avgSessionDuration
    parseFloat(row.metricValues[6].value) || 0, // pagesPerSession
    new Date() // lastUpdated
  ]);

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 10).setValues(data);
    Logger.log(`Wrote ${data.length} rows of GA4 traffic data`);
  }
}

function writeGA4ConversionsData(response) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.GA4_CONVERSIONS);

  // Clear existing data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 7).clearContent();
  }

  if (!response.rows || response.rows.length === 0) {
    Logger.log("No GA4 conversions data returned");
    return;
  }

  const data = response.rows.map(row => [
    row.dimensionValues[0].value, // date
    row.dimensionValues[1].value, // channel
    parseInt(row.metricValues[0].value) || 0, // sessions
    parseInt(row.metricValues[1].value) || 0, // conversions
    parseFloat(row.metricValues[2].value) || 0, // revenue
    parseInt(row.metricValues[3].value) || 0, // purchases
    new Date() // lastUpdated
  ]);

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 7).setValues(data);
    Logger.log(`Wrote ${data.length} rows of GA4 conversions data`);
  }
}

// =====================================================
// GOOGLE SEARCH CONSOLE API FUNCTIONS
// =====================================================

function syncSearchConsole() {
  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // GSC data has 3-day delay
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 33);

    const request = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["date", "query", "page"],
      rowLimit: 1000,
      dataState: "final"
    };

    const response = SearchConsole.Searchanalytics.query(
      request,
      CONFIG.SEARCH_CONSOLE_SITE_URL
    );

    writeSearchConsoleData(response);
    return true;
  } catch (error) {
    Logger.log("Search Console Error: " + error);
    return false;
  }
}

function writeSearchConsoleData(response) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.SEARCH_CONSOLE);

  // Clear existing data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 8).clearContent();
  }

  if (!response.rows || response.rows.length === 0) {
    Logger.log("No Search Console data returned");
    return;
  }

  const data = response.rows.map(row => [
    row.keys[0], // date
    row.keys[1], // query
    row.keys[2], // page
    row.clicks || 0,
    row.impressions || 0,
    row.ctr || 0,
    row.position || 0,
    new Date() // lastUpdated
  ]);

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 8).setValues(data);
    Logger.log(`Wrote ${data.length} rows of Search Console data`);
  }
}

// =====================================================
// HEADER SETUP FUNCTIONS
// =====================================================

function setupGA4TrafficHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.GA4_TRAFFIC);
  const headers = [
    "date", "device_category", "sessions", "total_users", "new_users",
    "page_views", "bounce_rate", "avg_session_duration", "pages_per_session", "last_updated"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}

function setupGA4ConversionsHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.GA4_CONVERSIONS);
  const headers = [
    "date", "channel", "sessions", "conversions", "revenue", "purchases", "last_updated"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}

function setupSearchConsoleHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.SEARCH_CONSOLE);
  const headers = [
    "date", "query", "page", "clicks", "impressions", "ctr", "position", "last_updated"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}

function setupGoogleAdsHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.GOOGLE_ADS);
  const headers = [
    "date", "campaign", "impressions", "clicks", "conversions",
    "cost", "ctr", "cpc", "conversion_rate", "last_updated"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

  // Add instruction note
  sheet.getRange(2, 1).setValue("// Populate this sheet using Google Ads scheduled reports or manual export");
}

function setupLinkedInAdsHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.LINKEDIN_ADS);
  const headers = [
    "date", "campaign", "impressions", "clicks", "conversions",
    "spend", "ctr", "leads", "last_updated"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

  // Add instruction note
  sheet.getRange(2, 1).setValue("// Populate this sheet using LinkedIn Campaign Manager CSV export");
}

function setupSyncLogHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.SYNC_LOG);
  const headers = [
    "timestamp", "status", "duration_ms", "details"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function logSync(status, results, startTime) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.SYNC_LOG);
  const duration = new Date() - startTime;

  sheet.appendRow([
    new Date(),
    status,
    duration,
    JSON.stringify(results)
  ]);
}

/**
 * Set up a daily trigger to run syncAllData
 * Run this once to create the trigger
 */
function createDailyTrigger() {
  // Delete existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncAllData') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new daily trigger at 6 AM
  ScriptApp.newTrigger('syncAllData')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  Logger.log("Daily trigger created! syncAllData will run every day at 6 AM.");
}

/**
 * Test function to verify API connections
 */
function testConnections() {
  Logger.log("Testing GA4 connection...");
  try {
    const ga4Response = AnalyticsData.Properties.runReport({
      property: CONFIG.GA4_PROPERTY_ID,
      dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
      metrics: [{ name: "sessions" }]
    });
    Logger.log("✓ GA4 connection successful");
  } catch (e) {
    Logger.log("✗ GA4 connection failed: " + e);
  }

  Logger.log("Testing Search Console connection...");
  try {
    const gscResponse = SearchConsole.Searchanalytics.query(
      {
        startDate: "2024-01-01",
        endDate: "2024-01-07",
        dimensions: ["date"],
        rowLimit: 1
      },
      CONFIG.SEARCH_CONSOLE_SITE_URL
    );
    Logger.log("✓ Search Console connection successful");
  } catch (e) {
    Logger.log("✗ Search Console connection failed: " + e);
  }
}

// =====================================================
// AGGREGATION FUNCTIONS (for dashboard KPIs)
// =====================================================

/**
 * Get summary metrics for the dashboard
 * This function aggregates data for the sync function
 */
function getAggregatedMetrics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Aggregate GA4 Traffic
  const trafficSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.GA4_TRAFFIC);
  const trafficData = trafficSheet.getDataRange().getValues();

  let totalSessions = 0;
  let totalUsers = 0;
  let totalNewUsers = 0;
  let totalPageViews = 0;
  let bounceRateSum = 0;
  let sessionDurationSum = 0;
  let dataPoints = 0;

  for (let i = 1; i < trafficData.length; i++) {
    if (trafficData[i][2]) { // Has sessions
      totalSessions += trafficData[i][2];
      totalUsers += trafficData[i][3];
      totalNewUsers += trafficData[i][4];
      totalPageViews += trafficData[i][5];
      bounceRateSum += trafficData[i][6];
      sessionDurationSum += trafficData[i][7];
      dataPoints++;
    }
  }

  // Aggregate GA4 Conversions
  const conversionsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.GA4_CONVERSIONS);
  const conversionsData = conversionsSheet.getDataRange().getValues();

  let totalConversions = 0;
  let totalRevenue = 0;

  for (let i = 1; i < conversionsData.length; i++) {
    if (conversionsData[i][3]) { // Has conversions
      totalConversions += conversionsData[i][3];
      totalRevenue += conversionsData[i][4];
    }
  }

  // Aggregate Search Console
  const gscSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SEARCH_CONSOLE);
  const gscData = gscSheet.getDataRange().getValues();

  let totalClicks = 0;
  let totalImpressions = 0;
  let positionSum = 0;
  let gscDataPoints = 0;

  for (let i = 1; i < gscData.length; i++) {
    if (gscData[i][3]) { // Has clicks
      totalClicks += gscData[i][3];
      totalImpressions += gscData[i][4];
      positionSum += gscData[i][6];
      gscDataPoints++;
    }
  }

  return {
    ga4: {
      sessions: totalSessions,
      users: totalUsers,
      newUsers: totalNewUsers,
      newUserPercent: totalUsers > 0 ? (totalNewUsers / totalUsers * 100).toFixed(1) : 0,
      pageViews: totalPageViews,
      bounceRate: dataPoints > 0 ? (bounceRateSum / dataPoints * 100).toFixed(1) : 0,
      avgSessionDuration: dataPoints > 0 ? (sessionDurationSum / dataPoints).toFixed(0) : 0,
      pagesPerSession: totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(2) : 0,
      conversions: totalConversions,
      revenue: totalRevenue
    },
    searchConsole: {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
      avgPosition: gscDataPoints > 0 ? (positionSum / gscDataPoints).toFixed(1) : 0
    },
    lastUpdated: new Date().toISOString()
  };
}
