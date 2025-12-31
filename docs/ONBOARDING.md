# ONBOARDING.md - Gebruikers Onboarding Guide

> **Versie:** 1.0.0
> **Datum:** 2024-12-30
> **Deliverable:** P5
> **Status:** Compleet

---

## Inhoudsopgave

1. [Onboarding Overview](#1-onboarding-overview)
2. [Admin Onboarding](#2-admin-onboarding)
3. [Vault Medewerker Onboarding](#3-vault-medewerker-onboarding)
4. [Medewerker Onboarding](#4-medewerker-onboarding)
5. [Klant Onboarding (Editor & Viewer)](#5-klant-onboarding-editor--viewer)
6. [Training Materiaal](#6-training-materiaal)
7. [Evaluatie & Feedback](#7-evaluatie--feedback)
8. [Mentor Guidelines](#8-mentor-guidelines)

---

## 1. Onboarding Overview

### 1.1 Doelen

Het onboarding programma heeft de volgende doelstellingen:

| Doel | Beschrijving | KPI |
|------|--------------|-----|
| **Snelle Productiviteit** | Nieuwe gebruikers zo snel mogelijk effectief maken | < 5 dagen tot basisvaardigheid |
| **Consistente Kennisoverdracht** | Iedereen dezelfde basis kennis | 100% checklist completion |
| **Platform Adoptie** | Maximale gebruik van platform features | > 80% feature awareness |
| **Support Reductie** | Minder support tickets van nieuwe gebruikers | < 2 tickets in eerste maand |

### 1.2 Onboarding Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING TIMELINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PRE-BOARDING (Dag -7 tot 0)                                                │
│  ├── Account aanmaken                                                        │
│  ├── Welkomstmail versturen                                                  │
│  ├── Toegang verificatie                                                     │
│  └── Training sessie plannen                                                 │
│                                                                              │
│  DAG 1 - EERSTE INDRUK                                                      │
│  ├── Eerste login                                                            │
│  ├── Platform rondleiding                                                    │
│  ├── Basis navigatie                                                         │
│  └── Eerste actie voltooien                                                  │
│                                                                              │
│  WEEK 1 - CORE TRAINING                                                     │
│  ├── Dagelijkse korte sessies                                               │
│  ├── Rol-specifieke training                                                │
│  ├── Praktische oefeningen                                                  │
│  └── Buddy check-ins                                                        │
│                                                                              │
│  WEEK 2-4 - VERDIEPING                                                      │
│  ├── Zelfstandig werken                                                     │
│  ├── Geavanceerde features                                                  │
│  ├── Probleemoplossing                                                      │
│  └── Mentor ondersteuning                                                   │
│                                                                              │
│  DAG 30 - EVALUATIE                                                         │
│  ├── Competentie check                                                       │
│  ├── Feedback verzamelen                                                     │
│  ├── Certificering (indien van toepassing)                                   │
│  └── Transitie naar reguliere ondersteuning                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Rol-Specifieke Onboarding Duur

| Rol | Pre-boarding | Dag 1 | Week 1 | Week 2-4 | Totaal |
|-----|--------------|-------|--------|----------|--------|
| Admin | 2 dagen | 3 uur | 8 uur | 4 uur | ~15 uur |
| Vault Medewerker | 1 dag | 2 uur | 10 uur | 6 uur | ~18 uur |
| Medewerker | 1 dag | 1.5 uur | 5 uur | 2 uur | ~8.5 uur |
| Klant Editor | 0 dagen | 1 uur | 2 uur | 1 uur | ~4 uur |
| Klant Viewer | 0 dagen | 30 min | 1 uur | 0 uur | ~1.5 uur |

---

## 2. Admin Onboarding

### 2.1 Pre-boarding Checklist

**Verantwoordelijke:** Platform Administrator of Senior Admin

| # | Actie | Verificatie | Status |
|---|-------|-------------|--------|
| 1 | Account aanmaken in Supabase | User ID toegewezen | [ ] |
| 2 | Admin rol toewijzen | Rol = 'admin' in profiles | [ ] |
| 3 | Workspace access configureren | workspace_members record | [ ] |
| 4 | Welkomstmail versturen | Email delivered | [ ] |
| 5 | Training sessie plannen | Calendar invite | [ ] |
| 6 | Documentatie toegang geven | Sharepoint/Drive link | [ ] |

### 2.2 Dag 1 Agenda (3 uur)

```
09:00 - 09:30  Welkom & Introductie
               - Platform visie en doelen
               - Jouw rol als Admin
               - Verwachtingen

09:30 - 10:30  Platform Rondleiding
               - Login en profiel instellen
               - Dashboard navigatie
               - Views verkennen (Gantt, Calendar, TaskBoard, Grid)
               - Settings overview

10:30 - 10:45  Pauze

10:45 - 11:30  Admin Functies
               - Workspace settings
               - Gebruikers uitnodigen (demo)
               - Rollen toewijzen
               - Project aanmaken

11:30 - 12:00  Praktijk Oefening
               - Maak test workspace aan
               - Nodig test-user uit
               - Configureer basis settings
```

### 2.3 Week 1 Training Schema

| Dag | Onderwerp | Duur | Materiaal |
|-----|-----------|------|-----------|
| **Dag 1** | Platform Basics | 3 uur | Rondleiding, eerste setup |
| **Dag 2** | User Management | 1.5 uur | PROC-002, PROC-003 |
| **Dag 3** | Project Setup | 1.5 uur | PROC-004, PROC-005 |
| **Dag 4** | Vault & Export | 1 uur | PROC-020, PROC-008 |
| **Dag 5** | Procedures Review | 1 uur | P2 PROCEDURES.md doorlopen |

### 2.4 Competentie Checklist

De Admin is gereed wanneer alle items zijn afgevinkt:

**Workspace Management:**
- [ ] Kan workspace aanmaken en configureren
- [ ] Kan workspace settings aanpassen
- [ ] Begrijpt workspace types (afdeling vs klant)

**User Management:**
- [ ] Kan gebruikers uitnodigen via email
- [ ] Kan rollen correct toewijzen
- [ ] Kan gebruikersrechten aanpassen
- [ ] Kan inactieve gebruikers identificeren

**Project Management:**
- [ ] Kan project aanmaken met correcte settings
- [ ] Kan project templates gebruiken
- [ ] Kan projecten archiveren

**Vault:**
- [ ] Begrijpt Vault workflow (Input → Processing → Done)
- [ ] Kan Vault items bekijken
- [ ] Kent 30-dagen retentie regel

**Procedures:**
- [ ] Kent escalatie procedures (PROC-030 t/m PROC-034)
- [ ] Weet waar documentatie te vinden is
- [ ] Kent support kanalen

---

## 3. Vault Medewerker Onboarding

### 3.1 Vereisten

Voordat iemand Vault Medewerker wordt, moet aan deze voorwaarden voldaan zijn:

| Vereiste | Verificatie | Verantwoordelijke |
|----------|-------------|-------------------|
| Begrijpt data privacy principes | Gesprek | Admin |
| Bekend met organisatie processen | Ervaring check | HR |
| Aandacht voor detail | Referentie | Manager |
| Basis platform kennis | Medewerker training voltooid | System |

### 3.2 Pre-boarding Checklist

| # | Actie | Verificatie | Status |
|---|-------|-------------|--------|
| 1 | Account aanmaken (indien nieuw) | User ID | [ ] |
| 2 | Vault Medewerker rol toewijzen | Rol = 'vault_medewerker' | [ ] |
| 3 | Privacy verklaring ondertekenen | Signed document | [ ] |
| 4 | Training sessie plannen | Calendar invite | [ ] |

### 3.3 Week 1 Training Schema

| Dag | Onderwerp | Duur | Focus |
|-----|-----------|------|-------|
| **Dag 1** | Platform Basics | 1 uur | Navigatie, views, basics |
| **Dag 2** | Vault Introductie | 2 uur | Vault module, statussen, workflow |
| **Dag 3** | Processing Workflow | 2 uur | PROC-020, PROC-021, hands-on |
| **Dag 4** | Export & Archivering | 2 uur | PROC-022, PROC-023 |
| **Dag 5** | Begeleide Verwerking | 3 uur | 3 items onder supervisie |

### 3.4 Supervised Period

**Eerste 10 Vault Items:**

Nieuwe Vault Medewerkers verwerken hun eerste 10 items onder begeleiding:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SUPERVISED PROCESSING FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Item 1-3: VOLLEDIGE BEGELEIDING                                            │
│  ├── Senior Vault Medewerker kijkt mee                                      │
│  ├── Elk besluit wordt besproken                                            │
│  └── Directe feedback                                                        │
│                                                                              │
│  Item 4-6: GEDEELTELIJKE BEGELEIDING                                        │
│  ├── Zelfstandig verwerken                                                   │
│  ├── Review voor voltooiing                                                  │
│  └── Feedback na afloop                                                      │
│                                                                              │
│  Item 7-10: ZELFSTANDIG MET CHECK                                           │
│  ├── Volledig zelfstandig verwerken                                          │
│  ├── Steekproef review                                                       │
│  └── Sign-off bij succes                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Competentie Checklist

**Vault Workflow:**
- [ ] Kent alle Vault statussen (Input, Processing, Done)
- [ ] Kan item van Input naar Processing verplaatsen
- [ ] Kan processing notes correct invullen
- [ ] Kan item afronden naar Done

**Data Validatie:**
- [ ] Kan source data beoordelen op volledigheid
- [ ] Kent validatie criteria per data type
- [ ] Kan afwijkingen documenteren

**Export & Archivering:**
- [ ] Begrijpt 30-dagen retentie countdown
- [ ] Kan exporteren naar permanent storage
- [ ] Kent cleanup procedure

**Escalatie:**
- [ ] Weet wanneer te escaleren
- [ ] Kent escalatie procedure (PROC-024)
- [ ] Kan afkeuring correct documenteren

---

## 4. Medewerker Onboarding

### 4.1 Pre-boarding Checklist

| # | Actie | Verificatie | Status |
|---|-------|-------------|--------|
| 1 | Account aanmaken | User ID | [ ] |
| 2 | Medewerker rol toewijzen | Rol = 'medewerker' | [ ] |
| 3 | Workspace toegang verlenen | workspace_members | [ ] |
| 4 | Welkomstmail versturen | Email delivered | [ ] |

### 4.2 Dag 1 Agenda (1.5 uur)

```
09:00 - 09:15  Welkom
               - Login en wachtwoord instellen
               - Profiel aanvullen

09:15 - 09:45  Platform Verkenning
               - Dashboard navigatie
               - Workspace en project vinden
               - Views wisselen (Gantt, Calendar, TaskBoard, Grid)

09:45 - 10:15  Eerste Acties
               - Taak bekijken
               - Taak aanmaken
               - Status updaten

10:15 - 10:30  Hulp & Resources
               - Waar vind je documentatie
               - Wie is je aanspreekpunt
               - Hoe meld je problemen
```

### 4.3 Week 1 Training Schema

| Dag | Onderwerp | Duur | Focus |
|-----|-----------|------|-------|
| **Dag 1** | Basis Navigatie | 1.5 uur | Login, views, eerste taken |
| **Dag 2** | Gantt View Diepgang | 1 uur | Timeline, dependencies, baselines |
| **Dag 3** | Calendar & TaskBoard | 1 uur | Events, drag & drop, status columns |
| **Dag 4** | Grid & Export | 0.5 uur | Bulk editing, filters, export |
| **Dag 5** | Zelfstandig Oefenen | 1 uur | Oefenproject gebruiken |

### 4.4 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MEDEWERKER QUICK REFERENCE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  NAVIGATIE                          SNELTOETSEN                             │
│  ├── Sidebar: Klik op view naam     ├── Ctrl+S: Opslaan                     │
│  ├── Project selector: Linksboven   ├── Ctrl+Z: Undo                        │
│  └── User menu: Rechtsboven         ├── Ctrl+Y: Redo                        │
│                                      └── Delete: Taak verwijderen           │
│                                                                              │
│  VIEWS                              TAAK ACTIES                             │
│  ├── Gantt: Timeline planning       ├── Dubbelklik: Bewerken                │
│  ├── Calendar: Dag/week overzicht   ├── Drag: Verplaatsen                   │
│  ├── TaskBoard: Kanban workflow     ├── Rechtermuisknop: Context menu       │
│  └── Grid: Tabel bewerking          └── +: Nieuwe taak                      │
│                                                                              │
│  HULP NODIG?                                                                │
│  ├── Documentatie: /docs                                                    │
│  ├── Collega: [naam buddy]                                                  │
│  └── Admin: [naam admin]                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Competentie Checklist

**Navigatie:**
- [ ] Kan inloggen en profiel beheren
- [ ] Kan navigeren tussen views
- [ ] Kan projecten en workspaces vinden

**Gantt View:**
- [ ] Kan taken aanmaken en bewerken
- [ ] Kan dependencies maken
- [ ] Kan taken verplaatsen in timeline
- [ ] Begrijpt baselines

**Overige Views:**
- [ ] Kan Calendar events beheren
- [ ] Kan TaskBoard gebruiken voor status updates
- [ ] Kan Grid gebruiken voor bulk editing

**Export:**
- [ ] Kan basis export uitvoeren (PDF, Excel)
- [ ] Kent export opties

---

## 5. Klant Onboarding (Editor & Viewer)

### 5.1 Uitnodigings Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KLANT UITNODIGINGS FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. UITNODIGING VERSTUREN                                                   │
│     Admin → Workspace Settings → Leden → Uitnodigen                         │
│     ├── Email adres invoeren                                                │
│     ├── Rol selecteren (klant_editor of klant_viewer)                       │
│     └── Versturen                                                            │
│                                                                              │
│  2. EMAIL ONTVANGEN                                                         │
│     Klant ontvangt email met:                                               │
│     ├── Welkom bericht                                                       │
│     ├── Uitleg over toegang                                                  │
│     └── Activatie link                                                       │
│                                                                              │
│  3. ACCOUNT ACTIVEREN                                                       │
│     Klant klikt op link:                                                     │
│     ├── Nieuw: Account aanmaken (email + wachtwoord)                        │
│     └── Bestaand: Inloggen met bestaand account                             │
│                                                                              │
│  4. EERSTE LOGIN                                                            │
│     ├── Automatische rondleiding popup                                      │
│     ├── Project wordt getoond                                               │
│     └── Basis instructies                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Klant Editor Onboarding

**Dag 1 Checklist (1 uur):**

| # | Actie | Duur | Status |
|---|-------|------|--------|
| 1 | Uitnodiging accepteren en inloggen | 10 min | [ ] |
| 2 | Profiel instellen | 5 min | [ ] |
| 3 | Rondleiding popup doorlopen | 10 min | [ ] |
| 4 | Project bekijken in verschillende views | 15 min | [ ] |
| 5 | Eigen taak status updaten | 10 min | [ ] |
| 6 | Feedback geven via notities | 10 min | [ ] |

**Week 1 Zelfstudie (2 uur):**

| Onderwerp | Duur | Hoe |
|-----------|------|-----|
| Views verkennen | 30 min | Zelf doorklikken |
| Taken bewerken oefenen | 45 min | Eigen taken aanpassen |
| Export uitproberen | 15 min | PDF van eigen project |
| Help documentatie lezen | 30 min | Quick start guide |

**Competentie Checklist:**
- [ ] Kan inloggen
- [ ] Kan project bekijken in alle views
- [ ] Kan eigen taken bewerken
- [ ] Kan status updates geven
- [ ] Kan basis export uitvoeren
- [ ] Weet hoe contact op te nemen

### 5.3 Klant Viewer Onboarding

**Eerste Login (30 min):**

| # | Actie | Duur | Status |
|---|-------|------|--------|
| 1 | Uitnodiging accepteren en inloggen | 10 min | [ ] |
| 2 | Rondleiding popup doorlopen | 5 min | [ ] |
| 3 | Project bekijken | 10 min | [ ] |
| 4 | Verschillende views uitproberen | 5 min | [ ] |

**Competentie Checklist:**
- [ ] Kan inloggen
- [ ] Kan project bekijken
- [ ] Kan navigeren tussen views
- [ ] Begrijpt dat dit read-only is
- [ ] Weet hoe contact op te nemen voor vragen

### 5.4 Klant Support Kanalen

| Type Vraag | Kanaal | Response Tijd |
|------------|--------|---------------|
| Toegangsproblemen | Email naar contactpersoon | < 4 uur |
| Inhoudelijke vragen | Email naar projectlead | < 1 werkdag |
| Technische problemen | Via contactpersoon | < 4 uur |
| Feature requests | Via contactpersoon | N.v.t. |

---

## 6. Training Materiaal

### 6.1 Beschikbaar Materiaal

| Type | Naam | Beschrijving | Locatie |
|------|------|--------------|---------|
| **Document** | ROLLEN.md | Rol definities en permissions | `/docs/ROLLEN.md` |
| **Document** | PROCEDURES.md | Alle operationele procedures | `/docs/PROCEDURES.md` |
| **Document** | GLOSSARY.md | Terminologie | `/docs/GLOSSARY.md` |
| **Document** | API-DOCS.md | API documentatie | `/docs/API-DOCS.md` |
| **Reference** | Quick Reference Cards | Per rol | Bijlage A |
| **Sandbox** | Oefenomgeving | Test workspace | `demo.gantt-dashboard.nl` |

### 6.2 Aanbevolen Leervolgorde

**Voor Admin:**
1. Platform rondleiding (praktisch)
2. ROLLEN.md (theorie)
3. PROCEDURES.md Sectie 1 (dagelijks)
4. PROCEDURES.md Sectie 4 (escalatie)

**Voor Vault Medewerker:**
1. Platform rondleiding (praktisch)
2. PROCEDURES.md Sectie 2 (Vault)
3. GLOSSARY.md (Vault termen)
4. PROCEDURES.md Sectie 4 (escalatie)

**Voor Medewerker:**
1. Platform rondleiding (praktisch)
2. Quick Reference Card
3. GLOSSARY.md (basis termen)

**Voor Klant:**
1. Rondleiding popup
2. Quick Start Guide (indien beschikbaar)

---

## 7. Evaluatie & Feedback

### 7.1 30-Dagen Review

Na 30 dagen wordt elke nieuwe gebruiker geevalueerd:

**Evaluatie Componenten:**

| Component | Gewicht | Meetmethode |
|-----------|---------|-------------|
| Checklist Completion | 30% | Alle items afgevinkt |
| Self-Assessment | 20% | Vragenlijst score |
| Mentor Feedback | 30% | Gesprek beoordeling |
| System Usage | 20% | Login frequentie, acties |

### 7.2 Self-Assessment Vragenlijst

*Te beantwoorden door nieuwe gebruiker na 30 dagen:*

| # | Vraag | Schaal |
|---|-------|--------|
| 1 | Hoe duidelijk was de onboarding? | 1-5 |
| 2 | Voel je je vaardig in het gebruik van het platform? | 1-5 |
| 3 | Weet je waar je hulp kunt vinden? | Ja/Nee |
| 4 | Wat miste je in de training? | Open |
| 5 | Wat zou je verbeteren aan de onboarding? | Open |
| 6 | Ben je klaar voor volledig zelfstandig werk? | Ja/Nee/Gedeeltelijk |

### 7.3 Evaluatie Uitkomsten

| Uitkomst | Criteria | Actie |
|----------|----------|-------|
| **Geslaagd** | Checklist 100%, Self-assessment > 3.5, Mentor approval | Transitie naar regulier werk |
| **Gedeeltelijk** | Checklist > 80%, Self-assessment > 3.0 | Extra week begeleiding |
| **Niet Geslaagd** | Checklist < 80% of Self-assessment < 3.0 | Hertaining plannen |

### 7.4 Escalatie bij Issues

Als onboarding niet succesvol verloopt:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING ESCALATIE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STAP 1: EXTRA TRAINING                                                     │
│  ├── Plan extra training sessie (1-2 uur)                                   │
│  ├── Focus op zwakke punten                                                  │
│  └── Hertoets na 1 week                                                      │
│                                                                              │
│  STAP 2: BUDDY TOEWIJZEN                                                    │
│  ├── Wijs ervaren collega aan als buddy                                     │
│  ├── Dagelijkse check-ins (15 min)                                          │
│  └── Buddy rapporteert aan Admin                                            │
│                                                                              │
│  STAP 3: AANGEPAST TEMPO                                                    │
│  ├── Verleng onboarding met 2 weken                                         │
│  ├── Kleinere leerdoelen per dag                                            │
│  └── Meer hands-on, minder theorie                                          │
│                                                                              │
│  STAP 4: ROL EVALUATIE                                                      │
│  ├── Evalueer of rol geschikt is                                            │
│  ├── Overweeg alternatieve rol                                              │
│  └── Bespreek met HR indien nodig                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Mentor Guidelines

### 8.1 Mentor Verantwoordelijkheden

| Verantwoordelijkheid | Frequentie | Beschrijving |
|----------------------|------------|--------------|
| **Check-in gesprekken** | Dagelijks (Week 1), Wekelijks (Week 2-4) | Voortgang bespreken, vragen beantwoorden |
| **Training ondersteuning** | Tijdens sessies | Aanwezig zijn bij training, demonstraties geven |
| **Voortgang tracking** | Wekelijks | Checklist bijwerken, voortgang rapporteren |
| **Feedback geven** | Continue | Constructieve feedback op werk |
| **Escalatie** | Wanneer nodig | Problemen signaleren aan Admin |

### 8.2 Mentor Checklist

**Week 1:**
- [ ] Welkom gesprek gehad
- [ ] Training sessies bijgewoond
- [ ] Dagelijkse check-ins gedaan
- [ ] Eerste vragen beantwoord
- [ ] Voortgang genoteerd

**Week 2-4:**
- [ ] Wekelijkse check-ins gepland
- [ ] Voortgang op schema
- [ ] Problemen gesignaleerd (indien van toepassing)
- [ ] Mentee werkt zelfstandig

**Dag 30:**
- [ ] Competentie checklist gereviewd
- [ ] Mentor feedback formulier ingevuld
- [ ] Aanbeveling gegeven (geslaagd/extra training/hertaining)
- [ ] Overdracht aan reguliere support

### 8.3 Mentor Tips

**Do's:**
- Wees geduldig - iedereen leert in eigen tempo
- Geef concrete voorbeelden
- Moedig vragen aan
- Vier kleine successen
- Documenteer voortgang

**Don'ts:**
- Neem taken niet over
- Wees niet te kritisch bij fouten
- Skip geen check-ins
- Ga niet te snel
- Vergeet niet te escaleren bij problemen

---

## Bijlage A: Quick Reference Cards

### A.1 Admin Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN QUICK REFERENCE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WORKSPACE BEHEER                    USER MANAGEMENT                         │
│  ├── Settings: Tandwiel icoon       ├── Uitnodigen: Leden → + knop          │
│  ├── Archiveren: Settings → Archief ├── Rol wijzigen: Leden → Edit          │
│  └── Type: Afdeling of Klant        └── Verwijderen: Leden → Delete         │
│                                                                              │
│  PROJECT BEHEER                      VAULT                                   │
│  ├── Nieuw: + Project               ├── Open: Sidebar → Vault               │
│  ├── Settings: Project → Settings   ├── Verwerken: Item → Processing        │
│  └── Archiveren: Project → Archief  └── Export: Item → Export               │
│                                                                              │
│  ESCALATIE CONTACTEN                                                        │
│  ├── Technisch: [platform admin]                                            │
│  ├── Inhoudelijk: [project lead]                                            │
│  └── HR zaken: [hr contact]                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### A.2 Vault Medewerker Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VAULT MEDEWERKER QUICK REFERENCE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WORKFLOW                            STATUSSEN                               │
│  ├── 1. Open Vault module           ├── INPUT: Nieuw, wacht op verwerking   │
│  ├── 2. Selecteer item uit Input    ├── PROCESSING: Wordt verwerkt          │
│  ├── 3. Review source data          └── DONE: Klaar, 30 dagen countdown     │
│  ├── 4. Verwerk naar Processing                                             │
│  ├── 5. Voeg notes toe              RETENTIE                                │
│  ├── 6. Markeer als Done            ├── 30 dagen na Done                    │
│  └── 7. Export of wacht op cleanup  ├── Countdown zichtbaar                 │
│                                      └── Auto-cleanup na expiratie           │
│                                                                              │
│  AFKEUREN                            ESCALATIE                               │
│  ├── Reden documenteren             ├── Bij twijfel: vraag Senior           │
│  ├── Status: Afgewezen              ├── Bij problemen: meld Admin           │
│  └── Notificatie naar aanvrager     └── Procedure: PROC-024                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0.0 | 2024-12-30 | Claude | Initieel document |

---

*Document versie: 1.0.0*
*Laatst bijgewerkt: 30 December 2024*
*Deliverable: P5*
