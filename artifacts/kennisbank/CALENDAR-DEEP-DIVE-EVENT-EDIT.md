# Calendar Deep Dive: Event Edit

> **Fase 6** - Uitgebreide gids voor event editing in Calendar: EventEdit feature, custom fields, editor configuratie, validatie en custom widgets.

---

## Overzicht

De Bryntum Calendar biedt een krachtige EventEdit feature voor het bewerken van events. De editor is volledig configureerbaar met custom fields, custom widgets, validatie en event-type specifieke velden.

### EventEdit Componenten

| Component | Beschrijving |
|-----------|-------------|
| **EventEdit Feature** | Feature die editor popup beheert |
| **EventEditor** | Popup widget voor event editing |
| **Standard Fields** | Ingebouwde velden (naam, datum, tijd, etc.) |
| **Custom Fields** | Custom widgets en velden |

---

## 1. TypeScript Interfaces

### EventEditConfig (line 8599)

```typescript
// Bron: calendar.d.ts line 8599
type EventEditConfig = {
    type?: 'eventEdit' | 'eventedit';

    // Editor configuratie
    editorConfig?: EventEditorConfig;
    items?: Record<string, ContainerItemConfig | boolean | null>;

    // Trigger
    triggerEvent?: string;  // 'eventdblclick'
    continueEditingOnEventClick?: boolean;
    ignoreSelector?: string;

    // Formats
    dateFormat?: string;
    timeFormat?: string;
    weekStartDay?: number;

    // Options
    disabled?: boolean | 'inert';
    readOnly?: boolean;
    saveAndCloseOnEnter?: boolean;
    minEditSize?: number;

    // Recurring events
    showRecurringUI?: boolean;
    useContextualRecurrenceRules?: boolean;

    // Event type field
    typeField?: string;

    // Event listeners
    listeners?: EventEditListeners;
};
```

### EventEditorConfig (line 37153)

```typescript
// Bron: calendar.d.ts line 37153
type EventEditorConfig = {
    // Positioning
    modal?: boolean;
    centered?: boolean;
    anchor?: boolean | string;

    // Title
    title?: string | DomConfig;
    titleRenderer?: ((eventRecord: EventModel) => string | DomConfig) | string;

    // Sizing
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;

    // Appearance
    cls?: string | object;
    closable?: boolean;
    closeAction?: 'hide' | 'destroy';

    // Toolbar
    tbar?: ToolbarConfig | (ContainerItemConfig | string)[];
    bbar?: ToolbarConfig | (ContainerItemConfig | string)[];

    // Content
    items?: Record<string, ContainerItemConfig | boolean | null>;

    // Behavior
    autoClose?: boolean;
    autoShow?: boolean;
    draggable?: boolean;
};
```

### Standard Field Names

```typescript
// Standaard velden en hun weights
const standardFields = {
    nameField: 100,          // Event naam
    resourceField: 200,      // Resource/calendar selectie
    startDateField: 300,     // Start datum
    startTimeField: 400,     // Start tijd
    endDateField: 500,       // Eind datum
    endTimeField: 600,       // Eind tijd
    allDayField: 700,        // All-day checkbox
    recurrenceCombo: 800,    // Recurrence type
    editRecurrenceButton: 900 // Recurrence edit button
};
```

---

## 2. Basis EventEdit Configuratie

### Eenvoudige Setup

```javascript
const calendar = new Calendar({
    appendTo: 'container',

    features: {
        eventEdit: true  // Enable met defaults
    }
});
```

### Modal Centered Editor

```javascript
// Bron: examples/eventedit/app.module.js
const calendar = new Calendar({
    features: {
        eventEdit: {
            // Editor als modal popup, gecentreerd
            editorConfig: {
                modal: true,
                centered: true,
                anchor: null,  // Geen anchor arrow

                // Custom title renderer
                titleRenderer: 'up.makeEditorTitle'
            }
        }
    },

    // Referenced by titleRenderer
    makeEditorTitle(eventRecord) {
        return StringHelper.xss`
            ${DateHelper.format(eventRecord.startDate, 'HH:mm')} -
            ${DateHelper.format(eventRecord.endDate, 'HH:mm')}
            ${eventRecord.name}
        `;
    }
});
```

