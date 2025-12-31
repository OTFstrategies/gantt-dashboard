# ROLLEN.md - Platform & Organisatie Rollen

> **Versie:** 1.0.0
> **Datum:** 2024-12-30
> **Deliverable:** P1
> **Status:** Compleet

---

## Inhoudsopgave

1. [Platform Rollen Overview](#1-platform-rollen-overview)
2. [Admin](#2-admin)
3. [Vault Medewerker](#3-vault-medewerker)
4. [Medewerker](#4-medewerker)
5. [Klant Editor](#5-klant-editor)
6. [Klant Viewer](#6-klant-viewer)
7. [Permissions Matrix](#7-permissions-matrix)
8. [Organisatie Rollen](#8-organisatie-rollen)
9. [Rol Hierarchie](#9-rol-hierarchie)
10. [Toewijzing & Transitie Regels](#10-toewijzing--transitie-regels)

---

## 1. Platform Rollen Overview

Het Gantt Dashboard platform kent 5 platform rollen met verschillende bevoegdheden. Deze rollen bepalen wat gebruikers kunnen zien en doen binnen het systeem.

### Rol Overzicht

| Rol | Code | Niveau | Scope | Beschrijving |
|-----|------|--------|-------|--------------|
| **Admin** | `admin` | 1 (hoogste) | Workspace | Volledige toegang tot workspace beheer |
| **Vault Medewerker** | `vault_medewerker` | 2 | Afdeling | Vault verwerking specialist |
| **Medewerker** | `medewerker` | 3 | Project | Standaard interne gebruiker |
| **Klant Editor** | `klant_editor` | 4 | Eigen project | Externe klant met edit rechten |
| **Klant Viewer** | `klant_viewer` | 5 (laagste) | Eigen project | Externe klant met alleen lees rechten |

### Rol Karakteristieken

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROL KARAKTERISTIEKEN                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Niveau 1: ADMIN                                                            │
│  ├── Volledige workspace toegang                                            │
│  ├── Gebruikersbeheer                                                       │
│  ├── Vault toegang                                                          │
│  └── Alle exports                                                           │
│                                                                              │
│  Niveau 2: VAULT MEDEWERKER                                                 │
│  ├── Vault verwerking                                                       │
│  ├── Data validatie                                                         │
│  ├── Export (Vault data)                                                    │
│  └── Geen project editing                                                   │
│                                                                              │
│  Niveau 3: MEDEWERKER                                                       │
│  ├── Project editing                                                        │
│  ├── Task management                                                        │
│  ├── Resource allocatie                                                     │
│  └── Basis exports                                                          │
│                                                                              │
│  Niveau 4: KLANT EDITOR                                                     │
│  ├── Eigen project editing                                                  │
│  ├── Task updates                                                           │
│  └── Geen Vault toegang                                                     │
│                                                                              │
│  Niveau 5: KLANT VIEWER                                                     │
│  ├── Alleen lezen                                                           │
│  └── Geen Vault toegang                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Admin

### Beschrijving

De Admin heeft volledige toegang tot alle functionaliteiten van het platform binnen hun workspace(s). Deze rol is bedoeld voor workspace beheerders, afdelingshoofden en technische administrators.

### Kernverantwoordelijkheden

| Categorie | Verantwoordelijkheden |
|-----------|----------------------|
| **Workspace Beheer** | Workspace configuratie, instellingen, archivering |
| **Gebruikersbeheer** | Uitnodigen, rollen toewijzen, deactiveren, bulk import |
| **Project Management** | Projecten aanmaken, templates beheren, archiveren |
| **Vault Supervisie** | Vault items bekijken, verwerken, exporteren |
| **Support** | Escalatie afhandeling, gebruikersondersteuning |
| **Audit** | Audit log review, security monitoring |

### Bevoegdheden (Permissions)

| Permission | Beschrijving | Toegestaan |
|------------|--------------|------------|
| `workspace.create` | Nieuwe workspace aanmaken | :white_check_mark: |
| `workspace.read` | Workspace bekijken | :white_check_mark: |
| `workspace.update` | Workspace instellingen wijzigen | :white_check_mark: |
| `workspace.delete` | Workspace verwijderen | :white_check_mark: |
| `workspace.archive` | Workspace archiveren | :white_check_mark: |
| `workspace.members.manage` | Leden beheren | :white_check_mark: |
| `workspace.members.invite` | Leden uitnodigen | :white_check_mark: |
| `workspace.settings` | Workspace instellingen | :white_check_mark: |
| `project.create` | Project aanmaken | :white_check_mark: |
| `project.read` | Project bekijken | :white_check_mark: |
| `project.update` | Project bewerken | :white_check_mark: |
| `project.delete` | Project verwijderen | :white_check_mark: |
| `project.archive` | Project archiveren | :white_check_mark: |
| `project.template` | Project templates beheren | :white_check_mark: |
| `task.*` | Alle task operaties | :white_check_mark: |
| `resource.*` | Alle resource operaties | :white_check_mark: |
| `dependency.*` | Alle dependency operaties | :white_check_mark: |
| `assignment.*` | Alle assignment operaties | :white_check_mark: |
| `vault.view` | Vault bekijken | :white_check_mark: |
| `vault.process` | Vault items verwerken | :white_check_mark: |
| `vault.export` | Vault data exporteren | :white_check_mark: |
| `vault.delete` | Vault items verwijderen | :white_check_mark: |
| `export.*` | Alle export formaten | :white_check_mark: |
| `settings.*` | Alle instellingen | :white_check_mark: |
| `audit.view` | Audit logs bekijken | :white_check_mark: |

### Toewijzing Regels

| Aspect | Regel |
|--------|-------|
| **Automatisch** | Workspace creator krijgt automatisch Admin rol |
| **Handmatig** | Door bestaande Admin van dezelfde workspace |
| **Minimum** | Minimaal 1 Admin per workspace (verplicht) |
| **Maximum** | Geen limiet, maar max 3 aanbevolen |
| **Vereisten** | Geen speciale vereisten |

### Rapporteert aan

- **Platform niveau:** Niemand (hoogste niveau binnen workspace)
- **Organisatie niveau:** Afhankelijk van bedrijfsstructuur (bijv. Directie, IT Manager)

---

## 3. Vault Medewerker

### Beschrijving

Gespecialiseerde rol voor het verwerken van data in de Vault. Heeft toegang tot de Vault workflow maar geen volledige project editing rechten. Deze rol is essentieel voor het behouden van data-integriteit en het correct verwerken van afgeronde projecten.

### Kernverantwoordelijkheden

| Categorie | Verantwoordelijkheden |
|-----------|----------------------|
| **Vault Verwerking** | Items verwerken (Input > Processing > Done) |
| **Data Validatie** | Controleren van data kwaliteit en volledigheid |
| **Documentatie** | Processing notes bijhouden |
| **Export** | Data exporteren naar externe systemen |
| **Audit Trail** | Alle verwerkingsacties loggen |

### Bevoegdheden (Permissions)

| Permission | Beschrijving | Toegestaan |
|------------|--------------|------------|
| `workspace.read` | Workspace bekijken | :white_check_mark: |
| `project.read` | Projecten bekijken | :white_check_mark: |
| `task.read` | Taken bekijken | :white_check_mark: |
| `resource.read` | Resources bekijken | :white_check_mark: |
| `vault.view` | Vault dashboard bekijken | :white_check_mark: |
| `vault.process` | Vault items verwerken | :white_check_mark: |
| `vault.export` | Vault data exporteren | :white_check_mark: |
| `vault.notes` | Processing notes toevoegen | :white_check_mark: |
| `vault.filter` | Vault filteren op afdeling | :white_check_mark: |
| `vault.search` | Vault doorzoeken | :white_check_mark: |
| `export.vault` | Vault specifieke exports | :white_check_mark: |

### Wat NIET is toegestaan

| Permission | Beschrijving | Status |
|------------|--------------|--------|
| `workspace.update` | Workspace wijzigen | :x: |
| `workspace.members.*` | Leden beheren | :x: |
| `project.create` | Projecten aanmaken | :x: |
| `project.update` | Projecten bewerken | :x: |
| `task.create` | Taken aanmaken | :x: |
| `task.update` | Taken bewerken | :x: |
| `settings.*` | Instellingen wijzigen | :x: |

### Toewijzing Regels

| Aspect | Regel |
|--------|-------|
| **Toewijzing door** | Admin |
| **Vereisten** | Training Vault procedures afgerond |
| **Minimum** | 0 per workspace |
| **Maximum** | 3 per workspace (aanbevolen voor scheiding taken) |
| **Scope** | Alleen eigen afdeling Vault items |

### Rapporteert aan

- **Escalaties:** Admin
- **Dagelijks:** Workflow supervisor / Afdelingshoofd
- **Inhoudelijk:** ISO Officer (voor compliance)

---

## 4. Medewerker

### Beschrijving

Standaard rol voor interne teamleden die aan projecten werken. Kan taken beheren, planning aanpassen en basisexports uitvoeren binnen toegewezen workspaces. Dit is de meest voorkomende rol voor dagelijkse gebruikers.

### Kernverantwoordelijkheden

| Categorie | Verantwoordelijkheden |
|-----------|----------------------|
| **Planning** | Project planning opstellen en onderhouden |
| **Taken** | Taken aanmaken, bewerken, voltooien |
| **Resources** | Resource allocatie en beheer |
| **Rapportage** | Voortgang bijhouden en rapporteren |
| **Samenwerking** | Met teamleden en klanten werken |
| **Export** | Data exporteren voor rapportage |

### Bevoegdheden (Permissions)

| Permission | Beschrijving | Toegestaan |
|------------|--------------|------------|
| `workspace.read` | Workspace bekijken | :white_check_mark: |
| `project.read` | Projecten bekijken | :white_check_mark: |
| `project.update` | Projecten bewerken | :white_check_mark: |
| `project.complete` | Project "klaar" markeren | :white_check_mark: |
| `task.create` | Taken aanmaken | :white_check_mark: |
| `task.read` | Taken bekijken | :white_check_mark: |
| `task.update` | Taken bewerken | :white_check_mark: |
| `task.delete` | Taken verwijderen | :white_check_mark: |
| `resource.create` | Resources aanmaken | :white_check_mark: |
| `resource.read` | Resources bekijken | :white_check_mark: |
| `resource.update` | Resources bewerken | :white_check_mark: |
| `resource.delete` | Resources verwijderen | :white_check_mark: |
| `dependency.create` | Dependencies aanmaken | :white_check_mark: |
| `dependency.read` | Dependencies bekijken | :white_check_mark: |
| `dependency.update` | Dependencies bewerken | :white_check_mark: |
| `dependency.delete` | Dependencies verwijderen | :white_check_mark: |
| `assignment.*` | Alle assignment operaties | :white_check_mark: |
| `baseline.create` | Baselines aanmaken | :white_check_mark: |
| `baseline.read` | Baselines bekijken | :white_check_mark: |
| `export.basic` | Basis exports (Excel, PDF, CSV) | :white_check_mark: |

### Wat NIET is toegestaan

| Permission | Beschrijving | Status |
|------------|--------------|--------|
| `workspace.*` (behalve read) | Workspace beheer | :x: |
| `project.create` | Projecten aanmaken | :x: |
| `project.delete` | Projecten verwijderen | :x: |
| `vault.*` | Vault toegang | :x: |
| `settings.*` | Instellingen wijzigen | :x: |
| `audit.*` | Audit logs | :x: |

### Toewijzing Regels

| Aspect | Regel |
|--------|-------|
| **Toewijzing door** | Admin |
| **Automatisch** | Default rol voor nieuwe interne gebruikers |
| **Minimum** | 0 per workspace |
| **Maximum** | Geen limiet |
| **Vereisten** | Interne medewerker van de organisatie |

### Rapporteert aan

- **Permission issues:** Admin
- **Inhoudelijk:** Project Lead
- **Dagelijks:** Teamlead / Direct leidinggevende

---

## 5. Klant Editor

### Beschrijving

Externe klant met bewerkingsrechten op eigen project. Kan taken aanpassen, status updates geven en feedback leveren, maar heeft geen toegang tot interne workspaces, de Vault, of andere klant-projecten.

### Kernverantwoordelijkheden

| Categorie | Verantwoordelijkheden |
|-----------|----------------------|
| **Taken** | Eigen taken beheren en updaten |
| **Status** | Voortgang communiceren |
| **Feedback** | Feedback geven op planning |
| **Review** | Deliverables reviewen |

### Bevoegdheden (Permissions)

| Permission | Beschrijving | Scope | Toegestaan |
|------------|--------------|-------|------------|
| `workspace.read` | Workspace bekijken | Eigen | :white_check_mark: |
| `project.read` | Project bekijken | Eigen | :white_check_mark: |
| `project.update` | Project bewerken | Eigen | :white_check_mark: |
| `task.read` | Taken bekijken | Eigen | :white_check_mark: |
| `task.update` | Taken bewerken | Eigen | :white_check_mark: |
| `task.create` | Taken aanmaken | Eigen | :white_check_mark: |
| `resource.read` | Resources bekijken | Eigen | :white_check_mark: |
| `dependency.read` | Dependencies bekijken | Eigen | :white_check_mark: |
| `export.basic` | Basis exports | Eigen | :white_check_mark: |

### Wat NIET is toegestaan

| Permission | Beschrijving | Status |
|------------|--------------|--------|
| `workspace.*` (behalve read) | Workspace beheer | :x: |
| `project.delete` | Project verwijderen | :x: |
| `project.archive` | Project archiveren | :x: |
| `vault.*` | Vault toegang (volledig onzichtbaar) | :x: |
| `settings.*` | Instellingen | :x: |
| `andere_workspace.*` | Toegang tot andere workspaces | :x: |
| `interne_notities.*` | Interne notities bekijken | :x: |

### Toewijzing Regels

| Aspect | Regel |
|--------|-------|
| **Toewijzing door** | Admin (via uitnodiging) |
| **Workspace type** | Alleen "klant" type workspaces |
| **Minimum** | 0 per workspace |
| **Maximum** | 10 per workspace (configureerbaar) |
| **Vereisten** | Email verificatie, account registratie |

### Rapporteert aan

- **Project gerelateerd:** Klant Contactpersoon
- **Platform support:** Via Klant Contactpersoon (geen directe support)

---

## 6. Klant Viewer

### Beschrijving

Externe klant met alleen lees-toegang tot eigen project. Kan project voortgang bekijken en planning monitoren, maar kan geen wijzigingen aanbrengen. Ideaal voor stakeholders die alleen geïnformeerd hoeven te worden.

### Kernverantwoordelijkheden

| Categorie | Verantwoordelijkheden |
|-----------|----------------------|
| **Monitoring** | Project voortgang bekijken |
| **Planning** | Planning bekijken |
| **Informatie** | Geïnformeerd blijven over status |

### Bevoegdheden (Permissions)

| Permission | Beschrijving | Scope | Toegestaan |
|------------|--------------|-------|------------|
| `workspace.read` | Workspace bekijken | Eigen | :white_check_mark: |
| `project.read` | Project bekijken | Eigen | :white_check_mark: |
| `task.read` | Taken bekijken | Eigen | :white_check_mark: |
| `resource.read` | Resources bekijken | Eigen | :white_check_mark: |
| `dependency.read` | Dependencies bekijken | Eigen | :white_check_mark: |
| `baseline.read` | Baselines bekijken | Eigen | :white_check_mark: |

### Wat NIET is toegestaan

| Permission | Beschrijving | Status |
|------------|--------------|--------|
| `*.create` | Alle create operaties | :x: |
| `*.update` | Alle update operaties | :x: |
| `*.delete` | Alle delete operaties | :x: |
| `export.*` | Exports | :x: |
| `vault.*` | Vault (volledig onzichtbaar) | :x: |
| `settings.*` | Instellingen | :x: |

### Toewijzing Regels

| Aspect | Regel |
|--------|-------|
| **Toewijzing door** | Admin (via uitnodiging) |
| **Workspace type** | Alleen "klant" type workspaces |
| **Minimum** | 0 per workspace |
| **Maximum** | Geen limiet |
| **Vereisten** | Email verificatie, account registratie |

### Rapporteert aan

- N.v.t. (geen actieve taken)
- Feedback via externe kanalen naar Klant Contactpersoon

---

## 7. Permissions Matrix

### Complete Permissions Matrix

| Actie | Admin | Vault MW | Medewerker | Klant Editor | Klant Viewer |
|-------|:-----:|:--------:|:----------:|:------------:|:------------:|
| **WORKSPACE** |
| Workspace aanmaken | :white_check_mark: | :x: | :x: | :x: | :x: |
| Workspace bekijken | :white_check_mark: | :white_check_mark: | :white_check_mark: | :orange_circle: | :orange_circle: |
| Workspace bewerken | :white_check_mark: | :x: | :x: | :x: | :x: |
| Workspace archiveren | :white_check_mark: | :x: | :x: | :x: | :x: |
| Leden beheren | :white_check_mark: | :x: | :x: | :x: | :x: |
| **PROJECT** |
| Project aanmaken | :white_check_mark: | :x: | :x: | :x: | :x: |
| Project bekijken (eigen afd) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :orange_circle: | :orange_circle: |
| Project bekijken (alle afd) | :white_check_mark: | :x: | :x: | :x: | :x: |
| Project bewerken | :white_check_mark: | :x: | :white_check_mark: | :orange_circle: | :x: |
| Project archiveren | :white_check_mark: | :x: | :x: | :x: | :x: |
| Project "klaar" markeren | :white_check_mark: | :x: | :white_check_mark: | :x: | :x: |
| **TAKEN** |
| Taken bekijken | :white_check_mark: | :white_check_mark: | :white_check_mark: | :orange_circle: | :orange_circle: |
| Taken aanmaken | :white_check_mark: | :x: | :white_check_mark: | :orange_circle: | :x: |
| Taken bewerken | :white_check_mark: | :x: | :white_check_mark: | :orange_circle: | :x: |
| Taken verwijderen | :white_check_mark: | :x: | :white_check_mark: | :x: | :x: |
| **RESOURCES** |
| Resources bekijken | :white_check_mark: | :white_check_mark: | :white_check_mark: | :orange_circle: | :orange_circle: |
| Resources beheren | :white_check_mark: | :x: | :white_check_mark: | :x: | :x: |
| **DEPENDENCIES** |
| Dependencies bekijken | :white_check_mark: | :white_check_mark: | :white_check_mark: | :orange_circle: | :orange_circle: |
| Dependencies beheren | :white_check_mark: | :x: | :white_check_mark: | :x: | :x: |
| **VAULT** |
| Vault bekijken | :white_check_mark: | :orange_circle: | :x: | :x: | :x: |
| Vault items verwerken | :white_check_mark: | :orange_circle: | :x: | :x: | :x: |
| Vault items verwijderen | :white_check_mark: | :x: | :x: | :x: | :x: |
| Vault export | :white_check_mark: | :orange_circle: | :x: | :x: | :x: |
| **EXPORT** |
| Export naar Excel | :white_check_mark: | :orange_circle: | :white_check_mark: | :orange_circle: | :x: |
| Export naar PDF | :white_check_mark: | :orange_circle: | :white_check_mark: | :orange_circle: | :x: |
| Export naar CSV | :white_check_mark: | :orange_circle: | :white_check_mark: | :orange_circle: | :x: |
| **ADMIN** |
| Gebruikers beheren | :white_check_mark: | :x: | :x: | :x: | :x: |
| Rollen toewijzen | :white_check_mark: | :x: | :x: | :x: | :x: |
| Instellingen wijzigen | :white_check_mark: | :x: | :x: | :x: | :x: |
| Audit logs bekijken | :white_check_mark: | :x: | :x: | :x: | :x: |

**Legenda:**
- :white_check_mark: = Volledige toegang
- :orange_circle: = Beperkt tot eigen scope (afdeling/project)
- :x: = Geen toegang

### Permission Inheritance

Hogere rollen erven NIET automatisch de permissions van lagere rollen. Elke rol heeft een expliciet gedefinieerde set permissions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERMISSION MODEL (GEEN INHERITANCE)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Admin             ──► [workspace.*, project.*, task.*, vault.*, ...]       │
│                                                                              │
│  Vault Medewerker  ──► [workspace.read, vault.*, export.vault]              │
│                                                                              │
│  Medewerker        ──► [workspace.read, project.edit, task.*, export.basic] │
│                                                                              │
│  Klant Editor      ──► [workspace.read:own, project.edit:own, task.*:own]   │
│                                                                              │
│  Klant Viewer      ──► [workspace.read:own, project.read:own, task.read:own]│
│                                                                              │
│  Elke rol heeft expliciet gedefinieerde permissions.                        │
│  Geen automatische inheritance van andere rollen.                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Organisatie Rollen

Naast platform rollen kent de organisatie functionele rollen die niet direct in het systeem zijn geïmplementeerd maar wel relevant zijn voor de workflow.

### Platform Administrator

| Aspect | Beschrijving |
|--------|--------------|
| **Focus** | Technische infrastructuur |
| **Verantwoordelijkheden** | Supabase beheer, Vercel deployment, platform-brede issues |
| **Platform rol** | Super-admin (buiten normale workspace structuur) |
| **Rapporteert aan** | IT Manager / Directie |

### Afdeling Manager

| Aspect | Beschrijving |
|--------|--------------|
| **Focus** | Afdeling operaties |
| **Verantwoordelijkheden** | Afdeling workspace beheren, medewerkers aansturen, rapportage |
| **Platform rol** | Admin (binnen afdeling workspace) |
| **Rapporteert aan** | Directie |

### Project Lead

| Aspect | Beschrijving |
|--------|--------------|
| **Focus** | Project uitvoering |
| **Verantwoordelijkheden** | Project planning, resource coordinatie, stakeholder communicatie |
| **Platform rol** | Admin of Medewerker (afhankelijk van organisatie) |
| **Rapporteert aan** | Afdeling Manager |

### Klant Contactpersoon

| Aspect | Beschrijving |
|--------|--------------|
| **Focus** | Klantrelatie |
| **Verantwoordelijkheden** | Single point of contact voor klant, klant workspace beheren |
| **Platform rol** | Admin (op klant workspace) |
| **Rapporteert aan** | Project Lead / Afdeling Manager |

### ISO Officer

| Aspect | Beschrijving |
|--------|--------------|
| **Focus** | Compliance |
| **Verantwoordelijkheden** | ISO conformiteit bewaken, audit uitvoeren, procedures onderhouden |
| **Platform rol** | Admin of Vault Medewerker (afhankelijk van taken) |
| **Rapporteert aan** | Directie |

---

## 9. Rol Hierarchie

### Hierarchie Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROL HIERARCHIE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌─────────────────┐                                 │
│                         │ Platform Admin  │ (technisch, buiten scope)       │
│                         └────────┬────────┘                                 │
│                                  │                                          │
│                                  ▼                                          │
│                         ┌─────────────────┐                                 │
│                         │     ADMIN       │  Niveau 1                       │
│                         │  (Workspace)    │                                 │
│                         └────────┬────────┘                                 │
│                                  │                                          │
│            ┌─────────────────────┼─────────────────────┐                   │
│            │                     │                     │                    │
│            ▼                     ▼                     ▼                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ VAULT MEDEWERKER│  │   MEDEWERKER    │  │  (Klant path)   │            │
│  │                 │  │                 │  │                 │  Niveau 2-3 │
│  │   Niveau 2      │  │   Niveau 3      │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └────────┬────────┘            │
│                                                      │                      │
│                                           ┌──────────┴──────────┐          │
│                                           │                     │          │
│                                           ▼                     ▼          │
│                                 ┌─────────────────┐  ┌─────────────────┐  │
│                                 │  KLANT EDITOR   │  │  KLANT VIEWER   │  │
│                                 │                 │  │                 │  │
│                                 │   Niveau 4      │  │   Niveau 5      │  │
│                                 └─────────────────┘  └─────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Escalatie Paden

| Van | Naar | Type Escalatie |
|----|------|----------------|
| Klant Viewer | Klant Contactpersoon | Inhoudelijke vragen |
| Klant Editor | Klant Contactpersoon | Support, toegang issues |
| Medewerker | Project Lead | Inhoudelijke zaken |
| Medewerker | Admin | Permission issues |
| Vault Medewerker | Admin | Vault escalaties |
| Admin | Platform Administrator | Technische issues |

---

## 10. Toewijzing & Transitie Regels

### Rol Toewijzing

| Van Rol | Naar Rol | Wie Mag Toewijzen | Voorwaarden |
|---------|----------|-------------------|-------------|
| (nieuw) | Admin | Eerste workspace creator | Automatisch |
| (nieuw) | Admin | Bestaande Admin | Goedkeuring |
| (nieuw) | Vault Medewerker | Admin | Training voltooid |
| (nieuw) | Medewerker | Admin | Interne medewerker |
| (nieuw) | Klant Editor | Admin | Via uitnodiging, email verificatie |
| (nieuw) | Klant Viewer | Admin | Via uitnodiging, email verificatie |

### Rol Transitie (Promotie/Demotie)

| Van | Naar | Toegestaan | Voorwaarden |
|-----|------|------------|-------------|
| Klant Viewer | Klant Editor | :white_check_mark: | Door Admin |
| Klant Editor | Klant Viewer | :white_check_mark: | Door Admin |
| Medewerker | Vault Medewerker | :white_check_mark: | Training voltooid, door Admin |
| Vault Medewerker | Medewerker | :white_check_mark: | Door Admin |
| Medewerker | Admin | :white_check_mark: | Door Admin |
| Admin | Medewerker | :white_check_mark: | Door andere Admin, min 1 Admin blijft |
| Klant* | Medewerker | :x: | Workspace type conflict |
| Medewerker | Klant* | :x: | Workspace type conflict |

### Workspace Type Restricties

| Workspace Type | Toegestane Rollen |
|----------------|-------------------|
| **Afdeling** | Admin, Vault Medewerker, Medewerker |
| **Klant** | Admin, Klant Editor, Klant Viewer |

### Automatische Rol Acties

| Trigger | Actie |
|---------|-------|
| Workspace aanmaken | Creator wordt Admin |
| Gebruiker inactief > 90 dagen | Melding naar Admin |
| Laatste Admin verwijderd | Blokkeer actie (min 1 Admin vereist) |
| Workspace gearchiveerd | Alle rollen worden read-only |

---

## Gerelateerde Documenten

| Document | Relatie | Beschrijving |
|----------|---------|--------------|
| [PROCEDURES.md](./PROCEDURES.md) | Referentie | Procedures per rol |
| [GLOSSARY.md](./GLOSSARY.md) | Referentie | Terminologie |
| [ONBOARDING.md](./ONBOARDING.md) | Referentie | Onboarding per rol |
| [OUTCOMES.md](../OUTCOMES.md) | Implements | O9 Rollen & Procedures |
| [DELIVERABLES.md](../DELIVERABLES.md) | Part of | P1 Deliverable |

---

## Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0.0 | 2024-12-30 | A10 | Initieel document |

---

*Document versie: 1.0.0*
*Laatst bijgewerkt: 30 December 2024*
*Platform rollen: 5 | Organisatie rollen: 5 | Permissions: 40+*
