# SchedulerPro Implementation: Skill Matching

> **Implementatie guide** voor competency-based scheduling in Bryntum SchedulerPro: skill matching tussen resources en taken, validatie, visuele feedback, en auto-scheduling.

---

## Overzicht

Skill matching maakt het mogelijk om taken alleen toe te wijzen aan resources die over de vereiste vaardigheden beschikken:

- **Skill Store** - Centrale registratie van alle beschikbare skills
- **Resource Skills** - Skills per resource (technician/medewerker)
- **Task Skills** - Vereiste skills per taak
- **Drag Validation** - Real-time validatie tijdens drag & drop
- **Visual Feedback** - Highlighting van beschikbare resources
- **Auto-Schedule** - Automatische toewijzing op basis van skills

---

## 1. Data Model

### 1.1 Skill Model

```javascript
import { Model } from '@bryntum/schedulerpro';

class Skill extends Model {
    static fields = [
        'name',
        'category',        // Optioneel: groepering
        'level'            // Optioneel: skill niveau
    ];
}
```

### 1.2 Resource Model met Skills

```javascript
import { ResourceModel, DateHelper } from '@bryntum/schedulerpro';

class Technician extends ResourceModel {
    static fields = [
        // Array van skill IDs die deze resource bezit
        { name: 'skills', type: 'array' },
        'type',                                    // Categorisatie
        { name: 'hoursPerWeek', defaultValue: 40 } // Beschikbaarheid
    ];

    // Controleer of resource een taak kan uitvoeren
    canPerformTask(taskRecord, startDate) {
        const { skills: requiredSkills } = taskRecord;

        // Controleer of alle vereiste skills aanwezig zijn
        const skillsMatch = !requiredSkills ||
            requiredSkills.every(skillId => this.skills?.includes(skillId));

        if (!skillsMatch) return false;

        // Optioneel: controleer beschikbaarheid
        if (startDate) {
            const endDate = DateHelper.add(startDate, taskRecord.duration, taskRecord.durationUnit);
            const calendar = this.effectiveCalendar;

            if (calendar && !calendar.isWorkingTime(startDate, endDate, true)) {
                return false;
            }
        }

        return true;
    }

    // Haal skill namen op voor display
    get skillNames() {
        const skillStore = this.project.getCrudStore('skills');
        return this.skills?.map(id => skillStore.getById(id)?.name) || [];
    }

    // Bereken geboekte uren in periode
    getBookedHours(startDate, endDate) {
        let total = 0;
        this.events.forEach(event => {
            if (DateHelper.intersectSpans(event.startDate, event.endDate, startDate, endDate)) {
                total += event.duration;
            }
        });
        return total;
    }

    // Vind eerste beschikbare tijdslot
    getFirstAvailableTimeSlot(date, taskRecord) {
        date = DateHelper.clearTime(date);

        const availabilityRange = this.effectiveCalendar
            .getWorkingTimeRanges(date, DateHelper.add(date, 1, 'day'))[0];

        if (!availabilityRange) return null;

        const eventsOnDate = this.events.filter(e =>
            DateHelper.intersectSpans(date, DateHelper.add(date, 1, 'day'), e.startDate, e.endDate)
        );

        const nextStartSlot = eventsOnDate.length > 0
            ? eventsOnDate[eventsOnDate.length - 1].endDate
            : availabilityRange.startDate;

        const remainingTime = availabilityRange.endDate - nextStartSlot;

        if (remainingTime >= taskRecord.durationMS) {
            return nextStartSlot;
        }

        return null;
    }
}
```

### 1.3 Task Model met Required Skills

```javascript
import { EventModel } from '@bryntum/schedulerpro';

class Task extends EventModel {
    static fields = [
        { name: 'iconCls', defaultValue: 'fa fa-wrench' },
        { name: 'licensePlate', defaultValue: '' },         // Domain-specific
        { name: 'skills', type: 'array' },                  // Vereiste skill IDs
        { name: 'duration', defaultValue: 1 },
        { name: 'durationUnit', defaultValue: 'h' }
    ];

    // Haal skill records op
    get requiredSkillRecords() {
        const skillStore = this.firstStore.crudManager.getCrudStore('skills');
        return this.skills?.map(id => skillStore.getById(id)).filter(Boolean) || [];
    }

    // Haal skill namen op
    get requiredSkillNames() {
        return this.requiredSkillRecords.map(skill => skill.name);
    }
}
```

