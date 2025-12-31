# Deployment Guide - Netlify & Supabase

Deze guide helpt je om het Gantt Dashboard te deployen naar Netlify met Supabase als backend.

## Vereisten

- GitHub account (repository moet public of private zijn met Netlify toegang)
- Netlify account (gratis tier is voldoende)
- Supabase project (gratis tier is voldoende)

## Stap 1: Supabase Setup

### 1.1 Database Migraties Uitvoeren

1. Ga naar [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecteer je project (of maak een nieuw project)
3. Ga naar **SQL Editor**
4. Voer alle migraties uit in volgorde:

```bash
# Lokaal: migraties staan in supabase/migrations/
# Kopieer de SQL uit elk bestand en voer uit in Supabase SQL Editor
```

Migraties in volgorde:
- `0001_initial_schema.sql` - Basis tabellen
- `0002_rls_policies.sql` - Row Level Security
- `0003_storage_buckets.sql` - File storage
- `0004_functions.sql` - Database functies
- `0005_triggers.sql` - Triggers
- `0006_indexes.sql` - Performance indexes

### 1.2 Haal API Keys Op

1. Ga naar **Settings** > **API**
2. Kopieer de volgende waarden:
   - `URL` (Project URL)
   - `anon public` key
   - `service_role` key (geheim! alleen voor server-side)

### 1.3 Configureer Authentication (optioneel)

1. Ga naar **Authentication** > **Providers**
2. Schakel gewenste providers in (Email, Google, etc.)
3. Configureer redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-site.netlify.app/auth/callback`

## Stap 2: Netlify Deployment

### 2.1 Connect Repository

1. Ga naar [Netlify Dashboard](https://app.netlify.com/)
2. Klik **Add new site** > **Import an existing project**
3. Kies **GitHub** en autoriseer Netlify
4. Selecteer de `gantt-dashboard` repository

### 2.2 Build Settings

Netlify detecteert automatisch Next.js, maar verifieer:

```
Build command: npm run build
Publish directory: .next
```

**Node version**: 20 (automatisch via netlify.toml)

### 2.3 Environment Variables

Ga naar **Site settings** > **Environment variables** en voeg toe:

#### Required (verplicht)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
NEXT_PUBLIC_ENV=production
```

#### Optional (optioneel)
```bash
NEXT_PUBLIC_APP_NAME=Gantt Dashboard
```

### 2.4 Deploy

1. Klik **Deploy site**
2. Wacht tot de build compleet is (2-3 minuten)
3. Je site is live op `https://random-name.netlify.app`

### 2.5 Custom Domain (optioneel)

1. Ga naar **Domain settings** > **Add custom domain**
2. Voeg je domein toe (bijv. `gantt.jouwdomein.nl`)
3. Configureer DNS volgens Netlify instructies
4. SSL certificaat wordt automatisch aangemaakt

## Stap 3: Post-Deployment Checks

### 3.1 Supabase Redirect URLs Updaten

1. Ga naar Supabase Dashboard > **Authentication** > **URL Configuration**
2. Voeg je Netlify URL toe aan:
   - **Site URL**: `https://your-site.netlify.app`
   - **Redirect URLs**: `https://your-site.netlify.app/auth/callback`

### 3.2 Test de Applicatie

Bezoek je Netlify URL en test:
- [ ] Homepage laadt correct
- [ ] Gantt view werkt
- [ ] Calendar view werkt
- [ ] TaskBoard werkt
- [ ] Grid view werkt
- [ ] Login/signup werkt (als authentication enabled)
- [ ] Data wordt opgeslagen in Supabase

### 3.3 Check Build Logs

Als er problemen zijn:
1. Ga naar **Deploys** > **Deploy log**
2. Check voor errors
3. Verifieer environment variables

## Stap 4: Automatische Deploys

Netlify deployt automatisch bij elke push naar `master`:

```bash
# Lokaal
git add .
git commit -m "Update feature"
git push

# Netlify deployt automatisch in 2-3 minuten
```

### Branch Deploys

Maak preview deploys voor branches:
1. Ga naar **Site settings** > **Build & deploy** > **Deploy contexts**
2. Enable **Deploy Preview** voor pull requests

## Troubleshooting

### Build Failed

**Error: `Module not found`**
- Check of alle dependencies in `package.json` staan
- Run `npm install` lokaal en commit `package-lock.json`

**Error: `Environment variable missing`**
- Verifieer alle required environment variables in Netlify
- Check spelling en waarden

### Runtime Errors

**Error: `Failed to fetch from Supabase`**
- Verifieer `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project status (niet gepauzeerd)
- Verifieer RLS policies toestaan access

**Error: `Unauthorized`**
- Check of Supabase redirect URLs correct zijn
- Verifieer authentication configuratie

### Performance Issues

**Slow Initial Load**
- Enable Netlify Analytics om bottlenecks te vinden
- Check Supabase query performance in Dashboard
- Overweeg caching toevoegen

## Monitoring & Maintenance

### Netlify Analytics

1. Ga naar **Analytics** tab in Netlify Dashboard
2. Enable analytics (gratis of betaald)
3. Monitor traffic, performance, bandwidth

### Supabase Monitoring

1. Check **Database** > **Reports** voor query performance
2. Monitor **API** > **Logs** voor errors
3. Check **Storage** gebruik

### Updates

```bash
# Lokaal: update dependencies
npm update
npm audit fix

# Test lokaal
npm run dev
npm run build

# Deploy
git commit -am "Update dependencies"
git push
```

## Backup & Recovery

### Database Backup

Supabase maakt automatisch backups, maar voor extra zekerheid:

1. Ga naar **Database** > **Backups**
2. Download manual backup
3. Of gebruik Supabase CLI:

```bash
supabase db dump > backup.sql
```

### Restore

```bash
# Restore from backup
supabase db reset
psql -h your-host -U postgres -f backup.sql
```

## Kosten

### Gratis Tier Limieten

**Netlify Free:**
- 100 GB bandwidth/maand
- 300 build minutes/maand
- 1 concurrent build

**Supabase Free:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

Voor productie gebruik kunnen upgrades nodig zijn.

## Support

- Netlify Docs: https://docs.netlify.com/
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

## Volgende Stappen

Na succesvolle deployment:
- [ ] Enable Netlify Analytics
- [ ] Setup error monitoring (Sentry)
- [ ] Configure automated backups
- [ ] Add monitoring alerts
- [ ] Performance optimization
- [ ] SEO optimization
