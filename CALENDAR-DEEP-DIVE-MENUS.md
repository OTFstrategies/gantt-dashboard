# Calendar Deep Dive: Context Menus

> **Fase 6** - Diepgaande analyse van Calendar context menus: EventMenu, ScheduleMenu, custom menu items, processItems en menu events.

---

## Overzicht

De Bryntum Calendar biedt twee primaire context menu systemen die automatisch verschijnen bij interactie met events en lege tijdslots.

### Menu Types

| Feature | Trigger | Target | Beschrijving |
|---------|---------|--------|--------------|
| **EventMenu** | Right-click event | EventModel | Acties op bestaand event |
| **ScheduleMenu** | Right-click empty | Date/Time | Acties op lege tijdslot |

---

## 1. EventMenu Feature

### TypeScript Interface

```typescript
// Bron: calendar.d.ts line 9070
export class EventMenu extends SchedulerEventMenu {
    static readonly isEventMenu: boolean;
    readonly isEventMenu: boolean;
}

// Bron: calendar.d.ts line 8990
interface EventMenuConfig {
    type?: 'eventMenu';

    // Menu items configuratie
    items?: Record<string, MenuItemConfig | false>;

    // Process items voordat menu getoond wordt
    processItems?: (context: EventMenuContext) => void;

    // Trigger events
    triggerEvent?: string | boolean;  // 'contextmenu' default

    // Menu widget configuratie
    menu?: Partial<MenuConfig>;
}

interface EventMenuContext {
    eventRecord: EventModel;
    resourceRecord?: ResourceModel;
    date: Date;
    items: Record<string, MenuItem>;
    menu: Menu;
}

interface MenuItemConfig {
    text?: string;
    icon?: string;
    cls?: string;
    weight?: number;
    separator?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    menu?: MenuItemConfig[];
    onItem?: (context: EventMenuContext) => void;
}
```

### Default Menu Items

```javascript
// Default EventMenu items (system-provided)
const defaultEventMenuItems = {
    editEvent: {
        text: 'Edit event',
        icon: 'b-icon-edit',
        weight: 100,
        onItem: ({ eventRecord }) => calendar.editEvent(eventRecord)
    },
    deleteEvent: {
        text: 'Delete event',
        icon: 'b-icon-trash',
        weight: 200,
        onItem: ({ eventRecord }) => eventRecord.remove()
    },
    duplicate: {
        text: 'Duplicate event',
        icon: 'b-icon-copy',
        weight: 300,
        onItem: ({ eventRecord }) => calendar.duplicateEvent(eventRecord)
    }
};
```

### Basis EventMenu Setup

```javascript
// Bron: examples/custom-menus/app.module.js
const calendar = new Calendar({
    date: new Date(2020, 9, 12),

    crudManager: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    features: {
        eventMenu: {
            items: {
                // Custom menu item
                allDay: {
                    icon: 'fa fa-calendar-day',
                    // Handler gevonden via ownership hierarchy
                    onItem: 'up.toggleAllDay'
                }
            },

            // Dynamic item processing
            processItems: 'up.processContextMenuItems'
        }
    },

    // Process items - wordt aangeroepen voordat menu getoond wordt
    processContextMenuItems({ eventRecord, items }) {
        // Dynamisch tekst aanpassen op basis van event state
        items.allDay.text = eventRecord.allDay ? 'Make intraday' : 'Make all day';
    },

    // Custom action handler
    toggleAllDay({ eventRecord }) {
        eventRecord.allDay = !eventRecord.allDay;
    }
});
```

---

## 2. ScheduleMenu Feature

### TypeScript Interface

```typescript
interface ScheduleMenuConfig {
    type?: 'scheduleMenu';

    // Menu items
    items?: Record<string, MenuItemConfig | false>;

    // Process items callback
    processItems?: (context: ScheduleMenuContext) => void;

    // Trigger event
    triggerEvent?: string | boolean;
}

interface ScheduleMenuContext {
    date: Date;
    resourceRecord?: ResourceModel;
    items: Record<string, MenuItem>;
    menu: Menu;
}
```

### Basis ScheduleMenu Setup

```javascript
const calendar = new Calendar({
    features: {
        scheduleMenu: {
            items: {
                // Custom item voor nieuwe event
                addMeeting: {
                    text: 'Add Meeting',
                    icon: 'fa fa-users',
                    weight: 100,
                    onItem({ date, resourceRecord }) {
                        calendar.createEvent({
                            name: 'New Meeting',
                            startDate: date,
                            endDate: DateHelper.add(date, 1, 'hour'),
                            resourceId: resourceRecord?.id
                        });
                    }
                },

                addTask: {
                    text: 'Add Task',
                    icon: 'fa fa-tasks',
                    weight: 110,
                    onItem({ date }) {
                        calendar.createEvent({
                            name: 'New Task',
                            startDate: date,
                            endDate: DateHelper.add(date, 30, 'minute')
                        });
                    }
                }
            }
        }
    }
});
```

