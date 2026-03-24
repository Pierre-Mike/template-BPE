/**
 * Compile-time type tests for RouteModule.
 * Verified by `bun run typecheck` (tsc --noEmit).
 * No runtime assertions — TypeScript is the test runner here.
 */
import { Hono } from "hono";
import type { WorkerBindings } from "../effect-handler.ts";
import type { RouteModule } from "./_types.ts";

type TestApp = Hono<{ Bindings: WorkerBindings }>;

// ---------------------------------------------------------------------------
// POSITIVE CASES — must compile without error
// ---------------------------------------------------------------------------

// RouteModule<TApp> must accept an object with app as TApp
export const _validModule: RouteModule<TestApp> = {
	app: new Hono<{ Bindings: WorkerBindings }>(),
};

// ---------------------------------------------------------------------------
// NEGATIVE CASES — must be TypeScript errors
// ---------------------------------------------------------------------------

// @ts-expect-error — missing app
export const _missingApp: RouteModule<TestApp> = {};
