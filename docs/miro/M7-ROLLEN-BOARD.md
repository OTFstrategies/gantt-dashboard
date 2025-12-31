# M7: O9 Rollen & Procedures Board Specificatie

> **Miro Board Specificatie voor Rollen & Procedures**
> **Versie:** 1.0
> **Datum:** 2024-12-30
> **Agent:** A9 (Visual Designer)

---

## Overzicht

Dit document bevat de volledige specificatie voor het M7 Miro Board dat O9 (Rollen & Procedures) visualiseert:

| Outcome | Beschrijving | Key Results |
|---------|--------------|-------------|
| **O9** | Rollen & Procedures | KR9.1-9.50 (50 KRs) |

---

## Board Structuur

```
M7-ROLLEN-BOARD
├── Frame 1: Header & Overview
├── Frame 2: Organisatie Structuur Diagram
├── Frame 3: Department Hierarchie
├── Frame 4: Procedure Flowcharts
├── Frame 5: Decision Trees voor Escalatie
├── Frame 6: Communication Flows
├── Frame 7: Onboarding Journey Maps per Rol
└── Frame 8: Decisions & Notes
```

---

## Frame 1: Header & Overview

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ╔══════════════════════════════════════════════════════════════════════╗  │
│   ║  M7: ROLLEN & PROCEDURES BOARD                                        ║  │
│   ║  O9: Rollen & Procedures                                              ║  │
│   ╚══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  OUTCOME                                                             │   │
│   │                                                                      │   │
│   │  O9: "Alle rollen, procedures, terminologie en classificaties       │   │
│   │       uitgewerkt"                                                    │   │
│   │                                                                      │   │
│   │  Categorieën (50 Key Results):                                      │   │
│   │  • KR9.1-9.5: Platform Rollen (5)                                   │   │
│   │  • KR9.6-9.9: Organisatie Rollen (4)                                │   │
│   │  • KR9.10-9.17: Platform Procedures (8)                             │   │
│   │  • KR9.18-9.22: Vault Procedures (5)                                │   │
│   │  • KR9.23-9.28: Klant Procedures (6)                                │   │
│   │  • KR9.29-9.33: ISO Procedures (5)                                  │   │
│   │  • KR9.34-9.37: Communicatie Procedures (4)                         │   │
│   │  • KR9.38-9.42: Glossary (5)                                        │   │
│   │  • KR9.43-9.50: Taxonomie (8)                                       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐               │
│   │ Versie: 1.0    │  │ Datum: 30-12   │  │ Status: Draft  │               │
│   └────────────────┘  └────────────────┘  └────────────────┘               │
│                                                                              │
│   GERELATEERDE DOCUMENTEN:                                                  │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐              │
│   │   P1   │  │   P2   │  │   P3   │  │   P4   │  │   P5   │              │
│   │ROLLEN  │  │PROCED. │  │GLOSSARY│  │TAXONOMY│  │ONBOARD │              │
│   └────────┘  └────────┘  └────────┘  └────────┘  └────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frame 2: Organisatie Structuur Diagram

### Mermaid Diagram - Full Organization

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e3f2fd'}}}%%
graph TB
    subgraph Governance["GOVERNANCE LAAG"]
        PO[Platform Owner<br/>Strategische beslissingen]
        ISO[ISO Officer<br/>Compliance & Audit]
    end

    subgraph Management["MANAGEMENT LAAG"]
        PA[Platform Admin<br/>Technisch beheer]
        AH1[Afdelingshoofd A<br/>Afdeling leiding]
        AH2[Afdelingshoofd B<br/>Afdeling leiding]
        AH3[Afdelingshoofd C<br/>Afdeling leiding]
        AH4[Afdelingshoofd D<br/>Afdeling leiding]
    end

    subgraph Operations["OPERATIONELE LAAG"]
        VM1[Vault MW A]
        VM2[Vault MW B]
        VM3[Vault MW C]
        VM4[Vault MW D]
        MW1[Medewerkers A]
        MW2[Medewerkers B]
        MW3[Medewerkers C]
        MW4[Medewerkers D]
    end

    subgraph External["EXTERNE LAAG"]
        KE[Klant Editors]
        KV[Klant Viewers]
    end

    PO --> PA
    PO --> ISO
    PA --> AH1
    PA --> AH2
    PA --> AH3
    PA --> AH4

    AH1 --> VM1
    AH1 --> MW1
    AH2 --> VM2
    AH2 --> MW2
    AH3 --> VM3
    AH3 --> MW3
    AH4 --> VM4
    AH4 --> MW4

    VM1 -.-> KE
    VM2 -.-> KE
    MW1 -.-> KE
    KE --> KV

    style Governance fill:#f3e5f5,stroke:#7b1fa2
    style Management fill:#e8f5e9,stroke:#388e3c
    style Operations fill:#fff3e0,stroke:#f57c00
    style External fill:#e3f2fd,stroke:#1976d2
