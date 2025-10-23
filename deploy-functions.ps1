# Deploy Supabase Edge Functions Script (PowerShell)

Write-Host "🚀 Deploying AgriSense Edge Functions..." -ForegroundColor Green

# Check if user is logged in
try {
    npx supabase status | Out-Null
    Write-Host "✅ Already logged in to Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Supabase. Please run: npx supabase login" -ForegroundColor Red
    Write-Host "This will open your browser to authenticate with Supabase." -ForegroundColor Yellow
    exit 1
}

# Deploy identify-plant function
Write-Host "📱 Deploying identify-plant function..." -ForegroundColor Blue
npx supabase functions deploy identify-plant

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ identify-plant function deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy identify-plant function" -ForegroundColor Red
}

# Deploy diagnose-disease function  
Write-Host "🔬 Deploying diagnose-disease function..." -ForegroundColor Blue
npx supabase functions deploy diagnose-disease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ diagnose-disease function deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy diagnose-disease function" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Supabase Dashboard → Settings → Edge Functions" -ForegroundColor White
Write-Host "2. Add environment variable: LOVABLE_API_KEY=your-api-key" -ForegroundColor White
Write-Host "3. Update your .env.local with real Supabase credentials" -ForegroundColor White
Write-Host "4. Restart your development server" -ForegroundColor White
