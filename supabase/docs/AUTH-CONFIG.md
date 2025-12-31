# Supabase Auth Configuratie - Gantt Dashboard

Dit document beschrijft de complete setup en configuratie van Supabase Auth voor het Gantt Dashboard project.

## Inhoudsopgave

1. [Supabase Project Setup](#supabase-project-setup)
2. [Environment Variables](#environment-variables)
3. [Redirect URL Configuratie](#redirect-url-configuratie)
4. [Email Provider Setup](#email-provider-setup)
5. [Auth Settings in Dashboard](#auth-settings-in-dashboard)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Supabase Project Setup

### Stap 1: Nieuw Project Aanmaken

1. Ga naar [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik op "New Project"
3. Vul de volgende gegevens in:
   - **Name**: `gantt-dashboard`
   - **Database Password**: Genereer een sterk wachtwoord (bewaar dit veilig!)
   - **Region**: Kies de dichtstbijzijnde regio (bijv. `eu-west-1` voor Nederland)
4. Klik op "Create new project"
5. Wacht tot het project is aangemaakt (circa 2 minuten)

### Stap 2: Project Credentials Ophalen

Na het aanmaken van het project, vind je de credentials onder:
- **Settings** > **API**

Noteer de volgende waarden:
- `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
- `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- `service_role` key (SUPABASE_SERVICE_ROLE_KEY) - **Houd geheim!**

### Stap 3: Lokale CLI Setup

```bash
# Installeer Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <project-id>

# Trek remote config
supabase db pull
```

---

## Environment Variables

### Development (.env.local)

```env
# Supabase Public Config
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Server-side Config (GEHEIM - nooit in frontend!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Preview/Staging (Vercel Environment)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://gantt-dashboard-git-*.vercel.app
```

### Production (Vercel Environment)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://gantt-dashboard.vercel.app
```

### Environment Variables in Vercel

1. Ga naar je Vercel project
2. **Settings** > **Environment Variables**
3. Voeg elke variabele toe met de juiste scope:
   - `NEXT_PUBLIC_*`: Alle environments (Development, Preview, Production)
   - `SUPABASE_SERVICE_ROLE_KEY`: Alleen server-side, nooit in client bundle

---

## Redirect URL Configuratie

### Supabase Dashboard Configuratie

1. Ga naar **Authentication** > **URL Configuration**
2. Configureer de volgende URLs:

#### Site URL
```
https://gantt-dashboard.vercel.app
```

#### Redirect URLs (toevoegen per regel)
```
http://localhost:3000/**
http://127.0.0.1:3000/**
https://*.vercel.app/**
https://gantt-dashboard.vercel.app/**
```

### Per Environment

| Environment | Site URL | Redirect Pattern |
|-------------|----------|------------------|
| Development | `http://localhost:3000` | `http://localhost:3000/**` |
| Preview | `https://gantt-dashboard-git-*.vercel.app` | `https://*.vercel.app/**` |
| Production | `https://gantt-dashboard.vercel.app` | `https://gantt-dashboard.vercel.app/**` |

### Redirect Routes in App

Configureer deze routes in je Next.js app:

```typescript
// lib/supabase/auth-config.ts

export const AUTH_ROUTES = {
  // Na succesvolle login
  signInRedirect: '/dashboard',

  // Na uitloggen
  signOutRedirect: '/login',

  // Email bevestiging callback
  confirmCallback: '/auth/confirm',

  // Wachtwoord reset callback
  resetCallback: '/auth/reset-password',

  // Magic link callback
  magicLinkCallback: '/auth/callback',

  // OAuth callback
  oauthCallback: '/auth/callback',
} as const;
```

---

## Email Provider Setup

### Optie 1: Supabase Ingebouwde SMTP (Development)

Supabase biedt standaard email functionaliteit. Dit is voldoende voor development en kleine volumes, maar heeft beperkingen:
- Max 4 emails per uur per gebruiker
- Geen custom domain
- Beperkte deliverability

### Optie 2: Custom SMTP (Production)

Voor productie, configureer een eigen SMTP provider:

1. Ga naar **Project Settings** > **Auth** > **SMTP Settings**
2. Schakel "Enable Custom SMTP" in
3. Vul de volgende gegevens in:

#### Voorbeeld: SendGrid

```
Sender email: noreply@jouwdomein.nl
Sender name: Gantt Dashboard
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: SG.xxxxxxxxxxxxxxxxxxxx
```

#### Voorbeeld: AWS SES

```
Sender email: noreply@jouwdomein.nl
Sender name: Gantt Dashboard
Host: email-smtp.eu-west-1.amazonaws.com
Port: 587
Username: <AWS-SMTP-USERNAME>
Password: <AWS-SMTP-PASSWORD>
```

#### Voorbeeld: Resend

```
Sender email: noreply@jouwdomein.nl
Sender name: Gantt Dashboard
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_xxxxxxxxxxxxxxxxxxxx
```

### Custom Email Templates

1. Ga naar **Authentication** > **Email Templates**
2. Voor elke template type:
   - Upload de HTML bestanden uit `supabase/templates/`
   - Of kopieer de inhoud direct in de editor

Beschikbare templates:
- `confirm.html` - Email bevestiging
- `reset.html` - Wachtwoord reset
- `invite.html` - Workspace uitnodiging
- `magic-link.html` - Passwordless login

---

## Auth Settings in Dashboard

### Authentication > Settings

#### General Settings

| Setting | Waarde | Beschrijving |
|---------|--------|--------------|
| Enable email confirmations | ✅ Aan | Vereis email verificatie |
| Enable double confirm | ✅ Aan | Bevestig ook bij email wijziging |
| Secure email change | ✅ Aan | Oude email moet bevestigen |
| Enable signup | ✅ Aan | Sta nieuwe registraties toe |

#### JWT Settings

| Setting | Waarde |
|---------|--------|
| JWT expiry | 3600 (1 uur) |
| Refresh token rotation | Aan |
| Reuse interval | 10 seconden |

#### Password Settings (via Dashboard)

| Setting | Waarde |
|---------|--------|
| Minimum length | 8 |
| Require uppercase | Ja |
| Require lowercase | Ja |
| Require number | Ja |

### Rate Limiting

Configureer via dashboard onder **Authentication** > **Rate Limits**:

| Action | Rate | Interval |
|--------|------|----------|
| Sign up | 10 | per uur |
| Sign in | 30 | per 5 min |
| Token refresh | 150 | per 5 min |
| Recovery email | 4 | per uur |
| Verify email | 10 | per uur |

---

## Security Best Practices

### 1. Environment Variables

```bash
# NOOIT in version control
.env.local
.env.*.local

# Altijd in .gitignore
echo ".env*.local" >> .gitignore
```

### 2. Service Role Key Beveiliging

```typescript
// FOUT - nooit in client-side code
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

// GOED - alleen in API routes / server components
export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

### 3. Row Level Security (RLS)

Schakel RLS altijd in voor alle tabellen:

```sql
-- RLS inschakelen
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Voorbeeld policy
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. PKCE Flow

Gebruik altijd PKCE voor OAuth:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 5. Session Validatie

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Beschermde routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

### 6. Content Security Policy

Voeg CSP headers toe in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*.supabase.co;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      frame-ancestors 'none';
    `.replace(/\n/g, '')
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

---

## Troubleshooting

### Veelvoorkomende Problemen

#### 1. "Invalid Redirect URL"

**Oorzaak**: De redirect URL staat niet in de toegestane lijst.

**Oplossing**:
1. Ga naar Supabase Dashboard > Authentication > URL Configuration
2. Voeg de exacte URL of wildcard patroon toe
3. Let op trailing slashes

#### 2. Email komt niet aan

**Controleer**:
1. Spam folder
2. Rate limits (max 4/uur met standaard SMTP)
3. SMTP configuratie indien custom provider
4. Email template syntax

#### 3. Session verloopt te snel

**Oplossing**:
```typescript
// Verhoog JWT expiry in dashboard naar 3600 (1 uur)
// Zorg dat refresh token werkt:

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully')
  }
})
```

#### 4. CORS errors

**Controleer**:
1. Site URL in dashboard komt overeen met origin
2. Redirect URLs bevatten je domein
3. API settings in Supabase

#### 5. "User already registered"

**Oorzaak**: Email bestaat al maar is niet geverifieerd.

**Oplossing**:
```typescript
// Stuur nieuwe verificatie email
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com',
})
```

### Debug Logging

Schakel debug mode in voor development:

```typescript
const supabase = createClient(url, key, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
})
```

### Support Links

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

## Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2024-12-30 | 1.0.0 | Initiele configuratie |

---

*Laatst bijgewerkt: December 2024*
