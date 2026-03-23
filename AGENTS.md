# CLAUDE.md

## Project Overview

Turborepo monorepo using TypeScript, Effect-TS, Hono (Cloudflare Workers), Bun, Biome, and Lefthook.

## Monorepo Structure

```
apps/
├── backend/          # Hono on Cloudflare Workers (Effect-TS)
│   ├── wrangler.toml # Workers config
│   └── src/backend/
│       ├── core/     # PURE — no I/O, no side effects, no imports from infra/ or shell/
│       ├── infra/    # Effect services (one per external system) with Context.Tag
│       ├── shell/    # Hono routes + Effect.gen coordinators — orchestrate core + infra
│       │   └── api.ts  # Route definitions, exports AppType for RPC
│       └── main.ts   # Composition root — re-exports Hono app as Workers fetch handler
├── frontend/         # Frontend app — imports typed API client from backend
│   └── src/api.ts    # re-exports createBackendClient from api-contract
packages/
└── api-contract/     # Typed Hono RPC client derived from backend AppType
turbo.json            # Task pipeline + caching
tsconfig.base.json    # Shared TS config (all apps extend this)
biome.json            # Root-level Biome (Turborepo best practice)
lefthook.yml          # Git hooks
```

## Architecture: Functional Core / Imperative Shell

- **Core:** pure functions, `Effect<A, E, never>` returns (no dependencies), zero I/O
- **Infra:** Effect services behind `Context.Tag`
- **Shell:** Hono routes + `Effect.gen` coordinators: impure(read) → pure(compute) → impure(write)
- `Effect.runPromise` calls restricted to `shell/` and `main.ts`

## Hono RPC (End-to-End Type Safety)

- Backend exports `AppType` from `shell/api.ts` via `"exports": { "./types" }` in package.json
- `packages/api-contract` imports `AppType` and creates a typed `hc<AppType>` client via `createBackendClient(url)`
- Frontend re-exports `createBackendClient` from `@template-bpe/api-contract` — fully typed params, query, body, response
- **Adding a new route only requires changing `shell/api.ts`** — types propagate automatically
- Zero codegen, zero runtime overhead — types are workspace-linked at build time
- **Deploy target:** Cloudflare Workers (V8 isolates, not Bun — no Bun-specific APIs in backend code)

## Commands

- `bun run dev` — turbo dev (all apps in parallel)
- `bun run build` — turbo build (cached, dependency-aware)
- `bun run test` — turbo test (cached)
- `bun run typecheck` — turbo typecheck (cached)
- `bun run lint` — biome check --write (root-level, not per-package)
- `bun run check` — full pipeline: typecheck → lint → test

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
