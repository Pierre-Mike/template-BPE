# CLAUDE.md

## Project Overview

Turborepo monorepo using TypeScript, Effect-TS, Hono (Cloudflare Workers), Bun, Biome, and Lefthook.

## Monorepo Structure

```
apps/
├── backend/                # Hono on Cloudflare Workers (Effect-TS)
│   ├── wrangler.toml       # Workers config
│   ├── .dependency-cruiser.cjs  # Slicing boundary rules (CI-enforced)
│   └── src/backend/
│       ├── api.ts          # Composition root — thin Hono registry, exports AppType
│       ├── main.ts         # Cloudflare Workers fetch handler
│       ├── features/       # Feature slices — one dir per slice
│       │   └── <name>/
│       │       ├── <name>.core.ts        # PURE — no I/O
│       │       ├── <name>.repo.ts        # Effect service (Context.Tag)
│       │       ├── <name>.migration.ts   # SQL DDL constants
│       │       ├── <name>.routes.ts      # Hono + Effect.gen
│       │       ├── <name>.fixture.ts     # Test doubles (only used by *.test.ts)
│       │       └── <name>.<tier>.test.ts # Co-located tests
│       └── platform/       # Feature-agnostic infrastructure
│           ├── effect-handler.ts   # defineRoute factory — pure runtime glue
│           ├── route-types.ts      # RouteModule type
│           ├── config.ts, d1-types.ts, worker-bindings.ts, wrangler-bindings.ts
│           ├── boundary-rules.ts   # Canonical rule names (must match depcruise)
│           ├── agents-conventions.ts
│           └── deploy-workflow.ts, github-secrets.ts, wrangler-envs.ts, wrangler-examples.ts
├── frontend/               # Astro on Cloudflare Pages — imports typed API client from backend
│   └── src/api.ts          # re-exports createBackendClient from api-contract
packages/
└── api-contract/           # Typed Hono RPC client derived from backend AppType
turbo.json                  # Task pipeline + caching
tsconfig.base.json          # Shared TS config (all apps extend this)
biome.json                  # Root-level Biome (Turborepo best practice)
lefthook.yml                # Git hooks
```

## Architecture: Feature-Sliced FCIS

Backend code is sliced **vertically by feature**. Each slice lives in `features/<name>/` and contains every tier of FCIS for that feature, distinguished by tier-suffixed filenames:

| Tier suffix | Role | Imports allowed |
|---|---|---|
| `.core.ts` | Pure functions, `Effect<A, E, never>`, zero I/O | `effect`, `@effect/schema`, sibling `*.core.ts` |
| `.repo.ts` | Effect service behind `Context.Tag` | `effect`, `@effect/schema`, `./<name>.core.ts` (types), `../../platform/d1-types.ts`, `cloudflare:workers` |
| `.migration.ts` | SQL DDL constants — single source of truth for table/column names | none beyond constant exports |
| `.routes.ts` | Hono routes + `Effect.gen` orchestration: impure(read) → pure(compute) → impure(write) | `./<name>.core.ts`, `./<name>.repo.ts`, `../../platform/effect-handler.ts`, `../../platform/route-types.ts` |
| `.fixture.ts` | Test doubles, only importable from `*.test.ts` | sibling slice files |

`Effect.runPromise` calls are restricted to `platform/effect-handler.ts` (the runtime adapter) and `main.ts`.

### Core purity rules

- **No side effects in `*.core.ts`** — no `new Date()`, no `crypto.randomUUID()`, no `Math.random()`. Pass timestamps, IDs, and random values as parameters. Generate them in `.routes.ts` or `.repo.ts`.
- **Validate in one layer only** — validation logic lives in `*.core.ts` and is called from `*.repo.ts` or `*.routes.ts`. Never duplicate validation across tiers.
- **No `as` type casts in non-test files** — use `Schema.decode`, brand constructors, or proper type narrowing instead of `as Foo` assertions.

### Platform rules

- **Shared D1 types** — import `D1Database` and `D1PreparedStatement` from `platform/d1-types.ts`. Do not redefine these interfaces in each repository file.
- **`platform/` must not import from `features/`** — feature-agnostic by construction (CI-enforced).

## Slicing rules (CI-enforced via `lint:deps`)

`apps/backend/.dependency-cruiser.cjs` enforces:

| Rule | Forbids |
|---|---|
| `core-is-pure` | `*.core.ts` importing sibling `*.repo.ts` / `*.routes.ts` / `*.migration.ts` / `*.fixture.ts` or any platform adapter (`effect-handler`, `config`, `worker-bindings`, `wrangler-bindings`, `d1-types`) |
| `no-cross-feature-imports` | Files in `features/<a>/` importing from `features/<b>/`. Cross-feature collaboration goes through `platform/` or composition in `api.ts` |
| `platform-has-no-feature-deps` | `platform/` importing from `features/` |
| `effect-handler-stays-pure-glue` | `platform/effect-handler.ts` importing from `features/` |

Rule names are mirrored in `platform/boundary-rules.ts` (`BOUNDARY_RULES` constants) and verified by `boundary-rules.test.ts`.

## Adding a new feature

