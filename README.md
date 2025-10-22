# AgriSense

An intelligent agricultural platform for plant identification, disease diagnosis, and farming insights.

## Features

- 🌱 Plant identification using AI
- 🦠 Disease diagnosis and treatment recommendations
- 🌤️ Weather integration for farming insights
- 👥 Community forum for farmers
- 📊 Dashboard with analytics and insights
- 🔐 User authentication and profiles

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd agrisense
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings > API
   - Copy the Project URL and anon/public key

3. Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

### 4. Database Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-id
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

### 5. Deploy Edge Functions (Optional)

If you want to use the AI-powered plant identification and disease diagnosis features:

```bash
supabase functions deploy identify-plant
supabase functions deploy diagnose-disease
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. Add environment variables in Netlify dashboard

### Option 3: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update `package.json` scripts:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

### Option 4: Traditional Web Hosting

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist` folder to your web server

3. Configure your web server to serve `index.html` for all routes (SPA routing)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key | Yes |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ThemeProvider.tsx
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Page components
└── main.tsx           # App entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the GitHub repository.