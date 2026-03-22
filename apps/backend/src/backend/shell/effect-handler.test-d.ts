/**
 * Compile-time type tests for routeEffect.
 * Verified by `bun run typecheck` (tsc --noEmit).
 * No runtime assertions — TypeScript is the test runner here.
 */
import { Effect } from "effect";
import type { ConfigService } from "../infra/config.ts";
import { routeEffect } from "./effect-handler.ts";

// --- VALID usage: .provide() before .handle() must compile -------------------------

declare function validUsage(): void;
validUsage;
// TypeScript accepts this chain — it compiles without error.
export const _validChain = routeEffect<ConfigService>()
	.provide(() => {
		throw new Error("not called at type-check time");
	})
	.handle(() => Effect.succeed(new Response()));

// --- INVALID usage: omitting .provide() must be a compile error --------------------

// @ts-expect-error — R is still ConfigService, so `this: RouteEffect<never, E>` is not satisfied
export const _missingProvide = routeEffect<ConfigService>().handle(() =>
	Effect.succeed(new Response()),
);
