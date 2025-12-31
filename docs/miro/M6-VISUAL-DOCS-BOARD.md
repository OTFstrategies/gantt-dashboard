# M6: Visual Docs Board Specificatie

> **Outcome:** O8 - Visuele Documentatie
> **Versie:** 1.0
> **Datum:** 2024-12-30
> **Status:** Specificatie voor Miro implementatie

---

## Board Overzicht

| Aspect | Waarde |
|--------|--------|
| **Board Naam** | O8: Visuele Documentatie & Board Index |
| **Doel** | Meta-board met index, templates, style guide en onderhoud procedures |
| **Frames** | 6 |
| **Geschatte Breedte** | 6000px |
| **Geschatte Hoogte** | 5000px |

---

## Board Layout

```
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [F1: Header & Doelstelling]                                                     |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                                       |                                           |
|  [F2: Board Index & Navigation]       |  [F3: Style Guide]                       |
|                                       |                                           |
+-----------------------------------------------------------------------------------+
|                                       |                                           |
|  [F4: Template Library]               |  [F5: Naming Conventions]                |
|                                       |                                           |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [F6: Onderhoud & Versioning]                                                    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## Frame 1: Header & Doelstelling

**Positie:** 0, 0 | **Grootte:** 6000 x 600px

### Content

```
+-------------------------------------------------------------------------+
|                                                                         |
|  O8: VISUELE DOCUMENTATIE                                              |
|  ═══════════════════════════════════════════════════                   |
|                                                                         |
|  "Alle technische documentatie wordt visueel                           |
|   ondersteund door Miro boards"                                        |
|                                                                         |
|  +-------------+  +-------------+  +-------------+  +-------------+    |
|  | KR 8.1      |  | KR 8.2      |  | KR 8.3      |  | KR 8.4      |    |
|  | 7 Miro      |  | Alle boards |  | Consistent  |  | Maandelijks |    |
|  | boards      |  | gelinkt aan |  | styling     |  | review      |    |
|  | compleet    |  | OUTCOMES    |  | toegepast   |  | cyclus      |    |
|  +-------------+  +-------------+  +-------------+  +-------------+    |
|                                                                         |
|  [Meta-board voor navigatie en standaardisatie]                        |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Miro Elementen

| Element | Type | Kleur | Positie |
|---------|------|-------|---------|
| Titel | Text (H1) | #1E293B | Centered |
| Quote | Text (H3) | #64748B | Centered |
| KR Cards | Shapes | #3B82F6 | 4 kolommen |
| Status Badge | Shape | #10B981 | Top right |

---

## Frame 2: Board Index & Navigation

**Positie:** 0, 700 | **Grootte:** 3000 x 1800px

### Content

