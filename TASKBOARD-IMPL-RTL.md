# TaskBoard Implementation: RTL Support

> **Implementatie guide** voor Right-to-Left (RTL) ondersteuning in Bryntum TaskBoard: RTL configuratie, bidirectional text, mirrored layouts, en localization.

---

## Overzicht

RTL Support biedt volledige ondersteuning voor rechts-naar-links talen:

- **RTL Mode** - Gespiegelde layout voor Arabisch, Hebreeuws, etc.
- **Bidirectional Text** - Correcte tekst rendering
- **Mirrored UI** - Gespiegelde icons en controls
- **Localization** - RTL-specifieke vertalingen
- **Mixed Content** - LTR content in RTL context

---

## 1. Basic RTL Configuration

### 1.1 Enable RTL Mode

```javascript
import { TaskBoard } from '@bryntum/taskboard';

const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Enable RTL
    rtl: true,

    project: {
        loadUrl: 'data/data.json',
        autoLoad: true
    },

    columnField: 'status',
    columns: [
        { id: 'todo', text: 'للقيام' },      // To Do
        { id: 'doing', text: 'قيد التنفيذ' }, // In Progress
        { id: 'done', text: 'منتهي' }        // Done
    ]
});
```

### 1.2 HTML RTL Attribute

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>TaskBoard RTL</title>
    <link rel="stylesheet" href="taskboard.material.css">
</head>
<body>
    <div id="container"></div>
    <script type="module" src="app.js"></script>
</body>
</html>
```

---

## 2. Dynamic RTL Switching

### 2.1 Toggle RTL Mode

```javascript
// Toggle RTL mode
function toggleRTL(taskBoard) {
    taskBoard.rtl = !taskBoard.rtl;

    // Update HTML attribute
    document.documentElement.dir = taskBoard.rtl ? 'rtl' : 'ltr';
}

// Toolbar button
tbar: {
    items: {
        rtlToggle: {
            type: 'button',
            text: 'Toggle RTL',
            icon: 'b-icon-direction',
            toggleable: true,
            onClick({ source }) {
                toggleRTL(this.up('taskboard'));
            }
        }
    }
}
```

### 2.2 Language-based RTL

```javascript
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

function setLanguage(taskBoard, langCode) {
    const isRTL = rtlLanguages.includes(langCode);

    taskBoard.rtl = isRTL;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;

    // Load locale
    loadLocale(langCode);
}

