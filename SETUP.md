# Progress Tracker - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

#### Step 1: Create a Supabase Project
1. Visit [supabase.com](https://supabase.com)
2. Sign up or login
3. Create a new project
4. Copy your **Project URL** and **Anon Key** from Project Settings > API

#### Step 2: Create Database Schema
In your Supabase dashboard, go to SQL Editor and run this:

```sql
-- Create targets table
CREATE TABLE targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_hours NUMERIC NOT NULL,
  progress_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_targets_created_at ON targets(created_at);

-- Enable Row Level Security
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Enable all for authenticated users"
ON targets FOR ALL
USING (true)
WITH CHECK (true);
```

#### Step 3: Set Environment Variables
Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the values with your actual Supabase credentials from Step 1.

### 3. Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## App Features

### Create a Target
- Enter target name (e.g., "Learn TypeScript")
- Set target in hours (e.g., 20 hours)
- Click "Create Target"
- Target is saved to Supabase automatically

### Track Progress
- Click "+1 (15 min)" button to add 15 minutes
- Progress bar updates in real-time
- Data syncs to Supabase immediately

### View Progress
- **Progress Bar**: Visual representation of completion
- **Percentage**: Shows completion percentage
- **Time Format**: Displays hours and minutes
- **Remaining**: Shows time left to reach target

### Reset or Delete
- **Reset**: Clears progress, keeps target
- **Delete**: Removes target completely

## Deployment to Netlify

### Option 1: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Select GitHub and your repository
5. Configure settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Set environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy site"

### Option 2: Manual Deployment
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## Project Structure

```
progress-tracker/
├── src/
│   ├── components/
│   │   ├── TargetForm.tsx       # Form for creating targets
│   │   └── TargetCard.tsx       # Target display with progress
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client & database service
│   │   └── timeUtils.ts         # Time formatting utilities
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # App styles
│   ├── index.css                # Global styles with Tailwind
│   └── main.tsx                 # Entry point
├── public/                       # Static assets
├── dist/                         # Production build (generated)
├── .env.local                    # Environment variables (local only)
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── netlify.toml                  # Netlify deployment config
├── package.json                  # Dependencies
└── README.md                      # Documentation
```

## Key Technologies

| Technology | Purpose |
|-----------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Supabase | Backend & Database |
| Netlify | Deployment |

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart dev server after changing `.env.local`

### Database connection errors
- Verify Supabase project is active
- Check credentials are correct
- Ensure `targets` table exists
- Check Row Level Security policies

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Verify Node.js version is 18 or higher: `node --version`

### Netlify deployment fails
- Check build command: `npm run build`
- Verify publish directory: `dist`
- Ensure environment variables are set in Netlify
- Check build logs in Netlify dashboard

## Performance Tips

1. **Database Optimization**: Indexes are created on `created_at` for faster queries
2. **Caching**: Netlify config includes cache headers for assets
3. **Code Splitting**: Vite automatically optimizes bundle splitting
4. **Lazy Loading**: React components load on demand

## Security Notes

- Never commit `.env.local` to version control
- Use `.env.local` for local development only
- Set environment variables in Netlify dashboard for production
- Supabase RLS policies should be configured based on your needs
- Current setup uses public access - customize as needed

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure Supabase
3. ✅ Set up environment variables
4. ✅ Test locally with `npm run dev`
5. ✅ Build with `npm run build`
6. ✅ Deploy to Netlify

## Support & Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com)