```

### Organisatie Structuur Detail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORGANISATIE STRUCTUUR - VOLLEDIG OVERZICHT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           ┌───────────────────┐                             │
│                           │   PLATFORM OWNER  │                             │
│                           │   (Strategisch)   │                             │
│                           └─────────┬─────────┘                             │
│                                     │                                        │
│                     ┌───────────────┼───────────────┐                       │
│                     │               │               │                        │
│                     ▼               ▼               ▼                        │
│            ┌────────────────┐ ┌───────────┐ ┌────────────────┐              │
│            │ PLATFORM ADMIN │ │ISO OFFICER│ │ (toekomstig)   │              │
│            │  (Technisch)   │ │(Compliance)│ │                │              │
│            └───────┬────────┘ └───────────┘ └────────────────┘              │
│                    │                                                         │
│    ┌───────────────┼───────────────┬───────────────┬───────────────┐        │
│    ▼               ▼               ▼               ▼               ▼        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│ │AFDELING A│ │AFDELING B│ │AFDELING C│ │AFDELING D│                        │
│ │──────────│ │──────────│ │──────────│ │──────────│                        │
│ │ Hoofd    │ │ Hoofd    │ │ Hoofd    │ │ Hoofd    │                        │
│ │ Vault MW │ │ Vault MW │ │ Vault MW │ │ Vault MW │                        │
│ │ MWs      │ │ MWs      │ │ MWs      │ │ MWs      │                        │
│ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘                        │
│      │            │            │            │                               │
│      │            │            │            │                               │
│      ▼            ▼            ▼            ▼                               │
│ ┌──────────────────────────────────────────────────┐                       │
│ │              KLANT PROJECTEN                      │                       │
│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│                       │
│ │  │Klant X  │ │Klant Y  │ │Klant Z  │ │ ...     ││                       │
│ │  │Editors  │ │Editors  │ │Editors  │ │         ││                       │
│ │  │Viewers  │ │Viewers  │ │Viewers  │ │         ││                       │
│ │  └─────────┘ └─────────┘ └─────────┘ └─────────┘│                       │
│ └──────────────────────────────────────────────────┘                       │
│                                                                              │
│  LEGENDA:                                                                   │
│  ━━━ = Directe rapportage                                                  │
│  --- = Functionele relatie                                                  │
│  ... = Optionele/toekomstige relatie                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frame 3: Department Hierarchie

### Mermaid Diagram - Department Structure

```mermaid
%%{init: {'theme': 'base'}}%%
graph TB
    subgraph DeptA["AFDELING A - [NAAM]"]
        AH_A[Afdelingshoofd]
        VM_A[Vault Medewerker]
        MW_A1[Medewerker 1]
        MW_A2[Medewerker 2]
        MW_A3[Medewerker 3]

        AH_A --> VM_A
        AH_A --> MW_A1
        AH_A --> MW_A2
        AH_A --> MW_A3
    end

    subgraph Workspace_A["WORKSPACE A"]
        Proj_A1[Project 1]
        Proj_A2[Project 2]
        Vault_A[Vault Items]
    end

    subgraph Klant_A["KLANT WORKSPACES"]
        Klant_A1[Klant X Project]
        Klant_A2[Klant Y Project]
    end

    VM_A --> Vault_A
    MW_A1 --> Proj_A1
    MW_A2 --> Proj_A2
    VM_A -.-> Klant_A1
    MW_A1 -.-> Klant_A1
    VM_A -.-> Klant_A2

    style DeptA fill:#e3f2fd,stroke:#1976d2
    style Workspace_A fill:#e8f5e9,stroke:#388e3c
    style Klant_A fill:#fff3e0,stroke:#f57c00