### Trigger Configuratie

```javascript
features: {
    eventEdit: {
        // Welk event opent de editor
        triggerEvent: 'eventdblclick',  // Default
        // Of 'eventclick' voor single click

        // Blijf editen bij klik op ander event
        continueEditingOnEventClick: true,

        // Ignore clicks op deze selectors
        ignoreSelector: '.b-event-delete'
    }
}
```

---

## 3. Custom Fields Toevoegen

### Items Configuratie

```javascript
// Bron: examples/eventedit/app.module.js
features: {
    eventEdit: {
        items: {
            // Custom room selector (na event naam)
            roomSelector: {
                type: 'roomSelector',  // Custom widget type
                name: 'room',          // Event field binding
                label: 'Room',
                editable: false,
                weight: 110  // Na nameField (100)
            },

            // Radio group voor RSVP
            rsvp: {
                type: 'radiogroup',
                inline: true,
                label: 'Response',
                name: 'rsvp',
                weight: 290,  // Voor startDateField (300)

                options: {
                    accept: 'Accepted',
                    decline: 'Declined',
                    tentative: 'Tentative'
                }
            },

            // Verberg resource field
            resourceField: null,

            // Custom container met label en buttons
            remindersContainer: {
                type: 'container',
                weight: 2700,
                name: 'reminderGroup',
                cls: 'reminders-container',
                items: {
                    label: {
                        type: 'label',
                        text: 'Reminders'
                    },
                    remindersButtons: {
                        type: 'reminders',  // Custom widget
                        name: 'reminders',
                        cls: 'reminders-buttons'
                    }
                }
            }
        }
    }
}
```

### Veld Verbergen/Configureren

```javascript
features: {
    eventEdit: {
        items: {
            // Verberg resource field
            resourceField: null,

            // Of false
            resourceField: false,

            // Of reconfigure
            resourceField: {
                label: 'Calendar',  // Andere label
                required: true
            },

            // Verberg all-day checkbox
            allDayField: null,

            // Verberg recurrence UI
            recurrenceCombo: null,
            editRecurrenceButton: null
        }
    }
}
```

---

## 4. Custom Widget Types

### Custom Combo Widget

```javascript
// Bron: examples/eventedit/app.module.js
// Custom Room model
class Room extends Model {
    static fields = [
        { name: 'name' },
        { name: 'capacity', type: 'number' }
    ];
}

// Room store
const roomStore = new AjaxStore({
    readUrl: 'data/rooms.json',
    autoLoad: true,
    modelClass: Room
});

// Custom RoomSelector widget
class RoomSelector extends Combo {
    static type = 'roomSelector';

    static configurable = {
        store: roomStore,
        displayField: 'name',
        valueField: 'id',
        editable: false
    };
}

// Registreer type
RoomSelector.initClass();

// Gebruik in eventEdit
features: {
    eventEdit: {
        items: {
            roomSelector: {
                type: 'roomSelector',
                name: 'room',
                label: 'Room',
                weight: 110
            }
        }
    }
}
```

### Custom ButtonGroup Widget

```javascript
// Bron: examples/eventedit/app.module.js
class Reminders extends ButtonGroup {
    static $name = 'Reminders';
    static type = 'reminders';

    static configurable = {
        defaults: {
            toggleable: true,
            value: [false, false, false, false, true, false]
        },
        items: {
            reminders5min: { text: '5 Min' },
            reminders15min: { text: '15 Min' },
            reminders30min: { text: '30 Min' },
            reminders45min: { text: '45 Min' },
            reminders1hour: { text: '1 HR' },
            reminders2hour: { text: '2 HR' }
        }
    };

    set value(value) {
        value.forEach((reminderValue, index) => {
            this.items[index].pressed = reminderValue;
        });
    }

    get value() {
        return this.items.map(button => button.pressed);
    }
}

Reminders.initClass();
```

