import { useState, useEffect } from "react";
import { Cloud, FolderOpen, FileSpreadsheet, Upload, RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface ConnectionStatus {
  service_name: string;
  status: string;
  last_check_at: string;
  error_message?: string;
  metadata?: any;
}

// Google OAuth configuration - these should be set in environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + "/settings";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

export function GoogleDriveImport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [folderId, setFolderId] = useState("");
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check for OAuth callback
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        setAccessToken(token);
        setIsConnected(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        toast({
          title: "Connected to Google Drive",
          description: "You can now import CSV files from your Google Drive",
        });
      }
    }

    loadConnectionStatus();
    loadSavedFolderId();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("connection_status")
        .select("*")
        .eq("service_name", "google_drive")
        .maybeSingle();

      if (!error && data) {
        setConnectionStatus(data);
      }
    } catch (error) {
      console.error("Error loading connection status:", error);
    }
  };

  const loadSavedFolderId = async () => {
    try {
      const { data, error } = await supabase
        .from("api_credentials")
        .select("additional_config")
        .eq("service_name", "google_drive")
        .maybeSingle();

      if (!error && data?.additional_config?.folder_id) {
        setFolderId(data.additional_config.folder_id);
      }
    } catch (error) {
      console.error("Error loading folder ID:", error);
    }
  };

  const saveFolderId = async () => {
    try {
      const { data: existing } = await supabase
        .from("api_credentials")
        .select("id")
        .eq("service_name", "google_drive")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("api_credentials")
          .update({ additional_config: { folder_id: folderId } })
          .eq("id", existing.id);
      } else {
        await supabase.from("api_credentials").insert({
          service_name: "google_drive",
          api_key: "oauth",
          is_active: true,
          additional_config: { folder_id: folderId },
        });
      }

      toast({
        title: "Folder ID Saved",
        description: "Google Drive folder configuration saved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save folder ID",
        variant: "destructive",
      });
    }
  };

  const handleGoogleAuth = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast({
        title: "Configuration Missing",
        description: "Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID.",
        variant: "destructive",
      });
      return;
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("scope", SCOPES);
    authUrl.searchParams.append("include_granted_scopes", "true");

    window.location.href = authUrl.toString();
  };

  const listFiles = async () => {
    if (!accessToken || !folderId) {
      toast({
        title: "Error",
        description: "Please connect to Google Drive and enter a folder ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/google-drive-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: "list_files",
          folderId,
          accessToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to list files");
      }

      setFiles(result.files || []);

      if (result.files.length === 0) {
        toast({
          title: "No CSV Files Found",
          description: "The specified folder doesn't contain any CSV files",
        });
      } else {
        toast({
          title: "Files Loaded",
          description: `Found ${result.files.length} CSV file(s) in the folder`,
        });
      }
    } catch (error: any) {
      console.error("Error listing files:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to list files from Google Drive",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importFile = async (fileId: string, fileName: string) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/google-drive-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: "import_file",
          fileId,
          accessToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import file");
      }

      setImportResults((prev) => [...prev, result.result]);
      toast({
        title: "Import Successful",
        description: `Imported ${result.result.recordsImported} records from ${fileName}`,
      });

      await loadConnectionStatus();
    } catch (error: any) {
      console.error("Error importing file:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importAllFiles = async () => {
    if (!accessToken || !folderId) return;

    setLoading(true);
    setImportResults([]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/google-drive-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: "import_folder",
          folderId,
          accessToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import folder");
      }

      setImportResults(result.results || []);
      toast({
        title: "Bulk Import Complete",
        description: `Imported ${result.totalImported} total records from ${result.results.length} files`,
      });

      await loadConnectionStatus();
    } catch (error: any) {
      console.error("Error importing folder:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import files from folder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!connectionStatus) return null;

    const statusConfig = {
      connected: { icon: Check, color: "text-green-600", bg: "bg-green-50", label: "Connected" },
      disconnected: { icon: Cloud, color: "text-gray-600", bg: "bg-gray-50", label: "Not Connected" },
      error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Error" },
    };

    const config = statusConfig[connectionStatus.status as keyof typeof statusConfig] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Google Drive CSV Import
            </CardTitle>
            <CardDescription>
              Import Marketing Cloud data from CSV files in Google Drive
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Section */}
        <div className="space-y-4">
          {!isConnected ? (
            <div className="space-y-3">
              <Alert>
                <Cloud className="h-4 w-4" />
                <AlertDescription>
                  Connect your Google account to import CSV files from Google Drive.
                  You'll need to authorize read-only access to your Drive files.
                </AlertDescription>
              </Alert>
              <Button onClick={handleGoogleAuth} className="w-full">
                <Cloud className="w-4 h-4 mr-2" />
                Connect Google Drive
              </Button>
            </div>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Connected to Google Drive. You can now import CSV files.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Folder Configuration */}
        {isConnected && (
          <>
            <div className="space-y-2">
              <Label htmlFor="folderId">Google Drive Folder ID</Label>
              <div className="flex gap-2">
                <Input
                  id="folderId"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  placeholder="Enter folder ID from Google Drive URL"
                  className="flex-1"
                />
                <Button variant="outline" onClick={saveFolderId} disabled={!folderId}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The folder ID is the last part of the Google Drive folder URL:
                <code className="ml-1 font-mono bg-muted px-1 rounded">drive.google.com/drive/folders/<strong>FOLDER_ID</strong></code>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={listFiles}
                disabled={loading || !folderId}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                List Files
              </Button>
              <Button
                onClick={importAllFiles}
                disabled={loading || !folderId}
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import All CSV Files
              </Button>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Available CSV Files</Label>
                <div className="border rounded-lg divide-y">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => importFile(file.id, file.name)}
                        disabled={loading}
                      >
                        Import
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResults.length > 0 && (
              <div className="space-y-2">
                <Label>Import Results</Label>
                <div className="border rounded-lg divide-y bg-muted/30">
                  {importResults.map((result, index) => (
                    <div key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.errors.length === 0 ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="font-medium text-sm">{result.fileName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {result.recordsImported} records imported
                        </span>
                      </div>
                      {result.errors.length > 0 && (
                        <div className="mt-2 text-xs text-red-600">
                          {result.errors.slice(0, 3).map((err, i) => (
                            <p key={i}>{err}</p>
                          ))}
                          {result.errors.length > 3 && (
                            <p>...and {result.errors.length - 3} more errors</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Import Info */}
            {connectionStatus?.metadata?.last_import && (
              <div className="text-sm text-muted-foreground pt-2 border-t">
                <p>
                  Last import: <strong>{connectionStatus.metadata.last_import}</strong>
                  {connectionStatus.metadata.records_imported && (
                    <span> ({connectionStatus.metadata.records_imported} records)</span>
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