---

## 3. Custom Menu Items

### Item Configuratie Opties

```typescript
interface MenuItemConfig {
    // Basis
    text?: string;              // Display tekst
    icon?: string;              // CSS class voor icon
    cls?: string;               // Extra CSS classes
    weight?: number;            // Sortering (lager = hoger)

    // State
    disabled?: boolean;         // Grayed out
    hidden?: boolean;           // Niet tonen
    checked?: boolean;          // Checkbox state
    toggleable?: boolean;       // Toggle behavior

    // Structuur
    separator?: boolean;        // Lijn boven item
    menu?: MenuItemConfig[];    // Submenu

    // Handlers
    onItem?: (context: MenuContext) => void;
    onToggle?: (context: MenuContext) => void;
}
```

### Uitgebreide Custom Items

```javascript
features: {
    eventMenu: {
        items: {
            // Separator
            customSeparator: {
                separator: true,
                weight: 250
            },

            // Icon met FontAwesome
            copyEvent: {
                text: 'Copy to clipboard',
                icon: 'fa fa-clipboard',
                weight: 260,
                onItem({ eventRecord }) {
                    navigator.clipboard.writeText(JSON.stringify(eventRecord.data));
                    Toast.show('Event copied!');
                }
            },

            // Submenu
            moveToResource: {
                text: 'Move to...',
                icon: 'fa fa-arrow-right',
                weight: 270,
                menu: {
                    items: calendar.resourceStore.records.map(resource => ({
                        text: resource.name,
                        icon: 'fa fa-user',
                        onItem({ eventRecord }) {
                            eventRecord.resourceId = resource.id;
                        }
                    }))
                }
            },

            // Conditionally disabled
            splitEvent: {
                text: 'Split event',
                icon: 'fa fa-cut',
                weight: 280,
                disabled: true,  // Initieel disabled
                onItem({ eventRecord }) {
                    // Split logic
                }
            },

            // Checkbox item
            markImportant: {
                text: 'Mark as important',
                icon: 'fa fa-star',
                weight: 290,
                toggleable: true,
                checked: false,
                onToggle({ eventRecord, checked }) {
                    eventRecord.important = checked;
                }
            }
        }
    }
}
```

---

## 4. Dynamic Item Processing

### processItems Callback

```javascript
features: {
    eventMenu: {
        processItems({ eventRecord, resourceRecord, items, date }) {
            // 1. Verberg items op basis van conditie
            if (eventRecord.isRecurring) {
                items.duplicate.hidden = true;
            }

            // 2. Disable items
            if (eventRecord.locked) {
                items.editEvent.disabled = true;
                items.deleteEvent.disabled = true;
            }

            // 3. Update tekst dynamisch
            items.deleteEvent.text = eventRecord.isOccurrence
                ? 'Delete this occurrence'
                : 'Delete event';

            // 4. Update icon
            items.markImportant.icon = eventRecord.important
                ? 'fa fa-star'
                : 'fa fa-star-o';

            // 5. Update checked state
            items.markImportant.checked = eventRecord.important;

            // 6. Voeg runtime items toe
            if (eventRecord.hasAttachments) {
                items.viewAttachments = {
                    text: `View ${eventRecord.attachments.length} attachments`,
                    icon: 'fa fa-paperclip',
                    weight: 150,
                    onItem() {
                        showAttachments(eventRecord);
                    }
                };
            }

            // 7. Verwijder items
            if (!calendar.features.eventEdit) {
                delete items.editEvent;
            }
        }
    }
}
```

### Async Processing

```javascript
features: {
    eventMenu: {
        async processItems({ eventRecord, items }) {
            // Async data ophalen voor menu
            const permissions = await fetchPermissions(eventRecord.id);

            items.editEvent.disabled = !permissions.canEdit;
            items.deleteEvent.disabled = !permissions.canDelete;

            // Voeg extra items toe op basis van permissions
            if (permissions.canShare) {
                items.share = {
                    text: 'Share event',
                    icon: 'fa fa-share',
                    weight: 400,
                    onItem: () => showShareDialog(eventRecord)
                };
            }
        }
    }
}
```

---

## 5. Menu Events

