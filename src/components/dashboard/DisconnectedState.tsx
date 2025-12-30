import { useNavigate } from "react-router-dom";
import { AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisconnectedStateProps {
  serviceName: string;
  isMarketingCloud?: boolean;
}

export function DisconnectedState({ serviceName, isMarketingCloud = false }: DisconnectedStateProps) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[400px] flex items-center justify-center p-8">
      <div className="absolute inset-0 border-4 border-red-500 rounded-lg animate-pulse" />

      <div className="relative z-10 text-center space-y-6 max-w-md mx-auto">
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 dark:bg-red-950 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Data Source Not Connected
          </h3>

          {isMarketingCloud ? (
            <p className="text-muted-foreground">
              Working on data import from CSV files. This dashboard will be available once the Google Drive integration is complete.
            </p>
          ) : (
            <p className="text-muted-foreground">
              {serviceName} is not connected. Please configure the connection to view this dashboard.
            </p>
          )}
        </div>

        {!isMarketingCloud && (
          <Button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2"
            size="lg"
          >
            <Settings className="w-4 h-4" />
            Connect to Source
          </Button>
        )}
      </div>
    </div>
  );
}