```

### Role Cards per Department

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AFDELINGSSTRUCTUUR - DETAIL VIEW                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  AFDELINGSHOOFD                                            [ORG]      │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  VERANTWOORDELIJKHEDEN:                                               │ │
│  │  • Leidt de afdeling en stuurt medewerkers aan                        │ │
│  │  • Bewaakt voortgang van projecten binnen afdeling                    │ │
│  │  • Escaleert issues naar Platform Admin                               │ │
│  │  • Beoordeelt resource allocatie                                      │ │
│  │  • Controleert kwaliteit van deliverables                             │ │
│  │                                                                        │ │
│  │  PLATFORM ROL: Vaak Admin of Vault Medewerker                         │ │
│  │  REPORTS TO: Platform Owner                                           │ │
│  │  SUPERVISES: Vault MW, Medewerkers                                    │ │
│  │                                                                        │ │
│  │  DAGELIJKSE TAKEN:                                                    │ │
│  │  □ Review project dashboards                                          │ │
│  │  □ Team standup/sync                                                  │ │
│  │  □ Klant communicatie (escalaties)                                    │ │
│  │  □ Resource planning                                                  │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  PROJECTLEIDER                                             [ORG]      │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  VERANTWOORDELIJKHEDEN:                                               │ │
│  │  • Leidt specifieke projecten                                         │ │
│  │  • Plant en bewaakt tijdlijnen (Gantt)                                │ │
│  │  • Coördineert tussen afdeling en klant                               │ │
│  │  • Houdt project administratie bij                                    │ │
│  │  • Markeert projecten als "klaar"                                     │ │
│  │                                                                        │ │
│  │  PLATFORM ROL: Medewerker (soms Vault MW)                             │ │
│  │  REPORTS TO: Afdelingshoofd                                           │ │
│  │  SUPERVISES: Project teamleden                                        │ │
│  │                                                                        │ │
│  │  DAGELIJKSE TAKEN:                                                    │ │
│  │  □ Update project planning                                            │ │
│  │  □ Team coördinatie                                                   │ │
│  │  □ Status updates naar klant                                          │ │
│  │  □ Risk management                                                    │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  ISO OFFICER                                               [ORG]      │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  VERANTWOORDELIJKHEDEN:                                               │ │
│  │  • Bewaakt ISO compliance binnen platform                             │ │
│  │  • Voert periodieke audits uit                                        │ │
│  │  • Beheert procedure documentatie                                     │ │
│  │  • Training voor nieuwe procedures                                    │ │
│  │  • Escalatie bij compliance issues                                    │ │
│  │                                                                        │ │
│  │  PLATFORM ROL: Admin (read-only op alle data voor audit)             │ │
│  │  REPORTS TO: Platform Owner                                           │ │
│  │  SUPERVISES: N/A (adviserende rol)                                   │ │
│  │                                                                        │ │
│  │  PERIODIEKE TAKEN:                                                    │ │
│  │  □ Kwartaal audit report                                              │ │
│  │  □ Jaarlijkse procedure review                                        │ │
│  │  □ Training sessies                                                   │ │
│  │  □ Audit trail reviews                                                │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  PLATFORM OWNER                                            [ORG]      │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  VERANTWOORDELIJKHEDEN:                                               │ │
│  │  • Strategische beslissingen over platform                            │ │
│  │  • Budget en resource goedkeuring                                     │ │
│  │  • Finale escalatie punt                                              │ │
│  │  • Stakeholder management                                             │ │
│  │  • Visie en roadmap                                                   │ │
│  │                                                                        │ │
│  │  PLATFORM ROL: Admin (super admin rechten)                            │ │
│  │  REPORTS TO: N/A (hoogste niveau)                                     │ │
│  │  SUPERVISES: Platform Admin, Afdelingshoofden                         │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frame 4: Procedure Flowcharts

### Mermaid Diagram - Project Lifecycle

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart TB
    subgraph Create["PROJECT AANMAKEN"]
        C1[Start]
        C2{Workspace<br/>geselecteerd?}
        C3[Selecteer workspace]
        C4[Klik 'Nieuw Project']
        C5[Vul details in]
        C6{Template<br/>gebruiken?}
        C7[Kies template]
        C8[Handmatig opzetten]
        C9[Project aangemaakt]

        C1 --> C2
        C2 -->|Nee| C3
        C2 -->|Ja| C4
        C3 --> C4
        C4 --> C5
        C5 --> C6
        C6 -->|Ja| C7
        C6 -->|Nee| C8
        C7 --> C9
        C8 --> C9
    end

    subgraph Execute["PROJECT UITVOEREN"]
        E1[Plan in Gantt]
        E2[Wijs resources toe]
        E3[Track voortgang]
        E4[Update status]

        C9 --> E1
        E1 --> E2
        E2 --> E3
        E3 --> E4
        E4 --> E3
    end

    subgraph Close["PROJECT AFSLUITEN"]
        CL1{100% compleet?}
        CL2[Review deliverables]
        CL3[Klik 'Klaar']
        CL4[Bevestig]
        CL5[Auto naar Vault]

        E4 --> CL1
        CL1 -->|Nee| E3
        CL1 -->|Ja| CL2
        CL2 --> CL3
        CL3 --> CL4
        CL4 --> CL5
    end

    style Create fill:#e8f5e9,stroke:#388e3c
    style Execute fill:#fff3e0,stroke:#f57c00
    style Close fill:#e3f2fd,stroke:#1976d2
```

