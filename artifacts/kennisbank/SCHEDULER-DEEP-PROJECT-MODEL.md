# SchedulerPro Deep Dive: ProjectModel

## Overview

The `ProjectModel` is the central data container in SchedulerPro. It manages all stores (events, resources, assignments, dependencies, calendars), coordinates the calculation engine, handles CRUD operations with the server, and provides undo/redo capabilities through STM (State Tracking Manager). Understanding the ProjectModel is essential for building robust scheduling applications.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ProjectModel                                │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │ EventStore  │  │ResourceStore│  │    Calculation Engine       │ │
│  └─────────────┘  └─────────────┘  │ (Chronograph-based)         │ │
│                                     │ - Constraint resolution     │ │
│  ┌──────────────┐ ┌──────────────┐ │ - Date calculations         │ │
│  │AssignmentStore│ │DependencyStore││ - Calendar handling         │ │
│  └──────────────┘ └──────────────┘ └─────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────┐  ┌────────────────────────────────────┐   │
│  │ CalendarManagerStore │  │         CrudManager                │   │
│  └─────────────────────┘  │ - load() / sync()                  │   │
│                            │ - Transport configuration          │   │
│  ┌─────────────────────┐  └────────────────────────────────────┘   │
│  │  TimeRangeStore     │                                           │
│  └─────────────────────┘  ┌────────────────────────────────────┐   │
│                            │         STM (Undo/Redo)            │   │
│  ┌────────────────────────┐└────────────────────────────────────┘   │
│  │ResourceTimeRangeStore  │                                         │
│  └────────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## ProjectModel Class

```typescript
export class ProjectModel extends ProjectModelMixinClass {
    // Identity flags
    static readonly isProjectModel: boolean
    static readonly isAbstractCrudManagerMixin: boolean
    static readonly isPartOfProject: boolean

    // Stores
    eventStore: EventStore
    resourceStore: ResourceStore
    assignmentStore: AssignmentStore
    dependencyStore: DependencyStore
    calendarManagerStore: CalendarManagerStore

    // Data shortcuts
    events: EventModel[] | EventModelConfig[]
    resources: ResourceModel[] | ResourceModelConfig[]
    assignments: AssignmentModel[] | AssignmentModelConfig[]
    dependencies: DependencyModel[] | DependencyModelConfig[]
    calendars: CalendarModel[] | CalendarModelConfig[]
    timeRanges: TimeSpan[] | TimeSpanConfig[]
    resourceTimeRanges: ResourceTimeRangeModel[] | ResourceTimeRangeModelConfig[]

    // Calendar
    calendar: string | CalendarModelConfig | CalendarModel

    // Change tracking
    readonly changes: object | null
    readonly isChangeTrackingSuspended: boolean
    readonly isCrudManagerLoading: boolean
    readonly isCrudManagerSyncing: boolean

    // CRUD configuration
    loadUrl: string
    syncUrl: string
    crudStores: CrudManagerStoreDescriptor[]
    readonly crudRevision: number
}
```

## Configuration

### Basic Setup

```typescript
const project = new ProjectModel({
    // Store data
    events: [
        { id: 1, name: 'Task 1', startDate: '2024-01-15', duration: 2 }
    ],
    resources: [
        { id: 1, name: 'John' }
    ],
    assignments: [
        { id: 1, eventId: 1, resourceId: 1 }
    ],
    dependencies: [
        { id: 1, from: 1, to: 2, type: 2 }
    ],

    // Calendar configuration
    calendar: 'general',
    calendars: [
        {
            id: 'general',
            intervals: [
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                }
            ]
        }
    ]
});

// Use with SchedulerPro
const scheduler = new SchedulerPro({
    project
});
```

### Store Configuration

```typescript
const project = new ProjectModel({
    // Custom store classes
    eventStoreClass: CustomEventStore,
    resourceStoreClass: CustomResourceStore,
    assignmentStoreClass: CustomAssignmentStore,
    dependencyStoreClass: CustomDependencyStore,

    // Custom model classes
    eventModelClass: CustomEventModel,
    resourceModelClass: CustomResourceModel,
    assignmentModelClass: CustomAssignmentModel,
    dependencyModelClass: CustomDependencyModel
});
```

### Time Calculation Settings

