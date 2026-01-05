import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.87.1";

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
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API not configured",
          response: "ChatGPT service is not configured. Please add OPENAI_API_KEY to edge function secrets."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: connectionStatus, error: statusError } = await supabase
      .from("connection_status")
      .select("*")
      .eq("service_name", "dataslayer")
      .maybeSingle();

    if (statusError || !connectionStatus || connectionStatus.status !== "connected") {
      return new Response(
        JSON.stringify({
          error: "Dataslayer not connected",
          response: "Dataslayer MCP is not connected or authorized. Please configure your Dataslayer credentials in Settings before using the chat assistant.",
          connectionRequired: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const [marketingData, directMailData, executiveData] = await Promise.all([
      supabase.from("marketing_data").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("direct_mail_campaigns").select("*"),
      supabase.from("executive_summary_metrics").select("*"),
    ]);

    const dataContext = {
      marketing_data: marketingData.data || [],
      direct_mail_campaigns: directMailData.data || [],
      executive_summary: executiveData.data || [],
      last_sync: connectionStatus.metadata?.last_sync || connectionStatus.last_check_at,
    };

    const systemPrompt = `You are an embedded ChatGPT assistant inside a marketing analytics application.

You are connected to Dataslayer through MCP and can query live, authorized data from the following sources only:
- Google Ads
- Google Analytics 4
- Google Sheets
- LinkedIn Ads
- LinkedIn Pages
- Google Search Console

Your job is to help users explore, analyze, and understand their data clearly and accurately.

CORE RULES:
- Use Dataslayer MCP for any request involving marketing, PPC, SEO, analytics, reporting, or performance data.
- NEVER invent data, metrics, accounts, or results.
- Only return fields and metrics that exist in the source being queried.
- If required inputs are missing (source, account, property, sheet, or date range), ask ONE clear clarification question.
- If no date range is provided, default to the last 30 days.
- If Dataslayer MCP is not connected or authorized, clearly state that and stop.

RESPONSE FORMAT:
- Start with the data output first, preferably as a clean table.
- Follow with a short, direct summary in plain language.
- Keep explanations minimal and practical.
- Do NOT use marketing language, filler, or sales tone.

BEHAVIOR:
- Be concise and direct.
- Respect the user's time.
- Do NOT repeat the user's question.
- Do NOT explain system internals unless asked.
- Prefer accuracy over speed.

CAPABILITIES:
- Google Ads and LinkedIn Ads: spend, impressions, clicks, conversions, CPA, ROAS, revenue when available.
- Google Analytics 4: users, sessions, events, conversions, traffic sources, engagement metrics.
- Google Search Console: clicks, impressions, CTR, average position by query, page, or date.
- Google Sheets: read and analyze tabular data exactly as stored.
- Breakdowns by date, campaign, ad group, keyword, query, page, source, or channel when supported.
- Compare time periods when requested.
- Reuse the same dataset for follow-up questions unless the user changes scope.

FAILURE HANDLING:
- If a request cannot be completed, state exactly what is missing or unsupported.
- Do NOT guess.
- Do NOT return partial data without clearly saying so.

FORMAT YOUR TABLES: Use markdown table format when presenting data.

End each response by optionally suggesting one short, logical next question the user might ask.

CURRENT DATA CONTEXT:
Last Dataslayer Sync: ${dataContext.last_sync}
Available Records: ${dataContext.marketing_data.length} marketing records
Direct Mail Campaigns: ${dataContext.direct_mail_campaigns.length} campaigns
Executive Metrics Available: ${dataContext.executive_summary.length > 0 ? 'Yes' : 'No'}

Data Sample:
${JSON.stringify(dataContext, null, 2).substring(0, 3000)}...`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return new Response(
        JSON.stringify({
          error: "Failed to get ChatGPT response",
          response: "I encountered an error processing your request. Please try again."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        response: aiResponse,
        dataContext: {
          recordCount: dataContext.marketing_data.length,
          lastSync: dataContext.last_sync
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in dataslayer-chat function:", error);
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
