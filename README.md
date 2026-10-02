# IBM Platform
Next.js + Supabase + Vercel

## Local
1. Copy `.env.local.example` → `.env.local` and fill Supabase keys
2. Run SQL from `supabase/schema.sql` in Supabase SQL Editor
3. `npm run dev` → http://localhost:3000
4. Register a user, then in Supabase Table Editor set `profiles.role = admin` for your user

## Deploy
Push to GitHub → Import on Vercel → add the same env vars → Deploy
