# CALENDAR-IMPL: Framework Integratie (React/Vue/Angular)

> **Level 2** - Diepgaande gids voor het integreren van Bryntum Calendar in moderne JavaScript frameworks.

---

## Inhoudsopgave

1. [Overzicht Framework Wrappers](#1-overzicht-framework-wrappers)
2. [React Integratie](#2-react-integratie)
3. [Vue 3 Integratie](#3-vue-3-integratie)
4. [Angular Integratie](#4-angular-integratie)
5. [Ionic/Mobiel](#5-ionicmobiel)
6. [Gedeelde Patronen](#6-gedeelde-patronen)
7. [Thin Bundles & Tree Shaking](#7-thin-bundles--tree-shaking)
8. [Multi-Product Integratie](#8-multi-product-integratie)
9. [Data Binding Patronen](#9-data-binding-patronen)
10. [Performance Optimalisatie](#10-performance-optimalisatie)
11. [Troubleshooting](#11-troubleshooting)
12. [Cross-References](#12-cross-references)

---

## 1. Overzicht Framework Wrappers

### 1.1 Beschikbare Packages

| Framework | Package | Minimum Versie | Aanbevolen |
|-----------|---------|----------------|------------|
| React | `@bryntum/calendar-react` | React 16.0.0 | React 18.0.0+ |
| React (thin) | `@bryntum/calendar-react-thin` | React 16.0.0 | React 18.0.0+ |
| Vue 3 | `@bryntum/calendar-vue-3` | Vue 3.0.0 | Vue 3.0.0+ |
| Angular | `@bryntum/calendar-angular` | Angular 12+ (IVY) | Angular 12.0.0+ |
| Angular (legacy) | `@bryntum/calendar-angular-view` | Angular 9-11 | - |
| Ionic | `@bryntum/calendar-angular` | Ionic 5+ | Ionic 6+ |

### 1.2 Package Structuur

```
@bryntum/calendar-react/
├── BryntumCalendar.js           # Hoofdwrapper component
├── BryntumCalendarProjectModel.js
├── BryntumAgendaView.js
├── BryntumDayView.js
├── BryntumWeekView.js
├── BryntumMonthView.js
├── BryntumYearView.js
├── BryntumResourceView.js
├── ... (60+ widget wrappers)
└── index.d.ts                   # TypeScript definities
```

### 1.3 Wrapper Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                    React/Vue/Angular Component                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Framework Wrapper Layer                      │   │
│  │  - Props → Bryntum Config mapping                        │   │
│  │  - Events → Framework event emission                     │   │
│  │  - Refs → Native instance access                         │   │
│  │  - Lifecycle sync                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Native Bryntum Calendar                      │   │
│  │  - EventStore, ResourceStore                             │   │
│  │  - Views (Day, Week, Month, Year, Agenda)                │   │
│  │  - Features (Drag, Edit, Tooltip, etc.)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. React Integratie

### 2.1 Basis Setup

**Installatie:**
```bash
npm install @bryntum/calendar @bryntum/calendar-react
```

**App.tsx:**
```typescript
import React, { useRef, useEffect, FunctionComponent } from 'react';
import { BryntumCalendar } from '@bryntum/calendar-react';
import { Calendar } from '@bryntum/calendar';
import { calendarProps } from './AppConfig';

// CSS imports
import '@bryntum/calendar/calendar.css';
import '@bryntum/calendar/stockholm-light.css';

const App: FunctionComponent = () => {
    const calendarRef = useRef<BryntumCalendar>(null);

    // Toegang tot native instance
    const calendarInstance = (): Calendar | undefined =>
        calendarRef.current?.instance;

    useEffect(() => {
        // Data laden na mount
        calendarInstance()?.crudManager.load();
    }, []);

    return (
        <BryntumCalendar
            ref={calendarRef}
            {...calendarProps}
        />
    );
};

export default App;
```

**AppConfig.ts:**
```typescript
import { BryntumCalendarProps } from '@bryntum/calendar-react';

export const calendarProps: BryntumCalendarProps = {
    date: new Date(2024, 11, 15),

    // CrudManager voor data loading
    crudManager: {
        autoLoad: true,
        transport: {
            load: {
                url: '/api/calendar/load'
            },
            sync: {
                url: '/api/calendar/sync'
            }
        }
    },

    // View configuratie
    modes: {
        day: true,
        week: true,
        month: true,
        year: true,
        agenda: {
            range: '1 month'
        }
    },

    // Features
    eventTooltipFeature: {
        align: 'l-r'
    },

    eventEditFeature: {
        items: {
            resourceField: {
                weight: 200
            }
        }
    }
};
```

### 2.2 React Hooks Patronen

**Custom Hook voor Calendar State:**
```typescript
import { useRef, useCallback, useState } from 'react';
import { BryntumCalendar } from '@bryntum/calendar-react';
import { Calendar, EventModel } from '@bryntum/calendar';

export function useCalendar() {
    const calendarRef = useRef<BryntumCalendar>(null);
    const [mode, setMode] = useState<string>('week');

    const getInstance = useCallback((): Calendar | undefined => {
        return calendarRef.current?.instance;
    }, []);

    const navigateToDate = useCallback((date: Date) => {
        getInstance()?.date = date;
    }, [getInstance]);

    const getSelectedEvent = useCallback((): EventModel | null => {
        return getInstance()?.selectedEvent ?? null;
    }, [getInstance]);

    const refreshData = useCallback(async () => {
        await getInstance()?.crudManager.load();
    }, [getInstance]);

    return {
        calendarRef,
        getInstance,
        mode,
        setMode,
        navigateToDate,
        getSelectedEvent,
        refreshData
    };
}
```

### 2.3 JSX Rendering in Events

**Custom Event Renderer met React Components:**
```typescript
import { StringHelper } from '@bryntum/calendar';

// Custom Event Renderer Component
const EventContent: React.FC<{ event: EventModel }> = ({ event }) => (
    <div className="custom-event">
        <i className={`b-icon ${event.iconCls}`} />
        <span className="event-name">
            {StringHelper.encodeHtml(event.name)}
        </span>
        <span className="event-time">
            {event.startDate.toLocaleTimeString()}
        </span>
    </div>
);

// Config met JSX renderer
export const calendarProps: BryntumCalendarProps = {
    eventRenderer: ({ eventRecord }) => (
        <EventContent event={eventRecord} />
    ),

    // Tooltip met React component
    eventTooltipFeature: {
        template: (data) => (
            <div className="custom-tooltip">
                <h3>{data.eventRecord.name}</h3>
                <p>{data.startText} → {data.endText}</p>
                <CustomTooltipContent data={data} />
            </div>
        )
    }
};
```

### 2.4 Next.js Specifieke Setup

**Dynamic Import (SSR uitschakelen):**
```typescript
// components/CalendarWrapper.tsx
import { BryntumCalendar } from '@bryntum/calendar-react';

export default function CalendarWrapper({ calendarRef, ...props }) {
    return <BryntumCalendar {...props} ref={calendarRef} />;
}

// pages/calendar.tsx
import dynamic from 'next/dynamic';
import { useRef } from 'react';

const Calendar = dynamic(
    () => import('../components/CalendarWrapper'),
    { ssr: false }
);

export default function CalendarPage() {
    const calendarRef = useRef();

    return (
        <Calendar
            calendarRef={calendarRef}
            // ... props
        />
    );
}
```

### 2.5 React Vite Setup (Aanbevolen)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['@bryntum/calendar', '@bryntum/calendar-react']
    }
});
```

---

## 3. Vue 3 Integratie

### 3.1 Basis Setup

**Installatie:**
```bash
npm install @bryntum/calendar @bryntum/calendar-vue-3
```

**App.vue:**
```vue
<template>
    <div class="calendar-container">
        <bryntum-calendar
            ref="calendar"
            v-bind="calendarConfig"
            :mode="currentMode"
            @active-item-change="onActiveItemChange"
            @event-click="onEventClick"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { BryntumCalendar } from '@bryntum/calendar-vue-3';
import { Calendar } from '@bryntum/calendar';
import { useCalendarConfig } from './calendarConfig';

// Refs
const calendar = ref<InstanceType<typeof BryntumCalendar> | null>(null);
const currentMode = ref<string>('week');

// Config
const calendarConfig = reactive(useCalendarConfig());

// Computed instance access
const getInstance = (): Calendar | undefined => {
    return calendar.value?.instance.value;
};

// Event handlers
const onActiveItemChange = ({ activeItem }) => {
    currentMode.value = activeItem.modeName;
};

const onEventClick = ({ eventRecord }) => {
    console.log('Event clicked:', eventRecord.name);
};

// Lifecycle
onMounted(async () => {
    await getInstance()?.crudManager.load();
});
</script>

<style lang="scss">
@import '@bryntum/calendar/calendar.css';
@import '@bryntum/calendar/stockholm-light.css';

.calendar-container {
    height: 100vh;
}
</style>
```

### 3.2 Composable voor Calendar State

**useCalendar.ts:**
```typescript
import { ref, computed, Ref } from 'vue';
import { Calendar, EventModel } from '@bryntum/calendar';

export function useCalendar(calendarRef: Ref) {
    const currentMode = ref<string>('week');
    const currentDate = ref<Date>(new Date());

    const instance = computed<Calendar | undefined>(() => {
        return calendarRef.value?.instance?.value;
    });

    const selectedEvent = computed<EventModel | null>(() => {
        return instance.value?.selectedEvent ?? null;
    });

    const navigateTo = (date: Date) => {
        if (instance.value) {
            instance.value.date = date;
            currentDate.value = date;
        }
    };

    const changeMode = (mode: string) => {
        if (instance.value) {
            instance.value.mode = mode;
            currentMode.value = mode;
        }
    };

    const refresh = async () => {
        await instance.value?.crudManager.load();
    };

    return {
        instance,
        currentMode,
        currentDate,
        selectedEvent,
        navigateTo,
        changeMode,
        refresh
    };
}
```

### 3.3 Vue 3 Config met Composition API

**calendarConfig.ts:**
```typescript
import { BryntumCalendarProps } from '@bryntum/calendar-vue-3';

export function useCalendarConfig(): BryntumCalendarProps {
    return {
        date: new Date(),

        crudManager: {
            autoLoad: true,
            transport: {
                load: { url: '/api/calendar/load' },
                sync: { url: '/api/calendar/sync' }
            }
        },

        modes: {
            day: { dayStartTime: 8, dayEndTime: 20 },
            week: true,
            month: { sixWeeks: true },
            year: true,
            agenda: { range: '1 month' }
        },

        sidebar: {
            items: {
                datePicker: {
                    tbar: {
                        items: {
                            todayButton: {
                                text: 'Vandaag'
                            }
                        }
                    }
                },
                resourceFilter: {
                    title: 'Resources'
                }
            }
        },

        tbar: {
            items: {
                viewButtonGroup: {
                    items: {
                        dayButton: { text: 'Dag' },
                        weekButton: { text: 'Week' },
                        monthButton: { text: 'Maand' },
                        yearButton: { text: 'Jaar' },
                        agendaButton: { text: 'Agenda' }
                    }
                }
            }
        }
    };
}
```

---

## 4. Angular Integratie

### 4.1 Basis Setup

**Installatie:**
```bash
npm install @bryntum/calendar @bryntum/calendar-angular
```

**app.module.ts:**
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BryntumCalendarModule } from '@bryntum/calendar-angular';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BryntumCalendarModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

**app.component.ts:**
```typescript
import {
    AfterViewInit,
    Component,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BryntumCalendarComponent } from '@bryntum/calendar-angular';
import { Calendar } from '@bryntum/calendar';
import { calendarConfig, projectConfig } from './app.config';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumCalendarComponent)
    calendarComponent!: BryntumCalendarComponent;

    private calendar!: Calendar;

    // Configs
    calendarConfig = calendarConfig;
    projectConfig = projectConfig;

    ngAfterViewInit(): void {
        // Native instance beschikbaar
        this.calendar = this.calendarComponent.instance;
    }

    onEventClick(event: any): void {
        console.log('Event clicked:', event.eventRecord.name);
    }

    navigateToToday(): void {
        this.calendar.date = new Date();
    }
}
```

**app.component.html:**
```html
<div class="calendar-wrapper">
    <bryntum-calendar-project-model
        #project
        [events]="projectConfig.events"
        [resources]="projectConfig.resources"
    ></bryntum-calendar-project-model>

    <bryntum-calendar
        #calendar
        [project]="project"
        [date]="calendarConfig.date"
        [modes]="calendarConfig.modes"
        [sidebar]="calendarConfig.sidebar"
        [eventTooltipFeature]="calendarConfig.eventTooltipFeature"
        (onEventClick)="onEventClick($event)"
    ></bryntum-calendar>
</div>
```

### 4.2 Angular Service voor Calendar

**calendar.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Calendar, EventModel } from '@bryntum/calendar';

@Injectable({
    providedIn: 'root'
})
export class CalendarService {
    private calendar: Calendar | null = null;
    private currentMode = new BehaviorSubject<string>('week');

    currentMode$ = this.currentMode.asObservable();

    constructor(private http: HttpClient) {}

    setCalendarInstance(calendar: Calendar): void {
        this.calendar = calendar;
    }

    navigateToDate(date: Date): void {
        if (this.calendar) {
            this.calendar.date = date;
        }
    }

    changeMode(mode: string): void {
        if (this.calendar) {
            this.calendar.mode = mode;
            this.currentMode.next(mode);
        }
    }

    getEvents(): EventModel[] {
        return this.calendar?.eventStore.records ?? [];
    }

    async refreshData(): Promise<void> {
        await this.calendar?.crudManager.load();
    }

    async saveChanges(): Promise<void> {
        await this.calendar?.crudManager.sync();
    }
}
```

### 4.3 Angular Config

**app.config.ts:**
```typescript
import {
    BryntumCalendarProps,
    BryntumCalendarProjectModelProps
} from '@bryntum/calendar-angular';

export const calendarConfig: BryntumCalendarProps = {
    date: new Date(),

    modes: {
        day: {
            dayStartTime: 8,
            dayEndTime: 20
        },
        week: true,
        month: {
            sixWeeks: true
        },
        year: true,
        agenda: {
            range: '1 month'
        }
    },

    sidebar: {
        items: {
            datePicker: true,
            resourceFilter: {
                title: 'Resources'
            }
        }
    },

    eventTooltipFeature: {
        align: 'l-r'
    },

    eventEditFeature: {
        items: {
            nameField: { label: 'Naam' },
            resourceField: { label: 'Resource' },
            startDateField: { label: 'Start' },
            endDateField: { label: 'Einde' }
        }
    }
};

export const projectConfig: BryntumCalendarProjectModelProps = {
    events: [],
    resources: []
};
```

---

## 5. Ionic/Mobiel

### 5.1 Ionic Angular Setup

```typescript
// home.page.ts
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { BryntumCalendarComponent } from '@bryntum/calendar-angular';
import { calendarConfig } from './calendar.config';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit {
    @ViewChild(BryntumCalendarComponent)
    calendarComponent!: BryntumCalendarComponent;

    calendarConfig = calendarConfig;

    ngAfterViewInit(): void {
        // Responsive mode activeren
        const calendar = this.calendarComponent.instance;
        calendar.responsive = {
            small: {
                when: 600,
                sidebar: false,
                modes: {
                    day: true,
                    week: false,
                    month: true
                }
            }
        };
    }
}
```

### 5.2 Responsive Configuratie

```typescript
export const mobileCalendarConfig = {
    responsive: {
        // Klein scherm (telefoon)
        small: {
            when: 600,
            sidebar: false,
            modes: {
                day: true,
                week: false,
                month: {
                    minRowHeight: 60
                },
                agenda: {
                    range: '1 week'
                }
            },
            tbar: {
                items: {
                    viewButtonGroup: {
                        items: {
                            dayButton: true,
                            monthButton: true,
                            agendaButton: true
                        }
                    }
                }
            }
        },
        // Medium scherm (tablet)
        medium: {
            when: 900,
            sidebar: {
                collapsed: true
            },
            modes: {
                day: true,
                week: true,
                month: true
            }
        },
        // Groot scherm (desktop)
        large: {
            when: '*',
            sidebar: true,
            modes: {
                day: true,
                week: true,
                month: true,
                year: true,
                agenda: true
            }
        }
    }
};
```

---

## 6. Gedeelde Patronen

### 6.1 Feature Props Naming

Features worden in alle frameworks als props doorgegeven met `Feature` suffix:

| Feature Class | React Prop | Vue/Angular Prop |
|---------------|------------|------------------|
| `CalendarDrag` | `dragFeature` | `dragFeature` |
| `EventTooltip` | `eventTooltipFeature` | `eventTooltipFeature` |
| `EventEdit` | `eventEditFeature` | `eventEditFeature` |
| `EventMenu` | `eventMenuFeature` | `eventMenuFeature` |
| `ExternalEventSource` | `externalEventSourceFeature` | `externalEventSourceFeature` |
| `LoadOnDemand` | `loadOnDemandFeature` | `loadOnDemandFeature` |
| `TimeRanges` | `timeRangesFeature` | `timeRangesFeature` |
| `ScheduleMenu` | `scheduleMenuFeature` | `scheduleMenuFeature` |
| `Print` | `printFeature` | `printFeature` |
| `ExcelExporter` | `excelExporterFeature` | `excelExporterFeature` |

### 6.2 Feature Configuratie

```typescript
// Disable feature
eventEditFeature: false

// Enable met defaults
eventEditFeature: true

// Custom configuratie
eventEditFeature: {
    editorConfig: {
        width: 500
    },
    items: {
        nameField: { label: 'Event Name' },
        resourceField: { weight: 200 },
        customField: {
            type: 'textfield',
            name: 'customField',
            label: 'Custom',
            weight: 300
        }
    }
}
```

### 6.3 Event Listeners

**React:**
```typescript
<BryntumCalendar
    onEventClick={({ eventRecord }) => handleEventClick(eventRecord)}
    onBeforeEventEdit={({ eventRecord }) => {
        return eventRecord.isEditable; // Return false to cancel
    }}
    onEventDrop={({ eventRecord, newResource }) => {
        console.log(`Moved to ${newResource.name}`);
    }}
/>
```

**Vue:**
```vue
<bryntum-calendar
    @event-click="onEventClick"
    @before-event-edit="onBeforeEventEdit"
    @event-drop="onEventDrop"
/>
```

**Angular:**
```html
<bryntum-calendar
    (onEventClick)="onEventClick($event)"
    (onBeforeEventEdit)="onBeforeEventEdit($event)"
    (onEventDrop)="onEventDrop($event)"
></bryntum-calendar>
```

---

## 7. Thin Bundles & Tree Shaking

### 7.1 Thin Bundle Overzicht

Thin bundles bevatten alleen de code voor het specifieke product zonder gedeelde dependencies:

```
Regulier Bundle:
┌─────────────────────────────────────────┐
│ @bryntum/calendar                        │
│ ├── Calendar code                        │
│ ├── Grid code (volledig)                 │
│ ├── Scheduler code (volledig)            │
│ └── Core code (volledig)                 │
│                                          │
│ Grootte: ~3.5 MB                         │
└─────────────────────────────────────────┘

Thin Bundle:
┌─────────────────────────────────────────┐
│ @bryntum/calendar-thin                   │
│ ├── Calendar code (alleen)               │
│                                          │
│ Grootte: ~800 KB                         │
├─────────────────────────────────────────┤
│ + @bryntum/core-thin                     │
│ + @bryntum/grid-thin                     │
│ + @bryntum/scheduler-thin                │
│                                          │
│ Totaal: ~2.8 MB (met tree shaking)       │
└─────────────────────────────────────────┘
```

### 7.2 React Thin Setup

```typescript
// Thin imports
import { BryntumCalendar } from '@bryntum/calendar-react-thin';
import { BryntumDemoHeader } from '@bryntum/core-react-thin';

// Reguliere Calendar class (voor types)
import { Calendar } from '@bryntum/calendar-thin';
```

**Vite Config voor Thin Bundles:**
```typescript
// vite.config.ts
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: [
            '@bryntum/calendar-thin',
            '@bryntum/calendar-react-thin',
            '@bryntum/core-thin',
            '@bryntum/grid-thin',
            '@bryntum/scheduler-thin'
        ]
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    bryntum: [
                        '@bryntum/calendar-thin',
                        '@bryntum/core-thin'
                    ]
                }
            }
        }
    }
});
```

---

## 8. Multi-Product Integratie

### 8.1 Calendar + Grid (Drag from Grid)

```typescript
// React
import { BryntumCalendar, BryntumGrid, BryntumSplitter } from '@bryntum/calendar-react';

const App = () => {
    const calendarRef = useRef();
    const gridRef = useRef();

    const calendarConfig = {
        externalEventSourceFeature: {
            grid: 'unscheduled'
        }
    };

    const gridConfig = {
        id: 'unscheduled',
        title: 'Unscheduled Events',
        store: {
            modelClass: EventModel,
            data: unscheduledEvents
        },
        features: {
            stripe: true,
            sort: 'name'
        }
    };

    return (
        <div className="multi-product-layout">
            <BryntumGrid ref={gridRef} {...gridConfig} />
            <BryntumSplitter />
            <BryntumCalendar ref={calendarRef} {...calendarConfig} />
        </div>
    );
};
```

### 8.2 Calendar + TaskBoard

```typescript
// Shared ProjectModel
const projectConfig = {
    events: sharedEvents,
    resources: sharedResources
};

// Calendar met project
<BryntumCalendarProjectModel
    ref={projectRef}
    {...projectConfig}
/>

<BryntumCalendar
    project={projectRef}
    // Calendar-specific config
/>

<BryntumTaskBoard
    project={projectRef}
    // TaskBoard-specific config
    columnField="status"
/>
```

---

## 9. Data Binding Patronen

### 9.1 CrudManager (Aanbevolen)

```typescript
const calendarConfig = {
    crudManager: {
        autoLoad: true,
        autoSync: true,

        transport: {
            load: {
                url: '/api/calendar/load',
                method: 'GET'
            },
            sync: {
                url: '/api/calendar/sync',
                method: 'POST'
            }
        },

        // Listeners
        listeners: {
            beforeLoad: () => console.log('Loading...'),
            load: () => console.log('Loaded'),
            beforeSync: () => console.log('Syncing...'),
            sync: () => console.log('Synced'),
            syncFail: ({ response }) => console.error('Sync failed', response)
        }
    }
};
```

### 9.2 State Binding (React)

```typescript
function App() {
    const [events, setEvents] = useState<EventModelConfig[]>([]);
    const [resources, setResources] = useState<ResourceModelConfig[]>([]);

    // Load data
    useEffect(() => {
        fetchCalendarData().then(data => {
            setEvents(data.events);
            setResources(data.resources);
        });
    }, []);

    // Update events
    const handleEventChange = (updatedEvent: EventModelConfig) => {
        setEvents(prev => prev.map(e =>
            e.id === updatedEvent.id ? updatedEvent : e
        ));
    };

    return (
        <BryntumCalendar
            events={events}
            resources={resources}
            onEventChange={handleEventChange}
        />
    );
}
```

### 9.3 Standalone ProjectModel

```typescript
// Aparte ProjectModel voor betere controle
<BryntumCalendarProjectModel
    ref={projectRef}
    events={events}
    resources={resources}
    assignments={assignments}

    // Sync callbacks
    onEventAdd={handleEventAdd}
    onEventRemove={handleEventRemove}
    onEventUpdate={handleEventUpdate}
/>

<BryntumCalendar
    project={projectRef}
    // UI config only
/>
```

---

## 10. Performance Optimalisatie

### 10.1 Config Memoization

```typescript
// GOED: Config buiten component
const calendarConfig = {
    modes: { day: true, week: true, month: true }
};

function App() {
    return <BryntumCalendar {...calendarConfig} />;
}

// GOED: useMemo voor dynamische config
function App({ startDate }) {
    const config = useMemo(() => ({
        date: startDate,
        modes: { day: true, week: true, month: true }
    }), [startDate]);

    return <BryntumCalendar {...config} />;
}

// SLECHT: Config in render (veroorzaakt re-renders)
function App() {
    return (
        <BryntumCalendar
            modes={{ day: true, week: true, month: true }} // Nieuwe object elke render!
        />
    );
}
```

### 10.2 SyncDataOnLoad

```typescript
// Standaard enabled in wrappers - maakt two-way binding efficiënt
const storeConfig = {
    syncDataOnLoad: true, // default in wrappers

    // Of uitschakelen voor immutable data patterns
    syncDataOnLoad: false,
    useRawData: false // Clone data voor mutatie detectie
};
```

### 10.3 Lazy Loading Views

```typescript
const calendarConfig = {
    modes: {
        // Alleen geladen wanneer geselecteerd
        day: {
            type: 'dayview',
            lazy: true
        },
        week: true, // Altijd geladen (default)
        month: {
            type: 'monthview',
            lazy: true
        }
    }
};
```

---

## 11. Troubleshooting

### 11.1 Veelvoorkomende Problemen

**SSR Error (Next.js):**
```
ReferenceError: window is not defined
```
Oplossing: Dynamic import met `ssr: false`

**Lege Calendar:**
```
Calendar renders but shows no events
```
Oplossingen:
- Check of `crudManager.autoLoad: true` is gezet
- Verifieer data format (id, startDate, endDate, name)
- Check console voor load errors

**Style niet toegepast:**
```
Calendar shows unstyled/broken
```
Oplossing: Import CSS bestanden:
```typescript
import '@bryntum/calendar/calendar.css';
import '@bryntum/calendar/stockholm-light.css';
```

**React 18 Strict Mode:**
```
Component mounts twice in development
```
Dit is normaal gedrag in React 18 Strict Mode. Zorg ervoor dat:
- Data loading idempotent is
- Cleanup functions correct zijn geïmplementeerd

### 11.2 TypeScript Issues

```typescript
// Type voor Calendar instance
const calendarRef = useRef<BryntumCalendar>(null);
const instance = calendarRef.current?.instance as Calendar;

// Type voor config
import { BryntumCalendarProps } from '@bryntum/calendar-react';
const config: BryntumCalendarProps = { ... };
```

---

## 12. Cross-References

### Gerelateerde Documenten

| Document | Beschrijving |
|----------|--------------|
| [DEEP-DIVE-REACT-INTEGRATION.md](./DEEP-DIVE-REACT-INTEGRATION.md) | Algemene React integratie patronen (Gantt focus) |
| [CALENDAR-DEEP-DIVE-VIEWS.md](./CALENDAR-DEEP-DIVE-VIEWS.md) | Calendar views configuratie |
| [CALENDAR-IMPL-CRUDMANAGER.md](./CALENDAR-IMPL-CRUDMANAGER.md) | Data loading en syncing |
| [INTEGRATION-CALENDAR-TASKBOARD.md](./INTEGRATION-CALENDAR-TASKBOARD.md) | Calendar + TaskBoard integratie |
| [INTEGRATION-FRAMEWORKS.md](./INTEGRATION-FRAMEWORKS.md) | Algemeen framework overzicht |

### Demo Referenties

| Demo | Framework | Pad |
|------|-----------|-----|
| Basic React | React | `frameworks/react/typescript/basic/` |
| Basic Vue 3 | Vue 3 | `frameworks/vue-3/javascript/basic/` |
| Basic Angular | Angular | `frameworks/angular/basic/` |
| Drag from Grid | Angular | `frameworks/angular/drag-from-grid/` |
| Event Edit | Angular | `frameworks/angular/eventedit/` |
| React Vite | React | `frameworks/react-vite/basic-thin/` |
| Ionic | Ionic | `frameworks/ionic/ionic-4/` |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
