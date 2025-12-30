import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionStatus {
  service_name: string;
  status: string;
  last_check_at: string;
  error_message?: string;
  metadata?: any;
}

export const ConnectionStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();

    const interval = setInterval(() => {
      loadStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("connection_status")
        .select("*")
        .eq("service_name", "dataslayer")
        .maybeSingle();

      if (error) throw error;
      setStatus(data);
    } catch (error) {
      console.error("Error loading connection status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />;

    if (!status || status.status === "disconnected") {
      return <X className="w-3 h-3 text-gray-500" />;
    }

    if (status.status === "error") {
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    }

    return <Check className="w-3 h-3 text-green-500" />;
  };

  const getStatusColor = () => {
    if (loading || !status) return "bg-gray-400";

    switch (status.status) {
      case "connected":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs">Dataslayer</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">Dataslayer Connection</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? "Loading..." : status?.status || "Not configured"}
              </p>
            </div>
            {getStatusIcon()}
          </div>

          {status && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Check:</span>
                <span className="font-medium">
                  {new Date(status.last_check_at).toLocaleTimeString()}
                </span>
              </div>
              {status.metadata?.last_sync && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="font-medium">
                    {new Date(status.metadata.last_sync).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {status.error_message && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300">
                  {status.error_message}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => navigate("/settings")}
            size="sm"
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Settings className="w-3 h-3" />
            Configure Dataslayer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
