# 🚀 SaaS Auditor MVP - Deployment Guide

## Quick Start (5 minutes)

### 1. Create Supabase Account & Project
1. Go to https://supabase.com
2. Sign up (free tier available)
3. Create a new project (select "Next.js" template if available)
4. Note your project URL and API keys

### 2. Create Database Tables
In Supabase Dashboard → SQL Editor, run this:

```sql
-- Create audits table
create table audits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  filename text not null,
  total_spend numeric,
  saas_count int,
  categories jsonb,
  saas_list jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create indexes
create index audits_user_id_idx on audits(user_id);
create index audits_created_at_idx on audits(created_at desc);

-- Enable RLS
alter table audits enable row level security;
create policy "Users can view own audits" on audits for select using (auth.uid() = user_id);
create policy "Users can insert own audits" on audits for insert with check (auth.uid() = user_id);
create policy "Users can update own audits" on audits for update using (auth.uid() = user_id);
create policy "Users can delete own audits" on audits for delete using (auth.uid() = user_id);
```

### 3. Get Your API Keys
1. Go to Settings → API
2. Copy:
   - **Project URL** → NEXT_PUBLIC_SUPABASE_URL
   - **Anon Key** → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **Service Role Key** → SUPABASE_SERVICE_ROLE_KEY

### 4. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo (if pushed) OR upload this folder
3. Set environment variables (from step 3)
4. Click "Deploy"
5. Your app is now live! 🎉

---

## Environment Variables (Vercel)

Add these to Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local (copy from .env.local.example and fill in your Supabase keys)
cp .env.local.example .env.local

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## Features Included

✅ **Authentication**
- Email/password signup & login
- Magic link authentication
- Session management

✅ **CSV Upload**
- Drag & drop interface
- Automatic file validation
- Batch processing

✅ **SaaS Categorization**
- 150+ vendor database
- Automatic category detection
- Fallback categorization

✅ **Cost Analysis**
- Monthly & annual calculations
- Cost per user
- Trend analysis

✅ **Report Generation**
- PDF export (board-ready)
- JSON export (data)
- Visualizations (charts)

✅ **User Dashboard**
- Save audit history
- View past reports
- Delete old audits

---

## Tech Stack

- **Framework:** Next.js 15 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **File Parsing:** PapaParse (CSV)
- **PDF Export:** jsPDF + jsPDF-AutoTable
- **Charts:** Recharts
- **UI Components:** Lucide React

---

## File Structure

```
saas-auditor-mvp/
├── pages/
│   ├── index.tsx          # Login page
│   ├── dashboard.tsx      # Audit history
│   ├── audit/
│   │   ├── new.tsx        # Upload & analyze
│   │   └── [id].tsx       # View audit
│   ├── _app.tsx
│   └── _document.tsx
├── lib/
│   ├── supabase.ts        # DB client
│   ├── csv-parser.ts      # CSV parsing
│   ├── saas-categories.ts # Vendor DB
│   └── pdf-export.ts      # PDF generation
├── types/
│   └── index.ts           # TypeScript types
├── styles/
│   └── globals.css        # Tailwind + custom styles
├── public/                # Static assets
└── package.json
```

---

## Next Steps

1. **Customize branding**
   - Update colors in `tailwind.config.ts`
   - Change logo in pages/index.tsx

2. **Add more vendors**
   - Edit `lib/saas-categories.ts`
   - Add new entries to vendor database

3. **Email notifications**
   - Integrate SendGrid or similar
   - Email users when reports are ready

4. **Advanced analytics**
   - Track trends over time
   - Show ROI recommendations
   - Set alerts for unusual spend

5. **Team collaboration**
   - Add team management
   - Share reports between users
   - Approval workflows

---

## Support

- **Documentation:** https://docs.supabase.com
- **Next.js Guide:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs

---

**Built with 🚀 by Claude Code**
