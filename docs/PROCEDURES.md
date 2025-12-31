# PROCEDURES.md - Operationele Procedures

> **Versie:** 1.0.0
> **Datum:** 2024-12-30
> **Deliverable:** P2
> **Status:** Compleet

---

## Inhoudsopgave

1. [Dagelijkse Procedures (PROC-001 t/m PROC-015)](#1-dagelijkse-procedures)
2. [Vault Procedures (PROC-020 t/m PROC-025)](#2-vault-procedures)
3. [Onderhoud Procedures (PROC-030 t/m PROC-035)](#3-onderhoud-procedures)
4. [Escalatie Procedures (PROC-040 t/m PROC-045)](#4-escalatie-procedures)
5. [Procedure Index](#5-procedure-index)

---

## 1. Dagelijkse Procedures

### PROC-001: Workspace Aanmaken

| Veld | Waarde |
|------|--------|
| **Doel** | Een nieuwe workspace creeren voor een team of afdeling |
| **Trigger** | Nieuw team, nieuwe afdeling, of organisatorische splitsing |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 1 werkdag |

**Stappen:**

1. Navigeer naar **Instellingen > Workspaces > Nieuwe Workspace**
2. Vul de verplichte velden in:
   - Workspace naam (uniek binnen organisatie)
   - Beschrijving
   - Primaire contactpersoon
3. Configureer basis instellingen:
   - Tijdzone
   - Standaard werkdagen
   - Standaard werkuren per dag
4. Selecteer template (optioneel):
   - Leeg
   - Standaard projectstructuur
   - Enterprise template
5. Klik op **Workspace Aanmaken**
6. Voeg initiële Admin gebruiker(s) toe
7. Configureer integraties indien nodig

**Checklist:**

- [ ] Workspace naam is uniek en beschrijvend
- [ ] Correcte tijdzone geselecteerd
- [ ] Minimaal 1 Admin toegevoegd
- [ ] Welkomstmail verstuurd naar initiële Admin
- [ ] Workspace zichtbaar in workspace selector

---

### PROC-002: Workspace Archiveren

| Veld | Waarde |
|------|--------|
| **Doel** | Een workspace deactiveren met behoud van data |
| **Trigger** | Team opgeheven, project afgerond, of reorganisatie |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 2 werkdagen |

**Stappen:**

1. Controleer dat alle actieve projecten zijn afgesloten (PROC-006)
2. Exporteer alle benodigde data (PROC-010)
3. Informeer alle workspace gebruikers minimaal 5 werkdagen vooraf
4. Navigeer naar **Instellingen > Workspaces > [Workspace] > Archiveren**
5. Bevestig archivering met wachtwoord
6. Noteer archiveringsdatum en reden in audit log

**Checklist:**

- [ ] Alle projecten gearchiveerd of afgesloten
- [ ] Data export voltooid en geverifieerd
- [ ] Gebruikers geinformeerd
- [ ] Bevestigingsmail ontvangen
- [ ] Workspace niet meer toegankelijk voor normale gebruikers
- [ ] Data beschikbaar voor Admin (read-only) gedurende retentieperiode

---

### PROC-003: Gebruiker Uitnodigen

| Veld | Waarde |
|------|--------|
| **Doel** | Nieuwe gebruiker toevoegen aan workspace |
| **Trigger** | Nieuwe medewerker, externe klant, of projectuitbreiding |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 4 uur |

**Stappen:**

1. Navigeer naar **Gebruikers > Uitnodigen**
2. Vul emailadres in van nieuwe gebruiker
3. Selecteer platform rol:
   - Admin
   - Vault Medewerker
   - Medewerker
   - Klant Editor
   - Klant Viewer
4. Selecteer project(en) waartoe gebruiker toegang krijgt
5. Voeg optionele welkomstboodschap toe
6. Klik op **Uitnodiging Versturen**
7. Monitor of uitnodiging geaccepteerd wordt (max 7 dagen geldig)

**Checklist:**

- [ ] Email adres geverifieerd
- [ ] Correcte rol geselecteerd (zie ROLLEN.md)
- [ ] Relevante projecten toegewezen
- [ ] Uitnodigingsmail verstuurd
- [ ] Follow-up na 3 dagen indien niet geaccepteerd

---

### PROC-004: Gebruiker Deactiveren

| Veld | Waarde |
|------|--------|
| **Doel** | Toegang van gebruiker intrekken met behoud van historie |
| **Trigger** | Uit dienst, project afloop, of security incident |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 2 uur (security) / 1 werkdag (normaal) |

**Stappen:**

1. Navigeer naar **Gebruikers > [Gebruiker] > Beheren**
2. Controleer openstaande taken toegewezen aan gebruiker
3. Wijs openstaande taken opnieuw toe aan andere gebruikers
4. Klik op **Deactiveren**
5. Selecteer reden:
   - Uit dienst
   - Project afloop
   - Security incident
   - Op verzoek gebruiker
   - Anders (specificeer)
6. Bevestig deactivering

**Checklist:**

- [ ] Openstaande taken herverdeeld
- [ ] Gebruiker kan niet meer inloggen
- [ ] Audit log entry gemaakt
- [ ] Bij security incident: PROC-043 gevolgd
- [ ] Historische data behouden voor audit

---

### PROC-005: Project Aanmaken

| Veld | Waarde |
|------|--------|
| **Doel** | Nieuw project starten in workspace |
| **Trigger** | Nieuw klantopdracht, intern initiatief, of subproject |
| **Verantwoordelijke** | Admin, Medewerker |
| **Maximum Responstijd** | 4 uur |

**Stappen:**

1. Navigeer naar **Projecten > Nieuw Project**
2. Vul projectgegevens in:
   - Projectnaam
   - Projectcode (uniek)
   - Beschrijving
   - Klant (optioneel)
3. Stel projectperiode in:
   - Startdatum
   - Geplande einddatum
4. Selecteer template (optioneel):
   - Leeg project
   - Standaard fasen
   - Agile sprints
   - Watervalmethode
5. Configureer projectinstellingen:
   - Werkdagen per week
   - Werkuren per dag
   - Vakanties/feestdagen
6. Klik op **Project Aanmaken**
7. Voeg projectteam toe (PROC-008)

**Checklist:**

- [ ] Unieke projectcode
- [ ] Realistische start- en einddatum
- [ ] Template toegepast indien gewenst
- [ ] Initieel team toegevoegd
- [ ] Project zichtbaar in projectlijst

---

### PROC-006: Project Afsluiten ("Klaar" Markeren)

| Veld | Waarde |
|------|--------|
| **Doel** | Project formeel afsluiten en archiveren |
| **Trigger** | Alle deliverables opgeleverd, project geannuleerd |
| **Verantwoordelijke** | Admin, Medewerker (projecteigenaar) |
| **Maximum Responstijd** | 1 werkdag |

**Stappen:**

1. Controleer dat alle taken status "Voltooid" of "Geannuleerd" hebben
2. Voer finale tijdregistratie controle uit
3. Maak finale baseline aan (PROC-009)
4. Exporteer projectdata indien nodig (PROC-010)
5. Navigeer naar **Project > Instellingen > Status**
6. Wijzig status naar **Klaar**
7. Vul afsluitgegevens in:
   - Werkelijke einddatum
   - Afsluitnotitie
   - Evaluatiescore (1-5)
8. Bevestig afsluiting

**Checklist:**

- [ ] Alle taken afgesloten
- [ ] Tijdregistratie compleet
- [ ] Finale baseline opgeslagen
- [ ] Data geexporteerd (indien vereist)
- [ ] Project in read-only modus
- [ ] Team geinformeerd

---

### PROC-007: Taak Beheer

| Veld | Waarde |
|------|--------|
| **Doel** | Taken aanmaken, wijzigen en monitoren |
| **Trigger** | Projectplanning, voortgangsupdate, wijzigingsverzoek |
| **Verantwoordelijke** | Admin, Medewerker, Klant Editor |
| **Maximum Responstijd** | Continu proces |

**Stappen voor Taak Aanmaken:**

1. Navigeer naar project in Gantt view
2. Klik op **+ Taak** of gebruik rechtermuisklik menu
3. Vul taakgegevens in:
   - Taaknaam
   - Startdatum
   - Duur of einddatum
   - Voortgangspercentage (0-100%)
4. Stel afhankelijkheden in (indien van toepassing)
5. Wijs resource toe (PROC-008)

**Stappen voor Taak Wijzigen:**

1. Selecteer taak in Gantt view
2. Open taakdetails panel
3. Wijzig gewenste velden
4. Controleer impact op afhankelijke taken
5. Sla wijzigingen op

**Stappen voor Taak Verwijderen:**

1. Selecteer taak
2. Klik op **Verwijderen** of gebruik Delete toets
3. Bevestig verwijdering (inclusief subtaken)

**Checklist:**

- [ ] Taaknaam duidelijk en actiegericht
- [ ] Realistische duur ingeschat
- [ ] Afhankelijkheden correct ingesteld
- [ ] Resource toegewezen indien nodig

---

### PROC-008: Resource Toewijzen

| Veld | Waarde |
|------|--------|
| **Doel** | Teamleden koppelen aan taken |
| **Trigger** | Nieuwe taak, herbezetting, capaciteitsplanning |
| **Verantwoordelijke** | Admin, Medewerker |
| **Maximum Responstijd** | 4 uur |

**Stappen:**

1. Selecteer taak in Gantt view
2. Open taakdetails panel > tab **Resources**
3. Klik op **Resource Toevoegen**
4. Selecteer resource(s) uit lijst:
   - Zoek op naam
   - Filter op rol/afdeling
   - Bekijk beschikbaarheid
5. Stel toewijzingspercentage in (standaard 100%)
6. Bevestig toewijzing
7. Controleer op overbezetting in Resource view

**Checklist:**

- [ ] Resource beschikbaar in projectperiode
- [ ] Geen overbelasting (>100% allocatie)
- [ ] Resource heeft benodigde competenties
- [ ] Notificatie verstuurd naar resource

---

### PROC-009: Baseline Aanmaken

| Veld | Waarde |
|------|--------|
| **Doel** | Snapshot van projectplanning vastleggen voor vergelijking |
| **Trigger** | Projectstart, fase-einde, significante planwijziging |
| **Verantwoordelijke** | Admin, Medewerker |
| **Maximum Responstijd** | Direct |

**Stappen:**

1. Navigeer naar project
2. Klik op **Project > Baseline > Nieuwe Baseline**
3. Vul baseline gegevens in:
   - Naam (bijv. "Baseline v1.0 - Projectstart")
   - Beschrijving
   - Datum
4. Selecteer scope:
   - Gehele project
   - Specifieke fasen
5. Klik op **Baseline Opslaan**
6. Activeer baseline voor vergelijking (optioneel)

**Checklist:**

- [ ] Beschrijvende naam gekozen
- [ ] Correcte scope geselecteerd
- [ ] Baseline zichtbaar in baselinelijst
- [ ] Vergelijking mogelijk in Gantt view

---

### PROC-010: Data Exporteren

| Veld | Waarde |
|------|--------|
| **Doel** | Projectdata exporteren naar extern formaat |
| **Trigger** | Rapportage, archivering, externe delen |
| **Verantwoordelijke** | Admin, Vault Medewerker, Medewerker |
| **Maximum Responstijd** | 15 minuten |

**Stappen:**

1. Navigeer naar project of Vault
2. Klik op **Export** knop
3. Selecteer exportformaat:
   - PDF (visueel rapport)
   - Excel (gedetailleerde data)
   - MS Project (XML)
   - CSV (ruwe data)
   - PNG/SVG (afbeelding)
4. Configureer exportopties:
   - Datumbereik
   - Kolommen/velden
   - Inclusief subtaken
   - Schaal (voor PDF/afbeelding)
5. Klik op **Exporteren**
6. Download bestand of verstuur via email

**Checklist:**

- [ ] Correct formaat geselecteerd voor doel
- [ ] Data volledig in export
- [ ] Bestandsgrootte acceptabel
- [ ] Export veilig opgeslagen/verstuurd

---

### PROC-011: Project Template Aanmaken

| Veld | Waarde |
|------|--------|
| **Doel** | Herbruikbare projectstructuur opslaan |
| **Trigger** | Standaardisatie van projectaanpak |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 2 uur |

**Stappen:**

1. Open bestaand project als basis (of maak nieuw)
2. Configureer gewenste structuur:
   - Fasen/mijlpalen
   - Standaard taken
   - Afhankelijkheden
   - Resource rollen (niet personen)
3. Navigeer naar **Project > Opslaan als Template**
4. Vul template gegevens in:
   - Template naam
   - Categorie
   - Beschrijving
5. Selecteer wat meegenomen wordt:
   - Taakstructuur
   - Duur (niet datums)
   - Resource rollen
   - Custom velden
6. Sla template op

**Checklist:**

- [ ] Template naam beschrijvend
- [ ] Geen persoonlijke data in template
- [ ] Duur relatief (niet absolute datums)
- [ ] Template beschikbaar voor hele workspace

---

### PROC-012: Bulk Gebruikers Importeren

| Veld | Waarde |
|------|--------|
| **Doel** | Meerdere gebruikers tegelijk toevoegen |
| **Trigger** | Nieuwe afdeling, grote projectstart |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 4 uur |

**Stappen:**

1. Download import template: **Gebruikers > Import > Download Template**
2. Vul template in met gebruikersgegevens:
   - Email (verplicht)
   - Voornaam
   - Achternaam
   - Rol
   - Afdeling
   - Projecten (komma-gescheiden)
3. Valideer bestand lokaal op formatting
4. Upload bestand via **Gebruikers > Import > Upload**
5. Review preview van te importeren gebruikers
6. Los eventuele validatiefouten op
7. Bevestig import
8. Monitor uitnodigingsmails

**Checklist:**

- [ ] Template correct ingevuld
- [ ] Emailadressen geldig en uniek
- [ ] Rollen bestaan in systeem
- [ ] Preview gecontroleerd
- [ ] Uitnodigingen verstuurd

---

### PROC-013: Notificatie Instellingen Beheren

| Veld | Waarde |
|------|--------|
| **Doel** | Email en in-app notificaties configureren |
| **Trigger** | Gebruikersvoorkeur, te veel/weinig notificaties |
| **Verantwoordelijke** | Alle rollen (eigen instellingen), Admin (workspace defaults) |
| **Maximum Responstijd** | Direct |

**Stappen voor Gebruiker:**

1. Navigeer naar **Profiel > Notificatie Instellingen**
2. Configureer per categorie:
   - Taaktoewijzingen
   - Deadline herinneringen
   - Projectupdates
   - Mentions
   - Dagelijkse/wekelijkse digest
3. Selecteer per kanaal: email, in-app, beide, geen
4. Sla instellingen op

**Stappen voor Admin (Workspace Defaults):**

1. Navigeer naar **Instellingen > Notificaties**
2. Stel workspace defaults in
3. Configureer verplichte notificaties (kunnen niet uitgeschakeld worden)
4. Sla instellingen op

**Checklist:**

- [ ] Kritieke notificaties ingeschakeld
- [ ] Geen notificatie-overload
- [ ] Email frequentie acceptabel

---

### PROC-014: Project Delen met Externe Klant

| Veld | Waarde |
|------|--------|
| **Doel** | Klant toegang geven tot projectvoortgang |
| **Trigger** | Klantrelatie, transparantie vereist |
| **Verantwoordelijke** | Admin, Medewerker |
| **Maximum Responstijd** | 4 uur |

**Stappen:**

1. Voeg klant toe als gebruiker (PROC-003) met rol Klant Editor of Klant Viewer
2. Navigeer naar **Project > Instellingen > Toegang**
3. Voeg klantgebruiker toe aan project
4. Configureer zichtbaarheid:
   - Welke fasen/taken zichtbaar
   - Resourcenamen verbergen (optioneel)
   - Budget/kosten verbergen (optioneel)
5. Activeer klant-specifieke view (optioneel)
6. Verstuur welkomstmail met instructies

**Checklist:**

- [ ] Correcte rol (Editor/Viewer)
- [ ] Gevoelige informatie verborgen
- [ ] Klant kan inloggen
- [ ] Instructies verstuurd

---

### PROC-015: Dashboard Configureren

| Veld | Waarde |
|------|--------|
| **Doel** | Persoonlijk of workspace dashboard inrichten |
| **Trigger** | Nieuwe gebruiker, gewijzigde informatiebehoeften |
| **Verantwoordelijke** | Alle rollen (eigen dashboard), Admin (workspace dashboard) |
| **Maximum Responstijd** | Direct |

**Stappen:**

1. Navigeer naar Dashboard
2. Klik op **Bewerken** (potlood icoon)
3. Voeg widgets toe:
   - Sleep vanuit widget bibliotheek
   - Of klik op **+ Widget Toevoegen**
4. Configureer per widget:
   - Databron (project, alle projecten)
   - Filters
   - Weergave opties
5. Positioneer widgets door slepen
6. Sla layout op

**Beschikbare Widgets:**

- Projectvoortgang (Gantt mini)
- Openstaande taken
- Mijlpalen overzicht
- Resource bezetting
- Deadline kalender
- Team activiteit
- KPI meters

**Checklist:**

- [ ] Relevante widgets toegevoegd
- [ ] Data correct gefilterd
- [ ] Layout overzichtelijk
- [ ] Dashboard laadt snel

---

## 2. Vault Procedures

### PROC-020: Vault Item Verwerken (Input - Processing - Done)

| Veld | Waarde |
|------|--------|
| **Doel** | Vault items door verwerkingsworkflow leiden |
| **Trigger** | Nieuw item in Input queue |
| **Verantwoordelijke** | Vault Medewerker, Admin |
| **Maximum Responstijd** | 24 uur (normaal) / 4 uur (urgent) |

**Stappen:**

**Fase 1: Input Ontvangst**
1. Open Vault module
2. Bekijk nieuwe items in **Input** kolom
3. Sorteer op urgentie/datum
4. Selecteer item om te verwerken

**Fase 2: Processing**
1. Klik op **Start Verwerking** (item verplaatst naar Processing)
2. Review item content:
   - Documenten
   - Metadata
   - Gerelateerde items
3. Voer validatie uit:
   - Volledigheid check
   - Data quality check
   - Duplicaat check
4. Voeg processing notes toe (PROC-021)
5. Voer benodigde acties uit:
   - Data correctie
   - Aanvulling aanvragen
   - Goedkeuring vragen

**Fase 3: Done**
1. Markeer alle verwerking als compleet
2. Klik op **Verwerking Voltooid** (item verplaatst naar Done)
3. Selecteer uitkomst:
   - Goedgekeurd
   - Afgekeurd (PROC-024)
   - Geexporteerd (PROC-022)

**Checklist:**

- [ ] Item volledig gereviewd
- [ ] Alle validaties uitgevoerd
- [ ] Processing notes toegevoegd
- [ ] Correcte eindstatus geselecteerd
- [ ] Item in Done kolom

---

### PROC-021: Processing Notes Documenteren

| Veld | Waarde |
|------|--------|
| **Doel** | Verwerkingshistorie vastleggen voor audit en overdracht |
| **Trigger** | Tijdens verwerking van elk Vault item |
| **Verantwoordelijke** | Vault Medewerker, Admin |
| **Maximum Responstijd** | Tijdens verwerking |

**Stappen:**

1. Open item in Processing status
2. Navigeer naar **Notes** tab
3. Voeg notitie toe met:
   - Tijdstempel (automatisch)
   - Auteur (automatisch)
   - Categorie:
     - Validatie resultaat
     - Actie ondernomen
     - Vraag/opmerking
     - Beslissing
   - Beschrijving
4. Voeg bijlagen toe indien nodig
5. Sla notitie op

**Verplichte Notities:**

| Moment | Type Notitie |
|--------|--------------|
| Start verwerking | Eerste indruk, scope |
| Validatiefouten | Bevinding + actie |
| Externe communicatie | Samenvatting contactmoment |
| Afronding | Conclusie + uitkomst |

**Checklist:**

- [ ] Notities bevatten voldoende context
- [ ] Tijdlijn navolgbaar
- [ ] Beslissingen onderbouwd
- [ ] Geen gevoelige persoonsdata in notities (tenzij noodzakelijk)

---

### PROC-022: Vault Export naar Permanent Storage

| Veld | Waarde |
|------|--------|
| **Doel** | Verwerkte items archiveren naar permanente opslag |
| **Trigger** | Item goedgekeurd en verwerkt |
| **Verantwoordelijke** | Vault Medewerker, Admin |
| **Maximum Responstijd** | 1 werkdag |

**Stappen:**

1. Selecteer item(s) in Done status met uitkomst "Goedgekeurd"
2. Klik op **Export > Permanent Storage**
3. Selecteer doellocatie:
   - Supabase Storage (default)
   - Externe drive (indien geconfigureerd)
4. Configureer export:
   - Inclusief originele bestanden
   - Inclusief processing notes
   - Inclusief metadata
   - Bestandsnaamconventie
5. Review export preview
6. Start export
7. Verifieer export resultaat
8. Markeer item als "Gearchiveerd"

**Bestandsnaamconventie:**

```
[JAAR]-[MAAND]-[ITEMCODE]-[BESCHRIJVING].[EXT]
Voorbeeld: 2024-12-V00123-Factuur_KlantABC.pdf
```

**Checklist:**

- [ ] Alle benodigde bestanden geexporteerd
- [ ] Bestandsnamen conform conventie
- [ ] Export geverifieerd (bestand opent correct)
- [ ] Item status bijgewerkt
- [ ] Audit trail compleet

---

### PROC-023: Bulk Vault Verwerking

| Veld | Waarde |
|------|--------|
| **Doel** | Meerdere gelijksoortige items tegelijk verwerken |
| **Trigger** | Grote batch items, periodieke verwerking |
| **Verantwoordelijke** | Vault Medewerker, Admin |
| **Maximum Responstijd** | Afhankelijk van volume |

**Stappen:**

1. Filter items in Input op type/categorie
2. Selecteer items voor bulk verwerking (max 50 per batch)
3. Klik op **Bulk Acties > Start Bulk Verwerking**
4. Kies verwerkingsmodus:
   - Automatisch (standaard regels)
   - Semi-automatisch (per-item review)
   - Alleen statuswijziging
5. Bij automatisch:
   - Review voorgestelde acties
   - Pas regels aan indien nodig
   - Start batch
6. Bij semi-automatisch:
   - Doorloop items een voor een
   - Snelle approve/reject per item
7. Review bulk resultaten
8. Los exceptions apart af

**Bulk Regels (Voorbeelden):**

| Regel | Conditie | Actie |
|-------|----------|-------|
| Auto-approve | Type = "Factuur" AND Bedrag < 500 | Naar Done (Goedgekeurd) |
| Flaggen | Duplicaat gedetecteerd | Markeer voor review |
| Afkeuren | Validatie failed | Naar Afgekeurd + notificatie |

**Checklist:**

- [ ] Batch grootte beheersbaar
- [ ] Regels geverifieerd voor start
- [ ] Exceptions geidentificeerd
- [ ] Alle items verwerkt of geescaleerd

---

### PROC-024: Vault Item Afkeuren

| Veld | Waarde |
|------|--------|
| **Doel** | Item terugsturen naar indiener met feedback |
| **Trigger** | Validatiefout, incomplete data, niet voldoet aan criteria |
| **Verantwoordelijke** | Vault Medewerker, Admin |
| **Maximum Responstijd** | 4 uur na beslissing |

**Stappen:**

1. Documenteer afkeuringsreden in processing notes (PROC-021)
2. Klik op **Afkeuren**
3. Selecteer afkeuringscategorie:
   - Incompleet
   - Onjuiste data
   - Duplicaat
   - Niet conform beleid
   - Anders
4. Schrijf feedback bericht voor indiener:
   - Duidelijke uitleg reden
   - Specifieke vereisten voor herindiening
   - Contactpersoon voor vragen
5. Selecteer actie:
   - Terugsturen naar indiener
   - Archiveren (definitief afkeuren)
6. Bevestig afkeuring
7. Notificatie wordt automatisch verstuurd

**Checklist:**

- [ ] Reden duidelijk gedocumenteerd
- [ ] Feedback constructief en actionable
- [ ] Indiener genotificeerd
- [ ] Item correct gemarkeerd in systeem
- [ ] Herindiening mogelijk (tenzij definitief)

---

### PROC-025: Vault Dashboard Monitoring

| Veld | Waarde |
|------|--------|
| **Doel** | Overzicht behouden van Vault status en bottlenecks |
| **Trigger** | Dagelijks, of bij capaciteitsvragen |
| **Verantwoordelijke** | Vault Medewerker, Admin |
| **Maximum Responstijd** | N.v.t. (monitoring) |

**Stappen:**

1. Open Vault Dashboard
2. Review key metrics:
   - Items in Input (wachtrij)
   - Items in Processing (in behandeling)
   - Gemiddelde doorlooptijd
   - Oudste item in queue
   - Items per categorie
3. Identificeer bottlenecks:
   - Queue groter dan 50 items
   - Doorlooptijd > 48 uur
   - Items > 5 dagen in Processing
4. Neem actie bij afwijkingen:
   - Escaleer (PROC-041)
   - Herverdeel werk
   - Pas prioriteiten aan

**Dashboard Drempels:**

| Metric | Groen | Oranje | Rood |
|--------|-------|--------|------|
| Queue grootte | < 20 | 20-50 | > 50 |
| Gem. doorlooptijd | < 24u | 24-48u | > 48u |
| Oudste item | < 3 dagen | 3-5 dagen | > 5 dagen |

**Checklist:**

- [ ] Dashboard dagelijks bekeken
- [ ] Afwijkingen genoteerd
- [ ] Acties ondernomen bij rood
- [ ] Trends gemonitord

---

## 3. Onderhoud Procedures

### PROC-030: Workspace Audit (Maandelijks)

| Veld | Waarde |
|------|--------|
| **Doel** | Gezondheid en compliance van workspace controleren |
| **Trigger** | Maandelijks, eerste werkdag van de maand |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 3 werkdagen voor rapport |

**Stappen:**

1. Genereer workspace rapport via **Instellingen > Rapportages > Workspace Audit**
2. Controleer gebruikersstatistieken:
   - Actieve vs inactieve gebruikers
   - Laatste login data
   - Rol verdeling
3. Controleer projectstatistieken:
   - Actieve projecten
   - Projecten zonder activiteit (> 30 dagen)
   - Voltooide projecten (archiveren?)
4. Controleer storage gebruik:
   - Totaal verbruik
   - Grote bestanden
   - Oude/ongebruikte bestanden
5. Review audit log:
   - Ongebruikelijke activiteiten
   - Failed logins
   - Permission wijzigingen
6. Documenteer bevindingen
7. Creeer actiepunten
8. Deel rapport met stakeholders

**Audit Checklist:**

- [ ] Alle inactieve gebruikers (> 90 dagen) gereviewd
- [ ] Projecten zonder activiteit (> 60 dagen) gereviewd
- [ ] Storage onder 80% limiet
- [ ] Geen ongeautoriseerde toegangspogingen
- [ ] Rollen conform beleid
- [ ] Rapport gedocumenteerd

---

### PROC-031: Vault Cleanup (Wekelijks)

| Veld | Waarde |
|------|--------|
| **Doel** | Vault opschonen en efficientie behouden |
| **Trigger** | Wekelijks, elke vrijdag |
| **Verantwoordelijke** | Vault Medewerker, Admin |
| **Maximum Responstijd** | 4 uur |

**Stappen:**

1. Open Vault overzicht
2. Identificeer items voor cleanup:
   - Done items ouder dan 30 dagen
   - Afgekeurde items ouder dan 14 dagen
   - Duplicaten
3. Exporteer items die permanent bewaard moeten worden (PROC-022)
4. Verwijder items die niet langer nodig zijn:
   - Selecteer items
   - Klik op **Bulk Acties > Verwijderen**
   - Bevestig met reden
5. Controleer storage vrijgekomen
6. Documenteer cleanup resultaten

**Cleanup Regels:**

| Categorie | Bewaartermijn | Actie |
|-----------|---------------|-------|
| Done - Goedgekeurd | 30 dagen | Exporteren + verwijderen |
| Done - Afgekeurd | 14 dagen | Verwijderen |
| Processing - Abandoned | 7 dagen | Escaleren of terugzetten |

**Checklist:**

- [ ] Done items gereviewd
- [ ] Export voltooid voor te bewaren items
- [ ] Verwijderingen gedocumenteerd
- [ ] Storage geoptimaliseerd
- [ ] Geen belangrijke items verloren

---

### PROC-032: Gebruikers Review (Maandelijks)

| Veld | Waarde |
|------|--------|
| **Doel** | Gebruikersbestand actueel en compliant houden |
| **Trigger** | Maandelijks, samen met workspace audit |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 2 werkdagen |

**Stappen:**

1. Genereer gebruikersrapport
2. Identificeer te reviewen accounts:
   - Inactief > 60 dagen
   - Tijdelijke accounts (verlopen?)
   - Externe klanten (project nog actief?)
3. Per inactieve gebruiker:
   - Controleer projecttoewijzingen
   - Verificeer dienstverband (intern)
   - Contact project owner (extern)
4. Neem actie:
   - Verlengen (met notitie)
   - Deactiveren (PROC-004)
   - Verwijderen (na deactivering > 90 dagen)
5. Update documentatie
6. Rapporteer aan management

**Review Criteria:**

| Situatie | Actie |
|----------|-------|
| Intern, actief dienstverband | Behouden |
| Intern, uit dienst | Deactiveren |
| Extern, project actief | Behouden |
| Extern, project klaar | Deactiveren |
| Geen login > 90 dagen | Onderzoeken |

**Checklist:**

- [ ] Alle inactieve accounts onderzocht
- [ ] Externe accounts geverifieerd met project status
- [ ] Deactiveringen uitgevoerd
- [ ] Rapport gegenereerd
- [ ] Management geinformeerd

---

### PROC-033: Permission Audit (Kwartaal)

| Veld | Waarde |
|------|--------|
| **Doel** | Controleren dat permissions principe van least privilege volgen |
| **Trigger** | Elk kwartaal, of na security incident |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 5 werkdagen |

**Stappen:**

1. Genereer permission matrix rapport
2. Review per rol:
   - Zijn permissions passend voor functie?
   - Zijn er onnodige elevated permissions?
3. Review per gebruiker:
   - Is rol passend?
   - Zijn project-specifieke permissions correct?
4. Identificeer afwijkingen:
   - Users met hogere rol dan nodig
   - Orphan permissions (geen actieve eigenaar)
   - Conflicterende permissions
5. Corrigeer afwijkingen:
   - Downgrade rollen waar mogelijk
   - Verwijder onnodige permissions
   - Documenteer uitzonderingen
6. Update permission beleid indien nodig
7. Rapporteer bevindingen

**Red Flags:**

- Admin rol voor non-admin taken
- Klant Editor met Vault toegang
- Meerdere Admin accounts per persoon
- Ongebruikte elevated accounts

**Checklist:**

- [ ] Alle rollen gereviewd
- [ ] Afwijkingen gedocumenteerd
- [ ] Correcties doorgevoerd
- [ ] Uitzonderingen goedgekeurd en gedocumenteerd
- [ ] Rapport gearchiveerd
- [ ] Volgende audit ingepland

---

### PROC-034: Backup Verificatie (Wekelijks)

| Veld | Waarde |
|------|--------|
| **Doel** | Verifieren dat backups correct werken en restorable zijn |
| **Trigger** | Wekelijks, elke maandag |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 4 uur |

**Stappen:**

1. Open Supabase Dashboard > Backups
2. Controleer laatste backup:
   - Tijdstip (< 24 uur oud)
   - Status (Completed)
   - Grootte (consistent met vorige)
3. Controleer backup schedule:
   - Dagelijks actief
   - Point-in-time recovery beschikbaar
4. Voer maandelijkse restore test uit (eerste maandag van maand):
   - Restore naar test omgeving
   - Verifieer data integriteit
   - Test basis functionaliteit
   - Documenteer resultaten
5. Controleer Storage backups:
   - Bestanden aanwezig
   - Toegankelijk
6. Update backup log

**Backup Controle Matrix:**

| Check | Frequentie | Verwachting |
|-------|------------|-------------|
| Backup aanwezig | Wekelijks | < 24 uur oud |
| Backup grootte | Wekelijks | +/- 10% van vorige |
| Restore test | Maandelijks | Succesvol |
| Point-in-time | Wekelijks | 7 dagen beschikbaar |

**Checklist:**

- [ ] Laatste backup < 24 uur oud
- [ ] Backup status = Completed
- [ ] Grootte consistent
- [ ] Point-in-time recovery actief
- [ ] (Maandelijks) Restore test succesvol
- [ ] Backup log bijgewerkt

---

### PROC-035: Systeem Health Check (Dagelijks)

| Veld | Waarde |
|------|--------|
| **Doel** | Dagelijkse controle van systeem beschikbaarheid en performance |
| **Trigger** | Dagelijks, start werkdag |
| **Verantwoordelijke** | Admin |
| **Maximum Responstijd** | 30 minuten |

**Stappen:**

1. Open monitoring dashboard
2. Controleer service status:
   - Vercel deployment status
   - Supabase status
   - API response times
3. Review error logs (laatste 24 uur):
   - Server errors (5xx)
   - Client errors (4xx) boven normaal
   - Database errors
4. Controleer performance metrics:
   - Page load time (< 3 sec)
   - API latency (< 500ms)
   - Database query time (< 100ms)
5. Bij afwijkingen:
   - Documenteer issue
   - Escaleer indien nodig (PROC-041)
   - Monitor na fix

**Health Dashboard Indicatoren:**

| Service | Metric | Drempel |
|---------|--------|---------|
| Vercel | Uptime | > 99.9% |
| Supabase | Response time | < 200ms |
| API | Error rate | < 0.1% |
| Database | Connection pool | < 80% |

**Checklist:**

- [ ] Alle services operationeel
- [ ] Geen kritieke errors in logs
- [ ] Performance binnen normen
- [ ] Afwijkingen gedocumenteerd
- [ ] Escalaties gestart indien nodig

---

## 4. Escalatie Procedures

### PROC-040: Permission Escalatie

| Veld | Waarde |
|------|--------|
| **Doel** | Tijdelijke elevated permissions aanvragen en toekennen |
| **Trigger** | Speciale taak vereist hogere rechten dan huidige rol |
| **Verantwoordelijke** | Aanvrager + Admin (goedkeuring) |
| **Maximum Responstijd** | 4 uur (werkuren) |

**Stappen:**

**Aanvraag (Aanvrager):**
1. Documenteer benodige permission(s)
2. Specificeer:
   - Reden
   - Duur (max 7 dagen)
   - Scope (welke project/workspace)
3. Dien aanvraag in via **Instellingen > Toegangsverzoek**
4. Notificatie gaat naar Admin

**Goedkeuring (Admin):**
1. Review aanvraag
2. Evalueer:
   - Is aanvraag gerechtvaardigd?
   - Kan doel bereikt worden met huidige rechten?
   - Zijn er risico's?
3. Besluit: Goedkeuren / Afkeuren / Aanpassen
4. Bij goedkeuring:
   - Ken tijdelijke permissions toe
   - Stel einddatum in
   - Documenteer goedkeuring
5. Notificeer aanvrager

**Automatische Intrekking:**
- Systeem trekt permissions automatisch in op einddatum
- Admin ontvangt notificatie
- Audit log entry wordt aangemaakt

**Checklist:**

- [ ] Aanvraag goed onderbouwd
- [ ] Minimaal benodigde permissions toegekend
- [ ] Einddatum ingesteld (max 7 dagen)
- [ ] Goedkeuring gedocumenteerd
- [ ] Automatische intrekking geconfigureerd

---

### PROC-041: Technische Escalatie (P1/P2/P3)

| Veld | Waarde |
|------|--------|
| **Doel** | Technische problemen oplossen via gestructureerd escalatieproces |
| **Trigger** | Technisch probleem dat impact heeft op gebruikers |
| **Verantwoordelijke** | Melder + Technisch team + Admin |
| **Maximum Responstijd** | Zie prioriteitenmatrix |

**Prioriteiten Matrix:**

| Prioriteit | Omschrijving | Response | Resolutie |
|------------|--------------|----------|-----------|
| **P1 - Kritiek** | Systeem niet beschikbaar, data verlies | 15 min | 4 uur |
| **P2 - Hoog** | Belangrijke functie niet werkend | 1 uur | 8 uur |
| **P3 - Medium** | Beperkte functionaliteit, workaround bestaat | 4 uur | 24 uur |
| **P4 - Laag** | Cosmetisch, minor inconvenience | 1 werkdag | 5 werkdagen |

**Stappen:**

**Melding:**
1. Classificeer probleem (P1-P4)
2. Documenteer in issue tracker:
   - Beschrijving probleem
   - Stappen om te reproduceren
   - Impact (hoeveel users, welke functies)
   - Screenshots/logs
3. Tag met prioriteit

**P1 Escalatie:**
1. Directe melding aan technisch team (telefoon/chat)
2. War room activeren indien nodig
3. Stakeholder communicatie starten
4. Updates elke 30 minuten

**P2 Escalatie:**
1. Ticket aanmaken met P2 tag
2. Technisch team notificatie
3. Workaround communiceren indien beschikbaar
4. Updates elk uur

**P3/P4 Escalatie:**
1. Ticket aanmaken
2. Normale queue processing
3. Update bij status wijziging

**Afsluiting:**
1. Probleem opgelost en geverifieerd
2. Root cause analyse (P1/P2)
3. Preventieve maatregelen documenteren
4. Stakeholders informeren
5. Ticket sluiten

**Checklist:**

- [ ] Prioriteit correct geclassificeerd
- [ ] Alle relevante informatie gedocumenteerd
- [ ] Juiste escalatiepad gevolgd
- [ ] Stakeholders geinformeerd
- [ ] Resolutie binnen SLA
- [ ] Post-mortem (P1/P2)

---

### PROC-042: Data Verlies Escalatie

| Veld | Waarde |
|------|--------|
| **Doel** | Data verlies minimaliseren en herstellen |
| **Trigger** | Onbedoelde data verwijdering, corruptie, of ontoegankelijkheid |
| **Verantwoordelijke** | Melder + Admin + Technisch team |
| **Maximum Responstijd** | P1 (15 minuten) |

**Stappen:**

**Onmiddellijk (Melder):**
1. STOP verdere acties die data kunnen aantasten
2. Documenteer wat er gebeurd is:
   - Tijdstip
   - Welke data
   - Welke actie leidde tot verlies
3. Meld direct aan Admin via spoedkanaal

**Beoordeling (Admin):**
1. Bepaal scope van verlies:
   - Hoeveel records/bestanden
   - Welke projecten/users geraakt
   - Kritieke data betrokken?
2. Classificeer als P1 indien kritiek

**Herstel:**
1. Identificeer herstel opties:
   - Soft delete terugdraaien (< 30 dagen)
   - Backup restore
   - Point-in-time recovery
2. Kies minst invasieve optie
3. Voer herstel uit in test omgeving eerst (indien mogelijk)
4. Verifieer herstelde data
5. Voer herstel uit in productie
6. Verifieer met melder

**Communicatie:**
1. Informeer getroffen gebruikers
2. Leg uit wat gebeurd is (zonder blame)
3. Bevestig herstel status

**Post-Incident:**
1. Root cause analyse
2. Preventieve maatregelen
3. Update procedures indien nodig
4. Documenteer in incident log

**Checklist:**

- [ ] Verdere schade voorkomen
- [ ] Scope bepaald
- [ ] Correcte prioriteit toegekend
- [ ] Hersteloptie gekozen en uitgevoerd
- [ ] Data geverifieerd
- [ ] Gebruikers geinformeerd
- [ ] Post-mortem uitgevoerd
- [ ] Preventieve maatregelen geimplementeerd

---

### PROC-043: Security Incident

| Veld | Waarde |
|------|--------|
| **Doel** | Security incidenten identificeren, containen en oplossen |
| **Trigger** | Verdachte activiteit, breach detectie, vulnerability exploitatie |
| **Verantwoordelijke** | Admin + Security Officer (indien aanwezig) |
| **Maximum Responstijd** | P1 (15 minuten) |

**Incident Types:**

| Type | Voorbeelden |
|------|-------------|
| Unauthorized Access | Failed logins, onbekende IP, privilege escalation |
| Data Breach | Data exfiltratie, ongeautoriseerde export |
| Malware | Verdachte bestanden, ongewone systeemactiviteit |
| Social Engineering | Phishing, pretexting |
| Insider Threat | Ongeautoriseerde data toegang door medewerker |

**Stappen:**

**Detectie & Melding:**
1. Identificeer indicatoren van compromise
2. Meld direct aan Admin via beveiligd kanaal
3. Documenteer NIET in reguliere systemen (mogelijk gecompromitteerd)

**Containment:**
1. Isoleer getroffen accounts/systemen:
   - Deactiveer verdachte accounts (PROC-004)
   - Revoke API keys indien nodig
   - Block verdachte IPs
2. Preserveer evidence:
   - Exporteer audit logs
   - Maak screenshots
   - Timestamp alle acties

**Eradication:**
1. Identificeer root cause
2. Verwijder threat:
   - Reset passwords
   - Patch vulnerabilities
   - Remove malware/backdoors
3. Verifieer systeem clean

**Recovery:**
1. Herstel services
2. Monitor voor recurrence
3. Communiceer met stakeholders

**Post-Incident:**
1. Formele incident report
2. Lessons learned sessie
3. Update security controls
4. Training indien nodig
5. Notificatie autoriteiten (indien data breach, zie AVG)

**Checklist:**

- [ ] Incident geidentificeerd en gedocumenteerd
- [ ] Getroffen systems geisoleerd
- [ ] Evidence gepreserveerd
- [ ] Threat geelimineerd
- [ ] Systems hersteld
- [ ] Monitoring verhoogd
- [ ] Incident report voltooid
- [ ] Lessons learned gedocumenteerd
- [ ] AVG notificatie (indien van toepassing)

---

### PROC-044: Klant Klacht Afhandeling

| Veld | Waarde |
|------|--------|
| **Doel** | Klantklachten professioneel en tijdig afhandelen |
| **Trigger** | Klacht ontvangen via email, telefoon, of systeem |
| **Verantwoordelijke** | Admin, Medewerker (projecteigenaar) |
| **Maximum Responstijd** | 4 uur (bevestiging) / 2 werkdagen (resolutie) |

**Klacht Categorieen:**

| Categorie | Voorbeelden | Prioriteit |
|-----------|-------------|------------|
| Technisch | Systeem werkt niet, data fout | P2-P3 |
| Service | Late oplevering, communicatie | P3 |
| Billing | Factuur incorrect | P3 |
| Privacy | Data zorgen | P2 |
| Anders | Overig | P3-P4 |

**Stappen:**

**Ontvangst:**
1. Registreer klacht in systeem
2. Stuur bevestiging binnen 4 uur:
   - Bevestig ontvangst
   - Geef referentienummer
   - Noem verwachte responstijd
3. Categoriseer en prioriteer

**Onderzoek:**
1. Verzamel informatie:
   - Klant versie van gebeurtenissen
   - Systeem logs
   - Betrokken medewerkers
2. Bepaal root cause
3. Identificeer oplossing

**Resolutie:**
1. Neem contact op met klant
2. Leg bevindingen uit (zonder blame)
3. Presenteer oplossing:
   - Correctie van probleem
   - Preventieve maatregelen
   - Compensatie indien gepast
4. Bevestig tevredenheid

**Afsluiting:**
1. Documenteer case volledig
2. Update relevante processen
3. Deel learnings met team
4. Sluit ticket

**Checklist:**

- [ ] Klacht geregistreerd
- [ ] Bevestiging verstuurd (< 4 uur)
- [ ] Onderzoek uitgevoerd
- [ ] Klant gecontacteerd met update
- [ ] Oplossing geimplementeerd
- [ ] Klant akkoord
- [ ] Case gedocumenteerd
- [ ] Learnings gedeeld

---

### PROC-045: Urgente Wijziging Aanvraag (Emergency Change)

| Veld | Waarde |
|------|--------|
| **Doel** | Kritieke wijzigingen doorvoeren buiten normaal change proces |
| **Trigger** | P1 incident vereist onmiddellijke code/config wijziging |
| **Verantwoordelijke** | Admin + Technisch team |
| **Maximum Responstijd** | Afhankelijk van P1 SLA |

**Criteria voor Emergency Change:**

- Actief P1 incident
- Normale change procedure zou SLA schenden
- Wijziging is noodzakelijk voor herstel
- Geen alternatieve workaround beschikbaar

**Stappen:**

**Goedkeuring:**
1. Emergency change aanvragen bij Admin
2. Documenteer (kort):
   - Wat moet gewijzigd worden
   - Waarom is het urgent
   - Risico's van wijziging
   - Rollback plan
3. Admin geeft mondelinge goedkeuring
4. Noteer goedkeuring (wie, wanneer)

**Implementatie:**
1. Voer wijziging door
2. Test basis functionaliteit
3. Monitor voor issues

**Post-Change:**
1. Documenteer wijziging volledig (binnen 24 uur)
2. Creeer formele change record
3. Review door Change Advisory Board (volgende sessie)
4. Update change log

**Checklist:**

- [ ] Emergency criteria geverifieerd
- [ ] Goedkeuring verkregen
- [ ] Rollback plan beschikbaar
- [ ] Wijziging doorgevoerd
- [ ] Basis tests uitgevoerd
- [ ] Monitoring actief
- [ ] Formele documentatie (< 24 uur)
- [ ] CAB review ingepland

---

## 5. Procedure Index

### Alfabetische Index

| Code | Procedure | Categorie |
|------|-----------|-----------|
| PROC-002 | Workspace Archiveren | Dagelijks |
| PROC-001 | Workspace Aanmaken | Dagelijks |
| PROC-009 | Baseline Aanmaken | Dagelijks |
| PROC-034 | Backup Verificatie | Onderhoud |
| PROC-023 | Bulk Vault Verwerking | Vault |
| PROC-012 | Bulk Gebruikers Importeren | Dagelijks |
| PROC-010 | Data Exporteren | Dagelijks |
| PROC-042 | Data Verlies Escalatie | Escalatie |
| PROC-015 | Dashboard Configureren | Dagelijks |
| PROC-003 | Gebruiker Uitnodigen | Dagelijks |
| PROC-004 | Gebruiker Deactiveren | Dagelijks |
| PROC-032 | Gebruikers Review | Onderhoud |
| PROC-044 | Klant Klacht Afhandeling | Escalatie |
| PROC-013 | Notificatie Instellingen Beheren | Dagelijks |
| PROC-033 | Permission Audit | Onderhoud |
| PROC-040 | Permission Escalatie | Escalatie |
| PROC-021 | Processing Notes Documenteren | Vault |
| PROC-005 | Project Aanmaken | Dagelijks |
| PROC-006 | Project Afsluiten | Dagelijks |
| PROC-014 | Project Delen met Externe Klant | Dagelijks |
| PROC-011 | Project Template Aanmaken | Dagelijks |
| PROC-008 | Resource Toewijzen | Dagelijks |
| PROC-043 | Security Incident | Escalatie |
| PROC-035 | Systeem Health Check | Onderhoud |
| PROC-007 | Taak Beheer | Dagelijks |
| PROC-041 | Technische Escalatie | Escalatie |
| PROC-045 | Urgente Wijziging Aanvraag | Escalatie |
| PROC-031 | Vault Cleanup | Onderhoud |
| PROC-025 | Vault Dashboard Monitoring | Vault |
| PROC-022 | Vault Export naar Permanent Storage | Vault |
| PROC-024 | Vault Item Afkeuren | Vault |
| PROC-020 | Vault Item Verwerken | Vault |
| PROC-030 | Workspace Audit | Onderhoud |

### Index per Verantwoordelijke

**Admin:**
- Alle procedures

**Vault Medewerker:**
- PROC-010, PROC-020-025

**Medewerker:**
- PROC-005-010, PROC-013-015

**Klant Editor:**
- PROC-007, PROC-013, PROC-015

**Klant Viewer:**
- PROC-013, PROC-015

### Index per Frequentie

**Dagelijks:**
- PROC-035 (Systeem Health Check)

**Wekelijks:**
- PROC-031 (Vault Cleanup)
- PROC-034 (Backup Verificatie)

**Maandelijks:**
- PROC-030 (Workspace Audit)
- PROC-032 (Gebruikers Review)

**Kwartaal:**
- PROC-033 (Permission Audit)

**Ad-hoc:**
- Alle overige procedures

---

## Document Informatie

| Veld | Waarde |
|------|--------|
| Document ID | P2 |
| Versie | 1.0.0 |
| Auteur | Agent A10 (Process Writer) |
| Review Status | Draft |
| Laatste Update | 2024-12-30 |

### Revisie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0.0 | 2024-12-30 | Agent A10 | Initiele versie |

---

*Einde document*
