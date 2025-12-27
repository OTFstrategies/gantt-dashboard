# Bryntum AI Calendar Assistant

Dit document beschrijft de AI-gestuurde calendar scheduling functionaliteit, smart conflict detection, en intelligente meeting planning met Bryntum Calendar.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [AI Calendar Architectuur](#ai-calendar-architectuur)
3. [Smart Scheduling](#smart-scheduling)
4. [Conflict Detection](#conflict-detection)
5. [Natural Language Interface](#natural-language-interface)
6. [Backend Implementatie](#backend-implementatie)
7. [Use Cases](#use-cases)
8. [Integratie Patronen](#integratie-patronen)

---

## Overzicht

De AI Calendar Assistant combineert Bryntum Calendar met AI-capabilities voor intelligente event scheduling, automatische conflict detection, en natural language meeting planning.

### Kern Functionaliteiten

```
┌────────────────────────────────────────────────────────────────┐
│                    AI Calendar Features                         │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Smart      │  │   Conflict   │  │    Natural Language  │  │
│  │  Scheduling  │  │  Detection   │  │      Interface       │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬──────────┘  │
│         │                 │                      │              │
│         ▼                 ▼                      ▼              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               AI Processing Engine                       │   │
│  │  ┌─────────┐  ┌────────────┐  ┌────────────────────┐    │   │
│  │  │ Context │  │  Schedule  │  │ Preference Engine  │    │   │
│  │  │ Analyzer│  │  Optimizer │  │ (Learning)         │    │   │
│  │  └─────────┘  └────────────┘  └────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Bryntum Calendar                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## AI Calendar Architectuur

### Backend Configuratie

```
bryntum-calendar-trial/examples/ai-calendar/php/config.php
```

De AI Calendar demo vereist een PHP backend met OpenAI configuratie:

```php
<?php
// AI Calendar Backend Configuration
return [
    'openai' => [
        'api_key' => getenv('OPENAI_API_KEY'),
        'model' => 'gpt-4',
        'max_tokens' => 1000,
        'temperature' => 0.5  // Lagere temperature voor consistentie
    ],

    'calendar' => [
        'working_hours' => ['09:00', '17:00'],
        'default_meeting_duration' => 60, // minuten
        'buffer_between_meetings' => 15,  // minuten
        'preferred_meeting_times' => ['10:00', '14:00', '15:00']
    ]
];
```

### Frontend Integratie

```javascript
// AI Calendar met OpenAI Plugin integratie
import { Calendar, OpenAIPlugin, Toast } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo: 'container',

    date: new Date(),

    // AI Plugin configuratie (conceptueel, pas grid patronen toe)
    aiConfig: {
        apiPlugin: OpenAIPlugin,
        promptUrl: './api/ai-calendar',
        model: 'gpt-4'
    },

    // Standaard Calendar configuratie
    crudManager: {
        autoLoad: true,
        loadUrl: 'data/data.json',
        syncUrl: 'api/sync'
    },

    features: {
        eventTooltip: true,
        eventEdit: true,
        drag: {
            // AI-suggesties bij drag
            onBeforeDrop: 'up.onBeforeEventDrop'
        }
    },

    // Custom toolbar met AI features
    tbar: {
        items: {
            aiSchedule: {
                type: 'button',
                text: 'AI Schedule',
                icon: 'b-fa b-fa-magic',
                onClick: 'up.onAIScheduleClick'
            },
            aiInput: {
                type: 'textfield',
                width: 350,
                placeholder: 'Schedule a meeting with...',
                triggers: {
                    process: {
                        cls: 'b-fa b-fa-brain',
                        handler: 'up.processNaturalLanguage'
                    }
                }
            }
        }
    },

    onAIScheduleClick() {
        this.showAISchedulingDialog();
    },

    async processNaturalLanguage({ source }) {
        const input = source.value;
        if (!input.trim()) return;

        const result = await this.aiScheduler.parseNaturalLanguage(input);
        if (result.event) {
            this.showEventEditor(result.event);
        }

        source.value = '';
    },

    async onBeforeEventDrop({ eventRecord, startDate }) {
        const conflicts = await this.checkAIConflicts(eventRecord, startDate);
        if (conflicts.length > 0) {
            return this.showConflictResolution(conflicts);
        }
        return true;
    }
});
```

---

## Smart Scheduling

### AI Scheduling Service

```javascript
// lib/AICalendarScheduler.js
class AICalendarScheduler {
    constructor(calendar, config = {}) {
        this.calendar = calendar;
        this.apiEndpoint = config.apiEndpoint || '/api/ai-calendar';
        this.preferences = config.preferences || {};
    }

    /**
     * Vind het beste tijdslot voor een nieuwe meeting
     */
    async findOptimalSlot(participants, duration, constraints = {}) {
        const context = this.buildSchedulingContext();

        const response = await fetch(`${this.apiEndpoint}/find-slot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                participants,
                duration,
                constraints,
                context,
                prompt: `Find the optimal meeting slot for ${participants.length} participants,
                         duration ${duration} minutes, considering working hours and existing events.`
            })
        });

        const result = await response.json();
        return this.validateSlot(result.suggestedSlot);
    }

    /**
     * Bouw context voor AI beslissingen
     */
    buildSchedulingContext() {
        const { calendar } = this;
        const eventStore = calendar.eventStore;
        const resourceStore = calendar.resourceStore;

        // Haal events op voor de komende 2 weken
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);

        const existingEvents = eventStore.records
            .filter(e => e.startDate >= startDate && e.startDate <= endDate)
            .map(e => ({
                name: e.name,
                start: e.startDate.toISOString(),
                end: e.endDate.toISOString(),
                resourceId: e.resourceId,
                allDay: e.allDay
            }));

        const resources = resourceStore?.records.map(r => ({
            id: r.id,
            name: r.name,
            calendar: r.calendar?.name
        })) || [];

        return {
            existingEvents,
            resources,
            workingHours: this.preferences.workingHours || { start: 9, end: 17 },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferredMeetingTimes: this.preferences.preferredMeetingTimes || []
        };
    }

    /**
     * Parse natural language naar event data
     */
    async parseNaturalLanguage(input) {
        const response = await fetch(`${this.apiEndpoint}/parse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input,
                currentDate: new Date().toISOString(),
                prompt: `Parse this scheduling request into structured event data:
                         "${input}"

                         Return JSON with: name, startDate, endDate, participants[], location, description`
            })
        });

        const result = await response.json();
        return {
            event: this.createEventFromParsed(result.parsed),
            confidence: result.confidence
        };
    }

    /**
     * Suggereer herschikking bij conflicten
     */
    async suggestReschedule(conflictingEvents) {
        const context = this.buildSchedulingContext();

        const response = await fetch(`${this.apiEndpoint}/reschedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conflicts: conflictingEvents.map(e => ({
                    id: e.id,
                    name: e.name,
                    start: e.startDate,
                    end: e.endDate,
                    priority: e.priority || 'normal'
                })),
                context,
                prompt: 'Suggest the best way to resolve these scheduling conflicts'
            })
        });

        return response.json();
    }

    createEventFromParsed(parsed) {
        return {
            name: parsed.name || 'New Meeting',
            startDate: new Date(parsed.startDate),
            endDate: new Date(parsed.endDate),
            participants: parsed.participants || [],
            location: parsed.location,
            description: parsed.description
        };
    }

    validateSlot(slot) {
        // Valideer dat slot binnen working hours valt
        const startHour = new Date(slot.startDate).getHours();
        const endHour = new Date(slot.endDate).getHours();
        const { start, end } = this.preferences.workingHours || { start: 9, end: 17 };

        return startHour >= start && endHour <= end ? slot : null;
    }
}
```

### Optimale Slot Finding

```javascript
// Voorbeeld: Vind beste meeting tijd
const calendar = new Calendar({
    // ... config

    async findBestMeetingTime(attendees, duration = 60) {
        const scheduler = new AICalendarScheduler(this, {
            apiEndpoint: '/api/ai-calendar',
            preferences: {
                workingHours: { start: 9, end: 17 },
                preferredMeetingTimes: ['10:00', '14:00', '15:30'],
                bufferTime: 15
            }
        });

        // Haal beschikbaarheid op
        const availability = await this.getAttendeeAvailability(attendees);

        // AI vindt optimale slot
        const slot = await scheduler.findOptimalSlot(attendees, duration, {
            notBefore: new Date(),
            notAfter: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // binnen 1 week
            excludeAllDay: true,
            preferMorning: true
        });

        if (slot) {
            return {
                startDate: new Date(slot.startDate),
                endDate: new Date(slot.endDate),
                confidence: slot.confidence,
                reason: slot.reasoning
            };
        }

        return null;
    },

    async getAttendeeAvailability(attendees) {
        // Simuleer ophalen van beschikbaarheid uit externe calendars
        return attendees.map(attendee => ({
            email: attendee,
            busyTimes: this.eventStore.records
                .filter(e => e.participants?.includes(attendee))
                .map(e => ({ start: e.startDate, end: e.endDate }))
        }));
    }
});
```

---

## Conflict Detection

### Real-time Conflict Checker

```javascript
// lib/AIConflictDetector.js
class AIConflictDetector {
    constructor(calendar, apiEndpoint) {
        this.calendar = calendar;
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * Check voor conflicten met AI context analyse
     */
    async checkConflicts(event, newStart, newEnd) {
        const { calendar } = this;

        // Lokale conflict check
        const overlappingEvents = calendar.eventStore.records.filter(e => {
            if (e.id === event.id) return false;
            return (newStart < e.endDate && newEnd > e.startDate);
        });

        if (overlappingEvents.length === 0) {
            return { hasConflicts: false, conflicts: [] };
        }

        // AI analyse voor conflict severity en suggesties
        const response = await fetch(`${this.apiEndpoint}/analyze-conflicts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposedEvent: {
                    name: event.name,
                    start: newStart,
                    end: newEnd,
                    priority: event.priority
                },
                conflicts: overlappingEvents.map(e => ({
                    id: e.id,
                    name: e.name,
                    start: e.startDate,
                    end: e.endDate,
                    priority: e.priority || 'normal',
                    isRecurring: e.isRecurring
                })),
                prompt: 'Analyze these scheduling conflicts and suggest resolutions'
            })
        });

        const analysis = await response.json();
        return {
            hasConflicts: true,
            conflicts: overlappingEvents,
            severity: analysis.severity,
            suggestions: analysis.suggestions,
            canAutoResolve: analysis.canAutoResolve
        };
    }

    /**
     * Auto-resolve conflicts indien mogelijk
     */
    async autoResolve(conflicts, strategy = 'smart') {
        const response = await fetch(`${this.apiEndpoint}/auto-resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conflicts,
                strategy,
                context: this.buildContext(),
                prompt: `Auto-resolve these conflicts using ${strategy} strategy`
            })
        });

        const resolution = await response.json();

        if (resolution.success) {
            await this.applyResolution(resolution.changes);
        }

        return resolution;
    }

    buildContext() {
        return {
            workingHours: { start: 9, end: 17 },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            priorities: {
                high: ['Board Meeting', 'Client Call', 'Deadline'],
                low: ['Optional', 'Tentative', 'FYI']
            }
        };
    }

    async applyResolution(changes) {
        const { calendar } = this;

        calendar.project.suspendAutoSync();

        try {
            for (const change of changes) {
                const event = calendar.eventStore.getById(change.eventId);
                if (event) {
                    event.set({
                        startDate: new Date(change.newStart),
                        endDate: new Date(change.newEnd)
                    });
                }
            }

            await calendar.project.commitAsync();

            Toast.show({
                html: `Resolved ${changes.length} conflict(s)`,
                color: 'success'
            });
        } finally {
            calendar.project.resumeAutoSync();
        }
    }
}
```

### Conflict Resolution Dialog

```javascript
// Conflict resolution UI
function showConflictResolutionDialog(calendar, conflicts) {
    const detector = new AIConflictDetector(calendar, '/api/ai-calendar');

    new Dialog({
        title: 'Scheduling Conflicts Detected',
        width: 600,
        items: [
            {
                type: 'widget',
                html: `
                    <div class="conflict-list">
                        <h3>Conflicting Events:</h3>
                        ${conflicts.conflicts.map(c => `
                            <div class="conflict-item">
                                <strong>${c.name}</strong>
                                <span>${formatDateRange(c.startDate, c.endDate)}</span>
                            </div>
                        `).join('')}
                    </div>
                `
            },
            {
                type: 'widget',
                html: `
                    <div class="ai-suggestions">
                        <h3>AI Suggestions:</h3>
                        ${conflicts.suggestions.map(s => `
                            <div class="suggestion-item">
                                <p>${s.description}</p>
                                <button data-action="${s.action}">${s.actionLabel}</button>
                            </div>
                        `).join('')}
                    </div>
                `
            }
        ],
        buttons: [
            {
                text: 'Auto-Resolve',
                cls: 'b-green',
                onClick: async () => {
                    await detector.autoResolve(conflicts.conflicts, 'smart');
                }
            },
            {
                text: 'Keep Original',
                onClick: () => {
                    // Annuleer de wijziging
                }
            },
            {
                text: 'Manual Edit',
                onClick: () => {
                    calendar.editEvent(conflicts.proposedEvent);
                }
            }
        ]
    });
}
```

---

## Natural Language Interface

### Natural Language Parser

```javascript
// Natural Language Processing voor calendar
class NaturalLanguageCalendarParser {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * Parse natuurlijke taal input naar gestructureerde event data
     */
    async parse(input) {
        const response = await fetch(`${this.apiEndpoint}/parse-nl`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input,
                currentDateTime: new Date().toISOString(),
                locale: navigator.language,
                systemPrompt: `
                    Parse the following scheduling request into structured data.
                    Handle various formats:
                    - "Meeting with John tomorrow at 2pm"
                    - "Schedule a call next Monday 10-11am"
                    - "Block 2 hours for project work on Friday afternoon"
                    - "Remind me to review documents in 3 days"

                    Return JSON:
                    {
                        "eventType": "meeting|call|task|reminder",
                        "title": "string",
                        "startDate": "ISO date",
                        "endDate": "ISO date",
                        "participants": ["names or emails"],
                        "location": "string or null",
                        "isAllDay": boolean,
                        "recurrence": null or { frequency, interval, until },
                        "priority": "low|normal|high",
                        "confidence": 0-1
                    }
                `
            })
        });

        const result = await response.json();
        return this.validateAndEnhance(result);
    }

    validateAndEnhance(parsed) {
        // Zorg voor geldige dates
        const startDate = new Date(parsed.startDate);
        const endDate = new Date(parsed.endDate);

        // Validatie
        if (isNaN(startDate.getTime())) {
            parsed.startDate = new Date();
            parsed.confidence *= 0.5;
        }

        if (isNaN(endDate.getTime()) || endDate <= startDate) {
            // Default: 1 uur meeting
            parsed.endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }

        return parsed;
    }

    /**
     * Genereer beschrijving uit context
     */
    async generateDescription(eventData, additionalContext = '') {
        const response = await fetch(`${this.apiEndpoint}/generate-description`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: eventData,
                context: additionalContext,
                prompt: 'Generate a professional meeting description based on the event data'
            })
        });

        return response.json();
    }
}

// Gebruik in Calendar
const calendar = new Calendar({
    tbar: {
        items: {
            nlInput: {
                type: 'textfield',
                width: 400,
                placeholder: 'Type naturally: "Meeting with Sarah tomorrow 3pm"',
                triggers: {
                    ai: {
                        cls: 'b-fa b-fa-brain',
                        async handler({ source }) {
                            const input = source.value;
                            if (!input.trim()) return;

                            const parser = new NaturalLanguageCalendarParser('/api/ai-calendar');
                            const parsed = await parser.parse(input);

                            if (parsed.confidence > 0.7) {
                                // Hoge confidence: direct event maken
                                const event = this.owner.eventStore.add({
                                    name: parsed.title,
                                    startDate: new Date(parsed.startDate),
                                    endDate: new Date(parsed.endDate),
                                    allDay: parsed.isAllDay
                                })[0];

                                Toast.show({
                                    html: `Created: ${event.name}`,
                                    color: 'success'
                                });
                            } else {
                                // Lage confidence: editor openen voor review
                                this.owner.editEvent({
                                    name: parsed.title || input,
                                    startDate: new Date(parsed.startDate),
                                    endDate: new Date(parsed.endDate)
                                });
                            }

                            source.value = '';
                        }
                    }
                }
            }
        }
    }
});
```

---

## Backend Implementatie

### Node.js AI Calendar Service

```javascript
// server/ai-calendar-service.js
import OpenAI from 'openai';
import express from 'express';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Parse natural language scheduling
app.post('/api/ai-calendar/parse-nl', async (req, res) => {
    const { input, currentDateTime, systemPrompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Current date/time: ${currentDateTime}\n\nScheduling request: "${input}"`
                }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const parsed = JSON.parse(response.choices[0].message.content);
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Find optimal meeting slot
app.post('/api/ai-calendar/find-slot', async (req, res) => {
    const { participants, duration, constraints, context } = req.body;

    const systemPrompt = `
        You are a meeting scheduling assistant. Find the best meeting time slot.

        Consider:
        - Working hours: ${context.workingHours.start}:00 - ${context.workingHours.end}:00
        - Existing events (avoid conflicts)
        - Buffer time between meetings (15 min preferred)
        - Preferred meeting times if specified
        - Time zones

        Return JSON:
        {
            "suggestedSlot": { "startDate": "ISO", "endDate": "ISO" },
            "alternatives": [...],
            "confidence": 0-1,
            "reasoning": "explanation"
        }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `
                        Participants: ${participants.join(', ')}
                        Duration: ${duration} minutes
                        Constraints: ${JSON.stringify(constraints)}
                        Existing events: ${JSON.stringify(context.existingEvents)}
                    `
                }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analyze conflicts
app.post('/api/ai-calendar/analyze-conflicts', async (req, res) => {
    const { proposedEvent, conflicts } = req.body;

    const systemPrompt = `
        Analyze scheduling conflicts and provide resolution suggestions.

        Consider event priorities, meeting types, and participant importance.

        Return JSON:
        {
            "severity": "low|medium|high|critical",
            "suggestions": [
                { "action": "move|shorten|cancel|keep", "target": "event_id", "description": "..." }
            ],
            "canAutoResolve": boolean,
            "recommendation": "best action to take"
        }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `
                        Proposed event: ${JSON.stringify(proposedEvent)}
                        Conflicting events: ${JSON.stringify(conflicts)}
                    `
                }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

---

## Use Cases

### Use Case 1: Smart Meeting Scheduling

```javascript
// Voorbeeld: AI-gestuurde vergaderplanning
async function scheduleTeamMeeting(calendar) {
    const dialog = new Dialog({
        title: 'Schedule AI-Optimized Meeting',
        items: [
            {
                type: 'textfield',
                ref: 'title',
                label: 'Meeting Title',
                placeholder: 'Weekly Standup'
            },
            {
                type: 'combo',
                ref: 'participants',
                label: 'Participants',
                multiSelect: true,
                store: calendar.resourceStore
            },
            {
                type: 'numberfield',
                ref: 'duration',
                label: 'Duration (minutes)',
                value: 60,
                min: 15,
                step: 15
            },
            {
                type: 'checkbox',
                ref: 'recurring',
                label: 'Make recurring'
            }
        ],
        buttons: [{
            text: 'Find Best Time',
            cls: 'b-green',
            async onClick() {
                const values = this.up('dialog').values;
                const scheduler = new AICalendarScheduler(calendar, {
                    apiEndpoint: '/api/ai-calendar'
                });

                const slot = await scheduler.findOptimalSlot(
                    values.participants,
                    values.duration
                );

                if (slot) {
                    calendar.eventStore.add({
                        name: values.title,
                        startDate: slot.startDate,
                        endDate: slot.endDate,
                        resourceId: values.participants[0]
                    });

                    Toast.show({
                        html: `Scheduled for ${formatDate(slot.startDate)}`,
                        color: 'success'
                    });
                }

                this.up('dialog').close();
            }
        }]
    });

    dialog.show();
}
```

### Use Case 2: Batch Schedule Optimization

```javascript
// Optimaliseer een hele week aan meetings
async function optimizeWeekSchedule(calendar) {
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    const weekEvents = calendar.eventStore.records.filter(e =>
        e.startDate >= startOfWeek && e.startDate < endOfWeek
    );

    const response = await fetch('/api/ai-calendar/optimize-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            events: weekEvents.map(e => ({
                id: e.id,
                name: e.name,
                start: e.startDate,
                end: e.endDate,
                priority: e.priority,
                participants: e.participants,
                isMovable: e.isMovable !== false
            })),
            preferences: {
                focusTimeBlocks: true,
                groupSimilarMeetings: true,
                minimizeContextSwitching: true
            }
        })
    });

    const optimized = await response.json();

    // Toon preview
    showOptimizationPreview(calendar, optimized);
}
```

### Use Case 3: Availability Check

```javascript
// Check team beschikbaarheid met AI
async function findTeamAvailability(calendar, teamMembers, duration) {
    const scheduler = new AICalendarScheduler(calendar, {
        apiEndpoint: '/api/ai-calendar'
    });

    // Haal beschikbaarheid op
    const slots = await scheduler.findOptimalSlot(
        teamMembers,
        duration,
        {
            minParticipants: Math.ceil(teamMembers.length * 0.8), // 80% aanwezig
            preferredDays: ['tuesday', 'wednesday', 'thursday'],
            excludeTimeRanges: [
                { start: '12:00', end: '13:00' } // Lunch uitsluiten
            ]
        }
    );

    // Render beschikbaarheidsgrid
    renderAvailabilityGrid(calendar, teamMembers, slots);
}
```

---

## Integratie Patronen

### Pattern: AI Event Suggestions

```javascript
// Suggereer events gebaseerd op patronen
const calendar = new Calendar({
    listeners: {
        dateChange({ date }) {
            // Check voor AI suggesties bij datum change
            this.fetchAISuggestions(date);
        }
    },

    async fetchAISuggestions(date) {
        const response = await fetch('/api/ai-calendar/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: date.toISOString(),
                history: this.getRecentEventHistory(),
                patterns: this.getUserPatterns()
            })
        });

        const suggestions = await response.json();

        if (suggestions.length > 0) {
            this.showSuggestionPanel(suggestions);
        }
    },

    getRecentEventHistory() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return this.eventStore.records
            .filter(e => e.startDate >= thirtyDaysAgo)
            .map(e => ({
                name: e.name,
                dayOfWeek: e.startDate.getDay(),
                hour: e.startDate.getHours(),
                duration: e.duration,
                isRecurring: e.isRecurring
            }));
    }
});
```

---

## Gerelateerde Documentatie

- [CALENDAR-IMPL-RECURRENCE.md](./CALENDAR-IMPL-RECURRENCE.md) - Recurring events
- [CALENDAR-DEEP-DIVE-SCHEDULING.md](./CALENDAR-DEEP-DIVE-SCHEDULING.md) - Scheduling details
- [AI-GANTT-SCHEDULING.md](./AI-GANTT-SCHEDULING.md) - Gantt AI integratie
- [IMPL-WEBSOCKET-SYNC.md](./IMPL-WEBSOCKET-SYNC.md) - Real-time sync

---

*Gegenereerd op basis van Bryntum Calendar 7.1.0 trial*
*AI features vereisen backend implementatie*