### Beschikbare Events

```javascript
calendar.on({
    // EventMenu events
    eventMenuBeforeShow({ eventRecord, items, menu }) {
        console.log('Menu about to show for:', eventRecord.name);
        // Return false om menu te voorkomen
    },

    eventMenuShow({ eventRecord, menu }) {
        console.log('Menu shown');
    },

    eventMenuItem({ eventRecord, item }) {
        console.log('Item clicked:', item.text);
    },

    eventMenuHide({ menu }) {
        console.log('Menu hidden');
    },

    // ScheduleMenu events
    scheduleMenuBeforeShow({ date, items, menu }) {
        console.log('Schedule menu at:', date);
    },

    scheduleMenuItem({ date, item }) {
        console.log('Schedule item clicked:', item.text);
    }
});
```

### Prevent Menu

```javascript
calendar.on({
    eventMenuBeforeShow({ eventRecord }) {
        // Voorkom menu voor bepaalde events
        if (eventRecord.readOnly) {
            Toast.show('This event cannot be modified');
            return false;
        }

        // Voorkom menu tijdens drag
        if (calendar.features.calendarDrag.isDragging) {
            return false;
        }
    }
});
```

---

## 6. Removing Default Items

### Verwijder Specifieke Items

```javascript
features: {
    eventMenu: {
        items: {
            // Verwijder edit
            editEvent: false,

            // Verwijder delete
            deleteEvent: false,

            // Behoud duplicate maar hernoem
            duplicate: {
                text: 'Clone this event'
            }
        }
    }
}
```

### Verwijder Alle Default Items

```javascript
features: {
    eventMenu: {
        // Start met lege menu
        items: {
            editEvent: false,
            deleteEvent: false,
            duplicate: false
        },

        // Voeg alleen custom items toe
        processItems({ items }) {
            items.customAction = {
                text: 'My Custom Action',
                icon: 'fa fa-magic',
                onItem: handleCustomAction
            };
        }
    }
}
```

---

## 7. Menu Styling

### Custom Menu Appearance

```javascript
features: {
    eventMenu: {
        // Menu widget configuratie
        menu: {
            cls: 'custom-event-menu',
            width: 250,
            align: 'l-r',

            // Scrollable voor lange menus
            scrollable: {
                y: true
            }
        }
    }
}
```

### CSS Customization

```css
/* Custom menu styling */
.custom-event-menu {
    --menu-background: #2a2a2a;
    --menu-color: #ffffff;
    --menu-hover-background: #3a3a3a;
}

.custom-event-menu .b-menuitem {
    padding: 12px 16px;
    font-size: 14px;
}

.custom-event-menu .b-menuitem .b-icon {
    width: 24px;
    color: #4a90d9;
}

/* Separator styling */
.custom-event-menu .b-menuitem.b-separator {
    border-top: 1px solid #444;
    margin-top: 8px;
    padding-top: 16px;
}

/* Disabled item */
.custom-event-menu .b-menuitem.b-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Submenu indicator */
.custom-event-menu .b-menuitem.b-has-submenu::after {
    content: '\\f054';
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    float: right;
}
```

---

## 8. Context-Aware Menus

### View-Specific Items

```javascript
features: {
    eventMenu: {
        processItems({ eventRecord, items }) {
            const activeView = calendar.activeView;

            // View-specific items
            if (activeView.type === 'dayview' || activeView.type === 'weekview') {
                items.reschedule = {
                    text: 'Reschedule',
                    icon: 'fa fa-clock',
                    weight: 150,
                    menu: {
                        items: [
                            {
                                text: '+1 hour',
                                onItem: () => eventRecord.shift(1, 'hour')
                            },
                            {
                                text: '+1 day',
                                onItem: () => eventRecord.shift(1, 'day')
                            },
                            {
                                text: '+1 week',
                                onItem: () => eventRecord.shift(1, 'week')
                            }
                        ]
                    }
                };
            }

            // MonthView specific
            if (activeView.type === 'monthview') {
                items.goToDay = {
                    text: 'Go to day view',
                    icon: 'fa fa-calendar-day',
                    weight: 500,
                    onItem() {
                        calendar.date = eventRecord.startDate;
                        calendar.mode = 'day';
                    }
                };
            }
        }
    }
}
```

### Resource-Specific Items

