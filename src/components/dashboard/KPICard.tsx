import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function KPICard({ title, value, change, isPositive = true, icon: Icon, className }: KPICardProps) {
  return (
    <div className={cn(
      "bg-card rounded-lg p-5 shadow-card transition-all duration-200 hover:shadow-card-hover border border-border/50 animate-fade-in",
      className
    )}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {change}
        </span>
      </div>
    </div>
  );
}