```
+-----------------------------------------------+
|                                               |
|  MIRO BOARD INDEX                            |
|  ─────────────────                           |
|                                               |
|  +-------------------------------------------+
|  |                                           |
|  |  ┌─────────────────────────────────────┐ |
|  |  │ M1 │ Samenwerking Board       │ ▶  │ |
|  |  │    │ O1: Gestandaardiseerde        │ |
|  |  │    │ Samenwerking                  │ |
|  |  │    │ Status: ✅ Compleet           │ |
|  |  └─────────────────────────────────────┘ |
|  |                                           |
|  |  ┌─────────────────────────────────────┐ |
|  |  │ M2 │ Unified View Board       │ ▶  │ |
|  |  │    │ O2: Unified Project View      │ |
|  |  │    │ Status: ✅ Compleet           │ |
|  |  └─────────────────────────────────────┘ |
|  |                                           |
|  |  ┌─────────────────────────────────────┐ |
|  |  │ M3 │ Toegang Board            │ ▶  │ |
|  |  │    │ O3-O4: Afdelingsscheiding     │ |
|  |  │    │ Status: ✅ Compleet           │ |
|  |  └─────────────────────────────────────┘ |
|  |                                           |
|  |  ┌─────────────────────────────────────┐ |
|  |  │ M4 │ Security Board           │ ▶  │ |
|  |  │    │ O5-O6: RBAC & Vault           │ |
|  |  │    │ Status: ✅ Compleet           │ |
|  |  └─────────────────────────────────────┘ |
|  |                                           |
|  |  ┌─────────────────────────────────────┐ |
|  |  │ M5 │ Export Board             │ ▶  │ |
|  |  │    │ O7: Data Export               │ |
|  |  │    │ Status: ✅ Compleet           │ |
|  |  └─────────────────────────────────────┘ |
|  |                                           |
|  |  ┌─────────────────────────────────────┐ |
|  |  │ M6 │ Visual Docs Board        │ ▶  │ |
|  |  │    │ O8: Visuele Documentatie      │ |
|  |  │    │ Status: 🔵 Actief (dit board) │ |
|  |  └─────────────────────────────────────┘ |
|  |                                           |
|  |  ┌─────────────────────────────────────┐ |
|  |  │ M7 │ Rollen Board             │ ▶  │ |
|  |  │    │ O9: Rollen & Procedures       │ |
|  |  │    │ Status: ✅ Compleet           │ |
|  |  └─────────────────────────────────────┘ |
|  |                                           |
|  +-------------------------------------------+
|                                               |
|  NAVIGATIE INSTRUCTIES:                      |
|  • Klik op ▶ om naar board te navigeren      |
|  • Elk board linkt terug naar deze index     |
|  • Gebruik Miro's "Frames" panel voor       |
|    snelle navigatie binnen boards            |
|                                               |
+-----------------------------------------------+
```

### Board Links Table

| Board | Outcome | Frames | Status | Link |
|-------|---------|--------|--------|------|
| M1 | O1: Gestandaardiseerde Samenwerking | 8 | Compleet | [Board Link] |
| M2 | O2: Unified Project View | 10 | Compleet | [Board Link] |
| M3 | O3-O4: Afdelingsscheiding & Klantsamenwerking | 9 | Compleet | [Board Link] |
| M4 | O5-O6: Toegangscontrole & Vault | 10 | Compleet | [Board Link] |
| M5 | O7: Data Export | 7 | Compleet | [Board Link] |
| M6 | O8: Visuele Documentatie | 6 | Actief | (dit board) |
| M7 | O9: Rollen & Procedures | 8 | Compleet | [Board Link] |

---

## Frame 3: Style Guide

**Positie:** 3100, 700 | **Grootte:** 2800 x 1800px

### Content

