# SchedulerPro Implementation: Timezone Handling

## Overview

SchedulerPro provides comprehensive timezone support through:
- **TimeZoneHelper**: Static utility class for date conversions
- **ProjectModelTimeZoneMixin**: Project-level timezone configuration
- **TimeZonedDatesMixin**: Model-level timezone awareness
- IANA timezone identifiers and UTC offset support

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Timezone Handling                            │
├─────────────────────────────────────────────────────────────────┤
│  TimeZoneHelper (Static)                                        │
│  ├── fromTimeZone(date, tz) → Local date                       │
│  └── toTimeZone(date, tz) → Timezone date                      │
├─────────────────────────────────────────────────────────────────┤
│  ProjectModel                                                   │
│  └── timeZone: string|number  →  All stores converted          │
│      ├── eventStore                                             │
│      ├── resourceStore                                          │
│      ├── assignmentStore                                        │
│      ├── timeRangeStore                                         │
│      └── resourceTimeRangeStore                                 │
├─────────────────────────────────────────────────────────────────┤
│  TimeSpan Models                                                │
│  └── timeZone: string|number|null  →  Per-record tracking      │
└─────────────────────────────────────────────────────────────────┘
```

## TimeZoneHelper Class

Static utility for timezone conversions using `Intl.DateTimeFormat`:

```typescript
class TimeZoneHelper {
    /**
     * Convert from specified timezone to local system time.
     * "What time in my timezone matches this time in target timezone?"
     * @param date - The date to convert
     * @param timeZone - IANA timezone or UTC offset in minutes
     */
    static fromTimeZone(date: Date, timeZone: string | number): Date;

    /**
     * Convert from local system time to specified timezone.
     * "What time is it now in this timezone?"
     * @param date - The date to convert
     * @param timeZone - IANA timezone or UTC offset in minutes
     */
    static toTimeZone(date: Date, timeZone: string | number): Date;
}
```

### Usage Examples

```javascript
import { TimeZoneHelper } from '@bryntum/schedulerpro';

// Convert local time to Tokyo time
const tokyoTime = TimeZoneHelper.toTimeZone(new Date(), 'Asia/Tokyo');

// Convert Tokyo time back to local
const localTime = TimeZoneHelper.fromTimeZone(tokyoTime, 'Asia/Tokyo');

// Using UTC offset (minutes)
const utcMinus5 = TimeZoneHelper.toTimeZone(new Date(), -300); // UTC-5

// Common timezone identifiers
const timezones = [
    'America/New_York',     // Eastern US
    'America/Chicago',      // Central US
    'America/Denver',       // Mountain US
    'America/Los_Angeles',  // Pacific US
    'Europe/London',        // UK
    'Europe/Stockholm',     // Central Europe
    'Asia/Tokyo',           // Japan
    'Asia/Hong_Kong',       // Hong Kong
    'Australia/Melbourne',  // Australia
    'Pacific/Auckland'      // New Zealand
];
```

## Project-Level Timezone Configuration

### ProjectModel timeZone Config

```typescript
interface ProjectModelConfig {
    /**
     * Set to IANA timezone or UTC offset in minutes.
     * Converts all events, tasks, time ranges to the specified timezone.
     * Also affects timeline headers and start/end dates.
     */
    timeZone?: string | number;
}
```

### Basic Configuration

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        // Use IANA timezone
        timeZone: 'Europe/Stockholm',

        // Or UTC offset in minutes
        // timeZone: -120,  // UTC+2

        loadUrl: '/api/project/load',
        autoLoad: true
    },

    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31)
});
```

### Dynamic Timezone Switching

```javascript
const scheduler = new SchedulerPro({
    project: {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Local
    },

    tbar: [
        {
            type: 'combo',
            label: 'Timezone',
            width: 300,
            items: Intl.supportedValuesOf?.('timeZone') || [
                'America/New_York',
                'America/Los_Angeles',
                'Europe/London',
                'Europe/Stockholm',
                'Asia/Tokyo',
                'Pacific/Auckland'
            ],
            value: scheduler.timeZone,
            onSelect({ record }) {
                // Change timezone - all data is converted automatically
                scheduler.timeZone = record.text;
            }
        }
    ]
});

// Programmatic timezone change
scheduler.timeZone = 'Asia/Tokyo';

// Get current timezone
console.log('Current:', scheduler.timeZone);
```

## TimeZonedDatesMixin

Applied to TimeSpan and related models for timezone tracking:

```typescript
interface TimeZonedDatesMixin {
    /**
     * Current timezone the record is converted to.
     * Used internally to track conversions.
     */
    timeZone: string | number | null;

    /**
     * Check if a field is adjusted by timezone config.
     */
    static isTimeZoneDateField(fieldName: string): boolean;
}
```

### Affected Fields

These date fields are converted when timezone is set:
- `startDate`
- `endDate`
- `constraintDate`
- `deadlineDate`

```javascript
const event = scheduler.eventStore.first;

// Check if field is timezone-adjusted
console.log(TimeSpan.isTimeZoneDateField('startDate'));  // true
console.log(TimeSpan.isTimeZoneDateField('name'));        // false

// Get event's current timezone
console.log(event.timeZone);  // e.g., 'Europe/Stockholm'
```