```typescript
const project = new ProjectModel({
    // Working time configuration
    hoursPerDay: 8,
    daysPerWeek: 5,
    daysPerMonth: 20,

    // Scheduling behavior
    skipNonWorkingTimeWhenSchedulingManually: true,
    skipNonWorkingTimeInDurationWhenSchedulingManually: true,

    // Constraint behavior
    addConstraintOnDateSet: true,

    // Dependency calendar source
    dependenciesCalendar: 'ToEvent', // 'ToEvent' | 'FromEvent' | 'Project'

    // Segment handling
    autoMergeAdjacentSegments: true,

    // Parent task calculation
    autoCalculatePercentDoneForParentTasks: true
});
```

## The Calculation Engine

SchedulerPro uses a reactive calculation engine based on Chronograph. Changes to data automatically trigger recalculations.

### commitAsync()

Project changes are batched and committed asynchronously.

```typescript
// Make changes
event.duration = 5;
event.startDate = new Date('2024-02-01');

// Commit changes and wait for calculations
await project.commitAsync();

// Now event.endDate is calculated
console.log(event.endDate);
```

### Queue Operations

Use `queue()` for transactional changes:

```typescript
project.queue(async () => {
    // All changes in this block are part of one transaction
    const event = project.eventStore.add({
        name: 'New Task',
        startDate: new Date(),
        duration: 5
    })[0];

    project.assignmentStore.add({
        eventId: event.id,
        resourceId: 1
    });

    await project.commitAsync();

    console.log('Task created:', event.id);
});
```

### Engine Ready State

```typescript
// Check if engine has finished calculations
if (project.isEngineReady) {
    // Safe to read calculated values
}

// Wait for engine to be ready
scheduler.whenProjectReady(() => {
    console.log('Project calculations complete');
});
```

## Data Loading

### Inline Data

```typescript
// Load data directly
await project.loadInlineData({
    events: { rows: [...] },
    resources: { rows: [...] },
    assignments: { rows: [...] },
    dependencies: { rows: [...] },
    calendars: { rows: [...] }
});
```

### CrudManager (Server Communication)

```typescript
const project = new ProjectModel({
    transport: {
        load: {
            url: '/api/load',
            method: 'GET'
        },
        sync: {
            url: '/api/sync',
            method: 'POST'
        }
    },

    // Or simpler
    loadUrl: '/api/load',
    syncUrl: '/api/sync',

    // Auto-sync after changes
    autoSync: true,

    // Force sync even without changes
    forceSync: false
});

// Load data from server
await project.load();

// Sync changes to server
await project.sync();
```

### Load/Sync Events

```typescript
project.on({
    // Before loading
    beforeLoad({ pack }) {
        console.log('About to load');
        // Return false to cancel
    },

    // After successful load
    load({ response }) {
        console.log('Data loaded', response);
    },

    // Load failed
    loadFail({ response, responseText }) {
        console.error('Load failed', responseText);
    },

    // Before syncing
    beforeSync({ pack }) {
        console.log('Changes to sync:', pack);
        // Return false to cancel
    },

    // After successful sync
    sync({ response }) {
        console.log('Changes synced');
    },

    // Sync failed
    syncFail({ response }) {
        console.error('Sync failed');
    }
});
```

### Request Customization

```typescript
project.on('beforeSend', ({ params, requestType, requestConfig }) => {
    // Add auth header
    requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${token}`
    };

    // Add query params
    params.userId = currentUserId;
});
```

## Change Tracking

### Reading Changes

```typescript
// Get all changes
const changes = project.changes;
// Returns: { events: { added: [], modified: [], removed: [] }, ... }

if (changes) {
    console.log('Added events:', changes.events?.added);
    console.log('Modified events:', changes.events?.modified);
    console.log('Removed events:', changes.events?.removed);
}

// Check if specific store has changes
const hasEventChanges = project.crudStoreHasChanges('events');
```

### Change Events

```typescript
project.on({
    // Any store changed
    change({ store, action, record, records, changes }) {
        console.log(`Store ${store.id}: ${action}`);

        switch (action) {
            case 'add':
                console.log('Added:', records);
                break;
            case 'update':
                console.log('Updated:', record, 'Changes:', changes);
                break;
            case 'remove':
                console.log('Removed:', records);
                break;
        }
    },

    // Has unsaved changes
    hasChanges() {
        saveButton.disabled = false;
    },

    // No more unsaved changes
    noChanges() {
        saveButton.disabled = true;
    }
});
```

### Accept/Reject Changes

```typescript
// Accept all changes (mark as persisted)
project.acceptChanges();

