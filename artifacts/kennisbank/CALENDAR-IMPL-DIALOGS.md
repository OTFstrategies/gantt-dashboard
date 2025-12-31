# CALENDAR-IMPL-DIALOGS.md

## Overzicht

Dit document beschrijft het dialoog- en notificatiesysteem in Bryntum Calendar. Het systeem omvat drie hoofdcomponenten:

1. **MessageDialog** - Singleton voor alert, confirm en prompt dialogen
2. **Popup** - Basis klasse voor custom popup windows
3. **Toast** - Tijdelijke notificaties

Deze componenten worden gebruikt voor gebruikersfeedback, bevestigingen en het verzamelen van input.

---

## TypeScript Interfaces

### MessageDialogSingleton (regel 128083)

```typescript
// calendar.d.ts:128083
export class MessageDialogSingleton extends Popup {
    /**
     * The enum value for the Cancel button
     */
    readonly cancelButton: number

    /**
     * The enum value for the OK button
     */
    readonly okButton: number

    // Inherited events
    onBeforeDestroy: ((event: { source: Base }) => void)|string
    onBeforeStateApply: ((event: { state: any }) => Promise<boolean>|boolean|void)|string
    onBeforeStateSave: ((event: { state: any }) => Promise<boolean>|boolean|void)|string
    onCatchAll: ((event: {[key: string]: any, type: string}) => void)|string
    onDestroy: ((event: { source: Base }) => void)|string

    /**
     * Shows an alert popup with a message
     */
    alert(options: {
        modal?: boolean
        title?: string
        message?: string
        rootElement?: string
        okButton?: string|ButtonConfig
    }): Promise<any>;

    /**
     * Shows a confirm dialog with "Ok" and "Cancel" buttons
     */
    confirm(options: {
        modal?: boolean
        title?: string
        message?: string
        rootElement?: string
        cancelButton?: string|ButtonConfig
        okButton?: string|ButtonConfig
    }): Promise<any>;

    /**
     * Shows a popup with a TextField for user input
     */
    prompt(options: {
        modal?: boolean
        title?: string
        message?: string
        rootElement?: string
        textField?: TextFieldConfig
        cancelButton?: string|ButtonConfig
        okButton?: string|ButtonConfig
    }): Promise<any>;
}

// Singleton export
export const MessageDialog: MessageDialogSingleton
```

### PopupConfig (regel 137211)

```typescript
// calendar.d.ts:137211
type PopupConfig = {
    type?: 'popup'

    // Positioning
    adopt?: HTMLElement|string
    align?: AlignSpec|string
    anchor?: boolean
    appendTo?: HTMLElement|string
    centered?: boolean
    constrainTo?: HTMLElement|Widget|Rectangle

    // Behavior
    autoClose?: boolean
    autoShow?: boolean
    closable?: boolean
    closeAction?: 'hide'|'destroy'
    closeOnEscape?: boolean

    // Appearance
    cls?: string|object
    bodyCls?: string|object
    content?: string
    html?: string|((widget: Widget) => string)|DomConfig|DomConfig[]
    title?: string

    // Size
    width?: string|number
    height?: string|number
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    maximized?: boolean

    // Resizable
    resizable?: boolean|{
        minWidth?: number
        maxWidth?: number
        minHeight?: number
        maxHeight?: number
        handles?: object
    }

    // Modality
    modal?: boolean

    // Toolbars
    tbar?: (ContainerItemConfig|string)[]|ToolbarConfig|null
    bbar?: (ContainerItemConfig|string)[]|ToolbarConfig|null

    // Header tools
    tools?: object

    // Events
    onBeforeClose?: ((event: { source: Popup }) => Promise<boolean>|boolean|void)|string
    listeners?: PopupListeners
}
```

### Popup Class (regel 138134)

