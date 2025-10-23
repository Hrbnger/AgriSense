#!/bin/bash
# Deploy Supabase Edge Functions Script

echo "🚀 Deploying AgriSense Edge Functions..."

# Check if user is logged in
if ! npx supabase status > /dev/null 2>&1; then
    echo "❌ Not logged in to Supabase. Please run: npx supabase login"
    exit 1
fi

# Deploy identify-plant function
echo "📱 Deploying identify-plant function..."
npx supabase functions deploy identify-plant

# Deploy diagnose-disease function  
echo "🔬 Deploying diagnose-disease function..."
npx supabase functions deploy diagnose-disease

echo "✅ Edge functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Supabase Dashboard → Settings → Edge Functions"
echo "2. Add environment variable: LOVABLE_API_KEY=your-api-key"
echo "3. Update your .env.local with real Supabase credentials"
echo "4. Restart your development server"