async function loadLocale(langCode) {
    const locale = await import(`./locales/${langCode}.js`);
    LocaleManager.applyLocale(locale.default);
}
```

---

## 3. Localization

### 3.1 Arabic Locale

```javascript
// locales/ar.js
export default {
    localeName: 'Ar',
    localeDesc: 'العربية',

    TaskBoard: {
        newTask: 'مهمة جديدة',
        deleteTask: 'حذف المهمة',
        editTask: 'تعديل المهمة'
    },

    Column: {
        addTask: 'إضافة مهمة',
        newTaskName: 'مهمة جديدة'
    },

    TaskEditor: {
        name: 'الاسم',
        description: 'الوصف',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف'
    },

    DateField: {
        invalidDate: 'تاريخ غير صالح'
    },

    DatePicker: {
        months: [
            'يناير', 'فبراير', 'مارس', 'أبريل',
            'مايو', 'يونيو', 'يوليو', 'أغسطس',
            'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ],
        weekDays: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    }
};
```

### 3.2 Hebrew Locale

```javascript
// locales/he.js
export default {
    localeName: 'He',
    localeDesc: 'עברית',

    TaskBoard: {
        newTask: 'משימה חדשה',
        deleteTask: 'מחק משימה',
        editTask: 'ערוך משימה'
    },

    Column: {
        addTask: 'הוסף משימה',
        newTaskName: 'משימה חדשה'
    },

    TaskEditor: {
        name: 'שם',
        description: 'תיאור',
        save: 'שמור',
        cancel: 'בטל',
        delete: 'מחק'
    }
};
```

### 3.3 Apply Locale

```javascript
import { LocaleManager } from '@bryntum/taskboard';
import arLocale from './locales/ar.js';

// Apply locale
LocaleManager.applyLocale(arLocale);

// Or via TaskBoard config
const taskBoard = new TaskBoard({
    appendTo: 'container',
    rtl: true,
    locale: arLocale,
    // ...
});
```

---

## 4. RTL Styling

### 4.1 RTL-specific CSS

```css
/* Base RTL styles */
[dir="rtl"] .b-taskboard {
    direction: rtl;
}

/* Flip horizontal padding/margins */
[dir="rtl"] .b-taskboard-column-header {
    padding-right: 16px;
    padding-left: 8px;
}

/* Mirror icons */
[dir="rtl"] .b-icon-arrow-left::before {
    content: '\e902'; /* arrow-right */
}

[dir="rtl"] .b-icon-arrow-right::before {
    content: '\e901'; /* arrow-left */
}

/* Text alignment */
[dir="rtl"] .b-taskboard-task-name {
    text-align: right;
}

/* Flex direction */
[dir="rtl"] .b-taskboard-columns {
    flex-direction: row-reverse;
}

/* Border positions */
[dir="rtl"] .b-taskboard-column {
    border-left: 1px solid #e0e0e0;
    border-right: none;
}

[dir="rtl"] .b-taskboard-column:first-child {
    border-left: none;
}
```

### 4.2 Bidirectional Icons

```css
/* Icons that should be mirrored in RTL */
[dir="rtl"] .b-icon-chevron-left,
[dir="rtl"] .b-icon-chevron-right,
[dir="rtl"] .b-icon-angle-left,
[dir="rtl"] .b-icon-angle-right {
    transform: scaleX(-1);
}

/* Icons that should NOT be mirrored */
[dir="rtl"] .b-icon-check,
[dir="rtl"] .b-icon-close,
[dir="rtl"] .b-icon-plus,
[dir="rtl"] .b-icon-trash {
    transform: none;
}
```

---

## 5. Mixed Content Handling

### 5.1 Bidirectional Text

```javascript
// Task met gemengde content
const task = {
    id: 1,
    name: 'مراجعة API Documentation',  // Mixed Arabic + English
    description: 'تحقق من endpoint /api/users'
};

// CSS voor mixed content
.b-taskboard-task {
    unicode-bidi: plaintext;
}

.b-taskboard-task-name {
    unicode-bidi: isolate;
}
```

### 5.2 LTR Islands in RTL

```javascript
taskRenderer({ taskRecord }) {
    return {
        children: [
            {
                class: 'task-name',
                text: taskRecord.name
            },
            // Force LTR voor code/URLs
            {
                class: 'task-code',
                style: { direction: 'ltr', unicodeBidi: 'embed' },
                text: taskRecord.code  // e.g., "ABC-123"
            }
        ]
    };
}
```

```css
/* LTR content in RTL context */
.task-code {
    direction: ltr;
    unicode-bidi: embed;
    font-family: monospace;
}

/* URL/email display */
.task-url {
    direction: ltr;
    unicode-bidi: isolate;
}
```

---

## 6. Drag & Drop in RTL

### 6.1 RTL-aware Drag

```javascript
features: {
    taskDrag: {
        // Drag behavior is automatically mirrored in RTL
        dragHelperConfig: {
            // Custom drag helper config if needed
        }
    },

    columnDrag: {
        // Column reordering respects RTL order
    }
}
```

### 6.2 Drop Indicators

```css
/* Drop indicator position in RTL */
[dir="rtl"] .b-taskboard-drop-indicator-left {
    right: 0;
    left: auto;
}

[dir="rtl"] .b-taskboard-drop-indicator-right {
    left: 0;
    right: auto;
}

/* Column drop zones */
[dir="rtl"] .b-taskboard-column.b-drop-before::before {
    right: -4px;
    left: auto;
}

[dir="rtl"] .b-taskboard-column.b-drop-after::after {
    left: -4px;
    right: auto;
}
```

---

## 7. Toolbar RTL

### 7.1 Toolbar Configuration

```javascript
tbar: {
    items: {
        // Items appear in reverse order in RTL
        addTask: {
            type: 'button',
            text: 'إضافة مهمة',
            icon: 'b-icon-add'
        },

        spacer: { type: 'spacer' },

        search: {
            type: 'textfield',
            placeholder: 'بحث...',
            icon: 'b-icon-search'
        },

        languageSelector: {
            type: 'combo',
            value: 'ar',
            items: [
                { value: 'ar', text: 'العربية' },
                { value: 'he', text: 'עברית' },
                { value: 'en', text: 'English' }
            ],
            onChange({ value }) {
                setLanguage(this.up('taskboard'), value);
            }
        }
    }
}
```

### 7.2 RTL Toolbar Styling

```css
[dir="rtl"] .b-toolbar {
    flex-direction: row-reverse;
}

[dir="rtl"] .b-toolbar .b-button .b-icon {
    margin-left: 8px;
    margin-right: 0;
}

[dir="rtl"] .b-textfield .b-icon {
    right: 8px;
    left: auto;
}

[dir="rtl"] .b-textfield input {
    padding-right: 32px;
    padding-left: 8px;
}
```

---

## 8. Swimlanes in RTL

### 8.1 RTL Swimlane Config

```javascript
swimlaneField: 'priority',
swimlanes: [
    { id: 'high', text: 'أولوية عالية', color: 'red' },
    { id: 'medium', text: 'أولوية متوسطة', color: 'orange' },
    { id: 'low', text: 'أولوية منخفضة', color: 'gray' }
]
```

### 8.2 Swimlane RTL Styling

```css
[dir="rtl"] .b-taskboard-swimlane-header {
    text-align: right;
    padding-right: 16px;
    padding-left: 8px;
}

[dir="rtl"] .b-taskboard-swimlane-collapse-icon {
    margin-left: 8px;
    margin-right: 0;
    transform: scaleX(-1);
}
```

---

## 9. TypeScript Interfaces

```typescript
import { TaskBoard, LocaleConfig } from '@bryntum/taskboard';

// RTL Configuration
interface RTLConfig {
    rtl?: boolean;
    locale?: LocaleConfig;
}

// Locale Configuration
interface LocaleConfig {
    localeName: string;
    localeDesc: string;
    TaskBoard?: TaskBoardLocale;
    Column?: ColumnLocale;
    TaskEditor?: TaskEditorLocale;
    DateField?: DateFieldLocale;
    DatePicker?: DatePickerLocale;
}

interface TaskBoardLocale {
    newTask?: string;
    deleteTask?: string;
    editTask?: string;
}

interface ColumnLocale {
    addTask?: string;
    newTaskName?: string;
}

interface TaskEditorLocale {
    name?: string;
    description?: string;
    save?: string;
    cancel?: string;
    delete?: string;
}

interface DatePickerLocale {
    months?: string[];
    weekDays?: string[];
}

// RTL TaskBoard
interface RTLTaskBoard extends TaskBoard {
    rtl: boolean;
    locale: LocaleConfig;
}
```

---

## 10. Complete Example

```javascript
import { TaskBoard, LocaleManager } from '@bryntum/taskboard';

// Arabic locale
const arLocale = {
    localeName: 'Ar',
    localeDesc: 'العربية',

    TaskBoard: {
        newTask: 'مهمة جديدة',
        deleteTask: 'حذف المهمة',
        editTask: 'تعديل المهمة'
    },

    Column: {
        addTask: 'إضافة مهمة',
        newTaskName: 'مهمة جديدة'
    },

    TaskEditor: {
        name: 'الاسم',
        description: 'الوصف',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف'
    }
};

// Apply locale
LocaleManager.applyLocale(arLocale);

// RTL-enabled TaskBoard
const taskBoard = new TaskBoard({
    appendTo: 'container',

    // Enable RTL
    rtl: true,

    project: {
        loadUrl: 'data/data-ar.json',
        autoLoad: true
    },

    columnField: 'status',
    columns: [
        { id: 'todo', text: 'للقيام', color: 'blue' },
        { id: 'doing', text: 'قيد التنفيذ', color: 'orange' },
        { id: 'review', text: 'مراجعة', color: 'purple' },
        { id: 'done', text: 'منتهي', color: 'green' }
    ],

    swimlaneField: 'priority',
    swimlanes: [
        { id: 'high', text: 'أولوية عالية', color: '#f44336' },
        { id: 'medium', text: 'أولوية متوسطة', color: '#ff9800' },
        { id: 'low', text: 'أولوية منخفضة', color: '#9e9e9e' }
    ],

    taskRenderer({ taskRecord }) {
        return {
            children: [
                {
                    class: 'task-name',
                    text: taskRecord.name
                },
                taskRecord.code && {
                    class: 'task-code',
                    // Force LTR for task codes
                    style: { direction: 'ltr' },
                    text: taskRecord.code
                }
            ]
        };
    },

    tbar: {
        items: {
            addTask: {
                type: 'button',
                text: 'إضافة مهمة',
                icon: 'b-icon-add',
                onClick() {
                    // Add new task
                }
            },

            spacer: { type: 'spacer' },

            languageSelector: {
                type: 'combo',
                label: 'اللغة',
                value: 'ar',
                width: 150,
                items: [
                    { value: 'ar', text: 'العربية' },
                    { value: 'he', text: 'עברית' },
                    { value: 'en', text: 'English' }
                ],
                onChange({ value }) {
                    const isRTL = ['ar', 'he'].includes(value);
                    this.up('taskboard').rtl = isRTL;
                    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
                }
            }
        }
    },

    features: {
        taskDrag: true,
        columnDrag: true,
        taskEdit: {
            items: {
                nameField: { label: 'الاسم' },
                descriptionField: { label: 'الوصف' }
            }
        }
    }
});

// Set initial document direction
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';
```

---

## 11. Testing RTL

### 11.1 RTL Test Utilities

```javascript
// Test utility voor RTL validation
function validateRTL(taskBoard) {
    const issues = [];

    // Check document direction
    if (document.documentElement.dir !== 'rtl') {
        issues.push('Document dir is not set to rtl');
    }

    // Check taskboard rtl property
    if (!taskBoard.rtl) {
        issues.push('TaskBoard rtl property is false');
    }

    // Check column order (should be reversed)
    const columns = taskBoard.element.querySelectorAll('.b-taskboard-column');
    const firstColumnRect = columns[0].getBoundingClientRect();
    const lastColumnRect = columns[columns.length - 1].getBoundingClientRect();

    if (firstColumnRect.left < lastColumnRect.left) {
        issues.push('Columns are not in RTL order');
    }

    return issues;
}
```

---

## Referenties

- Examples: `taskboard-7.1.0-trial/examples/rtl/`
- API: TaskBoard.rtl
- API: LocaleManager
- Config: locale

---

*Document gegenereerd: December 2024*
*Bryntum TaskBoard versie: 7.1.0*
