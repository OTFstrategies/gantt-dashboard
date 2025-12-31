# CALENDAR-IMPL-VALIDATION.md
## Bryntum Calendar - Validation Implementatie

### Overzicht

Dit document beschrijft de validatie-mogelijkheden van Bryntum Calendar. Validatie vindt plaats op meerdere niveaus: drag operaties, event bewerking, formulier velden en data model constraints.

---

## 1. Drag Validatie

### 1.1 ValidateCreateResult Type
```typescript
// calendar.d.ts:461
type ValidateCreateResult = {
    /**
     * Sta toe om event aan store toe te voegen
     */
    add: boolean

    /**
     * Sta toe om editor te openen
     */
    edit: boolean
}
```

### 1.2 Validate Functions

```typescript
// calendar.d.ts:7660
interface CalendarDragConfig {
    /**
     * Valideer nieuw event bij drag-create
     */
    validateCreateFn?: (info: ValidateInfo) => boolean | ValidateCreateResult

    /**
     * Valideer event bij drag-move
     */
    validateMoveFn?: (info: ValidateInfo) => boolean

    /**
     * Valideer event bij drag-resize
     */
    validateResizeFn?: (info: ValidateInfo) => boolean | Promise<any>
}

interface ValidateInfo {
    drag: DragContext
    event: Event
    view: CalendarView
    eventRecord: EventModel
}

interface DragContext {
    startDate: Date
    endDate: Date
    resourceRecord?: ResourceModel
    valid: boolean
}
```

### 1.3 Drag Validatie Implementatie

```typescript
const calendar = new Calendar({
    features: {
        calendarDrag: {
            /**
             * Valideer event creatie
             * Return false om te weigeren, true om toe te staan
             * Return object voor fijnmazige controle
             */
            validateCreateFn({ drag, eventRecord, view }) {
                const { startDate, endDate, resourceRecord } = drag;

                // Geen events in het verleden
                if (startDate < new Date()) {
                    return false;
                }

                // Geen events in weekenden
                const day = startDate.getDay();
                if (day === 0 || day === 6) {
                    return false;
                }

                // Controleer resource beschikbaarheid
                if (resourceRecord?.getData('readOnly')) {
                    return false;
                }

                // Fijnmazige controle: wel toevoegen, geen editor
                if (endDate.getTime() - startDate.getTime() < 15 * 60 * 1000) {
                    return {
                        add: true,   // Event wordt toegevoegd
                        edit: false  // Editor opent niet
                    };
                }

                return true;
            },

            /**
             * Valideer event verplaatsing
             */
            validateMoveFn({ drag, eventRecord }) {
                const { startDate, resourceRecord } = drag;

                // Geen verplaatsing naar verleden
                if (startDate < new Date()) {
                    return false;
                }

                // Locked events niet verplaatsen
                if (eventRecord.getData('locked')) {
                    return false;
                }

                // Controleer overlapping
                const overlapping = this.checkOverlap(
                    eventRecord,
                    startDate,
                    drag.endDate,
                    resourceRecord
                );

                return !overlapping;
            },

            /**
             * Valideer resize operatie
             */
            async validateResizeFn({ drag, eventRecord }) {
                const { startDate, endDate } = drag;
                const duration = endDate.getTime() - startDate.getTime();

                // Minimum 15 minuten
                if (duration < 15 * 60 * 1000) {
                    return false;
                }

                // Maximum 8 uur
                if (duration > 8 * 60 * 60 * 1000) {
                    return false;
                }

                // Async validatie (bijv. server check)
                const canResize = await this.validateOnServer(eventRecord, {
                    startDate,
                    endDate
                });

                return canResize;
            }
        }
    },

    // Helper methode
    checkOverlap(event, start, end, resource) {
        const events = this.eventStore.getEvents({
            startDate: start,
            endDate: end,
            resourceRecord: resource
        });

        return events.some(e =>
            e.id !== event.id &&
            e.startDate < end &&
            e.endDate > start
        );
    },

    async validateOnServer(event, dates) {
        const response = await fetch('/api/validate-resize', {
            method: 'POST',
            body: JSON.stringify({
                eventId: event.id,
                ...dates
            })
        });
        return response.ok;
    }
});
```

---

## 2. Event Listeners voor Validatie

### 2.1 beforeDrag Events

