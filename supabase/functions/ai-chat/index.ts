import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "ANTHROPIC_API_KEY not configured",
          response: "I'm unable to process your request at this time. The AI service is not configured. Please contact your administrator to set up the ANTHROPIC_API_KEY in Supabase Edge Function secrets."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const executeSql = async (query: string) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query }),
      });
      return response.json();
    };

    const fetchTableData = async (tableName: string) => {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/${tableName}?select=*`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
          },
        }
      );
      return response.json();
    };

    const [directMail, executiveSummary, quarterlyRevenue, monthlyRevenue, dailyBounce] = await Promise.all([
      fetchTableData("direct_mail_campaigns"),
      fetchTableData("executive_summary_metrics"),
      fetchTableData("quarterly_revenue"),
      fetchTableData("monthly_revenue_ytd"),
      fetchTableData("daily_bounce_rates"),
    ]);

    const contextData = {
      direct_mail_campaigns: directMail,
      executive_summary: executiveSummary,
      quarterly_revenue: quarterlyRevenue,
      monthly_revenue: monthlyRevenue,
      daily_bounce_rates: dailyBounce,
    };

    const systemPrompt = `You are a Senior Marketing Data Analyst with expertise in digital marketing analytics, campaign performance optimization, and business intelligence. You specialize in analyzing marketing data to provide actionable insights that drive ROI and improve campaign performance.

Your analysis capabilities include:
- Campaign performance analysis and optimization recommendations
- Conversion funnel analysis and optimization
- Revenue attribution and trend analysis
- User behavior and engagement metrics
- Comparative analysis across campaigns and time periods
- Statistical significance testing and confidence in recommendations
- Forecasting and predictive insights

You have access to comprehensive marketing data including:

1. Direct Mail Campaign Performance ("refresh_your_fleet"):
   - Campaign variants (postcardA through postcardH, plus control groups)
   - Engagement metrics: active users, sessions, views per session
   - Conversion funnel: checkouts, transactions, exits, entrances
   - Financial metrics: revenue per variant, conversion value
   - Behavior: event counts, user journey patterns

2. Executive Dashboard Metrics:
   - 365-day performance trends
   - Month-over-month growth rates and change percentages
   - Key KPIs: total users, new user acquisition, session volume
   - Quality metrics: bounce rates, engagement depth
   - Business outcomes: conversion rates, total revenue

3. Financial Performance Data:
   - Quarterly revenue trends and patterns
   - Monthly revenue for year-to-date analysis
   - Daily bounce rate fluctuations and seasonality
   - Revenue per user and lifetime value indicators

When providing analysis:
- Start with the key insight or answer immediately
- Support with specific data points and percentages
- Identify trends, patterns, and anomalies
- Compare performance across segments when relevant
- Provide context (e.g., "This is X% above/below average")
- Offer 2-3 actionable recommendations based on data
- Flag any data limitations or caveats
- Use clear, professional language without jargon unless necessary
- Format numbers clearly (use commas for thousands, $ for currency, % for percentages)

Example response style:
"The postcardA variant is outperforming other variants with a 23.4% higher conversion rate ($12,450 revenue vs. $10,100 average). This suggests the messaging resonates better with your target audience.

Recommendations:
1. Allocate more budget to postcardA variant
2. Test similar messaging in other channels
3. Analyze audience segments responding best to this variant"

Current marketing data:
${JSON.stringify(contextData, null, 2)}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return new Response(
        JSON.stringify({ 
          error: "Failed to get AI response",
          response: "I encountered an error while processing your request. Please try again."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = data.content[0].text;

    return new Response(
      JSON.stringify({ response: aiResponse, context: contextData }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I encountered an unexpected error. Please try again."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});