// Revert changes per store
project.eventStore.revertChanges();
project.resourceStore.revertChanges();
```

## Calculation Events

### dataReady

Fires when engine calculations complete.

```typescript
project.on('dataReady', ({
    source,
    isInitialCommit,
    records  // Set of modified records
}) => {
    if (isInitialCommit) {
        console.log('Initial data load complete');
    }

    // Access modified records
    records.forEach(record => {
        console.log(`Record ${record.id} modified:`, record.modifications);
    });
});
```

### Scheduling Issues

```typescript
// Scheduling conflict
project.on('schedulingConflict', ({
    schedulingIssue,
    continueWithResolutionResult
}) => {
    const description = schedulingIssue.getDescription();
    const resolutions = schedulingIssue.getResolutions();

    // Show dialog to user
    showConflictDialog(description, resolutions).then(resolution => {
        if (resolution) {
            resolution.resolve();
            continueWithResolutionResult(EffectResolutionResult.Resume);
        } else {
            continueWithResolutionResult(EffectResolutionResult.Cancel);
        }
    });
});

// Dependency cycle detected
project.on('cycle', ({
    schedulingIssue,
    continueWithResolutionResult
}) => {
    console.warn('Cycle detected:', schedulingIssue.getDescription());

    // Cancel the change that caused the cycle
    continueWithResolutionResult(EffectResolutionResult.Cancel);
});

// Empty calendar (no working time)
project.on('emptyCalendar', ({
    schedulingIssue,
    continueWithResolutionResult
}) => {
    const calendar = schedulingIssue.getCalendar();
    console.error('Calendar has no working time:', calendar.name);
});
```

### Progress Notifications

```typescript
const project = new ProjectModel({
    enableProgressNotifications: true
});

project.on('progress', ({
    total,
    remaining,
    phase  // 'storePopulation' | 'propagating'
}) => {
    const progress = ((total - remaining) / total) * 100;
    updateProgressBar(progress, phase);
});
```

## STM (State Tracking Manager)

Built-in undo/redo support.

### Configuration

```typescript
const project = new ProjectModel({
    stm: {
        autoRecord: true,
        disabled: false
    },

    // Ignore backend changes in undo history
    ignoreRemoteChangesInSTM: true
});
```

### Using Undo/Redo

```typescript
// Access STM
const stm = project.stm;

// Check state
if (stm.canUndo) {
    stm.undo();
}

if (stm.canRedo) {
    stm.redo();
}

// Multiple steps
stm.undo(3);  // Undo 3 transactions
stm.redo(2);  // Redo 2 transactions

// Undo/redo all
stm.undoAll();
stm.redoAll();
```

### Transaction Control

```typescript
// Start a named transaction
stm.startTransaction('Move events');

// Make changes
event1.startDate = new Date('2024-02-01');
event2.startDate = new Date('2024-02-01');

// Commit transaction
stm.stopTransaction();

// Or reject
stm.rejectTransaction();
```

### STM Events

```typescript
stm.on({
    recordingStart() {
        console.log('Recording started');
    },

    recordingStop({ transaction }) {
        console.log('Transaction recorded:', transaction.title);
    },

    restoringStart({ direction }) {
        console.log(`${direction === 'undo' ? 'Undoing' : 'Redoing'}...`);
    },

    restoringStop() {
        console.log('Restore complete');
    }
});
```

## Project Data Access

### inlineData Property

Get/set complete project data.

```typescript
// Get all data
const data = project.inlineData;
// { events: [...], resources: [...], assignments: [...], ... }

// Set all data (replaces existing)
project.inlineData = {
    events: [...],
    resources: [...],
    assignments: [...]
};
```

### toJSON()

Export project data as JSON.

```typescript
const json = project.toJSON();
// Returns complete data package for all stores

// Use for export
const exportData = JSON.stringify(json, null, 2);
downloadFile(exportData, 'project.json');
```

## Calendar System

### Project Calendar

```typescript
const project = new ProjectModel({
    // Default calendar for all events
    calendar: 'business',

    calendars: [
        {
            id: 'business',
            name: 'Business Hours',
            intervals: [
                // Weekend off
                {
                    recurrentStartDate: 'on Sat at 0:00',
                    recurrentEndDate: 'on Mon at 0:00',
                    isWorking: false
                },
                // Work hours
                {
                    recurrentStartDate: 'at 9:00',
                    recurrentEndDate: 'at 17:00',
                    isWorking: true
                }
            ]
        },
        {
            id: '24x7',
            name: '24/7 Operations',
            // No intervals = all time is working
        }
    ]
});
```

### Access Calendars

```typescript
// Get calendar manager
const calendarStore = project.calendarManagerStore;

