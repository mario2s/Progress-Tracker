# Progress Tracker App

A modern progress tracking application built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- ✅ Create targets with name and duration in hours
- ✅ Track progress with +1 button (adds 15 minutes)
- ✅ Real-time progress bar visualization
- ✅ Convert target hours to minutes for display
- ✅ Save targets and progress in Supabase
- ✅ Reset or delete targets
- ✅ Responsive design with Tailwind CSS

## Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your Project URL and Anon Key from Project Settings > API

#### Create Database Schema

Run the following SQL in your Supabase SQL editor:

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

-- Create indexes for better performance
CREATE INDEX idx_targets_created_at ON targets(created_at);

-- Enable Row Level Security
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (modify as needed for your security requirements)
CREATE POLICY "Enable all for authenticated users"
ON targets FOR ALL
USING (true)
WITH CHECK (true);
```

### 3. Environment Configuration

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:

```bash
npm run build
```

## Deployment to Vercel

### Auto-deploy via GitHub (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project" and import the repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click Deploy

Every subsequent `git push` to `main` will auto-deploy.

### Manual Deploy via CLI

```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

## Project Structure

```
src/
├── components/
│   ├── TargetForm.tsx      # Form to create new targets
│   └── TargetCard.tsx      # Card component for displaying targets
├── lib/
│   ├── supabase.ts         # Supabase client and database service
│   └── timeUtils.ts        # Time formatting utilities
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css              # Tailwind CSS styles
```

## Usage

1. **Create a Target**: Fill in the target name and hours, click "Create Target"
2. **Track Progress**: Click "+1 (15 min)" button to add 15 minutes to your progress
3. **View Progress**: The progress bar shows your advancement toward the target
4. **Reset Progress**: Click "Reset" to start over with the same target
5. **Delete Target**: Click "Delete" to remove the target

## Features Explained

### Target Creation
- Enter a target name (e.g., "Learning React")
- Specify target duration in hours (e.g., 10 hours)
- Click "Create Target" to save to Supabase

### Progress Tracking
- Each "+1" button click adds 15 minutes to progress
- Progress is saved immediately to Supabase
- Visual progress bar updates in real-time

### Time Conversion
- Target hours are automatically converted to minutes for storage
- Display shows progress in hours and minutes format
- Remaining time calculated automatically

### Progress Visualization
- Color-coded progress bar (blue gradient)
- Percentage display
- Breakdown of Progress / Target / Remaining time

## Future Enhancements

- User authentication
- Multiple target categories
- Progress history and charts
- Estimated completion time
- Progress notifications
- Dark mode support

## License

MIT
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