```
+-----------------------------------------------+
|                                               |
|  MIRO STYLE GUIDE                            |
|  ─────────────────                           |
|                                               |
|  KLEURENPALET                                |
|  ─────────────────────────────────────────   |
|                                               |
|  ┌──────────┐ ┌──────────┐ ┌──────────┐     |
|  │ #3B82F6  │ │ #10B981  │ │ #F59E0B  │     |
|  │ Blauw    │ │ Groen    │ │ Oranje   │     |
|  │ Primair  │ │ Success  │ │ Waarsch. │     |
|  │ Links,   │ │ Status   │ │ Aandacht │     |
|  │ Interac- │ │ "done",  │ │ punten,  │     |
|  │ tief     │ │ positief │ │ in_progr │     |
|  └──────────┘ └──────────┘ └──────────┘     |
|                                               |
|  ┌──────────┐ ┌──────────┐ ┌──────────┐     |
|  │ #EF4444  │ │ #8B5CF6  │ │ #6B7280  │     |
|  │ Rood     │ │ Paars    │ │ Grijs    │     |
|  │ Kritiek  │ │ Feature  │ │ Neutraal │     |
|  │ Blocker, │ │ Nieuw,   │ │ Achter-  │     |
|  │ Urgent   │ │ Premium  │ │ grond    │     |
|  └──────────┘ └──────────┘ └──────────┘     |
|                                               |
|  STICKY NOTE TYPES                           |
|  ─────────────────────────────────────────   |
|                                               |
|  ┌─────────────────────────────────────┐    |
|  │ 🟡 GEEL: Notities, Ideeën, Vragen  │    |
|  └─────────────────────────────────────┘    |
|  ┌─────────────────────────────────────┐    |
|  │ 🔵 BLAUW: Requirements, Specs      │    |
|  └─────────────────────────────────────┘    |
|  ┌─────────────────────────────────────┐    |
|  │ 🟢 GROEN: Beslissingen, Goedgekeurd│    |
|  └─────────────────────────────────────┘    |
|  ┌─────────────────────────────────────┐    |
|  │ 🔴 ROOD: Risico's, Blockers        │    |
|  └─────────────────────────────────────┘    |
|  ┌─────────────────────────────────────┐    |
|  │ 🟣 PAARS: Toekomstig, Roadmap      │    |
|  └─────────────────────────────────────┘    |
|                                               |
|  TYPOGRAPHY                                  |
|  ─────────────────────────────────────────   |
|                                               |
|  H1: Open Sans Bold, 48px  - Board titels    |
|  H2: Open Sans Bold, 32px  - Frame titels    |
|  H3: Open Sans Semi, 24px  - Secties         |
|  Body: Open Sans Reg, 16px - Content         |
|  Label: Open Sans Med, 12px - Annotaties     |
|                                               |
|  SPACING                                     |
|  ─────────────────────────────────────────   |
|                                               |
|  • Frame padding: 40px                       |
|  • Element spacing: 20px                     |
|  • Card spacing: 16px                        |
|  • Text padding: 12px                        |
|                                               |
+-----------------------------------------------+
```

### Kleurencodes

| Kleur | Hex | Gebruik |
|-------|-----|---------|
| Primary Blue | #3B82F6 | Links, interactieve elementen, Bryntum accent |
| Success Green | #10B981 | Voltooide items, positieve status |
| Warning Orange | #F59E0B | In progress, aandachtspunten |
| Error Red | #EF4444 | Kritieke items, blockers, risico's |
| Feature Purple | #8B5CF6 | Nieuwe features, premium content |
| Neutral Gray | #6B7280 | Achtergrond, borders, secundaire tekst |
| Dark Text | #1E293B | Primaire tekst |
| Light Text | #64748B | Secundaire tekst |

---

## Frame 4: Template Library

**Positie:** 0, 2600 | **Grootte:** 3000 x 1600px

### Content

```
+-----------------------------------------------+
|                                               |
|  TEMPLATE LIBRARY                            |
|  ─────────────────                           |
|                                               |
|  FRAME TEMPLATES                             |
|  ─────────────────────────────────────────   |
|                                               |
|  ┌─────────────────────────────────────────┐|
|  │ HEADER FRAME TEMPLATE                    │|
|  │ ────────────────────────                 │|
|  │ +-------------------------------------+  │|
|  │ | [Logo] OUTCOME TITEL                |  │|
|  │ |        ═══════════════              |  │|
|  │ |        "Outcome beschrijving"       |  │|
|  │ |                                     |  │|
|  │ | [KR1] [KR2] [KR3] [KR4]            |  │|
|  │ +-------------------------------------+  │|
|  │ Grootte: 6000-8000 x 600-800px          │|
|  └─────────────────────────────────────────┘|
|                                               |
|  ┌─────────────────────────────────────────┐|
|  │ CONTENT FRAME TEMPLATE                   │|
|  │ ────────────────────────                 │|
|  │ +-------------------------------------+  │|
|  │ | FRAME TITEL                         |  │|
|  │ | ─────────────                       |  │|
|  │ |                                     |  │|
|  │ | [Content Area]                      |  │|
|  │ |                                     |  │|
|  │ | [Annotations]   [Links]             |  │|
|  │ +-------------------------------------+  │|
|  │ Grootte: 2500-3500 x 1400-2000px        │|
|  └─────────────────────────────────────────┘|
|                                               |
|  ┌─────────────────────────────────────────┐|
|  │ FOOTER FRAME TEMPLATE                    │|
|  │ ────────────────────────                 │|
|  │ +-------------------------------------+  │|
|  │ | LINKS & REFERENTIES                 |  │|
|  │ | • Link naar OUTCOMES.md             |  │|
|  │ | • Link naar gerelateerde docs       |  │|
|  │ | • Terug naar M6 Index               |  │|
|  │ |                                     |  │|
|  │ | Versie: 1.0 | Datum: YYYY-MM-DD     |  │|
|  │ +-------------------------------------+  │|
|  │ Grootte: 6000-8000 x 400px              │|
|  └─────────────────────────────────────────┘|
|                                               |
|  DIAGRAM TEMPLATES                           |
|  ─────────────────────────────────────────   |
|                                               |
|  [User Flow]  [Hierarchy]  [Matrix]  [Swimlane]
|                                               |
+-----------------------------------------------+
```

