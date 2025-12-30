import { cn } from "@/lib/utils";

interface Insight {
  text: string;
  type: "success" | "info" | "warning";
}

interface InsightsCardProps {
  insights: Insight[];
}

export function InsightsCard({ insights }: InsightsCardProps) {
  const getColorClass = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "bg-success";
      case "info":
        return "bg-chart-2";
      case "warning":
        return "bg-warning";
      default:
        return "bg-muted-foreground";
    }
  };

  return (
    <div className="bg-card rounded-lg p-5 shadow-card border border-border/50 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">Key Insights</h3>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", getColorClass(insight.type))} />
            <span className="text-sm text-muted-foreground">{insight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