```typescript
// calendar.d.ts:138134
export class Popup extends Panel {
    static readonly isPopup: boolean
    static readonly isResizable: boolean

    readonly isPopup: boolean
    readonly isResizable: boolean

    maximized: boolean

    resizable: boolean|{
        minWidth?: number
        maxWidth?: number
        minHeight?: number
        maxHeight?: number
        handles?: object
    }

    // Events
    onBeforeClose: ((event: { source: Popup }) => Promise<boolean>|boolean|void)|string
    onBeforeDestroy: ((event: { source: Base }) => void)|string
    onCatchAll: ((event: {[key: string]: any, type: string}) => void)|string
    onDestroy: ((event: { source: Base }) => void)|string

    constructor(config?: PopupConfig);

    /**
     * Close the popup (hide or destroy based on closeAction)
     */
    close(): Promise<void>;
}
```

### ToastConfig (regel 154626)

```typescript
// calendar.d.ts:154626
type ToastConfig = {
    type?: 'toast'

    // Content
    html?: string|((widget: Widget) => string)|DomConfig|DomConfig[]
    content?: string

    // Appearance
    cls?: string|object
    color?: string

    // Positioning
    appendTo?: HTMLElement|string
    centered?: boolean

    // Behavior
    timeout?: number  // Auto-hide delay in ms
    showProgress?: boolean  // Show progress bar

    // Animation
    hideAnimation?: boolean|object

    // Size
    width?: string|number
    height?: string|number

    listeners?: ToastListeners
}
```

### Toast Class (regel 155210)

```typescript
// calendar.d.ts:155210
export class Toast extends Widget {
    static readonly isToast: boolean
    readonly isToast: boolean

    constructor(config?: ToastConfig);

    /**
     * Hide all visible toasts
     */
    static hideAll(): void;

    /**
     * Easiest way to show a toast
     */
    static show(config: string|ToastConfig): Toast;

    /**
     * Hide this toast
     */
    hide(): Promise<void>;

    /**
     * Show this toast
     */
    show(): Promise<void>;
}
```

---

## MessageDialog Gebruik

### Alert Dialoog

Simpele alert voor informatieve berichten:

```javascript
import { Calendar, MessageDialog } from '@bryntum/calendar';

// Eenvoudigste vorm
await MessageDialog.alert({
    title   : 'Informatie',
    message : 'Het event is succesvol opgeslagen.'
});

// Met custom OK button
await MessageDialog.alert({
    title    : 'Waarschuwing',
    message  : 'Er zijn onopgeslagen wijzigingen.',
    okButton : {
        text : 'Begrepen',
        cls  : 'b-blue'
    }
});

// Modal alert met custom root
await MessageDialog.alert({
    title       : 'Systeembericht',
    message     : 'De sessie verloopt over 5 minuten.',
    modal       : true,
    rootElement : document.getElementById('app')
});
```

### Confirm Dialoog

Bevestigingsdialogen voor destructieve of belangrijke acties:

```javascript
import { MessageDialog } from '@bryntum/calendar';

// Basis confirm
const result = await MessageDialog.confirm({
    title   : 'Bevestigen',
    message : 'Weet u zeker dat u dit event wilt verwijderen?'
});

if (result === MessageDialog.okButton) {
    // Gebruiker klikte OK
    eventRecord.remove();
} else if (result === MessageDialog.cancelButton) {
    // Gebruiker klikte Cancel
    console.log('Actie geannuleerd');
}

// Met custom buttons
const confirmResult = await MessageDialog.confirm({
    title        : 'Event verplaatsen',
    message      : 'Het event wordt verplaatst naar een nieuwe datum.',
    okButton     : {
        text : 'Verplaatsen',
        icon : 'b-fa-arrow-right',
        cls  : 'b-green'
    },
    cancelButton : {
        text : 'Annuleren',
        icon : 'b-fa-times'
    }
});
```

### Prompt Dialoog

Input dialoog voor tekstverzameling:

```javascript
import { MessageDialog } from '@bryntum/calendar';

// Basis prompt
const promptResult = await MessageDialog.prompt({
    title   : 'Nieuwe taak',
    message : 'Voer de naam van de taak in:'
});

if (promptResult.button === MessageDialog.okButton) {
    const taskName = promptResult.text;
    createTask(taskName);
}

// Met custom TextField configuratie
const emailResult = await MessageDialog.prompt({
    title     : 'E-mail adres',
    message   : 'Voer uw e-mailadres in voor notificaties:',
    textField : {
        type        : 'textfield',
        label       : 'E-mail',
        placeholder : 'naam@voorbeeld.nl',
        required    : true,
        inputType   : 'email',
        triggers    : {
            clear : { cls : 'b-icon-clear' }
        }
    },
    okButton : {
        text : 'Opslaan',
        cls  : 'b-blue'
    }
});

// Prompt met validatie
const amountResult = await MessageDialog.prompt({
    title     : 'Bedrag invoeren',
    message   : 'Hoeveel uur wilt u reserveren?',
    textField : {
        type     : 'numberfield',
        label    : 'Uren',
        min      : 1,
        max      : 8,
        step     : 0.5,
        value    : 1,
        required : true
    }
});
```

---

## Async Event Handlers met Confirmatie

Een krachtig patroon is het gebruik van async event handlers met MessageDialog voor veto-mogelijkheden:

### Voorbeeld: confirmation-dialogs

```javascript
// Gebaseerd op examples/confirmation-dialogs/app.module.js
import { Calendar, MessageDialog, DateHelper } from '@bryntum/calendar';

const calendar = new Calendar({
    appendTo : 'container',
    date     : new Date(2020, 9, 12),

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    listeners : {
        // Bevestiging bij event verplaatsen (drag)
        beforeDragMoveEnd : async({ eventRecord }) => {
            const result = await MessageDialog.confirm({
                title   : 'Bevestig verplaatsing',
                message : `Nieuwe starttijd: ${DateHelper.format(eventRecord.startDate, 'ddd LST')}`
            });

            // Return true om drop te accepteren, false om te annuleren
            return result === MessageDialog.yesButton;
        },

        // Bevestiging bij event resize
        beforeDragResizeEnd : async({ eventRecord }) => {
            const result = await MessageDialog.confirm({
                title   : 'Bevestig aanpassing',
                message : `Nieuwe duur: ${DateHelper.getDurationInUnit(
                    eventRecord.startDate,
                    eventRecord.endDate,
                    'h'
                )}h`
            });

            return result === MessageDialog.yesButton;
        },

        // Bevestiging bij nieuw event aanmaken (drag-create)
        beforeDragCreateEnd : async({ eventRecord }) => {
            const result = await MessageDialog.confirm({
                title   : 'Bevestig aanmaken',
                message : `Event aanmaken op ${DateHelper.format(
                    eventRecord.startDate,
                    'ddd LST'
                )}?`
            });

            return result === MessageDialog.yesButton;
        }
    }
});
```

### Event Delete Confirmatie

```javascript
const calendar = new Calendar({
    listeners : {
        // Bevestiging bij event verwijderen
        beforeEventDelete : async({ eventRecords }) => {
            const count = eventRecords.length;
            const message = count === 1
                ? `Weet u zeker dat u "${eventRecords[0].name}" wilt verwijderen?`
                : `Weet u zeker dat u ${count} events wilt verwijderen?`;

            const result = await MessageDialog.confirm({
                title   : 'Verwijderen bevestigen',
                message,
                okButton : {
                    text : 'Verwijderen',
                    cls  : 'b-red'
                }
            });

            return result === MessageDialog.okButton;
        }
    }
});
```

### Edit Validatie met Confirm

```javascript
const calendar = new Calendar({
    listeners : {
        // Validatie check voor event save
        beforeEventSave : async({ eventRecord, changes }) => {
            // Check voor overlap
            const overlapping = calendar.eventStore.query(record =>
                record !== eventRecord &&
                record.resourceId === eventRecord.resourceId &&
                record.startDate < eventRecord.endDate &&
                record.endDate > eventRecord.startDate
            );

            if (overlapping.length > 0) {
                const result = await MessageDialog.confirm({
                    title   : 'Overlap gedetecteerd',
                    message : `Dit event overlapt met ${overlapping.length} ander(e) event(s). Wilt u toch doorgaan?`,
                    okButton : {
                        text : 'Doorgaan',
                        cls  : 'b-orange'
                    }
                });

                return result === MessageDialog.okButton;
            }

            return true;
        }
    }
});
```