### Template Catalog

| Template | Gebruik | Standaard Grootte |
|----------|---------|-------------------|
| Header Frame | Board intro, KRs | 6000-8000 x 600-800px |
| Content Frame | Hoofd content | 2500-3500 x 1400-2000px |
| Footer Frame | Links, versioning | 6000-8000 x 400px |
| User Flow | Journey maps | 3000 x 1000px |
| Hierarchy Diagram | Org charts, trees | 2000 x 1500px |
| Matrix | Comparison tables | 2500 x 1500px |
| Swimlane | Process flows | 4000 x 1200px |
| Wireframe | UI mockups | 1200 x 800px |

---

## Frame 5: Naming Conventions

**Positie:** 3100, 2600 | **Grootte:** 2800 x 1600px

### Content

```
+-----------------------------------------------+
|                                               |
|  NAMING CONVENTIONS                          |
|  ─────────────────                           |
|                                               |
|  BOARD NAMING                                |
|  ─────────────────────────────────────────   |
|                                               |
|  Format: "M[N]: [Outcome] Board"             |
|                                               |
|  Voorbeelden:                                |
|  • M1: Samenwerking Board                    |
|  • M2: Unified View Board                    |
|  • M3: Toegang Board                         |
|  • M4: Security Board                        |
|  • M5: Export Board                          |
|  • M6: Visual Docs Board                     |
|  • M7: Rollen Board                          |
|                                               |
|  FRAME NAMING                                |
|  ─────────────────────────────────────────   |
|                                               |
|  Format: "F[N]: [Beschrijving]"              |
|                                               |
|  Voorbeelden:                                |
|  • F1: Header & KPI Overview                 |
|  • F2: Platform Architecture                 |
|  • F3: User Journey Maps                     |
|  • F4: Feature Matrix                        |
|                                               |
|  ELEMENT NAMING                              |
|  ─────────────────────────────────────────   |
|                                               |
|  Sticky Notes:                               |
|  • [TYPE] Korte beschrijving                 |
|  • [REQ] Login functionality                 |
|  • [RISK] Data loss scenario                 |
|  • [DECISION] Use Supabase RLS               |
|                                               |
|  Shapes:                                     |
|  • [ACTOR] Naam                              |
|  • [SYSTEM] Component naam                   |
|  • [PROCESS] Actie beschrijving              |
|                                               |
|  FILE NAMING (Exports)                       |
|  ─────────────────────────────────────────   |
|                                               |
|  Format: M[N]-[board-name]-v[versie].pdf     |
|                                               |
|  Voorbeelden:                                |
|  • M1-samenwerking-board-v1.0.pdf            |
|  • M4-security-board-v1.2.pdf                |
|                                               |
+-----------------------------------------------+
```

### Naming Rules