## Calendar Interval Timezone

Calendar intervals support timezone for recurrent dates:

```typescript
interface CalendarIntervalModelConfig {
    /**
     * Timezone for recurrentStartDate and recurrentEndDate rules.
     * If not provided, local machine timezone is used.
     * IANA timezone or UTC offset in minutes.
     */
    recurrentDatesTimeZone?: string | number;

    /**
     * Set to true to ignore project timezone for this interval.
     */
    ignoreTimeZone?: boolean;
}
```

### Calendar with Timezone

```javascript
const calendar = new CalendarModel({
    id: 'business',
    name: 'Business Hours',
    intervals: [
        {
            // Working hours in specific timezone
            recurrentStartDate: 'at 9:00 am',
            recurrentEndDate: 'at 5:00 pm',
            recurrentDatesTimeZone: 'America/New_York',
            isWorking: true
        },
        {
            // Weekends in local timezone
            recurrentStartDate: 'on Saturday',
            recurrentEndDate: 'on Monday at 00:00 am',
            isWorking: false
        },
        {
            // Holiday that ignores project timezone
            startDate: '2024-12-25',
            endDate: '2024-12-26',
            ignoreTimeZone: true,
            isWorking: false,
            name: 'Christmas'
        }
    ]
});
```

## Data Handling

### Server Data Format

Send dates in UTC or ISO 8601 format:

```json
{
    "events": {
        "rows": [
            {
                "id": 1,
                "name": "Meeting",
                "startDate": "2024-01-15T14:00:00Z",
                "endDate": "2024-01-15T15:30:00Z",
                "duration": 1.5,
                "durationUnit": "hour"
            }
        ]
    }
}
```

### Converting Back to UTC

```javascript
eventRenderer({ eventRecord }) {
    // Get the UTC time from timezone-converted date
    const utcTime = TimeZoneHelper.fromTimeZone(
        eventRecord.startDate,
        scheduler.timeZone
    );

    return `
        <div>${eventRecord.name}</div>
        <div class="utc">UTC: ${utcTime.toISOString()}</div>
    `;
}
```

### Sync with Timezone

When syncing data back to server, dates are sent as-is (in current timezone):

```javascript
project: {
    syncUrl: '/api/project/sync',

    listeners: {
        beforeSync({ pack }) {
            // Optionally convert dates back to UTC before sending
            if (pack.events?.added) {
                pack.events.added.forEach(event => {
                    if (event.startDate) {
                        event.startDate = TimeZoneHelper.fromTimeZone(
                            new Date(event.startDate),
                            scheduler.timeZone
                        ).toISOString();
                    }
                    if (event.endDate) {
                        event.endDate = TimeZoneHelper.fromTimeZone(
                            new Date(event.endDate),
                            scheduler.timeZone
                        ).toISOString();
                    }
                });
            }
        }
    }
}
```

## Time Axis and Headers

The timeline headers automatically display times in the configured timezone:

```javascript
const scheduler = new SchedulerPro({
    project: {
        timeZone: 'America/New_York'
    },

    startDate: new Date(Date.UTC(2024, 0, 15, 9, 0, 0)),  // 9:00 UTC
    endDate: new Date(Date.UTC(2024, 0, 15, 21, 0, 0)),   // 21:00 UTC

    viewPreset: {
        base: 'hourAndDay',
        headers: [
            {
                unit: 'day',
                dateFormat: 'ddd DD/MM'
            },
            {
                unit: 'hour',
                dateFormat: 'HH:mm'  // Will show 04:00-16:00 for New York
            }
        ]
    }
});
```

## Navigation with Timezone

```javascript
// Set time span with timezone awareness
const today = new Date();
const tzToday = TimeZoneHelper.toTimeZone(today, scheduler.timeZone);
const tzTomorrow = TimeZoneHelper.toTimeZone(
    DateHelper.add(today, 1, 'day'),
    scheduler.timeZone
);

scheduler.setTimeSpan(tzToday, tzTomorrow);

// Navigate while respecting timezone
scheduler.shiftNext();
scheduler.shiftPrevious();
```

## Current Time Line

The current time line respects the project timezone:

```javascript
features: {
    timeRanges: {
        // Shows current time in project timezone
        showCurrentTimeLine: true,

        // Update interval in milliseconds
        currentTimeLineUpdateInterval: 10000
    }
}
```

## Complete Example

