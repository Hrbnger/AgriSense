# AI API Key Setup Guide

## Option 1: Use Lovable AI (Current Setup)

### Get Lovable AI API Key:
1. Visit [https://lovable.dev](https://lovable.dev)
2. Sign up/Login to your account
3. Go to API Keys section in dashboard
4. Copy your API key

### Add to Supabase:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ggktiwtwudznpvgjcwyi)
2. Navigate to **Edge Functions** → **Environment Variables**
3. Add new variable:
   - **Name**: `LOVABLE_API_KEY`
   - **Value**: Your Lovable AI key
4. Save and redeploy functions

## Option 2: Use OpenAI (Alternative)

### Get OpenAI API Key:
1. Visit [https://platform.openai.com](https://platform.openai.com)
2. Sign up/Login to your account
3. Go to API Keys section
4. Create new API key
5. Copy the key (starts with `sk-`)

### Add to Supabase:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ggktiwtwudznpvgjcwyi)
2. Navigate to **Edge Functions** → **Environment Variables**
3. Add new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI key
4. Save and redeploy functions

## Option 3: Use Free AI Services

### Google Gemini (Free Tier):
1. Visit [https://makersuite.google.com](https://makersuite.google.com)
2. Get API key from Google AI Studio
3. Add as `GEMINI_API_KEY` in Supabase

### Anthropic Claude (Free Tier):
1. Visit [https://console.anthropic.com](https://console.anthropic.com)
2. Get API key
3. Add as `ANTHROPIC_API_KEY` in Supabase

## Testing Your Setup

After adding the API key:
1. Restart your development server: `npm run dev`
2. Try uploading a plant image
3. Check if you get real AI analysis instead of demo data

## Troubleshooting

- **Still getting demo data?** Check that the API key is correctly added to Supabase
- **Getting errors?** Verify the API key is valid and has credits
- **Need help?** Check the Supabase Edge Functions logs in the dashboard
