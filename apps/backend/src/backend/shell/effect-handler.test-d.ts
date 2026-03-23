/**
 * Compile-time type tests for routeEffect.
 * Verified by `bun run typecheck` (tsc --noEmit).
 * No runtime assertions — TypeScript is the test runner here.
 */
import { type Context, Effect, type Layer } from "effect";
import { type ConfigService, ConfigTest } from "../infra/config.ts";
import { routeEffect } from "./effect-handler.ts";

// ---------------------------------------------------------------------------
// POSITIVE CASES — must compile without error
// ---------------------------------------------------------------------------

// .provide() factory before .handle()
export const _validProvideChain = routeEffect<ConfigService>()
	.provide(() => ConfigTest)
	.handle(() => Effect.succeed(new Response()));

// .provideStatic() before .handle()
export const _validStaticChain = routeEffect<ConfigService>()
	.provideStatic(ConfigTest)
	.handle(() => Effect.succeed(new Response()));

// No dependencies declared — .handle() is valid without any .provide()
export const _noDepsChain = routeEffect<never>().handle(() => Effect.succeed(new Response()));

// ---------------------------------------------------------------------------
// NEGATIVE CASES — must be TypeScript errors
// ---------------------------------------------------------------------------

// Calling .handle() without .provide() when R is not never
// @ts-expect-error — R is still ConfigService, so `this: RouteEffect<never, E>` is not satisfied
export const _missingProvide = routeEffect<ConfigService>().handle(() =>
	Effect.succeed(new Response()),
);

// Partial provide: two deps required, only one satisfied — must still fail
interface AnotherService {
	readonly ping: () => void;
}
declare const _AnotherTag: Context.Tag<AnotherService, AnotherService>;
declare const _anotherLayer: Layer.Layer<AnotherService>;

// @ts-expect-error — AnotherService is still unresolved after providing only ConfigService
export const _partialProvide = routeEffect<ConfigService | AnotherService>()
	.provide(() => ConfigTest)
	.handle(() => Effect.succeed(new Response()));
