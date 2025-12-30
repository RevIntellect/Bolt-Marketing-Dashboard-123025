import { 
  LayoutDashboard, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Linkedin, 
  Target,
  Search,
  Cloud,
  Mail
} from "lucide-react";

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

const dashboardCards = [
  {
    id: "executive",
    title: "Executive Summary",
    subtitle: "online vs medical",
    icon: LayoutDashboard,
    color: "from-indigo-500 to-purple-600",
    textColor: "text-white",
  },
  {
    id: "website-traffic",
    title: "Website Traffic",
    subtitle: "",
    icon: Globe,
    color: "from-teal-500 to-cyan-600",
    textColor: "text-white",
  },
  {
    id: "acquisition",
    title: "Acquisition Overview",
    subtitle: "",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-600",
    textColor: "text-white",
  },
  {
    id: "financial",
    title: "Financial Performance",
    subtitle: "",
    icon: DollarSign,
    color: "from-green-700 to-emerald-800",
    textColor: "text-white",
  },
  {
    id: "linkedin-ads",
    title: "LinkedIn Ads",
    subtitle: "",
    icon: Linkedin,
    color: "from-blue-600 to-blue-700",
    textColor: "text-white",
  },
  {
    id: "linkedin",
    title: "LinkedIn Organic",
    subtitle: "",
    icon: Linkedin,
    color: "from-sky-400 to-cyan-500",
    textColor: "text-white",
  },
  {
    id: "google-ads",
    title: "Google Ads",
    subtitle: "",
    icon: Target,
    color: "from-amber-400 to-yellow-500",
    textColor: "text-white",
  },
  {
    id: "seo",
    title: "Google Search Console",
    subtitle: "",
    icon: Search,
    color: "from-emerald-500 to-teal-600",
    textColor: "text-white",
  },
  {
    id: "marketing-cloud",
    title: "Marketing Cloud",
    subtitle: "",
    icon: Cloud,
    color: "from-red-500 to-rose-600",
    textColor: "text-white",
  },
  {
    id: "direct-mail",
    title: "Direct Mail",
    subtitle: "",
    icon: Mail,
    color: "from-orange-500 to-amber-600",
    textColor: "text-white",
  },
];

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Marketing Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">Select a dashboard to view detailed analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {dashboardCards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="group relative flex flex-col items-center"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Connection line */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30">
              <div className="w-px h-4 bg-muted-foreground" />
              <div className="w-2 h-2 rounded-full border border-muted-foreground" />
            </div>

            {/* Card */}
            <div
              className={`
                w-full aspect-[4/3] rounded-xl bg-gradient-to-br ${card.color}
                flex flex-col items-center justify-center gap-2 p-4
                shadow-lg hover:shadow-xl transition-all duration-300
                hover:scale-105 hover:-translate-y-1
                ${card.textColor}
              `}
            >
              <card.icon className="w-8 h-8" />
              <div className="text-center">
                <p className="font-semibold text-sm leading-tight">{card.title}</p>
                {card.subtitle && (
                  <p className="text-xs opacity-80 mt-0.5">{card.subtitle}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Data Sources Info */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-lg font-semibold text-foreground text-center mb-4">Connected Data Sources</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Google Analytics</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">LinkedIn Ads</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">LinkedIn Organic</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Salesforce Marketing Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
}
