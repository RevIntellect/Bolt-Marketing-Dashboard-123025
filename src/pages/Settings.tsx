import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Key, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleDriveImport } from "@/components/GoogleDriveImport";

interface ApiCredential {
  id: string;
  service_name: string;
  api_key: string;
  api_secret?: string;
  additional_config?: any;
  is_active: boolean;
  last_sync_at?: string;
}

interface ConnectionStatus {
  service_name: string;
  status: string;
  last_check_at: string;
  error_message?: string;
  metadata?: any;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [existingCredential, setExistingCredential] = useState<ApiCredential | null>(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    setWebhookUrl(`${supabaseUrl}/functions/v1/dataslayer-webhook`);

    loadCredentials();
    loadConnectionStatus();
  }, []);

  const loadCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from("api_credentials")
        .select("*")
        .eq("service_name", "dataslayer")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingCredential(data);
        setApiKey(data.api_key);
      }
    } catch (error) {
      console.error("Error loading credentials:", error);
    }
  };

  const loadConnectionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("connection_status")
        .select("*")
        .eq("service_name", "dataslayer")
        .maybeSingle();

      if (error) throw error;
      setConnectionStatus(data);
    } catch (error) {
      console.error("Error loading connection status:", error);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "API key is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (existingCredential) {
        const { error } = await supabase
          .from("api_credentials")
          .update({
            api_key: apiKey,
            is_active: true,
          })
          .eq("id", existingCredential.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("api_credentials")
          .insert({
            service_name: "dataslayer",
            api_key: apiKey,
            is_active: true,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Dataslayer credentials saved successfully",
      });

      await loadCredentials();
      await loadConnectionStatus();
    } catch (error: any) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);

    try {
      const testPayload = {
        source: "dataslayer_test",
        metric_type: "connection_test",
        data: { test: true, timestamp: new Date().toISOString() },
        api_key: apiKey,
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Dataslayer connection is working properly",
        });
        await loadConnectionStatus();
      } else {
        throw new Error(result.error || "Connection test failed");
      }
    } catch (error: any) {
      console.error("Connection test error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Dataslayer",
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
      disconnected: { icon: X, color: "text-gray-600", bg: "bg-gray-50", label: "Disconnected" },
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Data Integration Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your data sources and API connections</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>Current status of your Dataslayer integration</CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            {connectionStatus && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Check:</span>
                  <span className="font-medium">
                    {new Date(connectionStatus.last_check_at).toLocaleString()}
                  </span>
                </div>
                {connectionStatus.error_message && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{connectionStatus.error_message}</AlertDescription>
                  </Alert>
                )}
                {connectionStatus.metadata?.last_sync && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sync:</span>
                    <span className="font-medium">
                      {new Date(connectionStatus.metadata.last_sync).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure your Dataslayer API credentials to start receiving marketing data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Dataslayer API key"
              />
              <p className="text-xs text-muted-foreground">
                This key will be used to authenticate incoming webhook requests from Dataslayer
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    toast({
                      title: "Copied",
                      description: "Webhook URL copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this URL in your Dataslayer configuration to send data to this dashboard
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure to include the API key in your Dataslayer webhook payload as <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">api_key</code>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
              <Button
                onClick={handleTestConnection}
                disabled={loading || !apiKey}
                variant="outline"
                className="flex items-center gap-2"
              >
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Format</CardTitle>
            <CardDescription>Expected webhook payload format from Dataslayer</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "source": "google_ads",
  "metric_type": "campaign_performance",
  "data": {
    "campaign_name": "Summer Campaign",
    "impressions": 15000,
    "clicks": 450,
    "conversions": 23,
    "cost": 1250.50
  },
  "date_range_start": "2024-01-01",
  "date_range_end": "2024-01-31",
  "api_key": "your-api-key-here"
}`}
            </pre>
          </CardContent>
        </Card>

        {/* Google Drive CSV Import Section */}
        <GoogleDriveImport />
      </main>
    </div>
  );
};

export default Settings;