```typescript
// calendar.d.ts:12376
interface DragEvents {
    /**
     * Vuur voor drag-create eindigt
     * Return false om te annuleren
     */
    beforeDragCreateEnd: (event: BeforeDragEndEvent) => boolean | void

    /**
     * Vuur voor drag-move eindigt
     */
    beforeDragMoveEnd: (event: BeforeDragEndEvent) => boolean | void

    /**
     * Vuur voor drag-resize eindigt
     */
    beforeDragResizeEnd: (event: BeforeDragEndEvent) => boolean | void
}

interface BeforeDragEndEvent {
    source: Calendar
    drag: DragContext
    event: Event
    eventRecord: EventModel
    newStartDate: Date
    newEndDate: Date
    resourceRecord?: ResourceModel
    feature: CalendarDrag
    validation: boolean | ValidateCreateResult
    view: CalendarView
}
```

### 2.2 Listener Implementatie

```typescript
const calendar = new Calendar({
    listeners: {
        /**
         * Extra validatie laag via listeners
         */
        beforeDragCreateEnd({ eventRecord, newStartDate, newEndDate, resourceRecord }) {
            // Business hours check
            const startHour = newStartDate.getHours();
            const endHour = newEndDate.getHours();

            if (startHour < 9 || endHour > 18) {
                Toast.show({
                    message: 'Events kunnen alleen tussen 9:00 en 18:00 worden gemaakt',
                    type: 'warning'
                });
                return false;
            }

            // Capacity check
            const dayEvents = this.getEventsForDate(newStartDate);
            if (dayEvents.length >= 10) {
                Toast.show({
                    message: 'Maximum aantal events per dag bereikt',
                    type: 'error'
                });
                return false;
            }

            return true;
        },

        /**
         * Bevestiging voor verplaatsing
         */
        async beforeDragMoveEnd({ eventRecord, newStartDate }) {
            // Confirmation voor recurring events
            if (eventRecord.isRecurring) {
                const confirmed = await MessageDialog.confirm({
                    title: 'Herhaald event',
                    message: 'Wilt u alleen deze of alle gebeurtenissen verplaatsen?'
                });

                return confirmed;
            }

            return true;
        },

        /**
         * Na succesvolle drag operatie
         */
        dragCreateEnd({ eventRecord, validation }) {
            console.log('Event created:', eventRecord.name);

            if (validation === true || validation?.add) {
                // Trigger sync
                this.crudManager.sync();
            }
        },

        dragMoveEnd({ eventRecord }) {
            console.log('Event moved:', eventRecord.name);
        },

        dragResizeEnd({ eventRecord }) {
            console.log('Event resized:', eventRecord.name);
        }
    }
});
```

---

## 3. Event Editor Validatie

### 3.1 Field Validatie Configuratie

```typescript
const calendar = new Calendar({
    features: {
        eventEdit: {
            items: {
                // Naam veld met validatie
                nameField: {
                    type: 'textfield',
                    name: 'name',
                    label: 'Naam',
                    required: true,
                    minLength: 3,
                    maxLength: 100,

                    // Custom validator
                    validator(value) {
                        if (!value || value.trim().length === 0) {
                            return 'Naam is verplicht';
                        }

                        if (value.length < 3) {
                            return 'Naam moet minimaal 3 karakters zijn';
                        }

                        // Geen speciale karakters
                        if (!/^[a-zA-Z0-9\s\-]+$/.test(value)) {
                            return 'Alleen letters, cijfers en koppeltekens toegestaan';
                        }

                        return true;
                    }
                },

                // Start datum met constraints
                startDateField: {
                    type: 'datetimefield',
                    name: 'startDate',
                    label: 'Start',
                    required: true,

                    validator(value) {
                        if (!value) {
                            return 'Startdatum is verplicht';
                        }

                        // Niet in het verleden
                        if (value < new Date()) {
                            return 'Startdatum kan niet in het verleden liggen';
                        }

                        // Niet meer dan 1 jaar vooruit
                        const maxDate = new Date();
                        maxDate.setFullYear(maxDate.getFullYear() + 1);

                        if (value > maxDate) {
                            return 'Startdatum kan niet meer dan 1 jaar in de toekomst liggen';
                        }

                        return true;
                    }
                },

                // Eind datum afhankelijk van start
                endDateField: {
                    type: 'datetimefield',
                    name: 'endDate',
                    label: 'Eind',
                    required: true,

                    validator(value) {
                        const startDate = this.parent.widgetMap.startDateField?.value;

                        if (!value) {
                            return 'Einddatum is verplicht';
                        }

                        if (startDate && value <= startDate) {
                            return 'Einddatum moet na startdatum liggen';
                        }

                        // Max 24 uur duur
                        if (startDate) {
                            const duration = value.getTime() - startDate.getTime();
                            if (duration > 24 * 60 * 60 * 1000) {
                                return 'Event kan niet langer dan 24 uur duren';
                            }
                        }

                        return true;
                    }
                },

                // Custom veld met async validatie
                locationField: {
                    type: 'textfield',
                    name: 'location',
                    label: 'Locatie',

                    async validator(value) {
                        if (!value) return true;

                        // Check locatie beschikbaarheid op server
                        const response = await fetch(
                            `/api/locations/check?name=${encodeURIComponent(value)}`
                        );
                        const { available } = await response.json();

                        if (!available) {
                            return 'Deze locatie is niet beschikbaar';
                        }

                        return true;
                    }
                }
            }
        }
    }
});
```

