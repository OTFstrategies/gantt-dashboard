# Production Deployment Checklist

> Volg deze checklist voor deployment naar productie

---

## Pre-Deployment Checklist

### 1. Environment Variables

- [ ] **Supabase Configuratie**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` - Productie Supabase URL
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Productie anon key
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Productie service role key

- [ ] **Applicatie Configuratie**
  - [ ] `NEXT_PUBLIC_APP_URL` - Productie domein (https://...)
  - [ ] `NEXT_PUBLIC_APP_NAME` - Applicatie naam
  - [ ] `NEXT_PUBLIC_ENV` - Set to `production`

- [ ] **Bryntum License**
  - [ ] `NEXT_PUBLIC_BRYNTUM_LICENSE_KEY` - Geldige productie license

### 2. Supabase Setup

- [ ] **Database**
  - [ ] Productie project aangemaakt
  - [ ] Schema migraties uitgevoerd
  - [ ] RLS policies actief
  - [ ] Database backup geconfigureerd

- [ ] **Authenticatie**
  - [ ] Email templates aangepast
  - [ ] OAuth providers geconfigureerd (indien nodig)
  - [ ] Redirect URLs ingesteld voor productie domein

- [ ] **Storage**
  - [ ] Buckets aangemaakt
  - [ ] Storage policies ingesteld

### 3. Vercel Setup

- [ ] **Project**
  - [ ] Repository gekoppeld
  - [ ] Build settings correct (Next.js auto-detect)
  - [ ] Environment variables ingesteld

- [ ] **Domein**
  - [ ] Custom domein toegevoegd
  - [ ] DNS records geconfigureerd
  - [ ] SSL certificaat actief

- [ ] **Preview & Production**
  - [ ] Preview deployments ingeschakeld
  - [ ] Production branch ingesteld (main/master)

### 4. Security

- [ ] **Headers**
  - [ ] Content Security Policy geconfigureerd
  - [ ] HSTS ingeschakeld
  - [ ] X-Frame-Options ingesteld

- [ ] **API**
  - [ ] Rate limiting actief
  - [ ] CORS correct geconfigureerd
  - [ ] API keys geroteerd (indien nodig)

- [ ] **Authenticatie**
  - [ ] Wachtwoord policies ingesteld
  - [ ] Session timeout geconfigureerd
  - [ ] MFA beschikbaar (optioneel)

### 5. Performance

- [ ] **Build**
  - [ ] Production build succesvol
  - [ ] No TypeScript errors
  - [ ] Bundle size acceptabel

- [ ] **Caching**
  - [ ] Static assets caching ingesteld
  - [ ] API response caching (indien van toepassing)

- [ ] **Images**
  - [ ] Next.js Image Optimization actief
  - [ ] Favicon en icons aanwezig

### 6. Monitoring

- [ ] **Error Tracking**
  - [ ] Sentry geconfigureerd (optioneel)
  - [ ] Error notifications ingesteld

- [ ] **Analytics**
  - [ ] Vercel Analytics actief
  - [ ] PostHog/andere analytics (optioneel)

- [ ] **Health Checks**
  - [ ] `/api/health` endpoint werkt
  - [ ] Uptime monitoring ingesteld

---

## Deployment Steps

### Stap 1: Validatie

```bash
# Run production setup check
npx ts-node scripts/setup-production.ts

# Run environment validation
npx ts-node scripts/validate-env.ts

# Run tests
npm test

# Run linting
npm run lint
```

### Stap 2: Build

```bash
# Clean previous build
rm -rf .next

# Production build
npm run build

# Test build locally
npm run start
```

### Stap 3: Database Migratie

```bash
# Login to Supabase CLI
npx supabase login

# Link to production project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations (CAREFUL!)
npx supabase db push
```

### Stap 4: Deploy

```bash
# Via Vercel CLI
npx vercel --prod

# Of via Git push
git push origin main
```

### Stap 5: Post-Deployment

- [ ] Verify deployment URL
- [ ] Test login flow
- [ ] Test critical user journeys
- [ ] Check error logs
- [ ] Monitor performance

---

## Rollback Procedure

### Vercel Rollback

1. Ga naar Vercel Dashboard
2. Selecteer project
3. Ga naar "Deployments" tab
4. Vind laatste werkende deployment
5. Klik "..." → "Promote to Production"

### Database Rollback

```bash
# Restore from backup
npx supabase db restore --backup-id YOUR_BACKUP_ID

# Of handmatig via Supabase Dashboard
```

---

## Contact bij Issues

- **Development Team**: development@veha.nl
- **Supabase Support**: support.supabase.com
- **Bryntum Support**: bryntum.com/support
- **Vercel Support**: vercel.com/support

---

*Checklist versie: 1.0.0*
*Laatst bijgewerkt: 30 December 2024*
