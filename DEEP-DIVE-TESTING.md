# DEEP-DIVE: Testing Patterns

> **Level 2** - Unit testing, integration testing en end-to-end testing voor Bryntum Gantt.

---

## Inhoudsopgave

1. [Testing Overview](#1-testing-overview)
2. [Jest Setup](#2-jest-setup)
3. [Unit Testing Patterns](#3-unit-testing-patterns)
4. [Integration Testing](#4-integration-testing)
5. [E2E Testing met Cypress/Playwright](#5-e2e-testing-met-cypressplaywright)
6. [Mocking Patterns](#6-mocking-patterns)
7. [Angular Testing](#7-angular-testing)
8. [Best Practices](#8-best-practices)
9. [Cross-References](#9-cross-references)

---

## 1. Testing Overview

### 1.1 Testing Piramide voor Bryntum

```
                    ┌─────────────┐
                    │    E2E      │  Cypress/Playwright
                    │   Tests     │  Browser automation
                    └─────────────┘
               ┌─────────────────────┐
               │  Integration Tests  │  Component + Store
               │                     │  React Testing Library
               └─────────────────────┘
          ┌─────────────────────────────┐
          │       Unit Tests            │  Jest
          │  Store logic, helpers       │  Isolated functions
          └─────────────────────────────┘
```

### 1.2 Wat te Testen

| Type | Focus | Tools |
|------|-------|-------|
| Unit | Business logic, helpers | Jest |
| Integration | Component rendering, events | RTL, Jest |
| E2E | User workflows, visual | Cypress, Playwright |

### 1.3 Bryntum's Eigen Test Tool

Bryntum levert Siesta voor testing, maar Jest is ook ondersteund.

---

## 2. Jest Setup

### 2.1 Configuratie voor ESM Modules

Bryntum modules zijn ECMAScript - Jest heeft configuratie nodig:

```javascript
// jest.config.ts
import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
    extensionsToTreatAsEsm: ['.ts', '.tsx'],

    moduleNameMapper: {
        // Remove .js extensions from imports
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },

    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'jsdom',

    // KRITISCH: Transpile Bryntum modules
    transformIgnorePatterns: [
        'node_modules/(?!@bryntum/gantt-react|@bryntum/gantt)'
    ],

    setupFilesAfterEnv: ['<rootDir>/setupTests.ts']
};

export default jestConfig;
```

### 2.2 Babel Configuratie

```json
// babel.config.json
{
    "presets": [
        ["@babel/preset-typescript", { "allowDeclareFields": true }],
        "@babel/preset-react",
        ["@babel/preset-env", { "targets": { "node": "current" } }]
    ]
}
```

### 2.3 Setup File

```typescript
// setupTests.ts
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
});

// Mock getComputedStyle
const originalGetComputedStyle = window.getComputedStyle;
Object.defineProperty(window, 'getComputedStyle', {
    writable: true,
    value: jest.fn((elt) => originalGetComputedStyle(elt))
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));
```

### 2.4 TypeScript Config

```json
// tsconfig.json
{
    "compilerOptions": {
        "target": "es2022",
        "module": "commonjs",
        "lib": ["dom", "dom.iterable"],
        "esModuleInterop": true,
        "jsx": "react-jsx"
    }
}
```

---

## 3. Unit Testing Patterns

### 3.1 Store Testing

```typescript
import { Store } from '@bryntum/gantt';

describe('TaskStore', () => {
    let store: Store;

    beforeEach(() => {
        store = new Store({
            data: [
                { id: 1, name: 'Task A' },
                { id: 2, name: 'Task B' }
            ]
        });
    });

    afterEach(() => {
        store.destroy();
    });

    it('should add records', () => {
        store.add({ id: 3, name: 'Task C' });
        expect(store.count).toBe(3);
    });

    it('should find by id', () => {
        const task = store.getById(1);
        expect(task?.name).toBe('Task A');
    });

    it('should filter records', () => {
        store.filter({ property: 'name', value: 'Task A' });
        expect(store.count).toBe(1);
    });

    it('should track changes', () => {
        store.add({ name: 'New' });
        expect(store.changes.added.length).toBe(1);
    });
});
```

### 3.2 Model Testing

```typescript
import { TaskModel, ProjectModel } from '@bryntum/gantt';

describe('TaskModel', () => {
    let project: ProjectModel;

    beforeEach(() => {
        project = new ProjectModel({
            tasksData: [
                { id: 1, name: 'Task', startDate: '2024-01-01', duration: 5 }
            ]
        });
    });

    afterEach(() => {
        project.destroy();
    });

    it('should calculate endDate from duration', async () => {
        await project.commitAsync();

        const task = project.taskStore.getById(1);
        expect(task.endDate).toBeDefined();
    });

    it('should update dependencies on change', async () => {
        project.taskStore.add({
            id: 2, name: 'Task 2', duration: 3
        });
        project.dependencyStore.add({
            fromTask: 1, toTask: 2
        });

        await project.commitAsync();

        const task2 = project.taskStore.getById(2);
        expect(task2.startDate.getTime()).toBeGreaterThan(
            project.taskStore.getById(1).endDate.getTime() - 1
        );
    });
});
```

### 3.3 Helper Function Testing

```typescript
import { DateHelper, StringHelper } from '@bryntum/gantt';

describe('DateHelper', () => {
    it('should parse dates', () => {
        const date = DateHelper.parse('2024-01-15', 'YYYY-MM-DD');
        expect(date.getFullYear()).toBe(2024);
        expect(date.getMonth()).toBe(0);  // January = 0
        expect(date.getDate()).toBe(15);
    });

    it('should add days', () => {
        const date = new Date('2024-01-15');
        const newDate = DateHelper.add(date, 5, 'day');
        expect(newDate.getDate()).toBe(20);
    });
});

describe('StringHelper', () => {
    it('should escape XSS', () => {
        const unsafe = '<script>alert("xss")</script>';
        const safe = StringHelper.xss`${unsafe}`;
        expect(safe).not.toContain('<script>');
    });
});
```

---

## 4. Integration Testing

### 4.1 React Component Testing

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BryntumGantt } from '@bryntum/gantt-react';

// Mock component met minimal config
const TestGantt = () => (
    <BryntumGantt
        data-testid="gantt"
        project={{
            tasksData: [
                { id: 1, name: 'Test Task', startDate: '2024-01-01', duration: 5 }
            ]
        }}
        columns={[{ type: 'name', width: 200 }]}
    />
);

describe('BryntumGantt Component', () => {
    it('should render without crashing', () => {
        render(<TestGantt />);
        expect(screen.getByTestId('gantt')).toBeInTheDocument();
    });

    it('should display task name', async () => {
        render(<TestGantt />);

        await waitFor(() => {
            expect(screen.getByText('Test Task')).toBeInTheDocument();
        });
    });
});
```

### 4.2 Event Testing

```typescript
describe('Gantt Events', () => {
    it('should call onTaskClick', async () => {
        const handleTaskClick = jest.fn();

        render(
            <BryntumGantt
                project={{ tasksData: [{ id: 1, name: 'Task' }] }}
                onTaskClick={handleTaskClick}
            />
        );

        await waitFor(() => {
            const taskElement = screen.getByText('Task');
            userEvent.click(taskElement);
        });

        expect(handleTaskClick).toHaveBeenCalled();
    });
});
```

### 4.3 Ref Access Testing

```typescript
describe('Gantt Ref', () => {
    it('should provide access to instance', () => {
        const ref = React.createRef<any>();

        render(
            <BryntumGantt
                ref={ref}
                project={{ tasksData: [] }}
            />
        );

        expect(ref.current).toBeDefined();
        expect(ref.current.instance).toBeDefined();
        expect(typeof ref.current.instance.zoomIn).toBe('function');
    });
});
```

---

## 5. E2E Testing met Cypress/Playwright

### 5.1 Cypress Setup

```javascript
// cypress/support/commands.js
Cypress.Commands.add('waitForGantt', () => {
    cy.get('.b-gantt').should('exist');
    cy.get('.b-gantt-task').should('have.length.at.least', 1);
});

Cypress.Commands.add('getTask', (name) => {
    return cy.contains('.b-gantt-task', name);
});
```

### 5.2 Cypress Tests

```javascript
// cypress/e2e/gantt.cy.js
describe('Gantt Chart', () => {
    beforeEach(() => {
        cy.visit('/gantt');
        cy.waitForGantt();
    });

    it('should display tasks', () => {
        cy.get('.b-gantt-task').should('have.length.greaterThan', 0);
    });

    it('should open task editor on double click', () => {
        cy.getTask('Task 1').dblclick();
        cy.get('.b-popup .b-taskeditor').should('be.visible');
    });

    it('should drag task to new date', () => {
        const task = cy.getTask('Task 1');

        task.trigger('mousedown', { button: 0 });
        cy.get('.b-gantt').trigger('mousemove', { clientX: 500 });
        cy.get('.b-gantt').trigger('mouseup');

        // Verify task moved
        cy.getTask('Task 1').should('have.attr', 'style')
            .and('match', /left.*px/);
    });

    it('should zoom in and out', () => {
        cy.get('[data-ref="zoomIn"]').click();
        // Verify zoom level changed
        cy.get('.b-sch-header-timeaxis-cell').should('have.length.greaterThan', 10);
    });
});
```

### 5.3 Playwright Tests

```typescript
// tests/gantt.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gantt Chart', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/gantt');
        await page.waitForSelector('.b-gantt-task');
    });

    test('should display tasks', async ({ page }) => {
        const tasks = await page.locator('.b-gantt-task').count();
        expect(tasks).toBeGreaterThan(0);
    });

    test('should edit task name', async ({ page }) => {
        // Double click task
        await page.locator('.b-gantt-task').first().dblclick();

        // Wait for editor
        await page.waitForSelector('.b-taskeditor');

        // Edit name
        const nameField = page.locator('.b-taskeditor [name="name"]');
        await nameField.fill('Updated Task Name');

        // Save
        await page.locator('.b-taskeditor button:has-text("Save")').click();

        // Verify
        await expect(page.locator('.b-grid-cell:has-text("Updated Task Name")'))
            .toBeVisible();
    });

    test('should create dependency by drag', async ({ page }) => {
        const task1 = page.locator('.b-gantt-task').first();
        const task2 = page.locator('.b-gantt-task').nth(1);

        // Get terminal position
        const terminal = task1.locator('.b-sch-terminal-right');
        const target = await task2.boundingBox();

        // Drag from terminal to task 2
        await terminal.dragTo(task2);

        // Verify dependency created
        await expect(page.locator('.b-sch-dependency')).toBeVisible();
    });
});
```

---

## 6. Mocking Patterns

### 6.1 API Mocking

```typescript
// Mock CrudManager responses
jest.mock('@bryntum/gantt', () => {
    const actual = jest.requireActual('@bryntum/gantt');

    return {
        ...actual,
        AjaxHelper: {
            fetch: jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    tasks: { rows: [] },
                    dependencies: { rows: [] }
                })
            })
        }
    };
});
```

### 6.2 Store Mocking

```typescript
const mockTaskStore = {
    data: [
        { id: 1, name: 'Mock Task' }
    ],
    getById: jest.fn((id) => mockTaskStore.data.find(t => t.id === id)),
    add: jest.fn(),
    remove: jest.fn()
};

