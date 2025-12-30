import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DataslayerPayload {
  source: string;
  metric_type: string;
  data: any;
  date_range_start?: string;
  date_range_end?: string;
  api_key?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload: DataslayerPayload = await req.json();

    if (!payload.api_key) {
      return new Response(
        JSON.stringify({ error: "API key is required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: credentials, error: credError } = await supabase
      .from("api_credentials")
      .select("*")
      .eq("service_name", "dataslayer")
      .eq("is_active", true)
      .maybeSingle();

    if (credError || !credentials) {
      console.error("Credential error:", credError);
      return new Response(
        JSON.stringify({ error: "Invalid API credentials" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (credentials.api_key !== payload.api_key) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const marketingRecord = {
      source: payload.source || "dataslayer",
      metric_type: payload.metric_type,
      data: payload.data,
      date_range_start: payload.date_range_start || null,
      date_range_end: payload.date_range_end || null,
    };

    const { data: insertedData, error: insertError } = await supabase
      .from("marketing_data")
      .insert(marketingRecord)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      
      await supabase.from("sync_log").insert({
        source: marketingRecord.source,
        status: "error",
        records_count: 0,
        error_message: insertError.message,
      });

      await supabase
        .from("connection_status")
        .update({
          status: "error",
          last_check_at: new Date().toISOString(),
          error_message: insertError.message,
        })
        .eq("service_name", "dataslayer");

      return new Response(
        JSON.stringify({ error: "Failed to insert data", details: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase.from("sync_log").insert({
      source: marketingRecord.source,
      status: "success",
      records_count: 1,
    });

    await supabase
      .from("connection_status")
      .upsert({
        service_name: "dataslayer",
        status: "connected",
        last_check_at: new Date().toISOString(),
        error_message: null,
        metadata: { last_sync: new Date().toISOString(), records_synced: 1 },
      }, { onConflict: "service_name" });

    await supabase
      .from("api_credentials")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("service_name", "dataslayer");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Data received and stored",
        record_id: insertedData.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});