### Vault Processing Procedure

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart TB
    subgraph Input["VAULT INPUT"]
        I1[Item ontvangen]
        I2[Bekijk details]
        I3{Compleet?}
    end

    subgraph Process["VAULT PROCESSING"]
        P1[Pak item op]
        P2[Valideer data]
        P3[Vul notities in]
        P4{Goedgekeurd?}
        P5[Stuur terug naar MW]
        P6[Markeer als Done]
    end

    subgraph Done["VAULT DONE"]
        D1[30-dagen timer start]
        D2{Export nodig?}
        D3[Export naar systeem]
        D4[Wacht op verval]
        D5[Auto-delete]
    end

    I1 --> I2
    I2 --> I3
    I3 -->|Nee| P5
    I3 -->|Ja| P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 -->|Nee| P5
    P4 -->|Ja| P6
    P5 --> I1
    P6 --> D1
    D1 --> D2
    D2 -->|Ja| D3
    D2 -->|Nee| D4
    D3 --> D4
    D4 --> D5

    style Input fill:#fff9c4,stroke:#f9a825
    style Process fill:#bbdefb,stroke:#1976d2
    style Done fill:#c8e6c9,stroke:#2e7d32
```

### User Management Procedure

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart LR
    subgraph Add["GEBRUIKER TOEVOEGEN"]
        A1[Open User Management]
        A2[Klik 'Uitnodigen']
        A3[Vul email in]
        A4[Selecteer rol]
        A5[Selecteer workspace]
        A6[Verstuur invite]
    end

    subgraph Accept["INVITE ACCEPTEREN"]
        B1[User ontvangt email]
        B2[Klik invite link]
        B3{Account bestaat?}
        B4[Log in]
        B5[Registreer]
        B6[Accepteer invite]
        B7[Toegang tot workspace]
    end

    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> A6
    A6 --> B1
    B1 --> B2
    B2 --> B3
    B3 -->|Ja| B4
    B3 -->|Nee| B5
    B4 --> B6
    B5 --> B6
    B6 --> B7

    style Add fill:#e8f5e9,stroke:#388e3c
    style Accept fill:#e3f2fd,stroke:#1976d2
```

### Procedure Overview Table

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PROCEDURE OVERZICHT                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PLATFORM PROCEDURES (KR9.10-9.17)                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Code   │ Procedure               │ Wie             │ Frequentie        │ │
│  │ ───────┼─────────────────────────┼─────────────────┼─────────────────  │ │
│  │ PR-01  │ Project aanmaken        │ MW, Vault MW    │ Ad-hoc           │ │
│  │ PR-02  │ Project afsluiten       │ MW, Vault MW    │ Per project      │ │
│  │ PR-03  │ Workspace aanmaken      │ Admin           │ Ad-hoc           │ │
│  │ PR-04  │ User toevoegen          │ Admin           │ Ad-hoc           │ │
│  │ PR-05  │ Rol toewijzen           │ Admin           │ Ad-hoc           │ │
│  │ PR-06  │ Template toepassen      │ MW, Vault MW    │ Per project      │ │
│  │ PR-07  │ Data exporteren         │ Vault MW        │ Per project      │ │
│  │ PR-08  │ Backup/restore          │ Admin           │ Dagelijks (auto) │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  VAULT PROCEDURES (KR9.18-9.22)                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Code   │ Procedure               │ Wie             │ Frequentie        │ │
│  │ ───────┼─────────────────────────┼─────────────────┼─────────────────  │ │
│  │ VL-01  │ Item beoordelen         │ Vault MW        │ Per item         │ │
│  │ VL-02  │ Item verwerken          │ Vault MW        │ Per item         │ │
│  │ VL-03  │ Item afkeuren           │ Vault MW        │ Indien nodig     │ │
│  │ VL-04  │ Bulk verwerking         │ Vault MW        │ Wekelijks        │ │
│  │ VL-05  │ Export uitvoeren        │ Vault MW        │ Per project      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  KLANT PROCEDURES (KR9.23-9.28)                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Code   │ Procedure               │ Wie             │ Frequentie        │ │
│  │ ───────┼─────────────────────────┼─────────────────┼─────────────────  │ │
│  │ KL-01  │ Klant-omgeving opzetten │ Admin, Vault MW │ Per klant        │ │
│  │ KL-02  │ Klant uitnodigen        │ Admin, Vault MW │ Per klant        │ │
│  │ KL-03  │ Klant onboarding        │ Contact person  │ Per klant        │ │
│  │ KL-04  │ Klant offboarding       │ Admin           │ Per klant        │ │
│  │ KL-05  │ Project archiveren      │ Admin           │ Per project      │ │
│  │ KL-06  │ Support/escalatie       │ Alle            │ Ad-hoc           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frame 5: Decision Trees voor Escalatie