---

## 5. Event Fields Configuratie

### Custom Event Fields

```javascript
// Event store met custom fields
crudManager: {
    eventStore: {
        fields: [
            { name: 'room' },
            { name: 'rsvp' },
            {
                name: 'reminders',
                type: 'array',
                defaultValue: [false, false, false, false, true, false]
            },
            { name: 'location' },
            { name: 'priority', type: 'number', defaultValue: 1 }
        ]
    }
}
```

### Field Binding

```javascript
features: {
    eventEdit: {
        items: {
            // 'name' property bindt aan event field
            locationField: {
                type: 'textfield',
                name: 'location',  // Bindt aan event.location
                label: 'Location',
                weight: 150
            },

            // Nummer field
            priorityField: {
                type: 'numberfield',
                name: 'priority',
                label: 'Priority',
                min: 1,
                max: 5,
                weight: 160
            },

            // Checkbox
            urgentField: {
                type: 'checkbox',
                name: 'urgent',
                label: 'Urgent',
                weight: 170
            }
        }
    }
}
```

---

## 6. Editor Events

### Calendar-Level Events

```javascript
const calendar = new Calendar({
    listeners: {
        // Voordat editor opent
        beforeEventEdit({ eventRecord, eventEdit, eventElement }) {
            console.log('Opening editor for:', eventRecord.name);

            // Return false om te annuleren
            if (eventRecord.readOnly) {
                return false;
            }
        },

        // Voordat editor zichtbaar wordt
        beforeEventEditShow({ eventRecord, editor }) {
            console.log('Editor about to show');

            // Pas editor aan op basis van event
            const projectField = editor.widgetMap.projectField;
            if (projectField) {
                // ReadOnly voor bestaande events
                projectField.readOnly = !eventRecord.isCreating;
            }
        },

        // Na edit actie (save/delete/cancel)
        afterEventEdit({ action, eventRecord, editor }) {
            console.log(`Edit ${action}:`, eventRecord.name);

            switch (action) {
                case 'save':
                    showNotification('Event saved');
                    break;
                case 'delete':
                    showNotification('Event deleted');
                    break;
                case 'cancel':
                    console.log('Edit cancelled');
                    break;
            }
        }
    }
});
```

### Feature-Level Events

```javascript
features: {
    eventEdit: {
        listeners: {
            beforeDestroy({ source }) {
                console.log('EventEdit feature being destroyed');
            }
        }
    }
}
```

---

## 7. Read-Only Mode

### Feature ReadOnly

```javascript
features: {
    eventEdit: {
        // Hele editor read-only
        readOnly: true
    }
}
```

### Per-Field ReadOnly

```javascript
features: {
    eventEdit: {
        items: {
            // ReadOnly veld
            createdByField: {
                type: 'displayfield',
                name: 'createdBy',
                label: 'Created by',
                weight: 1000
            }
        }
    }
},

listeners: {
    beforeEventEditShow({ eventRecord, editor }) {
        // Conditionele read-only
        editor.widgetMap.nameField.readOnly = eventRecord.locked;
    }
}
```

---

## 8. Event Type Based Fields

### TypeField Configuratie

```javascript
features: {
    eventEdit: {
        // Event type veld
        typeField: 'eventType',

        items: {
            // Conditioneel veld op basis van eventType
            location: {
                type: 'textfield',
                name: 'location',
                label: 'Location',

                // Toon alleen voor Meeting type
                dataset: { eventType: 'Meeting' }
            },

            attendeesField: {
                type: 'textfield',
                name: 'attendees',
                label: 'Attendees',
                dataset: { eventType: 'Meeting' }
            },

            // Agenda alleen voor Workshop
            agendaField: {
                type: 'textarea',
                name: 'agenda',
                label: 'Agenda',
                dataset: { eventType: 'Workshop' }
            }
        }
    }
}
```

