# PRD: Todo Application

## Overview

Build a simple todo application using the existing template architecture. This exercises all template layers: core (pure logic), infra (D1 persistence), shell (Hono routes), and frontend (Astro pages with typed client).

## Domain

A **Todo** is a task with a title, optional description, a completion status, and timestamps.

## Entities

### Todo

| Field | Type | Constraints |
|-------|------|-------------|
| id | string | UUID, generated on creation |
| title | string | 1-200 characters, required |
| description | string | 0-1000 characters, optional (empty string default) |
| completed | boolean | defaults to false |
| createdAt | string | ISO 8601 timestamp, set on creation |
| updatedAt | string | ISO 8601 timestamp, updated on every mutation |

## API Routes

All routes under `/todos`.

| Method | Path | Description |
|--------|------|-------------|
| GET | /todos | List all todos |
| GET | /todos/:id | Get a single todo by ID |
| POST | /todos | Create a new todo |
| PUT | /todos/:id | Update a todo (title, description, completed) |
| DELETE | /todos/:id | Delete a todo |

### Request/Response Shapes

**POST /todos**
- Body: `{ title: string, description?: string }`
- Response: `201` with the created todo

**PUT /todos/:id**
- Body: `{ title?: string, description?: string, completed?: boolean }`
- Response: `200` with the updated todo

**GET /todos**
- Response: `200` with `{ todos: Todo[] }`

**GET /todos/:id**
- Response: `200` with the todo, or `404`

**DELETE /todos/:id**
- Response: `204` on success, or `404`

## Backend Implementation

### Core (`core/todo.ts`)

Pure functions and schemas only. No I/O.

- `Todo` schema using `@effect/Schema` with branded types where appropriate
- `CreateTodoInput` schema (title + optional description)
- `UpdateTodoInput` schema (all fields optional)
- Validation functions: `validateCreateTodo`, `validateUpdateTodo`
- Error types: `TodoNotFoundError`, `TodoValidationError`
- Pure helpers: `createTodoFromInput` (generates id, timestamps, defaults)

### Infra (`infra/todo-repository.ts`)

Effect service for todo persistence.

- `TodoRepository` service using `Context.Tag`
- Interface: `getAll`, `getById`, `create`, `update`, `delete`
- D1 implementation via `Layer`
- Test implementation (in-memory) via `Layer` for use in route tests

### Shell (`shell/routes/todos-routes.ts`)

Hono routes + Effect.gen coordinators.

- Follow the `defineRoute` pattern from existing routes
- Export `{ app, testApp } satisfies RouteModule<typeof app>`
- Sandwich pattern: read from repo -> pure validation/transform -> write to repo
- Register in `shell/api.ts` with `.route("/todos", todosRoute.app)`

### Migration (`infra/migration-todos.ts`)

D1 migration for the todos table:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## Frontend Implementation

### Pages

- `pages/todos/index.astro` — List all todos, link to create
- `pages/todos/new.astro` — Form to create a todo
- `pages/todos/[id].astro` — View/edit a single todo

### Client

Use the typed `hc<AppType>` client from `src/api.ts`. No raw `fetch`.

## Testing

Every `.ts` file must have a co-located `.test.ts`:

- `core/todo.test.ts` — test all pure functions with data in / data out
- `infra/todo-repository.test.ts` — test the in-memory implementation
- `shell/routes/todos-routes.test.ts` — test via `testApp`, not production `app`
- Frontend pages — no tests required for `.astro` files

## Constraints

- No `try/catch`, no `throw` — use Effect-TS error channel
- No `any` types
- No Zod — use `@effect/Schema`
- No raw `fetch` in frontend — use typed client
- No Bun-specific APIs in backend code
- No mock frameworks — use Effect Layers for test implementations
- Co-located tests for every `.ts` file
- `api.ts` stays thin — only imports and `.route()` calls