### Mermaid Diagram - Escalation Decision Tree

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart TB
    Start[Issue gemeld]
    Q1{Type issue?}

    subgraph Technical["TECHNISCH"]
        T1{Blokkerend?}
        T2[Bug report maken]
        T3[Platform Admin]
        T4{Opgelost?}
        T5[Platform Owner]
    end

    subgraph Process["PROCES"]
        P1{Deadline risico?}
        P2[Interne oplossing]
        P3[Afdelingshoofd]
        P4{Opgelost?}
        P5[ISO Officer]
    end

    subgraph Klant["KLANT"]
        K1{Urgent?}
        K2[Email/ticket]
        K3[Direct contact]
        K4{Opgelost?}
        K5[Afdelingshoofd]
        K6{Opgelost?}
        K7[Platform Owner]
    end

    Start --> Q1
    Q1 -->|Technisch| T1
    Q1 -->|Proces| P1
    Q1 -->|Klant| K1

    T1 -->|Nee| T2
    T1 -->|Ja| T3
    T2 --> T4
    T3 --> T4
    T4 -->|Nee| T5
    T4 -->|Ja| End1[Afgerond]

    P1 -->|Nee| P2
    P1 -->|Ja| P3
    P2 --> P4
    P3 --> P4
    P4 -->|Nee| P5
    P4 -->|Ja| End2[Afgerond]

    K1 -->|Nee| K2
    K1 -->|Ja| K3
    K2 --> K4
    K3 --> K4
    K4 -->|Nee| K5
    K4 -->|Ja| End3[Afgerond]
    K5 --> K6
    K6 -->|Nee| K7
    K6 -->|Ja| End3

    style Technical fill:#ffcdd2,stroke:#c62828
    style Process fill:#fff9c4,stroke:#f9a825
    style Klant fill:#bbdefb,stroke:#1976d2
