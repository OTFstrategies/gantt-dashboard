# Deployment Checklist - Gantt Dashboard

## ✅ COMPLETED

### Phase 1: Pre-deployment Quality Checks
- [x] TypeScript: 0 errors
- [x] Tests: 41/41 passing (100%)
- [x] Build: Succesvol (Next.js 16.1.1, 18 routes)

### Netlify Setup
- [x] Repository connected: github.com/OTFstrategies/gantt-dashboard
- [x] Build settings configured (Node 20, Next.js)
- [x] Environment variables added:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL
  - NEXT_PUBLIC_ENV=production
- [x] TypeScript jsx errors fixed (60 replacements in 34 files)
- [x] Deployment successful: https://jazzy-malabi-370d03.netlify.app

### Database Preparation
- [x] Combined migrations file created: `supabase/combined_migrations.sql` (3,103 lines)
- [x] Migrations include:
  - 001_core_tables.sql (411 lines)
  - 002_project_tables.sql (499 lines)
  - 003_feature_tables.sql (590 lines)
  - 004_rls_policies.sql (670 lines)
  - 005_indexes.sql (291 lines)
  - 006_triggers.sql (642 lines)

---

## ⏳ TODO - Phase 2: Database Setup

### Supabase SQL Editor - Execute Migrations
1. [ ] Navigate to https://supabase.com/dashboard
2. [ ] Select project: dashboard (jtpnytjxzktyvvaywngr)
3. [ ] Go to SQL Editor
4. [ ] Create new query
5. [ ] Copy content from `supabase/combined_migrations.sql`
6. [ ] Paste into SQL Editor
7. [ ] Click "Run" to execute
8. [ ] Verify success (check for green checkmarks, no errors)

**Alternative - Individual migrations:**
If combined file fails, execute individually in order:
1. 001_core_tables.sql
2. 002_project_tables.sql
3. 003_feature_tables.sql
4. 004_rls_policies.sql
5. 005_indexes.sql
6. 006_triggers.sql

---

## ⏳ TODO - Phase 3: Supabase Configuration

### Authentication Settings
1. [ ] Navigate to Supabase Dashboard > Authentication > URL Configuration
2. [ ] Update Site URL: `https://jazzy-malabi-370d03.netlify.app`
3. [ ] Add Redirect URL: `https://jazzy-malabi-370d03.netlify.app/auth/callback`
4. [ ] Click "Save"

### Optional: Enable Email Auth
1. [ ] Go to Authentication > Providers
2. [ ] Enable Email provider
3. [ ] Configure SMTP settings (or use Supabase default)

---

## ⏳ TODO - Phase 4: Live Testing

### Test Homepage
1. [ ] Visit https://jazzy-malabi-370d03.netlify.app
2. [ ] Verify page loads without errors
3. [ ] Check browser console (F12) for errors

### Test All 4 Views
Need a project ID first - create via:
1. [ ] Navigate to https://jazzy-malabi-370d03.netlify.app
2. [ ] Create a test project
3. [ ] Test each view:
   - [ ] Gantt: `/projects/[id]/gantt`
   - [ ] Calendar: `/projects/[id]/calendar`
   - [ ] TaskBoard: `/projects/[id]/taskboard`
   - [ ] Grid: `/projects/[id]/grid`

### Test Data Persistence
1. [ ] Create a task in Gantt view
2. [ ] Switch to Calendar view - verify task appears
3. [ ] Modify task in Calendar view
4. [ ] Switch to Grid view - verify changes saved
5. [ ] Refresh page - verify data persists

### Verify Database
1. [ ] Go to Supabase Dashboard > Table Editor
2. [ ] Check `tasks` table has data
3. [ ] Check `projects` table has data
4. [ ] Verify RLS policies are active

---

## ⏳ TODO - Phase 5: Post-Deployment

### Documentation
- [ ] Update README with live URL
- [ ] Document deployment date
- [ ] Create deployment report

### Optional Enhancements
- [ ] Enable Netlify Analytics
- [ ] Setup error monitoring (Sentry)
- [ ] Configure automated backups
- [ ] Add custom domain

---

## 📊 Deployment Info

**Netlify:**
- Site Name: jazzy-malabi-370d03
- URL: https://jazzy-malabi-370d03.netlify.app
- Auto-deploy: Enabled (master branch)
- Build command: `npm run build`
- Node version: 20

**Supabase:**
- Project: dashboard
- Project ID: jtpnytjxzktyvvaywngr
- URL: https://jtpnytjxzktyvvaywngr.supabase.co
- Region: EU Central

**Git:**
- Repository: github.com/OTFstrategies/gantt-dashboard
- Latest commit: d5bb177 (Fix ALL TypeScript jsx style errors - bulk fix)

---

## 🐛 Troubleshooting

### Build Fails on Netlify
- Check deploy logs in Netlify dashboard
- Verify all environment variables are set
- Check `package.json` dependencies

### Database Connection Issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check Supabase project is not paused
- Verify RLS policies allow access

### Authentication Not Working
- Verify redirect URLs are correct
- Check Supabase Auth provider is enabled
- Clear browser cache and cookies

---

**Laatst bijgewerkt**: 1 januari 2026
**Deployment status**: Database migrations pending