---

## Custom Popup Dialogen

### Basis Custom Popup

```javascript
import { Popup, Button, TextField, DateField } from '@bryntum/calendar';

const customPopup = new Popup({
    title    : 'Quick Event',
    closable : true,
    centered : true,
    width    : 400,

    items : [
        {
            type  : 'textfield',
            ref   : 'nameField',
            label : 'Naam',
            name  : 'name'
        },
        {
            type  : 'datefield',
            ref   : 'dateField',
            label : 'Datum',
            name  : 'startDate'
        }
    ],

    bbar : [
        {
            type    : 'button',
            text    : 'Annuleren',
            onClick : () => customPopup.close()
        },
        {
            type    : 'button',
            text    : 'Opslaan',
            cls     : 'b-blue',
            onClick : () => {
                const values = customPopup.values;
                calendar.eventStore.add(values);
                customPopup.close();
            }
        }
    ]
});

// Toon popup
customPopup.show();
```

### Modal Popup met Formulier

```javascript
import { Popup, Combo, NumberField } from '@bryntum/calendar';

class BookingPopup extends Popup {
    static $name = 'BookingPopup';

    static configurable = {
        title     : 'Reservering maken',
        closable  : true,
        modal     : true,
        centered  : true,
        width     : 450,
        autoClose : false,

        items : {
            resourceCombo : {
                type        : 'combo',
                label       : 'Resource',
                name        : 'resourceId',
                editable    : false,
                required    : true,
                displayField : 'name',
                valueField   : 'id'
            },
            startDate : {
                type     : 'datetimefield',
                label    : 'Start',
                name     : 'startDate',
                required : true
            },
            duration : {
                type  : 'numberfield',
                label : 'Duur (uren)',
                name  : 'duration',
                min   : 0.5,
                max   : 8,
                step  : 0.5,
                value : 1
            },
            notes : {
                type  : 'textarea',
                label : 'Opmerkingen',
                name  : 'notes',
                height : 80
            }
        },

        bbar : {
            items : {
                cancel : {
                    type    : 'button',
                    text    : 'Annuleren',
                    weight  : 100,
                    onClick : 'up.onCancelClick'
                },
                save : {
                    type    : 'button',
                    text    : 'Reserveren',
                    cls     : 'b-green',
                    weight  : 200,
                    onClick : 'up.onSaveClick'
                }
            }
        }
    };

    construct(config) {
        super.construct(config);

        // Bind resource store
        if (this.calendar) {
            this.widgetMap.resourceCombo.store = this.calendar.resourceStore;
        }
    }

    onCancelClick() {
        this.close();
    }

    async onSaveClick() {
        const values = this.values;

        // Validatie
        if (!values.resourceId || !values.startDate) {
            await MessageDialog.alert({
                title   : 'Validatiefout',
                message : 'Vul alle verplichte velden in.'
            });
            return;
        }

        // Bereken endDate
        const endDate = DateHelper.add(values.startDate, values.duration, 'hour');

        // Event aanmaken
        this.calendar.eventStore.add({
            resourceId : values.resourceId,
            startDate  : values.startDate,
            endDate    : endDate,
            name       : `Reservering`,
            notes      : values.notes
        });

        this.close();
    }
}

// Registreer widget
BookingPopup.initClass();

// Gebruik
const bookingPopup = new BookingPopup({
    calendar : calendar
});
bookingPopup.show();
```

### Popup met Async Loading

