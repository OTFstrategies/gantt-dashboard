# DELIVERABLES - Gantt Dashboard Project

> Versie: 2.0.0
> Laatste update: 2024-12-29
> Status: Complete Deliverable Specifications (Split into modules)

## Overzicht

Dit document bevat de index voor alle 29 deliverables van het Gantt Dashboard project.
De gedetailleerde specificaties zijn gesplitst in aparte bestanden voor betere leesbaarheid.

### Document Structuur

| Document | Inhoud | Deliverables |
|----------|--------|--------------|
| [DELIVERABLES-CODE.md](./DELIVERABLES-CODE.md) | Code Modules | D1-D10 |
| [DELIVERABLES-INFRA.md](./DELIVERABLES-INFRA.md) | Infrastructure | D11-D14 |
| [DELIVERABLES-DOCS.md](./DELIVERABLES-DOCS.md) | Documentation | D15-D17 |
| [DELIVERABLES-MIRO.md](./DELIVERABLES-MIRO.md) | Miro Boards | M1-M7 |
| [DELIVERABLES-PROCESS.md](./DELIVERABLES-PROCESS.md) | Process Documents | P1-P5 |

### Categorieën

| Categorie | Deliverables | Codes |
|-----------|--------------|-------|
| Code Modules | 10 | D1-D10 |
| Infrastructure | 4 | D11-D14 |
| Documentation | 3 | D15-D17 |
| Miro Boards | 7 | M1-M7 |
| Process Documents | 5 | P1-P5 |
| **TOTAAL** | **29** | |

### Deliverable Status

| Code | Naam | Status | Dependencies | Document |
|------|------|--------|--------------|----------|
| D1 | Foundation Module | Pending | - | CODE |
| D2 | Gantt Module | Pending | D1 | CODE |
| D3 | Calendar Module | Pending | D1 | CODE |
| D4 | TaskBoard Module | Pending | D1 | CODE |
| D5 | Grid Module | Pending | D1 | CODE |
| D6 | Dashboard Module | Pending | D1, D2-D5 | CODE |
| D7 | Workspace Module | Pending | D1 | CODE |
| D8 | Auth/RBAC Module | Pending | D1, D11 | CODE |
| D9 | Vault Module | Pending | D1, D8 | CODE |
| D10 | Export Module | Pending | D1, D2-D5 | CODE |
| D11 | Database Schema | Pending | - | INFRA |
| D12 | Auth Configuration | Pending | D11 | INFRA |
| D13 | API Routes | Pending | D11, D12 | INFRA |
| D14 | Deployment | Pending | D11-D13 | INFRA |
| D15 | ARCHITECTURE.md | Pending | - | DOCS |
| D16 | CONTRACTS.md | Pending | D15 | DOCS |
| D17 | API-DOCS.md | Pending | D13 | DOCS |
| M1 | O1 Samenwerking Board | Pending | - | MIRO |
| M2 | O2 Unified View Board | Pending | - | MIRO |
| M3 | O3-O4 Toegang Board | Pending | - | MIRO |
| M4 | O5-O6 Security Board | Pending | - | MIRO |
| M5 | O7 Export Board | Pending | - | MIRO |
| M6 | O8 Visual Docs Board | Pending | M1-M5 | MIRO |
| M7 | O9 Rollen Board | Pending | - | MIRO |
| P1 | ROLLEN.md | Pending | - | PROCESS |
| P2 | PROCEDURES.md | Pending | P1 | PROCESS |
| P3 | GLOSSARY.md | Pending | - | PROCESS |
| P4 | TAXONOMY.md | Pending | P3 | PROCESS |
| P5 | ONBOARDING.md | Pending | P1, P2 | PROCESS |

---

## Dependency Graph

```
                    ┌─────────────────────────────────────────────┐
                    │              DOCUMENTATION                   │
                    │  D15 (ARCH) ─► D16 (CONTRACTS) ─► D17 (API) │
                    └─────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │              INFRASTRUCTURE                │
                    │  D11 (DB) ─► D12 (Auth) ─► D13 (API) ─► D14│
                    └─────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │              FOUNDATION                    │
                    │                   D1                       │
                    └─────────────────────────────────────────────┘
                                          │
           ┌──────────────┬───────────────┼───────────────┬──────────────┐
           ▼              ▼               ▼               ▼              ▼
        ┌─────┐       ┌─────┐        ┌─────┐        ┌─────┐        ┌─────┐
        │ D2  │       │ D3  │        │ D4  │        │ D5  │        │ D7  │
        │Gantt│       │ Cal │        │Board│        │Grid │        │ WS  │
        └──┬──┘       └──┬──┘        └──┬──┘        └──┬──┘        └──┬──┘
           │             │              │              │              │
           └──────────┬──┴──────────────┴──────────────┘              │
                      │                                               │
                      ▼                                               ▼
                   ┌─────┐                                        ┌─────┐
                   │ D6  │                                        │ D8  │
                   │Dash │                                        │Auth │
                   └──┬──┘                                        └──┬──┘
                      │                                               │
                      ▼                                               ▼
                   ┌─────┐                                        ┌─────┐
                   │ D10 │                                        │ D9  │
                   │Export│                                       │Vault│
                   └─────┘                                        └─────┘

                    ┌─────────────────────────────────────────────┐
                    │              MIRO BOARDS                     │
                    │  M1 ─► M2 ─► M3 ─► M4 ─► M5 ─► M6 ─► M7    │
                    └─────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────┐
                    │           PROCESS DOCUMENTS                  │
                    │  P1 (Rollen) ─► P2 (Procedures) ─► P5       │
                    │  P3 (Glossary) ─► P4 (Taxonomy)             │
                    └─────────────────────────────────────────────┘
```

---

## Version History

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0.0 | 2024-12-29 | A1 | Initiële versie met alle 29 deliverables |
| 2.0.0 | 2024-12-29 | A0 | Split in 5 modules voor betere leesbaarheid |

---

*Document versie: 2.0.0*
*Laatst bijgewerkt: 29 December 2024*
*Deliverables: 29 | Code: 10 | Infra: 4 | Docs: 3 | Miro: 7 | Process: 5*
