/**
 * conformance.ts — compile-time conformance gate, never imported at runtime.
 *
 * Asserts that the Hono inferred client type for AppType is structurally
 * assignable to ApiContract (the published contract from @template-bpe/api-contract).
 *
 * If this file fails to type-check, the backend routes have drifted from the
 * published contract and `tsc --noEmit` / `turbo typecheck` will fail.
 *
 * No runtime imports — types only.
 */

import type { ApiContract } from "@template-bpe/api-contract";
import type { hc } from "hono/client";

import type { AppType } from "./api.ts";

// Compile-time conformance gate.
// TypeScript checks that ReturnType<typeof hc<AppType>> is structurally assignable
// to ApiContract. If not, TS2322 fires and `tsc --noEmit` / `turbo typecheck` fails.
// At runtime this file is never imported; `null as unknown as X` is a standard
// compile-time-only cast that resolves to null at runtime.
export const _conformanceCheck: ApiContract = null as unknown as ReturnType<typeof hc<AppType>>;