```javascript
import { Popup, AjaxHelper } from '@bryntum/calendar';

const detailPopup = new Popup({
    title    : 'Event Details',
    closable : true,
    width    : 500,
    centered : true,

    // Initieel loading indicator
    html : '<div class="loading-spinner">Laden...</div>',

    tools : {
        refresh : {
            cls     : 'b-fa-sync',
            tooltip : 'Vernieuwen',
            handler : 'up.loadDetails'
        }
    }
});

// Laad details dynamisch
detailPopup.loadDetails = async function(eventId) {
    this.html = '<div class="loading-spinner">Laden...</div>';
    this.show();

    try {
        const response = await AjaxHelper.get(`/api/events/${eventId}/details`);
        const details = response.parsedJson;

        this.html = `
            <div class="event-details">
                <h3>${details.name}</h3>
                <p><strong>Locatie:</strong> ${details.location}</p>
                <p><strong>Deelnemers:</strong> ${details.attendees.join(', ')}</p>
                <p><strong>Beschrijving:</strong> ${details.description}</p>
            </div>
        `;
    } catch (error) {
        this.html = '<div class="error">Kon details niet laden</div>';
    }
};
```

---

## Toast Notificaties

### Basis Toast

```javascript
import { Toast } from '@bryntum/calendar';

// Eenvoudigste vorm
Toast.show('Event opgeslagen');

// Met configuratie
Toast.show({
    html    : 'Wijzigingen succesvol opgeslagen',
    timeout : 3000  // 3 seconden
});

// Met HTML content
Toast.show({
    html : '<i class="b-fa b-fa-check"></i> Gelukt!',
    cls  : 'success-toast'
});
```

### Toast Varianten

```javascript
// Success toast
Toast.show({
    html    : '<i class="b-fa b-fa-check-circle"></i> Event aangemaakt',
    cls     : 'b-toast-success',
    timeout : 3000
});

// Warning toast
Toast.show({
    html    : '<i class="b-fa b-fa-exclamation-triangle"></i> Controleer de datum',
    cls     : 'b-toast-warning',
    timeout : 5000
});

// Error toast
Toast.show({
    html    : '<i class="b-fa b-fa-times-circle"></i> Kon niet opslaan',
    cls     : 'b-toast-error',
    timeout : 0  // Blijft staan tot dismiss
});

// Info toast
Toast.show({
    html    : '<i class="b-fa b-fa-info-circle"></i> Nieuwe updates beschikbaar',
    cls     : 'b-toast-info',
    timeout : 4000
});
```

### Toast met Progress Bar

```javascript
Toast.show({
    html         : 'Bestanden worden geupload...',
    showProgress : true,
    timeout      : 5000
});
```

### Toast Helper Class

```javascript
// Custom Toast helper
class ToastHelper {
    static success(message, options = {}) {
        return Toast.show({
            html    : `<i class="b-fa b-fa-check-circle"></i> ${message}`,
            cls     : 'b-toast-success',
            timeout : 3000,
            ...options
        });
    }

    static error(message, options = {}) {
        return Toast.show({
            html    : `<i class="b-fa b-fa-times-circle"></i> ${message}`,
            cls     : 'b-toast-error',
            timeout : 0,  // Errors blijven staan
            ...options
        });
    }

    static warning(message, options = {}) {
        return Toast.show({
            html    : `<i class="b-fa b-fa-exclamation-triangle"></i> ${message}`,
            cls     : 'b-toast-warning',
            timeout : 5000,
            ...options
        });
    }

    static info(message, options = {}) {
        return Toast.show({
            html    : `<i class="b-fa b-fa-info-circle"></i> ${message}`,
            cls     : 'b-toast-info',
            timeout : 4000,
            ...options
        });
    }

    static loading(message) {
        return Toast.show({
            html    : `<i class="b-fa b-fa-spinner b-fa-spin"></i> ${message}`,
            cls     : 'b-toast-loading',
            timeout : 0  // Moet handmatig verborgen worden
        });
    }

    static hideAll() {
        Toast.hideAll();
    }
}

// Gebruik
ToastHelper.success('Event opgeslagen');
ToastHelper.error('Verbinding mislukt');

const loadingToast = ToastHelper.loading('Bezig met laden...');
// Later...
loadingToast.hide();
```

