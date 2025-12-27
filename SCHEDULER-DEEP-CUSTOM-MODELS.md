# SchedulerPro Deep Dive: Custom Models & Fields

## Overview

SchedulerPro uses a sophisticated Model/Field system that allows for customization of data handling, validation, persistence, and computed values. Understanding how to extend models and define custom fields is essential for integrating SchedulerPro with your application's data layer.

## Field Types

### Available Field Types

```typescript
type FieldType =
    | 'auto'         // Default, auto-detect type
    | 'string'       // String values
    | 'number'       // Floating point numbers
    | 'integer'      // Integer numbers
    | 'int'          // Alias for integer
    | 'boolean'      // Boolean values
    | 'bool'         // Alias for boolean
    | 'date'         // Date values
    | 'array'        // Array values
    | 'object'       // Object values
    | 'model'        // Reference to another model
    | 'durationunit' // Duration unit (day, hour, etc.)
```

### Field Classes

```
DataField (base)
├── ArrayDataField
├── BooleanDataField
├── DateDataField
├── IntegerDataField
├── NumberDataField
├── ObjectDataField
├── StringDataField
│   └── DurationUnitDataField
└── ModelDataField
```

## DataFieldConfig

Complete field configuration options:

```typescript
type DataFieldConfig = {
    // Identity
    name?: string              // Field name in model
    type?: FieldType           // Field type

    // Data mapping
    dataSource?: string        // Property path in raw data
    complexMapping?: boolean   // Allow dot notation in dataSource

    // Default values
    defaultValue?: any         // Default when no value provided
    nullable?: boolean         // Allow null values
    nullValue?: any            // Replace null with this value
    nullText?: string          // Text representation of null

    // Persistence
    persist?: boolean          // Include in save requests
    alwaysWrite?: boolean      // Always include in requests
    readOnly?: boolean         // Prevent modifications

    // Conversion
    convert?: (value: any, data: object) => any  // Custom conversion
    serialize?: (value: any, record: Model) => any  // For persistence

    // Comparison
    compare?: (a: any, b: any) => number  // Custom sorting

    // Calculation
    calculate?: {
        fn: (record: Model) => any | Promise<any>
        dependsOn?: string[]   // Dependent fields
    }

    // UI hints
    label?: string             // Display label
    column?: ColumnConfig      // Auto-generate column config
    internal?: boolean         // Hide from auto-column generation

    // Advanced
    bypassEqualityOnSyncDataset?: boolean  // Skip equality check on sync
}
```

## Defining Custom Models

### Basic Custom EventModel

```typescript
class CustomEventModel extends EventModel {
    static get fields() {
        return [
            // Simple string field
            'priority',

            // Number with default
            { name: 'effort', type: 'number', defaultValue: 0 },

            // Boolean field
            { name: 'billable', type: 'boolean', defaultValue: true },

            // Date field
            { name: 'deadline', type: 'date' },

            // Field with data mapping
            {
                name: 'category',
                dataSource: 'meta.category',
                persist: true
            },

            // Read-only calculated field
            {
                name: 'displayName',
                readOnly: true,
                persist: false,
                calculate: {
                    fn: record => `${record.id} - ${record.name}`,
                    dependsOn: ['id', 'name']
                }
            }
        ];
    }
}
```

### Custom ResourceModel

```typescript
class CustomResourceModel extends ResourceModel {
    static get fields() {
        return [
            // Department
            { name: 'department', type: 'string' },

            // Cost rate per hour
            { name: 'hourlyRate', type: 'number', defaultValue: 0 },

            // Skills array
            { name: 'skills', type: 'array', defaultValue: [] },

            // Manager reference
            { name: 'managerId', type: 'string' },

            // Avatar image
            {
                name: 'image',
                persist: true,
                defaultValue: 'default-avatar.png'
            },

            // Calculated availability (async)
            {
                name: 'availability',
                persist: false,
                calculate: {
                    fn: async (record) => {
                        // Fetch availability from external API
                        return await fetchAvailability(record.id);
                    }
                }
            }
        ];
    }

    // Custom getter
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    // Custom method
    hasSkill(skill) {
        return this.skills?.includes(skill);
    }
}
```

### Custom AssignmentModel