### 3.2 Cross-Field Validatie

```typescript
const calendar = new Calendar({
    features: {
        eventEdit: {
            // Editor niveau validatie
            beforeSave({ eventRecord, values }) {
                const errors = [];

                // Check combinatie van velden
                if (values.allDay && values.resource?.getData('noAllDayEvents')) {
                    errors.push('All-day events niet toegestaan voor deze resource');
                }

                // Business logic
                if (values.priority === 'high' && !values.description) {
                    errors.push('Hoge prioriteit events vereisen een beschrijving');
                }

                if (errors.length > 0) {
                    MessageDialog.alert({
                        title: 'Validatie Fouten',
                        message: errors.join('\n')
                    });
                    return false;
                }

                return true;
            },

            // Na succesvol opslaan
            afterSave({ eventRecord }) {
                Toast.show({
                    message: `Event "${eventRecord.name}" opgeslagen`,
                    type: 'success'
                });
            }
        }
    }
});
```

---

## 4. Model Validatie

### 4.1 Event Model Constraints

```typescript
import { EventModel } from '@bryntum/calendar';

class ValidatedEventModel extends EventModel {
    static fields = [
        { name: 'name', type: 'string' },
        { name: 'startDate', type: 'date' },
        { name: 'endDate', type: 'date' },
        { name: 'priority', type: 'string', defaultValue: 'normal' },
        {
            name: 'duration',
            type: 'number',
            // Computed veld
            persist: false
        }
    ];

    /**
     * Valideer het model
     */
    isValid(): boolean {
        return this.validate().length === 0;
    }

    /**
     * Retourneer array van validatie errors
     */
    validate(): string[] {
        const errors: string[] = [];

        // Verplichte velden
        if (!this.name || this.name.trim() === '') {
            errors.push('Naam is verplicht');
        }

        if (!this.startDate) {
            errors.push('Startdatum is verplicht');
        }

        if (!this.endDate) {
            errors.push('Einddatum is verplicht');
        }

        // Datum logica
        if (this.startDate && this.endDate) {
            if (this.endDate <= this.startDate) {
                errors.push('Einddatum moet na startdatum liggen');
            }

            // Max duur
            const hours = (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60);
            if (hours > 72) {
                errors.push('Event kan niet langer dan 72 uur duren');
            }
        }

        // Priority validatie
        const validPriorities = ['low', 'normal', 'high', 'urgent'];
        if (this.priority && !validPriorities.includes(this.priority)) {
            errors.push(`Ongeldige prioriteit: ${this.priority}`);
        }

        return errors;
    }

    // Override set om te valideren
    set(field: string | object, value?: any): void {
        super.set(field, value);

        // Trigger validatie na wijziging
        const errors = this.validate();
        this.set('validationErrors', errors, true);  // Silent set
    }
}
```

### 4.2 Store Validatie

```typescript
import { EventStore } from '@bryntum/calendar';

class ValidatedEventStore extends EventStore {
    modelClass = ValidatedEventModel;

    /**
     * Valideer alle records voor sync
     */
    validateAll(): Map<EventModel, string[]> {
        const errors = new Map<EventModel, string[]>();

        this.forEach(record => {
            const recordErrors = record.validate();
            if (recordErrors.length > 0) {
                errors.set(record, recordErrors);
            }
        });

        return errors;
    }

    /**
     * Override add voor pre-validatie
     */
    add(records: EventModel | EventModel[]): EventModel[] {
        const toAdd = Array.isArray(records) ? records : [records];

        // Valideer alle records
        for (const record of toAdd) {
            const errors = record.validate();
            if (errors.length > 0) {
                throw new Error(`Validatie fout: ${errors.join(', ')}`);
            }
        }

        return super.add(records);
    }

    /**
     * Check voor overlapping events
     */
    checkOverlap(event: EventModel): EventModel[] {
        return this.query(record =>
            record.id !== event.id &&
            record.resourceId === event.resourceId &&
            record.startDate < event.endDate &&
            record.endDate > event.startDate
        );
    }
}
```