```

### Escalation Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ESCALATIE MATRIX                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Issue Type        │ Level 1         │ Level 2          │ Level 3       │ │
│  │ ──────────────────┼─────────────────┼──────────────────┼───────────── │ │
│  │ TECHNISCH                                                              │ │
│  │ ──────────────────┼─────────────────┼──────────────────┼───────────── │ │
│  │ Bug (minor)       │ Self-service    │ Platform Admin   │ -            │ │
│  │ Bug (major)       │ Platform Admin  │ External support │ -            │ │
│  │ System down       │ Platform Admin  │ Platform Owner   │ External     │ │
│  │ Data loss         │ Platform Admin  │ Platform Owner   │ External     │ │
│  │ Security breach   │ Platform Admin  │ Platform Owner   │ ISO Officer  │ │
│  │ ──────────────────┼─────────────────┼──────────────────┼───────────── │ │
│  │ PROCES                                                                 │ │
│  │ ──────────────────┼─────────────────┼──────────────────┼───────────── │ │
│  │ Deadline risico   │ Projectleider   │ Afdelingshoofd   │ -            │ │
│  │ Resource conflict │ Afdelingshoofd  │ Platform Admin   │ -            │ │
│  │ Procedure vraag   │ ISO Officer     │ Platform Owner   │ -            │ │
│  │ Compliance issue  │ ISO Officer     │ Platform Owner   │ External     │ │
│  │ ──────────────────┼─────────────────┼──────────────────┼───────────── │ │
│  │ KLANT                                                                  │ │
│  │ ──────────────────┼─────────────────┼──────────────────┼───────────── │ │
│  │ Vraag             │ Contact person  │ -                │ -            │ │
│  │ Klacht            │ Contact person  │ Afdelingshoofd   │ -            │ │
│  │ Contract issue    │ Afdelingshoofd  │ Platform Owner   │ Legal        │ │
│  │ Toegang probleem  │ Platform Admin  │ Afdelingshoofd   │ -            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  RESPONSE TIMES:                                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Priority    │ Response      │ Resolution    │ Escalate na             │ │
│  │ ────────────┼───────────────┼───────────────┼───────────────────────  │ │
│  │ Critical    │ 15 minuten    │ 4 uur         │ 1 uur zonder progress   │ │
│  │ High        │ 1 uur         │ 8 uur         │ 2 uur zonder progress   │ │
│  │ Medium      │ 4 uur         │ 2 werkdagen   │ 1 dag zonder progress   │ │
│  │ Low         │ 1 werkdag     │ 1 week        │ 2 dagen zonder progress │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frame 6: Communication Flows

### Mermaid Diagram - Communication Channels

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart TB
    subgraph Internal["INTERN"]
        Platform[Platform<br/>Notificaties]
        Email[Email]
        Meeting[Meetings]
    end

    subgraph Roles["ROLLEN"]
        Admin[Admin]
        VaultMW[Vault MW]
        MW[Medewerker]
        AH[Afdelingshoofd]
    end

    subgraph External["EXTERN"]
        KlantEmail[Klant Email]
        KlantPlatform[Platform View]
    end

    subgraph Klanten["KLANTEN"]
        KE[Klant Editor]
        KV[Klant Viewer]
    end

    Admin --> Platform
    Admin --> Email
    Admin --> Meeting
    VaultMW --> Platform
    VaultMW --> Email
    MW --> Platform
    AH --> Meeting
    AH --> Email

    Platform --> KlantPlatform
    Email --> KlantEmail

    KlantPlatform --> KE
    KlantPlatform --> KV
    KlantEmail --> KE

    style Internal fill:#e8f5e9,stroke:#388e3c
    style External fill:#fff3e0,stroke:#f57c00
```

### Communication Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COMMUNICATIE MATRIX                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Communicatie          │ Van           │ Naar          │ Kanaal         │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ DAGELIJKS                                                              │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ Status update         │ MW            │ Team          │ Platform      │ │
│  │ Task assignment       │ PL            │ MW            │ Platform      │ │
│  │ Comment/feedback      │ Anyone        │ Anyone        │ Platform      │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ WEKELIJKS                                                              │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ Team standup          │ AH            │ Team          │ Meeting       │ │
│  │ Klant status          │ PL            │ Klant         │ Email/Meet    │ │
│  │ Vault review          │ Vault MW      │ AH            │ Platform      │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ MAANDELIJKS                                                            │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ Platform report       │ Admin         │ PO            │ Email/Doc     │ │
│  │ Afdeling review       │ AH            │ Team          │ Meeting       │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ AD-HOC                                                                 │ │
│  │ ──────────────────────┼───────────────┼───────────────┼────────────── │ │
│  │ Escalatie             │ Anyone        │ Next level    │ Email/Phone   │ │
│  │ Incident              │ Admin         │ All           │ Platform/Mail │ │
│  │ Klant vraag           │ Klant         │ Contact       │ Email         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  NOTIFICATIE TYPES:                                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Type                  │ Trigger                     │ Ontvangers      │ │
│  │ ──────────────────────┼─────────────────────────────┼───────────────  │ │
│  │ Task assigned         │ Task toewijzing             │ Assignee        │ │
│  │ Task due soon         │ Deadline < 2 dagen          │ Assignee, PL    │ │
│  │ Task overdue          │ Deadline gepasseerd         │ Assignee, PL, AH│ │
│  │ Project complete      │ 100% voltooid               │ Team, AH        │ │
│  │ Vault item ready      │ Item in Input               │ Vault MW        │ │
│  │ Export reminder       │ 7 dagen tot delete          │ Vault MW        │ │
│  │ User invited          │ Invite verstuurd            │ Admin           │ │
│  │ User joined           │ Invite geaccepteerd         │ Admin, Team     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frame 7: Onboarding Journey Maps per Rol

### Mermaid Diagram - Onboarding Overview