---

## 2. Project Configuration

### 2.1 CrudManager met Custom Stores

```javascript
const scheduler = new SchedulerPro({
    project: {
        autoLoad: true,
        loadUrl: 'data/data.json',

        // Custom model classes
        resourceStore: {
            modelClass: Technician,
            sorters: [{ field: 'name', ascending: true }]
        },
        eventStore: {
            modelClass: Task
        },

        // Extra CRUD stores voor skills en unplanned taken
        crudStores: [
            {
                id: 'skills',
                modelClass: Skill
            },
            {
                id: 'unplanned',
                modelClass: Task,
                reapplySortersOnAdd: true
            }
        ]
    }
});
```

### 2.2 Data Structure

```json
{
    "success": true,
    "project": {
        "calendar": "workweek"
    },
    "calendars": {
        "rows": [
            {
                "id": "dayshift",
                "name": "Day shift",
                "unspecifiedTimeIsWorking": false,
                "intervals": [
                    {
                        "name": "Available",
                        "recurrentStartDate": "every weekday at 08:00",
                        "recurrentEndDate": "every weekday at 18:00",
                        "isWorking": true
                    }
                ]
            }
        ]
    },
    "skills": {
        "rows": [
            { "id": 1, "name": "Diagnostics" },
            { "id": 2, "name": "Electrical" },
            { "id": 3, "name": "Brakes" },
            { "id": 4, "name": "Suspension" },
            { "id": 5, "name": "Engine" }
        ]
    },
    "resources": {
        "rows": [
            {
                "id": 1,
                "name": "Jacob Washington",
                "role": "Automotive Technician",
                "calendar": "dayshift",
                "type": "Technicians",
                "skills": [4, 5],
                "hoursPerWeek": 40
            }
        ]
    },
    "events": {
        "rows": [
            {
                "id": 1,
                "resourceId": 1,
                "name": "Maintenance service",
                "duration": 7,
                "licensePlate": "SAN7202A",
                "skills": [4, 5],
                "startDate": "2024-11-04T08:00:00"
            }
        ]
    },
    "unplanned": {
        "rows": [
            {
                "id": 101,
                "name": "Scheduled maintenance",
                "duration": 6,
                "licensePlate": "XNZ930",
                "skills": [1, 2]
            }
        ]
    }
}
```

---

## 3. Drag Validation

### 3.1 EventDrag Validator

```javascript
features: {
    eventDrag: {
        // Validatie tijdens drag
        validatorFn({ eventRecords, newResource, startDate }) {
            const task = eventRecords[0];
            const valid = newResource.canPerformTask(task, startDate);

            return valid;
        },

        // Custom tooltip template
        tooltipTemplate: ({ eventRecord, startDate, newResource }) => {
            const firstAvailableSlot = newResource.isSpecialRow
                ? null
                : newResource.getFirstAvailableTimeSlot(startDate, eventRecord);

            return `
                <div class="b-tooltip-section">
                    <strong><i class="b-icon fa-calendar-days"></i> Schedule on</strong>
                    ${DateHelper.format(startDate, 'MMM DD')}
                </div>
                <div class="b-tooltip-section">
                    <strong><i class="fa fa-tools"></i> Required skills</strong>
                    <ul class="skills">
                        ${eventRecord.requiredSkillRecords.map(skill => `
                            <li>
                                <i class="b-icon fa-${newResource.skills?.includes(skill.id) ? 'check' : 'xmark'}"></i>
                                ${skill.name}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="b-tooltip-section">
                    <strong><i class="b-icon fa-clock"></i> Resource availability</strong>
                    <i class="b-icon fa-${firstAvailableSlot ? 'check' : 'xmark'}"></i>
                    ${firstAvailableSlot ? DateHelper.format(firstAvailableSlot, 'LST') : 'No availability'}
                </div>
            `;
        }
    }
}
```

---

## 4. Calendar Highlighting

### 4.1 Highlight Available Resources

```javascript
features: {
    calendarHighlight: {
        calendar: 'resource',
        inflate: {
            x: -8,
            y: -1
        },

        // Filter welke resources gehighlight worden
        collectAvailableResources({ scheduler, eventRecords }) {
            return scheduler.resourceStore.query(
                technician => technician.canPerformTask(eventRecords[0])
            );
        }
    }
}