### CSS voor Event Types

```css
/* Verberg velden gebaseerd op event type */
.b-event-type-meeting [data-event-type="Workshop"] {
    display: none;
}

.b-event-type-workshop [data-event-type="Meeting"] {
    display: none;
}
```

---

## 9. Validatie

### Field Validatie

```javascript
features: {
    eventEdit: {
        items: {
            nameField: {
                required: true,
                minLength: 3,
                maxLength: 100
            },

            emailField: {
                type: 'textfield',
                name: 'contactEmail',
                label: 'Contact Email',
                inputType: 'email',

                // Custom validator
                validator({ value }) {
                    if (value && !value.includes('@')) {
                        return 'Please enter a valid email';
                    }
                    return true;
                }
            },

            attendeesField: {
                type: 'numberfield',
                name: 'maxAttendees',
                label: 'Max Attendees',
                min: 1,
                max: 100,
                required: true
            }
        }
    }
}
```

### Custom Validation op Save

```javascript
listeners: {
    beforeEventEdit({ eventRecord }) {
        // Validate before opening editor
        if (!eventRecord.isCreating && eventRecord.isPast) {
            Toast.show('Cannot edit past events');
            return false;
        }
    },

    afterEventEdit({ action, eventRecord }) {
        if (action === 'save') {
            // Post-save validation
            if (!eventRecord.isValid) {
                // Revert changes
                eventRecord.revertChanges();
                Toast.show('Validation failed');
            }
        }
    }
}
```

---

## 10. Editor Toolbar

### Bottom Bar Configuratie

```javascript
features: {
    eventEdit: {
        editorConfig: {
            // Custom bottom bar
            bbar: {
                items: {
                    deleteButton: {
                        type: 'button',
                        text: 'Delete',
                        color: 'b-red',
                        onClick: 'up.onDeleteClick'
                    },
                    spacer: { type: 'widget', flex: 1 },
                    cancelButton: {
                        type: 'button',
                        text: 'Cancel',
                        onClick: 'up.onCancelClick'
                    },
                    saveButton: {
                        type: 'button',
                        text: 'Save',
                        color: 'b-green',
                        onClick: 'up.onSaveClick'
                    }
                }
            }
        }
    }
}
```

### Top Bar Configuratie

```javascript
features: {
    eventEdit: {
        editorConfig: {
            // Top toolbar
            tbar: {
                items: {
                    title: {
                        type: 'widget',
                        html: 'Edit Event',
                        flex: 1
                    },
                    duplicateButton: {
                        type: 'button',
                        icon: 'b-icon-copy',
                        tooltip: 'Duplicate event',
                        onClick: 'up.onDuplicate'
                    }
                }
            }
        }
    }
}
```

---

## 11. Recurrence UI

### Recurrence Configuratie

```javascript
features: {
    eventEdit: {
        // Toon recurrence UI
        showRecurringUI: true,

        // Gebruik contextual recurrence rules
        useContextualRecurrenceRules: true
    }
}
```

### Verbergen Recurrence

```javascript
features: {
    eventEdit: {
        showRecurringUI: false,

        // Of via items
        items: {
            recurrenceCombo: null,
            editRecurrenceButton: null
        }
    }
}
```

---

## 12. Programmatic Control

### Editor Openen

```javascript
// Open editor voor specifiek event
calendar.editEvent(eventRecord);

// Met resource
calendar.editEvent(eventRecord, resourceRecord);

// Via feature
calendar.features.eventEdit.editEvent(eventRecord);
```

### Editor Sluiten

```javascript
// Cancel edit
calendar.features.eventEdit.cancelEdit();

// Save en sluit
calendar.features.eventEdit.save();
```