---

## 5. CRUD Manager Validatie

### 5.1 Response Validatie

```typescript
// calendar.d.ts:5231
interface CrudManagerConfig {
    /**
     * Valideer server response structuur
     */
    validateResponse?: boolean
}

const calendar = new Calendar({
    crudManager: {
        validateResponse: true,  // Standaard response validatie

        // Custom response processor
        processResponse(response, request) {
            // Valideer response format
            if (!response.success) {
                const errors = response.errors || ['Onbekende fout'];
                this.handleServerErrors(errors);
                return false;
            }

            // Valideer data integriteit
            if (response.events) {
                for (const event of response.events) {
                    if (!this.validateEventData(event)) {
                        console.error('Invalid event data:', event);
                        return false;
                    }
                }
            }

            return true;
        },

        validateEventData(data) {
            // Check verplichte velden
            if (!data.id || !data.startDate || !data.endDate) {
                return false;
            }

            // Check datum formaat
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return false;
            }

            return end > start;
        },

        handleServerErrors(errors) {
            MessageDialog.alert({
                title: 'Server Fout',
                message: errors.join('\n')
            });
        }
    }
});
```

### 5.2 Sync Validatie

```typescript
const calendar = new Calendar({
    crudManager: {
        listeners: {
            // Valideer voor sync
            beforeSync({ pack }) {
                const { added, updated, removed } = pack.events || {};

                // Valideer nieuwe events
                if (added) {
                    for (const event of added) {
                        const errors = this.eventStore.getById(event.id)?.validate();
                        if (errors?.length > 0) {
                            Toast.show({
                                message: `Validatie fout: ${errors[0]}`,
                                type: 'error'
                            });
                            return false;
                        }
                    }
                }

                // Valideer updates
                if (updated) {
                    for (const update of updated) {
                        const record = this.eventStore.getById(update.id);
                        if (record) {
                            const errors = record.validate();
                            if (errors.length > 0) {
                                return false;
                            }
                        }
                    }
                }

                return true;
            },

            // Handle sync errors
            syncFail({ response, exception }) {
                if (exception) {
                    console.error('Sync exception:', exception);
                } else if (response?.errors) {
                    // Server validatie errors
                    this.handleValidationErrors(response.errors);
                }
            }
        }
    },

    handleValidationErrors(errors) {
        errors.forEach(error => {
            const record = this.eventStore.getById(error.id);
            if (record) {
                // Mark record als invalid
                record.set('validationError', error.message);
            }
        });

        MessageDialog.alert({
            title: 'Opslaan Mislukt',
            message: `${errors.length} validatie fout(en) gevonden`
        });
    }
});
```

---

## 6. Custom Validators

### 6.1 Validator Class

```typescript
interface ValidationRule {
    name: string
    validate: (value: any, record?: Model) => boolean | string
    message: string
}

class EventValidator {
    private rules: Map<string, ValidationRule[]> = new Map();

    /**
     * Registreer validatie regel
     */
    addRule(field: string, rule: ValidationRule): void {
        if (!this.rules.has(field)) {
            this.rules.set(field, []);
        }
        this.rules.get(field)!.push(rule);
    }

    /**
     * Valideer een veld
     */
    validateField(field: string, value: any, record?: Model): string[] {
        const fieldRules = this.rules.get(field) || [];
        const errors: string[] = [];

        for (const rule of fieldRules) {
            const result = rule.validate(value, record);
            if (result !== true) {
                errors.push(typeof result === 'string' ? result : rule.message);
            }
        }

        return errors;
    }

    /**
     * Valideer hele record
     */
    validateRecord(record: Model): Map<string, string[]> {
        const errors = new Map<string, string[]>();

        for (const [field, rules] of this.rules) {
            const value = record.get(field);
            const fieldErrors = this.validateField(field, value, record);

            if (fieldErrors.length > 0) {
                errors.set(field, fieldErrors);
            }
        }

        return errors;
    }

    /**
     * Check of record valide is
     */
    isValid(record: Model): boolean {
        const errors = this.validateRecord(record);
        return errors.size === 0;
    }
}

// Gebruik
const validator = new EventValidator();

// Voeg regels toe
validator.addRule('name', {
    name: 'required',
    validate: (value) => !!value && value.trim() !== '',
    message: 'Naam is verplicht'
});

validator.addRule('name', {
    name: 'minLength',
    validate: (value) => !value || value.length >= 3,
    message: 'Naam moet minimaal 3 karakters zijn'
});

validator.addRule('startDate', {
    name: 'notInPast',
    validate: (value) => !value || value >= new Date(),
    message: 'Startdatum kan niet in het verleden liggen'
});

validator.addRule('endDate', {
    name: 'afterStart',
    validate: (value, record) => {
        if (!value || !record) return true;
        const startDate = record.get('startDate');
        return !startDate || value > startDate;
    },
    message: 'Einddatum moet na startdatum liggen'
});

// Integreer met Calendar
const calendar = new Calendar({
    listeners: {
        beforeEventSave({ eventRecord }) {
            const errors = validator.validateRecord(eventRecord);

            if (errors.size > 0) {
                const messages = [];
                for (const [field, fieldErrors] of errors) {
                    messages.push(`${field}: ${fieldErrors.join(', ')}`);
                }

                MessageDialog.alert({
                    title: 'Validatie Fouten',
                    message: messages.join('\n')
                });

                return false;
            }

            return true;
        }
    }
});
```