```typescript
class CustomAssignmentModel extends AssignmentModel {
    static get fields() {
        return [
            // Assignment units (percentage)
            { name: 'units', type: 'number', defaultValue: 100 },

            // Role on this specific assignment
            { name: 'role', type: 'string' },

            // Billable status for this assignment
            { name: 'billable', type: 'boolean', defaultValue: true },

            // Cost override
            { name: 'costOverride', type: 'number' }
        ];
    }

    // Calculated cost
    get cost() {
        const rate = this.costOverride ?? this.resource?.hourlyRate ?? 0;
        const hours = (this.event?.effort ?? 0) * (this.units / 100);
        return rate * hours;
    }
}
```

## Field Convert & Serialize

### Convert (Incoming Data)

Transform data when loading/setting:

```typescript
{
    name: 'status',
    type: 'string',
    convert(value, data) {
        // Normalize status values
        if (typeof value === 'number') {
            return ['pending', 'active', 'completed'][value] || 'unknown';
        }
        return value?.toLowerCase() || 'pending';
    }
}
```

### Serialize (Outgoing Data)

Transform data when saving:

```typescript
{
    name: 'color',
    type: 'string',
    serialize(value, record) {
        // Convert color name to hex for storage
        const colorMap = { red: '#FF0000', blue: '#0000FF', green: '#00FF00' };
        return colorMap[value] || value;
    }
}
```

### Complex Example

```typescript
{
    name: 'metadata',
    type: 'object',
    defaultValue: {},

    convert(value, data) {
        // Handle string JSON from server
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return {};
            }
        }
        return value || {};
    },

    serialize(value, record) {
        // Always send as JSON string
        return JSON.stringify(value || {});
    }
}
```

## Calculated Fields

### Synchronous Calculation

```typescript
{
    name: 'totalCost',
    persist: false,
    calculate: {
        fn(record) {
            return record.quantity * record.unitPrice;
        },
        dependsOn: ['quantity', 'unitPrice']
    }
}
```

### Auto-Detection of Dependencies

```typescript
{
    name: 'summary',
    persist: false,
    calculate(record) {
        // Dependencies auto-detected: name, duration
        return `${record.name} (${record.duration}h)`;
    }
}
```

### Async Calculation

```typescript
{
    name: 'weatherForecast',
    persist: false,
    calculate: {
        async fn(record) {
            const response = await fetch(`/api/weather?date=${record.startDate}`);
            return response.json();
        },
        dependsOn: ['startDate']
    }
}
```

### Cross-Model Calculation

```typescript
{
    name: 'resourceNames',
    persist: false,
    calculate(record) {
        // Access related records
        return record.resources
            .map(r => r.name)
            .join(', ');
    }
}
```

## Default Values

### Static Defaults

```typescript
class CustomEventModel extends EventModel {
    static get fields() {
        return [
            { name: 'priority', type: 'string', defaultValue: 'medium' },
            { name: 'duration', type: 'number', defaultValue: 1 },
            { name: 'durationUnit', type: 'string', defaultValue: 'day' }
        ];
    }
}
```

### Dynamic Defaults via defaults Getter

```typescript
class CustomEventModel extends EventModel {
    static get fields() {
        return [
            'priority',
            'createdBy',
            'createdAt'
        ];
    }

    static get defaults() {
        return {
            priority: 'medium',
            createdBy: getCurrentUserId(),
            createdAt: new Date()
        };
    }
}
```

## Data Mapping

### Simple Mapping

```typescript
{
    // Model field 'startDate' comes from 'start_date' in data
    name: 'startDate',
    dataSource: 'start_date'
}
```

### Nested Mapping

```typescript
{
    // Deep property access
    name: 'clientName',
    dataSource: 'client.contact.name',
    complexMapping: true
}
```

### Multiple Sources

```typescript
class CustomEventModel extends EventModel {
    static get fields() {
        return [
            // Map from nested structure
            { name: 'projectId', dataSource: 'project.id' },
            { name: 'projectName', dataSource: 'project.name' },
            { name: 'clientId', dataSource: 'project.client.id' }
        ];
    }
}
```

## Persistence Control

### Persist Settings