### Editor Toegang

```javascript
// Haal editor widget op
const editor = calendar.features.eventEdit.editor;

// Check of open
if (editor.isVisible) {
    // Haal huidige event op
    const eventRecord = calendar.features.eventEdit.eventRecord;
}

// Toegang tot widgets
const nameField = editor.widgetMap.nameField;
nameField.value = 'Updated Name';
```

---

## 13. Localization

### Editor Labels Localiseren

```javascript
// locale/nl.js
const locale = {
    EventEdit: {
        'Name': 'Naam',
        'Resource': 'Resource',
        'Start': 'Start',
        'End': 'Eind',
        'All day': 'Hele dag',
        'Save': 'Opslaan',
        'Delete': 'Verwijderen',
        'Cancel': 'Annuleren'
    }
};

LocaleManager.applyLocale(locale);
```

### Custom Field Labels

```javascript
features: {
    eventEdit: {
        items: {
            // Gelokaliseerde labels
            locationField: {
                type: 'textfield',
                name: 'location',
                label: 'L{EventEdit.location}',  // Lokalisatie token
                weight: 150
            }
        }
    }
}
```

---

## 14. Styling

### Editor CSS

```css
/* Editor container */
.b-eventeditor {
    --editor-width: 400px;
    width: var(--editor-width);
}

/* Modal overlay */
.b-eventeditor.b-modal .b-mask {
    background-color: rgba(0, 0, 0, 0.4);
}

/* Header */
.b-eventeditor .b-header {
    background-color: var(--b-primary);
    color: white;
}

/* Form fields */
.b-eventeditor .b-field {
    margin-bottom: 1em;
}

/* Custom field styling */
.b-eventeditor .reminders-container {
    background: var(--b-panel-background);
    padding: 1em;
    border-radius: 4px;
}

.b-eventeditor .reminders-buttons {
    margin-top: 0.5em;
}

/* Bottom bar */
.b-eventeditor .b-panel-bbar {
    border-top: 1px solid var(--b-border-color);
    padding: 1em;
}
```

### Responsive Editor

```css
@media (max-width: 600px) {
    .b-eventeditor {
        width: 100%;
        max-width: none;
    }

    .b-eventeditor.b-centered {
        left: 0 !important;
        top: 0 !important;
        transform: none !important;
    }
}
```

---

## 15. Best Practices

### Do's

```javascript
// 1. Gebruik weight voor field ordering
items: {
    customField: { weight: 150 }  // Tussen 100 en 200
}

// 2. Bind aan event fields via 'name'
items: {
    locationField: {
        name: 'location'  // Bindt aan event.location
    }
}

// 3. Gebruik beforeEventEditShow voor runtime aanpassingen
listeners: {
    beforeEventEditShow({ editor, eventRecord }) {
        editor.widgetMap.field.readOnly = !eventRecord.isCreating;
    }
}

// 4. Registreer custom widgets met initClass()
MyCustomWidget.initClass();
```

### Don'ts

```javascript
// 1. Niet direct editor DOM manipuleren
// Gebruik widgetMap in plaats

// 2. Niet editor destroy() aanroepen
// Laat Calendar dit beheren

// 3. Geen async operaties in beforeEventEdit zonder Promise return
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| EventEditListenersTypes | 8517 |
| EventEditListeners | 8556 |
| EventEditConfig | 8599 |
| EventEdit class | 8782 |
| EventEditorConfig | 37153 |
| beforeEventEdit event | 12481 |
| beforeEventEditShow event | 12495 |
| afterEventEdit event | 12259 |

---

## Relevante Examples

| Example | Beschrijving |
|---------|-------------|
| `eventedit/` | Custom widgets (RoomSelector, Reminders) |
| `filtering-advanced/` | Custom ProjectField in editor |
| `basic/` | Standaard editor setup |
| `recurring-events/` | Recurrence UI in editor |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
