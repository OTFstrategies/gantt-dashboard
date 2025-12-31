#!/usr/bin/env node
/**
 * Gantt Dashboard MCP Server
 *
 * Provides project prompts and context for Claude Code CLI
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

// =============================================================================
// PROMPT DEFINITIONS
// =============================================================================

interface PromptDef {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  template: string;
}

const PROMPTS: Record<string, PromptDef> = {
  'start': {
    name: 'start',
    description: 'Start een nieuw gesprek met volledige project context',
    template: `Je bent de AI Orchestrator (A0) voor het Gantt Dashboard project.

Project locatie: ${PROJECT_ROOT}

Lees eerst deze bestanden voor context:
- OUTCOMES.md (9 outcomes, key results)
- DELIVERABLES.md (29 deliverables index)
- WBS-AGENTS.md (12 agents, RACI matrix)
- TASKS.md (taken per deliverable)

Je coördineert een team van 12 virtuele agents (A1-A11).
Geef me een project status overview en vraag wat ik wil doen.`
  },

  'status': {
    name: 'status',
    description: 'Toon project status overzicht',
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Lees DELIVERABLES.md en TASKS.md.
Geef een status overzicht:
- Hoeveel deliverables pending/in_progress/completed
- Welke deliverables zijn ready to start (geen dependencies)
- Wat is de volgende logische stap`
  },

  'sprint': {
    name: 'sprint',
    description: 'Start of bekijk een specifieke sprint',
    arguments: [
      { name: 'number', description: 'Sprint nummer (1-5)', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Je bent orchestrator A0. Start Sprint {number}.

Sprint overzicht:
- Sprint 1 (Foundation): D11, D12, D14, D1 - Agents: A5, A6, A7, A3, A1
- Sprint 2 (Core Views): D2, D3, D4 - Agents: A3, A2, A6
- Sprint 3 (Extended Views): D5, D8, D13 - Agents: A3, A6, A4, A1
- Sprint 4 (Application): D6, D7, D9 - Agents: A2, A4, A3
- Sprint 5 (Features & Polish): D10, D15-D17, M1-M7, P1-P5 - Agents: A3, A8, A9, A10, A11

Lees WBS-AGENTS.md voor agent details.
Lees de relevante deliverables in DELIVERABLES.md.
Maak een uitvoeringsplan en begin.`
  },

  'deliverable': {
    name: 'deliverable',
    description: 'Werk aan een specifieke deliverable',
    arguments: [
      { name: 'id', description: 'Deliverable ID (bijv. D1, D2, M1)', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Werk aan deliverable {id}.

Lees de deliverable details in DELIVERABLES.md of de juiste module:
- D1-D10: DELIVERABLES-CODE.md
- D11-D14: DELIVERABLES-INFRA.md
- D15-D17: DELIVERABLES-DOCS.md
- M1-M7: DELIVERABLES-MIRO.md
- P1-P5: DELIVERABLES-PROCESS.md

Lees de taken in TASKS.md voor deze deliverable.
Lees WBS-AGENTS.md voor de verantwoordelijke agent.

Maak een plan en voer de taken uit.`
  },

  'agent': {
    name: 'agent',
    description: 'Neem de rol aan van een specifieke agent',
    arguments: [
      { name: 'id', description: 'Agent ID (A1-A11)', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Je bent agent {id}. Lees WBS-AGENTS.md voor je rol en verantwoordelijkheden.

Agent overzicht:
- A1: Architect (System design)
- A2: Frontend Builder (React/Next.js)
- A3: Bryntum Specialist (Gantt, Calendar, TaskBoard, Grid)
- A4: Backend Builder (API/Supabase)
- A5: Database Engineer (PostgreSQL/RLS)
- A6: Auth Specialist (Supabase Auth)
- A7: DevOps Agent (Vercel/CI/CD)
- A8: Documenter (Technical docs)
- A9: Visual Designer (UI/UX)
- A10: Process Writer (Workflows)
- A11: QA Agent (Testing)

Wat is je opdracht?`
  },

  'continue': {
    name: 'continue',
    description: 'Ga verder waar we gebleven waren',
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Lees DELIVERABLES.md en check de status.
Bekijk recent gewijzigde bestanden (git status, git log -5).

Wat was de laatste actie? Ga verder met het volgende logische punt.`
  },

  'commit': {
    name: 'commit',
    description: 'Commit wijzigingen en rapporteer',
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Bekijk alle uncommitted changes (git status, git diff).
Maak een commit met duidelijke message.
Geef een samenvatting van wat er gedaan is.`
  },

  'review': {
    name: 'review',
    description: 'Review code of deliverable',
    arguments: [
      { name: 'target', description: 'Bestand pad of deliverable ID', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Review: {target}

Check op:
- TypeScript best practices
- Bryntum component patterns
- Security vulnerabilities
- Performance issues

Geef concrete verbeterpunten.`
  },

  'debug': {
    name: 'debug',
    description: 'Debug een probleem',
    arguments: [
      { name: 'issue', description: 'Beschrijving van het probleem', required: true }
    ],
    template: `Gantt Dashboard project in ${PROJECT_ROOT}

Er is een probleem: {issue}

Onderzoek de relevante code en logs.
Identificeer de root cause.
Stel een fix voor en implementeer deze.`
  },

  // ==========================================================================
  // BROWSER AUTOMATION PROMPTS (met vooraf toestemming)
  // ==========================================================================

  'browser-download': {
    name: 'browser-download',
    description: 'Download bestanden via browser (met toestemming)',
    arguments: [
      { name: 'url', description: 'URL of website om te bezoeken', required: true },
      { name: 'what', description: 'Wat moet gedownload worden', required: true }
    ],
    template: `BROWSER TAAK - TOESTEMMING VOORAF GEGEVEN

Ik geef je toestemming om:
- Te navigeren naar: {url}
- Te downloaden: {what}
- Bestanden op te slaan zonder extra bevestiging

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-form': {
    name: 'browser-form',
    description: 'Vul formulier in en verstuur (met toestemming)',
    arguments: [
      { name: 'url', description: 'URL van het formulier', required: true },
      { name: 'data', description: 'Gegevens om in te vullen', required: true }
    ],
    template: `BROWSER TAAK - TOESTEMMING VOORAF GEGEVEN

Ik geef je toestemming om:
- Te navigeren naar: {url}
- Het formulier in te vullen met: {data}
- Het formulier te submitten
- Cookies te accepteren (privacy-vriendelijk)

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-email': {
    name: 'browser-email',
    description: 'Verstuur email via browser (met toestemming)',
    arguments: [
      { name: 'to', description: 'Ontvanger email adres', required: true },
      { name: 'subject', description: 'Onderwerp', required: true },
      { name: 'body', description: 'Inhoud van de email', required: true }
    ],
    template: `BROWSER TAAK - TOESTEMMING VOORAF GEGEVEN

Ik geef je toestemming om:
- Een email te versturen naar: {to}
- Met onderwerp: {subject}
- Met inhoud: {body}
- Op "Verzenden" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-post': {
    name: 'browser-post',
    description: 'Publiceer content online (met toestemming)',
    arguments: [
      { name: 'platform', description: 'Platform (LinkedIn, Twitter, etc.)', required: true },
      { name: 'content', description: 'Te publiceren content', required: true }
    ],
    template: `BROWSER TAAK - TOESTEMMING VOORAF GEGEVEN

Ik geef je toestemming om:
- Te navigeren naar: {platform}
- Deze content te publiceren: {content}
- Op "Post" / "Publiceren" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-auto': {
    name: 'browser-auto',
    description: 'Volledige browser automatisering (alle toestemming)',
    arguments: [
      { name: 'task', description: 'Volledige taak beschrijving', required: true }
    ],
    template: `BROWSER TAAK - VOLLEDIGE TOESTEMMING

Ik geef je vooraf toestemming voor ALLE browser acties:
- Downloads uitvoeren
- Formulieren invullen en submitten
- Emails/berichten versturen
- Content publiceren
- Cookies accepteren
- Klikken op verzend/post/publish knoppen

Taak: {task}

Voer dit volledig autonoom uit. Vraag ALLEEN bij:
- Bankgegevens/wachtwoorden (moet ik zelf doen)
- Permanent verwijderen
- Sharing permissions wijzigen`
  },

  'browser-research': {
    name: 'browser-research',
    description: 'Web research met automatisch browsen',
    arguments: [
      { name: 'topic', description: 'Onderwerp om te onderzoeken', required: true }
    ],
    template: `BROWSER TAAK - RESEARCH TOESTEMMING

Ik geef je toestemming om:
- Meerdere websites te bezoeken
- Informatie te verzamelen over: {topic}
- Screenshots te maken
- Bestanden te downloaden die relevant zijn

Geef me een samenvatting van je bevindingen.`
  },

  'browser-scrape': {
    name: 'browser-scrape',
    description: 'Data scrapen van website (met toestemming)',
    arguments: [
      { name: 'url', description: 'URL om te scrapen', required: true },
      { name: 'data', description: 'Welke data te verzamelen', required: true }
    ],
    template: `BROWSER TAAK - SCRAPE TOESTEMMING

Ik geef je toestemming om:
- Te navigeren naar: {url}
- Deze data te verzamelen: {data}
- De data op te slaan of te verwerken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // SHOPPING & E-COMMERCE
  // ==========================================================================

  'browser-shop': {
    name: 'browser-shop',
    description: 'Online winkelen en bestellen (met toestemming)',
    arguments: [
      { name: 'store', description: 'Webshop (bol.com, amazon, coolblue, etc.)', required: true },
      { name: 'item', description: 'Product om te kopen', required: true }
    ],
    template: `BROWSER TAAK - SHOPPING TOESTEMMING

Ik geef je toestemming om:
- Te navigeren naar: {store}
- Dit product te zoeken en toe te voegen aan winkelwagen: {item}
- Door te gaan naar checkout
- Mijn opgeslagen adres/betaalmethode te selecteren
- De bestelling te bevestigen (klik op "Bestellen")
- Cookies en voorwaarden te accepteren

NIET TOEGESTAAN (moet ik zelf):
- Nieuwe creditcard/bankgegevens invullen
- Nieuwe adressen toevoegen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-cart': {
    name: 'browser-cart',
    description: 'Winkelwagen beheren',
    arguments: [
      { name: 'store', description: 'Webshop URL', required: true },
      { name: 'action', description: 'Actie (toevoegen/verwijderen/afrekenen)', required: true }
    ],
    template: `BROWSER TAAK - WINKELWAGEN TOESTEMMING

Ik geef je toestemming om:
- Te navigeren naar: {store}
- Winkelwagen actie uit te voeren: {action}
- Door te gaan naar checkout indien gevraagd
- Bestelling te bevestigen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // SOCIAL MEDIA & COMMUNICATIE
  // ==========================================================================

  'browser-linkedin': {
    name: 'browser-linkedin',
    description: 'LinkedIn acties (posts, berichten, connecties)',
    arguments: [
      { name: 'action', description: 'Actie (post/message/connect/comment)', required: true },
      { name: 'content', description: 'Content of bericht', required: true }
    ],
    template: `BROWSER TAAK - LINKEDIN TOESTEMMING

Ik geef je toestemming om op LinkedIn:
- Actie uit te voeren: {action}
- Met deze content: {content}
- Posts te publiceren
- Berichten te versturen
- Connectieverzoeken te sturen
- Te reageren op posts
- Likes te geven

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-twitter': {
    name: 'browser-twitter',
    description: 'Twitter/X acties',
    arguments: [
      { name: 'action', description: 'Actie (tweet/reply/retweet/like/dm)', required: true },
      { name: 'content', description: 'Content', required: true }
    ],
    template: `BROWSER TAAK - TWITTER TOESTEMMING

Ik geef je toestemming om op Twitter/X:
- Actie uit te voeren: {action}
- Met deze content: {content}
- Tweets te plaatsen
- Te reageren
- Te retweeten
- DMs te versturen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-slack': {
    name: 'browser-slack',
    description: 'Slack berichten versturen',
    arguments: [
      { name: 'channel', description: 'Kanaal of persoon', required: true },
      { name: 'message', description: 'Bericht', required: true }
    ],
    template: `BROWSER TAAK - SLACK TOESTEMMING

Ik geef je toestemming om in Slack:
- Te navigeren naar kanaal/persoon: {channel}
- Dit bericht te versturen: {message}
- Bestanden te uploaden indien nodig
- Op "Verzenden" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-teams': {
    name: 'browser-teams',
    description: 'Microsoft Teams berichten',
    arguments: [
      { name: 'channel', description: 'Team/kanaal of persoon', required: true },
      { name: 'message', description: 'Bericht', required: true }
    ],
    template: `BROWSER TAAK - TEAMS TOESTEMMING

Ik geef je toestemming om in Microsoft Teams:
- Te navigeren naar: {channel}
- Dit bericht te versturen: {message}
- Bestanden te delen indien nodig
- Op "Verzenden" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-whatsapp': {
    name: 'browser-whatsapp',
    description: 'WhatsApp Web berichten',
    arguments: [
      { name: 'contact', description: 'Contact of groep', required: true },
      { name: 'message', description: 'Bericht', required: true }
    ],
    template: `BROWSER TAAK - WHATSAPP TOESTEMMING

Ik geef je toestemming om in WhatsApp Web:
- Contact/groep te openen: {contact}
- Dit bericht te versturen: {message}
- Bestanden/foto's te versturen indien nodig
- Op "Verzenden" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // EMAIL & CALENDAR
  // ==========================================================================

  'browser-gmail': {
    name: 'browser-gmail',
    description: 'Gmail acties (lezen, versturen, organiseren)',
    arguments: [
      { name: 'action', description: 'Actie (read/send/reply/forward/archive/label)', required: true },
      { name: 'details', description: 'Details (aan, onderwerp, inhoud, etc.)', required: true }
    ],
    template: `BROWSER TAAK - GMAIL TOESTEMMING

Ik geef je toestemming om in Gmail:
- Actie uit te voeren: {action}
- Met details: {details}
- Emails te lezen
- Emails te versturen/beantwoorden/forwarden
- Emails te archiveren of labels toe te voegen
- Bijlagen te downloaden
- Op "Verzenden" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-outlook': {
    name: 'browser-outlook',
    description: 'Outlook acties',
    arguments: [
      { name: 'action', description: 'Actie (read/send/reply/calendar)', required: true },
      { name: 'details', description: 'Details', required: true }
    ],
    template: `BROWSER TAAK - OUTLOOK TOESTEMMING

Ik geef je toestemming om in Outlook:
- Actie uit te voeren: {action}
- Met details: {details}
- Emails te lezen/versturen/beantwoorden
- Agenda items te bekijken/maken
- Bijlagen te downloaden
- Op "Verzenden" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-calendar': {
    name: 'browser-calendar',
    description: 'Agenda/calendar beheren',
    arguments: [
      { name: 'platform', description: 'Platform (Google Calendar, Outlook, etc.)', required: true },
      { name: 'action', description: 'Actie (create/edit/delete event)', required: true },
      { name: 'details', description: 'Event details', required: true }
    ],
    template: `BROWSER TAAK - CALENDAR TOESTEMMING

Ik geef je toestemming om in: {platform}
- Actie uit te voeren: {action}
- Met deze details: {details}
- Events aan te maken
- Uitnodigingen te versturen
- Events te bewerken
- Op "Opslaan" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-meeting': {
    name: 'browser-meeting',
    description: 'Meeting inplannen en uitnodigingen versturen',
    arguments: [
      { name: 'platform', description: 'Platform (Meet, Zoom, Teams)', required: true },
      { name: 'attendees', description: 'Deelnemers (email adressen)', required: true },
      { name: 'details', description: 'Datum, tijd, onderwerp', required: true }
    ],
    template: `BROWSER TAAK - MEETING TOESTEMMING

Ik geef je toestemming om:
- Een meeting aan te maken via: {platform}
- Deze mensen uit te nodigen: {attendees}
- Met details: {details}
- Uitnodigingen te versturen
- Calendar events aan te maken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // DOCUMENT & FILE MANAGEMENT
  // ==========================================================================

  'browser-gdrive': {
    name: 'browser-gdrive',
    description: 'Google Drive beheren',
    arguments: [
      { name: 'action', description: 'Actie (upload/download/create/organize)', required: true },
      { name: 'details', description: 'Bestand/map details', required: true }
    ],
    template: `BROWSER TAAK - GOOGLE DRIVE TOESTEMMING

Ik geef je toestemming om in Google Drive:
- Actie uit te voeren: {action}
- Met details: {details}
- Bestanden te uploaden
- Bestanden te downloaden
- Mappen aan te maken
- Bestanden te verplaatsen/organiseren

NIET TOEGESTAAN (moet ik zelf):
- Sharing/permissions wijzigen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-gdocs': {
    name: 'browser-gdocs',
    description: 'Google Docs bewerken',
    arguments: [
      { name: 'action', description: 'Actie (create/edit/export)', required: true },
      { name: 'content', description: 'Content of wijzigingen', required: true }
    ],
    template: `BROWSER TAAK - GOOGLE DOCS TOESTEMMING

Ik geef je toestemming om in Google Docs:
- Actie uit te voeren: {action}
- Met content: {content}
- Documenten aan te maken
- Tekst toe te voegen/bewerken
- Te exporteren als PDF/Word
- Op "Opslaan" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-sheets': {
    name: 'browser-sheets',
    description: 'Google Sheets bewerken',
    arguments: [
      { name: 'action', description: 'Actie (create/edit/formula/export)', required: true },
      { name: 'details', description: 'Data of wijzigingen', required: true }
    ],
    template: `BROWSER TAAK - GOOGLE SHEETS TOESTEMMING

Ik geef je toestemming om in Google Sheets:
- Actie uit te voeren: {action}
- Met details: {details}
- Spreadsheets aan te maken
- Cellen te bewerken
- Formules toe te voegen
- Data te importeren/exporteren

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-notion': {
    name: 'browser-notion',
    description: 'Notion paginas beheren',
    arguments: [
      { name: 'action', description: 'Actie (create/edit/organize)', required: true },
      { name: 'content', description: 'Content', required: true }
    ],
    template: `BROWSER TAAK - NOTION TOESTEMMING

Ik geef je toestemming om in Notion:
- Actie uit te voeren: {action}
- Met content: {content}
- Paginas aan te maken
- Content te bewerken
- Databases te updaten
- Bestanden te uploaden

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-dropbox': {
    name: 'browser-dropbox',
    description: 'Dropbox beheren',
    arguments: [
      { name: 'action', description: 'Actie (upload/download/organize)', required: true },
      { name: 'details', description: 'Bestand/map details', required: true }
    ],
    template: `BROWSER TAAK - DROPBOX TOESTEMMING

Ik geef je toestemming om in Dropbox:
- Actie uit te voeren: {action}
- Met details: {details}
- Bestanden te uploaden/downloaden
- Mappen te maken/organiseren

NIET TOEGESTAAN: Sharing permissions wijzigen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // ACCOUNT & SETTINGS (waar toegestaan)
  // ==========================================================================

  'browser-settings': {
    name: 'browser-settings',
    description: 'Account instellingen wijzigen (niet-gevoelig)',
    arguments: [
      { name: 'platform', description: 'Website/platform', required: true },
      { name: 'setting', description: 'Welke instelling te wijzigen', required: true },
      { name: 'value', description: 'Nieuwe waarde', required: true }
    ],
    template: `BROWSER TAAK - SETTINGS TOESTEMMING

Ik geef je toestemming om op: {platform}
- Instelling te wijzigen: {setting}
- Naar waarde: {value}
- Op "Opslaan" te klikken

NIET TOEGESTAAN:
- Wachtwoord wijzigen
- Beveiliging/2FA instellingen
- Betaalgegevens wijzigen
- Account verwijderen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-profile': {
    name: 'browser-profile',
    description: 'Profiel informatie updaten',
    arguments: [
      { name: 'platform', description: 'Website/platform', required: true },
      { name: 'updates', description: 'Wat te updaten (naam, bio, foto, etc.)', required: true }
    ],
    template: `BROWSER TAAK - PROFIEL TOESTEMMING

Ik geef je toestemming om op: {platform}
- Profiel te updaten met: {updates}
- Foto te uploaden indien nodig
- Op "Opslaan" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-notifications': {
    name: 'browser-notifications',
    description: 'Notificatie instellingen beheren',
    arguments: [
      { name: 'platform', description: 'Website/platform', required: true },
      { name: 'preferences', description: 'Gewenste instellingen', required: true }
    ],
    template: `BROWSER TAAK - NOTIFICATIES TOESTEMMING

Ik geef je toestemming om op: {platform}
- Notificatie instellingen te wijzigen naar: {preferences}
- Email voorkeuren aan te passen
- Push notificaties in/uit te schakelen
- Op "Opslaan" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-unsubscribe': {
    name: 'browser-unsubscribe',
    description: 'Uitschrijven van nieuwsbrieven/mailings',
    arguments: [
      { name: 'source', description: 'Email of website', required: true }
    ],
    template: `BROWSER TAAK - UNSUBSCRIBE TOESTEMMING

Ik geef je toestemming om:
- Naar unsubscribe link te navigeren van: {source}
- Uitschrijf formulier in te vullen
- Op "Uitschrijven" / "Unsubscribe" te klikken
- Bevestigingen te accepteren

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // DATA ENTRY & FORMS
  // ==========================================================================

  'browser-survey': {
    name: 'browser-survey',
    description: 'Enquête/survey invullen',
    arguments: [
      { name: 'url', description: 'Survey URL', required: true },
      { name: 'answers', description: 'Antwoorden of instructies', required: true }
    ],
    template: `BROWSER TAAK - SURVEY TOESTEMMING

Ik geef je toestemming om:
- Survey te openen: {url}
- In te vullen met: {answers}
- Door alle paginas te navigeren
- Op "Verzenden" / "Submit" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-booking': {
    name: 'browser-booking',
    description: 'Reservering/boeking maken',
    arguments: [
      { name: 'service', description: 'Service (restaurant, hotel, vlucht, etc.)', required: true },
      { name: 'details', description: 'Datum, tijd, personen, etc.', required: true }
    ],
    template: `BROWSER TAAK - BOOKING TOESTEMMING

Ik geef je toestemming om:
- Te boeken bij: {service}
- Met details: {details}
- Beschikbaarheid te checken
- Reservering te maken
- Bevestiging te accepteren
- Op "Boeken" / "Reserveren" te klikken

NIET TOEGESTAAN: Betaalgegevens invullen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-apply': {
    name: 'browser-apply',
    description: 'Sollicitatie/aanvraag indienen',
    arguments: [
      { name: 'url', description: 'Sollicitatie URL', required: true },
      { name: 'info', description: 'Gegevens om in te vullen', required: true }
    ],
    template: `BROWSER TAAK - SOLLICITATIE TOESTEMMING

Ik geef je toestemming om:
- Naar sollicitatie te gaan: {url}
- Formulier in te vullen met: {info}
- CV/documenten te uploaden
- Op "Versturen" / "Apply" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-register': {
    name: 'browser-register',
    description: 'Registreren voor event/webinar/cursus',
    arguments: [
      { name: 'event', description: 'Event naam of URL', required: true },
      { name: 'info', description: 'Registratie gegevens', required: true }
    ],
    template: `BROWSER TAAK - REGISTRATIE TOESTEMMING

Ik geef je toestemming om:
- Te registreren voor: {event}
- Met gegevens: {info}
- Formulier in te vullen
- Terms te accepteren
- Op "Registreren" te klikken

NIET TOEGESTAAN: Nieuw account aanmaken met wachtwoord

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // AUTOMATION & BULK ACTIONS
  // ==========================================================================

  'browser-bulk': {
    name: 'browser-bulk',
    description: 'Bulk acties uitvoeren (meerdere items)',
    arguments: [
      { name: 'platform', description: 'Platform', required: true },
      { name: 'action', description: 'Actie per item', required: true },
      { name: 'items', description: 'Lijst van items', required: true }
    ],
    template: `BROWSER TAAK - BULK ACTIE TOESTEMMING

Ik geef je toestemming om op: {platform}
- Deze actie uit te voeren: {action}
- Op al deze items: {items}
- Door te gaan tot alles verwerkt is

NIET TOEGESTAAN: Permanent verwijderen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-export': {
    name: 'browser-export',
    description: 'Data exporteren van platform',
    arguments: [
      { name: 'platform', description: 'Platform', required: true },
      { name: 'data', description: 'Welke data te exporteren', required: true },
      { name: 'format', description: 'Formaat (CSV, PDF, Excel, etc.)', required: true }
    ],
    template: `BROWSER TAAK - EXPORT TOESTEMMING

Ik geef je toestemming om van: {platform}
- Deze data te exporteren: {data}
- In formaat: {format}
- Het bestand te downloaden
- Op te slaan

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-import': {
    name: 'browser-import',
    description: 'Data importeren naar platform',
    arguments: [
      { name: 'platform', description: 'Platform', required: true },
      { name: 'file', description: 'Bestand om te importeren', required: true }
    ],
    template: `BROWSER TAAK - IMPORT TOESTEMMING

Ik geef je toestemming om naar: {platform}
- Dit bestand te importeren: {file}
- Het upload proces te voltooien
- Mapping/configuratie te bevestigen
- Op "Importeren" te klikken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-cleanup': {
    name: 'browser-cleanup',
    description: 'Opruimen (emails, bestanden, notificaties)',
    arguments: [
      { name: 'platform', description: 'Platform', required: true },
      { name: 'criteria', description: 'Wat opruimen (ouder dan X, gelezen, etc.)', required: true }
    ],
    template: `BROWSER TAAK - CLEANUP TOESTEMMING

Ik geef je toestemming om op: {platform}
- Op te ruimen volgens: {criteria}
- Items te archiveren
- Als gelezen te markeren
- Te verplaatsen naar map

NIET TOEGESTAAN: Permanent verwijderen (trash legen)

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // MONITORING & CHECKING
  // ==========================================================================

  'browser-monitor': {
    name: 'browser-monitor',
    description: 'Website/pagina monitoren op wijzigingen',
    arguments: [
      { name: 'url', description: 'URL om te monitoren', required: true },
      { name: 'check', description: 'Wat te checken (prijs, beschikbaarheid, etc.)', required: true }
    ],
    template: `BROWSER TAAK - MONITOR TOESTEMMING

Ik geef je toestemming om:
- Te navigeren naar: {url}
- Te checken op: {check}
- Screenshots te maken
- Data te verzamelen
- Te rapporteren over wijzigingen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-compare': {
    name: 'browser-compare',
    description: 'Producten/diensten vergelijken',
    arguments: [
      { name: 'items', description: 'Items om te vergelijken', required: true },
      { name: 'criteria', description: 'Vergelijkingscriteria (prijs, features, etc.)', required: true }
    ],
    template: `BROWSER TAAK - VERGELIJK TOESTEMMING

Ik geef je toestemming om:
- Deze items te vergelijken: {items}
- Op basis van: {criteria}
- Meerdere websites te bezoeken
- Data te verzamelen
- Een vergelijkingsoverzicht te maken

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'browser-login': {
    name: 'browser-login',
    description: 'Inloggen via SSO/OAuth (geen wachtwoord)',
    arguments: [
      { name: 'site', description: 'Website om in te loggen', required: true },
      { name: 'method', description: 'Login methode (Google, Microsoft, etc.)', required: true }
    ],
    template: `BROWSER TAAK - LOGIN TOESTEMMING

Ik geef je toestemming om:
- In te loggen op: {site}
- Via: {method} (SSO/OAuth)
- De authenticatie flow te voltooien
- Permissions te accepteren indien gevraagd

NIET TOEGESTAAN: Wachtwoorden invullen

Voer dit direct uit zonder tussentijdse vragen.`
  },

  // ==========================================================================
  // FULL AUTONOMY MODE
  // ==========================================================================

  'browser-full-auto': {
    name: 'browser-full-auto',
    description: 'MAXIMALE AUTOMATISERING - Alle mogelijke toestemmingen',
    arguments: [
      { name: 'task', description: 'Volledige taak beschrijving', required: true }
    ],
    template: `BROWSER TAAK - MAXIMALE TOESTEMMING

Dit is een VOLLEDIGE AUTOMATISERING opdracht. Ik geef je vooraf toestemming voor ALLE acties die technisch mogelijk zijn:

✅ TOEGESTAAN (doe zonder vragen):
- Navigeren naar alle websites
- Downloads uitvoeren
- Formulieren invullen en submitten
- Emails/berichten versturen
- Content publiceren (social media, forums, etc.)
- Bestanden uploaden
- Cookies en terms accepteren
- Klikken op alle verzend/post/publish knoppen
- SSO/OAuth logins voltooien
- Account settings wijzigen (niet-gevoelig)
- Profiel updates
- Notificatie voorkeuren
- Reserveringen/boekingen maken
- Data exporteren/importeren
- Surveys invullen
- Registreren voor events
- Items archiveren/organiseren
- Screenshots maken
- Meerdere tabs/websites gebruiken

❌ ALLEEN DIT NIET (hardcoded blokkade):
- Bankgegevens/creditcard invullen
- Wachtwoorden invullen
- Permanent verwijderen (trash legen)
- Sharing permissions wijzigen
- Nieuwe accounts aanmaken

TAAK: {task}

Voer dit VOLLEDIG AUTONOOM uit. Werk door tot de taak compleet is. Vraag NIETS tussendoor tenzij je een hardcoded blokkade tegenkomt.`
  },

  // ==========================================================================
  // DAGELIJKSE DATAVERZAMELING WORKFLOWS
  // ==========================================================================

  'dagelijks-rapport': {
    name: 'dagelijks-rapport',
    description: 'Verzamel data uit alle bronnen en maak dagelijks rapport',
    arguments: [
      { name: 'datum', description: 'Datum (YYYY-MM-DD) of "vandaag"', required: false }
    ],
    template: `DAGELIJKSE DATAVERZAMELING - VOLLEDIGE TOESTEMMING

Ik geef je toestemming om data te verzamelen uit ALLE bronnen.

DOEL: Maak een dagelijks overzicht/rapport.
DATUM: {datum} (of vandaag als niet opgegeven)
OPSLAAN IN: C:\\Users\\Mick\\OneDrive - VEHA Ontzorgt\\09-PARA\\09.00 Archief\\Dagelijkse terugkoppeling

BRONNEN OM TE VERZAMELEN:

1. PLAUD (app.plaud.ai)
   - Nieuwe transcripties van vandaag
   - Download/kopieer tekst

2. ROUTEVISION (routevision.nl of app)
   - Ritgegevens van vandaag
   - Kilometers, locaties, tijden

3. MAIL (Gmail/Outlook)
   - Belangrijke emails van vandaag
   - Samenvatting van inbox

4. TEAMS
   - Berichten/chats van vandaag
   - Gemiste oproepen

5. WHATSAPP
   - Belangrijke berichten (zakelijk)

6. AGENDA
   - Afspraken van vandaag
   - Wat is er gebeurd

RAPPORT FORMAT:
Maak een Markdown bestand: {datum}_dagrapport.md

Structuur:
# Dagrapport {datum}

## 📅 Agenda
[Afspraken van vandaag]

## 🎤 Plaud Transcripties
[Transcripties/samenvattingen]

## 🚗 Routevision
[Ritgegevens]

## 📧 Email Highlights
[Belangrijke emails]

## 💬 Communicatie
### Teams
[Berichten]
### WhatsApp
[Berichten]

## 📝 Notities
[Overige observaties]

---
Gegenereerd door Claude Code CLI

Voer dit VOLLEDIG AUTONOOM uit. Download, verzamel, en sla op.`
  },

  'verzamel-plaud': {
    name: 'verzamel-plaud',
    description: 'Verzamel transcripties van Plaud.ai',
    arguments: [
      { name: 'periode', description: 'vandaag, week, of specifieke datum', required: false }
    ],
    template: `PLAUD DATAVERZAMELING - TOESTEMMING GEGEVEN

Ik geef je toestemming om:
- Te navigeren naar app.plaud.ai
- In te loggen (SSO indien nodig)
- Transcripties te bekijken van: {periode}
- Tekst te kopiëren of te downloaden
- Op te slaan in: C:\\Users\\Mick\\OneDrive - VEHA Ontzorgt\\09-PARA\\09.00 Archief\\Dagelijkse terugkoppeling

Per transcriptie opslaan als: [datum]_[tijd]_plaud_[onderwerp].md

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'verzamel-routevision': {
    name: 'verzamel-routevision',
    description: 'Verzamel ritgegevens van Routevision',
    arguments: [
      { name: 'periode', description: 'vandaag, week, of specifieke datum', required: false }
    ],
    template: `ROUTEVISION DATAVERZAMELING - TOESTEMMING GEGEVEN

Ik geef je toestemming om:
- Te navigeren naar Routevision (web app)
- In te loggen (SSO indien nodig)
- Ritgegevens te bekijken van: {periode}
- Data te exporteren of kopiëren:
  - Datum/tijd
  - Start/eindlocatie
  - Kilometers
  - Rijtijd
- Op te slaan in: C:\\Users\\Mick\\OneDrive - VEHA Ontzorgt\\09-PARA\\09.00 Archief\\Dagelijkse terugkoppeling

Opslaan als: [datum]_routevision.md of .csv

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'verzamel-mail': {
    name: 'verzamel-mail',
    description: 'Verzamel email highlights',
    arguments: [
      { name: 'periode', description: 'vandaag, week, of specifieke datum', required: false },
      { name: 'filter', description: 'Optioneel: alleen van bepaalde afzenders', required: false }
    ],
    template: `EMAIL DATAVERZAMELING - TOESTEMMING GEGEVEN

Ik geef je toestemming om:
- Te navigeren naar Gmail/Outlook
- Emails te bekijken van: {periode}
- Filter: {filter}
- Per belangrijke email te noteren:
  - Afzender
  - Onderwerp
  - Korte samenvatting
  - Actie nodig? (ja/nee)
- Op te slaan in: C:\\Users\\Mick\\OneDrive - VEHA Ontzorgt\\09-PARA\\09.00 Archief\\Dagelijkse terugkoppeling

Opslaan als: [datum]_email_highlights.md

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'verzamel-communicatie': {
    name: 'verzamel-communicatie',
    description: 'Verzamel Teams en WhatsApp berichten',
    arguments: [
      { name: 'periode', description: 'vandaag, week, of specifieke datum', required: false }
    ],
    template: `COMMUNICATIE DATAVERZAMELING - TOESTEMMING GEGEVEN

Ik geef je toestemming om:

TEAMS:
- Te navigeren naar Teams (web)
- Recente chats te bekijken van: {periode}
- Belangrijke berichten te noteren
- Gemiste oproepen te checken

WHATSAPP:
- Te navigeren naar web.whatsapp.com
- Zakelijke chats te bekijken
- Belangrijke berichten te noteren

Per bericht noteren:
- Van wie
- Onderwerp/context
- Actie nodig?

Op te slaan in: C:\\Users\\Mick\\OneDrive - VEHA Ontzorgt\\09-PARA\\09.00 Archief\\Dagelijkse terugkoppeling

Opslaan als: [datum]_communicatie.md

Voer dit direct uit zonder tussentijdse vragen.`
  },

  'verzamel-alles': {
    name: 'verzamel-alles',
    description: 'COMPLETE dataverzameling uit alle bronnen',
    arguments: [
      { name: 'datum', description: 'Datum of "vandaag"', required: false }
    ],
    template: `COMPLETE DATAVERZAMELING - MAXIMALE TOESTEMMING

Dit is een VOLLEDIGE dataverzameling opdracht.
DATUM: {datum} (of vandaag)
OPSLAAN IN: C:\\Users\\Mick\\OneDrive - VEHA Ontzorgt\\09-PARA\\09.00 Archief\\Dagelijkse terugkoppeling

Ik geef je vooraf toestemming voor ALLE acties:
✅ Navigeren naar alle platforms
✅ SSO/OAuth logins voltooien
✅ Data bekijken en kopiëren
✅ Bestanden downloaden
✅ Screenshots maken indien nodig
✅ Bestanden opslaan

VERZAMEL IN DEZE VOLGORDE:

1. 📅 AGENDA (Google Calendar / Outlook)
   - Alle afspraken van de dag

2. 🎤 PLAUD (app.plaud.ai)
   - Alle transcripties

3. 🚗 ROUTEVISION
   - Alle ritten

4. 📧 EMAIL (Gmail/Outlook)
   - Ongelezen/belangrijke emails

5. 💬 TEAMS
   - Nieuwe berichten
   - Gemiste oproepen

6. 📱 WHATSAPP
   - Zakelijke berichten

NA VERZAMELING:
Combineer alles in één rapport: {datum}_volledig_dagrapport.md

WERK VOLLEDIG AUTONOOM. Stop alleen bij hardcoded blokkades.`
  }
};

// =============================================================================
// MCP SERVER
// =============================================================================

const server = new Server(
  {
    name: 'gantt-dashboard-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'read_project_file',
        description: 'Lees een project bestand (OUTCOMES.md, DELIVERABLES.md, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Bestandsnaam (bijv. OUTCOMES.md, DELIVERABLES.md)',
            },
          },
          required: ['filename'],
        },
      },
      {
        name: 'get_project_status',
        description: 'Krijg een samenvatting van de project status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_deliverables',
        description: 'Lijst alle deliverables met status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'read_project_file': {
      const filename = (args as { filename: string }).filename;
      const filepath = join(PROJECT_ROOT, filename);
      try {
        const content = readFileSync(filepath, 'utf-8');
        return { content: [{ type: 'text', text: content }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error reading ${filename}: ${error}` }] };
      }
    }

    case 'get_project_status': {
      try {
        const deliverables = readFileSync(join(PROJECT_ROOT, 'DELIVERABLES.md'), 'utf-8');
        const pending = (deliverables.match(/\|\s*Pending\s*\|/gi) || []).length;
        const inProgress = (deliverables.match(/\|\s*In Progress\s*\|/gi) || []).length;
        const completed = (deliverables.match(/\|\s*Completed\s*\|/gi) || []).length;

        return {
          content: [{
            type: 'text',
            text: `Project Status:
- Pending: ${pending}
- In Progress: ${inProgress}
- Completed: ${completed}
- Total: ${pending + inProgress + completed}

Project Root: ${PROJECT_ROOT}`
          }]
        };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error}` }] };
      }
    }

    case 'list_deliverables': {
      try {
        const content = readFileSync(join(PROJECT_ROOT, 'DELIVERABLES.md'), 'utf-8');
        // Extract table rows
        const tableMatch = content.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g) || [];
        return { content: [{ type: 'text', text: tableMatch.join('\n') }] };
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error}` }] };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS).map(p => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  };
});

// Get specific prompt
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const prompt = PROMPTS[name];

  if (!prompt) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  let text = prompt.template;

  // Replace arguments in template
  if (args) {
    for (const [key, value] of Object.entries(args)) {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
  }

  return {
    messages: [
      {
        role: 'user',
        content: { type: 'text', text },
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gantt Dashboard MCP Server running');
}

main().catch(console.error);
