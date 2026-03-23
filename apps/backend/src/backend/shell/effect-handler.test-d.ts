/**
 * Compile-time type tests for routeEffect.
 * Verified by `bun run typecheck` (tsc --noEmit).
 * No runtime assertions — TypeScript is the test runner here.
 */
import { type Context, Effect, type Layer } from "effect";
import { type ConfigService, ConfigTest } from "../infra/config.ts";
import { defineRoute, routeEffect } from "./effect-handler.ts";

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

// ---------------------------------------------------------------------------
// defineRoute POSITIVE CASES — must compile without error
// ---------------------------------------------------------------------------

// factory deps when R ≠ never
export const _defineRouteFactoryDeps = defineRoute<ConfigService>({
	deps: () => ConfigTest,
	handler: () => Effect.succeed(new Response()),
});

// static deps when R ≠ never
export const _defineRouteStaticDeps = defineRoute<ConfigService>({
	deps: ConfigTest,
	handler: () => Effect.succeed(new Response()),
});

// no deps when R = never
export const _defineRouteNoDeps = defineRoute({
	handler: () => Effect.succeed(new Response()),
});

// ---------------------------------------------------------------------------
// defineRoute NEGATIVE CASES — must be TypeScript errors
// ---------------------------------------------------------------------------

// deps omitted when R ≠ never — overload 2 requires deps, overload 1 rejects R≠never via `R extends never`
// @ts-expect-error — deps is required when R is not never
export const _defineRouteMissingDeps = defineRoute<ConfigService>({
	handler: () => Effect.succeed(new Response()),
});

// deps provided when R = never — both overloads reject it (deps: never on each)
export const _defineRouteForbiddenDeps = defineRoute<never>({
	// @ts-expect-error — deps is forbidden when R = never
	deps: ConfigTest,
	handler: () => Effect.succeed(new Response()),
});
