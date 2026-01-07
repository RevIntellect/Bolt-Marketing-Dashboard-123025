# Bolt Marketing Dashboard - Design Specification

A comprehensive design document for the reLink Medical Marketing Analytics Dashboard.

---

## Table of Contents
1. [Overview](#overview)
2. [Design System](#design-system)
3. [Layout Structure](#layout-structure)
4. [Component Specifications](#component-specifications)
5. [Dashboard Modules](#dashboard-modules)
6. [Data Visualization](#data-visualization)
7. [Interaction States](#interaction-states)
8. [Responsive Behavior](#responsive-behavior)

---

## Overview

### Product Description
A multi-source marketing analytics dashboard that consolidates data from 8+ marketing platforms into a unified, visually cohesive interface. Built for medical/healthcare marketing teams to track performance across Google Ads, LinkedIn, Email, SEO, and more.

### Design Goals
- **Clarity**: Present complex marketing data in digestible, scannable formats
- **Consistency**: Unified visual language across all dashboard modules
- **Actionability**: Surface insights and trends at a glance
- **Professional**: Clean, modern aesthetic suitable for enterprise B2B

### Brand Identity
- **Company**: reLink Medical
- **Industry**: Healthcare/Medical Device Marketing
- **Tone**: Professional, data-driven, trustworthy
- **Target Users**: Marketing managers, CMOs, data analysts

---

## Design System

### Color Palette

#### Primary Colors
| Name | Hex | HSL | Usage |
|------|-----|-----|-------|
| Primary Blue | #4A7CFF | hsl(220, 70%, 55%) | Primary actions, links, active states |
| Success Green | #3DB978 | hsl(155, 70%, 45%) | Positive metrics, growth indicators |
| Warning Amber | #F5A623 | hsl(38, 90%, 55%) | Caution states, warnings |
| Error Red | #E74C3C | hsl(0, 72%, 55%) | Negative metrics, errors, declines |
| Purple Accent | #9B59B6 | hsl(280, 65%, 55%) | Secondary data series, accents |

#### Neutral Colors
| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Background | #FFFFFF | #0A0A0A | Page background |
| Card | #FFFFFF | #1A1A1A | Card backgrounds |
| Border | #E5E7EB | #2A2A2A | Dividers, borders |
| Muted | #F3F4F6 | #262626 | Subtle backgrounds |
| Foreground | #111827 | #FAFAFA | Primary text |
| Muted Foreground | #6B7280 | #A1A1AA | Secondary text, labels |

### Typography

#### Font Family
- **Primary**: DM Sans (Google Font)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Monospace**: ui-monospace, monospace (for code/numbers)

#### Type Scale
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | 24px (1.5rem) | 700 (Bold) | 1.2 | Page titles |
| H2 | 20px (1.25rem) | 600 (Semibold) | 1.3 | Section titles |
| H3 | 16px (1rem) | 600 (Semibold) | 1.4 | Card titles |
| Body | 14px (0.875rem) | 400 (Regular) | 1.5 | Default text |
| Small | 12px (0.75rem) | 400 (Regular) | 1.4 | Labels, captions |
| XS | 10px (0.625rem) | 500 (Medium) | 1.3 | Chart labels |

### Spacing System
Based on 4px grid:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Border Radius
- **sm**: 4px - Buttons, inputs
- **md**: 8px - Cards, modals
- **lg**: 12px - Large containers
- **full**: 9999px - Pills, avatars

### Shadows
```css
/* Card shadow */
box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);

/* Elevated card */
box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);

/* Dropdown shadow */
box-shadow: 0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.04);
```

---

## Layout Structure

### Global Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                        64px │
│ ┌─────────┐  ┌─────────────────────┐  ┌────┐ ┌────┐ ┌────┐ │
│ │  Logo   │  │   Connection Status │  │Moon│ │Bell│ │ AI │ │
│ └─────────┘  └─────────────────────┘  └────┘ └────┘ └────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ MAIN CONTENT (Scrollable)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  Dashboard Content                                      │ │
│ │                                                         │ │
│ │  Padding: 24px                                          │ │
│ │  Max Width: 1400px (centered)                           │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ AI CHAT WIDGET (Fixed bottom-right)                   56px  │
│                                            ┌────────────┐   │
│                                            │ 💬 Chat    │   │
│                                            └────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Header Specifications

| Element | Specification |
|---------|---------------|
| Height | 64px |
| Background | Card background with bottom border |
| Padding | 0 24px |
| Logo | Left-aligned, max-height 40px |
| Connection Status | Pill badge with icon + text |
| Actions | Right-aligned, 8px gap between items |

### Dashboard Home Grid

```
┌─────────────────────────────────────────────────────────────┐
│ PAGE TITLE                                     Date Picker  │
│ "Marketing Analytics Dashboard"                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │Executive │ │  Google  │ │ LinkedIn │ │ LinkedIn │        │
│ │ Summary  │ │   Ads    │ │   Ads    │ │ Organic  │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │   SEO    │ │ Website  │ │Marketing │ │  Direct  │        │
│ │          │ │ Traffic  │ │  Cloud   │ │   Mail   │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ ┌──────────┐ ┌──────────┐                                  │
│ │Acquisition│ │Financial │                                  │
│ │          │ │          │                                  │
│ └──────────┘ └──────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
Gap: 16px
Card Height: ~180px (auto based on content)
```

---

## Component Specifications

### 1. Dashboard Navigation Card

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌────┐                                 │
│  │Icon│  40x40px, muted background      │
│  └────┘                                 │
│                                         │
│  Dashboard Title                        │
│  16px, semibold, foreground             │
│                                         │
│  Brief description of what this         │
│  dashboard shows                        │
│  12px, regular, muted-foreground        │
│                                         │
│                              →          │
│                        Arrow indicator  │
└─────────────────────────────────────────┘

Dimensions:
- Min Height: 160px
- Padding: 24px
- Border Radius: 12px
- Border: 1px solid border color
- Hover: Subtle shadow + border color change
- Transition: 200ms ease
```

### 2. KPI Card

```
┌─────────────────────────────────────────┐
│ ┌────┐                                  │
│ │Icon│  20x20px, muted-foreground       │
│ └────┘                                  │
│                                         │
│ Metric Title                            │
│ 12px, regular, muted-foreground         │
│                                         │
│ $125,420                                │
│ 24px, bold, foreground                  │
│                                         │
│ ┌──────────┐                            │
│ │ ↑ +12.5% │  Change indicator          │
│ └──────────┘  (green=positive)          │
└─────────────────────────────────────────┘

Dimensions:
- Height: Auto (~120px)
- Padding: 16px
- Border Radius: 8px
- Background: Card
- Border: 1px solid border

Change Indicator:
- Positive: Green text, up arrow
- Negative: Red text, down arrow
- Neutral: Gray text, no arrow
- Some metrics inverse (bounce rate: down = good)
```

### 3. Chart Card

```
┌─────────────────────────────────────────────────────────────┐
│ Chart Title                                                 │
│ 16px, semibold, foreground                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    CHART AREA                               │
│                                                             │
│         ████                                                │
│         ████  ████                                          │
│   ████  ████  ████  ████                                    │
│   ████  ████  ████  ████  ████                              │
│   ────  ────  ────  ────  ────                              │
│   Jan   Feb   Mar   Apr   May                               │
│                                                             │
│   ● Series 1  ● Series 2  ● Series 3                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Dimensions:
- Min Height: 320px
- Chart Height: 280px
- Padding: 16px top, 24px sides
- Border Radius: 12px
- Background: Card

Chart Styling:
- Grid Lines: Dashed, 3px dash, border color
- Axis Labels: 12px, muted-foreground
- Tooltip: Card background, 8px radius, shadow
- Legend: Bottom-aligned, 12px, inline items
```

### 4. Date Range Picker

```
┌─────────────────────────────────────────┐
│ 📅  Jan 1, 2024 - Jan 31, 2024    ▼    │
└─────────────────────────────────────────┘

Expanded:
┌─────────────────────────────────────────┐
│       January 2024            ◀  ▶     │
├─────────────────────────────────────────┤
│ Su  Mo  Tu  We  Th  Fr  Sa             │
│     1   2   3   4   5   6              │
│ 7   8   9  [10][11][12] 13             │
│ 14  15  16  17  18  19  20             │
│ 21  22  23  24  25  26  27             │
│ 28  29  30  31                         │
└─────────────────────────────────────────┘

Styling:
- Trigger: 40px height, border, 8px radius
- Dropdown: Card background, shadow, 8px radius
- Selected Range: Primary color background
- Hover: Muted background
```

### 5. Connection Status Badge

```
Connected:
┌────────────────────┐
│ ✓ Connected        │  Green background, green text
└────────────────────┘

Disconnected:
┌────────────────────┐
│ ○ Disconnected     │  Gray background, gray text
└────────────────────┘

Error:
┌────────────────────┐
│ ⚠ Error            │  Red background, red text
└────────────────────┘

Styling:
- Height: 28px
- Padding: 4px 12px
- Border Radius: 14px (pill)
- Icon: 16px
- Text: 14px, medium weight
```

### 6. AI Chat Widget

```
Collapsed:
          ┌────────────────┐
          │  💬 Ask AI     │
          └────────────────┘
          56px wide, floating bottom-right

Expanded:
┌─────────────────────────────────────────┐
│ AI Marketing Assistant           ✕     │
├─────────────────────────────────────────┤
│                                         │
│ Chat history area                       │
│ Scrollable                              │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ User message bubble              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ AI response bubble               │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌────┐ │
│ │ Type your question...       │ │Send│ │
│ └─────────────────────────────┘ └────┘ │
└─────────────────────────────────────────┘

Dimensions:
- Width: 400px
- Height: 500px
- Position: Fixed, bottom-right, 24px margin
- Shadow: Elevated
- Border Radius: 12px
```

---

## Dashboard Modules

### 1. Executive Dashboard

**Purpose**: High-level overview for leadership

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back   Executive Summary                    Date Picker   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Month-over-Month Summary (4 columns)                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │Sessions  │ │Conversions│ │ Revenue  │ │   ROI    │        │
│ │  +8.5%   │ │  +12.3%  │ │  +15.2%  │ │  +22%    │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │                         │ │                             │ │
│ │  Daily Bounce Rates     │ │  Quarterly Revenue          │ │
│ │  (Line Chart)           │ │  (Bar Chart)                │ │
│ │                         │ │                             │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  Monthly Revenue YTD (Area Chart - Full Width)          │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. Google Ads Dashboard

**Purpose**: Paid search performance tracking

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back   Google Ads                           Date Picker   │
│          Google Analytics & Google Ads metrics              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Universal KPIs Row 1 (5 columns)                            │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │Sessions│ │ Users  │ │New User│ │Conv    │ │Total   │     │
│ │        │ │        │ │   %    │ │Rate    │ │Convs   │     │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
│                                                             │
│ Universal KPIs Row 2 (5 columns)                            │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │Revenue │ │Cost/   │ │  ROI   │ │Bounce  │ │Avg Sess│     │
│ │        │ │Conv    │ │        │ │Rate    │ │Duration│     │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
│                                                             │
│ Google Ads Specific (4 columns)                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │Impressions│ │   CTR    │ │   CPC    │ │ Quality  │        │
│ │          │ │          │ │          │ │  Score   │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │                         │ │                             │ │
│ │  Search Term Performance│ │  Campaign ROI               │ │
│ │  (Horizontal Bar)       │ │  (Grouped Bar)              │ │
│ │                         │ │                             │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. Marketing Cloud Dashboard

**Purpose**: Email marketing performance

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back   Marketing Cloud Dashboard            Date Picker   │
│          Salesforce Marketing Cloud metrics                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Universal KPIs (2 rows x 5 columns) - Same as Google Ads    │
│                                                             │
│ Core Email Metrics (4 columns)                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │Open Rate │ │   CTR    │ │ Unique   │ │Click to  │        │
│ │  30.0%   │ │   7.2%   │ │ Clicks   │ │  Open    │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ Email Delivery (3 columns)                                  │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │Bounce Rate   │ │Unsubscribe   │ │Emails Sent   │          │
│ │(Delivery)    │ │Rate          │ │              │          │
│ └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │                         │ │                             │ │
│ │  Email Performance      │ │  GA4 Email Attribution      │ │
│ │  Trends (Line Chart)    │ │  (Bar Chart)                │ │
│ │                         │ │                             │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4. Direct Mail Dashboard

**Purpose**: Physical mail campaign tracking

**Unique Elements**:
- Postcard variant selector (dropdown)
- Mail type filter
- Campaign aggregation table

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back   Direct Mail Campaigns                Date Picker   │
│                                                             │
│ Filter Controls:                                            │
│ ┌────────────────┐ ┌────────────────┐                       │
│ │ Postcard ▼     │ │ Mail Type ▼   │                       │
│ └────────────────┘ └────────────────┘                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ KPI Cards (6 columns)                                       │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │Mailed  │ │Scanned │ │Visited │ │Gross   │ │  ROI   │ ... │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  Postcard Variant Comparison (Bar Chart)                │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  Revenue by Campaign Table                              │ │
│ │  ┌──────────┬─────────┬──────────┬─────────┬─────────┐  │ │
│ │  │ Campaign │ Mailed  │ Visited  │ Revenue │   ROI   │  │ │
│ │  ├──────────┼─────────┼──────────┼─────────┼─────────┤  │ │
│ │  │ Spring   │ 12,500  │   450    │ $28,500 │  245%   │  │ │
│ │  │ Summer   │ 15,000  │   520    │ $32,100 │  312%   │  │ │
│ │  └──────────┴─────────┴──────────┴─────────┴─────────┘  │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Visualization

### Chart Color Scheme

| Series | Color | HSL | Usage |
|--------|-------|-----|-------|
| Primary | Blue | hsl(220, 70%, 55%) | Main data series |
| Secondary | Green | hsl(155, 70%, 45%) | Positive/growth metrics |
| Tertiary | Purple | hsl(280, 65%, 55%) | Third data series |
| Quaternary | Amber | hsl(38, 90%, 55%) | Fourth data series |
| Negative | Red | hsl(0, 72%, 55%) | Costs, negative values |

### Chart Types Used

#### 1. Bar Chart (Vertical)
- **Usage**: Comparing discrete categories
- **Examples**: Campaign ROI, Monthly Revenue
- **Bar Radius**: 4px top corners
- **Bar Width**: Auto (max 60px)
- **Spacing**: 4px between bars in groups

#### 2. Bar Chart (Horizontal)
- **Usage**: Ranking/comparison lists
- **Examples**: Search Terms, Channel Performance
- **Bar Radius**: 4px right corners
- **Label Width**: 100-120px
- **Y-Axis**: Category labels

#### 3. Line Chart
- **Usage**: Trends over time
- **Examples**: Daily Performance, Email Trends
- **Stroke Width**: 2px
- **Dots**: Hidden by default, show on hover
- **Area Fill**: Optional, 60% opacity

#### 4. Area Chart
- **Usage**: Volume/cumulative data
- **Examples**: Traffic Trends, Revenue YTD
- **Fill Opacity**: 0.6
- **Stroke Width**: 2px
- **Stacking**: Optional

#### 5. Composed Chart
- **Usage**: Multiple metric types together
- **Examples**: Revenue vs Cost vs Profit
- **Combines**: Bars + Lines

#### 6. Pie/Donut Chart
- **Usage**: Part-to-whole relationships
- **Examples**: Traffic Source Distribution
- **Inner Radius**: 60px (donut)
- **Outer Radius**: 100px
- **Padding Angle**: 2px
- **Labels**: External, "Name: Value%"

### Chart Grid & Axes

```
Axis Styling:
- Color: muted-foreground
- Font Size: 12px (X-axis), 12px (Y-axis)
- Tick Line: None
- Axis Line: 1px, muted

Grid Styling:
- Stroke Dasharray: "3 3"
- Color: border color
- Horizontal Only: Common default

Tooltip Styling:
- Background: Card color
- Border: 1px solid border
- Border Radius: 8px
- Padding: 12px
- Shadow: sm
```

---

## Interaction States

### Button States

| State | Style |
|-------|-------|
| Default | Background: primary, Text: white |
| Hover | Background: primary/90 |
| Active | Background: primary/80, scale: 0.98 |
| Disabled | Opacity: 0.5, cursor: not-allowed |
| Loading | Show spinner, disabled |

### Card States

| State | Style |
|-------|-------|
| Default | Border: 1px solid border |
| Hover | Shadow: elevated, border: primary/20 |
| Active/Selected | Border: 2px solid primary |

### Input States

| State | Style |
|-------|-------|
| Default | Border: 1px solid border |
| Focus | Border: 2px solid primary, ring |
| Error | Border: 2px solid error |
| Disabled | Background: muted, opacity: 0.7 |

### Loading States

```
Skeleton Loading:
┌─────────────────────────────────────┐
│ ████████████                        │  Animated pulse
│ ████████████████████                │  Gray background
│ ████████                            │  Rounded corners
└─────────────────────────────────────┘

Spinner Loading:
┌─────────────────────────────────────┐
│                                     │
│           ◠ (rotating)              │  20x20px
│                                     │  Primary color
│           Loading...                │  Optional text
│                                     │
└─────────────────────────────────────┘

Sample Data Indicator:
┌─────────────────────────────────────┐
│ Dashboard Title (showing sample data)│
│                   ↑                  │
│           Amber colored text        │
│           12px, inline              │
└─────────────────────────────────────┘
```

---

## Responsive Behavior

### Breakpoints

| Name | Width | Columns |
|------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640px - 1024px | 2 |
| Desktop | 1024px - 1280px | 4 |
| Large | > 1280px | 5 |

### Component Adaptations

#### KPI Cards Grid
- **Mobile**: 2 columns, stack vertically
- **Tablet**: 2-3 columns
- **Desktop**: 4-5 columns

#### Chart Cards
- **Mobile**: Full width, stack
- **Tablet**: Full width, stack
- **Desktop**: 2 columns side-by-side

#### Navigation Cards (Home)
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 4 columns

#### Header
- **Mobile**: Logo only, hamburger menu
- **Tablet**: Logo + status, actions in menu
- **Desktop**: Full layout

### Touch Targets
- Minimum: 44x44px for interactive elements
- Buttons: 40px height minimum
- Icons in buttons: 20x20px

---

## Animation & Transitions

### Page Transitions
```css
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Micro-interactions
- **Hover**: 200ms ease
- **Focus**: 150ms ease
- **Color change**: 200ms ease
- **Transform**: 200ms ease-out

### Loading Animations
- **Skeleton pulse**: 2s infinite
- **Spinner rotation**: 1s linear infinite
- **Progress bar**: 300ms ease

---

## Accessibility

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear focus states

### Keyboard Navigation
- Tab order: Logical flow
- Focus visible: 2px ring
- Skip links: Hidden until focused

### Screen Readers
- All images: Alt text
- Icons: aria-label
- Charts: Data tables as fallback
- Status badges: aria-live regions

---

## Icon Library

Using **Lucide React** icons:

| Icon | Usage |
|------|-------|
| `ArrowLeft` | Back navigation |
| `Eye` | Views/Sessions |
| `Users` | Users/Audience |
| `TrendingUp` | Growth/ROI |
| `DollarSign` | Revenue/Cost |
| `MousePointer` | Clicks/CTR |
| `Percent` | Percentages |
| `Clock` | Duration/Time |
| `Mail` | Email metrics |
| `Search` | SEO/Search |
| `Globe` | Website/Traffic |
| `Target` | Goals/Conversions |
| `Star` | Quality Score |
| `Heart` | Engagement |
| `Share2` | Shares |
| `UserPlus` | Followers |
| `FileSpreadsheet` | CSV/Data |
| `Cloud` | Google Drive |
| `Settings` | Configuration |
| `Sun`/`Moon` | Theme toggle |
| `Loader2` | Loading spinner |
| `Check` | Success |
| `X` | Close/Error |
| `AlertCircle` | Warning/Info |

---

## File Assets

### Logos
- `logo-light.png` - For dark backgrounds
- `logo-dark.png` - For light backgrounds
- Dimensions: Maintain aspect ratio, max 200px width

### Favicon
- 32x32px PNG
- Match primary brand color

---

*Design Specification v1.0 - Bolt Marketing Dashboard*
