import { useNavigate } from "react-router-dom";
import { AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface DisconnectedWrapperProps {
  isConnected: boolean;
  serviceName: string;
  isMarketingCloud?: boolean;
  children: ReactNode;
}

export function DisconnectedWrapper({
  isConnected,
  serviceName,
  isMarketingCloud = false,
  children
}: DisconnectedWrapperProps) {
  const navigate = useNavigate();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 border-4 border-red-500 rounded-lg animate-pulse pointer-events-none z-10" />

      <div className="relative opacity-30 pointer-events-none">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center space-y-4 max-w-md mx-auto bg-background p-6 rounded-lg border-2 border-red-500 shadow-lg">
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 dark:bg-red-950 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Data Source Not Connected
            </h3>

            {isMarketingCloud ? (
              <p className="text-sm text-muted-foreground">
                Working on data import from CSV files. This dashboard will be available once the Google Drive integration is complete.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {serviceName} is not connected. Please configure the connection to view this data.
              </p>
            )}
          </div>

          {!isMarketingCloud && (
            <Button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2"
              size="sm"
            >
              <Settings className="w-4 h-4" />
              Connect to Source
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
