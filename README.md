# template-BPE

TypeScript project template enforcing Basic_knowledge.md principles through tooling.

## Stack

- **Runtime:** [Bun](https://bun.sh)
- **Language:** TypeScript (strict mode)
- **Error Handling & DI:** [Effect-TS](https://effect.website/) with `@effect/Schema`
- **Linter & Formatter:** [Biome](https://biomejs.dev/)
- **Git Hooks:** [Lefthook](https://github.com/evilmartians/lefthook)
- **Secret Scanning:** [Gitleaks](https://gitleaks.io/)

## Architecture

Functional Core / Imperative Shell with the Impureim Sandwich pattern:

```
src/
└── backend/
    ├── core/     # PURE — no I/O, no side effects, no imports from infra/ or shell/
    ├── infra/    # Effect services (one per external system) with Context.Tag
    ├── shell/    # Effect.gen coordinators — impure(read) → pure(compute) → impure(write)
    └── main.ts   # Composition root — provides live Layers, runs effects
```

## Quick Start

```sh
bun install         # install deps + activate git hooks
bun run dev         # watch mode
bun test            # run tests
bun run check       # full pipeline: typecheck → lint → test
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Watch mode |
| `bun run build` | Build to `dist/` |
| `bun run start` | Run production |
| `bun test` | Run tests |
| `bun run test:coverage` | Tests with coverage |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | Biome auto-fix |
| `bun run lint:ci` | Biome CI (no fix) |
| `bun run check` | Full pipeline |

## Pre-commit Hooks

Runs automatically on every `git commit`:

1. **Biome** — auto-fix + re-stage (`stage_fixed: true`)
2. **TypeScript** — type check (`tsc --noEmit`)
3. **Co-located tests** — ensures every `.test.ts` has a matching `.ts`
4. **Gitleaks** — secret scanning on staged files

## CI Pipeline

`type-check → biome ci → test → co-located tests → secret-scan → build`

Each stage gates the next. No force merges.

## Conventions

- **Co-located tests:** `foo.ts` → `foo.test.ts` in the same directory
- **Named parameters:** destructured objects for 3+ params (enforced: `useMaxParams: 2`)
- **No `any`:** `noExplicitAny: error`
- **Immutability:** `useConst`, `readonly`, `as const`
- **Effect-TS:** for all error handling, DI, concurrency — no try/catch, no mock frameworks
