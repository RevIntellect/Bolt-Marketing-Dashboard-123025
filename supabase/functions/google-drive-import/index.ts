import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

interface ImportResult {
  fileName: string;
  recordsImported: number;
  errors: string[];
}

// Parse CSV string into array of objects
function parseCSV(csvString: string): Record<string, any>[] {
  const lines = csvString.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const records: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const record: Record<string, any> = {};
    headers.forEach((header, index) => {
      const value = values[index];
      // Try to parse numbers
      const numValue = parseFloat(value);
      record[header.toLowerCase().replace(/\s+/g, "_")] = isNaN(numValue) ? value : numValue;
    });
    records.push(record);
  }

  return records;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// Detect metric type from filename or column headers
function detectMetricType(fileName: string, headers: string[]): string {
  const fileNameLower = fileName.toLowerCase();

  if (fileNameLower.includes("email") || fileNameLower.includes("marketing_cloud")) {
    if (fileNameLower.includes("trend") || headers.some(h => h.includes("month"))) {
      return "email_trends";
    }
    return "kpi_summary";
  }
  if (fileNameLower.includes("attribution") || fileNameLower.includes("utm")) {
    return "ga4_attribution";
  }
  if (fileNameLower.includes("kpi") || fileNameLower.includes("summary")) {
    return "kpi_summary";
  }
  if (fileNameLower.includes("campaign")) {
    return "campaign_performance";
  }

  // Default based on column patterns
  if (headers.some(h => h.includes("open_rate") || h.includes("ctr") || h.includes("ctor"))) {
    return "email_trends";
  }
  if (headers.some(h => h.includes("revenue") && h.includes("conversion"))) {
    return "ga4_attribution";
  }

  return "kpi_summary";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, folderId, accessToken, fileId, apiKey } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key if provided
    if (apiKey) {
      const { data: credential, error: credError } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("service_name", "google_drive")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .maybeSingle();

      if (credError || !credential) {
        return new Response(
          JSON.stringify({ error: "Invalid API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Google Drive access token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // List files in folder
    if (action === "list_files") {
      if (!folderId) {
        return new Response(
          JSON.stringify({ error: "Folder ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const query = `'${folderId}' in parents and mimeType='text/csv' and trashed=false`;
      const filesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!filesResponse.ok) {
        const error = await filesResponse.text();
        return new Response(
          JSON.stringify({ error: `Google Drive API error: ${error}` }),
          { status: filesResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const filesData = await filesResponse.json();
      return new Response(
        JSON.stringify({ files: filesData.files || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Import a specific file
    if (action === "import_file") {
      if (!fileId) {
        return new Response(
          JSON.stringify({ error: "File ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get file metadata
      const metaResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,modifiedTime`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!metaResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to get file metadata" }),
          { status: metaResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fileMeta = await metaResponse.json();

      // Download file content
      const contentResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!contentResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to download file" }),
          { status: contentResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const csvContent = await contentResponse.text();
      const records = parseCSV(csvContent);

      if (records.length === 0) {
        return new Response(
          JSON.stringify({ error: "No valid records found in CSV" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const headers = Object.keys(records[0]);
      const metricType = detectMetricType(fileMeta.name, headers);

      // Insert records into marketing_data
      const errors: string[] = [];
      let importedCount = 0;

      for (const record of records) {
        const { error } = await supabase.from("marketing_data").insert({
          source: "marketing_cloud",
          metric_type: metricType,
          data: record,
          date_range_start: record.date_range_start || record.date || null,
          date_range_end: record.date_range_end || record.date || null,
        });

        if (error) {
          errors.push(`Row ${importedCount + 1}: ${error.message}`);
        } else {
          importedCount++;
        }
      }

      // Log the import
      await supabase.from("sync_log").insert({
        source: "google_drive",
        status: errors.length === 0 ? "success" : "partial",
        records_synced: importedCount,
        error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
        metadata: {
          file_name: fileMeta.name,
          file_id: fileId,
          total_records: records.length,
          errors_count: errors.length,
        },
      });

      // Update connection status
      await supabase
        .from("connection_status")
        .upsert({
          service_name: "google_drive",
          status: "connected",
          last_check_at: new Date().toISOString(),
          error_message: null,
          metadata: { last_import: fileMeta.name, records_imported: importedCount },
        }, { onConflict: "service_name" });

      const result: ImportResult = {
        fileName: fileMeta.name,
        recordsImported: importedCount,
        errors: errors.slice(0, 10),
      };

      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Import all files from folder
    if (action === "import_folder") {
      if (!folderId) {
        return new Response(
          JSON.stringify({ error: "Folder ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const query = `'${folderId}' in parents and mimeType='text/csv' and trashed=false`;
      const filesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!filesResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to list files" }),
          { status: filesResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const filesData = await filesResponse.json();
      const files: GoogleDriveFile[] = filesData.files || [];
      const results: ImportResult[] = [];

      for (const file of files) {
        // Download file content
        const contentResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!contentResponse.ok) {
          results.push({
            fileName: file.name,
            recordsImported: 0,
            errors: ["Failed to download file"],
          });
          continue;
        }

        const csvContent = await contentResponse.text();
        const records = parseCSV(csvContent);

        if (records.length === 0) {
          results.push({
            fileName: file.name,
            recordsImported: 0,
            errors: ["No valid records found"],
          });
          continue;
        }

        const headers = Object.keys(records[0]);
        const metricType = detectMetricType(file.name, headers);

        const errors: string[] = [];
        let importedCount = 0;

        for (const record of records) {
          const { error } = await supabase.from("marketing_data").insert({
            source: "marketing_cloud",
            metric_type: metricType,
            data: record,
            date_range_start: record.date_range_start || record.date || null,
            date_range_end: record.date_range_end || record.date || null,
          });

          if (error) {
            errors.push(`Row ${importedCount + 1}: ${error.message}`);
          } else {
            importedCount++;
          }
        }

        results.push({
          fileName: file.name,
          recordsImported: importedCount,
          errors: errors.slice(0, 5),
        });
      }

      // Log the bulk import
      const totalImported = results.reduce((sum, r) => sum + r.recordsImported, 0);
      await supabase.from("sync_log").insert({
        source: "google_drive",
        status: totalImported > 0 ? "success" : "error",
        records_synced: totalImported,
        metadata: {
          folder_id: folderId,
          files_processed: files.length,
          results: results,
        },
      });

      // Update connection status
      await supabase
        .from("connection_status")
        .upsert({
          service_name: "google_drive",
          status: "connected",
          last_check_at: new Date().toISOString(),
          error_message: null,
          metadata: {
            last_bulk_import: new Date().toISOString(),
            files_processed: files.length,
            records_imported: totalImported
          },
        }, { onConflict: "service_name" });

      return new Response(
        JSON.stringify({ success: true, results, totalImported }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use list_files, import_file, or import_folder" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in google-drive-import:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