// Verberg highlights op dagen waar al events zijn
onBeforeRenderCalendarHighlights(event) {
    const { events, highlights } = event;

    if (events.length) {
        event.highlights = highlights.filter(h =>
            !events.some(e => DateHelper.isEqual(e.startDate, h.startDate, 'day'))
        );
    }
}
```

---

## 5. External Drag (Unplanned Grid)

### 5.1 Custom DragHelper

```javascript
import { DragHelper, StringHelper, DomHelper } from '@bryntum/schedulerpro';

class SkillDrag extends DragHelper {
    static configurable = {
        callOnFunctions: true,
        autoSizeClonedTarget: false,
        unifiedProxy: true,
        removeProxyAfterDrop: false,
        cloneTarget: true,

        // Drop targets
        dropTargetSelector: '.b-timeline-sub-grid .b-grid-row:not(.b-group-row),.b-sch-event-wrap',
        targetSelector: '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct() {
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement) {
        const { schedule, grid } = this;
        const task = grid.getRecordFromElement(grabbedElement);
        const proxy = document.createElement('div');

        proxy.style.width = schedule.tickSize - (2 * schedule.resourceMargin) + 'px';
        proxy.style.height = schedule.rowHeight - (2 * schedule.resourceMargin) + 'px';
        proxy.classList.add('b-sch-event-wrap', 'b-style-tonal', 'b-sch-horizontal', 'b-colorized');

        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-with-icon">
                <div class="b-sch-event-content">
                    <i class="b-icon b-${task.iconCls}"></i>
                    <div>
                        <div>${task.name}</div>
                    </div>
                </div>
            </div>
        `;

        return proxy;
    }

    onDragStart({ context }) {
        const { schedule, grid } = this;
        context.task = grid.selectedRecord;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ context }) {
        const { schedule } = this;
        const { task } = context;
        const newStartDate = schedule.getDateFromCoordinate(context.newX, 'round', false);
        const technician = context.target && schedule.resolveResourceRecord(context.target);

        if (!technician) return;

        // Skill-based validatie
        context.valid = newStartDate && technician.canPerformTask(task, newStartDate);
        context.technician = technician;
    }

    async onDrop({ context }) {
        const { schedule, grid } = this;

        if (context.valid) {
            const { task, element, technician } = context;
            const coordinate = DomHelper.getTranslateX(element) + (element.offsetWidth / 2);
            const dropDate = schedule.getDateFromCoordinate(coordinate, 'round', false);
            const firstAvailableSlot = technician.getFirstAvailableTimeSlot(dropDate, task);

            if (firstAvailableSlot) {
                await schedule.scheduleEvent({
                    eventRecord: task,
                    startDate: firstAvailableSlot,
                    resourceRecord: technician,
                    element
                });

                // Verwijder uit unplanned store
                grid.store.remove(task);
            } else {
                context.valid = false;
            }
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }
}
```

### 5.2 Unplanned Grid

```javascript
import { Grid, StringHelper } from '@bryntum/schedulerpro';

class UnplannedGrid extends Grid {
    static $name = 'UnplannedGrid';

    static configurable = {
        hideHeaders: true,
        rowHeight: 65,
        disableGridRowModelWarning: true,
        collapsible: true,
        flex: '0 0 320px',
        ui: 'toolbar',
        title: 'Unplanned tasks',
        emptyText: 'No unplanned tasks',

        selectionMode: {
            multiSelect: false
        },

        features: {
            stripe: true,
            sort: 'name'
        },

        columns: [
            {
                flex: 1,
                field: 'name',
                cellCls: 'unscheduledNameCell',
                htmlEncode: false,
                renderer: ({ record: task }) => `
                    <div class="vehicle-ct">
                        <i class="${StringHelper.encodeHtml(task.iconCls) || ''}"></i>
                        <span class="licensePlate">${StringHelper.encodeHtml(task.licensePlate)}</span>
                    </div>
                    <div class="name-container">
                        <div class="main-info">
                            <span class="task-name">${StringHelper.encodeHtml(task.name)}</span>
                        </div>
                        <div class="meta-info">
                            <ul class="skills">
                                ${task.requiredSkillNames.map(skill => `<li>${skill}</li>`).join('')}
                            </ul>
                            <span class="duration">${task.duration}h</span>
                        </div>
                    </div>
                `
            }
        ]
    };
}
```

---

## 6. Auto-Schedule Algorithm

### 6.1 Basic Implementation

```javascript
async onAutoScheduleClick() {
    const unplannedStore = this.project.getCrudStore('unplanned');

    this.suspendRefresh();

    // Loop door alle unplanned taken
    for (let i = unplannedStore.count - 1; i >= 0; --i) {
        const eventRecord = unplannedStore.getAt(i);

        // Zoek een geschikte resource
        this.resourceStore.forEach(technician => {
            // Check beschikbare uren
            const bookedHours = technician.getBookedHours(this.startDate, this.endDate);
            if (technician.hoursPerWeek - bookedHours < eventRecord.duration) {
                return; // Skip, niet genoeg uren
            }

            // Zoek eerste beschikbare dag
            this.timeAxis.forEach(({ startDate }) => {
                startDate = technician.getFirstAvailableTimeSlot(startDate, eventRecord);

                if (startDate && technician.canPerformTask(eventRecord, startDate)) {
                    eventRecord.remove();

                    this.scheduleEvent({
                        eventRecord,
                        startDate,
                        resourceRecord: technician
                    });

                    return false; // Stop zoeken
                }
            });

            return eventRecord.resources.length === 0; // Ga door als nog niet toegewezen
        }, undefined, { includeCollapsedGroupRecords: true });

        await this.project.commitAsync();
    }

    this.resumeRefresh();
}
```

### 6.2 Priority-based Algorithm

```javascript
async autoScheduleWithPriority() {
    const unplannedStore = this.project.getCrudStore('unplanned');

    // Sorteer op prioriteit (hoogste eerst)
    const sortedTasks = unplannedStore.records
        .slice()
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.suspendRefresh();

    for (const task of sortedTasks) {
        // Vind beste resource (minst bezet, skills match)
        const bestResource = this.findBestResourceForTask(task);

        if (bestResource) {
            const slot = bestResource.getFirstAvailableTimeSlot(this.startDate, task);

            if (slot) {
                task.remove();
                await this.scheduleEvent({
                    eventRecord: task,
                    startDate: slot,
                    resourceRecord: bestResource
                });
            }
        }
    }

    await this.project.commitAsync();
    this.resumeRefresh();
}

findBestResourceForTask(task) {
    let bestResource = null;
    let minWorkload = Infinity;

    this.resourceStore.forEach(resource => {
        if (!resource.canPerformTask(task)) return;

        const workload = resource.getBookedHours(this.startDate, this.endDate);
        const hasCapacity = resource.hoursPerWeek - workload >= task.duration;

        if (hasCapacity && workload < minWorkload) {
            minWorkload = workload;
            bestResource = resource;
        }
    });

    return bestResource;
}
```

---

## 7. Resource Column met Skills

### 7.1 Custom ResourceInfo Column

```javascript
columns: [
    {
        type: 'resourceInfo',
        text: 'Staff',
        width: 300,
        showEventCount: false,

        // Toon skills en workload
        showMeta(resourceRecord) {
            const { skillNames } = resourceRecord;
            const { startDate, endDate } = this.grid;
            const bookedHours = resourceRecord.getBookedHours(startDate, endDate);
            const overAllocated = bookedHours > resourceRecord.hoursPerWeek;

            return `
                <ul class="skills">
                    ${skillNames.map(skill => `<li>${StringHelper.encodeHtml(skill)}</li>`).join('')}
                </ul>
                <div data-btip="${bookedHours}h / ${resourceRecord.hoursPerWeek}h allocated">
                    <i class="fa ${overAllocated ? 'fa-triangle-exclamation' : 'fa-clock'}"></i>
                    ${bookedHours} / ${resourceRecord.hoursPerWeek}
                </div>
            `;
        },

        filterable: {
            filterField: {
                triggers: {
                    search: { cls: 'b-icon fa-filter' }
                },
                placeholder: 'Filter staff'
            }
        }
    }
]
```

---

## 8. Task Editor met Skills

### 8.1 TaskEdit Configuration

```javascript
features: {
    taskEdit: {
        editorConfig: {
            title: 'Task'
        },

        items: {
            generalTab: {
                items: {
                    resourcesField: {
                        label: 'Technician'
                    },
                    effortField: false,

                    // Custom vehicle field
                    vehicleField: {
                        type: 'text',
                        name: 'licensePlate',
                        label: 'Vehicle',
                        weight: 150
                    },

                    // Skills multiselect combo
                    skillField: {
                        type: 'combo',
                        multiSelect: true,
                        idField: 'id',
                        displayField: 'name',
                        label: 'Required Skills',
                        name: 'skills',
                        weight: 160
                    }
                }
            }
        }
    }
}

// Populate skills combo on construct
construct() {
    super.construct(...arguments);

    // Link skills store to combo
    this.features.taskEdit.items.generalTab.items.skillField.store =
        this.project.getCrudStore('skills');
}

// Make vehicle field read-only for existing events
onBeforeEventEditShow({ editor, eventRecord }) {
    editor.widgetMap.vehicleField.readOnly = !eventRecord.isCreating;
}
```

---

## 9. Unassign via Context Menu

### 9.1 Event Menu Configuration

```javascript
features: {
    eventMenu: {
        items: {
            splitEvent: false,

            unassign: {
                icon: 'fa fa-calendar-xmark',
                text: 'Move to unplanned list',

                onItem({ eventRecord }) {
                    const { project } = eventRecord;

                    // Remove from scheduled events
                    eventRecord.remove();

                    // Add to unplanned store
                    project.getCrudStore('unplanned').add(eventRecord);
                }
            }
        }
    }
}
```

---

## 10. TypeScript Interfaces

```typescript
import { Model, EventModel, ResourceModel, DragHelper } from '@bryntum/schedulerpro';

// Skill Model
interface SkillData {
    id: string | number;
    name: string;
    category?: string;
    level?: number;
}

// Technician (Resource) Model
interface TechnicianData {
    id: string | number;
    name: string;
    skills: (string | number)[];
    type?: string;
    hoursPerWeek?: number;
    calendar?: string;
}

interface Technician extends ResourceModel {
    skills: (string | number)[];
    hoursPerWeek: number;
    skillNames: string[];

    canPerformTask(task: Task, startDate?: Date): boolean;
    getBookedHours(startDate: Date, endDate: Date): number;
    getFirstAvailableTimeSlot(date: Date, task: Task): Date | null;
}

// Task (Event) Model
interface TaskData {
    id: string | number;
    name: string;
    skills: (string | number)[];
    duration: number;
    durationUnit?: string;
    licensePlate?: string;
    iconCls?: string;
}

interface Task extends EventModel {
    skills: (string | number)[];
    licensePlate: string;
    requiredSkillRecords: Model[];
    requiredSkillNames: string[];
}

// Drag Helper Config
interface SkillDragConfig {
    grid: Grid;
    schedule: SchedulerPro;
    outerElement: HTMLElement;
}

// Auto-Schedule Options
interface AutoScheduleOptions {
    prioritize?: boolean;
    balanceWorkload?: boolean;
    respectCalendars?: boolean;
}
```

---

## 11. Complete Example

```javascript
import {
    SchedulerPro, Grid, DragHelper, Model, EventModel, ResourceModel,
    DateHelper, StringHelper, DomHelper
} from '@bryntum/schedulerpro';

// Models
class Skill extends Model {
    static fields = ['name'];
}

class Task extends EventModel {
    static fields = [
        { name: 'skills', type: 'array' },
        { name: 'duration', defaultValue: 1 },
        { name: 'durationUnit', defaultValue: 'h' },
        { name: 'iconCls', defaultValue: 'fa fa-wrench' }
    ];

    get requiredSkillRecords() {
        const skillStore = this.firstStore.crudManager.getCrudStore('skills');
        return this.skills?.map(id => skillStore.getById(id)).filter(Boolean) || [];
    }

    get requiredSkillNames() {
        return this.requiredSkillRecords.map(s => s.name);
    }
}

class Technician extends ResourceModel {
    static fields = [
        { name: 'skills', type: 'array' },
        { name: 'hoursPerWeek', defaultValue: 40 }
    ];

    canPerformTask(task, startDate) {
        const skillsMatch = !task.skills ||
            task.skills.every(id => this.skills?.includes(id));

        if (!skillsMatch) return false;

        if (startDate) {
            return Boolean(this.getFirstAvailableTimeSlot(startDate, task));
        }

        return true;
    }

    get skillNames() {
        const store = this.project.getCrudStore('skills');
        return this.skills?.map(id => store.getById(id)?.name).filter(Boolean) || [];
    }

    getBookedHours(startDate, endDate) {
        return this.events.reduce((total, e) => {
            if (DateHelper.intersectSpans(e.startDate, e.endDate, startDate, endDate)) {
                return total + e.duration;
            }
            return total;
        }, 0);
    }

    getFirstAvailableTimeSlot(date, task) {
        date = DateHelper.clearTime(date);
        const ranges = this.effectiveCalendar.getWorkingTimeRanges(
            date, DateHelper.add(date, 1, 'day')
        );

        if (!ranges.length) return null;

        const range = ranges[0];
        const events = this.events.filter(e =>
            DateHelper.intersectSpans(date, DateHelper.add(date, 1, 'day'), e.startDate, e.endDate)
        );

        const nextSlot = events.length
            ? events[events.length - 1].endDate
            : range.startDate;

        if (range.endDate - nextSlot >= task.durationMS) {
            return nextSlot;
        }

        return null;
    }
}

// Drag Helper
class SkillDrag extends DragHelper {
    static configurable = {
        cloneTarget: true,
        removeProxyAfterDrop: false,
        dropTargetSelector: '.b-timeline-sub-grid .b-grid-row',
        targetSelector: '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct() {
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(el) {
        const task = this.grid.getRecordFromElement(el);
        const proxy = document.createElement('div');
        proxy.classList.add('b-sch-event-wrap');
        proxy.innerHTML = `<div class="b-sch-event">${task.name}</div>`;
        proxy.style.width = '100px';
        proxy.style.height = '30px';
        return proxy;
    }

    onDragStart({ context }) {
        context.task = this.grid.selectedRecord;
        this.schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ context }) {
        const date = this.schedule.getDateFromCoordinate(context.newX, 'round');
        const resource = this.schedule.resolveResourceRecord(context.target);
        context.valid = date && resource?.canPerformTask(context.task, date);
        context.resource = resource;
        context.startDate = date;
    }

    async onDrop({ context }) {
        if (context.valid) {
            const slot = context.resource.getFirstAvailableTimeSlot(
                context.startDate, context.task
            );

            if (slot) {
                await this.schedule.scheduleEvent({
                    eventRecord: context.task,
                    startDate: slot,
                    resourceRecord: context.resource
                });
                this.grid.store.remove(context.task);
            }
        }
        this.schedule.features.eventTooltip.disabled = false;
    }
}

// Scheduler
const scheduler = new SchedulerPro({
    appendTo: 'scheduler',
    startDate: new Date(2024, 10, 4),
    endDate: new Date(2024, 10, 9),
    rowHeight: 65,

    features: {
        eventDrag: {
            validatorFn({ eventRecords, newResource, startDate }) {
                return newResource.canPerformTask(eventRecords[0], startDate);
            }
        },
        calendarHighlight: {
            calendar: 'resource',
            collectAvailableResources({ scheduler, eventRecords }) {
                return scheduler.resourceStore.query(
                    r => r.canPerformTask(eventRecords[0])
                );
            }
        }
    },

    project: {
        autoLoad: true,
        loadUrl: 'data/data.json',
        resourceStore: { modelClass: Technician },
        eventStore: { modelClass: Task },
        crudStores: [
            { id: 'skills', modelClass: Skill },
            { id: 'unplanned', modelClass: Task }
        ]
    },

    columns: [
        {
            type: 'resourceInfo',
            text: 'Staff',
            width: 300,
            showMeta: r => `<ul class="skills">${r.skillNames.map(s => `<li>${s}</li>`).join('')}</ul>`
        }
    ]
});

// Unplanned Grid
const unplannedGrid = new Grid({
    appendTo: 'unplanned',
    store: scheduler.project.getCrudStore('unplanned'),
    columns: [
        {
            flex: 1,
            field: 'name',
            renderer: ({ record }) => `
                <div>${record.name}</div>
                <small>${record.requiredSkillNames.join(', ')}</small>
            `
        }
    ],
    listeners: {
        selectionChange() {
            scheduler.highlightResourceCalendarsForEventRecords(this.selectedRecords);
        }
    }
});

// External Drag
new SkillDrag({
    grid: unplannedGrid,
    schedule: scheduler,
    outerElement: unplannedGrid.element
});
```

---

## Referenties

- Examples: `schedulerpro-7.1.0-trial/examples/skill-matching/`
- Examples: `schedulerpro-7.1.0-trial/examples/ai-skillmatching/`
- TypeScript: `schedulerpro.d.ts` (ResourceModel, EventModel)
- Guide: Bryntum SchedulerPro Calendar Highlight

---

*Document gegenereerd: December 2024*
*Bryntum SchedulerPro versie: 7.1.0*