| Type | Format | Voorbeeld |
|------|--------|-----------|
| Board | M[N]: [Outcome] Board | M1: Samenwerking Board |
| Frame | F[N]: [Beschrijving] | F1: Header & KPI Overview |
| Requirement | [REQ] Beschrijving | [REQ] User authentication |
| Risk | [RISK] Beschrijving | [RISK] Data synchronization |
| Decision | [DECISION] Beschrijving | [DECISION] Use React Query |
| Actor | [ACTOR] Naam | [ACTOR] Admin User |
| System | [SYSTEM] Component | [SYSTEM] CrudManager |
| Export File | M[N]-[name]-v[ver].pdf | M4-security-board-v1.0.pdf |

---

## Frame 6: Onderhoud & Versioning

**Positie:** 0, 4300 | **Grootte:** 5900 x 600px

### Content

```
+-------------------------------------------------------------------------+
|                                                                         |
|  ONDERHOUD & VERSIONING                                                |
|  ═══════════════════════                                               |
|                                                                         |
|  REVIEW CYCLUS                          VERSION CONTROL                 |
|  ─────────────────                      ─────────────────               |
|  • Maandelijks: Content review          • Major: X.0 Breaking changes   |
|  • Quarterly: Style guide update        • Minor: X.Y New features       |
|  • Yearly: Complete audit               • Patch: X.Y.Z Fixes            |
|                                                                         |
|  CHANGE LOG                                                            |
|  ─────────────────────────────────────────────────────────────────     |
|  | Versie | Datum      | Auteur | Wijzigingen                     |   |
|  |--------|------------|--------|----------------------------------|   |
|  | 1.0.0  | 2024-12-30 | A9     | Initiële versie alle 7 boards   |   |
|  |--------|------------|--------|----------------------------------|   |
|                                                                         |
|  VERANTWOORDELIJKEN                                                    |
|  ─────────────────────────────────────────────────────────────────     |
|  • Board Owner: A9 (Documentation Lead)                                |
|  • Review: A0 (Project Lead)                                           |
|  • Technical Review: A1 (Code Lead)                                    |
|                                                                         |
|  LINKS                                                                 |
|  ─────────────────────────────────────────────────────────────────     |
|  [OUTCOMES.md] [DELIVERABLES.md] [M1] [M2] [M3] [M4] [M5] [M7]        |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Version History

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0.0 | 2024-12-30 | A9 | Initiële versie alle 7 boards |

### Onderhoud Schedule

| Frequentie | Activiteit | Verantwoordelijke |
|------------|------------|-------------------|
| Maandelijks | Content review op actualiteit | A9 |
| Quarterly | Style guide updates | A9 + A3 |
| Yearly | Complete board audit | A0 + alle agents |

---

## Miro Implementatie Instructies

### Stap 1: Board Aanmaken
1. Open Miro
2. Create new board: "M6: Visual Docs Board"
3. Set board size: 6000 x 5000px

### Stap 2: Frames Plaatsen
1. Voeg 6 frames toe volgens layout
2. Gebruik exacte posities uit specificatie
3. Label elk frame met F1-F6 prefix

### Stap 3: Content Toevoegen
1. Kopieer content uit dit document
2. Pas Miro elementen toe (shapes, stickies)
3. Gebruik style guide kleuren

### Stap 4: Links Configureren
1. Maak links naar alle M1-M7 boards
2. Voeg "Terug naar Index" link toe aan alle andere boards
3. Link naar OUTCOMES.md en DELIVERABLES.md

### Stap 5: Exporteren
1. Export als PDF: M6-visual-docs-board-v1.0.pdf
2. Plaats in `docs/miro/exports/`

---

## Gerelateerde Documenten

| Document | Relatie |
|----------|---------|
| OUTCOMES.md | O8 Key Results |
| DELIVERABLES-MIRO.md | M6 specificatie |
| M1-M7 | Alle geindexeerde boards |
| ARCHITECTURE.md | Technische context |

---

*Document versie: 1.0*
*Laatst bijgewerkt: 30 December 2024*
*Deliverable: M6 - O8 Visual Docs Board*