// Inject mock
const project = new ProjectModel();
Object.defineProperty(project, 'taskStore', { value: mockTaskStore });
```

### 6.3 Event Mocking

```typescript
describe('Event Handlers', () => {
    it('should handle taskClick', () => {
        const mockHandler = jest.fn();
        const gantt = new Gantt({
            listeners: {
                taskClick: mockHandler
            }
        });

        // Simulate event
        gantt.trigger('taskClick', {
            taskRecord: { id: 1, name: 'Test' },
            event: new MouseEvent('click')
        });

        expect(mockHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                taskRecord: expect.objectContaining({ id: 1 })
            })
        );
    });
});
```

---

## 7. Angular Testing

### 7.1 Component Spec

```typescript
// app.component.spec.ts
import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should render gantt', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('bryntum-gantt')).toBeTruthy();
    });
});
```

### 7.2 Service Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GanttDataService } from './gantt-data.service';

describe('GanttDataService', () => {
    let service: GanttDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GanttDataService]
        });

        service = TestBed.inject(GanttDataService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should load tasks', () => {
        const mockTasks = [{ id: 1, name: 'Task' }];

        service.loadTasks().subscribe(tasks => {
            expect(tasks).toEqual(mockTasks);
        });

        const req = httpMock.expectOne('/api/tasks');
        req.flush(mockTasks);
    });
});
```

