# LLM Judge Prompt

You are a code quality judge for a TypeScript monorepo template benchmark. You will be given the source code of a todo application built using the template-BPE framework.

## Your Task

Score each criterion on a 1-5 scale and identify specific gaps.

**Scoring scale:**
- 5: Perfect — follows the pattern exactly
- 4: Minor deviation — works correctly but slightly off-pattern
- 3: Partially correct — some violations but core idea is right
- 2: Major issues — pattern attempted but mostly wrong
- 1: Not implemented or completely wrong

## Criteria

### L1: Infra Layer — Context.Tag + Layer (weight: 2x)

Check `infra/todo-repository.ts`:
- Does it define a service interface using `Context.Tag`?
- Does it provide a production `Layer` (D1 implementation)?
- Does it provide a test `Layer` (in-memory implementation)?
- Is there exactly one file for this external system?
- Does the interface expose: `getAll`, `getById`, `create`, `update`, `delete`?

### L2: Shell Sandwich Pattern (weight: 2x)

Check `shell/routes/todos-routes.ts`:
- Do handlers follow impure(read) → pure(compute) → impure(write)?
- Does it use `Effect.gen` for coordination?
- Does it use `defineRoute` with the `{ deps, handler }` pattern?
- Does it export `{ app, testApp } satisfies RouteModule<typeof app>`?

### L3: api.ts Registry (weight: 1x)

Check `shell/api.ts`:
- Does it only contain imports and `.route()` calls?
- Is the todo route mounted?
- Is `AppType` exported?
- No handler logic, no `Effect.gen`, no service calls?

### L4: Core Purity (weight: 2x)

Check `core/todo.ts`:
- Are all functions pure (no I/O, no side effects)?
- Does it use `@effect/Schema` for validation?
- Are error types defined as tagged classes (e.g., `Data.TaggedError`)?
- Does it avoid importing from `infra/` or `shell/`?
- Are schemas well-constrained (string lengths, required fields)?

### L5: Frontend Typed Client (weight: 1x)

Check `pages/todos/*.astro`:
- Does it import and use `createBackendClient` from the api module?
- Does it use the typed client for all API calls (no raw fetch)?
- Are responses properly typed?

### L6: Test Quality (weight: 2x)

Check all `.test.ts` files:
- Do core tests use pure data in / data out?
- Do route tests use `testApp` (not the production `app`)?
- Do tests cover happy paths and error cases?
- Are test implementations used instead of mocks (no jest.fn, no sinon)?
- Do infra tests use the in-memory Layer?

### L7: Effect-TS Error Handling (weight: 1x)

Across all backend files:
- Are errors modeled as typed Effect errors (not thrown exceptions)?
- Is the error channel used for expected failures (not found, validation)?
- Are errors propagated through the Effect pipeline (not caught and rethrown)?

## Output Format

Respond with EXACTLY this format:

```markdown
## LLM Quality Review

| Criterion | Score | Weight | Weighted | Notes |
|-----------|-------|--------|----------|-------|
| L1: Infra Context.Tag + Layer | X/5 | 2x | XX/10 | ... |
| L2: Shell Sandwich Pattern | X/5 | 2x | XX/10 | ... |
| L3: api.ts Registry | X/5 | 1x | XX/5 | ... |
| L4: Core Purity | X/5 | 2x | XX/10 | ... |
| L5: Frontend Typed Client | X/5 | 1x | XX/5 | ... |
| L6: Test Quality | X/5 | 2x | XX/10 | ... |
| L7: Effect-TS Error Handling | X/5 | 1x | XX/5 | ... |

**LLM Score: XX/55**

## Gaps Found

1. [Specific gap with file path and line reference]
2. ...

## Template Improvement Suggestions

Based on the gaps found, these changes to the template would prevent these issues:

1. [Actionable suggestion]
2. ...
```

## How to Use This Prompt

1. Collect all new/modified `.ts` and `.astro` files from the todo implementation
2. Paste them after this prompt, prefixed with their file path
3. Run through an LLM (Claude recommended)
4. Save the output to `bench/results/`
