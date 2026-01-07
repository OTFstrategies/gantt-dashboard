# Manual Deployment Steps - Supabase Database Setup

## 📋 VOORBEREIDING VOLTOOID

✅ **Code Quality**: 100% passing
- TypeScript: 0 errors
- Tests: 41/41 passing
- Build: Succesvol

✅ **Netlify**: Live op https://jazzy-malabi-370d03.netlify.app
✅ **Migrations**: Klaar in `supabase/combined_migrations.sql` (3,103 lines)

---

## 🎯 STAP 1: OPEN SUPABASE SQL EDITOR

1. Ga naar: https://supabase.com/dashboard
2. Log in met je account
3. Selecteer project: **dashboard** (ID: jtpnytjxzktyvvaywngr)
4. Klik in de linker sidebar op: **SQL Editor**
5. Klik op: **New query**

---

## 🎯 STAP 2: KOPIEER MIGRATIONS

**Optie A: Via bestandslocatie (AANBEVOLEN)**

1. Open File Explorer
2. Navigeer naar: `C:\Users\Mick\Projects\gantt-dashboard\supabase\`
3. Open het bestand: `combined_migrations.sql`
4. Selecteer alles (Ctrl+A)
5. Kopieer (Ctrl+C)
6. Ga terug naar Supabase SQL Editor
7. Plak in het query veld (Ctrl+V)

**Optie B: Via VS Code/Cursor**

1. Open VS Code of Cursor
2. Open bestand: `gantt-dashboard/supabase/combined_migrations.sql`
3. Selecteer alles (Ctrl+A)
4. Kopieer (Ctrl+C)
5. Ga naar Supabase SQL Editor
6. Plak (Ctrl+V)

---

## 🎯 STAP 3: VOER MIGRATIONS UIT

1. In Supabase SQL Editor, klik rechtsonder op: **RUN** (of druk Ctrl+Enter)
2. Wacht tot de query compleet is (kan 10-30 seconden duren)
3. **Verwachte output**:
   - Groene melding: "Success. No rows returned"
   - OF: Lijst met CREATE statements die succesvol zijn uitgevoerd

⚠️ **Als er een ERROR verschijnt**:
- Screenshot de error
- Kopieer de error message
- Deel deze met mij voor troubleshooting

---

## 🎯 STAP 4: VERIFIEER TABELLEN

1. Klik in de sidebar op: **Table Editor**
2. Je zou de volgende tabellen moeten zien:
   - ✅ profiles
   - ✅ workspaces
   - ✅ workspace_members
   - ✅ workspace_invites
   - ✅ projects
   - ✅ tasks
   - ✅ dependencies
   - ✅ resources
   - ✅ task_assignments
   - ✅ vault_items
   - ✅ export_logs

3. Klik op een tabel (bijv. "projects")
4. Je zou de kolommen moeten zien (id, name, description, etc.)

---

## 🎯 STAP 5: CONFIGUREER REDIRECT URLs

1. Klik in de sidebar op: **Authentication** > **URL Configuration**
2. Vul in bij **Site URL**:
   ```
   https://jazzy-malabi-370d03.netlify.app
   ```
3. Vul in bij **Redirect URLs** (voeg toe):
   ```
   https://jazzy-malabi-370d03.netlify.app/auth/callback
   https://jazzy-malabi-370d03.netlify.app/**
   ```
4. Klik: **Save**

---

## 🎯 STAP 6: TEST DE LIVE SITE

1. Open een nieuw browser tabblad
2. Ga naar: https://jazzy-malabi-370d03.netlify.app
3. **Verwacht**: Homepage laadt zonder errors
4. Druk F12 (open Developer Tools)
5. Ga naar het **Console** tabblad
6. **Check voor errors** (rode tekst)

### Als de site laadt:
✅ Open console (F12) en check voor Supabase connection errors
✅ Probeer een project te maken (als er een UI is)
✅ Check of data wordt opgeslagen

### Als de site NIET laadt:
❌ Check de browser console voor errors
❌ Ga naar Netlify Dashboard > Deploys > Klik op laatste deploy > Check logs

---

## 🎯 STAP 7: RAPPORTEER STATUS

**Zodra je klaar bent, rapporteer:**

✅ **Success scenario:**
```
DONE - Migrations succesvol
- Alle 11+ tabellen zichtbaar in Table Editor
- Redirect URLs geconfigureerd
- Live site laadt zonder errors
```

❌ **Als er problemen zijn:**
```
PROBLEEM - [beschrijf het probleem]
- Screenshot van error
- Console logs
- Welke stap faalde
```

---

## 📊 QUICK REFERENCE

**Supabase Dashboard**: https://supabase.com/dashboard
**Live Site**: https://jazzy-malabi-370d03.netlify.app
**Netlify Dashboard**: https://app.netlify.com/projects/jazzy-malabi-370d03

**Migrations bestand**:
`C:\Users\Mick\Projects\gantt-dashboard\supabase\combined_migrations.sql`

**Supabase Project**:
- Naam: dashboard
- ID: jtpnytjxzktyvvaywngr
- URL: https://jtpnytjxzktyvvaywngr.supabase.co

---

## ⏱️ GESCHATTE TIJD

- Stap 1-2 (Open & Copy): 2 minuten
- Stap 3 (Execute): 1 minuut
- Stap 4 (Verify): 1 minuut
- Stap 5 (Configure): 1 minuut
- Stap 6 (Test): 2 minuten

**Totaal**: ~7 minuten

---

**Start nu met STAP 1 en werk de lijst af. Succes!** 🚀