```typescript
static get fields() {
    return [
        // Always include in save requests
        { name: 'lastModified', alwaysWrite: true },

        // Never persist (calculated/UI only)
        { name: 'isEditing', persist: false },

        // Conditional persistence via serialize
        {
            name: 'internalNotes',
            serialize(value, record) {
                // Only persist if user has permission
                if (hasPermission('edit-notes')) {
                    return value;
                }
                return undefined;  // Excluded from payload
            }
        }
    ];
}
```

### alwaysWrite vs persist

```typescript
// persist: false - Never included in save payloads
{ name: 'tempData', persist: false }

// persist: true (default) - Included when changed
{ name: 'status', persist: true }

// alwaysWrite: true - Always included even if unchanged
{ name: 'timestamp', alwaysWrite: true }
```

## Custom Stores

### Custom EventStore

```typescript
class CustomEventStore extends EventStore {
    static get defaultConfig() {
        return {
            modelClass: CustomEventModel,

            // Custom grouping
            groupers: [{ field: 'priority' }],

            // Custom sorting
            sorters: [{ field: 'startDate', ascending: true }]
        };
    }

    // Custom query methods
    getHighPriorityEvents() {
        return this.query(event => event.priority === 'high');
    }

    getEventsInDateRange(start, end) {
        return this.query(event =>
            event.startDate >= start && event.endDate <= end
        );
    }

    getOverdueEvents() {
        const now = new Date();
        return this.query(event =>
            event.endDate < now && event.percentDone < 100
        );
    }
}
```

### Custom ResourceStore

```typescript
class CustomResourceStore extends ResourceStore {
    static get defaultConfig() {
        return {
            modelClass: CustomResourceModel,
            tree: true  // Enable tree structure
        };
    }

    getByDepartment(department) {
        return this.query(r => r.department === department);
    }

    getAvailableResources(date) {
        return this.query(r =>
            r.available && !r.vacation?.includes(date)
        );
    }
}
```

## Using Custom Models in SchedulerPro

### Configuration

```typescript
const scheduler = new SchedulerPro({
    project: {
        // Specify custom model classes
        eventModelClass: CustomEventModel,
        resourceModelClass: CustomResourceModel,
        assignmentModelClass: CustomAssignmentModel,

        // Specify custom store classes
        eventStoreClass: CustomEventStore,
        resourceStoreClass: CustomResourceStore,

        // Load data
        events: [...],
        resources: [...],
        assignments: [...]
    }
});
```

### Runtime Access

```typescript
// Create records using custom model
const event = scheduler.eventStore.add({
    name: 'Custom Task',
    startDate: new Date(),
    duration: 2,
    priority: 'high',  // Custom field
    billable: true     // Custom field
})[0];

// Access custom fields
console.log(event.priority);
console.log(event.displayName);  // Calculated field

// Use custom methods
const resource = scheduler.resourceStore.first;
if (resource.hasSkill('JavaScript')) {
    console.log('Resource has JavaScript skill');
}

// Use custom store methods
const highPriority = scheduler.eventStore.getHighPriorityEvents();
```

## Model Validation

### Field-Level Validation

```typescript
class CustomEventModel extends EventModel {
    static get fields() {
        return [
            {
                name: 'effort',
                type: 'number',
                convert(value) {
                    // Ensure positive number
                    const num = Number(value);
                    return isNaN(num) || num < 0 ? 0 : num;
                }
            }
        ];
    }
}
```

### Record-Level Validation

```typescript
class CustomEventModel extends EventModel {
    // Override set method for validation
    set(field, value, silent) {
        // Validate before setting
        if (field === 'endDate' && value < this.startDate) {
            throw new Error('End date cannot be before start date');
        }

        super.set(field, value, silent);
    }

    // Custom validation method
    isValid() {
        const errors = [];

        if (!this.name?.trim()) {
            errors.push('Name is required');
        }

        if (this.effort < 0) {
            errors.push('Effort cannot be negative');
        }

        if (this.priority && !['low', 'medium', 'high'].includes(this.priority)) {
            errors.push('Invalid priority value');
        }

        return errors.length === 0 ? true : errors;
    }
}
```

## Model Relationships

### One-to-Many via Model Field

```typescript
class ProjectModel extends Model {
    static get fields() {
        return [
            'name',
            { name: 'managerId', type: 'string' }
        ];
    }

    // Virtual relationship
    get manager() {
        return this.stores?.[0]?.project?.resourceStore?.getById(this.managerId);
    }
}
```

