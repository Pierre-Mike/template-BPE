# Template Benchmark Report — Todo App

**Date:** YYYY-MM-DD
**Model:** [model used for implementation]
**PRD:** `bench/prd-todo.md`

---

## Mechanical Checks (Tier 1)

> Paste output from `./bench/judge-mechanical.sh`

| Check | Status | Detail |
|-------|--------|--------|
| M1: turbo check | | |
| M2: No try/catch | | |
| M3: No throw | | |
| M4: No Zod | | |
| M5: No explicit any | | |
| M6: No raw fetch in frontend | | |
| M7: No Bun APIs in backend | | |
| M8: Co-located tests | | |
| M9: api.ts thin | | |
| M10: Todo routes registered | | |
| M11: Tests use testApp | | |

**Mechanical Score: X/11**

---

## LLM Quality Review (Tier 2)

> Paste output from LLM judge using `bench/judge-llm.md`

| Criterion | Score | Weight | Weighted | Notes |
|-----------|-------|--------|----------|-------|
| L1: Infra Context.Tag + Layer | /5 | 2x | /10 | |
| L2: Shell Sandwich Pattern | /5 | 2x | /10 | |
| L3: api.ts Registry | /5 | 1x | /5 | |
| L4: Core Purity | /5 | 2x | /10 | |
| L5: Frontend Typed Client | /5 | 1x | /5 | |
| L6: Test Quality | /5 | 2x | /10 | |
| L7: Effect-TS Error Handling | /5 | 1x | /5 | |

**LLM Score: X/55**

---

## Overall Score

| Component | Score | Max | Percentage |
|-----------|-------|-----|------------|
| Mechanical | | 11 | |
| LLM Quality | | 55 | |
| **Combined** | | **66** | |

---

## Gaps Found

1.
2.
3.

---

## Template Improvements Needed

Based on gaps, these changes to the template would prevent these issues in future runs:

1.
2.
3.

---

## Run Notes

-