### Toast Integratie met Calendar Events

```javascript
const calendar = new Calendar({
    listeners : {
        // Toast bij event wijzigingen
        dataChange({ action, records }) {
            switch (action) {
                case 'add':
                    Toast.show({
                        html    : `${records.length} event(s) toegevoegd`,
                        timeout : 2000
                    });
                    break;

                case 'remove':
                    Toast.show({
                        html    : `${records.length} event(s) verwijderd`,
                        timeout : 2000
                    });
                    break;

                case 'update':
                    Toast.show({
                        html    : 'Event bijgewerkt',
                        timeout : 2000
                    });
                    break;
            }
        },

        // Toast bij sync operaties
        beforeSync() {
            this._syncToast = Toast.show({
                html    : '<i class="b-fa b-fa-sync b-fa-spin"></i> Synchroniseren...',
                timeout : 0
            });
        },

        sync() {
            this._syncToast?.hide();
            Toast.show({
                html    : '<i class="b-fa b-fa-check"></i> Gesynchroniseerd',
                cls     : 'b-toast-success',
                timeout : 2000
            });
        },

        syncFail({ response }) {
            this._syncToast?.hide();
            Toast.show({
                html    : `<i class="b-fa b-fa-times"></i> Sync mislukt: ${response.message}`,
                cls     : 'b-toast-error',
                timeout : 0
            });
        }
    }
});
```

---

## Popup Positionering

### AlignSpec Configuratie

```javascript
const popup = new Popup({
    title  : 'Info',
    anchor : true,  // Toon pijltje naar target

    // Align relatief aan target element
    align : {
        align          : 't-b',   // Top van popup naar Bottom van target
        targetSelector : '.event-element',
        offset         : [0, 5],  // X, Y offset
        constrainTo    : window
    }
});

// Toon bij specifiek element
popup.showBy({
    target : document.querySelector('.my-button'),
    align  : 'l-r'  // Left van popup naar Right van target
});
```

### Align Waarden

```javascript
// Horizontale alignment
'l-r'    // popup left -> target right
'r-l'    // popup right -> target left
'c-c'    // center horizontaal

// Verticale alignment
't-b'    // popup top -> target bottom
'b-t'    // popup bottom -> target top

// Gecombineerd
'tl-br'  // popup top-left -> target bottom-right
'br-tl'  // popup bottom-right -> target top-left

// Voorbeelden
popup.showBy({
    target : eventElement,
    align  : 'l-r'    // Rechts van element
});

popup.showBy({
    target : eventElement,
    align  : 't-b'    // Onder element
});
```

### Constrain Binnen Container

```javascript
const popup = new Popup({
    title       : 'Constrained Popup',
    constrainTo : document.getElementById('calendar-container'),

    // Of constrain aan viewport
    // constrainTo : window
});
```

---

## Popup Events en Callbacks

### BeforeClose Handler

```javascript
const popup = new Popup({
    title    : 'Formulier',
    closable : true,

    onBeforeClose({ source }) {
        // Voorkom sluiten als er onopgeslagen wijzigingen zijn
        if (source.hasUnsavedChanges) {
            MessageDialog.confirm({
                title   : 'Onopgeslagen wijzigingen',
                message : 'Wilt u de wijzigingen opslaan voor het sluiten?'
            }).then(result => {
                if (result === MessageDialog.okButton) {
                    source.saveChanges();
                }
                source.hasUnsavedChanges = false;
                source.close();
            });

            return false;  // Voorkom direct sluiten
        }
    }
});
```

### Show/Hide Events

```javascript
const popup = new Popup({
    title : 'Event Popup',

    listeners : {
        beforeShow({ source }) {
            console.log('Popup gaat openen');
            // Return false om te annuleren
        },

        show({ source }) {
            console.log('Popup is nu zichtbaar');
            // Focus eerste input
            source.widgetMap.nameField?.focus();
        },

        beforeHide({ source }) {
            console.log('Popup gaat sluiten');
        },

        hide({ source }) {
            console.log('Popup is nu verborgen');
        }
    }
});
```