1. Create `apps/backend/src/backend/features/<name>/`.
2. Add `<name>.core.ts` (pure rules) + `<name>.core.test.ts`.
3. Add `<name>.repo.ts` if persistence is needed (`Context.Tag` service) + `<name>.repo.test.ts`.
4. Add `<name>.migration.ts` if schema changes are required.
5. Add `<name>.routes.ts` (Hono + `Effect.gen`) + `<name>.routes.test.ts` exercising `testApp`.
6. Wire the route into `apps/backend/src/backend/api.ts` — that single edit makes the new endpoints visible end-to-end via `AppType`.

## Hono RPC (End-to-End Type Safety)

- Backend exports `AppType` from `api.ts` via `"exports": { "./types" }` in `package.json`
- `packages/api-contract` imports `AppType` and creates a typed `hc<AppType>` client via `createBackendClient(url)`
- Frontend re-exports `createBackendClient` from `@template-bpe/api-contract` — fully typed params, query, body, response
- **Adding a new route only requires editing `api.ts`** — types propagate automatically
- Zero codegen, zero runtime overhead — types are workspace-linked at build time
- **Deploy target:** Cloudflare Workers (V8 isolates, not Bun — no Bun-specific APIs in backend code)

## Commands

- `bun run dev` — turbo dev (all apps in parallel)
- `bun run build` — turbo build (cached, dependency-aware)
- `bun run test` — turbo test (cached)
- `bun run typecheck` — turbo typecheck (cached)
- `bun run lint` — biome check --write (root-level, not per-package)
- `bun run check` — full pipeline: typecheck → lint → test → build

## Code Style

- **Bun** for dev/build tooling. **Cloudflare Workers** for backend runtime — no Bun-specific APIs in backend
- **Effect-TS** for all error handling, DI, and concurrency — no try/catch, no mock frameworks
- **Biome** for linting + formatting — not ESLint/Prettier
- **Functional programming** — no classes outside framework code, composition over inheritance
- **Named parameters** (destructured objects) for functions with 3+ params
- **Immutability by default** — `readonly`, `as const`, `useConst`
- **Co-located tests** — `foo.ts` → `foo.test.ts` in the same directory
- **No `any`** — `noExplicitAny: error` in Biome
- **No empty catch blocks** — must log or rethrow
- **No console.log** — use structured logger

## Frontend conventions

- **API URL resolution** — Astro pages use `import { env } from "cloudflare:workers"` to get `PUBLIC_API_URL`, with a fallback to `http://localhost:8787` for local dev. The `PUBLIC_API_URL` var is only set in per-environment wrangler.toml blocks (`[env.staging.vars]`, `[env.production.vars]`), never in root `[vars]` — setting it at root breaks `astro dev` by routing to the production backend.

## Pre-commit Hooks (Lefthook)

Runs automatically on `git commit`:
1. Biome auto-fix + re-stage (`stage_fixed: true`)
2. TypeScript type check via `turbo typecheck` (cached)
3. Co-located test enforcement
4. Secret scanning (gitleaks)

## CI Pipeline Order

`type-check → biome ci → test → secret-scan → build`

Each stage blocks the next. No `--force` merges.

## Protected Files (Human Review Required)

> **Dev mode**: Protected file restrictions are currently relaxed. AI agents may modify all files directly.

## Route Authoring Conventions

### Route file location

Each feature owns its routes: `features/<name>/<name>.routes.ts` — one file per feature slice.

### RouteModule export shape

Every routes file must export a named object satisfying `RouteModule`:

```ts
export const fooRoute = { app, testApp } satisfies RouteModule<typeof app>;
```

- `app` — production Hono app wired with real layers (e.g. `makeConfigLayer(c.env)`)
- `testApp` — identical routes wired with test layers (e.g. `ServiceTest`)

The `{ app, testApp }` shape is enforced at compile time by the `RouteModule<TApp>` type defined in `platform/route-types.ts`.

### Handler factory: `defineRoute`

Use `defineRoute({ deps, handler })` for all routes. It accepts a single optional `deps` layer (factory or static) and an optional `onError` mapper. `defineRoute` is the **only** public API for Effect-backed Hono handlers in this template.

### `api.ts` registry rule

`apps/backend/src/backend/api.ts` is a **thin registry** — it may only contain:
- `import` statements for feature route modules (`./features/<name>/<name>.routes.ts`)
- `.route()` mount calls on the root Hono app
- The `AppType` export

No handler logic, no `Effect.gen`, no service calls, no `Effect.runPromise` are allowed in `api.ts`.

### Test rule

Every `<name>.routes.ts` must have a co-located `<name>.routes.test.ts`. Tests must import and exercise `testApp`, **not** the production `app` or `api.ts`:

```ts
// ✅ correct
const res = await fooRoute.testApp.request("/foo");

// ❌ wrong — bypasses isolated test layers
import app from "../../api.ts";
```

### `effect-handler.ts` boundary rule

`platform/effect-handler.ts` is pure infrastructure glue (Effect runtime adapter). It **must not** import from `features/` — enforced by dependency-cruiser in CI (`effect-handler-stays-pure-glue`).

Violation: adding `import ... from '../features/...'` inside `effect-handler.ts` will fail the `lint:deps` check.