```javascript
import {
    SchedulerPro,
    DateHelper,
    TimeZoneHelper,
    StringHelper
} from '@bryntum/schedulerpro';

// Get all supported IANA timezones
const timezones = Intl.supportedValuesOf?.('timeZone') || [
    'America/New_York', 'America/Chicago', 'America/Denver',
    'America/Los_Angeles', 'Europe/London', 'Europe/Stockholm',
    'Asia/Tokyo', 'Pacific/Auckland'
];

const scheduler = new SchedulerPro({
    appendTo: 'container',

    project: {
        loadUrl: '/api/project/load',
        syncUrl: '/api/project/sync',
        autoLoad: true,

        // Start with local timezone
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,

        listeners: {
            beforeLoad({ pack }) {
                // Pass current display date to server
                pack.params = {
                    ...pack.params,
                    displayDate: scheduler.startDate?.toISOString()
                };
            }
        }
    },

    features: {
        timeRanges: {
            showCurrentTimeLine: true,
            currentTimeLineUpdateInterval: 10000
        },
        resourceTimeRanges: true
    },

    columns: [
        {
            type: 'resourceInfo',
            text: 'Resource',
            width: 150
        }
    ],

    startDate: new Date(),
    endDate: DateHelper.add(new Date(), 1, 'day'),
    viewPreset: 'hourAndDay',

    // Custom event rendering with UTC display
    eventRenderer({ eventRecord }) {
        const utcDate = TimeZoneHelper.fromTimeZone(
            eventRecord.startDate,
            scheduler.timeZone
        );

        return {
            children: [
                { tag: 'div', text: eventRecord.name },
                {
                    tag: 'div',
                    className: 'utc-time',
                    text: `UTC: ${utcDate.toISOString().substring(11, 16)}`
                }
            ]
        };
    },

    tbar: [
        {
            type: 'combo',
            ref: 'timezoneCombo',
            label: 'Timezone',
            width: 340,
            editable: true,
            filterOperator: '*',
            items: timezones,
            value: Intl.DateTimeFormat().resolvedOptions().timeZone,
            onSelect({ record }) {
                scheduler.timeZone = record.text;

                // Optionally reload data for new timezone
                // scheduler.project.load();
            }
        },
        {
            type: 'button',
            text: 'Now',
            onClick() {
                const now = new Date();
                const tzNow = TimeZoneHelper.toTimeZone(now, scheduler.timeZone);
                scheduler.scrollToDate(tzNow, { block: 'center' });
            }
        },
        '->',
        {
            type: 'buttongroup',
            items: {
                prevButton: {
                    icon: 'b-icon-previous',
                    onClick: () => scheduler.shiftPrevious()
                },
                todayButton: {
                    text: 'Today',
                    onClick() {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const tzToday = TimeZoneHelper.toTimeZone(
                            today,
                            scheduler.timeZone
                        );
                        const tzTomorrow = TimeZoneHelper.toTimeZone(
                            DateHelper.add(today, 1, 'day'),
                            scheduler.timeZone
                        );

                        scheduler.setTimeSpan(tzToday, tzTomorrow);
                    }
                },
                nextButton: {
                    icon: 'b-icon-next',
                    onClick: () => scheduler.shiftNext()
                }
            }
        }
    ]
});

// Display current timezone info
const displayTimezoneInfo = () => {
    const tz = scheduler.timeZone;
    const now = new Date();
    const tzNow = TimeZoneHelper.toTimeZone(now, tz);

    console.log(`Timezone: ${tz}`);
    console.log(`Local time: ${now.toLocaleTimeString()}`);
    console.log(`${tz} time: ${tzNow.toLocaleTimeString()}`);
};
```

## Styling

```css
/* UTC time display in events */
.utc-time {
    font-size: 10px;
    color: #666;
    opacity: 0.8;
}

/* Timezone indicator in header */
.timezone-header {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 11px;
    color: #999;
}

/* Current time line */
.b-sch-current-time {
    background: red;
    width: 2px;
}

.b-sch-current-time::before {
    content: 'NOW';
    position: absolute;
    top: -20px;
    left: -15px;
    font-size: 10px;
    color: red;
}
```

## Best Practices

1. **Store dates in UTC** - Always store and transmit dates in UTC format
2. **Use IANA identifiers** - More reliable than offset (handles DST)
3. **Handle DST transitions** - Be aware of daylight saving time changes
4. **Convert on display only** - Keep internal data in UTC
5. **Show UTC reference** - Display UTC time for clarity
6. **Test edge cases** - Test around DST transitions and year boundaries
7. **Fallback timezones** - Handle unsupported timezone gracefully

## Common Issues

### DST Transitions
```javascript
// Be careful around DST changes
const dstDate = new Date('2024-03-10T02:30:00'); // US Spring forward
const converted = TimeZoneHelper.toTimeZone(dstDate, 'America/New_York');
// 2:30 AM doesn't exist during spring forward!
```

### Browser Support
```javascript
// Check for timezone support
const hasTimezoneSupport = typeof Intl !== 'undefined' &&
    typeof Intl.supportedValuesOf === 'function';

if (!hasTimezoneSupport) {
    // Fallback to limited timezone list
}
```

### Invalid Timezone
```javascript
try {
    scheduler.timeZone = 'Invalid/Timezone';
} catch (e) {
    // Handle invalid timezone
    scheduler.timeZone = 'UTC';
}
```

## API Reference Links

- [TimeZoneHelper](https://bryntum.com/products/schedulerpro/docs/api/Core/helper/TimeZoneHelper)
- [ProjectModelTimeZoneMixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/mixin/ProjectModelTimeZoneMixin)
- [TimeZonedDatesMixin](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/mixin/TimeZonedDatesMixin)
- [ProjectModel timeZone config](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/ProjectModel#config-timeZone)