---

## Form Handling in Popups

### Values Property

```javascript
const formPopup = new Popup({
    title : 'Event Bewerken',

    items : [
        { type : 'textfield', name : 'name', label : 'Naam' },
        { type : 'datefield', name : 'startDate', label : 'Start' },
        { type : 'datefield', name : 'endDate', label : 'Eind' }
    ],

    bbar : [
        {
            text    : 'Opslaan',
            onClick : 'up.onSave'
        }
    ],

    onSave() {
        // Haal alle form waarden op
        const values = this.values;
        console.log(values);
        // { name: '...', startDate: Date, endDate: Date }

        // Update event
        this.eventRecord.set(values);
        this.close();
    }
});

// Vul popup met event data
formPopup.eventRecord = eventRecord;
formPopup.values = {
    name      : eventRecord.name,
    startDate : eventRecord.startDate,
    endDate   : eventRecord.endDate
};
formPopup.show();
```

### Record Binding

```javascript
const recordPopup = new Popup({
    title : 'Record Bewerken',

    // Auto-update record bij wijzigingen
    autoUpdateRecord : true,

    items : [
        { type : 'textfield', name : 'name' },
        { type : 'textfield', name : 'description' }
    ]
});

// Bind record aan popup
recordPopup.record = eventRecord;
recordPopup.show();

// Wijzigingen worden automatisch toegepast op record
```

---

## CSS Styling

### MessageDialog Styling

```css
/* Custom MessageDialog appearance */
.b-messagedialog {
    --popup-background: #ffffff;
    --popup-header-background: #f5f5f5;
    --popup-border-radius: 8px;
}

.b-messagedialog .b-popup-header {
    font-weight: 600;
    padding: 1em 1.5em;
}

.b-messagedialog .b-popup-content {
    padding: 1.5em;
    line-height: 1.6;
}

/* Button styling */
.b-messagedialog .b-button {
    min-width: 80px;
    padding: 0.5em 1.5em;
}

.b-messagedialog .b-button.b-blue {
    background: #2196f3;
    color: white;
}

.b-messagedialog .b-button.b-red {
    background: #f44336;
    color: white;
}
```

### Toast Styling

```css
/* Toast base styling */
.b-toast {
    --toast-background: #323232;
    --toast-color: white;
    --toast-border-radius: 4px;

    padding: 12px 24px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

/* Toast varianten */
.b-toast-success {
    --toast-background: #4caf50;
}

.b-toast-error {
    --toast-background: #f44336;
}

.b-toast-warning {
    --toast-background: #ff9800;
}

.b-toast-info {
    --toast-background: #2196f3;
}

/* Toast met icon */
.b-toast i.b-fa {
    margin-right: 8px;
}

/* Progress bar styling */
.b-toast .b-toast-progress {
    height: 3px;
    background: rgba(255,255,255,0.3);
}
```

### Custom Popup Styling

```css
/* Custom popup appearance */
.b-popup.my-custom-popup {
    --popup-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --popup-header-color: white;
    --popup-border-radius: 12px;

    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.b-popup.my-custom-popup .b-popup-content {
    background: white;
    padding: 2em;
}

/* Floating popup with anchor */
.b-popup.b-anchored::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--popup-background);
    transform: rotate(45deg);
}
```

---

## Best Practices

### 1. Async/Await Pattern

```javascript
// Gebruik altijd async/await voor duidelijke flow control
async function deleteEvent(eventRecord) {
    const confirmed = await MessageDialog.confirm({
        title   : 'Verwijderen',
        message : `"${eventRecord.name}" verwijderen?`
    });

    if (confirmed === MessageDialog.okButton) {
        eventRecord.remove();
        Toast.show('Event verwijderd');
    }
}
```

### 2. Centralized Dialog Management

