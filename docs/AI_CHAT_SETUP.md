# AI Chat Assistant Setup

## Overview

The AI Chat Assistant allows users to ask natural language questions about their marketing data across all dashboards. It uses Claude AI to analyze the data and provide insights, comparisons, and recommendations.

## Features

- **Conversational Interface**: Ask questions in plain English about your data
- **Multi-Source Analysis**: Queries data from all dashboards (Direct Mail, Executive Summary, Revenue, etc.)
- **Persistent Chat History**: Conversations are saved in the database
- **Context-Aware**: The AI has access to all your marketing metrics and can provide data-driven insights

## Configuration

The AI Chat feature requires an Anthropic API key to function. The system is designed to work automatically once configured.

### Getting an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-ant-...`)

### Setting Up the API Key

The ANTHROPIC_API_KEY is automatically configured in your Supabase environment. The edge function will use this key to communicate with Claude AI.

## Usage

### Opening the Chat

Click the floating chat button (message icon) in the bottom-right corner of any page.

### Example Questions

Here are some questions you can ask:

**Campaign Performance:**
- "How is the direct mail campaign performing?"
- "Which postcard variant has the best engagement?"
- "Compare postcardA vs postcardB performance"

**Revenue Analysis:**
- "What's our revenue trend over the quarters?"
- "Which month had the highest revenue?"
- "Calculate our YTD revenue growth rate"

**User Metrics:**
- "What's our new user percentage this month?"
- "How has bounce rate changed over time?"
- "What's the conversion rate trend?"

**Insights & Recommendations:**
- "What are the key insights from the executive summary?"
- "Which campaigns should we invest more in?"
- "What metrics need improvement?"

**Comparative Analysis:**
- "Compare month-over-month performance"
- "How do different ad contents perform?"
- "What's the correlation between sessions and conversions?"

### Chat Controls

- **Send Message**: Press Enter or click the send button
- **Clear History**: Click the trash icon to clear all messages
- **Close Chat**: Click the X button to close the chat widget

## Data Access

The AI assistant has read access to the following data:

- **Direct Mail Campaigns**: All postcard variants, user engagement, revenue
- **Executive Summary**: Date range and month-over-month metrics
- **Quarterly Revenue**: Revenue breakdown by quarter
- **Monthly Revenue**: YTD monthly revenue data
- **Daily Bounce Rates**: Daily trend data

## Technical Details

### Architecture

1. **Frontend**: React chat widget component (`AiChatWidget.tsx`)
2. **Edge Function**: `ai-chat` function processes requests
3. **Database**: `ai_chat_messages` table stores conversation history
4. **AI Model**: Claude 3.5 Sonnet (via Anthropic API)

### How It Works

1. User types a question in the chat interface
2. Message is sent to the `ai-chat` edge function
3. Edge function queries all relevant data from Supabase
4. Data is packaged as context and sent to Claude AI
5. Claude analyzes the data and generates a response
6. Response is saved to database and displayed to user

### Data Privacy

- All data queries happen server-side via the edge function
- API keys are stored securely in Supabase environment
- Chat history is stored in your Supabase database
- No data is sent to third parties except Anthropic for AI processing

## Troubleshooting

### "AI service is not configured" error

This means the ANTHROPIC_API_KEY environment variable is not set. The system handles this automatically, but if you see this error, the key may need to be configured.

### Slow Responses

- Claude AI typically responds in 2-5 seconds
- Large datasets may take slightly longer to process
- Check your internet connection if responses are taking >10 seconds

### Chat History Not Loading

- Check browser console for errors
- Verify Supabase connection is active
- Try clearing and restarting the chat

## Future Enhancements

Potential improvements for the AI Chat feature:

- Voice input/output
- Chart and visualization generation
- Export chat conversations
- Multi-turn context retention
- Custom prompt templates
- Integration with more data sources
