# Master Orchestrator Agent

> **Centrale AI-agent** die alle development chats aanstuurt en de kwaliteitspipeline beheert.

---

## 1. Systeemoverzicht

### 1.1 Architectuur

```
                    ┌─────────────────────────┐
                    │         OWNER           │
                    │    (Jij - Non-tech)     │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │    MASTER ORCHESTRATOR  │
                    │       (Deze Agent)      │
                    │                         │
                    │  • Single Point Contact │
                    │  • Pipeline Automation  │
                    │  • State Management     │
                    │  • Quality Gates        │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │ DESIGN  │───────────▶│  BUILD  │───────────▶│  VERIFY │
   │  PHASE  │            │  PHASE  │            │  PHASE  │
   └─────────┘            └─────────┘            └─────────┘
```

### 1.2 Kernprincipes

| Principe | Implementatie |
|----------|---------------|
| **Kwaliteit > Snelheid** | Elke output wordt gecontroleerd voordat deze doorgaat |
| **AI-Optimized** | Documentatie is de "memory" tussen sessies |
| **Single Contact** | Owner praat alleen met Orchestrator |
| **Max Automation** | Pipeline draait automatisch, Owner hoeft niets te fixen |

---

## 2. 18-Chat Pipeline

### 2.1 Rollenmatrix

| Fase | Rol | ID | Aantal | Focus |
|------|-----|----|--------|-------|
| **Design** | Architect | A1 | 1 | Architectuur & Contracts |
| **Build** | Builder-Foundation | B0 | 1 | Shared infrastructure |
| **Build** | Builder-Gantt | B1 | 1 | Gantt component |
| **Build** | Builder-Calendar | B2 | 1 | Calendar component |
| **Build** | Builder-TaskBoard | B3 | 1 | TaskBoard component |
| **Build** | Builder-Dashboard | B4 | 1 | Dashboard & API |
| **Review** | Reviewer-Foundation | R0 | 1 | Review B0 output |
| **Review** | Reviewer-Gantt | R1 | 1 | Review B1 output |
| **Review** | Reviewer-Calendar | R2 | 1 | Review B2 output |
| **Review** | Reviewer-TaskBoard | R3 | 1 | Review B3 output |
| **Review** | Reviewer-Dashboard | R4 | 1 | Review B4 output |
| **Test** | Tester-Foundation | T0 | 1 | Test B0 output |
| **Test** | Tester-Gantt | T1 | 1 | Test B1 output |
| **Test** | Tester-Calendar | T2 | 1 | Test B2 output |
| **Test** | Tester-TaskBoard | T3 | 1 | Test B3 output |
| **Test** | Tester-Dashboard | T4 | 1 | Test B4 output |
| **Integrate** | Integrator | I1 | 1 | Merge & Conflict Resolution |
| **Final** | Verifier | V1 | 1 | End-to-end Verificatie |

**Totaal: 18 chats**

### 2.2 Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           QUALITY PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────┘

Phase 1: DESIGN
┌────────┐
│   A1   │──────────────────────────────────────────────────────────────┐
│Architect                                                               │
└────────┘                                                               │
     │                                                                   │
     │ Output: ARCHITECTURE.md, Contracts, Interfaces                    │
     ▼                                                                   │
Phase 2: BUILD (Parallel na Foundation)                                  │
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐      │
│   B0   │───▶│   B1   │    │   B2   │    │   B3   │    │   B4   │      │
│Foundat.│    │ Gantt  │    │Calendar│    │TaskBrd │    │Dashbrd │      │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘      │
     │             │             │             │             │           │
     │             │             │             │             │           │
     ▼             ▼             ▼             ▼             ▼           │
Phase 3: REVIEW (Parallel)                                               │
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐      │
│   R0   │    │   R1   │    │   R2   │    │   R3   │    │   R4   │      │
│Review  │    │Review  │    │Review  │    │Review  │    │Review  │      │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘      │
     │             │             │             │             │           │
     │ Pass/Fail   │             │             │             │           │
     ▼             ▼             ▼             ▼             ▼           │
