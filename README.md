# Pallavi Maths Classes — Setup Guide

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (Edge-ready)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth (Google OAuth)
- **Hosting**: Vercel
- **PWA**: next-pwa (offline capable, installable on mobile/desktop)

---

## Step 1 — Create Supabase Project

1. Go to https://supabase.com → New project
2. Name it `pallavi-maths-classes`
3. Save your database password
4. Wait for the project to be ready (~2 min)

### Run the database migration

In Supabase dashboard → SQL Editor, paste and run the contents of:
```
supabase/migrations/001_init.sql
```

### Enable Google OAuth in Supabase

1. Supabase → Authentication → Providers → Google → Enable
2. Go to https://console.cloud.google.com
3. Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
4. Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret back to Supabase Google provider settings
6. In Supabase Auth → URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/admin/login`

---

## Step 2 — Deploy to Vercel

1. Push this code to a GitHub repository
2. Go to https://vercel.com → New Project → Import from GitHub
3. Add these Environment Variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...  (anon/public key)
SUPABASE_SERVICE_ROLE_KEY       = eyJ...  (service_role key)
NEXT_PUBLIC_APP_URL             = https://your-app.vercel.app
```

4. Deploy! Vercel will auto-build and deploy.

---

## Step 3 — Install as PWA on your phone

### Android (Chrome)
1. Open your Vercel URL in Chrome
2. Tap the "⋮" menu → "Add to Home screen"
3. Done! Opens like an app, works offline

### iPhone (Safari)
1. Open your Vercel URL in Safari
2. Tap the Share button (📤) → "Add to Home Screen"
3. Done!

---

## Pages & URLs

| Page | URL | Access |
|------|-----|--------|
| Landing page | `/` | Public |
| Admin (redirects) | `/admin` | Pallavi only |
| Attendance | `/admin/attendance` | Pallavi only |
| Create exam | `/admin/create-exam` | Pallavi only |
| Manage students | `/admin/students` | Pallavi only |
| Result links | `/admin/result-links` | Pallavi only |
| Exam result | `/exam/[slug]` | Public (when published) |
| Student sheet | `/student/[slug]` | Public |

---

## How device memory works

When Pallavi logs in with Google on her phone or laptop:
1. A device fingerprint (hash of browser + hardware) is saved to the database
2. A cookie is set for 1 year
3. Next time she opens the app, no login needed — device is recognised

---

## Generating PWA icons

You need to create PNG icons in `/public/icons/` at these sizes:
72, 96, 128, 144, 152, 192, 384, 512

Quick way: Use https://realfavicongenerator.net or https://www.pwabuilder.com/imageGenerator
with a simple "M" on orange background (#EA580C).

---

## pgvector (future AI features)

The database already has `vector` extension enabled. You can use it later for:
- Smart student grouping (similar performance patterns)
- Question bank with semantic search
- AI-powered progress insights

To add an embedding column:
```sql
ALTER TABLE students ADD COLUMN embedding vector(1536);
```

---

## WhatsApp link

The "Ask about Admission" button links to:
```
https://wa.me/919871494741?text=Hello%20Mam%2C%20I%20want%20to%20talk%20about%20my%20kids%20Maths%20Classes.
```

This pre-fills the WhatsApp message — user just taps Send.

---

## Troubleshooting

**Login not working**: Check that `pallaviclasses@gmail.com` is the Google account being used. Other emails are blocked.

**Supabase RLS errors**: Make sure service_role key is set in Vercel env vars.

**PWA not installing**: Must be served over HTTPS (Vercel does this automatically).
