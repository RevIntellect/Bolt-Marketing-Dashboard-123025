# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

This is a **Marketing Analytics Dashboard** built for reLink Medical. It aggregates marketing data from multiple sources (Google Analytics, LinkedIn, Salesforce Marketing Cloud) and presents it through specialized dashboards with AI-powered insights.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Theme**: next-themes (light/dark mode)

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (buttons, cards, inputs, etc.)
│   └── dashboard/       # Dashboard-specific components
│       ├── DashboardHome.tsx      # Main dashboard selector
│       ├── ExecutiveDashboard.tsx # Executive summary
│       ├── GoogleAdsDashboard.tsx # Google Ads metrics
│       ├── LinkedInDashboard.tsx  # LinkedIn organic metrics
│       ├── LinkedInAdsDashboard.tsx # LinkedIn paid metrics
│       ├── SEODashboard.tsx       # Google Search Console data
│       ├── MarketingCloudDashboard.tsx # Salesforce Marketing Cloud
│       ├── DirectMailDashboard.tsx # Direct mail campaigns
│       ├── WebsiteTrafficDashboard.tsx # Website analytics
│       ├── AcquisitionDashboard.tsx # Acquisition metrics
│       ├── FinancialDashboard.tsx # Financial performance
│       ├── KPICard.tsx            # Reusable KPI display card
│       ├── ChartCard.tsx          # Reusable chart container
│       └── DisconnectedWrapper.tsx # Shows disconnection state
├── pages/
│   ├── Index.tsx        # Main page with dashboard navigation
│   ├── Settings.tsx     # Settings page
│   └── NotFound.tsx     # 404 page
├── hooks/
│   ├── useConnectionStatus.ts  # Data source connection state
│   ├── use-mobile.tsx          # Mobile detection hook
│   └── use-toast.ts            # Toast notification hook
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client configuration
│       └── types.ts     # Database type definitions
├── lib/
│   ├── utils.ts         # Utility functions (cn helper)
│   └── dataTransformers.ts # Data transformation utilities
├── App.tsx              # Root component with providers
└── main.tsx             # Entry point

supabase/
└── functions/
    ├── ai-chat/         # AI chat edge function
    └── dataslayer-webhook/  # DataSlayer integration webhook
```

## Key Patterns

### Component Creation
- Use shadcn/ui components from `@/components/ui/`
- Import path alias `@/` maps to `src/`
- Dashboard components receive `onBack` prop for navigation
- Use `cn()` utility from `@/lib/utils` for conditional classnames

### State Management
- Use TanStack Query for server state
- Local UI state with React useState
- Theme state managed by next-themes ThemeProvider

### Styling Guidelines
- Use Tailwind CSS classes
- Support dark mode with `dark:` prefix or CSS variables
- Use semantic color classes: `bg-background`, `text-foreground`, `text-muted-foreground`
- Cards use `bg-card` with `border-border`

### Adding New Dashboards
1. Create component in `src/components/dashboard/`
2. Add route case in `src/pages/Index.tsx` renderDashboard switch
3. Add card entry in `src/components/dashboard/DashboardHome.tsx`

## Supabase Integration

- Client configured in `src/integrations/supabase/client.ts`
- Edge functions in `supabase/functions/`
- Database types in `src/integrations/supabase/types.ts`

## Documentation

Additional documentation available in `docs/`:
- `AI_CHAT_SETUP.md` - AI chat widget configuration
- `API_REQUIREMENTS.md` - API integration requirements
- `DATABASE_SECURITY.md` - Database security guidelines
- `DATASLAYER_INTEGRATION.md` - DataSlayer webhook setup

## Environment Variables

The application expects Supabase configuration. Check `src/integrations/supabase/client.ts` for required environment setup.
