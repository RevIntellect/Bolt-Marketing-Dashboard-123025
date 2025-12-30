import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionStatus {
  service_name: string;
  status: string;
  last_check_at: string;
  error_message?: string;
  metadata?: any;
}

export function useConnectionStatus(serviceName: string) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();

    const interval = setInterval(() => {
      loadStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, [serviceName]);

  const loadStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("connection_status")
        .select("*")
        .eq("service_name", serviceName)
        .maybeSingle();

      if (error) throw error;
      setStatus(data);
    } catch (error) {
      console.error(`Error loading connection status for ${serviceName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = status?.status === "connected";

  return { status, loading, isConnected };
}