---

## 8. Best Practices

### 8.1 Test Isolation

```typescript
describe('Isolated Tests', () => {
    let project: ProjectModel;

    beforeEach(() => {
        // Fresh instance per test
        project = new ProjectModel();
    });

    afterEach(() => {
        // Always cleanup
        project?.destroy();
    });
});
```

### 8.2 Async Testing

```typescript
it('should wait for commit', async () => {
    project.taskStore.add({ name: 'New' });

    // Wait for scheduling engine
    await project.commitAsync();

    // Now safe to assert
    expect(project.taskStore.count).toBe(1);
});
```

### 8.3 Snapshot Testing

```typescript
it('should match snapshot', () => {
    const { container } = render(<BryntumGantt {...config} />);
    expect(container).toMatchSnapshot();
});
```

### 8.4 Visual Regression

```typescript
// Met Playwright
test('visual regression', async ({ page }) => {
    await page.goto('/gantt');
    await page.waitForSelector('.b-gantt-task');

    await expect(page).toHaveScreenshot('gantt-default.png');
});
```

---

## 9. Cross-References

### Gerelateerde Documenten

| Document | Relevante Secties |
|----------|-------------------|
| [DEEP-DIVE-REACT-INTEGRATION](./DEEP-DIVE-REACT-INTEGRATION.md) | React component testing |
| [DEEP-DIVE-EDGE-CASES](./DEEP-DIVE-EDGE-CASES.md) | Common issues to test |
| [DEEP-DIVE-DATA-FLOW](./DEEP-DIVE-DATA-FLOW.md) | Store testing patterns |

### Externe Resources

- [Jest Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Cypress](https://docs.cypress.io)
- [Playwright](https://playwright.dev/docs/intro)
- [Bryntum Siesta](https://bryntum.com/products/siesta/)

### Test Files in Trial

```
docs/data/Grid/guides/advanced/testing-grid-with-jest.md
examples/frameworks/angular/advanced/src/app/app.component.spec.ts
```

---

*Document gegenereerd als onderdeel van Bryntum Gantt reverse engineering project.*
*Laatste update: December 2024*