// Get calendar by id
const calendar = calendarStore.getById('business');

// Create new calendar
calendarStore.add({
    id: 'custom',
    name: 'Custom Calendar',
    intervals: [...]
});
```

## Common Patterns

### Pattern 1: Initial Data Load with Wait

```typescript
const project = new ProjectModel({
    loadUrl: '/api/data'
});

const scheduler = new SchedulerPro({
    project,
    // Show mask while loading
    loadMask: 'Loading project...'
});

// Wait for initial load
await project.load();
await project.commitAsync();

console.log('Project ready with', project.eventStore.count, 'events');
```

### Pattern 2: Batch Changes

```typescript
// Suspend change tracking during batch update
project.suspendAutoSync();

try {
    // Make many changes
    project.eventStore.add([...hundredsOfEvents]);
    project.assignmentStore.add([...assignments]);

    await project.commitAsync();
} finally {
    // Resume and sync once
    project.resumeAutoSync();
    await project.sync();
}
```

### Pattern 3: Validation Before Save

```typescript
project.on('beforeSync', async ({ pack }) => {
    // Validate changes before sending
    const errors = [];

    pack.events?.updated?.forEach(event => {
        if (event.duration < 0) {
            errors.push(`Event ${event.id}: Invalid duration`);
        }
    });

    if (errors.length > 0) {
        showErrors(errors);
        return false;  // Cancel sync
    }
});
```

### Pattern 4: Conflict Resolution UI

```typescript
project.on('schedulingConflict', async ({
    schedulingIssue,
    continueWithResolutionResult
}) => {
    const description = schedulingIssue.getDescription();
    const resolutions = schedulingIssue.getResolutions();

    // Build dialog options
    const options = resolutions.map((r, i) => ({
        id: i,
        text: r.getDescription()
    }));

    // Show modal dialog
    const result = await showConflictModal({
        message: description,
        options
    });

    if (result.cancelled) {
        continueWithResolutionResult(EffectResolutionResult.Cancel);
    } else {
        resolutions[result.selectedOption].resolve();
        continueWithResolutionResult(EffectResolutionResult.Resume);
    }
});
```

### Pattern 5: Real-time Collaboration

```typescript
const project = new ProjectModel({
    // Enable revision tracking for collab
    trackProjectModelChanges: true
});

// Initialize revisions
project.initRevisions(
    generateClientId(),  // Unique client ID
    'rev-001'            // Initial revision
);

// Listen for local changes to broadcast
project.on('revisionNotification', ({
    localRevisionId,
    clientId,
    changes
}) => {
    // Send to collaboration server
    websocket.send(JSON.stringify({
        type: 'revision',
        revisionId: localRevisionId,
        clientId,
        changes
    }));
});

// Apply incoming revisions from other clients
websocket.on('message', async (data) => {
    const { type, revisions } = JSON.parse(data);

    if (type === 'revisions') {
        await project.applyRevisions(revisions);
    }
});
```

### Pattern 6: Export/Import

```typescript
// Export project
function exportProject() {
    const data = project.toJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    saveAs(blob, 'project.json');
}

// Import project
async function importProject(file) {
    const text = await file.text();
    const data = JSON.parse(text);

    await project.loadInlineData(data);
    await project.commitAsync();
}
```

## Integration Notes

1. **Async Nature**: Most operations are async. Always await `commitAsync()` after making changes before reading calculated values.

2. **Engine Calculations**: The calculation engine runs automatically. Don't try to set calculated fields (like `endDate` when `duration` exists) directly.

3. **Store Relationships**: Stores are interconnected. Deleting an event automatically removes its assignments.

4. **Calendar Impact**: Calendars affect all date calculations. Ensure proper calendar configuration for accurate scheduling.

5. **Change Batching**: Multiple changes are batched into single commits. Use `queue()` for transactional operations.

6. **STM Transactions**: Group related changes into STM transactions for meaningful undo/redo.

7. **Server Sync Format**: CrudManager expects specific JSON formats for load/sync responses. See Bryntum docs for server implementation guides.

8. **Memory Management**: Large projects benefit from lazy loading. Configure `lazyLoad` for on-demand data fetching.