### Custom References

```typescript
class CustomEventModel extends EventModel {
    static get fields() {
        return [
            { name: 'projectId', type: 'string' },
            { name: 'milestoneId', type: 'string' }
        ];
    }

    get project() {
        return this.firstStore?.project?.projectStore?.getById(this.projectId);
    }

    get milestone() {
        return this.eventStore?.getById(this.milestoneId);
    }
}
```

## Common Patterns

### Pattern 1: Audit Fields

```typescript
class AuditableEventModel extends EventModel {
    static get fields() {
        return [
            { name: 'createdAt', type: 'date', persist: true },
            { name: 'createdBy', type: 'string', persist: true },
            { name: 'updatedAt', type: 'date', persist: true, alwaysWrite: true },
            { name: 'updatedBy', type: 'string', persist: true, alwaysWrite: true }
        ];
    }

    static get defaults() {
        return {
            createdAt: new Date(),
            createdBy: getCurrentUser()
        };
    }

    // Auto-update on any change
    set(field, value, silent) {
        if (!silent && field !== 'updatedAt' && field !== 'updatedBy') {
            super.set({
                [field]: value,
                updatedAt: new Date(),
                updatedBy: getCurrentUser()
            }, null, silent);
        } else {
            super.set(field, value, silent);
        }
    }
}
```

### Pattern 2: Status Workflow

```typescript
class WorkflowEventModel extends EventModel {
    static get fields() {
        return [
            {
                name: 'status',
                type: 'string',
                defaultValue: 'draft'
            }
        ];
    }

    static statusTransitions = {
        draft: ['pending'],
        pending: ['approved', 'rejected', 'draft'],
        approved: ['in_progress'],
        in_progress: ['completed', 'on_hold'],
        on_hold: ['in_progress'],
        completed: [],
        rejected: ['draft']
    };

    canTransitionTo(newStatus) {
        const allowed = WorkflowEventModel.statusTransitions[this.status];
        return allowed?.includes(newStatus) ?? false;
    }

    transitionTo(newStatus) {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
        }
        this.status = newStatus;
    }

    get availableTransitions() {
        return WorkflowEventModel.statusTransitions[this.status] || [];
    }
}
```

### Pattern 3: Localized Content

```typescript
class LocalizedEventModel extends EventModel {
    static get fields() {
        return [
            { name: 'name_en', type: 'string' },
            { name: 'name_nl', type: 'string' },
            { name: 'name_de', type: 'string' },
            {
                name: 'name',
                persist: false,
                calculate(record) {
                    const locale = getCurrentLocale();
                    return record[`name_${locale}`] || record.name_en;
                }
            }
        ];
    }
}
```

### Pattern 4: External Data Integration

```typescript
class IntegratedEventModel extends EventModel {
    static get fields() {
        return [
            { name: 'externalId', type: 'string' },
            { name: 'externalSystem', type: 'string' },
            {
                name: 'externalData',
                persist: false,
                calculate: {
                    async fn(record) {
                        if (!record.externalId) return null;

                        const cached = externalDataCache.get(record.externalId);
                        if (cached) return cached;

                        const data = await fetchExternalData(
                            record.externalSystem,
                            record.externalId
                        );
                        externalDataCache.set(record.externalId, data);
                        return data;
                    },
                    dependsOn: ['externalId', 'externalSystem']
                }
            }
        ];
    }
}
```

## Integration Notes

1. **Field Order**: Fields are processed in definition order. If using `calculate`, ensure dependencies are defined first.

2. **Engine Fields**: Some fields like `startDate`, `endDate`, `duration` are managed by the calculation engine. Override with caution.

3. **Phantom Records**: New records have `isPhantom: true` until synced to server and assigned real IDs.

4. **Modifications**: Check `record.modifications` for changed fields, `record.isModified` for any changes.

5. **Store Reference**: Access store via `record.firstStore` or `record.stores` array.

6. **Project Access**: Access project via `record.project` when using PartOfProject mixin.

7. **Performance**: Calculated fields run frequently. Keep calculations fast or use caching.

8. **Serialization**: The `serialize` function controls what gets sent to the server. Use it for data transformation.