Phase 4: TEST (Parallel)                                                 │
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐      │
│   T0   │    │   T1   │    │   T2   │    │   T3   │    │   T4   │      │
│ Test   │    │ Test   │    │ Test   │    │ Test   │    │ Test   │      │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘      │
     │             │             │             │             │           │
     │             │             │             │             │           │
     └─────────────┴─────────────┴─────────────┴─────────────┘           │
                                    │                                    │
                                    ▼                                    │
Phase 5: INTEGRATE                                                       │
                              ┌────────┐                                 │
                              │   I1   │                                 │
                              │Integr. │                                 │
                              └────────┘                                 │
                                    │                                    │
                                    ▼                                    │
Phase 6: VERIFY                                                          │
                              ┌────────┐                                 │
                              │   V1   │◀────────────────────────────────┘
                              │Verify  │  (Checkt tegen A1 contracts)
                              └────────┘
                                    │
                                    ▼
                              ┌────────┐
                              │ RELEASE│
                              └────────┘
```

---

## 3. Chat Definities

### 3.1 A1: Architect

**Doel:** Ontwerp systeem architectuur en definieer contracts

**Input:**
- Requirements van Owner (via Orchestrator)
- Bestaande documentatie (BRYNTUM-*.md)

**Output:**
- `ARCHITECTURE.md` - Technische architectuur
- `CONTRACTS.md` - Interface definities
- `FOLDER-OWNERSHIP.md` - Wie bezit welke files
- TypeScript interfaces in `types/contracts/`

**Quality Gate:**
- Alle interfaces zijn volledig gedefinieerd
- Geen ambiguïteit in contracts
- Folder ownership is exclusief (geen overlap)

**Prompt Template:**
```
Je bent de Architect (A1) voor het Gantt Dashboard project.

CONTEXT:
- Tech stack: Next.js 16, React 18, Bryntum Suite 7.1.0, TypeScript
- Lees eerst alle BRYNTUM-*.md documentatie
- Dit is een AI-first architectuur: andere AI's moeten je output kunnen vinden/begrijpen

TAAK:
[Specifieke architectuur taak van Orchestrator]

OUTPUT VEREISTEN:
1. Alle interfaces in TypeScript
2. Duidelijke folder structure
3. Dependency graph
4. Geen implementatie details - alleen contracts

KWALITEITSCRITERIA:
- Andere chats moeten zonder vragen kunnen starten
- Geen ambigue definities
- Volledige type coverage
```

---

### 3.2 B0: Builder-Foundation

**Doel:** Bouw shared infrastructure die alle andere builders gebruiken

**Input:**
- A1 output: `ARCHITECTURE.md`, `CONTRACTS.md`
- Bryntum documentatie

**Output:**
- Project structure (folders)
- `src/lib/bryntum/` - Wrappers
- `src/lib/project/` - ProjectContext
- `src/types/` - Shared types
- `src/styles/` - Global styles

**Quality Gate:**
- TypeScript compileert zonder errors
- Alle contracts uit A1 zijn geïmplementeerd
- Geen runtime errors bij import

**Prompt Template:**
```
Je bent Builder-Foundation (B0) voor het Gantt Dashboard project.

CONTEXT:
- Lees ARCHITECTURE.md en CONTRACTS.md eerst
- Je bouwt de shared infrastructure die B1-B4 nodig hebben
- Focus op: wrappers, context, types, styles

TAAK:
[Specifieke foundation taak van Orchestrator]

RESTRICTIES:
- Blijf binnen je folder ownership (zie FOLDER-OWNERSHIP.md)
- Implementeer EXACT de interfaces uit CONTRACTS.md
- Geen extra features toevoegen

