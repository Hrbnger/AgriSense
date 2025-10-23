# AgriSense - Setup Instructions

## 🚀 Quick Start (Demo Mode)

The app currently runs in **Demo Mode** with mock data. You can test all features immediately!

## 🔧 Enable Real AI Features

To enable real AI-powered plant identification and disease diagnosis, follow these steps:

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be set up (usually takes 2-3 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env.local` file in the project root with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### 3. Deploy Edge Functions

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-id`
4. Deploy functions: `supabase functions deploy`

### 4. Configure AI API Key

1. Get an API key from [Lovable AI](https://lovable.dev) or similar AI service
2. In Supabase dashboard, go to **Settings** → **Edge Functions**
3. Add environment variable: `LOVABLE_API_KEY=your-api-key`

### 5. Restart Development Server

```bash
npm run dev
```

## ✅ What You'll Get

- **Real AI Plant Identification**: Accurate plant species identification with detailed botanical information
- **Real AI Disease Diagnosis**: Professional plant disease analysis and treatment recommendations
- **Database Storage**: Save your plant identifications and disease diagnoses
- **User Authentication**: Secure user accounts and data

## 🎯 Features Available

### Demo Mode (Current)
- ✅ Mock plant identification with sample data
- ✅ Mock disease diagnosis with sample data
- ✅ Full UI/UX experience
- ✅ All navigation and features

### Full Mode (After Setup)
- ✅ Real AI-powered plant identification
- ✅ Real AI-powered disease diagnosis
- ✅ User authentication and profiles
- ✅ Data persistence and history
- ✅ Forum discussions
- ✅ Weather integration

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your `.env.local` file has correct credentials
3. Ensure edge functions are deployed successfully
4. Check that your AI API key is valid and has credits

## 📱 Mobile Support

The app works perfectly on mobile devices with:
- Camera integration for taking photos
- Touch-friendly interface
- Responsive design
- Offline capability (demo mode)
