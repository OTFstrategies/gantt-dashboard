# GLOSSARY.md - Platform & Project Terminologie

> **Versie:** 1.0.0
> **Datum:** 2024-12-30
> **Deliverable:** P3
> **Status:** Compleet

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Terminologie A-Z](#terminologie-a-z)
3. [Afkortingen](#afkortingen)
4. [Bryntum Specifieke Termen](#bryntum-specifieke-termen)
5. [Project Management Termen](#project-management-termen)
6. [Technische Termen](#technische-termen)

---

## Overzicht

Dit glossary bevat alle termen, afkortingen en concepten die binnen het Gantt Dashboard platform worden gebruikt. Het document dient als referentie voor alle stakeholders en zorgt voor eenduidige communicatie.

### Conventies

- **Vette tekst**: Term definitie
- *Cursief*: Engelse term (waar van toepassing)
- `Code`: Technische identifier of code

---

## Terminologie A-Z

### A

**Afdeling**
Een interne business unit binnen de organisatie. Heeft een eigen workspace van type "afdeling" met volledige Vault toegang.
- *Engels:* Department
- Zie ook: Workspace

**Admin**
Hoogste platform rol (niveau 1) met volledige toegang tot workspace beheer en gebruikersbeheer.
- Code: `admin`
- Zie ook: RBAC, Rol

**Agenda View**
Lijstweergave van events in de Calendar component, gesorteerd op datum.
- Zie ook: Calendar, Event

**All-day Event**
Een event dat de hele dag duurt, zonder specifieke start- en eindtijd.
- *Nederlands:* Hele dag evenement
- Zie ook: Event

**Assignment** *(Toewijzing)*
Koppeling tussen een Task en een Resource. Definieert wie aan welke taak werkt en voor hoeveel procent.
- *Nederlands:* Toewijzing
- Bryntum: `AssignmentModel`
- Zie ook: Resource, Task

**Audit Log**
Logboek van alle acties binnen het platform, gebruikt voor compliance en troubleshooting.
- Zie ook: Compliance

**Audit Trail**
Chronologische registratie van verwerkingsacties, met name in de Vault.
- Zie ook: Vault, Processing

---

### B

**Baseline**
Snapshot van de projectplanning op een specifiek moment. Wordt gebruikt om de huidige voortgang te vergelijken met het oorspronkelijke plan.
- Bryntum: `BaselineModel`
- Zie ook: Progress, Planned vs Actual

**Bryntum**
Software vendor die de Gantt, Calendar, TaskBoard en Grid componenten levert die in het platform worden gebruikt.
- Website: bryntum.com
- Zie ook: Gantt, Calendar, TaskBoard, Grid

---

### C

**Calendar** *(Component)*
De Calendar view component voor event management met dag-, week-, maand- en jaarweergave.
- Bryntum: `Calendar`
- Zie ook: Event, View

**Calendar** *(Working Time)*
Een werktijddefinitie die bepaalt welke dagen en uren als werkdagen/-uren worden beschouwd.
- Bryntum: `CalendarModel`
- Zie ook: Non-working Time

**Card** *(TaskBoard)*
Visuele representatie van een taak op het TaskBoard in Kanban-stijl.
- Zie ook: TaskBoard, Column

**Column** *(Grid)*
Een verticale data kolom in het Grid component met sorting, filtering en resize mogelijkheden.
- Bryntum: `Column`
- Zie ook: Grid

**Column** *(TaskBoard)*
Een verticale swimlane in het TaskBoard, meestal gekoppeld aan een status (bijv. To Do, In Progress, Done).
- Zie ook: Swimlane, TaskBoard

**Compliance**
Naleving van regels en standaarden, met name ISO-normen binnen dit platform.
- Zie ook: ISO, Audit

**Constraint** *(Beperking)*
Een beperking op een taak die de scheduling beperkt.
- *Nederlands:* Beperking
- Types: SNET (Start No Earlier Than), SNLT (Start No Later Than), FNET (Finish No Earlier Than), FNLT (Finish No Later Than), MSO (Must Start On), MFO (Must Finish On)
- Bryntum: `constraint`
- Zie ook: Scheduling

**Critical Path** *(Kritiek Pad)*
De langste keten van afhankelijke taken die de totale projectduur bepaalt. Vertraging op het kritieke pad vertraagt het hele project.
- *Nederlands:* Kritiek pad
- Bryntum: `criticalPaths`
- Zie ook: Dependency, Duration

**CrudManager**
Bryntum component voor data synchronisatie tussen frontend en backend. Beheert alle CRUD operaties.
- Bryntum: `CrudManager`
- Zie ook: Sync, Store

---

### D

**Dashboard**
Centrale interface met navigatie, view switching en status widgets. Het startpunt van de applicatie.
- Zie ook: View, Widget

**Dependency** *(Afhankelijkheid)*
Relatie tussen twee taken die volgorde afdwingt. Bepaalt dat een taak niet kan starten of eindigen voordat een andere taak een bepaalde status heeft.
- *Nederlands:* Afhankelijkheid
- Types: FS (Finish-to-Start), SS (Start-to-Start), FF (Finish-to-Finish), SF (Start-to-Finish)
- Bryntum: `DependencyModel`
- Zie ook: Predecessor, Successor

**Done** *(Vault Status)*
Status van een Vault item dat volledig is verwerkt en wacht op export of automatische verwijdering na 30 dagen.
- Zie ook: Vault, Processing

**Drag & Drop**
Gebruikersinteractie waarbij items worden versleept naar een nieuwe positie of status.
- Bryntum: `DragHelper`, `EventDrag`
- Zie ook: TaskBoard, Gantt

**Duration** *(Duur)*
De tijdsduur van een taak, gemeten in werkdagen, -uren of andere eenheden.
- *Nederlands:* Duur
- Bryntum: `duration`, `durationUnit`
- Zie ook: Effort, Calendar

---

### E

**Effort** *(Inspanning)*
De hoeveelheid werk die nodig is om een taak te voltooien, onafhankelijk van de duur.
- *Nederlands:* Inspanning
- Eenheid: Vaak in uren
- Bryntum: `effort`
- Zie ook: Duration, Resource

**Event** *(Calendar)*
Een tijdgebonden item in de Calendar view met start- en eindtijd.
- Bryntum: `EventModel`
- Zie ook: Calendar, All-day Event

**Export**
Functie om data te downloaden in verschillende formaten (PDF, Excel, CSV, Image).
- Bryntum: `PdfExport`, `ExcelExporter`
- Zie ook: Import

---

### F

**FF (Finish-to-Finish)**
Dependency type waarbij taak B eindigt wanneer taak A eindigt.
- Code: `3`
- Zie ook: Dependency

**Filter**
Mechanisme om data te selecteren op basis van criteria.
- Bryntum: `filter`, `filterBar`
- Zie ook: Grid, Search

**FS (Finish-to-Start)**
Meest voorkomende dependency type waarbij taak B start nadat taak A eindigt.
- Code: `2`
- Zie ook: Dependency

---

### G

**Gantt Chart** *(Gantt Diagram)*
Tijdlijn visualisatie van taken met afhankelijkheden, resources en voortgang.
- *Nederlands:* Gantt diagram
- Bryntum: `Gantt`
- Zie ook: Task, Timeline

**Grid**
Tabelweergave component voor data met sorting, filtering, grouping en editing.
- Bryntum: `Grid`
- Zie ook: Column, Row

---

### H

**Histogram** *(Resource)*
Grafische weergave van resource belasting over tijd.
- Bryntum: `ResourceHistogram`
- Zie ook: Resource, Utilization

---

### I

**Import**
Functie om data in te laden vanuit externe bronnen (Excel, CSV, MS Project).
- Zie ook: Export, MS Project

**Inactive Task**
Een taak die is gemarkeerd als niet-actief en niet wordt meegenomen in scheduling berekeningen.
- Bryntum: `inactive`
- Zie ook: Task, Scheduling

**Input** *(Vault Status)*
Eerste status van nieuwe Vault items, wachtend op verwerking door een Vault Medewerker.
- Zie ook: Vault, Processing

**ISO**
International Organization for Standardization. De organisatie werkt volgens ISO-conforme werkwijzen.
- Zie ook: Compliance, Procedure

---

### K

**Klant** *(Client)*
Externe partij met beperkte toegang tot een specifiek project via een klant-type workspace.
- *Engels:* Client/Customer
- Rollen: Klant Editor, Klant Viewer
- Zie ook: Workspace

**Klant Editor**
Platform rol (niveau 4) voor externe klanten met edit rechten op eigen project.
- Code: `klant_editor`
- Zie ook: Klant Viewer, Rol

**Klant Viewer**
Platform rol (niveau 5) voor externe klanten met alleen lees-rechten op eigen project.
- Code: `klant_viewer`
- Zie ook: Klant Editor, Rol

---

### L

**Lag** *(Vertraging)*
Positieve of negatieve vertraging in een dependency. Positieve lag = vertraging, negatieve lag = overlap.
- *Nederlands:* Vertraging
- Bryntum: `lag`, `lagUnit`
- Zie ook: Dependency, Lead

**Lead** *(Voorsprong)*
Negatieve lag: overlap tussen afhankelijke taken.
- *Nederlands:* Voorsprong
- Zie ook: Lag, Dependency

**Locked Column** *(Bevroren Kolom)*
Een kolom in het Grid die niet scrollt met de rest van de data.
- *Nederlands:* Bevroren kolom
- Bryntum: `locked`
- Zie ook: Grid, Column

---

### M

**Medewerker** *(Employee)*
Platform rol (niveau 3) voor interne teamleden met project edit rechten.
- *Engels:* Employee
- Code: `medewerker`
- Zie ook: Rol, Admin

**Milestone** *(Mijlpaal)*
Taak met duur 0, markeert een belangrijk moment of deliverable in het project.
- *Nederlands:* Mijlpaal
- Bryntum: `milestone: true`
- Zie ook: Task

**MS Project**
Microsoft Project - software voor projectmanagement. Data kan worden geimporteerd/geexporteerd via MPP formaat.
- Bryntum: `ProjectModel.load()` met MPP support
- Zie ook: Import, Export

---

### N

**Non-working Time** *(Niet-werkbare Tijd)*
Periodes die niet als werktijd worden beschouwd (weekenden, feestdagen, vakanties).
- *Nederlands:* Niet-werkbare tijd
- Bryntum: `nonWorkingTime`, `CalendarModel`
- Zie ook: Calendar, Working Time

---

### P

**Percent Done** *(Percentage Gereed)*
De voortgang van een taak uitgedrukt als percentage (0-100%).
- *Nederlands:* Percentage gereed
- Bryntum: `percentDone`
- Zie ook: Progress

**Permission** *(Bevoegdheid)*
Specifieke bevoegdheid binnen het platform (bijv. `task.edit`, `vault.process`).
- *Nederlands:* Bevoegdheid
- Zie ook: RBAC, Rol

**Predecessor** *(Voorganger)*
De "from" taak in een dependency relatie.
- *Nederlands:* Voorganger
- Bryntum: `predecessors`
- Zie ook: Successor, Dependency

**Processing** *(Vault Status)*
Status van een Vault item dat actief wordt verwerkt door een Vault Medewerker.
- Zie ook: Vault, Input, Done

**Progress Line** *(Voortgangslijn)*
Visuele lijn in het Gantt diagram die de huidige datum en voortgang toont.
- *Nederlands:* Voortgangslijn
- Bryntum: `ProgressLine`
- Zie ook: Percent Done

**Project**
Een container voor taken, resources, dependencies en assignments. Behoort tot een workspace.
- Bryntum: `ProjectModel`
- Zie ook: Task, Workspace

**ProjectModel**
Bryntum centrale data container die alle stores (tasks, resources, dependencies, assignments) beheert.
- Bryntum: `ProjectModel`
- Zie ook: Store, CrudManager

---

### R

**RBAC** *(Role-Based Access Control)*
Systeem voor toegangsbeheer op basis van rollen. Gebruikers krijgen permissions via hun rol.
- *Voluit:* Role-Based Access Control
- Zie ook: Permission, Rol

**Recurring Event** *(Terugkerend Event)*
Een event dat op een vast patroon herhaalt (dagelijks, wekelijks, maandelijks, etc.).
- *Nederlands:* Terugkerend event
- Bryntum: `recurrenceRule`
- Zie ook: Event, Calendar

**Resource** *(Hulpbron)*
Persoon, materiaal of equipment dat aan taken kan worden toegewezen.
- *Nederlands:* Hulpbron
- Types: Human, Material, Equipment
- Bryntum: `ResourceModel`
- Zie ook: Assignment

**Resource Histogram**
Grafische weergave van resource allocatie over tijd.
- Bryntum: `ResourceHistogram`
- Zie ook: Resource, Utilization

**RLS** *(Row Level Security)*
PostgreSQL/Supabase feature voor data isolatie op rij-niveau. Zorgt dat gebruikers alleen hun eigen data zien.
- *Voluit:* Row Level Security
- Zie ook: Supabase, Security

**Rol** *(Role)*
Een set van permissions die aan gebruikers wordt toegewezen.
- *Engels:* Role
- Platform rollen: Admin, Vault Medewerker, Medewerker, Klant Editor, Klant Viewer
- Zie ook: RBAC, Permission

**Rollup**
Samenvatting van child taken in een parent (summary) taak.
- Bryntum: `rollup`
- Zie ook: Summary Task, WBS

---

### S

**Scheduling Engine**
De Bryntum engine die automatisch taken plant op basis van dependencies, constraints en calendars.
- Bryntum: `SchedulerEngine`
- Zie ook: Constraint, Dependency

**SF (Start-to-Finish)**
Dependency type waarbij taak B eindigt wanneer taak A start (minst gebruikelijk).
- Code: `1`
- Zie ook: Dependency

**Slack** *(Speling)*
De hoeveelheid tijd dat een taak kan worden uitgesteld zonder het project te vertragen.
- *Nederlands:* Speling
- Bryntum: `totalSlack`
- Zie ook: Critical Path

**SS (Start-to-Start)**
Dependency type waarbij taak B start wanneer taak A start.
- Code: `0`
- Zie ook: Dependency

**Store**
Bryntum data container voor een specifiek type data (TaskStore, ResourceStore, etc.).
- Bryntum: `Store`, `TaskStore`, `ResourceStore`, `DependencyStore`, `AssignmentStore`
- Zie ook: ProjectModel

**Successor** *(Opvolger)*
De "to" taak in een dependency relatie.
- *Nederlands:* Opvolger
- Bryntum: `successors`
- Zie ook: Predecessor, Dependency

**Summary Task** *(Samenvattingstaak)*
Een parent taak die child taken groepeert. Duur en voortgang worden berekend op basis van children.
- *Nederlands:* Samenvattingstaak
- Bryntum: `summary: true`
- Zie ook: WBS, Rollup

**Supabase**
De database en authentication provider voor het platform. PostgreSQL-based met RLS.
- Website: supabase.com
- Zie ook: RLS, PostgreSQL

**Swimlane**
Horizontale groepering in TaskBoard, vaak op basis van assignee of categorie.
- Zie ook: TaskBoard, Column

**Sync** *(Synchronisatie)*
Synchronisatie van data tussen frontend en backend.
- *Nederlands:* Synchronisatie
- Bryntum: `CrudManager.sync()`
- Zie ook: CrudManager

---

### T

**Task** *(Taak)*
De basis werkunit in een project met naam, duur, start- en einddatum.
- *Nederlands:* Taak
- Bryntum: `TaskModel`
- Zie ook: Project, Milestone

**TaskBoard**
Kanban-style view met columns en cards voor taakbeheer.
- Bryntum: `TaskBoard`
- Zie ook: Column, Card

**TaskStore**
Bryntum store die alle taken bevat.
- Bryntum: `TaskStore`
- Zie ook: Store, Task

**Template**
Herbruikbaar project sjabloon met voorgedefinieerde structuur.
- Zie ook: Project

**TimeAxis**
De tijdlijn component in Gantt en Scheduler die de tijdschaal toont.
- Bryntum: `TimeAxis`
- Zie ook: View Preset

**Timeline**
Visuele tijdlijn weergave van project events en taken.
- Bryntum: `TimelineView`
- Zie ook: Gantt

**Tooltip**
Pop-up informatievenster bij hover over elementen.
- Bryntum: `Tooltip`
- Zie ook: Task, Event

---

### U

**Undo/Redo**
Functionaliteit om acties ongedaan te maken of opnieuw uit te voeren.
- Bryntum: `StateTrackingManager`, `STM`
- Zie ook: STM

**Utilization** *(Bezetting)*
De mate waarin een resource is toegewezen aan taken, uitgedrukt als percentage.
- *Nederlands:* Bezetting
- Bryntum: `ResourceUtilization`
- Zie ook: Resource, Histogram

---

### V

**Vault**
Module voor gecontroleerde dataverwerking. Projecten die "klaar" zijn marked, komen in de Vault voor verwerking voordat ze naar permanente systemen gaan.
- Statussen: Input, Processing, Done
- Retentie: 30 dagen na Done
- Zie ook: Processing, Export

**Vault Medewerker**
Platform rol (niveau 2) gespecialiseerd in Vault verwerking.
- Code: `vault_medewerker`
- Zie ook: Vault, Rol

**View** *(Weergave)*
Een weergave van project data (Gantt, Calendar, TaskBoard, Grid, Dashboard).
- *Nederlands:* Weergave
- Zie ook: Dashboard

**View Preset**
Voorgedefinieerde configuratie voor de tijdschaal (dag, week, maand, jaar).
- Bryntum: `viewPreset`
- Zie ook: TimeAxis, Zoom

**Virtual Scrolling**
Performance optimalisatie waarbij alleen zichtbare rijen worden gerenderd.
- Bryntum: `virtualScroll`
- Zie ook: Grid, Performance

---

### W

**WBS** *(Work Breakdown Structure)*
Hierarchische structuur van taken die het project opsplitst in beheersbare onderdelen.
- *Voluit:* Work Breakdown Structure
- *Nederlands:* Werkstructuur
- Bryntum: `wbsCode`
- Zie ook: Summary Task

**Widget**
Embedded component in dashboard layout (progress widget, stats widget, etc.).
- Bryntum: `Widget`
- Zie ook: Dashboard

**WIP Limit** *(Work In Progress Limit)*
Maximum aantal items dat gelijktijdig in een TaskBoard column mag staan.
- *Voluit:* Work In Progress Limit
- Bryntum: `wipLimit`
- Zie ook: TaskBoard, Column

**Working Time** *(Werktijd)*
De uren en dagen die als werktijd worden beschouwd.
- *Nederlands:* Werktijd
- Bryntum: `CalendarModel`
- Zie ook: Calendar, Non-working Time

**Workspace**
Hoogste niveau container voor projecten en gebruikers. Elke afdeling en elk klant-project heeft een eigen workspace.
- Types: Afdeling, Klant
- Zie ook: Project, Afdeling, Klant

---

### Z

**Zoom**
Functionaliteit om in/uit te zoomen op de tijdlijn.
- Bryntum: `zoomLevel`, `zoomIn()`, `zoomOut()`
- Zie ook: View Preset, TimeAxis

---

## Afkortingen

### Platform Afkortingen

| Afkorting | Betekenis | Context |
|-----------|-----------|---------|
| **API** | Application Programming Interface | Technisch |
| **CRUD** | Create, Read, Update, Delete | Data operaties |
| **CSV** | Comma-Separated Values | Export formaat |
| **ISO** | International Organization for Standardization | Compliance |
| **JWT** | JSON Web Token | Authentication |
| **KR** | Key Result | Project management |
| **MCP** | Model Context Protocol | AI integratie |
| **PDF** | Portable Document Format | Export formaat |
| **RBAC** | Role-Based Access Control | Security |
| **RLS** | Row Level Security | Database security |
| **SSR** | Server-Side Rendering | Frontend techniek |
| **STM** | State Tracking Manager | Undo/Redo |
| **UUID** | Universally Unique Identifier | Identifiers |
| **WBS** | Work Breakdown Structure | Project structuur |
| **WIP** | Work In Progress | TaskBoard |
| **XLSX** | Excel Spreadsheet | Export formaat |

### Dependency Type Codes

| Code | Type | Beschrijving |
|------|------|--------------|
| **0** | SS | Start-to-Start |
| **1** | SF | Start-to-Finish |
| **2** | FS | Finish-to-Start (meest voorkomend) |
| **3** | FF | Finish-to-Finish |

### Constraint Type Codes

| Code | Type | Beschrijving |
|------|------|--------------|
| **SNET** | Start No Earlier Than | Niet eerder starten dan |
| **SNLT** | Start No Later Than | Niet later starten dan |
| **FNET** | Finish No Earlier Than | Niet eerder eindigen dan |
| **FNLT** | Finish No Later Than | Niet later eindigen dan |
| **MSO** | Must Start On | Moet starten op |
| **MFO** | Must Finish On | Moet eindigen op |

---

## Bryntum Specifieke Termen

### Core Components

| Component | Beschrijving | Namespace |
|-----------|--------------|-----------|
| **Gantt** | Gantt chart component | `@bryntum/gantt` |
| **Calendar** | Calendar component | `@bryntum/calendar` |
| **TaskBoard** | Kanban board component | `@bryntum/taskboard` |
| **Grid** | Data grid component | `@bryntum/grid` |
| **Scheduler** | Resource scheduler | `@bryntum/scheduler` |
| **SchedulerPro** | Advanced scheduler | `@bryntum/schedulerpro` |

### Data Models

| Model | Beschrijving | Store |
|-------|--------------|-------|
| **TaskModel** | Taak data model | TaskStore |
| **ResourceModel** | Resource data model | ResourceStore |
| **DependencyModel** | Dependency data model | DependencyStore |
| **AssignmentModel** | Assignment data model | AssignmentStore |
| **EventModel** | Calendar event model | EventStore |
| **CalendarModel** | Working time model | CalendarManagerStore |
| **BaselineModel** | Baseline data model | - |

### Features

| Feature | Beschrijving |
|---------|--------------|
| **CellEdit** | Inline cell editing |
| **ColumnReorder** | Drag column reordering |
| **DependencyEdit** | Dependency line editing |
| **EventDrag** | Event drag & drop |
| **EventResize** | Event resize |
| **Filter** | Data filtering |
| **Group** | Row grouping |
| **Labels** | Task labels |
| **ProgressLine** | Progress visualization |
| **QuickFind** | Fast search |
| **Rollup** | Summary rollups |
| **Sort** | Column sorting |
| **Summary** | Summary rows |
| **TaskEdit** | Task editor dialog |
| **TimeRanges** | Non-working time display |
| **Tree** | Hierarchical data |

---

## Project Management Termen

### Planning Concepten

| Term | Nederlands | Beschrijving |
|------|------------|--------------|
| **Baseline** | Baseline | Oorspronkelijke planning |
| **Buffer** | Buffer | Extra tijd voor onvoorziene zaken |
| **Constraint** | Beperking | Planning restrictie |
| **Critical Path** | Kritiek pad | Langste pad door project |
| **Deadline** | Deadline | Uiterste einddatum |
| **Duration** | Duur | Lengte van een taak |
| **Effort** | Inspanning | Benodigde werk |
| **Float/Slack** | Speling | Beschikbare vertraging |
| **Lead/Lag** | Voorsprong/Vertraging | Dependency offset |
| **Milestone** | Mijlpaal | Belangrijk moment |
| **Predecessor** | Voorganger | Afhankelijke taak (voor) |
| **Successor** | Opvolger | Afhankelijke taak (na) |

### Resource Management

| Term | Nederlands | Beschrijving |
|------|------------|--------------|
| **Allocation** | Allocatie | Resource toewijzing |
| **Availability** | Beschikbaarheid | Resource beschikbaar |
| **Capacity** | Capaciteit | Maximale belasting |
| **Over-allocation** | Overbelasting | Te veel werk toegewezen |
| **Utilization** | Bezetting | Percentage gebruikt |

### Status & Voortgang

| Term | Nederlands | Beschrijving |
|------|------------|--------------|
| **Backlog** | Backlog | Wachtende items |
| **Complete** | Voltooid | Afgerond |
| **In Progress** | Lopend | Actief |
| **On Hold** | On hold | Gepauzeerd |
| **Percent Complete** | % Gereed | Voortgang percentage |
| **Status** | Status | Huidige toestand |

---

## Technische Termen

### Frontend

| Term | Beschrijving |
|------|--------------|
| **Component** | Herbruikbaar UI element |
| **Context** | React state sharing mechanisme |
| **Hook** | React functionaliteit hook |
| **Props** | Component eigenschappen |
| **State** | Component toestand |
| **Virtual DOM** | Virtuele DOM representatie |

### Backend

| Term | Beschrijving |
|------|--------------|
| **API Route** | Server endpoint |
| **Edge Function** | Serverless functie |
| **Middleware** | Request processing laag |
| **ORM** | Object-Relational Mapping |
| **RPC** | Remote Procedure Call |
| **Webhook** | HTTP callback |

### Database

| Term | Beschrijving |
|------|--------------|
| **Foreign Key** | Referentie naar andere tabel |
| **Index** | Database zoek-optimalisatie |
| **Migration** | Schema verandering |
| **Policy** | RLS toegangsregel |
| **Primary Key** | Unieke identifier |
| **Schema** | Database structuur |
| **Trigger** | Automatische database actie |

### Security

| Term | Beschrijving |
|------|--------------|
| **Authentication** | Identiteit verificatie |
| **Authorization** | Toegang verificatie |
| **Encryption** | Data versleuteling |
| **Session** | Gebruiker sessie |
| **Token** | Authenticatie bewijs |

---

## Synoniemen Mapping

| Platform Term | Synoniemen |
|---------------|------------|
| Admin | Administrator, Beheerder |
| Afdeling | Department, Business Unit |
| Assignment | Toewijzing, Allocatie |
| Baseline | Referentielijn, Snapshot |
| Card | Kaart, Taakkaart |
| Column | Kolom, Swimlane (verticaal) |
| Dependency | Afhankelijkheid, Link, Relatie |
| Duration | Duur, Lengte, Tijdsduur |
| Event | Afspraak, Activiteit |
| Klant | Client, Customer, Externe |
| Medewerker | Employee, Werknemer, Teamlid |
| Milestone | Mijlpaal, Markeerpunt |
| Project | Opdracht (informeel) |
| Resource | Hulpbron, Medewerker (als resource) |
| Task | Taak, Activiteit, Werkpakket |
| View | Weergave, Perspectief |
| Workspace | Werkruimte, Omgeving |

---

## Gerelateerde Documenten

| Document | Relatie | Beschrijving |
|----------|---------|--------------|
| [ROLLEN.md](./ROLLEN.md) | Referentie | Rol definities |
| [TAXONOMY.md](./TAXONOMY.md) | Uitbreiding | Classificaties |
| [PROCEDURES.md](./PROCEDURES.md) | Gebruiker | Procedure termen |
| [OUTCOMES.md](../OUTCOMES.md) | Implements | KR9.38-9.42 |

---

## Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0.0 | 2024-12-30 | A10 | Initieel document |

---

*Document versie: 1.0.0*
*Laatst bijgewerkt: 30 December 2024*
*Termen: 150+ | Afkortingen: 30+ | Synoniemen: 25+*