```mermaid
%%{init: {'theme': 'base'}}%%
journey
    title Onboarding Journey - Medewerker
    section Dag 1: Toegang
        Ontvang invite email: 3: Medewerker
        Accepteer invite: 4: Medewerker
        Eerste login: 4: Medewerker
    section Dag 1-2: Oriëntatie
        Platform tour: 5: Medewerker, Admin
        Workspace bekijken: 4: Medewerker
        Profiel invullen: 3: Medewerker
    section Week 1: Training
        Gantt training: 4: Medewerker
        Calendar training: 4: Medewerker
        Eerste taak: 5: Medewerker
    section Week 2: Productief
        Zelfstandig werken: 5: Medewerker
        Feedback geven: 3: Medewerker
```

### Onboarding Journey Maps

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ONBOARDING JOURNEY MAPS                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  MEDEWERKER ONBOARDING (5 dagen)                                       │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  DAG 1: TOEGANG                                                        │ │
│  │  ●────────────●────────────●────────────●                             │ │
│  │  │            │            │            │                              │ │
│  │  Email       Klik link    Registreer   Eerste                         │ │
│  │  ontvangen   invite       account      login                          │ │
│  │                                                                        │ │
│  │  DAG 1-2: ORIËNTATIE                                                   │ │
│  │  ●────────────●────────────●────────────●                             │ │
│  │  │            │            │            │                              │ │
│  │  Platform    Bekijk       Vul profiel  Meet                           │ │
│  │  tour        workspace    in           team                           │ │
│  │                                                                        │ │
│  │  DAG 3-4: TRAINING                                                     │ │
│  │  ●────────────●────────────●────────────●                             │ │
│  │  │            │            │            │                              │ │
│  │  Gantt       Calendar     TaskBoard    Grid                           │ │
│  │  training    training     training     training                       │ │
│  │                                                                        │ │
│  │  DAG 5: PRAKTIJK                                                       │ │
│  │  ●────────────●────────────●                                          │ │
│  │  │            │            │                                           │ │
│  │  Eerste      Review       Klaar voor                                  │ │
│  │  taken       met AH       productie                                   │ │
│  │                                                                        │ │
│  │  CHECKLIST:                                                           │ │
│  │  □ Account actief                                                      │ │
│  │  □ Workspace toegang                                                   │ │
│  │  □ Profiel compleet                                                    │ │
│  │  □ Training afgerond                                                   │ │
│  │  □ Eerste taak voltooid                                               │ │
│  │  □ Feedback gegeven                                                    │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  VAULT MEDEWERKER ONBOARDING (7 dagen)                                 │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  WEEK 1                                                                │ │
│  │  ●────●────●────●────●────●────●                                      │ │
│  │  │    │    │    │    │    │    │                                       │ │
│  │  D1   D2   D3   D4   D5   D6   D7                                      │ │
│  │  │    │    │    │    │    │    │                                       │ │
│  │  │    │    │    │    │    │    └── Zelfstandig                        │ │
│  │  │    │    │    │    │    └─────── Export training                    │ │
│  │  │    │    │    │    └──────────── Vault praktijk (begeleiding)       │ │
│  │  │    │    │    └───────────────── Vault processing training          │ │
│  │  │    │    └────────────────────── Vault workflow training            │ │
│  │  │    └─────────────────────────── Platform training + MW taken       │ │
│  │  └──────────────────────────────── Account + Oriëntatie               │ │
│  │                                                                        │ │
│  │  EXTRA CHECKLIST:                                                     │ │
│  │  □ Vault dashboard navigatie                                          │ │
│  │  □ Item processing workflow                                           │ │
│  │  □ Export procedure                                                    │ │
│  │  □ Audit trail begrip                                                 │ │
│  │  □ 5 items verwerkt (begeleiding)                                     │ │
│  │  □ 5 items verwerkt (zelfstandig)                                     │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  KLANT EDITOR ONBOARDING (2 dagen)                                     │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  DAG 1: TOEGANG                                                        │ │
│  │  ●────────────●────────────●────────────●                             │ │
│  │  │            │            │            │                              │ │
│  │  Invite      Registreer   Login        Welkom                         │ │
│  │  email       account      platform     call                           │ │
│  │                                                                        │ │
│  │  DAG 2: TRAINING                                                       │ │
│  │  ●────────────●────────────●────────────●                             │ │
│  │  │            │            │            │                              │ │
│  │  Project     Taken        Status       Klaar                          │ │
│  │  overview    bewerken     updates                                     │ │
│  │                                                                        │ │
│  │  KLANT FOCUS:                                                         │ │
│  │  • Alleen eigen project zichtbaar                                      │ │
│  │  • Geen Vault toegang                                                 │ │
│  │  • Geen interne notities                                              │ │
│  │  • Focus op taken en communicatie                                     │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  ADMIN ONBOARDING (10 dagen)                                           │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │                                                                        │ │
│  │  WEEK 1: BASICS                                                        │ │
│  │  D1-2: Platform als medewerker                                         │ │
│  │  D3-4: Vault als Vault Medewerker                                      │ │
│  │  D5: User management basics                                            │ │
│  │                                                                        │ │
│  │  WEEK 2: ADMIN SPECIFIEK                                               │ │
│  │  D6: Workspace management                                              │ │
│  │  D7: Klant workspace setup                                             │ │
│  │  D8: System configuration                                              │ │
│  │  D9: Backup/restore procedures                                         │ │
│  │  D10: Admin handover + documentatie                                    │ │
│  │                                                                        │ │
│  │  ADMIN SPECIFIEKE CHECKLIST:                                          │ │
│  │  □ User CRUD operaties                                                 │ │
│  │  □ Rol assignments                                                     │ │
│  │  □ Workspace creation                                                  │ │
│  │  □ Klant workspace flow                                                │ │
│  │  □ System settings                                                     │ │
│  │  □ Backup verificatie                                                  │ │
│  │  □ Escalatie procedures                                                │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Onboarding Resources Diagram