```javascript
features: {
    eventMenu: {
        processItems({ eventRecord, resourceRecord, items }) {
            if (resourceRecord) {
                // Resource-specific acties
                items.resourceInfo = {
                    text: `Assigned to: ${resourceRecord.name}`,
                    icon: 'fa fa-user',
                    weight: 50,
                    disabled: true  // Info only
                };

                // Reassign submenu
                items.reassign = {
                    text: 'Reassign to...',
                    icon: 'fa fa-exchange-alt',
                    weight: 350,
                    menu: {
                        items: calendar.resourceStore.records
                            .filter(r => r.id !== resourceRecord.id)
                            .map(r => ({
                                text: r.name,
                                onItem: () => {
                                    eventRecord.resourceId = r.id;
                                }
                            }))
                    }
                };
            }
        }
    }
}
```

---

## 9. Recurring Event Menus

### Special Items voor Recurrence

```javascript
features: {
    eventMenu: {
        processItems({ eventRecord, items }) {
            if (eventRecord.isRecurring) {
                // Vervang delete met recurrence options
                items.deleteEvent = false;

                items.deleteOccurrence = {
                    text: 'Delete this occurrence',
                    icon: 'fa fa-times',
                    weight: 200,
                    onItem() {
                        eventRecord.addExceptionDate(eventRecord.startDate);
                    }
                };

                items.deleteAllFuture = {
                    text: 'Delete this and future',
                    icon: 'fa fa-forward',
                    weight: 210,
                    onItem() {
                        // Set recurrence end date
                        const rule = eventRecord.recurrenceRule;
                        rule.endDate = DateHelper.add(eventRecord.startDate, -1, 'day');
                    }
                };

                items.deleteSeries = {
                    text: 'Delete entire series',
                    icon: 'fa fa-trash',
                    weight: 220,
                    onItem() {
                        if (eventRecord.recurringTimeSpan) {
                            eventRecord.recurringTimeSpan.remove();
                        } else {
                            eventRecord.remove();
                        }
                    }
                };
            }

            // Occurrence-specific
            if (eventRecord.isOccurrence) {
                items.editSeries = {
                    text: 'Edit series',
                    icon: 'fa fa-sync',
                    weight: 105,
                    onItem() {
                        calendar.editEvent(eventRecord.recurringTimeSpan);
                    }
                };
            }
        }
    }
}
```

---

## 10. Keyboard Shortcuts in Menu

### Accelerator Keys

```javascript
features: {
    eventMenu: {
        items: {
            editEvent: {
                text: 'Edit event',
                icon: 'fa fa-edit',
                accelerator: 'E'  // Press 'E' to trigger
            },
            deleteEvent: {
                text: 'Delete event',
                icon: 'fa fa-trash',
                accelerator: 'Delete'
            },
            duplicate: {
                text: 'Duplicate',
                icon: 'fa fa-copy',
                accelerator: 'Ctrl+D'
            }
        }
    }
}
```

---

## 11. Menu met Tooltip Integration

### Tooltip op Menu Items

```javascript
features: {
    eventMenu: {
        items: {
            complexAction: {
                text: 'Complex Action',
                icon: 'fa fa-cog',
                tooltip: 'This action will modify the event and notify participants',
                onItem: handleComplexAction
            }
        }
    },

    // Combineer met EventTooltip
    eventTooltip: {
        showOn: 'hover',
        align: 'b-t'
    }
}
```

---

## 12. Menu Best Practices

### Performance

```javascript
// Cache menu items die niet wijzigen
const staticMenuItems = {
    separator1: { separator: true, weight: 250 },
    help: {
        text: 'Help',
        icon: 'fa fa-question-circle',
        weight: 999,
        onItem: showHelp
    }
};

features: {
    eventMenu: {
        items: staticMenuItems,

        processItems({ eventRecord, items }) {
            // Alleen dynamische items hier
        }
    }
}
```

### Accessibility

```javascript
features: {
    eventMenu: {
        menu: {
            // Toegankelijke navigatie
            focusOnToFront: true,

            // ARIA labels
            ariaLabel: 'Event actions menu'
        },

        items: {
            deleteEvent: {
                text: 'Delete event',
                // Duidelijke beschrijving voor screen readers
                ariaLabel: 'Delete this event permanently'
            }
        }
    }
}
```

---

## TypeScript Referenties

| Component | Line in calendar.d.ts |
|-----------|----------------------|
| EventMenu | 9070 |
| EventMenuConfig | 8990 |
| ScheduleMenu | varies |
| MenuItem | Core module |
| Menu | Core module |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `custom-menus/` | EventMenu met custom items |
| `filtering/` | Context menu integratie |
| `confirmation-dialogs/` | Menu met async confirmatie |

---

*Laatst bijgewerkt: December 2024*
*Bryntum Calendar versie: 7.1.0*