```javascript
// Centrale dialog manager
class DialogManager {
    static async confirmDelete(itemName) {
        const result = await MessageDialog.confirm({
            title    : 'Verwijderen bevestigen',
            message  : `Weet u zeker dat u "${itemName}" wilt verwijderen?`,
            okButton : { text: 'Verwijderen', cls: 'b-red' }
        });
        return result === MessageDialog.okButton;
    }

    static async confirmUnsavedChanges() {
        const result = await MessageDialog.confirm({
            title   : 'Onopgeslagen wijzigingen',
            message : 'U heeft onopgeslagen wijzigingen. Wilt u doorgaan?'
        });
        return result === MessageDialog.okButton;
    }

    static async promptInput(title, label, defaultValue = '') {
        const result = await MessageDialog.prompt({
            title,
            message   : label,
            textField : { value: defaultValue }
        });

        if (result.button === MessageDialog.okButton) {
            return result.text;
        }
        return null;
    }
}

// Gebruik
if (await DialogManager.confirmDelete(event.name)) {
    event.remove();
}
```

### 3. Context-Aware Popups

```javascript
// Popup die context-aware is
class ContextPopup extends Popup {
    showForEvent(eventRecord, element) {
        this.eventRecord = eventRecord;
        this.values = eventRecord.data;

        this.showBy({
            target : element,
            align  : 'l-r',
            offset : [10, 0]
        });
    }

    showForDate(date, element) {
        this.values = {
            startDate : date,
            endDate   : DateHelper.add(date, 1, 'hour')
        };

        this.showBy({
            target : element,
            align  : 't-b'
        });
    }
}
```

### 4. Toast Queue Management

```javascript
// Voorkom toast spam
class ToastQueue {
    static pending = [];
    static active = null;

    static show(config) {
        if (typeof config === 'string') {
            config = { html: config };
        }

        // Voeg toe aan queue
        this.pending.push(config);
        this.processQueue();
    }

    static processQueue() {
        if (this.active || this.pending.length === 0) return;

        const config = this.pending.shift();
        this.active = Toast.show({
            ...config,
            listeners : {
                hide : () => {
                    this.active = null;
                    // Kleine delay voor volgende toast
                    setTimeout(() => this.processQueue(), 300);
                }
            }
        });
    }
}
```

---

## TypeScript Referenties

| Interface | Regel | Beschrijving |
|-----------|-------|--------------|
| `MessageDialogSingleton` | 128083 | MessageDialog singleton class |
| `MessageDialogListenersTypes` | 127752 | Listener types voor MessageDialog |
| `PopupConfig` | 137211 | Configuratie opties voor Popup |
| `Popup` | 138134 | Popup class definitie |
| `ToastConfig` | 154626 | Configuratie opties voor Toast |
| `Toast` | 155210 | Toast class definitie |
| `ButtonConfig` | - | Button configuratie voor dialoog knoppen |
| `TextFieldConfig` | - | TextField configuratie voor prompt |

---

## Relevante Examples

| Example | Beschrijving |
|---------|--------------|
| `examples/confirmation-dialogs/` | Async event handlers met MessageDialog.confirm() |
| `examples/eventedit/` | EventEdit met custom popup widgets |
| `examples/custom-menus/` | Context menus die popups kunnen triggeren |

---

## Samenvatting

Het Bryntum Calendar dialoog systeem biedt:

1. **MessageDialog** - Singleton met `alert()`, `confirm()` en `prompt()` methoden
2. **Popup** - Flexibele basis voor custom dialogen met positionering
3. **Toast** - Lichtgewicht notificaties met auto-hide

Key patterns:
- Async event handlers voor veto-operaties met `beforeXxx` events
- Promise-based API voor alle dialoog operaties
- Button identificatie via `MessageDialog.okButton` en `MessageDialog.cancelButton`
- Form values via `popup.values` property
- Toast.show() voor snelle notificaties

De dialoog componenten integreren naadloos met Calendar events voor bevestigingen, validatie en gebruikersfeedback.