```mermaid
%%{init: {'theme': 'base'}}%%
mindmap
  root((Onboarding<br/>Resources))
    Documentation
      Platform Guide
      Role-specific Guides
      FAQ Document
      Video Tutorials
    Training
      Live Sessions
      Self-paced Modules
      Hands-on Practice
      Certification Quiz
    Support
      Buddy System
      Help Desk
      Office Hours
      Slack Channel
    Tools
      Sandbox Environment
      Demo Projects
      Template Library
      Cheat Sheets
```

---

## Frame 8: Decisions & Notes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ARCHITECTUUR BESLISSINGEN - ROLLEN & PROCEDURES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ BESLUIT: 5 platform rollen + 4 organisatie rollen                │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Reden: Duidelijke scheiding tussen platform access en org functie   │   │
│  │  Alternatief: Meer granulaire rollen (te complex)                    │   │
│  │  Status: DEFINITIEF                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ BESLUIT: Onboarding per rol type                                 │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Reden: Verschillende rollen hebben verschillende needs              │   │
│  │  Alternatief: One-size-fits-all (niet effectief)                     │   │
│  │  Status: DEFINITIEF                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ BESLUIT: 3-level escalatie model                                 │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Reden: Voldoende levels voor complexe issues, niet te bureaucratisch│   │
│  │  Alternatief: 2-level (te beperkt) of 4+ level (te traag)           │   │
│  │  Status: DEFINITIEF                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ BESLUIT: Nederlandse taal voor alle procedures                  │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Reden: Target audience is Nederlands, vermindert ambiguïteit        │   │
│  │  Alternatief: Engels (future internationale klanten)                 │   │
│  │  Status: DEFINITIEF (met optie voor EN later)                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  OPEN VRAGEN:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ❓ Buddy system voor onboarding - wie kan buddy zijn?               │   │
│  │  ❓ Certificering na onboarding - nodig of overkill?                 │   │
│  │  ❓ Procedure review cyclus - jaarlijks of halfjaarlijks?            │   │
│  │  ❓ Externe klant training - zelf doen of door intern team?          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  DEPENDENCIES:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  M7 (dit board) ──► P1 (ROLLEN.md) - Gedetailleerde rol beschrijving│   │
│  │  M7 (dit board) ──► P2 (PROCEDURES.md) - Procedure details          │   │
│  │  M7 (dit board) ──► P5 (ONBOARDING.md) - Onboarding details         │   │
│  │  M4 (Security) ──► M7 - RBAC permissions per rol                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Gerelateerde Documenten

| Relatie | Document | Beschrijving |
|---------|----------|--------------|
| Visualizes | OUTCOMES.md | O9 Key Results (50 KRs) |
| References | P1 | ROLLEN.md - Rol details |
| References | P2 | PROCEDURES.md - Procedure details |
| References | P3 | GLOSSARY.md - Terminologie |
| References | P4 | TAXONOMY.md - Classificaties |
| References | P5 | ONBOARDING.md - Onboarding details |
| Links to | M4 | Security Board (RBAC) |

---

## Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 2024-12-30 | A9 | Initieel document |

---

*Document versie: 1.0*
*Laatst bijgewerkt: 30 December 2024*
*Frames: 8 | Mermaid Diagrams: 9*