COMMIT FORMAT:
feat(foundation): [beschrijving]
```

---

### 3.3 B1-B4: Feature Builders

**Doel:** Implementeer specifieke feature domain

| Builder | Domain | Folders |
|---------|--------|---------|
| B1 | Gantt | `src/features/gantt/`, `src/app/gantt/` |
| B2 | Calendar | `src/features/calendar/`, `src/app/calendar/` |
| B3 | TaskBoard | `src/features/taskboard/`, `src/app/taskboard/` |
| B4 | Dashboard | `src/features/dashboard/`, `src/app/dashboard/`, `src/app/api/` |

**Input:**
- A1 output: Architecture contracts
- B0 output: Foundation code
- Relevante BRYNTUM-*.md docs

**Output:**
- Complete feature implementatie
- Feature-specifieke hooks
- Feature-specifieke utils

**Prompt Template:**
```
Je bent Builder-[Domain] (B[N]) voor het Gantt Dashboard project.

CONTEXT:
- Lees ARCHITECTURE.md, CONTRACTS.md, FOLDER-OWNERSHIP.md
- Je dependencies: B0 foundation (src/lib/*)
- Lees relevante BRYNTUM-[DOMAIN]-*.md docs

TAAK:
[Specifieke feature taak van Orchestrator]

RESTRICTIES:
- ALLEEN files in je owned folders aanpassen
- Gebruik B0 exports, maak geen duplicaten
- Volg de interface contracts exact

DOCUMENTATIE PRIORITEIT:
1. [DOMAIN]-DEEP-DIVE-*.md
2. [DOMAIN]-IMPL-*.md
3. DEEP-DIVE-*.md (shared concepts)
```

---

### 3.4 R0-R4: Reviewers

**Doel:** Code review en kwaliteitscontrole

**Input:**
- Corresponderende Builder output (Rn reviews Bn)
- Architecture contracts (A1 output)

**Output:**
- Review rapport (`REVIEW-[DOMAIN].md`)
- Issue lijst met severity
- Approval of Rejection

**Review Checklist:**
```markdown
## Review Checklist

### Contract Compliance
- [ ] Alle interfaces correct geïmplementeerd
- [ ] Geen afwijkingen van ARCHITECTURE.md
- [ ] Folder ownership gerespecteerd

### Code Quality
- [ ] TypeScript strict compliant
- [ ] Geen `any` types (tenzij gedocumenteerd)
- [ ] Geen console.log/errors
- [ ] Consistent naming conventions

### Best Practices
- [ ] Hooks correct gebruikt (dependencies)
- [ ] Geen memory leaks
- [ ] Error boundaries aanwezig
- [ ] Loading states geïmplementeerd

### Documentation
- [ ] JSDoc comments op exports
- [ ] README in feature folder
- [ ] Type exports compleet
```

**Prompt Template:**
```
Je bent Reviewer (R[N]) voor het Gantt Dashboard project.

TAAK:
Review de output van Builder B[N].

PROCES:
1. Lees CONTRACTS.md - dit zijn de requirements
2. Lees de Builder's code
3. Vul de Review Checklist in
4. Schrijf REVIEW-[DOMAIN].md

OUTPUT:
- PASS: Alle checks groen → door naar Tester
- FAIL: Issues gevonden → terug naar Builder met specifieke fixes

BELANGRIJK:
- Je mag GEEN code schrijven of fixen
- Je rapporteert alleen bevindingen
- Wees specifiek: file, line, issue, fix suggestion
```

---

### 3.5 T0-T4: Testers

**Doel:** Functionele tests en runtime verificatie

**Input:**
- Builder output (na Review PASS)
- Architecture contracts

**Output:**
- Test rapport (`TEST-[DOMAIN].md`)
- Test commands die gewerkt hebben
- Screenshots/logs van failures

**Test Matrix:**
```markdown
## Test Matrix

### Build Tests
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Runtime Tests
- [ ] Component renders without crash
- [ ] Data loads correctly
- [ ] User interactions work
- [ ] No console errors

### Integration Tests
- [ ] ProjectModel syncs correctly
- [ ] Cross-component updates work
- [ ] API endpoints respond correctly

### Edge Cases
- [ ] Empty data handling
- [ ] Error states
- [ ] Loading states
```

**Prompt Template:**
```
Je bent Tester (T[N]) voor het Gantt Dashboard project.

TAAK:
Test de output van Builder B[N] (na Review approval).

PROCES:
1. Run build commands
2. Start development server
3. Execute test matrix
4. Document results

OUTPUT:
- PASS: Alle tests groen → door naar Integrator
- FAIL: Tests falen → terug naar Builder met reproductie steps

TOOLS:
- npm run build
- npm run dev
- Browser DevTools
- Network tab monitoring
```

---

### 3.6 I1: Integrator

**Doel:** Merge alle feature branches en los conflicts op

**Input:**
- Alle Builder outputs (na Review + Test PASS)
- Architecture contracts

**Output:**
- Merged `main` branch
- `INTEGRATION-REPORT.md`
- Conflict resolutions gedocumenteerd

**Prompt Template:**
```
Je bent de Integrator (I1) voor het Gantt Dashboard project.

TAAK:
Merge alle goedgekeurde feature branches naar main.

PROCES:
1. Checkout main
2. Merge feature/foundation
3. Merge feature/gantt
4. Merge feature/calendar
5. Merge feature/taskboard
6. Merge feature/dashboard
7. Los conflicts op volgens ARCHITECTURE.md
8. Run full build

CONFLICT RESOLUTION RULES:
- Architecture contracts zijn leidend
- Bij twijfel: vraag Architect (A1)
- Documenteer elke resolution
```

---

### 3.7 V1: Verifier

**Doel:** End-to-end verificatie tegen originele requirements

**Input:**
- Integrated main branch
- Original requirements
- Architecture contracts

**Output:**
- `VERIFICATION-REPORT.md`
- Final PASS/FAIL

**Verification Checklist:**
```markdown
## Final Verification

### Functional Requirements
- [ ] Gantt chart displays tasks and dependencies
- [ ] Calendar shows events in all views
- [ ] TaskBoard drag & drop works
- [ ] Dashboard shows all widgets
- [ ] Data syncs between views

### Non-Functional Requirements
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No runtime console errors
- [ ] Page loads < 3 seconds
- [ ] Smooth scrolling/interactions

### Architecture Compliance
- [ ] All contracts implemented
- [ ] Folder ownership respected
- [ ] No circular dependencies
- [ ] Consistent patterns
```

---

## 4. State Management

### 4.1 Pipeline State File

De Orchestrator houdt state bij in `PIPELINE-STATE.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-12-27T10:00:00Z",
  "currentPhase": "BUILD",
  "chats": {
    "A1": {
      "status": "COMPLETED",
      "lastOutput": "ARCHITECTURE.md",
      "completedAt": "2024-12-27T09:00:00Z"
    },
    "B0": {
      "status": "IN_PROGRESS",
      "currentTask": "ProjectContext implementation",
      "branch": "feature/foundation"
    },
    "B1": {
      "status": "WAITING",
      "blockedBy": ["B0"],
      "reason": "Needs foundation"
    },
    "R0": {
      "status": "IDLE",
      "waitingFor": "B0"
    }
  },
  "qualityGates": {
    "A1": { "passed": true, "date": "2024-12-27T09:30:00Z" },
    "B0": { "passed": null, "reviewStatus": null, "testStatus": null }
  }
}
```

### 4.2 Status Definities

| Status | Betekenis |
|--------|-----------|
| `IDLE` | Chat nog niet gestart |
| `WAITING` | Wacht op dependency |
| `IN_PROGRESS` | Actief aan het werken |
| `COMPLETED` | Klaar met huidige taak |
| `REVIEW_PENDING` | Wacht op review |
| `REVIEW_FAILED` | Review afgekeurd, moet fixen |
| `TEST_PENDING` | Wacht op test |
| `TEST_FAILED` | Test gefaald, moet fixen |
| `APPROVED` | Review + Test passed |

### 4.3 State Transitions

```
IDLE → WAITING → IN_PROGRESS → COMPLETED
                      │
                      ▼
              REVIEW_PENDING
                  │       │
                  ▼       ▼
          REVIEW_FAILED  REVIEW_PASSED
                  │              │
                  │              ▼
                  │       TEST_PENDING
                  │           │       │
                  │           ▼       ▼
                  │    TEST_FAILED  TEST_PASSED
                  │           │          │
                  └───────────┘          ▼
                                    APPROVED
```

---

## 5. Orchestrator Automatisering

### 5.1 Automatische Pipeline

De Orchestrator voert automatisch uit:

```python
# Pseudo-code voor pipeline automation

def orchestrate():
    while not all_approved():
        # 1. Check welke chats kunnen starten
        ready_chats = get_unblocked_chats()

        # 2. Start/continue chats
        for chat in ready_chats:
            if chat.status == "IDLE":
                start_chat(chat)
            elif chat.status == "COMPLETED":
                # Move to review phase
                assign_reviewer(chat)
            elif chat.status == "REVIEW_PASSED":
                # Move to test phase
                assign_tester(chat)
            elif chat.status == "REVIEW_FAILED" or chat.status == "TEST_FAILED":
                # Send back to builder with feedback
                restart_builder_with_feedback(chat)

        # 3. Check for integration readiness
        if all_builders_approved():
            start_integration()

        # 4. Final verification
        if integration_complete():
            start_verification()

    return "RELEASE READY"
```

### 5.2 Parallellisatie

Maximaal actieve chats per fase:

| Fase | Max Parallel | Reden |
|------|--------------|-------|
| Design | 1 | Moet sequentieel |
| Build | 5 | Alle builders parallel (na B0) |
| Review | 5 | Alle reviewers parallel |
| Test | 5 | Alle testers parallel |
| Integrate | 1 | Moet sequentieel |
| Verify | 1 | Moet sequentieel |

**Effectief: Max 5 chats tegelijk actief**

### 5.3 Feedback Loops

```
Builder Failed Review:
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Builder │───▶│ Reviewer│───▶│ Builder │ (with feedback)
└─────────┘    └─────────┘    └─────────┘
     │                             │
     │ Output v1                   │ Output v2
     ▼                             ▼

Builder Failed Test:
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Builder │───▶│ Reviewer│───▶│ Tester  │───▶│ Builder │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │                             │               │
     │ Output v1                   │ Fail report   │ Output v2
     ▼                             ▼               ▼
```

---

## 6. Owner Interface

### 6.1 Communicatie met Orchestrator

De Owner communiceert ALLEEN via high-level commands:

```markdown
## Owner Commands

### Status Check
"Wat is de status?"
→ Orchestrator geeft pipeline status

### Requirement Change
"Ik wil ook [feature X]"
→ Orchestrator stuurt naar Architect voor impact analyse

### Priority Change
"Focus eerst op Gantt"
→ Orchestrator past pipeline volgorde aan

### Problem Report
"Het werkt niet goed"
→ Orchestrator start Verifier voor diagnose

### Release Request
"Is het klaar voor release?"
→ Orchestrator checkt all quality gates
```

### 6.2 Status Reports

Orchestrator geeft gestructureerde updates:

```markdown
## Pipeline Status Report

**Datum:** 2024-12-27 10:00
**Fase:** BUILD
**Progress:** 35%

### Chat Status
| Chat | Status | Progress |
|------|--------|----------|
| A1 | ✅ APPROVED | 100% |
| B0 | ✅ APPROVED | 100% |
| B1 | 🔄 IN_PROGRESS | 60% |
| B2 | 🔄 IN_PROGRESS | 45% |
| B3 | ⏳ WAITING | 0% |
| B4 | ⏳ WAITING | 0% |
| R0-R4 | 💤 IDLE | - |
| T0-T4 | 💤 IDLE | - |
| I1 | 💤 IDLE | - |
| V1 | 💤 IDLE | - |

### Recent Activity
- B0 passed review and tests
- B1 implementing Gantt columns
- B2 implementing Calendar views

### Blockers
- None

### ETA Next Milestone
- Build phase complete: ~2 sessions
```

---

## 7. Error Handling

### 7.1 Failure Scenarios

| Scenario | Response |
|----------|----------|
| Builder can't complete | Send specific blockers to Architect |
| Review finds critical issues | Loop back to Builder with fixes |
| Test fails | Loop back to Builder with repro steps |
| Integration conflicts | Integrator resolves, or escalate to Architect |
| Verification fails | Full pipeline review, identify root cause |

### 7.2 Escalation Path

```
Builder Issue → Reviewer → Builder (fix)
                   │
                   ▼ (if architectural)
               Architect → Update contracts → Affected Builders

Integration Issue → Integrator → Architect (if contract unclear)

Verification Issue → Verifier → Architect + relevant Builder
```

---

## 8. Document als Memory

### 8.1 Persistente State

Alle chats gebruiken documenten als "memory":

| Document | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | Technische architectuur |
| `CONTRACTS.md` | Interface definities |
| `FOLDER-OWNERSHIP.md` | File ownership |
| `PIPELINE-STATE.json` | Pipeline status |
| `CHANGELOG.md` | Wat is er veranderd |
| `REVIEW-*.md` | Review rapporten |
| `TEST-*.md` | Test rapporten |

### 8.2 Session Handoff

Elke chat sessie begint met:

```markdown
## Session Start

1. Read PIPELINE-STATE.json for current status
2. Read relevant contracts/architecture
3. Read previous session output (if continuation)
4. Read review/test feedback (if fixing)
```

Elke chat sessie eindigt met:

```markdown
## Session End

1. Commit all code changes
2. Update PIPELINE-STATE.json
3. Write session summary to CHANGELOG.md
4. Notify Orchestrator of completion
```

---

## 9. Implementatie Stappenplan

### Stap 1: Orchestrator Setup
```markdown
1. Maak PIPELINE-STATE.json aan
2. Maak FOLDER-OWNERSHIP.md aan
3. Maak template prompts voor alle 18 chats
```

### Stap 2: Start Architect (A1)
```markdown
1. Open Chat A1
2. Geef Architect prompt met requirements
3. Wacht op ARCHITECTURE.md en CONTRACTS.md
4. Review output
```

### Stap 3: Start Foundation Builder (B0)
```markdown
1. Open Chat B0
2. Geef Builder prompt met A1 output
3. Wacht op foundation code
4. Trigger R0 (Review) en T0 (Test)
```

### Stap 4: Parallel Builders (B1-B4)
```markdown
1. Na B0 approval, open B1-B4 parallel
2. Elk werkt aan eigen domain
3. Triggers R1-R4 en T1-T4 bij completion
```

### Stap 5: Integration & Verification
```markdown
1. Na alle approvals, start I1
2. Na integration, start V1
3. Bij PASS → Release ready
4. Bij FAIL → Identify cause, loop back
```

---

## 10. Quick Reference

### Chat Nummering

```
A = Architect
B = Builder
R = Reviewer
T = Tester
I = Integrator
V = Verifier

0 = Foundation
1 = Gantt
2 = Calendar
3 = TaskBoard
4 = Dashboard
```

### Status Icons

```
💤 IDLE
⏳ WAITING
🔄 IN_PROGRESS
📝 REVIEW_PENDING
❌ REVIEW_FAILED
🧪 TEST_PENDING
💥 TEST_FAILED
✅ APPROVED
🚀 RELEASED
```

### Pipeline Commands

```
/status          - Show pipeline status
/start [chat]    - Start specific chat
/pause [chat]    - Pause specific chat
/review [chat]   - Trigger review
/test [chat]     - Trigger test
/integrate       - Start integration
/verify          - Start verification
/release         - Mark as released
```

---

*Orchestrator Agent v1.0*
*Gantt Dashboard Project*
