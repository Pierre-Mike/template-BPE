# Template Benchmark Report — Todo App

**Date:** 2026-03-24
**Model:** Claude Opus 4.6 (1M context)
**PRD:** `bench/prd-todo.md`
**Worktree:** `.claude/worktrees/agent-af858a86`

---

## Mechanical Checks (Tier 1)

| Check | Status | Detail |
|-------|--------|--------|
| M1: turbo check | PASS | All 245 tests pass, typecheck + lint + build green |
| M2: No try/catch | PASS | |
| M3: No throw | PASS | |
| M4: No Zod | PASS | |
| M5: No explicit any | PASS | |
| M6: No raw fetch in frontend | PASS | |
| M7: No Bun APIs in backend | PASS | |
| M8: Co-located tests | PASS | |
| M9: api.ts thin | PASS | |
| M10: Todo routes registered | PASS | |
| M11: Tests use testApp | PASS | |

**Mechanical Score: 11/11 (100%)**

---

## LLM Quality Review (Tier 2)

| Criterion | Score | Weight | Weighted | Notes |
|-----------|-------|--------|----------|-------|
| L1: Infra Context.Tag + Layer | 4/5 | 2x | 8/10 | Correct Context.GenericTag, D1 live Layer, test Layer via factory. Minor: D1Database interface redefined instead of imported from existing note-repository.ts |
| L2: Shell Sandwich Pattern | 4/5 | 2x | 8/10 | Uses defineRoute + buildApp factory correctly. Export satisfies RouteModule. Minor: updateTodoHandler calls validateUpdateTodo in shell AND repo.update also validates — double validation |
| L3: api.ts Registry | 5/5 | 1x | 5/5 | Only imports + .route() + AppType export. Perfect thin registry |
| L4: Core Purity | 4/5 | 2x | 8/10 | @effect/Schema used, Data.TaggedError for errors, pure validation. Minor: createTodoFromInput calls `new Date()` — side effect in core. Should accept timestamp as parameter or move to shell |
| L5: Frontend Typed Client | 4/5 | 1x | 4/5 | Uses createBackendClient, no raw fetch. Minor: `as Response` casts on API responses, and extra `todos-helpers.ts` abstraction not in the PRD |
| L6: Test Quality | 5/5 | 2x | 10/10 | Core tests use data-in/data-out with Effect.either. Route tests use testApp exclusively. Happy + error paths covered. No mocks. In-memory Layer for infra |
| L7: Effect-TS Error Handling | 5/5 | 1x | 5/5 | TodoNotFoundError + TodoValidationError as tagged errors. Error channel propagated through Effect pipeline. onError mapper converts to HTTP status codes |

**LLM Score: 48/55 (87%)**

---

## Overall Score

| Component | Score | Max | Percentage |
|-----------|-------|-----|------------|
| Mechanical | 11 | 11 | 100% |
| LLM Quality | 48 | 55 | 87% |
| **Combined** | **59** | **66** | **89%** |

---

## Gaps Found

1. **`new Date()` in core** — `core/todo.ts:88` calls `new Date().toISOString()` inside `createTodoFromInput`. This is a side effect in the pure core layer. The timestamp should be passed as a parameter or generated in the shell layer.

2. **Duplicate D1Database interface** — `infra/todo-repository.ts:11-16` redefines `D1Database` and `D1PreparedStatement` interfaces instead of importing from the existing `infra/note-repository.ts`. This violates DRY and could drift.

3. **Double validation in update flow** — `updateTodoHandler` (shell) calls `validateUpdateTodo`, and then `repo.update` (infra) also calls `validateUpdateTodo`. Validation should happen once — either in core (called from shell) or in infra, not both.

4. **Unnecessary `todos-helpers.ts` abstraction** — Frontend created a `todos-helpers.ts` with response parsing helpers + co-located tests. The PRD didn't ask for this, and the notes example doesn't have equivalent helpers. Over-engineering.

5. **`as Response` casts in Astro pages** — `new.astro:20` and `[id].astro:33` cast Hono client responses with `as Response`. This breaks type safety — the whole point of the typed client is to avoid manual type assertions.

6. **`as TodoId` casts** — `core/todo.ts:91` uses `as TodoId` to bypass the branded type. Should use `Schema.decode` or the brand constructor to maintain type safety.

---

## Template Improvements Needed

Based on gaps, these changes to the template would prevent these issues in future runs:

1. **Add CLAUDE.md rule: "No `new Date()` in core/"** — Core functions must receive timestamps as parameters. Shell generates them. This is an FCIS violation the template doesn't currently enforce.

2. **Extract shared D1 types to a common module** — Create `infra/d1-types.ts` with the D1Database interface so all repositories import from one place. The notes example bakes it into its own file, which teaches the AI to copy-paste it.

3. **Add CLAUDE.md rule: "Validation lives in one layer only"** — Either core validates (and infra/shell trust it) or infra validates. Never both.

4. **Strengthen the notes example** — The notes pattern is what the AI copies. If the notes implementation has `new Date()` in core and inline D1 types, the AI will replicate those patterns. Fix the example, fix the output.

5. **Add a Biome rule or grep check for `as` casts in non-test files** — The `as Response` and `as TodoId` casts are type-safety escapes. A mechanical check could catch these.

---

## Run Notes

- Build took ~9 minutes (one-shot, no human intervention)
- AI created an extra `todos-helpers.ts` not in the PRD — over-engineering tendency
- AI followed the notes pattern closely — validates the "copy the example" teaching strategy
- The bugs in the output mirror bugs in the notes example — fixing the example is the highest-leverage improvement