---

## 7. Visual Feedback

### 7.1 Invalid State Styling

```css
/* Invalid event styling */
.b-cal-event.b-invalid {
    border: 2px solid var(--b-color-danger);
    background-color: rgba(var(--b-color-danger-rgb), 0.1);
}

/* Invalid field in editor */
.b-field.b-invalid input {
    border-color: var(--b-color-danger);
    background-color: rgba(var(--b-color-danger-rgb), 0.05);
}

.b-field.b-invalid .b-field-error {
    color: var(--b-color-danger);
    font-size: 0.85em;
    margin-top: 4px;
}

/* Drag invalid state */
.b-dragging-event.b-drag-invalid {
    opacity: 0.5;
    cursor: not-allowed;
}

.b-drag-proxy.b-invalid {
    border-color: var(--b-color-danger);
}
```

### 7.2 Error Indicators

```typescript
const calendar = new Calendar({
    modeDefaults: {
        eventRenderer({ eventRecord, renderData }) {
            // Check validatie status
            const errors = eventRecord.getData('validationErrors');

            if (errors && errors.length > 0) {
                // Voeg invalid class toe
                renderData.cls.add('b-invalid');

                // Voeg error indicator toe
                renderData.children.push({
                    tag: 'div',
                    className: 'b-validation-indicator',
                    dataset: {
                        btip: errors.join('\n')
                    },
                    children: [{
                        tag: 'i',
                        className: 'b-icon b-icon-warning'
                    }]
                });
            }

            return eventRecord.name;
        }
    }
});
```

---

## 8. Gerelateerde Bestanden

### Bryntum Source Files
- `calendar.d.ts` regel 461: ValidateCreateResult type
- `calendar.d.ts` regel 7649: validateCreateFn config
- `calendar.d.ts` regel 7665: validateMoveFn config
- `calendar.d.ts` regel 7678: validateResizeFn config
- `calendar.d.ts` regel 5231: validateResponse config
- `calendar.d.ts` regel 12376: beforeDragCreateEnd event
- `calendar.d.ts` regel 12407: beforeDragMoveEnd event
- `calendar.d.ts` regel 12437: beforeDragResizeEnd event

---

## 9. Samenvatting

Bryntum Calendar validatie omvat:

1. **Drag Validatie**
   - `validateCreateFn`: Valideer nieuwe events
   - `validateMoveFn`: Valideer verplaatsingen
   - `validateResizeFn`: Valideer resize operaties
   - `ValidateCreateResult` voor fijnmazige controle

2. **Event Listeners**
   - `beforeDragCreateEnd`, `beforeDragMoveEnd`, `beforeDragResizeEnd`
   - Return `false` om te annuleren
   - Async validatie ondersteund

3. **Editor Validatie**
   - Field validators met `required`, `minLength`, etc.
   - Custom validator functies
   - Cross-field validatie in `beforeSave`

4. **Model Validatie**
   - Override `isValid()` en `validate()`
   - Store-level validatie
   - Overlap detectie

5. **CRUD Manager**
   - `validateResponse` voor server responses
   - `beforeSync` voor pre-sync validatie
   - Error handling voor server validatie fouten

6. **Visual Feedback**
   - CSS classes voor invalid states
   - Error indicators op events
   - Tooltips met foutmeldingen
